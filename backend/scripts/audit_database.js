const { Client } = require('pg');

async function auditDb(dbName) {
  const client = new Client({ connectionString: `postgresql://postgres:123456@localhost:5432/${dbName}` });
  await client.connect();
  console.log(`\n==================================================`);
  console.log(`🔍 AUDITING DATABASE: ${dbName}`);
  console.log(`==================================================`);

  // 1. Get all tables
  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);
  const tables = tablesRes.rows.map(r => r.table_name);
  console.log(`📊 Total tables: ${tables.length}`);

  // 2. Get all columns
  const colsRes = await client.query(`
    SELECT table_name, column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
  `);

  // 3. Get all foreign keys
  const fksRes = await client.query(`
    SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
    ORDER BY tc.table_name, kcu.column_name;
  `);

  // Group columns and foreign keys by table
  const tableCols = {};
  for (const c of colsRes.rows) {
    tableCols[c.table_name] = tableCols[c.table_name] || [];
    tableCols[c.table_name].push(c);
  }

  const tableFks = {};
  for (const fk of fksRes.rows) {
    tableFks[fk.table_name] = tableFks[fk.table_name] || [];
    tableFks[fk.table_name].push(fk);
  }

  // 4. Check for unlinked tables (tables without any foreign key IN or OUT)
  const incomingFks = {};
  for (const fk of fksRes.rows) {
    incomingFks[fk.foreign_table_name] = incomingFks[fk.foreign_table_name] || [];
    incomingFks[fk.foreign_table_name].push(fk);
  }

  console.log(`\n--- TABLE LINKAGE STATUS ---`);
  for (const t of tables) {
    const outFkCount = (tableFks[t] || []).length;
    const inFkCount = (incomingFks[t] || []).length;
    console.log(`Table [${t}]: ${outFkCount} outgoing FKs, ${inFkCount} incoming FKs`);
    if (outFkCount === 0 && inFkCount === 0) {
      console.warn(`  ⚠️ WARNING: Table [${t}] is COMPLETELY ISOLATED / UNLINKED!`);
    }
  }

  // 5. Check each table for suspicious / redundant columns
  console.log(`\n--- REDUNDANCY & 3NF AUDIT ---`);
  for (const t of tables) {
    const cols = tableCols[t] || [];
    const colNames = cols.map(c => c.column_name);

    // Check Seat / GheNgoi
    if (t === 'Seat' && colNames.includes('type')) {
      console.warn(`  ❌ ANOMALY: Table Seat still has redundant column 'type'!`);
    }
    if (t === 'GheNgoi' && colNames.includes('loaiGhe')) {
      console.warn(`  ❌ ANOMALY: Table GheNgoi still has redundant column 'loaiGhe'!`);
    }

    // Check User / NguoiDung
    if (t === 'User' && (colNames.includes('role') || colNames.includes('membershipLevel'))) {
      console.warn(`  ❌ ANOMALY: Table User has redundant 'role' or 'membershipLevel'!`);
    }
    if (t === 'NguoiDung' && (colNames.includes('vaiTro') || colNames.includes('hangThanhVien'))) {
      console.warn(`  ❌ ANOMALY: Table NguoiDung has redundant 'vaiTro' or 'hangThanhVien'!`);
    }

    // Check Showtime / SuatChieu
    if (t === 'Showtime' && colNames.includes('format')) {
      console.warn(`  ❌ ANOMALY: Table Showtime has redundant 'format'!`);
    }
    if (t === 'SuatChieu' && colNames.includes('dinhDang')) {
      console.warn(`  ❌ ANOMALY: Table SuatChieu has redundant 'dinhDang'!`);
    }

    // Check Booking / DonDatVe
    if (t === 'Booking' && colNames.includes('paymentMethod')) {
      console.warn(`  ❌ ANOMALY: Table Booking has redundant 'paymentMethod'!`);
    }
    if (t === 'DonDatVe' && colNames.includes('phuongThucThanhToan')) {
      console.warn(`  ❌ ANOMALY: Table DonDatVe has redundant 'phuongThucThanhToan'!`);
    }
    if (t === 'Booking' && colNames.includes('voucherCode') && colNames.includes('voucherId')) {
      console.warn(`  ℹ️ NOTE: Table Booking has both 'voucherCode' and 'voucherId'.`);
    }

    // Check TicketPrice / BangGiaVe
    if (t === 'TicketPrice' && (colNames.includes('seatType') || colNames.includes('format'))) {
      console.warn(`  ❌ ANOMALY: Table TicketPrice has redundant enum 'seatType' or string 'format'!`);
    }
    if (t === 'BangGiaVe' && (colNames.includes('loaiGhe') || colNames.includes('dinhDang'))) {
      console.warn(`  ❌ ANOMALY: Table BangGiaVe has redundant 'loaiGhe' or 'dinhDang'!`);
    }

    // Check GroupBooking / DatVeNhom
    if (t === 'GroupBooking' && colNames.includes('cinemaName')) {
      console.warn(`  ❌ ANOMALY: Table GroupBooking has redundant 'cinemaName'!`);
    }
    if (t === 'DatVeNhom' && colNames.includes('tenCumRap')) {
      console.warn(`  ❌ ANOMALY: Table DatVeNhom has redundant 'tenCumRap'!`);
    }

    // Check Article / BaiVietTinTuc
    if (t === 'Article' && colNames.includes('author')) {
      console.warn(`  ❌ ANOMALY: Table Article has redundant 'author'!`);
    }
    if (t === 'BaiVietTinTuc' && colNames.includes('tacGia')) {
      console.warn(`  ❌ ANOMALY: Table BaiVietTinTuc has redundant 'tacGia'!`);
    }

    // Check Movie / Phim (Strict 3NF)
    if (t === 'Movie' && (colNames.includes('genre') || colNames.includes('actors'))) {
      console.warn(`  ❌ ANOMALY: Table Movie has redundant 'genre' or 'actors'!`);
    }
    if (t === 'Phim' && (colNames.includes('theLoai') || colNames.includes('dienVien'))) {
      console.warn(`  ❌ ANOMALY: Table Phim has redundant 'theLoai' or 'dienVien'!`);
    }
  }

  // 6. Check missing FKs
  console.log(`\n--- FOREIGN KEY COMPLETENESS AUDIT ---`);
  if (dbName === 'aeon_cinema_db_vi') {
    const ddvFks = tableFks['DonDatVe'] || [];
    const hasVoucherFk = ddvFks.some(f => f.column_name === 'maVoucher');
    if (!hasVoucherFk) {
      console.warn(`  ⚠️ MISSING FK: DonDatVe.maVoucher -> MaGiamGia.maVoucher is NOT constrained!`);
    }
  }

  await client.end();
}

async function run() {
  await auditDb('aeon_cinema_db');
  await auditDb('aeon_cinema_db_vi');
}
run();
