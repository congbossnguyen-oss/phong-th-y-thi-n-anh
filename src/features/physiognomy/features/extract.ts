/**
 * TRÍCH FEATURE — landmark + pose + quality  →  PhysiognomyFeatureProfile.
 *
 * Hàm thuần: không DOM, không camera, không mạng, không MediaPipe. Đưa vào cùng một
 * bộ quan sát thì luôn ra cùng một profile, nên test được bằng vitest.
 *
 * KHÔNG luận giải. Xem `./schema.ts` để biết ba thứ cố ý không tồn tại ở đây.
 *
 * ── Quy tắc gán status (siết lại ở Phase 1D-3) ──
 * Một feature chỉ được `measured` khi ĐỦ CẢ BẢY, xem
 * docs/PHYSIOGNOMY_FEATURE_REAL_DEVICE_VALIDATION.md:
 *   1. có bằng chứng trên ảnh NGƯỜI THẬT (không phải mesh chuẩn)
 *   2. công thức không phụ thuộc thang pixel thô / cách đóng khung
 *   3. độ nhạy tư thế nằm trong giới hạn đã kiểm
 *   4. confidence tương ứng với chất lượng thật
 *   5. không có sai lệch hệ thống nghiêm trọng
 *   6. không phụ thuộc một máy/camera cụ thể
 *   7. có test regression bảo vệ
 * Thiếu bất kỳ điều nào → `low_confidence`. Cảm biến không thấy được → `unsupported`.
 *
 * Phase 1D-3 hạ 4 feature từ `measured` xuống `low_confidence` sau khi đo lại trên
 * ảnh người thật: face_width, face_height (vi phạm #2 — mẫu số là khung hình),
 * interocular_distance (7.56% giữa hai lần chụp khác cự ly), three_courts.middle
 * (bền nhất nhưng mẫu chỉ 1 người / 2 lần chụp hợp lệ).
 *
 * Còn `measured`: CHỈ ba trục tư thế — và chúng là SIÊU DỮ LIỆU THU NHẬN, không phải
 * đặc điểm nhân tướng. Đó là sự thật của cảm biến hiện tại, không phải thiếu sót của
 * tầng này.
 */

import {
  BLUR_MIN,
  BRIGHTNESS_MAX,
  BRIGHTNESS_MIN,
  COVERAGE_MAX,
  COVERAGE_MIN,
  FRONT_LIMITS,
  NEAR_MIN_COVERAGE,
  TURN_MIN_DEG,
} from "../acquisition/thresholds";
import type { FaceStep } from "../session/types";
import { PALACE_REGIONS, TWELVE_PALACES_REASON } from "../geometry/index";
import type { TwelvePalaceName } from "../types/index";
import { LM, SPANS, spanPx, type Pt, type SpanName } from "./landmarks";
import {
  FEATURE_LAYER_NOTICES,
  FEATURE_SCHEMA_VERSION,
  VIEW_FOR_STEP,
  VIEW_NAMES,
  type FeatureStatus,
  type MeasuredFeature,
  type PalaceFeature,
  type PhysiognomyFeatureProfile,
  type QualityGrade,
  type ViewName,
  type ViewSummary,
} from "./schema";

// ───────────────────────────────────────────────────────────── đầu vào

/** Một lần quan sát ở một góc. Đây là thứ tầng camera đã có sẵn trên máy khách. */
export interface ViewObservation {
  step: FaceStep;
  landmarks: Pt[];
  frameWidth: number;
  frameHeight: number;
  pose: { yaw: number | null; pitch: number | null; roll: number | null };
  quality: {
    faceDetected: boolean;
    /** Bề ngang mặt / bề ngang khung hình. */
    coverage: number | null;
    brightness: number | null;
    blur: number | null;
  };
}

interface GradedView {
  obs: ViewObservation;
  grade: QualityGrade;
  poseValid: boolean;
  distanceValid: boolean;
  reasons: string[];
}

// ──────────────────────────────────────────────────────── chấm chất lượng

/**
 * Cổng pose phụ thuộc VIEW. Bước "quay trái" mà yaw = 0 thì mới là hỏng, không
 * phải ngược lại — nên không thể dùng một ngưỡng chung.
 */
function poseValidFor(view: ViewName, p: ViewObservation["pose"]): boolean {
  const { yaw, pitch, roll } = p;
  if (yaw === null || pitch === null || roll === null) return false;
  switch (view) {
    case "front":
    case "near":
      return (
        Math.abs(yaw) <= FRONT_LIMITS.yaw &&
        Math.abs(pitch) <= FRONT_LIMITS.pitch &&
        Math.abs(roll) <= FRONT_LIMITS.roll
      );
    case "left":
    case "right":
      return Math.abs(yaw) >= TURN_MIN_DEG;
    case "pitchDown":
    case "pitchUp":
      return Math.abs(pitch) >= TURN_MIN_DEG;
  }
}

function distanceValidFor(view: ViewName, coverage: number | null): boolean {
  if (coverage === null) return false;
  if (view === "near") return coverage >= NEAR_MIN_COVERAGE;
  return coverage >= COVERAGE_MIN && coverage <= COVERAGE_MAX;
}

/**
 * Xếp hạng chất lượng. Luật viết thẳng ra đây để test khoá được, không phải "cảm tính".
 *
 * Cố ý KHÔNG dùng chữ "accurate": chưa có ground truth nào để nói về độ chính xác.
 * Đây chỉ là mức độ dùng được của ẢNH, không phải độ đúng của SỐ ĐO.
 */
export function gradeQuality(
  view: ViewName,
  obs: ViewObservation,
): { grade: QualityGrade; poseValid: boolean; distanceValid: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const q = obs.quality;
  if (!q.faceDetected) {
    return {
      grade: "invalid",
      poseValid: false,
      distanceValid: false,
      reasons: ["Không thấy khuôn mặt"],
    };
  }
  const poseValid = poseValidFor(view, obs.pose);
  const distanceValid = distanceValidFor(view, q.coverage);
  if (!poseValid) reasons.push("Tư thế không đạt cổng của bước này");
  if (!distanceValid) reasons.push("Khoảng cách chụp không đạt");
  if (q.blur !== null && q.blur < BLUR_MIN) reasons.push("Ảnh mờ");
  if (q.brightness !== null && q.brightness < BRIGHTNESS_MIN) reasons.push("Ảnh tối");
  if (q.brightness !== null && q.brightness > BRIGHTNESS_MAX) reasons.push("Ảnh quá sáng");
  if (reasons.length > 0) return { grade: "poor", poseValid, distanceValid, reasons };

  const blur = q.blur ?? 0;
  const bright = q.brightness ?? 0;
  // Dải sáng thoải mái = bỏ 15% ở mỗi đầu của dải hợp lệ.
  const band = (BRIGHTNESS_MAX - BRIGHTNESS_MIN) * 0.15;
  const brightComfy = bright >= BRIGHTNESS_MIN + band && bright <= BRIGHTNESS_MAX - band;
  if (blur < BLUR_MIN * 2 || !brightComfy) {
    return { grade: "usable", poseValid, distanceValid, reasons };
  }
  // "excellent" chỉ dành cho view chính diện/sát mặt và chỉ khi pose nằm sâu trong ngưỡng.
  const tight =
    (view === "front" || view === "near") &&
    Math.abs(obs.pose.yaw ?? 99) <= FRONT_LIMITS.yaw / 2 &&
    Math.abs(obs.pose.pitch ?? 99) <= FRONT_LIMITS.pitch / 2 &&
    Math.abs(obs.pose.roll ?? 99) <= FRONT_LIMITS.roll / 2;
  return { grade: tight ? "excellent" : "good", poseValid, distanceValid, reasons };
}

const GRADE_RANK: Record<QualityGrade, number> = {
  excellent: 4,
  good: 3,
  usable: 2,
  poor: 1,
  invalid: 0,
};

// ───────────────────────────────────────────────────── bảng khai báo feature

/** Chú thích dùng lại — viết một lần, không rải chuỗi khắp nơi. */
const NOTE = {
  noRealError:
    "Chưa đo sai số trên ảnh người thật qua nhiều tư thế. Có số nhưng chưa biết số đó " +
    "trôi bao nhiêu khi đổi góc chụp — không dùng làm căn cứ chắc chắn.",
  perspective:
    "Đoạn đo nằm ở mặt phẳng độ sâu khác mặt phẳng chuẩn hoá, nên tỉ lệ còn đổi theo " +
    "khoảng cách chụp dù đã chuẩn hoá.",
  blink:
    "Chiều cao mắt là ĐỘ MỞ MÍ tại khoảnh khắc chụp, không phải kích thước mắt. Chớp " +
    "mắt hoặc nheo mắt là số đổi hẳn. Pipeline hiện chưa có cổng chặn chớp mắt.",
  browHair:
    "Landmark bám bờ xương/da vùng mày, KHÔNG thấy sợi lông mày. Đậm/nhạt/tán loạn/mọc " +
    "ngược đều không đo được.",
  expression:
    "Phụ thuộc biểu cảm tại khoảnh khắc chụp (mím môi, hé miệng) chứ không chỉ cấu trúc.",
} as const;

interface SpanFeatureDef {
  key: string;
  span: SpanName;
  status: FeatureStatus;
  confidence: number;
  note?: string;
}

/**
 * Feature đo bằng một đoạn thẳng chia cho một mẫu số.
 *
 * `confidence` là số ĐÃ CÓ CĂN CỨ, không phải chấm cảm tính:
 *   - feature có sai số đo thật ở Phase 1B-2 → confidence = 1 − sai số
 *     (eyeDistance 4.99% → 0.95 · noseWidth 15.3% → 0.85 · mouthWidth 20.6% → 0.79
 *      · faceShapeRatio 17.6% → 0.82 · noseLength 44.1% → 0.56)
 *   - feature chưa đo sai số thật → 0.50, nghĩa là "có số, chưa biết tin được bao nhiêu".
 */
const SPAN_FEATURES: SpanFeatureDef[] = [
  // ── nhóm hình học nền
  {
    key: "face.geometry.face_shape_ratio",
    span: "faceHeight",
    status: "low_confidence",
    confidence: 0.82,
    note:
      "Phase 1B-2 đo trên ảnh thật: vỡ cả 4 trục (khoảng cách 7.1% · yaw 5.1% · " +
      "pitch 17.6% · roll 6.0%). Yaw làm bề ngang co theo cos(yaw) còn chiều cao thì không.",
  },

  // ── dáng mặt
  {
    key: "face.shape.jaw_to_face_width",
    span: "jawWidth",
    status: "low_confidence",
    confidence: 0.5,
    note: NOTE.noRealError + " Lệch độ sâu 0.118 so với mặt phẳng chuẩn hoá.",
  },
  {
    key: "face.shape.cheek_to_face_width",
    span: "cheekWidth",
    status: "low_confidence",
    confidence: 0.5,
    note:
      NOTE.noRealError +
      " " +
      NOTE.perspective +
      " Gò má (116/345) nằm trước mốc chuẩn hoá (234/454) 0.269 bề ngang mặt — " +
      "đây là hai mặt phẳng khác nhau.",
  },
  {
    key: "face.shape.chin_to_face_height",
    span: "chinHeight",
    status: "low_confidence",
    confidence: 0.5,
    note: NOTE.noRealError,
  },

  // ── mắt
  {
    key: "face.eyes.interocular_distance",
    span: "interocular",
    // HẠ TỪ "measured" Ở PHASE 1D-3. Số 4.99% của Phase 1B-2 là biến thiên trong MỘT
    // loạt ảnh cùng cự ly; đo lại trên hai lần chụp KHÁC CỰ LY mà cả hai đều qua cổng
    // chính diện (ảnh 1 và 3) thì lệch 7.56% — vượt ngưỡng 5%. Nguyên nhân đúng như
    // depthMismatch 0.404 đã báo: khoé mắt và mốc chuẩn hoá nằm ở hai mặt phẳng độ
    // sâu khác nhau, nên đổi cự ly chụp là tỉ lệ đổi.
    status: "low_confidence",
    confidence: 0.5,
    note:
      "Ổn định nhất nhóm với crop (1.0–1.7%), thu phóng ảnh (0.35–1.9%) và độ sáng " +
      "(1.1%). NHƯNG hai lần chụp khác cự ly, cả hai đều qua cổng chính diện, cho kết " +
      "quả lệch 7.56% (Phase 1D-3). Bằng chứng mới chỉ có 1 người / 2 lần chụp hợp lệ " +
      "— chưa đủ để gọi là đo được.",
  },
  {
    key: "face.eyes.left_width",
    span: "eyeLWidth",
    status: "low_confidence",
    confidence: 0.5,
    note:
      NOTE.noRealError +
      " Là đoạn NGANG trên bề mặt cong nên chịu yaw nặng hơn khoảng cách hai khoé trong.",
  },
  {
    key: "face.eyes.right_width",
    span: "eyeRWidth",
    status: "low_confidence",
    confidence: 0.5,
    note:
      NOTE.noRealError +
      " Là đoạn NGANG trên bề mặt cong nên chịu yaw nặng hơn khoảng cách hai khoé trong.",
  },
  {
    key: "face.eyes.left_height",
    span: "eyeLHeight",
    status: "low_confidence",
    confidence: 0.35,
    note: NOTE.blink,
  },
  {
    key: "face.eyes.right_height",
    span: "eyeRHeight",
    status: "low_confidence",
    confidence: 0.35,
    note: NOTE.blink,
  },

  // ── lông mày
  {
    key: "face.eyebrows.left_length",
    span: "browLLength",
    status: "low_confidence",
    confidence: 0.4,
    note: NOTE.browHair + " " + NOTE.noRealError,
  },
  {
    key: "face.eyebrows.right_length",
    span: "browRLength",
    status: "low_confidence",
    confidence: 0.4,
    note: NOTE.browHair + " " + NOTE.noRealError,
  },
  {
    key: "face.eyebrows.left_height",
    span: "browLHeight",
    status: "low_confidence",
    confidence: 0.5,
    note:
      NOTE.browHair +
      " Hai mốc gần như cùng mặt phẳng độ sâu (lệch 0.017) nên ít rủi ro phối cảnh nhất " +
      "nhóm mày, nhưng vẫn chịu pitch vì cặp điểm gần thẳng đứng.",
  },
  {
    key: "face.eyebrows.right_height",
    span: "browRHeight",
    status: "low_confidence",
    confidence: 0.5,
    note:
      NOTE.browHair +
      " Hai mốc gần như cùng mặt phẳng độ sâu (lệch 0.017) nên ít rủi ro phối cảnh nhất " +
      "nhóm mày, nhưng vẫn chịu pitch vì cặp điểm gần thẳng đứng.",
  },
  {
    key: "face.eyebrows.spacing",
    span: "browSpacing",
    status: "low_confidence",
    confidence: 0.5,
    note:
      NOTE.browHair +
      " " +
      NOTE.noRealError +
      " Nằm sát đường giữa nên ít méo vì yaw hơn các đoạn ngang khác.",
  },

  // ── mũi
  {
    key: "face.nose.length",
    span: "noseLength",
    status: "low_confidence",
    confidence: 0.56,
    note:
      "KÉM NHẤT nhóm hình học: lệch 44.1% ở pitch −31° trên ảnh thật (Phase 1B-2). Mũi " +
      "nhô ra trước nên khi ngẩng đầu nó gần như biến mất khỏi mặt phẳng ảnh.",
  },
  {
    key: "face.nose.width",
    span: "noseWidth",
    status: "low_confidence",
    confidence: 0.85,
    note:
      "Lệch 15.3% ở yaw 28° và 10.9% do khoảng cách chụp (Phase 1B-2). Cánh mũi bị che " +
      "một phần khi quay mặt.",
  },

  // ── miệng
  {
    key: "face.mouth.width",
    span: "mouthWidth",
    status: "low_confidence",
    confidence: 0.79,
    note:
      "Lệch 20.6% ở pitch −31° (Phase 1B-2). Hiệu chỉnh phối cảnh bằng độ sâu template " +
      "làm TỆ HƠN (−33%) nên không áp dụng.",
  },
  {
    key: "face.mouth.height",
    span: "mouthHeight",
    status: "low_confidence",
    confidence: 0.4,
    note: NOTE.expression + " " + NOTE.noRealError,
  },
];

/** View được phép cấp số cho các feature hình học, theo thứ tự ưu tiên. */
const GEOMETRY_VIEW_ORDER: readonly ViewName[] = ["front", "near"] as const;

const NO_VIEW_NOTE = "Không có view nào đủ chất lượng để cấp số cho feature này.";

// ──────────────────────────────────────────────────────────── dựng feature

const r4 = (v: number) => Math.round(v * 10_000) / 10_000;

function denominatorPx(obs: ViewObservation, by: "faceWidth" | "faceHeight"): number {
  return by === "faceWidth"
    ? spanPx(obs.landmarks, SPANS.faceWidth, obs.frameWidth, obs.frameHeight)
    : spanPx(obs.landmarks, SPANS.faceHeight, obs.frameWidth, obs.frameHeight);
}

function buildSpanFeature(
  def: SpanFeatureDef,
  view: ViewName | null,
  obs: ViewObservation | null,
): MeasuredFeature {
  const span = SPANS[def.span];
  const srcIdx = [LM[span.from], LM[span.to]];
  const method = `euclidean2d(${span.from},${span.to})/${span.normalizedBy}`;
  const base = {
    key: def.key,
    unit: "normalized_ratio" as const,
    method,
    sourceLandmarks: srcIdx,
    normalizedBy: span.normalizedBy,
  };
  if (!obs || !view) {
    return {
      ...base,
      value: null,
      confidence: 0,
      status: "unsupported",
      sourceView: null,
      note: NO_VIEW_NOTE,
    };
  }
  const denom = denominatorPx(obs, span.normalizedBy);
  if (!(denom > 1e-6)) {
    return {
      ...base,
      value: null,
      confidence: 0,
      status: "unsupported",
      sourceView: null,
      note: "Mẫu số chuẩn hoá bằng 0 — không dựng được tỉ lệ.",
    };
  }
  return {
    ...base,
    value: r4(spanPx(obs.landmarks, span, obs.frameWidth, obs.frameHeight) / denom),
    confidence: def.confidence,
    status: def.status,
    sourceView: view,
    ...(def.note ? { note: def.note } : {}),
  };
}

/**
 * Độ nghiêng khe mắt, đo SO VỚI TRỤC LIÊN MẮT chứ không so với trục ảnh.
 *
 * Nhờ vậy nghiêng đầu (roll) không làm đổi số: cả khe mắt lẫn trục liên mắt cùng
 * quay. Dương = khoé ngoài CAO hơn khoé trong. Hai mắt của một khuôn mặt đối xứng
 * cho cùng dấu, cùng trị.
 */
function buildEyeTilt(
  key: string,
  side: "left" | "right",
  view: ViewName | null,
  obs: ViewObservation | null,
): MeasuredFeature {
  const outer = side === "left" ? LM.eyeLOuter : LM.eyeROuter;
  const inner = side === "left" ? LM.eyeLInner : LM.eyeRInner;
  const base = {
    key,
    unit: "degrees" as const,
    method: "signed_angle(outer->inner, interocular_axis)",
    sourceLandmarks: [outer, inner, LM.eyeLInner, LM.eyeRInner],
    normalizedBy: "interocularAxis" as const,
  };
  if (!obs || !view) {
    return {
      ...base,
      value: null,
      confidence: 0,
      status: "unsupported",
      sourceView: null,
      note: NO_VIEW_NOTE,
    };
  }
  const lm = obs.landmarks;
  const W = obs.frameWidth;
  const H = obs.frameHeight;
  // Trục liên mắt, LUÔN cùng một chiều cho cả hai mắt: eyeLInner → eyeRInner.
  const a0 = lm[LM.eyeLInner];
  const a1 = lm[LM.eyeRInner];
  let ax = (a1.x - a0.x) * W;
  let ay = (a1.y - a0.y) * H;
  const an = Math.hypot(ax, ay);
  const vx = (lm[outer].x - lm[inner].x) * W;
  const vy = (lm[outer].y - lm[inner].y) * H;
  if (an < 1e-6 || Math.hypot(vx, vy) < 1e-6) {
    return {
      ...base,
      value: null,
      confidence: 0,
      status: "unsupported",
      sourceView: null,
      note: "Không dựng được trục liên mắt.",
    };
  }
  ax /= an;
  ay /= an;
  // Pháp tuyến hướng LÊN trong hệ toạ độ ảnh (trục y của ảnh hướng xuống).
  const nx = ay;
  const ny = -ax;
  // Thành phần dọc trục: mắt trái nhô ra phía −x nên soi gương để hai bên so sánh
  // được với nhau. Nếu không soi gương, khuôn mặt đối xứng sẽ ra hai dấu ngược nhau.
  const along = (side === "left" ? -1 : 1) * (vx * ax + vy * ay);
  const up = vx * nx + vy * ny;
  // Dương = khoé NGOÀI cao hơn khoé trong.
  const deg = Math.atan2(up, along) * (180 / Math.PI);
  return {
    ...base,
    value: r4(deg),
    confidence: 0.5,
    status: "low_confidence",
    sourceView: view,
    note:
      "Đo so với trục liên mắt nên BẤT BIẾN với nghiêng đầu (roll) — đã kiểm bằng test. " +
      "Nhưng yaw vẫn làm méo vì khoé ngoài và khoé trong nằm ở hai mặt phẳng độ sâu khác " +
      "nhau (lệch 0.385 bề ngang mặt). " +
      NOTE.noRealError,
  };
}

/**
 * Tỉ lệ sống mũi / cánh mũi. Tự chuẩn hoá TRONG CÙNG cái mũi — cả tử số lẫn mẫu số
 * nằm gần cùng một mặt phẳng độ sâu (lệch 0.062 bề ngang mặt, so với 0.538 nếu chia
 * cho bề ngang mặt), nên đây là feature mũi ít rủi ro phối cảnh nhất.
 */
function buildBridgeRatio(view: ViewName | null, obs: ViewObservation | null): MeasuredFeature {
  const base = {
    key: "face.nose.bridge_ratio",
    unit: "normalized_ratio" as const,
    method: "euclidean2d(bridgeL,bridgeR)/euclidean2d(alaL,alaR)",
    sourceLandmarks: [LM.bridgeL, LM.bridgeR, LM.alaL, LM.alaR],
    normalizedBy: "noseWidth" as const,
  };
  if (!obs || !view) {
    return {
      ...base,
      value: null,
      confidence: 0,
      status: "unsupported",
      sourceView: null,
      note: NO_VIEW_NOTE,
    };
  }
  const ala = spanPx(obs.landmarks, SPANS.noseWidth, obs.frameWidth, obs.frameHeight);
  if (!(ala > 1e-6)) {
    return {
      ...base,
      value: null,
      confidence: 0,
      status: "unsupported",
      sourceView: null,
      note: "Bề ngang cánh mũi bằng 0 — không dựng được tỉ lệ.",
    };
  }
  return {
    ...base,
    value: r4(spanPx(obs.landmarks, SPANS.noseBridgeWidth, obs.frameWidth, obs.frameHeight) / ala),
    confidence: 0.5,
    status: "low_confidence",
    sourceView: view,
    note:
      "Tự chuẩn hoá trong cùng cái mũi nên lệch độ sâu chỉ 0.062 (so với 0.538 nếu chia " +
      "cho bề ngang mặt) — rủi ro phối cảnh thấp nhất nhóm mũi. Nhưng " +
      NOTE.noRealError,
  };
}

/**
 * Tam Đình bằng cách chiếu lên TRỤC DỌC CỦA CHÍNH ĐẦU.
 *
 * Phase 1B-2, cùng một người, pitch +19° → −31°:
 *   hiệu toạ độ ảnh : trung đình 0.4303 → 0.4924 → 0.3757  (biên độ 0.1168)
 *   trục đầu 3D     : trung đình 0.4260 → 0.4323 → 0.4320  (biên độ 0.0063, tốt hơn 18.5×)
 */
function buildThreeCourts(view: ViewName | null, obs: ViewObservation | null) {
  const srcIdx = [LM.meshTop, LM.browLTop, LM.browRTop, LM.subnasale, LM.chinTip];
  const mk = (
    key: string,
    value: number | null,
    status: FeatureStatus,
    confidence: number,
    note: string,
  ): MeasuredFeature => ({
    key,
    value,
    unit: "normalized_ratio",
    confidence,
    method: "headAxis3d_projection_ratio",
    sourceLandmarks: srcIdx,
    status,
    sourceView: value === null ? null : view,
    normalizedBy: "none",
    note,
  });

  const UPPER_NOTE =
    "Mốc trên là ĐỈNH LƯỚI (landmark 10), KHÔNG phải chân tóc — lưới 468 điểm không có " +
    "điểm nào ở chân tóc. Lệch hệ thống ~46% so với chuẩn cổ truyền: canonical mesh chính " +
    "diện cho 0.179 trong khi chuẩn là 0.333. Nghĩa là MỌI khuôn mặt đều sẽ đọc ra " +
    "'thượng đình khuyết' nếu tin con số này. Không dùng để kết luận.";
  const LOWER_NOTE =
    "Đỉnh cằm là mốc xa trục quay nhất nên trôi nhiều khi chúc/ngẩng đầu — biên độ 0.072 " +
    "qua các tư thế thật (Phase 1B-2).";
  const MIDDLE_NOTE =
    "Bền nhất trong bốn chỉ số hình học: crop 1.3–1.9%, thu phóng 0.5–0.9%, độ sáng " +
    "1.5–1.9%, và chỉ 0.0063 biên độ qua pitch +19° → −31° (Phase 1B-2). NHƯNG hai lần " +
    "chụp khác cự ly cùng qua cổng chính diện vẫn lệch 2.9%, và bằng chứng mới chỉ có " +
    "1 người / 2 lần chụp hợp lệ — chưa đủ mẫu để gọi là đo được (Phase 1D-3). Yaw 28° " +
    "đẩy lệch lên 6.1%, nhưng góc đó đã bị cổng chính diện chặn.";

  const bad = (n: string) => ({
    upper: mk("face.three_courts.upper", null, "unsupported" as FeatureStatus, 0, n),
    middle: mk("face.three_courts.middle", null, "unsupported" as FeatureStatus, 0, n),
    lower: mk("face.three_courts.lower", null, "unsupported" as FeatureStatus, 0, n),
    method: "headAxis3d" as const,
  });

  if (!obs || !view) return bad("Không có view nào đủ chất lượng để cấp số cho Tam Đình.");

  const lm = obs.landmarks;
  const W = obs.frameWidth;
  const H = obs.frameHeight;
  const v3 = (i: number): [number, number, number] => [lm[i].x * W, lm[i].y * H, lm[i].z * W];
  const top = v3(LM.meshTop);
  const chin = v3(LM.chinTip);
  const axis: [number, number, number] = [
    chin[0] - top[0],
    chin[1] - top[1],
    chin[2] - top[2],
  ];
  const len = Math.hypot(axis[0], axis[1], axis[2]);
  if (len < 1e-6) return bad("Không dựng được trục dọc của đầu.");
  const u = [axis[0] / len, axis[1] / len, axis[2] / len];
  const proj = (i: number) => {
    const p = v3(i);
    return p[0] * u[0] + p[1] * u[1] + p[2] * u[2];
  };
  const tTop = proj(LM.meshTop);
  const tBrow = (proj(LM.browLTop) + proj(LM.browRTop)) / 2;
  const tSub = proj(LM.subnasale);
  const tChin = proj(LM.chinTip);
  const upper = Math.abs(tBrow - tTop);
  const middle = Math.abs(tSub - tBrow);
  const lower = Math.abs(tChin - tSub);
  const total = upper + middle + lower;
  if (total < 1e-6) return bad("Tổng ba đình bằng 0.");
  return {
    upper: mk("face.three_courts.upper", r4(upper / total), "low_confidence", 0.25, UPPER_NOTE),
    middle: mk("face.three_courts.middle", r4(middle / total), "low_confidence", 0.7, MIDDLE_NOTE),
    lower: mk("face.three_courts.lower", r4(lower / total), "low_confidence", 0.6, LOWER_NOTE),
    method: "headAxis3d" as const,
  };
}

function buildPalaces(): Record<TwelvePalaceName, PalaceFeature> {
  const out = {} as Record<TwelvePalaceName, PalaceFeature>;
  for (const name of Object.keys(PALACE_REGIONS) as TwelvePalaceName[]) {
    const def = PALACE_REGIONS[name];
    out[name] = {
      name,
      mappingStatus: def.mapping,
      // Bản đồ đúng KHÔNG làm phép đo đáng tin. Hai chuyện khác nhau, giữ tách.
      measurementStatus: "unsupported",
      region:
        def.mapping === "verified" ? { landmarks: [...def.left, ...(def.right ?? [])] } : null,
      features: {},
      note: def.note ?? TWELVE_PALACES_REASON,
    };
  }
  return out;
}

/**
 * Pose lấy từ view cấp số hình học. Đây là SỐ ĐO TƯ THẾ, không phải đặc điểm nhân
 * tướng: mặt nghiêng không mang ý nghĩa gì, chỉ là ảnh đo được hay không.
 *
 * Quy ước dấu do `YAW_SIGN_FOR_USER_LEFT` ở `../acquisition/thresholds.ts` quyết định — tầng
 * này KHÔNG đổi và không tự suy diễn lại.
 */
function buildPose(view: ViewName | null, obs: ViewObservation | null) {
  const mk = (key: string, v: number | null): MeasuredFeature => ({
    key,
    value: v === null ? null : r4(v),
    unit: "degrees",
    confidence: v === null ? 0 : 0.9,
    method: "mediapipe_facial_transformation_matrix_column_major",
    sourceLandmarks: [],
    status: v === null ? "unsupported" : "measured",
    sourceView: v === null ? null : view,
    normalizedBy: "none",
    note:
      v === null
        ? "Không có số đo tư thế cho view này."
        : "Số đo TƯ THẾ, không phải đặc điểm nhân tướng. Chỉ dùng để biết ảnh có đo được hay không.",
  });
  const p = obs?.pose ?? { yaw: null, pitch: null, roll: null };
  return {
    yaw: mk("face.pose.yaw", p.yaw),
    pitch: mk("face.pose.pitch", p.pitch),
    roll: mk("face.pose.roll", p.roll),
  };
}

function buildQuality(graded: Map<ViewName, GradedView>) {
  // Chất lượng tổng lấy theo view CHÍNH DIỆN — đó là view cấp phần lớn số đo.
  const front = graded.get("front") ?? graded.get("near");
  if (!front) {
    return {
      faceDetected: false,
      confidence: null,
      brightness: null,
      blur: null,
      poseValid: false,
      distanceValid: false,
      overall: "invalid" as QualityGrade,
      reasons: ["Không có view chính diện hoặc sát mặt"],
    };
  }
  const missing = VIEW_NAMES.filter((v) => !graded.has(v));
  const reasons = [...front.reasons];
  if (missing.length > 0) reasons.push(`Thiếu view: ${missing.join(", ")}`);
  return {
    faceDetected: front.obs.quality.faceDetected,
    confidence: front.obs.quality.coverage,
    brightness: front.obs.quality.brightness,
    blur: front.obs.quality.blur,
    poseValid: front.poseValid,
    distanceValid: front.distanceValid,
    overall: front.grade,
    reasons,
  };
}

function collectKeys(...groups: unknown[]): { measuredKeys: string[]; unsupportedKeys: string[] } {
  const measuredKeys: string[] = [];
  const unsupportedKeys: string[] = [];
  const walk = (v: unknown) => {
    if (v === null || typeof v !== "object") return;
    const o = v as Record<string, unknown>;
    if (typeof o.key === "string" && typeof o.status === "string") {
      if (o.status === "unsupported") unsupportedKeys.push(o.key);
      else measuredKeys.push(o.key);
      return;
    }
    for (const x of Object.values(o)) walk(x);
  };
  for (const g of groups) walk(g);
  return { measuredKeys, unsupportedKeys };
}

// ─────────────────────────────────────────────────────────────── hợp nhất

/**
 * Chọn view cấp số cho nhóm hình học.
 *
 * KHÔNG trung bình mù nhiều view: mỗi góc chụp méo theo một kiểu khác nhau, cộng lại
 * chỉ ra một con số không thuộc về góc nào. Lấy view TỐT NHẤT trong danh sách được phép.
 *
 * Chỉ `front` và `near` được cấp số hình học. `left`/`right` là ảnh bán nghiêng —
 * landmark nửa mặt khuất do model NỘI SUY chứ không nhìn thấy. `pitchDown`/`pitchUp`
 * chỉ để đối chứng tư thế.
 */
function pickGeometryView(
  graded: Map<ViewName, GradedView>,
): { view: ViewName; obs: ViewObservation } | null {
  let best: { view: ViewName; obs: ViewObservation; rank: number } | null = null;
  for (const view of GEOMETRY_VIEW_ORDER) {
    const g = graded.get(view);
    if (!g || GRADE_RANK[g.grade] < GRADE_RANK.usable) continue;
    const rank = GRADE_RANK[g.grade];
    // Ưu tiên theo thứ tự khai báo; chỉ nhường chỗ khi view sau TỐT HƠN HẲN.
    if (best === null || rank > best.rank) best = { view, obs: g.obs, rank };
  }
  return best ? { view: best.view, obs: best.obs } : null;
}

export interface BuildProfileInput {
  sessionId: string;
  capturedAt: number;
  observations: ViewObservation[];
}

export function buildFeatureProfile(input: BuildProfileInput): PhysiognomyFeatureProfile {
  const graded = new Map<ViewName, GradedView>();
  for (const obs of input.observations) {
    const view = VIEW_FOR_STEP[obs.step];
    graded.set(view, { obs, ...gradeQuality(view, obs) });
  }

  const picked = pickGeometryView(graded);
  const view = picked?.view ?? null;
  const obs = picked?.obs ?? null;

  const feat = new Map<string, MeasuredFeature>();
  for (const def of SPAN_FEATURES) feat.set(def.key, buildSpanFeature(def, view, obs));
  const get = (k: string) => feat.get(k)!;

  // face_width / face_height chuẩn hoá theo KHUNG HÌNH (không theo nhau) — nếu cả hai
  // cùng chia cho faceWidth thì face_height sẽ trùng hệt face_shape_ratio.
  const frameRef = (key: string, span: SpanName, by: "w" | "h"): MeasuredFeature => {
    const s = SPANS[span];
    const base = {
      key,
      unit: "normalized_ratio" as const,
      method: `euclidean2d(${s.from},${s.to})/${by === "w" ? "frameWidth" : "frameHeight"}`,
      sourceLandmarks: [LM[s.from], LM[s.to]],
      normalizedBy: "none" as const,
    };
    if (!obs || !view) {
      return { ...base, value: null, confidence: 0, status: "unsupported", sourceView: null,
        note: NO_VIEW_NOTE };
    }
    const denom = by === "w" ? obs.frameWidth : obs.frameHeight;
    return {
      ...base,
      value: r4(spanPx(obs.landmarks, s, obs.frameWidth, obs.frameHeight) / denom),
      // HẠ TỪ "measured" Ở PHASE 1D-3. Mẫu số là KHUNG HÌNH, nên đây đo cách đóng
      // khung chứ không đo khuôn mặt: 6 lần chụp cùng một người lệch 69% (bề ngang) và
      // 83% (chiều cao); cắt 5% viền là đổi 10.6–11.3%. Vi phạm tiêu chí "công thức
      // không phụ thuộc thang pixel thô". Giữ lại vì hữu ích cho chẩn đoán cự ly chụp.
      confidence: 0.4,
      status: "low_confidence",
      sourceView: view,
      note:
        "KHÔNG phải đặc điểm khuôn mặt — đây là tỉ lệ so với KHUNG HÌNH, tức là đo cách " +
        "đóng khung. Phase 1D-3 trên ảnh thật: 6 lần chụp cùng một người lệch 69–83%; " +
        "cắt 5% viền đổi 10.6–11.3%. Chỉ dùng để chẩn đoán cự ly chụp, tuyệt đối không " +
        "diễn giải như 'mặt to/nhỏ'.",
    };
  };

  const threeCourts = buildThreeCourts(view, obs);

  const geometry = {
    face_width: frameRef("face.geometry.face_width", "faceWidth", "w"),
    face_height: frameRef("face.geometry.face_height", "faceHeight", "h"),
    face_shape_ratio: get("face.geometry.face_shape_ratio"),
  };
  const faceShape = {
    face_shape_ratio: get("face.geometry.face_shape_ratio"),
    jaw_to_face_width: get("face.shape.jaw_to_face_width"),
    cheek_to_face_width: get("face.shape.cheek_to_face_width"),
    chin_to_face_height: get("face.shape.chin_to_face_height"),
  };
  const fiveOfficials = {
    eyes: {
      interocular_distance: get("face.eyes.interocular_distance"),
      left_width: get("face.eyes.left_width"),
      right_width: get("face.eyes.right_width"),
      left_height: get("face.eyes.left_height"),
      right_height: get("face.eyes.right_height"),
      left_tilt: buildEyeTilt("face.eyes.left_tilt", "left", view, obs),
      right_tilt: buildEyeTilt("face.eyes.right_tilt", "right", view, obs),
    },
    eyebrows: {
      left_length: get("face.eyebrows.left_length"),
      right_length: get("face.eyebrows.right_length"),
      left_height: get("face.eyebrows.left_height"),
      right_height: get("face.eyebrows.right_height"),
      spacing: get("face.eyebrows.spacing"),
    },
    nose: {
      length: get("face.nose.length"),
      width: get("face.nose.width"),
      bridge_ratio: buildBridgeRatio(view, obs),
    },
    mouth: { width: get("face.mouth.width"), height: get("face.mouth.height") },
    ears: {
      status: "unsupported" as const,
      reason:
        "Lưới 468 điểm của MediaPipe FaceLandmarker KHÔNG có landmark nào trên vành tai. " +
        "Đây là giới hạn của model, không phải phần chưa làm. Không đoán.",
    },
  };

  const pose = buildPose(view, obs);
  const quality = buildQuality(graded);
  const collected = collectKeys(geometry, faceShape, threeCourts, fiveOfficials, pose);

  const views = {} as Record<ViewName, ViewSummary>;
  for (const v of VIEW_NAMES) {
    const g = graded.get(v);
    views[v] = {
      present: g != null,
      quality: g?.grade ?? "invalid",
      pose: g ? { ...g.obs.pose } : { yaw: null, pitch: null, roll: null },
      contributedFeatures: v === view ? collected.measuredKeys : [],
    };
  }

  return {
    schemaVersion: FEATURE_SCHEMA_VERSION,
    sessionId: input.sessionId,
    capturedAt: input.capturedAt,
    views,
    geometry,
    faceShape,
    threeCourts,
    fiveOfficials,
    twelvePalaces: buildPalaces(),
    pose,
    quality,
    unsupported: [
      ...collected.unsupportedKeys,
      "face.five_officials.ears",
      ...(Object.keys(PALACE_REGIONS) as TwelvePalaceName[]).map((p) => `face.palaces.${p}`),
    ],
    notices: [...FEATURE_LAYER_NOTICES],
  };
}
