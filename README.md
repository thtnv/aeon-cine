# 🎬 AEON CINE - Hệ Thống Đặt Vé & Quản Lý Rạp Chiếu Phim Điện Ảnh Cao Cấp

<div align="center">

![AEON CINE Banner](https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80)

[![Live Demo](https://img.shields.io/badge/Demo-aeon--cine.vercel.app-f59e0b?style=for-the-badge&logo=vercel&logoColor=white)](https://aeon-cine.vercel.app)
[![Backend API](https://img.shields.io/badge/API-Render-46e3b7?style=for-the-badge&logo=render&logoColor=white)](https://aeon-cine-api.onrender.com)
[![Database](https://img.shields.io/badge/Database-Supabase%20Postgres-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.20-2d3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io)

<p align="center">
  <b>Hệ thống phòng chiếu chuẩn điện ảnh quốc tế: Laser 4K • Dolby Atmos • IMAX • Concierge VIP</b>
</p>

</div>

---

## 🌟 Giới Thiệu Dự Án (Overview)

**AEON CINE** là nền tảng đặt vé và quản trị vận hành rạp chiếu phim hiện đại chuẩn thương mại quốc tế, được xây dựng theo kiến trúc **Monorepo (Frontend SPA + Backend RESTful API + Cloud Database)**.

Hệ thống cung cấp trải nghiệm số toàn diện từ cổng khách hàng trực tuyến (B2C), trợ lý AI tư vấn phim, chọn ghế ngồi thời gian thực, đặt combo bắp nước, áp voucher ưu đãi, thanh toán đa kênh, đến 3 cổng nghiệp vụ nội bộ phân quyền chặt chẽ: **Quản Trị Viên (Admin)**, **Kế Toán Trưởng (Accountant)**, và **Nhân Viên Soát Vé (Staff Scanner)**.

---

## 🚀 Đường Dẫn Trực Tuyến (Production Live Links)

* 🌐 **Website Khách Hàng (Vercel)**: [https://aeon-cine.vercel.app](https://aeon-cine.vercel.app)
* ⚙️ **Máy Chủ RESTful API (Render)**: [https://aeon-cine-api.onrender.com](https://aeon-cine-api.onrender.com)
* 🗄️ **Cơ Sở Dữ Liệu Cloud**: Supabase PostgreSQL (Singapore Cluster)

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Frontend (Client-side)
* **Core**: React 19 (Hooks, Context API, Suspense, Concurrent Rendering)
* **Ngôn ngữ**: TypeScript 5.9 (Strict Type Checking, 0 compile errors)
* **Build Tool**: Vite 8.2 (Lightning Fast HMR, Optimized Rollup Chunking)
* **Styling & Design System**: TailwindCSS, CSS Variables, Glassmorphism, Dual Theme (Cinematic Dark Void `#07090d` & Clean Slate Light `#f8fafc`)
* **Icons & Animation**: Lucide React, Framer Motion transitions
* **Typography**: Google Fonts (*Montserrat*, *Plus Jakarta Sans*, *JetBrains Mono*)

### Backend (Server-side)
* **Runtime**: Node.js v20+ / Express 5
* **ORM & Database**: Prisma ORM 5.20 + PostgreSQL (với đầy đủ Connection Pool & Indexes)
* **Trí Tuệ Nhân Tạo**: Google Gemini API (`@google/genai`) hỗ trợ Chatbot thông minh
* **Bảo mật & Xác thực**: JWT (JSON Web Tokens), Bcrypt hashing, Role-Based Access Control (RBAC)
* **Thanh toán**: Stripe SDK, VNPAY Gateway integration
* **Dịch vụ Email**: Nodemailer (SMTP Gmail gửi vé điện tử kèm mã QR)
* **Hiệu năng & Nén**: HTTP Compression (Gzip/Brotli), In-Memory Cache TTL, Idempotent APIs

---

## 👥 Phân Quyền Người Dùng (Role-Based Access Control)

Hệ thống phân định rạch ròi 4 vai trò tuân thủ nguyên tắc kiểm soát nội bộ rạp chiếu phim (*Segregation of Duties*):

| Vai Trò | Cổng Truy Cập | Chức Năng Chính |
| :--- | :--- | :--- |
| **`USER`**<br>*(Khách hàng)* | `/` | • Xem lịch chiếu, thông tin phim, trailer, blog điện ảnh<br>• Chọn ghế trực quan (Standard, VIP, Sweetbox đôi)<br>• Mua combo bắp nước F&B, áp voucher giảm giá<br>• Thanh toán thẻ, nhận vé điện tử Boarding Pass & Email |
| **`STAFF`**<br>*(Nhân viên rạp)* | `/admin/scanner` | • Quét mã QR soát vé tại cửa phòng chiếu bằng Camera<br>• Kiểm tra tính hợp lệ của vé, ngăn chặn vé giả/vé đã dùng |
| **`ACCOUNTANT`**<br>*(Kế toán tài chính)* | `/accountant` | • Đối soát đơn hàng vé và doanh thu theo thời gian thực<br>• Cấu hình ma trận bảng giá vé (Ghế thường, VIP, Cuối tuần)<br>• Quản lý danh mục combo bắp nước, biểu đồ tài chính |
| **`ADMIN`**<br>*(Quản trị hệ thống)* | `/admin` | • Toàn quyền quản trị: Phim, Thể loại, Diễn viên, Đạo diễn<br>• Quản lý 31 Cụm rạp toàn quốc & 183 Phòng chiếu (Laser, IMAX)<br>• Lên lịch chiếu (Showtimes), Quản lý tài khoản & Voucher |

---

## ✨ Tính Năng Nổi Bật (Key Features)

1. **Sơ đồ chọn ghế Realtime & Curved Laser Arc**:
   * Mô phỏng màn hình cong Laser Arc quang học với hiệu ứng ánh sáng ambient.
   * Phân loại ghế chuẩn quốc tế: Ghế Thường (Zinc), Ghế VIP (Gold Amber), Ghế Đôi Sweetbox (Rose Champagne).
   * Khóa giữ ghế tạm thời (SeatHold 10 phút) chống đặt trùng chỗ.
2. **Trợ lý AI Concierge (Gemini 2.0)**:
   * Chatbot tư vấn chọn phim thông minh theo tâm trạng, thể loại và độ tuổi.
3. **Vé Điện Tử Thông Minh (E-Ticket / Boarding Pass)**:
   * Thiết kế vé phong cách vé máy bay VIP với rãnh xé nét đứt và mã QR sắc nét.
   * Tự động gửi Email xác nhận đặt vé thành công kèm mã QR check-in qua Nodemailer.
4. **Hệ Thống Quản Lý Dropdown & Phòng Chiếu Thông Minh**:
   * Thêm/sửa/xóa phòng chiếu ngay trong popup modal, tự động sinh 80 ghế chuẩn.
   * Hỗ trợ xóa an toàn (Cascade Delete) toàn bộ suất chiếu liên kết khi xóa phòng.
   * Cơ chế chống Disk Cache trình duyệt giúp dữ liệu luôn cập nhật tức thì.

---

## 📂 Cấu Trúc Thư Mục (Monorepo Directory)

```
DOANTOTNGHIEP/
├── frontend/                   # Ứng dụng Client SPA (React 19 + Vite)
│   ├── src/
│   │   ├── components/         # UI Components, Modal, Navbar, Chatbot...
│   │   │   ├── accountant/     # Quản lý đơn hàng, giá vé, bắp nước
│   │   │   └── admin/          # Quản lý phim, rạp, phòng, lịch chiếu...
│   │   ├── pages/              # Trang người dùng & Dashboard quản trị
│   │   ├── context/            # ThemeContext (Dark/Light Mode)
│   │   ├── config/             # Cấu hình API Endpoint (Vite env)
│   │   └── index.css           # Design Tokens, Cinema CSS Glassmorphism
│   ├── vercel.json             # Cấu hình SPA Routing cho Vercel Cloud
│   └── package.json
│
├── backend/                    # Máy chủ RESTful API (Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma       # Database Schema (18 tables, indexes)
│   │   └── seed*.ts            # Scripts nạp dữ liệu mẫu điện ảnh
│   ├── src/
│   │   ├── controllers/        # Xử lý nghiệp vụ (Movie, Showtime, Booking...)
│   │   ├── routes/             # Định tuyến API RESTful
│   │   ├── middleware/         # Xác thực JWT & phân quyền RBAC
│   │   └── utils/              # In-Memory Cache TTL, Email Service
│   ├── .env.example            # Mẫu biến môi trường an toàn
│   └── package.json
│
├── .gitignore                  # Loại trừ secrets (.env) và file tài liệu cá nhân
└── README.md                   # Tài liệu hướng dẫn dự án
```

---

## 💻 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local Setup)

### Yêu Cầu Môi Trường
* **Node.js**: Phiên bản 20.x trở lên
* **PostgreSQL**: Phiên bản 14 trở lên (hoặc kết nối Supabase Cloud)
* **Trình quản lý gói**: `npm`

### 1. Khởi động Backend
```bash
cd backend
npm install
cp .env.example .env            # Điền DATABASE_URL và các key cần thiết
npx prisma db push              # Đồng bộ database schema
npm run dev                     # Chạy dev server tại http://localhost:5001
```

### 2. Khởi động Frontend
```bash
cd frontend
npm install
npm run dev                     # Chạy ứng dụng tại http://localhost:5173
```

---

## 📜 Giấy Phép & Bản Quyền (License)

Đồ án Tốt nghiệp chuyên ngành Công Nghệ Thông Tin.  
Bản quyền thuộc về **Nguyễn Văn Viên** ([@thtnv](https://github.com/thtnv)).
