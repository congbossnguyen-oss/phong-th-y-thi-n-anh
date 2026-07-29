import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../../../db/schema";

const databaseUrl = import.meta.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL chưa được thiết lập trong .env (xem .env.example).");
}

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
