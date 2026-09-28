/**
 * CỔNG ĐỦ TƯ CÁCH LUẬN GIẢI — chính sách TẬP TRUNG, một nơi duy nhất.
 *
 * Cố ý không để từng module tự định nghĩa cổng riêng: cổng rải rác là cách một hệ
 * thống âm thầm nới lỏng chính nó. Rule Engine, Interpretation và bảng chẩn đoán đều
 * phải hỏi ĐÚNG hàm này.
 *
 * Nguyên tắc: FAIL CLOSED. Thiếu bất kỳ điều kiện nào → không đủ tư cách. Không có
 * đường "tạm cho qua", không có cờ bỏ kiểm.
 */

import {
  evidenceRank,
  type EvidenceLevel,
  type FeatureReliability,
} from "./reliability";

export const POLICY_VERSION = "physiognomy-eligibility-v1" as const;

/**
 * Ngưỡng tối thiểu, lấy từ docs/PHYSIOGNOMY_FEATURE_REAL_DEVICE_VALIDATION.md §7.
 * Đổi mấy con số này là đổi kết luận của cả hệ, nên để lộ ra đây chứ không giấu.
 */
export const NGUONG = {
  /** Dưới mức này không tách được biến thiên cá nhân khỏi nhiễu. */
  soNguoiToiThieu: 5,
  /** Cần ≥2 để có biên độ; 3 để thấy được giá trị lạc. */
  soLuotMoiNguoiToiThieu: 3,
  /** Tiêu chí #6: không phụ thuộc một camera cụ thể. */
  soMayToiThieu: 2,
  /** Bậc bằng chứng thấp nhất được chấp nhận. */
  bangChungToiThieu: "multi_device" as EvidenceLevel,
} as const;

export type IneligibleReason =
  | "measurement_not_measured"
  | "validation_not_validated"
  | "evidence_level_too_low"
  | "not_enough_participants"
  | "not_enough_devices"
  | "not_enough_samples"
  | "distance_not_tested"
  | "pose_not_tested"
  | "lighting_not_tested"
  | "no_verified_source";

export interface EligibilityVerdict {
  featureKey: string;
  eligible: boolean;
  /** Rỗng khi eligible. Luôn liệt kê ĐỦ lý do, không dừng ở lý do đầu tiên. */
  reasons: IneligibleReason[];
  /** Câu giải thích cho người đọc, ghép từ `reasons`. */
  explanation: string;
  policyVersion: typeof POLICY_VERSION;
}

const GIAI_THICH: Record<IneligibleReason, string> = {
  measurement_not_measured: "Feature chưa đạt trạng thái đo được (measured).",
  validation_not_validated: "Chưa được kiểm chứng trên người thật (validated).",
  evidence_level_too_low: `Bậc bằng chứng thấp hơn "${NGUONG.bangChungToiThieu}".`,
  not_enough_participants: `Chưa đủ ${NGUONG.soNguoiToiThieu} người tham gia.`,
  not_enough_devices: `Chưa đủ ${NGUONG.soMayToiThieu} loại máy.`,
  not_enough_samples: `Chưa đủ ${NGUONG.soNguoiToiThieu * NGUONG.soLuotMoiNguoiToiThieu} lượt quét.`,
  distance_not_tested: "Chưa kiểm khi đổi cự ly chụp thật.",
  pose_not_tested: "Chưa kiểm qua các tư thế.",
  lighting_not_tested: "Chưa kiểm qua các mức sáng.",
  no_verified_source: "Chưa có nguồn cổ thư đã xác minh trỏ tới feature này.",
};

/**
 * Feature này có đủ tư cách để luận giải không.
 *
 * `hasVerifiedSource` do tầng luật cung cấp: một phép đo dù chuẩn đến đâu cũng không
 * tự sinh ra ý nghĩa — phải có một nguồn nói nó nghĩa là gì. Truyền `false` (mặc định)
 * thì kết quả luôn là KHÔNG đủ tư cách.
 */
export function evaluateEligibility(
  rel: FeatureReliability,
  hasVerifiedSource = false,
): EligibilityVerdict {
  const reasons: IneligibleReason[] = [];

  if (rel.measurementStatus !== "measured") reasons.push("measurement_not_measured");
  if (rel.validationStatus !== "validated") reasons.push("validation_not_validated");
  if (evidenceRank(rel.evidenceLevel) < evidenceRank(NGUONG.bangChungToiThieu)) {
    reasons.push("evidence_level_too_low");
  }
  if (rel.participantCount < NGUONG.soNguoiToiThieu) reasons.push("not_enough_participants");
  if (rel.deviceCount < NGUONG.soMayToiThieu) reasons.push("not_enough_devices");
  if (rel.sampleCount < NGUONG.soNguoiToiThieu * NGUONG.soLuotMoiNguoiToiThieu) {
    reasons.push("not_enough_samples");
  }
  if (!rel.distanceTested) reasons.push("distance_not_tested");
  if (!rel.poseTested) reasons.push("pose_not_tested");
  if (!rel.lightingTested) reasons.push("lighting_not_tested");
  if (!hasVerifiedSource) reasons.push("no_verified_source");

  return {
    featureKey: rel.featureKey,
    eligible: reasons.length === 0,
    reasons,
    explanation:
      reasons.length === 0
        ? "Đủ điều kiện: đã đo được, đã kiểm chứng, đủ mẫu và có nguồn xác minh."
        : reasons.map((r) => GIAI_THICH[r]).join(" "),
    policyVersion: POLICY_VERSION,
  };
}

/** Chạy cổng cho cả bảng độ tin cậy. */
export function evaluateAll(
  reliability: Record<string, FeatureReliability>,
  hasVerifiedSource: (featureKey: string) => boolean = () => false,
): Record<string, EligibilityVerdict> {
  const out: Record<string, EligibilityVerdict> = {};
  for (const [key, rel] of Object.entries(reliability)) {
    out[key] = evaluateEligibility(rel, hasVerifiedSource(key));
  }
  return out;
}
