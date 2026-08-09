// Golden Test — Trường Sinh Lục Hào (growthDay / growthMonth)
//
// Nguồn: "kinh dịch lục hào sơ cấp minh việt" (2 bản OCR độc lập, mục "VI. AN VÒNG TRƯỜNG SINH"),
// số liệu khớp byte-identical giữa 2 bản. Ví dụ: ngày Quý Hợi, tháng Mão, quẻ Hỏa Thiên Đại Hữu.
//
// Công thức: Ngũ Hành của Chi hào -> khởi Trường Sinh theo LUC_HAO_TAM_HOP_START (5 Ngũ Hành, KHÔNG
// dùng chung bảng khởi 10-Can của Bát Tự) -> đi THUẬN 12 vị trí -> đối chiếu Chi Ngày (growthDay) /
// Chi Tháng (growthMonth). Đặc biệt khóa quy ước Thổ khởi tại Thân (hào 3, hào 5 — không phải Dần
// như trong Bát Tự).

import { describe, expect, it } from "vitest";
import { CAN, CHI } from "../src/lib/menh-nap-am";
import { lapQueDayDu, type LineVal } from "../src/lib/luc-hao";

// Hỏa Thiên Đại Hữu = thượng Ly (Hỏa), hạ Càn (Trời) — lines hào 1->6 (dưới lên).
const LINES: [LineVal, LineVal, LineVal, LineVal, LineVal, LineVal] = [1, 1, 1, 1, 0, 1];

const DAY_CAN_INDEX = CAN.indexOf("Quý");
const DAY_CHI_INDEX = CHI.indexOf("Hợi");
const MONTH_CHI_INDEX = CHI.indexOf("Mão");

interface GoldenHao {
  hao: number;
  chi: string;
  nguHanh: string;
  growthDay: string;
  growthMonth: string;
}

const GOLDEN_HAO: GoldenHao[] = [
  { hao: 1, chi: "Tý", nguHanh: "Thủy", growthDay: "Lâm Quan", growthMonth: "Tử" },
  { hao: 2, chi: "Dần", nguHanh: "Mộc", growthDay: "Trường Sinh", growthMonth: "Đế Vượng" },
  { hao: 3, chi: "Thìn", nguHanh: "Thổ", growthDay: "Lâm Quan", growthMonth: "Tử" },
  { hao: 4, chi: "Dậu", nguHanh: "Kim", growthDay: "Bệnh", growthMonth: "Thai" },
  { hao: 5, chi: "Mùi", nguHanh: "Thổ", growthDay: "Lâm Quan", growthMonth: "Tử" },
  { hao: 6, chi: "Tị" /* Tỵ */, nguHanh: "Hỏa", growthDay: "Tuyệt", growthMonth: "Mộc Dục" },
];

describe("Trường Sinh Lục Hào — Golden Test (Hỏa Thiên Đại Hữu, ngày Quý Hợi, tháng Mão)", () => {
  const que = lapQueDayDu(LINES, DAY_CAN_INDEX, [], MONTH_CHI_INDEX, null, DAY_CHI_INDEX);

  it("quẻ và Chi từng hào khớp Nạp Giáp hiện có (tiền đề của Golden Test)", () => {
    expect(que.name).toBe("Hỏa Thiên Đại Hữu");
    for (const g of GOLDEN_HAO) {
      const h = que.hao[g.hao - 1];
      expect(CHI[h.chiIndex]).toBe(g.chi === "Tị" ? "Tỵ" : g.chi);
      expect(h.nguHanh).toBe(g.nguHanh);
    }
  });

  for (const g of GOLDEN_HAO) {
    it(`hào ${g.hao} (${g.chi} ${g.nguHanh}) -> growthDay=${g.growthDay}, growthMonth=${g.growthMonth}`, () => {
      const h = que.hao[g.hao - 1];
      expect(h.growthDay).toBe(g.growthDay);
      expect(h.growthMonth).toBe(g.growthMonth);
    });
  }

  it("khóa quy ước Thổ khởi Trường Sinh tại Thân (hào 3 và hào 5 phải bằng nhau, khác quy ước Bát Tự)", () => {
    const h3 = que.hao[2]; // hào 3, Thìn thổ
    const h5 = que.hao[4]; // hào 5, Mùi thổ
    expect(h3.growthDay).toBe("Lâm Quan");
    expect(h3.growthMonth).toBe("Tử");
    expect(h5.growthDay).toBe("Lâm Quan");
    expect(h5.growthMonth).toBe("Tử");
  });
});
