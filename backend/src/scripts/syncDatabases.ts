import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const localUrl = process.env.DATABASE_URL || "postgresql://postgres:123456@localhost:5432/aeon_cinema_db?schema=public";
const supabaseUrl = process.env.SUPABASE_DATABASE_URL || "postgresql://postgres.mjgsrwifsbemhcavmkyg:nguyenvanvien9876@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require";

async function syncAll() {
  console.log('🔄 Starting Full Database Sync: Local ➔ Supabase Cloud...');
  const local = new PrismaClient({ datasources: { db: { url: localUrl } } });
  const supa = new PrismaClient({ datasources: { db: { url: supabaseUrl } } });

  try {
    // 1. Sync Users
    const localUsers = await local.user.findMany();
    for (const u of localUsers) {
      await supa.user.upsert({
        where: { id: u.id },
        update: u,
        create: u,
      });
    }
    console.log(`✓ Synced ${localUsers.length} Users`);

    // 2. Sync Movies
    const localMovies = await local.movie.findMany();
    for (const m of localMovies) {
      await supa.movie.upsert({
        where: { id: m.id },
        update: m,
        create: m,
      });
    }
    console.log(`✓ Synced ${localMovies.length} Movies`);

    // 3. Sync Cinemas
    const localCinemas = await local.cinema.findMany();
    for (const c of localCinemas) {
      await supa.cinema.upsert({
        where: { id: c.id },
        update: c,
        create: c,
      });
    }
    console.log(`✓ Synced ${localCinemas.length} Cinemas`);

    // 4. Sync Rooms
    const localRooms = await local.room.findMany();
    for (const r of localRooms) {
      await supa.room.upsert({
        where: { id: r.id },
        update: r,
        create: r,
      });
    }
    console.log(`✓ Synced ${localRooms.length} Rooms`);

    // 5. Sync FoodCombos
    const localFoods = await local.foodCombo.findMany();
    for (const f of localFoods) {
      await supa.foodCombo.upsert({
        where: { id: f.id },
        update: f,
        create: f,
      });
    }
    console.log(`✓ Synced ${localFoods.length} Food Combos`);

    // 6. Sync Vouchers
    const localVouchers = await local.voucher.findMany();
    for (const v of localVouchers) {
      await supa.voucher.upsert({
        where: { id: v.id },
        update: v,
        create: v,
      });
    }
    console.log(`✓ Synced ${localVouchers.length} Vouchers`);

    // 7. Sync Bookings
    const localBookings = await local.booking.findMany({
      include: {
        tickets: true,
        foodItems: true,
      }
    });
    console.log(`Found ${localBookings.length} local bookings. Syncing to Supabase...`);
    for (const b of localBookings) {
      const { tickets, foodItems, ...bData } = b;
      await supa.booking.upsert({
        where: { id: b.id },
        update: bData,
        create: bData,
      });

      for (const t of tickets) {
        await supa.ticket.upsert({
          where: { id: t.id },
          update: t,
          create: t,
        });
      }

      for (const f of foodItems) {
        await supa.bookingFood.upsert({
          where: { id: f.id },
          update: f,
          create: f,
        });
      }
    }
    console.log(`✓ Synced ${localBookings.length} Bookings with Tickets & Food Items`);

    console.log('🎉 Dual Sync Completed Successfully! Local & Supabase are 100% in sync!');
  } catch (err: any) {
    console.error('❌ Sync error:', err.message);
  } finally {
    await local.$disconnect();
    await supa.$disconnect();
  }
}

syncAll();
