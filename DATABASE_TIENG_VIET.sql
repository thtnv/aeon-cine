-- =============================================================================
-- HỆ THỐNG CƠ SỞ DỮ LIỆU ĐẶT VÉ PHIM TRỰC TUYẾN AEON CINE (BẢN DỊCH TIẾNG VIỆT)
-- Phục vụ kiểm tra đồ án tốt nghiệp - Sinh viên thực hiện: Nguyễn Văn Viên
-- =============================================================================

-- 1. BẢNG NGƯỜI DÙNG / TÀI KHOẢN
CREATE TABLE IF NOT EXISTS "NguoiDung" (
    "maNguoiDung" VARCHAR(36) PRIMARY KEY,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "matKhau" VARCHAR(255) NOT NULL,
    "hoTen" VARCHAR(255) NOT NULL,
    "vaiTro" VARCHAR(20) DEFAULT 'USER' NOT NULL, -- USER (Khách hàng), ADMIN (Quản trị), STAFF (Nhân viên)
    "soDienThoai" VARCHAR(20),
    "anhDaiDien" TEXT,
    "ngaySinh" VARCHAR(20),
    "gioiTinh" VARCHAR(10),
    "diemTichLuy" INT DEFAULT 0 NOT NULL,
    "hangThanhVien" VARCHAR(20) DEFAULT 'STAR' NOT NULL, -- STAR, GSTAR, XSTAR
    "ngayTao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ngayCapNhat" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE "NguoiDung" IS 'Bảng lưu trữ tài khoản người dùng, nhân viên và quản trị viên';
COMMENT ON COLUMN "NguoiDung"."maNguoiDung" IS 'Mã định danh người dùng (Khóa chính UUID)';
COMMENT ON COLUMN "NguoiDung"."diemTichLuy" IS 'Điểm thưởng thành viên tích lũy từ các đơn hàng';
COMMENT ON COLUMN "NguoiDung"."hangThanhVien" IS 'Hạng thẻ thành viên (STAR, GSTAR, XSTAR)';

-- 2. BẢNG PHIM ĐIỆN ẢNH
CREATE TABLE IF NOT EXISTS "Phim" (
    "maPhim" VARCHAR(36) PRIMARY KEY,
    "tenPhim" VARCHAR(255) NOT NULL,
    "moTa" TEXT NOT NULL,
    "theLoai" VARCHAR(255) NOT NULL,
    "thoiLuong" INT NOT NULL, -- Thời lượng tính theo phút
    "duongDanTrailer" TEXT,
    "duongDanPoster" TEXT,
    "trangThai" VARCHAR(50) NOT NULL, -- NOW_SHOWING (Đang chiếu), COMING_SOON (Sắp chiếu)
    "ngayKhoiChieu" VARCHAR(20),
    "phanLoaiDoTuoi" VARCHAR(10), -- P, K, T13, T16, T18
    "danhGiaTrungBinh" FLOAT,
    "tongSoLuotDanhGia" INT,
    "quocGia" VARCHAR(100),
    "nhaSanXuat" VARCHAR(255),
    "daoDien" VARCHAR(255),
    "dienVien" TEXT,
    "ngayTao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ngayCapNhat" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE "Phim" IS 'Bảng danh mục các bộ phim điện ảnh đang và sắp chiếu tại rạp';

-- 3. BẢNG CỤM RẠP CHIẾU PHIM
CREATE TABLE IF NOT EXISTS "CumRap" (
    "maCumRap" VARCHAR(36) PRIMARY KEY,
    "tenCumRap" VARCHAR(255) NOT NULL,
    "khuVuc" VARCHAR(255) NOT NULL,
    "diaChi" TEXT,
    "thanhPho" VARCHAR(100) DEFAULT 'TP.HCM' NOT NULL,
    "soDienThoai" VARCHAR(20),
    "duongDanBanDo" TEXT,
    "duongDanChiDuong" TEXT,
    "tienIch" TEXT[], -- Danh sách tiện ích (Laser 4K, Sweetbox, F&B...)
    "ngayTao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ngayCapNhat" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE "CumRap" IS 'Bảng danh sách cụm rạp chiếu phim AEON CINE';

-- 4. BẢNG PHÒNG CHIẾU PHIM
CREATE TABLE IF NOT EXISTS "PhongChieu" (
    "maPhongChieu" VARCHAR(36) PRIMARY KEY,
    "tenPhongChieu" VARCHAR(100) NOT NULL,
    "maCumRap" VARCHAR(36) NOT NULL REFERENCES "CumRap"("maCumRap") ON DELETE CASCADE,
    "ngayTao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ngayCapNhat" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE "PhongChieu" IS 'Bảng phòng chiếu trực thuộc từng cụm rạp';

-- 5. BẢNG GHẾ NGỒI
CREATE TABLE IF NOT EXISTS "GheNgoi" (
    "maGhe" VARCHAR(36) PRIMARY KEY,
    "tenGhe" VARCHAR(20) NOT NULL, -- Vị trí ghế (Ví dụ: A1, B2, C5)
    "loaiGhe" VARCHAR(20) DEFAULT 'STANDARD' NOT NULL, -- STANDARD (Thường), VIP, SWEETBOX (Đôi)
    "maPhongChieu" VARCHAR(36) NOT NULL REFERENCES "PhongChieu"("maPhongChieu") ON DELETE CASCADE
);

COMMENT ON TABLE "GheNgoi" IS 'Bảng quản lý ma trận ghế ngồi trong phòng chiếu';

-- 6. BẢNG SUẤT CHIẾU / LỊCH CHIẾU
CREATE TABLE IF NOT EXISTS "SuatChieu" (
    "maSuatChieu" VARCHAR(36) PRIMARY KEY,
    "maPhim" VARCHAR(36) NOT NULL REFERENCES "Phim"("maPhim") ON DELETE CASCADE,
    "maPhongChieu" VARCHAR(36) NOT NULL REFERENCES "PhongChieu"("maPhongChieu") ON DELETE CASCADE,
    "dinhDang" VARCHAR(20) DEFAULT '2D' NOT NULL, -- 2D, 3D, IMAX
    "ngonNgu" VARCHAR(20) DEFAULT 'SUB' NOT NULL, -- SUB (Phụ đề), DUB (Lồng tiếng)
    "thoiGianBatDau" TIMESTAMP NOT NULL,
    "thoiGianKetThuc" TIMESTAMP NOT NULL,
    "ngayTao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ngayCapNhat" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE "SuatChieu" IS 'Bảng lịch chiếu chi tiết của từng phim tại phòng chiếu';

-- 7. BẢNG ĐƠN ĐẶT VÉ / HÓA ĐƠN
CREATE TABLE IF NOT EXISTS "DonDatVe" (
    "maDonHang" VARCHAR(36) PRIMARY KEY,
    "maNguoiDung" VARCHAR(36) NOT NULL REFERENCES "NguoiDung"("maNguoiDung") ON DELETE CASCADE,
    "trangThaiDonHang" VARCHAR(20) NOT NULL, -- PENDING (Chờ), COMPLETED (Đã xong), CANCELLED (Hủy)
    "phuongThucThanhToan" VARCHAR(50), -- VNPAY, MOMO, CASH
    "trangThaiThanhToan" VARCHAR(20) DEFAULT 'UNPAID' NOT NULL, -- UNPAID, PAID, FAILED
    "maVoucher" VARCHAR(50),
    "soTienGiamGia" FLOAT DEFAULT 0 NOT NULL,
    "maVeDienTu" VARCHAR(100) UNIQUE, -- Mã vé sinh tự động
    "duongDanMaQR" TEXT, -- Đường dẫn hình ảnh QR Code soát vé
    "tongTien" FLOAT NOT NULL,
    "ngayTao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ngayCapNhat" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE "DonDatVe" IS 'Bảng hóa đơn đặt vé và thanh toán của khách hàng';

-- 8. BẢNG CHI TIẾT VÉ XEM PHIM
CREATE TABLE IF NOT EXISTS "VeXemPhim" (
    "maVe" VARCHAR(36) PRIMARY KEY,
    "maDonHang" VARCHAR(36) NOT NULL REFERENCES "DonDatVe"("maDonHang") ON DELETE CASCADE,
    "maSuatChieu" VARCHAR(36) NOT NULL REFERENCES "SuatChieu"("maSuatChieu") ON DELETE CASCADE,
    "maGhe" VARCHAR(36) NOT NULL REFERENCES "GheNgoi"("maGhe") ON DELETE CASCADE,
    "giaVe" FLOAT NOT NULL,
    "ngayTao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ngayCapNhat" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE "VeXemPhim" IS 'Bảng chi tiết vé từng vị trí ghế theo đơn đặt hàng';

-- 9. BẢNG COMBO BẮP NƯỚC (F&B)
CREATE TABLE IF NOT EXISTS "ComboBapNuoc" (
    "maCombo" VARCHAR(36) PRIMARY KEY,
    "tenCombo" VARCHAR(255) NOT NULL,
    "moTa" TEXT,
    "giaBan" FLOAT NOT NULL,
    "duongDanHinhAnh" TEXT,
    "trangThai" VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
    "ngayTao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ngayCapNhat" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE "ComboBapNuoc" IS 'Bảng thực đơn các gói bắp nước combo bán kèm vé';

-- 10. BẢNG CHI TIẾT BẮP NƯỚC ĐƠN HÀNG
CREATE TABLE IF NOT EXISTS "ChiTietComboDonHang" (
    "maChiTietCombo" VARCHAR(36) PRIMARY KEY,
    "maDonHang" VARCHAR(36) NOT NULL REFERENCES "DonDatVe"("maDonHang") ON DELETE CASCADE,
    "maCombo" VARCHAR(36) NOT NULL REFERENCES "ComboBapNuoc"("maCombo") ON DELETE CASCADE,
    "soLuong" INT NOT NULL,
    "donGia" FLOAT NOT NULL,
    "ngayTao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ngayCapNhat" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE "ChiTietComboDonHang" IS 'Bảng chi tiết các gói bắp nước khách chọn theo đơn hàng';

-- 11. BẢNG MÃ GIẢM GIÁ (VOUCHER)
CREATE TABLE IF NOT EXISTS "MaGiamGia" (
    "maVoucher" VARCHAR(36) PRIMARY KEY,
    "maCode" VARCHAR(50) UNIQUE NOT NULL, -- Mã nhập (Ví dụ: AEON50K, KM20)
    "loaiGiamGia" VARCHAR(20) NOT NULL, -- PERCENTAGE (% giảm), FIXED_AMOUNT (Số tiền giảm cố định)
    "giaTriGiam" FLOAT NOT NULL,
    "giaTriDonToiThieu" FLOAT DEFAULT 0 NOT NULL,
    "ngayBatDau" TIMESTAMP NOT NULL,
    "ngayKetThuc" TIMESTAMP NOT NULL,
    "gioiHanSuDung" INT NOT NULL,
    "soLuotDaDung" INT DEFAULT 0 NOT NULL,
    "trangThai" VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
    "ngayTao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ngayCapNhat" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE "MaGiamGia" IS 'Bảng quản lý chương trình khuyến mãi voucher giảm giá';

-- 12. BẢNG ĐÁNH GIÁ & BÌNH LUẬN PHIM
CREATE TABLE IF NOT EXISTS "DanhGiaBinhLuan" (
    "maDanhGia" VARCHAR(36) PRIMARY KEY,
    "maNguoiDung" VARCHAR(36) NOT NULL REFERENCES "NguoiDung"("maNguoiDung") ON DELETE CASCADE,
    "maPhim" VARCHAR(36) NOT NULL REFERENCES "Phim"("maPhim") ON DELETE CASCADE,
    "soSaoDanhGia" INT NOT NULL, -- Chấm điểm 1 đến 10 sao
    "noiDungBinhLuan" TEXT NOT NULL,
    "ngayTao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ngayCapNhat" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE "DanhGiaBinhLuan" IS 'Bảng phản hồi, chấm điểm sao và bình luận phim của khách hàng';

-- 13. BẢNG KHÓA GIỮ GHẾ THỜI GIAN THỰC
CREATE TABLE IF NOT EXISTS "KhoaGiuGheTamThoi" (
    "maGiuGhe" VARCHAR(36) PRIMARY KEY,
    "maSuatChieu" VARCHAR(36) NOT NULL REFERENCES "SuatChieu"("maSuatChieu") ON DELETE CASCADE,
    "maGhe" VARCHAR(36) NOT NULL,
    "maNguoiDung" VARCHAR(36) NOT NULL,
    "thoiGianHetHan" TIMESTAMP NOT NULL, -- Hết hạn sau 10 phút
    "ngayTao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE "KhoaGiuGheTamThoi" IS 'Bảng giữ ghế 10 phút thời gian thực tránh trùng ghế giữa nhiều người dùng';

-- 14. BẢNG CẤU HÌNH BẢNG GIÁ VÉ
CREATE TABLE IF NOT EXISTS "BangGiaVe" (
    "maBangGia" VARCHAR(36) PRIMARY KEY,
    "loaiGhe" VARCHAR(20) NOT NULL, -- STANDARD, VIP, SWEETBOX
    "dinhDang" VARCHAR(20) NOT NULL, -- 2D, 3D, IMAX
    "laCuoiTuan" BOOLEAN DEFAULT FALSE NOT NULL,
    "giaVe" FLOAT NOT NULL,
    "ngayTao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ngayCapNhat" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE "BangGiaVe" IS 'Bảng cấu hình giá vé áp dụng cho từng loại ghế và định dạng chiếu';

-- 15. BẢNG THỂ LOẠI PHIM
CREATE TABLE IF NOT EXISTS "TheLoaiPhim" (
    "maTheLoai" VARCHAR(36) PRIMARY KEY,
    "tenTheLoai" VARCHAR(100) UNIQUE NOT NULL,
    "ngayTao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ngayCapNhat" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE "TheLoaiPhim" IS 'Bảng danh mục thể loại phim';

-- 16. BẢNG DIỄN VIÊN
CREATE TABLE IF NOT EXISTS "DienVien" (
    "maDienVien" VARCHAR(36) PRIMARY KEY,
    "tenDienVien" VARCHAR(255) UNIQUE NOT NULL,
    "duongDanAnh" TEXT,
    "ngayTao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ngayCapNhat" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE "DienVien" IS 'Bảng danh mục diễn viên điện ảnh';

-- 17. BẢNG CHƯƠNG TRÌNH KHUYẾN MÃI
CREATE TABLE IF NOT EXISTS "ChuongTrinhKhuyenMai" (
    "maKhuyenMai" VARCHAR(36) PRIMARY KEY,
    "tieuDe" VARCHAR(255) NOT NULL,
    "moTa" TEXT NOT NULL,
    "danhMuc" VARCHAR(50) NOT NULL, -- MEMBER, PARTNER, STUDENT
    "nhanNoiBat" VARCHAR(50),
    "maCode" VARCHAR(50),
    "hanSuDung" VARCHAR(50) NOT NULL,
    "dieuKhoan" TEXT NOT NULL,
    "duongDanAnhBia" TEXT,
    "loaiIcon" VARCHAR(50) DEFAULT 'ticket' NOT NULL,
    "trangThai" VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
    "ngayTao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ngayCapNhat" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE "ChuongTrinhKhuyenMai" IS 'Bảng các chương trình ưu đãi, sự kiện của rạp phim';

-- 18. BẢNG BÀI VIẾT GÓC ĐIỆN ẢNH
CREATE TABLE IF NOT EXISTS "BaiVietTinTuc" (
    "maBaiViet" VARCHAR(36) PRIMARY KEY,
    "tieuDe" VARCHAR(255) NOT NULL,
    "tomTat" TEXT NOT NULL,
    "noiDung" TEXT NOT NULL,
    "danhMuc" VARCHAR(50) NOT NULL, -- Review Phim, Tin Điện Ảnh, Phim Sắp Chiếu
    "tacGia" VARCHAR(100) DEFAULT 'Aeon Cine Editor' NOT NULL,
    "ngayDang" VARCHAR(50) NOT NULL,
    "thoiGianDoc" VARCHAR(50) DEFAULT '5 phút đọc' NOT NULL,
    "duongDanAnh" TEXT,
    "luotXem" INT DEFAULT 0 NOT NULL,
    "trangThai" VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
    "ngayTao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ngayCapNhat" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE "BaiVietTinTuc" IS 'Bảng các bài viết tin tức, review phim trong mục Góc Điện Ảnh';
