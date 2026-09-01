import { describe, it, expect } from "vitest";
import { tinhBatTu } from "../src/lib/bat-tu";
import { phanTichBatTu, type TuTruInput } from "../src/lib/bat-tu-engine/engine";
import { findingsH } from "../src/lib/luan-giai-toan-dien/findings-co-ban";
import { findingsF, findingsI } from "../src/lib/luan-giai-toan-dien/findings-nang-cao";
import { tinhMatTacDungTheoTru, coMatTacDung } from "../src/lib/luan-giai-toan-dien/than-sat-mat-tac-dung";

// Chống tái diễn lỗi 1/9/2026: Giai đoạn H nói cung phối ngẫu (trụ Ngày) "không bị hình/hại" trong
// khi D/F/I/L nói CÓ — do H tự so chi RAW không qua chiChuan (trượt Tị/Tỵ). Nay mọi giai đoạn đọc
// CHUNG 1 nguồn (tinhMatTacDungTheoTru). Test khoá tính nhất quán này.

function phanTich(input: Parameters<typeof tinhBatTu>[0]) {
  const chart = tinhBatTu(input);
  const tt: TuTruInput = {
    nam: { can: chart.year.can, chi: chart.year.chi },
    thang: { can: chart.month.can, chi: chart.month.chi },
    ngay: { can: chart.day.can, chi: chart.day.chi },
    gio: { can: chart.hour.can, chi: chart.hour.chi },
    gioiTinh: input.gender === "Nam" ? "Nam" : "Nữ",
  };
  return { chart, analysis: phanTichBatTu(tt) };
}

describe("Hình/Xung/Hại — nhất quán giữa H và D/F/I", () => {
  it("lá số Hà (Dần-Thân-Tỵ-Tuất, Nữ): trụ Ngày CÓ Hình + Hại, H phải khớp", () => {
    const { chart, analysis } = phanTich({ year: 1998, month: 8, day: 14, hour: 20, gender: "Nữ" });
    const mat = tinhMatTacDungTheoTru(chart);
    expect(mat.day.hinh).toBe(true);
    expect(mat.day.hai).toBe(true);

    const H = findingsH(chart, analysis).ketQua as Record<string, unknown>;
    expect(H.cungPhoiNgauBiHinh).toBe(mat.day.hinh);
    expect(H.cungPhoiNgauBiHai).toBe(mat.day.hai);
    expect(H.cungPhoiNgauBiXung).toBe(mat.day.xung);

    const I = findingsI(chart, analysis).ketQua as Record<string, unknown>;
    expect(I.nhatChuBiXungHinhHai).toBe(coMatTacDung(mat.day)); // I và H cùng phản ánh trụ Ngày
  });

  it("cờ trụ Ngày của H luôn khớp tinhMatTacDungTheoTru trên nhiều lá số ngẫu nhiên", () => {
    const cases: Parameters<typeof tinhBatTu>[0][] = [
      { year: 1990, month: 3, day: 13, hour: 9, gender: "Nam" },
      { year: 1984, month: 11, day: 22, hour: 3, gender: "Nam" },
      { year: 1998, month: 8, day: 14, hour: 20, gender: "Nữ" },
      { year: 2000, month: 1, day: 1, hour: 0, gender: "Nữ" },
      { year: 1975, month: 6, day: 15, hour: 14, gender: "Nam" },
      { year: 1966, month: 9, day: 9, hour: 22, gender: "Nữ" },
    ];
    for (const c of cases) {
      const { chart, analysis } = phanTich(c);
      const mat = tinhMatTacDungTheoTru(chart);
      const H = findingsH(chart, analysis).ketQua as Record<string, unknown>;
      expect(H.cungPhoiNgauBiXung, `${JSON.stringify(c)} xung`).toBe(mat.day.xung);
      expect(H.cungPhoiNgauBiHinh, `${JSON.stringify(c)} hinh`).toBe(mat.day.hinh);
      expect(H.cungPhoiNgauBiHai, `${JSON.stringify(c)} hai`).toBe(mat.day.hai);
    }
  });
});
