import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.movie.createMany({
    skipDuplicates: true,
    data: [
      // PHIM ĐANG CHIẾU
      {
        title: 'Lên Hương',
        ageRating: 'T16',
        duration: 121,
        releaseDate: '11/09/2026',
        rating: 9.0,
        votes: 146,
        country: 'Việt Nam',
        producer: 'Mockingbird Pictures',
        genre: 'Tâm Lý, Gia Đình',
        director: 'Khương Ngọc, Tấn Hoàng Thông',
        actors: 'Hồng Đào, Võ Tấn Phát, NSƯT Tuyết Thu, NSND Hồng Vân, Hạ Anh, Quốc Khánh',
        description: 'Một bà chủ của trại hòm ế ẩm và một thanh niên cần tiền trang trải cuộc sống đã vô tình mắc vào một "giao kèo định mệnh".',
        status: 'NOW_SHOWING',
        posterUrl: 'https://cdn.galaxycine.vn/media/2026/9/4/len-huong_1788501143294.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        title: 'Cổ Thuật Hắc Ngải',
        ageRating: 'T16',
        duration: 86,
        releaseDate: '10/09/2026',
        rating: 7.0,
        votes: 15,
        country: 'Thái Lan, Malaysia',
        producer: 'Mega Films Distribution',
        genre: 'Kinh Dị',
        director: 'Pei Chiek Goh, Choon Lin Yong',
        actors: 'Supassra Thanachat, Philip Keung, Bront Palarae',
        description: 'Cổ Thuật Hắc Ngải (Kong Tao – 蠱降) là bộ phim kinh dị hợp tác giữa Thái Lan và Malaysia, lấy cảm hứng từ những nghi thức trù ếm, bùa ngải.',
        status: 'NOW_SHOWING',
        posterUrl: 'https://cdn.galaxycine.vn/media/2026/9/4/co-thuat-hac-ngai-627_1788506357827.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        title: 'Bát Tiên! Truy Tìm Lưu Ly Đăng',
        ageRating: 'K',
        duration: 144,
        releaseDate: '11/09/2026',
        rating: 9.0,
        votes: 6,
        country: 'Trung Quốc',
        producer: 'CMC Pictures',
        genre: 'Hoạt Hình, Giả Tưởng',
        director: 'Mưu Chính Dương',
        actors: 'Chen Hao, Yuze Han, Yunqi Zhang',
        description: 'Tám phàm nhân với tám giấc mộng đổi đời đã thực hiện một phi vụ liều lĩnh: đột nhập chốn Bồng Lai để đánh cắp bảo vật.',
        status: 'NOW_SHOWING',
        posterUrl: 'https://cdn.galaxycine.vn/media/2026/8/28/bat-tien-627_1787889402379.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        title: 'Mãi Nợ Một Lời Tạm Biệt',
        ageRating: 'K',
        duration: 120,
        releaseDate: '11/09/2026',
        rating: 8.3,
        votes: 46,
        country: 'Việt Nam, Mỹ',
        producer: 'WS Productions, Skyline',
        genre: 'Tâm Lý, Gia Đình',
        director: 'J. Robert Schulz',
        actors: 'Kiều Chinh, Daniel K. Winn, Nguyễn Vũ Uy Nhân, Samuel An, Lan Thy',
        description: 'Một tuổi thơ bị bỏ lại giữa những biến động. Một người bà vẫn ở lại trong ký ức.',
        status: 'NOW_SHOWING',
        posterUrl: 'https://cdn.galaxycine.vn/media/2026/9/7/mai-no-mot-loi-tam-biet-500_1788771667591.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        title: 'Hành Trình Bất Hảo',
        ageRating: 'T18',
        duration: 111,
        releaseDate: '01/09/2026',
        rating: 7.8,
        votes: 18,
        country: 'Hàn Quốc',
        producer: 'Lotte Entertainment',
        genre: 'Hài, Hành Động, Tội Phạm',
        director: 'Kim Mi Jo',
        actors: 'Lee Jung Eun, Kong Hyo Jin, Park So Dam',
        description: 'Bị bóp nghẹt bởi nỗi đau mất đi đứa con gái út, bốn mẹ con quyết tâm thực hiện kế hoạch bắt cóc kẻ giết người.',
        status: 'NOW_SHOWING',
        posterUrl: 'https://cdn.galaxycine.vn/media/2026/8/19/hanh-trinh-bat-hao-627_1787128839518.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },

      // PHIM SẮP CHIẾU
      {
        title: 'Vùng Đất Quỷ Dữ',
        ageRating: 'T18',
        duration: 110,
        releaseDate: '18/09/2026',
        rating: 8.8,
        votes: 85,
        country: 'Mỹ',
        producer: 'New Line Cinema',
        genre: 'Kinh Dị, Giật Gân',
        director: 'Zach Cregger',
        actors: 'Josh Brolin, Julia Garner, Alden Ehrenreich',
        description: 'Từ đạo diễn của WEAPONS và BARBARIAN. Chuyến du lịch biến thành cơn ác mộng khi nhóm bạn lạc vào vùng đất quỷ dữ tàn bạo.',
        status: 'COMING_SOON',
        posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        title: 'Yêu Nhân Thần Thám: Kỳ Án Trường An',
        ageRating: 'K',
        duration: 118,
        releaseDate: '18/09/2026',
        rating: 9.0,
        votes: 92,
        country: 'Trung Quốc',
        producer: 'Light Chaser Animation',
        genre: 'Hoạt Hình, Trinh Thám, Kỳ Ảo',
        director: 'Trịnh Đăng, Đồng Đạo Diễn: Hoàng Mẫn',
        actors: 'Trương Kiệt, Biên Giang, Quý Quan Lâm',
        description: 'Đón Trung Thu Sớm 18.09.2026. Siêu phẩm hoạt hình trinh thám kỳ ảo chốn Trường An.',
        status: 'COMING_SOON',
        posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        title: 'Tà Sư Sám Hối',
        ageRating: 'T18',
        duration: 105,
        releaseDate: '18/09/2026',
        rating: 8.5,
        votes: 64,
        country: 'Thái Lan',
        producer: 'GDH 559',
        genre: 'Kinh Dị, Tâm Linh',
        director: 'Banjong Pisanthanakun',
        actors: 'Chantavit Dhanasevi, Suppasit Jongcheveevat',
        description: 'Siêu phẩm kinh dị trăm triệu Baht u ám và ám ảnh nhất màn ảnh Thái Lan 2026.',
        status: 'COMING_SOON',
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        title: 'Bóng Ma Nhà Hát',
        ageRating: 'T16',
        duration: 98,
        releaseDate: '18/09/2026',
        rating: 8.3,
        votes: 51,
        country: 'Việt Nam',
        producer: 'BHK Media',
        genre: 'Kinh Dị, Tâm Lý',
        director: 'Lê Công Sơn',
        actors: 'Quang Tuấn, Hoàng Yến Chibi, Quốc Trường',
        description: 'Dựa trên truyền thuyết đô thị bí ẩn về con ma nhà hát. Một nhà hát kịch cổ kính chìm trong bóng tối.',
        status: 'COMING_SOON',
        posterUrl: 'https://cdn.galaxycine.vn/media/2026/9/14/bong-ma-nha-hat-500_1789381286162.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ]
  });

  await prisma.foodCombo.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'Combo 1 Big',
        description: '1 Bắp Ngọt Nóng + 1 Nước Ngọt Siêu Lớn',
        price: 89000,
        imageUrl: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=300&q=80'
      },
      {
        name: 'Combo 2 Big (Couple)',
        description: '1 Bắp Khổng Lồ (Phô mai/Caramel) + 2 Nước Ngọt Siêu Lớn',
        price: 109000,
        imageUrl: 'https://images.unsplash.com/photo-1572177191856-3cbde6181226?w=300&q=80'
      },
      {
        name: 'Family Combo',
        description: '2 Bắp Lớn + 3 Nước Ngọt Lớn + 1 Snack Khoai Tây',
        price: 159000,
        imageUrl: 'https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?w=300&q=80'
      }
    ]
  });

  await prisma.voucher.createMany({
    skipDuplicates: true,
    data: [
      {
        code: 'AEON20K',
        discountType: 'FIXED_AMOUNT',
        discountValue: 20000,
        minOrderValue: 100000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2028-12-31'),
        usageLimit: 1000
      },
      {
        code: 'HECHILL10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 150000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2028-12-31'),
        usageLimit: 500
      }
    ]
  });

  console.log('Seed master completed with all movies!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
