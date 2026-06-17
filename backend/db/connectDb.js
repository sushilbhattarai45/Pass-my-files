import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "fileshare",
  user: "fileshare_user",
  password: "Hello@9090",
});

export async function connectDb() {
  try {
    const client = await pool.connect();

    const result = await client.query("SELECT NOW()");

    console.log("PostgreSQL Connected");
    console.log("Server Time:", result.rows[0].now);

    client.release();
  } catch (error) {
    console.error(" Database Connection Failed");
    console.error(error.message);
    process.exit(1);
  }
}

export default pool;
