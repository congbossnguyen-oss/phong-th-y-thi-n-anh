/**
 * CalculationProfile — theo docs/daliuren/DA_LIU_REN_PROFILE_DECISIONS.md + Phase 5A mục 3.
 *
 * THIẾT KẾ QUAN TRỌNG: mỗi quyết định (`ziHourDayBoundary`, `dayNightBoundary`,
 * `guiRenMappingTable`) mang `evidenceStatus` RIÊNG thay vì 1 field `evidence_status` chung
 * cho cả profile — vì các quyết định này có độ mạnh bằng chứng RẤT KHÁC NHAU (早子/晚子時 vẫn
 * CONFLICTING METHODS trong khi 晝夜 boundary đã READY/B sau Phase 4). Một field chung sẽ ĐÁNH
 * ĐỒNG 1 quyết định vững chắc với 1 quyết định chưa có đồng thuận — đúng loại sai lầm Phase 4
 * yêu cầu tránh ("KHÔNG tự tuyên bố method nào là classical consensus").
 */
import type { Confidence } from "../interpretation/confidence.js";
import type { GuiRenMappingTableId } from "../types/noble-spirit.js";

export type EvidenceStatus =
  /** Nguồn cổ trực tiếp, không tranh cãi giữa các nguồn đã audit (vd Thiên/Địa Bàn). */
  | "CLASSICAL_CONSENSUS"
  /** Có nguồn cổ điển xác nhận cơ chế, CONFIDENCE B trở lên nhưng chưa phải "tuyệt đối không tranh cãi". */
  | "CLASSICAL_SOURCED"
  /**
   * CONFLICTING METHODS đã xác nhận qua nghiên cứu (Phase 4) — KHÔNG có nguồn Lục Nhâm nào
   * xác định "chuẩn". Giá trị `value` hiện tại chỉ là 1 lựa chọn AN TOÀN (ít giả định nhất),
   * KHÔNG PHẢI kết luận học thuật. Bắt buộc dùng đúng nhãn này cho 早子/晚子時 (Phase 5A mục 3).
   */
  | "DEFAULT_PENDING_CONSENSUS"
  /** Cơ chế đúng/không tranh cãi, nhưng 1 chi tiết/bảng tra cụ thể còn tranh cãi giữa các phái. */
  | "DISPUTED_TABLE"
  /** Chỉ có 1 nguồn yếu, chưa kiểm chứng độc lập — dự phòng cho quyết định tương lai. */
  | "UNVERIFIED_SINGLE_SOURCE";

/** 1 quyết định cụ thể trong profile, luôn đi kèm bằng chứng — không có quyết định "trần trụi" nào không rõ evidence status. */
export interface ProfileDecision<TValue extends string> {
  value: TValue;
  evidenceStatus: EvidenceStatus;
  /** confidence tổng quát của quyết định này — KHÔNG PHẢI xác suất, xem confidence.ts. */
  confidence: Confidence;
  /** → ProvenanceEntry.id — có thể rỗng nếu evidenceStatus === 'DEFAULT_PENDING_CONSENSUS' và chưa có nguồn nào thắng. */
  provenanceIds: readonly string[];
  notes?: string;
}

/**
 * 3 phương án đã xác nhận qua đọc trực tiếp source code (Phase 4 Phần A) — KHÔNG phương án
 * nào truy được về 1 nguồn Lục Nhâm cụ thể. `no-shift` là default vì khớp sẵn hành vi
 * `calendar-core` hiện tại (`GanzhiHourOptions.useLateZiConvention` mặc định `false`), KHÔNG
 * PHẢI vì nó "đúng" — xem cảnh báo `evidenceStatus` ở trên.
 */
export type ZiHourDayBoundaryPolicy = "no-shift" | "shift-both-halves" | "shift-late-half-only";

/** Chỉ 1 phương pháp đủ nguồn — không có "alternative" thật sự cho CÙNG câu hỏi (Phase 4 Phần C). */
export type DayNightBoundaryMethod = "occasion-hour-chi";

export interface CalculationProfile {
  profileId: string;
  profileName: string;
  version: string;
  description: string;
  ziHourDayBoundary: ProfileDecision<ZiHourDayBoundaryPolicy>;
  dayNightBoundary: ProfileDecision<DayNightBoundaryMethod>;
  guiRenMappingTable: ProfileDecision<GuiRenMappingTableId>;
}
