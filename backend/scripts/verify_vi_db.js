const { Client } = require('pg');

async function verify() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'aeon_cinema_db_vi',
    password: '123456',
    port: 5432,
  });

  await client.connect();

  const tablesRes = await client.query(`
    SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
  `);

  const colsRes = await client.query(`
    SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public';
  `);

  const fksRes = await client.query(`
    SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY';
  `);

  console.log('=== KẾT QUẢ KIỂM TRA DATABASE TIẾNG VIỆT (aeon_cinema_db_vi) ===');
  console.log('Tên Database:', 'aeon_cinema_db_vi');
  console.log('Tổng số bảng (Tables):', tablesRes.rows[0].count);
  console.log('Tổng số cột (Columns):', colsRes.rows[0].count);
  console.log('Tổng số Khóa ngoại (Foreign Keys):', fksRes.rows[0].count);

  await client.end();
}

verify().catch(console.error);
