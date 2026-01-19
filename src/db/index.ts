import pg from 'pg'

const { Pool } = pg

// SSL configuration - set DB_SSL=true to enable, false or omit to disable
const sslConfig = process.env.DB_SSL === 'true'
  ? { rejectUnauthorized: false }
  : false

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
    ssl: sslConfig,
  }
} else if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig,
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
