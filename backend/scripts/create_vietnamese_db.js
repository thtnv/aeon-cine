const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function run() {
  const rootConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '123456',
    port: 5432,
  };

  console.log('Connecting to PostgreSQL server...');
  let client = new Client(rootConfig);
  await client.connect();

  console.log('Checking and recreating database aeon_cinema_db_vi...');
  await client.query(`
    SELECT pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE pg_stat_activity.datname = 'aeon_cinema_db_vi'
      AND pid <> pg_backend_pid();
  `);

  await client.query('DROP DATABASE IF EXISTS aeon_cinema_db_vi;');
  await client.query('CREATE DATABASE aeon_cinema_db_vi;');
  console.log('Database aeon_cinema_db_vi created successfully.');
  await client.end();

  // Connect to new database aeon_cinema_db_vi
  client = new Client({
    ...rootConfig,
    database: 'aeon_cinema_db_vi'
  });
  await client.connect();
  console.log('Connected to database aeon_cinema_db_vi.');

  const sqlPath = 'D:\\Downloads\\DOANTOTNGHIEP\\DATABASE_TIENG_VIET.sql';
  console.log(`Reading SQL script from ${sqlPath}...`);
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Executing SQL statements...');
  await client.query(sql);
  console.log('Successfully executed DATABASE_TIENG_VIET.sql!');

  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  console.log('\n--- List of created tables in aeon_cinema_db_vi ---');
  tablesRes.rows.forEach((row, i) => {
    console.log(`${i + 1}. ${row.table_name}`);
  });

  const commentsRes = await client.query(`
    SELECT c.relname AS table_name, pg_catalog.obj_description(c.oid, 'pg_class') AS table_comment
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r' AND n.nspname = 'public'
    ORDER BY c.relname;
  `);

  console.log('\n--- Table Comments ---');
  commentsRes.rows.forEach(r => {
    console.log(`- ${r.table_name}: ${r.table_comment || '(No comment)'}`);
  });

  await client.end();
}

run().catch(err => {
  console.error('Error executing script:', err);
  process.exit(1);
});
