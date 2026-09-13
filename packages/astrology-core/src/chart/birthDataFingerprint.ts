/**
 * `birthDataRef` trong NormalizedChart (DOMAIN_MODEL.md §4: `birth_data_ref: BirthDataId`) giả
 * định có một hệ thống bên ngoài (vd. database, Phase 10 — CHƯA tồn tại) cấp ID cho BirthData.
 * Vì Phase 2 phải "độc lập với database" và vẫn cần `NormalizedChart` tái lập được/so sánh
 * được (golden fixture, hashing) MÀ KHÔNG CẦN một DB cấp ID, package này cung cấp thêm hàm
 * fingerprint NỘI DUNG làm giá trị `birthDataRef` khi chưa có ID bên ngoài nào — đây là một bổ
 * sung có chủ đích, không mâu thuẫn với DOMAIN_MODEL.md (field vẫn là `string` bất kỳ, chỉ là
 * CÁCH SINH ra chuỗi đó khi không có DB). Khi Phase 10 có database thật, caller có thể dùng ID
 * thật của DB thay cho fingerprint này — `NormalizedChart.birthDataRef` không quan tâm nguồn
 * gốc chuỗi, chỉ cần ổn định/duy nhất theo nội dung sinh ra nó.
 *
 * CHỈ hash các field ẢNH HƯỞNG kết quả thiên văn (date, localTime, timezoneId, toạ độ, độ
 * cao) — cố ý LOẠI `locationLabel` (chỉ hiển thị, chính BirthData đã ghi rõ "KHÔNG BAO GIỜ
 * dùng trong tính toán") và `timeUncertaintyMinutes` (tín hiệu độ tin cậy, chưa dùng ở Phase
 * 1/2) khỏi fingerprint — hai bản ghi khác nhãn hiển thị nhưng cùng ngày/giờ/toạ độ được coi
 * là "cùng một birth data" cho mục đích tham chiếu/khớp golden fixture.
 */
import { createHash } from "node:crypto";
import type { BirthData } from "../types.js";
import { stableStringify } from "./stableStringify.js";

export function computeBirthDataFingerprint(birthData: BirthData): string {
  const canonicalSubset = {
    date: birthData.date,
    localTime: birthData.localTime,
    timezoneId: birthData.timezoneId,
    latitude: birthData.latitude,
    longitude: birthData.longitude,
    altitudeMeters: birthData.altitudeMeters ?? null,
  };
  return `sha256:${createHash("sha256").update(stableStringify(canonicalSubset)).digest("hex")}`;
}
