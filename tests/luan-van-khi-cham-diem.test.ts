// Kiểm tra TẦNG CHẤM ĐIỂM (src/lib/quan-su/luan-van-khi/cham-diem.ts) — SPEC.md §3.
import { describe, expect, it } from "vitest";
import { tinhBatTu } from "../src/lib/bat-tu";
import { phanTichBatTu, type TuTruInput } from "../src/lib/bat-tu-engine/engine";
import { chamDiem4LinhVuc, chamDiemLinhVuc } from "../src/lib/quan-su/luan-van-khi/cham-diem";
import { tinhTrangThaiThoiDiem } from "../src/lib/quan-su/luan-van-khi/tang-dong";
import type { LinhVucKey } from "../src/lib/quan-su/luan-van-khi/types";

const chart = tinhBatTu({ day: 15, month: 6, year: 1990, hour: 10, gender: "Nam" });
const tt: TuTruInput = {
  nam: { can: chart.year.can, chi: chart.year.chi },
  thang: { can: chart.month.can, chi: chart.month.chi },
  ngay: { can: chart.day.can, chi: chart.day.chi },
  gio: { can: chart.hour.can, chi: chart.hour.chi },
  gioiTinh: "Nam",
};
const pt = phanTichBatTu(tt);

describe("Tầng chấm điểm — điểm hợp lệ + canCu có căn cứ (lá số tham chiếu 15/6/1990)", () => {
  it("mọi Đại Vận: 4 lĩnh vực đều có điểm nguyên trong [0,10], nhãn khớp thang điểm, canCu không rỗng", () => {
    for (const dv of chart.daiVan) {
      const trangThai = tinhTrangThaiThoiDiem({
        tt, vsGoc: pt.vuongSuy, dtGoc: pt.dungThan, loai: "DaiVan",
        canChi: { can: dv.can, chi: dv.chi }, namBatDau: dv.startDate.y,
      });
      const diem4 = chamDiem4LinhVuc({ tt, trangThai, capDoGoc: pt.vuongSuy.capDo, gioiTinh: "Nam" });
      expect(diem4).toHaveLength(4);
      for (const d of diem4) {
        expect(Number.isInteger(d.diem)).toBe(true);
        expect(d.diem).toBeGreaterThanOrEqual(0);
        expect(d.diem).toBeLessThanOrEqual(10);
        expect(d.canCu.length).toBeGreaterThan(0);
        expect(d.nhan.length).toBeGreaterThan(0);
        // Nếu điểm khác 5 (trung tính) thì canCu phải là dấu hiệu THẬT, không phải câu "không đủ dấu hiệu".
        if (d.diem !== 5) {
          expect(d.canCu.join(" ")).not.toContain("Không đủ dấu hiệu rõ");
        }
      }
    }
  });

  it("nhãn map đúng thang_nhan (config-linh-vuc.json)", () => {
    const trangThai = tinhTrangThaiThoiDiem({
      tt, vsGoc: pt.vuongSuy, dtGoc: pt.dungThan, loai: "DaiVan",
      canChi: { can: chart.daiVan[0]!.can, chi: chart.daiVan[0]!.chi }, namBatDau: chart.daiVan[0]!.startDate.y,
    });
    for (const lv of ["tai_van", "quan_van", "suc_khoe", "tinh_duyen"] as LinhVucKey[]) {
      const d = chamDiemLinhVuc(lv, { tt, trangThai, capDoGoc: pt.vuongSuy.capDo, gioiTinh: "Nam" });
      if (d.diem >= 8) expect(d.nhan).toBe("Rất thuận lợi");
      else if (d.diem >= 6) expect(d.nhan).toBe("Thuận lợi");
      else if (d.diem === 5) expect(d.nhan).toBe("Bình hòa");
      else if (d.diem >= 3) expect(d.nhan).toBe("Cần lưu ý");
      else expect(d.nhan).toBe("Cần thận trọng");
    }
  });
});

describe("Tầng chấm điểm — kiểm định hướng (đối chiếu tay theo Dụng/Hỷ/Kỵ Thần thật của lá số, không hardcode tuyệt đối)", () => {
  // Lá số 15/6/1990: Nhật Chủ Tân Kim Nhược, Dụng=Thổ (Ấn), Hỷ=Hỏa, Kỵ=Mộc (phanTichBatTu tính ra —
  // xem thêm tests/luan-van-khi-tang-dong.test.ts). SPEC.md §7 minh họa bằng "Đại Vận Hỏa mạnh khắc
  // Tân Kim nhược → sức khỏe/quan vận kém" theo trực giác cổ điển; nhưng bat-tu-engine (đã build sẵn,
  // không được dựng song song) chọn nhánh "Ấn hóa Sát" cho lá số CHÍNH XÁC này, khiến Hỏa thành HỶ
  // THẦN (nuôi Ấn) chứ không phải Kỵ — nguồn sự thật là engine đã có, không phải suy luận tay. Kiểm
  // định hướng ở đây bám đúng Dụng/Hỷ/Kỵ THẬT mà engine trả, đúng tinh thần SPEC §7 (không hardcode
  // điểm số tuyệt đối, chỉ kiểm CHIỀU biến thiên theo tín hiệu thật).
  it("Đại Vận có Can là Kỵ Thần (Mộc) thấu → Quan vận/Sức khỏe thấp hơn Đại Vận có Can là Dụng Thần (Thổ) thấu", () => {
    const dvKyThan = chart.daiVan.find((d) => d.can === "Giáp" || d.can === "Ất")!; // Mộc = Kỵ Thần
    const dvDungThan = chart.daiVan.find((d) => d.can === "Mậu" || d.can === "Kỷ")!; // Thổ = Dụng Thần
    expect(dvKyThan).toBeTruthy();
    expect(dvDungThan).toBeTruthy();

    const diemCua = (dv: typeof dvKyThan) => {
      const trangThai = tinhTrangThaiThoiDiem({
        tt, vsGoc: pt.vuongSuy, dtGoc: pt.dungThan, loai: "DaiVan",
        canChi: { can: dv.can, chi: dv.chi }, namBatDau: dv.startDate.y,
      });
      return chamDiem4LinhVuc({ tt, trangThai, capDoGoc: pt.vuongSuy.capDo, gioiTinh: "Nam" });
    };
    const diemKy = diemCua(dvKyThan);
    const diemDung = diemCua(dvDungThan);
    const quanKy = diemKy.find((d) => d.linhVuc === "quan_van")!.diem;
    const quanDung = diemDung.find((d) => d.linhVuc === "quan_van")!.diem;
    expect(quanKy).toBeLessThan(quanDung);
  });
});

describe("Tầng chấm điểm — Tình duyên chấm theo giới tính (Nam: Tài, Nữ: Quan Sát) — SPEC §3 + §7 case 6", () => {
  it("cùng 1 TrangThaiThoiDiem, đổi gioiTinh → canCu tình duyên có thể khác nhau (Thập Thần liên quan khác)", () => {
    const dv = chart.daiVan.find((d) => d.can === "Canh" || d.can === "Tân")!; // Kim = Tỷ Kiếp của Tân Kim, trung tính cho cả 2 giới — dùng DV có Tài/Quan rõ hơn:
    const dvTaiHoacQuan = chart.daiVan.find((d) => ["Giáp", "Ất", "Bính", "Đinh"].includes(d.can))!;
    const trangThai = tinhTrangThaiThoiDiem({
      tt, vsGoc: pt.vuongSuy, dtGoc: pt.dungThan, loai: "DaiVan",
      canChi: { can: dvTaiHoacQuan.can, chi: dvTaiHoacQuan.chi }, namBatDau: dvTaiHoacQuan.startDate.y,
    });
    const diemNam = chamDiemLinhVuc("tinh_duyen", { tt, trangThai, capDoGoc: pt.vuongSuy.capDo, gioiTinh: "Nam" });
    const diemNu = chamDiemLinhVuc("tinh_duyen", { tt, trangThai, capDoGoc: pt.vuongSuy.capDo, gioiTinh: "Nữ" });
    // Không đòi hỏi điểm số phải khác (có thể trùng ngẫu nhiên), nhưng đảm bảo hàm THỰC SỰ nhận
    // gioiTinh làm tham số ảnh hưởng — nghĩa là ít nhất tồn tại 1 Đại Vận trong toàn bộ 10 Đại Vận mà
    // 2 giới cho điểm khác nhau, chứng tỏ đây không phải tham số bị bỏ qua.
    void diemNam; void diemNu;
    const khacO1DaiVan = chart.daiVan.some((dv2) => {
      const ts = tinhTrangThaiThoiDiem({
        tt, vsGoc: pt.vuongSuy, dtGoc: pt.dungThan, loai: "DaiVan",
        canChi: { can: dv2.can, chi: dv2.chi }, namBatDau: dv2.startDate.y,
      });
      const dNam = chamDiemLinhVuc("tinh_duyen", { tt, trangThai: ts, capDoGoc: pt.vuongSuy.capDo, gioiTinh: "Nam" });
      const dNu = chamDiemLinhVuc("tinh_duyen", { tt, trangThai: ts, capDoGoc: pt.vuongSuy.capDo, gioiTinh: "Nữ" });
      return dNam.diem !== dNu.diem || dNam.canCu.join("|") !== dNu.canCu.join("|");
    });
    expect(khacO1DaiVan).toBe(true);
  });
});
