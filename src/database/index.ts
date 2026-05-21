import { Pool } from "pg";
import config from "../config/env";

export const pool = new Pool({
  connectionString: config.db_string,
});

export const initDB = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
            id SERIAL NOT NULL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(50) DEFAULT 'contributor',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )      
    `);

    pool.query(`
        CREATE TABLE IF NOT EXISTS issues (
            id SERIAL PRIMARY KEY NOT NULL,
            title VARCHAR(200) NOT NULL,
            description TEXT NOT NULL,
            type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature_request')),
            status VARCHAR(30) DEFAULT 'open',
            reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    `)

    console.log("Database Connected Successfully");
  } catch (error) {
    console.log(error);
  }
};
