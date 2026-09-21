// Test route `src/pages/api/dai-luc-nham.ts` — Phase 11-C API Integration. Xác nhận route dùng
// ĐÚNG pipeline frozen `calculateDaLiuRenChart()` → `buildInterpretationPackage()`, không mất
// provenance/confidence/signals/conflicts/chartId khi serialize, và có error boundary cho input xấu.
import { describe, expect, it } from "vitest";
import { GET } from "../src/pages/api/dai-luc-nham.js";
import type { APIContext } from "astro";

function request(query: string): APIContext {
  return { url: new URL(`http://localhost/api/dai-luc-nham${query}`) } as APIContext;
}

async function callGet(query: string) {
  const response = await GET(request(query), undefined as never);
  const body = await response.json();
  return { status: response.status, body };
}

describe("API /api/dai-luc-nham — happy path", () => {
  it("request hợp lệ → 200, calculation + interpretation đầy đủ (pipeline calculateDaLiuRenChart → buildInterpretationPackage)", async () => {
    const { status, body } = await callGet("?date=2024-01-01&hour=0&minute=30&timeZone=Asia/Shanghai");

    expect(status).toBe(200);
    expect(body.ok).toBe(true);

    // calculation = DaLiuRenCalculationResult thật (Tầng 1, 8 field + provenance) — không rút gọn.
    expect(body.calculation.threeTransmissions).toBeDefined();
    expect(body.calculation.provenance).toBeDefined();
    expect(body.calculation.provenance.threeTransmissionsInitialProvenanceId).toEqual(expect.any(String));

    // interpretation = InterpretationPackage thật — chartId/signals/conflicts/confidence/provenance không bị mất.
    expect(body.interpretation.chart_reference.chartId).toEqual(expect.any(String));
    expect(Array.isArray(body.interpretation.signals)).toBe(true);
    expect(Array.isArray(body.interpretation.conflicts)).toBe(true);
    expect(body.interpretation.confidence_summary).toHaveProperty("overallLowestConfidence");
    expect(body.interpretation.provenance).toBeDefined();
  });

  it("KHÔNG lộ Ke Type/Wang Shuai/Void Branches/Yi Ma trong `calculation` — canonical chart contract (8 field) giữ nguyên, A1-A4 vẫn additive-only", async () => {
    const { body } = await callGet("?date=2024-01-01&hour=0&minute=30&timeZone=Asia/Shanghai");
    expect(body.calculation.keType).toBeUndefined();
    expect(body.calculation.wangShuai).toBeUndefined();
    expect(body.calculation.voidBranches).toBeUndefined();
    expect(body.calculation.shenSha).toBeUndefined();
  });
});

describe("API /api/dai-luc-nham — invalid input → 4xx deterministic", () => {
  it("thiếu date/hour/timeZone → 400", async () => {
    const { status, body } = await callGet("?date=2024-01-01");
    expect(status).toBe(400);
    expect(body.error).toEqual(expect.any(String));
  });

  it("hour không phải số nguyên → 400", async () => {
    const { status } = await callGet("?date=2024-01-01&hour=abc&timeZone=Asia/Shanghai");
    expect(status).toBe(400);
  });

  it("questionType không hợp lệ → 400", async () => {
    const { status, body } = await callGet("?date=2024-01-01&hour=0&timeZone=Asia/Shanghai&questionType=KHONG_TON_TAI");
    expect(status).toBe(400);
    expect(body.error).toContain("questionType");
  });
});

describe("API /api/dai-luc-nham — error boundary cho lỗi nghiệp vụ (không crash 500)", () => {
  it("input hình thức hợp lệ nhưng chart không tính được (伏吟 chưa đủ evidence) → vẫn 200, errors[] bên trong, KHÔNG throw", async () => {
    const { status, body } = await callGet("?date=2024-02-01&hour=0&timeZone=Asia/Shanghai");
    expect(status).toBe(200);
    expect(body.ok).toBe(false);
    expect(Array.isArray(body.errors)).toBe(true);
  });
});

describe("API /api/dai-luc-nham — determinism", () => {
  it("cùng request → cùng chartId và cùng calculation.threeTransmissions", async () => {
    const first = await callGet("?date=2024-01-01&hour=0&minute=30&timeZone=Asia/Shanghai");
    const second = await callGet("?date=2024-01-01&hour=0&minute=30&timeZone=Asia/Shanghai");

    expect(second.body.interpretation.chart_reference.chartId).toBe(first.body.interpretation.chart_reference.chartId);
    expect(second.body.calculation.threeTransmissions).toEqual(first.body.calculation.threeTransmissions);
  });
});
