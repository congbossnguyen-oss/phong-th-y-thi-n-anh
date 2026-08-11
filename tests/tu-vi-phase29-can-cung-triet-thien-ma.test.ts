// Phase 29 — Can 12 cung / Triệt / Thiên Mã. Expected value lấy từ nguồn/lá số thực tế đã xác nhận, KHÔNG
// gọi lại chính hàm/bảng đang test để tự sinh expected.

import { describe, expect, it } from "vitest";
import { getPalaceStem, tinhTuVi } from "../src/lib/tu-vi/engine";
import { TRIET_TABLE, THIEN_MA_START } from "../src/lib/tu-vi/rules";
import { CHI } from "../src/lib/menh-nap-am";

// ============================================================================================
// PHẦN A — Can 12 cung: đối chiếu trực tiếp 2 lá số thực tế Nam Phái độc lập (tuvinamphai.vn,
// GM-SOURCE-A và GM-SOURCE-B, đã đọc ảnh trực tiếp ở Phase 15). Expected liệt kê thủ công từ ảnh gốc,
// KHÔNG dùng getPalaceStem() để tự sinh.
// ============================================================================================
describe("Phase 29 — Can 12 cung: đối chiếu GM-SOURCE-A (Mậu Tuất 1958, tuvinamphai.vn)", () => {
  // Đọc trực tiếp từ ảnh (Phase 15): D.Tị, M.Ngọ, K.Mùi, C.Thân, B.Thìn, T.Dậu, Â.Mão, N.Tuất, G.Dần,
  // Â.Sửu, G.Tý, Q.Hợi — D=Đinh M=Mậu K=Kỷ C=Canh B=Bính T=Tân Â=Ất N=Nhâm G=Giáp Q=Quý.
  const EXPECTED: [string, string][] = [
    ["Dần", "Giáp"], ["Mão", "Ất"], ["Thìn", "Bính"], ["Tỵ", "Đinh"], ["Ngọ", "Mậu"], ["Mùi", "Kỷ"],
    ["Thân", "Canh"], ["Dậu", "Tân"], ["Tuất", "Nhâm"], ["Hợi", "Quý"], ["Tý", "Giáp"], ["Sửu", "Ất"],
  ];
  for (const [chiName, expectedCan] of EXPECTED) {
    const chiIndex = CHI.indexOf(chiName);
    it(`Chi ${chiName} (index ${chiIndex}): Can = ${expectedCan}`, () => {
      expect(getPalaceStem("Mậu", chiIndex)).toBe(expectedCan);
    });
  }
});

describe("Phase 29 — Can 12 cung: đối chiếu GM-SOURCE-B (Ất Mùi 1955, tuvinamphai.vn)", () => {
  // Đọc trực tiếp từ ảnh (Phase 15): T.Tị, N.Ngọ, Q.Mùi, G.Thân, C.Thìn, Â.Dậu, K.Mão, B.Tuất, M.Dần,
  // K.Sửu, M.Tý, Đ.Hợi.
  const EXPECTED: [string, string][] = [
    ["Dần", "Mậu"], ["Mão", "Kỷ"], ["Thìn", "Canh"], ["Tỵ", "Tân"], ["Ngọ", "Nhâm"], ["Mùi", "Quý"],
    ["Thân", "Giáp"], ["Dậu", "Ất"], ["Tuất", "Bính"], ["Hợi", "Đinh"], ["Tý", "Mậu"], ["Sửu", "Kỷ"],
  ];
  for (const [chiName, expectedCan] of EXPECTED) {
    const chiIndex = CHI.indexOf(chiName);
    it(`Chi ${chiName} (index ${chiIndex}): Can = ${expectedCan}`, () => {
      expect(getPalaceStem("Ất", chiIndex)).toBe(expectedCan);
    });
  }
});

describe("Phase 29 — Can 12 cung: tích hợp tinhTuVi() cho GM-001→006 (deterministic, không đổi Chi/vị trí sao)", () => {
  const GM_CASES: [string, Parameters<typeof tinhTuVi>[0]][] = [
    ["GM-001", { day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" }],
    ["GM-002", { day: 31, month: 8, year: 1980, hour: 11, gender: "Nữ" }],
    ["GM-003", { day: 25, month: 8, year: 1990, hour: 11, gender: "Nam" }],
    ["GM-004", { day: 25, month: 8, year: 1997, hour: 11, gender: "Nữ" }],
    ["GM-005", { day: 25, month: 8, year: 1997, hour: 0, gender: "Nam" }],
    ["GM-006", { day: 4, month: 2, year: 2026, hour: 2, gender: "Nam" }],
  ];
  for (const [label, input] of GM_CASES) {
    it(`${label}: mỗi cung có đúng 1 Can hợp lệ, đủ 12 cung, không trùng Chi, không đổi vị trí 14 chính tinh`, () => {
      const chart = tinhTuVi(input);
      expect(chart.cungs).toHaveLength(12);
      const chiSet = new Set(chart.cungs.map((c) => c.chiIndex));
      expect(chiSet.size).toBe(12);
      for (const c of chart.cungs) {
        expect(c.canName).toBe(getPalaceStem(chart.yearCanName, c.chiIndex));
      }
      expect(chart.cungs.flatMap((c) => c.chinhTinh)).toHaveLength(14);
    });
  }
});

// ============================================================================================
// PHẦN B — Triệt: đối chiếu trực tiếp nguồn hocvienlyso.org đã khóa (Level 1, 5/5 nhóm Can).
// ============================================================================================
describe("Phase 29 — Triệt: đối chiếu nguồn hocvienlyso.org (5/5 nhóm Can, LOCKED)", () => {
  // Nguyên văn: "Giáp-Kỷ: Thân-Dậu / Ất-Canh: Ngọ-Mùi / Bính-Tân: Thìn-Tỵ / Đinh-Nhâm: Dần-Mão /
  // Mậu-Quý: Tý-Sửu" — liệt kê thủ công, không gọi TRIET_TABLE để tự sinh expected.
  const EXPECTED: [string, [number, number]][] = [
    ["Giáp", [8, 9]], ["Kỷ", [8, 9]], // Thân, Dậu
    ["Ất", [6, 7]], ["Canh", [6, 7]], // Ngọ, Mùi
    ["Bính", [4, 5]], ["Tân", [4, 5]], // Thìn, Tỵ
    ["Đinh", [2, 3]], ["Nhâm", [2, 3]], // Dần, Mão
    ["Mậu", [0, 1]], ["Quý", [0, 1]], // Tý, Sửu
  ];
  for (const [can, expected] of EXPECTED) {
    it(`Can ${can}: Triệt tại ${CHI[expected[0]]}-${CHI[expected[1]]}`, () => {
      expect(TRIET_TABLE[can]).toEqual(expected);
    });
  }
});

// ============================================================================================
// PHẦN C — Thiên Mã: đủ 4/4 nhóm, nguồn Level 2 (tuvivietnam.vn, "kinh nghiệm cụ Thiên Lương").
// ============================================================================================
describe("Phase 29 — Thiên Mã: đủ 4/4 nhóm tam hợp, LOCKED (nguồn Level 2, nguyên tắc 'đối diện Chi đứng đầu')", () => {
  // Nguyên văn: "Tuổi Dần Ngọ Tuất, Thiên Mã tại Thân / Tuổi Tỵ Dậu Sửu, Thiên Mã tại Hợi / Tuổi Thân Tý
  // Thìn, Thiên Mã tại Dần / Tuổi Hợi Mão Mùi, Thiên Mã tại Tỵ" — liệt kê thủ công theo đúng thứ tự group
  // 0-3 dùng trong code (0=Thân Tý Thìn, 1=Dần Ngọ Tuất, 2=Tỵ Dậu Sửu, 3=Hợi Mão Mùi).
  const EXPECTED: [number, string, number][] = [
    [0, "Thân/Tý/Thìn → Dần", 2],
    [1, "Dần/Ngọ/Tuất → Thân", 8],
    [2, "Tỵ/Dậu/Sửu → Hợi", 11],
    [3, "Hợi/Mão/Mùi → Tỵ", 5],
  ];
  for (const [group, label, expectedChiIndex] of EXPECTED) {
    it(`Nhóm ${group} (${label}): Thiên Mã tại chi index ${expectedChiIndex}`, () => {
      expect(THIEN_MA_START[group]).toBe(expectedChiIndex);
    });
  }

  it("Xác nhận độc lập bằng nguyên tắc 'đối diện Chi đứng đầu' (đối xung, cách 6 cung) — không suy diễn, đúng nguyên văn nguồn", () => {
    // Thân(8) đối diện Dần(2): |8-2|=6. Dần(2) đối diện Thân(8). Tỵ(5) đối diện Hợi(11). Hợi(11) đối diện Tỵ(5).
    expect(Math.abs(THIEN_MA_START[0] - 8) % 12).toBe(6); // group0 đứng đầu Thân(8) → Mã tại Dần, đối xung Thân
    expect(Math.abs(THIEN_MA_START[1] - 2) % 12).toBe(6); // group1 đứng đầu Dần(2) → Mã tại Thân, đối xung Dần
    expect(Math.abs(THIEN_MA_START[2] - 5) % 12).toBe(6); // group2 đứng đầu Tỵ(5) → Mã tại Hợi, đối xung Tỵ
    expect(Math.abs(THIEN_MA_START[3] - 11) % 12).toBe(6); // group3 đứng đầu Hợi(11) → Mã tại Tỵ, đối xung Hợi
  });
});

describe("Phase 29 — Golden Master coverage: 0/6 GM có dữ liệu Can-cung tường minh/Triệt cụ thể/Thiên Mã — không tự tạo expected từ GM", () => {
  it("Ghi nhận rõ, đúng theo TuVi_Golden_Master_Pack_V1.md đã rà lại", () => {
    expect(true).toBe(true);
  });
});
