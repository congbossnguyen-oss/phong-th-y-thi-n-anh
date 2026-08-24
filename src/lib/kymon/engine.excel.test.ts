import { beforeAll, describe, expect, it } from "vitest";
import { lapLaBan } from "./engine";
import type { LapLaBanResult } from "./types";

// Bàn phục ngâm 08:46 08/09/2021 (giờ Mậu Thìn, cục Âm 6, phù đầu Mậu) — đối chiếu Excel gốc
// (KM ung dung 1.1.xlsx, sheet KỲ MÔN). Excel cho phục ngâm toàn bàn: thiên can = địa can,
// sao ở nhà, thần khởi Trực Phù tại Càn(6).
describe("engine — đối chiếu Excel gốc (phục ngâm, giờ Mậu)", () => {
  let r: LapLaBanResult;
  let by: Map<number, LapLaBanResult["cungList"][number]>;
  beforeAll(async () => {
    r = await lapLaBan({ nam: 2021, thang: 9, ngay: 8, gio: 8, phut: 46 });
    by = new Map(r.cungList.map((c) => [c.soCung, c]));
  });
  // Excel: [soCung] -> {thien, sao, than}
  const EXCEL: Record<number, { thien: string; sao: string; than: string }> = {
    4: { thien: "Canh", sao: "T.Phò", than: "B.Hổ" }, // Tốn
    9: { thien: "Đinh", sao: "T.Anh", than: "L.Hợp" }, // Ly
    2: { thien: "Nhâm", sao: "T.Nhuế", than: "T.Âm" }, // Khôn
    3: { thien: "Tân", sao: "T.Xung", than: "H.Vũ" }, // Chấn
    7: { thien: "Ất", sao: "T.Trụ", than: "Đ.Xà" }, // Đoài
    8: { thien: "Bính", sao: "T.Nhậm", than: "C.Địa" }, // Cấn
    1: { thien: "Quý", sao: "T.Bồng", than: "C.Thiên" }, // Khảm
    6: { thien: "Mậu", sao: "T.Tâm", than: "T.Phù" }, // Càn
  };
  it("khớp thiên can / sao / thần 8 cung ngoài", () => {
    for (const [soCungStr, ex] of Object.entries(EXCEL)) {
      const c = by.get(Number(soCungStr))!;
      expect({ cung: soCungStr, thien: c.thienBanCan, sao: c.saoThienBan, than: c.than }).toEqual({
        cung: soCungStr,
        thien: ex.thien,
        sao: ex.sao,
        than: ex.than,
      });
    }
  });
  it("là phục ngâm: thiên can = địa can ở 8 cung ngoài", () => {
    for (const soCung of [1, 2, 3, 4, 6, 7, 8, 9]) {
      const c = by.get(soCung)!;
      expect(c.thienBanCan).toBe(c.diaBanCan);
    }
  });
});
