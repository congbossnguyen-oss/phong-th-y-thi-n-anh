/**
 * Provenance backing riêng cho các quyết định CalculationProfile (KHÔNG PHẢI Rule Registry đầy
 * đủ — đó là việc của Calendar Layer/Interpretation Engine sau này). Trích nguồn từ
 * docs/daliuren/DA_LIU_REN_PROFILE_DECISIONS.md và docs/daliuren/research/phase4/.
 */
import type { ProvenanceEntry } from "../interpretation/provenance.js";

export const ZI_HOUR_POLICY_PROVENANCE: ProvenanceEntry = {
  id: "PROV-PROFILE-ZIHOUR-CONFLICTING",
  sourceId: "phase4-early-late-zi-research",
  sourceTitle: "Phase 4 Nghiên cứu 早子/晚子時 cho Đại Lục Nhâm",
  sourceType: "unverified-claim",
  confidence: "D",
  notes:
    "CONFLICTING METHODS xác nhận qua đọc trực tiếp source code 3 phần mềm khác nhau " +
    "(wlhyl->F->A: shift cả 2 nửa; liuren-ts-lib/tyme4ts: shift 1 nửa; tyme4ts LunarSect2: " +
    "không shift). 六壬大全 12 quyển KHÔNG bàn vấn đề này. KHÔNG có nguồn Lục Nhâm nào xác " +
    "định chuẩn — xem docs/daliuren/research/phase4/report-A-earlylatezi.md.",
};

export const DAY_NIGHT_BOUNDARY_PROVENANCE: ProvenanceEntry = {
  id: "PROV-PROFILE-DAYNIGHT-LIURENDAQUAN",
  sourceId: "liu-ren-da-quan-siku",
  sourceTitle: "六壬大全 (欽定四庫全書本)",
  sourceLocation: "卷一 貴神",
  sourceType: "classical-fact",
  quote: "此貴神晝順行夜逆行，不坐辰戌牢獄之地...如晝貴甲從子起，為諸干之首...故晝寄丑宮，夜寄未宮",
  url: "https://zh.wikisource.org/wiki/六壬大全_(四庫全書本)/卷01",
  confidence: "B",
  notes:
    "Ranh giới Mão-Dậu theo chi giờ chiêm là MỘT cơ chế duy nhất chi phối cả chọn nhánh Quý " +
    "Nhân lẫn hướng thuận/nghịch 12 Thiên Tướng — xem docs/daliuren/DA_LIU_REN_PROFILE_DECISIONS.md Phần C.",
};

export const GUIREN_TRADITIONAL_TABLE_PROVENANCE: ProvenanceEntry = {
  id: "PROV-PROFILE-GUIREN-TRADITIONAL",
  sourceId: "liu-ren-duan-an-zhi-nan",
  sourceTitle: "六壬斷案 / 大六壬指南 (陳公獻)",
  sourceType: "modern-interpretation",
  confidence: "C",
  notes:
    "Bảng 'phái truyền thống' (甲戊庚牛羊...) — đa số tác giả Lục Nhâm có tên tuổi qua các đời " +
    "(戴洋, 邵彥和, 陳公獻) dùng bảng này. Tranh cãi thật với phái Quách Phác/Khang Hy là về " +
    "BẢNG ÁNH XẠ, KHÔNG PHẢI về ranh giới ngày/đêm — xem report-C-nightday.md.",
};

export const PROFILE_PROVENANCE_SEED: readonly ProvenanceEntry[] = [
  ZI_HOUR_POLICY_PROVENANCE,
  DAY_NIGHT_BOUNDARY_PROVENANCE,
  GUIREN_TRADITIONAL_TABLE_PROVENANCE,
];
