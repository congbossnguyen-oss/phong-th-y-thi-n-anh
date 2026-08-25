// Cache báo cáo (Cơ Bản/Nâng Cao) theo hash(lá số) — cùng mẫu `chart-profile/cache.ts`: mỗi báo
// cáo tốn nhiều lệnh gọi AI (6-7 lệnh/tầng), input giống hệt luôn ra kết quả giống hệt nên cache
// tránh gọi lại tốn phí. In-memory (Render free chạy 1 tiến trình, mất cache khi restart chấp nhận
// được — tính lại 1 lần không phải vấn đề).
import { createHash } from "node:crypto";
import type { BatTuInput } from "../bat-tu";
import type { BaoCaoCoBan, BaoCaoNangCao } from "./types";

export function hashLaSo(input: BatTuInput): string {
  const key = `${input.year}-${input.month}-${input.day}-${input.hour}-${input.minute ?? 0}-${input.gender}`;
  return createHash("sha256").update(key).digest("hex").slice(0, 16);
}

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 ngày.
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
        const oldestKey = cache.keys().next().value;
        if (oldestKey) cache.delete(oldestKey);
      }
      cache.set(key, { data, cachedAt: Date.now() });
    },
  };
}

export const cacheCoBan = taoCache<BaoCaoCoBan>();
export const cacheNangCao = taoCache<BaoCaoNangCao>();
