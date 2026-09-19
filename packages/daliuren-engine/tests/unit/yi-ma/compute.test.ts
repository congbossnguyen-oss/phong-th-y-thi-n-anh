import { describe, expect, it } from "vitest";
import { computeYiMa } from "../../../src/yi-ma/compute.js";
import { YiMaError } from "../../../src/yi-ma/errors.js";
import { YI_MA_PROVENANCE } from "../../../src/yi-ma/provenance.js";
import { YI_MA_TABLE } from "../../../src/yi-ma/table.js";

/**
 * 驛馬 (Yi Ma) — Phase 9C. Bảng đã sao chép NGUYÊN VẸN từ Algorithm Spec §10, không cần golden
 * case chạy code ngoài (bảng đã tường minh trong tài liệu đã audit, xem yi-ma/table.ts) — chỉ
 * cần verify tay khớp đúng 4 tam hợp cục 寅午戌/申子辰/巳酉丑/亥卯未.
 */
describe("daliuren-engine/yi-ma/compute — computeYiMa", () => {
  it("khớp CHÍNH XÁC bảng Algorithm Spec §10 cho cả 12 Chi", () => {
    const expected: Record<string, string> = YI_MA_TABLE;
    for (const [chi, yiMa] of Object.entries(expected)) {
      expect(computeYiMa(chi as never).yiMa).toBe(yiMa);
    }
  });

  it("4 tam hợp cục đều map về đúng 1 trong 4 chữ 孟 (Dần/Tỵ/Thân/Hợi)", () => {
    const mengValues = new Set(Object.values(YI_MA_TABLE));
    expect(mengValues).toEqual(new Set(["Thân", "Dần", "Hợi", "Tỵ"]));
  });

  it("provenanceId trỏ đúng YI_MA_PROVENANCE thật, confidence B (2-source)", () => {
    const result = computeYiMa("Dần");
    expect(result.provenanceId).toBe(YI_MA_PROVENANCE.id);
    expect(YI_MA_PROVENANCE.confidence).toBe("B");
  });

  it("NO HIDDEN FALLBACK: Chi không hợp lệ -> throw YiMaError, không đoán", () => {
    try {
      computeYiMa("KhongTonTai" as never);
      expect.fail("Kỳ vọng ném YiMaError nhưng không có lỗi nào.");
    } catch (error) {
      expect(error).toBeInstanceOf(YiMaError);
      expect((error as YiMaError).code).toBe("UNKNOWN_CHI");
    }
  });

  it("DETERMINISM: gọi nhiều lần cùng input cho kết quả hệt nhau", () => {
    expect(computeYiMa("Sửu")).toEqual(computeYiMa("Sửu"));
  });
});
