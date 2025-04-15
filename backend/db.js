const { Pool } = require("pg");
require("dotenv").config();

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Render
  },
});

// Test the connection
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL database!");
    client.release();
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err);
  }
})();

module.exports = pool;
