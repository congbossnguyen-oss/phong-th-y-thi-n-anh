// Port vitest của selftest() trong data/engine_reference.py gốc (Tam Hợp Phái).
// 4 nhóm kiểm chứng bắt buộc PASS (giữ nguyên dữ liệu đối chiếu từ bản Python):
//   1) Long Cục + Vòng Trường Sinh  2) Ma trận Địa Mẫu Cửu Tinh đối xứng
//   3) Bát Lộ Hoàng Tuyền           4) Chạy đầy đủ 1 ca không lỗi
// + Ca đầy đủ đối chiếu data/vi-du-output-python.txt, + ca thiếu input (không đoán).

import { describe, expect, it } from "vitest";
import {
  BAT_LO_HOANG_TUYEN,
  DIA_MAU_CUU_TINH,
  QUAI_ORDER,
  phanTich,
  viTriTruongSinh,
  xacDinhLongCuc,
} from "../src/lib/tam-hop-phai/engine";

describe("Test 1 — Long Cục + Vòng Trường Sinh khớp bảng gốc Excel", () => {
  it("KIM cục (Mộ tại Quý Sửu)", () => {
    expect(xacDinhLongCuc("Suu")).toBe("KIM");
    expect(viTriTruongSinh("KIM", "Ti", "thuan")).toBe("Truong Sinh");
    expect(viTriTruongSinh("KIM", "Dau", "thuan")).toBe("De Vuong");
    expect(viTriTruongSinh("KIM", "Ty", "thuan")).toBe("Tu");
    expect(viTriTruongSinh("KIM", "Dan", "thuan")).toBe("Tuyet");
    expect(viTriTruongSinh("KIM", "Suu", "thuan")).toBe("Mo");
  });

  it("THỦY cục (Mộ tại Ất Thìn)", () => {
    expect(xacDinhLongCuc("Thin")).toBe("THUY");
    expect(viTriTruongSinh("THUY", "Than", "thuan")).toBe("Truong Sinh");
    expect(viTriTruongSinh("THUY", "Ty", "thuan")).toBe("De Vuong");
    expect(viTriTruongSinh("THUY", "Mao", "thuan")).toBe("Tu");
    expect(viTriTruongSinh("THUY", "Ti", "thuan")).toBe("Tuyet");
    expect(viTriTruongSinh("THUY", "Thin", "thuan")).toBe("Mo");
  });

  it("MỘC cục (Mộ tại Đinh Mùi)", () => {
    expect(xacDinhLongCuc("Mui")).toBe("MOC");
    expect(viTriTruongSinh("MOC", "Hoi", "thuan")).toBe("Truong Sinh");
    expect(viTriTruongSinh("MOC", "Mao", "thuan")).toBe("De Vuong");
    expect(viTriTruongSinh("MOC", "Than", "thuan")).toBe("Tuyet");
    expect(viTriTruongSinh("MOC", "Mui", "thuan")).toBe("Mo");
  });

  it("HỎA cục (Mộ tại Tân Tuất)", () => {
    expect(xacDinhLongCuc("Tuat")).toBe("HOA");
    expect(viTriTruongSinh("HOA", "Dan", "thuan")).toBe("Truong Sinh");
    expect(viTriTruongSinh("HOA", "Ngo", "thuan")).toBe("De Vuong");
    expect(viTriTruongSinh("HOA", "Hoi", "thuan")).toBe("Tuyet");
    expect(viTriTruongSinh("HOA", "Tuat", "thuan")).toBe("Mo");
  });
});

describe("Test 2 — Ma trận Địa Mẫu Cửu Tinh đối xứng (đúng tính chất Du Niên)", () => {
  it("đối xứng qua đường chéo với mọi cặp quái", () => {
    for (const q1 of QUAI_ORDER) {
      for (const q2 of QUAI_ORDER) {
        expect(DIA_MAU_CUU_TINH[q1][q2]).toBe(DIA_MAU_CUU_TINH[q2][q1]);
      }
    }
  });
});

describe("Test 3 — Bát Lộ Hoàng Tuyền khớp dữ liệu gốc", () => {
  it("hướng cấm của 4 cục", () => {
    expect(BAT_LO_HOANG_TUYEN.HOA.huong_pham).toEqual(["Ton", "Ti"]);
    expect(BAT_LO_HOANG_TUYEN.THUY.huong_pham).toEqual(["Can2", "Hoi"]);
    expect(BAT_LO_HOANG_TUYEN.KIM.huong_pham).toEqual(["Khon", "Than"]);
    expect(BAT_LO_HOANG_TUYEN.MOC.huong_pham).toEqual(["Can", "Dan"]);
  });
});

describe("Test 4 — Chạy đầy đủ 1 ca (Hướng Đinh 195°) không lỗi", () => {
  it("ra đúng Hỏa cục", () => {
    const out = phanTich(195, {
      thuyKhau: "Tuat", giangLong: "Khon", giangKhi: "Mao", laiThuy: "Dan", khuThuy: "Than",
    });
    expect(out.long_cuc).toBe("Hỏa cục");
  });
});

describe("Đối chiếu data/vi-du-output-python.txt (ca đầy đủ 195°/Tuất/Khôn/Mão/Dần/Thân)", () => {
  const out = phanTich(195, {
    thuyKhau: "Tuat", giangLong: "Khon", giangKhi: "Mao", laiThuy: "Dan", khuThuy: "Than",
  });

  it("Tọa/Hướng", () => {
    expect(out.huong).toEqual({ son: "Đinh", quai: "Đoài", am_duong: "Am" });
    expect(out.toa).toEqual({ son: "Quý", quai: "Khảm", am_duong: "Duong" });
  });

  it("Thủy Pháp (theo Hướng Đoài) — Càn HUNG, Đoài CÁT", () => {
    expect(out.thuy_phap_8_phuong.CAN.loai).toBe("hung");
    expect(out.thuy_phap_8_phuong.DOAI.loai).toBe("cat");
  });

  it("Sa Pháp (theo Tọa Khảm) — Khảm CÁT, Càn HUNG; ngũ hành Tọa = Thuy", () => {
    expect(out.sa_phap_8_phuong.KHAM.loai).toBe("cat");
    expect(out.sa_phap_8_phuong.CAN.loai).toBe("hung");
    expect(out.toa_ngu_hanh).toBe("Thuy");
  });

  it("Bát Lộ Hoàng Tuyền (Hỏa cục): cấm Tốn/Tị, cung tử Canh, Dau", () => {
    expect(out.bat_lo_hoang_tuyen?.huong_cam_mo_cua_cong_ho_nuoc).toEqual(["Tốn", "Tị"]);
    expect(out.bat_lo_hoang_tuyen?.cung_tu_neu_pham).toBe("Canh, Dau");
  });

  it("Lai/Khứ thủy + Vòng Trường Sinh", () => {
    expect(out.lai_thuy_ket_luan).toContain("Lộc Tồn");
    expect(out.lai_thuy_ket_luan).toContain("HUNG");
    expect(out.lai_thuy_truong_sinh).toContain("Trường Sinh");
    expect(out.lai_thuy_truong_sinh).toContain("nhóm TỐT");
    expect(out.khu_thuy_ket_luan).toContain("Liêm Trinh");
    expect(out.khu_thuy_ket_luan).toContain("phù hợp");
    expect(out.khu_thuy_truong_sinh).toContain("Bệnh");
    expect(out.khu_thuy_truong_sinh).toContain("hợp lệ");
  });

  it("Bát Sát Huỳnh Tuyền: đã kiểm tra, cả 2 trường hợp KHÔNG phạm", () => {
    expect(out.bat_sat_huynh_tuyen.da_kiem_tra).toBe(true);
    expect(out.bat_sat_huynh_tuyen.ket_qua).toHaveLength(2);
    expect(out.bat_sat_huynh_tuyen.ket_qua?.[0]).toContain("Không phạm TH1");
    expect(out.bat_sat_huynh_tuyen.ket_qua?.[1]).toContain("Không phạm TH2");
  });

  it("Giữ cảnh báo Phụ Tinh trùng (hàng Đoài) + cảnh báo Bát Sát độ tin cậy TRUNG BÌNH", () => {
    expect(out.canh_bao.some((c) => c.includes("Đoài") && c.includes("trùng tên sao"))).toBe(true);
    expect(out.canh_bao.some((c) => c.includes("TRUNG BÌNH"))).toBe(true);
  });
});

describe("Ca thiếu input (chỉ có Hướng) — KHÔNG được tự đoán", () => {
  const out = phanTich(195);

  it("không tính Long Cục / Bát Lộ khi thiếu Thủy Khẩu", () => {
    expect(out.long_cuc).toBeUndefined();
    expect(out.bat_lo_hoang_tuyen).toBeUndefined();
    expect(out.canh_bao.some((c) => c.includes("Chưa nhập Thủy Khẩu"))).toBe(true);
  });

  it("không kiểm Bát Sát khi thiếu Giáng Long/Giáng Khí", () => {
    expect(out.bat_sat_huynh_tuyen.da_kiem_tra).toBe(false);
    expect(out.bat_sat_huynh_tuyen.ket_qua).toBeUndefined();
    expect(out.canh_bao.some((c) => c.includes("Chưa nhập Giáng Long/Giáng Khí"))).toBe(true);
  });
});
