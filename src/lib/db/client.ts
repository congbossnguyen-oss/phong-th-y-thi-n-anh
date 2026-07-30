import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../../../db/schema";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let cached: DrizzleDb | null = null;

function getDb(): DrizzleDb {
  if (cached) return cached;

  const databaseUrl = import.meta.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL chưa được thiết lập trong .env (xem .env.example).");
  }

  const sql = neon(databaseUrl);
  cached = drizzle(sql, { schema });
  return cached;
}

// Proxy trì hoãn việc đọc DATABASE_URL đến khi thực sự có truy vấn (db.select/insert/...),
// thay vì throw ngay lúc import module — tránh làm sập các trang không cần DB (marketing, blog...)
// khi chưa cấu hình Neon.
export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
