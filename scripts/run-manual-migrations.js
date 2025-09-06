#!/usr/bin/env node
import fs from 'fs/promises';
import { Client } from 'pg';

async function main() {
  const sqlPath = new URL('../manual-migration.sql', import.meta.url);
  console.log('Reading SQL from', sqlPath.href);
  const sql = await fs.readFile(sqlPath, 'utf8');
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL missing');
    process.exit(2);
  }

  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    console.log('Connected to DB, running migration...');
    await client.query(sql);
    console.log('Migration applied successfully');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    try { await client.end(); } catch {};
    process.exit(1);
  }
}

main();
