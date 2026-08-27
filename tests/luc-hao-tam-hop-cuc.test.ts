// Kiểm chứng Tam Hợp cục (luc-hao-tam-hop-cuc.ts) — 3 điều kiện hình thành theo
// LUAN_QUE_LUC_HAO_SPEC.md §3.7. Mọi input dưới đây đã dò bằng chính engine thật (quét toàn bộ tổ
// hợp lower/upper/dong), không suy diễn tay — xem cách dò trong lịch sử session 27/8/2026.

import { describe, expect, it } from "vitest";
import { lucHaoCastManual } from "../src/lib/luc-hao";
import { tinhTamHopCuc } from "../src/lib/luc-hao-tam-hop-cuc";

const NGAY = { day: 7, month: 8, year: 2026, hour: 8, minute: 0 }; // dayChi=Sửu, monthChi=Mùi

describe("Tam Hợp cục — điều kiện (1) đủ 3 hào động", () => {
  it("Thuần Càn, động hào 2/4/6 = Dần/Ngọ/Tuất => Hỏa cục", () => {
    const c = lucHaoCastManual([1, 1, 1, 1, 1, 1] as any, [2, 4, 6], NGAY);
    const kq = tinhTamHopCuc(c);
    expect(kq.co).toBe(true);
    expect(kq.danhSach).toContainEqual(
      expect.objectContaining({ nguHanh: "Hỏa", dieuKien: "du-3-hao-dong", viTriHaoDong: [2, 4, 6] }),
    );
  });

  it("chỉ 2/6 hào động (thiếu 1 chi, ngày không bù được) => KHÔNG thành cục", () => {
    // Ngày 8/8/2026 dayChi=Dần, monthChi=Thân — không phải Tuất nên không mượn được.
    const c = lucHaoCastManual([1, 1, 1, 1, 1, 1] as any, [2, 4], { day: 8, month: 8, year: 2026, hour: 8, minute: 0 });
    const kq = tinhTamHopCuc(c);
    expect(kq.co).toBe(false);
  });
});

describe("Tam Hợp cục — điều kiện (2) mượn Nhật/Nguyệt", () => {
  it("Thuần Càn, động hào 2/4 (Dần/Ngọ), ngày Tuất (4/8/2026) => Hỏa cục mượn Nhật", () => {
    const c = lucHaoCastManual([1, 1, 1, 1, 1, 1] as any, [2, 4], { day: 4, month: 8, year: 2026, hour: 8, minute: 0 });
    expect(c.dayChi).toBe("Tuất");
    const kq = tinhTamHopCuc(c);
    expect(kq.danhSach).toContainEqual(
      expect.objectContaining({ nguHanh: "Hỏa", dieuKien: "muon-nhat-nguyet", muonTu: "Nhật" }),
    );
  });

  it("2 hào động nhưng KHÔNG có Đế Vượng trong đó => không tính dù ngày bù đủ", () => {
    // Thuần Càn, động hào 2/6 (Dần/Tuất — thiếu đúng Ngọ là Đế Vượng), ngày Ngọ.
    // 12/8/2026 dayChi=Ngọ (xem bảng dò ngày tháng 8/2026).
    const c = lucHaoCastManual([1, 1, 1, 1, 1, 1] as any, [2, 6], { day: 12, month: 8, year: 2026, hour: 8, minute: 0 });
    expect(c.dayChi).toBe("Ngọ");
    const kq = tinhTamHopCuc(c);
    expect(kq.co).toBe(false);
  });
});

describe("Tam Hợp cục — điều kiện (3) Đế Vượng động hóa ra chi thiếu", () => {
  it("lower=Càn/upper=Ly, động hào 4/6, ngày Dần (không phải Sửu) => Kim cục vẫn thành nhờ hào 4 tự hóa", () => {
    const c = lucHaoCastManual([1, 1, 1, 1, 0, 1] as any, [4, 6], { day: 8, month: 8, year: 2026, hour: 8, minute: 0 });
    expect(c.dayChi).toBe("Dần"); // xác nhận không phải mượn Nhật — cô lập đúng điều kiện (3)
    expect(c.chinh.hao[3].chiIndex).toBe(9); // Dậu — Đế Vượng của Kim cục
    expect(c.bien!.hao[3].chiIndex).toBe(1); // Sửu — chi thiếu, hào 4 tự hóa ra
    const kq = tinhTamHopCuc(c);
    expect(kq.danhSach).toContainEqual(
      expect.objectContaining({ nguHanh: "Kim", dieuKien: "de-vuong-hoa-ra", viTriHaoDong: [4, 6] }),
    );
    expect(kq.danhSach.some((d) => d.dieuKien === "muon-nhat-nguyet")).toBe(false);
  });
});

describe("Tam Hợp cục — không hào động thì không xét", () => {
  it("quẻ tĩnh hoàn toàn => co=false", () => {
    const c = lucHaoCastManual([1, 1, 1, 1, 1, 1] as any, [], NGAY);
    const kq = tinhTamHopCuc(c);
    expect(kq.co).toBe(false);
    expect(kq.ghiChu[0]).toMatch(/không có hào động/i);
  });
});
