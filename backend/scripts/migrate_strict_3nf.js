const { Client } = require('pg');

async function migrateStrict3NF() {
  const client = new Client({ connectionString: 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db' });
  await client.connect();
  console.log('=== STARTING STRICT 3NF DATABASE NORMALIZATION MIGRATION ===');

  try {
    // 1. Seat: Drop redundant column "type", keep "typeId" -> SeatType(id)
    console.log('\n1. Normalizing table Seat...');
    // Ensure all typeId values are populated
    await client.query(`
      UPDATE "Seat" s
      SET "typeId" = st.id
      FROM "SeatType" st
      WHERE s."typeId" IS NULL AND s."type"::text = st."code";
    `);
    // Fallback any remaining nulls to STANDARD
    await client.query(`
      UPDATE "Seat"
      SET "typeId" = (SELECT id FROM "SeatType" WHERE code = 'STANDARD' LIMIT 1)
      WHERE "typeId" IS NULL;
    `);
    // Check if column "type" exists and drop it
    const seatCols = (await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'Seat' AND column_name = 'type';
    `)).rows;
    if (seatCols.length > 0) {
      await client.query(`ALTER TABLE "Seat" DROP COLUMN "type";`);
      console.log('✓ Dropped redundant column "type" from table Seat');
    } else {
      console.log('- Column "type" already removed from Seat');
    }
    // Make typeId NOT NULL
    await client.query(`ALTER TABLE "Seat" ALTER COLUMN "typeId" SET NOT NULL;`);
    console.log('✓ Set Seat.typeId to NOT NULL');

    // 2. User: Drop redundant columns "role" and "membershipLevel"
    console.log('\n2. Normalizing table User...');
    // Ensure roleId is populated
    await client.query(`
      UPDATE "User" u
      SET "roleId" = r.id
      FROM "Role" r
      WHERE u."roleId" IS NULL AND (u."role"::text = r."code" OR (u."role" IS NULL AND r."code" = 'USER'));
    `);
    await client.query(`
      UPDATE "User"
      SET "roleId" = (SELECT id FROM "Role" WHERE code = 'USER' LIMIT 1)
      WHERE "roleId" IS NULL;
    `);
    // Ensure membershipLevelId is populated
    await client.query(`
      UPDATE "User" u
      SET "membershipLevelId" = m.id
      FROM "MembershipLevel" m
      WHERE u."membershipLevelId" IS NULL AND (u."membershipLevel" = m."code" OR (u."membershipLevel" IS NULL AND m."code" = 'STAR'));
    `);
    await client.query(`
      UPDATE "User"
      SET "membershipLevelId" = (SELECT id FROM "MembershipLevel" WHERE code = 'STAR' LIMIT 1)
      WHERE "membershipLevelId" IS NULL;
    `);

    // Drop redundant columns
    const userRoleCol = (await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'User' AND column_name = 'role';
    `)).rows;
    if (userRoleCol.length > 0) {
      await client.query(`ALTER TABLE "User" DROP COLUMN "role";`);
      console.log('✓ Dropped redundant column "role" from table User');
    }

    const userMemCol = (await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'User' AND column_name = 'membershipLevel';
    `)).rows;
    if (userMemCol.length > 0) {
      await client.query(`ALTER TABLE "User" DROP COLUMN "membershipLevel";`);
      console.log('✓ Dropped redundant column "membershipLevel" from table User');
    }

    // 3. Booking: Drop redundant column "paymentMethod", keep "paymentMethodId" -> PaymentMethod(id)
    console.log('\n3. Normalizing table Booking...');
    await client.query(`
      UPDATE "Booking" b
      SET "paymentMethodId" = pm.id
      FROM "PaymentMethod" pm
      WHERE b."paymentMethodId" IS NULL AND UPPER(b."paymentMethod") = pm."code";
    `);
    await client.query(`
      UPDATE "Booking"
      SET "paymentMethodId" = (SELECT id FROM "PaymentMethod" WHERE code = 'VNPAY' LIMIT 1)
      WHERE "paymentMethodId" IS NULL;
    `);

    const bookingPmCol = (await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'Booking' AND column_name = 'paymentMethod';
    `)).rows;
    if (bookingPmCol.length > 0) {
      await client.query(`ALTER TABLE "Booking" DROP COLUMN "paymentMethod";`);
      console.log('✓ Dropped redundant column "paymentMethod" from table Booking');
    }

    // 4. Showtime: Drop redundant column "format", keep "formatId" -> ScreenFormat(id)
    console.log('\n4. Normalizing table Showtime...');
    await client.query(`
      UPDATE "Showtime" st
      SET "formatId" = sf.id
      FROM "ScreenFormat" sf
      WHERE st."formatId" IS NULL AND UPPER(st."format") = sf."code";
    `);
    await client.query(`
      UPDATE "Showtime"
      SET "formatId" = (SELECT id FROM "ScreenFormat" WHERE code = '2D' LIMIT 1)
      WHERE "formatId" IS NULL;
    `);

    const showtimeFormatCol = (await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'Showtime' AND column_name = 'format';
    `)).rows;
    if (showtimeFormatCol.length > 0) {
      await client.query(`ALTER TABLE "Showtime" DROP COLUMN "format";`);
      console.log('✓ Dropped redundant column "format" from table Showtime');
    }

    // 5. BookingService: Rename column "foodId" to "serviceId" referencing Service(id)
    console.log('\n5. Normalizing table BookingService...');
    const bsFoodCol = (await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'BookingService' AND column_name = 'foodId';
    `)).rows;
    if (bsFoodCol.length > 0) {
      await client.query(`ALTER TABLE "BookingService" RENAME COLUMN "foodId" TO "serviceId";`);
      console.log('✓ Renamed BookingService.foodId -> BookingService.serviceId');
    } else {
      console.log('- Column serviceId already in BookingService');
    }

    // 6. TicketPrice: Add FK seatTypeId -> SeatType(id) and FK formatId -> ScreenFormat(id), drop seatType and format
    console.log('\n6. Normalizing table TicketPrice...');
    await client.query(`ALTER TABLE "TicketPrice" ADD COLUMN IF NOT EXISTS "seatTypeId" VARCHAR(36);`);
    await client.query(`ALTER TABLE "TicketPrice" ADD COLUMN IF NOT EXISTS "formatId" VARCHAR(36);`);

    const tpSeatTypeCol = (await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'TicketPrice' AND column_name = 'seatType';
    `)).rows;
    if (tpSeatTypeCol.length > 0) {
      await client.query(`
        UPDATE "TicketPrice" tp
        SET "seatTypeId" = st.id
        FROM "SeatType" st
        WHERE tp."seatTypeId" IS NULL AND tp."seatType"::text = st."code";
      `);
      await client.query(`
        UPDATE "TicketPrice" tp
        SET "formatId" = sf.id
        FROM "ScreenFormat" sf
        WHERE tp."formatId" IS NULL AND UPPER(tp."format") = sf."code";
      `);
      await client.query(`ALTER TABLE "TicketPrice" DROP COLUMN "seatType";`);
      await client.query(`ALTER TABLE "TicketPrice" DROP COLUMN "format";`);
      console.log('✓ Migrated TicketPrice to seatTypeId and formatId, dropped unnormalized columns');
    }

    // Add foreign key constraints for TicketPrice
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ticketprice_seattype') THEN
          ALTER TABLE "TicketPrice" ADD CONSTRAINT "fk_ticketprice_seattype" 
          FOREIGN KEY ("seatTypeId") REFERENCES "SeatType"("id") ON DELETE CASCADE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ticketprice_screenformat') THEN
          ALTER TABLE "TicketPrice" ADD CONSTRAINT "fk_ticketprice_screenformat" 
          FOREIGN KEY ("formatId") REFERENCES "ScreenFormat"("id") ON DELETE CASCADE;
        END IF;
      END $$;
    `);
    console.log('✓ Added FK constraints to TicketPrice (seatTypeId -> SeatType, formatId -> ScreenFormat)');

    // 7. Ticket: Rename priceConfigId to ticketPriceId referencing TicketPrice(id)
    console.log('\n7. Normalizing table Ticket...');
    const ticketPcCol = (await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'Ticket' AND column_name = 'priceConfigId';
    `)).rows;
    if (ticketPcCol.length > 0) {
      await client.query(`ALTER TABLE "Ticket" RENAME COLUMN "priceConfigId" TO "ticketPriceId";`);
      console.log('✓ Renamed Ticket.priceConfigId -> Ticket.ticketPriceId');
    }

    // 8. GroupBooking: Drop redundant cinemaName
    console.log('\n8. Normalizing table GroupBooking...');
    const gbCinemaNameCol = (await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'GroupBooking' AND column_name = 'cinemaName';
    `)).rows;
    if (gbCinemaNameCol.length > 0) {
      await client.query(`ALTER TABLE "GroupBooking" DROP COLUMN "cinemaName";`);
      console.log('✓ Dropped redundant column "cinemaName" from table GroupBooking');
    }

    // 9. Article: Drop redundant author text column
    console.log('\n9. Normalizing table Article...');
    // Ensure authorId is set before dropping author text
    const defaultAdmin = (await client.query(`SELECT id FROM "User" LIMIT 1;`)).rows[0]?.id;
    if (defaultAdmin) {
      await client.query(`UPDATE "Article" SET "authorId" = $1 WHERE "authorId" IS NULL;`, [defaultAdmin]);
    }
    const articleAuthorCol = (await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'Article' AND column_name = 'author';
    `)).rows;
    if (articleAuthorCol.length > 0) {
      await client.query(`ALTER TABLE "Article" DROP COLUMN "author";`);
      console.log('✓ Dropped redundant column "author" from table Article');
    }

    // 10. Clean up unused enum types if any
    console.log('\n10. Checking unused enum types...');
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SeatTypeEnum') THEN
          DROP TYPE "SeatTypeEnum" CASCADE;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RoleEnum') THEN
          DROP TYPE "RoleEnum" CASCADE;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END $$;
    `);
    console.log('✓ Cleaned up redundant enum types');

    console.log('\n=== STRICT 3NF DATABASE NORMALIZATION COMPLETED SUCCESSFULLY! ===');
  } catch (err) {
    console.error('Migration error:', err);
    throw err;
  } finally {
    await client.end();
  }
}

migrateStrict3NF();
