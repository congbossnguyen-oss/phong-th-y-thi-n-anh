/**
 * HỢP ĐỒNG LANDMARK — một nơi duy nhất ánh xạ tên giải phẫu → index MediaPipe.
 *
 *   feature  →  tên landmark  →  index MediaPipe
 *
 * Không module nào khác của Feature Layer được viết index trần. Đổi model hoặc sửa
 * ánh xạ thì chỉ sửa file này.
 *
 * MỌI index dưới đây đã đối chiếu toạ độ trên `canonical_face_model.obj` (hệ: +X
 * phải, +Y lên, +Z trước) — không có index nào lấy từ blog hay đoán theo tên biến.
 * Toạ độ canonical ghi kèm để người sau kiểm lại mà không phải mở model.
 */

/** Điểm landmark đã chuẩn hoá theo khung hình (x, y ∈ 0..1; z tương đối, không đơn vị). */
export interface Pt {
  x: number;
  y: number;
  z: number;
}

/**
 * Tên giải phẫu → index. Đơn điểm.
 *
 * Toạ độ canonical (x, y, z) ghi trong chú thích, đơn vị của model.
 */
export const LM = {
  /** Đỉnh lưới giữa trán (0.00, +8.26, +4.48). KHÔNG phải chân tóc. */
  meshTop: 10,
  /** Đỉnh cằm (0.00, −9.40, +4.26). */
  chinTip: 152,
  /** Sơn căn, giữa hai mắt (0.00, +3.27, +5.24). */
  nasion: 168,
  /** Chuẩn đầu, đỉnh mũi (0.00, −1.13, +7.48). */
  noseTip: 1,
  /** Chân mũi (0.00, −2.09, +6.06). Mốc chia trung/hạ đình. */
  subnasale: 2,

  /** Cánh mũi trái (−1.61, −0.94, +5.81). */
  alaL: 48,
  /** Cánh mũi phải (+1.61, −0.94, +5.81). */
  alaR: 278,
  /** Sườn sống mũi trái, ngang khoé mắt trong (−0.77, +3.18, +4.86). */
  bridgeL: 193,
  /** Sườn sống mũi phải (+0.77, +3.18, +4.86). */
  bridgeR: 417,

  /** Khoé mắt ngoài trái (−4.45, +2.66, +3.17). */
  eyeLOuter: 33,
  /** Khoé mắt TRONG trái (−1.86, +2.59, +3.76). KHÔNG phải điểm lông mày. */
  eyeLInner: 133,
  /** Khoé mắt trong phải (+1.86, +2.59, +3.76). */
  eyeRInner: 362,
  /** Khoé mắt ngoài phải (+4.45, +2.66, +3.17). */
  eyeROuter: 263,
  /** Giữa mí trên trái (−3.18, +2.96, +3.88). */
  eyeLUpper: 159,
  /** Giữa mí dưới trái (−3.18, +2.29, +3.78). */
  eyeLLower: 145,
  /** Giữa mí trên phải (+3.18, +2.96, +3.88). */
  eyeRUpper: 386,
  /** Giữa mí dưới phải (+3.18, +2.29, +3.78). */
  eyeRLower: 374,

  /** Đuôi mày trái, phía ngoài (−5.25, +3.88, +3.36). */
  browLOuter: 46,
  /** Đầu mày trái, phía trong (−1.22, +4.14, +5.11). */
  browLInner: 55,
  /** Đuôi mày phải (+5.25, +3.88, +3.36). */
  browROuter: 276,
  /** Đầu mày phải (+1.22, +4.14, +5.11). */
  browRInner: 285,
  /** Đỉnh mày trái (−3.99, +5.11, +4.47) — mốc đo khoảng cách mày–mắt. */
  browLTop: 105,
  /** Đỉnh mày phải (+3.99, +5.11, +4.47). */
  browRTop: 334,

  /** Khoé miệng trái (−2.46, −4.34, +4.28). */
  mouthL: 61,
  /** Khoé miệng phải (+2.46, −4.34, +4.28). */
  mouthR: 291,
  /** Đỉnh viền môi trên (0.00, −3.41, +5.98). */
  lipTop: 0,
  /** Đáy viền môi dưới (0.00, −5.37, +5.54). */
  lipBottom: 17,

  /** Điểm rộng nhất của mặt, bên trái (−7.66, +0.67, −2.44) — MỐC chuẩn hoá bề ngang. */
  faceWidthL: 234,
  /** Điểm rộng nhất của mặt, bên phải (+7.66, +0.67, −2.44). */
  faceWidthR: 454,
  /** Gò má (cung tiếp) trái (−6.47, +0.94, +1.69) — KHÁC faceWidthL, nằm trước 4.13 đơn vị. */
  cheekL: 116,
  /** Gò má phải (+6.47, +0.94, +1.69). */
  cheekR: 345,
  /** Góc hàm trái (−5.94, −6.22, −0.63). */
  jawL: 172,
  /** Góc hàm phải (+5.94, −6.22, −0.63). */
  jawR: 397,
} as const;

export type LandmarkName = keyof typeof LM;

/**
 * Cặp điểm tạo nên một phép đo khoảng cách, có tên.
 *
 * `depthMismatch` = |z trung bình của cặp này − z của mặt phẳng chuẩn hoá| / bề ngang
 * mặt, đo trên canonical mesh. Đây là thước đo KHÁCH QUAN cho rủi ro phối cảnh: hai
 * đoạn nằm ở hai mặt phẳng độ sâu khác nhau thì tỉ số của chúng đổi theo khoảng cách
 * chụp, dù đã "chuẩn hoá".
 *
 * Mặt phẳng chuẩn hoá:
 *   faceWidth  → z trung bình của 234/454 = −2.44
 *   faceHeight → z trung bình của 10/152  = +3.78
 */
export interface SpanDef {
  from: LandmarkName;
  to: LandmarkName;
  normalizedBy: "faceWidth" | "faceHeight";
  /** Đo trên canonical mesh, xem chú thích ở trên. */
  depthMismatch: number;
}

export const SPANS = {
  faceWidth: { from: "faceWidthL", to: "faceWidthR", normalizedBy: "faceWidth", depthMismatch: 0 },
  faceHeight: { from: "meshTop", to: "chinTip", normalizedBy: "faceWidth", depthMismatch: 0 },

  jawWidth: { from: "jawL", to: "jawR", normalizedBy: "faceWidth", depthMismatch: 0.1177 },
  cheekWidth: { from: "cheekL", to: "cheekR", normalizedBy: "faceWidth", depthMismatch: 0.2692 },
  chinHeight: { from: "lipBottom", to: "chinTip", normalizedBy: "faceHeight", depthMismatch: 0.0344 },

  interocular: { from: "eyeLInner", to: "eyeRInner", normalizedBy: "faceWidth", depthMismatch: 0.4041 },
  eyeLWidth: { from: "eyeLOuter", to: "eyeLInner", normalizedBy: "faceWidth", depthMismatch: 0.385 },
  eyeRWidth: { from: "eyeRInner", to: "eyeROuter", normalizedBy: "faceWidth", depthMismatch: 0.385 },
  eyeLHeight: { from: "eyeLUpper", to: "eyeLLower", normalizedBy: "faceWidth", depthMismatch: 0.4085 },
  eyeRHeight: { from: "eyeRUpper", to: "eyeRLower", normalizedBy: "faceWidth", depthMismatch: 0.4085 },

  browLLength: { from: "browLOuter", to: "browLInner", normalizedBy: "faceWidth", depthMismatch: 0.4352 },
  browRLength: { from: "browROuter", to: "browRInner", normalizedBy: "faceWidth", depthMismatch: 0.4352 },
  browSpacing: { from: "browLInner", to: "browRInner", normalizedBy: "faceWidth", depthMismatch: 0.492 },
  browLHeight: { from: "browLTop", to: "eyeLInner", normalizedBy: "faceHeight", depthMismatch: 0.017 },
  browRHeight: { from: "browRTop", to: "eyeRInner", normalizedBy: "faceHeight", depthMismatch: 0.017 },

  noseLength: { from: "nasion", to: "noseTip", normalizedBy: "faceHeight", depthMismatch: 0.1294 },
  noseWidth: { from: "alaL", to: "alaR", normalizedBy: "faceWidth", depthMismatch: 0.5382 },
  noseBridgeWidth: { from: "bridgeL", to: "bridgeR", normalizedBy: "faceWidth", depthMismatch: 0.4761 },

  mouthWidth: { from: "mouthL", to: "mouthR", normalizedBy: "faceWidth", depthMismatch: 0.4384 },
  mouthHeight: { from: "lipTop", to: "lipBottom", normalizedBy: "faceWidth", depthMismatch: 0.5345 },
} as const satisfies Record<string, SpanDef>;

export type SpanName = keyof typeof SPANS;

/** Khoảng cách euclidean 2D theo pixel. KHÔNG dùng hiệu toạ độ một trục — không bất biến với roll. */
export function spanPx(lm: Pt[], span: SpanDef, frameW: number, frameH: number): number {
  const a = lm[LM[span.from]];
  const b = lm[LM[span.to]];
  return Math.hypot((a.x - b.x) * frameW, (a.y - b.y) * frameH);
}
