import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialPromotions = [
  {
    title: 'Ngày Hội Thành Viên - Happy Tuesday',
    desc: 'Đồng giá 55.000 VNĐ cho tất cả thành viên Aeon Member vào mỗi thứ 3 hàng tuần.',
    category: 'MEMBER',
    badge: 'HOT',
    code: 'HAPPYTUESDAY',
    validUntil: '31/12/2026',
    terms: `Thể lệ chương trình:
1. Áp dụng cho mọi thành viên có tài khoản Aeon Member (STAR, G-STAR, X-STAR).
2. Áp dụng cho suất chiếu thứ 3 hàng tuần đối với phim 2D.
3. Không áp dụng cho suất chiếu đặc biệt, phim IMAX hoặc ngày Lễ/Tết.
4. Tích điểm bình thường theo giá trị thanh toán thực tế.`,
    coverUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&q=80',
    status: 'ACTIVE'
  },
  {
    title: 'Ưu Đãi Học Sinh Sinh Viên - Giá Sốc 45k',
    desc: 'Vé xem phim 2D đồng giá 45.000 VNĐ dành cho HSSV và khán giả dưới 22 tuổi.',
    category: 'STUDENT',
    badge: 'ƯU ĐÃI KHỦNG',
    code: 'STUDENT45K',
    validUntil: '31/12/2026',
    terms: `Thể lệ chương trình:
1. Áp dụng từ Thứ 2 đến Thứ 6 hàng tuần cho suất chiếu trước 17:00.
2. Vui lòng xuất trình Thẻ HSSV hoặc Căn cước công dân khi nhận vé tại quầy.
3. Mỗi thẻ HSSV được mua 01 vé ưu đãi/ngày.`,
    coverUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
    status: 'ACTIVE'
  },
  {
    title: 'Giảm 20% Khi Thanh Toán Qua Ví ZaloPay / VNPay',
    desc: 'Nhập mã ZALOPAY20 hoặc VNPAYCINE để nhận ngay chiết khấu 20% cho tổng hóa đơn đặt vé.',
    category: 'PARTNER',
    badge: 'CỔNG THANH TOÁN',
    code: 'ZALOPAY20',
    validUntil: '30/11/2026',
    terms: `Thể lệ áp dụng:
1. Giảm tối đa 30.000 VNĐ cho đơn hàng từ 100.000 VNĐ.
2. Áp dụng khi thanh toán bằng Ví ZaloPay hoặc QR VNPay trên ứng dụng/website Aeon Cine.
3. Mỗi tài khoản được sử dụng tối đa 02 lần/tháng.`,
    coverUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80',
    status: 'ACTIVE'
  },
  {
    title: 'Combo Bắp Nước Tiết Kiệm - Mua 1 Tặng 1',
    desc: 'Tặng ngay 01 Nước ngọt lớn khi mua Combo Bắp Nước bất kỳ cho vé xem phim cuối tuần.',
    category: 'MEMBER',
    badge: 'CONCESSION',
    code: 'COMBOBONUS',
    validUntil: '15/10/2026',
    terms: `Thể lệ chương trình:
1. Dành riêng cho thành viên từ hạng G-STAR trở lên.
2. Tự động áp dụng tại bước chọn bắp nước khi đặt vé trực tuyến.
3. Không có giá trị quy đổi thành tiền mặt.`,
    coverUrl: 'https://images.unsplash.com/photo-1572177191856-3cbde6181226?w=800&q=80',
    status: 'ACTIVE'
  }
];

const initialBlogs = [
  {
    title: 'Review Phim Dune 2: Tuyệt Tác Điện Ảnh Khai Sáng Kỷ Nguyên Sci-Fi Mới',
    summary: 'Dune: Part Two tiếp tục hành trình trả thù và định mệnh của Paul Atreides với góc quay mãn nhãn, âm thanh sống động đỉnh cao.',
    content: `Dune: Part Two (Hành Tinh Cát 2) của đạo diễn Denis Villeneuve không chỉ là một bộ phim giải trí đơn thuần, mà là một trải nghiệm điện ảnh đích thực. Với thời lượng gần 3 tiếng, bộ phim đưa khán giả chìm đắm vào hành tinh sa mạc Arrakis đầy khốc liệt.

Điểm sáng của bộ phim:
1. Hình ảnh & Kỹ xảo hoành tráng: Mọi khung hình đều được trau chuốt như một bức tranh nghệ thuật. Những đại cảnh cưỡi Sâu Cát (Sandworm) khổng lồ mang lại cảm giác ngợp thở.
2. Âm thanh Hans Zimmer: Âm nhạc ma mị, dồn dập nâng tầm cảm xúc cho từng trận chiến.
3. Diễn xuất đỉnh cao: Timothée Chalamet và Zendaya thể hiện trọn vẹn sự bùng nổ tâm lý nhân vật.

Đây chắc chắn là bộ phim bắt buộc phải xem trên màn hình lớn IMAX tại rạp!`,
    category: 'Review Phim',
    author: 'Aeon Cine Editor',
    publishDate: '2026-03-10',
    readingTime: '5 phút đọc',
    imageUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800&q=80',
    views: 1245,
    status: 'ACTIVE'
  },
  {
    title: 'Kung Fu Panda 4: Chú Gấu Po Trở Lại Với Những Pha Võ Thuật Hài Hước Mới',
    summary: 'Phần 4 đánh dấu bước ngoặt khi Po trở thành Thủ Lĩnh Tinh Thần của Thung Lũng Bình Yên và đối đầu với Tắc Kè Bông biến hình.',
    content: `Sau 8 năm chờ đợi, thương hiệu hoạt hình đình đám Kung Fu Panda đã quay trở lại với phần phim thứ 4 đầy ắp tiếng cười.

Những điểm nổi bật không thể bỏ qua:
- Nhân vật mới Fox Zhen - cô cáo tinh quái đồng hành cùng Po trong hành trình tới Thành Phố Bách Trụ.
- Phản diện Tắc Kè Bông (The Chameleon) có khả năng sao chép chiêu thức của mọi đại sư võ thuật.
- Màn thể hiện lồng tiếng xuất sắc từ Jack Black mang lại những tràng cười sảng khoái cho cả gia đình.`,
    category: 'Tin Điện Ảnh',
    author: 'Minh Tuấn',
    publishDate: '2026-03-12',
    readingTime: '4 phút đọc',
    imageUrl: 'https://images.unsplash.com/photo-1585647347384-2593bc35786b?w=800&q=80',
    views: 890,
    status: 'ACTIVE'
  },
  {
    title: 'Lịch Khởi Chiếu Những Phim Bom Tấn Đáng Chờ Đợi Nhất Hè 2026',
    summary: 'Điểm qua danh sách các siêu phẩm Hollywood và phim Việt chuẩn bị bùng nổ phòng vé tại hệ thống rạp Aeon Cine.',
    content: `Mùa hè 2026 hứa hẹn sẽ là cuộc đua phòng vé nảy lửa với hàng loạt siêu phẩm bom tấn thuộc nhiều thể loại:

1. Godzilla x Kong: The New Empire - Trận đại chiến của hai cổ quái thú chống lại mối đe dọa giấu mặt sâu trong Trái Đất Rỗng.
2. Inside Out 2 (Những Mảnh Mảnh Cảm Xúc 2) - Đón nhận cảm xúc mới "Lo Âu" (Anxiety) ở tuổi dậy thì của Riley.
3. Phim Hành Động Việt Bom Tấn - Sự trở lại của dàn sao phòng vé Việt với những pha rượt đuổi nghẹt thở.

Đừng quên đăng ký thẻ thành viên Aeon Member để tích điểm và nhận vé mời tham dự Suất Chiếu Sớm (Sneak Show)!`,
    category: 'Phim Sắp Chiếu',
    author: 'Trần Thanh',
    publishDate: '2026-03-14',
    readingTime: '6 phút đọc',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
    views: 2150,
    status: 'ACTIVE'
  }
];

async function seed() {
  console.log('=== SEEDING PROMOTIONS & BLOGS ===');

  for (const promo of initialPromotions) {
    const existing = await prisma.promotion.findFirst({
      where: { title: promo.title }
    });
    if (!existing) {
      await prisma.promotion.create({ data: promo });
      console.log(`+ Đã tạo ưu đãi: ${promo.title}`);
    } else {
      console.log(`* Ưu đãi đã tồn tại: ${promo.title}`);
    }
  }

  for (const blog of initialBlogs) {
    const existing = await prisma.blog.findFirst({
      where: { title: blog.title }
    });
    if (!existing) {
      await prisma.blog.create({ data: blog });
      console.log(`+ Đã tạo bài viết: ${blog.title}`);
    } else {
      console.log(`* Bài viết đã tồn tại: ${blog.title}`);
    }
  }

  console.log('=== HOÀN TẤT SEED PROMOTIONS & BLOGS ===');
}

seed()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
