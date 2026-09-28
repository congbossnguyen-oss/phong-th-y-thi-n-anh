/**
 * State machine cho luồng quét. Thuần logic — không chạm DOM, không chạm media API,
 * nên test được bằng vitest mà không cần browser.
 *
 * Trạng thái lỗi được chia làm hai loại, vì UX khác nhau hoàn toàn:
 *   - RECOVERABLE (no_face, pose_invalid, blur_invalid...) → quay lại guiding_user,
 *     camera vẫn mở, chỉ nhắc khách sửa tư thế. Không bắt xin quyền lại.
 *   - TERMINAL (camera_denied, unsupported_browser...) → dừng hẳn, phải làm lại từ đầu.
 */

export type ScanState =
  | "idle"
  | "requesting_camera"
  | "camera_ready"
  | "detecting_face"
  | "guiding_user"
  | "stable_capture"
  | "face_captured"
  | "voice_intro"
  | "requesting_microphone"
  | "recording_voice"
  | "voice_captured"
  | "feature_extraction"
  | "complete"
  // lỗi
  | "camera_denied"
  | "microphone_denied"
  | "no_face"
  | "multiple_faces"
  | "face_too_small"
  | "face_too_large"
  | "pose_invalid"
  | "blur_invalid"
  | "unsupported_browser"
  | "processing_error";

export const RECOVERABLE_ERRORS: ReadonlySet<ScanState> = new Set<ScanState>([
  "no_face",
  "multiple_faces",
  "face_too_small",
  "face_too_large",
  "pose_invalid",
  "blur_invalid",
]);

export const TERMINAL_ERRORS: ReadonlySet<ScanState> = new Set<ScanState>([
  "camera_denied",
  "microphone_denied",
  "unsupported_browser",
  "processing_error",
]);

export function isErrorState(s: ScanState): boolean {
  return RECOVERABLE_ERRORS.has(s) || TERMINAL_ERRORS.has(s);
}

/** Camera có đang cần mở ở trạng thái này không — dùng để biết khi nào phải giải phóng stream. */
export function needsCamera(s: ScanState): boolean {
  return (
    s === "requesting_camera" ||
    s === "camera_ready" ||
    s === "detecting_face" ||
    s === "guiding_user" ||
    s === "stable_capture" ||
    RECOVERABLE_ERRORS.has(s)
  );
}

export function needsMicrophone(s: ScanState): boolean {
  return s === "requesting_microphone" || s === "recording_voice";
}

/**
 * Đồ thị chuyển trạng thái. Chỉ những cạnh có ở đây là hợp lệ — mọi chuyển
 * trạng thái khác bị `transition()` chặn, để không bao giờ nhảy tắt (ví dụ từ
 * idle sang face_captured mà chưa thực sự chụp).
 */
const GRAPH: Record<ScanState, readonly ScanState[]> = {
  idle: ["requesting_camera", "unsupported_browser"],
  requesting_camera: ["camera_ready", "camera_denied", "processing_error"],
  camera_ready: ["detecting_face", "processing_error"],
  detecting_face: [
    "guiding_user", "stable_capture",
    "no_face", "multiple_faces", "face_too_small", "face_too_large", "pose_invalid",
    "blur_invalid", "processing_error",
  ],
  guiding_user: [
    "stable_capture", "detecting_face",
    "no_face", "multiple_faces", "face_too_small", "face_too_large", "pose_invalid",
    "blur_invalid", "processing_error",
  ],
  stable_capture: ["face_captured", "guiding_user", "processing_error"],
  face_captured: ["voice_intro", "idle"],
  voice_intro: ["requesting_microphone", "feature_extraction"],
  requesting_microphone: ["recording_voice", "microphone_denied", "processing_error"],
  recording_voice: ["voice_captured", "processing_error"],
  voice_captured: ["feature_extraction"],
  feature_extraction: ["complete", "processing_error"],
  complete: ["idle"],

  // lỗi có thể chữa → về guiding_user (camera vẫn mở) hoặc bỏ cuộc về idle
  no_face: ["guiding_user", "detecting_face", "idle"],
  multiple_faces: ["guiding_user", "detecting_face", "idle"],
  face_too_small: ["guiding_user", "detecting_face", "idle"],
  face_too_large: ["guiding_user", "detecting_face", "idle"],
  pose_invalid: ["guiding_user", "detecting_face", "idle"],
  blur_invalid: ["guiding_user", "detecting_face", "idle"],

  // lỗi dừng hẳn → chỉ làm lại từ đầu.
  // voice bị từ chối vẫn đi tiếp được: khuôn mặt đã chụp xong, không nên bỏ.
  camera_denied: ["idle"],
  microphone_denied: ["idle", "feature_extraction"],
  unsupported_browser: ["idle"],
  processing_error: ["idle"],
};

export function canTransition(from: ScanState, to: ScanState): boolean {
  return GRAPH[from].includes(to);
}

export interface ScanContext {
  state: ScanState;
  /** Câu tiếng Việt hiển thị cho khách ở trạng thái hiện tại. */
  message: string;
  /** Số frame liên tiếp đã đạt chuẩn — cần đủ STABLE_FRAMES_REQUIRED mới chụp. */
  stableFrames: number;
  /** Lý do kỹ thuật của lỗi gần nhất, để log/debug. Không hiển thị cho khách. */
  lastError: string | null;
}

/**
 * Cần bao nhiêu frame LIÊN TIẾP đạt chuẩn mới chụp.
 *
 * Ở ~5 fps thì 3 frame ≈ 0.6 giây. Đủ để loại nhiễu một-frame mà không bắt khách
 * ngồi im lâu. Phase 1B cho thấy chỉ cần MỘT frame tốt, nhưng đòi 3 frame liên tiếp
 * giúp tránh bắt đúng lúc landmark vừa trôi.
 */
export const STABLE_FRAMES_REQUIRED = 3;

export const MESSAGES: Record<ScanState, string> = {
  idle: "Đặt khuôn mặt vào khung và nhìn thẳng camera.",
  requesting_camera: "Đang xin quyền dùng camera…",
  camera_ready: "Camera đã sẵn sàng.",
  detecting_face: "Đang tìm khuôn mặt…",
  guiding_user: "Giữ yên, nhìn thẳng vào camera.",
  stable_capture: "Giữ nguyên…",
  face_captured: "Đã nhận diện khuôn mặt.",
  voice_intro: "Tiếp theo, hãy nói tự nhiên trong khoảng 10–20 giây.",
  requesting_microphone: "Đang xin quyền dùng micro…",
  recording_voice: "Đang ghi âm…",
  voice_captured: "Đã ghi xong giọng nói.",
  feature_extraction: "Đang tổng hợp dữ liệu…",
  complete: "Đã hoàn tất.",

  camera_denied: "Chưa có quyền dùng camera. Hãy cho phép camera trong cài đặt trình duyệt rồi thử lại.",
  microphone_denied: "Chưa có quyền dùng micro. Bạn có thể bỏ qua bước giọng nói.",
  no_face: "Chưa thấy khuôn mặt — hãy đưa mặt vào giữa khung.",
  multiple_faces: "Chỉ để một người trong khung.",
  face_too_small: "Đưa điện thoại gần hơn.",
  face_too_large: "Lùi điện thoại ra một chút.",
  pose_invalid: "Vui lòng nhìn thẳng.",
  blur_invalid: "Ảnh bị mờ. Giữ máy yên và tìm nơi đủ sáng.",
  unsupported_browser: "Trình duyệt này chưa hỗ trợ quét. Hãy thử Chrome hoặc Safari bản mới.",
  processing_error: "Có lỗi khi xử lý. Hãy thử lại.",
};

export function initialContext(): ScanContext {
  return { state: "idle", message: MESSAGES.idle, stableFrames: 0, lastError: null };
}

/**
 * Chuyển trạng thái. Trả về context MỚI (không sửa tại chỗ) để dễ so sánh và test.
 * Cạnh không hợp lệ → trả về context cũ nguyên vẹn, kèm lastError. Cố tình KHÔNG
 * throw: một cạnh sai trong lúc đang chạy camera không đáng để làm sập cả trang.
 */
export function transition(
  ctx: ScanContext,
  to: ScanState,
  opts: { error?: string; stableFrames?: number } = {},
): ScanContext {
  if (!canTransition(ctx.state, to)) {
    return { ...ctx, lastError: `Chuyển trạng thái không hợp lệ: ${ctx.state} → ${to}` };
  }
  return {
    state: to,
    message: MESSAGES[to],
    // Rời khỏi nhóm trạng thái đang canh frame thì đếm lại từ 0.
    stableFrames:
      opts.stableFrames ??
      (to === "guiding_user" || to === "stable_capture" || to === "detecting_face"
        ? ctx.stableFrames
        : 0),
    lastError: opts.error ?? null,
  };
}
