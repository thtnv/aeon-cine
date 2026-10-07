const { Client } = require('pg');

const sourceConfig = {
  connectionString: 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db'
};

const targetConfig = {
  connectionString: 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db_vi'
};

// Batch insert helper function
async function batchInsert(client, tableName, columns, rows, batchSize = 400) {
  if (rows.length === 0) return 0;

  let totalInserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const valuePlaceholders = [];
    const values = [];

    chunk.forEach((row, rowIdx) => {
      const rowPlaceholders = [];
      columns.forEach((col, colIdx) => {
        const paramIndex = rowIdx * columns.length + colIdx + 1;
        rowPlaceholders.push(`$${paramIndex}`);
        values.push(row[col]);
      });
      valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
    });

    const colNames = columns.map(c => `"${c}"`).join(', ');
    const queryText = `INSERT INTO "${tableName}" (${colNames}) VALUES ${valuePlaceholders.join(', ')}`;
    await client.query(queryText, values);
    totalInserted += chunk.length;
  }
  return totalInserted;
}

async function syncDatabases() {
  console.log('========================================================================');
  console.log('🚀 BẮT ĐẦU ĐỒNG BỘ TOÀN DIỆN: aeon_cinema_db ➔ aeon_cinema_db_vi');
  console.log('========================================================================\n');

  const sourceClient = new Client(sourceConfig);
  const targetClient = new Client(targetConfig);

  try {
    await sourceClient.connect();
    console.log('✓ Kết nối thành công Cơ sở dữ liệu nguồn: aeon_cinema_db');

    await targetClient.connect();
    console.log('✓ Kết nối thành công Cơ sở dữ liệu đích: aeon_cinema_db_vi\n');

    // 0. Tạo bảng DatVeNhom nếu chưa tồn tại trong aeon_cinema_db_vi
    await targetClient.query(`
      CREATE TABLE IF NOT EXISTS "DatVeNhom" (
        "maDatVeNhom" VARCHAR(36) PRIMARY KEY,
        "hoTenLienHe" VARCHAR(255) NOT NULL,
        "soDienThoai" VARCHAR(20) NOT NULL,
        "email" VARCHAR(255) NOT NULL,
        "tenCongTy" VARCHAR(255),
        "maCumRap" VARCHAR(36),
        "tenCumRap" VARCHAR(255),
        "loaiDichVu" VARCHAR(50) NOT NULL,
        "soLuongKhach" INT NOT NULL,
        "ngayDuKien" VARCHAR(50),
        "ghiChu" TEXT,
        "trangThai" VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
        "ngayTao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "ngayCapNhat" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      COMMENT ON TABLE "DatVeNhom" IS 'Bảng quản lý đơn yêu cầu đặt vé xem phim theo nhóm, sự kiện, thuê trọn rạp';
    `);

    // 1. Dọn sạch dữ liệu cũ trong aeon_cinema_db_vi để đảm bảo toàn vẹn dữ liệu
    console.log('🧹 Đang làm sạch các bảng dữ liệu trong aeon_cinema_db_vi (TRUNCATE CASCADE)...');
    await targetClient.query(`
      TRUNCATE TABLE 
        "VeXemPhim",
        "KhoaGiuGheTamThoi",
        "ChiTietComboDonHang",
        "DonDatVe",
        "DanhGiaBinhLuan",
        "SuatChieu",
        "GheNgoi",
        "PhongChieu",
        "CumRap",
        "Phim",
        "NguoiDung",
        "ComboBapNuoc",
        "MaGiamGia",
        "BangGiaVe",
        "TheLoaiPhim",
        "DienVien",
        "ChuongTrinhKhuyenMai",
        "BaiVietTinTuc",
        "DatVeNhom"
      CASCADE;
    `);
    console.log('✓ Đã dọn sạch các bảng đích thành công.\n');

    // =========================================================================
    // 2. ĐỒNG BỘ TỪNG BẢNG THEO THỨ TỰ KHÓA NGOẠI (FOREIGN KEY CONSTRAINTS)
    // =========================================================================

    // --- 1. User ➔ NguoiDung ---
    console.log('⏳ [1/19] Đang đồng bộ User ➔ NguoiDung...');
    const users = (await sourceClient.query('SELECT * FROM "User"')).rows;
    const userRows = users.map(u => ({
      maNguoiDung: u.id,
      email: u.email,
      matKhau: u.password,
      hoTen: u.name,
      vaiTro: u.role,
      soDienThoai: u.phone,
      anhDaiDien: u.avatar,
      ngaySinh: u.birthDate,
      gioiTinh: u.gender,
      diemTichLuy: u.rewardPoints || 0,
      hangThanhVien: u.membershipLevel || 'STAR',
      ngayTao: u.createdAt,
      ngayCapNhat: u.updatedAt
    }));
    await batchInsert(targetClient, 'NguoiDung', [
      'maNguoiDung', 'email', 'matKhau', 'hoTen', 'vaiTro', 'soDienThoai',
      'anhDaiDien', 'ngaySinh', 'gioiTinh', 'diemTichLuy', 'hangThanhVien', 'ngayTao', 'ngayCapNhat'
    ], userRows);
    console.log(`✓ Đã đồng bộ ${userRows.length} tài khoản người dùng.\n`);

    // --- 2. Movie ➔ Phim ---
    console.log('⏳ [2/19] Đang đồng bộ Movie ➔ Phim...');
    const movies = (await sourceClient.query('SELECT * FROM "Movie"')).rows;
    const movieRows = movies.map(m => ({
      maPhim: m.id,
      tenPhim: m.title,
      moTa: m.description,
      theLoai: m.genre,
      thoiLuong: m.duration,
      duongDanTrailer: m.trailerUrl,
      duongDanPoster: m.posterUrl,
      trangThai: m.status,
      ngayKhoiChieu: m.releaseDate,
      phanLoaiDoTuoi: m.ageRating,
      danhGiaTrungBinh: m.rating,
      tongSoLuotDanhGia: m.votes,
      quocGia: m.country,
      nhaSanXuat: m.producer,
      daoDien: m.director,
      dienVien: m.actors,
      ngayTao: m.createdAt,
      ngayCapNhat: m.updatedAt
    }));
    await batchInsert(targetClient, 'Phim', [
      'maPhim', 'tenPhim', 'moTa', 'theLoai', 'thoiLuong', 'duongDanTrailer',
      'duongDanPoster', 'trangThai', 'ngayKhoiChieu', 'phanLoaiDoTuoi', 'danhGiaTrungBinh',
      'tongSoLuotDanhGia', 'quocGia', 'nhaSanXuat', 'daoDien', 'dienVien', 'ngayTao', 'ngayCapNhat'
    ], movieRows);
    console.log(`✓ Đã đồng bộ ${movieRows.length} phim điện ảnh.\n`);

    // --- 3. Cinema ➔ CumRap ---
    console.log('⏳ [3/19] Đang đồng bộ Cinema ➔ CumRap...');
    const cinemas = (await sourceClient.query('SELECT * FROM "Cinema"')).rows;
    const cinemaRows = cinemas.map(c => ({
      maCumRap: c.id,
      tenCumRap: c.name,
      khuVuc: c.location,
      diaChi: c.address,
      thanhPho: c.city || 'TP.HCM',
      soDienThoai: c.phone,
      duongDanBanDo: c.mapUrl,
      duongDanChiDuong: c.directionsUrl,
      tienIch: c.amenities || [],
      ngayTao: c.createdAt,
      ngayCapNhat: c.updatedAt
    }));
    await batchInsert(targetClient, 'CumRap', [
      'maCumRap', 'tenCumRap', 'khuVuc', 'diaChi', 'thanhPho', 'soDienThoai',
      'duongDanBanDo', 'duongDanChiDuong', 'tienIch', 'ngayTao', 'ngayCapNhat'
    ], cinemaRows);
    console.log(`✓ Đã đồng bộ ${cinemaRows.length} cụm rạp chiếu phim.\n`);

    // --- 4. Room ➔ PhongChieu ---
    console.log('⏳ [4/19] Đang đồng bộ Room ➔ PhongChieu...');
    const rooms = (await sourceClient.query('SELECT * FROM "Room"')).rows;
    const roomRows = rooms.map(r => ({
      maPhongChieu: r.id,
      tenPhongChieu: r.name,
      maCumRap: r.cinemaId,
      ngayTao: r.createdAt,
      ngayCapNhat: r.updatedAt
    }));
    await batchInsert(targetClient, 'PhongChieu', [
      'maPhongChieu', 'tenPhongChieu', 'maCumRap', 'ngayTao', 'ngayCapNhat'
    ], roomRows);
    console.log(`✓ Đã đồng bộ ${roomRows.length} phòng chiếu phim.\n`);

    // --- 5. Seat ➔ GheNgoi ---
    console.log('⏳ [5/19] Đang đồng bộ Seat ➔ GheNgoi (Ma trận ghế)...');
    const seats = (await sourceClient.query('SELECT * FROM "Seat"')).rows;
    const seatRows = seats.map(s => ({
      maGhe: s.id,
      tenGhe: s.name,
      loaiGhe: s.type,
      maPhongChieu: s.roomId
    }));
    await batchInsert(targetClient, 'GheNgoi', [
      'maGhe', 'tenGhe', 'loaiGhe', 'maPhongChieu'
    ], seatRows, 500);
    console.log(`✓ Đã đồng bộ ${seatRows.length} ghế ngồi.\n`);

    // --- 6. Showtime ➔ SuatChieu ---
    console.log('⏳ [6/19] Đang đồng bộ Showtime ➔ SuatChieu...');
    const showtimes = (await sourceClient.query('SELECT * FROM "Showtime"')).rows;
    const showtimeRows = showtimes.map(st => ({
      maSuatChieu: st.id,
      maPhim: st.movieId,
      maPhongChieu: st.roomId,
      dinhDang: st.format || '2D',
      ngonNgu: st.language || 'SUB',
      thoiGianBatDau: st.startTime,
      thoiGianKetThuc: st.endTime,
      ngayTao: st.createdAt,
      ngayCapNhat: st.updatedAt
    }));
    await batchInsert(targetClient, 'SuatChieu', [
      'maSuatChieu', 'maPhim', 'maPhongChieu', 'dinhDang', 'ngonNgu',
      'thoiGianBatDau', 'thoiGianKetThuc', 'ngayTao', 'ngayCapNhat'
    ], showtimeRows, 500);
    console.log(`✓ Đã đồng bộ ${showtimeRows.length} suất chiếu phim.\n`);

    // --- 7. Booking ➔ DonDatVe ---
    console.log('⏳ [7/19] Đang đồng bộ Booking ➔ DonDatVe...');
    const bookings = (await sourceClient.query('SELECT * FROM "Booking"')).rows;
    const bookingRows = bookings.map(b => ({
      maDonHang: b.id,
      maNguoiDung: b.userId,
      trangThaiDonHang: b.status,
      phuongThucThanhToan: b.paymentMethod,
      trangThaiThanhToan: b.paymentStatus || 'UNPAID',
      maVoucher: b.voucherCode,
      soTienGiamGia: b.discountAmount || 0,
      maVeDienTu: b.ticketCode,
      duongDanMaQR: b.qrCodeUrl,
      tongTien: b.total,
      ngayTao: b.createdAt,
      ngayCapNhat: b.updatedAt
    }));
    await batchInsert(targetClient, 'DonDatVe', [
      'maDonHang', 'maNguoiDung', 'trangThaiDonHang', 'phuongThucThanhToan',
      'trangThaiThanhToan', 'maVoucher', 'soTienGiamGia', 'maVeDienTu',
      'duongDanMaQR', 'tongTien', 'ngayTao', 'ngayCapNhat'
    ], bookingRows);
    console.log(`✓ Đã đồng bộ ${bookingRows.length} đơn đặt vé / hóa đơn.\n`);

    // --- 8. Ticket ➔ VeXemPhim ---
    console.log('⏳ [8/19] Đang đồng bộ Ticket ➔ VeXemPhim...');
    const tickets = (await sourceClient.query('SELECT * FROM "Ticket"')).rows;
    const ticketRows = tickets.map(t => ({
      maVe: t.id,
      maDonHang: t.bookingId,
      maSuatChieu: t.showtimeId,
      maGhe: t.seatId,
      giaVe: t.price,
      ngayTao: t.createdAt,
      ngayCapNhat: t.updatedAt
    }));
    await batchInsert(targetClient, 'VeXemPhim', [
      'maVe', 'maDonHang', 'maSuatChieu', 'maGhe', 'giaVe', 'ngayTao', 'ngayCapNhat'
    ], ticketRows);
    console.log(`✓ Đã đồng bộ ${ticketRows.length} vé xem phim chi tiết.\n`);

    // --- 9. FoodCombo ➔ ComboBapNuoc ---
    console.log('⏳ [9/19] Đang đồng bộ FoodCombo ➔ ComboBapNuoc...');
    const foods = (await sourceClient.query('SELECT * FROM "FoodCombo"')).rows;
    const foodRows = foods.map(f => ({
      maCombo: f.id,
      tenCombo: f.name,
      moTa: f.description,
      giaBan: f.price,
      duongDanHinhAnh: f.imageUrl,
      trangThai: f.status || 'ACTIVE',
      ngayTao: f.createdAt,
      ngayCapNhat: f.updatedAt
    }));
    await batchInsert(targetClient, 'ComboBapNuoc', [
      'maCombo', 'tenCombo', 'moTa', 'giaBan', 'duongDanHinhAnh', 'trangThai', 'ngayTao', 'ngayCapNhat'
    ], foodRows);
    console.log(`✓ Đã đồng bộ ${foodRows.length} gói combo bắp nước F&B.\n`);

    // --- 10. BookingFood ➔ ChiTietComboDonHang ---
    console.log('⏳ [10/19] Đang đồng bộ BookingFood ➔ ChiTietComboDonHang...');
    const bookingFoods = (await sourceClient.query('SELECT * FROM "BookingFood"')).rows;
    const bookingFoodRows = bookingFoods.map(bf => ({
      maChiTietCombo: bf.id,
      maDonHang: bf.bookingId,
      maCombo: bf.foodId,
      soLuong: bf.quantity,
      donGia: bf.price,
      ngayTao: bf.createdAt,
      ngayCapNhat: bf.updatedAt
    }));
    await batchInsert(targetClient, 'ChiTietComboDonHang', [
      'maChiTietCombo', 'maDonHang', 'maCombo', 'soLuong', 'donGia', 'ngayTao', 'ngayCapNhat'
    ], bookingFoodRows);
    console.log(`✓ Đã đồng bộ ${bookingFoodRows.length} chi tiết bắp nước theo đơn.\n`);

    // --- 11. Voucher ➔ MaGiamGia ---
    console.log('⏳ [11/19] Đang đồng bộ Voucher ➔ MaGiamGia...');
    const vouchers = (await sourceClient.query('SELECT * FROM "Voucher"')).rows;
    const voucherRows = vouchers.map(v => ({
      maVoucher: v.id,
      maCode: v.code,
      loaiGiamGia: v.discountType,
      giaTriGiam: v.discountValue,
      giaTriDonToiThieu: v.minOrderValue || 0,
      ngayBatDau: v.startDate,
      ngayKetThuc: v.endDate,
      gioiHanSuDung: v.usageLimit,
      soLuotDaDung: v.usedCount || 0,
      trangThai: v.status || 'ACTIVE',
      ngayTao: v.createdAt,
      ngayCapNhat: v.updatedAt
    }));
    await batchInsert(targetClient, 'MaGiamGia', [
      'maVoucher', 'maCode', 'loaiGiamGia', 'giaTriGiam', 'giaTriDonToiThieu',
      'ngayBatDau', 'ngayKetThuc', 'gioiHanSuDung', 'soLuotDaDung', 'trangThai', 'ngayTao', 'ngayCapNhat'
    ], voucherRows);
    console.log(`✓ Đã đồng bộ ${voucherRows.length} voucher mã giảm giá.\n`);

    // --- 12. Review ➔ DanhGiaBinhLuan ---
    console.log('⏳ [12/19] Đang đồng bộ Review ➔ DanhGiaBinhLuan...');
    const reviews = (await sourceClient.query('SELECT * FROM "Review"')).rows;
    const reviewRows = reviews.map(r => ({
      maDanhGia: r.id,
      maNguoiDung: r.userId,
      maPhim: r.movieId,
      soSaoDanhGia: r.rating,
      noiDungBinhLuan: r.comment,
      ngayTao: r.createdAt,
      ngayCapNhat: r.updatedAt
    }));
    await batchInsert(targetClient, 'DanhGiaBinhLuan', [
      'maDanhGia', 'maNguoiDung', 'maPhim', 'soSaoDanhGia', 'noiDungBinhLuan', 'ngayTao', 'ngayCapNhat'
    ], reviewRows);
    console.log(`✓ Đã đồng bộ ${reviewRows.length} đánh giá bình luận.\n`);

    // --- 13. SeatHold ➔ KhoaGiuGheTamThoi ---
    console.log('⏳ [13/19] Đang đồng bộ SeatHold ➔ KhoaGiuGheTamThoi...');
    const seatHolds = (await sourceClient.query('SELECT * FROM "SeatHold"')).rows;
    const seatHoldRows = seatHolds.map(sh => ({
      maGiuGhe: sh.id,
      maSuatChieu: sh.showtimeId,
      maGhe: sh.seatId,
      maNguoiDung: sh.userId,
      thoiGianHetHan: sh.expiresAt,
      ngayTao: sh.createdAt
    }));
    await batchInsert(targetClient, 'KhoaGiuGheTamThoi', [
      'maGiuGhe', 'maSuatChieu', 'maGhe', 'maNguoiDung', 'thoiGianHetHan', 'ngayTao'
    ], seatHoldRows);
    console.log(`✓ Đã đồng bộ ${seatHoldRows.length} khóa giữ ghế thời gian thực.\n`);

    // --- 14. PriceConfig ➔ BangGiaVe ---
    console.log('⏳ [14/19] Đang đồng bộ PriceConfig ➔ BangGiaVe...');
    const prices = (await sourceClient.query('SELECT * FROM "PriceConfig"')).rows;
    const priceRows = prices.map(p => ({
      maBangGia: p.id,
      loaiGhe: p.seatType,
      dinhDang: p.format,
      laCuoiTuan: p.isWeekend,
      giaVe: p.price,
      ngayTao: p.createdAt,
      ngayCapNhat: p.updatedAt
    }));
    await batchInsert(targetClient, 'BangGiaVe', [
      'maBangGia', 'loaiGhe', 'dinhDang', 'laCuoiTuan', 'giaVe', 'ngayTao', 'ngayCapNhat'
    ], priceRows);
    console.log(`✓ Đã đồng bộ ${priceRows.length} cấu hình giá vé.\n`);

    // --- 15. Genre ➔ TheLoaiPhim ---
    console.log('⏳ [15/19] Đang đồng bộ Genre ➔ TheLoaiPhim...');
    const genres = (await sourceClient.query('SELECT * FROM "Genre"')).rows;
    const genreRows = genres.map(g => ({
      maTheLoai: g.id,
      tenTheLoai: g.name,
      ngayTao: g.createdAt,
      ngayCapNhat: g.updatedAt
    }));
    await batchInsert(targetClient, 'TheLoaiPhim', [
      'maTheLoai', 'tenTheLoai', 'ngayTao', 'ngayCapNhat'
    ], genreRows);
    console.log(`✓ Đã đồng bộ ${genreRows.length} thể loại phim.\n`);

    // --- 16. Actor ➔ DienVien ---
    console.log('⏳ [16/19] Đang đồng bộ Actor ➔ DienVien...');
    const actors = (await sourceClient.query('SELECT * FROM "Actor"')).rows;
    const actorRows = actors.map(a => ({
      maDienVien: a.id,
      tenDienVien: a.name,
      duongDanAnh: a.avatarUrl,
      ngayTao: a.createdAt,
      ngayCapNhat: a.updatedAt
    }));
    await batchInsert(targetClient, 'DienVien', [
      'maDienVien', 'tenDienVien', 'duongDanAnh', 'ngayTao', 'ngayCapNhat'
    ], actorRows);
    console.log(`✓ Đã đồng bộ ${actorRows.length} diễn viên & đạo diễn.\n`);

    // --- 17. Promotion ➔ ChuongTrinhKhuyenMai ---
    console.log('⏳ [17/19] Đang đồng bộ Promotion ➔ ChuongTrinhKhuyenMai...');
    const promotions = (await sourceClient.query('SELECT * FROM "Promotion"')).rows;
    const promoRows = promotions.map(pr => ({
      maKhuyenMai: pr.id,
      tieuDe: pr.title,
      moTa: pr.desc,
      danhMuc: pr.category,
      nhanNoiBat: pr.badge,
      maCode: pr.code,
      hanSuDung: pr.validUntil,
      dieuKhoan: pr.terms,
      duongDanAnhBia: pr.coverUrl,
      loaiIcon: pr.iconType || 'ticket',
      trangThai: pr.status || 'ACTIVE',
      ngayTao: pr.createdAt,
      ngayCapNhat: pr.updatedAt
    }));
    await batchInsert(targetClient, 'ChuongTrinhKhuyenMai', [
      'maKhuyenMai', 'tieuDe', 'moTa', 'danhMuc', 'nhanNoiBat', 'maCode',
      'hanSuDung', 'dieuKhoan', 'duongDanAnhBia', 'loaiIcon', 'trangThai', 'ngayTao', 'ngayCapNhat'
    ], promoRows);
    console.log(`✓ Đã đồng bộ ${promoRows.length} chương trình khuyến mãi.\n`);

    // --- 18. Blog ➔ BaiVietTinTuc ---
    console.log('⏳ [18/19] Đang đồng bộ Blog ➔ BaiVietTinTuc...');
    const blogs = (await sourceClient.query('SELECT * FROM "Blog"')).rows;
    const blogRows = blogs.map(bl => ({
      maBaiViet: bl.id,
      tieuDe: bl.title,
      tomTat: bl.summary,
      noiDung: bl.content,
      danhMuc: bl.category,
      tacGia: bl.author || 'Aeon Cine Editor',
      ngayDang: bl.publishDate,
      thoiGianDoc: bl.readingTime || '5 phút đọc',
      duongDanAnh: bl.imageUrl,
      luotXem: bl.views || 0,
      trangThai: bl.status || 'ACTIVE',
      ngayTao: bl.createdAt,
      ngayCapNhat: bl.updatedAt
    }));
    await batchInsert(targetClient, 'BaiVietTinTuc', [
      'maBaiViet', 'tieuDe', 'tomTat', 'noiDung', 'danhMuc', 'tacGia',
      'ngayDang', 'thoiGianDoc', 'duongDanAnh', 'luotXem', 'trangThai', 'ngayTao', 'ngayCapNhat'
    ], blogRows);
    console.log(`✓ Đã đồng bộ ${blogRows.length} bài viết tin tức & blog điện ảnh.\n`);

    // --- 19. GroupBooking ➔ DatVeNhom ---
    console.log('⏳ [19/19] Đang đồng bộ GroupBooking ➔ DatVeNhom...');
    const groupBookings = (await sourceClient.query('SELECT * FROM "GroupBooking"')).rows;
    const groupBookingRows = groupBookings.map(gb => ({
      maDatVeNhom: gb.id,
      hoTenLienHe: gb.contactName,
      soDienThoai: gb.phone,
      email: gb.email,
      tenCongTy: gb.companyName,
      maCumRap: gb.cinemaId,
      tenCumRap: gb.cinemaName,
      loaiDichVu: gb.serviceType,
      soLuongKhach: gb.expectedGuests,
      ngayDuKien: gb.expectedDate,
      ghiChu: gb.notes,
      trangThai: gb.status || 'PENDING',
      ngayTao: gb.createdAt,
      ngayCapNhat: gb.updatedAt
    }));
    await batchInsert(targetClient, 'DatVeNhom', [
      'maDatVeNhom', 'hoTenLienHe', 'soDienThoai', 'email', 'tenCongTy',
      'maCumRap', 'tenCumRap', 'loaiDichVu', 'soLuongKhach', 'ngayDuKien',
      'ghiChu', 'trangThai', 'ngayTao', 'ngayCapNhat'
    ], groupBookingRows);
    console.log(`✓ Đã đồng bộ ${groupBookingRows.length} yêu cầu đặt vé nhóm & sự kiện.\n`);

    // =========================================================================
    // 3. ĐỐI SOÁT & KIỂM TRA SỐ LƯỢNG BẢN GHI (VERIFICATION)
    // =========================================================================
    console.log('========================================================================');
    console.log('🔍 BẢNG ĐỐI SOÁT CHI TIẾT SỐ LƯỢNG BẢN GHI GIỮA 2 DATABASE');
    console.log('========================================================================');

    const tableMappings = [
      { src: 'User', tgt: 'NguoiDung', desc: 'Tài khoản người dùng' },
      { src: 'Movie', tgt: 'Phim', desc: 'Danh mục phim điện ảnh' },
      { src: 'Cinema', tgt: 'CumRap', desc: 'Cụm rạp chiếu phim' },
      { src: 'Room', tgt: 'PhongChieu', desc: 'Phòng chiếu phim' },
      { src: 'Seat', tgt: 'GheNgoi', desc: 'Ma trận ghế ngồi' },
      { src: 'Showtime', tgt: 'SuatChieu', desc: 'Suất chiếu / Lịch chiếu' },
      { src: 'Booking', tgt: 'DonDatVe', desc: 'Đơn đặt vé / Hóa đơn' },
      { src: 'Ticket', tgt: 'VeXemPhim', desc: 'Chi tiết vé xem phim' },
      { src: 'FoodCombo', tgt: 'ComboBapNuoc', desc: 'Combo bắp nước F&B' },
      { src: 'BookingFood', tgt: 'ChiTietComboDonHang', desc: 'Chi tiết bắp nước đơn hàng' },
      { src: 'Voucher', tgt: 'MaGiamGia', desc: 'Mã giảm giá (Voucher)' },
      { src: 'Review', tgt: 'DanhGiaBinhLuan', desc: 'Đánh giá & Bình luận phim' },
      { src: 'SeatHold', tgt: 'KhoaGiuGheTamThoi', desc: 'Khóa giữ ghế 10 phút' },
      { src: 'PriceConfig', tgt: 'BangGiaVe', desc: 'Cấu hình bảng giá vé' },
      { src: 'Genre', tgt: 'TheLoaiPhim', desc: 'Thể loại phim' },
      { src: 'Actor', tgt: 'DienVien', desc: 'Diễn viên & Đạo diễn' },
      { src: 'Promotion', tgt: 'ChuongTrinhKhuyenMai', desc: 'Chương trình khuyến mãi' },
      { src: 'Blog', tgt: 'BaiVietTinTuc', desc: 'Bài viết Góc Điện Ảnh' },
      { src: 'GroupBooking', tgt: 'DatVeNhom', desc: 'Đặt vé nhóm & Sự kiện' }
    ];

    let allMatch = true;
    for (const m of tableMappings) {
      const srcCount = parseInt((await sourceClient.query(`SELECT COUNT(*) FROM "${m.src}"`)).rows[0].count, 10);
      const tgtCount = parseInt((await targetClient.query(`SELECT COUNT(*) FROM "${m.tgt}"`)).rows[0].count, 10);
      const isOk = srcCount === tgtCount;
      if (!isOk) allMatch = false;

      const statusIcon = isOk ? '✅ KHỚP 100%' : '❌ LỆCH DỮ LIỆU';
      console.log(`- ${m.src.padEnd(14)} ➔ ${m.tgt.padEnd(20)} | Nguồn: ${String(srcCount).padStart(5)} | Đích: ${String(tgtCount).padStart(5)} | ${statusIcon} (${m.desc})`);
    }

    console.log('========================================================================');
    if (allMatch) {
      console.log('🎉 TẤT CẢ 19/19 BẢNG ĐÃ ĐƯỢC ĐỒNG BỘ CHÍNH XÁC 100% SANG aeon_cinema_db_vi!');
    } else {
      console.warn('⚠️ CÓ BẢNG BỊ LỆCH SỐ LƯỢNG DỮ LIỆU! VUI LÒNG KIỂM TRA LẠI.');
    }
    console.log('========================================================================\n');

  } catch (error) {
    console.error('❌ Lỗi trong quá trình đồng bộ database:', error);
  } finally {
    await sourceClient.end().catch(() => {});
    await targetClient.end().catch(() => {});
  }
}

syncDatabases();
