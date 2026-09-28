/**
 * HỢP ĐỒNG DỮ LIỆU — Nhân Tướng Web POC, schema V1
 *
 * Đây là contract, không phải chỗ chứa logic. Mọi field ở đây đều phải trả lời được
 * câu hỏi "đo được thật không, và đo bằng cách nào" — vì Phase 1B đã chứng minh phần
 * lớn thứ mà tướng học cần thì landmark KHÔNG đo được.
 *
 * Bằng chứng nền (docs/, PHASE1B_GEOMETRY_PROOF.md + PHASE1B2_REALPOSE_ANSWERS.md):
 *   - Chuẩn hoá theo bề ngang mặt là CẦN nhưng CHƯA ĐỦ: phối cảnh còn sót tới 16% ở
 *     cự ly gần, vì các bộ phận nằm ở những mặt phẳng độ sâu khác nhau.
 *   - yaw/pitch phá geometry nặng: nose_length −44%, mouth_width +21% ở pitch −31°.
 *   - Trục z của MediaPipe chủ yếu là TEMPLATE: hai người xa lạ có profile z tương
 *     quan r = 0.945–0.985. Độ đầy đặn (丰隆/低陷) của 12 cung: 0/12 cung đạt
 *     S/N ≥ 3, và 9/12 ĐỔI DẤU khi chỉ đổi pose. => KHÔNG đưa vào contract như số liệu.
 *   - Ba đình: chỉ TRUNG ĐÌNH đáng tin (biên độ 0.0063 với công thức head-axis).
 *     Thượng đình lệch hệ thống 46% vì lưới 468 điểm KHÔNG có đỉnh nào ở chân tóc.
 *
 * Nguyên tắc: field nào chưa đo được thì ghi status, không ghi số bịa.
 */

export const SCHEMA_VERSION = "1.0" as const;

/** Model vision đang dùng — đổi model là phải đổi chuỗi này, vì số đo sẽ lệch. */
export const MODEL_VERSION = "mediapipe/face_landmarker@float16-1" as const;

// ─────────────────────────────────────────────────────────────── trạng thái đo

/**
 * Mức độ tin cậy của MỘT field, không phải của cả lần quét.
 *
 *  measured    — đo trực tiếp từ landmark, đã chuẩn hoá, sai số đã biết và chấp nhận được.
 *  estimated   — tính được nhưng có sai lệch hệ thống hoặc mốc neo yếu. Dùng phải kèm cảnh báo.
 *  unsupported — công nghệ hiện tại KHÔNG đo được. Không phải "chưa làm" mà là "không làm được".
 *  unknown     — lần quét này không thu được (mặt bị che, chất lượng kém...).
 */
export type MeasurementStatus = "measured" | "estimated" | "unsupported" | "unknown";

/** Một số đo kèm xuất xứ. Không bao giờ trả số trần không có ngữ cảnh. */
export interface Measurement {
  /** null khi status là unsupported/unknown. Không dùng 0 làm giá trị thiếu. */
  value: number | null;
  status: MeasurementStatus;
  /** "ratio" = không đơn vị (đã chuẩn hoá) · "px" = pixel ảnh · "deg" = độ */
  unit: "ratio" | "px" | "deg";
  /** Chuẩn hoá theo cái gì. "none" nghĩa là số thô, phụ thuộc khoảng cách chụp. */
  normalizedBy?: "faceWidth" | "faceHeight" | "courtTotal" | "none";
  /** Vì sao status không phải "measured". Bắt buộc có khi status !== "measured". */
  note?: string;
}

// ─────────────────────────────────────────────────────────────── 1. metadata

export interface ScanMetadata {
  /** crypto.randomUUID() — chỉ để đối chiếu log trong phiên, KHÔNG phải id khách hàng. */
  scanId: string;
  /** ISO 8601, giờ máy khách. */
  timestamp: string;
  modelVersion: typeof MODEL_VERSION;
  schemaVersion: typeof SCHEMA_VERSION;
  /** Ngữ cảnh thiết bị — cần để giải thích khác biệt số đo giữa các lần quét. */
  device: {
    userAgent: string;
    viewport: { width: number; height: number };
    devicePixelRatio: number;
    /** WASM SIMD có được hỗ trợ không — quyết định bản WASM nào được nạp. */
    wasmSimd: boolean;
  };
}

// ────────────────────────────────────────────────────── 2. chất lượng thu nhận

export type CaptureQualityStatus = "pass" | "warn" | "fail";

/**
 * Ngưỡng pose. CHỈ dùng để quyết định ảnh có dùng được không.
 * KHÔNG mang bất kỳ ý nghĩa nhân tướng nào — mặt nghiêng không phải tướng xấu,
 * chỉ là ảnh không đo được.
 */
export const POSE_LIMITS = { yaw: 8, pitch: 8, roll: 5 } as const;

/**
 * Pose của đầu, tách rõ SỐ ĐO THÔ và PHÁN QUYẾT.
 *
 * `yaw/pitch/roll` là số đo thô từ ma trận biến đổi của MediaPipe (đơn vị độ).
 * `status` chỉ trả lời đúng một câu: ảnh này có đo được hay không.
 *
 * Cố ý tách để không ai nhầm pose thành đặc điểm nhân tướng. `status: "fail"`
 * nghĩa là "chụp lại", KHÔNG phải "tướng xấu".
 */
export interface HeadPose {
  yaw: number | null;
  pitch: number | null;
  roll: number | null;
  status: "pass" | "fail" | "unknown";
  /** Trục nào vượt ngưỡng. Rỗng khi pass. */
  exceeded: Array<"yaw" | "pitch" | "roll">;
  limits: typeof POSE_LIMITS;
}

export interface CaptureQuality {
  faceDetected: boolean;
  faceCount: number;
  /** Phương sai Laplacian đã chuẩn hoá. Càng cao càng nét. null nếu không tính được. */
  blurScore: number | null;
  /** Độ sáng trung bình vùng mặt, 0..1. Quá tối/quá sáng đều làm landmark trôi. */
  lightingScore: number | null;
  /** Bề ngang mặt / bề ngang khung hình, 0..1. Quá nhỏ thì landmark mất chính xác. */
  faceCoverage: number | null;
  /** Số đo thô + phán quyết, tách rõ. Nguồn: facialTransformationMatrixes. */
  pose: HeadPose;
  captureQuality: CaptureQualityStatus;
  /** Lý do cụ thể khi warn/fail, để UI nói cho khách biết phải sửa gì. */
  reasons: string[];
}

// ─────────────────────────────────────────────────────────────── 3. geometry

/**
 * Hình học thuần. Tên field cố tình mang chữ "geometry" ở cấp cha để không ai
 * nhầm đây là kết luận tướng học.
 *
 * TẤT CẢ đều là tỉ lệ không đơn vị. Số pixel thô chỉ nằm trong `referencePx`.
 */
export interface GeometryFeatures {
  /** Bề ngang mặt (gò má trái–phải) theo pixel. Mốc chuẩn hoá cho mọi field khác. */
  faceWidth: Measurement;
  /** Chiều cao mặt (đỉnh lưới → đỉnh cằm) / faceWidth. */
  faceHeight: Measurement;
  /** faceHeight / faceWidth. Phase 1B: vỡ cả 4 trục pose => estimated. */
  faceShapeRatio: Measurement;
  /** Khoảng cách hai khoé mắt trong / faceWidth. Ổn định nhất sau hiệu chỉnh phối cảnh. */
  eyeDistance: Measurement;
  /** Bề ngang cánh mũi / faceWidth. */
  noseWidth: Measurement;
  /** Sơn căn → chuẩn đầu / faceHeight. Phase 1B: pitch −44% => estimated. */
  noseLength: Measurement;
  /** Bề ngang miệng / faceWidth. Phase 1B: pitch +21% => estimated. */
  mouthWidth: Measurement;
  /** Bề ngang hàm dưới / faceWidth. */
  jawWidth: Measurement;
  /** Số pixel thô của các mốc — để tính lại sau mà không cần chụp lại khách. */
  referencePx: {
    faceWidthPx: number;
    faceHeightPx: number;
    frameWidth: number;
    frameHeight: number;
  };
}

// ────────────────────────────────────────────────── 4. vùng cấu trúc trên mặt

/** 468 landmark thô. Giữ lại để tính lại mà không phải chụp lại khách. */
export interface LandmarkPoint {
  x: number;
  y: number;
  /** Độ sâu tương đối, KHÔNG có đơn vị, KHÔNG phải mm. Xem cảnh báo ở ExperimentalDepth. */
  z: number;
}

/** Hộp bao một vùng giải phẫu, đã chuẩn hoá theo khung hình (0..1). */
export interface FaceRegion {
  status: MeasurementStatus;
  bbox: { x: number; y: number; width: number; height: number } | null;
  /** Các landmark index tạo nên vùng này — để kiểm chứng lại được. */
  landmarkIndices: number[];
  note?: string;
}

/** Ngũ Quan — chỉ những tỉ lệ hình học, không có phán đoán. */
export interface FiveOrgansFeatures {
  status: MeasurementStatus;
  /** 眉 — khoảng cách mày–mắt / faceHeight. */
  eyebrow: Measurement;
  /** 目 — chiều dài mắt / faceWidth. Chuẩn "tam đình ngũ nhãn" ≈ 0.20. */
  eye: Measurement;
  /** 鼻 — dùng noseWidth/noseLength ở GeometryFeatures, đây là tổng hợp. */
  nose: Measurement;
  /** 口 — mouthWidth. */
  mouth: Measurement;
  /** 耳 — KHÔNG đo được: lưới 468 điểm không có landmark nào trên vành tai. */
  ear: Measurement;
  note?: string;
}

/**
 * Tam Đình. Chỉ TRUNG ĐÌNH là measured.
 *
 * Phase 1B-2, cùng một người qua pitch +19° → −31°:
 *   công thức trục ảnh  : trung đình 0.4303 → 0.4924 → 0.3757  (biên độ 0.1168)
 *   công thức head-axis : trung đình 0.4260 → 0.4323 → 0.4320  (biên độ 0.0063)
 * => dùng head-axis, và chỉ tin trung đình.
 */
export interface ThreeCourtsFeatures {
  status: MeasurementStatus;
  /** Chân tóc → mày. LƯỚI KHÔNG CÓ ĐỈNH Ở CHÂN TÓC => lệch hệ thống 46%. */
  upper: Measurement;
  /** Mày → chân mũi. Mốc neo cứng, gần trục quay. Đáng tin nhất. */
  middle: Measurement;
  /** Chân mũi → đỉnh cằm. Đỉnh cằm xa trục quay nên trôi nhiều khi chúc/ngẩng. */
  lower: Measurement;
  /** "headAxis3d" = chiếu lên trục dọc của chính đầu · "imageY" = hiệu toạ độ ảnh (kém hơn). */
  method: "headAxis3d" | "imageY";
}

/**
 * Thập Nhị Cung — V1 để status "unsupported" cho TẤT CẢ 12 cung.
 *
 * Không phải vì chưa kịp làm. Ba lý do đã có bằng chứng:
 *  1. Phép đo mà 12 cung cần là độ đầy đặn (丰隆/低陷) theo trục z → Phase 1B-2 cho
 *     0/12 cung đạt S/N ≥ 3, và 9/12 ĐỔI DẤU khi chỉ đổi pose. Cung Phụ Mẫu đổi dấu
 *     khi chỉ cắt 3% viền ảnh.
 *  2. Bản đồ vùng phổ biến nhất (ljtnine/face) có 2/12 cung định nghĩa sai về giải
 *     phẫu: Phu Thê trộn khoé mắt (z≈+3.5) với thái dương (z≈−2.4), chênh 6.2 đơn vị
 *     trong cùng một "vùng" → S/N = 1.01, tín hiệu đúng bằng nhiễu.
 *  3. Nhiều cung phụ thuộc khí sắc/nếp nhăn/nốt ruồi — landmark không thấy được.
 *
 * Giữ field để không phải phá contract sau, nhưng KHÔNG trả số.
 */
export type TwelvePalaceName =
  | "menh" | "taiBach" | "huynhDe" | "dienTrach" | "tuNu" | "noBoc"
  | "phuThe" | "tatAch" | "thienDi" | "quanLoc" | "phucDuc" | "phuMau";

/**
 * Độ tin của BẢN ĐỒ VÙNG (không phải của phép đo).
 *
 * Phân biệt hai chuyện khác nhau:
 *   - mapping: vùng này có đúng về giải phẫu không (đo được bằng canonical mesh)
 *   - measurement: có đo được cái mà cung này cần không (độ đầy đặn → KHÔNG, xem
 *     Phase 1B-2: 0/12 cung đạt S/N≥3)
 *
 * Một cung có thể `mapping: "verified"` nhưng vẫn `status: "unsupported"` — bản đồ
 * đúng, nhưng sensor không đo được thứ cần đo.
 *
 * Tiêu chí `verified`, kiểm bằng canonical mesh của MediaPipe:
 *   z-spread ≤ 0.20 · đường kính xy ≤ 0.45 · 0 điểm thuộc vành contour mắt/môi · ≥ 4 điểm
 * (tất cả chuẩn hoá theo bề ngang mặt)
 */
export type RegionMappingConfidence = "verified" | "unknown";

export interface PalaceMapping {
  /** Phép đo mà cung này cần: hiện tại KHÔNG đo được đáng tin. */
  status: "unsupported";
  /** Bản đồ vùng có đúng giải phẫu không — chuyện khác với status ở trên. */
  mapping: RegionMappingConfidence;
  /** Vùng bên trái (hoặc vùng duy nhất nếu cung nằm trên đường giữa). */
  landmarkIndices: number[];
  /** Vùng bên phải. null nếu cung nằm trên đường giữa. */
  landmarkIndicesRight: number[] | null;
  /** Số liệu khách quan đo trên canonical mesh — để kiểm chứng lại được. */
  metrics: { zSpread: number; diameter: number; contourPoints: number };
  note?: string;
}

export interface TwelvePalacesFeatures {
  status: "unsupported";
  /** Vì sao unsupported — hiển thị được cho người đọc JSON. */
  reason: string;
  palaces: Record<TwelvePalaceName, PalaceMapping>;
}

export interface StructuralFeatures {
  /** 468 điểm, đã chuẩn hoá 0..1 theo khung hình. null nếu chọn không lưu. */
  landmarks: LandmarkPoint[] | null;
  faceRegions: Record<string, FaceRegion>;
  fiveOrgans: FiveOrgansFeatures;
  threeCourts: ThreeCourtsFeatures;
  twelvePalaces: TwelvePalacesFeatures;
}

// ────────────────────────────────────────────── 5. độ sâu (chỉ để nghiên cứu)

/**
 * Dữ liệu độ sâu thô, MẶC ĐỊNH TẮT.
 *
 * Cố tình KHÔNG có field kiểu `foreheadFullness: 0.82`. Một con số như thế trông
 * như sự thật, nhưng Phase 1B-2 đã chứng minh nó đổi dấu khi cắt 3% viền ảnh —
 * tức "trán đầy" hay "trán lép" do khung ảnh quyết định, không do khuôn mặt.
 *
 * Nếu bật để nghiên cứu: values là số thô không tên nghĩa, phải đọc kèm warning.
 */
export interface ExperimentalDepth {
  enabled: boolean;
  values?: Record<string, number>;
  warning: string;
}

export const DEPTH_WARNING =
  "DỮ LIỆU NGHIÊN CỨU — KHÔNG DÙNG ĐỂ LUẬN GIẢI. Trục z của MediaPipe chủ yếu phản " +
  "ánh template khuôn mặt chung (hai người xa lạ tương quan r=0.945–0.985), không " +
  "phản ánh độ sâu riêng của người này. Phase 1B-2: 0/12 cung đạt S/N>=3; 9/12 đổi " +
  "dấu khi chỉ đổi pose.";

// ─────────────────────────────────────────────────────────────── 6. giọng nói

/**
 * Đặc trưng âm thanh — TẤT CẢ đều experimental.
 *
 * Không có bất kỳ field nào ánh xạ âm thanh sang kết luận nhân tướng. Thu và đo
 * trước, việc diễn giải (nếu có) là chuyện của phase sau và cần bằng chứng riêng.
 */
export interface VoiceExperimentalFeatures {
  experimental: true;
  /** Hz, ước lượng bằng tự tương quan. null nếu không bắt được cao độ. */
  pitchHz: number | null;
  /** RMS trung bình 0..1. */
  energyRms: number | null;
  /** Ước lượng thô: số đoạn có tiếng / giây. KHÔNG phải speech-to-text. */
  speechRate: number | null;
  spectralFeatures: {
    /** Trọng tâm phổ (Hz). */
    centroidHz: number | null;
    /** Tỉ lệ đổi dấu — thô nhưng phân biệt được hữu thanh/vô thanh. */
    zeroCrossingRate: number | null;
  };
  warning: string;
}

export const VOICE_WARNING =
  "ĐẶC TRƯNG THỬ NGHIỆM — chưa hiệu chuẩn, chưa có bằng chứng liên hệ với bất kỳ " +
  "kết luận nào. Không dùng làm căn cứ luận giải.";

export interface VoiceCapture {
  voiceCaptured: boolean;
  durationMs: number | null;
  /** MIME thật mà MediaRecorder chọn — iOS trả audio/mp4, Android trả audio/webm. */
  mimeType: string | null;
  sampleRate: number | null;
  channels: number | null;
  features?: VoiceExperimentalFeatures;
}

// ───────────────────────────────────────────────────────────── kết quả tổng

export interface PhysiognomyScanResult {
  schemaVersion: typeof SCHEMA_VERSION;
  metadata: ScanMetadata;
  captureQuality: CaptureQuality;
  geometry: GeometryFeatures | null;
  structural: StructuralFeatures | null;
  experimentalDepth: ExperimentalDepth;
  voice: VoiceCapture;
  /** Cảnh báo cấp toàn bộ lần quét, để người đọc JSON không hiểu sai. */
  notices: string[];
}

// ───────────────────────────────────────────────────── helper dựng Measurement

export function measured(
  value: number,
  unit: Measurement["unit"],
  normalizedBy: Measurement["normalizedBy"] = "faceWidth",
): Measurement {
  return { value, status: "measured", unit, normalizedBy };
}

export function estimated(
  value: number,
  unit: Measurement["unit"],
  note: string,
  normalizedBy: Measurement["normalizedBy"] = "faceWidth",
): Measurement {
  return { value, status: "estimated", unit, normalizedBy, note };
}

export function unsupported(note: string, unit: Measurement["unit"] = "ratio"): Measurement {
  return { value: null, status: "unsupported", unit, note };
}

export function unknownMeasurement(
  note: string,
  unit: Measurement["unit"] = "ratio",
): Measurement {
  return { value: null, status: "unknown", unit, note };
}
