const { Client } = require('pg');

async function run() {
  const cEn = new Client({ connectionString: 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db' });
  const cVi = new Client({ connectionString: 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db_vi' });

  await cEn.connect();
  await cVi.connect();

  console.log('=== ADDING BookingDetail / ChiTietDonDatVe TABLE ===');

  // 1. In aeon_cinema_db: Create BookingDetail table
  await cEn.query(`
    CREATE TABLE IF NOT EXISTS "BookingDetail" (
      "id" TEXT PRIMARY KEY,
      "bookingId" TEXT NOT NULL REFERENCES "Booking"("id") ON DELETE CASCADE,
      "showtimeId" TEXT NOT NULL REFERENCES "Showtime"("id") ON DELETE CASCADE,
      "seatId" TEXT NOT NULL REFERENCES "Seat"("id") ON DELETE CASCADE,
      "ticketPriceId" TEXT REFERENCES "TicketPrice"("id") ON DELETE SET NULL,
      "price" DOUBLE PRECISION NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS "idx_bookingdetail_booking" ON "BookingDetail"("bookingId");
    CREATE INDEX IF NOT EXISTS "idx_bookingdetail_showtime" ON "BookingDetail"("showtimeId");
    CREATE INDEX IF NOT EXISTS "idx_bookingdetail_seat" ON "BookingDetail"("seatId");
    CREATE INDEX IF NOT EXISTS "idx_bookingdetail_ticketprice" ON "BookingDetail"("ticketPriceId");
  `);

  // Add bookingDetailId column to Ticket if not exists
  await cEn.query(`
    ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "bookingDetailId" TEXT REFERENCES "BookingDetail"("id") ON DELETE CASCADE;
  `);

  // Sync existing tickets to BookingDetail
  await cEn.query(`
    INSERT INTO "BookingDetail" ("id", "bookingId", "showtimeId", "seatId", "ticketPriceId", "price", "createdAt", "updatedAt")
    SELECT t."id", t."bookingId", t."showtimeId", t."seatId", t."ticketPriceId", t."price", t."createdAt", t."updatedAt"
    FROM "Ticket" t
    ON CONFLICT ("id") DO NOTHING;

    UPDATE "Ticket" t
    SET "bookingDetailId" = t."id"
    WHERE t."bookingDetailId" IS NULL;
  `);
  console.log('✓ Created and populated BookingDetail in aeon_cinema_db');

  // 2. In aeon_cinema_db_vi: Create ChiTietDonDatVe table
  await cVi.query(`
    CREATE TABLE IF NOT EXISTS "ChiTietDonDatVe" (
      "maChiTietDonHang" VARCHAR(36) PRIMARY KEY,
      "maDonHang" VARCHAR(36) NOT NULL REFERENCES "DonDatVe"("maDonHang") ON DELETE CASCADE,
      "maSuatChieu" VARCHAR(36) NOT NULL REFERENCES "SuatChieu"("maSuatChieu") ON DELETE CASCADE,
      "maGhe" VARCHAR(36) NOT NULL REFERENCES "GheNgoi"("maGhe") ON DELETE CASCADE,
      "maBangGia" VARCHAR(36) REFERENCES "BangGiaVe"("maBangGia") ON DELETE SET NULL,
      "giaVe" DOUBLE PRECISION NOT NULL,
      "ngayTao" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "ngayCapNhat" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS "idx_chitietdondatve_donhang" ON "ChiTietDonDatVe"("maDonHang");
    CREATE INDEX IF NOT EXISTS "idx_chitietdondatve_suatchieu" ON "ChiTietDonDatVe"("maSuatChieu");
    CREATE INDEX IF NOT EXISTS "idx_chitietdondatve_ghe" ON "ChiTietDonDatVe"("maGhe");
    CREATE INDEX IF NOT EXISTS "idx_chitietdondatve_banggia" ON "ChiTietDonDatVe"("maBangGia");
  `);

  // Add maChiTietDonHang column to VeXemPhim if not exists
  await cVi.query(`
    ALTER TABLE "VeXemPhim" ADD COLUMN IF NOT EXISTS "maChiTietDonHang" VARCHAR(36) REFERENCES "ChiTietDonDatVe"("maChiTietDonHang") ON DELETE CASCADE;
  `);

  // Sync existing tickets to ChiTietDonDatVe
  await cVi.query(`
    INSERT INTO "ChiTietDonDatVe" ("maChiTietDonHang", "maDonHang", "maSuatChieu", "maGhe", "maBangGia", "giaVe", "ngayTao", "ngayCapNhat")
    SELECT v."maVe", v."maDonHang", v."maSuatChieu", v."maGhe", v."maBangGia", v."giaVe", v."ngayTao", v."ngayCapNhat"
    FROM "VeXemPhim" v
    ON CONFLICT ("maChiTietDonHang") DO NOTHING;

    UPDATE "VeXemPhim" v
    SET "maChiTietDonHang" = v."maVe"
    WHERE v."maChiTietDonHang" IS NULL;
  `);
  console.log('✓ Created and populated ChiTietDonDatVe in aeon_cinema_db_vi');

  await cEn.end();
  await cVi.end();
  console.log('=== DONE ===');
}

run().catch(console.error);
