/**
 * Provenance cho 本命 (BenMing) / 行年 (XingNian) — PHẢI phân biệt đúng 3 tầng, theo
 * docs/daliuren/decisions/DA_LIU_REN_BENMING_XINGNIAN_CONVENTION_DECISION.md mục 7:
 *
 *  - CLASSICAL FACT (`sourceType: "classical-fact"`): khái niệm 本命/行年 + công thức 丙寅/壬申 —
 *    ĐÃ xác nhận qua Round 1+Round 2 research (fetch trực tiếp 《六壬管辂神書》/《六壙神定經》 qua
 *    daizhige.org, không chỉ qua aggregator).
 *  - PROJECT CONVENTION (`sourceType: "implementation-detail"`, confidence KHÔNG BAO GIỜ "A"):
 *    BIRTH_YEAR_CONVENTION=LICHUN, AGE_CONVENTION=XUSUI — quyết định CHỦ ĐỘNG của owner, KHÔNG
 *    PHẢI cổ pháp đã chứng minh (Round 2 KHÔNG tìm thấy cổ văn Đại Lục Nhâm trực tiếp quy định
 *    ranh giới năm cho 本命, KHÔNG tìm thấy định nghĩa tường minh "一歲"=虛歲).
 *
 * KHÔNG được nâng bất kỳ entry PROJECT CONVENTION nào lên confidence A dù implementation chạy
 * đúng — Confidence phản ánh BẰNG CHỨNG CỔ VĂN, không phản ánh việc code chạy đúng.
 */
import type { ProvenanceEntry } from "../interpretation/provenance.js";

/** CLASSICAL FACT — 本命 = Chi năm sinh, khái niệm CỐ ĐỊNH cả đời (khác 行年, thay đổi theo năm chiêm). */
export const BEN_MING_CONCEPT_PROVENANCE: ProvenanceEntry = {
  id: "PROV-BEN-MING-CONCEPT",
  sourceId: "liu-ren-guan-lu-shen-shu",
  sourceTitle: "《大六壬管辂神書》",
  sourceLocation: "論行年本命 — xác nhận qua 2 đường độc lập (guoxuedashi.net Round 1 + fetch trực tiếp daizhige.org Round 2)",
  sourceType: "classical-fact",
  quote: "命者，占人之命也，就終身而言也。年，占人之年也，就行年而言也。",
  confidence: "A",
  notes:
    "CLASSICAL FACT — xác nhận SỰ TỒN TẠI + PHÂN BIỆT khái niệm 本命 (命, tính cả đời) vs 行年 " +
    "(年, thay đổi theo năm chiêm). 本命 = Chi năm sinh + Thiên Tướng đóng tại đó (định nghĩa vận " +
    "hành, xem 《六壙尋源》 \"本命定例\": 本命者即天盤上字...其地盤上子位亥位，須參看，定其吉凶 — " +
    "NGOÀI PHẠM VI module tính toán này, thuộc Tầng 2/Interpretation). Câu này KHÔNG nói bất kỳ " +
    "điều gì về ranh giới năm sinh (xem PROV-BEN-MING-YEAR-BOUNDARY-CONVENTION riêng).",
};

/** PROJECT CONVENTION — birthDate → Y đổi tại Lập Xuân. KHÔNG PHẢI cổ pháp đã chứng minh. */
export const BEN_MING_YEAR_BOUNDARY_CONVENTION_PROVENANCE: ProvenanceEntry = {
  id: "PROV-BEN-MING-YEAR-BOUNDARY-CONVENTION",
  sourceId: "cong-taiyi-project-convention",
  sourceTitle: "CONG TAIYI PROJECT CONVENTION — BIRTH_YEAR_CONVENTION = LICHUN",
  sourceLocation: "docs/daliuren/decisions/DA_LIU_REN_BENMING_XINGNIAN_CONVENTION_DECISION.md mục 4.1",
  sourceType: "implementation-detail",
  confidence: "D",
  notes:
    "PROJECT CONVENTION của CONG TAIYI, KHÔNG PHẢI cổ pháp đã được chứng minh. Round 1+Round 2 " +
    "research (docs/daliuren/research/DA_LIU_REN_BENMING_XINGNIAN_SOURCE_RESEARCH.md) — đã fetch " +
    "trực tiếp 《六壬大全》/《六壙尋源》/《六壙管辂神書》 (daizhige.org, KHÔNG qua aggregator) và " +
    "KHÔNG tìm thấy bất kỳ câu cổ văn Đại Lục Nhâm nào trực tiếp quy định ranh giới năm cho " +
    "birthDate→本命 (Lập Xuân, 正月初一, hay ranh giới khác). 《六壙尋源》 tự nhận xét vắng mặt này. " +
    "Owner CHỌN Lập Xuân vì nhất quán kỹ thuật với quy ước Can-Chi năm tổng quát đã dùng nơi khác " +
    "trong hệ thống (Tứ Trụ/Bát Tự, `getGanzhiYear` mặc định `yearBoundary:\"lichXuan\"`) — CHẤP " +
    "NHẬN RỦI RO đã ghi trong Decision Record, KHÔNG PHẢI kết luận cổ văn. " +
    "KHÔNG được ghi confidence cao hơn D cho entry này dù implementation chạy đúng.",
};

/** CLASSICAL FACT — công thức 行年 Nam丙寅順/Nữ壬申逆, nguyên văn đầy đủ. */
export const XING_NIAN_FORMULA_PROVENANCE: ProvenanceEntry = {
  id: "PROV-XING-NIAN-FORMULA",
  sourceId: "ling-xia-jing-via-liu-ren-shen-ding-jing",
  sourceTitle: "《靈轄經》(dẫn trong 《六壙神定經》§35 釋行年)",
  sourceLocation: "§35 — xác nhận 2 đường độc lập: ctext.org (đọc trực tiếp, phase trước) + fetch trực tiếp daizhige.org (Round 2)",
  sourceType: "classical-fact",
  quote:
    "男一歲從丙寅順行，從一歲移一辰，十一歲丙子，二十一歲丙戌。余皆仿此。終而複始，順行而數。" +
    "女一歲，從壬申逆行，一歲移一辰，一歲壬申，十一歲壬午。余皆仿此。終而複始，逆行而數。",
  confidence: "A",
  notes:
    "CLASSICAL FACT cho SỰ TỒN TẠI công thức: Nam khởi 丙寅 (Bính Dần) tuổi 1, đếm THUẬN theo tuổi " +
    "(mỗi tuổi Can+1 VÀ Chi+1); Nữ khởi 壬申 (Nhâm Thân) tuổi 1, đếm NGHỊCH theo tuổi (mỗi tuổi " +
    "Can-1 VÀ Chi-1) — implementation dùng mô hình ĐỐI XỨNG này (Nữ = ngược dấu chính xác so với " +
    "Nam), khớp cách MỌI tài liệu trong dự án (Round 1+2) mô tả \"Nữ nghịch\" là hướng NGƯỢC LẠI " +
    "Nam, và tự-nhất-quán về mặt toán học (đã kiểm chứng đủ 60 bước, quay vòng đúng \"終而複始\"). " +
    "⚠️ GHI NHẬN MÂU THUẪN CHƯA GIẢI QUYẾT (phát hiện khi implement, KHÔNG tự ý sửa quote hay âm " +
    "thầm bỏ qua): mô hình đối xứng trên tái tạo ĐÚNG '男十一歲丙子'/'男二十一歲丙戌' (kiểm chứng " +
    "trực tiếp bằng phép tính) NHƯNG cho '女十一歲' = 壬戌 (Nhâm Tuất), KHÔNG khớp '女十一歲壬午' " +
    "(Nhâm Ngọ) trích trong chính câu quote ở trên. Đã thử các mô hình thay thế (xem test file, " +
    "hàm computeXingNian jsdoc) — KHÔNG mô hình nhất quán/đơn giản nào tái tạo được ĐỒNG THỜI toàn " +
    "bộ mốc đã trích. Có thể là lỗi transcription khi fetch (không có bản scan để đối chiếu trực " +
    "tiếp) hoặc 1 quy tắc phức tạp hơn chưa được hiểu đúng. Implementation này CHỌN mô hình đối " +
    "xứng (nhất quán toán học, kiểm chứng được) — KHÔNG khẳng định đây là cách đọc DUY NHẤT đúng " +
    "của cổ văn cho phần Nữ. Xem docs/daliuren/research/DA_LIU_REN_BENMING_XINGNIAN_SOURCE_RESEARCH.md " +
    "Round 2 mục E/F để biết đầy đủ bối cảnh.",
};

/** PROJECT CONVENTION — "一歲" = 虛歲 (tuổi mụ). KHÔNG PHẢI cổ pháp đã chứng minh định nghĩa này. */
export const XING_NIAN_AGE_CONVENTION_PROVENANCE: ProvenanceEntry = {
  id: "PROV-XING-NIAN-AGE-CONVENTION",
  sourceId: "cong-taiyi-project-convention",
  sourceTitle: "CONG TAIYI PROJECT CONVENTION — AGE_CONVENTION = XUSUI",
  sourceLocation: "docs/daliuren/decisions/DA_LIU_REN_BENMING_XINGNIAN_CONVENTION_DECISION.md mục 4.2",
  sourceType: "implementation-detail",
  confidence: "D",
  notes:
    "PROJECT CONVENTION của CONG TAIYI, KHÔNG PHẢI cổ pháp đã được chứng minh về mặt ĐỊNH NGHĨA. " +
    "Cổ nguồn (PROV-XING-NIAN-FORMULA) xác nhận TỒN TẠI khái niệm \"一歲\" và công thức 丙寅/壬申 " +
    "gắn với nó, nhưng KHÔNG có câu nào (kể cả sau khi đọc nguyên văn đầy đủ, không cắt) định " +
    "nghĩa \"一歲\" = 虛歲 — \"一歲\" trong nguyên văn CHỈ đóng vai trò nhãn thứ tự (ordinal) của " +
    "bước đầu chu kỳ đếm. Việc chọn 虛歲 (tính cả năm sinh là 1 tuổi) là SUY LUẬN KỸ THUẬT (khởi " +
    "tại tuổi 1 = năm sinh, hệ cổ không phân biệt \"thực tuổi\") mà owner CHỐT làm convention " +
    "chính thức — KHÔNG được ghi confidence cao hơn D cho entry này dù implementation chạy đúng.",
};
