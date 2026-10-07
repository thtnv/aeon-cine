const { Client } = require('pg');

async function inspect(dbName) {
  const client = new Client({ connectionString: `postgresql://postgres:123456@localhost:5432/${dbName}` });
  await client.connect();
  console.log(`\n=================== DATABASE: ${dbName} ===================`);
  const res = await client.query(`
    SELECT table_name, column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
  `);

  const fkRes = await client.query(`
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
    WHERE tc.constraint_type = 'FOREIGN KEY';
  `);

  const tables = {};
  for (const row of res.rows) {
    if (!tables[row.table_name]) tables[row.table_name] = [];
    tables[row.table_name].push(`${row.column_name} (${row.udt_name || row.data_type})`);
  }

  for (const [t, cols] of Object.entries(tables)) {
    console.log(`\nTABLE [${t}]:`);
    console.log(`  Columns: ${cols.join(', ')}`);
    const fks = fkRes.rows.filter(f => f.table_name === t);
    if (fks.length > 0) {
      console.log(`  Foreign Keys:`);
      for (const fk of fks) {
        console.log(`    ${fk.column_name} -> ${fk.foreign_table_name}(${fk.foreign_column_name})`);
      }
    }
  }
  await client.end();
}

async function run() {
  await inspect('aeon_cinema_db');
  await inspect('aeon_cinema_db_vi');
}
run();
