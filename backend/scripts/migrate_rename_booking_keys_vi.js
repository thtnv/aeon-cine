const { Client } = require('pg');

async function migrate() {
  const client = new Client('postgresql://postgres:123456@localhost:5432/aeon_cinema_db_vi');
  await client.connect();

  console.log('🚀 Bắt đầu chuẩn hóa tên khóa DonDatVe & ChiTietDonDatVe trên aeon_cinema_db_vi...');

  try {
    await client.query('BEGIN');

    // 1. Kiểm tra và đổi tên cột trong DonDatVe
    console.log('1. Cập nhật bảng DonDatVe...');
    const checkDdvCol = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'DonDatVe' AND column_name IN ('maDonHang', 'trangThaiDonHang');
    `);
    const ddvCols = checkDdvCol.rows.map(r => r.column_name);

    if (ddvCols.includes('maDonHang')) {
      await client.query(`ALTER TABLE "DonDatVe" RENAME COLUMN "maDonHang" TO "maDonDatVe";`);
      console.log('  ✓ Đã đổi tên DonDatVe.maDonHang ➔ DonDatVe.maDonDatVe');
    }
    if (ddvCols.includes('trangThaiDonHang')) {
      await client.query(`ALTER TABLE "DonDatVe" RENAME COLUMN "trangThaiDonHang" TO "trangThaiDatVe";`);
      console.log('  ✓ Đã đổi tên DonDatVe.trangThaiDonHang ➔ DonDatVe.trangThaiDatVe');
    }

    // 2. Kiểm tra và đổi tên cột trong ChiTietDonDatVe
    console.log('2. Cập nhật bảng ChiTietDonDatVe...');
    const checkCtCol = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'ChiTietDonDatVe' AND column_name IN ('maChiTietDonHang', 'maDonHang');
    `);
    const ctCols = checkCtCol.rows.map(r => r.column_name);

    if (ctCols.includes('maChiTietDonHang')) {
      await client.query(`ALTER TABLE "ChiTietDonDatVe" RENAME COLUMN "maChiTietDonHang" TO "maChiTietDatVe";`);
      console.log('  ✓ Đã đổi tên ChiTietDonDatVe.maChiTietDonHang ➔ ChiTietDonDatVe.maChiTietDatVe');
    }
    if (ctCols.includes('maDonHang')) {
      await client.query(`ALTER TABLE "ChiTietDonDatVe" RENAME COLUMN "maDonHang" TO "maDonDatVe";`);
      console.log('  ✓ Đã đổi tên ChiTietDonDatVe.maDonHang ➔ ChiTietDonDatVe.maDonDatVe');
    }

    // 3. Kiểm tra và đổi tên cột trong ChiTietDichVuDonHang
    console.log('3. Cập nhật bảng ChiTietDichVuDonHang...');
    const checkDdvCol2 = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'ChiTietDichVuDonHang' AND column_name = 'maDonHang';
    `);
    if (checkDdvCol2.rows.length > 0) {
      await client.query(`ALTER TABLE "ChiTietDichVuDonHang" RENAME COLUMN "maDonHang" TO "maDonDatVe";`);
      console.log('  ✓ Đã đổi tên ChiTietDichVuDonHang.maDonHang ➔ ChiTietDichVuDonHang.maDonDatVe');
    }

    // 4. Đổi tên Foreign Key constraints & Indexes cho đồng bộ, chuẩn chỉ
    console.log('4. Cập nhật constraints và indexes...');
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ChiTietDonDatVe_maDonHang_fkey') THEN
          ALTER TABLE "ChiTietDonDatVe" RENAME CONSTRAINT "ChiTietDonDatVe_maDonHang_fkey" TO "ChiTietDonDatVe_maDonDatVe_fkey";
        END IF;

        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ChiTietComboDonHang_maDonHang_fkey') THEN
          ALTER TABLE "ChiTietDichVuDonHang" RENAME CONSTRAINT "ChiTietComboDonHang_maDonHang_fkey" TO "ChiTietDichVuDonHang_maDonDatVe_fkey";
        END IF;

        IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_chitietdondatve_donhang') THEN
          ALTER INDEX "idx_chitietdondatve_donhang" RENAME TO "idx_chitietdondatve_dondatve";
        END IF;
      END $$;
    `);
    console.log('  ✓ Đã chuẩn hóa tên constraints & indexes liên quan.');

    await client.query('COMMIT');
    console.log('\n✨ HOÀN TẤT CHUYỂN ĐỔI CHUẨN HÓA KHÓA VÀ CỘT TRÊN aeon_cinema_db_vi!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi di chuyển dữ liệu:', error);
    throw error;
  } finally {
    await client.end();
  }
}

migrate().catch(console.error);
