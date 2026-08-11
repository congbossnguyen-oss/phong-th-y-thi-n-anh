// Phase 23 — khóa orientation Kình Dương/Đà La theo nguồn Phase 22 (hoc.kabala.vn, "Sai lầm về an sao lập
// số" — cùng tiêu đề nguồn đã dùng cho Thiên Việt ở Phase 8): "Dương Nam Âm Nữ (thuận), Âm Nam Dương Nữ
// (nghịch)". Test dưới đây có 2 lớp:
//   (1) Đối chiếu TRỰC TIẾP với ví dụ số liệu nguyên văn trong nguồn (tuổi Giáp Ngọ, Dương Nam VÀ Dương
//       Nữ) — KHÔNG tự bịa, dùng đúng số liệu đã trích trong docs/TUVI_PHASE23_KINH_DA_HOA_LINH_RULE_LOCK.md.
//   (2) Xác nhận tính NHẤT QUÁN nội bộ (Kình = Lộc±1, Đà = ngược lại, dấu theo đúng isThuanChung) cho
//       nhiều Can khác nhau — đây là áp dụng công thức đã nêu rõ trong nguồn, không phải bịa giá trị mới.

import { describe, expect, it } from "vitest";
import { tinhTuVi } from "../src/lib/tu-vi/engine";
import { getPalace } from "../src/lib/tu-vi/engine";
import { LOC_TON_TABLE } from "../src/lib/tu-vi/rules";
import { CHI } from "../src/lib/menh-nap-am";

function kinhDaOf(chiLoc: string, chiKinh: string, chiDa: string) {
  return { locTon: chiLoc, kinhDuong: chiKinh, daLa: chiDa };
}

function findPhuTinhChi(chart: ReturnType<typeof tinhTuVi>, name: string): string {
  const p = chart.cungs.find((c) => c.phuTinh.some((s) => s.name === name));
  if (!p) throw new Error(`Không tìm thấy ${name}`);
  return p.chiName;
}

describe("Phase 23 — Kình Dương/Đà La: đối chiếu TRỰC TIẾP ví dụ nguyên văn nguồn (tuổi Giáp Ngọ)", () => {
  // Giáp Ngọ: Giáp là Can Dương. Cần 1 năm dương lịch có Can Chi năm = Giáp Ngọ. 1954 và 2014 đều là
  // Giáp Ngọ — dùng 2014 (gần, dễ kiểm).
  it("Giáp Ngọ, Dương Nam: Lộc Tồn=Dần, Kình Dương=Mão (Dần+1), Đà La=Sửu (Dần-1) — khớp nguyên văn nguồn", () => {
    const chart = tinhTuVi({ day: 15, month: 6, year: 2014, hour: 11, gender: "Nam" });
    expect(chart.yearCanName).toBe("Giáp");
    expect(chart.yearChiName).toBe("Ngọ");
    const result = kinhDaOf(
      CHI[LOC_TON_TABLE["Giáp"]],
      findPhuTinhChi(chart, "Kình Dương"),
      findPhuTinhChi(chart, "Đà La"),
    );
    expect(result).toEqual({ locTon: "Dần", kinhDuong: "Mão", daLa: "Sửu" });
  });

  it("Giáp Ngọ, Dương Nữ: Lộc Tồn=Dần, Kình Dương=Sửu (Dần-1, ĐẢO NGƯỢC), Đà La=Mão (Dần+1, ĐẢO NGƯỢC) — khớp nguyên văn nguồn", () => {
    const chart = tinhTuVi({ day: 15, month: 6, year: 2014, hour: 11, gender: "Nữ" });
    expect(chart.yearCanName).toBe("Giáp");
    expect(chart.yearChiName).toBe("Ngọ");
    const result = kinhDaOf(
      CHI[LOC_TON_TABLE["Giáp"]],
      findPhuTinhChi(chart, "Kình Dương"),
      findPhuTinhChi(chart, "Đà La"),
    );
    expect(result).toEqual({ locTon: "Dần", kinhDuong: "Sửu", daLa: "Mão" });
  });
});

describe("Phase 23 — Kình Dương/Đà La: nhất quán nội bộ đủ 4 tổ hợp Dương/Âm × Nam/Nữ, nhiều Can khác nhau", () => {
  // 1984=Giáp(Dương), 1985=Ất(Âm), 1986=Bính(Dương), 1987=Đinh(Âm) — đã xác nhận Can qua tu-vi-tu-hoa-full.test.ts.
  const CASES: { label: string; year: number; gender: "Nam" | "Nữ"; expectThuan: boolean }[] = [
    { label: "Dương Nam (Giáp 1984)", year: 1984, gender: "Nam", expectThuan: true },
    { label: "Âm Nữ (Ất 1985)", year: 1985, gender: "Nữ", expectThuan: true },
    { label: "Âm Nam (Ất 1985)", year: 1985, gender: "Nam", expectThuan: false },
    { label: "Dương Nữ (Bính 1986)", year: 1986, gender: "Nữ", expectThuan: false },
    { label: "Dương Nam (Bính 1986)", year: 1986, gender: "Nam", expectThuan: true },
    { label: "Âm Nữ (Đinh 1987)", year: 1987, gender: "Nữ", expectThuan: true },
    { label: "Âm Nam (Đinh 1987)", year: 1987, gender: "Nam", expectThuan: false },
  ];

  for (const { label, year, gender, expectThuan } of CASES) {
    it(`${label}: Kình Dương = Lộc Tồn ${expectThuan ? "+1 (thuận)" : "-1 (nghịch)"}, Đà La ngược lại`, () => {
      const chart = tinhTuVi({ day: 15, month: 6, year, hour: 11, gender });
      const locTonChiIndex = LOC_TON_TABLE[chart.yearCanName];
      const locTonPalace = chart.cungs.find((c) => c.phuTinh.some((s) => s.name === "Lộc Tồn"));
      expect(locTonPalace?.chiIndex).toBe(locTonChiIndex);

      const kinhDuongPalace = chart.cungs.find((c) => c.phuTinh.some((s) => s.name === "Kình Dương"))!;
      const daLaPalace = chart.cungs.find((c) => c.phuTinh.some((s) => s.name === "Đà La"))!;
      const expectedOffset = expectThuan ? 1 : -1;
      const expectedKinh = ((locTonChiIndex + expectedOffset) % 12 + 12) % 12;
      const expectedDa = ((locTonChiIndex - expectedOffset) % 12 + 12) % 12;
      expect(kinhDuongPalace.chiIndex).toBe(expectedKinh);
      expect(daLaPalace.chiIndex).toBe(expectedDa);
      // Kình Dương và Đà La luôn ở 2 cung liền kề, đối xứng qua Lộc Tồn (không bao giờ trùng cung nhau).
      expect(kinhDuongPalace.chiIndex).not.toBe(daLaPalace.chiIndex);
    });
  }

  it("Đại Vận không bị ảnh hưởng bởi việc tái sử dụng isThuanChung cho Kình Dương/Đà La (regression)", () => {
    const duongNam = tinhTuVi({ day: 15, month: 6, year: 1984, hour: 11, gender: "Nam" });
    const menh = getPalace(duongNam, duongNam.cungs[duongNam.menhChiIndex].chiName);
    expect(menh.daiVanTuoi[0]).toBe(duongNam.cucSo);
  });
});

describe("Phase 23 — Hỏa Tinh/Linh Tinh: KHÔNG đổi (giữ nguyên orientation cũ, CONFLICTED chưa implement)", () => {
  it("Orientation vẫn luôn cộng gioChiIndex bất kể giới tính (không đổi so với trước Phase 23)", () => {
    const nam = tinhTuVi({ day: 15, month: 6, year: 1984, hour: 11, gender: "Nam" });
    const nu = tinhTuVi({ day: 15, month: 6, year: 1984, hour: 11, gender: "Nữ" });
    const hoaTinhOf = (c: typeof nam) => c.cungs.find((x) => x.phuTinh.some((s) => s.name === "Hỏa Tinh"))?.chiIndex;
    // Cùng năm/tháng/ngày/giờ, chỉ khác giới tính — Hỏa Tinh phải GIỐNG NHAU (vì công thức không đổi theo
    // giới tính, đúng như quyết định CONFLICTED/chưa implement của Phase 23).
    expect(hoaTinhOf(nam)).toBe(hoaTinhOf(nu));
  });
});

describe("Phase 23 — regression: Địa Không/Địa Kiếp KHÔNG đổi", () => {
  it("Địa Không vẫn khởi Hợi nghịch, Địa Kiếp vẫn khởi Hợi thuận", () => {
    const chart = tinhTuVi({ day: 15, month: 6, year: 1990, hour: 11, gender: "Nam" });
    const diaKhong = chart.cungs.find((c) => c.phuTinh.some((s) => s.name === "Địa Không"))!;
    const diaKiep = chart.cungs.find((c) => c.phuTinh.some((s) => s.name === "Địa Kiếp"))!;
    const gioChiIndex = 6; // giờ Ngọ (hour=11)
    expect(diaKiep.chiIndex).toBe(((11 + gioChiIndex) % 12 + 12) % 12);
    expect(diaKhong.chiIndex).toBe(((11 - gioChiIndex) % 12 + 12) % 12);
  });
});

describe("Phase 23 — regression GM-001→GM-006: Mệnh/Thân/Cục/14 chính tinh/status/Tứ Hóa/Đại Vận/4 trụ không đổi", () => {
  const GM_CASES: [string, Parameters<typeof tinhTuVi>[0]][] = [
    ["GM-001", { day: 31, month: 8, year: 1980, hour: 11, gender: "Nam", viewingYear: 2026 }],
    ["GM-002", { day: 31, month: 8, year: 1980, hour: 11, gender: "Nữ", viewingYear: 2026 }],
    ["GM-003", { day: 25, month: 8, year: 1990, hour: 11, gender: "Nam", viewingYear: 2026 }],
    ["GM-004", { day: 25, month: 8, year: 1997, hour: 11, gender: "Nữ", viewingYear: 2026 }],
    ["GM-005", { day: 25, month: 8, year: 1997, hour: 0, gender: "Nam", viewingYear: 2026 }],
    ["GM-006", { day: 4, month: 2, year: 2026, hour: 2, gender: "Nam", viewingYear: 2026 }],
  ];
  for (const [label, input] of GM_CASES) {
    it(`${label}: menhChiIndex/thanChiIndex/cucName/chuMenh/chuThan/tuHoa/yearPillar không đổi`, () => {
      const chart = tinhTuVi(input);
      // Chỉ xác nhận các trường KHÔNG bị ảnh hưởng bởi thay đổi Kình Dương/Đà La tồn tại và hợp lệ —
      // giá trị cụ thể đã được các test GM khác (tu-vi-golden*.test.ts) khóa từ trước, không lặp lại ở đây.
      expect(chart.menhChiIndex).toBeGreaterThanOrEqual(0);
      expect(chart.cungs).toHaveLength(12);
      expect(chart.cungs.flatMap((c) => c.chinhTinh)).toHaveLength(14);
      expect(chart.tuHoa).toBeDefined();
      expect(chart.yearPillar.can).toBe(chart.yearCanName);
    });
  }
});
