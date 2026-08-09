// Golden Test — Quan hệ hào <-> Nhật Thần/Nguyệt Kiến (Phần C1)
//
// Nguồn: "kinh dịch lục hào sơ cấp minh việt" (bản New OCR, dòng 2281-2296), "VD1: Xem lên chức.
// Ngày Bính Thân, tháng Dần." Quẻ Bát Thuần Cấn, hào 6 (Thế) phát động.
//
// Chỉ assert những quan hệ được nguồn nói rõ bằng lời — KHÔNG assert "không có quan hệ" cho hào 4
// (Tuất-Thổ) và hào 2 (Ngọ-Hỏa) vì nguồn không bàn tới trục Ngày/Tháng của 2 hào này.
//
// LƯU Ý QUAN TRỌNG: nguồn còn mô tả hào 5 (Tý) và hào 1 (Thìn) là 2 chân còn lại của Tam Hợp
// Thân-Tý-Thìn (cùng Nhật Thần Thân) — nhưng Tam Hợp bị hoãn sang C2 theo đúng chỉ thị "Chưa
// implementation trong C1 ... Không tự suy diễn thêm". Vì vậy test này KHÔNG assert quan hệ Tam Hợp
// cho hào 5/hào 1. Thay vào đó chỉ assert đúng những quan hệ Sinh/Khắc/Hợp/Xung/Hại/Mộ/Phá (5 loại đã
// cài ở C1) mà công thức Ngũ Hành/Chi đã VERIFIED tính ra được — kể cả khi bản thân đoạn văn gốc
// không nhắc riêng tới quan hệ đó (vd hào 1 Thìn-Thổ bị Nguyệt Dần-Mộc khắc theo đúng Ngũ Hành chuẩn
// Mộc khắc Thổ, dù đoạn văn chỉ nhắc tới hào 1 qua vai trò Tam Hợp chứ không nhắc khắc).

import { describe, expect, it } from "vitest";
import { CAN, CHI } from "../src/lib/menh-nap-am";
import { lapQueDayDu, TRIGRAMS, type HaoRelation, type LineVal } from "../src/lib/luc-hao";

const canBits = TRIGRAMS.find((t) => t.name === "Cấn")!.bits;
const LINES = [canBits[0], canBits[1], canBits[2], canBits[0], canBits[1], canBits[2]] as [
  LineVal, LineVal, LineVal, LineVal, LineVal, LineVal,
];

const DAY_CAN_INDEX = CAN.indexOf("Bính");
const DAY_CHI_INDEX = CHI.indexOf("Thân");
const MONTH_CHI_INDEX = CHI.indexOf("Dần");

function has(relations: HaoRelation[], partial: Partial<HaoRelation>): boolean {
  return relations.some((r) => Object.entries(partial).every(([k, v]) => (r as any)[k] === v));
}

describe("Quan hệ hào <-> Nhật/Nguyệt — Golden Test (Bát Thuần Cấn, ngày Bính Thân, tháng Dần)", () => {
  const que = lapQueDayDu(LINES, DAY_CAN_INDEX, [], MONTH_CHI_INDEX, null, DAY_CHI_INDEX);

  it("quẻ và Chi từng hào khớp Nạp Giáp hiện có (tiền đề của Golden Test)", () => {
    expect(que.name).toBe("Thuần Cấn");
    const expectChi = ["Thìn", "Ngọ", "Thân", "Tuất", "Tý", "Dần"]; // hào 1..6
    expectChi.forEach((chi, i) => {
      expect(CHI[que.hao[i].chiIndex]).toBe(chi);
    });
  });

  it("hào 6 (Dần, Thế): lâm Nguyệt kiến (MONTH) + bị Nhật Thần khắc (DAY)", () => {
    const h6 = que.hao[5];
    expect(has(h6.relations, { type: "Lâm Nguyệt", source: "MONTH" })).toBe(true);
    expect(has(h6.relations, { type: "Khắc", source: "DAY" })).toBe(true);
  });

  it("hào 5 (Tý): được Nhật Thần (Thân-Kim) sinh", () => {
    const h5 = que.hao[4];
    expect(has(h5.relations, { type: "Sinh", source: "DAY" })).toBe(true);
  });

  it("hào 3 (Thân, Ứng): chính là Nhật Thần (lâm Nhật)", () => {
    const h3 = que.hao[2];
    expect(has(h3.relations, { type: "Lâm Nhật", source: "DAY" })).toBe(true);
  });

  it("hào 1 (Thìn): bị Nguyệt Kiến (Dần-Mộc) khắc theo Ngũ Hành chuẩn (Mộc khắc Thổ) — quan hệ Tam Hợp để dành C2", () => {
    const h1 = que.hao[0];
    expect(has(h1.relations, { type: "Khắc", source: "MONTH" })).toBe(true);
  });
});
