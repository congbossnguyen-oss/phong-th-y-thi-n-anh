/**
 * Điểm vào công khai của module. Chỉ LẮP GHÉP kết quả — không đo, không thu, không luận.
 *
 * Ranh giới cố ý (yêu cầu Phase G): camera chỉ thu, geometry chỉ đo, voice chỉ thu +
 * trích đặc trưng. File này nối chúng lại thành một PhysiognomyScanResult và gắn các
 * cảnh báo cấp toàn bộ lần quét.
 */

import { detectWasmSimd } from "./camera/index";
import {
  computeFaceCoverage,
  measureGeometry,
  measureStructural,
  TWELVE_PALACES_REASON,
} from "./geometry/index";
import {
  DEPTH_WARNING,
  MODEL_VERSION,
  SCHEMA_VERSION,
  type CaptureQuality,
  type LandmarkPoint,
  type PhysiognomyScanResult,
  type VoiceCapture,
} from "./types/index";

export * from "./types/index";
export { POSE_LIMITS } from "./types/index";

// Feature Layer (Phase 1D): landmark + pose + quality → PhysiognomyFeatureProfile.
// Vẫn CHỈ đo — không Rule Engine, không Knowledge Base, không LLM, không luận giải.
export * from "./features/schema";
export * from "./features/landmarks";
export { buildFeatureProfile, gradeQuality } from "./features/extract";
export type { BuildProfileInput, ViewObservation } from "./features/extract";

/** Cảnh báo cấp lần quét — để người đọc JSON không hiểu sai những gì họ thấy. */
export const SCAN_NOTICES: readonly string[] = [
  "Đây là dữ liệu ĐO LƯỜNG, không phải luận giải. Không có trường nào trong tệp này " +
    "mang ý nghĩa tướng tốt/xấu, tính cách hay vận mệnh.",
  "Mọi chỉ số hình học đều là tỉ lệ không đơn vị, chuẩn hoá theo bề ngang hoặc chiều " +
    "cao khuôn mặt. Không có ngưỡng pixel cố định nào.",
  "Trường nào có status khác 'measured' thì phải đọc kèm 'note' của chính nó trước khi dùng.",
  "Ngưỡng pose (yaw/pitch/roll) CHỈ dùng để quyết định ảnh có đo được hay không. " +
    "Mặt nghiêng không mang ý nghĩa nhân tướng nào.",
];

export interface AssembleInput {
  landmarks: LandmarkPoint[];
  /** Ma trận pose 4×4 của MediaPipe, 16 phần tử row-major. null nếu không có. */
  transformMatrix: Float32Array | number[] | null;
  frameWidth: number;
  frameHeight: number;
  quality: CaptureQuality;
  voice: VoiceCapture;
  /** Giữ 468 điểm thô trong JSON để tính lại được mà không phải chụp lại khách. */
  keepLandmarks?: boolean;
}

export function assembleScanResult(input: AssembleInput): PhysiognomyScanResult {
  const { landmarks: lm, frameWidth, frameHeight } = input;

  const geometry =
    lm.length >= 468 ? measureGeometry(lm, frameWidth, frameHeight) : null;

  const structural =
    geometry !== null
      ? measureStructural(
          lm,
          frameWidth,
          frameHeight,
          geometry.referencePx.faceWidthPx,
          geometry.referencePx.faceHeightPx,
          input.keepLandmarks ?? true,
        )
      : null;

  const notices = [...SCAN_NOTICES];
  if (geometry === null) {
    notices.push("Không đủ 468 landmark — không đo được hình học cho lần quét này.");
  }
  if (input.quality.captureQuality !== "pass") {
    notices.push(
      `Chất lượng ảnh: ${input.quality.captureQuality}. ` +
        `Mọi số đo dưới đây có độ tin cậy thấp hơn bình thường. ` +
        `Lý do: ${input.quality.reasons.join(" ") || "không rõ"}`,
    );
  }
  if (structural?.threeCourts.status === "measured") {
    notices.push(
      "Ba đình: CHỈ trung đình đáng tin. Thượng đình lệch hệ thống ~46% (lưới không có " +
        "đỉnh ở chân tóc), hạ đình trôi theo tư thế. Xem 'note' của từng trường.",
    );
  }
  notices.push(`Thập Nhị Cung không được hỗ trợ ở V1. ${TWELVE_PALACES_REASON}`);

  return {
    schemaVersion: SCHEMA_VERSION,
    metadata: {
      scanId: makeScanId(),
      timestamp: new Date().toISOString(),
      modelVersion: MODEL_VERSION,
      schemaVersion: SCHEMA_VERSION,
      device: {
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
        viewport: {
          width: typeof window !== "undefined" ? window.innerWidth : 0,
          height: typeof window !== "undefined" ? window.innerHeight : 0,
        },
        devicePixelRatio: typeof window !== "undefined" ? window.devicePixelRatio : 1,
        wasmSimd: detectWasmSimd(),
      },
    },
    captureQuality: input.quality,
    geometry,
    structural,
    // MẶC ĐỊNH TẮT. Cố tình không có field kiểu `foreheadFullness: 0.82` — một con số
    // như thế trông như sự thật, nhưng Phase 1B-2 chứng minh nó đổi dấu khi cắt 3% viền ảnh.
    experimentalDepth: { enabled: false, warning: DEPTH_WARNING },
    voice: input.voice,
    notices,
  };
}

/** Id chỉ để đối chiếu log trong phiên. KHÔNG phải id khách hàng, không lưu ở đâu. */
function makeScanId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* một số WebView chặn randomUUID */
  }
  return `scan-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Tỉ lệ bề ngang mặt so với khung hình — re-export cho tiện dùng ở component. */
export { computeFaceCoverage };
