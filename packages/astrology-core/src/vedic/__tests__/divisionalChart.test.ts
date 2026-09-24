import { describe, expect, it } from "vitest";

import type { NormalizedChart } from "../../chart/types.js";
import { getDivisionalSign, type VargaId } from "../divisional.js";
import { computeDivisionalPlacements } from "../divisionalChart.js";

/** All 15 V1.1 Parashari vargas (D1 intentionally excluded — not a VargaId). */
const ALL_VARGAS: readonly VargaId[] = [2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60];

/** Minimal planets-only NormalizedChart fixture (established test convention: cast a partial).
 * Includes the D60 Santhanam anchor (Capricorn 13°25′ = 13.41666…) and low/high boundary degrees. */
const chart = {
  metadata: { calculationId: "test-divisional-chart-1" },
  planets: [
    { body: "sun", sign: "capricorn", signDegree: 13 + 25 / 60 }, // Santhanam D60 anchor → Pisces
    { body: "moon", sign: "aries", signDegree: 0 }, // boundary low
    { body: "mars", sign: "taurus", signDegree: 29.9 }, // near boundary high
    { body: "jupiter", sign: "leo", signDegree: 15 },
  ],
} as unknown as NormalizedChart;

describe("computeDivisionalPlacements — chart-level Varga API", () => {
  it("faithfully applies getDivisionalSign for all 15 vargas × all planets (no new methodology)", () => {
    for (const varga of ALL_VARGAS) {
      const placements = computeDivisionalPlacements(chart, varga);
      expect(placements).toHaveLength(chart.planets.length);
      placements.forEach((pl, i) => {
        const p = chart.planets[i]!;
        expect(pl.body).toBe(p.body);
        expect(pl.varga).toBe(varga);
        expect(pl.rashiSign).toBe(p.sign); // provenance = source D1/rashi sign
        expect(pl.signDegree).toBe(p.signDegree);
        // Chart-level result MUST equal the canonical frozen dispatcher — it only dispatches.
        expect(pl.sign).toBe(getDivisionalSign(varga, p.sign, p.signDegree));
      });
    }
  });

  it("D60 Santhanam anchor holds at chart level (Capricorn 13°25′ → Pisces)", () => {
    const [d60] = computeDivisionalPlacements(chart, 60).filter((p) => p.body === "sun");
    expect(d60?.sign).toBe("pisces");
  });

  it("single varga → one placement per planet; multi-varga list → per varga × planet, in order", () => {
    const one = computeDivisionalPlacements(chart, 9);
    expect(one).toHaveLength(chart.planets.length);
    expect(one.every((p) => p.varga === 9)).toBe(true);

    const many = computeDivisionalPlacements(chart, [2, 9, 60]);
    expect(many).toHaveLength(3 * chart.planets.length);
    expect(many.slice(0, chart.planets.length).every((p) => p.varga === 2)).toBe(true);
    expect(many.slice(chart.planets.length, 2 * chart.planets.length).every((p) => p.varga === 9)).toBe(true);
    expect(many.slice(2 * chart.planets.length).every((p) => p.varga === 60)).toBe(true);
  });

  it("deterministic — same chart + same vargas ⇒ identical output", () => {
    expect(computeDivisionalPlacements(chart, ALL_VARGAS)).toEqual(computeDivisionalPlacements(chart, ALL_VARGAS));
  });

  it("boundary degrees (0 and near 30) are handled by the frozen calculators without error", () => {
    for (const varga of ALL_VARGAS) {
      const pls = computeDivisionalPlacements(chart, varga);
      const moon = pls.find((p) => p.body === "moon"); // aries 0.0
      const mars = pls.find((p) => p.body === "mars"); // taurus 29.9
      expect(moon?.sign).toBe(getDivisionalSign(varga, "aries", 0));
      expect(mars?.sign).toBe(getDivisionalSign(varga, "taurus", 29.9));
    }
  });

  it("empty planet set → empty placements (no crash)", () => {
    const empty = { metadata: { calculationId: "x" }, planets: [] } as unknown as NormalizedChart;
    expect(computeDivisionalPlacements(empty, ALL_VARGAS)).toEqual([]);
  });

  it("unsupported divisions (D1, D5) are rejected at compile time by the VargaId type", () => {
    // @ts-expect-error — D1 is not a Varga (VargaId has no `1`; D1 is the already-built rashi chart)
    const _d1 = () => computeDivisionalPlacements(chart, 1);
    // @ts-expect-error — D5 is explicitly deferred, not part of the frozen VargaId union
    const _d5 = () => computeDivisionalPlacements(chart, 5);
    expect(typeof _d1).toBe("function");
    expect(typeof _d5).toBe("function");
  });
});
