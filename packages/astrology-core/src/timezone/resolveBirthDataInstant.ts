/**
 * Biên công khai kết hợp validate + quy đổi UTC cho `BirthData`. Đây là nơi CHÍNH SÁCH được
 * áp dụng (ambiguous/nonexistent local time là lỗi cứng, phải dừng lại, KHÔNG được đoán) —
 * tách biệt khỏi `resolveLocalTimeToUtc` (tầng phát hiện thuần tuý, không quyết định chính
 * sách). Đúng ARCHITECTURE_FREEZE.md §5: AMBIGUOUS_LOCAL_TIME/NONEXISTENT_LOCAL_TIME luôn là
 * hard stop trả về caller.
 *
 * KHÔNG throw exception thô ra ngoài — mọi lỗi (kể cả ambiguous/nonexistent) trả về dưới dạng
 * `AstrologyCoreError[]` có mã ổn định.
 */

import type { AstrologyCoreError } from "../errors.js";
import type { BirthData } from "../types.js";
import { validateBirthData } from "../validation/birthData.js";
import { resolveLocalTimeToUtc, type ResolvedInstant } from "./resolveLocalTime.js";

export type BirthDataInstantResolution =
  | { ok: true; utc: Date; utcOffsetMinutes: number }
  | { ok: false; errors: AstrologyCoreError[] };

function describeInstant(i: ResolvedInstant): { utc: string; utcOffsetMinutes: number } {
  return { utc: i.utc.toISOString(), utcOffsetMinutes: i.utcOffsetMinutes };
}

/**
 * Quy đổi `BirthData` sang một thời điểm UTC chính tắc (canonical). Nếu `localTime === null`
 * (không rõ giờ sinh), trả về UTC tại 00:00:00 giờ địa phương ngày sinh — CHỈ dùng làm mốc
 * ngày dương lịch tham chiếu, KHÔNG được diễn giải là "giờ sinh thật"; tầng Chart Calculation
 * (Phase 3+) phải tự loại bỏ mọi field phụ thuộc giờ (house/ASC/MC) khi biết `localTime` gốc
 * là `null` — hàm này không tự làm việc đó vì đó là business logic ngoài phạm vi Phase 1.
 */
export function resolveBirthDataInstant(birthData: BirthData): BirthDataInstantResolution {
  const validationErrors = validateBirthData(birthData);
  if (validationErrors.length > 0) {
    return { ok: false, errors: validationErrors };
  }

  const effectiveLocalTime = birthData.localTime ?? { hour: 0, minute: 0, second: 0 };
  const resolution = resolveLocalTimeToUtc(birthData.date, effectiveLocalTime, birthData.timezoneId);

  switch (resolution.status) {
    case "resolved":
      return { ok: true, utc: resolution.utc, utcOffsetMinutes: resolution.utcOffsetMinutes };

    case "ambiguous": {
      const [first, second] = resolution.candidates;
      return {
        ok: false,
        errors: [
          {
            code: "AMBIGUOUS_LOCAL_TIME",
            message:
              `Giờ địa phương ${formatLocal(birthData)} tại "${birthData.timezoneId}" xảy ra HAI lần ` +
              `do lùi giờ mùa hè. Cần người dùng xác nhận lần nào (trước hay sau khi lùi giờ).`,
            field: "localTime",
            details: { candidates: [describeInstant(first), describeInstant(second)] },
          },
        ],
      };
    }

    case "nonexistent": {
      return {
        ok: false,
        errors: [
          {
            code: "NONEXISTENT_LOCAL_TIME",
            message:
              `Giờ địa phương ${formatLocal(birthData)} tại "${birthData.timezoneId}" KHÔNG TỒN TẠI ` +
              `do tiến giờ mùa hè (đồng hồ nhảy cóc qua khoảng ${resolution.gapMinutes} phút này).`,
            field: "localTime",
            details: {
              gapMinutes: resolution.gapMinutes,
              nearestValidBefore: describeInstant(resolution.nearestValidBefore),
              nearestValidAfter: describeInstant(resolution.nearestValidAfter),
            },
          },
        ],
      };
    }
  }
}

function formatLocal(birthData: BirthData): string {
  const { date, localTime } = birthData;
  const t = localTime ?? { hour: 0, minute: 0, second: 0 };
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${date.year}-${pad(date.month)}-${pad(date.day)} ${pad(t.hour)}:${pad(t.minute)}:${pad(t.second ?? 0)}`;
}
