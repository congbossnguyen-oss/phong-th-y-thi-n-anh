// Test Tiến Thần / Thoái Thần. Đối chiếu bằng bảng cặp CỔ ĐIỂN viết độc lập trong file test,
// không import bảng từ module đang test (tránh kiểu "code tự khớp code").

import { describe, expect, it } from "vitest";
import { lucHaoCastManual, type LineVal } from "../src/lib/luc-hao";
import { tinhTienThoaiThan, xetTienThoai } from "../src/lib/luc-hao-tien-thoai-than";

const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const i = (c: string) => CHI.indexOf(c);

// Bảng chuẩn Lục Hào, gõ tay từ ca quyết — 8 cặp Tiến Thần.
const CAP_TIEN: [string, string][] = [
  ["Hợi", "Tý"], ["Dần", "Mão"], ["Tỵ", "Ngọ"], ["Thân", "Dậu"],
  ["Sửu", "Thìn"], ["Thìn", "Mùi"], ["Mùi", "Tuất"], ["Tuất", "Sửu"],
];

const NGAY = { day: 10, month: 8, year: 2026, hour: 8, minute: 0 };

describe("xetTienThoai — đối chiếu bảng cặp cổ điển", () => {
  it("đủ 8 cặp Tiến Thần, và chiều ngược lại là Thoái Thần", () => {
    for (const [goc, bien] of CAP_TIEN) {
      expect(xetTienThoai(i(goc), i(bien)), `${goc}→${bien}`).toBe("tien-than");
      expect(xetTienThoai(i(bien), i(goc)), `${bien}→${goc}`).toBe("thoai-than");
    }
  });

  it("khác ngũ hành thì KHÔNG phải tiến/thoái thần", () => {
    expect(xetTienThoai(i("Dần"), i("Tỵ"))).toBeNull(); // Mộc → Hỏa
    expect(xetTienThoai(i("Tý"), i("Sửu"))).toBeNull(); // Thủy → Thổ (dù là lục hợp)
  });

  it("trùng chi là Phục Ngâm, không phải tiến/thoái thần", () => {
    for (const c of CHI) expect(xetTienThoai(i(c), i(c))).toBeNull();
  });

  it("Thổ cách >1 bậc (Sửu↔Mùi, Thìn↔Tuất) KHÔNG tính — đó là xung nhau", () => {
    expect(xetTienThoai(i("Sửu"), i("Mùi"))).toBeNull();
    expect(xetTienThoai(i("Mùi"), i("Sửu"))).toBeNull();
    expect(xetTienThoai(i("Thìn"), i("Tuất"))).toBeNull();
    expect(xetTienThoai(i("Tuất"), i("Thìn"))).toBeNull();
  });

  it("mọi cặp chi cùng hành liền bậc đều phải ra kết quả, không sót", () => {
    // Quét toàn bộ 12x12, đếm số cặp có kết quả — phải đúng 16 (8 tiến + 8 thoái).
    let dem = 0;
    for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) if (xetTienThoai(a, b)) dem++;
    expect(dem).toBe(16);
  });
});

describe("tinhTienThoaiThan — quét trên quẻ thật", () => {
  it("quẻ không hào động thì không xét", () => {
    const cast = lucHaoCastManual([1, 1, 1, 1, 1, 1], [], NGAY);
    const kq = tinhTienThoaiThan(cast);
    expect(kq.co).toBe(false);
    expect(kq.ghiChu[0]).toContain("không có hào động");
  });

  it("mọi mục tìm được đều phải khớp lại bảng cổ điển", () => {
    let tongMuc = 0;
    // Quét nhiều tổ hợp quẻ + hào động để lấy mẫu thật.
    for (let mask = 1; mask < 64; mask++) {
      const lines = [0, 1, 2, 3, 4, 5].map((k) => ((mask >> k) & 1) as LineVal) as [LineVal, LineVal, LineVal, LineVal, LineVal, LineVal];
      for (const dong of [[1], [3], [5], [2, 4], [1, 6]]) {
        const cast = lucHaoCastManual(lines, dong, NGAY);
        for (const d of tinhTienThoaiThan(cast).danhSach) {
          tongMuc++;
          const laTien = CAP_TIEN.some(([g, b]) => g === d.chiGoc && b === d.chiBien);
          const laThoai = CAP_TIEN.some(([g, b]) => b === d.chiGoc && g === d.chiBien);
          expect(laTien || laThoai, `${d.chiGoc}→${d.chiBien}`).toBe(true);
          expect(d.loai).toBe(laTien ? "tien-than" : "thoai-than");
          // hào biến phải cùng ngũ hành với hào gốc
          expect(d.nguHanh).toBeTruthy();
        }
      }
    }
    expect(tongMuc).toBeGreaterThan(0); // phải thực sự tìm được mẫu, không phải test rỗng
  });

  it("cảnh báo rõ Tiến/Thoái Thần KHÔNG tự nó là tốt/xấu", () => {
    for (let mask = 1; mask < 64; mask++) {
      const lines = [0, 1, 2, 3, 4, 5].map((k) => ((mask >> k) & 1) as LineVal) as [LineVal, LineVal, LineVal, LineVal, LineVal, LineVal];
      const cast = lucHaoCastManual(lines, [1, 3], NGAY);
      const kq = tinhTienThoaiThan(cast);
      if (kq.co) {
        expect(kq.ghiChu.some((g) => g.includes("Kỵ Thần"))).toBe(true);
        return;
      }
    }
  });
});
