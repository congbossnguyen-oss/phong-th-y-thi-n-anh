// Test engine Hợp Hôn Bát Tự × Tử Vi — thuần công thức, chạy offline không cần AI/DB.
import { describe, expect, it } from "vitest";
import { tinhHopHon } from "../src/lib/hop-hon";
import { quanHeNhatChi, lapHoSoBatTu, demLucNguHanh, pheTroi } from "../src/lib/hop-hon/bat-tu-tang";
import { timTuCamHonNhan, BANG_THAP_THAN, TU_CAM_HON_NHAN } from "../src/lib/hop-hon/bang-luat";
import type { Phe } from "../src/lib/bat-tu-engine/engine";

const NGUOI_A = { day: 12, month: 5, year: 1990, hour: 8, gender: "Nam" as const };
const NGUOI_B = { day: 22, month: 11, year: 1992, hour: 14, gender: "Nữ" as const };

describe("bảng luật", () => {
  it("bảng Thập Thần phủ đúng đủ 15 cặp không trùng của 5 nhóm", () => {
    const PHE: Phe[] = ["ty_kiep", "thuc_thuong", "tai", "quan_sat", "an"];
    const thay = new Set<string>();
    for (const l of BANG_THAP_THAN) {
      const key = [...l.capNhom].sort().join("|");
      expect(thay.has(key)).toBe(false);
      thay.add(key);
    }
    expect(thay.size).toBe(15);
    for (let i = 0; i < PHE.length; i++)
      for (let j = i; j < PHE.length; j++)
        expect(thay.has([PHE[i], PHE[j]].sort().join("|"))).toBe(true);
  });

  it("mọi cặp mức căng đều có cách điều chỉnh kèm theo", () => {
    for (const l of BANG_THAP_THAN) {
      expect(l.dieuChinh.length).toBeGreaterThan(10);
      expect(l.bieuHien.length).toBeGreaterThan(10);
    }
  });

  it("chính câu chữ trong bảng không dính từ cấm hôn nhân", () => {
    for (const l of BANG_THAP_THAN) {
      expect(timTuCamHonNhan(l.bieuHien)).toEqual([]);
      expect(timTuCamHonNhan(l.dieuChinh)).toEqual([]);
    }
  });

  it("timTuCamHonNhan bắt được từ cấm bất kể hoa thường", () => {
    expect(timTuCamHonNhan("Hai bạn nên Ly Hôn sớm")).toContain("ly hôn");
    expect(TU_CAM_HON_NHAN.length).toBeGreaterThan(20);
  });
});

describe("quan hệ Nhật Chi", () => {
  it("nhận đúng các quan hệ chuẩn", () => {
    expect(quanHeNhatChi("Tý", "Sửu")).toBe("luc_hop");
    expect(quanHeNhatChi("Tý", "Ngọ")).toBe("xung");
    expect(quanHeNhatChi("Dần", "Ngọ")).toBe("tam_hop");
    expect(quanHeNhatChi("Tý", "Mão")).toBe("hinh");
    expect(quanHeNhatChi("Tý", "Mùi")).toBe("hai");
    expect(quanHeNhatChi("Ngọ", "Ngọ")).toBe("tu_hinh");
    expect(quanHeNhatChi("Tý", "Thìn")).toBe("tam_hop");
    expect(quanHeNhatChi("Tý", "Dần")).toBe("khong");
  });

  it("chuẩn hóa Tỵ/Tị như nhau", () => {
    expect(quanHeNhatChi("Tỵ", "Thân")).toBe(quanHeNhatChi("Tị", "Thân"));
  });
});

describe("hồ sơ Bát Tự & lực ngũ hành", () => {
  it("lập hồ sơ đủ trường, cờ giờ sinh đúng", () => {
    const co = lapHoSoBatTu(NGUOI_A);
    expect(co.gioSinhBiet).toBe(true);
    expect(co.dungThan.dungThan).toBeTruthy();
    const thieu = lapHoSoBatTu({ day: 12, month: 5, year: 1990, gender: "Nam" });
    expect(thieu.gioSinhBiet).toBe(false);
  });

  it("đếm lực ngũ hành: tổng dương, trụ tháng nặng gấp đôi thể hiện qua tổng lực", () => {
    const hs = lapHoSoBatTu(NGUOI_A);
    const d = demLucNguHanh(hs.tt);
    const tong = Object.values(d).reduce((s, v) => s + v, 0);
    expect(tong).toBeGreaterThan(0);
  });

  it("pheTroi trả về 1 trong 5 phe", () => {
    const { phe } = pheTroi(lapHoSoBatTu(NGUOI_A).tt);
    expect(["ty_kiep", "thuc_thuong", "tai", "quan_sat", "an"]).toContain(phe);
  });
});

describe("tinhHopHon — pipeline đầy đủ", () => {
  it("đủ giờ sinh 2 người → 5 trục đều có kết quả, có tầng 0, nhãn tổng quan hợp lệ", () => {
    const kq = tinhHopHon({ nguoiA: NGUOI_A, nguoiB: NGUOI_B, namHienTai: 2026 });
    expect(kq.cacTruc).toHaveLength(5);
    expect(kq.cacTruc.map((t) => t.ma)).toEqual(["bo_khuyet", "phu_the", "tinh_cach", "tu_vi", "dai_van"]);
    for (const t of kq.cacTruc) expect(t.muc).not.toBe("khong_du_du_lieu");
    expect(kq.soLoaiNamSinh.diem).toBeGreaterThanOrEqual(0);
    expect(["rat_thuan", "thuan", "can_chu_dong_dieu_chinh", "nen_gap_chuyen_gia"]).toContain(kq.nhanTongQuan);
    expect(kq.tenNhanTongQuan).toBeTruthy();
    expect(kq.disclaimer.length).toBeGreaterThan(50);
    expect(kq.diemManh.length).toBeGreaterThan(0);
  });

  it("thiếu giờ sinh 1 người → Tử Vi khong_du_du_lieu, đồng thuận chưa đủ dữ liệu, các tầng khác vẫn chạy", () => {
    const kq = tinhHopHon({ nguoiA: { ...NGUOI_A, hour: undefined }, nguoiB: NGUOI_B, namHienTai: 2026 });
    const tv = kq.cacTruc.find((t) => t.ma === "tu_vi")!;
    expect(tv.muc).toBe("khong_du_du_lieu");
    expect(kq.dongThuanHaiHe.muc).toBe("chua_du_du_lieu");
    expect(kq.cacTruc.find((t) => t.ma === "bo_khuyet")!.muc).not.toBe("khong_du_du_lieu");
    // Có dòng lưu ý dụng thần tương đối.
    expect(kq.cacTruc.find((t) => t.ma === "bo_khuyet")!.canCu.join(" ")).toContain("giờ sinh");
  });

  it("KHÔNG có điểm số tổng trong kết quả (nguyên tắc bản đồ, không phán quyết)", () => {
    const kq = tinhHopHon({ nguoiA: NGUOI_A, nguoiB: NGUOI_B, namHienTai: 2026 });
    expect("diem" in kq).toBe(false);
    expect("diemTong" in kq).toBe(false);
  });

  it("mọi chuỗi hiển thị sạch từ cấm hôn nhân", () => {
    const kq = tinhHopHon({ nguoiA: NGUOI_A, nguoiB: NGUOI_B, namHienTai: 2026 });
    const tatCa = [
      kq.cauTongQuan, kq.disclaimer,
      ...kq.diemManh, ...kq.canDieuChinh,
      ...kq.cacTruc.flatMap((t) => [t.tomTat, ...(t.dieuChinh ? [t.dieuChinh] : []), ...t.canCu]),
    ];
    for (const s of tatCa) expect(timTuCamHonNhan(s)).toEqual([]);
  });

  it("kết quả ổn định (deterministic) khi gọi 2 lần cùng đầu vào", () => {
    const k1 = tinhHopHon({ nguoiA: NGUOI_A, nguoiB: NGUOI_B, namHienTai: 2026 });
    const k2 = tinhHopHon({ nguoiA: NGUOI_A, nguoiB: NGUOI_B, namHienTai: 2026 });
    expect(JSON.stringify(k1)).toBe(JSON.stringify(k2));
  });

  it("mọi trục mức căng đều kèm việc cần làm (dieuChinh)", () => {
    const kq = tinhHopHon({ nguoiA: NGUOI_A, nguoiB: NGUOI_B, namHienTai: 2026 });
    for (const t of kq.cacTruc) {
      if (t.muc === "can_dieu_chinh" || t.muc === "can_can_nhac") expect(t.dieuChinh).toBeTruthy();
    }
  });
});
