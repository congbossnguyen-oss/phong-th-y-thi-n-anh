/**
 * Provenance CỔ ĐIỂN cho R-HONNHAN-01 — 畢法賦 pháp 40「后合占婚岂用媒」, 卷九, bổ sung 六壬大全
 * 卷三 cho quy ước 天后=vợ/nữ, 青龍/Can=chồng/nam. Đã audit trực tiếp ở
 * docs/daliuren/DA_LIU_REN_PHASE_11B_INTERPRETATION_IMPLEMENTATION_CONTRACT.md mục B — entry
 * này CHỈ hiện thực hoá NGUYÊN VĂN đã có sẵn, KHÔNG thêm bằng chứng mới.
 *
 * Đây là provenance CỦA RULE (bằng chứng cổ điển của chính lời khuyên luận đoán) — KHÁC
 * provenance CỦA CALCULATION LAYER (`FOUR_LESSONS_PROVENANCE`, `TWELVE_GENERALS_*_PROVENANCE`)
 * mà evaluator.ts tham chiếu riêng qua `Signal.calculationProvenanceIds`.
 */
import type { ProvenanceEntry } from "../../interpretation/provenance.js";

export const HONNHAN_01_PROVENANCE: ProvenanceEntry = {
  id: "PROV-HONNHAN-01",
  ruleId: "R-HONNHAN-01",
  sourceId: "liu-ren-da-quan-siku",
  sourceTitle: "六壬大全 (欽定四庫全書本)",
  sourceLocation: "卷九, 畢法賦 pháp 40「后合占婚岂用媒」; bổ sung 卷三 cho quy ước Thiên Hậu/Thanh Long",
  sourceType: "classical-fact",
  quote: "谓干为夫支为妻，凡占婚全看此，岂宜支干上乘天后六合以应私情",
  confidence: "A",
  notes:
    "Dịch: 'Gọi Can là chồng, Chi là vợ, phàm xem hôn nhân đều xem ở đây, sao lại để Chi/Can ở " +
    "vị trí Thiên Bàn có Thiên Hậu/Lục Hợp cưỡi lên [ứng với tình riêng]'. Evaluator R-HONNHAN-01 " +
    "CHỈ implement điều kiện KÍCH HOẠT (thượng thần tại vị trí Can|Chi Ngày là Thiên Hậu HOẶC Lục " +
    "Hợp → dấu hiệu hôn thành) — KHÔNG implement nhánh 'tình riêng' (應私情, đòi hỏi khung luận " +
    "đạo đức/xã hội ngoài phạm vi Model C) và KHÔNG gán polarity nào cho trường hợp KHÔNG có 2 " +
    "tướng này (câu phú không nêu ý nghĩa ngược) — phạm vi hẹp hơn CHÍNH VĂN đầy đủ, ghi rõ ở đây " +
    "để không ai lầm tưởng entry này bao phủ toàn bộ đoạn trích.",
};
