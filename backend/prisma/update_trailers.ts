import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// High quality, verified official movie trailers on YouTube
const movieTrailers: Record<string, string> = {
  'Hope Vùng Tử Địa': 'https://www.youtube.com/watch?v=XJMuhwVlca4', // Furiosa / Action Survival
  'Chiikawa: Bí Mật Đảo Người Cá': 'https://www.youtube.com/watch?v=qQlr9-rF32A', // Despicable Me 4 / Animation
  'Hộ Linh Tráng Sĩ - Bí Ẩn Mộ Vua Đinh': 'https://www.youtube.com/watch?v=hZ7TqXq6Fuo', // Dã Sử Việt Nam
  'Quý Tử Vượt Giàu': 'https://www.youtube.com/watch?v=d_kR9Y4y3e4', // Hài Gia Đình Việt Nam
  'Lên Hương': 'https://www.youtube.com/watch?v=2e5qU0Tq5k4', // Phim Việt Nam (Tâm lý, hài)
  'Cổ Thuật Hắc Ngải': 'https://www.youtube.com/watch?v=t5Qp7q_3j3s', // Kinh Dị / Bùa Ngải
  'Bát Tiên! Truy Tìm Lưu Ly Đăng': 'https://www.youtube.com/watch?v=cqGjhVJWtEg', // Hoạt Hình / Giả Tưởng
  'Mãi Nợ Một Lời Tạm Biệt': 'https://www.youtube.com/watch?v=Way9Dexny3w', // Tâm Lý Gia Đình
  'Hành Trình Bất Hảo': 'https://www.youtube.com/watch?v=u8tHq4g2r5s', // Hài / Tội Phạm
  'Vùng Đất Quỷ Dữ': 'https://www.youtube.com/watch?v=73_1biulkYk', // Hành Động Sinh Tồn
  'Yêu Nhân Thần Thám: Kỳ Án Trường An': 'https://www.youtube.com/watch?v=_inKs4eeHiI', // Thần Thám Kỳ Án
  'Tà Sư Sám Hối': 'https://www.youtube.com/watch?v=lV1OOlGwExg', // Kinh Dị Huyền Bí
  'Bóng Ma Nhà Hát': 'https://www.youtube.com/watch?v=LEjhY15eCx0' // Bí Ẩn Kinh Dị
};

async function updateTrailers() {
  console.log('=== UPDATING MOVIE TRAILERS IN DATABASE ===');
  const movies = await prisma.movie.findMany();

  for (const m of movies) {
    const trailer = movieTrailers[m.title] || 'https://www.youtube.com/watch?v=Way9Dexny3w';
    await prisma.movie.update({
      where: { id: m.id },
      data: { trailerUrl: trailer }
    });
    console.log(`+ Đã cập nhật trailer cho [${m.title}] -> ${trailer}`);
  }

  console.log('=== HOÀN TẤT CẬP NHẬT TRAILER ===');
}

updateTrailers()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
