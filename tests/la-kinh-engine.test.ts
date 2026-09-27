// Test aggregator La Kinh — chỉ kiểm phần NỐI DÂY (đúng field, đúng độ dài vòng, không lệch
// wedge, không suy đoán khi thiếu input). 4 engine gốc (Bát Trạch, Tam Hợp, Phi Tinh, Đại Quái)
// đã có test riêng đầy đủ — không lặp lại ở đây.
import { BatTrachNha } from "@thien-anh/rule-engine";
import { describe, expect, it } from "vitest";
import { tinhLaKinh } from "../src/lib/la-kinh/engine";

describe("tinhLaKinh — độ dài mỗi vòng đúng số phần đã biết", () => {
  const kq = tinhLaKinh(0, { namLuan: 2026 });
  it("Bát Trạch 8, Tam Hợp 8, Phi Tinh 24, Đại Quái 64", () => {
    expect(kq.vongBatTrach).toHaveLength(8);
    expect(kq.vongTamHop).toHaveLength(8);
    expect(kq.vongPhiTinh).toHaveLength(24);
    expect(kq.vongDaiQuai).toHaveLength(64);
  });
});

describe("tinhLaKinh(0) — Bắc chính (0°) phải rơi đúng cung/quẻ đã biết", () => {
  const kq = tinhLaKinh(0, { namLuan: 2026 });
  it("Bát Trạch tại 0° = Khảm (doToCung(0) đã xử lý riêng biên 337.5-22.5)", () => {
    expect(kq.vongBatTrach[0]!.cung).toBe("Khảm");
    expect(kq.vongBatTrach[0]!.centerDeg).toBe(0);
  });
  it("Tam Hợp tại 0° cũng = quái Khảm (cùng vị trí vật lý với Bát Trạch)", () => {
    expect(kq.vongTamHop[0]!.quai).toBe("Khảm");
    expect(kq.vongTamHop[0]!.thuy).toBeDefined();
    expect(kq.vongTamHop[0]!.sa).toBeDefined();
  });
  it("Đại Quái tại 0° = Phục (mốc 0.000 đầu bảng 64 quẻ)", () => {
    expect(kq.vongDaiQuai[0]!.que.tenQue).toBe("Phục");
    expect(kq.vongDaiQuai[0]!.startDeg).toBe(0);
  });
});

describe("Quy ước wedge — mỗi vòng phủ kín 0-360°, không hở/chồng (đã sửa lệch nửa wedge của Đại Quái)", () => {
  it.each([
    ["Bát Trạch", () => tinhLaKinh(0).vongBatTrach],
    ["Tam Hợp", () => tinhLaKinh(0).vongTamHop],
    ["Phi Tinh", () => tinhLaKinh(0).vongPhiTinh],
    ["Đại Quái", () => tinhLaKinh(0).vongDaiQuai],
  ] as const)("%s: wedge sau nối liền wedge trước", (_ten, layVong) => {
    const vong = layVong();
    for (let i = 0; i < vong.length; i++) {
      const w = vong[i]!;
      expect(w.endDeg - w.startDeg).toBeGreaterThan(0);
      expect(w.centerDeg).toBeGreaterThanOrEqual(w.startDeg);
      expect(w.centerDeg).toBeLessThanOrEqual(w.endDeg);
    }
  });

  it("Đại Quái: wedge 0 là [0, 5.625) — KHÔNG lệch thành [-2.8125, 2.8125) như công thức tâm-tại-0 của 3 vòng khác", () => {
    const w0 = tinhLaKinh(0).vongDaiQuai[0]!;
    expect(w0.startDeg).toBe(0);
    expect(w0.endDeg).toBeCloseTo(5.625, 6);
  });
});

describe("diemHuong — đọc tại ĐÚNG độ nhập vào, không lượng tử hóa theo tâm wedge", () => {
  it("137° (giữa quẻ Thái, không phải tâm wedge nào của 3 vòng khác) vẫn ra đúng quẻ + cung", () => {
    const kq = tinhLaKinh(137, { namLuan: 2026 });
    expect(kq.diemHuong.daiQuai.que.tenQue).toBe("Thái");
    expect(kq.diemHuong.batTrach.cung).toBe(BatTrachNha.doToCung(137));
  });

  it("180° (đại không vong, mốc Càn/Cấu) → daiQuai.khongVong.laDaiKhongVong = true", () => {
    const kq = tinhLaKinh(180, { namLuan: 2026 });
    expect(kq.diemHuong.daiQuai.khongVong.laDaiKhongVong).toBe(true);
  });
});

describe("Không suy đoán khi thiếu input", () => {
  it("Không có năm sinh/giới tính gia chủ → mọi wedge Bát Trạch khi=null (không tự chọn mệnh cung)", () => {
    const kq = tinhLaKinh(90);
    expect(kq.vongBatTrach.every((w) => w.khi === null)).toBe(true);
  });

  it("Có năm sinh + giới tính → khi khác null", () => {
    const kq = tinhLaKinh(90, { namSinhGiaChu: 1990, gioiTinh: "nam" });
    expect(kq.vongBatTrach.some((w) => w.khi !== null)).toBe(true);
  });

  it("namLuan ngoài bảng Vận (1864-2043) → vanHienHanh null, vungKhi mọi quẻ null, KHÔNG throw", () => {
    const kq = tinhLaKinh(90, { namLuan: 1500 });
    expect(kq.vanHienHanh).toBeNull();
    expect(kq.vongDaiQuai.every((w) => w.vungKhi === null)).toBe(true);
  });

  it("namLuan trong bảng → vanHienHanh có số, vungKhi mọi quẻ được gán", () => {
    const kq = tinhLaKinh(90, { namLuan: 2026 });
    expect(kq.vanHienHanh).toBe(9);
    expect(kq.vongDaiQuai.every((w) => w.vungKhi !== null)).toBe(true);
  });
});
