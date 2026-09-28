/**
 * Phiên ghép đôi Desktop ↔ Điện thoại cho POC nhân tướng.
 *
 * Mô hình: máy tính tạo phiên và hiện QR; điện thoại quét QR, mở đúng phiên đó, làm
 * 6 bước khuôn mặt + 1 bước giọng nói, và báo tiến độ về. Máy tính POLL để cập nhật UI.
 *
 * KHÔNG có ảnh/video/âm thanh nào đi qua phiên này — chỉ số đo có cấu trúc.
 * KHÔNG có trường nào mang nghĩa nhân tướng (xem `../types/index.ts` để biết vì sao).
 */

import type { PhysiognomySessionFeaturePayload } from "../features/transport";
import type { DeviceInfo } from "./device";
import type { SampleLabel } from "./sample";

/** Sáu bước khuôn mặt, theo đúng thứ tự người dùng thực hiện. */
export const FACE_STEPS = [
  "front",
  "left",
  "right",
  "near",
  "pitch_down",
  "pitch_up",
] as const;
export type FaceStep = (typeof FACE_STEPS)[number];

export type PhysiognomySessionStatus =
  | "waiting"
  | "connected"
  | "face_front"
  | "face_left"
  | "face_right"
  | "face_near"
  | "face_pitch_down"
  | "face_pitch_up"
  | "voice"
  | "complete"
  | "failed";

/** Trạng thái phiên tương ứng với từng bước khuôn mặt — dùng để máy tính vẽ tiến độ. */
export const STATUS_FOR_STEP: Record<FaceStep, PhysiognomySessionStatus> = {
  front: "face_front",
  left: "face_left",
  right: "face_right",
  near: "face_near",
  pitch_down: "face_pitch_down",
  pitch_up: "face_pitch_up",
};

/**
 * Ảnh chụp SỐ ĐO của một bước. Không phải ảnh thật — chỉ là số.
 *
 * Cố ý KHÔNG có `forehead_fullness`, `nose_fullness`, `cheek_fullness` hay bất kỳ
 * trường độ-đầy-đặn nào: Phase 1B-2 đã chứng minh trục z của MediaPipe chủ yếu phản
 * ánh template chung (hai người xa lạ tương quan r = 0.945–0.985), 0/12 cung đạt
 * S/N ≥ 3, và 9/12 đổi dấu khi chỉ đổi tư thế.
 */
export interface FaceTestSnapshot {
  step: FaceStep;
  timestamp: number;

  quality: {
    faceDetected: boolean;
    /** Tỉ lệ khuôn mặt so với khung hình, 0..1 — thay cho "confidence" mà MediaPipe
     *  KHÔNG cung cấp cho face mesh. Xem ghi chú ở `evaluateStep`. */
    confidence: number | null;
    brightness: number | null;
    blur: number | null;
  };

  pose: {
    yaw: number | null;
    pitch: number | null;
    roll: number | null;
  };

  geometry: {
    /** Pixel. Là mốc chuẩn hoá cho mọi tỉ lệ khác, nên giữ ở đơn vị thô. */
    faceWidth: number | null;
    faceHeight: number | null;
    faceShapeRatio: number | null;
    /** Ba đình theo công thức trục-đầu-3D. CHỈ `middleCourt` đáng tin. */
    middleCourt: number | null;
    upperCourt: number | null;
    lowerCourt: number | null;
  };
}

/**
 * Kết quả của bước TRÍCH FEATURE, tách khỏi kết quả THU ẢNH.
 *
 * Hai việc khác nhau: thu được 6 góc là một chuyện, tính ra số đo là chuyện khác.
 * Trích hỏng KHÔNG làm phiên `failed` — 6 snapshot đã thu vẫn nguyên giá trị và
 * người dùng đã bỏ công quay đủ. Nhưng cũng KHÔNG được im lặng giả vờ mọi thứ ổn:
 * `featureStatus` nói thẳng ra chuyện gì đã xảy ra.
 *
 *  none        — máy khách không gửi feature (client cũ, hoặc chưa tới bước đó).
 *                Giá trị mặc định → bản ghi cũ đọc lên vẫn hợp lệ.
 *  ok          — có payload, đã qua kiểm.
 *  unavailable — máy khách báo trích hỏng, kèm lý do. KHÔNG có feature nào = 0.
 */
export type FeatureExtractionStatus = "none" | "ok" | "unavailable";

export interface VoiceTestResult {
  passed: boolean;
  durationMs: number;
  mimeType: string | null;
  sampleRate: number | null;
  hasAudio: boolean;
}

export interface PhysiognomySessionResult {
  sessionId: string;
  status: "complete";
  face: {
    front: FaceTestSnapshot | null;
    left: FaceTestSnapshot | null;
    right: FaceTestSnapshot | null;
    near: FaceTestSnapshot | null;
    pitchDown: FaceTestSnapshot | null;
    pitchUp: FaceTestSnapshot | null;
  };
  voice: VoiceTestResult | null;
  quality: {
    faceTestsPassed: number;
    voicePassed: boolean;
    overall: "pass" | "partial" | "fail";
  };
  /** Trích feature xong chưa, và vì sao chưa. Xem `FeatureExtractionStatus`. */
  featureStatus: FeatureExtractionStatus;
  /** null khi featureStatus khác "ok". KHÔNG BAO GIỜ là object rỗng. */
  featureProfile: PhysiognomySessionFeaturePayload | null;
  /** Lý do khi featureStatus === "unavailable". */
  featureError: string | null;
  createdAt: number;
  completedAt: number;
}

/** Bản ghi phiên lưu ở server. KHÔNG chứa thông tin cá nhân nào. */
export interface SessionRecord {
  sessionId: string;
  status: PhysiognomySessionStatus;
  createdAt: number;
  expiresAt: number;
  /** Lần đầu điện thoại kết nối. null khi còn `waiting`. */
  connectedAt: number | null;
  completedAt: number | null;
  /** Bước nào đã xong — điện thoại gửi lên từng bước một. */
  snapshots: Partial<Record<FaceStep, FaceTestSnapshot>>;
  voice: VoiceTestResult | null;
  /**
   * Khoá ghi. Điện thoại nhận khoá này ở lần kết nối ĐẦU TIÊN và phải kèm nó trong
   * mọi lần ghi sau đó. Ngăn máy khác biết sessionId (qua ảnh chụp QR chẳng hạn) mà
   * ghi đè tiến độ của phiên đang chạy. Máy tính KHÔNG cần khoá (chỉ đọc).
   */
  writeToken: string | null;
  /** Lý do khi `failed`. */
  failureReason: string | null;
  /**
   * Ba trường dưới đây THÊM SAU (Phase 1D-2) và đều tuỳ chọn ở kiểu đọc lên: bản ghi
   * cũ trong KV không có chúng, `??` ở `buildResult` lo phần tương thích ngược.
   */
  featureStatus?: FeatureExtractionStatus;
  featureProfile?: PhysiognomySessionFeaturePayload | null;
  featureError?: string | null;
  /**
   * Nhãn mẫu nghiên cứu (Phase 1D-3A). CHỈ được gắn khi chạy DEV — API từ chối trường
   * này ở bản production. Không chứa thông tin cá nhân, xem `./sample.ts`.
   */
  sample?: SampleLabel | null;
  /**
   * Máy ĐÃ QUÉT, do chính điện thoại khai lúc kết nối (Phase 1D-3B).
   *
   * Tách khỏi `sample.deviceLabel`: nhãn đó do người vận hành gõ trên MÁY TÍNH, còn
   * trường này đến từ ĐIỆN THOẠI thật sự cầm camera. Bản ghi cũ không có nên tuỳ chọn.
   */
  device?: DeviceInfo | null;
}

/** Thứ máy tính nhận về khi poll — cố tình KHÔNG trả `writeToken`. */
export interface SessionPublicView {
  sessionId: string;
  status: PhysiognomySessionStatus;
  /** Nhãn mẫu nghiên cứu, null ở luồng bình thường. */
  sample: SampleLabel | null;
  /**
   * Máy đã quét, do điện thoại tự khai. null ở luồng bình thường — API chỉ nhận khai
   * báo này khi chạy DEV. Bày ra ở đây để người vận hành thấy NGAY lúc đang thu rằng
   * điện thoại đã khai hay chưa, thay vì chỉ phát hiện lúc xuất dữ liệu.
   */
  device: DeviceInfo | null;
  createdAt: number;
  expiresAt: number;
  connectedAt: number | null;
  completedAt: number | null;
  /** Các bước đã xong, theo thứ tự FACE_STEPS. */
  stepsDone: FaceStep[];
  voice: VoiceTestResult | null;
  result: PhysiognomySessionResult | null;
  failureReason: string | null;
}

/** Phiên sống bao lâu. Đủ cho một lượt demo, đủ ngắn để không tích rác. */
export const SESSION_TTL_MS = 15 * 60 * 1000;

/** Máy tính poll mỗi bao lâu. 1.5s đủ mượt mắt mà không nện API. */
export const DESKTOP_POLL_MS = 1500;

export function publicView(r: SessionRecord): SessionPublicView {
  const stepsDone = FACE_STEPS.filter((s) => r.snapshots[s] != null);
  return {
    sessionId: r.sessionId,
    status: r.status,
    sample: r.sample ?? null,
    device: r.device ?? null,
    createdAt: r.createdAt,
    expiresAt: r.expiresAt,
    connectedAt: r.connectedAt,
    completedAt: r.completedAt,
    stepsDone,
    voice: r.voice,
    result: r.status === "complete" ? buildResult(r) : null,
    failureReason: r.failureReason,
  };
}

export function buildResult(r: SessionRecord): PhysiognomySessionResult {
  const s = r.snapshots;
  const faceTestsPassed = FACE_STEPS.filter((k) => s[k] != null).length;
  const voicePassed = r.voice?.passed === true;
  return {
    sessionId: r.sessionId,
    status: "complete",
    face: {
      front: s.front ?? null,
      left: s.left ?? null,
      right: s.right ?? null,
      near: s.near ?? null,
      pitchDown: s.pitch_down ?? null,
      pitchUp: s.pitch_up ?? null,
    },
    voice: r.voice,
    quality: {
      faceTestsPassed,
      voicePassed,
      overall:
        faceTestsPassed === FACE_STEPS.length && voicePassed
          ? "pass"
          : faceTestsPassed === 0
            ? "fail"
            : "partial",
    },
    featureStatus: r.featureStatus ?? "none",
    featureProfile: r.featureProfile ?? null,
    featureError: r.featureError ?? null,
    createdAt: r.createdAt,
    completedAt: r.completedAt ?? Date.now(),
  };
}
