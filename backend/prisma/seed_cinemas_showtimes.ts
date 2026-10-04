import { PrismaClient, SeatType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== BẮT ĐẦU SEED DỮ LIỆU RẠP, PHÒNG, GHẾ VÀ SUẤT CHIẾU CHO AEON CINE ===');

  // 1. Lấy danh sách phim đang chiếu từ DB
  const nowShowingMovies = await prisma.movie.findMany({
    where: { status: 'NOW_SHOWING' }
  });

  console.log(`Tìm thấy ${nowShowingMovies.length} phim đang chiếu trong Database.`);

  if (nowShowingMovies.length === 0) {
    console.warn('Không có phim nào trạng thái NOW_SHOWING!');
    return;
  }

  // 2. Danh sách 4 Cụm Rạp Aeon Cine
  const cinemaDataList = [
    {
      name: 'Aeon Cine Tân Phú',
      location: 'Tầng 3, AEON MALL Tân Phú Celadon, 30 Bờ Bao Tân Thắng, Q.Tân Phú, TP.HCM',
      address: 'Tầng 3, AEON MALL Tân Phú Celadon, 30 Bờ Bao Tân Thắng, Q.Tân Phú, TP.HCM',
      city: 'TP.HCM',
      phone: '028 6269 2200',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.066498765432!2d106.616543!3d10.805890!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752be890123456%3A0x654321789abcdef!2zQUVPTiBNQUxMIFTDom4gUGjDug==!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s',
      directionsUrl: 'https://maps.google.com/?q=Aeon+Cine+AEON+MALL+Tan+Phu+Celadon',
      amenities: ['Phòng chiếu IMAX 4K', 'Âm thanh Dolby Atmos', 'Ghế Đôi Sweetbox', 'Bãi đỗ xe ô tô']
    },
    {
      name: 'Aeon Cine Bình Tân',
      location: 'Tầng 3, AEON MALL Bình Tân, Số 1 Đường Số 17A, P.Bình Trị Đông B, Q.Bình Tân, TP.HCM',
      address: 'Tầng 3, AEON MALL Bình Tân, Số 1 Đường Số 17A, P.Bình Trị Đông B, Q.Bình Tân, TP.HCM',
      city: 'TP.HCM',
      phone: '028 3849 4567',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.167812345678!2d106.643210!3d10.798120!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175293489123456%3A0x123456789abcdef!2zQUVPTiBNQUxMIEIuIFTDom4=!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s',
      directionsUrl: 'https://maps.google.com/?q=Aeon+Cine+AEON+MALL+Binh+Tan',
      amenities: ['Phòng chiếu Laser 4K', 'Ghế Sofa VIP', 'Căn tin Bắp Nước', 'Bãi đỗ xe thông minh']
    },
    {
      name: 'Aeon Cine Hà Đông',
      location: 'Tầng 3, AEON MALL Hà Đông, P.Dương Nội, Q.Hà Đông, Hà Nội',
      address: 'Tầng 3, AEON MALL Hà Đông, P.Dương Nội, Q.Hà Đông, Hà Nội',
      city: 'Hà Nội',
      phone: '024 7300 8899',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.298765432109!2d105.748912!3d20.978901!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3134531234567890%3A0x987654321abcdef!2zQUVPTiBNQUxMIEjDoCDEkMO0bmc=!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s',
      directionsUrl: 'https://maps.google.com/?q=Aeon+Cine+AEON+MALL+Ha+Dong+Ha+Noi',
      amenities: ['Phòng chiếu Laser 4K', 'Ghế Đôi Sweetbox', 'Thanh toán VNPay QR', 'Khu vui chơi trẻ em']
    },
    {
      name: 'Aeon Cine Huế',
      location: 'Tầng 4, AEON MALL Huế, 8 Võ Nguyên Giáp, P.An Đông, TP.Huế',
      address: 'Tầng 4, AEON MALL Huế, 8 Võ Nguyên Giáp, P.An Đông, TP.Huế',
      city: 'Huế',
      phone: '023 4730 8899',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.298765432109!2d107.598912!3d16.458901!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3141a1234567890%3A0x987654321abcdef!2zQUVPTiBNQUxMIEh14bq_!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s',
      directionsUrl: 'https://maps.google.com/?q=Aeon+Cine+AEON+MALL+Hue',
      amenities: ['Màn hình 4K', 'Âm thanh Dolby Atmos', 'Combo Bắp nước độc quyền']
    }
  ];

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 10;

  for (const cData of cinemaDataList) {
    // Tìm hoặc tạo rạp
    let cinema = await prisma.cinema.findFirst({
      where: { name: cData.name }
    });

    if (!cinema) {
      cinema = await prisma.cinema.create({
        data: cData
      });
      console.log(`+ Đã tạo rạp: ${cinema.name}`);
    } else {
      console.log(`* Rạp đã tồn tại: ${cinema.name}`);
    }

    // 3. Tạo các phòng chiếu cho từng rạp
    const roomNames = ['Phòng 01 (2D)', 'Phòng 02 (2D)', 'Phòng 03 (IMAX Laser)', 'Phòng 04 (3D Atmos)'];
    
    for (const rName of roomNames) {
      let room = await prisma.room.findFirst({
        where: { name: rName, cinemaId: cinema.id }
      });

      if (!room) {
        room = await prisma.room.create({
          data: {
            name: rName,
            cinemaId: cinema.id
          }
        });
        console.log(`  + Đã tạo phòng: ${room.name} tại ${cinema.name}`);

        // Tạo ghế cho phòng này (80 ghế: A1-H10)
        const seatsToCreate = [];
        for (const row of rows) {
          let seatType: SeatType = 'STANDARD';
          if (row === 'H') seatType = 'SWEETBOX';
          else if (['C', 'D', 'E', 'F'].includes(row)) seatType = 'VIP';

          for (let num = 1; num <= seatsPerRow; num++) {
            seatsToCreate.push({
              name: `${row}${num}`,
              type: seatType,
              roomId: room.id
            });
          }
        }
        await prisma.seat.createMany({ data: seatsToCreate });
      }

      // 4. Tạo Suất Chiếu (Showtime) từ hôm nay và các ngày kế tiếp
      // Xác định ngày hiện tại của hệ thống (2026-09-17)
      const baseDate = new Date();
      baseDate.setHours(0, 0, 0, 0);

      // Tạo cho 7 ngày liên tiếp
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const currentDate = new Date(baseDate);
        currentDate.setDate(baseDate.getDate() + dayOffset);

        // Khung giờ chiếu trong ngày
        const timeSlots = [
          { hour: 9, minute: 30, format: '2D', language: 'Phụ đề' },
          { hour: 11, minute: 45, format: '2D', language: 'Lồng tiếng' },
          { hour: 14, minute: 15, format: '2D', language: 'Phụ đề' },
          { hour: 16, minute: 30, format: room.name.includes('3D') ? '3D' : '2D', language: 'Lồng tiếng' },
          { hour: 18, minute: 30, format: room.name.includes('IMAX') ? 'IMAX' : '2D', language: 'Phụ đề' },
          { hour: 20, minute: 15, format: room.name.includes('IMAX') ? 'IMAX' : '2D', language: 'Phụ đề' },
          { hour: 21, minute: 45, format: '2D', language: 'Phụ đề' },
          { hour: 23, minute: 0, format: '2D', language: 'Phụ đề' }
        ];

        for (let i = 0; i < timeSlots.length; i++) {
          const slot = timeSlots[i];
          // Phân phối luân phiên các phim đang chiếu vào các khung giờ
          const movieIndex = (dayOffset * 2 + i) % nowShowingMovies.length;
          const movie = nowShowingMovies[movieIndex];

          const startTime = new Date(currentDate);
          startTime.setHours(slot.hour, slot.minute, 0, 0);

          const durationMs = (movie.duration || 120) * 60 * 1000;
          const endTime = new Date(startTime.getTime() + durationMs);

          // Kiểm tra xem đã có suất chiếu trùng phòng và giờ chưa
          const existingShowtime = await prisma.showtime.findFirst({
            where: {
              roomId: room.id,
              startTime
            }
          });

          if (!existingShowtime) {
            await prisma.showtime.create({
              data: {
                movieId: movie.id,
                roomId: room.id,
                format: slot.format,
                language: slot.language,
                startTime,
                endTime
              }
            });
          }
        }
      }
    }
  }

  const cinemaCount = await prisma.cinema.count();
  const roomCount = await prisma.room.count();
  const seatCount = await prisma.seat.count();
  const showtimeCount = await prisma.showtime.count();

  console.log('=== HOÀN TẤT SEED CƠ SỞ DỮ LIỆU ===');
  console.log(`- Tổng Cụm Rạp: ${cinemaCount}`);
  console.log(`- Tổng Phòng Chiếu: ${roomCount}`);
  console.log(`- Tổng Ghế Ngồi: ${seatCount}`);
  console.log(`- Tổng Suất Chiếu: ${showtimeCount}`);
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed dữ liệu:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
