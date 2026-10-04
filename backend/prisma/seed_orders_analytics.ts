import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('=== BẮT ĐẦU TẠO DỮ LIỆU ĐƠN HÀNG MẪU CHO BIỂU ĐỒ DOANH THU & TOP PHIM ===');

  // 1. Kiểm tra hoặc tạo thêm người dùng thành viên nếu ít hơn 6
  let users = await prisma.user.findMany();
  if (users.length < 6) {
    const passwordHash = await bcrypt.hash('password123', 10);
    const newMembers = [
      { name: 'Nguyễn Hoàng Anh', email: 'hoanganh@aeoncine.vn', phone: '0901234567', role: Role.USER },
      { name: 'Trần Minh Châu', email: 'minhchau@aeoncine.vn', phone: '0912345678', role: Role.USER },
      { name: 'Lê Thành Nam', email: 'thanhnam@aeoncine.vn', phone: '0923456789', role: Role.USER },
      { name: 'Phạm Lan Phương', email: 'lanphuong@aeoncine.vn', phone: '0934567890', role: Role.USER },
      { name: 'Đỗ Đức Mạnh', email: 'ducmanh@aeoncine.vn', phone: '0945678901', role: Role.USER },
      { name: 'Vũ Thùy Linh', email: 'thuylinh@aeoncine.vn', phone: '0956789012', role: Role.USER },
    ];

    for (const m of newMembers) {
      const existing = await prisma.user.findUnique({ where: { email: m.email } });
      if (!existing) {
        await prisma.user.create({
          data: {
            ...m,
            password: passwordHash
          }
        });
      }
    }
    users = await prisma.user.findMany();
  }
  console.log(`Đã có ${users.length} tài khoản thành viên.`);

  // 2. Lấy danh sách phim và suất chiếu
  const movies = await prisma.movie.findMany({
    include: {
      showtimes: {
        include: {
          room: {
            include: {
              seats: true
            }
          }
        }
      }
    }
  });

  if (movies.length === 0) {
    console.error('Không tìm thấy phim nào!');
    return;
  }

  // Phân loại phim trọng tâm để xếp hạng Top Phim
  const topMovieTitles = [
    'Quý Tử Vượt Giàu',
    'Cô Thuật Hắc Ngải',
    'Chiikawa: Bí Mật Đảo Người Cá',
    'Hope Vùng Tử Địa',
    'Hộ Linh Tráng Sĩ - Bí Ẩn Mộ Vua Đinh'
  ];

  const focusMovies = movies.filter(m => topMovieTitles.includes(m.title));
  const otherMovies = movies.filter(m => !topMovieTitles.includes(m.title));

  // Lấy hoặc tạo sẵn FoodCombos
  let combos = await prisma.foodCombo.findMany();
  if (combos.length === 0) {
    await prisma.foodCombo.createMany({
      data: [
        { name: 'Combo Solo Bắp Nước', description: '1 Bắp ngọt 60oz + 1 Nước ngọt 32oz', price: 75000 },
        { name: 'Combo Đôi Hoàn Hảo', description: '1 Bắp lớn 85oz + 2 Nước ngọt 32oz', price: 110000 },
        { name: 'Combo Gia Đình VIP', description: '2 Bắp lớn + 3 Nước ngọt + 1 Snack', price: 175000 },
      ]
    });
    combos = await prisma.foodCombo.findMany();
  }

  // 3. Cấu hình phân bổ 7 ngày gần nhất (từ 6 ngày trước đến hôm nay)
  const now = new Date();
  
  // Mục tiêu vé & doanh thu cho từng ngày để tạo biểu đồ dạng chu kỳ điện ảnh thực tế
  // (Đầu tuần tăng nhẹ, Thứ 6 - Thứ 7 - Chủ Nhật bùng nổ, Thứ 2 giảm nhẹ, Hôm nay đông)
  const dayConfigs = [
    { dayOffset: 6, targetOrders: 14, minTickets: 25, maxTickets: 32 }, // 25/9
    { dayOffset: 5, targetOrders: 18, minTickets: 36, maxTickets: 44 }, // 26/9
    { dayOffset: 4, targetOrders: 25, minTickets: 50, maxTickets: 60 }, // 27/9 (Thứ 6)
    { dayOffset: 3, targetOrders: 32, minTickets: 65, maxTickets: 78 }, // 28/9 (Thứ 7 - Peak)
    { dayOffset: 2, targetOrders: 28, minTickets: 55, maxTickets: 68 }, // 29/9 (Chủ nhật)
    { dayOffset: 1, targetOrders: 16, minTickets: 30, maxTickets: 38 }, // 30/9 (Thứ 2)
    { dayOffset: 0, targetOrders: 22, minTickets: 42, maxTickets: 52 }, // 1/10 (Hôm nay)
  ];

  const paymentMethods = ['VNPAY', 'MOMO', 'STRIPE'];
  let totalCreatedBookings = 0;
  let totalCreatedTickets = 0;
  let grandTotalRevenue = 0;

  for (const cfg of dayConfigs) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - cfg.dayOffset);
    const dateStr = `${targetDate.getDate()}/${targetDate.getMonth() + 1}`;

    console.log(`\n--- Đang tạo đơn cho ngày ${dateStr} (target: ~${cfg.targetOrders} đơn)... ---`);

    for (let oIdx = 0; oIdx < cfg.targetOrders; oIdx++) {
      // Giờ ngẫu nhiên trong ngày chiếu (từ 09:00 đến 23:00)
      const hour = 9 + Math.floor(Math.random() * 14);
      const minute = Math.floor(Math.random() * 60);
      const second = Math.floor(Math.random() * 60);
      const orderDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), hour, minute, second);

      // Chọn user ngẫu nhiên
      const user = users[Math.floor(Math.random() * users.length)];

      // Chọn phim: 75% cơ hội chọn Top Movies để tạo xếp hạng đẹp mắt
      let selectedMovie;
      if (Math.random() < 0.75 && focusMovies.length > 0) {
        // Tỷ lệ nghiêng về Quý Tử Vượt Giàu và Cô Thuật Hắc Ngải
        const r = Math.random();
        if (r < 0.4) {
          selectedMovie = focusMovies.find(m => m.title.includes('Quý Tử')) || focusMovies[0];
        } else if (r < 0.7) {
          selectedMovie = focusMovies.find(m => m.title.includes('Cổ Thuật')) || focusMovies[1];
        } else {
          selectedMovie = focusMovies[Math.floor(Math.random() * focusMovies.length)];
        }
      } else {
        selectedMovie = movies[Math.floor(Math.random() * movies.length)];
      }

      // Chọn suất chiếu của phim này
      if (!selectedMovie.showtimes || selectedMovie.showtimes.length === 0) continue;
      const showtime = selectedMovie.showtimes[Math.floor(Math.random() * selectedMovie.showtimes.length)];
      if (!showtime.room || !showtime.room.seats || showtime.room.seats.length === 0) continue;

      // Chọn số ghế cho đơn: 1 đến 4 vé (thường 2 vé)
      const seatCount = Math.random() < 0.6 ? 2 : Math.random() < 0.8 ? 1 : Math.random() < 0.95 ? 3 : 4;
      const allSeats = showtime.room.seats;
      const chosenSeats = [];
      const startSeatIdx = Math.floor(Math.random() * Math.max(1, allSeats.length - seatCount));
      for (let s = 0; s < seatCount && (startSeatIdx + s) < allSeats.length; s++) {
        chosenSeats.push(allSeats[startSeatIdx + s]);
      }

      if (chosenSeats.length === 0) continue;

      // Tính giá vé dựa trên định dạng
      const basePrice = showtime.format === 'IMAX' ? 150000 : showtime.format === '3D' ? 120000 : 95000;
      let orderTicketsTotal = 0;

      const ticketCode = `AC-${targetDate.getDate().toString().padStart(2, '0')}${(targetDate.getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const pMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      // 40% đơn có mua kèm bắp nước
      const hasFood = Math.random() < 0.4 && combos.length > 0;
      const selectedCombo = hasFood ? combos[Math.floor(Math.random() * combos.length)] : null;
      const foodTotal = selectedCombo ? selectedCombo.price : 0;

      // Tạo đơn hàng Booking
      const booking = await prisma.booking.create({
        data: {
          userId: user.id,
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          paymentMethod: pMethod,
          ticketCode: ticketCode,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${ticketCode}`,
          total: 0, // Sẽ update sau khi tính tickets
          createdAt: orderDate,
          updatedAt: orderDate,
        }
      });

      // Tạo các vé Tickets
      for (const seat of chosenSeats) {
        let seatPrice = basePrice;
        if (seat.type === 'VIP') seatPrice += 20000;
        if (seat.type === 'SWEETBOX') seatPrice += 50000;

        orderTicketsTotal += seatPrice;

        await prisma.ticket.create({
          data: {
            bookingId: booking.id,
            showtimeId: showtime.id,
            seatId: seat.id,
            price: seatPrice,
            createdAt: orderDate,
            updatedAt: orderDate,
          }
        });
        totalCreatedTickets++;
      }

      // Tạo BookingFood nếu có
      if (selectedCombo) {
        await prisma.bookingFood.create({
          data: {
            bookingId: booking.id,
            foodId: selectedCombo.id,
            quantity: 1,
            price: selectedCombo.price,
            createdAt: orderDate,
            updatedAt: orderDate
          }
        });
      }

      const finalOrderTotal = orderTicketsTotal + foodTotal;
      await prisma.booking.update({
        where: { id: booking.id },
        data: { total: finalOrderTotal }
      });

      grandTotalRevenue += finalOrderTotal;
      totalCreatedBookings++;
    }
  }

  console.log('\n======================================================');
  console.log('✅ HOÀN TẤT INSERT DỮ LIỆU ĐƠN HÀNG THÀNH CÔNG!');
  console.log(`- Tổng số đơn hàng mới: ${totalCreatedBookings} đơn`);
  console.log(`- Tổng số vé đã bán: ${totalCreatedTickets} vé`);
  console.log(`- Tổng doanh thu thêm: ${grandTotalRevenue.toLocaleString()} VNĐ`);
  console.log('======================================================\n');
}

main()
  .catch(e => {
    console.error('Lỗi khi seed đơn hàng:', e);
  })
  .finally(() => prisma.$disconnect());
