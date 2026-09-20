import { describe, expect, it } from "vitest";
import { computeKeType } from "../../../src/ke-type/compute.js";
import { calculateDaLiuRenChartWithKeType, calculateDaLiuRenChart } from "../../../src/index.js";
import type { NineMethod } from "../../../src/types/three-transmissions.js";

const ALL_NINE_METHODS: readonly NineMethod[] = ["fuyin", "fanyin", "zeike", "biyong", "shehai", "yaoke", "maoxing", "bieze", "bazhuan"];

describe("daliuren-engine/ke-type/compute — computeKeType (pure identity mapping)", () => {
  it("mỗi giá trị hợp lệ của NineMethod: keType.primary.method === method truyền vào (identity, không suy luận thêm)", () => {
    for (const method of ALL_NINE_METHODS) {
      const result = computeKeType(method, "PROV-FAKE-FOR-TEST");
      expect(result.keType.primary.method).toBe(method);
    }
  });

  it("secondary LUÔN rỗng — DO_NOT_IMPLEMENT, không được gán giá trị nào", () => {
    const result = computeKeType("zeike", "PROV-FAKE-FOR-TEST");
    expect(result.keType.secondary).toEqual([]);
  });

  it("zeikeVariant KHÔNG được fabricate — luôn undefined (ngoài phạm vi 11-A1, confidence C)", () => {
    const result = computeKeType("zeike", "PROV-FAKE-FOR-TEST");
    expect(result.keType.primary.zeikeVariant).toBeUndefined();
  });

  it("provenance TÁI DÙNG NGUYÊN VẸN id truyền vào — KHÔNG tạo id mới", () => {
    const result = computeKeType("yaoke", "PROV-NINE-METHODS-YAOKE");
    expect(result.provenanceId).toBe("PROV-NINE-METHODS-YAOKE");
  });

  it("DETERMINISM: cùng input → cùng output", () => {
    expect(computeKeType("shehai", "X")).toEqual(computeKeType("shehai", "X"));
  });
});

describe("daliuren-engine — calculateDaLiuRenChartWithKeType (Phase 11-A1 facade)", () => {
  const GOLDEN_INPUT = { date: "2024-01-01", hour: 0, minute: 30, timeZone: "Asia/Shanghai" };

  it("golden 2024-01-01 00:30 (method=zeike, đã golden-verify ở calculate-da-liu-ren-chart.test.ts): identity mapping đúng", () => {
    const result = calculateDaLiuRenChartWithKeType(GOLDEN_INPUT);
    expect(result.ok).toBe(true);
    if (!result.ok || !result.data) throw new Error("unreachable");

    expect(result.data.threeTransmissions.method).toBe("zeike");
    expect(result.data.keType.primary.method).toBe(result.data.threeTransmissions.method);
    expect(result.data.keType.secondary).toEqual([]);
  });

  it("provenance.keTypeProvenanceId === provenance.threeTransmissionsInitialProvenanceId (tái dùng, không phải id mới)", () => {
    const result = calculateDaLiuRenChartWithKeType(GOLDEN_INPUT);
    if (!result.ok || !result.data) throw new Error("unreachable");
    expect(result.data.provenance.keTypeProvenanceId).toBe(result.data.provenance.threeTransmissionsInitialProvenanceId);
  });

  it("8 field gốc của DaLiuRenCalculationResult KHÔNG bị đổi so với calculateDaLiuRenChart() thật — chỉ THÊM keType", () => {
    const base = calculateDaLiuRenChart(GOLDEN_INPUT);
    const extended = calculateDaLiuRenChartWithKeType(GOLDEN_INPUT);
    if (!base.ok || !base.data || !extended.ok || !extended.data) throw new Error("unreachable");

    const { keType: _keType, provenance: extendedProvenance, ...restExtended } = extended.data;
    const { keTypeProvenanceId: _keTypeProvenanceId, ...restProvenance } = extendedProvenance;
    // So sánh trực tiếp từng field 8-field freeze.
    expect(restExtended.calendar).toEqual(base.data.calendar);
    expect(restExtended.monthGeneral).toEqual(base.data.monthGeneral);
    expect(restExtended.dayNight).toEqual(base.data.dayNight);
    expect(restExtended.nobleSpirit).toEqual(base.data.nobleSpirit);
    expect(restExtended.heavenEarthPlate).toEqual(base.data.heavenEarthPlate);
    expect(restExtended.fourLessons).toEqual(base.data.fourLessons);
    expect(restExtended.threeTransmissions).toEqual(base.data.threeTransmissions);
    expect(restExtended.twelveGenerals).toEqual(base.data.twelveGenerals);
    expect(restProvenance).toEqual(base.data.provenance);
  });

  it("Scenario E (伏吟 unsupported, 2024-02-01 00:00) — facade FAIL đúng, KHÔNG trả partial keType, KHÔNG nuốt lỗi gốc", () => {
    const result = calculateDaLiuRenChartWithKeType({ date: "2024-02-01", hour: 0, timeZone: "Asia/Shanghai" });
    expect(result.ok).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.errors?.[0]?.code).toBe("INSUFFICIENT_EVIDENCE_FUYIN_SELECTION");
  });

  it("DETERMINISM: gọi 2 lần cùng input → data giống hệt nhau", () => {
    const first = calculateDaLiuRenChartWithKeType(GOLDEN_INPUT);
    const second = calculateDaLiuRenChartWithKeType(GOLDEN_INPUT);
    expect(first.ok).toBe(true);
    expect(second.data).toEqual(first.data);
  });

  it("SERIALIZATION: JSON round-trip không mất dữ liệu (kể cả keType)", () => {
    const result = calculateDaLiuRenChartWithKeType(GOLDEN_INPUT);
    const roundTripped = JSON.parse(JSON.stringify(result)) as typeof result;
    expect(roundTripped).toEqual(result);
  });
});
