const { Client } = require('pg');

async function migrate() {
  const client = new Client({ connectionString: 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db' });
  await client.connect();
  console.log('--- 1. RENAMING TABLES IN aeon_cinema_db ACCORDING TO ACADEMIC/CINEMA STANDARDS ---');

  // Check if tables exist before renaming
  const existingTables = (await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")).rows.map(r => r.table_name);

  // 1. Rename FoodCombo -> Service (Đổi Bắp nước thành Dịch vụ theo ý GVHD)
  if (existingTables.includes('FoodCombo') && !existingTables.includes('Service')) {
    await client.query('ALTER TABLE "FoodCombo" RENAME TO "Service";');
    console.log('✓ Renamed table FoodCombo -> Service');
  } else {
    console.log('- Table Service already renamed or FoodCombo not found');
  }

  // 2. Rename BookingFood -> BookingService (Chi tiết dịch vụ đơn hàng)
  if (existingTables.includes('BookingFood') && !existingTables.includes('BookingService')) {
    await client.query('ALTER TABLE "BookingFood" RENAME TO "BookingService";');
    console.log('✓ Renamed table BookingFood -> BookingService');
  } else {
    console.log('- Table BookingService already renamed or BookingFood not found');
  }

  // 3. Rename PriceConfig -> TicketPrice (Bảng giá vé)
  if (existingTables.includes('PriceConfig') && !existingTables.includes('TicketPrice')) {
    await client.query('ALTER TABLE "PriceConfig" RENAME TO "TicketPrice";');
    console.log('✓ Renamed table PriceConfig -> TicketPrice');
  } else {
    console.log('- Table TicketPrice already renamed or PriceConfig not found');
  }

  // 4. Rename Blog -> Article (Bài viết tin tức & Góc điện ảnh)
  if (existingTables.includes('Blog') && !existingTables.includes('Article')) {
    await client.query('ALTER TABLE "Blog" RENAME TO "Article";');
    console.log('✓ Renamed table Blog -> Article');
  } else {
    console.log('- Table Article already renamed or Blog not found');
  }

  console.log('\n--- 2. CREATING NORMALIZED LOOKUP TABLES (ROLE, SEATTYPE, MEMBERSHIPLEVEL, PAYMENTMETHOD, SCREENFORMAT) ---');

  // Rename conflicting enum types so table names "Role" and "SeatType" can be created
  await client.query(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role' AND typtype = 'e') THEN
        ALTER TYPE "Role" RENAME TO "RoleEnum";
      END IF;
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SeatType' AND typtype = 'e') THEN
        ALTER TYPE "SeatType" RENAME TO "SeatTypeEnum";
      END IF;
    END $$;
  `);

  // 5. Create Role table
  await client.query(`
    CREATE TABLE IF NOT EXISTS "Role" (
      "id" VARCHAR(36) PRIMARY KEY,
      "code" VARCHAR(50) UNIQUE NOT NULL,
      "name" VARCHAR(100) NOT NULL,
      "description" TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);
  console.log('✓ Table Role verified/created.');

  // 6. Create SeatType table
  await client.query(`
    CREATE TABLE IF NOT EXISTS "SeatType" (
      "id" VARCHAR(36) PRIMARY KEY,
      "code" VARCHAR(50) UNIQUE NOT NULL,
      "name" VARCHAR(100) NOT NULL,
      "surcharge" FLOAT DEFAULT 0 NOT NULL,
      "description" TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);
  console.log('✓ Table SeatType verified/created.');

  // 7. Create MembershipLevel table
  await client.query(`
    CREATE TABLE IF NOT EXISTS "MembershipLevel" (
      "id" VARCHAR(36) PRIMARY KEY,
      "code" VARCHAR(50) UNIQUE NOT NULL,
      "name" VARCHAR(100) NOT NULL,
      "minPoints" INT DEFAULT 0 NOT NULL,
      "discountPercent" FLOAT DEFAULT 0 NOT NULL,
      "description" TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);
  console.log('✓ Table MembershipLevel verified/created.');

  // 8. Create PaymentMethod table
  await client.query(`
    CREATE TABLE IF NOT EXISTS "PaymentMethod" (
      "id" VARCHAR(36) PRIMARY KEY,
      "code" VARCHAR(50) UNIQUE NOT NULL,
      "name" VARCHAR(100) NOT NULL,
      "description" TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);
  console.log('✓ Table PaymentMethod verified/created.');

  // 9. Create ScreenFormat table
  await client.query(`
    CREATE TABLE IF NOT EXISTS "ScreenFormat" (
      "id" VARCHAR(36) PRIMARY KEY,
      "code" VARCHAR(50) UNIQUE NOT NULL,
      "name" VARCHAR(100) NOT NULL,
      "description" TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);
  console.log('✓ Table ScreenFormat verified/created.');

  console.log('\n--- 3. SEEDING NORMALIZED LOOKUP DATA ---');

  // Seed Roles
  const roles = [
    { code: 'USER', name: 'Khách Hàng', desc: 'Khách hàng thành viên sử dụng website đặt vé xem phim' },
    { code: 'ADMIN', name: 'Quản Trị Viên', desc: 'Quản trị viên toàn quyền quản lý hệ thống rạp chiếu' },
    { code: 'STAFF', name: 'Nhân Viên Rạp', desc: 'Nhân viên soát vé và vận hành tại quầy' },
    { code: 'ACCOUNTANT', name: 'Kế Toán Tài Chính', desc: 'Kế toán quản lý hóa đơn, giá vé và doanh thu' }
  ];
  for (const r of roles) {
    await client.query(`
      INSERT INTO "Role" ("id", "code", "name", "description", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
      ON CONFLICT ("code") DO UPDATE SET "name" = EXCLUDED."name", "description" = EXCLUDED."description", "updatedAt" = NOW();
    `, [r.code, r.name, r.desc]);
  }
  console.log('✓ Roles seeded.');

  // Seed SeatTypes
  const seatTypes = [
    { code: 'STANDARD', name: 'Ghế Thường Tiêu Chuẩn', surcharge: 0, desc: 'Ghế ngồi tiêu chuẩn êm ái, khoảng cách thoải mái' },
    { code: 'VIP', name: 'Ghế VIP Cao Cấp', surcharge: 20000, desc: 'Vị trí trung tâm phòng chiếu với góc nhìn toàn cảnh tối ưu' },
    { code: 'SWEETBOX', name: 'Ghế Đôi Sweetbox', surcharge: 80000, desc: 'Ghế đôi dành cho cặp đôi với vách ngăn riêng tư sang trọng' }
  ];
  for (const st of seatTypes) {
    await client.query(`
      INSERT INTO "SeatType" ("id", "code", "name", "surcharge", "description", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT ("code") DO UPDATE SET "name" = EXCLUDED."name", "surcharge" = EXCLUDED."surcharge", "updatedAt" = NOW();
    `, [st.code, st.name, st.surcharge, st.desc]);
  }
  console.log('✓ SeatTypes seeded.');

  // Seed MembershipLevels
  const memLevels = [
    { code: 'STAR', name: 'Hội Viên Star Club', min: 0, disc: 0, desc: 'Hạng thành viên cơ bản, tích 1 điểm cho mỗi 10.000 VNĐ chi tiêu' },
    { code: 'GSTAR', name: 'Hội Viên G-Star Vàng', min: 100, disc: 5, desc: 'Hạng thành viên vàng, ưu đãi giảm 5% bắp nước và quà sinh nhật' },
    { code: 'XSTAR', name: 'Hội Viên X-Star VIP', min: 500, disc: 10, desc: 'Hạng thành viên kim cương, ưu đãi giảm 10% vé + bắp nước và phòng chờ VIP' }
  ];
  for (const ml of memLevels) {
    await client.query(`
      INSERT INTO "MembershipLevel" ("id", "code", "name", "minPoints", "discountPercent", "description", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT ("code") DO UPDATE SET "name" = EXCLUDED."name", "minPoints" = EXCLUDED."minPoints", "discountPercent" = EXCLUDED."discountPercent", "updatedAt" = NOW();
    `, [ml.code, ml.name, ml.min, ml.disc, ml.desc]);
  }
  console.log('✓ MembershipLevels seeded.');

  // Seed PaymentMethods
  const paymentMethods = [
    { code: 'VNPAY', name: 'Cổng Thanh Toán VNPAY-QR', desc: 'Thanh toán trực tuyến bảo mật qua ứng dụng ngân hàng và VNPAY' },
    { code: 'MOMO', name: 'Ví Điện Tử MoMo', desc: 'Thanh toán siêu tốc qua ví điện tử MoMo' },
    { code: 'CASH', name: 'Tiền Mặt Tại Quầy Vé', desc: 'Thanh toán trực tiếp bằng tiền mặt tại quầy vé rạp' }
  ];
  for (const pm of paymentMethods) {
    await client.query(`
      INSERT INTO "PaymentMethod" ("id", "code", "name", "description", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
      ON CONFLICT ("code") DO UPDATE SET "name" = EXCLUDED."name", "updatedAt" = NOW();
    `, [pm.code, pm.name, pm.desc]);
  }
  console.log('✓ PaymentMethods seeded.');

  // Seed ScreenFormats
  const formats = [
    { code: '2D', name: 'Chuẩn 2D Digital', desc: 'Định dạng 2D Digital độ phân giải cao tiêu chuẩn quốc tế' },
    { code: '3D', name: 'Kính 3D Thực Tế Sâu', desc: 'Định dạng 3D không gian ba chiều sống động kèm kính chuyên dụng' },
    { code: 'IMAX', name: 'Đại Siêu Phóng IMAX Laser', desc: 'Công nghệ chiếu phim màn ảnh đại vòm IMAX Laser 4K thế hệ mới' }
  ];
  for (const f of formats) {
    await client.query(`
      INSERT INTO "ScreenFormat" ("id", "code", "name", "description", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
      ON CONFLICT ("code") DO UPDATE SET "name" = EXCLUDED."name", "updatedAt" = NOW();
    `, [f.code, f.name, f.desc]);
  }
  console.log('✓ ScreenFormats seeded.');

  console.log('\n--- 4. LINKING FOREIGN KEYS FROM MAIN ENTITIES TO LOOKUP TABLES ---');

  // Add foreign key columns if not exist
  await client.query(`
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "roleId" VARCHAR(36);
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "membershipLevelId" VARCHAR(36);
    ALTER TABLE "Seat" ADD COLUMN IF NOT EXISTS "typeId" VARCHAR(36);
    ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "paymentMethodId" VARCHAR(36);
    ALTER TABLE "Showtime" ADD COLUMN IF NOT EXISTS "formatId" VARCHAR(36);
  `);

  // Link User.roleId -> Role.id
  await client.query(`
    UPDATE "User" u
    SET "roleId" = r.id
    FROM "Role" r
    WHERE u.role::text = r.code;
  `);
  console.log('✓ Linked User.roleId -> Role.id');

  // Link User.membershipLevelId -> MembershipLevel.id
  await client.query(`
    UPDATE "User" u
    SET "membershipLevelId" = ml.id
    FROM "MembershipLevel" ml
    WHERE REPLACE(UPPER(u."membershipLevel"), '-', '') = ml.code;
  `);
  console.log('✓ Linked User.membershipLevelId -> MembershipLevel.id');

  // Link Seat.typeId -> SeatType.id
  await client.query(`
    UPDATE "Seat" s
    SET "typeId" = st.id
    FROM "SeatType" st
    WHERE s.type::text = st.code;
  `);
  console.log('✓ Linked Seat.typeId -> SeatType.id');

  // Link Booking.paymentMethodId -> PaymentMethod.id
  await client.query(`
    UPDATE "Booking" b
    SET "paymentMethodId" = pm.id
    FROM "PaymentMethod" pm
    WHERE UPPER(COALESCE(b."paymentMethod", 'VNPAY')) = pm.code;
  `);
  console.log('✓ Linked Booking.paymentMethodId -> PaymentMethod.id');

  // Link Showtime.formatId -> ScreenFormat.id
  await client.query(`
    UPDATE "Showtime" st
    SET "formatId" = sf.id
    FROM "ScreenFormat" sf
    WHERE UPPER(COALESCE(st.format, '2D')) = sf.code;
  `);
  console.log('✓ Linked Showtime.formatId -> ScreenFormat.id');

  // Add Foreign Key constraints if not present
  const addFkSafe = async (tbl, col, refTbl, refCol, constraintName) => {
    try {
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${constraintName}') THEN
            ALTER TABLE "${tbl}" ADD CONSTRAINT "${constraintName}" FOREIGN KEY ("${col}") REFERENCES "${refTbl}"("${refCol}") ON DELETE SET NULL;
          END IF;
        END $$;
      `);
      console.log(`✓ Constraint ${constraintName} ensured.`);
    } catch (err) {
      console.log(`- Note constraint ${constraintName}: ${err.message}`);
    }
  };

  await addFkSafe('User', 'roleId', 'Role', 'id', 'fk_user_role');
  await addFkSafe('User', 'membershipLevelId', 'MembershipLevel', 'id', 'fk_user_membership');
  await addFkSafe('Seat', 'typeId', 'SeatType', 'id', 'fk_seat_seattype');
  await addFkSafe('Booking', 'paymentMethodId', 'PaymentMethod', 'id', 'fk_booking_paymentmethod');
  await addFkSafe('Showtime', 'formatId', 'ScreenFormat', 'id', 'fk_showtime_format');

  await client.end();
  console.log('\n🎉 ALL TABLES RENAMED AND NORMALIZED SUCCESSFUL IN aeon_cinema_db!');
}

migrate().catch(console.error);
