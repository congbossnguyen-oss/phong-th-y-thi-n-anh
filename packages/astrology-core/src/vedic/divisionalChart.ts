/**
 * V1.1 — Chart-level Divisional (Varga) placements.
 *
 * Thin, PURE mapping layer: takes a `NormalizedChart` and applies the ALREADY-FROZEN per-position
 * calculator `getDivisionalSign(varga, sign, signDegree)` to each planet. It adds NO new astrology:
 * no calculator is duplicated, no Varga algorithm is changed, `NormalizedChart` is not modified, and
 * the CF.1–CF.11 methodology is untouched — this only iterates chart planets and dispatches.
 *
 * Sidereal-vs-tropical is the CALLER's contract (Parashari vargas are computed on the sidereal/rashi
 * position, exactly as the existing D1 rashi already is): this function faithfully applies the frozen
 * calculator to whatever `(sign, signDegree)` the supplied chart carries and makes no such decision.
 *
 * D1 is intentionally unrepresentable as a Varga here — `VargaId` has no `1`. Each placement instead
 * carries its source `rashiSign` (the D1/input sign) as provenance, reusing existing chart data with
 * no D1 recomputation.
 */

import type { NormalizedChart, ZodiacSign } from "../chart/types.js";
import { getDivisionalSign, type VargaId } from "./divisional.js";

/** One planet's placement in one divisional chart. Minimal shape: body + varga + divisional sign,
 * plus the source rashi sign / degree it was derived from (provenance, free from the input). */
export interface DivisionalPlacement {
  body: string;
  varga: VargaId;
  /** The divisional (D-N) sign. */
  sign: ZodiacSign;
  /** The source D1/rashi sign the divisional sign was derived from (provenance; not a new D1 calc). */
  rashiSign: ZodiacSign;
  /** The in-sign degree [0,30) used as calculator input (provenance / determinism aid). */
  signDegree: number;
}

/**
 * Compute chart-level divisional placements for one Varga or a list of Vargas.
 *
 * PURE / deterministic: same chart + same vargas ⇒ same placements (order = varga order, then
 * `chart.planets` order). Every planet in `chart.planets` is mapped (all carry a valid `sign`/
 * `signDegree` by `NormalizedChart` construction). Unsupported divisions (e.g. D1, D5) are rejected
 * at compile time by the `VargaId` type — there is no runtime widening.
 */
export function computeDivisionalPlacements(
  chart: NormalizedChart,
  vargas: VargaId | readonly VargaId[],
): DivisionalPlacement[] {
  const vargaList: readonly VargaId[] = Array.isArray(vargas) ? vargas : [vargas as VargaId];
  const placements: DivisionalPlacement[] = [];
  for (const varga of vargaList) {
    for (const p of chart.planets) {
      placements.push({
        body: p.body,
        varga,
        sign: getDivisionalSign(varga, p.sign, p.signDegree),
        rashiSign: p.sign,
        signDegree: p.signDegree,
      });
    }
  }
  return placements;
}
