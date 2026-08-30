import { describe, expect, it } from "vitest";
import { calculateCungPhi } from "../../../src/cung-menh-bat-trach/cungPhi.js";
import { getKhiBatTrach, DU_NIEN_BAT_QUAI, KHI_BAT_TRACH_INFO, type KhiBatTrach } from "../../../src/cung-menh-bat-trach/duNienBatQuai.js";
import type { CungBatTrach } from "../../../src/cung-menh-bat-trach/cungPhi.js";

const TAM_CUNG: CungBatTrach[] = ["Càn", "Khảm", "Cấn", "Chấn", "Tốn", "Ly", "Khôn", "Đoài"];

// SPEC.md §5 "Test bắt buộc pass" — port lại nguyên văn từ gói build.
describe("bat-trach-nha — Cung Phi (data/01, 4 ca mẫu bắt buộc)", () => {
  it("Nam 1932 -> Khôn", () => {
    expect(calculateCungPhi(1932, "nam")).toBe("Khôn");
  });
  it("Nam 1989 -> Khôn", () => {
    expect(calculateCungPhi(1989, "nam")).toBe("Khôn");
  });
  it("Nữ 1970 -> Chấn", () => {
    expect(calculateCungPhi(1970, "nu")).toBe("Chấn");
  });
  it("Nữ 1989 -> Tốn", () => {
    expect(calculateCungPhi(1989, "nu")).toBe("Tốn");
  });
});

describe("bat-trach-nha — Du Niên Bát Quái (data/02, đối xứng + ca mẫu tổng)", () => {
  it("đối xứng: duNien(A,B) === duNien(B,A) cho toàn bộ 8x8 (bao trùm mọi cặp random)", () => {
    for (const a of TAM_CUNG) {
      for (const b of TAM_CUNG) {
        expect(getKhiBatTrach(a, b)).toBe(getKhiBatTrach(b, a));
      }
    }
  });

  it("Đông tứ trạch nội bộ toàn cát, Tây tứ trạch nội bộ toàn cát, phối chéo toàn hung", () => {
    const dong: CungBatTrach[] = ["Khảm", "Ly", "Chấn", "Tốn"];
    const tay: CungBatTrach[] = ["Càn", "Khôn", "Cấn", "Đoài"];
    for (const a of dong) for (const b of dong) expect(KHI_BAT_TRACH_INFO[getKhiBatTrach(a, b)].cat).toBe(true);
    for (const a of tay) for (const b of tay) expect(KHI_BAT_TRACH_INFO[getKhiBatTrach(a, b)].cat).toBe(true);
    for (const a of dong) for (const b of tay) expect(KHI_BAT_TRACH_INFO[getKhiBatTrach(a, b)].cat).toBe(false);
  });

  it("bảng sinh từ quy tắc biến hào (kiểm toán độc lập) khớp 100% với DU_NIEN_BAT_QUAI", () => {
    // Cùng thuật toán đã chạy bằng Python trong gói build (tests/test_1_bang_du_nien.py) — sinh
    // lại bảng từ biến hào rồi so với bảng đang dùng trong engine, KHÔNG chép lại bảng có sẵn.
    const quai: Record<CungBatTrach, [number, number, number]> = {
      Càn: [1, 1, 1], Đoài: [1, 1, 0], Ly: [1, 0, 1], Chấn: [1, 0, 0],
      Tốn: [0, 1, 1], Khảm: [0, 1, 0], Cấn: [0, 0, 1], Khôn: [0, 0, 0],
    };
    const RULE: Record<string, KhiBatTrach> = {
      "0,0,0": "phuc-vi", "1,0,0": "hoa-hai", "0,1,0": "tuyet-menh", "0,0,1": "sinh-khi",
      "1,1,0": "thien-y", "1,0,1": "luc-sat", "0,1,1": "ngu-quy", "1,1,1": "dien-nien",
    };
    function duNienTuBienHao(a: CungBatTrach, b: CungBatTrach): KhiBatTrach {
      const qa = quai[a];
      const qb = quai[b];
      const diff = [0, 1, 2].map((i) => (qa[i] !== qb[i] ? 1 : 0));
      return RULE[diff.join(",")]!;
    }
    for (const a of TAM_CUNG) {
      for (const b of TAM_CUNG) {
        expect(DU_NIEN_BAT_QUAI[a][b]).toBe(duNienTuBienHao(a, b));
      }
    }
  });

  it("ca mẫu tổng SPEC §5: Nam 1989 (mệnh Khôn, Tây tứ mệnh), nhà hướng chính Nam (Ly) -> Lục sát, KHÔNG hợp mệnh", () => {
    const cungMenh = calculateCungPhi(1989, "nam");
    expect(cungMenh).toBe("Khôn");
    const khi = getKhiBatTrach(cungMenh, "Ly");
    expect(khi).toBe("luc-sat");
    expect(KHI_BAT_TRACH_INFO[khi].cat).toBe(false);
  });
});
