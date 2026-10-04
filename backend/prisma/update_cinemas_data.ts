import { PrismaClient } from '@prisma/client';
import process from 'process';

const prisma = new PrismaClient();

const cinemaUpdates = [
  {
    name: 'Aeon Cine Tân Phú',
    address: 'Tầng 3, AEON MALL Tân Phú Celadon, 30 Bờ Bao Tân Thắng, Q.Tân Phú, TP.HCM',
    location: 'Tầng 3, AEON MALL Tân Phú Celadon, 30 Bờ Bao Tân Thắng, Q.Tân Phú, TP.HCM',
    city: 'TP.HCM',
    phone: '028 6269 2200',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.066498765432!2d106.616543!3d10.805890!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752be890123456%3A0x654321789abcdef!2zQUVPTiBNQUxMIFTDom4gUGjDug==!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s',
    directionsUrl: 'https://maps.google.com/?q=Aeon+Cine+AEON+MALL+Tan+Phu+Celadon',
    amenities: ['Phòng chiếu IMAX 4K', 'Âm thanh Dolby Atmos', 'Ghế Đôi Sweetbox', 'Bãi đỗ xe ô tô']
  },
  {
    name: 'Aeon Cine Bình Tân',
    address: 'Tầng 3, AEON MALL Bình Tân, Số 1 Đường Số 17A, P.Bình Trị Đông B, Q.Bình Tân, TP.HCM',
    location: 'Tầng 3, AEON MALL Bình Tân, Số 1 Đường Số 17A, P.Bình Trị Đông B, Q.Bình Tân, TP.HCM',
    city: 'TP.HCM',
    phone: '028 3849 4567',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.167812345678!2d106.643210!3d10.798120!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175293489123456%3A0x123456789abcdef!2zQUVPTiBNQUxMIEIuIFTDom4=!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s',
    directionsUrl: 'https://maps.google.com/?q=Aeon+Cine+AEON+MALL+Binh+Tan',
    amenities: ['Phòng chiếu Laser 4K', 'Ghế Sofa VIP', 'Căn tin Bắp Nước', 'Bãi đỗ xe thông minh']
  },
  {
    name: 'Aeon Cine Hà Đông',
    address: 'Tầng 3, AEON MALL Hà Đông, P.Dương Nội, Q.Hà Đông, Hà Nội',
    location: 'Tầng 3, AEON MALL Hà Đông, P.Dương Nội, Q.Hà Đông, Hà Nội',
    city: 'Hà Nội',
    phone: '024 7300 8899',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.298765432109!2d105.748912!3d20.978901!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3134531234567890%3A0x987654321abcdef!2zQUVPTiBNQUxMIEjDoCDEkMO0bmc=!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s',
    directionsUrl: 'https://maps.google.com/?q=Aeon+Cine+AEON+MALL+Ha+Dong+Ha+Noi',
    amenities: ['Phòng chiếu Laser 4K', 'Ghế Đôi Sweetbox', 'Thanh toán VNPay QR', 'Khu vui chơi trẻ em']
  },
  {
    name: 'Aeon Cine Huế',
    address: 'Tầng 4, AEON MALL Huế, 8 Võ Nguyên Giáp, P.An Đông, TP.Huế',
    location: 'Tầng 4, AEON MALL Huế, 8 Võ Nguyên Giáp, P.An Đông, TP.Huế',
    city: 'Huế',
    phone: '023 4730 8899',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.298765432109!2d107.598912!3d16.458901!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3141a1234567890%3A0x987654321abcdef!2zQUVPTiBNQUxMIEh14bq_!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s',
    directionsUrl: 'https://maps.google.com/?q=Aeon+Cine+AEON+MALL+Hue',
    amenities: ['Màn hình 4K', 'Âm thanh Dolby Atmos', 'Combo Bắp nước độc quyền']
  }
];

async function updateCinemas() {
  console.log('=== Cập nhật thông tin chi tiết cho các cụm rạp ===');
  for (const c of cinemaUpdates) {
    const existing = await prisma.cinema.findFirst({
      where: { name: c.name }
    });

    if (existing) {
      await prisma.cinema.update({
        where: { id: existing.id },
        data: {
          address: c.address,
          location: c.location,
          city: c.city,
          phone: c.phone,
          mapUrl: c.mapUrl,
          directionsUrl: c.directionsUrl,
          amenities: c.amenities
        }
      });
      console.log(`✓ Đã cập nhật rạp: ${c.name}`);
    } else {
      await prisma.cinema.create({
        data: c
      });
      console.log(`+ Đã tạo mới rạp: ${c.name}`);
    }
  }
}

updateCinemas()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
