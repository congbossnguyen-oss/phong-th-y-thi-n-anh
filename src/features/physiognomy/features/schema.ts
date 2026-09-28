/**
 * SCHEMA FEATURE LAYER V1 — "camera quan sát được đặc điểm gì?"
 *
 * Tầng này KHÔNG trả lời "đặc điểm đó tốt/xấu/phúc/họa thế nào". Không có Rule
 * Engine, không có Knowledge Base, không gọi LLM, không một chữ luận giải nào.
 *
 * Ba thứ cố ý KHÔNG tồn tại trong schema này:
 *   1. Bất kỳ field nào mang nghĩa đầy đặn/lõm (丰隆/低陷) theo trục z. Phase 1B-2 đo
 *      trên ảnh thật: 0/12 cung đạt S/N ≥ 3, 9/12 ĐỔI DẤU khi chỉ đổi tư thế. Xem
 *      `ExperimentalDepth` ở `../types/index.ts` — mặc định enabled = false.
 *   2. Bất kỳ phân loại nào (face_type, eye_type, tướng tốt/xấu, cát/hung).
 *   3. Giá trị 0 thay cho "không đo được". Không đo được thì `value: null`.
 */

import type { FaceStep } from "../session/types";
import type { TwelvePalaceName, RegionMappingConfidence } from "../types/index";

export const FEATURE_SCHEMA_VERSION = "physiognomy-feature-v1" as const;

/** Sáu góc thu ở Phase 1C. Tên camelCase để dùng làm khoá trong profile. */
export type ViewName = "front" | "left" | "right" | "near" | "pitchDown" | "pitchUp";

export const VIEW_NAMES: readonly ViewName[] = [
  "front", "left", "right", "near", "pitchDown", "pitchUp",
] as const;

/** Ánh xạ bước của Phase 1C → tên view. Không đổi protocol, chỉ đổi tên hiển thị. */
export const VIEW_FOR_STEP: Record<FaceStep, ViewName> = {
  front: "front",
  left: "left",
  right: "right",
  near: "near",
  pitch_down: "pitchDown",
  pitch_up: "pitchUp",
};

/**
 * Trạng thái của MỘT feature.
 *
 *  measured        — đo được, sai số đã biết và chấp nhận được.
 *  low_confidence  — tính ra được số, nhưng sai số chưa đo hoặc đã biết là lớn.
 *                    Dùng phải đọc `note`. KHÔNG được nâng thành kết luận chắc chắn.
 *  unsupported     — cảm biến hiện tại KHÔNG đo được. Không phải "chưa làm".
 */
export type FeatureStatus = "measured" | "low_confidence" | "unsupported";

export type FeatureUnit = "normalized_ratio" | "degrees" | "score" | "boolean";

/**
 * Một feature kèm đầy đủ xuất xứ (§13 — truy vết được về dữ liệu gốc).
 *
 * Rule Engine ở phase sau đọc `key` + `value` + `status`, và KHÔNG được đọc landmark
 * thô. `sourceLandmarks` để con người kiểm chứng, không phải để engine tự tính lại.
 */
export interface MeasuredFeature<T = number> {
  /** Khoá máy, dạng `face.<nhóm>.<tên>`, snake_case. Không dùng tiếng Việt. */
  key: string;
  /** null khi status là unsupported. KHÔNG BAO GIỜ dùng 0 thay cho "thiếu". */
  value: T | null;
  unit: FeatureUnit;
  /** 0..1. Với unsupported luôn là 0. */
  confidence: number;
  /** Công thức, dạng máy đọc được. Ví dụ "euclidean(browLOuter,browLInner)/faceWidth". */
  method: string;
  /** Index MediaPipe tạo nên phép đo. Rỗng khi unsupported. */
  sourceLandmarks: number[];
  status: FeatureStatus;
  /** View nào cung cấp số này. null khi unsupported. */
  sourceView: ViewName | null;
  /** Chuẩn hoá theo cái gì. Bắt buộc khai báo, không được để feature tự chọn mẫu số. */
  normalizedBy: "faceWidth" | "faceHeight" | "noseWidth" | "interocularAxis" | "none";
  /** Bắt buộc có khi status !== "measured". */
  note?: string;
}

// ───────────────────────────────────────────────────────── các nhóm feature

export interface GeometryGroup {
  face_width: MeasuredFeature;
  face_height: MeasuredFeature;
  face_shape_ratio: MeasuredFeature;
}

export interface FaceShapeGroup {
  face_shape_ratio: MeasuredFeature;
  jaw_to_face_width: MeasuredFeature;
  cheek_to_face_width: MeasuredFeature;
  chin_to_face_height: MeasuredFeature;
}

export interface ThreeCourtsGroup {
  upper: MeasuredFeature;
  middle: MeasuredFeature;
  lower: MeasuredFeature;
  /** "headAxis3d" = chiếu lên trục dọc của chính đầu. Xem docs §Tam Đình. */
  method: "headAxis3d";
}

export interface EyesGroup {
  interocular_distance: MeasuredFeature;
  left_width: MeasuredFeature;
  right_width: MeasuredFeature;
  left_height: MeasuredFeature;
  right_height: MeasuredFeature;
  left_tilt: MeasuredFeature;
  right_tilt: MeasuredFeature;
}

export interface EyebrowsGroup {
  left_length: MeasuredFeature;
  right_length: MeasuredFeature;
  left_height: MeasuredFeature;
  right_height: MeasuredFeature;
  spacing: MeasuredFeature;
}

export interface NoseGroup {
  length: MeasuredFeature;
  width: MeasuredFeature;
  bridge_ratio: MeasuredFeature;
}

export interface MouthGroup {
  width: MeasuredFeature;
  height: MeasuredFeature;
}

/** 耳 — lưới 468 điểm KHÔNG có landmark nào trên vành tai. Không đoán. */
export interface EarsGroup {
  status: "unsupported";
  reason: string;
}

export interface FiveOfficialsGroup {
  eyes: EyesGroup;
  eyebrows: EyebrowsGroup;
  nose: NoseGroup;
  mouth: MouthGroup;
  ears: EarsGroup;
}

/**
 * Một cung trong Thập Nhị Cung.
 *
 * HAI trạng thái TÁCH RIÊNG, cố ý:
 *   mappingStatus     — bản đồ vùng có đúng giải phẫu không (kiểm bằng canonical mesh)
 *   measurementStatus — có đo được thứ mà cung này CẦN không
 * Một cung có thể mapping "verified" mà measurement vẫn "unsupported": bản đồ đúng
 * nhưng cảm biến không đo được độ đầy đặn.
 */
export interface PalaceFeature {
  name: TwelvePalaceName;
  mappingStatus: RegionMappingConfidence;
  measurementStatus: FeatureStatus;
  region: { landmarks: number[] } | null;
  features: Record<string, MeasuredFeature>;
  note?: string;
}

export interface PoseGroup {
  yaw: MeasuredFeature;
  pitch: MeasuredFeature;
  roll: MeasuredFeature;
}

/** Chất lượng dữ liệu — để tầng sau biết có nên tin hay không. */
export type QualityGrade = "excellent" | "good" | "usable" | "poor" | "invalid";

export interface QualityGroup {
  faceDetected: boolean;
  /** Tỉ lệ mặt/khung hình. MediaPipe face mesh KHÔNG trả confidence thật. */
  confidence: number | null;
  brightness: number | null;
  blur: number | null;
  poseValid: boolean;
  distanceValid: boolean;
  overall: QualityGrade;
  reasons: string[];
}

/** Tóm tắt một view đã thu được. */
export interface ViewSummary {
  present: boolean;
  quality: QualityGrade;
  pose: { yaw: number | null; pitch: number | null; roll: number | null };
  /** Feature nào lấy số từ view này. */
  contributedFeatures: string[];
}

// ─────────────────────────────────────────────────────────── profile tổng

export interface PhysiognomyFeatureProfile {
  schemaVersion: typeof FEATURE_SCHEMA_VERSION;
  sessionId: string;
  capturedAt: number;
  views: Record<ViewName, ViewSummary>;
  geometry: GeometryGroup;
  faceShape: FaceShapeGroup;
  threeCourts: ThreeCourtsGroup;
  fiveOfficials: FiveOfficialsGroup;
  twelvePalaces: Record<TwelvePalaceName, PalaceFeature>;
  pose: PoseGroup;
  quality: QualityGroup;
  /** Khoá của mọi feature có status "unsupported" — để đọc nhanh, không phải đi lục. */
  unsupported: string[];
  /** Cảnh báo cấp profile. Người đọc JSON phải thấy trước khi dùng số. */
  notices: string[];
}

export const FEATURE_LAYER_NOTICES: readonly string[] = [
  "Đây là TẦNG ĐO LƯỜNG. Không có field nào mang nghĩa tướng tốt/xấu, cát/hung, " +
    "tính cách hay vận mệnh. Việc luận giải chưa được xây dựng.",
  "Feature có status 'low_confidence' phải đọc kèm 'note' của chính nó. Không được " +
    "nâng thành phân loại chắc chắn.",
  "Không có feature nào đo độ đầy đặn/lõm theo trục z. Phase 1B-2: 0/12 cung đạt " +
    "S/N >= 3, 9/12 đổi dấu khi chỉ đổi tư thế.",
  "Mọi khoảng cách đều là euclidean 2D đã chuẩn hoá; mẫu số khai báo ở 'normalizedBy'. " +
    "Chuẩn hoá KHÔNG khử hết phối cảnh vì các bộ phận nằm ở mặt phẳng độ sâu khác nhau.",
];
