// Phase 9 mục 2 — POSITION / STATUS SEPARATION TEST.
//
// Chứng minh MAIN_STAR_STATUS (bảng Miếu/Vượng/Đắc/Bình/Hãm) hoàn toàn tách biệt khỏi mọi phép tính vị
// trí/cấu trúc lá số khác: vị trí 14 chính tinh, tên cung, Mệnh, Thân, Cục, Đại Vận, Tứ Hóa (chọn Can,
// không phải nhãn gắn lên sao). Cách chứng minh: tạm thời GHI ĐÈ toàn bộ MAIN_STAR_STATUS bằng giá trị
// khác hẳn, tính lại lá số CÙNG 1 input, rồi so sánh — nếu bất kỳ trường nào ngoài `trangThai` đổi theo,
// TEST FAIL (chứng tỏ status table đang rò rỉ ảnh hưởng sang layer khác, đúng lỗi kiến trúc cần phát
// hiện). Khôi phục bảng gốc ngay sau test để không ảnh hưởng các test khác.

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { tinhTuVi } from "../src/lib/tu-vi/engine";
import { MAIN_STAR_STATUS, type TrangThaiSao } from "../src/lib/tu-vi/rules";

const ORIGINAL_STATUS: Record<string, TrangThaiSao[]> = JSON.parse(JSON.stringify(MAIN_STAR_STATUS));

function mutateAllStatusTo(value: TrangThaiSao) {
  for (const star of Object.keys(MAIN_STAR_STATUS)) {
    MAIN_STAR_STATUS[star] = MAIN_STAR_STATUS[star].map(() => value);
  }
}
function restoreStatus() {
  for (const star of Object.keys(ORIGINAL_STATUS)) {
    MAIN_STAR_STATUS[star] = [...ORIGINAL_STATUS[star]];
  }
}

afterEach(() => restoreStatus());

const INPUT = { day: 31, month: 8, year: 1980, hour: 11, gender: "Nam" as const, viewingYear: 2026 };

describe("Position/Status separation — ghi đè toàn bộ status table không được đổi bất kỳ field nào khác", () => {
  it("Vị trí 14 chính tinh (star -> chi) không đổi khi status table đổi", () => {
    const before = tinhTuVi(INPUT);
    const positionsBefore = before.cungs.map((c) => ({ chi: c.chiName, stars: c.chinhTinh.map((s) => s.name).sort() }));

    mutateAllStatusTo("Bình");
    const after = tinhTuVi(INPUT);
    const positionsAfter = after.cungs.map((c) => ({ chi: c.chiName, stars: c.chinhTinh.map((s) => s.name).sort() }));

    expect(positionsAfter).toEqual(positionsBefore);
  });

  it("Tên cung (12 cung) không đổi khi status table đổi", () => {
    const before = tinhTuVi(INPUT).cungs.map((c) => c.cungName);
    mutateAllStatusTo("Hãm");
    const after = tinhTuVi(INPUT).cungs.map((c) => c.cungName);
    expect(after).toEqual(before);
  });

  it("Mệnh / Thân (chiIndex) không đổi khi status table đổi", () => {
    const before = tinhTuVi(INPUT);
    mutateAllStatusTo("Miếu");
    const after = tinhTuVi(INPUT);
    expect(after.menhChiIndex).toBe(before.menhChiIndex);
    expect(after.thanChiIndex).toBe(before.thanChiIndex);
  });

  it("Cục không đổi khi status table đổi", () => {
    const before = tinhTuVi(INPUT).cucName;
    mutateAllStatusTo("Đắc");
    const after = tinhTuVi(INPUT).cucName;
    expect(after).toBe(before);
  });

  it("Đại Vận (tuổi khởi từng cung) không đổi khi status table đổi", () => {
    const before = tinhTuVi(INPUT).cungs.map((c) => c.daiVanTuoi);
    mutateAllStatusTo("Vượng");
    const after = tinhTuVi(INPUT).cungs.map((c) => c.daiVanTuoi);
    expect(after).toEqual(before);
  });

  it("Tứ Hóa (Can nào Hóa Lộc/Quyền/Khoa/Kỵ) không đổi khi status table đổi", () => {
    const before = tinhTuVi(INPUT).tuHoa;
    mutateAllStatusTo("Bình");
    const after = tinhTuVi(INPUT).tuHoa;
    expect(after).toEqual(before);
  });

  it("Ngược lại: trangThai THỰC SỰ đổi theo status table (sanity check — nếu không đổi thì test trên vô nghĩa)", () => {
    const before = tinhTuVi(INPUT);
    const trangThaiBefore = before.cungs.flatMap((c) => c.chinhTinh.map((s) => s.trangThai));
    mutateAllStatusTo("Hãm");
    const after = tinhTuVi(INPUT);
    const trangThaiAfter = after.cungs.flatMap((c) => c.chinhTinh.map((s) => s.trangThai));
    expect(trangThaiAfter.every((t) => t === "Hãm")).toBe(true);
    expect(trangThaiAfter).not.toEqual(trangThaiBefore);
  });
});
