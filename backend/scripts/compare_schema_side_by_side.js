const { Client } = require('pg');

const mapping = [
  { en: 'Actor', vi: 'DienVien' },
  { en: 'Article', vi: 'BaiVietTinTuc' },
  { en: 'Booking', vi: 'DonDatVe' },
  { en: 'BookingService', vi: 'ChiTietDichVuDonHang' },
  { en: 'Cinema', vi: 'CumRap' },
  { en: 'Genre', vi: 'TheLoaiPhim' },
  { en: 'GroupBooking', vi: 'DatVeNhom' },
  { en: 'MembershipLevel', vi: 'HangThanhVien' },
  { en: 'Movie', vi: 'Phim' },
  { en: 'MovieActor', vi: 'PhimDienVien' },
  { en: 'MovieGenre', vi: 'PhimTheLoai' },
  { en: 'PaymentMethod', vi: 'PhuongThucThanhToan' },
  { en: 'Promotion', vi: 'ChuongTrinhKhuyenMai' },
  { en: 'Review', vi: 'DanhGiaBinhLuan' },
  { en: 'Role', vi: 'VaiTro' },
  { en: 'Room', vi: 'PhongChieu' },
  { en: 'ScreenFormat', vi: 'DinhDangChieu' },
  { en: 'Seat', vi: 'GheNgoi' },
  { en: 'SeatHold', vi: 'KhoaGiuGheTamThoi' },
  { en: 'SeatType', vi: 'LoaiGhe' },
  { en: 'Service', vi: 'DichVu' },
  { en: 'Showtime', vi: 'SuatChieu' },
  { en: 'BookingDetail', vi: 'ChiTietDonDatVe' },
  { en: 'TicketPrice', vi: 'BangGiaVe' },
  { en: 'User', vi: 'NguoiDung' },
  { en: 'Voucher', vi: 'MaGiamGia' }
];

async function compare() {
  const cEn = new Client({ connectionString: 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db' });
  const cVi = new Client({ connectionString: 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db_vi' });
  await cEn.connect();
  await cVi.connect();

  console.log('=== DETAILED SIDE-BY-SIDE COLUMN COMPARISON ===');

  for (const pair of mapping) {
    const enCols = (await cEn.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = '${pair.en}' AND table_schema = 'public'
      ORDER BY ordinal_position
    `)).rows;

    const viCols = (await cVi.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = '${pair.vi}' AND table_schema = 'public'
      ORDER BY ordinal_position
    `)).rows;

    console.log(`\nTable ${pair.en} (${enCols.length} cols) <---> ${pair.vi} (${viCols.length} cols)`);
    const max = Math.max(enCols.length, viCols.length);
    for (let i = 0; i < max; i++) {
      const e = enCols[i] ? `${enCols[i].column_name} (${enCols[i].data_type})` : '[NONE]';
      const v = viCols[i] ? `${viCols[i].column_name} (${viCols[i].data_type})` : '[NONE]';
      console.log(`  ${e.padEnd(35)} | ${v}`);
    }
  }

  await cEn.end();
  await cVi.end();
}

compare();
