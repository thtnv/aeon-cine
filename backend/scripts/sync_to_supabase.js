const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const localUrl = process.env.DATABASE_URL || 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db?schema=public';
const supabaseUrl = process.env.SUPABASE_DATABASE_URL || 'postgresql://postgres.mjgsrwifsbemhcavmkyg:nguyenvanvien9876@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require';

const localPrisma = new PrismaClient({ datasources: { db: { url: localUrl } } });
const supabasePrisma = new PrismaClient({ datasources: { db: { url: supabaseUrl } } });

async function insertInChunks(modelCaller, data, chunkSize = 500) {
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

async function syncToSupabase() {
  console.log('========================================================================');
  console.log('🚀 BẮT ĐẦU ĐỒNG BỘ TOÀN DIỆN 27 BẢNG SANG SUPABASE CLOUD');
  console.log('   Nguồn: Local aeon_cinema_db');
  console.log('   Đích:  Supabase Cloud (aws-0-ap-southeast-1.pooler.supabase.com)');
  console.log('========================================================================\n');

  try {
    // 0. TRUNCATE CASCADE toàn bộ dữ liệu trên Supabase để nạp mới tinh khiết
    console.log('🧹 0. Dọn dẹp dữ liệu cũ trên Supabase Cloud (TRUNCATE CASCADE)...');
    await supabasePrisma.$executeRawUnsafe(`
      TRUNCATE TABLE 
        "Ticket",
        "BookingDetail",
        "BookingService",
        "SeatHold",
        "Review",
        "Booking",
        "Voucher",
        "Promotion",
        "Showtime",
        "Seat",
        "Room",
        "Cinema",
        "ScreenFormat",
        "SeatType",
        "TicketPrice",
        "Service",
        "Article",
        "GroupBooking",
        "MovieGenre",
        "MovieActor",
        "Movie",
        "Genre",
        "Actor",
        "User",
        "MembershipLevel",
        "Role",
        "PaymentMethod"
      CASCADE;
    `);
    console.log('✓ Hoàn tất làm sạch các bảng.\n');

    // 1. Role
    console.log('📥 1. Đồng bộ Role (Vai Trò)...');
    const roles = await localPrisma.role.findMany();
    await insertInChunks(supabasePrisma.role, roles);
    console.log(`✓ Đã nạp ${roles.length} roles.`);

    // 2. MembershipLevel
    console.log('📥 2. Đồng bộ MembershipLevel (Hạng Thành Viên)...');
    const mems = await localPrisma.membershipLevel.findMany();
    await insertInChunks(supabasePrisma.membershipLevel, mems);
    console.log(`✓ Đã nạp ${mems.length} membership levels.`);

    // 3. PaymentMethod
    console.log('📥 3. Đồng bộ PaymentMethod (Phương Thức Thanh Toán)...');
    const pms = await localPrisma.paymentMethod.findMany();
    await insertInChunks(supabasePrisma.paymentMethod, pms);
    console.log(`✓ Đã nạp ${pms.length} payment methods.`);

    // 4. Genre
    console.log('📥 4. Đồng bộ Genre (Thể Loại)...');
    const genres = await localPrisma.genre.findMany();
    await insertInChunks(supabasePrisma.genre, genres);
    console.log(`✓ Đã nạp ${genres.length} genres.`);

    // 5. Actor
    console.log('📥 5. Đồng bộ Actor (Diễn Viên)...');
    const actors = await localPrisma.actor.findMany();
    await insertInChunks(supabasePrisma.actor, actors);
    console.log(`✓ Đã nạp ${actors.length} actors.`);

    // 6. ScreenFormat
    console.log('📥 6. Đồng bộ ScreenFormat (Định Dạng Chiếu)...');
    const formats = await localPrisma.screenFormat.findMany();
    await insertInChunks(supabasePrisma.screenFormat, formats);
    console.log(`✓ Đã nạp ${formats.length} screen formats.`);

    // 7. SeatType
    console.log('📥 7. Đồng bộ SeatType (Loại Ghế)...');
    const seatTypes = await localPrisma.seatType.findMany();
    await insertInChunks(supabasePrisma.seatType, seatTypes);
    console.log(`✓ Đã nạp ${seatTypes.length} seat types.`);

    // 8. TicketPrice (PriceConfig)
    console.log('📥 8. Đồng bộ TicketPrice (Bảng Giá Vé)...');
    const prices = await localPrisma.priceConfig.findMany();
    await insertInChunks(supabasePrisma.priceConfig, prices);
    console.log(`✓ Đã nạp ${prices.length} ticket prices.`);

    // 9. Cinema
    console.log('📥 9. Đồng bộ Cinema (Cụm Rạp)...');
    const cinemas = await localPrisma.cinema.findMany();
    await insertInChunks(supabasePrisma.cinema, cinemas);
    console.log(`✓ Đã nạp ${cinemas.length} cinemas.`);

    // 10. Service (FoodCombo)
    console.log('📥 10. Đồng bộ Service (Dịch Vụ Bắp Nước)...');
    const foods = await localPrisma.foodCombo.findMany();
    await insertInChunks(supabasePrisma.foodCombo, foods);
    console.log(`✓ Đã nạp ${foods.length} services.`);

    // 11. Promotion
    console.log('📥 11. Đồng bộ Promotion (Chương Trình Khuyến Mãi)...');
    const promos = await localPrisma.promotion.findMany();
    await insertInChunks(supabasePrisma.promotion, promos);
    console.log(`✓ Đã nạp ${promos.length} promotions.`);

    // 12. User
    console.log('📥 12. Đồng bộ User (Người Dùng)...');
    const users = await localPrisma.user.findMany();
    await insertInChunks(supabasePrisma.user, users);
    console.log(`✓ Đã nạp ${users.length} users.`);

    // 13. Movie
    console.log('📥 13. Đồng bộ Movie (Phim)...');
    const movies = await localPrisma.movie.findMany();
    await insertInChunks(supabasePrisma.movie, movies);
    console.log(`✓ Đã nạp ${movies.length} movies.`);

    // 14. Room
    console.log('📥 14. Đồng bộ Room (Phòng Chiếu)...');
    const rooms = await localPrisma.room.findMany();
    await insertInChunks(supabasePrisma.room, rooms);
    console.log(`✓ Đã nạp ${rooms.length} rooms.`);

    // 15. MovieGenre
    console.log('📥 15. Đồng bộ MovieGenre (Phim - Thể Loại)...');
    const mg = await localPrisma.movieGenre.findMany();
    await insertInChunks(supabasePrisma.movieGenre, mg);
    console.log(`✓ Đã nạp ${mg.length} movie genres.`);

    // 16. MovieActor
    console.log('📥 16. Đồng bộ MovieActor (Phim - Diễn Viên)...');
    const ma = await localPrisma.movieActor.findMany();
    await insertInChunks(supabasePrisma.movieActor, ma);
    console.log(`✓ Đã nạp ${ma.length} movie actors.`);

    // 17. Seat
    console.log('📥 17. Đồng bộ Seat (Ghế Ngồi - 14,640 ghế)...');
    const seats = await localPrisma.seat.findMany();
    await insertInChunks(supabasePrisma.seat, seats, 1000);
    console.log(`✓ Đã nạp ${seats.length} seats.`);

    // 18. Showtime
    console.log('📥 18. Đồng bộ Showtime (Suất Chiếu - 4,031 suất)...');
    const showtimes = await localPrisma.showtime.findMany();
    await insertInChunks(supabasePrisma.showtime, showtimes, 500);
    console.log(`✓ Đã nạp ${showtimes.length} showtimes.`);

    // 19. Voucher
    console.log('📥 19. Đồng bộ Voucher (Mã Giảm Giá)...');
    const vouchers = await localPrisma.voucher.findMany();
    await insertInChunks(supabasePrisma.voucher, vouchers);
    console.log(`✓ Đã nạp ${vouchers.length} vouchers.`);

    // 20. Article (Blog)
    console.log('📥 20. Đồng bộ Article (Bài Viết Tin Tức)...');
    const articles = await localPrisma.blog.findMany();
    await insertInChunks(supabasePrisma.blog, articles);
    console.log(`✓ Đã nạp ${articles.length} articles.`);

    // 21. GroupBooking
    console.log('📥 21. Đồng bộ GroupBooking (Đặt Vé Nhóm)...');
    const groupBookings = await localPrisma.groupBooking.findMany();
    await insertInChunks(supabasePrisma.groupBooking, groupBookings);
    console.log(`✓ Đã nạp ${groupBookings.length} group bookings.`);

    // 22. Booking
    console.log('📥 22. Đồng bộ Booking (Đơn Đặt Vé)...');
    const bookings = await localPrisma.booking.findMany();
    await insertInChunks(supabasePrisma.booking, bookings);
    console.log(`✓ Đã nạp ${bookings.length} bookings.`);

    // 23. BookingService (BookingFood)
    console.log('📥 23. Đồng bộ BookingService (Chi Tiết Dịch Vụ Đơn Hàng)...');
    const bf = await localPrisma.bookingFood.findMany();
    await insertInChunks(supabasePrisma.bookingFood, bf);
    console.log(`✓ Đã nạp ${bf.length} booking services.`);

    // 24. BookingDetail
    console.log('📥 24. Đồng bộ BookingDetail (Chi Tiết Đơn Đặt Vé)...');
    const bds = await localPrisma.bookingDetail.findMany();
    await insertInChunks(supabasePrisma.bookingDetail, bds);
    console.log(`✓ Đã nạp ${bds.length} booking details.`);

    // 25. Ticket
    console.log('📥 25. Đồng bộ Ticket (Vé Xem Phim)...');
    const tickets = await localPrisma.ticket.findMany();
    await insertInChunks(supabasePrisma.ticket, tickets);
    console.log(`✓ Đã nạp ${tickets.length} tickets.`);

    // 26. Review
    console.log('📥 26. Đồng bộ Review (Đánh Giá Bình Luận)...');
    const reviews = await localPrisma.review.findMany();
    await insertInChunks(supabasePrisma.review, reviews);
    console.log(`✓ Đã nạp ${reviews.length} reviews.`);

    // 27. SeatHold
    console.log('📥 27. Đồng bộ SeatHold (Khóa Giữ Ghế Tạm Thời)...');
    const seatHolds = await localPrisma.seatHold.findMany();
    await insertInChunks(supabasePrisma.seatHold, seatHolds);
    console.log(`✓ Đã nạp ${seatHolds.length} seat holds.`);

    // BÁO CÁO ĐỐI SOÁT TOÀN DIỆN
    console.log('\n========================================================================');
    console.log('📊 ĐỐI SOÁT KHỚP DỮ LIỆU GIỮA LOCAL VÀ SUPABASE CLOUD:');
    console.log('========================================================================');

    const models = [
      { key: 'role', name: 'Role (Vai Trò)' },
      { key: 'membershipLevel', name: 'MembershipLevel (Hạng Thành Viên)' },
      { key: 'user', name: 'User (Người Dùng)' },
      { key: 'genre', name: 'Genre (Thể Loại)' },
      { key: 'actor', name: 'Actor (Diễn Viên)' },
      { key: 'movie', name: 'Movie (Phim)' },
      { key: 'movieGenre', name: 'MovieGenre (Phim - Thể Loại)' },
      { key: 'movieActor', name: 'MovieActor (Phim - Diễn Viên)' },
      { key: 'cinema', name: 'Cinema (Cụm Rạp)' },
      { key: 'screenFormat', name: 'ScreenFormat (Định Dạng Chiếu)' },
      { key: 'room', name: 'Room (Phòng Chiếu)' },
      { key: 'seatType', name: 'SeatType (Loại Ghế)' },
      { key: 'seat', name: 'Seat (Ghế Ngồi)' },
      { key: 'showtime', name: 'Showtime (Suất Chiếu)' },
      { key: 'paymentMethod', name: 'PaymentMethod (PT Thanh Toán)' },
      { key: 'priceConfig', name: 'TicketPrice (Bảng Giá Vé)' },
      { key: 'foodCombo', name: 'Service (Dịch Vụ Bắp Nước)' },
      { key: 'voucher', name: 'Voucher (Mã Giảm Giá)' },
      { key: 'promotion', name: 'Promotion (Khuyến Mãi)' },
      { key: 'booking', name: 'Booking (Đơn Đặt Vé)' },
      { key: 'bookingDetail', name: 'BookingDetail (Chi Tiết Đơn Đặt Vé)' },
      { key: 'ticket', name: 'Ticket (Vé Xem Phim)' },
      { key: 'bookingFood', name: 'BookingService (Chi Tiết Dịch Vụ)' },
      { key: 'review', name: 'Review (Đánh Giá)' },
      { key: 'seatHold', name: 'SeatHold (Giữ Ghế Tạm)' },
      { key: 'blog', name: 'Article (Bài Viết Tin Tức)' },
      { key: 'groupBooking', name: 'GroupBooking (Đặt Vé Nhóm)' }
    ];

    let allMatch = true;
    for (const m of models) {
      const localCount = await localPrisma[m.key].count();
      const supaCount = await supabasePrisma[m.key].count();
      const match = localCount === supaCount;
      if (!match) allMatch = false;
      const status = match ? '✅ KHỚP 100%' : '❌ LỆCH';
      console.log(`- ${m.name.padEnd(45)}: Local = ${String(localCount).padStart(5)} | Supabase = ${String(supaCount).padStart(5)} | ${status}`);
    }

    console.log('========================================================================');
    if (allMatch) {
      console.log('🎉 XÁC NHẬN: TOÀN BỘ 27 BẢNG TRÊN SUPABASE CLOUD ĐÃ ĐỒNG BỘ 100% VỚI LOCAL!');
    } else {
      console.warn('⚠️ CẢNH BÁO: Có bảng chưa khớp số lượng, vui lòng kiểm tra!');
    }
    console.log('========================================================================\n');

  } catch (error) {
    console.error('❌ Lỗi trong quá trình đồng bộ sang Supabase Cloud:', error);
  } finally {
    await localPrisma.$disconnect();
    await supabasePrisma.$disconnect();
  }
}

syncToSupabase();
