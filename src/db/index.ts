import pg from 'pg'

const { Pool } = pg

// Parse DATABASE_URL or use individual env vars
let poolConfig: pg.PoolConfig

if (process.env.DB_HOST) {
  // Use individual connection parameters (preferred for passwords with special chars)
  poolConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  }
} else if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  }
} else {
  throw new Error('No database configuration found. Set DATABASE_URL or individual DB_* variables.')
}

const pool = new Pool(poolConfig)

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

export default pool
