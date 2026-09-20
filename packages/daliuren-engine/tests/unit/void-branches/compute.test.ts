import { describe, expect, it } from "vitest";
import { computeVoidBranches } from "../../../src/void-branches/compute.js";
import { VoidBranchesError } from "../../../src/void-branches/errors.js";
import { VOID_BRANCHES_PROVENANCE } from "../../../src/void-branches/provenance.js";
import { calculateDaLiuRenChart } from "../../../src/index.js";
import type { Chi } from "../../../src/types/ganzhi.js";

/**
 * Bảng 6 tuần Giáp Tý CHUẨN (六甲旬空), viết tay ĐỘC LẬP từ kiến thức phổ quát 60-Can-Chi (KHÔNG
 * suy từ công thức mod-12 đang dùng trong `compute.ts` — tránh circular verification, đúng
 * convention đã áp dụng ở A1/A3): mỗi tuần 10 cycleIndex liên tiếp, cùng 1 cặp Không Vong.
 *   甲子旬 (0-9)   → 戌亥 Tuất/Hợi
 *   甲戌旬 (10-19) → 申酉 Thân/Dậu
 *   甲申旬 (20-29) → 午未 Ngọ/Mùi
 *   甲午旬 (30-39) → 辰巳 Thìn/Tỵ
 *   甲辰旬 (40-49) → 寅卯 Dần/Mão
 *   甲寅旬 (50-59) → 子丑 Tý/Sửu
 */
const DECADE_VOID_PAIR: readonly (readonly [Chi, Chi])[] = [
  ["Tuất", "Hợi"],
  ["Thân", "Dậu"],
  ["Ngọ", "Mùi"],
  ["Thìn", "Tỵ"],
  ["Dần", "Mão"],
  ["Tý", "Sửu"],
];

const NO_HIT_TRANSMISSIONS = { initial: "Sửu" as Chi, middle: "Dần" as Chi, final: "Mão" as Chi };

describe("daliuren-engine/void-branches/compute — computeVoidBranches (Phase 11-A2 Core 旬空)", () => {
  it("ĐẦY ĐỦ 60 cycleIndex (0-59): pair khớp đúng bảng 6 tuần Giáp Tý chuẩn, viết tay độc lập", () => {
    for (let cycleIndex = 0; cycleIndex < 60; cycleIndex++) {
      const decade = Math.floor(cycleIndex / 10);
      const { voidBranches } = computeVoidBranches(cycleIndex, NO_HIT_TRANSMISSIONS);
      expect(voidBranches.pair).toEqual(DECADE_VOID_PAIR[decade]);
    }
  });

  it("BOUNDARY: 2 đầu mỗi tuần (cycleIndex=9 vs 10, 19 vs 20, ...) cho pair KHÁC nhau — ranh giới tuần đúng, không lệch", () => {
    for (let decade = 0; decade < 5; decade++) {
      const lastOfDecade = decade * 10 + 9;
      const firstOfNextDecade = (decade + 1) * 10;
      const a = computeVoidBranches(lastOfDecade, NO_HIT_TRANSMISSIONS).voidBranches.pair;
      const b = computeVoidBranches(firstOfNextDecade, NO_HIT_TRANSMISSIONS).voidBranches.pair;
      expect(a).toEqual(DECADE_VOID_PAIR[decade]);
      expect(b).toEqual(DECADE_VOID_PAIR[decade + 1]);
      expect(a).not.toEqual(b);
    }
  });

  it("Thứ tự trong pair: quy ước triển khai (offset tăng dần) — deterministic, KHÔNG khẳng định ý nghĩa cổ văn riêng", () => {
    expect(computeVoidBranches(0, NO_HIT_TRANSMISSIONS).voidBranches.pair).toEqual(["Tuất", "Hợi"]);
    expect(computeVoidBranches(0, NO_HIT_TRANSMISSIONS).voidBranches.pair).not.toEqual(["Hợi", "Tuất"]);
  });

  it("provenanceId trỏ đúng VOID_BRANCHES_PROVENANCE.id (confidence B)", () => {
    const { provenanceId } = computeVoidBranches(0, NO_HIT_TRANSMISSIONS);
    expect(provenanceId).toBe(VOID_BRANCHES_PROVENANCE.id);
    expect(VOID_BRANCHES_PROVENANCE.confidence).toBe("B");
  });

  it("KHÔNG có field 孤辰/寡宿 nào — output CHỈ đúng shape VoidBranches (pair + affects, 2 key)", () => {
    const { voidBranches } = computeVoidBranches(0, NO_HIT_TRANSMISSIONS);
    expect(Object.keys(voidBranches).sort()).toEqual(["affects", "pair"]);
    expect(voidBranches.pair).toHaveLength(2);
    expect(Object.keys(voidBranches.affects).sort()).toEqual(["final", "initial", "middle"]);
  });

  it("DETERMINISM: cùng input → cùng output, gọi nhiều lần, object mới mỗi lần (không share reference)", () => {
    const first = computeVoidBranches(52, NO_HIT_TRANSMISSIONS);
    const second = computeVoidBranches(52, NO_HIT_TRANSMISSIONS);
    expect(second).toEqual(first);
    expect(second).not.toBe(first);
    expect(second.voidBranches).not.toBe(first.voidBranches);
  });

  it("PURITY: KHÔNG mutate `transmissions` object truyền vào (structuredClone trước/sau)", () => {
    const transmissions = { initial: "Tý" as Chi, middle: "Thân" as Chi, final: "Thìn" as Chi };
    const before = structuredClone(transmissions);
    computeVoidBranches(52, transmissions);
    expect(transmissions).toEqual(before);
  });

  it("Invalid cycleIndex: > 59 → ném VoidBranchesError('INVALID_CYCLE_INDEX')", () => {
    expect(() => computeVoidBranches(60, NO_HIT_TRANSMISSIONS)).toThrow(VoidBranchesError);
    try {
      computeVoidBranches(60, NO_HIT_TRANSMISSIONS);
    } catch (e) {
      expect((e as VoidBranchesError).code).toBe("INVALID_CYCLE_INDEX");
    }
  });

  it("Invalid cycleIndex: < 0 → ném VoidBranchesError", () => {
    expect(() => computeVoidBranches(-1, NO_HIT_TRANSMISSIONS)).toThrow(VoidBranchesError);
  });

  it("Invalid cycleIndex: không phải số nguyên (1.5) → ném VoidBranchesError", () => {
    expect(() => computeVoidBranches(1.5, NO_HIT_TRANSMISSIONS)).toThrow(VoidBranchesError);
  });

  it("Invalid cycleIndex: NaN → ném VoidBranchesError, KHÔNG âm thầm trả kết quả sai", () => {
    expect(() => computeVoidBranches(NaN, NO_HIT_TRANSMISSIONS)).toThrow(VoidBranchesError);
  });

  /**
   * Test A (Independent Audit finding #2, Decision Record Phần 2): cả 3 vị trí Tam Truyền CÙNG
   * trúng Không Vong. Dùng input contract THUẦN của pure primitive (cycleIndex=52 → pair=[Tý,Sửu],
   * đã golden-verify ở describe block dưới) thay vì golden chart thật — vì tìm 1 lá số thật có CẢ
   * 3 vị trí Tam Truyền trùng Không Vong đồng thời là 1 trùng hợp hiếm, không cần thiết khi hàm đã
   * pure/deterministic và ĐÃ được golden-verify đúng nguồn `dayPillar.cycleIndex` ở nơi khác — test
   * này CHỈ cần xác nhận logic `affects` cho case biên "cả 3 cùng true", không cần lặp lại việc xác
   * nhận nguồn cycleIndex nữa.
   */
  it("Test A — cả 3 vị trí Tam Truyền cùng trúng Không Vong → affects.initial/middle/final đều true", () => {
    const { voidBranches } = computeVoidBranches(52, { initial: "Tý", middle: "Sửu", final: "Tý" });
    expect(voidBranches.pair).toEqual(["Tý", "Sửu"]);
    expect(voidBranches.affects).toEqual({ initial: true, middle: true, final: true });
  });

  /**
   * Test B (Independent Audit finding #2): ≥2 vị trí Tam Truyền có CÙNG 1 Chi (Chi đó trùng Không
   * Vong) — xác nhận membership đánh giá ĐỘC LẬP theo từng vị trí (không có state leakage giữa
   * initial/middle/final), và vị trí THỨ 3 (Chi khác, KHÔNG trùng Không Vong) không bị ảnh hưởng
   * bởi việc 2 vị trí kia lặp Chi.
   */
  it("Test B — Chi lặp lại giữa 2 vị trí Tam Truyền → membership đánh giá độc lập, không state leakage sang vị trí thứ 3", () => {
    const { voidBranches } = computeVoidBranches(52, { initial: "Tý", middle: "Tý", final: "Dần" });
    expect(voidBranches.pair).toEqual(["Tý", "Sửu"]);
    expect(voidBranches.affects).toEqual({ initial: true, middle: true, final: false });
  });
});

describe("daliuren-engine/void-branches/compute — dùng ĐÚNG cycleIndex trụ NGÀY (KHÔNG dùng Giờ/Tháng/Năm)", () => {
  /**
   * Golden chart 2024-08-20 20:00 Asia/Shanghai: 4 trụ rơi vào 4 TUẦN KHÁC NHAU hoàn toàn —
   *   year  = Giáp Thìn,  cycleIndex=40 (tuần 4) → sẽ cho pair Dần/Mão  NẾU nhầm dùng Năm
   *   month = Nhâm Thân,  cycleIndex=8  (tuần 0) → sẽ cho pair Tuất/Hợi NẾU nhầm dùng Tháng
   *   day   = Bính Thìn,  cycleIndex=52 (tuần 5) → pair ĐÚNG: Tý/Sửu
   *   hour  = Mậu Tuất,   cycleIndex=34 (tuần 3) → sẽ cho pair Thìn/Tỵ  NẾU nhầm dùng Giờ
   * Đây là "bẫy" thật (không giả định) — cả 4 pair khác nhau hoàn toàn, chứng minh dứt khoát
   * implementation phải dùng ĐÚNG cycleIndex của Ngày.
   */
  const GOLDEN_INPUT = { date: "2024-08-20", hour: 20, timeZone: "Asia/Shanghai" };

  it("golden chart xác nhận 4 trụ rơi vào 4 tuần khác nhau thật (bẫy có thật)", () => {
    const result = calculateDaLiuRenChart(GOLDEN_INPUT);
    expect(result.ok).toBe(true);
    if (!result.ok || !result.data) throw new Error("unreachable");

    const { calendar } = result.data;
    expect(calendar.yearPillar.cycleIndex).toBe(40);
    expect(calendar.monthPillar.cycleIndex).toBe(8);
    expect(calendar.dayPillar.cycleIndex).toBe(52);
    expect(calendar.hourPillar.cycleIndex).toBe(34);
  });

  it("computeVoidBranches(dayPillar.cycleIndex, ...) cho ĐÚNG pair của Ngày (Tý/Sửu) — KHÔNG phải của Năm/Tháng/Giờ", () => {
    const result = calculateDaLiuRenChart(GOLDEN_INPUT);
    if (!result.ok || !result.data) throw new Error("unreachable");

    const { calendar, threeTransmissions } = result.data;
    const { voidBranches } = computeVoidBranches(calendar.dayPillar.cycleIndex, threeTransmissions);

    expect(voidBranches.pair).toEqual(["Tý", "Sửu"]); // đúng theo Ngày
    expect(voidBranches.pair).not.toEqual(["Dần", "Mão"]); // sẽ SAI nếu nhầm dùng Năm
    expect(voidBranches.pair).not.toEqual(["Tuất", "Hợi"]); // sẽ SAI nếu nhầm dùng Tháng
    expect(voidBranches.pair).not.toEqual(["Thìn", "Tỵ"]); // sẽ SAI nếu nhầm dùng Giờ
  });

  it("affects: threeTransmissions.initial ('Tý') trùng Không Vong → affects.initial=true, middle/final=false", () => {
    const result = calculateDaLiuRenChart(GOLDEN_INPUT);
    if (!result.ok || !result.data) throw new Error("unreachable");

    const { calendar, threeTransmissions } = result.data;
    expect(threeTransmissions).toEqual({ method: "zeike", initial: "Tý", middle: "Thân", final: "Thìn" });

    const { voidBranches } = computeVoidBranches(calendar.dayPillar.cycleIndex, threeTransmissions);
    expect(voidBranches.affects).toEqual({ initial: true, middle: false, final: false });
  });

  it("affects: golden chart KHÔNG trúng Không Vong nào (2024-10-15 10:00) → cả 3 vị trí false", () => {
    const result = calculateDaLiuRenChart({ date: "2024-10-15", hour: 10, minute: 0, timeZone: "Asia/Shanghai" });
    if (!result.ok || !result.data) throw new Error("unreachable");

    const { calendar, threeTransmissions } = result.data;
    const { voidBranches } = computeVoidBranches(calendar.dayPillar.cycleIndex, threeTransmissions);
    expect(voidBranches.affects).toEqual({ initial: false, middle: false, final: false });
  });
});
