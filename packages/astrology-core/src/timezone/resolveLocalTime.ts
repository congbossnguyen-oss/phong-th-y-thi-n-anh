/**
 * Timezone/DST Engine — Astrology Module Phase 1.
 * Đúng docs/astrology-module/ARCHITECTURE/ADR/ADR-010-Timezone-DST-Architecture.md: biến
 * `local time + IANA timezone (+ lịch sử DST)` thành UTC chính xác, KHÔNG bao giờ đoán khi
 * giờ địa phương mơ hồ (ambiguous, xảy ra 2 lần khi lùi giờ mùa hè) hoặc không tồn tại
 * (nonexistent, bị "nhảy cóc" khi tiến giờ mùa hè) — cả hai đều là kết quả HỢP LỆ của hàm
 * này, KHÔNG phải exception, vì bản thân giờ treo tường vẫn đúng cú pháp.
 *
 * Toàn bộ quy đổi offset dựa trên `Intl`/ICU tzdata đã có sẵn trong runtime qua
 * `@thien-anh/calendar-core` (`Timezone.getUtcOffsetMinutes`, `Timezone.utcToZonedTime`) —
 * KHÔNG tự viết bảng offset, KHÔNG hardcode "UTC+7" hay bất kỳ offset cố định nào (đúng yêu
 * cầu triển khai — xem ARCHITECTURE_FREEZE.md §4.3). Vì ICU chứa toàn bộ dữ liệu lịch sử của
 * IANA tzdata (kể cả các lần đổi offset cố định trong quá khứ, không chỉ DST theo mùa), việc
 * hỗ trợ "historical timezone" không cần code riêng — chỉ cần gọi đúng offset tại đúng thời
 * điểm, điều hàm dưới đây đã làm.
 */

import { Timezone } from "@thien-anh/calendar-core";
import type { CalendarDate, LocalTime } from "../types.js";

const { getUtcOffsetMinutes, utcToZonedTime, zonedTimeToUtc } = Timezone;

/**
 * Nửa ngày (mili giây) — khoảng cách lấy mẫu offset "trước"/"sau" quanh ANCHOR (xem
 * `resolveLocalTimeToUtc`) để dò chuyển múi giờ. 12h là đủ AN TOÀN chỉ khi anchor đã được neo
 * gần đúng thời điểm UTC thật (xem lịch sử sửa lỗi bên dưới) — KHÔNG được quay lại neo theo
 * "naive UTC" (coi số giờ địa phương như thể là UTC) như bản cũ.
 */
const HALF_DAY_MS = 12 * 60 * 60 * 1000;

export interface ResolvedInstant {
  utc: Date;
  utcOffsetMinutes: number;
}

export type LocalTimeResolution =
  | ({ status: "resolved" } & ResolvedInstant)
  | {
      status: "ambiguous";
      /** Đúng 2 thời điểm UTC hợp lệ cùng ứng với một giờ treo tường (do lùi giờ mùa hè). */
      candidates: [ResolvedInstant, ResolvedInstant];
    }
  | {
      status: "nonexistent";
      /** Thời điểm UTC hợp lệ gần nhất TRƯỚC khoảng trống (do tiến giờ mùa hè). */
      nearestValidBefore: ResolvedInstant;
      /** Thời điểm UTC hợp lệ gần nhất SAU khoảng trống. */
      nearestValidAfter: ResolvedInstant;
      /** Độ rộng khoảng trống (phút) — thường là 60, nhưng không giả định cố định. */
      gapMinutes: number;
    };

function wallClockEquals(a: CalendarDate & LocalTime, b: CalendarDate & LocalTime): boolean {
  return (
    a.year === b.year &&
    a.month === b.month &&
    a.day === b.day &&
    a.hour === b.hour &&
    a.minute === b.minute &&
    (a.second ?? 0) === (b.second ?? 0)
  );
}

function resolveWithOffset(naiveUtcMs: number, offsetMinutes: number): ResolvedInstant {
  return { utc: new Date(naiveUtcMs - offsetMinutes * 60_000), utcOffsetMinutes: offsetMinutes };
}

/**
 * Dò nhị phân (bisection) tìm thời điểm UTC (chính xác tới giây) mà offset múi giờ đổi từ
 * `offsetBefore` sang giá trị khác, trong khoảng `[lowMs, highMs]` đã biết chắc bao trọn đúng
 * MỘT lần chuyển giờ (`offset(lowMs) === offsetBefore`, `offset(highMs) !== offsetBefore`).
 * Trả về mili-giây UTC đầu tiên (làm tròn tới giây) mà offset mới đã áp dụng.
 *
 * QUAN TRỌNG: mọi điểm `mid` phải được làm tròn về đúng ranh giới GIÂY trước khi đưa vào
 * `getUtcOffsetMinutes` — hàm đó đọc offset qua `Intl.DateTimeFormat` với độ phân giải giây
 * (`second: "2-digit"`), nên nếu truyền vào một `Date` có phần mili-giây lẻ, phép round-trip
 * nội bộ của nó phát sinh sai số làm tròn dưới-giây (vd. offset trả về `-300.0083` thay vì
 * `-300` đúng), khiến so sánh `=== offsetBefore` sai ngay cả khi về bản chất offset chưa đổi
 * — làm bisection hội tụ sai vị trí (đã phát hiện bằng cách chạy thực tế, không phải suy đoán
 * lý thuyết — xem lịch sử test).
 */
function findTransitionInstantMs(lowMs: number, highMs: number, timeZone: string, offsetBefore: number): number {
  let lo = lowMs;
  let hi = highMs;
  while (hi - lo > 1_000) {
    const mid = Math.floor((lo + hi) / 2 / 1_000) * 1_000;
    if (getUtcOffsetMinutes(timeZone, new Date(mid)) === offsetBefore) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return hi;
}

/**
 * Quy đổi giờ treo tường (ngày + giờ tại nơi sinh) sang UTC — có phát hiện đầy đủ 2 trường hợp
 * biên của DST. KHÔNG throw: mọi tổ hợp `(date, localTime, timeZone)` hợp lệ cú pháp đều trả
 * về một trong ba trạng thái `resolved | ambiguous | nonexistent`.
 *
 * Thuật toán: lấy mẫu offset 12 giờ TRƯỚC và 12 giờ SAU một ANCHOR — KHÔNG lấy mẫu quanh "giờ
 * treo tường coi như UTC" (naive) như bản đầu tiên đã làm. Anchor được tính bằng
 * `Timezone.zonedTimeToUtc` (hội tụ 2 bước sẵn có của calendar-core) để tự động bù đúng offset
 * thực tế trước khi lấy mẫu.
 *
 * TẠI SAO bắt buộc phải neo theo anchor, không neo theo naive: nếu neo theo naive và offset
 * múi giờ lớn (vd. Pacific/Chatham +12:45/+13:45), khoảng lấy mẫu ±12h quanh ĐIỂM SAI (naive)
 * có thể nằm hoàn toàn về MỘT phía của điểm chuyển giờ thật — khiến `offsetBefore === offsetAfter`
 * dù ngày đó THỰC SỰ có chuyển giờ, làm hàm này ÂM THẦM trả về "resolved" cho một giờ treo
 * tường KHÔNG TỒN TẠI (đã xác nhận bằng cách chạy thực tế: giờ 02:45-03:30 ngày 2024-09-29 tại
 * Pacific/Chatham — đúng ra phải là "nonexistent" — bị trả về "resolved" sai). Neo theo anchor
 * (đã bù offset gần đúng) loại bỏ hoàn toàn phụ thuộc vào độ lớn offset, vì khoảng ±12h quanh
 * một điểm ĐÃ GẦN ĐÚNG luôn đủ rộng để bao trọn một lần chuyển giờ duy nhất trong ngày đó.
 *
 * Sau khi có offsetBefore/offsetAfter: nếu hai mốc cách nhau 24 giờ (quanh anchor) cho offset
 * khác nhau nghĩa là CHÍNH NGÀY đang xét có một lần chuyển; nếu giống nhau thì chắc chắn không
 * có chuyển giờ nào ảnh hưởng đến ngày này. Khi có chuyển giờ, thử cả hai offset làm ứng viên
 * rồi đối chiếu ngược lại: ứng viên nào round-trip đúng ra lại giờ treo tường gốc thì hợp lệ —
 * 0 ứng viên hợp lệ = nonexistent (khoảng trống), 2 ứng viên hợp lệ = ambiguous (mơ hồ), 1 ứng
 * viên hợp lệ = resolved bình thường (rơi đúng ngày có chuyển giờ nhưng bản thân giờ đó không
 * nằm trong vùng biên).
 */
export function resolveLocalTimeToUtc(date: CalendarDate, localTime: LocalTime, timeZone: string): LocalTimeResolution {
  const second = localTime.second ?? 0;
  const naiveUtcMs = Date.UTC(date.year, date.month - 1, date.day, localTime.hour, localTime.minute, second);
  const anchorMs = zonedTimeToUtc({ year: date.year, month: date.month, day: date.day, hour: localTime.hour, minute: localTime.minute, second }, timeZone).getTime();

  const offsetBefore = getUtcOffsetMinutes(timeZone, new Date(anchorMs - HALF_DAY_MS));
  const offsetAfter = getUtcOffsetMinutes(timeZone, new Date(anchorMs + HALF_DAY_MS));

  if (offsetBefore === offsetAfter) {
    // Không có chuyển múi giờ nào ảnh hưởng ngày này — hội tụ 1 bước như calendar-core vẫn làm.
    const offset = getUtcOffsetMinutes(timeZone, new Date(naiveUtcMs - offsetBefore * 60_000));
    return { status: "resolved", ...resolveWithOffset(naiveUtcMs, offset) };
  }

  const target = { ...date, ...localTime };
  const candidateBefore = resolveWithOffset(naiveUtcMs, offsetBefore);
  const candidateAfter = resolveWithOffset(naiveUtcMs, offsetAfter);

  const roundTripBefore = { ...utcToZonedTime(candidateBefore.utc, timeZone) };
  const roundTripAfter = { ...utcToZonedTime(candidateAfter.utc, timeZone) };

  const beforeValid = wallClockEquals(target, roundTripBefore);
  const afterValid = wallClockEquals(target, roundTripAfter);

  if (beforeValid && afterValid) {
    // Hai offset khác nhau nhưng CÙNG round-trip đúng giờ treo tường gốc => đây thực sự là 2
    // thời điểm UTC khác nhau cùng biểu diễn một giờ treo tường (mơ hồ do lùi giờ mùa hè).
    // Sắp theo thời gian UTC tăng dần để nơi gọi không phải tự sắp lại.
    const [first, second_] =
      candidateBefore.utc.getTime() <= candidateAfter.utc.getTime()
        ? [candidateBefore, candidateAfter]
        : [candidateAfter, candidateBefore];
    return { status: "ambiguous", candidates: [first, second_] };
  }

  if (beforeValid) return { status: "resolved", ...candidateBefore };
  if (afterValid) return { status: "resolved", ...candidateAfter };

  // Không ứng viên nào round-trip đúng => giờ treo tường này chưa từng tồn tại (khoảng trống
  // do tiến giờ mùa hè). Dò chính xác thời điểm chuyển giờ bằng bisection rồi báo cáo đúng
  // 2 mốc UTC hợp lệ NGAY SÁT hai bên khoảng trống (không phải suy diễn gián tiếp qua offset).
  const transitionMs = findTransitionInstantMs(
    anchorMs - HALF_DAY_MS,
    anchorMs + HALF_DAY_MS,
    timeZone,
    offsetBefore,
  );
  const nearestValidBefore: ResolvedInstant = { utc: new Date(transitionMs - 1_000), utcOffsetMinutes: offsetBefore };
  const nearestValidAfter: ResolvedInstant = { utc: new Date(transitionMs), utcOffsetMinutes: offsetAfter };
  const gapMinutes = Math.abs(offsetAfter - offsetBefore);
  return { status: "nonexistent", nearestValidBefore, nearestValidAfter, gapMinutes };
}
