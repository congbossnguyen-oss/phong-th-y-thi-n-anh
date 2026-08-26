// Cache kết quả AI theo hash(lá số) — cùng mẫu `chart-profile/cache.ts`. Trang kết quả re-render
// mỗi lần khách tải lại (?orderCode=...), tính lại từ toolInputSnapshot mỗi lần — cache tránh gọi AI
// lại (tốn phí thật) cho đúng 1 lá số đã luận rồi.
//
// Cơ Bản chỉ phụ thuộc ngày/giờ sinh + giới tính (không đổi theo thời gian) — cache vĩnh viễn trong
// TTL. Nâng Cao còn phụ thuộc năm đang xem (Tiểu Hạn năm nay/sau) nên hash phải gồm cả năm đó.
import { createHash } from "node:crypto";
import type { KetQuaCoBan } from "./aiCoBan";
import type { KetQuaNangCao } from "./aiNangCao";

function hash(key: string): string {
  return createHash("sha256").update(key).digest("hex").slice(0, 16);
}

export function hashCoBan(input: { day: number; month: number; year: number; hour: number; gender: string }): string {
  return hash(`co-ban-${input.year}-${input.month}-${input.day}-${input.hour}-${input.gender}`);
}

export function hashNangCao(input: { day: number; month: number; year: number; hour: number; gender: string; viewingYear: number }): string {
  return hash(`nang-cao-${input.year}-${input.month}-${input.day}-${input.hour}-${input.gender}-${input.viewingYear}`);
}

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 ngày
const MAX_ENTRIES = 2000;

function taoCache<T>() {
  const cache = new Map<string, { data: T; cachedAt: number }>();
  return {
    get(key: string): T | null {
      const hit = cache.get(key);
      if (!hit) return null;
      if (Date.now() - hit.cachedAt > TTL_MS) {
        cache.delete(key);
        return null;
      }
      return hit.data;
    },
    set(key: string, data: T): void {
      if (cache.size >= MAX_ENTRIES) {
        const oldest = cache.keys().next().value;
        if (oldest) cache.delete(oldest);
      }
      cache.set(key, { data, cachedAt: Date.now() });
    },
  };
}

export const cacheCoBan = taoCache<KetQuaCoBan>();
export const cacheNangCao = taoCache<KetQuaNangCao>();
