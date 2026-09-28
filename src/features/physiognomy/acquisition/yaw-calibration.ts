/**
 * HIỆU CHUẨN TRÁI/PHẢI — CHỈ DÙNG KHI THU DỮ LIỆU (DEV).
 *
 * `YAW_SIGN_FOR_USER_LEFT` hiện được hiệu chuẩn từ ẢNH TĨNH: đo được yaw dương ở một
 * tấm ảnh, rồi SUY RA đó là quay trái theo quy ước chỉ số của MediaPipe. Phần suy ra ấy
 * chưa hề được ai kiểm bằng mắt. Module này tồn tại để đóng đúng khoảng trống đó.
 *
 * ⚠️ QUY TẮC SỐNG CÒN: KHÔNG ĐƯỢC SUY `observedDirection` TỪ DẤU CỦA YAW.
 *
 * Làm vậy là lập luận vòng tròn — lấy chính thứ cần kiểm ra làm bằng chứng cho nó, và
 * phép thử sẽ luôn PASS kể cả khi hằng số sai ngược. `observedDirection` BẮT BUỘC do
 * một NGƯỜI QUAN SÁT nhìn người test rồi bấm. Đó là mẩu dữ liệu duy nhất ở đây mà cảm
 * biến không tạo ra được.
 *
 * Ba mẩu dữ liệu độc lập, đối chiếu chéo:
 *
 *   requestedDirection   giao diện BẢO gì          (máy biết)
 *   observedDirection    người test LÀM gì         (chỉ mắt người thấy)
 *   yaw                  cảm biến ĐỌC ra gì        (máy biết)
 *
 * Module này KHÔNG sửa hằng số và không có quyền sửa. Nó chỉ kết luận và đề nghị.
 */

import { TURN_MIN_DEG, YAW_SIGN_FOR_USER_LEFT } from "./thresholds";

export const CALIBRATION_VERSION = "physiognomy-yaw-calibration-v1" as const;

export type TurnDirection = "left" | "right";

/** Câu lệnh hiện cho người test. Cố định ở đây để người quan sát và log không lệch nhau. */
export const TURN_INSTRUCTION: Record<TurnDirection, string> = {
  left: "Quay đầu sang trái của bạn.",
  right: "Quay đầu sang phải của bạn.",
};

export interface CalibrationTrial {
  sessionId: string;
  /** Giao diện đã bảo quay về phía nào. */
  requestedDirection: TurnDirection;
  /** NGƯỜI QUAN SÁT thấy người test thật sự quay về phía nào. Không suy từ yaw. */
  observedDirection: TurnDirection;
  /** Yaw cảm biến đọc được ở bước đó, độ. */
  yaw: number;
  at: number;
}

export type TrialOutcome =
  /** Làm đúng lệnh, và dấu yaw khớp với thứ hằng số đang tin. */
  | "pass"
  /** Làm đúng lệnh, nhưng dấu yaw NGƯỢC với hằng số. Đây là bằng chứng chống hằng số. */
  | "sign_mismatch"
  /** Người test quay nhầm bên. Không nói lên điều gì về hằng số — bỏ, quay lại. */
  | "invalid_trial"
  /** Quay chưa đủ để dấu có nghĩa. Cũng không nói lên điều gì. */
  | "no_turn";

/** Dấu yaw mà hằng số HIỆN TẠI cho là ứng với hướng này. */
export function expectedYawSignFor(d: TurnDirection): 1 | -1 {
  return d === "left"
    ? YAW_SIGN_FOR_USER_LEFT
    : ((YAW_SIGN_FOR_USER_LEFT * -1) as 1 | -1);
}

export interface TrialVerdict {
  outcome: TrialOutcome;
  expectedSign: 1 | -1;
  /** null khi quay chưa đủ ngưỡng — dấu của một số gần 0 không đáng tin. */
  actualSign: 1 | -1 | null;
  pass: boolean;
  explanation: string;
}

/**
 * Chấm một lượt thử.
 *
 * Thứ tự xét có chủ ý: lỗi thao tác phải bị loại TRƯỚC khi đụng tới dấu yaw. Nếu người
 * test quay nhầm bên thì dấu yaw có khớp hay không cũng vô nghĩa, và tính nó vào là tự
 * đưa nhiễu vào kết luận.
 */
export function judgeTrial(t: CalibrationTrial): TrialVerdict {
  const expectedSign = expectedYawSignFor(t.requestedDirection);

  if (t.observedDirection !== t.requestedDirection) {
    return {
      outcome: "invalid_trial",
      expectedSign,
      actualSign: null,
      pass: false,
      explanation:
        `Giao diện bảo quay ${viet(t.requestedDirection)} nhưng người test quay ` +
        `${viet(t.observedDirection)}. Lượt này không dùng được — làm lại.`,
    };
  }

  if (!Number.isFinite(t.yaw) || Math.abs(t.yaw) < TURN_MIN_DEG) {
    return {
      outcome: "no_turn",
      expectedSign,
      actualSign: null,
      pass: false,
      explanation:
        `Chỉ quay ${Number.isFinite(t.yaw) ? t.yaw.toFixed(1) : "?"}° — dưới ngưỡng ` +
        `${TURN_MIN_DEG}°, dấu chưa đáng tin. Làm lại và quay dứt khoát hơn.`,
    };
  }

  const actualSign: 1 | -1 = t.yaw > 0 ? 1 : -1;
  const khop = actualSign === expectedSign;
  return {
    outcome: khop ? "pass" : "sign_mismatch",
    expectedSign,
    actualSign,
    pass: khop,
    explanation: khop
      ? `Quay ${viet(t.requestedDirection)} → yaw ${t.yaw.toFixed(1)}°, đúng dấu mong đợi.`
      : `Quay ${viet(t.requestedDirection)} → yaw ${t.yaw.toFixed(1)}° (dấu ${actualSign}), ` +
        `nhưng hằng số mong đợi dấu ${expectedSign}. NGƯỢC.`,
  };
}

function viet(d: TurnDirection): string {
  return d === "left" ? "trái" : "phải";
}

export type CalibrationVerdict =
  | "PASS"
  | "FLIP_RECOMMENDED"
  | "INCONSISTENT"
  | "NOT_TESTED";

export interface CalibrationSummary {
  calibrationVersion: typeof CALIBRATION_VERSION;
  verdict: CalibrationVerdict;
  counts: Record<TrialOutcome, number>;
  /** Lượt dùng được (pass + sign_mismatch), tách theo hướng. */
  usable: { left: number; right: number };
  currentConstant: 1 | -1;
  /** Chỉ là ĐỀ NGHỊ. Không có đường nào từ đây sửa được hằng số. */
  recommendation: string;
}

/**
 * Gộp nhiều lượt thành một kết luận.
 *
 * Đòi CẢ HAI hướng đều có lượt dùng được: chỉ thử mỗi bên trái thì một hằng số sai
 * ngược vẫn có thể trông như đúng, vì chưa có gì mâu thuẫn với nó.
 *
 * Chỉ đề nghị đảo khi MỌI lượt dùng được đều ngược. Lẫn lộn thì kết luận là
 * INCONSISTENT — nghĩa là phép thử tiến hành chưa chuẩn, chứ chưa kết tội hằng số.
 */
export function summarizeCalibration(trials: readonly CalibrationTrial[]): CalibrationSummary {
  const counts: Record<TrialOutcome, number> = {
    pass: 0,
    sign_mismatch: 0,
    invalid_trial: 0,
    no_turn: 0,
  };
  const usable = { left: 0, right: 0 };

  for (const t of trials) {
    const v = judgeTrial(t);
    counts[v.outcome] += 1;
    if (v.outcome === "pass" || v.outcome === "sign_mismatch") {
      usable[t.requestedDirection] += 1;
    }
  }

  const duHaiHuong = usable.left > 0 && usable.right > 0;
  let verdict: CalibrationVerdict;
  let recommendation: string;

  if (!duHaiHuong) {
    verdict = "NOT_TESTED";
    recommendation =
      "Chưa đủ dữ liệu. Cần ít nhất MỘT lượt dùng được cho mỗi hướng (trái và phải), " +
      `hiện có trái=${usable.left}, phải=${usable.right}. Giữ nguyên hằng số.`;
  } else if (counts.sign_mismatch === 0) {
    verdict = "PASS";
    recommendation = "Giao diện ↔ người ↔ cảm biến khớp nhau. Giữ nguyên hằng số.";
  } else if (counts.pass === 0) {
    verdict = "FLIP_RECOMMENDED";
    recommendation =
      `Mọi lượt dùng được (${counts.sign_mismatch}) đều ngược dấu. ĐỀ NGHỊ đổi ` +
      `YAW_SIGN_FOR_USER_LEFT từ ${YAW_SIGN_FOR_USER_LEFT} thành ` +
      `${YAW_SIGN_FOR_USER_LEFT * -1}. Đây là đề nghị — việc đổi là quyết định của người, ` +
      "và phải chạy lại toàn bộ test sau khi đổi.";
  } else {
    verdict = "INCONSISTENT";
    recommendation =
      `Lẫn lộn: ${counts.pass} lượt khớp, ${counts.sign_mismatch} lượt ngược. ` +
      "Nhiều khả năng cách tiến hành chưa chuẩn (người quan sát bấm nhầm, hoặc camera " +
      "trước/sau khác nhau giữa các lượt). Làm lại cho sạch trước khi kết luận. " +
      "Giữ nguyên hằng số.";
  }

  return {
    calibrationVersion: CALIBRATION_VERSION,
    verdict,
    counts,
    usable,
    currentConstant: YAW_SIGN_FOR_USER_LEFT,
    recommendation,
  };
}
