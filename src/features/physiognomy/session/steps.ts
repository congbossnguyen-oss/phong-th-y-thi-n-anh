/**
 * Định nghĩa 6 bước khuôn mặt và CỔNG ĐẠT cho từng bước.
 *
 * Logic thuần — không DOM, không media API, test được bằng vitest.
 *
 * Các NGƯỠNG đã chuyển sang `../acquisition/thresholds.ts` (tệp này chỉ tái xuất).
 * Ở đây còn lại: định nghĩa 6 bước và hàm chấm đạt/chưa đạt.
 *
 * ⚠️ MỌI ngưỡng CHỈ dùng để quyết định "ảnh này đo được hay chưa".
 * Không ngưỡng nào mang ý nghĩa nhân tướng. Quay mặt nhiều/ít không phải tướng
 * tốt/xấu — chỉ là tư thế cần thiết để thu đủ góc đo.
 */

import { FACE_STEPS, type FaceStep } from "./types";
import {
  BLUR_MIN,
  BRIGHTNESS_MAX,
  BRIGHTNESS_MIN,
  COVERAGE_MAX,
  COVERAGE_MIN,
  FRONT_LIMITS,
  NEAR_MIN_COVERAGE,
  TURN_MIN_DEG,
  TURN_SAFE_MAX_DEG,
  YAW_SIGN_FOR_USER_LEFT,
} from "../acquisition/thresholds";

/**
 * NGƯỠNG THU NHẬN — đã chuyển quyền sở hữu sang `../acquisition/thresholds.ts`.
 *
 * Chúng thuộc miền THU NHẬN chứ không thuộc miền PHIÊN: Feature Layer cũng cần chúng,
 * và trước đây phải import ngược lên đây chỉ để lấy mấy con số. Giá trị KHÔNG đổi.
 *
 * Tái xuất để mọi nơi đang import từ tệp này vẫn chạy. Mã MỚI nên import thẳng từ
 * `../acquisition/thresholds` — đó mới là chủ sở hữu.
 */
export {
  BLUR_MIN,
  BRIGHTNESS_MAX,
  BRIGHTNESS_MIN,
  COVERAGE_MAX,
  COVERAGE_MIN,
  FRONT_LIMITS,
  NEAR_MIN_COVERAGE,
  STEP_STABLE_FRAMES,
  TURN_MIN_DEG,
  TURN_SAFE_MAX_DEG,
  YAW_SIGN_FOR_USER_LEFT,
} from "../acquisition/thresholds";

export interface StepDefinition {
  step: FaceStep;
  /** Tiêu đề ngắn hiển thị trên máy tính. */
  label: string;
  /** Câu hướng dẫn trên điện thoại. */
  instruction: string;
  /** Câu nhắc phụ khi chưa đạt. */
  hint: string;
}

export const STEP_DEFS: Record<FaceStep, StepDefinition> = {
  front: {
    step: "front",
    label: "Chính diện",
    instruction: "Nhìn thẳng vào camera",
    hint: "Giữ khuôn mặt ở giữa khung",
  },
  left: {
    step: "left",
    label: "Quay trái",
    instruction: "Từ từ quay mặt sang trái",
    hint: "Quay thêm một chút nữa",
  },
  right: {
    step: "right",
    label: "Quay phải",
    instruction: "Từ từ quay mặt sang phải",
    hint: "Quay thêm một chút nữa",
  },
  near: {
    step: "near",
    label: "Sát mặt",
    instruction: "Đưa điện thoại gần khuôn mặt hơn",
    hint: "Gần thêm một chút nữa",
  },
  pitch_down: {
    step: "pitch_down",
    label: "Cúi xuống",
    instruction: "Từ từ cúi mặt xuống",
    hint: "Cúi thêm một chút nữa",
  },
  pitch_up: {
    step: "pitch_up",
    label: "Ngẩng lên",
    instruction: "Từ từ ngẩng mặt lên",
    hint: "Ngẩng thêm một chút nữa",
  },
};

export interface StepInput {
  faceCount: number;
  yaw: number | null;
  pitch: number | null;
  roll: number | null;
  /** Bề ngang mặt / bề ngang khung hình, 0..1. */
  coverage: number | null;
  blur: number | null;
  brightness: number | null;
}

export interface StepVerdict {
  passed: boolean;
  /** Lý do CHẶN. Rỗng khi đạt. Câu tiếng Việt hiển thị được luôn. */
  reasons: string[];
  /**
   * Cảnh báo KHÔNG chặn — vẫn đạt, chỉ nhắc thêm.
   *
   * Tách khỏi `reasons` vì nếu nhét vào đó thì `passed` hoá false, và một cảnh báo
   * kiểu "quay khá nhiều rồi" sẽ vô tình chặn bước mà nó chỉ muốn nhắc.
   */
  warnings: string[];
  /** 0..1 — để vẽ thanh tiến độ "đang quay tới đâu rồi". */
  progress: number;
}

/**
 * Điều kiện chung mọi bước: đúng MỘT khuôn mặt, đủ nét, đủ sáng.
 *
 * Ghi chú về "confidence": MediaPipe Face Landmarker KHÔNG trả điểm tin cậy cho
 * face mesh (khác face detection). Nên POC dùng `coverage` (tỉ lệ mặt/khung) làm
 * đại lượng thay thế và ghi thẳng vào `quality.confidence` kèm ghi chú này, chứ
 * không bịa ra một con số 0..1 trông như xác suất.
 */
function commonChecks(input: StepInput, reasons: string[]): void {
  if (input.faceCount === 0) {
    reasons.push("Chưa thấy khuôn mặt — hãy đưa mặt vào giữa khung.");
    return;
  }
  if (input.faceCount > 1) {
    reasons.push("Chỉ để một người trong khung.");
    return;
  }
  if (input.blur !== null && input.blur < BLUR_MIN) {
    reasons.push("Ảnh bị mờ — giữ máy yên hơn.");
  }
  if (input.brightness !== null) {
    if (input.brightness < BRIGHTNESS_MIN) reasons.push("Quá tối — hãy tìm nơi sáng hơn.");
    else if (input.brightness > BRIGHTNESS_MAX) reasons.push("Ảnh bị cháy sáng — tránh ngược sáng.");
  }
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function evaluateStep(step: FaceStep, input: StepInput): StepVerdict {
  const reasons: string[] = [];
  const warnings: string[] = [];
  commonChecks(input, reasons);
  if (input.faceCount !== 1) {
    return { passed: false, reasons, warnings, progress: 0 };
  }

  const { yaw, pitch, roll, coverage } = input;
  let progress = 0;

  switch (step) {
    case "front": {
      if (coverage !== null) {
        if (coverage < COVERAGE_MIN) reasons.push("Đưa điện thoại gần hơn.");
        else if (coverage > COVERAGE_MAX) reasons.push("Lùi điện thoại ra một chút.");
      }
      if (yaw === null || pitch === null || roll === null) {
        reasons.push("Chưa đo được tư thế đầu — hãy nhìn thẳng vào camera.");
        break;
      }
      const worst = Math.max(
        Math.abs(yaw) / FRONT_LIMITS.yaw,
        Math.abs(pitch) / FRONT_LIMITS.pitch,
        Math.abs(roll) / FRONT_LIMITS.roll,
      );
      // Càng gần chính diện càng cao: 1.0 khi trong ngưỡng, giảm dần khi lệch.
      progress = clamp01(2 - worst);
      if (Math.abs(yaw) > FRONT_LIMITS.yaw || Math.abs(pitch) > FRONT_LIMITS.pitch) {
        reasons.push("Vui lòng nhìn thẳng.");
      } else if (Math.abs(roll) > FRONT_LIMITS.roll) {
        reasons.push("Vui lòng giữ đầu ngay, đừng nghiêng.");
      }
      break;
    }

    case "left":
    case "right": {
      if (yaw === null) {
        reasons.push("Chưa đo được tư thế đầu.");
        break;
      }
      const wanted = step === "left" ? YAW_SIGN_FOR_USER_LEFT : -YAW_SIGN_FOR_USER_LEFT;
      const signed = yaw * wanted; // > 0 nghĩa là đang quay đúng chiều
      progress = clamp01(signed / TURN_MIN_DEG);
      if (signed < TURN_MIN_DEG) {
        reasons.push(STEP_DEFS[step].hint);
      } else if (signed > TURN_SAFE_MAX_DEG) {
        // Vẫn ĐẠT — cảnh báo thôi, vì quay quá nhiều thì detector sắp mất mặt.
        warnings.push("Đã quay khá nhiều — có thể quay lại gần chính diện hơn một chút.");
      }
      break;
    }

    case "near": {
      // Dùng KÍCH THƯỚC MẶT TƯƠNG ĐỐI trong khung, KHÔNG dùng trục z của MediaPipe:
      // z là độ sâu tương đối không đơn vị, không suy ra khoảng cách tuyệt đối được
      // (Phase 1B-2). Kích thước mặt/khung là đại lượng đo được trực tiếp và đủ dùng.
      if (coverage === null) {
        reasons.push("Chưa đo được kích thước khuôn mặt.");
        break;
      }
      progress = clamp01(coverage / NEAR_MIN_COVERAGE);
      if (coverage < NEAR_MIN_COVERAGE) reasons.push(STEP_DEFS.near.hint);
      break;
    }

    case "pitch_down":
    case "pitch_up": {
      if (pitch === null) {
        reasons.push("Chưa đo được tư thế đầu.");
        break;
      }
      // Quy ước đã kiểm chứng ở Phase 1B-2 trên ảnh thật:
      //   pitch DƯƠNG = đầu chúc xuống (ảnh 6: +18.51°)
      //   pitch ÂM    = đầu ngẩng lên  (ảnh 7: −31.12°)
      const wanted = step === "pitch_down" ? 1 : -1;
      const signed = pitch * wanted;
      progress = clamp01(signed / TURN_MIN_DEG);
      if (signed < TURN_MIN_DEG) reasons.push(STEP_DEFS[step].hint);
      break;
    }
  }

  return { passed: reasons.length === 0, reasons, warnings, progress };
}

/** Bước tiếp theo sau `step`, hoặc null nếu đã là bước cuối. */
export function nextStep(step: FaceStep): FaceStep | null {
  const i = FACE_STEPS.indexOf(step);
  return i >= 0 && i < FACE_STEPS.length - 1 ? FACE_STEPS[i + 1] : null;
}
