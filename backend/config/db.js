const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_PORT = 3306,
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'ai_crudapp_db',
  DB_SSL = 'false'
} = process.env;
const sslOption = DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined;

let pool = null;

async function initDB() {
  try {
    // 1. Initial connection to MySQL server (without specifying database) to create DB if needed
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
       ssl: sslOption
      
    });

    console.log('✓ Successfully connected to MySQL server');

    // Create database if not exists
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log(`✓ Database "${DB_NAME}" is verified/created`);

    await connection.end();

    // 2. Establish connection pool with the target database
     pool = mysql.createPool({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      ssl: sslOption,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 3. Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Create products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        category VARCHAR(100) NOT NULL DEFAULT 'General',
        stock INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✓ Tables "users" and "products" verified/created successfully');
    return pool;
  } catch (error) {
    console.error('\n❌ MySQL Connection / Initialization Error:');
    console.error(`Message: ${error.message}`);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n⚠️  ACTION REQUIRED: Access denied for MySQL user.');
      console.error(`Please open "backend/.env" and set your correct DB_PASSWORD:\n`);
      console.error(`  DB_USER=${DB_USER}`);
      console.error(`  DB_PASSWORD=your_actual_mysql_password\n`);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  ACTION REQUIRED: Could not connect to MySQL server at ' + DB_HOST + ':' + DB_PORT);
      console.error('Please ensure the MySQL service is running.\n');
    }
    return null;
  }
}

// Helper to get pool or throw user-friendly error
function getPool() {
  if (!pool) {
    throw new Error('Database connection is not initialized. Please verify MySQL credentials in backend/.env');
  }
  return pool;
}

module.exports = {
  initDB,
  getPool,
  // Helper query method
  query: async (sql, params) => {
    const p = getPool();
    return p.query(sql, params);
  }
};
