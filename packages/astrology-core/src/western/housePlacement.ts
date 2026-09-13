/**
 * Phase 3B-2 — gán một longitude (hành tinh/điểm) vào ĐÚNG 1 trong 12 nhà, dựa trên house cusps
 * đã có (Phase 3B-1's `NormalizedHouseCusp[]`). HÀM THUẦN, hình học thuần tuý — KHÔNG gọi lại
 * Swiss Ephemeris (`sweph.house_pos()` tồn tại và cho kết quả "visually accurate" hơn — có tính
 * vĩ độ hoàng đạo/xích vĩ của điểm — nhưng Phase 3B-2 CHỈ yêu cầu "longitude + house cusps",
 * dùng phương pháp CUNG longitude chuẩn/phổ biến nhất, KHÔNG thêm phụ thuộc/độ phức tạp không
 * được yêu cầu — xem FUTURE_WORK.md nếu sau này cần độ chính xác "visually accurate" cho hành
 * tinh có vĩ độ hoàng đạo lớn).
 *
 * Quy ước biên (boundary): nhà N trải dài NỬA MỞ [cusp[N], cusp[N+1]) theo chiều longitude tăng
 * dần (vòng qua 360°/0° nếu cần) — một điểm nằm ĐÚNG TẠI cusp[N] thuộc nhà N (biên dưới đóng),
 * KHÔNG thuộc nhà N-1 (biên trên mở). Đây là quy ước chuẩn/phổ biến nhất trong phần mềm chiêm
 * tinh Tây phương.
 */

import type { HouseNumber, NormalizedHouseCusp } from "../chart/types.js";

const EXPECTED_HOUSE_COUNT = 12;

function normalizeDegrees(value: number): number {
  const wrapped = value % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

/** Điểm `longitude` có nằm trong cung [start, end) đi theo chiều TĂNG DẦN, vòng qua 360°/0° nếu `end < start`? */
function isWithinForwardArc(longitude: number, start: number, end: number): boolean {
  if (start <= end) {
    return longitude >= start && longitude < end;
  }
  return longitude >= start || longitude < end;
}

/**
 * Gán house number cho một longitude, dựa trên ĐÚNG 12 house cusps (đã sắp xếp theo houseNumber
 * 1..12 hay chưa đều được — hàm tự sắp xếp lại). Ném lỗi nếu `houseCusps` không đúng 12 phần tử
 * — caller (Phase 3B-1's `calculateWesternHousesAndAngles`) LUÔN trả đúng 12 khi thành công, nên
 * đây là bảo vệ chống lỗi lập trình, không phải một tình huống runtime bình thường.
 */
export function assignHouseNumber(longitude: number, houseCusps: readonly NormalizedHouseCusp[]): HouseNumber {
  if (houseCusps.length !== EXPECTED_HOUSE_COUNT) {
    throw new Error(`assignHouseNumber: cần đúng ${EXPECTED_HOUSE_COUNT} house cusps, nhận ${houseCusps.length}.`);
  }

  const sorted = [...houseCusps].sort((a, b) => a.houseNumber - b.houseNumber);
  const normalizedLongitude = normalizeDegrees(longitude);

  for (let i = 0; i < EXPECTED_HOUSE_COUNT; i++) {
    const current = sorted[i]!;
    const next = sorted[(i + 1) % EXPECTED_HOUSE_COUNT]!;
    if (isWithinForwardArc(normalizedLongitude, normalizeDegrees(current.longitude), normalizeDegrees(next.longitude))) {
      return current.houseNumber;
    }
  }

  // Không thể xảy ra nếu 12 cusp hợp lệ (phủ kín 360° không hở) — phòng vệ, không phải kỳ vọng bình thường.
  throw new Error(`assignHouseNumber: longitude=${longitude} không rơi vào cung nào trong 12 house cusps đã cho.`);
}
