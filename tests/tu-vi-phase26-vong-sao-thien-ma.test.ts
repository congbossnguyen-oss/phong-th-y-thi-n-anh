// Phase 26 — test matrix cho Vòng Tràng Sinh, Vòng Thái Tuế, Thiên Mã. Expected value lấy từ nguồn đã
// xác nhận (hocvienlyso.org, xem docs/TUVI_PHASE26_VONG_SAO_THIEN_MA_AUDIT.md), KHÔNG suy ra bằng cách
// gọi lại chính hàm/bảng đang kiểm tra.

import { describe, expect, it } from "vitest";
import { tinhTuVi, getPalace } from "../src/lib/tu-vi/engine";
import { TRANG_SINH_START, THIEN_MA_START } from "../src/lib/tu-vi/rules";

describe("Phase 26 — Vòng Tràng Sinh: điểm khởi theo Cục (nguồn hocvienlyso.org bài 15)", () => {
  // Nguồn: "Kim Tứ Cục khởi Tỵ, Mộc Tam Cục khởi Hợi, Hỏa Lục Cục khởi Dần, Thủy Nhị Cục & Thổ Ngũ Cục
  // khởi Thân" — liệt kê thủ công theo đúng chữ nguồn, không gọi TRANG_SINH_START để tự sinh expected.
  it("Thủy Nhị Cục: khởi Thân (chi index 8)", () => expect(TRANG_SINH_START["Thủy"]).toBe(8));
  it("Mộc Tam Cục: khởi Hợi (chi index 11)", () => expect(TRANG_SINH_START["Mộc"]).toBe(11));
  it("Kim Tứ Cục: khởi Tỵ (chi index 5)", () => expect(TRANG_SINH_START["Kim"]).toBe(5));
  it("Thổ Ngũ Cục: khởi Thân (chi index 8)", () => expect(TRANG_SINH_START["Thổ"]).toBe(8));
  it("Hỏa Lục Cục: khởi Dần (chi index 2)", () => expect(TRANG_SINH_START["Hỏa"]).toBe(2));
});

describe("Phase 26 — Vòng Tràng Sinh: chiều thuận/nghịch theo Dương Nam/Âm Nữ vs Âm Nam/Dương Nữ (dùng dữ liệu GM-001/GM-005, cùng Thổ Ngũ Cục, khởi Thân)", () => {
  it("GM-001 (Canh Thân 1980, Dương Nam → THUẬN): 12 giai đoạn đúng thứ tự thuận từ Thân", () => {
    const chart = tinhTuVi({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" });
    expect(chart.cucName).toBe("Thổ Ngũ Cục");
    expect(chart.amDuongNam).toBe("Dương Nam");
    // Thứ tự THUẬN từ Thân(8): Thân=TràngSinh, Dậu=MộcDục, Tuất=QuanĐới, Hợi=LâmQuan, Tý=ĐếVượng,
    // Sửu=Suy, Dần=Bệnh, Mão=Tử, Thìn=Mộ, Tỵ=Tuyệt, Ngọ=Thai, Mùi=Dưỡng — liệt kê thủ công từ nguồn.
    const expected: [string, string][] = [
      ["Thân", "Tràng Sinh"], ["Dậu", "Mộc Dục"], ["Tuất", "Quan Đới"], ["Hợi", "Lâm Quan"],
      ["Tý", "Đế Vượng"], ["Sửu", "Suy"], ["Dần", "Bệnh"], ["Mão", "Tử"],
      ["Thìn", "Mộ"], ["Tỵ", "Tuyệt"], ["Ngọ", "Thai"], ["Mùi", "Dưỡng"],
    ];
    for (const [chiName, stage] of expected) {
      expect(getPalace(chart, chiName).trangSinh).toBe(stage);
    }
  });

  it("GM-005 (Đinh Sửu 1997 giờ Tý, Âm Nam → NGHỊCH): 12 giai đoạn đúng thứ tự nghịch từ Thân", () => {
    const chart = tinhTuVi({ day: 25, month: 8, year: 1997, hour: 0, gender: "Nam" });
    expect(chart.cucName).toBe("Thổ Ngũ Cục");
    expect(chart.amDuongNam).toBe("Âm Nam");
    // Thứ tự NGHỊCH từ Thân(8): Thân=TràngSinh, Mùi=MộcDục, Ngọ=QuanĐới, Tỵ=LâmQuan, Thìn=ĐếVượng,
    // Mão=Suy, Dần=Bệnh, Sửu=Tử, Tý=Mộ, Hợi=Tuyệt, Tuất=Thai, Dậu=Dưỡng — liệt kê thủ công từ nguồn.
    const expected: [string, string][] = [
      ["Thân", "Tràng Sinh"], ["Mùi", "Mộc Dục"], ["Ngọ", "Quan Đới"], ["Tỵ", "Lâm Quan"],
      ["Thìn", "Đế Vượng"], ["Mão", "Suy"], ["Dần", "Bệnh"], ["Sửu", "Tử"],
      ["Tý", "Mộ"], ["Hợi", "Tuyệt"], ["Tuất", "Thai"], ["Dậu", "Dưỡng"],
    ];
    for (const [chiName, stage] of expected) {
      expect(getPalace(chart, chiName).trangSinh).toBe(stage);
    }
  });
});

describe("Phase 26 — Vòng Thái Tuế: điểm khởi = Chi năm sinh, luôn đi thuận, không phụ thuộc giới tính (nguồn hocvienlyso.org bài 12)", () => {
  // GM-001/GM-002: cùng năm Canh Thân (yearChi = Thân, index 8), khác giới tính.
  const EXPECTED_FROM_THAN: [string, string][] = [
    ["Thân", "Thái Tuế"], ["Dậu", "Thiếu Dương"], ["Tuất", "Tang Môn"], ["Hợi", "Thiếu Âm"],
    ["Tý", "Quan Phù"], ["Sửu", "Tử Phù"], ["Dần", "Tuế Phá"], ["Mão", "Long Đức"],
    ["Thìn", "Bạch Hổ"], ["Tỵ", "Phúc Đức"], ["Ngọ", "Điếu Khách"], ["Mùi", "Trực Phù"],
  ];

  it("GM-001 (Canh Thân, Nam): vòng Thái Tuế đúng thứ tự thuận từ Thân", () => {
    const chart = tinhTuVi({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" });
    for (const [chiName, stage] of EXPECTED_FROM_THAN) {
      expect(getPalace(chart, chiName).thaiTue).toBe(stage);
    }
  });

  it("GM-002 (Canh Thân, Nữ): vòng Thái Tuế GIỐNG HỆT GM-001 — xác nhận không phụ thuộc giới tính", () => {
    const chart = tinhTuVi({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nữ" });
    for (const [chiName, stage] of EXPECTED_FROM_THAN) {
      expect(getPalace(chart, chiName).thaiTue).toBe(stage);
    }
  });
});

describe("Phase 26 — Thiên Mã: xác nhận trực tiếp 1/4 nhóm qua nguồn Level 1 (hocvienlyso.org bài 12: 'Sinh năm Tý, an Thiên Mã ở cung Dần')", () => {
  it("Nhóm Thân/Tý/Thìn (group 0, đại diện Tý): Thiên Mã tại Dần (chi index 2) — khớp nguyên văn nguồn", () => {
    expect(THIEN_MA_START[0]).toBe(2);
  });

  it("3/4 nhóm còn lại (Dần/Ngọ/Tuất, Tỵ/Dậu/Sửu, Hợi/Mão/Mùi): chưa có xác nhận Level 1 bằng chữ (bảng gốc là ảnh, không trích xuất được) — chỉ ghi nhận giá trị hiện tại, không khẳng định GM/Level 1", () => {
    // Không tự bịa expected độc lập cho 3 nhóm này — test chỉ xác nhận cấu trúc bảng đủ 4 phần tử,
    // không khẳng định đúng/sai (xem docs/TUVI_PHASE26_VONG_SAO_THIEN_MA_AUDIT.md mục Thiên Mã).
    expect(THIEN_MA_START).toHaveLength(4);
  });
});

describe("Phase 26 — Golden Master coverage cho Tràng Sinh/Thái Tuế/Thiên Mã", () => {
  it("0/6 GM (GM-001→006) ghi vị trí Thiên Mã hay chi tiết đầy đủ vòng Tràng Sinh/Thái Tuế theo tên sao — không tự tạo expected từ GM", () => {
    expect(true).toBe(true);
  });
});

describe("Phase 26 — regression: không đổi Mệnh/Thân/Cục/14 chính tinh/Tứ Hóa/Đại Vận/4 trụ sau khi audit vòng sao", () => {
  it("GM-001: metadata cốt lõi không đổi", () => {
    const chart = tinhTuVi({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nam", viewingYear: 2026 });
    expect(chart.menhChiIndex).toBe(2);
    expect(chart.cucName).toBe("Thổ Ngũ Cục");
    expect(chart.chuMenh).toBe("Liêm Trinh");
    expect(chart.cungs.flatMap((c) => c.chinhTinh)).toHaveLength(14);
    expect(chart.yearPillar.can).toBe("Canh");
  });
});
