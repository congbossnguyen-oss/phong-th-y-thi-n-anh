// Golden Test — Serial Tiền (Seri tiền / "số linh quẻ")
//
// Trạng thái: VERIFIED (trước đây UNVERIFIED).
// 5 test dưới đây lấy trực tiếp từ website tham chiếu (chụp màn hình thực tế), do người dùng cung cấp
// và xác nhận là chuẩn — bao gồm cả trường hợp 668880 (đã từng bị nghi ngờ do một golden data khác
// claim sai là "hào 4"; nguồn thực tế xác nhận đúng là "hào 6", khớp với engine hiện tại).
//
// Công thức đã xác nhận (KHÔNG đổi TRIGRAMS, KHÔNG đổi quy ước Chấn=100/Cấn=001):
//   - Chuỗi số chẵn: chia đều 2 nửa.
//   - Chuỗi số lẻ: phần trái = floor(N/2) chữ số, phần phải = phần còn lại.
//   - Tổng chữ số phần trái % 8 -> Thượng quái (dư 0 = 8).
//   - Tổng chữ số phần phải % 8 -> Hạ quái (dư 0 = 8).
//   - Tổng chữ số toàn chuỗi % 6 -> Hào động (dư 0 = 6).
// Đây đúng là công thức `queFromNumberString()` đang cài đặt — không cần sửa code.

import { describe, expect, it } from "vitest";
import { queFromNumberString } from "./luc-hao";

const INPUT = { day: 1, month: 1, year: 2000, hour: 0 };

interface GoldenCase {
  serial: string;
  chinh: string;
  haoDong: number;
  bien: string;
}

const GOLDEN_CASES: GoldenCase[] = [
  { serial: "668880", chinh: "Lôi Địa Dự", haoDong: 6, bien: "Hỏa Địa Tấn" },
  { serial: "3487631", chinh: "Sơn Thiên Đại Súc", haoDong: 2, bien: "Sơn Hỏa Bí" },
  // Golden data gốc ghi "Bát Thuần Khảm" (tên đầy đủ dân gian); engine đặt tên quẻ thuần là "Thuần X"
  // (đã xác nhận nhất quán với Golden Test #3 "Thuần Chấn") — cùng một quẻ, chỉ khác nhãn hiển thị.
  { serial: "1234567", chinh: "Thuần Khảm", haoDong: 4, bien: "Trạch Thủy Khốn" },
  { serial: "123456", chinh: "Thủy Sơn Kiển", haoDong: 3, bien: "Thủy Địa Tỷ" },
  { serial: "100008", chinh: "Thiên Địa Bĩ", haoDong: 3, bien: "Thiên Sơn Độn" },
];

describe("Serial Tiền — Golden Test (VERIFIED, từ website tham chiếu)", () => {
  for (const { serial, chinh, haoDong, bien } of GOLDEN_CASES) {
    it(`"${serial}" -> ${chinh}, hào ${haoDong}, biến ${bien}`, () => {
      const r = queFromNumberString(serial, INPUT, "Seri tiền");
      expect(r.chinh.name).toBe(chinh);
      expect(r.dongPositions).toEqual([haoDong]);
      expect(r.bien?.name).toBe(bien);
    });
  }
});
