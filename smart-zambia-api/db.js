import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Warn in dev if password is not set
if (!process.env.DB_PASSWORD) {
  console.warn('WARNING: DB_PASSWORD is not set in environment variables. Database connection may fail.');
}

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'smart_zambia',
  // Do not hard-code; require from .env
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

export default pool;