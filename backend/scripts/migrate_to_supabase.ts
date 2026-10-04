import { PrismaClient } from '@prisma/client';

const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db?schema=public'
    }
  }
});

const supabasePrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.mjgsrwifsbemhcavmkyg:nguyenvanvien9876@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres'
    }
  }
});

async function migrate() {
  console.log('--- BẮT ĐẦU ĐỒNG BỘ DỮ LIỆU SANG SUPABASE ---');

  // 1. Users
  console.log('1. Đồng bộ Users...');
  const users = await localPrisma.user.findMany();
  for (const u of users) {
    await supabasePrisma.user.upsert({
      where: { id: u.id },
      update: u,
      create: u
    });
  }
  console.log(`✓ Đã đồng bộ ${users.length} Users`);

  // 2. Genres
  console.log('2. Đồng bộ Thể Loại...');
  const genres = await localPrisma.genre.findMany();
  for (const g of genres) {
    await supabasePrisma.genre.upsert({
      where: { id: g.id },
      update: g,
      create: g
    });
  }
  console.log(`✓ Đã đồng bộ ${genres.length} Genres`);

  // 3. Actors
  console.log('3. Đồng bộ Diễn Viên...');
  const actors = await localPrisma.actor.findMany();
  for (const a of actors) {
    await supabasePrisma.actor.upsert({
      where: { id: a.id },
      update: a,
      create: a
    });
  }
  console.log(`✓ Đã đồng bộ ${actors.length} Actors`);

  // 4. Movies
  console.log('4. Đồng bộ Phim...');
  const movies = await localPrisma.movie.findMany();
  for (const m of movies) {
    await supabasePrisma.movie.upsert({
      where: { id: m.id },
      update: m,
      create: m
    });
  }
  console.log(`✓ Đã đồng bộ ${movies.length} Movies`);

  // 5. Cinemas
  console.log('5. Đồng bộ Cụm Rạp...');
  const cinemas = await localPrisma.cinema.findMany();
  for (const c of cinemas) {
    await supabasePrisma.cinema.upsert({
      where: { id: c.id },
      update: c,
      create: c
    });
  }
  console.log(`✓ Đã đồng bộ ${cinemas.length} Cinemas`);

  // 6. Rooms
  console.log('6. Đồng bộ Phòng Chiếu...');
  const rooms = await localPrisma.room.findMany();
  for (const r of rooms) {
    await supabasePrisma.room.upsert({
      where: { id: r.id },
      update: r,
      create: r
    });
  }
  console.log(`✓ Đã đồng bộ ${rooms.length} Rooms`);

  // 7. Seats (Batching để nhanh và không quá tải)
  console.log('7. Đồng bộ Ghế ngồi...');
  const seats = await localPrisma.seat.findMany();
  const seatChunks = [];
  const chunkSize = 500;
  for (let i = 0; i < seats.length; i += chunkSize) {
    seatChunks.push(seats.slice(i, i + chunkSize));
  }
  for (const chunk of seatChunks) {
    await supabasePrisma.seat.createMany({
      data: chunk,
      skipDuplicates: true
    });
  }
  console.log(`✓ Đã đồng bộ ${seats.length} Ghế`);

  // 8. PriceConfig
  console.log('8. Đồng bộ Bảng Giá Vé...');
  const prices = await localPrisma.priceConfig.findMany();
  for (const p of prices) {
    await supabasePrisma.priceConfig.upsert({
      where: { id: p.id },
      update: p,
      create: p
    });
  }
  console.log(`✓ Đã đồng bộ ${prices.length} Cấu hình giá`);

  // 9. FoodCombo
  console.log('9. Đồng bộ Bắp Nước & Combo...');
  const foods = await localPrisma.foodCombo.findMany();
  for (const f of foods) {
    await supabasePrisma.foodCombo.upsert({
      where: { id: f.id },
      update: f,
      create: f
    });
  }
  console.log(`✓ Đã đồng bộ ${foods.length} Món bắp nước`);

  // 10. Vouchers
  console.log('10. Đồng bộ Voucher...');
  const vouchers = await localPrisma.voucher.findMany();
  for (const v of vouchers) {
    await supabasePrisma.voucher.upsert({
      where: { id: v.id },
      update: v,
      create: v
    });
  }
  console.log(`✓ Đã đồng bộ ${vouchers.length} Vouchers`);

  // 11. Promotions
  console.log('11. Đồng bộ Khuyến Mãi...');
  const promotions = await localPrisma.promotion.findMany();
  for (const p of promotions) {
    await supabasePrisma.promotion.upsert({
      where: { id: p.id },
      update: p,
      create: p
    });
  }
  console.log(`✓ Đã đồng bộ ${promotions.length} Khuyến mãi`);

  // 12. Blogs
  console.log('12. Đồng bộ Bài Viết Blog...');
  const blogs = await localPrisma.blog.findMany();
  for (const b of blogs) {
    await supabasePrisma.blog.upsert({
      where: { id: b.id },
      update: b,
      create: b
    });
  }
  console.log(`✓ Đã đồng bộ ${blogs.length} Bài viết`);

  // 13. Reviews
  console.log('13. Đồng bộ Đánh Giá Phim...');
  const reviews = await localPrisma.review.findMany();
  for (const r of reviews) {
    await supabasePrisma.review.upsert({
      where: { id: r.id },
      update: r,
      create: r
    });
  }
  console.log(`✓ Đã đồng bộ ${reviews.length} Đánh giá`);

  // 14. Showtimes
  console.log('14. Đồng bộ Suất Chiếu...');
  const showtimes = await localPrisma.showtime.findMany();
  const stChunks = [];
  for (let i = 0; i < showtimes.length; i += 300) {
    stChunks.push(showtimes.slice(i, i + 300));
  }
  for (const chunk of stChunks) {
    await supabasePrisma.showtime.createMany({
      data: chunk,
      skipDuplicates: true
    });
  }
  console.log(`✓ Đã đồng bộ ${showtimes.length} Suất chiếu`);

  console.log('=== HOÀN TẤT ĐỒNG BỘ 100% DỮ LIỆU SANG SUPABASE ===');
}

migrate()
  .catch(e => {
    console.error('Lỗi khi migrate:', e);
    process.exit(1);
  })
  .finally(async () => {
    await localPrisma.$disconnect();
    await supabasePrisma.$disconnect();
  });
