// Test Thiên Khôi/Thiên Việt đủ 10 Thiên Can (Phase 2.3 theo yêu cầu audit fix).
//
// SUPERSEDED Ở PHASE 24 (docs/TUVI_PHASE24_KHOI_VIET_XUONG_KHUC_TA_HUU.md mục III): bảng Thiên Khôi cũ
// (spec-literal, TuVi_Engine_V2.md §19) đã được thay bằng bảng nguồn Nam Phái (hoc.kabala.vn, "Sai lầm về
// an sao lập số" — CÙNG bài đã dùng cho Thiên Việt từ Phase 8, xác nhận qua đối chiếu bảng Thiên Việt
// trong bài khớp nguyên văn 100% với THIEN_VIET_TABLE hiện tại). Đây là THAY ĐỔI RULE THẬT (nguồn Nam
// Phái xác nhận nhóm Can khác với spec-literal cũ), không phải sửa expected để né fail — cùng nguyên tắc
// đã áp dụng khi chuyển it.fails()→it() ở Phase 8 và khi khóa lại status table ở Phase 16.
//
// Thiên Việt: giữ nguyên SOURCE_SUPPORTED, GOLDEN_MASTER_VERIFIED=FALSE — Phase 24 chỉ CỦNG CỐ thêm bằng
// chứng nguồn (tìm độc lập ra đúng bài đã cite từ Phase 8), không đổi giá trị bảng.

import { describe, expect, it } from "vitest";
import { getThienKhoi, getThienViet, mod12 } from "../src/lib/tu-vi/rules";

const CAN_LIST = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];

describe("Thiên Khôi — PHASE 24: khớp nguồn Nam Phái (hoc.kabala.vn, cùng nguồn đã dùng cho Thiên Việt)", () => {
  const EXPECTED_KHOI: Record<string, number> = {
    "Giáp": 1, "Mậu": 1, "Ất": 0, "Kỷ": 0, "Bính": 11, "Đinh": 11, "Canh": 6, "Tân": 6, "Nhâm": 3, "Quý": 3,
  };
  for (const can of CAN_LIST) {
    it(`Can ${can}: Thiên Khôi tại chi index ${EXPECTED_KHOI[can]}`, () => {
      expect(getThienKhoi(can)).toBe(EXPECTED_KHOI[can]);
    });
  }
});

describe("Thiên Việt — đủ 10 Can, KHÔNG còn là phép đối xứng Khôi+6 (regression E1.2)", () => {
  for (const can of CAN_LIST) {
    it(`Can ${can}: getThienViet có giá trị hợp lệ (0-11)`, () => {
      const viet = getThienViet(can);
      expect(viet).toBeGreaterThanOrEqual(0);
      expect(viet).toBeLessThanOrEqual(11);
    });
  }

  it("KHÔNG PHẢI toàn bộ 10 Can đều khớp công thức đối xứng Khôi+6 cũ (nếu khớp hết = chưa fix thật)", () => {
    // Sau Phase 24, bảng Khôi đổi nên 2/10 Can (Giáp, Mậu) tình cờ trùng Khôi+6 — vẫn còn 8/10 Can KHÔNG
    // trùng, nên assertion "không phải TẤT CẢ đều trùng" vẫn đúng và vẫn có giá trị regression thật.
    const allMatchOldSymmetry = CAN_LIST.every((can) => getThienViet(can) === mod12(getThienKhoi(can) + 6));
    expect(allMatchOldSymmetry).toBe(false);
  });

  it("SOURCE_SUPPORTED (Phase 8, củng cố thêm ở Phase 24), GOLDEN_MASTER_VERIFIED=FALSE — chưa có Golden Master nào xác nhận vị trí Thiên Việt, ghi nhận rõ trong test để không quên", () => {
    expect(true).toBe(true);
  });
});
