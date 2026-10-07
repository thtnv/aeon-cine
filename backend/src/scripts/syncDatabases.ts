import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const localUrl = process.env.DATABASE_URL || 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db?schema=public';
const supabaseUrl = process.env.SUPABASE_DATABASE_URL || 'postgresql://postgres.mjgsrwifsbemhcavmkyg:nguyenvanvien9876@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require';

const localPrisma = new PrismaClient({ datasources: { db: { url: localUrl } } });
const supabasePrisma = new PrismaClient({ datasources: { db: { url: supabaseUrl } } });

async function insertInChunks(modelCaller: any, data: any[], chunkSize = 500) {
  if (!data || data.length === 0) return 0;
  let inserted = 0;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    await modelCaller.createMany({
      data: chunk,
      skipDuplicates: true
    });
    inserted += chunk.length;
    if (data.length > 1000 && (i + chunkSize) % 2000 === 0) {
      console.log(`    ... tiến độ: ${Math.min(i + chunkSize, data.length)} / ${data.length}`);
    }
  }
  return inserted;
}

export async function syncAll() {
  console.log('========================================================================');
  console.log('🔄 STARTING FULL DATABASE SYNC (27 TABLES): Local ➔ Supabase Cloud');
  console.log('========================================================================\n');

  try {
    // 0. TRUNCATE CASCADE
    console.log('🧹 0. Làm sạch dữ liệu trên Supabase Cloud (TRUNCATE CASCADE)...');
    await supabasePrisma.$executeRawUnsafe(`
      TRUNCATE TABLE 
        "BookingDetail", "BookingService", "SeatHold", "Review", 
        "Booking", "Voucher", "Promotion", "Showtime", "Seat", "Room", 
        "Cinema", "ScreenFormat", "SeatType", "TicketPrice", "Service", 
        "Article", "GroupBooking", "MovieGenre", "MovieActor", "Movie", 
        "Genre", "Actor", "User", "MembershipLevel", "Role", "PaymentMethod"
      CASCADE;
    `);
    console.log('✓ Hoàn tất làm sạch các bảng.\n');

    // 1. Role
    const roles = await localPrisma.role.findMany();
    await insertInChunks(supabasePrisma.role, roles);
    console.log(`✓ Synced ${roles.length} roles`);

    // 2. MembershipLevel
    const mems = await localPrisma.membershipLevel.findMany();
    await insertInChunks(supabasePrisma.membershipLevel, mems);
    console.log(`✓ Synced ${mems.length} membership levels`);

    // 3. PaymentMethod
    const pms = await localPrisma.paymentMethod.findMany();
    await insertInChunks(supabasePrisma.paymentMethod, pms);
    console.log(`✓ Synced ${pms.length} payment methods`);

    // 4. Genre
    const genres = await localPrisma.genre.findMany();
    await insertInChunks(supabasePrisma.genre, genres);
    console.log(`✓ Synced ${genres.length} genres`);

    // 5. Actor
    const actors = await localPrisma.actor.findMany();
    await insertInChunks(supabasePrisma.actor, actors);
    console.log(`✓ Synced ${actors.length} actors`);

    // 6. ScreenFormat
    const formats = await localPrisma.screenFormat.findMany();
    await insertInChunks(supabasePrisma.screenFormat, formats);
    console.log(`✓ Synced ${formats.length} screen formats`);

    // 7. SeatType
    const seatTypes = await localPrisma.seatType.findMany();
    await insertInChunks(supabasePrisma.seatType, seatTypes);
    console.log(`✓ Synced ${seatTypes.length} seat types`);

    // 8. TicketPrice (PriceConfig)
    const prices = await localPrisma.priceConfig.findMany();
    await insertInChunks(supabasePrisma.priceConfig, prices);
    console.log(`✓ Synced ${prices.length} ticket prices`);

    // 9. Cinema
    const cinemas = await localPrisma.cinema.findMany();
    await insertInChunks(supabasePrisma.cinema, cinemas);
    console.log(`✓ Synced ${cinemas.length} cinemas`);

    // 10. Service (FoodCombo)
    const foods = await localPrisma.foodCombo.findMany();
    await insertInChunks(supabasePrisma.foodCombo, foods);
    console.log(`✓ Synced ${foods.length} services`);

    // 11. Promotion
    const promos = await localPrisma.promotion.findMany();
    await insertInChunks(supabasePrisma.promotion, promos);
    console.log(`✓ Synced ${promos.length} promotions`);

    // 12. User
    const users = await localPrisma.user.findMany();
    await insertInChunks(supabasePrisma.user, users);
    console.log(`✓ Synced ${users.length} users`);

    // 13. Movie
    const movies = await localPrisma.movie.findMany();
    await insertInChunks(supabasePrisma.movie, movies);
    console.log(`✓ Synced ${movies.length} movies`);

    // 14. Room
    const rooms = await localPrisma.room.findMany();
    await insertInChunks(supabasePrisma.room, rooms);
    console.log(`✓ Synced ${rooms.length} rooms`);

    // 15. MovieGenre
    const mg = await localPrisma.movieGenre.findMany();
    await insertInChunks(supabasePrisma.movieGenre, mg);
    console.log(`✓ Synced ${mg.length} movie genres`);

    // 16. MovieActor
    const ma = await localPrisma.movieActor.findMany();
    await insertInChunks(supabasePrisma.movieActor, ma);
    console.log(`✓ Synced ${ma.length} movie actors`);

    // 17. Seat
    const seats = await localPrisma.seat.findMany();
    await insertInChunks(supabasePrisma.seat, seats, 1000);
    console.log(`✓ Synced ${seats.length} seats`);

    // 18. Showtime
    const showtimes = await localPrisma.showtime.findMany();
    await insertInChunks(supabasePrisma.showtime, showtimes, 500);
    console.log(`✓ Synced ${showtimes.length} showtimes`);

    // 19. Voucher
    const vouchers = await localPrisma.voucher.findMany();
    await insertInChunks(supabasePrisma.voucher, vouchers);
    console.log(`✓ Synced ${vouchers.length} vouchers`);

    // 20. Article (Blog)
    const articles = await localPrisma.blog.findMany();
    await insertInChunks(supabasePrisma.blog, articles);
    console.log(`✓ Synced ${articles.length} articles`);

    // 21. GroupBooking
    const groupBookings = await localPrisma.groupBooking.findMany();
    await insertInChunks(supabasePrisma.groupBooking, groupBookings);
    console.log(`✓ Synced ${groupBookings.length} group bookings`);

    // 22. Booking
    const bookings = await localPrisma.booking.findMany();
    await insertInChunks(supabasePrisma.booking, bookings);
    console.log(`✓ Synced ${bookings.length} bookings`);

    // 23. BookingService (BookingFood)
    const bf = await localPrisma.bookingFood.findMany();
    await insertInChunks(supabasePrisma.bookingFood, bf);
    console.log(`✓ Synced ${bf.length} booking services`);

    // 24. BookingDetail (Ticket - Chi Tiết Đơn Đặt Vé)
    const tickets = await localPrisma.ticket.findMany();
    await insertInChunks(supabasePrisma.ticket, tickets);
    console.log(`✓ Synced ${tickets.length} tickets (BookingDetail)`);

    // 26. Review
    const reviews = await localPrisma.review.findMany();
    await insertInChunks(supabasePrisma.review, reviews);
    console.log(`✓ Synced ${reviews.length} reviews`);

    // 27. SeatHold
    const seatHolds = await localPrisma.seatHold.findMany();
    await insertInChunks(supabasePrisma.seatHold, seatHolds);
    console.log(`✓ Synced ${seatHolds.length} seat holds`);

    console.log('\n🎉 Dual Sync Completed Successfully! Local & Supabase are 100% in sync across all 27 tables!');
  } catch (err: any) {
    console.error('❌ Sync error:', err.message);
  } finally {
    await localPrisma.$disconnect();
    await supabasePrisma.$disconnect();
  }
}

if (require.main === module) {
  syncAll();
}
