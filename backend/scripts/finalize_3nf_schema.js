const { Client } = require('pg');

async function run() {
  const clientEn = new Client({ connectionString: 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db' });
  const clientVi = new Client({ connectionString: 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db_vi' });
  
  await clientEn.connect();
  await clientVi.connect();

  console.log('=== FINALIZING STRICT 3NF DATABASE PARITY ===');

  // 1. Drop redundant voucherCode from Booking in aeon_cinema_db if exists
  const vcCols = (await clientEn.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'Booking' AND column_name = 'voucherCode';
  `)).rows;

  if (vcCols.length > 0) {
    // If there are bookings where voucherId is null but voucherCode exists, resolve them
    await clientEn.query(`
      UPDATE "Booking" b
      SET "voucherId" = v.id
      FROM "Voucher" v
      WHERE b."voucherId" IS NULL AND b."voucherCode" IS NOT NULL AND UPPER(b."voucherCode") = UPPER(v.code);
    `);
    await clientEn.query(`ALTER TABLE "Booking" DROP COLUMN "voucherCode";`);
    console.log('✓ Dropped redundant column voucherCode from Booking in aeon_cinema_db');
  }

  // 2. Add foreign key fk_dondatve_magiamgia to DonDatVe in aeon_cinema_db_vi
  // Clean up any non-existent vouchers first
  await clientVi.query(`
    UPDATE "DonDatVe" d
    SET "maVoucher" = NULL
    WHERE "maVoucher" IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM "MaGiamGia" m WHERE m."maVoucher" = d."maVoucher"
    );
  `);

  await clientVi.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_dondatve_magiamgia') THEN
        ALTER TABLE "DonDatVe" ADD CONSTRAINT "fk_dondatve_magiamgia" 
        FOREIGN KEY ("maVoucher") REFERENCES "MaGiamGia"("maVoucher") ON DELETE SET NULL;
      END IF;
    END $$;
  `);
  console.log('✓ Added foreign key fk_dondatve_magiamgia to DonDatVe in aeon_cinema_db_vi');

  await clientEn.end();
  await clientVi.end();
  console.log('=== FINALIZATION COMPLETE ===');
}

run().catch(console.error);
