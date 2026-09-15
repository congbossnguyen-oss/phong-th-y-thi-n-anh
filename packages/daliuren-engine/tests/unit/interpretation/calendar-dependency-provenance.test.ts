import { describe, expect, it } from "vitest";
import {
  isWithinZiHourAmbiguityWindow,
  resolveDayOrHourPillarProvenance,
} from "../../../src/interpretation/calendar-dependency-provenance.js";
import { GANZHI_PILLAR_CONSTRUCTION_PROVENANCE } from "../../../src/calendar/provenance.js";
import { CLASSICAL_V1_PROFILE } from "../../../src/profiles/classical-v1.js";

describe("daliuren-engine/interpretation/calendar-dependency-provenance", () => {
  describe("isWithinZiHourAmbiguityWindow", () => {
    it("true cho giờ 23 và 0, false cho các giờ khác", () => {
      expect(isWithinZiHourAmbiguityWindow(23)).toBe(true);
      expect(isWithinZiHourAmbiguityWindow(0)).toBe(true);
      expect(isWithinZiHourAmbiguityWindow(1)).toBe(false);
      expect(isWithinZiHourAmbiguityWindow(12)).toBe(false);
      expect(isWithinZiHourAmbiguityWindow(22)).toBe(false);
    });
  });

  describe("resolveDayOrHourPillarProvenance", () => {
    it("giờ NGOÀI vùng tranh chấp Tý: CHỈ base GanZhi provenance (confidence B), KHÔNG kèm ziHourDayBoundary", () => {
      const result = resolveDayOrHourPillarProvenance(10, CLASSICAL_V1_PROFILE);
      expect(result.provenanceIds).toEqual([GANZHI_PILLAR_CONSTRUCTION_PROVENANCE.id]);
      expect(result.confidence).toBe("B");
    });

    it("giờ TRONG vùng tranh chấp Tý (23 hoặc 0): kèm CẢ base GanZhi LẪN ziHourDayBoundary provenance — GIỮ RIÊNG, không gộp", () => {
      const at23 = resolveDayOrHourPillarProvenance(23, CLASSICAL_V1_PROFILE);
      expect(at23.provenanceIds).toContain(GANZHI_PILLAR_CONSTRUCTION_PROVENANCE.id);
      expect(at23.provenanceIds).toEqual(
        expect.arrayContaining([...CLASSICAL_V1_PROFILE.ziHourDayBoundary.provenanceIds]),
      );
      // worst-of(B, D) = D — ziHourDayBoundary của classical-v1 là D (DEFAULT_PENDING_CONSENSUS).
      expect(CLASSICAL_V1_PROFILE.ziHourDayBoundary.confidence).toBe("D");
      expect(at23.confidence).toBe("D");

      const at0 = resolveDayOrHourPillarProvenance(0, CLASSICAL_V1_PROFILE);
      expect(at0.confidence).toBe("D");
    });

    it("KHÔNG bao giờ merge 2 provenance thành 1 entry mới — provenanceIds luôn là mảng các id GỐC, riêng biệt", () => {
      const result = resolveDayOrHourPillarProvenance(23, CLASSICAL_V1_PROFILE);
      // Đúng 1 id base + đúng số id của ziHourDayBoundary.provenanceIds — không có id lạ nào bị tạo thêm.
      expect(result.provenanceIds.length).toBe(1 + CLASSICAL_V1_PROFILE.ziHourDayBoundary.provenanceIds.length);
    });

    it("deterministic: gọi nhiều lần cùng input cho cùng kết quả", () => {
      const first = resolveDayOrHourPillarProvenance(23, CLASSICAL_V1_PROFILE);
      const second = resolveDayOrHourPillarProvenance(23, CLASSICAL_V1_PROFILE);
      expect(second).toEqual(first);
    });
  });
});
