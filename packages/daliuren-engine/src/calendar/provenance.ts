/**
 * Provenance cho phép dựng CƠ BẢN 4 trụ Can Chi (chu kỳ 60, mốc Giáp Tý) — Phase 10.5A đóng gap
 * "calendar không có provenance riêng" (Phase 10.5 Audit #1: KHÔNG được suy ra bằng "Four
 * Lessons=A nên calendar=A", đó là bắc cầu sai). Entry này CHỈ bao phủ thuật toán 60-Can-Chi CƠ
 * BẢN — KHÔNG bao phủ ranh giới ngày Tý sớm/muộn (xem `profiles/provenance-seed.ts`
 * `ZI_HOUR_POLICY_PROVENANCE`, confidence D, tách riêng, áp dụng CÓ ĐIỀU KIỆN — xem
 * `interpretation/calendar-dependency-provenance.ts`).
 */
import type { ProvenanceEntry } from "../interpretation/provenance.js";

export const GANZHI_PILLAR_CONSTRUCTION_PROVENANCE: ProvenanceEntry = {
  id: "PROV-GANZHI-PILLAR-CONSTRUCTION",
  sourceId: "chinese-sexagenary-calendar-convention",
  sourceTitle: "Chu kỳ Can Chi 60 (Giáp Tý) cho Năm/Tháng/Ngày/Giờ — quy ước lịch pháp Trung Hoa phổ quát",
  sourceLocation:
    "docs/daliuren/DA_LIU_REN_VALIDATION_REVIEW.md §3.1 'Can Chi' (mục 1-3); triển khai qua packages/calendar-core/src/calendar/ganzhi.ts",
  sourceType: "classical-fact",
  confidence: "B",
  notes:
    "Bản thân chu kỳ 60 Can Chi (mốc Giáp Tý) là quy ước lịch pháp phổ quát, không tranh cãi " +
    "giữa các trường phái (khác tính chất tranh cãi của ziHourDayBoundary hay guiRenMappingTable). " +
    "TUY NHIÊN: dự án CHƯA TỪNG cross-check độc lập output của `calendar-core` với 1 " +
    "nguồn/implementation thứ 2 đáng tin cậy nào (DA_LIU_REN_VALIDATION_REVIEW.md §3.1 mục 4: " +
    "'Số implementation độc lập: 1') — đây là lý do KHÔNG chấm A dù bản thân thuật toán được xem " +
    "là không thể tranh cãi (Phase 10.5A). Phạm vi entry này CHỈ bao phủ cơ chế xây dựng CƠ BẢN " +
    "(chu kỳ 60 + 12 chi giờ) — KHÔNG bao phủ ranh giới ngày Tý sớm/muộn. KHÔNG dùng entry này để " +
    "suy ra confidence cho field Calculation Layer khác qua quan hệ phụ thuộc.",
};
