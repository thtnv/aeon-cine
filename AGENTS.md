# QUY TẮC PHÁT TRIỂN TOÀN DIỆN & HỆ THỐNG THIẾT KẾ ĐIỆN ẢNH (AEON CINE MASTER RULES)
> **TÀI LIỆU NGUYÊN TẮC DUY NHẤT CỦA TOÀN BỘ DỰ ÁN**: Áp dụng bắt buộc cho mọi tác vụ lập trình (Frontend, Backend, Database, Design System và Phân Quyền) trong đồ án tốt nghiệp AEON CINE.
> Được hợp nhất toàn diện từ: `AGENTS.md`, `DESIGN.md`, `.prompt` và `cinema-design-system.md`.

---

## 1. MÔ HÌNH DỰ ÁN & MÔI TRƯỜNG THỰC THI (PROJECT EXECUTION & DEV ENVIRONMENT)

### 1.1. Cấu trúc Monorepo phân tách rõ ràng
- Dự án gồm 2 thư mục độc lập ở gốc:
  - `frontend/`: Ứng dụng Single Page App viết bằng **React 19 + Vite + TypeScript + TailwindCSS**.
  - `backend/`: Máy chủ API RESTful viết bằng **Node.js + Express + TypeScript + Prisma ORM + PostgreSQL**.

### 1.2. Quy tắc thực thi dòng lệnh (Terminal Commands)
1. **Đúng thư mục làm việc**:
   - Lệnh frontend bắt buộc chạy trong thư mục `frontend` (VD: `npm run build`, `npm run dev`).
   - Lệnh backend bắt buộc chạy trong thư mục `backend` (VD: `npm run build`, `npm run dev`).
2. **Không dùng node trần**: Tuyệt đối không dùng lệnh `node` thông thường để chạy file `.ts` / `.tsx`. Dùng `ts-node` hoặc script trong `package.json`.
3. **Quản lý Database Schema**:
   - Khi chỉnh sửa file `backend/prisma/schema.prisma`, luôn chạy `npx prisma format` và `npx prisma generate` trong thư mục `backend`.
4. **Trình quản lý gói**: Chỉ sử dụng duy nhất `npm`. Không dùng `yarn` hay `pnpm`.

---

## 2. BẢN SẮC THƯƠNG HIỆU & TRIẾT LÝ THIẾT KẾ (BRAND & ANTI-GENERIC AI)

### 2.1. Định vị thương hiệu AEON CINE
- **Định vị**: Chuỗi rạp chiếu phim chuẩn điện ảnh quốc tế với công nghệ Laser 4K, phòng chiếu IMAX, âm thanh vòm Dolby Atmos và dịch vụ Concierge cao cấp.
- **Tone & Mood**: *Sang trọng, Điện ảnh, Sâu lắng, Tinh tế, Hiện đại* (Luxury, Cinematic, Deep Obsidian, Architectural).

### 2.2. 🚫 Những điều TUYỆT ĐỐI KHÔNG làm ("Khử triệt để mùi AI"):
- **Không dùng nền xám thô & shadow nhòe**: Không dùng nền xám thô (`#0f1115`), viền mặc định xỉn màu (`border-gray-800`), màu cam bão hòa gắt (`bg-orange-500`) đi kèm shadow mờ ảo phát sáng (`shadow-[0_0_25px_rgba(249,115,22,0.5)]`).
- **Không lạm dụng font-black & chữ in hoa tràn lan**: Không biến toàn bộ giao diện thành các khối chữ in hoa đen kịt, gây mất nhịp điệu đọc (lack of typographic hierarchy).
- **Không dùng bố cục template kéo-thả**: Không dựng các ô vuông phẳng lì xếp chồng thiếu chiều sâu quang học (optical depth) và ánh sáng môi trường (ambient lighting).

---

## 3. BỘ QUY CHUẨN DESIGN TOKENS (CINEMA DESIGN TOKENS)

### 3.1. Bảng màu (Color Matrix)
| Tên Token / Class | Giá Trị Màu | Ứng Dụng Trong Giao Diện |
| :--- | :--- | :--- |
| **`--bg-void`** | `#07090d` | Nền trang chính (Obsidian Void đen sâu huyền bí) |
| **`--bg-surface`** | `#0d1117` | Bề mặt phụ, sidebar rạp, card tối cao cấp |
| **`--accent-amber`** | `#f59e0b` | Điểm nhấn chính (Warm Amber) |
| **`--accent-gold`** | `#d97706` | Điểm nhấn hoàng kim cho vé VIP, Premiere |
| **`--accent-orange`**| `#ea580c` | Gradient phụ trợ tạo độ ấm quang học rực rỡ |
| **`text-gradient-gold`** | `#fef08a` → `#f59e0b` → `#ea580c` | Chữ gradient vàng hoàng kim cho thương hiệu |
| **`cinema-glass`** | `backdrop-blur-xl bg-white/[0.03] border border-white/[0.08]` | Thẻ kính mờ, thanh Navbar, Modal |
| **`cinema-glass-subtle`**| `backdrop-blur-md bg-white/[0.02] border border-white/[0.05]` | Khối kính phụ, bảng thông số kỹ thuật |

### 3.2. Hệ thống Typography phân cấp chặt chẽ
- **Font tiêu đề (Display Header)**: `Montserrat`, sans-serif (Google Fonts). Dùng cho tiêu đề trang, tên phim nổi bật, banner Premiere, số bước Concierge (chuẩn rạp Galaxy Cinema / CGV).
- **Font nội dung (Body / UI Sans)**: `Plus Jakarta Sans`, sans-serif. Dùng cho đoạn văn bản, nhãn form, menu điều hướng, thông tin rạp chiếu.
- **Font kỹ thuật (Monospace / Specs)**: `JetBrains Mono`, monospace. Dùng cho giờ chiếu, mã vé điện tử, mã voucher, số ghế và giá tiền VNĐ.

---

## 4. QUY TẮC CẤU TRÚC COMPONENT & GIAO DIỆN (UI COMPONENTS)

### 4.1. Nút bấm & Tương tác (Buttons & Actions)
- **Primary CTA (`.cinema-btn-primary`)**:
  - Gradient ấm: `linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)`.
  - Màu chữ: Đen sâu (`#07090d`), font `Montserrat` trọng số 800, shadow nhẹ ánh sáng hắt sang trọng.
- **Secondary / Glass CTA (`.cinema-btn-glass`)**:
  - Nền kính bán trong suốt `bg-white/[0.05]`, viền mảnh `border-white/[0.1]`.
  - Hover chuyển viền sang `border-amber-500/40` và chữ sang `text-amber-300`.

### 4.2. Poster & Card Phim
- **Tỷ lệ chuẩn điện ảnh**: **2:3** (`aspect-[2/3]`).
- **Góc bo**: `rounded-2xl` hoặc `rounded-3xl` mềm mại.
- **Hiệu ứng hover**: Scale nhẹ nhàng (`hover:scale-105 duration-500`), vignette đổ bóng từ dưới lên (`bg-gradient-to-t from-black/80 via-transparent`).
- **Thẻ thông tin**: Đầy đủ nhãn độ tuổi (`P`, `K`, `T13`, `T16`, `T18`) và định dạng chiếu (`IMAX Laser`, `Dolby Atmos`).

### 4.3. Quầy Đặt Vé Nhanh & Stepper (Ticket Concierge Bar)
- Cấu trúc thanh ngang nổi dạng kính (`cinema-glass`).
- Các bước đánh số thứ tự kiến trúc: `01` - Chọn Phim, `02` - Chọn Cụm Rạp, `03` - Chọn Ngày Chiếu, `04` - Chọn Suất Chiếu.

### 4.4. Phòng Chiếu & Sơ Đồ Ghế (Seat Selection)
- **Màn hình chiếu**: Thiết kế dạng vòm cong quang học (**Curved Laser Screen Arc**) có quầng sáng ambient hắt xuống phòng chiếu.
- **Phân tầng màu ghế tinh tế**:
  - Ghế thường (Standard): Tông zinc tối thanh lịch (`bg-white/[0.05] border-white/[0.1]`).
  - Ghế VIP: Ánh kim amber nhẹ (`bg-amber-500/[0.08] border-amber-500/30 text-amber-300`).
  - Ghế Đôi Sweetbox (Hàng H): Ánh hồng champagne (`bg-rose-500/[0.08] border-rose-500/30 text-rose-300`).
  - Ghế đang chọn: Nổi bật với gradient amber gold, phóng to nhẹ (`scale-110`).
  - Ghế đã đặt: Làm mờ tối giản (`opacity-30 cursor-not-allowed`).

### 4.5. Vé Điện Tử (E-Ticket / Boarding Pass)
- Thiết kế mô phỏng vé máy bay/vé xem phim VIP quốc tế: Có đường rãnh xé nét đứt (`dashed divider`), mã QR check-in trung tâm sắc nét và thông số hiển thị bằng `font-mono`.

---

## 5. NGUYÊN TẮC PHÂN QUYỀN & KIỂM SOÁT NỘI BỘ (INTERNAL CONTROLS & SOD)
> Tuân thủ chuẩn vận hành các chuỗi rạp chiếu phim hiện đại (Galaxy Cinema, CGV, Lotte Cinema):

### 5.1. Phân định rõ 4 vai trò người dùng trong hệ thống
1. **`ADMIN` (Quản trị viên hệ thống)**: Toàn quyền quản lý phim, phòng chiếu, lịch chiếu, tài khoản, voucher ưu đãi và cấu hình hệ thống.
2. **`ACCOUNTANT` (Kế toán trưởng / Kế toán tài chính)**: Quản lý đối soát đơn hàng, ma trận giá vé, kho F&B bắp nước và xem biểu đồ phân tích doanh thu.
3. **`STAFF` (Nhân viên rạp chiếu)**: Quét mã QR soát vé (`StaffScanner`), kiểm tra tính hợp lệ của vé tại cửa phòng chiếu.
4. **`USER` (Khách hàng / Hội viên Stars)**: Xem lịch chiếu, chọn ghế, mua bắp nước, áp voucher, thanh toán và tích điểm thành viên B2C.

### 5.2. Nguyên tắc cấm xung đột lợi ích đối với Kế toán (Segregation of Duties)
- **Tài khoản Kế toán (`ACCOUNTANT`) là tài khoản công vụ nội bộ**:
  - Tuyệt đối **KHÔNG** được sử dụng tài khoản công vụ Kế toán để tham gia vào luồng mua vé xem phim cá nhân trên cổng B2C (`/booking/:movieId`).
  - Lý do: Tránh xung đột lợi ích (*Conflict of Interest*) và nguy cơ gian lận nội bộ (*Internal Fraud*) khi tự mua vé rồi tự đối soát/hủy vé/sửa sổ sách doanh thu.
- **Quy định khi xem phim cá nhân**: Nhân sự Kế toán muốn xem phim phải **Đăng xuất (Logout)** khỏi phiên làm việc công vụ và sử dụng tài khoản Khách hàng cá nhân thông thường.

---

## 6. KỸ THUẬT LẬP TRÌNH, CODE INTEGRITY & TỐI ƯU HIỆU NĂNG DATABASE
> **BẮT BUỘC TUÂN THỦ TUYỆT ĐỐI**: Không tự ý xóa, gỡ bỏ hoặc làm mất các cơ chế bảo vệ sau:

### 6.1. Kiểm tra TypeScript trước khi hoàn tất (0 Lỗi Biên Dịch)
- Luôn chạy lệnh `npm run build` (`tsc -b && vite build`) trong `frontend` để đảm bảo **0 lỗi biên dịch TypeScript**.
- Với React 19: Luôn dùng `React.ReactElement` thay cho namespace `JSX.Element` khi khai báo kiểu route/component bọc.
- Không sử dụng kiểu `any` tùy tiện; ưu tiên TypeScript interface/type chặt chẽ.

### 6.2. Bảo toàn tối ưu hóa Database Indexes (PostgreSQL / Prisma)
- Duy trì toàn bộ các `@@index` trong `backend/prisma/schema.prisma` cho các bảng lớn (`Showtime`, `Ticket`, `SeatHold`, `Room`, `Seat`, `Booking`, `Review`).
- Mọi truy vấn lọc theo quan hệ (`movieId`, `roomId`, `cinemaId`, `showtimeId`, `startTime`) phải được bảo vệ bằng Index để tránh Full Table Scan.

### 6.3. Nén dữ liệu HTTP (`compression`)
- Giữ nguyên middleware `app.use(compression())` trong `backend/src/index.ts` để nén Gzip/Brotli mọi phản hồi JSON, giảm 75% - 85% kích thước payload qua mạng.

### 6.4. Kiểm soát Overfetching (Selective Projection)
- Khi truy vấn Prisma cho các bảng có hàng nghìn bản ghi (như `Showtime`), luôn dùng `select` để chỉ lấy các trường cần thiết, tuyệt đối không dùng `include` toàn bộ object nặng lặp lại.

### 6.5. Bộ nhớ đệm (In-Memory Cache & Cache-Control)
- Duy trì cơ chế cache TTL (`apiCache` trong `backend/src/utils/cache.ts`) cho các dữ liệu đọc nhiều ít đổi (`cinemas`, `movies`, `food`, `prices`, `promotions`, `showtimes`) và tự động invalidate khi có thao tác ghi (POST/PUT/DELETE).
- Thiết lập header `Cache-Control` để trình duyệt người dùng tận dụng cache cục bộ (Disk/Memory Cache).

---

## 7. QUY TẮC QUẢN LÝ MÃ NGUỒN & ĐỒNG BỘ CLOUD (GIT FLOW & CLOUD SYNCHRONIZATION)
> **BẮT BUỘC TUÂN THỦ CHO MỌI THAY ĐỔI CODE**:
1. **Quy trình Git Flow 2 tầng (Nhánh riêng ➔ Merge Main)**:
   - Mỗi khi có bất kỳ thay đổi, sửa lỗi hoặc tính năng mới, LUÔN tạo nhánh làm việc riêng (VD: `git checkout -b update/...` hoặc `feature/...`).
   - Kiểm tra `npm run build` (0 lỗi TypeScript).
   - Commit và push lên nhánh riêng: `git push origin <branch-name>`.
   - Chuyển về nhánh chính `main`, merge nhánh vừa làm vào `main`: `git checkout main && git merge <branch-name>`.
   - Push nhánh `main` lên GitHub: `git push origin main`.
2. **Loại trừ tuyệt đối tài liệu đồ án cá nhân & Secrets**:
   - Tuyệt đối KHÔNG đưa file `.env` lên GitHub. Luôn duy trì file mẫu `.env.example`.
   - Tuyệt đối KHÔNG đưa các file tài liệu cá nhân đồ án (`.mdj`, `.docx`, `.doc`, `.sql`, script phụ `update_modau.py`, `schema_tieng_viet.prisma`, `DANH_MUC_BANG_DU_LIEU_TIENG_VIET.md`) lên GitHub. Các file này chỉ lưu tại local và nằm trong `.gitignore`.
3. **Đồng bộ liên tục & tự động kích hoạt Cloud Deploy**:
   - Khi nhánh `main` được push, các nền tảng Cloud (Vercel Frontend & Render Backend) sẽ tự động trigger bản build mới nhất ngay lập tức.
