import type { ProvenanceEntry } from "../interpretation/provenance.js";

export const YI_MA_PROVENANCE: ProvenanceEntry = {
  id: "PROV-YI-MA-POSITION",
  sourceId: "liu-ren-da-quan-siku",
  sourceTitle: "六壬大全 (欽定四庫全書本)",
  sourceLocation: "docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md §10 (chỉ phần VỊ TRÍ — phần Ý NGHĨA luận giải KHÔNG thuộc phạm vi module này)",
  sourceType: "classical-fact",
  confidence: "B",
  notes:
    "2 nguồn độc lập thật xác nhận công thức vị trí: (a) commit bug-fix `98f47f9` của repo C " +
    "(`banderzhm/ZhouYiLab`); (b) hàm LIVE (đã xác nhận lại Phase 9C, KHÔNG PHẢI dead code) " +
    "trong `d1210182010/daliuren-web-engine` shipan.py `SanChuan.__返呤` dòng 767-774 — dùng " +
    "trực tiếp trong nhánh 返吟-vô-賊克 của repo A, kết quả khớp CHÍNH XÁC bảng Algorithm Spec " +
    "§10. KHÔNG bao gồm bất kỳ quy tắc luận giải nào (vd '驛馬 gặp Không Vong') — CHỈ vị trí.",
};
