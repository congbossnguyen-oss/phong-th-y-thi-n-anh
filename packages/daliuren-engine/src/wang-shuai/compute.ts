/**
 * 旺相休囚死 (WangShuai — Vượng suy, 5 cấp) — Algorithm Spec §11, Phase 11-A3. Gốc quy chiếu =
 * Ngũ Hành CỐ ĐỊNH của Chi tháng (nguyệt lệnh), tra qua `Data.CHI_NGU_HANH` — TUYỆT ĐỐI KHÔNG
 * dùng `monthPillar.napAm.element` (Nạp Âm là hệ phân loại KHÁC, vd tháng Đinh Dậu có
 * NapAm="Sơn Hạ Hỏa"/Hỏa nhưng Chi Dậu tự nó thuộc Kim — nhầm 2 nguồn này cho kết quả SAI hoàn
 * toàn mà không lỗi runtime nào báo, xem Pre-Implementation Audit A3 mục 8).
 *
 * `Data.CHI_NGU_HANH`/tra cứu KHÔNG throw — TÁI DÙNG y hệt quy ước đã proven ở
 * r-nhatthan-01/evaluator.ts + r-kientung-02/evaluator.ts (Chi là union đã đóng, đã được
 * TypeScript đảm bảo hợp lệ qua đường gọi có kiểu — không cần validation runtime riêng).
 *
 * Với mỗi hành X trong 5 hành, quan hệ với hành tháng M qua `TrachNhat.getNguHanhQuanHe(M, X)`
 * (TÁI DÙNG y hệt tiện ích đã proven ở nine-methods/wuxing.ts, KHÔNG viết lại chu kỳ sinh/khắc):
 *   - "tuong-hoa" (X = M)   → 旺 wang
 *   - "a-sinh-b" (M sinh X) → 相 xiang
 *   - "b-sinh-a" (X sinh M) → 休 xiu
 *   - "b-khac-a" (X khắc M) → 囚 qiu
 *   - "a-khac-b" (M khắc X) → 死 si
 *
 * TUYỆT ĐỐI không có field định lượng hoá (%, hệ số cường độ) — xem types/wang-shuai.ts header
 * comment ("công thức đó đã bị loại vĩnh viễn"). Hàm thuần: không mutate input, không side effect,
 * không I/O/network/LLM.
 */
import { Data } from "@thien-anh/calendar-core";
import { TrachNhat } from "@thien-anh/rule-engine";
import type { Chi } from "../types/ganzhi.js";
import type { FiveElement, WangShuai, WangShuaiStage } from "../types/wang-shuai.js";
import { WANG_SHUAI_PROVENANCE } from "./provenance.js";

function nguHanhOfChi(chi: Chi): Data.NguHanh {
  return Data.CHI_NGU_HANH[Data.CHI.indexOf(chi)]!;
}

const FIVE_ELEMENT_TO_NGU_HANH: Record<FiveElement, Data.NguHanh> = {
  wood: "Mộc",
  fire: "Hỏa",
  earth: "Thổ",
  metal: "Kim",
  water: "Thủy",
};

const QUAN_HE_TO_STAGE: Record<ReturnType<typeof TrachNhat.getNguHanhQuanHe>, WangShuaiStage> = {
  "tuong-hoa": "wang",
  "a-sinh-b": "xiang",
  "b-sinh-a": "xiu",
  "b-khac-a": "qiu",
  "a-khac-b": "si",
};

export interface WangShuaiComputation {
  wangShuai: WangShuai;
  provenanceId: string;
}

/** `monthChi`: `calendar.monthPillar.chi` — BẮT BUỘC lấy từ `.chi`, KHÔNG phải `.napAm.element`. */
export function computeWangShuai(monthChi: Chi): WangShuaiComputation {
  const monthNguHanh = nguHanhOfChi(monthChi);
  const stageOf = (element: FiveElement): WangShuaiStage => QUAN_HE_TO_STAGE[TrachNhat.getNguHanhQuanHe(monthNguHanh, FIVE_ELEMENT_TO_NGU_HANH[element])];

  return {
    wangShuai: {
      wood: stageOf("wood"),
      fire: stageOf("fire"),
      earth: stageOf("earth"),
      metal: stageOf("metal"),
      water: stageOf("water"),
    },
    provenanceId: WANG_SHUAI_PROVENANCE.id,
  };
}
