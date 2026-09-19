/**
 * Solar Terms — bọc `@thien-anh/calendar-core`'s `getSolarTerms(year)` và vá 1 gap đã ghi
 * nhận ở Phase 4 (docs/daliuren/DA_LIU_REN_CALENDAR_BOUNDARY_TESTS.md §5): hàm gốc CHỈ trả
 * tiết khí XẢY RA TRONG năm dương lịch đó — không phải bug, nhưng người gọi PHẢI tự gộp
 * năm liền kề khi cần tìm "tiết khí gần nhất trước 1 thời điểm" gần ranh giới năm.
 */
import { getSolarTerms as coreGetSolarTerms, type SolarTermOccurrence } from "@thien-anh/calendar-core";
import type { SolarTerm } from "../types/calendar-data.js";
import { CalendarFoundationError } from "./errors.js";

function pad(value: number, width = 2): string {
  return String(value).padStart(width, "0");
}

/** `dateTimeUtc` của calendar-core đã LÀ giờ UTC dạng thành phần (không phải Date) — build ISO trực tiếp, không round-trip qua `Date` (tránh sai số/parse lại không cần thiết). */
function toIsoUtc(occurrence: SolarTermOccurrence): string {
  const { year, month, day, hour, minute, second } = occurrence.dateTimeUtc;
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}Z`;
}

function toDaLiuRenSolarTerm(occurrence: SolarTermOccurrence): SolarTerm {
  return {
    nameHan: occurrence.nameHan,
    name: occurrence.name,
    kind: occurrence.kind,
    occurredAt: toIsoUtc(occurrence),
  };
}

/**
 * Toàn bộ tiết khí của 3 năm dương lịch liên tiếp (`year-1`, `year`, `year+1`), đã chuyển
 * sang `SolarTerm` (Đại Lục Nhâm) và sắp xếp theo thời gian tăng dần.
 *
 * BẮT BUỘC gộp 3 năm — xem cảnh báo ở đầu file. Test bắt buộc: 小寒, 大寒, 立春, và các
 * timestamp sát ranh giới năm (Phase 5B-1 mục "Solar Terms").
 */
export function getSolarTermsWindow(year: number): SolarTerm[] {
  if (!Number.isInteger(year)) {
    throw new CalendarFoundationError("INVALID_DATETIME_INPUT", `Năm không hợp lệ: ${year} (phải là số nguyên).`);
  }

  const occurrences = [...coreGetSolarTerms(year - 1), ...coreGetSolarTerms(year), ...coreGetSolarTerms(year + 1)];

  return occurrences.map(toDaLiuRenSolarTerm).sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
}

/**
 * Tiết khí gần nhất XẢY RA TRƯỚC HOẶC BẰNG `utcInstant`, tìm trong cửa sổ 3 năm quanh
 * `referenceYear` (đủ biên độ an toàn cho mọi ranh giới năm thực tế). Lọc theo `kind` nếu có.
 */
export function getPrecedingSolarTerm(utcInstant: Date, referenceYear: number, kind?: SolarTerm["kind"]): SolarTerm {
  const window = getSolarTermsWindow(referenceYear).filter((term) => (kind ? term.kind === kind : true));
  const instantIso = utcInstant.toISOString();

  let preceding: SolarTerm | undefined;
  for (const term of window) {
    if (term.occurredAt <= instantIso) {
      preceding = term;
    } else {
      break;
    }
  }

  if (!preceding) {
    throw new CalendarFoundationError(
      "INVALID_DATETIME_INPUT",
      `Không tìm thấy tiết khí${kind ? ` (${kind})` : ""} nào trước thời điểm ${instantIso} trong cửa sổ 3 năm quanh ${referenceYear} — thời điểm chiêm nằm ngoài phạm vi hỗ trợ.`,
    );
  }

  return preceding;
}

/**
 * Trung Khí (中氣) gần nhất trước/bằng thời điểm chiêm — dữ liệu thô cần cho Nguyệt Tướng
 * (Algorithm Spec §2). CHỈ tính "trung khí nào đứng trước" — việc suy ra Nguyệt Tướng cụ
 * thể (ánh xạ trung khí → Chi) là Month General, CỐ TÌNH CHƯA implement ở Phase 5B-1.
 */
export function getPrecedingMajorTerm(utcInstant: Date, referenceYear: number): SolarTerm {
  return getPrecedingSolarTerm(utcInstant, referenceYear, "trungKhi");
}
