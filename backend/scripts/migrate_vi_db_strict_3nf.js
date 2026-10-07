const { Client } = require('pg');

async function migrateViDbStrict3NF() {
  const client = new Client({ connectionString: 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db_vi' });
  await client.connect();
  console.log('=== NORMALIZING aeon_cinema_db_vi TO STRICT 3NF ===');

  try {
    // 1. GheNgoi
    console.log('1. Normalizing GheNgoi...');
    await client.query(`
      UPDATE "GheNgoi" g
      SET "maLoaiGhe" = lg."maLoaiGhe"
      FROM "LoaiGhe" lg
      WHERE g."maLoaiGhe" IS NULL AND (g."loaiGhe" = lg."maCode" OR g."loaiGhe" = lg."maLoaiGhe");
    `);
    await client.query(`
      UPDATE "GheNgoi"
      SET "maLoaiGhe" = (SELECT "maLoaiGhe" FROM "LoaiGhe" WHERE "maCode" = 'STANDARD' LIMIT 1)
      WHERE "maLoaiGhe" IS NULL;
    `);

    // Drop redundant loaiGhe column if exists
    const gheCols = (await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'GheNgoi' AND column_name = 'loaiGhe';
    `)).rows;
    if (gheCols.length > 0) {
      await client.query(`ALTER TABLE "GheNgoi" DROP COLUMN "loaiGhe";`);
      console.log('✓ Dropped column loaiGhe from GheNgoi');
    }

    // Add FK constraint to LoaiGhe
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ghengoi_loaighe') THEN
          ALTER TABLE "GheNgoi" ADD CONSTRAINT "fk_ghengoi_loaighe" 
          FOREIGN KEY ("maLoaiGhe") REFERENCES "LoaiGhe"("maLoaiGhe") ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    // 2. NguoiDung
    console.log('2. Normalizing NguoiDung...');
    await client.query(`
      UPDATE "NguoiDung" u
      SET "maVaiTro" = vt."maVaiTro"
      FROM "VaiTro" vt
      WHERE u."maVaiTro" IS NULL AND (u."vaiTro" = vt."maCode" OR (u."vaiTro" IS NULL AND vt."maCode" = 'USER'));
    `);
    await client.query(`
      UPDATE "NguoiDung"
      SET "maVaiTro" = (SELECT "maVaiTro" FROM "VaiTro" WHERE "maCode" = 'USER' LIMIT 1)
      WHERE "maVaiTro" IS NULL;
    `);

    await client.query(`
      UPDATE "NguoiDung" u
      SET "maHangThanhVien" = h."maHangThanhVien"
      FROM "HangThanhVien" h
      WHERE u."maHangThanhVien" IS NULL AND (u."hangThanhVien" = h."maCode" OR (u."hangThanhVien" IS NULL AND h."maCode" = 'STAR'));
    `);
    await client.query(`
      UPDATE "NguoiDung"
      SET "maHangThanhVien" = (SELECT "maHangThanhVien" FROM "HangThanhVien" WHERE "maCode" = 'STAR' LIMIT 1)
      WHERE "maHangThanhVien" IS NULL;
    `);

    // Drop redundant columns
    const ndRoleCol = (await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'NguoiDung' AND column_name = 'vaiTro';
    `)).rows;
    if (ndRoleCol.length > 0) {
      await client.query(`ALTER TABLE "NguoiDung" DROP COLUMN "vaiTro";`);
      console.log('✓ Dropped column vaiTro from NguoiDung');
    }

    const ndHangCol = (await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'NguoiDung' AND column_name = 'hangThanhVien';
    `)).rows;
    if (ndHangCol.length > 0) {
      await client.query(`ALTER TABLE "NguoiDung" DROP COLUMN "hangThanhVien";`);
      console.log('✓ Dropped column hangThanhVien from NguoiDung');
    }

    // Add FKs
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_nguoidung_vaitro') THEN
          ALTER TABLE "NguoiDung" ADD CONSTRAINT "fk_nguoidung_vaitro" 
          FOREIGN KEY ("maVaiTro") REFERENCES "VaiTro"("maVaiTro") ON DELETE SET NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_nguoidung_hangthanhvien') THEN
          ALTER TABLE "NguoiDung" ADD CONSTRAINT "fk_nguoidung_hangthanhvien" 
          FOREIGN KEY ("maHangThanhVien") REFERENCES "HangThanhVien"("maHangThanhVien") ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // 3. DonDatVe
    console.log('3. Normalizing DonDatVe...');
    await client.query(`
      UPDATE "DonDatVe" d
      SET "maPhuongThuc" = pt."maPhuongThuc"
      FROM "PhuongThucThanhToan" pt
      WHERE d."maPhuongThuc" IS NULL AND UPPER(d."phuongThucThanhToan") = pt."maCode";
    `);
    await client.query(`
      UPDATE "DonDatVe"
      SET "maPhuongThuc" = (SELECT "maPhuongThuc" FROM "PhuongThucThanhToan" WHERE "maCode" = 'VNPAY' LIMIT 1)
      WHERE "maPhuongThuc" IS NULL;
    `);

    const ddvPmCol = (await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'DonDatVe' AND column_name = 'phuongThucThanhToan';
    `)).rows;
    if (ddvPmCol.length > 0) {
      await client.query(`ALTER TABLE "DonDatVe" DROP COLUMN "phuongThucThanhToan";`);
      console.log('✓ Dropped column phuongThucThanhToan from DonDatVe');
    }

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_dondatve_phuongthuc') THEN
          ALTER TABLE "DonDatVe" ADD CONSTRAINT "fk_dondatve_phuongthuc" 
          FOREIGN KEY ("maPhuongThuc") REFERENCES "PhuongThucThanhToan"("maPhuongThuc") ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // 4. SuatChieu
    console.log('4. Normalizing SuatChieu...');
    await client.query(`
      UPDATE "SuatChieu" sc
      SET "maDinhDang" = dd."maDinhDang"
      FROM "DinhDangChieu" dd
      WHERE sc."maDinhDang" IS NULL AND UPPER(sc."dinhDang") = dd."maCode";
    `);
    await client.query(`
      UPDATE "SuatChieu"
      SET "maDinhDang" = (SELECT "maDinhDang" FROM "DinhDangChieu" WHERE "maCode" = '2D' LIMIT 1)
      WHERE "maDinhDang" IS NULL;
    `);

    const scFormatCol = (await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'SuatChieu' AND column_name = 'dinhDang';
    `)).rows;
    if (scFormatCol.length > 0) {
      await client.query(`ALTER TABLE "SuatChieu" DROP COLUMN "dinhDang";`);
      console.log('✓ Dropped column dinhDang from SuatChieu');
    }

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_suatchieu_dinhdang') THEN
          ALTER TABLE "SuatChieu" ADD CONSTRAINT "fk_suatchieu_dinhdang" 
          FOREIGN KEY ("maDinhDang") REFERENCES "DinhDangChieu"("maDinhDang") ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    // 5. BangGiaVe
    console.log('5. Normalizing BangGiaVe...');
    await client.query(`ALTER TABLE "BangGiaVe" ADD COLUMN IF NOT EXISTS "maLoaiGhe" VARCHAR(36);`);
    await client.query(`ALTER TABLE "BangGiaVe" ADD COLUMN IF NOT EXISTS "maDinhDang" VARCHAR(36);`);

    const bgvLgCol = (await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'BangGiaVe' AND column_name = 'loaiGhe';
    `)).rows;
    if (bgvLgCol.length > 0) {
      await client.query(`
        UPDATE "BangGiaVe" bg
        SET "maLoaiGhe" = lg."maLoaiGhe"
        FROM "LoaiGhe" lg
        WHERE bg."maLoaiGhe" IS NULL AND bg."loaiGhe" = lg."maCode";
      `);
      await client.query(`
        UPDATE "BangGiaVe" bg
        SET "maDinhDang" = dd."maDinhDang"
        FROM "DinhDangChieu" dd
        WHERE bg."maDinhDang" IS NULL AND bg."dinhDang" = dd."maCode";
      `);
      await client.query(`ALTER TABLE "BangGiaVe" DROP COLUMN "loaiGhe";`);
      await client.query(`ALTER TABLE "BangGiaVe" DROP COLUMN "dinhDang";`);
      console.log('✓ Dropped columns loaiGhe, dinhDang from BangGiaVe');
    }

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_banggiave_loaighe') THEN
          ALTER TABLE "BangGiaVe" ADD CONSTRAINT "fk_banggiave_loaighe" 
          FOREIGN KEY ("maLoaiGhe") REFERENCES "LoaiGhe"("maLoaiGhe") ON DELETE CASCADE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_banggiave_dinhdang') THEN
          ALTER TABLE "BangGiaVe" ADD CONSTRAINT "fk_banggiave_dinhdang" 
          FOREIGN KEY ("maDinhDang") REFERENCES "DinhDangChieu"("maDinhDang") ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    // 6. VeXemPhim -> BangGiaVe
    console.log('6. Normalizing VeXemPhim...');
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_vexemphim_banggiave') THEN
          ALTER TABLE "VeXemPhim" ADD CONSTRAINT "fk_vexemphim_banggiave" 
          FOREIGN KEY ("maBangGia") REFERENCES "BangGiaVe"("maBangGia") ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // 7. DatVeNhom
    console.log('7. Normalizing DatVeNhom...');
    const dvnRapCol = (await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'DatVeNhom' AND column_name = 'tenCumRap';
    `)).rows;
    if (dvnRapCol.length > 0) {
      await client.query(`ALTER TABLE "DatVeNhom" DROP COLUMN "tenCumRap";`);
      console.log('✓ Dropped column tenCumRap from DatVeNhom');
    }

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_datvenhom_cumrap') THEN
          ALTER TABLE "DatVeNhom" ADD CONSTRAINT "fk_datvenhom_cumrap" 
          FOREIGN KEY ("maCumRap") REFERENCES "CumRap"("maCumRap") ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // 8. BaiVietTinTuc
    console.log('8. Normalizing BaiVietTinTuc...');
    const bvTacGiaCol = (await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'BaiVietTinTuc' AND column_name = 'tacGia';
    `)).rows;
    if (bvTacGiaCol.length > 0) {
      await client.query(`ALTER TABLE "BaiVietTinTuc" DROP COLUMN "tacGia";`);
      console.log('✓ Dropped column tacGia from BaiVietTinTuc');
    }

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_baiviettintuc_nguoidung') THEN
          ALTER TABLE "BaiVietTinTuc" ADD CONSTRAINT "fk_baiviettintuc_nguoidung" 
          FOREIGN KEY ("maTacGia") REFERENCES "NguoiDung"("maNguoiDung") ON DELETE SET NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_baiviettintuc_phim') THEN
          ALTER TABLE "BaiVietTinTuc" ADD CONSTRAINT "fk_baiviettintuc_phim" 
          FOREIGN KEY ("maPhim") REFERENCES "Phim"("maPhim") ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // 9. MaGiamGia -> ChuongTrinhKhuyenMai
    console.log('9. Normalizing MaGiamGia...');
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_magiamgia_khuyenmai') THEN
          ALTER TABLE "MaGiamGia" ADD CONSTRAINT "fk_magiamgia_khuyenmai" 
          FOREIGN KEY ("maKhuyenMai") REFERENCES "ChuongTrinhKhuyenMai"("maKhuyenMai") ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // 10. KhoaGiuGheTamThoi -> GheNgoi, NguoiDung
    console.log('10. Normalizing KhoaGiuGheTamThoi...');
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_khoagiughe_ghengoi') THEN
          ALTER TABLE "KhoaGiuGheTamThoi" ADD CONSTRAINT "fk_khoagiughe_ghengoi" 
          FOREIGN KEY ("maGhe") REFERENCES "GheNgoi"("maGhe") ON DELETE CASCADE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_khoagiughe_nguoidung') THEN
          ALTER TABLE "KhoaGiuGheTamThoi" ADD CONSTRAINT "fk_khoagiughe_nguoidung" 
          FOREIGN KEY ("maNguoiDung") REFERENCES "NguoiDung"("maNguoiDung") ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    // 11. ChiTietDichVuDonHang: Rename columns if needed to align perfectly with DichVu
    console.log('11. Normalizing ChiTietDichVuDonHang...');
    const ctCols = (await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'ChiTietDichVuDonHang' AND column_name = 'maCombo';
    `)).rows;
    if (ctCols.length > 0) {
      await client.query(`ALTER TABLE "ChiTietDichVuDonHang" RENAME COLUMN "maCombo" TO "maDichVu";`);
      console.log('✓ Renamed ChiTietDichVuDonHang.maCombo -> maDichVu');
    }
    const dvCols = (await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'DichVu' AND column_name = 'maCombo';
    `)).rows;
    if (dvCols.length > 0) {
      await client.query(`ALTER TABLE "DichVu" RENAME COLUMN "maCombo" TO "maDichVu";`);
      await client.query(`ALTER TABLE "DichVu" RENAME COLUMN "tenCombo" TO "tenDichVu";`);
      console.log('✓ Renamed DichVu.maCombo -> maDichVu, tenCombo -> tenDichVu');
    }

    console.log('\n=== VIETNAMESE DATABASE NORMALIZATION COMPLETED SUCCESSFULLY! ===');
  } catch (err) {
    console.error('Migration error in VI db:', err);
    throw err;
  } finally {
    await client.end();
  }
}

migrateViDbStrict3NF();
