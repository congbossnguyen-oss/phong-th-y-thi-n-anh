/**
 * Cổng chất lượng ảnh. CHỈ quyết định "ảnh này đo được hay không".
 *
 * KHÔNG mang ý nghĩa nhân tướng nào. Mặt nghiêng không phải tướng xấu — chỉ là ảnh
 * không đo được. Ngưỡng ở đây lấy từ POSE_LIMITS trong types, xuất phát từ bằng chứng
 * Phase 1B-2 (yaw 28° làm noseWidth lệch 15%, pitch −31° làm noseLength lệch 44%).
 */

import {
  POSE_LIMITS,
  type CaptureQuality,
  type CaptureQualityStatus,
  type HeadPose,
} from "../types/index";

/** Bề ngang mặt phải chiếm ít nhất bao nhiêu phần khung hình. */
export const MIN_FACE_COVERAGE = 0.25;
/** Trên mức này thì mặt sát camera quá, méo phối cảnh mạnh (Phase 1B: 16% ở cự ly gần). */
export const MAX_FACE_COVERAGE = 0.85;
/** Phương sai Laplacian tối thiểu (đã chuẩn hoá về thang 0..1 của ảnh xám). */
export const MIN_BLUR_SCORE = 0.0015;
/** Độ sáng trung bình vùng mặt phải nằm trong khoảng này (0..1). */
export const MIN_LIGHTING = 0.18;
export const MAX_LIGHTING = 0.92;

/**
 * Phân rã ma trận pose 4×4 của MediaPipe thành yaw/pitch/roll (độ).
 *
 * Dùng ma trận thật, KHÔNG suy từ độ bất đối xứng landmark như các repo khác
 * (ljtnine/face và mcp-gwansang đều dùng heuristic tỉ lệ nửa mặt). Phase 1B §E1 đã
 * kiểm chứng ma trận này: yaw ổn định ±0.4° qua 10 biến thể ảnh, roll bám sát góc
 * xoay áp dụng.
 *
 * Quy ước quan sát được ở Phase 1B-2: +pitch = đầu chúc xuống.
 */
export function decomposePose(m: Float32Array | number[]): {
  yaw: number;
  pitch: number;
  roll: number;
} {
  // ⚠️ MediaPipe Tasks Vision (JS) trả `matrix.data` theo THỨ TỰ CỘT (column-major),
  // KHÁC với Python (numpy reshape ra row-major). Đọc sai thứ tự thì lấy được ma trận
  // CHUYỂN VỊ — với ma trận quay, chuyển vị = nghịch đảo, nên toàn bộ góc bị sai.
  //
  // Đã kiểm chứng trên 4 ảnh thật, đối chiếu với số đo Python của Phase 1B-2:
  //         ảnh     đúng (col-major)      sai (row-major)
  //         1.jpg   -0.62/ -1.11/ -2.17   +0.58/ +1.13/ +2.18
  //         4.jpg  +27.84/ -3.50/ +0.41  -27.75/ +4.17/ -2.31
  //         6.jpg   +2.21/+18.51/ -2.84   -1.19/-18.60/ +3.40
  //         7.jpg   +1.23/-31.12/ -2.81   -2.50/+31.05/ +1.77
  // Lưu ý ảnh 4: không phải đảo dấu thuần (pitch 4.17 vs 3.50) — phân rã Euler của
  // ma trận chuyển vị không bằng phủ định khi góc lớn. Nên không thể "chữa" bằng cách
  // đổi dấu, phải đọc đúng thứ tự.
  const r = (row: number, col: number) => Number(m[col * 4 + row]);
  const sy = Math.hypot(r(0, 0), r(1, 0));
  let x: number;
  let y: number;
  let z: number;
  if (sy > 1e-6) {
    x = Math.atan2(r(2, 1), r(2, 2));
    y = Math.atan2(-r(2, 0), sy);
    z = Math.atan2(r(1, 0), r(0, 0));
  } else {
    x = Math.atan2(-r(1, 2), r(1, 1));
    y = Math.atan2(-r(2, 0), sy);
    z = 0;
  }
  const deg = (rad: number) => (rad * 180) / Math.PI;
  return { yaw: round2(deg(y)), pitch: round2(deg(x)), roll: round2(deg(z)) };
}

/**
 * Độ nét bằng phương sai Laplacian trên vùng mặt.
 *
 * Chuẩn hoá: lấy mẫu thưa (mỗi 2 px) để chạy được ~5 fps trên Android yếu, và chia
 * cho 255² để kết quả không phụ thuộc thang màu.
 */
export function computeBlurScore(
  canvas: HTMLCanvasElement,
  roi: { x: number; y: number; width: number; height: number },
): number | null {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const x = Math.max(0, Math.floor(roi.x));
  const y = Math.max(0, Math.floor(roi.y));
  const w = Math.min(canvas.width - x, Math.floor(roi.width));
  const h = Math.min(canvas.height - y, Math.floor(roi.height));
  if (w < 8 || h < 8) return null;

  const data = ctx.getImageData(x, y, w, h).data;
  const gray = new Float32Array(w * h);
  for (let i = 0, p = 0; i < gray.length; i++, p += 4) {
    gray[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
  }

  let sum = 0;
  let sumSq = 0;
  let n = 0;
  const step = 2;
  for (let j = step; j < h - step; j += step) {
    for (let i = step; i < w - step; i += step) {
      const c = j * w + i;
      // Laplacian 4-neighbour
      const lap = gray[c - 1] + gray[c + 1] + gray[c - w] + gray[c + w] - 4 * gray[c];
      sum += lap;
      sumSq += lap * lap;
      n++;
    }
  }
  if (n === 0) return null;
  const mean = sum / n;
  const variance = sumSq / n - mean * mean;
  return round6(variance / (255 * 255));
}

/** Độ sáng trung bình vùng mặt, 0..1. Tái dùng luôn pixel đã lấy cho blur nếu muốn. */
export function computeLightingScore(
  canvas: HTMLCanvasElement,
  roi: { x: number; y: number; width: number; height: number },
): number | null {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const x = Math.max(0, Math.floor(roi.x));
  const y = Math.max(0, Math.floor(roi.y));
  const w = Math.min(canvas.width - x, Math.floor(roi.width));
  const h = Math.min(canvas.height - y, Math.floor(roi.height));
  if (w < 4 || h < 4) return null;
  const data = ctx.getImageData(x, y, w, h).data;
  let sum = 0;
  let n = 0;
  // Lấy mẫu mỗi 4 px để nhẹ CPU — độ sáng trung bình không cần độ chính xác cao.
  for (let p = 0; p < data.length; p += 16) {
    sum += 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
    n++;
  }
  return n ? round4(sum / n / 255) : null;
}

/**
 * Chấm pose: số đo thô ĐI RIÊNG với phán quyết.
 *
 * Trả về `status: "unknown"` khi không có ma trận pose (không suy đoán bừa).
 * `exceeded` cho biết trục nào vượt, để UI nhắc đúng chỗ.
 */
export function evaluatePose(raw: {
  yaw: number | null;
  pitch: number | null;
  roll: number | null;
}): HeadPose {
  const { yaw, pitch, roll } = raw;
  if (yaw === null || pitch === null || roll === null) {
    return { yaw, pitch, roll, status: "unknown", exceeded: [], limits: POSE_LIMITS };
  }
  const exceeded: Array<"yaw" | "pitch" | "roll"> = [];
  if (Math.abs(yaw) > POSE_LIMITS.yaw) exceeded.push("yaw");
  if (Math.abs(pitch) > POSE_LIMITS.pitch) exceeded.push("pitch");
  if (Math.abs(roll) > POSE_LIMITS.roll) exceeded.push("roll");
  return {
    yaw, pitch, roll,
    status: exceeded.length === 0 ? "pass" : "fail",
    exceeded,
    limits: POSE_LIMITS,
  };
}

export interface QualityInput {
  faceCount: number;
  yaw: number | null;
  pitch: number | null;
  roll: number | null;
  faceCoverage: number | null;
  blurScore: number | null;
  lightingScore: number | null;
}

/**
 * Chấm chất lượng. Trả `reasons` là câu tiếng Việt nói rõ khách phải sửa gì —
 * UI hiển thị trực tiếp được, không cần map thêm.
 */
export function evaluateQuality(input: QualityInput): CaptureQuality {
  const reasons: string[] = [];
  let status: CaptureQualityStatus = "pass";

  const fail = (msg: string) => {
    reasons.push(msg);
    status = "fail";
  };
  const warn = (msg: string) => {
    reasons.push(msg);
    if (status === "pass") status = "warn";
  };

  if (input.faceCount === 0) {
    fail("Không thấy khuôn mặt trong khung hình.");
  } else if (input.faceCount > 1) {
    fail(`Có ${input.faceCount} khuôn mặt trong khung — cần đúng một người.`);
  }

  if (input.faceCoverage !== null) {
    if (input.faceCoverage < MIN_FACE_COVERAGE) {
      fail("Đưa điện thoại gần hơn.");
    } else if (input.faceCoverage > MAX_FACE_COVERAGE) {
      // Chặn hẳn: Phase 1B đo được 16% méo phối cảnh còn sót ở cự ly gần, KỂ CẢ sau
      // khi đã chuẩn hoá theo bề ngang mặt. Lùi ra rẻ hơn là đo sai.
      fail("Lùi điện thoại ra một chút.");
    }
  }

  const pose = evaluatePose(input);
  if (pose.status === "fail") {
    // Một câu duy nhất, nói đúng trục lệch nhiều nhất — không đổ 3 câu lên khách.
    if (pose.exceeded.includes("yaw") && pose.yaw !== null) {
      fail(`Vui lòng nhìn thẳng (đang quay ngang ${Math.abs(pose.yaw).toFixed(1)}°).`);
    } else if (pose.exceeded.includes("pitch") && pose.pitch !== null) {
      const huong = pose.pitch > 0 ? "chúc xuống" : "ngẩng lên";
      fail(`Vui lòng nhìn thẳng (đầu đang ${huong} ${Math.abs(pose.pitch).toFixed(1)}°).`);
    } else if (pose.roll !== null) {
      fail(`Vui lòng giữ đầu ngay (đang nghiêng ${Math.abs(pose.roll).toFixed(1)}°).`);
    }
  }

  if (input.blurScore !== null && input.blurScore < MIN_BLUR_SCORE) {
    fail("Ảnh bị mờ — giữ máy yên hơn.");
  }
  if (input.lightingScore !== null) {
    if (input.lightingScore < MIN_LIGHTING) {
      fail("Quá tối — hãy tìm nơi sáng hơn.");
    } else if (input.lightingScore > MAX_LIGHTING) {
      warn("Ảnh bị cháy sáng — tránh đứng ngược sáng.");
    }
  }

  return {
    faceDetected: input.faceCount > 0,
    faceCount: input.faceCount,
    blurScore: input.blurScore,
    lightingScore: input.lightingScore,
    faceCoverage: input.faceCoverage,
    pose,
    captureQuality: status,
    reasons,
  };
}

/** Ánh xạ lý do fail sang trạng thái lỗi của state machine, để UI nhắc đúng chỗ. */
export function qualityToErrorState(q: CaptureQuality):
  | "no_face" | "multiple_faces" | "face_too_small" | "face_too_large"
  | "pose_invalid" | "blur_invalid" | null {
  if (q.captureQuality !== "fail") return null;
  if (q.faceCount === 0) return "no_face";
  if (q.faceCount > 1) return "multiple_faces";
  if (q.faceCoverage !== null && q.faceCoverage < MIN_FACE_COVERAGE) return "face_too_small";
  if (q.faceCoverage !== null && q.faceCoverage > MAX_FACE_COVERAGE) return "face_too_large";
  if (q.pose.status === "fail") return "pose_invalid";
  return "blur_invalid";
}

const round2 = (v: number) => Math.round(v * 100) / 100;
const round4 = (v: number) => Math.round(v * 10_000) / 10_000;
const round6 = (v: number) => Math.round(v * 1_000_000) / 1_000_000;
