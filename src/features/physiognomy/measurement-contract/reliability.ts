/**
 * MEASUREMENT CONTRACT — "feature này có ĐỦ TƯ CÁCH để tầng dưới luận giải chưa?"
 *
 * Tách hẳn khỏi Feature Layer, và đây là ranh giới quan trọng nhất của cả hệ:
 *
 *   Feature Layer      trả lời  "đã ĐO ĐƯỢC gì"          → measurementStatus
 *   Measurement Contract trả lời "đã ĐƯỢC KIỂM CHỨNG chưa" → validationStatus
 *
 * Hai câu hỏi khác nhau. Một feature có thể `measured` mà vẫn chưa được phép luận
 * giải, vì đo được không có nghĩa là đã chứng minh trên đủ người, đủ máy, đủ điều kiện.
 *
 * ⚠️ FIXTURE KHÔNG BAO GIỜ NÂNG ĐƯỢC STATUS. Mesh chuẩn của MediaPipe là thứ model hồi
 * quy về, nên mọi feature đều "hoàn hảo" trên đó theo định nghĩa. Chỉ bằng chứng trên
 * NGƯỜI THẬT mới đếm — xem thang `EvidenceLevel`.
 */

import type { FeatureStatus } from "../features/schema";

export const RELIABILITY_SCHEMA_VERSION = "physiognomy-reliability-v1" as const;

/**
 * Thang bằng chứng, xếp từ yếu đến mạnh. Mỗi bậc đòi hỏi bậc trước.
 *
 *  synthetic            — mesh chuẩn / landmark sinh ra. KHÔNG nói được gì về người thật.
 *  real_image           — ảnh người thật, nhưng một người.
 *  real_device          — camera thật trên điện thoại/trình duyệt thật.
 *  multi_person         — ≥5 người, đủ để tách biến thiên cá nhân khỏi nhiễu.
 *  multi_device         — ≥2 loại máy, đủ để biết không phụ thuộc một camera.
 *  production_validated — đã chạy thật với khách trong thời gian đủ dài.
 */
export const EVIDENCE_LEVELS = [
  "synthetic",
  "real_image",
  "real_device",
  "multi_person",
  "multi_device",
  "production_validated",
] as const;
export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];

export const evidenceRank = (l: EvidenceLevel): number => EVIDENCE_LEVELS.indexOf(l);

/**
 *  unvalidated — chưa kiểm trên người thật, hoặc đã kiểm và TRƯỢT.
 *  provisional — có dấu hiệu tốt trên người thật nhưng mẫu chưa đủ.
 *  validated   — đủ bằng chứng theo `InterpretationEligibilityPolicy`.
 */
export type ValidationStatus = "unvalidated" | "provisional" | "validated";

export interface FeatureReliability {
  featureKey: string;
  /** Lấy từ Feature Layer, KHÔNG được sửa ở tầng này. */
  measurementStatus: FeatureStatus;
  validationStatus: ValidationStatus;
  /** 0..1, cùng thang với confidence của Feature Layer. */
  confidence: number;
  evidenceLevel: EvidenceLevel;
  /** Số lượt quét đã dùng làm bằng chứng. */
  sampleCount: number;
  /** Số NGƯỜI khác nhau. Đây là con số quyết định, không phải sampleCount. */
  participantCount: number;
  deviceCount: number;
  /** Đã kiểm khi đổi cự ly chụp THẬT chưa (không phải thu phóng ảnh). */
  distanceTested: boolean;
  poseTested: boolean;
  lightingTested: boolean;
  knownLimitations: string[];
  /** ISO 8601, null khi chưa từng kiểm trên người thật. */
  lastValidatedAt: string | null;
  schemaVersion: typeof RELIABILITY_SCHEMA_VERSION;
}

// ─────────────────────────────────────────────── bằng chứng đã có thật

/** Ngày chạy Phase 1D-3 — đo lại 7 ảnh người thật bằng chính công thức đang ship. */
const NGAY_1D3 = "2026-09-25";

const KHONG_DU_MAU =
  "Bằng chứng mới có 1 người / 1 máy ảnh. Chưa tách được biến thiên cá nhân khỏi nhiễu.";

/** Mặc định cho feature chưa hề kiểm trên người thật. */
function chuaKiem(featureKey: string, measurementStatus: FeatureStatus, confidence: number): FeatureReliability {
  return {
    featureKey,
    measurementStatus,
    validationStatus: "unvalidated",
    confidence,
    evidenceLevel: "synthetic",
    sampleCount: 0,
    participantCount: 0,
    deviceCount: 0,
    distanceTested: false,
    poseTested: false,
    lightingTested: false,
    knownLimitations: [
      "Chưa đo trên ảnh người thật — mọi số hiện có đến từ mesh chuẩn của MediaPipe.",
    ],
    lastValidatedAt: null,
    schemaVersion: RELIABILITY_SCHEMA_VERSION,
  };
}

/**
 * Bằng chứng THẬT từ Phase 1D-3, chép nguyên số đo, không làm tròn cho đẹp.
 *
 * Bộ mẫu: 7 ảnh của MỘT người, 6 ảnh bắt được mặt, chỉ 2 ảnh qua cổng chính diện.
 * Vì vậy `participantCount: 1` và `deviceCount: 1` ở tất cả các mục dưới đây — đó là
 * lý do KHÔNG mục nào đạt `validated`.
 */
const DA_KIEM: Partial<Record<string, Partial<FeatureReliability>>> = {
  "face.geometry.face_width": {
    validationStatus: "unvalidated",
    evidenceLevel: "real_image",
    knownLimitations: [
      "Mẫu số là KHUNG HÌNH nên đo cách đóng khung, không đo khuôn mặt.",
      "6 lần chụp cùng một người lệch 69.3%; cắt 5% viền đổi 10.6%.",
      "Chỉ dùng để chẩn đoán cự ly chụp. TUYỆT ĐỐI không diễn giải như 'mặt to/nhỏ'.",
    ],
  },
  "face.geometry.face_height": {
    validationStatus: "unvalidated",
    evidenceLevel: "real_image",
    knownLimitations: [
      "Mẫu số là KHUNG HÌNH nên đo cách đóng khung, không đo khuôn mặt.",
      "6 lần chụp cùng một người lệch 82.9%; cắt 5% viền đổi 11.3%.",
    ],
  },
  "face.eyes.interocular_distance": {
    validationStatus: "provisional",
    evidenceLevel: "real_image",
    knownLimitations: [
      "Bền với crop (≤1.7%), thu phóng ảnh (≤1.9%) và độ sáng (≤1.1%).",
      "NHƯNG hai lần chụp khác cự ly, cả hai đều qua cổng chính diện, lệch 7.56% — vượt ngưỡng 5%.",
      "Nguyên nhân: depthMismatch 0.404 — khoé mắt và mốc chuẩn hoá ở hai mặt phẳng độ sâu khác nhau.",
      KHONG_DU_MAU,
    ],
  },
  "face.three_courts.middle": {
    validationStatus: "provisional",
    evidenceLevel: "real_image",
    knownLimitations: [
      "Bền nhất nhóm hình học: crop ≤1.9%, thu phóng ≤0.9%, độ sáng ≤1.9%, pitch 0.0063.",
      "Giữa hai lần chụp qua cổng: 2.90% — DƯỚI ngưỡng 5%.",
      "Yaw 28° đẩy lên 6.07%, nhưng góc đó đã bị cổng chính diện chặn.",
      KHONG_DU_MAU,
    ],
  },
  "face.three_courts.upper": {
    evidenceLevel: "real_image",
    knownLimitations: [
      "Mốc trên là đỉnh lưới (landmark 10), KHÔNG phải chân tóc — lệch hệ thống ~46%.",
      "Mọi khuôn mặt đều sẽ đọc ra 'thượng đình khuyết' nếu tin con số này.",
    ],
  },
  "face.three_courts.lower": {
    evidenceLevel: "real_image",
    knownLimitations: ["Đỉnh cằm xa trục quay nhất nên trôi nhiều khi chúc/ngẩng — biên độ 0.072."],
  },
  "face.nose.length": {
    evidenceLevel: "real_image",
    knownLimitations: ["Lệch 44.1% ở pitch −31° trên ảnh thật — kém nhất nhóm hình học."],
  },
  "face.nose.width": {
    evidenceLevel: "real_image",
    knownLimitations: ["Lệch 15.3% ở yaw 28° và 10.9% do khoảng cách chụp."],
  },
  "face.mouth.width": {
    evidenceLevel: "real_image",
    knownLimitations: ["Lệch 20.6% ở pitch −31°. Hiệu chỉnh bằng độ sâu template làm TỆ HƠN (−33%)."],
  },
  "face.geometry.face_shape_ratio": {
    evidenceLevel: "real_image",
    knownLimitations: ["Vỡ cả 4 trục: khoảng cách 7.1% · yaw 5.1% · pitch 17.6% · roll 6.0%."],
  },
  "face.pose.yaw": {
    validationStatus: "provisional",
    evidenceLevel: "real_image",
    knownLimitations: [
      "Nhiễu tuyệt đối ≤0.47° qua crop, thu phóng và độ sáng — nhỏ hơn cổng 8° một bậc.",
      "ĐÂY LÀ SIÊU DỮ LIỆU THU NHẬN, không phải đặc điểm nhân tướng.",
      KHONG_DU_MAU,
    ],
  },
  "face.pose.pitch": {
    validationStatus: "provisional",
    evidenceLevel: "real_image",
    knownLimitations: [
      "Nhiễu tuyệt đối ≤1.10°.",
      "ĐÂY LÀ SIÊU DỮ LIỆU THU NHẬN, không phải đặc điểm nhân tướng.",
      KHONG_DU_MAU,
    ],
  },
  "face.pose.roll": {
    validationStatus: "provisional",
    evidenceLevel: "real_image",
    knownLimitations: [
      "Nhiễu tuyệt đối ≤0.61°.",
      "ĐÂY LÀ SIÊU DỮ LIỆU THU NHẬN, không phải đặc điểm nhân tướng.",
      KHONG_DU_MAU,
    ],
  },
};

/** Feature đã có bằng chứng ảnh thật thì dùng chung các con số bộ mẫu này. */
const BO_MAU_1D3 = {
  sampleCount: 6,
  participantCount: 1,
  deviceCount: 1,
  distanceTested: true,
  poseTested: true,
  lightingTested: true,
  lastValidatedAt: NGAY_1D3,
} as const;

/**
 * Số ĐẾM ĐƯỢC từ một tập dữ liệu thật, theo từng feature.
 *
 * Kiểu này cố ý chỉ có ba trường đếm. Nó KHÔNG mang `validationStatus` hay
 * `evidenceLevel`: một tập dữ liệu chứng minh được "đã đo bao nhiêu lượt, bao nhiêu
 * người, bao nhiêu máy", nhưng không tự chứng minh được phép đo là ĐÚNG. Việc phong
 * `validated` là kết luận của người sau khi đọc phân rã phương sai, không phải hệ quả
 * số học của việc đếm.
 */
export interface DatasetCounts {
  sampleCount: number;
  participantCount: number;
  deviceCount: number;
}

/**
 * Dựng bảng độ tin cậy từ chính profile vừa đo.
 *
 * `measurementStatus` và `confidence` LẤY TỪ Feature Layer, không chép tay — để hai
 * tầng không bao giờ lệch nhau. Tầng này chỉ thêm phần KIỂM CHỨNG.
 *
 * `datasetCounts` (tuỳ chọn, Phase 1D-4) là đường để DỮ LIỆU THẬT thay các con số đếm
 * viết tay. Không truyền thì hành vi y như trước — mọi test cũ giữ nguyên nghĩa. Truyền
 * thì ba con số đếm của feature đó lấy từ tập dữ liệu, và `knownLimitations` được ghi
 * thêm một dòng nói rõ số ở đâu ra, để không ai nhầm chúng với bộ mẫu ảnh Phase 1D-3.
 *
 * ⚠️ `datasetCounts` KHÔNG chạm `validationStatus` và KHÔNG chạm `evidenceLevel`. Đếm
 * nhiều hơn không tự làm phép đo đáng tin hơn.
 */
export function buildReliability(
  features: { key: string; status: FeatureStatus; confidence: number }[],
  datasetCounts?: Readonly<Record<string, DatasetCounts>>,
): Record<string, FeatureReliability> {
  const out: Record<string, FeatureReliability> = {};
  for (const f of features) {
    const base = chuaKiem(f.key, f.status, f.confidence);
    const them = DA_KIEM[f.key];
    const rel = them
      ? { ...base, ...BO_MAU_1D3, ...them, featureKey: f.key, measurementStatus: f.status, confidence: f.confidence }
      : base;

    const dem = datasetCounts?.[f.key];
    out[f.key] = dem
      ? {
          ...rel,
          sampleCount: dem.sampleCount,
          participantCount: dem.participantCount,
          deviceCount: dem.deviceCount,
          knownLimitations: [
            ...rel.knownLimitations,
            `Số đếm lấy từ tập dữ liệu nghiên cứu (${dem.sampleCount} lượt / ` +
              `${dem.participantCount} người / ${dem.deviceCount} máy), KHÔNG phải từ bộ ` +
              `mẫu ảnh Phase 1D-3. Mức kiểm chứng và bậc bằng chứng vẫn giữ nguyên.`,
          ],
        }
      : rel;
  }
  return out;
}
