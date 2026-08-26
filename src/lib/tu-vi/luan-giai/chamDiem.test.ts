import { describe, expect, it } from "vitest";
import { tinhTuVi } from "../engine";
import { chamDiemCung, chamDiemLaSo, tamPhuongTuChinh } from "./chamDiem";

// Khoá lại đúng bảng 8 trường hợp trong SPEC-ENGINE-DIEM.md mục 2 — đây là phần dễ bị sửa nhầm
// nhất về sau vì trông giống nhau giữa nhánh CAT và HUNG.

describe("chamDiemCung — bảng 8 trường hợp gốc", () => {
  it("chính tinh CÁT: 4 trường hợp", () => {
    expect(chamDiemCung("CAT", 2, 0)).toBe(5); // case 1 — rất tốt
    expect(chamDiemCung("CAT", 0, 2)).toBe(2); // case 2 — xấu
    expect(chamDiemCung("CAT", 0, 0)).toBe(4); // case 4 — không trung tinh nào, vẫn tốt
  });

  it("chính tinh HUNG: 4 trường hợp", () => {
    expect(chamDiemCung("HUNG", 2, 0)).toBe(4); // case 5 — được cứu
    expect(chamDiemCung("HUNG", 0, 2)).toBe(1); // case 6 — rất xấu
    expect(chamDiemCung("HUNG", 1, 1)).toBe(2); // case 7 — lẫn lộn, thiên xấu
    expect(chamDiemCung("HUNG", 0, 0)).toBe(2); // case 8 — không trung tinh nào, vẫn xấu
  });

  it("case 3 (CÁT lẫn lộn) tinh chỉnh theo tỉ lệ áp đảo", () => {
    expect(chamDiemCung("CAT", 3, 3)).toBe(3); // cân bằng — giữ 3
    expect(chamDiemCung("CAT", 4, 2)).toBe(4); // cát áp đảo (>= gấp đôi)
    expect(chamDiemCung("CAT", 2, 4)).toBe(2); // hung áp đảo
    expect(chamDiemCung("CAT", 3, 2)).toBe(3); // chưa áp đảo — giữ 3
  });

  it("Vô Chính Diệu hoàn toàn theo trung tinh hội về", () => {
    expect(chamDiemCung("VCD", 3, 1)).toBe(4);
    expect(chamDiemCung("VCD", 1, 3)).toBe(2);
    expect(chamDiemCung("VCD", 0, 0)).toBe(3);
    expect(chamDiemCung("VCD", 2, 2)).toBe(3);
  });

  it("điểm luôn nằm trong thang 1-5", () => {
    for (const loai of ["CAT", "HUNG", "VCD"] as const) {
      for (let cat = 0; cat <= 8; cat++) {
        for (let hung = 0; hung <= 8; hung++) {
          const d = chamDiemCung(loai, cat, hung);
          expect(d, `${loai} cat=${cat} hung=${hung}`).toBeGreaterThanOrEqual(1);
          expect(d, `${loai} cat=${cat} hung=${hung}`).toBeLessThanOrEqual(5);
        }
      }
    }
  });
});

describe("tamPhuongTuChinh", () => {
  it("gồm bản cung, đối cung (+6) và 2 tam hợp (+4, +8)", () => {
    expect(tamPhuongTuChinh(0)).toEqual([0, 4, 6, 8]);
    expect(tamPhuongTuChinh(10)).toEqual([10, 2, 4, 6]);
  });
});

describe("chamDiemLaSo — chạy trên lá số thật", () => {
  // Lá số mẫu trong gói tài liệu: Nam, 22/11/1984 (Giáp Tý).
  const chart = tinhTuVi({ day: 22, month: 11, year: 1984, hour: 10, gender: "Nam" });

  it("chấm đủ 12 cung, điểm hợp lệ", () => {
    const kq = chamDiemLaSo(chart);
    expect(Object.keys(kq.diem12Cung)).toHaveLength(12);
    for (const [khoa, diem] of Object.entries(kq.diem12Cung)) {
      expect(Number.isInteger(diem), `${khoa}=${diem}`).toBe(true);
      expect(diem, khoa).toBeGreaterThanOrEqual(1);
      expect(diem, khoa).toBeLessThanOrEqual(5);
    }
  });

  it("radar 6 lĩnh vực suy đúng từ điểm 12 cung", () => {
    const kq = chamDiemLaSo(chart);
    expect(kq.radar6LinhVuc.cong_danh).toBe(kq.diem12Cung.quan_loc);
    expect(kq.radar6LinhVuc.tinh_duyen).toBe(kq.diem12Cung.phu_the);
    expect(kq.radar6LinhVuc.suc_khoe).toBe(kq.diem12Cung.tat_ach);
    expect(kq.radar6LinhVuc.quan_he_xa_hoi).toBe(kq.diem12Cung.no_boc);
    expect(kq.radar6LinhVuc.tai_loc).toBe(
      Math.round((kq.diem12Cung.tai_bach + kq.diem12Cung.dien_trach) / 2),
    );
  });

  it("cùng lá số chạy 2 lần cho điểm y hệt (yêu cầu nhất quán 3 tầng)", () => {
    const a = chamDiemLaSo(chart);
    const b = chamDiemLaSo(tinhTuVi({ day: 22, month: 11, year: 1984, hour: 10, gender: "Nam" }));
    expect(a.diem12Cung).toEqual(b.diem12Cung);
  });
});
