import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __dbPool: Pool | undefined;
}

// Dùng chung 1 pool cho cả dev (hot reload) lẫn serverless.
// Hoạt động với Neon qua pooled connection string (chuẩn Postgres).
const pool =
  globalThis.__dbPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
  });
globalThis.__dbPool = pool;

export const db = drizzle(pool, { schema });
