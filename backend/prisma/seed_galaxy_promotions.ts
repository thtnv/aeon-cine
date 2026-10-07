import { PrismaClient } from '@prisma/client';
import process from 'process';

const prisma = new PrismaClient();

const galaxyPromotions = [
  {
    title: 'Ưu Đãi 30% Khi Thanh Toán Bằng Thẻ JCB Tại Galaxy Cinema',
    desc: 'Giảm đến 100K khi thanh toán bằng thẻ JCB tại hệ thống rạp Galaxy Cinema!',
    category: 'PARTNER',
    badge: 'GIẢM 30%',
    code: 'JCB30',
    validUntil: '30/11/2026',
    coverUrl: 'https://cdn.galaxycine.vn/media/2026/7/3/jcb-x-galaxy-cinema-2_1783062208257.jpg',
    terms: `Thể lệ chương trình:
1. Ưu đãi 30% tối đa 100.000đ cho đơn hàng từ 200.000đ khi thanh toán bằng thẻ JCB hoặc Apple Pay liên kết thẻ JCB trên Payoo POS tại hệ thống rạp hoặc thanh toán trực tuyến qua website/ứng dụng.
2. Áp dụng vào Thứ Bảy và Chủ Nhật hàng tuần đến hết 30/11/2026.
3. Mỗi chủ thẻ JCB được hưởng ưu đãi tối đa 02 lần/tháng.
4. Áp dụng cho cả mua vé xem phim và bắp nước trực tuyến.`,
    voucher: {
      discountType: 'PERCENTAGE',
      discountValue: 30,
      minOrderValue: 200000,
      usageLimit: 1000
    }
  },
  {
    title: 'Ưu Đãi Độc Quyền Chỉ Có Tại Galaxy CineO GO! An Lạc',
    desc: 'Để tri ân tình cảm các Stars, Galaxy CineO GO! An Lạc mang tới hàng loạt ưu đãi hấp dẫn và cơ hội trúng xe SYM Tuscany.',
    category: 'MEMBER',
    badge: 'ĐỘC QUYỀN RẠP',
    code: 'GOANLAC',
    validUntil: '31/12/2026',
    coverUrl: 'https://cdn.galaxycine.vn/media/2026/9/25/galaxy-cineo-go-an-lac--3_1790312454231.jpg',
    terms: `Thể lệ chương trình:
1. Địa điểm: TTTM GO! An Lạc, Số 1231 Khu phố 5, Quốc Lộ 1A, Phường An Lạc, Bình Tân, TP. HCM.
2. Đối tượng: Khách hàng thành viên Galaxy Cinema có phát sinh giao dịch mua vé tại rạp.
3. Cơ cấu giải thưởng:
   - Giải nhất: Xe SYM Tuscany trị giá 45.000.000 VNĐ cho khách hàng có tổng chi tiêu cao nhất.
   - Giải nhì: 01 năm xem phim miễn phí (48 vé/năm).
4. Tặng ngay voucher bắp nước 20.000đ cho mỗi giao dịch từ 2 vé xem phim.`,
    voucher: {
      discountType: 'FIXED_AMOUNT',
      discountValue: 20000,
      minOrderValue: 100000,
      usageLimit: 1000
    }
  },
  {
    title: 'Miễn Phí Vé Xem Phim Tại Galaxy CineO Vincom Đan Phượng',
    desc: 'Mừng khai trương Galaxy CineO Vincom Đan Phượng, MIỄN PHÍ vé xem phim + nước ngọt cho mọi khán giả!',
    category: 'MEMBER',
    badge: 'MIỄN PHÍ VÉ',
    code: 'DANPHUONG',
    validUntil: '31/12/2026',
    coverUrl: 'https://cdn.galaxycine.vn/media/2026/8/24/1200_1787538968703.png',
    terms: `Thể lệ chương trình:
1. Địa điểm áp dụng: Rạp Galaxy CineO Vincom Đan Phượng, Hà Nội.
2. Tặng 01 vé xem phim 2D miễn phí và 01 ly nước ngọt có ga cho khách hàng đăng ký thành viên mới tại rạp.
3. Khách hàng xuất trình mã QR ưu đãi hoặc quét mã tại quầy để nhận vé.
4. Số lượng quà tặng có hạn mỗi ngày, ưu tiên khán giả đến sớm.`,
    voucher: {
      discountType: 'FIXED_AMOUNT',
      discountValue: 50000,
      minOrderValue: 100000,
      usageLimit: 1000
    }
  },
  {
    title: 'Cine Chào Summer – Đắm Mình Trong Sắc Màu Mùa Hè',
    desc: 'Cine Chào Summer với những món quà siêu khủng như iPhone 17 Pro, Macbook NEO, máy ảnh Fujifilm Instax và tai nghe Sony.',
    category: 'MEMBER',
    badge: 'MÙA HÈ RỰC RỠ',
    code: 'SUMMER2026',
    validUntil: '31/10/2026',
    coverUrl: 'https://cdn.galaxycine.vn/media/2026/6/30/1200_1782802642595.jpg',
    terms: `Thể lệ chương trình:
1. Áp dụng cho mọi giao dịch mua vé phim hè có giá trị từ 120.000 VNĐ trên hệ thống.
2. Mỗi vé hợp lệ tương ứng với 01 mã quay số trúng thưởng may mắn.
3. Cơ cấu giải thưởng:
   - 01 Giải đặc biệt: iPhone 17 Pro 256GB.
   - 02 Giải nhất: Macbook NEO siêu mỏng.
   - 05 Giải nhì: Máy ảnh Fujifilm Instax Mini Evo.
   - 10 Giải ba: Tai nghe Sony Linkbuds Fit chống ồn.
4. Lễ quay số và công bố kết quả sẽ được livestream trên Fanpage chính thức.`,
    voucher: {
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minOrderValue: 120000,
      usageLimit: 1000
    }
  },
  {
    title: 'Bắp Ngọt Vị Cốm – Hương Vị Mùa Thu Hà Nội Giữa Lòng Rạp Chiếu',
    desc: 'Nghe đồn ở đâu đó vừa có vị Bắp cốm, nhưng rạp Galaxy đã thơm lừng mùi cốm mùa thu từ lâu rồi nè!',
    category: 'MEMBER',
    badge: 'MÓN MỚI HOT',
    code: 'BAPCOM',
    validUntil: '31/12/2026',
    coverUrl: 'https://cdn.galaxycine.vn/media/2025/10/31/1200_1761896103954.jpg',
    terms: `Thể lệ chương trình:
1. Ra mắt hương vị Bắp Rang Vị Cốm Mùa Thu tại toàn bộ quầy Concession trên toàn quốc.
2. Tặng kèm 01 Nước ngọt lớn khi nâng cấp lên Combo Bắp Cốm Khổng Lồ.
3. Giảm thêm 10% khi thanh toán trực tuyến cùng vé xem phim qua Website hoặc App.
4. Áp dụng cho cả ngày thường và cuối tuần đến hết năm 2026.`,
    voucher: {
      discountType: 'FIXED_AMOUNT',
      discountValue: 20000,
      minOrderValue: 80000,
      usageLimit: 1000
    }
  },
  {
    title: 'Voucher ShopeePay Giảm Đến 50K Dành Tặng Các Stars!',
    desc: 'Galaxy Cinema x ShopeePay Giảm Đến 50K khi thanh toán vé xem phim qua ví ShopeePay!',
    category: 'PARTNER',
    badge: 'VOUCHER 50K',
    code: 'SHOPEEPAY50',
    validUntil: '31/12/2026',
    coverUrl: 'https://cdn.galaxycine.vn/media/2026/8/30/shopee-x-galaxy-cinema-3_1788051844317.jpg',
    terms: `Thể lệ áp dụng:
1. Giảm ngay 50.000 VNĐ cho đơn hàng từ 150.000 VNĐ khi chọn thanh toán bằng ShopeePay.
2. Nhập mã voucher: SHOPEEPAY50 tại bước thanh toán vé.
3. Mỗi tài khoản ví ShopeePay được sử dụng 01 lần/tháng.
4. Số lượng voucher giới hạn theo ngày, chương trình có thể kết thúc sớm khi hết ngân sách.`,
    voucher: {
      discountType: 'FIXED_AMOUNT',
      discountValue: 50000,
      minOrderValue: 150000,
      usageLimit: 1000
    }
  },
  {
    title: 'Happy Day - Vé Chỉ Từ 45K',
    desc: 'Vào thứ 3 hàng tuần – Happy Day, giá vé CHỈ TỪ 45K cho mọi cụm rạp trên toàn quốc!',
    category: 'MEMBER',
    badge: 'THỨ 3 VUI VẺ',
    code: 'HAPPYDAY45K',
    validUntil: '31/12/2026',
    coverUrl: 'https://cdn.galaxycine.vn/media/2026/1/12/1200_1768184267400.jpg',
    terms: `Thể lệ chương trình:
1. Áp dụng vào ngày Thứ Ba hàng tuần cho tất cả các suất chiếu phim 2D tiêu chuẩn.
2. Mức giá chi tiết:
   - Đồng giá 45.000đ/vé: Rạp Tân An, Đan Phượng, Aeon Huế.
   - Đồng giá 50.000đ/vé: Rạp Linh Trung, Quang Trung, Đà Nẵng, Vinh, An Lạc.
   - Đồng giá 55.000đ/vé: Rạp Tân Bình, Nguyễn Du, Kinh Dương Vương, Hải Phòng...
3. Không áp dụng vào các ngày Lễ/Tết và suất chiếu đặc biệt/IMAX.
4. Vẫn được tích lũy điểm thưởng thành viên theo giá trị hóa đơn.`,
    voucher: {
      discountType: 'FIXED_AMOUNT',
      discountValue: 45000,
      minOrderValue: 90000,
      usageLimit: 1000
    }
  },
  {
    title: 'Ưu Đãi Thành Viên Galaxy Cinema 2026',
    desc: 'Chỉ cần là thành viên Galaxy Cinema, nhận ngay 1 bắp 2 nước và ưu đãi tích điểm đổi quà không giới hạn!',
    category: 'MEMBER',
    badge: 'THÀNH VIÊN STAR',
    code: 'STAR2026',
    validUntil: '31/12/2026',
    coverUrl: 'https://cdn.galaxycine.vn/media/2025/1/22/bangqltv-digital-470x247-09_1737516474532.jpg',
    terms: `Thể lệ chương trình:
1. Áp dụng cho mọi tài khoản thành viên Galaxy Cinema đã kích hoạt trong năm 2026.
2. Đặc quyền các hạng thẻ:
   - Star: Tích lũy 5% chi tiêu, tặng 01 bắp rang sinh nhật.
   - G-Star: Tích lũy 7% chi tiêu, tặng 01 combo bắp nước + 02 vé xem phim 2D sinh nhật.
   - X-Star: Tích lũy 10% chi tiêu, quà sinh nhật cao cấp, ưu tiên lối đi VIP và mời tham dự các buổi chiếu Premiere.
3. Điểm tích lũy có thể dùng để đổi vé xem phim, bắp nước hoặc voucher giảm giá không giới hạn.`,
    voucher: {
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderValue: 100000,
      usageLimit: 1000
    }
  }
];

async function main() {
  console.log('🚀 Đang thêm 8 tin Khuyến mãi từ Galaxy Cinema vào Database...');

  for (const item of galaxyPromotions) {
    const { voucher, ...promoData } = item;

    // Check if promotion already exists by title
    const existingPromo = await prisma.promotion.findFirst({
      where: { title: promoData.title }
    });

    if (existingPromo) {
      await prisma.promotion.update({
        where: { id: existingPromo.id },
        data: promoData
      });
      console.log(`✅ Cập nhật Khuyến mãi: ${promoData.title}`);
    } else {
      await prisma.promotion.create({
        data: promoData
      });
      console.log(`✨ Thêm mới Khuyến mãi: ${promoData.title}`);
    }

    // Add / Update matching Voucher so users can use the code at checkout!
    if (promoData.code && voucher) {
      const existingVoucher = await prisma.voucher.findUnique({
        where: { code: promoData.code }
      });

      const voucherPayload = {
        code: promoData.code,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        minOrderValue: voucher.minOrderValue,
        startDate: new Date(),
        endDate: new Date('2026-12-31T23:59:59.000Z'),
        usageLimit: voucher.usageLimit,
        status: 'ACTIVE'
      };

      if (existingVoucher) {
        await prisma.voucher.update({
          where: { code: promoData.code },
          data: voucherPayload
        });
        console.log(`   🎟️ Cập nhật Voucher: ${promoData.code}`);
      } else {
        await prisma.voucher.create({
          data: voucherPayload
        });
        console.log(`   🎟️ Tạo mới Voucher: ${promoData.code}`);
      }
    }
  }

  console.log('🎉 Hoàn tất nạp 8 tin Khuyến mãi & Voucher từ Galaxy Cinema!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi nạp dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
