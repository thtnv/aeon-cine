# TỪ ĐIỂN CƠ SỞ DỮ LIỆU HỆ THỐNG ĐẶT VÉ PHIM AEON CINE (BẢN DỊCH TIẾNG VIỆT)

**Đồ án tốt nghiệp:** Xây dựng hệ thống Website đặt vé xem phim trực tuyến tích hợp công nghệ AI tại rạp phim AEON MALL  
**Sinh viên thực hiện:** Nguyễn Văn Viên  
**Mã sinh viên:** 22115053122148 | **Lớp:** 22T1 | **GVHD:** ThS. Nguyễn Văn Phát  

---

## TỔNG QUAN HỆ THỐNG CƠ SỞ DỮ LIỆU (18 BẢNG DỮ LIỆU)

1. **NguoiDung (User)**: Lưu trữ tài khoản khách hàng, nhân viên soát vé và quản trị viên.
2. **Phim (Movie)**: Lưu trữ danh mục phim điện ảnh, thông tin chi tiết, poster, trailer và độ tuổi.
3. **CumRap (Cinema)**: Danh sách hệ thống các cụm rạp chiếu phim AEON CINE.
4. **PhongChieu (Room)**: Danh sách phòng chiếu trực thuộc từng cụm rạp.
5. **GheNgoi (Seat)**: Ma trận ghế ngồi trong phòng chiếu (Ghế Thường, VIP, Đôi Sweetbox).
6. **SuatChieu (Showtime)**: Lịch chiếu chi tiết của từng phim tại các phòng chiếu.
7. **DonDatVe (Booking)**: Hóa đơn đặt vé, trạng thái thanh toán và mã QR Code soát vé.
8. **VeXemPhim (Ticket)**: Chi tiết vé xem phim cho từng ghế theo đơn đặt hàng.
9. **ComboBapNuoc (FoodCombo)**: Thực đơn các gói bắp nước bán kèm.
10. **ChiTietComboDonHang (BookingFood)**: Chi tiết các gói bắp nước chọn theo đơn hàng.
11. **MaGiamGia (Voucher)**: Mã khuyến mãi giảm giá cho đơn đặt vé.
12. **DanhGiaBinhLuan (Review)**: Chấm điểm sao và bình luận phim của khán giả.
13. **KhoaGiuGheTamThoi (SeatHold)**: Quản lý giữ ghế 10 phút thời gian thực tránh trùng ghế.
14. **BangGiaVe (PriceConfig)**: Cấu hình bảng giá vé theo loại ghế và định dạng 2D/3D/IMAX.
15. **TheLoaiPhim (Genre)**: Danh mục thể loại phim.
16. **DienVien (Actor)**: Danh mục thông tin diễn viên.
17. **ChuongTrinhKhuyenMai (Promotion)**: Danh sách chương trình ưu đãi, sự kiện của rạp.
18. **BaiVietTinTuc (Blog)**: Các bài viết review phim, tin tức trong mục Góc Điện Ảnh.

---

## CHI TIẾT CẤU TRÚC CÁC BẢNG DỮ LIỆU

### 1. Bảng `NguoiDung` (Tài Khoản & Người Dùng)
| Tên Trường (Tiếng Việt) | Tên Trường (Tiếng Anh) | Kiểu Dữ Liệu | Khóa | Diễn Giải Chi Tiết |
| :--- | :--- | :--- | :---: | :--- |
| **maNguoiDung** | `id` | VARCHAR(36) | **PK** | Mã định danh người dùng (Chuỗi UUID) |
| **email** | `email` | VARCHAR(255) | **UQ** | Địa chỉ Email đăng nhập (Duy nhất) |
| **matKhau** | `password` | VARCHAR(255) | | Mật khẩu đã được mã hóa Bcrypt |
| **hoTen** | `name` | VARCHAR(255) | | Họ và tên người dùng |
| **vaiTro** | `role` | ENUM | | Vai trò: `USER` (Khách), `STAFF` (Nhân viên), `ADMIN` (Quản trị) |
| **soDienThoai** | `phone` | VARCHAR(20) | | Số điện thoại liên hệ |
| **anhDaiDien** | `avatar` | TEXT | | Đường dẫn ảnh đại diện |
| **ngaySinh** | `birthDate` | VARCHAR(20) | | Ngày tháng năm sinh |
| **gioiTinh** | `gender` | VARCHAR(10) | | Giới tính (Nam / Nữ) |
| **diemTichLuy** | `rewardPoints` | INT | | Điểm thưởng tích lũy (Mặc định 0) |
| **hangThanhVien** | `membershipLevel` | VARCHAR(20) | | Hạng thẻ: `STAR`, `GSTAR`, `XSTAR` |
| **ngayTao** | `createdAt` | TIMESTAMP | | Thời gian tạo tài khoản |
| **ngayCapNhat** | `updatedAt` | TIMESTAMP | | Thời gian cập nhật thông tin gần nhất |

---

### 2. Bảng `Phim` (Danh Mục Phim Điện Ảnh)
| Tên Trường (Tiếng Việt) | Tên Trường (Tiếng Anh) | Kiểu Dữ Liệu | Khóa | Diễn Giải Chi Tiết |
| :--- | :--- | :--- | :---: | :--- |
| **maPhim** | `id` | VARCHAR(36) | **PK** | Mã định danh bộ phim (UUID) |
| **tenPhim** | `title` | VARCHAR(255) | | Tên phim điện ảnh |
| **moTa** | `description` | TEXT | | Tóm tắt nội dung kịch bản phim |
| **theLoai** | `genre` | VARCHAR(255) | | Thể loại phim (Hành động, Tình cảm...) |
| **thoiLuong** | `duration` | INT | | Thời lượng chiếu (phút) |
| **duongDanTrailer** | `trailerUrl` | TEXT | | Link nhúng xem Trailer YouTube |
| **duongDanPoster** | `posterUrl` | TEXT | | Link ảnh Poster phim |
| **trangThai** | `status` | VARCHAR(50) | | Trạng thái: `NOW_SHOWING`, `COMING_SOON` |
| **ngayKhoiChieu** | `releaseDate` | VARCHAR(20) | | Ngày chính thức công chiếu tại rạp |
| **phanLoaiDoTuoi** | `ageRating` | VARCHAR(10) | | Phân loại độ tuổi: `P`, `K`, `T13`, `T16`, `T18` |
| **danhGiaTrungBinh** | `rating` | FLOAT | | Điểm chấm trung bình (Ví dụ: 8.8) |
| **tongSoLuotDanhGia**| `votes` | INT | | Tổng số lượt khán giả đánh giá |
| **quocGia** | `country` | VARCHAR(100) | | Quốc gia sản xuất |
| **daoDien** | `director` | VARCHAR(255) | | Đạo diễn bộ phim |
| **dienVien** | `actors` | TEXT | | Danh sách các diễn viên chính |

---

### 3. Bảng `CumRap` (Hệ Thống Cụm Rạp)
| Tên Trường (Tiếng Việt) | Tên Trường (Tiếng Anh) | Kiểu Dữ Liệu | Khóa | Diễn Giải Chi Tiết |
| :--- | :--- | :--- | :---: | :--- |
| **maCumRap** | `id` | VARCHAR(36) | **PK** | Mã định danh cụm rạp |
| **tenCumRap** | `name` | VARCHAR(255) | | Tên cụm rạp (Ví dụ: Aeon Cine Tân Phú) |
| **khuVuc** | `location` | VARCHAR(255) | | Tên trung tâm thương mại AEON MALL |
| **diaChi** | `address` | TEXT | | Địa chỉ chi tiết cụm rạp |
| **thanhPho** | `city` | VARCHAR(100) | | Tỉnh / Thành phố |
| **soDienThoai** | `phone` | VARCHAR(20) | | Hotline liên hệ của cụm rạp |
| **tienIch** | `amenities` | ARRAY(TEXT) | | Tiện ích rạp (Laser 4K, Sweetbox, F&B...) |

---

### 4. Bảng `PhongChieu` (Phòng Chiếu Phim)
| Tên Trường (Tiếng Việt) | Tên Trường (Tiếng Anh) | Kiểu Dữ Liệu | Khóa | Diễn Giải Chi Tiết |
| :--- | :--- | :--- | :---: | :--- |
| **maPhongChieu** | `id` | VARCHAR(36) | **PK** | Mã định danh phòng chiếu |
| **tenPhongChieu** | `name` | VARCHAR(100) | | Tên phòng chiếu (Phòng 1, Cinema 2...) |
| **maCumRap** | `cinemaId` | VARCHAR(36) | **FK** | Khóa ngoại liên kết bảng `CumRap` |

---

### 5. Bảng `GheNgoi` (Ma Trận Ghế Ngồi)
| Tên Trường (Tiếng Việt) | Tên Trường (Tiếng Anh) | Kiểu Dữ Liệu | Khóa | Diễn Giải Chi Tiết |
| :--- | :--- | :--- | :---: | :--- |
| **maGhe** | `id` | VARCHAR(36) | **PK** | Mã định danh ghế ngồi |
| **tenGhe** | `name` | VARCHAR(20) | | Ký hiệu ghế (Ví dụ: A1, B5, C10, S1) |
| **loaiGhe** | `type` | ENUM | | Loại ghế: `STANDARD` (Thường), `VIP`, `SWEETBOX` (Đôi) |
| **maPhongChieu** | `roomId` | VARCHAR(36) | **FK** | Khóa ngoại liên kết bảng `PhongChieu` |

---

### 6. Bảng `SuatChieu` (Lịch Chiếu Phim)
| Tên Trường (Tiếng Việt) | Tên Trường (Tiếng Anh) | Kiểu Dữ Liệu | Khóa | Diễn Giải Chi Tiết |
| :--- | :--- | :--- | :---: | :--- |
| **maSuatChieu** | `id` | VARCHAR(36) | **PK** | Mã định danh suất chiếu |
| **maPhim** | `movieId` | VARCHAR(36) | **FK** | Khóa ngoại liên kết bảng `Phim` |
| **maPhongChieu** | `roomId` | VARCHAR(36) | **FK** | Khóa ngoại liên kết bảng `PhongChieu` |
| **dinhDang** | `format` | VARCHAR(20) | | Định dạng chiếu: `2D`, `3D`, `IMAX` |
| **ngonNgu** | `language` | VARCHAR(20) | | Ngôn ngữ: `SUB` (Phụ đề), `DUB` (Lồng tiếng) |
| **thoiGianBatDau** | `startTime` | TIMESTAMP | | Thời gian bắt đầu chiếu |
| **thoiGianKetThuc** | `endTime` | TIMESTAMP | | Thời gian kết thúc chiếu |

---

### 7. Bảng `DonDatVe` (Đơn Hàng / Hóa Đơn)
| Tên Trường (Tiếng Việt) | Tên Trường (Tiếng Anh) | Kiểu Dữ Liệu | Khóa | Diễn Giải Chi Tiết |
| :--- | :--- | :--- | :---: | :--- |
| **maDonHang** | `id` | VARCHAR(36) | **PK** | Mã định danh đơn hàng đặt vé |
| **maNguoiDung** | `userId` | VARCHAR(36) | **FK** | Khóa ngoại người dùng đặt vé |
| **trangThaiDonHang** | `status` | VARCHAR(20) | | Trạng thái: `PENDING`, `COMPLETED`, `CANCELLED` |
| **phuongThucThanhToan** | `paymentMethod` | VARCHAR(50) | | Phương thức: `VNPAY`, `MOMO`, `CASH` |
| **trangThaiThanhToan** | `paymentStatus` | VARCHAR(20) | | Trạng thái thanh toán: `UNPAID`, `PAID` |
| **maVoucher** | `voucherCode` | VARCHAR(50) | | Mã voucher áp dụng (nếu có) |
| **soTienGiamGia** | `discountAmount` | FLOAT | | Số tiền được giảm từ voucher |
| **maVeDienTu** | `ticketCode` | VARCHAR(100) | **UQ** | Mã vé điện tử độc nhất sinh tự động |
| **duongDanMaQR** | `qrCodeUrl` | TEXT | | Link ảnh QR Code cho nhân viên quét |
| **tongTien** | `total` | FLOAT | | Tổng tiền hóa đơn thanh toán |

---

### 8. Bảng `VeXemPhim` (Chi Tiết Vé Đã Đặt)
| Tên Trường (Tiếng Việt) | Tên Trường (Tiếng Anh) | Kiểu Dữ Liệu | Khóa | Diễn Giải Chi Tiết |
| :--- | :--- | :--- | :---: | :--- |
| **maVe** | `id` | VARCHAR(36) | **PK** | Mã định danh vé xem phim |
| **maDonHang** | `bookingId` | VARCHAR(36) | **FK** | Khóa ngoại liên kết bảng `DonDatVe` |
| **maSuatChieu** | `showtimeId` | VARCHAR(36) | **FK** | Khóa ngoại liên kết bảng `SuatChieu` |
| **maGhe** | `seatId` | VARCHAR(36) | **FK** | Khóa ngoại liên kết bảng `GheNgoi` |
| **giaVe** | `price` | FLOAT | | Giá tiền của 1 vé ghế này |

---

### 9. Bảng `ComboBapNuoc` (Thực Đơn Bắp Nước F&B)
| Tên Trường (Tiếng Việt) | Tên Trường (Tiếng Anh) | Kiểu Dữ Liệu | Khóa | Diễn Giải Chi Tiết |
| :--- | :--- | :--- | :---: | :--- |
| **maCombo** | `id` | VARCHAR(36) | **PK** | Mã định danh gói bắp nước |
| **tenCombo** | `name` | VARCHAR(255) | | Tên combo (Combo iCombo 1, Solo Combo...) |
| **moTa** | `description` | TEXT | | Chi tiết các món (1 Bắp ngọt + 1 Pepsi 32oz) |
| **giaBan** | `price` | FLOAT | | Giá bán combo (VNĐ) |
| **duongDanHinhAnh** | `imageUrl` | TEXT | | Link hình ảnh thực đơn bắp nước |

---

### 10. Bảng `ChiTietComboDonHang` (Bắp Nước Theo Đơn)
| Tên Trường (Tiếng Việt) | Tên Trường (Tiếng Anh) | Kiểu Dữ Liệu | Khóa | Diễn Giải Chi Tiết |
| :--- | :--- | :--- | :---: | :--- |
| **maChiTietCombo** | `id` | VARCHAR(36) | **PK** | Mã định danh chi tiết bắp nước |
| **maDonHang** | `bookingId` | VARCHAR(36) | **FK** | Khóa ngoại liên kết bảng `DonDatVe` |
| **maCombo** | `foodId` | VARCHAR(36) | **FK** | Khóa ngoại liên kết bảng `ComboBapNuoc` |
| **soLuong** | `quantity` | INT | | Số lượng combo khách chọn đặt mua |
| **donGia** | `price` | FLOAT | | Đơn giá tại thời điểm mua |

---

### 11. Bảng `MaGiamGia` (Voucher Khuyến Mãi)
| Tên Trường (Tiếng Việt) | Tên Trường (Tiếng Anh) | Kiểu Dữ Liệu | Khóa | Diễn Giải Chi Tiết |
| :--- | :--- | :--- | :---: | :--- |
| **maVoucher** | `id` | VARCHAR(36) | **PK** | Mã định danh voucher |
| **maCode** | `code` | VARCHAR(50) | **UQ** | Mã nhập khuyến mãi (Ví dụ: AEON50K) |
| **loaiGiamGia** | `discountType` | VARCHAR(20) | | Loại giảm: `PERCENTAGE` (%) hoặc `FIXED_AMOUNT` (VNĐ) |
| **giaTriGiam** | `discountValue` | FLOAT | | Giá trị được giảm (% hoặc số tiền) |
| **giaTriDonToiThieu**| `minOrderValue` | FLOAT | | Giá trị đơn tối thiểu để áp dụng |
| **ngayBatDau** | `startDate` | TIMESTAMP | | Thời gian bắt đầu hiệu lực |
| **ngayKetThuc** | `endDate` | TIMESTAMP | | Thời gian hết hạn |
| **gioiHanSuDung** | `usageLimit` | INT | | Tổng số lượt phát hành tối đa |
| **soLuotDaDung** | `usedCount` | INT | | Số lượt khách hàng đã sử dụng |

---

### 12. Bảng `DanhGiaBinhLuan` (Phản Hồi Khách Hàng)
| Tên Trường (Tiếng Việt) | Tên Trường (Tiếng Anh) | Kiểu Dữ Liệu | Khóa | Diễn Giải Chi Tiết |
| :--- | :--- | :--- | :---: | :--- |
| **maDanhGia** | `id` | VARCHAR(36) | **PK** | Mã định danh đánh giá |
| **maNguoiDung** | `userId` | VARCHAR(36) | **FK** | Khóa ngoại người dùng đánh giá |
| **maPhim** | `movieId` | VARCHAR(36) | **FK** | Khóa ngoại phim được đánh giá |
| **soSaoDanhGia** | `rating` | INT | | Chấm điểm sao (từ 1 đến 10) |
| **noiDungBinhLuan**| `comment` | TEXT | | Nội dung bình luận review |

---

### 13. Bảng `KhoaGiuGheTamThoi` (SeatHold Realtime)
| Tên Trường (Tiếng Việt) | Tên Trường (Tiếng Anh) | Kiểu Dữ Liệu | Khóa | Diễn Giải Chi Tiết |
| :--- | :--- | :--- | :---: | :--- |
| **maGiuGhe** | `id` | VARCHAR(36) | **PK** | Mã định danh phiên giữ ghế |
| **maSuatChieu** | `showtimeId` | VARCHAR(36) | **FK** | Khóa ngoại suất chiếu đang chọn |
| **maGhe** | `seatId` | VARCHAR(36) | | Ký hiệu ghế đang được khóa |
| **maNguoiDung** | `userId` | VARCHAR(36) | | Mã người dùng đang giữ ghế |
| **thoiGianHetHan** | `expiresAt` | TIMESTAMP | | Thời điểm tự động nhả ghế (sau 10 phút) |

---

### 14. Bảng `BangGiaVe` (Cấu Hình Giá Vé)
| Tên Trường (Tiếng Việt) | Tên Trường (Tiếng Anh) | Kiểu Dữ Liệu | Khóa | Diễn Giải Chi Tiết |
| :--- | :--- | :--- | :---: | :--- |
| **maBangGia** | `id` | VARCHAR(36) | **PK** | Mã định danh cấu hình giá |
| **loaiGhe** | `seatType` | ENUM | | Loại ghế: `STANDARD`, `VIP`, `SWEETBOX` |
| **dinhDang** | `format` | VARCHAR(20) | | Định dạng: `2D`, `3D`, `IMAX` |
| **laCuoiTuan** | `isWeekend` | BOOLEAN | | Áp dụng ngày cuối tuần / ngày lễ |
| **giaVe** | `price` | FLOAT | | Giá vé tương ứng (VNĐ) |

---

### 15. Bảng `TheLoaiPhim` (Danh Mục Thể Loại)
| Tên Trường (Tiếng Việt) | Tên Trường (Tiếng Anh) | Kiểu Dữ Liệu | Khóa | Diễn Giải Chi Tiết |
| :--- | :--- | :--- | :---: | :--- |
| **maTheLoai** | `id` | VARCHAR(36) | **PK** | Mã định danh thể loại |
| **tenTheLoai** | `name` | VARCHAR(100) | **UQ** | Tên thể loại (Hành động, Viễn tưởng, Hài...) |

---

### 16. Bảng `DienVien` (Diễn Viên Điện Ảnh)
| Tên Trường (Tiếng Việt) | Tên Trường (Tiếng Anh) | Kiểu Dữ Liệu | Khóa | Diễn Giải Chi Tiết |
| :--- | :--- | :--- | :---: | :--- |
| **maDienVien** | `id` | VARCHAR(36) | **PK** | Mã định danh diễn viên |
| **tenDienVien** | `name` | VARCHAR(255) | **UQ** | Họ tên diễn viên |
| **duongDanAnh** | `avatarUrl` | TEXT | | Link ảnh chân dung diễn viên |

---

### 17. Bảng `ChuongTrinhKhuyenMai` (Ưu Đãi & Sự Kiện)
| Tên Trường (Tiếng Việt) | Tên Trường (Tiếng Anh) | Kiểu Dữ Liệu | Khóa | Diễn Giải Chi Tiết |
| :--- | :--- | :--- | :---: | :--- |
| **maKhuyenMai** | `id` | VARCHAR(36) | **PK** | Mã định danh chương trình ưu đãi |
| **tieuDe** | `title` | VARCHAR(255) | | Tên chương trình ưu đãi |
| **moTa** | `desc` | TEXT | | Chi tiết nội dung ưu đãi |
| **danhMuc** | `category` | VARCHAR(50) | | Danh mục: `MEMBER`, `STUDENT`, `PARTNER` |
| **hanSuDung** | `validUntil` | VARCHAR(50) | | Thời hạn chương trình |

---

### 18. Bảng `BaiVietTinTuc` (Góc Điện Ảnh / Blog)
| Tên Trường (Tiếng Việt) | Tên Trường (Tiếng Anh) | Kiểu Dữ Liệu | Khóa | Diễn Giải Chi Tiết |
| :--- | :--- | :--- | :---: | :--- |
| **maBaiViet** | `id` | VARCHAR(36) | **PK** | Mã định danh bài viết |
| **tieuDe** | `title` | VARCHAR(255) | | Tiêu đề bài viết tin tức / review |
| **tomTat** | `summary` | TEXT | | Tóm tắt ngắn nội dung bài viết |
| **noiDung** | `content` | TEXT | | Nội dung bài viết chi tiết |
| **danhMuc** | `category` | VARCHAR(50) | | Danh mục: Review Phim, Tin Điện Ảnh |
| **tacGia** | `author` | VARCHAR(100) | | Người biên soạn |
| **luotXem** | `views` | INT | | Số lượt độc giả truy cập xem bài viết |

