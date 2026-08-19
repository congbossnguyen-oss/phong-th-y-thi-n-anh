/**
 * Cache Hồ Sơ Lá Số theo hash(lá số) — đúng yêu cầu handoff ("Cache theo hash lá số"). Lá số Bát
 * Tự chỉ phụ thuộc ngày/giờ sinh + giới tính, nên input giống hệt nhau luôn cho ra hồ sơ giống hệt
 * — cache tránh gọi Claude lại (tốn phí) cho cùng một lá số.
 *
 * In-memory, cùng mẫu với `src/lib/rate-limit.ts` (Render free chạy 1 tiến trình; cache mất khi
 * restart là chấp nhận được — tính lại 1 lần không phải vấn đề, không như phải chuẩn xác tuyệt đối).
 */
import { createHash } from "node:crypto";
import type { BatTuProfile } from "./types";

export function hashLaSo(input: { day: number; month: number; year: number; hour: number; minute?: number; gender: string }): string {
  const key = `${input.year}-${input.month}-${input.day}-${input.hour}-${input.minute ?? 0}-${input.gender}`;
  return createHash("sha256").update(key).digest("hex").slice(0, 16);
}

const cache = new Map<string, { profile: BatTuProfile; cachedAt: number }>();
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 ngày — hồ sơ không đổi theo thời gian nên TTL chỉ để dọn bớt bộ nhớ.
const MAX_ENTRIES = 5000;

export function getCachedProfile(cacheKey: string): BatTuProfile | null {
  const hit = cache.get(cacheKey);
  if (!hit) return null;
  if (Date.now() - hit.cachedAt > TTL_MS) {
    cache.delete(cacheKey);
    return null;
  }
  return hit.profile;
}

export function setCachedProfile(cacheKey: string, profile: BatTuProfile): void {
  if (cache.size >= MAX_ENTRIES) {
    // Dọn rác đơn giản: xoá phần tử cũ nhất khi đầy — đủ dùng cho quy mô hiện tại, không cần LRU thật.
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(cacheKey, { profile, cachedAt: Date.now() });
}
