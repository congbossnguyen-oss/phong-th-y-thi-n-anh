/**
 * Vòng đời camera. Module này CHỈ thu dữ liệu — không đo, không luận giải.
 *
 * Ba cái bẫy iOS Safari được xử lý ngay ở đây, không để lọt sang component:
 *   1. <video> phải có playsinline + muted, nếu không iOS bung fullscreen phá layout.
 *   2. getUserMedia() phải gọi từ trong handler của một cử chỉ thật. Module không tự
 *      gọi ở lúc nạp — component phải gọi từ onclick.
 *   3. Chỉ được có MỘT stream sống. iOS hay treo nếu mở stream mới khi stream cũ chưa
 *      stop(). `release()` phải được gọi ở mọi đường ra, kể cả pagehide.
 */

/**
 * Vòng đời camera, tường minh: `idle → requesting → active → capture → stopped`.
 *
 * `stopped` là trạng thái CUỐI — một handle đã stopped không mở lại được, phải
 * `openCamera()` mới. Cố ý như vậy để không ai vô tình dùng lại một stream đã chết
 * (iOS treo khi làm thế).
 */
export type CameraLifecycle = "idle" | "requesting" | "active" | "capture" | "stopped";

export interface CameraHandle {
  stream: MediaStream;
  video: HTMLVideoElement;
  /** Trạng thái hiện tại. Đọc để biết có được phép đọc frame hay không. */
  readonly state: CameraLifecycle;
  /** Đánh dấu đang chụp — chỉ để debug panel/log, không đổi hành vi stream. */
  markCapturing: () => void;
  /** Dừng mọi track + gỡ srcObject. Gọi nhiều lần vô hại (idempotent). */
  release: () => void;
  /** Mọi track đã stop chưa — dùng để test dọn dẹp. */
  isReleased: () => boolean;
}

export type CameraError =
  | { kind: "unsupported"; message: string }
  | { kind: "denied"; message: string }
  | { kind: "not_found"; message: string }
  | { kind: "other"; message: string };

/** Trình duyệt có đủ API để quét không. Kiểm tra TRƯỚC khi xin quyền. */
export function checkBrowserSupport(): { ok: true } | { ok: false; reason: string } {
  if (typeof window === "undefined") return { ok: false, reason: "Không ở môi trường browser" };
  if (!window.isSecureContext) {
    return { ok: false, reason: "Trang phải chạy trên HTTPS mới dùng được camera" };
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return { ok: false, reason: "Trình duyệt không hỗ trợ getUserMedia" };
  }
  if (typeof WebAssembly === "undefined") {
    return { ok: false, reason: "Trình duyệt không hỗ trợ WebAssembly" };
  }
  return { ok: true };
}

/**
 * WASM SIMD có được hỗ trợ không. FilesetResolver của MediaPipe tự dò cái này để
 * chọn bản WASM, nhưng ta cũng cần biết để ghi vào metadata (giải thích khác biệt
 * hiệu năng giữa các thiết bị).
 *
 * Chuỗi byte dưới đây là một module WASM tối thiểu có chứa một lệnh SIMD (v128).
 */
export function detectWasmSimd(): boolean {
  try {
    return WebAssembly.validate(
      new Uint8Array([
        0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0,
        10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11,
      ]),
    );
  } catch {
    return false;
  }
}

/**
 * Độ phân giải yêu cầu. 640×480 là đủ: Phase 1B cho thấy chỉ cần vài frame chính
 * diện tốt, không cần stream độ phân giải cao. Thấp hơn thì nhanh hơn trên máy yếu
 * nhưng landmark bắt đầu trôi.
 */
export const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: "user",
  width: { ideal: 640 },
  height: { ideal: 480 },
  frameRate: { ideal: 15, max: 30 },
};

/**
 * Mở camera trước và gắn vào <video>.
 *
 * PHẢI gọi từ trong handler của một cú bấm/chạm thật (yêu cầu của iOS Safari).
 * Trả về Promise reject với CameraError đã phân loại, để UI nói đúng lý do.
 */
export async function openCamera(video: HTMLVideoElement): Promise<CameraHandle> {
  const support = checkBrowserSupport();
  if (!support.ok) {
    throw { kind: "unsupported", message: support.reason } satisfies CameraError;
  }

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: VIDEO_CONSTRAINTS,
      audio: false, // micro xin riêng ở bước giọng nói — không xin gộp
    });
  } catch (err) {
    throw classifyGetUserMediaError(err);
  }

  // Bắt buộc cho iOS Safari. Đặt bằng cả attribute lẫn property vì một số bản
  // Safari cũ chỉ đọc attribute.
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("muted", "");
  video.playsInline = true;
  video.muted = true;
  video.autoplay = true;
  video.srcObject = stream;

  const release = createHandle(stream, video);

  try {
    await video.play();
    await waitForFirstFrame(video);
  } catch (err) {
    release.handle.release();
    throw {
      kind: "other",
      message: `Không phát được luồng video: ${(err as Error)?.message ?? err}`,
    } satisfies CameraError;
  }

  release.setActive();
  return release.handle;
}

/**
 * `play()` resolve trước khi có kích thước thật — đọc videoWidth lúc đó ra 0 và mọi
 * phép đo sau đó sai. Chờ tới khi có kích thước thật, tối đa 10 giây.
 */
function waitForFirstFrame(video: HTMLVideoElement, timeoutMs = 10_000): Promise<void> {
  if (video.videoWidth > 0 && video.videoHeight > 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Hết thời gian chờ khung hình đầu tiên"));
    }, timeoutMs);
    const onReady = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        cleanup();
        resolve();
      }
    };
    function cleanup() {
      clearTimeout(timer);
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("playing", onReady);
      video.removeEventListener("timeupdate", onReady);
    }
    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("playing", onReady);
    video.addEventListener("timeupdate", onReady);
  });
}

/**
 * Dựng handle với vòng đời tường minh.
 *
 * `release()` là IDEMPOTENT — gọi bao nhiêu lần cũng chỉ stop một lần. Cần vậy vì
 * nó được gọi từ nhiều đường ra cùng lúc: `pagehide`, `beforeunload`, nút Huỷ, và
 * lúc chụp xong. Nếu không idempotent thì lần thứ hai sẽ throw trên track đã chết.
 */
function createHandle(stream: MediaStream, video: HTMLVideoElement) {
  let state: CameraLifecycle = "requesting";
  let released = false;

  const doRelease = () => {
    if (released) return;
    released = true;
    state = "stopped";
    // ĐÂY là chỗ duy nhất tắt track. Mọi đường ra đều phải đi qua nó.
    for (const track of stream.getTracks()) {
      try {
        track.stop();
      } catch {
        /* track có thể đã chết — không đáng để làm sập luồng dọn dẹp */
      }
    }
    try {
      video.pause();
      video.srcObject = null;
    } catch {
      /* như trên */
    }
  };

  const handle: CameraHandle = {
    stream,
    video,
    get state() {
      return state;
    },
    markCapturing: () => {
      if (state === "active") state = "capture";
    },
    release: doRelease,
    isReleased: () => stream.getTracks().every((t) => t.readyState === "ended"),
  };

  return {
    handle,
    setActive: () => {
      if (!released) state = "active";
    },
  };
}

function classifyGetUserMediaError(err: unknown): CameraError {
  const name = (err as DOMException)?.name ?? "";
  const message = (err as Error)?.message ?? String(err);
  if (name === "NotAllowedError" || name === "SecurityError") {
    return { kind: "denied", message: "Người dùng chưa cho phép dùng camera" };
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError" || name === "OverconstrainedError") {
    return { kind: "not_found", message: "Không tìm thấy camera phù hợp trên thiết bị" };
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return { kind: "other", message: "Camera đang bị ứng dụng khác chiếm dụng" };
  }
  return { kind: "other", message };
}

/**
 * Chụp khung hình hiện tại ra canvas, để (a) tính độ mờ/độ sáng, (b) hiển thị ảnh
 * đã chụp cho khách xem. Canvas chỉ tồn tại trong memory, không upload (xem Phase I).
 */
export function grabFrame(video: HTMLVideoElement): HTMLCanvasElement | null {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) return null;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, w, h);
  return canvas;
}
