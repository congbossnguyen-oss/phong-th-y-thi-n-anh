import { describe, expect, it } from "vitest";
import { computeWangShuai } from "../../../src/wang-shuai/compute.js";
import { WANG_SHUAI_PROVENANCE } from "../../../src/wang-shuai/provenance.js";
import { calculateDaLiuRenChart } from "../../../src/index.js";
import type { Chi } from "../../../src/types/ganzhi.js";
import type { WangShuai, WangShuaiStage } from "../../../src/types/wang-shuai.js";

/**
 * Bảng kỳ vọng suy TRỰC TIẾP từ Algorithm Spec §11 (KHÔNG suy từ code đang test — tránh circular
 * verification): với gốc M = hành tháng, X = hành đang xét —
 *   X=M → wang | M sinh X → xiang | X sinh M → xiu | X khắc M → qiu | M khắc X → si.
 * 1 dòng kỳ vọng cho mỗi trong 5 Ngũ Hành (dùng chung cho mọi Chi cùng hành).
 */
const EXPECTED_BY_ELEMENT: Record<"wood" | "fire" | "earth" | "metal" | "water", WangShuai> = {
  wood: { wood: "wang", fire: "xiang", earth: "si", metal: "qiu", water: "xiu" },
  fire: { wood: "xiu", fire: "wang", earth: "xiang", metal: "si", water: "qiu" },
  earth: { wood: "qiu", fire: "xiu", earth: "wang", metal: "xiang", water: "si" },
  metal: { wood: "si", fire: "qiu", earth: "xiu", metal: "wang", water: "xiang" },
  water: { wood: "xiang", fire: "si", earth: "qiu", metal: "xiu", water: "wang" },
};

/** 12 Chi → hành CỐ ĐỊNH theo `Data.CHI_NGU_HANH` (thứ tự CHI: Tý Sửu Dần Mão Thìn Tỵ Ngọ Mùi Thân Dậu Tuất Hợi). */
const CHI_TO_ELEMENT: Record<Chi, keyof typeof EXPECTED_BY_ELEMENT> = {
  Tý: "water",
  Sửu: "earth",
  Dần: "wood",
  Mão: "wood",
  Thìn: "earth",
  Tỵ: "fire",
  Ngọ: "fire",
  Mùi: "earth",
  Thân: "metal",
  Dậu: "metal",
  Tuất: "earth",
  Hợi: "water",
};

describe("daliuren-engine/wang-shuai/compute — computeWangShuai (Phase 11-A3)", () => {
  it("mỗi Chi trong 12 Địa Chi: wangShuai khớp đúng bảng kỳ vọng suy từ Algorithm Spec §11 (không dùng lại code đang test để suy kỳ vọng)", () => {
    for (const [chi, element] of Object.entries(CHI_TO_ELEMENT) as [Chi, keyof typeof EXPECTED_BY_ELEMENT][]) {
      const { wangShuai } = computeWangShuai(chi);
      expect(wangShuai).toEqual(EXPECTED_BY_ELEMENT[element]);
    }
  });

  it("mỗi hành X tự nó luôn ở vị trí 旺 (wang) khi trùng hành tháng — cả 5 hành", () => {
    for (const [chi, element] of Object.entries(CHI_TO_ELEMENT) as [Chi, keyof typeof EXPECTED_BY_ELEMENT][]) {
      const { wangShuai } = computeWangShuai(chi);
      expect(wangShuai[element]).toBe("wang");
    }
  });

  it("provenanceId trỏ đúng WANG_SHUAI_PROVENANCE.id (confidence A, Algorithm Spec §11)", () => {
    const { provenanceId } = computeWangShuai("Dần");
    expect(provenanceId).toBe(WANG_SHUAI_PROVENANCE.id);
    expect(WANG_SHUAI_PROVENANCE.confidence).toBe("A");
  });

  it("KHÔNG có field định lượng hoá (%, hệ số) — mọi giá trị chỉ thuộc đúng 5 literal WangShuaiStage", () => {
    const ALLOWED: readonly WangShuaiStage[] = ["wang", "xiang", "xiu", "qiu", "si"];
    const { wangShuai } = computeWangShuai("Ngọ");
    for (const stage of Object.values(wangShuai)) {
      expect(ALLOWED).toContain(stage);
      expect(typeof stage).toBe("string");
    }
    expect(Object.keys(wangShuai)).toHaveLength(5);
  });

  it("DETERMINISM: cùng Chi tháng → cùng output, gọi nhiều lần", () => {
    const first = computeWangShuai("Dậu");
    const second = computeWangShuai("Dậu");
    expect(second).toEqual(first);
    expect(second).not.toBe(first); // object mới mỗi lần gọi, không share reference
  });

  it("KHÔNG mutate input: Chi là string primitive (bất biến theo ngữ nghĩa JS) — xác nhận giá trị truyền vào giữ nguyên sau khi gọi", () => {
    const monthChi: Chi = "Mão";
    const before = monthChi;
    computeWangShuai(monthChi);
    expect(monthChi).toBe(before);
    expect(monthChi).toBe("Mão");
  });

  it("Invalid input: Chi không hợp lệ → ném lỗi qua guard sẵn có của TrachNhat.getNguHanhQuanHe (KHÔNG âm thầm trả kết quả sai)", () => {
    expect(() => computeWangShuai("KHONG_HOP_LE" as Chi)).toThrow();
  });
});

describe("daliuren-engine/wang-shuai/compute — mapping đúng theo calendar.monthPillar (KHÔNG dùng napAm)", () => {
  /**
   * Golden chart 2024-10-15 10:00 Asia/Shanghai: monthPillar = Giáp Tuất.
   * `.chi` = "Tuất" → hành CỐ ĐỊNH (Data.CHI_NGU_HANH) = Thổ (earth).
   * `.napAm.element` = "Hỏa" (Sơn Đầu Hỏa) — KHÁC hẳn hành của chính Chi Tuất.
   * Đây là "bẫy" thật (không giả định) chứng minh regression: nếu implementation lỡ đọc
   * `napAm.element` thay vì `.chi`, kết quả sẽ lệch sang hàng "fire" thay vì hàng "earth" đúng.
   */
  const GOLDEN_INPUT = { date: "2024-10-15", hour: 10, minute: 0, timeZone: "Asia/Shanghai" };

  it("golden chart xác nhận monthPillar.chi và napAm.element THẬT SỰ khác hành nhau (bẫy có thật, không giả định)", () => {
    const result = calculateDaLiuRenChart(GOLDEN_INPUT);
    expect(result.ok).toBe(true);
    if (!result.ok || !result.data) throw new Error("unreachable");

    expect(result.data.calendar.monthPillar.chi).toBe("Tuất");
    expect(result.data.calendar.monthPillar.napAm.element).toBe("Hỏa");
  });

  it("computeWangShuai(monthPillar.chi) dùng ĐÚNG hành của Tuất (Thổ/earth) — KHÔNG dùng hành của napAm (Hỏa/fire)", () => {
    const result = calculateDaLiuRenChart(GOLDEN_INPUT);
    if (!result.ok || !result.data) throw new Error("unreachable");

    const { wangShuai } = computeWangShuai(result.data.calendar.monthPillar.chi);
    expect(wangShuai).toEqual(EXPECTED_BY_ELEMENT.earth);
    expect(wangShuai).not.toEqual(EXPECTED_BY_ELEMENT.fire);
  });
});
