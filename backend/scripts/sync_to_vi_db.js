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
  console.log('🚀 BẮT ĐẦU ĐỒNG BỘ TOÀN DIỆN CHUẨN HÓA 27 BẢNG (3NF): aeon_cinema_db ➔ aeon_cinema_db_vi');
  console.log('========================================================================\n');

  const sourceClient = new Client(sourceConfig);
  const targetClient = new Client(targetConfig);

  try {
    await sourceClient.connect();
    console.log('✓ Kết nối thành công Cơ sở dữ liệu nguồn: aeon_cinema_db');

    await targetClient.connect();
    console.log('✓ Kết nối thành công Cơ sở dữ liệu đích: aeon_cinema_db_vi\n');

    // 1. Dọn sạch dữ liệu cũ trong aeon_cinema_db_vi
    console.log('🧹 Đang làm sạch các bảng dữ liệu trong aeon_cinema_db_vi (TRUNCATE CASCADE)...');
    await targetClient.query(`
      TRUNCATE TABLE 
        "PhimTheLoai",
        "PhimDienVien",
        "ChiTietDonDatVe",
        "KhoaGiuGheTamThoi",
        "ChiTietDichVuDonHang",
        "DonDatVe",
        "DanhGiaBinhLuan",
        "SuatChieu",
        "GheNgoi",
        "PhongChieu",
        "CumRap",
        "Phim",
        "NguoiDung",
        "DichVu",
        "MaGiamGia",
        "BangGiaVe",
        "TheLoaiPhim",
        "DienVien",
        "ChuongTrinhKhuyenMai",
        "BaiVietTinTuc",
        "DatVeNhom",
        "VaiTro",
        "HangThanhVien",
        "LoaiGhe",
        "DinhDangChieu",
        "PhuongThucThanhToan"
      CASCADE;
    `);
    console.log('✓ Đã dọn sạch các bảng đích thành công.\n');

    // =========================================================================
    // 2. ĐỒNG BỘ 26 BẢNG THEO THỨ TỰ KHÓA NGOẠI (FOREIGN KEY CONSTRAINTS)
    // =========================================================================

    // --- 1. Role ➔ VaiTro ---
    console.log('⏳ [1/26] Đang đồng bộ Role ➔ VaiTro...');
    const roles = (await sourceClient.query('SELECT * FROM "Role"')).rows;
    const roleRows = roles.map(r => ({
      maVaiTro: r.id,
      maCode: r.code,
      tenVaiTro: r.name,
      moTa: r.description,
      ngayTao: r.createdAt,
      ngayCapNhat: r.updatedAt
    }));
    await batchInsert(targetClient, 'VaiTro', ['maVaiTro', 'maCode', 'tenVaiTro', 'moTa', 'ngayTao', 'ngayCapNhat'], roleRows);
    console.log(`✓ Đã đồng bộ ${roleRows.length} vai trò người dùng.\n`);

    // --- 2. MembershipLevel ➔ HangThanhVien ---
    console.log('⏳ [2/26] Đang đồng bộ MembershipLevel ➔ HangThanhVien...');
    const mls = (await sourceClient.query('SELECT * FROM "MembershipLevel"')).rows;
    const mlRows = mls.map(m => ({
      maHangThanhVien: m.id,
      maCode: m.code,
      tenHang: m.name,
      diemToiThieu: m.minPoints,
      tiLeGiamGia: m.discountPercent,
      moTa: m.description,
      ngayTao: m.createdAt,
      ngayCapNhat: m.updatedAt
    }));
    await batchInsert(targetClient, 'HangThanhVien', ['maHangThanhVien', 'maCode', 'tenHang', 'diemToiThieu', 'tiLeGiamGia', 'moTa', 'ngayTao', 'ngayCapNhat'], mlRows);
    console.log(`✓ Đã đồng bộ ${mlRows.length} hạng thành viên.\n`);

    // --- 3. User ➔ NguoiDung (Strict 3NF: maVaiTro, maHangThanhVien) ---
    console.log('⏳ [3/26] Đang đồng bộ User ➔ NguoiDung...');
    const users = (await sourceClient.query('SELECT * FROM "User"')).rows;
    const userRows = users.map(u => ({
      maNguoiDung: u.id,
      email: u.email,
      matKhau: u.password,
      hoTen: u.name,
      maVaiTro: u.roleId || null,
      soDienThoai: u.phone,
      anhDaiDien: u.avatar,
      ngaySinh: u.birthDate,
      gioiTinh: u.gender,
      diemTichLuy: u.rewardPoints || 0,
      maHangThanhVien: u.membershipLevelId || null,
      ngayTao: u.createdAt,
      ngayCapNhat: u.updatedAt
    }));
    await batchInsert(targetClient, 'NguoiDung', [
      'maNguoiDung', 'email', 'matKhau', 'hoTen', 'maVaiTro', 'soDienThoai',
      'anhDaiDien', 'ngaySinh', 'gioiTinh', 'diemTichLuy', 'maHangThanhVien', 'ngayTao', 'ngayCapNhat'
    ], userRows);
    console.log(`✓ Đã đồng bộ ${userRows.length} tài khoản người dùng.\n`);

    // --- 4. Movie ➔ Phim ---
    console.log('⏳ [4/26] Đang đồng bộ Movie ➔ Phim...');
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

    // --- 5. Genre ➔ TheLoaiPhim ---
    console.log('⏳ [5/26] Đang đồng bộ Genre ➔ TheLoaiPhim...');
    const genres = (await sourceClient.query('SELECT * FROM "Genre"')).rows;
    const genreRows = genres.map(g => ({
      maTheLoai: g.id,
      tenTheLoai: g.name,
      ngayTao: g.createdAt,
      ngayCapNhat: g.updatedAt
    }));
    await batchInsert(targetClient, 'TheLoaiPhim', ['maTheLoai', 'tenTheLoai', 'ngayTao', 'ngayCapNhat'], genreRows);
    console.log(`✓ Đã đồng bộ ${genreRows.length} thể loại phim.\n`);

    // --- 6. MovieGenre ➔ PhimTheLoai ---
    console.log('⏳ [6/26] Đang đồng bộ MovieGenre ➔ PhimTheLoai...');
    const movieGenres = (await sourceClient.query('SELECT * FROM "MovieGenre"')).rows;
    const mgRows = movieGenres.map(mg => ({
      maPhim: mg.movieId,
      maTheLoai: mg.genreId,
      ngayTao: mg.createdAt
    }));
    await batchInsert(targetClient, 'PhimTheLoai', ['maPhim', 'maTheLoai', 'ngayTao'], mgRows);
    console.log(`✓ Đã đồng bộ ${mgRows.length} quan hệ Phim - Thể Loại.\n`);

    // --- 7. Actor ➔ DienVien ---
    console.log('⏳ [7/26] Đang đồng bộ Actor ➔ DienVien...');
    const actors = (await sourceClient.query('SELECT * FROM "Actor"')).rows;
    const actorRows = actors.map(a => ({
      maDienVien: a.id,
      tenDienVien: a.name,
      duongDanAnh: a.avatarUrl,
      ngayTao: a.createdAt,
      ngayCapNhat: a.updatedAt
    }));
    await batchInsert(targetClient, 'DienVien', ['maDienVien', 'tenDienVien', 'duongDanAnh', 'ngayTao', 'ngayCapNhat'], actorRows);
    console.log(`✓ Đã đồng bộ ${actorRows.length} diễn viên điện ảnh.\n`);

    // --- 8. MovieActor ➔ PhimDienVien ---
    console.log('⏳ [8/26] Đang đồng bộ MovieActor ➔ PhimDienVien...');
    const movieActors = (await sourceClient.query('SELECT * FROM "MovieActor"')).rows;
    const maRows = movieActors.map(ma => ({
      maPhim: ma.movieId,
      maDienVien: ma.actorId,
      vaiDien: ma.characterName || null,
      ngayTao: ma.createdAt
    }));
    await batchInsert(targetClient, 'PhimDienVien', ['maPhim', 'maDienVien', 'vaiDien', 'ngayTao'], maRows);
    console.log(`✓ Đã đồng bộ ${maRows.length} quan hệ Phim - Diễn Viên.\n`);

    // --- 9. Cinema ➔ CumRap ---
    console.log('⏳ [9/26] Đang đồng bộ Cinema ➔ CumRap...');
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

    // --- 10. Room ➔ PhongChieu ---
    console.log('⏳ [10/26] Đang đồng bộ Room ➔ PhongChieu...');
    const rooms = (await sourceClient.query('SELECT * FROM "Room"')).rows;
    const roomRows = rooms.map(r => ({
      maPhongChieu: r.id,
      tenPhongChieu: r.name,
      maCumRap: r.cinemaId,
      ngayTao: r.createdAt,
      ngayCapNhat: r.updatedAt
    }));
    await batchInsert(targetClient, 'PhongChieu', ['maPhongChieu', 'tenPhongChieu', 'maCumRap', 'ngayTao', 'ngayCapNhat'], roomRows);
    console.log(`✓ Đã đồng bộ ${roomRows.length} phòng chiếu.\n`);

    // --- 11. ScreenFormat ➔ DinhDangChieu ---
    console.log('⏳ [11/26] Đang đồng bộ ScreenFormat ➔ DinhDangChieu...');
    const sfs = (await sourceClient.query('SELECT * FROM "ScreenFormat"')).rows;
    const sfRows = sfs.map(s => ({
      maDinhDang: s.id,
      maCode: s.code,
      tenDinhDang: s.name,
      moTa: s.description,
      ngayTao: s.createdAt,
      ngayCapNhat: s.updatedAt
    }));
    await batchInsert(targetClient, 'DinhDangChieu', ['maDinhDang', 'maCode', 'tenDinhDang', 'moTa', 'ngayTao', 'ngayCapNhat'], sfRows);
    console.log(`✓ Đã đồng bộ ${sfRows.length} định dạng chiếu.\n`);

    // --- 12. SeatType ➔ LoaiGhe ---
    console.log('⏳ [12/26] Đang đồng bộ SeatType ➔ LoaiGhe...');
    const sts = (await sourceClient.query('SELECT * FROM "SeatType"')).rows;
    const stRows = sts.map(s => ({
      maLoaiGhe: s.id,
      maCode: s.code,
      tenLoaiGhe: s.name,
      phuThu: s.surcharge,
      moTa: s.description,
      ngayTao: s.createdAt,
      ngayCapNhat: s.updatedAt
    }));
    await batchInsert(targetClient, 'LoaiGhe', ['maLoaiGhe', 'maCode', 'tenLoaiGhe', 'phuThu', 'moTa', 'ngayTao', 'ngayCapNhat'], stRows);
    console.log(`✓ Đã đồng bộ ${stRows.length} loại ghế ngồi.\n`);

    // --- 13. Seat ➔ GheNgoi (Strict 3NF: maLoaiGhe) ---
    console.log('⏳ [13/26] Đang đồng bộ Seat ➔ GheNgoi...');
    const seats = (await sourceClient.query('SELECT * FROM "Seat"')).rows;
    const seatRows = seats.map(s => ({
      maGhe: s.id,
      tenGhe: s.name,
      maLoaiGhe: s.typeId,
      maPhongChieu: s.roomId
    }));
    await batchInsert(targetClient, 'GheNgoi', ['maGhe', 'tenGhe', 'maLoaiGhe', 'maPhongChieu'], seatRows, 500);
    console.log(`✓ Đã đồng bộ ${seatRows.length} ghế ngồi.\n`);

    // --- 14. Showtime ➔ SuatChieu (Strict 3NF: maDinhDang) ---
    console.log('⏳ [14/26] Đang đồng bộ Showtime ➔ SuatChieu...');
    const showtimes = (await sourceClient.query('SELECT * FROM "Showtime"')).rows;
    const showtimeRows = showtimes.map(st => ({
      maSuatChieu: st.id,
      maPhim: st.movieId,
      maPhongChieu: st.roomId,
      maDinhDang: st.formatId || null,
      ngonNgu: st.language || 'SUB',
      thoiGianBatDau: st.startTime,
      thoiGianKetThuc: st.endTime,
      ngayTao: st.createdAt,
      ngayCapNhat: st.updatedAt
    }));
    await batchInsert(targetClient, 'SuatChieu', [
      'maSuatChieu', 'maPhim', 'maPhongChieu', 'maDinhDang', 'ngonNgu',
      'thoiGianBatDau', 'thoiGianKetThuc', 'ngayTao', 'ngayCapNhat'
    ], showtimeRows, 400);
    console.log(`✓ Đã đồng bộ ${showtimeRows.length} suất chiếu.\n`);

    // --- 15. PaymentMethod ➔ PhuongThucThanhToan ---
    console.log('⏳ [15/26] Đang đồng bộ PaymentMethod ➔ PhuongThucThanhToan...');
    const pms = (await sourceClient.query('SELECT * FROM "PaymentMethod"')).rows;
    const pmRows = pms.map(p => ({
      maPhuongThuc: p.id,
      maCode: p.code,
      tenPhuongThuc: p.name,
      moTa: p.description,
      ngayTao: p.createdAt,
      ngayCapNhat: p.updatedAt
    }));
    await batchInsert(targetClient, 'PhuongThucThanhToan', ['maPhuongThuc', 'maCode', 'tenPhuongThuc', 'moTa', 'ngayTao', 'ngayCapNhat'], pmRows);
    console.log(`✓ Đã đồng bộ ${pmRows.length} phương thức thanh toán.\n`);

    // --- 16. Promotion ➔ ChuongTrinhKhuyenMai ---
    console.log('⏳ [16/26] Đang đồng bộ Promotion ➔ ChuongTrinhKhuyenMai...');
    const promos = (await sourceClient.query('SELECT * FROM "Promotion"')).rows;
    const promoRows = promos.map(p => ({
      maKhuyenMai: p.id,
      tieuDe: p.title,
      moTa: p.desc,
      danhMuc: p.category,
      nhanNoiBat: p.badge,
      maCode: p.code,
      hanSuDung: p.validUntil,
      dieuKhoan: p.terms,
      duongDanAnhBia: p.coverUrl,
      trangThai: p.status || 'ACTIVE',
      ngayTao: p.createdAt,
      ngayCapNhat: p.updatedAt
    }));
    await batchInsert(targetClient, 'ChuongTrinhKhuyenMai', [
      'maKhuyenMai', 'tieuDe', 'moTa', 'danhMuc', 'nhanNoiBat', 'maCode',
      'hanSuDung', 'dieuKhoan', 'duongDanAnhBia', 'trangThai', 'ngayTao', 'ngayCapNhat'
    ], promoRows);
    console.log(`✓ Đã đồng bộ ${promoRows.length} chương trình khuyến mãi.\n`);

    // --- 17. Voucher ➔ MaGiamGia ---
    console.log('⏳ [17/26] Đang đồng bộ Voucher ➔ MaGiamGia...');
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
      maKhuyenMai: v.promotionId || null,
      ngayTao: v.createdAt,
      ngayCapNhat: v.updatedAt
    }));
    await batchInsert(targetClient, 'MaGiamGia', [
      'maVoucher', 'maCode', 'loaiGiamGia', 'giaTriGiam', 'giaTriDonToiThieu',
      'ngayBatDau', 'ngayKetThuc', 'gioiHanSuDung', 'soLuotDaDung', 'trangThai', 'maKhuyenMai', 'ngayTao', 'ngayCapNhat'
    ], voucherRows);
    console.log(`✓ Đã đồng bộ ${voucherRows.length} mã giảm giá.\n`);

    // --- 18. Booking ➔ DonDatVe (Strict 3NF: maPhuongThuc) ---
    console.log('⏳ [18/26] Đang đồng bộ Booking ➔ DonDatVe...');
    const bookings = (await sourceClient.query('SELECT * FROM "Booking"')).rows;
    const bookingRows = bookings.map(b => ({
      maDonHang: b.id,
      maNguoiDung: b.userId,
      trangThaiDonHang: b.status,
      maPhuongThuc: b.paymentMethodId || null,
      trangThaiThanhToan: b.paymentStatus || 'UNPAID',
      maVoucher: b.voucherId || null,
      soTienGiamGia: b.discountAmount || 0,
      maVeDienTu: b.ticketCode,
      duongDanMaQR: b.qrCodeUrl,
      tongTien: b.total,
      ngayTao: b.createdAt,
      ngayCapNhat: b.updatedAt
    }));
    await batchInsert(targetClient, 'DonDatVe', [
      'maDonHang', 'maNguoiDung', 'trangThaiDonHang', 'maPhuongThuc', 'trangThaiThanhToan',
      'maVoucher', 'soTienGiamGia', 'maVeDienTu', 'duongDanMaQR', 'tongTien', 'ngayTao', 'ngayCapNhat'
    ], bookingRows);
    console.log(`✓ Đã đồng bộ ${bookingRows.length} đơn đặt vé.\n`);

    // --- 19. TicketPrice ➔ BangGiaVe (Strict 3NF: maLoaiGhe, maDinhDang) ---
    console.log('⏳ [19/26] Đang đồng bộ TicketPrice ➔ BangGiaVe...');
    const prices = (await sourceClient.query('SELECT * FROM "TicketPrice"')).rows;
    const priceRows = prices.map(p => ({
      maBangGia: p.id,
      maLoaiGhe: p.seatTypeId || null,
      maDinhDang: p.formatId || null,
      laCuoiTuan: p.isWeekend || false,
      giaVe: p.price,
      ngayTao: p.createdAt,
      ngayCapNhat: p.updatedAt
    }));
    await batchInsert(targetClient, 'BangGiaVe', ['maBangGia', 'maLoaiGhe', 'maDinhDang', 'laCuoiTuan', 'giaVe', 'ngayTao', 'ngayCapNhat'], priceRows);
    console.log(`✓ Đã đồng bộ ${priceRows.length} cấu hình bảng giá vé.\n`);

    // --- 20. BookingDetail ➔ ChiTietDonDatVe ---
    console.log('⏳ [20/26] Đang đồng bộ BookingDetail ➔ ChiTietDonDatVe (Hợp nhất vé xem phim 3NF)...');
    const details = (await sourceClient.query('SELECT * FROM "BookingDetail"')).rows;
    const detailRows = details.map(d => ({
      maChiTietDonHang: d.id,
      maDonHang: d.bookingId,
      maSuatChieu: d.showtimeId,
      maGhe: d.seatId,
      maBangGia: d.ticketPriceId || null,
      giaVe: d.price,
      maVeDienTu: d.ticketCode || null,
      trangThaiVe: d.status || 'VALID',
      ngayTao: d.createdAt,
      ngayCapNhat: d.updatedAt
    }));
    await batchInsert(targetClient, 'ChiTietDonDatVe', [
      'maChiTietDonHang', 'maDonHang', 'maSuatChieu', 'maGhe', 'maBangGia', 'giaVe', 'maVeDienTu', 'trangThaiVe', 'ngayTao', 'ngayCapNhat'
    ], detailRows);
    console.log(`✓ Đã đồng bộ ${detailRows.length} chi tiết đơn đặt vé (vé xem phim).\n`);

    // --- 21. Service ➔ DichVu ---
    console.log('⏳ [21/26] Đang đồng bộ Service ➔ DichVu...');
    const services = (await sourceClient.query('SELECT * FROM "Service"')).rows;
    const serviceRows = services.map(s => ({
      maDichVu: s.id,
      tenDichVu: s.name,
      moTa: s.description,
      giaBan: s.price,
      duongDanHinhAnh: s.imageUrl,
      trangThai: s.status || 'ACTIVE',
      ngayTao: s.createdAt,
      ngayCapNhat: s.updatedAt
    }));
    await batchInsert(targetClient, 'DichVu', ['maDichVu', 'tenDichVu', 'moTa', 'giaBan', 'duongDanHinhAnh', 'trangThai', 'ngayTao', 'ngayCapNhat'], serviceRows);
    console.log(`✓ Đã đồng bộ ${serviceRows.length} dịch vụ tiện ích / bắp nước.\n`);

    // --- 22. BookingService ➔ ChiTietDichVuDonHang (Strict 3NF: maDichVu) ---
    console.log('⏳ [22/26] Đang đồng bộ BookingService ➔ ChiTietDichVuDonHang...');
    const bsList = (await sourceClient.query('SELECT * FROM "BookingService"')).rows;
    const bsRows = bsList.map(bs => ({
      maChiTietCombo: bs.id,
      maDonHang: bs.bookingId,
      maDichVu: bs.serviceId,
      soLuong: bs.quantity,
      donGia: bs.price,
      ngayTao: bs.createdAt,
      ngayCapNhat: bs.updatedAt
    }));
    await batchInsert(targetClient, 'ChiTietDichVuDonHang', ['maChiTietCombo', 'maDonHang', 'maDichVu', 'soLuong', 'donGia', 'ngayTao', 'ngayCapNhat'], bsRows);
    console.log(`✓ Đã đồng bộ ${bsRows.length} chi tiết dịch vụ theo đơn.\n`);

    // --- 23. Review ➔ DanhGiaBinhLuan ---
    console.log('⏳ [23/26] Đang đồng bộ Review ➔ DanhGiaBinhLuan...');
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
    await batchInsert(targetClient, 'DanhGiaBinhLuan', ['maDanhGia', 'maNguoiDung', 'maPhim', 'soSaoDanhGia', 'noiDungBinhLuan', 'ngayTao', 'ngayCapNhat'], reviewRows);
    console.log(`✓ Đã đồng bộ ${reviewRows.length} bình luận đánh giá.\n`);

    // --- 24. SeatHold ➔ KhoaGiuGheTamThoi ---
    console.log('⏳ [24/26] Đang đồng bộ SeatHold ➔ KhoaGiuGheTamThoi...');
    const seatHolds = (await sourceClient.query('SELECT * FROM "SeatHold"')).rows;
    const shRows = seatHolds.map(sh => ({
      maGiuGhe: sh.id,
      maSuatChieu: sh.showtimeId,
      maGhe: sh.seatId,
      maNguoiDung: sh.userId || null,
      thoiGianHetHan: sh.expiresAt,
      ngayTao: sh.createdAt
    }));
    await batchInsert(targetClient, 'KhoaGiuGheTamThoi', ['maGiuGhe', 'maSuatChieu', 'maGhe', 'maNguoiDung', 'thoiGianHetHan', 'ngayTao'], shRows);
    console.log(`✓ Đã đồng bộ ${shRows.length} bản ghi giữ ghế tạm thời.\n`);

    // --- 25. Article ➔ BaiVietTinTuc (Strict 3NF: maTacGia) ---
    console.log('⏳ [25/26] Đang đồng bộ Article ➔ BaiVietTinTuc...');
    const articles = (await sourceClient.query('SELECT * FROM "Article"')).rows;
    const articleRows = articles.map(b => ({
      maBaiViet: b.id,
      tieuDe: b.title,
      tomTat: b.summary,
      noiDung: b.content,
      danhMuc: b.category,
      maTacGia: b.authorId || null,
      maPhim: b.movieId || null,
      ngayDang: b.publishDate,
      thoiGianDoc: b.readingTime || '5 phút đọc',
      duongDanAnh: b.imageUrl,
      luotXem: b.views || 0,
      trangThai: b.status || 'ACTIVE',
      ngayTao: b.createdAt,
      ngayCapNhat: b.updatedAt
    }));
    await batchInsert(targetClient, 'BaiVietTinTuc', [
      'maBaiViet', 'tieuDe', 'tomTat', 'noiDung', 'danhMuc',
      'maTacGia', 'maPhim', 'ngayDang', 'thoiGianDoc', 'duongDanAnh', 'luotXem', 'trangThai', 'ngayTao', 'ngayCapNhat'
    ], articleRows);
    console.log(`✓ Đã đồng bộ ${articleRows.length} bài viết tin tức & blog điện ảnh.\n`);

    // --- 26. GroupBooking ➔ DatVeNhom (Strict 3NF: maCumRap) ---
    console.log('⏳ [26/26] Đang đồng bộ GroupBooking ➔ DatVeNhom...');
    const groupBookings = (await sourceClient.query('SELECT * FROM "GroupBooking"')).rows;
    const groupBookingRows = groupBookings.map(gb => ({
      maDatVeNhom: gb.id,
      hoTenLienHe: gb.contactName,
      soDienThoai: gb.phone,
      email: gb.email,
      tenCongTy: gb.companyName,
      maCumRap: gb.cinemaId,
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
      'maCumRap', 'loaiDichVu', 'soLuongKhach', 'ngayDuKien',
      'ghiChu', 'trangThai', 'ngayTao', 'ngayCapNhat'
    ], groupBookingRows);
    console.log(`✓ Đã đồng bộ ${groupBookingRows.length} yêu cầu đặt vé nhóm & sự kiện.\n`);

    // =========================================================================
    // 3. ĐỐI SOÁT & KIỂM TRA SỐ LƯỢNG BẢN GHI (VERIFICATION)
    // =========================================================================
    console.log('========================================================================');
    console.log('🔍 BẢNG ĐỐI SOÁT CHI TIẾT SỐ LƯỢNG BẢN GHI GIỮA 2 DATABASE (26 BẢNG 3NF)');
    console.log('========================================================================');

    const tableMappings = [
      { src: 'Role', tgt: 'VaiTro', desc: 'Bảng vai trò tài khoản (Tách chuẩn hóa 3NF)' },
      { src: 'MembershipLevel', tgt: 'HangThanhVien', desc: 'Bảng hạng thành viên Star Club (Tách chuẩn hóa 3NF)' },
      { src: 'User', tgt: 'NguoiDung', desc: 'Tài khoản người dùng & hội viên' },
      { src: 'Movie', tgt: 'Phim', desc: 'Danh mục phim điện ảnh' },
      { src: 'Genre', tgt: 'TheLoaiPhim', desc: 'Thể loại phim điện ảnh' },
      { src: 'MovieGenre', tgt: 'PhimTheLoai', desc: 'Quan hệ Phim - Thể Loại (N-N)' },
      { src: 'Actor', tgt: 'DienVien', desc: 'Diễn viên điện ảnh' },
      { src: 'MovieActor', tgt: 'PhimDienVien', desc: 'Quan hệ Phim - Diễn Viên (N-N)' },
      { src: 'Cinema', tgt: 'CumRap', desc: 'Cụm rạp chiếu phim' },
      { src: 'Room', tgt: 'PhongChieu', desc: 'Phòng chiếu phim' },
      { src: 'ScreenFormat', tgt: 'DinhDangChieu', desc: 'Định dạng chiếu (2D/3D/IMAX)' },
      { src: 'SeatType', tgt: 'LoaiGhe', desc: 'Loại ghế ngồi (Standard/VIP/Sweetbox)' },
      { src: 'Seat', tgt: 'GheNgoi', desc: 'Ma trận ghế ngồi' },
      { src: 'Showtime', tgt: 'SuatChieu', desc: 'Suất chiếu / Lịch chiếu' },
      { src: 'PaymentMethod', tgt: 'PhuongThucThanhToan', desc: 'Phương thức thanh toán (VNPAY/MOMO/CASH)' },
      { src: 'Promotion', tgt: 'ChuongTrinhKhuyenMai', desc: 'Chương trình khuyến mãi' },
      { src: 'Voucher', tgt: 'MaGiamGia', desc: 'Mã giảm giá (Voucher)' },
      { src: 'Booking', tgt: 'DonDatVe', desc: 'Đơn đặt vé / Hóa đơn' },
      { src: 'BookingDetail', tgt: 'ChiTietDonDatVe', desc: 'Chi tiết đơn đặt vé & vé xem phim (Chuẩn UTE & Galaxy/CGV)' },
      { src: 'TicketPrice', tgt: 'BangGiaVe', desc: 'Cấu hình bảng giá vé' },
      { src: 'Service', tgt: 'DichVu', desc: 'Dịch vụ rạp / Bắp nước (Đổi tên theo GVHD)' },
      { src: 'BookingService', tgt: 'ChiTietDichVuDonHang', desc: 'Chi tiết dịch vụ theo đơn' },
      { src: 'Review', tgt: 'DanhGiaBinhLuan', desc: 'Đánh giá & Bình luận phim' },
      { src: 'SeatHold', tgt: 'KhoaGiuGheTamThoi', desc: 'Khóa giữ ghế tạm thời' },
      { src: 'Article', tgt: 'BaiVietTinTuc', desc: 'Bài viết tin tức & Góc Điện Ảnh' },
      { src: 'GroupBooking', tgt: 'DatVeNhom', desc: 'Đặt vé nhóm & Sự kiện' }
    ];

    let allMatch = true;
    for (const m of tableMappings) {
      const srcCount = parseInt((await sourceClient.query(`SELECT COUNT(*) FROM "${m.src}"`)).rows[0].count, 10);
      const tgtCount = parseInt((await targetClient.query(`SELECT COUNT(*) FROM "${m.tgt}"`)).rows[0].count, 10);
      const isOk = srcCount === tgtCount;
      if (!isOk) allMatch = false;

      const statusIcon = isOk ? '✅ KHỚP 100%' : '❌ LỆCH DỮ LIỆU';
      console.log(`- ${m.src.padEnd(16)} ➔ ${m.tgt.padEnd(22)} | Nguồn: ${String(srcCount).padStart(5)} | Đích: ${String(tgtCount).padStart(5)} | ${statusIcon} (${m.desc})`);
    }

    console.log('========================================================================');
    if (allMatch) {
      console.log('🎉 TẤT CẢ 26/26 BẢNG ĐÃ ĐƯỢC ĐỒNG BỘ CHÍNH XÁC 100% SANG aeon_cinema_db_vi!');
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
