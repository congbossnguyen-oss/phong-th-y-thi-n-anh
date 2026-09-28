/**
 * Cổng MẪU NGHIÊN CỨU (Phase 1D-3B).
 *
 * Một lượt quét chạy trót lọt KHÔNG đồng nghĩa với một mẫu nghiên cứu. Mẫu nghiên cứu
 * phải truy ngược được trọn chuỗi:
 *
 *     Người  →  Lượt  →  Máy  →  Phiên  →  Feature JSON
 *
 * Đứt một mắt là không so sánh được với mẫu khác, nên không được nằm trong sổ kiểm
 * chứng. Phiên đứt vẫn giữ nguyên — nó vẫn có ích để soi lỗi — chỉ là không được tính.
 *
 * ⚠️ CỔNG NÀY KHÔNG NÂNG BẤT CỨ TRẠNG THÁI NÀO. Nó không đụng tới `measurementStatus`,
 * `validationStatus` hay `evidenceLevel`. Nó chỉ trả lời đúng một câu: lượt quét này có
 * đủ giấy tờ để được ĐEM ĐI ĐẾM hay không. Việc đếm, và việc nâng, là của
 * `measurement-contract/`.
 */

import { deviceIsIdentified, type DeviceInfo } from "./device";
import type { SampleLabel } from "./sample";

export const RESEARCH_GATE_VERSION = "physiognomy-research-sample-v1" as const;

export type ResearchGapCode =
  | "no_sample_label"
  | "no_device_info"
  | "device_not_identified"
  | "not_complete"
  | "no_capture_timestamp"
  | "no_feature_profile";

const GIAI_THICH: Record<ResearchGapCode, string> = {
  no_sample_label: "Chưa gắn nhãn người/lượt — không biết đây là mẫu của ai, lần thứ mấy.",
  no_device_info: "Điện thoại chưa khai máy — không biết đo bằng thiết bị nào.",
  device_not_identified: "Máy khai nhưng không nhận ra hệ điều hành/trình duyệt.",
  not_complete: "Phiên chưa hoàn tất.",
  no_capture_timestamp: "Thiếu mốc thời gian hoàn tất.",
  no_feature_profile: "Không có Feature JSON — không có gì để đo.",
};

/** Đúng những gì cổng cần thấy. Cố ý KHÔNG nhận cả `SessionRecord`: cổng không được
 * phép nhìn thấy `writeToken` hay ảnh chụp, và hẹp thế này thì test dựng đầu vào dễ. */
export interface ResearchCandidate {
  sessionId: string;
  status: string;
  completedAt: number | null;
  sample: SampleLabel | null | undefined;
  device: DeviceInfo | null | undefined;
  hasFeatureProfile: boolean;
}

export interface ResearchVerdict {
  gateVersion: typeof RESEARCH_GATE_VERSION;
  valid: boolean;
  /** Rỗng khi hợp lệ. Luôn liệt kê ĐỦ, không dừng ở thiếu sót đầu tiên. */
  gaps: ResearchGapCode[];
  explanation: string;
  /** Chuỗi truy ngược, chỉ có khi hợp lệ. */
  provenance: {
    participantId: string;
    runNumber: number;
    sampleId: string;
    device: DeviceInfo;
    sessionId: string;
    capturedAt: number;
  } | null;
}

/**
 * Lượt quét này có phải MẪU NGHIÊN CỨU HỢP LỆ không.
 *
 * `deviceLabel` do người vận hành gõ KHÔNG được tính là khai báo máy: người gõ ngồi ở
 * máy tính, máy quét là điện thoại. Chỉ `device` — do chính điện thoại khai lúc kết
 * nối — mới đóng được mắt xích "Máy".
 */
export function evaluateResearchSample(c: ResearchCandidate): ResearchVerdict {
  const gaps: ResearchGapCode[] = [];

  if (!c.sample) gaps.push("no_sample_label");
  if (!c.device) gaps.push("no_device_info");
  else if (!deviceIsIdentified(c.device)) gaps.push("device_not_identified");
  if (c.status !== "complete") gaps.push("not_complete");
  if (typeof c.completedAt !== "number") gaps.push("no_capture_timestamp");
  if (!c.hasFeatureProfile) gaps.push("no_feature_profile");

  const valid = gaps.length === 0;
  return {
    gateVersion: RESEARCH_GATE_VERSION,
    valid,
    gaps,
    explanation: valid
      ? "Đủ provenance: người → lượt → máy → phiên → feature."
      : gaps.map((g) => GIAI_THICH[g]).join(" "),
    provenance:
      valid && c.sample && c.device && typeof c.completedAt === "number"
        ? {
            participantId: c.sample.participantId,
            runNumber: c.sample.runNumber,
            sampleId: c.sample.sampleId,
            device: c.device,
            sessionId: c.sessionId,
            capturedAt: c.completedAt,
          }
        : null,
  };
}
