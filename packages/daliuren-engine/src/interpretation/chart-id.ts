/**
 * chartId — Phase 10.4 Section 7 / Phase 10.5 Section 9 (frozen contract, implement ở đây).
 * Định danh CHÍNH lá số ("câu hỏi": thời điểm + phương pháp), KHÔNG PHẢI định danh KẾT QUẢ tính
 * ra ("câu trả lời hôm nay") — vì vậy CỐ Ý loại `calculatedAt` (thời điểm CHẠY phép tính, không
 * phải thời điểm được hỏi) và `gender`/`birthDate` (không ảnh hưởng 8 field Calculation Layer
 * đã freeze, chỉ liên quan `benMing`/`xingNian` CHƯA implement) khỏi công thức.
 *
 * Cùng convention `sha256:<hex>` đã dùng ở `packages/astrology-core/src/chart/birthDataFingerprint.ts`
 * cho đúng mục đích tương tự (fingerprint nội dung khi chưa có ID từ DB) — tag thuật toán đứng
 * trước để 1 thay đổi thuật toán hash trong tương lai KHÔNG âm thầm trùng/đè id cũ.
 */
import { createHash } from "node:crypto";

export interface ChartIdentityInput {
  /** YYYY-MM-DD — PHẢI khớp `ChartInput.date`. */
  readonly date: string;
  readonly hour: number;
  /** Optional — `undefined` và `0` PHẢI cho cùng 1 chartId (xem chuẩn hoá bên dưới, khớp `calendar/input.ts` `input.minute ?? 0`). */
  readonly minute?: number;
  readonly timeZone: string;
}

export interface ChartIdentityProfile {
  readonly profileId: string;
  readonly version: string;
}

/**
 * Chuỗi canonical THỨ TỰ CỐ ĐỊNH TƯỜNG MINH (KHÔNG dùng `JSON.stringify` — không phụ thuộc thứ
 * tự key của object). Không lộ ra ngoài module này — chỉ `buildChartId` dùng.
 */
function toCanonicalString(input: ChartIdentityInput, profile: ChartIdentityProfile): string {
  const minute = input.minute ?? 0;
  return [input.date, String(input.hour), String(minute), input.timeZone, profile.profileId, profile.version].join("|");
}

/**
 * chartId tất định: CÙNG (input chuẩn hoá + profile identity/version) → LUÔN CÙNG chuỗi trả về,
 * bất kể `calculatedAt`/`gender`/`birthDate`/engine version — 1 bugfix tính toán không làm đổi
 * chartId của CÙNG 1 lá số logic (Phase 10.2/10.3/10.4 đã quyết định: identity theo INPUT, không
 * theo OUTPUT).
 */
export function buildChartId(input: ChartIdentityInput, profile: ChartIdentityProfile): string {
  const canonical = toCanonicalString(input, profile);
  return `sha256:${createHash("sha256").update(canonical).digest("hex")}`;
}
