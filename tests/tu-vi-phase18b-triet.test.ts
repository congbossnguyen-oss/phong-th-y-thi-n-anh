// Phase 18B — mục IV: Triệt đã có implementation (rules.ts §32) nhưng 0 test coverage (phát hiện ở
// Phase 18A). KHÔNG đổi công thức — test này chỉ kiểm chứng BEHAVIOR HIỆN TẠI (self-consistency), KHÔNG
// khẳng định đúng/sai vì không có Golden Master nào cho cặp Chi cụ thể (0/6, xem
// docs/TUVI_PHASE18A_PHU_TINH_AUDIT.md mục 5). Nếu phát hiện sai lệch nội bộ, phải ghi BUG_NEEDS_REVIEW,
// không tự sửa — nhưng dưới đây không có sai lệch nào (chỉ xác nhận engine khớp đúng TRIET_TABLE).

import { describe, expect, it } from "vitest";
import { tinhTuVi } from "../src/lib/tu-vi/engine";
import { TRIET_TABLE } from "../src/lib/tu-vi/rules";

const CAN_YEARS: [string, number][] = [
  ["Giáp", 1984], ["Ất", 1985], ["Bính", 1986], ["Đinh", 1987], ["Mậu", 1988],
  ["Kỷ", 1989], ["Canh", 1990], ["Tân", 1991], ["Nhâm", 1992], ["Quý", 1993],
];

function trietChiIndicesOf(chart: ReturnType<typeof tinhTuVi>): number[] {
  return chart.cungs.filter((c) => c.triet).map((c) => c.chiIndex).sort((a, b) => a - b);
}

describe("Phase 18B — Triệt: kiểm chứng behavior hiện tại theo Can năm (KHÔNG có Golden Master độc lập)", () => {
  for (const [can, year] of CAN_YEARS) {
    it(`Can ${can} (năm ${year}): đúng 2 cung có triet=true, khớp TRIET_TABLE['${can}']`, () => {
      const chart = tinhTuVi({ day: 15, month: 6, year, hour: 11, gender: "Nam", viewingYear: 2026 });
      expect(chart.yearCanName).toBe(can);
      const expected = [...TRIET_TABLE[can]].sort((a, b) => a - b);
      expect(trietChiIndicesOf(chart)).toEqual(expected);
    });
  }

  it("Đúng 10 cung còn lại KHÔNG có triet=true (chỉ đúng 2/12 cung bị Triệt)", () => {
    const chart = tinhTuVi({ day: 15, month: 6, year: 1990, hour: 11, gender: "Nam" });
    const trietCount = chart.cungs.filter((c) => c.triet).length;
    expect(trietCount).toBe(2);
  });

  it("5 nhóm Can chia sẻ đúng cặp Triệt (khớp cấu trúc spec §32 — 5 nhóm Can, không kèm cặp Chi cụ thể)", () => {
    expect(TRIET_TABLE["Giáp"]).toEqual(TRIET_TABLE["Kỷ"]);
    expect(TRIET_TABLE["Ất"]).toEqual(TRIET_TABLE["Canh"]);
    expect(TRIET_TABLE["Bính"]).toEqual(TRIET_TABLE["Tân"]);
    expect(TRIET_TABLE["Đinh"]).toEqual(TRIET_TABLE["Nhâm"]);
    expect(TRIET_TABLE["Mậu"]).toEqual(TRIET_TABLE["Quý"]);
  });

  it("Triệt không phụ thuộc giới tính (structural isolation — chỉ phụ thuộc Can năm)", () => {
    const nam = tinhTuVi({ day: 15, month: 6, year: 1990, hour: 11, gender: "Nam" });
    const nu = tinhTuVi({ day: 15, month: 6, year: 1990, hour: 11, gender: "Nữ" });
    expect(trietChiIndicesOf(nam)).toEqual(trietChiIndicesOf(nu));
  });

  it("Triệt không phụ thuộc giờ sinh (structural isolation — chỉ phụ thuộc Can năm)", () => {
    const gioNgo = tinhTuVi({ day: 15, month: 6, year: 1990, hour: 11, gender: "Nam" });
    const gioTy = tinhTuVi({ day: 15, month: 6, year: 1990, hour: 23, gender: "Nam" });
    expect(trietChiIndicesOf(gioNgo)).toEqual(trietChiIndicesOf(gioTy));
  });

  // GM-006 (docs/TuVi_Golden_Master_Pack_V1.md) chỉ ghi "Triệt: theo bảng Can Ất", KHÔNG cho cặp Chi cụ
  // thể — không đủ để làm Golden Master độc lập, chỉ xác nhận engine tự nhất quán với TRIET_TABLE["Ất"].
  it("GM-006 (Ất Tỵ, 04/02/2026): không có cặp Chi cụ thể để đối chiếu độc lập — chỉ xác nhận tự nhất quán với TRIET_TABLE", () => {
    const chart = tinhTuVi({ day: 4, month: 2, year: 2026, hour: 2, gender: "Nam", viewingYear: 2026 });
    expect(chart.yearCanName).toBe("Ất");
    expect(trietChiIndicesOf(chart)).toEqual([...TRIET_TABLE["Ất"]].sort((a, b) => a - b));
  });
});
