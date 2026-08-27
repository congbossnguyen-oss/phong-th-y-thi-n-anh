// Cache lời luận AI của Luận Vận Khí (Quân Sư, trang Xem Thời Vận) — xem db/schema.ts (vanKhiCache)
// và src/lib/quan-su/luan-van-khi/index.ts (layLuuNienCache/luuLuuNienCache) để hiểu vì sao cần.
import { and, eq } from "drizzle-orm";
import { db } from "./client";
import { vanKhiCache } from "../../../db/schema";
import type { LuuNienKhi } from "../quan-su/luan-van-khi";

/**
 * Đọc cache — trả null nếu chưa từng tính, dữ liệu lưu bị hỏng, HOẶC truy vấn lỗi (vd bảng chưa
 * được tạo trên môi trường này). Cache là phần TỐI ƯU, không phải điều kiện đủ để trang chạy được
 * — lỗi ở đây tuyệt đối không được làm sập cả trang Xem Thời Vận, chỉ coi như "chưa có cache" và để
 * tinhVanKhi() tính lại bằng AI như bình thường (xem sự cố 27/8/2026: "Failed query ... van_khi_cache").
 */
export async function getVanKhiCache(userId: string, daiVanIndex: number): Promise<LuuNienKhi[] | null> {
  try {
    const rows = await db
      .select({ luuNienJson: vanKhiCache.luuNienJson })
      .from(vanKhiCache)
      .where(and(eq(vanKhiCache.userId, userId), eq(vanKhiCache.daiVanIndex, daiVanIndex)))
      .limit(1);
    if (rows.length === 0) return null;
    const parsed = JSON.parse(rows[0]!.luuNienJson);
    return Array.isArray(parsed) ? (parsed as LuuNienKhi[]) : null;
  } catch (err) {
    console.error(`[van-khi-cache] Đọc cache thất bại (coi như chưa có cache):`, err);
    return null;
  }
}

/** Ghi cache — upsert theo (userId, daiVanIndex). Lỗi CHỈ log, không throw — kết quả đã tính xong
 *  và đang hiển thị cho khách không được phép hỏng chỉ vì bước lưu cache sau đó thất bại. */
export async function saveVanKhiCache(userId: string, daiVanIndex: number, luuNien: LuuNienKhi[]): Promise<void> {
  try {
    await db
      .insert(vanKhiCache)
      .values({ userId, daiVanIndex, luuNienJson: JSON.stringify(luuNien) })
      .onConflictDoUpdate({
        target: [vanKhiCache.userId, vanKhiCache.daiVanIndex],
        set: { luuNienJson: JSON.stringify(luuNien) },
      });
  } catch (err) {
    console.error(`[van-khi-cache] Ghi cache thất bại (bỏ qua, khách vẫn xem được kết quả):`, err);
  }
}
