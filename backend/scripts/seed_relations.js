const { Client } = require('pg');

async function seedRelations() {
  const client = new Client({ connectionString: 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db' });
  await client.connect();
  console.log('--- SEEDING RELATIONSHIPS ---');

  // 1. MovieGenre (N-N Movie <-> Genre)
  console.log('\n1. Seeding MovieGenre...');
  const movies = (await client.query('SELECT id, title, genre, actors FROM "Movie"')).rows;
  const genres = (await client.query('SELECT id, name FROM "Genre"')).rows;

  for (const movie of movies) {
    if (!movie.genre) continue;
    const genreNames = movie.genre.split(',').map(g => g.trim());
    for (const gName of genreNames) {
      let matchedGenre = genres.find(g => g.name.toLowerCase() === gName.toLowerCase());
      if (!matchedGenre) {
        // Create genre if not found
        const res = await client.query('INSERT INTO "Genre" (id, name, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, NOW(), NOW()) ON CONFLICT (name) DO UPDATE SET "updatedAt" = NOW() RETURNING id, name', [gName]);
        matchedGenre = res.rows[0];
        genres.push(matchedGenre);
      }
      if (matchedGenre) {
        await client.query(
          'INSERT INTO "MovieGenre" ("movieId", "genreId", "createdAt") VALUES ($1, $2, NOW()) ON CONFLICT ("movieId", "genreId") DO NOTHING',
          [movie.id, matchedGenre.id]
        );
      }
    }
  }
  const mgCount = await client.query('SELECT count(*) FROM "MovieGenre"');
  console.log(`✓ MovieGenre seeded: ${mgCount.rows[0].count} relations.`);

  // 2. MovieActor (N-N Movie <-> Actor)
  console.log('\n2. Seeding MovieActor...');
  const actors = (await client.query('SELECT id, name FROM "Actor"')).rows;

  for (const movie of movies) {
    if (!movie.actors) continue;
    const actorNames = movie.actors.split(',').map(a => a.trim().replace(/\s*\([^)]*\)/, '')); // remove "(Lồng tiếng Việt)" etc.
    for (const aName of actorNames) {
      if (!aName || aName.length < 2) continue;
      let matchedActor = actors.find(a => a.name.toLowerCase() === aName.toLowerCase());
      if (!matchedActor) {
        // Create actor if not found
        try {
          const res = await client.query('INSERT INTO "Actor" (id, name, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, NOW(), NOW()) ON CONFLICT (name) DO UPDATE SET "updatedAt" = NOW() RETURNING id, name', [aName]);
          matchedActor = res.rows[0];
          actors.push(matchedActor);
        } catch {
          // ignore conflict
        }
      }
      if (matchedActor) {
        await client.query(
          'INSERT INTO "MovieActor" ("movieId", "actorId", "createdAt") VALUES ($1, $2, NOW()) ON CONFLICT ("movieId", "actorId") DO NOTHING',
          [movie.id, matchedActor.id]
        );
      }
    }
  }
  const maCount = await client.query('SELECT count(*) FROM "MovieActor"');
  console.log(`✓ MovieActor seeded: ${maCount.rows[0].count} relations.`);

  // 3. Voucher <-> Promotion
  console.log('\n3. Linking Voucher <-> Promotion...');
  const vouchers = (await client.query('SELECT id, code FROM "Voucher"')).rows;
  const promos = (await client.query('SELECT id, code FROM "Promotion"')).rows;

  for (const v of vouchers) {
    const promo = promos.find(p => p.code && p.code.toUpperCase() === v.code.toUpperCase());
    if (promo) {
      await client.query('UPDATE "Voucher" SET "promotionId" = $1 WHERE id = $2', [promo.id, v.id]);
    } else if (promos.length > 0) {
      // Gán ngẫu nhiên vào một chiến dịch ưu đãi nếu chưa có
      const randomPromo = promos[Math.floor(Math.random() * promos.length)];
      await client.query('UPDATE "Voucher" SET "promotionId" = $1 WHERE id = $2', [randomPromo.id, v.id]);
    }
  }
  const linkedVouchers = await client.query('SELECT count(*) FROM "Voucher" WHERE "promotionId" IS NOT NULL');
  console.log(`✓ Vouchers linked to Promotion: ${linkedVouchers.rows[0].count}/${vouchers.length}.`);

  // 4. Blog <-> User & Movie
  console.log('\n4. Linking Blog <-> User & Movie...');
  const adminUser = (await client.query("SELECT id FROM \"User\" WHERE role = 'ADMIN' LIMIT 1")).rows[0] 
                 || (await client.query("SELECT id FROM \"User\" LIMIT 1")).rows[0];
  if (adminUser) {
    await client.query('UPDATE "Blog" SET "authorId" = $1 WHERE "authorId" IS NULL', [adminUser.id]);
  }

  // Link blogs to movies if title mentions movie or match by index
  const blogs = (await client.query('SELECT id, title FROM "Blog"')).rows;
  for (let i = 0; i < blogs.length; i++) {
    const b = blogs[i];
    const matchedMovie = movies.find(m => b.title.toLowerCase().includes(m.title.toLowerCase())) || movies[i % movies.length];
    if (matchedMovie) {
      await client.query('UPDATE "Blog" SET "movieId" = $1 WHERE id = $2', [matchedMovie.id, b.id]);
    }
  }
  const linkedBlogs = await client.query('SELECT count(*) FROM "Blog" WHERE "authorId" IS NOT NULL AND "movieId" IS NOT NULL');
  console.log(`✓ Blogs linked to User & Movie: ${linkedBlogs.rows[0].count}/${blogs.length}.`);

  // 5. Ticket <-> PriceConfig
  console.log('\n5. Linking Ticket <-> PriceConfig...');
  const priceConfigs = (await client.query('SELECT id, "seatType", price FROM "PriceConfig"')).rows;
  const tickets = (await client.query('SELECT t.id, t.price, s.type as "seatType" FROM "Ticket" t JOIN "Seat" s ON t."seatId" = s.id')).rows;
  for (const t of tickets) {
    const pc = priceConfigs.find(p => p.seatType === t.seatType) || priceConfigs[0];
    if (pc) {
      await client.query('UPDATE "Ticket" SET "priceConfigId" = $1 WHERE id = $2', [pc.id, t.id]);
    }
  }
  const linkedTickets = await client.query('SELECT count(*) FROM "Ticket" WHERE "priceConfigId" IS NOT NULL');
  console.log(`✓ Tickets linked to PriceConfig: ${linkedTickets.rows[0].count}/${tickets.length}.`);

  await client.end();
  console.log('\n🎉 ALL RELATIONSHIPS SEEDED AND LINKED SUCCESSFULLY!');
}

seedRelations().catch(console.error);
