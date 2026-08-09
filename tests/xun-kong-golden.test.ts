// Golden Test — xunKong per-hào
//
// Dùng lại đúng quẻ đã dùng ở Golden Test C1 (New OCR dòng 2281-2296, "VD1: Xem lên chức"): Bát Thuần
// Cấn, ngày Bính Thân, tháng Dần. Nguồn xác nhận trực tiếp: "Hiện nay Thìn thổ tuần không" — hào 1
// (Thìn) đang Tuần Không. Tuần Giáp Ngọ (chứa ngày Bính Thân) có 2 Chi rỗng là Thìn-Tỵ; quẻ này không
// có hào nào mang Chi Tỵ, nên chỉ hào 1 (Thìn) rơi vào Tuần Không, 5 hào còn lại không rơi vào.
//
// Test cũng xác nhận `cast.tuanKhong` (chuỗi hiển thị cấp lá số) không đổi sau khi thêm `xunKong`.

import { describe, expect, it } from "vitest";
import { CAN, CHI } from "../src/lib/menh-nap-am";
import { lapQueDayDu, TRIGRAMS, type LineVal } from "../src/lib/luc-hao";
import { khongVongOf } from "../src/lib/bat-tu";

const canBits = TRIGRAMS.find((t) => t.name === "Cấn")!.bits;
const LINES = [canBits[0], canBits[1], canBits[2], canBits[0], canBits[1], canBits[2]] as [
  LineVal, LineVal, LineVal, LineVal, LineVal, LineVal,
];

const DAY_CAN_INDEX = CAN.indexOf("Bính");
const DAY_CHI_INDEX = CHI.indexOf("Thân");
const MONTH_CHI_INDEX = CHI.indexOf("Dần");

describe("xunKong per-hào — Golden Test (Bát Thuần Cấn, ngày Bính Thân, tháng Dần)", () => {
  const que = lapQueDayDu(LINES, DAY_CAN_INDEX, [], MONTH_CHI_INDEX, null, DAY_CHI_INDEX);

  it("cast.tuanKhong (chuỗi cấp lá số, công thức cũ) không đổi: vẫn là 'Thìn - Tỵ'", () => {
    expect(khongVongOf(DAY_CAN_INDEX, DAY_CHI_INDEX)).toBe("Thìn - Tỵ");
  });

  it("hào 1 (Thìn): xunKong === true — đúng như nguồn xác nhận 'Thìn thổ tuần không'", () => {
    expect(CHI[que.hao[0].chiIndex]).toBe("Thìn");
    expect(que.hao[0].xunKong).toBe(true);
  });

  it("5 hào còn lại (không mang Chi Thìn/Tỵ): xunKong === false", () => {
    const expectedChi = ["Ngọ", "Thân", "Tuất", "Tý", "Dần"]; // hào 2..6
    que.hao.slice(1).forEach((h, i) => {
      expect(CHI[h.chiIndex]).toBe(expectedChi[i]);
      expect(h.xunKong).toBe(false);
    });
  });
});
