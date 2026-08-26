// Cache lời luận AI của Luận Vận Khí (Quân Sư, trang Xem Thời Vận) — xem db/schema.ts (vanKhiCache)
// và src/lib/quan-su/luan-van-khi/index.ts (layLuuNienCache/luuLuuNienCache) để hiểu vì sao cần.
import { and, eq } from "drizzle-orm";
import { db } from "./client";
import { vanKhiCache } from "../../../db/schema";
import type { LuuNienKhi } from "../quan-su/luan-van-khi";

/** Đọc cache — trả null nếu chưa từng tính hoặc dữ liệu lưu bị hỏng (JSON parse lỗi). */
export async function getVanKhiCache(userId: string, daiVanIndex: number): Promise<LuuNienKhi[] | null> {
  const rows = await db
    .select({ luuNienJson: vanKhiCache.luuNienJson })
    .from(vanKhiCache)
    .where(and(eq(vanKhiCache.userId, userId), eq(vanKhiCache.daiVanIndex, daiVanIndex)))
    .limit(1);
  if (rows.length === 0) return null;
  try {
    const parsed = JSON.parse(rows[0]!.luuNienJson);
    return Array.isArray(parsed) ? (parsed as LuuNienKhi[]) : null;
  } catch {
    return null;
  }
}

/** Ghi cache — upsert theo (userId, daiVanIndex), ghi đè nếu đã có (vd tính lại sau khi sửa engine). */
export async function saveVanKhiCache(userId: string, daiVanIndex: number, luuNien: LuuNienKhi[]): Promise<void> {
  await db
    .insert(vanKhiCache)
    .values({ userId, daiVanIndex, luuNienJson: JSON.stringify(luuNien) })
    .onConflictDoUpdate({
      target: [vanKhiCache.userId, vanKhiCache.daiVanIndex],
      set: { luuNienJson: JSON.stringify(luuNien) },
    });
}
