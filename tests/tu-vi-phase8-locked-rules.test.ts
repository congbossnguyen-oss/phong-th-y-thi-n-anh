// Phase 8 — LOCK VERIFIED RULES: test khóa các rule đã chốt + xác nhận các ô cố tình giữ UNRESOLVED
// không bị âm thầm điền giá trị đoán. Xem docs/TUVI_ENGINE_PHASE8_REPORT.md.

import { describe, expect, it } from "vitest";
import { getStar, tinhTuVi } from "../src/lib/tu-vi/engine";
import {
  CHU_MENH_BY_YEAR_BRANCH, THAN_CHU_BY_YEAR_BRANCH, THIEN_VIET_TABLE,
  getChuMenh, getChuThan, getThienViet, MAIN_STAR_STATUS,
} from "../src/lib/tu-vi/rules";

// PHASE 40 — RULE ĐỔI THẬT (không phải sửa expected để né fail): Công cung cấp bảng tra Chủ Mệnh/Chủ Thân
// đầy đủ 12/12, nên 8 ô trước đây cố tình để NEED_GOLDEN_MASTER_REVIEW nay có giá trị thật. Cùng loại
// quyết định như Phase 16 với bảng Miếu/Vượng. 4 ô VERIFIED cũ KHÔNG đổi giá trị — bảng mới trùng khớp
// 100% với chúng, đó chính là bằng chứng bảng mới dùng đúng khóa Chi năm sinh (xem rules.ts).
describe("Chủ Mệnh/Chủ Thân — khóa Chi năm sinh, đủ 12/12 sau Phase 40", () => {
  const VERIFIED_BRANCHES = { 8: "Thân", 6: "Ngọ", 1: "Sửu", 5: "Tỵ" };
  it("Đủ 12 Chi năm sinh có giá trị Chủ Mệnh", () => {
    expect(Object.keys(CHU_MENH_BY_YEAR_BRANCH).length).toBe(12);
  });
  it("Đủ 12 Chi năm sinh có giá trị Chủ Thân", () => {
    expect(Object.keys(THAN_CHU_BY_YEAR_BRANCH).length).toBe(12);
  });

  it("Không Chi nào còn trả NEED_GOLDEN_MASTER_REVIEW", () => {
    for (let chiIndex = 0; chiIndex < 12; chiIndex++) {
      expect(getChuMenh(chiIndex)).not.toBe("NEED_GOLDEN_MASTER_REVIEW");
      expect(getChuThan(chiIndex)).not.toBe("NEED_GOLDEN_MASTER_REVIEW");
    }
  });

  // 4 ô đã kiểm chứng bằng Golden Master từ Phase 8 — khóa cứng giá trị để bảng mới không âm thầm đổi.
  const GM_LOCKED: Record<number, { menh: string; than: string }> = {
    8: { menh: "Liêm Trinh", than: "Thiên Lương" },
    6: { menh: "Phá Quân", than: "Hỏa Tinh" },
    1: { menh: "Cự Môn", than: "Thiên Tướng" },
    5: { menh: "Vũ Khúc", than: "Thiên Cơ" },
  };
  for (const [chiIndex, chiName] of Object.entries(VERIFIED_BRANCHES)) {
    it(`Chi ${chiName} (index ${chiIndex}): giữ nguyên giá trị đã VERIFIED bằng Golden Master`, () => {
      expect(getChuMenh(Number(chiIndex))).toBe(GM_LOCKED[Number(chiIndex)].menh);
      expect(getChuThan(Number(chiIndex))).toBe(GM_LOCKED[Number(chiIndex)].than);
    });
  }

  // Khóa toàn bộ 12 giá trị theo đúng bảng Công cung cấp (Phase 40).
  it("Bảng Chủ Mệnh đủ 12 khớp bảng nguồn Phase 40", () => {
    expect([...Array(12).keys()].map(getChuMenh)).toEqual([
      "Tham Lang", "Cự Môn", "Lộc Tồn", "Văn Khúc", "Liêm Trinh", "Vũ Khúc",
      "Phá Quân", "Vũ Khúc", "Liêm Trinh", "Văn Khúc", "Lộc Tồn", "Cự Môn",
    ]);
  });
  it("Bảng Chủ Thân đủ 12 khớp bảng nguồn Phase 40", () => {
    expect([...Array(12).keys()].map(getChuThan)).toEqual([
      "Linh Tinh", "Thiên Tướng", "Thiên Lương", "Thiên Đồng", "Văn Xương", "Thiên Cơ",
      "Hỏa Tinh", "Thiên Tướng", "Thiên Lương", "Thiên Đồng", "Văn Xương", "Thiên Cơ",
    ]);
  });

  it("Tý (index 0) Chủ Thân = Linh Tinh — KHÁC Ngọ (Hỏa Tinh), xác nhận Phase 8 đúng khi không suy diễn đối xứng", () => {
    expect(getChuThan(0)).toBe("Linh Tinh");
    expect(getChuThan(6)).toBe("Hỏa Tinh");
  });

  // Hai bảng có CẤU TRÚC ĐỐI XỨNG KHÁC NHAU — kiểm tra để phát hiện lỗi gõ nhầm dữ liệu.
  // Chủ Mệnh: đối xứng GƯƠNG qua trục Tý–Ngọ, tức cặp (a, 12-a).
  it("Chủ Mệnh đối xứng gương qua trục Tý–Ngọ: Sửu/Hợi, Dần/Tuất, Mão/Dậu, Thìn/Thân, Tỵ/Mùi", () => {
    for (const [a, b] of [[1, 11], [2, 10], [3, 9], [4, 8], [5, 7]]) {
      expect(getChuMenh(a)).toBe(getChuMenh(b));
    }
    // Tý và Ngọ là 2 giá trị độc nhất, không bắt cặp với Chi nào.
    expect(getChuMenh(0)).toBe("Tham Lang");
    expect(getChuMenh(6)).toBe("Phá Quân");
  });

  // Chủ Thân: đối xứng ĐỐI XUNG (a, a+6) — KHÁC kiểu đối xứng của Chủ Mệnh, trừ cặp Tý/Ngọ.
  it("Chủ Thân đối xứng đối xung (a, a+6): Sửu/Mùi, Dần/Thân, Mão/Dậu, Thìn/Tuất, Tỵ/Hợi", () => {
    for (const a of [1, 2, 3, 4, 5]) {
      expect(getChuThan(a)).toBe(getChuThan(a + 6));
    }
    // Riêng Tý/Ngọ KHÔNG theo đối xung — 2 giá trị khác nhau (Linh Tinh vs Hỏa Tinh).
    expect(getChuThan(0)).not.toBe(getChuThan(6));
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

  // PHASE 40: Chi Dần trước đây nằm trong nhóm 8 Chi chưa có dữ liệu nên trả nhãn NEED_GOLDEN_MASTER_REVIEW;
  // nay đã có bảng tra đầy đủ nên phải ra giá trị thật (Lộc Tồn / Thiên Lương).
  it("Năm sinh Chi Dần (trước Phase 40 còn thiếu dữ liệu) nay trả giá trị thật", () => {
    const chart = tinhTuVi({ day: 15, month: 6, year: 2022, hour: 11, gender: "Nam" });
    expect(chart.yearChiName).toBe("Dần");
    expect(chart.chuMenh).toBe("Lộc Tồn");
    expect(chart.chuThan).toBe("Thiên Lương");
  });
});
