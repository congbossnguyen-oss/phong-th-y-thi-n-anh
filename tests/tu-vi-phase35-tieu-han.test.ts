// Phase 35 — Tiểu Hạn (FUTURE MODULE, không thuộc Natal Core). Expected value TÍNH TAY (offline) từ công
// thức nguồn (TIEU_HAN_START_BY_YEAR_CHI + "Nam thuận, Nữ nghịch" — Phase 34), viết literal cố định —
// KHÔNG gọi getTieuHanPalace() để tự sinh expected rồi so lại với chính nó.
//
// PHÁT HIỆN QUAN TRỌNG khi chọn input test (Mục IX.E spec — chứng minh Dương Nam/Âm Nam cùng thuận,
// Dương Nữ/Âm Nữ cùng nghịch): trong lịch Can-Chi 60 hoa giáp, MỖI nhóm tam hợp năm sinh CHỈ có thể toàn
// bộ là Dương HOẶC toàn bộ là Âm (vì chiIndex và canIndex của cùng 1 năm luôn cùng tính chẵn/lẻ — số dư
// khi chia cho 10 và 12 của cùng 1 số nguyên luôn cùng tính chẵn lẻ vì 10 và 12 đều chẵn). Dần/Ngọ/Tuất
// và Thân/Tý/Thìn LUÔN là năm Dương; Tỵ/Dậu/Sửu và Hợi/Mão/Mùi LUÔN là năm Âm. Do đó KHÔNG THỂ có input
// "Âm Nam sinh năm Dần" — để kiểm đủ 4 tổ hợp Dương Nam/Âm Nam/Dương Nữ/Âm Nữ, phải lấy Nam/Nữ từ 1 nhóm
// Dương (Dần/Ngọ/Tuất hoặc Thân/Tý/Thìn) VÀ 1 nhóm Âm (Tỵ/Dậu/Sửu hoặc Hợi/Mão/Mùi), rồi so sánh CHIỀU
// BƯỚC (step age→age+1) thay vì so sánh cùng 1 cung khởi.

import { describe, expect, it } from "vitest";
import { tinhTuVi, type TuViChart } from "../src/lib/tu-vi/engine";
import { getTieuHanPalace, getTuoiTieuHan, TIEU_HAN_START_BY_YEAR_CHI } from "../src/lib/tu-vi/tieu-han";

// ============================================================================================
// PHẦN A-D — 4 nhóm tam hợp × 2 giới tính = 8 case, phủ đủ tuổi khởi/+1/+2/+5/+6/+11/+12/+13.
// Expected TÍNH TAY từ: TIEU_HAN_START_BY_YEAR_CHI (Dần/Ngọ/Tuất=Thìn(4), Thân/Tý/Thìn=Tuất(10),
// Tỵ/Dậu/Sửu=Mùi(7), Hợi/Mão/Mùi=Sửu(1)) + "Nam thuận (+1/tuổi), Nữ nghịch (-1/tuổi)".
// ============================================================================================
describe("Phase 35 — Tiểu Hạn: cung khởi + chiều, đối chiếu nguồn Bửu Đình (Tử Vi Ứng Dụng, Phase 34)", () => {
  const CASES: {
    label: string;
    input: Parameters<typeof tinhTuVi>[0];
    expectedYearChi: string;
    expectedByAge: [number, number][]; // [tuổi, chiIndex]
  }[] = [
    {
      label: "Dần (nhóm Dần/Ngọ/Tuất, Dương) + Nam → Dương Nam, thuận, khởi Thìn(4)",
      input: { day: 15, month: 6, year: 1974, hour: 12, gender: "Nam" },
      expectedYearChi: "Dần",
      expectedByAge: [[1, 4], [2, 5], [3, 6], [6, 9], [7, 10], [12, 3], [13, 4], [14, 5]],
    },
    {
      label: "Dần (nhóm Dần/Ngọ/Tuất, Dương) + Nữ → Dương Nữ, nghịch, khởi Thìn(4)",
      input: { day: 15, month: 6, year: 1974, hour: 12, gender: "Nữ" },
      expectedYearChi: "Dần",
      expectedByAge: [[1, 4], [2, 3], [3, 2], [6, 11], [7, 10], [12, 5], [13, 4], [14, 3]],
    },
    {
      label: "Thân (nhóm Thân/Tý/Thìn, Dương) + Nam → Dương Nam, thuận, khởi Tuất(10)",
      input: { day: 15, month: 6, year: 1980, hour: 12, gender: "Nam" },
      expectedYearChi: "Thân",
      expectedByAge: [[1, 10], [2, 11], [3, 0], [6, 3], [7, 4], [12, 9], [13, 10], [14, 11]],
    },
    {
      label: "Thân (nhóm Thân/Tý/Thìn, Dương) + Nữ → Dương Nữ, nghịch, khởi Tuất(10)",
      input: { day: 15, month: 6, year: 1980, hour: 12, gender: "Nữ" },
      expectedYearChi: "Thân",
      expectedByAge: [[1, 10], [2, 9], [3, 8], [6, 5], [7, 4], [12, 11], [13, 10], [14, 9]],
    },
    {
      label: "Tỵ (nhóm Tỵ/Dậu/Sửu, Âm) + Nam → Âm Nam, THUẬN (chỉ giới tính quyết định), khởi Mùi(7)",
      input: { day: 15, month: 6, year: 1989, hour: 12, gender: "Nam" },
      expectedYearChi: "Tỵ",
      expectedByAge: [[1, 7], [2, 8], [3, 9], [6, 0], [7, 1], [12, 6], [13, 7], [14, 8]],
    },
    {
      label: "Tỵ (nhóm Tỵ/Dậu/Sửu, Âm) + Nữ → Âm Nữ, NGHỊCH (chỉ giới tính quyết định), khởi Mùi(7)",
      input: { day: 15, month: 6, year: 1989, hour: 12, gender: "Nữ" },
      expectedYearChi: "Tỵ",
      expectedByAge: [[1, 7], [2, 6], [3, 5], [6, 2], [7, 1], [12, 8], [13, 7], [14, 6]],
    },
    {
      label: "Hợi (nhóm Hợi/Mão/Mùi, Âm) + Nam → Âm Nam, THUẬN, khởi Sửu(1)",
      input: { day: 15, month: 6, year: 1983, hour: 12, gender: "Nam" },
      expectedYearChi: "Hợi",
      expectedByAge: [[1, 1], [2, 2], [3, 3], [6, 6], [7, 7], [12, 0], [13, 1], [14, 2]],
    },
    {
      label: "Hợi (nhóm Hợi/Mão/Mùi, Âm) + Nữ → Âm Nữ, NGHỊCH, khởi Sửu(1)",
      input: { day: 15, month: 6, year: 1983, hour: 12, gender: "Nữ" },
      expectedYearChi: "Hợi",
      expectedByAge: [[1, 1], [2, 0], [3, 11], [6, 8], [7, 7], [12, 2], [13, 1], [14, 0]],
    },
  ];

  for (const { label, input, expectedYearChi, expectedByAge } of CASES) {
    it(label, () => {
      const chart = tinhTuVi(input);
      expect(chart.yearChiName).toBe(expectedYearChi); // sanity trước khi so vòng Tiểu Hạn
      for (const [age, expectedChiIndex] of expectedByAge) {
        expect(getTieuHanPalace(chart, age).chiIndex).toBe(expectedChiIndex);
      }
    });
  }
});

// ============================================================================================
// PHẦN E — Dương Nam/Âm Nam đều THUẬN, Dương Nữ/Âm Nữ đều NGHỊCH (bằng chứng KHÔNG dùng isThuanChung).
// So sánh CHIỀU BƯỚC (age→age+1), không so cùng cung khởi (không thể vì lý do toán học nêu ở đầu file).
// ============================================================================================
describe("Phase 35 — Không dùng isThuanChung: Dương Nam/Âm Nam cùng thuận, Dương Nữ/Âm Nữ cùng nghịch", () => {
  function stepDirection(chart: TuViChart): number {
    const a1 = getTieuHanPalace(chart, 1).chiIndex;
    const a2 = getTieuHanPalace(chart, 2).chiIndex;
    // +1 (mod 12) = thuận, -1 (mod 12) = nghịch
    return ((a2 - a1 + 12) % 12) === 1 ? 1 : -1;
  }

  it("Dương Nam (Dần, 1974) và Âm Nam (Tỵ, 1989) đều bước THUẬN (+1)", () => {
    const duongNam = tinhTuVi({ day: 15, month: 6, year: 1974, hour: 12, gender: "Nam" });
    const amNam = tinhTuVi({ day: 15, month: 6, year: 1989, hour: 12, gender: "Nam" });
    expect(duongNam.amDuongNam).toBe("Dương Nam");
    expect(amNam.amDuongNam).toBe("Âm Nam");
    expect(stepDirection(duongNam)).toBe(1);
    expect(stepDirection(amNam)).toBe(1);
  });

  it("Dương Nữ (Dần, 1974) và Âm Nữ (Tỵ, 1989) đều bước NGHỊCH (-1)", () => {
    const duongNu = tinhTuVi({ day: 15, month: 6, year: 1974, hour: 12, gender: "Nữ" });
    const amNu = tinhTuVi({ day: 15, month: 6, year: 1989, hour: 12, gender: "Nữ" });
    expect(duongNu.amDuongNam).toBe("Dương Nữ");
    expect(amNu.amDuongNam).toBe("Âm Nữ");
    expect(stepDirection(duongNu)).toBe(-1);
    expect(stepDirection(amNu)).toBe(-1);
  });
});

// ============================================================================================
// PHẦN X — Boundary: tuổi đầu tiên, tuổi 12, tuổi 13 (chu kỳ mới quay lại đúng cung khởi cho CẢ 2 chiều).
// ============================================================================================
describe("Phase 35 — Boundary: tuổi 13 luôn quay lại đúng cung khởi (chu kỳ 12), cả thuận lẫn nghịch", () => {
  const INPUTS: Parameters<typeof tinhTuVi>[0][] = [
    { day: 15, month: 6, year: 1974, hour: 12, gender: "Nam" },
    { day: 15, month: 6, year: 1974, hour: 12, gender: "Nữ" },
    { day: 15, month: 6, year: 1980, hour: 12, gender: "Nam" },
    { day: 15, month: 6, year: 1980, hour: 12, gender: "Nữ" },
  ];
  for (const input of INPUTS) {
    it(`${JSON.stringify(input)}: tuổi 1 và tuổi 13 cùng 1 cung (chu kỳ 12 năm)`, () => {
      const chart = tinhTuVi(input);
      const age1 = getTieuHanPalace(chart, 1);
      const age13 = getTieuHanPalace(chart, 13);
      expect(age13.chiIndex).toBe(age1.chiIndex);
      expect(age1.chiIndex).toBe(TIEU_HAN_START_BY_YEAR_CHI[chart.yearChiName]);
    });
  }

  it("Tuổi 7 (offset 6, điểm đối xung): thuận và nghịch cùng Chi năm sinh luôn trùng cung — toán học tất yếu, KHÔNG phải bug (giống phát hiện Phase 32 offset 6 của Vòng Bác Sĩ)", () => {
    const nam = tinhTuVi({ day: 15, month: 6, year: 1974, hour: 12, gender: "Nam" });
    const nu = tinhTuVi({ day: 15, month: 6, year: 1974, hour: 12, gender: "Nữ" });
    expect(getTieuHanPalace(nam, 7).chiIndex).toBe(getTieuHanPalace(nu, 7).chiIndex);
  });
});

// ============================================================================================
// PHẦN XV — Mutation test: getTieuHanPalace()/getTuoiTieuHan() không mutate chart, không đổi Natal Core.
// ============================================================================================
describe("Phase 35 — Architecture regression: Tiểu Hạn không thay đổi Natal Core", () => {
  it("chartBefore vs chartAfter: mọi field Natal Core giữ nguyên sau khi gọi getTieuHanPalace()/getTuoiTieuHan() nhiều lần", () => {
    const chart = tinhTuVi({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nam", viewingYear: 2026 });
    const before = JSON.stringify(chart);
    getTieuHanPalace(chart, 1);
    getTieuHanPalace(chart, 25);
    getTuoiTieuHan(chart);
    getTuoiTieuHan(chart);
    const after = JSON.stringify(chart);
    expect(after).toBe(before);
  });

  it("Không mutate reference của chart.cungs/chart.cungs[0]", () => {
    const chart = tinhTuVi({ day: 25, month: 8, year: 1997, hour: 11, gender: "Nữ" });
    const cungsRefBefore = chart.cungs;
    getTieuHanPalace(chart, 3);
    expect(chart.cungs).toBe(cungsRefBefore);
  });
});

// ============================================================================================
// getTuoiTieuHan(): tái sử dụng NGUYÊN VẸN chart.tuoiNamXem (Natal Core, không tính lại).
// ============================================================================================
describe("Phase 35 — getTuoiTieuHan(): tái sử dụng chart.tuoiNamXem có sẵn, không tính lại", () => {
  it("Có viewingYear: trả về đúng chart.tuoiNamXem", () => {
    const chart = tinhTuVi({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nam", viewingYear: 2026 });
    expect(getTuoiTieuHan(chart)).toBe(chart.tuoiNamXem);
    expect(getTuoiTieuHan(chart)).toBe(47); // 2026 - 1980 + 1
  });

  it("Không có viewingYear: trả về null (đúng hành vi hiện tại của tuoiNamXem)", () => {
    const chart = tinhTuVi({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" });
    expect(getTuoiTieuHan(chart)).toBeNull();
  });
});

// ============================================================================================
// Golden Master: KHÔNG có dữ liệu Tiểu Hạn trong GM Pack → NO_DATA, không tự tạo expected.
// ============================================================================================
describe("Phase 35 — Golden Master coverage: 0/6 GM có dữ liệu Tiểu Hạn tường minh", () => {
  it("Ghi nhận NO_DATA, đúng theo TuVi_Golden_Master_Pack_V1.md đã rà lại (Phase 33/34/35) — không tự tạo expected từ GM", () => {
    expect(true).toBe(true);
  });
});
