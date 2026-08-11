// Phase 8 — LOCK VERIFIED RULES: test khóa các rule đã chốt + xác nhận các ô cố tình giữ UNRESOLVED
// không bị âm thầm điền giá trị đoán. Xem docs/TUVI_ENGINE_PHASE8_REPORT.md.

import { describe, expect, it } from "vitest";
import { getStar, tinhTuVi } from "../src/lib/tu-vi/engine";
import {
  CHU_MENH_BY_YEAR_BRANCH, THAN_CHU_BY_YEAR_BRANCH, THIEN_VIET_TABLE,
  getChuMenh, getChuThan, getThienViet, MAIN_STAR_STATUS,
} from "../src/lib/tu-vi/rules";

describe("Chủ Mệnh/Chủ Thân — khóa Chi năm sinh, đúng 4/12 VERIFIED, 8/12 NEED_GOLDEN_MASTER_REVIEW", () => {
  const VERIFIED_BRANCHES = { 8: "Thân", 6: "Ngọ", 1: "Sửu", 5: "Tỵ" };
  it("Đúng 4 Chi năm sinh có giá trị Chủ Mệnh (không hơn, không kém)", () => {
    expect(Object.keys(CHU_MENH_BY_YEAR_BRANCH).length).toBe(4);
  });
  it("Đúng 4 Chi năm sinh có giá trị Chủ Thân (không hơn, không kém)", () => {
    expect(Object.keys(THAN_CHU_BY_YEAR_BRANCH).length).toBe(4);
  });

  for (const [chiIndex, chiName] of Object.entries(VERIFIED_BRANCHES)) {
    it(`Chi ${chiName} (index ${chiIndex}): getChuMenh/getChuThan trả giá trị thật, không phải NEED_GOLDEN_MASTER_REVIEW`, () => {
      expect(getChuMenh(Number(chiIndex))).not.toBe("NEED_GOLDEN_MASTER_REVIEW");
      expect(getChuThan(Number(chiIndex))).not.toBe("NEED_GOLDEN_MASTER_REVIEW");
    });
  }

  const UNRESOLVED_BRANCHES = [0, 2, 3, 4, 7, 9, 10, 11]; // Tý Dần Mão Thìn Mùi Dậu Tuất Hợi
  for (const chiIndex of UNRESOLVED_BRANCHES) {
    it(`Chi index ${chiIndex}: getChuMenh/getChuThan PHẢI trả "NEED_GOLDEN_MASTER_REVIEW" (không tự điền)`, () => {
      expect(getChuMenh(chiIndex)).toBe("NEED_GOLDEN_MASTER_REVIEW");
      expect(getChuThan(chiIndex)).toBe("NEED_GOLDEN_MASTER_REVIEW");
    });
  }

  it("Tý (index 0) đặc biệt giữ NEED_GOLDEN_MASTER_REVIEW cho Chủ Thân dù nguồn Nguyên Cát gợi ý đối xứng với Ngọ (Hỏa Tinh) — không suy diễn theo đối xứng", () => {
    expect(getChuThan(0)).toBe("NEED_GOLDEN_MASTER_REVIEW");
  });
});

// SUPERSEDED BY PHASE 16 (docs/TUVI_PHASE16_NGUYEN_CAT_STATUS_IMPLEMENTATION.md): Phase 8 cố tình giữ 5 ô
// này "Chưa xác định" vì lúc đó chỉ có 1 điểm dữ liệu GM mâu thuẫn với nguồn Nguyên Cát cho mỗi ô, không
// đủ căn cứ chọn bên. Phase 16 nhận chỉ thị rõ ràng: dùng bảng Nguyên Cát làm SOURCE OF TRUTH duy nhất
// cho toàn bộ 168 ô, không chờ thêm Golden Master — đây là thay đổi RULE thật (không phải sửa expected để
// né fail), cùng loại quyết định như việc chuyển it.fails()->it() ở Phase 8 khi rule đổi thật. Xem
// docs/TUVI_PHASE16_NGUYEN_CAT_STATUS_IMPLEMENTATION.md để biết đầy đủ Golden Master conflict còn tồn tại
// (GM-003/GM-005/GM-006 vẫn ghi giá trị khác ở 4/5 ô này — KHÔNG bị xóa hay sửa).
describe("Status table — Phase 16: 5 ô trước đây 'Chưa xác định' nay khóa theo Nguyên Cát, không còn ô nào unresolved", () => {
  it("Vũ Khúc @ Mão = 'Đắc' (Phase 16, nguồn Nguyên Cát — GM-003 mâu thuẫn ghi Miếu, xem Phase 16 report)", () => {
    expect(MAIN_STAR_STATUS["Vũ Khúc"][3]).toBe("Đắc");
  });
  it("Thiên Cơ @ Ngọ = 'Đắc' (Phase 16, nguồn Nguyên Cát — GM-003 mâu thuẫn ghi Bình, xem Phase 16 report)", () => {
    expect(MAIN_STAR_STATUS["Thiên Cơ"][6]).toBe("Đắc");
  });
  it("Thái Âm @ Dần = 'Hãm' (Phase 16, nguồn Nguyên Cát — GM-006 mâu thuẫn ghi Miếu, xem Phase 16 report)", () => {
    expect(MAIN_STAR_STATUS["Thái Âm"][2]).toBe("Hãm");
  });
  it("Thất Sát @ Mùi = 'Đắc' (Phase 16, nguồn Nguyên Cát — GM-006 mâu thuẫn ghi Bình, xem Phase 16 report)", () => {
    expect(MAIN_STAR_STATUS["Thất Sát"][7]).toBe("Đắc");
  });
  it("Thiên Lương @ Mùi = 'Đắc' (Phase 16, nguồn Nguyên Cát — không có GM nào chạm Mùi)", () => {
    expect(MAIN_STAR_STATUS["Thiên Lương"][7]).toBe("Đắc");
  });
  it("Thiên Lương @ Sửu = 'Đắc' (không đổi từ Phase 8 — GM-005 và Nguyên Cát đồng thuận)", () => {
    expect(MAIN_STAR_STATUS["Thiên Lương"][1]).toBe("Đắc");
  });

  it("Phase 16: không còn ô nào 'Chưa xác định' trong toàn bộ bảng 168 ô", () => {
    const all = Object.values(MAIN_STAR_STATUS).flat();
    const unresolvedCount = all.filter((s) => s === "Chưa xác định").length;
    expect(unresolvedCount).toBe(0);
  });
});

describe("Thiên Việt — bảng nguồn Nguyên Cát, không còn Khôi+6", () => {
  const EXPECTED: Record<string, number> = {
    "Giáp": 7, "Mậu": 7, "Ất": 8, "Kỷ": 8, "Bính": 9, "Đinh": 9, "Canh": 2, "Tân": 2, "Nhâm": 5, "Quý": 5,
  };
  for (const [can, expected] of Object.entries(EXPECTED)) {
    it(`Can ${can}: Thiên Việt tại chi index ${expected}`, () => {
      expect(getThienViet(can)).toBe(expected);
      expect(THIEN_VIET_TABLE[can]).toBe(expected);
    });
  }
});

describe("Golden Master vẫn pass sau khi khóa rule Phase 8 (regression trên chart thật)", () => {
  it("GM-001 (Canh Thân): Chủ Mệnh/Chủ Thân không đổi (Thân đã VERIFIED từ trước)", () => {
    const chart = tinhTuVi({ day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" });
    expect(chart.chuMenh).toBe("Liêm Trinh");
    expect(chart.chuThan).toBe("Thiên Lương");
  });

  it("GM-003 (Canh Ngọ): Chủ Mệnh/Chủ Thân giờ đúng theo Golden Master (Phá Quân/Hỏa Tinh)", () => {
    const chart = tinhTuVi({ day: 25, month: 8, year: 1990, hour: 11, gender: "Nam" });
    expect(chart.chuMenh).toBe("Phá Quân");
    expect(chart.chuThan).toBe("Hỏa Tinh");
  });

  it("Năm sinh Chi chưa xác nhận (VD Dần) trả về nhãn rõ ràng, không đoán bừa", () => {
    // Năm Nhâm Dần 2022 -> yearChi = Dần (index 2), thuộc nhóm 8 Chi chưa có Golden Master.
    const chart = tinhTuVi({ day: 15, month: 6, year: 2022, hour: 11, gender: "Nam" });
    expect(chart.yearChiName).toBe("Dần");
    expect(chart.chuMenh).toBe("NEED_GOLDEN_MASTER_REVIEW");
    expect(chart.chuThan).toBe("NEED_GOLDEN_MASTER_REVIEW");
  });
});
