import { describe, expect, it } from "vitest";
import { computeYiMaPlacement } from "../../../src/shen-sha/compute.js";
import { YI_MA_TABLE } from "../../../src/yi-ma/table.js";
import { YI_MA_PROVENANCE } from "../../../src/yi-ma/provenance.js";
import { computeVoidBranches } from "../../../src/void-branches/compute.js";
import { calculateDaLiuRenChart } from "../../../src/index.js";
import type { Chi } from "../../../src/types/ganzhi.js";
import type { VoidBranches } from "../../../src/types/void-branches.js";

/** Fixture `VoidBranches` tối giản cho unit test thuần (không cần chart thật) — `affects` không liên quan tới A4. */
function fixtureVoidBranches(pair: readonly [Chi, Chi]): VoidBranches {
  return { pair, affects: { initial: false, middle: false, final: false } };
}

const NEVER_VOID = fixtureVoidBranches(["Thìn", "Tuất"]);

describe("daliuren-engine/shen-sha/compute — computeYiMaPlacement (Phase 11-A4)", () => {
  it("A — mapping đầy đủ 12/12 Chi nguồn: composition KHÔNG làm sai output của computeYiMa() gốc", () => {
    for (const [source, expectedYiMa] of Object.entries(YI_MA_TABLE) as [Chi, Chi][]) {
      const { placement } = computeYiMaPlacement(source, NEVER_VOID, "FAKE-PROV");
      expect(placement.zhi).toBe(expectedYiMa);
      expect(placement.name).toBe("yiMa");
    }
  });

  it("B — isVoid=false khi voidBranches.pair KHÔNG chứa Yi Ma", () => {
    const { placement } = computeYiMaPlacement("Dần", fixtureVoidBranches(["Tý", "Sửu"]), "FAKE-PROV");
    expect(placement.zhi).toBe("Thân"); // Dần -> Thân theo YI_MA_TABLE
    expect(placement.isVoid).toBe(false);
  });

  it("C — isVoid=true khi voidBranches.pair CHỨA Yi Ma", () => {
    const { placement } = computeYiMaPlacement("Dần", fixtureVoidBranches(["Thân", "Dậu"]), "FAKE-PROV");
    expect(placement.zhi).toBe("Thân");
    expect(placement.isVoid).toBe(true);
  });

  it.each([
    ["Thân" as Chi, "Dần" as Chi, "申子辰 → 寅"],
    ["Tý" as Chi, "Dần" as Chi, "申子辰 → 寅"],
    ["Thìn" as Chi, "Dần" as Chi, "申子辰 → 寅"],
    ["Dần" as Chi, "Thân" as Chi, "寅午戌 → 申"],
    ["Ngọ" as Chi, "Thân" as Chi, "寅午戌 → 申"],
    ["Tuất" as Chi, "Thân" as Chi, "寅午戌 → 申"],
    ["Tỵ" as Chi, "Hợi" as Chi, "巳酉丑 → 亥"],
    ["Dậu" as Chi, "Hợi" as Chi, "巳酉丑 → 亥"],
    ["Sửu" as Chi, "Hợi" as Chi, "巳酉丑 → 亥"],
    ["Hợi" as Chi, "Tỵ" as Chi, "亥卯未 → 巳"],
    ["Mão" as Chi, "Tỵ" as Chi, "亥卯未 → 巳"],
    ["Mùi" as Chi, "Tỵ" as Chi, "亥卯未 → 巳"],
  ])("D — nhóm tam hợp: source=%s → Yi Ma=%s (%s), isVoid=true khi trúng Không Vong đúng Yi Ma đó", (source, expectedYiMa, _group) => {
    // Yi Ma target luôn thuộc {Dần,Thân,Hợi,Tỵ} — "Sửu" không bao giờ trùng, an toàn dùng làm chi phụ cố định của pair.
    const hit = computeYiMaPlacement(source, fixtureVoidBranches([expectedYiMa, "Sửu"]), "FAKE-PROV");
    expect(hit.placement.zhi).toBe(expectedYiMa);
    expect(hit.placement.isVoid).toBe(true);
  });

  it("E — PURITY: KHÔNG mutate `voidBranches` object truyền vào (structuredClone trước/sau)", () => {
    const voidBranches = fixtureVoidBranches(["Thân", "Dậu"]);
    const before = structuredClone(voidBranches);
    computeYiMaPlacement("Dần", voidBranches, "FAKE-PROV");
    expect(voidBranches).toEqual(before);
  });

  it("F — DETERMINISM: cùng input → cùng output, gọi nhiều lần, object mới mỗi lần", () => {
    const voidBranches = fixtureVoidBranches(["Thân", "Dậu"]);
    const first = computeYiMaPlacement("Dần", voidBranches, "FAKE-PROV");
    const second = computeYiMaPlacement("Dần", voidBranches, "FAKE-PROV");
    expect(second).toEqual(first);
    expect(second).not.toBe(first);
    expect(second.placement).not.toBe(first.placement);
  });

  it("G — Provenance: tái dùng YI_MA_PROVENANCE cho zhi + pass-through id caller cho voidBranches, KHÔNG fabricate", () => {
    const { zhiProvenanceId, voidBranchesProvenanceId } = computeYiMaPlacement("Dần", NEVER_VOID, "CALLER-SUPPLIED-VOID-PROV-ID");
    expect(zhiProvenanceId).toBe(YI_MA_PROVENANCE.id);
    expect(voidBranchesProvenanceId).toBe("CALLER-SUPPLIED-VOID-PROV-ID"); // đúng nguyên giá trị caller truyền, không tự đổi/tạo mới
  });
});

describe("daliuren-engine/shen-sha/compute — H: golden chart thật, trace đủ chuỗi dayChi → yiMa → voidBranches → isVoid", () => {
  /**
   * 2024-08-20 20:00 Asia/Shanghai (tái dùng golden chart đã dùng ở A2): dayPillar.chi="Thìn",
   * dayPillar.cycleIndex=52 → voidBranches.pair=[Tý,Sửu] (đã golden-verify ở A2). YI_MA_TABLE
   * Thìn→Dần (nhóm 申子辰→寅) — Dần KHÔNG thuộc [Tý,Sửu] → isVoid=false (case thật, không giả định).
   * KHÔNG wire vào `calculateDaLiuRenChart()`/canonical chart result — chỉ compose thủ công bên
   * ngoài facade, đúng phạm vi đã xác định trong Pre-Implementation Audit (out of scope).
   */
  const GOLDEN_INPUT = { date: "2024-08-20", hour: 20, timeZone: "Asia/Shanghai" };

  it("chuỗi đầy đủ: chart → fourLessons.lesson3.lower (=dayChi) → computeYiMa → A2 voidBranches → computeYiMaPlacement", () => {
    const chart = calculateDaLiuRenChart(GOLDEN_INPUT);
    expect(chart.ok).toBe(true);
    if (!chart.ok || !chart.data) throw new Error("unreachable");

    // Xác nhận contract nguồn: fourLessons.lesson3.lower CHÍNH LÀ dayPillar.chi (Chi Ngày) — không
    // suy đoán, đọc trực tiếp cả 2 field từ CÙNG 1 chart thật.
    expect(chart.data.fourLessons.lesson3.lower).toBe(chart.data.calendar.dayPillar.chi);

    const dayChi = chart.data.calendar.dayPillar.chi;
    expect(dayChi).toBe("Thìn");

    const { voidBranches, provenanceId: voidBranchesProvenanceId } = computeVoidBranches(chart.data.calendar.dayPillar.cycleIndex, chart.data.threeTransmissions);
    expect(voidBranches.pair).toEqual(["Tý", "Sửu"]);

    const { placement, zhiProvenanceId, voidBranchesProvenanceId: passedThroughId } = computeYiMaPlacement(dayChi, voidBranches, voidBranchesProvenanceId);

    expect(placement).toEqual({ name: "yiMa", zhi: "Dần", isVoid: false });
    expect(zhiProvenanceId).toBe(YI_MA_PROVENANCE.id);
    expect(passedThroughId).toBe(voidBranchesProvenanceId);
  });
});
