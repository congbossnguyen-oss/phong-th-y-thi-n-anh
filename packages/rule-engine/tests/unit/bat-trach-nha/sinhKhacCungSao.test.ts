import { describe, expect, it } from "vitest";
import { getKhiBatTrach } from "../../../src/cung-menh-bat-trach/duNienBatQuai.js";
import type { CungBatTrach } from "../../../src/cung-menh-bat-trach/cungPhi.js";
import { xetSinhKhacCungSao, SO_CUNG_CAT_CON_LAI, MO_TA_25_TO_HOP } from "../../../src/bat-trach-nha/sinhKhacCungSao.js";

const TAM_CUNG: CungBatTrach[] = ["Càn", "Khảm", "Cấn", "Chấn", "Tốn", "Ly", "Khôn", "Đoài"];
const CAT_KHI = new Set(["sinh-khi", "thien-y", "dien-nien", "phuc-vi"]);

// Port lại đúng logic tests/test_2_sinh_khac_cung_sao.py và tests/test_3_doi_chung_phuong_an_B.py
// của gói build — đã chạy Python xác nhận: phương án A khớp 8/8 (số cung cát) + 4/6 (ví dụ);
// phương án B khớp 3/8 + 6/6. Test này khẳng định lại đúng 4 con số đó bằng TypeScript.
function demCungCatConLai(trach: CungBatTrach, phuongAn: "A" | "B"): number {
  let n = 0;
  for (const c of TAM_CUNG) {
    const khi = getKhiBatTrach(trach, c);
    if (!CAT_KHI.has(khi)) continue;
    if (xetSinhKhacCungSao(c, khi, phuongAn) === "cung-khac-sao" || xetSinhKhacCungSao(c, khi, phuongAn) === "sao-khac-cung") continue;
    n++;
  }
  return n;
}

describe("bat-trach-nha — Sinh khắc Cung-Sao (data/09, kiểm toán bằng chương trình)", () => {
  it("Phương án A khớp ĐÚNG 8/8 trạch với bảng số cung cát của sách", () => {
    let khop = 0;
    for (const trach of TAM_CUNG) {
      if (demCungCatConLai(trach, "A") === SO_CUNG_CAT_CON_LAI[trach]) khop++;
    }
    expect(khop).toBe(8);
  });

  it("Phương án B khớp ĐÚNG 3/8 trạch (không phải 8/8 — xác nhận đúng phát hiện mâu thuẫn nguồn)", () => {
    let khop = 0;
    for (const trach of TAM_CUNG) {
      if (demCungCatConLai(trach, "B") === SO_CUNG_CAT_CON_LAI[trach]) khop++;
    }
    expect(khop).toBe(3);
  });

  const VI_DU_6 = [
    { mota: "VD1: Ly trạch, cửa Càn + cửa phụ Đoài -> trưởng nam mất trước", a: "Càn" as CungBatTrach, b: "Đoài" as CungBatTrach, ketSach: "cung-khac-sao" },
    { mota: "VD2: Tốn trạch, cửa Càn + cửa sau Ly -> cha già chết dữ", a: "Càn" as CungBatTrach, b: "Ly" as CungBatTrach, ketSach: "cung-khac-sao" },
    { mota: "VD3: Chấn trạch, cửa Đoài + tháp nước sau Chấn -> trưởng nam yếu chân", a: "Đoài" as CungBatTrach, b: "Chấn" as CungBatTrach, ketSach: "sao-khac-cung" },
    { mota: "VD4: Chấn trạch, cửa Đoài + tháp điện Ly -> thiếu nữ ốm đau", a: "Đoài" as CungBatTrach, b: "Ly" as CungBatTrach, ketSach: "sao-khac-cung" },
    { mota: "VD5: cửa phòng Khôn + giường Cấn -> bệnh dạ dày lâu năm", a: "Khôn" as CungBatTrach, b: "Cấn" as CungBatTrach, ketSach: "sao-khac-cung" },
    { mota: "VD6: cửa phòng Đoài + giường Khảm -> bệnh suy thận", a: "Đoài" as CungBatTrach, b: "Khảm" as CungBatTrach, ketSach: "sao-khac-cung" },
  ];

  it("Phương án A khớp ĐÚNG 4/6 ví dụ thực tế", () => {
    let khop = 0;
    for (const vd of VI_DU_6) {
      const khi = getKhiBatTrach(vd.a, vd.b);
      const tt = [xetSinhKhacCungSao(vd.a, khi, "A"), xetSinhKhacCungSao(vd.b, khi, "A")];
      if (tt.includes(vd.ketSach as "cung-khac-sao" | "sao-khac-cung")) khop++;
    }
    expect(khop).toBe(4);
  });

  it("Phương án B khớp ĐÚNG 6/6 ví dụ thực tế", () => {
    let khop = 0;
    for (const vd of VI_DU_6) {
      const khi = getKhiBatTrach(vd.a, vd.b);
      const tt = [xetSinhKhacCungSao(vd.a, khi, "B"), xetSinhKhacCungSao(vd.b, khi, "B")];
      if (tt.includes(vd.ketSach as "cung-khac-sao" | "sao-khac-cung")) khop++;
    }
    expect(khop).toBe(6);
  });

  it("bảng theo KHÍ (8 khí × 5 quan hệ = 40 ô, Tham Lang/Phụ Bật lặp lại chung 1 kết quả theo data/06): đúng 3 ô Phá Quân còn trống, 37 ô còn lại đều có mô tả", () => {
    let trong = 0;
    let coMoTa = 0;
    for (const khi of Object.keys(MO_TA_25_TO_HOP) as (keyof typeof MO_TA_25_TO_HOP)[]) {
      const quanHeCanCo: (keyof (typeof MO_TA_25_TO_HOP)[typeof khi])[] = ["ty-hoa", "cung-sinh-sao", "sao-sinh-cung", "cung-khac-sao", "sao-khac-cung"];
      for (const qh of quanHeCanCo) {
        if (MO_TA_25_TO_HOP[khi][qh]) coMoTa++;
        else trong++;
      }
    }
    expect(trong).toBe(3);
    expect(coMoTa).toBe(37);
  });
});
