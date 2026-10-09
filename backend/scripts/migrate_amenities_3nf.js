const { Client } = require('pg');
const { randomUUID } = require('crypto');

const ICON_MAP = {
  'Phòng chiếu Laser 4K': 'video',
  'Phòng chiếu Laser': 'video',
  'Phòng chiếu IMAX': 'film',
  'Phòng chiếu IMAX 4K': 'film',
  'Màn hình 4K': 'tv',
  'Âm thanh Dolby Atmos': 'volume-2',
  'Ghế Đôi Sweetbox': 'heart',
  'Ghế Sofa VIP': 'armchair',
  'Bãi đỗ xe thông minh': 'car',
  'Bãi đỗ xe ô tô': 'car',
  'Bãi đỗ xe máy': 'bike',
  'Căn tin Bắp Nước Cao Cấp': 'coffee',
  'Căn tin Bắp Nước': 'coffee',
  'Combo Bắp nước độc quyền': 'coffee',
  'Thanh toán VNPay QR': 'credit-card',
  'Khu vui chơi trẻ em': 'smile',
  'Lối đi người khuyết tật': 'accessibility',
  'Phòng chờ VIP Lounge': 'coffee'
};

function getIcon(name) {
  return ICON_MAP[name] || 'check-circle';
}

async function migrateEnglishDb(dbUrl, dbLabel) {
  console.log(`\n======================================================`);
  console.log(`🚀 BẮT ĐẦU CHUẨN HÓA 3NF TIỆN ÍCH CHO: ${dbLabel}`);
  console.log(`======================================================`);

  const client = new Client(typeof dbUrl === 'string' ? { connectionString: dbUrl } : dbUrl);
  await client.connect();

  try {
    await client.query('BEGIN');

    // 1. Tạo bảng Amenity
    console.log('1. Đang tạo bảng Amenity...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Amenity" (
        "id" VARCHAR(36) PRIMARY KEY,
        "name" VARCHAR(100) UNIQUE NOT NULL,
        "icon" VARCHAR(50),
        "description" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Tạo bảng CinemaAmenity (Quan hệ N-N)
    console.log('2. Đang tạo bảng CinemaAmenity...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "CinemaAmenity" (
        "cinemaId" VARCHAR(36) NOT NULL REFERENCES "Cinema"("id") ON DELETE CASCADE,
        "amenityId" VARCHAR(36) NOT NULL REFERENCES "Amenity"("id") ON DELETE CASCADE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY ("cinemaId", "amenityId")
      );
      CREATE INDEX IF NOT EXISTS "idx_cinemaamenity_cinema" ON "CinemaAmenity"("cinemaId");
      CREATE INDEX IF NOT EXISTS "idx_cinemaamenity_amenity" ON "CinemaAmenity"("amenityId");
    `);

    // 3. Kiểm tra cột amenities trong Cinema
    const checkCol = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'Cinema' AND column_name = 'amenities';
    `);

    if (checkCol.rows.length > 0) {
      console.log('3. Đang chuyển dữ liệu từ Cinema.amenities sang Amenity và CinemaAmenity...');
      const cinemas = (await client.query('SELECT "id", "amenities" FROM "Cinema"')).rows;

      const amenityMap = new Map(); // name -> id

      for (const cinema of cinemas) {
        const rawAmenities = cinema.amenities;
        if (Array.isArray(rawAmenities)) {
          for (const item of rawAmenities) {
            const trimmed = String(item).trim();
            if (!trimmed) continue;

            let amenityId = amenityMap.get(trimmed);
            if (!amenityId) {
              // Kiểm tra xem đã có trong DB chưa
              const existing = await client.query('SELECT "id" FROM "Amenity" WHERE "name" = $1', [trimmed]);
              if (existing.rows.length > 0) {
                amenityId = existing.rows[0].id;
              } else {
                amenityId = randomUUID();
                await client.query(`
                  INSERT INTO "Amenity" ("id", "name", "icon", "description") 
                  VALUES ($1, $2, $3, $4)
                  ON CONFLICT ("name") DO NOTHING
                `, [amenityId, trimmed, getIcon(trimmed), `Tiện ích rạp chiếu: ${trimmed}`]);
              }
              amenityMap.set(trimmed, amenityId);
            }

            // Ghi nhận quan hệ
            await client.query(`
              INSERT INTO "CinemaAmenity" ("cinemaId", "amenityId")
              VALUES ($1, $2)
              ON CONFLICT ("cinemaId", "amenityId") DO NOTHING
            `, [cinema.id, amenityId]);
          }
        }
      }
      console.log(`  ✓ Đã chuyển đổi ${amenityMap.size} danh mục tiện ích.`);

      // 4. Drop column amenities trong Cinema
      console.log('4. Xóa cột đa trị Cinema.amenities (Chuẩn hóa 3NF)...');
      await client.query('ALTER TABLE "Cinema" DROP COLUMN "amenities";');
      console.log('  ✓ Đã DROP COLUMN Cinema.amenities thành công.');
    } else {
      console.log('ℹ️ Cột Cinema.amenities đã được gỡ bỏ trước đó.');
    }

    await client.query('COMMIT');
    console.log(`✨ HOÀN TẤT CHUẨN HÓA 3NF CHO: ${dbLabel}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Lỗi chuẩn hóa ${dbLabel}:`, error);
    throw error;
  } finally {
    await client.end();
  }
}

async function migrateVietnameseDb(dbUrl) {
  console.log(`\n======================================================`);
  console.log(`🚀 BẮT ĐẦU CHUẨN HÓA 3NF TIỆN ÍCH CHO: aeon_cinema_db_vi`);
  console.log(`======================================================`);

  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  try {
    await client.query('BEGIN');

    // 1. Tạo bảng TienIch
    console.log('1. Đang tạo bảng TienIch...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "TienIch" (
        "maTienIch" VARCHAR(36) PRIMARY KEY,
        "tenTienIch" VARCHAR(100) UNIQUE NOT NULL,
        "bieuTuong" VARCHAR(50),
        "moTa" TEXT,
        "ngayTao" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "ngayCapNhat" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Tạo bảng CumRapTienIch (Quan hệ N-N)
    console.log('2. Đang tạo bảng CumRapTienIch...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "CumRapTienIch" (
        "maCumRap" VARCHAR(36) NOT NULL REFERENCES "CumRap"("maCumRap") ON DELETE CASCADE,
        "maTienIch" VARCHAR(36) NOT NULL REFERENCES "TienIch"("maTienIch") ON DELETE CASCADE,
        "ngayTao" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY ("maCumRap", "maTienIch")
      );
      CREATE INDEX IF NOT EXISTS "idx_cumraptienich_cumrap" ON "CumRapTienIch"("maCumRap");
      CREATE INDEX IF NOT EXISTS "idx_cumraptienich_tienich" ON "CumRapTienIch"("maTienIch");
    `);

    // 3. Kiểm tra cột tienIch trong CumRap
    const checkCol = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'CumRap' AND column_name = 'tienIch';
    `);

    if (checkCol.rows.length > 0) {
      console.log('3. Đang chuyển dữ liệu từ CumRap.tienIch sang TienIch và CumRapTienIch...');
      const cinemas = (await client.query('SELECT "maCumRap", "tienIch" FROM "CumRap"')).rows;

      const amenityMap = new Map(); // name -> id

      for (const cinema of cinemas) {
        const rawAmenities = cinema.tienIch;
        if (Array.isArray(rawAmenities)) {
          for (const item of rawAmenities) {
            const trimmed = String(item).trim();
            if (!trimmed) continue;

            let amenityId = amenityMap.get(trimmed);
            if (!amenityId) {
              const existing = await client.query('SELECT "maTienIch" FROM "TienIch" WHERE "tenTienIch" = $1', [trimmed]);
              if (existing.rows.length > 0) {
                amenityId = existing.rows[0].maTienIch;
              } else {
                amenityId = randomUUID();
                await client.query(`
                  INSERT INTO "TienIch" ("maTienIch", "tenTienIch", "bieuTuong", "moTa") 
                  VALUES ($1, $2, $3, $4)
                  ON CONFLICT ("tenTienIch") DO NOTHING
                `, [amenityId, trimmed, getIcon(trimmed), `Tiện ích rạp chiếu: ${trimmed}`]);
              }
              amenityMap.set(trimmed, amenityId);
            }

            await client.query(`
              INSERT INTO "CumRapTienIch" ("maCumRap", "maTienIch")
              VALUES ($1, $2)
              ON CONFLICT ("maCumRap", "maTienIch") DO NOTHING
            `, [cinema.maCumRap, amenityId]);
          }
        }
      }
      console.log(`  ✓ Đã chuyển đổi ${amenityMap.size} danh mục tiện ích tiếng Việt.`);

      // 4. Drop column tienIch trong CumRap
      console.log('4. Xóa cột đa trị CumRap.tienIch (Chuẩn hóa 3NF)...');
      await client.query('ALTER TABLE "CumRap" DROP COLUMN "tienIch";');
      console.log('  ✓ Đã DROP COLUMN CumRap.tienIch thành công.');
    } else {
      console.log('ℹ️ Cột CumRap.tienIch đã được gỡ bỏ trước đó.');
    }

    await client.query('COMMIT');
    console.log(`✨ HOÀN TẤT CHUẨN HÓA 3NF CHO: aeon_cinema_db_vi`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Lỗi chuẩn hóa aeon_cinema_db_vi:`, error);
    throw error;
  } finally {
    await client.end();
  }
}

async function run() {
  const localEn = 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db';
  const localVi = 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db_vi';
  const supabase = {
    connectionString: 'postgresql://postgres.mjgsrwifsbemhcavmkyg:nguyenvanvien9876@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  };

  await migrateEnglishDb(localEn, 'aeon_cinema_db (Local English)');
  await migrateVietnameseDb(localVi);

  try {
    await migrateEnglishDb(supabase, 'Supabase Cloud Pooler DB');
  } catch (err) {
    console.warn('⚠️ Supabase Cloud migration skipped or failed (will sync later):', err.message);
  }
}

run().catch(console.error);
