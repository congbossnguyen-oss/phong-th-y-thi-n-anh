/**
 * 'classical-v1' — profile DUY NHẤT ở Checkpoint 1 (docs/daliuren/DA_LIU_REN_ARCHITECTURE.md §4).
 * KHÔNG hard-code giả định "no-shift = chuẩn" — `ziHourDayBoundary.evidenceStatus` PHẢI đúng
 * `'DEFAULT_PENDING_CONSENSUS'` theo yêu cầu tường minh của Phase 5A mục 3.
 */
import type { CalculationProfile } from "./types.js";
import {
  DAY_NIGHT_BOUNDARY_PROVENANCE,
  GUIREN_TRADITIONAL_TABLE_PROVENANCE,
  ZI_HOUR_POLICY_PROVENANCE,
} from "./provenance-seed.js";

export const CLASSICAL_V1_PROFILE: CalculationProfile = {
  profileId: "classical-v1",
  profileName: "Cổ điển v1 (mặc định)",
  version: "0.1.0",
  description:
    "Profile mặc định của Đại Lục Nhâm — mọi quyết định chọn theo mức khớp nguồn cổ điển đã " +
    "audit qua 4 vòng nghiên cứu (Phase 1-4), KHÔNG theo 1 trường phái hiện đại riêng biệt. " +
    "Xem docs/daliuren/DA_LIU_REN_IMPLEMENTATION_GATE.md.",
  ziHourDayBoundary: {
    value: "no-shift",
    // ⚠️ BẮT BUỘC — Phase 4 xác nhận CONFLICTING METHODS, "no-shift" chỉ là lựa chọn AN TOÀN
    // (khớp sẵn hành vi calendar-core hiện tại), KHÔNG PHẢI kết luận học thuật.
    evidenceStatus: "DEFAULT_PENDING_CONSENSUS",
    confidence: "D",
    provenanceIds: [ZI_HOUR_POLICY_PROVENANCE.id],
    notes: "Không tự tuyên bố method nào là classical consensus — xem Phase 5A mục 3.",
  },
  dayNightBoundary: {
    value: "occasion-hour-chi",
    evidenceStatus: "CLASSICAL_SOURCED",
    confidence: "B",
    provenanceIds: [DAY_NIGHT_BOUNDARY_PROVENANCE.id],
  },
  guiRenMappingTable: {
    value: "traditional",
    evidenceStatus: "DISPUTED_TABLE",
    confidence: "C",
    provenanceIds: [GUIREN_TRADITIONAL_TABLE_PROVENANCE.id],
    notes: "Tranh cãi thật với phái Quách Phác/Khang Hy — về bảng, không phải ranh giới ngày/đêm.",
  },
};
