/**
 * Đo hình học từ 468 landmark. Module này CHỈ ĐO — không có một dòng nào diễn giải.
 *
 * Mọi chỉ số đều chuẩn hoá theo bề ngang/chiều cao mặt, không có ngưỡng pixel cố
 * định nào (lỗi kinh điển: `noseWidth > 40` trong ljtnine/face, đảo kết quả khi
 * khách bước tới gần camera).
 *
 * `status` của từng field lấy từ bằng chứng Phase 1B-2 — sai lệch % đo trên ảnh thật
 * của cùng một người qua 6 tư thế:
 *   eyeDistance     4.99% (pitch)  → measured
 *   faceHeight      ổn định        → measured
 *   noseWidth      15.30% (yaw)    → estimated
 *   mouthWidth     20.57% (pitch)  → estimated
 *   noseLength     44.12% (pitch)  → estimated (cảnh báo mạnh)
 *   faceShapeRatio 17.63% (pitch)  → estimated (vỡ cả 4 trục)
 */

import {
  estimated,
  measured,
  unsupported,
  type FiveOrgansFeatures,
  type GeometryFeatures,
  type LandmarkPoint,
  type RegionMappingConfidence,
  type StructuralFeatures,
  type ThreeCourtsFeatures,
  type TwelvePalaceName,
  type TwelvePalacesFeatures,
} from "../types/index";

// ───────────────────── landmark index (đã đối chiếu canonical mesh ở Phase 1B)

export const IDX = {
  /** Đỉnh lưới giữa trán. KHÔNG phải chân tóc — lưới 468 điểm không có đỉnh ở chân tóc. */
  foreheadTop: 10,
  chin: 152,
  noseTip: 1,
  /** Sơn căn (giữa hai mắt). */
  nasion: 168,
  /** Chân mũi — mốc phân chia trung/hạ đình theo cổ truyền. */
  subnasale: 2,
  browLeft: 105,
  browRight: 334,
  eyeLeftOuter: 33,
  /** ĐÃ ĐỐI CHIẾU: 133 là KHOÉ MẮT TRONG, không phải điểm lông mày.
   *  ljtnine/face dùng sai index này làm `leftEyebrowOuter` — xem PHASE1B §C2. */
  eyeLeftInner: 133,
  eyeRightInner: 362,
  eyeRightOuter: 263,
  mouthLeft: 61,
  mouthRight: 291,
  alaLeft: 48,
  alaRight: 278,
  /** Gò má trái/phải — mốc chuẩn hoá bề ngang mặt. */
  cheekLeft: 234,
  cheekRight: 454,
  /** Viền hàm dưới trái/phải. */
  jawLeft: 172,
  jawRight: 397,
  foreheadLeft: 103,
  foreheadRight: 332,
} as const;

// ───────────────────────────────────────────────────────────── phép tính cơ bản

function dist2d(a: LandmarkPoint, b: LandmarkPoint, w: number, h: number): number {
  return Math.hypot((a.x - b.x) * w, (a.y - b.y) * h);
}

/** Vector 3 chiều đã nhân theo kích thước khung (z dùng thang của x). */
function vec3(p: LandmarkPoint, w: number, h: number): [number, number, number] {
  return [p.x * w, p.y * h, p.z * w];
}

// ─────────────────────────────────────────────────────────────── ba đình

/**
 * Ba đình bằng cách chiếu lên TRỤC DỌC CỦA CHÍNH ĐẦU, không dùng hiệu toạ độ ảnh.
 *
 * Phase 1B-2 đo trên ảnh thật, cùng một người, pitch +19° → −31°:
 *   hiệu toạ độ ảnh : trung đình 0.4303 → 0.4924 → 0.3757   biên độ 0.1168
 *   trục đầu 3D     : trung đình 0.4260 → 0.4323 → 0.4320   biên độ 0.0063  (tốt hơn 18.5×)
 *
 * Chỉ TRUNG ĐÌNH là "measured". Thượng/hạ đình là "estimated":
 *   - thượng đình: mốc trên là đỉnh lưới (idx 10), không phải chân tóc → lệch hệ
 *     thống 46% (canonical mesh chính diện cho 0.179 so với lý tưởng 0.333). Mọi
 *     người đều sẽ đọc ra "thượng đình khuyết" nếu tin con số này.
 *   - hạ đình: đỉnh cằm xa trục quay nhất nên trôi nhiều nhất (biên độ 0.072).
 */
export function measureThreeCourts(
  lm: LandmarkPoint[],
  w: number,
  h: number,
): ThreeCourtsFeatures {
  const P = (i: number) => vec3(lm[i], w, h);

  const top = P(IDX.foreheadTop);
  const chin = P(IDX.chin);
  const axis = [chin[0] - top[0], chin[1] - top[1], chin[2] - top[2]] as const;
  const len = Math.hypot(axis[0], axis[1], axis[2]);
  if (len < 1e-6) {
    return {
      status: "unknown",
      upper: unsupported("Không dựng được trục dọc của đầu"),
      middle: unsupported("Không dựng được trục dọc của đầu"),
      lower: unsupported("Không dựng được trục dọc của đầu"),
      method: "headAxis3d",
    };
  }
  const u = [axis[0] / len, axis[1] / len, axis[2] / len] as const;
  const proj = (i: number) => {
    const p = P(i);
    return p[0] * u[0] + p[1] * u[1] + p[2] * u[2];
  };

  const tTop = proj(IDX.foreheadTop);
  const tBrow = (proj(IDX.browLeft) + proj(IDX.browRight)) / 2;
  const tSub = proj(IDX.subnasale);
  const tChin = proj(IDX.chin);

  const upper = Math.abs(tBrow - tTop);
  const middle = Math.abs(tSub - tBrow);
  const lower = Math.abs(tChin - tSub);
  const total = upper + middle + lower;
  if (total < 1e-6) {
    return {
      status: "unknown",
      upper: unsupported("Tổng ba đình bằng 0"),
      middle: unsupported("Tổng ba đình bằng 0"),
      lower: unsupported("Tổng ba đình bằng 0"),
      method: "headAxis3d",
    };
  }

  return {
    status: "measured",
    upper: estimated(
      round4(upper / total),
      "ratio",
      "Mốc trên là đỉnh lưới (landmark 10), KHÔNG phải chân tóc — lưới 468 điểm không " +
        "có đỉnh nào ở chân tóc. Lệch hệ thống ~46% so với chuẩn cổ truyền: mọi khuôn " +
        "mặt đều đọc ra thấp hơn 1/3. Không dùng để kết luận sơ niên vận.",
      "courtTotal",
    ),
    middle: measured(round4(middle / total), "ratio", "courtTotal"),
    lower: estimated(
      round4(lower / total),
      "ratio",
      "Đỉnh cằm là mốc xa trục quay nhất nên trôi nhiều khi chúc/ngẩng đầu — biên độ " +
        "0.072 qua các tư thế thật (Phase 1B-2).",
      "courtTotal",
    ),
    method: "headAxis3d",
  };
}

// ─────────────────────────────────────────────────────────────── ngũ quan

export function measureFiveOrgans(
  lm: LandmarkPoint[],
  w: number,
  h: number,
  faceWidthPx: number,
  faceHeightPx: number,
): FiveOrgansFeatures {
  const d = (a: number, b: number) => dist2d(lm[a], lm[b], w, h);

  const eyeLen =
    (d(IDX.eyeLeftOuter, IDX.eyeLeftInner) + d(IDX.eyeRightInner, IDX.eyeRightOuter)) / 2;
  // Khoảng cách mày–mắt: dùng KHOẢNG CÁCH HÌNH HỌC, không dùng hiệu toạ độ y.
  // Hiệu toạ độ y không bất biến với roll — nghiêng đầu 20° là con số đổi ~6%.
  // Cặp điểm dùng ở đây gần như thẳng đứng nên hai cách ra số gần nhau khi mặt
  // ngay ngắn, nhưng chỉ euclidean mới đúng khi có roll.
  const browEyeSpan =
    (d(IDX.browLeft, IDX.eyeLeftInner) + d(IDX.browRight, IDX.eyeRightInner)) / 2;

  return {
    status: "measured",
    eyebrow: estimated(
      round4(browEyeSpan / faceHeightPx),
      "ratio",
      "Dùng khoảng cách hình học (bất biến với roll) nhưng vẫn bị pitch ảnh hưởng vì " +
        "cặp điểm gần thẳng đứng. Quan trọng hơn: landmark chỉ bám xương/mí, KHÔNG thấy " +
        "được sợi lông mày — đậm/nhạt/mọc ngược/tán loạn đều không đo được.",
      "faceHeight",
    ),
    eye: measured(round4(eyeLen / faceWidthPx), "ratio", "faceWidth"),
    nose: estimated(
      round4(d(IDX.alaLeft, IDX.alaRight) / faceWidthPx),
      "ratio",
      "Bề ngang cánh mũi lệch tới 15.3% ở yaw 28° (cánh mũi bị che một phần khi quay mặt).",
      "faceWidth",
    ),
    mouth: estimated(
      round4(d(IDX.mouthLeft, IDX.mouthRight) / faceWidthPx),
      "ratio",
      "Lệch tới 20.6% ở pitch −31° — miệng tiến gần camera hơn gò má nên bị phóng đại.",
      "faceWidth",
    ),
    ear: unsupported(
      "Lưới 468 điểm của MediaPipe KHÔNG có landmark nào trên vành tai. Không đo được " +
        "bằng công nghệ hiện tại — đây là giới hạn của model, không phải chưa làm.",
    ),
  };
}

// ─────────────────────────────────────────────────────── geometry tổng hợp

export function measureGeometry(
  lm: LandmarkPoint[],
  frameWidth: number,
  frameHeight: number,
): GeometryFeatures {
  const w = frameWidth;
  const h = frameHeight;
  const d = (a: number, b: number) => dist2d(lm[a], lm[b], w, h);

  const faceWidthPx = d(IDX.cheekLeft, IDX.cheekRight);
  const faceHeightPx = d(IDX.foreheadTop, IDX.chin);

  return {
    // Bề ngang mặt là MỐC chuẩn hoá, nên bản thân nó chỉ có nghĩa ở dạng pixel.
    faceWidth: measured(round2(faceWidthPx), "px", "none"),
    faceHeight: measured(round4(faceHeightPx / faceWidthPx), "ratio", "faceWidth"),
    faceShapeRatio: estimated(
      round4(faceHeightPx / faceWidthPx),
      "ratio",
      "Vỡ ở cả 4 trục (khoảng cách 7.1% · yaw 5.1% · pitch 17.6% · roll 6.0%). " +
        "Nguyên nhân: yaw làm bề ngang co theo cos(yaw) còn chiều cao thì không.",
      "faceWidth",
    ),
    eyeDistance: measured(round4(d(IDX.eyeLeftInner, IDX.eyeRightInner) / faceWidthPx), "ratio", "faceWidth"),
    noseWidth: estimated(
      round4(d(IDX.alaLeft, IDX.alaRight) / faceWidthPx),
      "ratio",
      "Lệch 15.3% ở yaw 28°, 10.9% do khoảng cách chụp. Chuẩn hoá theo bề ngang mặt " +
        "KHÔNG khử hết phối cảnh vì mũi nhô ra trước gò má.",
      "faceWidth",
    ),
    noseLength: estimated(
      round4(d(IDX.nasion, IDX.noseTip) / faceHeightPx),
      "ratio",
      "KÉM NHẤT trong nhóm: lệch 44.1% ở pitch −31°. Mũi nhô ra trước nên khi ngẩng " +
        "đầu nó gần như biến mất khỏi mặt phẳng ảnh. Chỉ dùng khi pose đã qua cổng.",
      "faceHeight",
    ),
    mouthWidth: estimated(
      round4(d(IDX.mouthLeft, IDX.mouthRight) / faceWidthPx),
      "ratio",
      "Lệch 20.6% ở pitch −31°. Hiệu chỉnh phối cảnh bằng độ sâu template làm TỆ HƠN " +
        "(−33%) nên không áp dụng cho field này.",
      "faceWidth",
    ),
    jawWidth: estimated(
      round4(d(IDX.jawLeft, IDX.jawRight) / faceWidthPx),
      "ratio",
      "Viền hàm nằm ở mặt phẳng độ sâu khác gò má nên chịu méo phối cảnh; chưa đo " +
        "riêng sai số cho field này ở Phase 1B.",
      "faceWidth",
    ),
    referencePx: {
      faceWidthPx: round2(faceWidthPx),
      faceHeightPx: round2(faceHeightPx),
      frameWidth,
      frameHeight,
    },
  };
}

// ─────────────────────────────────── vùng cấu trúc + thập nhị cung (unsupported)

/**
 * Bản đồ 12 cung → landmark index, ĐÃ THIẾT KẾ LẠI ở Phase 1B (web).
 *
 * Mọi vùng được kiểm bằng canonical mesh của MediaPipe với 4 tiêu chí khách quan
 * (tất cả chuẩn hoá theo bề ngang mặt):
 *   z-spread ≤ 0.20   — vùng phải nằm trên MỘT bề mặt giải phẫu, không trộn nhiều mặt
 *   đường kính ≤ 0.45 — vùng phải đủ gọn để còn là "bộ vị"
 *   0 điểm contour    — vành mắt/môi là ĐƯỜNG BIÊN, lấy mean của một vành thì vô nghĩa
 *   ≥ 4 điểm          — ít hơn thì mean không ổn định
 *
 * ★ CẤU TRÚC SONG PHƯƠNG: cung nào có hai bên thì giữ TRÁI và PHẢI riêng. Bản port
 *   ở Phase 1 đã làm phẳng hai bên thành một mảng — sai, vì lấy mean của cả hai bên
 *   sẽ triệt tiêu chính sự khác biệt trái/phải mà tướng học quan tâm, và làm đường
 *   kính vùng vọt lên > 0.6.
 *
 * Bốn cung được thiết kế lại trong phase này (số liệu trước → sau):
 *   phuThe    z-spread 0.4041 → 0.1049 · đ.kính 1.0179 → 0.1855 · contour 4 → 0
 *   dienTrach z-spread 0.1621 → 0.0469 · đ.kính 0.2937 → 0.1871 · contour 6 → 0
 *   menh      z-spread 0.1080 → 0.0182 · đ.kính 0.5987 → 0.1821
 *   quanLoc   3 điểm → 5 điểm · z-spread 0.0524 → 0.0491
 *   phuMau    3 điểm/bên → 5 điểm/bên
 */
export interface PalaceRegionDef {
  left: number[];
  right: number[] | null;
  mapping: RegionMappingConfidence;
  metrics: { zSpread: number; diameter: number; contourPoints: number };
  note?: string;
}

export const PALACE_REGIONS: Record<TwelvePalaceName, PalaceRegionDef> = {
  // 命宮 / ấn đường — CHỈ vùng giữa hai đầu mày, trên sống mũi. Vùng chặt nhất trong 12.
  menh: {
    left: [107, 336, 9, 55, 285, 8], right: null,
    mapping: "verified",
    metrics: { zSpread: 0.0182, diameter: 0.1821, contourPoints: 0 },
  },
  // 財帛宮 / mũi — toàn bộ sống mũi + cánh mũi. Vùng mạch lạc nhất theo z.
  taiBach: {
    left: [6, 168, 197, 195, 1, 4, 5, 48, 125, 209, 49, 278, 354, 429, 279], right: null,
    mapping: "verified",
    metrics: { zSpread: 0.1556, diameter: 0.3092, contourPoints: 0 },
  },
  // 兄弟宮 / lông mày — tách trái/phải (bản cũ gộp đôi làm đ.kính vọt lên 0.7465).
  huynhDe: {
    left: [46, 53, 52, 65, 55, 107, 66, 105, 63, 70],
    right: [276, 283, 282, 295, 285, 336, 296, 334, 293, 300],
    mapping: "verified",
    metrics: { zSpread: 0.1621, diameter: 0.2937, contourPoints: 0 },
  },
  // 田宅宮 / mi trên — THIẾT KẾ LẠI: mặt mi giữa mày và mắt, bỏ hết điểm vành mắt.
  dienTrach: {
    left: [223, 222, 224, 221, 225, 27, 28, 29, 56, 30],
    right: [443, 442, 444, 441, 445, 257, 258, 259, 286, 260],
    mapping: "verified",
    metrics: { zSpread: 0.0469, diameter: 0.1871, contourPoints: 0 },
  },
  // 子女宮 / ngoạ tàm — bọng dưới mắt, tách trái/phải.
  tuNu: {
    left: [116, 117, 118, 119, 120], right: [345, 346, 347, 348, 349],
    mapping: "verified",
    metrics: { zSpread: 0.1533, diameter: 0.2635, contourPoints: 0 },
  },
  // 奴僕宮 / địa các hai bên — KHÔNG đạt tiêu chí kể cả khi đã tách trái/phải.
  noBoc: {
    left: [172, 136, 150, 149, 176, 58], right: [400, 377, 378, 379, 365, 288],
    mapping: "unknown",
    metrics: { zSpread: 0.3493, diameter: 0.3967, contourPoints: 0 },
    note:
      "z-spread 0.3493 vượt ngưỡng 0.20 kể cả sau khi tách trái/phải — viền hàm cong " +
      "thật theo độ sâu, từ trước cằm ra tới góc hàm. Không làm cho mạch lạc được nếu " +
      "không chia nhỏ thêm, mà chia nhỏ thì không còn khớp với 地閣 cổ truyền. Để unknown.",
  },
  // 夫妻宮 / ngư vĩ — THIẾT KẾ LẠI: chỉ vùng ngay ngoài đuôi mắt, cùng bề mặt.
  phuThe: {
    left: [156, 35, 111, 70, 124, 46, 226, 31, 113, 228, 130, 225, 247, 25],
    right: [383, 265, 340, 300, 353, 276, 446, 261, 342, 448, 359, 445, 467, 255],
    mapping: "verified",
    metrics: { zSpread: 0.1049, diameter: 0.1855, contourPoints: 0 },
    note:
      "Bản cũ [33,133,234,127,162] trộn khoé mắt (z≈+3.2/+3.8) với viền mặt/thái dương " +
      "(z≈−2.4/−1.0) — chênh 6.2 đơn vị trong cùng một vùng, khiến S/N = 1.01 (tín hiệu " +
      "đúng bằng nhiễu) ở Phase 1B-2. Vùng mới loại hết điểm vành mắt và viền mặt.",
  },
  // 疾厄宮 / sơn căn.
  tatAch: {
    left: [6, 168, 128, 197, 357], right: null,
    mapping: "verified",
    metrics: { zSpread: 0.1218, diameter: 0.1815, contourPoints: 0 },
  },
  // 遷移宮 / trán bên — tách trái/phải.
  thienDi: {
    left: [70, 109, 103, 67, 104], right: [300, 338, 332, 297, 333],
    mapping: "verified",
    metrics: { zSpread: 0.1053, diameter: 0.3604, contourPoints: 0 },
  },
  // 官祿宮 / trung chính — MỞ RỘNG từ 3 lên 5 điểm mặt giữa trán.
  quanLoc: {
    left: [109, 338, 108, 337, 151], right: null,
    mapping: "verified",
    metrics: { zSpread: 0.0491, diameter: 0.2527, contourPoints: 0 },
  },
  // 福德宮 / trên mày — tách trái/phải.
  phucDuc: {
    left: [66, 107, 105, 103, 67, 109], right: [296, 336, 334, 332, 297, 338],
    mapping: "verified",
    metrics: { zSpread: 0.1732, diameter: 0.2924, contourPoints: 0 },
  },
  // 父母宮 / nhật–nguyệt giác — MỞ RỘNG từ 3 lên 5 điểm mỗi bên.
  phuMau: {
    left: [67, 103, 69, 104, 68], right: [297, 332, 299, 333, 298],
    mapping: "verified",
    metrics: { zSpread: 0.1220, diameter: 0.2017, contourPoints: 0 },
  },
};

/** Tương thích ngược: danh sách phẳng (trái + phải) cho chỗ nào chỉ cần tập index. */
export const PALACE_INDICES: Record<TwelvePalaceName, number[]> = Object.fromEntries(
  (Object.keys(PALACE_REGIONS) as TwelvePalaceName[]).map((k) => [
    k,
    [...PALACE_REGIONS[k].left, ...(PALACE_REGIONS[k].right ?? [])],
  ]),
) as Record<TwelvePalaceName, number[]>;

export const TWELVE_PALACES_REASON =
  "Thập Nhị Cung cần đo độ đầy đặn/lõm (丰隆/低陷) theo trục z. Phase 1B-2 đo trên ảnh " +
  "thật: 0/12 cung đạt S/N>=3, và 9/12 cung ĐỔI DẤU khi chỉ đổi tư thế — cung Phụ Mẫu " +
  "đổi dấu khi chỉ cắt 3% viền ảnh. Nhiều cung còn phụ thuộc khí sắc/nếp nhăn/nốt ruồi, " +
  "landmark không thấy được. BẢN ĐỒ VÙNG đã được sửa lại và kiểm bằng canonical mesh " +
  "(xem field `mapping` và `metrics` của từng cung), nhưng bản đồ đúng KHÔNG làm cho " +
  "phép đo đáng tin — nên status vẫn là unsupported.";

function buildTwelvePalaces(): TwelvePalacesFeatures {
  const palaces = {} as TwelvePalacesFeatures["palaces"];
  for (const name of Object.keys(PALACE_REGIONS) as TwelvePalaceName[]) {
    const def = PALACE_REGIONS[name];
    palaces[name] = {
      status: "unsupported",
      mapping: def.mapping,
      landmarkIndices: def.left,
      landmarkIndicesRight: def.right,
      metrics: def.metrics,
      ...(def.note ? { note: def.note } : {}),
    };
  }
  return { status: "unsupported", reason: TWELVE_PALACES_REASON, palaces };
}

/** Các vùng giải phẫu đo được bằng hộp bao 2D — không dính tới độ sâu. */
const REGION_INDICES: Record<string, number[]> = {
  forehead: [10, 109, 67, 103, 54, 21, 162, 338, 297, 332, 284, 251, 389],
  leftEyebrow: [46, 53, 52, 65, 55, 107, 66, 105, 63, 70],
  rightEyebrow: [276, 283, 282, 295, 285, 336, 296, 334, 293, 300],
  leftEye: [33, 133, 144, 145, 153, 154, 155, 157, 158, 159, 160, 161, 163, 173],
  rightEye: [263, 362, 373, 374, 380, 381, 382, 384, 385, 386, 387, 388, 390, 398],
  nose: [1, 2, 4, 5, 6, 168, 197, 195, 48, 278, 49, 279],
  mouth: [61, 291, 13, 14, 17, 0, 37, 39, 40, 267, 269, 270],
  jawChin: [152, 172, 136, 150, 149, 176, 148, 377, 378, 379, 365, 397, 400],
};

function buildRegions(lm: LandmarkPoint[]): StructuralFeatures["faceRegions"] {
  const out: StructuralFeatures["faceRegions"] = {};
  for (const [name, indices] of Object.entries(REGION_INDICES)) {
    const pts = indices.map((i) => lm[i]).filter(Boolean);
    if (pts.length === 0) {
      out[name] = { status: "unknown", bbox: null, landmarkIndices: indices };
      continue;
    }
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    out[name] = {
      status: "measured",
      bbox: {
        x: round4(x),
        y: round4(y),
        width: round4(Math.max(...xs) - x),
        height: round4(Math.max(...ys) - y),
      },
      landmarkIndices: indices,
    };
  }
  // Tai: có trong REGION_INDICES thì sẽ là số bịa — nói thẳng là không đo được.
  out.ears = {
    status: "unsupported",
    bbox: null,
    landmarkIndices: [],
    note: "Lưới 468 điểm không có landmark nào trên vành tai.",
  };
  return out;
}

export function measureStructural(
  lm: LandmarkPoint[],
  frameWidth: number,
  frameHeight: number,
  faceWidthPx: number,
  faceHeightPx: number,
  keepLandmarks = true,
): StructuralFeatures {
  return {
    landmarks: keepLandmarks
      ? lm.map((p) => ({ x: round4(p.x), y: round4(p.y), z: round4(p.z) }))
      : null,
    faceRegions: buildRegions(lm),
    fiveOrgans: measureFiveOrgans(lm, frameWidth, frameHeight, faceWidthPx, faceHeightPx),
    threeCourts: measureThreeCourts(lm, frameWidth, frameHeight),
    twelvePalaces: buildTwelvePalaces(),
  };
}

/** Bề ngang mặt so với bề ngang khung hình — dùng cho cổng faceCoverage. */
export function computeFaceCoverage(
  lm: LandmarkPoint[],
): number {
  return Math.abs(lm[IDX.cheekRight].x - lm[IDX.cheekLeft].x);
}

/** Hộp bao toàn mặt theo pixel — dùng để cắt ROI tính độ mờ/độ sáng. */
export function faceBoundingBoxPx(
  lm: LandmarkPoint[],
  frameWidth: number,
  frameHeight: number,
): { x: number; y: number; width: number; height: number } {
  let minX = 1;
  let minY = 1;
  let maxX = 0;
  let maxY = 0;
  for (const p of lm) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return {
    x: minX * frameWidth,
    y: minY * frameHeight,
    width: (maxX - minX) * frameWidth,
    height: (maxY - minY) * frameHeight,
  };
}

const round2 = (v: number) => Math.round(v * 100) / 100;
const round4 = (v: number) => Math.round(v * 10_000) / 10_000;
