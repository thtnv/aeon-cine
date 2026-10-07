const { Client } = require('pg');

async function checkFks(db) {
  const c = new Client({ connectionString: 'postgresql://postgres:123456@localhost:5432/' + db });
  await c.connect();
  const r = await c.query(`
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
  console.log(`\n=== FK for ${db} (${r.rows.length} foreign keys) ===`);
  for (const row of r.rows) {
    console.log(`  ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
  }
  await c.end();
}

async function run() {
  await checkFks('aeon_cinema_db');
  await checkFks('aeon_cinema_db_vi');
}
run();
