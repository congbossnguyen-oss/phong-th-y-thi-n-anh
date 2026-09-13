/**
 * Phase 3C — Western Aspects. Tầng "Chart Calculation" (như `houses.ts`/`planets.ts`) — tính
 * tương quan góc (aspect) giữa các cặp hành tinh, dựa trên longitude đã có (Phase 3A/3B-2).
 * KHÔNG có ý nghĩa diễn giải nào (tốt/xấu, hài hoà/khó khăn) — CHỈ dữ kiện hình học.
 *
 * KIẾN TRÚC: `DOMAIN_MODEL.md` §4/§6 xác nhận 5 aspect chính (conjunction, opposition, square,
 * trine, sextile — tên gốc từ `PHASE1_NOTES/PHASE1_SCOPE.md`, được `ARCHITECTURE_FREEZE.md` §7
 * xác nhận "not superseded on substance" khi chuyển từ Phase 1 sang Phase 3), nhưng orb (độ rộng
 * dung sai) CHỈ được mô tả là "configurable"/"school-specific" — KHÔNG có con số cụ thể nào
 * trong toàn bộ tài liệu freeze (`AspectRuleSet` được NHẮC TÊN ở `DOMAIN_MODEL.md` §5 nhưng
 * KHÔNG BAO GIỜ được định nghĩa hình dạng cụ thể). Bảng orb dưới đây (`WESTERN_MODERN_MAJOR_ASPECT_ORB_POLICY`)
 * là QUYẾT ĐỊNH KIẾN TRÚC được duyệt tường minh cho Phase 3C — xem
 * `docs/astrology-module/PHASE3C_ASPECTS_IMPLEMENTATION.md`.
 *
 * THIẾT KẾ BẮT BUỘC (theo yêu cầu duyệt): "orb policy" (bảng độ/orb) và "aspect engine" (thuật
 * toán so khớp) TÁCH RIÊNG — `computeWesternAspects()` nhận policy làm THAM SỐ (mặc định dùng
 * `WESTERN_MODERN_MAJOR_ASPECT_ORB_POLICY`, KHÔNG hardcode bên trong thuật toán), để một policy
 * khác (vd. Ptolemaic per-planet, hoặc orb rộng/hẹp hơn theo trường phái khác) có thể thêm sau mà
 * KHÔNG cần sửa engine. `angularSeparation()` — thuật toán hình học thuần — hoàn toàn KHÔNG biết
 * gì về aspect/orb, chỉ tính khoảng cách góc nhỏ nhất giữa 2 longitude.
 *
 * KHÔNG implement: aspect phụ (semisextile, quincunx, ...), Ptolemaic per-planet orb, applying/
 * separating (bản phác thảo `applying: bool` ở tài liệu audit giai đoạn đầu KHÔNG được đưa vào
 * schema đã freeze — `NormalizedAspectInstance` hiện tại không có field này, xem
 * PHASE3C_ASPECTS_IMPLEMENTATION.md "Applying/separating status").
 */

import type { AspectType, NormalizedAspectInstance } from "../chart/types.js";

function normalizeDegrees(value: number): number {
  const wrapped = value % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

/**
 * Khoảng cách góc NHỎ NHẤT giữa 2 longitude — HÀM THUẦN HÌNH HỌC, KHÔNG biết gì về aspect/orb.
 * Luôn trong [0,180], tự chuẩn hoá longitude đầu vào (âm, >360) trước khi tính, xử lý đúng
 * wraparound qua điểm nối 360°/0° (vd. 359° và 1° cách nhau 2°, KHÔNG phải 358°).
 */
export function angularSeparation(longitudeA: number, longitudeB: number): number {
  const a = normalizeDegrees(longitudeA);
  const b = normalizeDegrees(longitudeB);
  const diff = Math.abs(a - b);
  return diff > 180 ? 360 - diff : diff;
}

/** Một loại aspect + góc lý tưởng + orb cho phép — đơn vị nhỏ nhất của một `AspectOrbPolicy`. */
export interface AspectDefinition {
  type: AspectType;
  /** Góc lý tưởng (độ), 0-180. */
  exactAngle: number;
  /** Dung sai cho phép quanh `exactAngle` (độ), >= 0. */
  orbDegrees: number;
}

/**
 * Một "orb policy" ĐẶT TÊN — bảng cấu hình orb hoàn chỉnh, độc lập với engine tính toán. `id` bắt
 * buộc DUY NHẤT và ỔN ĐỊNH (dùng để tham chiếu/versioning nếu Evidence/Interpretation layer sau
 * này cần biết policy nào đã tạo ra một aspect cụ thể — xem "known limitations" trong tài liệu
 * phase).
 */
export interface AspectOrbPolicy {
  id: string;
  description: string;
  definitions: readonly AspectDefinition[];
}

/**
 * Orb policy MẶC ĐỊNH của Tây phương cho Phase 3C — KHÔNG PHẢI hằng số phổ quát của chiêm tinh
 * học, mà là MỘT lựa chọn cấu hình cụ thể đã được duyệt (kiến trúc chỉ nói "configurable", không
 * cho số). Giá trị: Conjunction/Opposition/Trine = 8°, Square = 7°, Sextile = 6° — bảng "modern
 * common" phổ biến nhất trong phần mềm chiêm tinh Tây phương hiện đại (đúng lựa chọn đã duyệt,
 * KHÔNG phải Ptolemaic per-planet). Trường phái khác (hoặc bản Tây phương khác orb rộng/hẹp hơn)
 * định nghĩa `AspectOrbPolicy` RIÊNG, KHÔNG sửa policy này.
 */
export const WESTERN_MODERN_MAJOR_ASPECT_ORB_POLICY: AspectOrbPolicy = {
  id: "western.major_aspects.modern_default.v1",
  description:
    "Phase 3C Western default orb policy — NOT a universal astrology constant, a specific configured choice. " +
    "5 major aspects, fixed per-aspect-type orb (not per-planet/Ptolemaic): conjunction/opposition/trine 8°, square 7°, sextile 6°.",
  definitions: [
    { type: "conjunction", exactAngle: 0, orbDegrees: 8 },
    { type: "sextile", exactAngle: 60, orbDegrees: 6 },
    { type: "square", exactAngle: 90, orbDegrees: 7 },
    { type: "trine", exactAngle: 120, orbDegrees: 8 },
    { type: "opposition", exactAngle: 180, orbDegrees: 8 },
  ],
};

/** Một điểm có thể tham gia aspect — tối giản, chỉ cần định danh + longitude. */
export interface AspectCandidatePoint {
  body: string;
  longitude: number;
}

/**
 * So khớp một khoảng cách góc đã tính với bảng định nghĩa của policy — trả về định nghĩa khớp
 * ĐẦU TIÊN (theo thứ tự khai báo trong `definitions`) mà orb đo được <= `orbDegrees` cho phép
 * (biên orb ĐÓNG — "exactly on allowed orb" được coi là HỢP LỆ, không phải vừa ngoài). Với bảng
 * orb mặc định ở trên, các cửa sổ orb không chồng lấn nhau (khoảng cách tối thiểu giữa 2 góc lý
 * tưởng liền kề là 30°, tổng 2 orb liền kề tối đa 15° < 30°) nên thứ tự khai báo không ảnh hưởng
 * kết quả trong thực tế — vẫn viết tường minh để đúng với MỌI policy tương lai có thể chồng lấn.
 */
function matchAspectDefinition(
  separationDegrees: number,
  definitions: readonly AspectDefinition[],
): { definition: AspectDefinition; orb: number } | null {
  for (const definition of definitions) {
    const orb = Math.abs(separationDegrees - definition.exactAngle);
    if (orb <= definition.orbDegrees) {
      return { definition, orb };
    }
  }
  return null;
}

/**
 * Tính TẤT CẢ aspect giữa các cặp điểm KHÔNG CÓ THỨ TỰ trong `points` — mỗi cặp {A,B} xuất hiện
 * ĐÚNG 1 LẦN (KHÔNG có cả A→B lẫn B→A), KHÔNG có self-aspect (A với chính A). HÀM THUẦN — cùng
 * input (kể cả cùng THỨ TỰ mảng `points`) luôn cho cùng output, KHÔNG ngẫu nhiên/`Date.now()`.
 *
 * THỨ TỰ OUTPUT (quy tắc xác định, xem PHASE3C_ASPECTS_IMPLEMENTATION.md "Deterministic
 * ordering"): sinh cặp theo vòng lặp lồng nhau `i < j` trên CHÍNH thứ tự phần tử của `points` —
 * planetA = points[i], planetB = points[j]. Vì vậy thứ tự output phụ thuộc thứ tự `points` đầu
 * vào (caller kiểm soát, vd. `WESTERN_CORE_BODIES`'s thứ tự cố định) — KHÔNG tự sắp xếp lại theo
 * alphabet hay bất kỳ tiêu chí nào khác. Chỉ những cặp THỰC SỰ có aspect (orb <= cho phép) mới
 * xuất hiện trong mảng kết quả — không có "no aspect" placeholder cho các cặp không khớp.
 *
 * `orbPolicy` mặc định `WESTERN_MODERN_MAJOR_ASPECT_ORB_POLICY` nhưng LUÔN có thể truyền policy
 * khác — engine này không biết/không quan tâm giá trị orb cụ thể là bao nhiêu.
 */
export function computeWesternAspects(
  points: readonly AspectCandidatePoint[],
  orbPolicy: AspectOrbPolicy = WESTERN_MODERN_MAJOR_ASPECT_ORB_POLICY,
): NormalizedAspectInstance[] {
  const aspects: NormalizedAspectInstance[] = [];

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const pointA = points[i]!;
      const pointB = points[j]!;
      const separation = angularSeparation(pointA.longitude, pointB.longitude);
      const match = matchAspectDefinition(separation, orbPolicy.definitions);
      if (match === null) continue;

      aspects.push({
        planetA: pointA.body,
        planetB: pointB.body,
        type: match.definition.type,
        exactAngle: match.definition.exactAngle,
        actualAngle: separation,
        orb: match.orb,
        withinOrb: true,
      });
    }
  }

  return aspects;
}
