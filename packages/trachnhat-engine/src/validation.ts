/**
 * Validation cho Trạch Nhật Engine — 2 lớp theo docs/15-trach-nhat-engine.md mục 2.4 và
 * docs/16-engine-contract.md mục 2.4. Trả `EngineError[]` (rỗng nếu hợp lệ), KHÔNG throw —
 * đúng quy ước Engine Contract, khác quy ước throw của `calendar-core`.
 */

import { isValidCalendarDate, Timezone } from "@thien-anh/calendar-core";
import type { EngineError } from "@thien-anh/engine-contract";
import type { TrachNhatInput } from "./types.js";

export function validateTrachNhatInput(input: TrachNhatInput): EngineError[] {
  const errors: EngineError[] = [];

  const { solarDate, timeZone } = input;

  if (
    !solarDate ||
    !Number.isInteger(solarDate.year) ||
    !Number.isInteger(solarDate.month) ||
    !Number.isInteger(solarDate.day)
  ) {
    errors.push({
      code: "INVALID_SOLAR_DATE_STRUCTURE",
      message: "solarDate.year/month/day phải là số nguyên.",
      field: "solarDate",
    });
  } else if (!isValidCalendarDate(solarDate.year, solarDate.month, solarDate.day)) {
    errors.push({
      code: "INVALID_SOLAR_DATE",
      message: `Ngày không hợp lệ: ${solarDate.year}-${solarDate.month}-${solarDate.day} không tồn tại trong lịch.`,
      field: "solarDate",
    });
  }

  if (typeof timeZone !== "string" || timeZone.length === 0) {
    errors.push({
      code: "INVALID_TIMEZONE_STRUCTURE",
      message: "timeZone phải là chuỗi không rỗng.",
      field: "timeZone",
    });
  } else if (!Timezone.isValidTimeZone(timeZone)) {
    errors.push({
      code: "INVALID_TIMEZONE",
      message: `Múi giờ IANA không hợp lệ: "${timeZone}".`,
      field: "timeZone",
    });
  }

  return errors;
}
