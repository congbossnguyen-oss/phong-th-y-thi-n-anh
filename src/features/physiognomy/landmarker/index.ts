/**
 * FaceLandmarker — nạp trễ (lazy), asset local.
 *
 * Kích thước tải về lần đầu ĐO THẬT trong repo này:
 *   vision_wasm_internal.wasm         11.76 MB   (bản SIMD, hầu hết thiết bị nay dùng bản này)
 *   vision_wasm_nosimd_internal.wasm  10.96 MB   (chỉ thiết bị không có SIMD, vd iOS Safari < 16.4)
 *   vision_wasm_internal.js            0.32 MB
 *   face_landmarker.task               3.76 MB
 *   ---------------------------------------------
 *   ~15.8 MB cho MỘT thiết bị (FilesetResolver chỉ tải 1 trong 2 bản WASM)
 *
 * Nên TUYỆT ĐỐI không import tĩnh ở đầu component — mọi khách vào trang sẽ tải 15 MB.
 * Pattern `await import()` dưới đây giống hệt cách repo đã làm ở
 * src/pages/gieo-que-kinh-dich.astro:763 và src/pages/lap-la-so-bat-tu.astro:296.
 *
 * Cố ý KHÔNG dùng bản WASM đa luồng: nó cần SharedArrayBuffer, tức phải bật
 * Cross-Origin-Opener-Policy + Cross-Origin-Embedder-Policy toàn site — sẽ phá mọi
 * iframe/ảnh/script cross-origin của website (Sanity CDN, video nhúng...). Bản đơn
 * luồng đủ nhanh cho mục tiêu ~5 fps.
 */

import type { FaceLandmarker, FaceLandmarkerResult } from "@mediapipe/tasks-vision";

/** Asset local, phục vụ qua Cloudflare Static Assets từ public/ → dist/client/. */
const WASM_BASE = "/mediapipe/wasm";
const MODEL_PATH = "/mediapipe/face_landmarker.task";

export interface LandmarkerHandle {
  detectForVideo: (video: HTMLVideoElement, timestampMs: number) => FaceLandmarkerResult;
  close: () => void;
}

let cached: LandmarkerHandle | null = null;
let loading: Promise<LandmarkerHandle> | null = null;

export interface LoadProgress {
  phase: "downloading_runtime" | "downloading_model" | "initialising" | "ready";
  message: string;
}

/**
 * Nạp FaceLandmarker. Gọi nhiều lần an toàn — lần sau dùng lại instance đã nạp,
 * và hai lần gọi song song chia nhau cùng một Promise (không nạp 15 MB hai lần).
 *
 * `onProgress` chỉ báo mốc pha, không báo % — fetch của MediaPipe nằm bên trong
 * WASM nên không lấy được tiến độ byte thật. Thà nói mốc thật còn hơn vẽ % giả.
 */
export async function loadLandmarker(
  onProgress?: (p: LoadProgress) => void,
): Promise<LandmarkerHandle> {
  if (cached) return cached;
  if (loading) return loading;

  loading = (async () => {
    onProgress?.({
      phase: "downloading_runtime",
      message: "Đang tải bộ nhận diện (khoảng 12 MB, chỉ tải một lần)…",
    });

    // Nạp trễ — đây là chỗ 15 MB được tải, và chỉ khi khách đã bấm nút.
    const { FaceLandmarker: FL, FilesetResolver } = await import("@mediapipe/tasks-vision");

    const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);

    onProgress?.({
      phase: "downloading_model",
      message: "Đang tải mô hình khuôn mặt (khoảng 4 MB)…",
    });

    const landmarker = await FL.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: MODEL_PATH,
        // GPU nhanh hơn nhưng WebGL trên một số Android yếu hay lỗi context.
        // CPU chạy ổn ở ~5 fps, đủ cho mục tiêu "tìm một frame tốt".
        delegate: "CPU",
      },
      runningMode: "VIDEO",
      numFaces: 2, // 2 để PHÁT HIỆN được trường hợp nhiều mặt, rồi báo lỗi multiple_faces
      // Bắt buộc: đây là nguồn pose chính xác, thay cho heuristic bất đối xứng.
      outputFacialTransformationMatrixes: true,
      // Không cần blendshape cho V1 — tắt để đỡ tính toán mỗi frame.
      outputFaceBlendshapes: false,
    });

    onProgress?.({ phase: "initialising", message: "Đang khởi tạo…" });

    const handle: LandmarkerHandle = {
      detectForVideo: (video, timestampMs) => landmarker.detectForVideo(video, timestampMs),
      close: () => {
        try {
          (landmarker as FaceLandmarker).close();
        } catch {
          /* đã đóng rồi — không đáng để làm sập luồng dọn dẹp */
        }
        cached = null;
        loading = null;
      },
    };

    cached = handle;
    onProgress?.({ phase: "ready", message: "Sẵn sàng." });
    return handle;
  })();

  try {
    return await loading;
  } catch (err) {
    // Nạp thất bại thì phải xoá promise, nếu không mọi lần gọi sau đều nhận lại lỗi cũ.
    loading = null;
    throw err;
  }
}

/** Giải phóng landmarker. Gọi khi rời trang hoặc xong một lần quét. */
export function releaseLandmarker(): void {
  cached?.close();
  cached = null;
  loading = null;
}
