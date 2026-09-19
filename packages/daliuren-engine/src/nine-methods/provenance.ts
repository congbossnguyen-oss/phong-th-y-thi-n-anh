/**
 * Provenance cho 九宗門 (Algorithm Spec §7.2) — TÁCH RIÊNG theo từng pháp vì độ mạnh evidence
 * khác nhau rõ rệt (khác với 天地盤/四課, nơi 1 provenance chung là đủ vì "đồng thuận tuyệt
 * đối" cho toàn bộ công thức).
 */
import type { ProvenanceEntry } from "../interpretation/provenance.js";

const SOURCE_TITLE = "六壬大全 (欽定四庫全書本)";
const SOURCE_ID = "liu-ren-da-quan-siku";

export const ZEIKE_BIYONG_PROVENANCE: ProvenanceEntry = {
  id: "PROV-NINE-METHODS-ZEIKE-BIYONG",
  sourceId: SOURCE_ID,
  sourceTitle: SOURCE_TITLE,
  sourceLocation: "docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md §7.2 mục 1-2",
  sourceType: "classical-fact",
  confidence: "A",
  notes:
    "賊克法 (ưu tiên hạ khắc thượng '賊' hơn thượng khắc hạ '克 thường') + 比用法 (so âm dương " +
    "Chi trên của khóa với Can Ngày khi ≥2 khóa cùng loại khắc) — ĐỒNG THUẬN TUYỆT ĐỐI giữa " +
    "Algorithm Spec (đã tổng hợp cross-check A+B+C+F) và XÁC MINH ĐỘC LẬP THÊM (Phase 9B) qua " +
    "dò tay `d1210182010/daliuren-web-engine` (commit d5cb9a7, shipan.py `SanChuan.__贼克`/" +
    "`__比用`, dòng 500-541) — kể cả chi tiết '比用 so sánh CHI TRÊN (upper) của khóa, không " +
    "phải chi dưới' và 'khi 比用 vẫn 0 hoặc ≥2 kết quả → chuyển tiếp sang 涉害' đều khớp.",
};

export const SHEHAI_PROVENANCE: ProvenanceEntry = {
  id: "PROV-NINE-METHODS-SHEHAI-MAIN",
  sourceId: SOURCE_ID,
  sourceTitle: SOURCE_TITLE,
  sourceLocation: "docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md §7.2 mục 3; docs/daliuren/DA_LIU_REN_IMPLEMENTATION_GATE.md dòng 涉害",
  sourceType: "classical-fact",
  confidence: "B",
  notes:
    "⚠️ PARTIAL — CHỈ nhánh main count-based. Ý nghĩa luận đoán: B. CÔNG THỨC KỸ THUẬT: " +
    "CONFLICTING giữa 2 nguồn thứ cấp Phase 2 (2 khóa hay 3 khóa liên quan) — CHƯA đối chiếu " +
    "bản gốc quyển 5 (xem DA_LIU_REN_IMPLEMENTATION_GATE.md). Implementation này dùng ĐÚNG " +
    "công thức đếm 'độ sâu thiệp hại' + tie-break 孟/仲/季 + fallback Âm/Dương '復等卦' đã dò " +
    "tay TRỰC TIẾP từ `d1210182010/daliuren-web-engine` (commit d5cb9a7, shipan.py `__涉害`, " +
    "dòng 543-629) — đây là NGUỒN DUY NHẤT đã xác minh trực tiếp cho CHI TIẾT cơ chế đếm này " +
    "(bao gồm cả việc duyệt vòng Chi từ vị trí Địa Bàn hiện tại của khóa, cộng dồn khắc từ CHÍNH " +
    "Chi lẫn (các) Can ký thác tại đó) — KHÔNG cross-check được với repo B/C do repo B đã bị " +
    "Algorithm Spec §7.1 xác nhận dùng heuristic sai (không tin cậy cho pháp liên quan), và " +
    "repo C chưa được đọc trực tiếp ở vòng này. KHÔNG được nâng lên A cho tới khi có nguồn thứ " +
    "2 xác nhận công thức đếm CHI TIẾT (không chỉ cấu trúc cascade tổng quát).",
};

export const MAOXING_PROVENANCE: ProvenanceEntry = {
  id: "PROV-NINE-METHODS-MAOXING",
  sourceId: SOURCE_ID,
  sourceTitle: SOURCE_TITLE,
  sourceLocation: "docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md §7.2 mục 5",
  sourceType: "classical-fact",
  confidence: "A",
  notes:
    "Sơ truyền = Thiên Bàn tại cung Dậu — công thức tường minh, không tranh cãi. Trung/Mạt " +
    "truyền dùng ĐÚNG chuỗi tra Thiên Bàn chuẩn (§7.3, xem three-transmissions/provenance.ts) " +
    "theo ĐÚNG phạm vi đã khoá ở Phase 9B. ⚠️ GHI NHẬN (KHÔNG sửa): dò tay " +
    "`d1210182010/daliuren-web-engine` (shipan.py `__昂星`, dòng 674-694) cho thấy source này " +
    "dùng giá trị Trung/Mạt KHÁC (trực tiếp 支陽神/干陽神 theo Âm/Dương ngày, gắn tên 虎視卦/冬蛇" +
    "掩目) — KHÔNG theo chuỗi tra chuẩn. Đây là 1 phát hiện CHƯA GIẢI QUYẾT giữa Algorithm Spec " +
    "§7.3 (tuyên bố chuỗi tra là 'không tranh cãi giữa các nguồn') và implementation thực tế " +
    "này — cần 1 vòng đối chiếu riêng trước khi coi 虎視卦/冬蛇掩目 là đúng hay chuỗi chuẩn là " +
    "đúng. Package này ĐANG dùng chuỗi chuẩn theo đúng phạm vi đã khoá, KHÔNG tự ý đổi sang " +
    "giá trị của repo A. CẬP NHẬT (Phase 9B Remediation): 遙克 nay ĐÃ implement (xem " +
    "YAOKE_PROVENANCE) nên dispatcher CÓ THỂ phân biệt đúng khi nào 遙克 không áp dụng trước khi " +
    "thử 昴星 — hàm chọn 昴星 giờ được gọi TỪ dispatcher chính, không còn là hàm đứng riêng " +
    "'chưa wired' như ở checkpoint Phase 9B gốc.",
};

export const YAOKE_PROVENANCE: ProvenanceEntry = {
  id: "PROV-NINE-METHODS-YAOKE",
  sourceId: SOURCE_ID,
  sourceTitle: SOURCE_TITLE,
  sourceLocation: "docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md §7.2 mục 4 (điều kiện kích hoạt); công thức chọn giá trị KHÔNG có trong Algorithm Spec/report-1-sike-sanchuan.md/report-C/report-G (đã re-check trực tiếp, Phase 9B Remediation — 0 kết quả)",
  sourceType: "classical-fact",
  confidence: "B",
  notes:
    "⚠️ PARTIAL — NGUỒN DUY NHẤT cho công thức CHỌN GIÁ TRỊ cụ thể: dò tay VÀ CHẠY THẬT " +
    "`d1210182010/daliuren-web-engine` (commit d5cb9a7, shipan.py `__遥克`, dòng 634-672, Phase " +
    "9B Remediation). Công thức: (a) loại trừ 5 ngày 八專 (Algorithm Spec §7.2 mục 7, không " +
    "dùng danh sách thiếu của riêng repo A — xem nine-methods/table.ts BAZHUAN_DAYS); (b) xét " +
    "CHỈ Khóa 2/3/4 (KHÔNG xét Khóa 1 — hợp lý vì Khóa 1 đã được 賊克 loại trừ khắc nội tại với " +
    "chính Can Ngày rồi, xét lại sẽ trùng lặp): chữ TRÊN của khóa khắc Can Ngày trực tiếp; (c) " +
    "nếu rỗng, thử chiều ngược lại (Can Ngày khắc chữ TRÊN của khóa); (d) rỗng cả 2 chiều → " +
    "KHÔNG áp dụng được, dispatcher chuyển tiếp thử 昴星; (e) sau khử trùng theo `upper`, 1 kết " +
    "quả → dùng luôn (method='yaoke'); ≥2 kết quả → delegate sang 比用 (rồi có thể tới 涉害) " +
    "NHƯNG method HIỂN THỊ vẫn giữ 'yaoke' (đúng cách repo A tự gắn tag '遙克卦' TRƯỚC KHI " +
    "delegate, khác hành vi 返吟-delegate không tự gắn tag nào). KHÔNG cross-check được với " +
    "repo B/C cho CHI TIẾT công thức này (report-C chỉ xác nhận 遙克 'đứng đúng vị trí trong " +
    "cascade', KHÔNG mô tả công thức chọn giá trị). KHÔNG suy luận từ tên 蒿矢格/彈射格 — 2 tên " +
    "tiểu loại này KHÔNG được implement/gán ở đâu trong code (vẫn D, UNVERIFIED, xem " +
    "types/three-transmissions.ts YaoKeSubcase).",
};

export const FANYIN_WUQIN_PROVENANCE: ProvenanceEntry = {
  id: "PROV-NINE-METHODS-FANYIN-WUQIN",
  sourceId: SOURCE_ID,
  sourceTitle: SOURCE_TITLE,
  sourceLocation: "docs/daliuren/research/report-C-zhouyilab.md dòng 102 (commit message thật, paraphrase); d1210182010/daliuren-web-engine shipan.py __返呤 dòng 767-778 (code thật)",
  sourceType: "classical-fact",
  confidence: "B",
  notes:
    "返吟 khi Tứ Khóa HOÀN TOÀN vô khắc (賊克 rỗng) — Phase 9C: công thức = Sơ truyền=驛馬(Chi " +
    "Ngày); Trung truyền=支陽神 (=Khóa3.upper, KHÔNG PHẢI Khóa4.upper); Mạt truyền=干陽神 " +
    "(=Khóa1.upper) — KHÔNG qua `heavenPlateAt` (TYPE B). 2 NGUỒN ĐỘC LẬP KHỚP NHAU về CƠ CHẾ " +
    "(dù khác TÊN GỌI, đã ghi nhận từ Phase 9B): report-C paraphrase '無親卦：课中无贼克，取支" +
    "驿马发用，中传为支上神，末传为日上神' khớp CHÍNH XÁC với code thật của repo A (biến " +
    "`zhong = self.__四课.支阳神; mo = self.__四课.干阳神`), dù repo A tự gắn tên '無依卦' cho " +
    "CHÍNH nhánh này (không phải '無親卦') — XUNG ĐỘT TÊN GỌI, KHÔNG PHẢI xung đột công thức. " +
    "Package này KHÔNG gán tên cụ thể nào (無依卦/無親卦) vào `methodSubcase`, chỉ mô tả cơ chế " +
    "bằng tiếng Việt trung tính, tránh khẳng định 1 tên chưa thống nhất giữa nguồn.",
};

/** 伏吟's ACTIVATION detection only — công thức chọn Sơ/Trung/Mạt truyền CHƯA implement (xem nine-methods/errors.ts). 返吟's ACTIVATION + CẢ 2 nhánh (có khắc lẫn vô khắc) nay ĐÃ implement — xem ZEIKE_BIYONG_PROVENANCE (nhánh có khắc, delegate) và FANYIN_WUQIN_PROVENANCE (nhánh vô khắc). */
export const FUYIN_FANYIN_ACTIVATION_PROVENANCE: ProvenanceEntry = {
  id: "PROV-NINE-METHODS-FUYIN-FANYIN-ACTIVATION",
  sourceId: SOURCE_ID,
  sourceTitle: SOURCE_TITLE,
  sourceLocation: "docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md §7.1",
  sourceType: "classical-fact",
  confidence: "A",
  notes:
    "CHỈ áp dụng cho ĐIỀU KIỆN KÍCH HOẠT (伏吟: Thiên Bàn ≡ Địa Bàn toàn bộ; 返吟: mỗi vị trí " +
    "đối xung đúng 6 cung) — cả 2 là structural check toán học thuần túy, không tranh cãi. " +
    "KHÔNG bao gồm công thức chọn Sơ/Trung/Mạt truyền của 伏吟 (xem " +
    "NineMethodsErrorCode.INSUFFICIENT_EVIDENCE_FUYIN_SELECTION) hay nhánh vô khắc của 返吟 " +
    "(xem INSUFFICIENT_EVIDENCE_FANYIN_NO_KE). " +
    "RE-CHECK (Phase 9B Remediation, mục B): đọc lại trực tiếp `docs/daliuren/research/" +
    "report-C-zhouyilab.md` dòng 102 (trích nguyên văn commit message thật của repo C, " +
    "`banderzhm/ZhouYiLab`, commit 817ea77, hàm `fu_yin`) xác nhận rõ '1. 不虞卦：四课中有贼克 " +
    "2. 自任卦：日干为阳 3. 自信卦：日干为阴 4. 杜传：初传或中传为自刑神' — tức repo C phân " +
    "nhánh THEO CÓ/KHÔNG 賊克 trước, rồi mới xét Âm/Dương. Đối chiếu với `__伏呤` thật của repo A " +
    "(`d1210182010/daliuren-web-engine`, dò tay Phase 9B gốc) — repo A LUÔN dùng 1 chuỗi 刑 " +
    "(punishment) duy nhất, chia 2 nhánh CHỈ theo Âm/Dương Can Ngày, KHÔNG có nhánh 不虞卦 " +
    "riêng theo có/không 賊克. Đây là XUNG ĐỘT CẤU TRÚC THẬT giữa 2 nguồn ĐỘC LẬP THẬT (không " +
    "cùng dòng code), KHÔNG PHẢI chỉ khác tên gọi — xác nhận KHÔNG THỂ resolve bằng cách chọn " +
    "nguồn nào 'giống nhiều repo hơn' (chỉ có đúng 2 nguồn, không đối xứng để bình chọn). Giữ " +
    "nguyên INSUFFICIENT_EVIDENCE_FUYIN_SELECTION.",
};

export const BIEZE_PROVENANCE: ProvenanceEntry = {
  id: "PROV-NINE-METHODS-BIEZE",
  sourceId: SOURCE_ID,
  sourceTitle: SOURCE_TITLE,
  sourceLocation: "docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md §7.2 mục 6 (điều kiện kích hoạt); công thức chọn giá trị KHÔNG có trong Algorithm Spec/report-1/report-G",
  sourceType: "classical-fact",
  confidence: "B",
  notes:
    "Activation (Tứ Khóa dedup còn đúng 3 giá trị `upper`): CONFIDENCE A — 'A/C/F implement " +
    "điều kiện' (DA_LIU_REN_ALGORITHM_AUDIT.md dòng 40). CÔNG THỨC CHỌN GIÁ TRỊ: ⚠️ PARTIAL, " +
    "SINGLE-SOURCE — dò tay + chạy thật `d1210182010/daliuren-web-engine` (shipan.py `__别责`, " +
    "dòng 696-714, Phase 9C): Ngày Dương → Sơ truyền = heavenPlateAt(寄宮(Can Ngày+5 vị trí " +
    "trong vòng 10 Can)); Ngày Âm → Sơ truyền = Chi Ngày+4 vị trí (dịch CHI TRỰC TIẾP, KHÔNG " +
    "qua tra Thiên Bàn); Trung truyền = 干陽神 (=Khóa1.upper) CỐ ĐỊNH, không phân Âm/Dương; " +
    "**Mạt truyền = CHÍNH Trung truyền (không qua `heavenPlateAt` lần 2)** — VI PHẠM giả định " +
    "'chuỗi tra chuẩn 2 lần' của §7.3, xem three-transmissions/provenance.ts. Phase 9C FINAL " +
    "EVIDENCE CHECK (đọc lại report-C-zhouyilab.md + report-F-legacy-python.md): report-C chỉ " +
    "xác nhận 別責 (`别责法`bie_ze) TỒN TẠI và ĐÚNG VỊ TRÍ trong cascade, KHÔNG cho công thức " +
    "chọn giá trị. report-F CHIA SẺ CHUNG dòng code gốc với repo A (đã xác lập quy ước A/F=1 " +
    "nguồn từ Phase 5B-2, KHÔNG tính là nguồn độc lập thứ 2) — và tự ghi nhận 'No commit " +
    "history — never independently re-audited'. KHÔNG TÌM ĐƯỢC nguồn thứ 2 thật sự độc lập cho " +
    "công thức này — CHẤP NHẬN B/PARTIAL theo đúng tiêu chuẩn đã áp dụng cho 涉害/遙克, KHÔNG " +
    "coi là blocker (theo quyết định rõ ràng của chủ dự án, Phase 9C).",
};

export const BAZHUAN_SELECTION_PROVENANCE: ProvenanceEntry = {
  id: "PROV-NINE-METHODS-BAZHUAN-SELECTION",
  sourceId: SOURCE_ID,
  sourceTitle: SOURCE_TITLE,
  sourceLocation: "docs/daliuren/DA_LIU_REN_ALGORITHM_SPEC.md §7.2 mục 7 (5 ngày + điều kiện kích hoạt, confidence A — đã dùng từ Phase 9B Remediation cho BAZHUAN_DAYS); công thức chọn giá trị KHÔNG có trong Algorithm Spec/report-1/report-G",
  sourceType: "classical-fact",
  confidence: "B",
  notes:
    "Activation (5 ngày cố định + đến lượt trong cascade): CONFIDENCE A — 'A/C/F implement " +
    "điều kiện' (DA_LIU_REN_ALGORITHM_AUDIT.md dòng 39). CÔNG THỨC CHỌN GIÁ TRỊ: ⚠️ PARTIAL, " +
    "SINGLE-SOURCE — dò tay + chạy thật `d1210182010/daliuren-web-engine` (shipan.py `__八专`, " +
    "dòng 716-726, Phase 9C): Ngày Dương → Sơ truyền = Khóa1.upper (干陽神) DỊCH +2 vị trí Chi " +
    "TRỰC TIẾP (KHÔNG qua tra Thiên Bàn); Ngày Âm → Sơ truyền = Khóa4.upper (支陰神) DỊCH −2 vị " +
    "trí Chi trực tiếp; **Trung truyền = Mạt truyền = Khóa1.upper (干陽神) CỐ ĐỊNH**, không qua " +
    "`heavenPlateAt`. 'Anchor thuận/nghịch' KHÔNG PHẢI 1 cung cố định — là chính giá trị " +
    "Khóa1.upper/Khóa4.upper CỘNG/TRỪ trực tiếp 2 vị trí Chi (đã xác định bằng đọc code thật, " +
    "KHÔNG suy luận từ tên gọi '罡/柔'). Phase 9C FINAL EVIDENCE CHECK: cùng kết luận như 別責 " +
    "ở trên — report-C chỉ xác nhận tồn tại+vị trí cascade, report-F cùng dòng A (không tính " +
    "nguồn độc lập thứ 2) — CHẤP NHẬN B/PARTIAL, không coi là blocker.",
};
