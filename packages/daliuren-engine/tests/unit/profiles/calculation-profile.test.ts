import { describe, expect, it } from "vitest";
import { CLASSICAL_V1_PROFILE } from "../../../src/profiles/classical-v1.js";
import { PROFILE_PROVENANCE_SEED } from "../../../src/profiles/provenance-seed.js";

describe("daliuren-engine/profiles/classical-v1", () => {
  it("early/late Zi hour PHẢI gắn evidenceStatus DEFAULT_PENDING_CONSENSUS — Phase 4 xác nhận CONFLICTING METHODS", () => {
    expect(CLASSICAL_V1_PROFILE.ziHourDayBoundary.evidenceStatus).toBe("DEFAULT_PENDING_CONSENSUS");
    expect(CLASSICAL_V1_PROFILE.ziHourDayBoundary.value).toBe("no-shift");
    // Confidence D — KHÔNG được lên A/B chỉ vì đã "chọn" 1 giá trị default.
    expect(CLASSICAL_V1_PROFILE.ziHourDayBoundary.confidence).toBe("D");
  });

  it("晝夜 boundary đã READY sau Phase 4 — CONFIDENCE B, KHÔNG còn UNVERIFIED", () => {
    expect(CLASSICAL_V1_PROFILE.dayNightBoundary.value).toBe("occasion-hour-chi");
    expect(CLASSICAL_V1_PROFILE.dayNightBoundary.confidence).toBe("B");
    expect(CLASSICAL_V1_PROFILE.dayNightBoundary.evidenceStatus).not.toBe("DEFAULT_PENDING_CONSENSUS");
  });

  it("bảng Quý Nhân là tranh cãi về BẢNG (DISPUTED_TABLE), không phải về ranh giới ngày/đêm", () => {
    expect(CLASSICAL_V1_PROFILE.guiRenMappingTable.evidenceStatus).toBe("DISPUTED_TABLE");
    expect(CLASSICAL_V1_PROFILE.guiRenMappingTable.value).toBe("traditional");
  });

  it("mọi provenanceIds trong profile đều trỏ tới 1 ProvenanceEntry thật có trong seed", () => {
    const seedIds = new Set(PROFILE_PROVENANCE_SEED.map((p) => p.id));
    const decisions = [
      CLASSICAL_V1_PROFILE.ziHourDayBoundary,
      CLASSICAL_V1_PROFILE.dayNightBoundary,
      CLASSICAL_V1_PROFILE.guiRenMappingTable,
    ];
    for (const decision of decisions) {
      for (const provenanceId of decision.provenanceIds) {
        expect(seedIds.has(provenanceId)).toBe(true);
      }
    }
  });

  it("không có field số/percentage nào trong profile (chỉ literal string + provenance)", () => {
    const json = JSON.stringify(CLASSICAL_V1_PROFILE);
    // Kiểm tra thô: không có field tên "score"/"weight"/"percent"/"probability" trong toàn bộ cấu trúc.
    expect(json.toLowerCase()).not.toMatch(/score|weight|percent|probability/);
  });
});
