import { describe, expect, it } from "vitest";
import { loiTuongCuaChu, LOI_TUONG_CUA_CHU } from "../../../src/bat-trach-nha/loiTuong.js";
import type { CungBatTrach } from "../../../src/cung-menh-bat-trach/cungPhi.js";

const TAM_CUNG: CungBatTrach[] = ["Càn", "Khảm", "Cấn", "Chấn", "Tốn", "Ly", "Khôn", "Đoài"];

describe("bat-trach-nha — Lời tượng Cửa×Chủ (Dương Trạch Tam Yếu, Tập 3)", () => {
  it("đủ 64 ô, mỗi ô có câu không rỗng", () => {
    let dem = 0;
    for (const cua of TAM_CUNG) {
      for (const chu of TAM_CUNG) {
        const lt = loiTuongCuaChu(cua, chu);
        expect(lt.cau.length).toBeGreaterThan(0);
        dem++;
      }
    }
    expect(dem).toBe(64);
  });

  it("đúng 17 ô đánh dấu OCR mờ (đã đối chiếu subagent bóc từ nguồn)", () => {
    let mo = 0;
    for (const cua of TAM_CUNG) for (const chu of TAM_CUNG) if (LOI_TUONG_CUA_CHU[cua][chu].ocrMo) mo++;
    expect(mo).toBe(17);
  });

  it("ca mẫu: Cửa Càn × Chủ Cấn = 'Thiên lâm sơn thượng, gia phú quý' (Thiên y trạch, cát)", () => {
    expect(loiTuongCuaChu("Càn", "Cấn").cau).toContain("phú quý");
    expect(loiTuongCuaChu("Càn", "Cấn").ocrMo).toBeUndefined();
  });
});
