import { describe, expect, it } from "vitest";
import { luanBatCungXoayChuyen, BAT_CUNG_XOAY_CHUYEN } from "../../../src/bat-trach-nha/batCungXoayChuyen.js";
import { getKhiBatTrach, KHI_BAT_TRACH_INFO } from "../../../src/cung-menh-bat-trach/duNienBatQuai.js";
import type { CungBatTrach } from "../../../src/cung-menh-bat-trach/cungPhi.js";

const TAM_CUNG: CungBatTrach[] = ["Càn", "Khảm", "Cấn", "Chấn", "Tốn", "Ly", "Khôn", "Đoài"];

describe("bat-trach-nha — Bát Cung Xoay Chuyển (Chân Pháp Phụ lục 4)", () => {
  it("ô đọc sạch trả về nguyên văn đúng khí; ô OCR chưa tách (Khôn×Khảm) trả null", () => {
    expect(luanBatCungXoayChuyen("Càn", "Cấn")).toContain("Thiên y");
    expect(luanBatCungXoayChuyen("Khôn", "Khảm")).toBeNull();
  });

  it("mỗi đoạn luận NHẮC ĐÚNG tên khí Du Niên của ô đó (kiểm chéo nội dung khớp khung — không gán lộn ô)", () => {
    // Nếu 1 ô bị gán nhầm sang tổ hợp khác, tên khí trong đoạn văn sẽ không khớp getKhiBatTrach.
    // Bỏ qua Phục vị (nhiều đoạn ghi tên cung thay vì "Phục vị") và các ô null.
    let daKiem = 0;
    for (const toa of TAM_CUNG) {
      for (const cua of TAM_CUNG) {
        const doan = BAT_CUNG_XOAY_CHUYEN[toa]?.[cua];
        if (!doan) continue;
        const khi = getKhiBatTrach(toa, cua);
        if (khi === "phuc-vi") continue;
        const tenKhi = KHI_BAT_TRACH_INFO[khi].ten; // vd "Sinh Khí"
        // Đoạn văn phải chứa tên khí (không phân biệt hoa/thường, vì nguồn viết "Sinh khí"/"Thiên y").
        expect(doan.toLowerCase()).toContain(tenKhi.toLowerCase());
        daKiem++;
      }
    }
    expect(daKiem).toBeGreaterThan(40); // đã bóc phần lớn 56 ô không-Phục-vị
  });

  it("bảng phủ đúng 8 Tọa; tổng số ô đã bóc sạch >= 60/64", () => {
    expect(Object.keys(BAT_CUNG_XOAY_CHUYEN)).toHaveLength(8);
    let coNoiDung = 0;
    for (const toa of TAM_CUNG) for (const cua of TAM_CUNG) if (BAT_CUNG_XOAY_CHUYEN[toa]?.[cua]) coNoiDung++;
    expect(coNoiDung).toBeGreaterThanOrEqual(60);
  });
});
