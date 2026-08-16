/**
 * NỀN TRẠCH CÁT CỦA NGÀY — bộ chấm điểm "chất lượng chung của 1 ngày" dùng chung (Trực, Hoàng
 * Đạo/Hắc Đạo, Nhị Thập Bát Tú, Thần Sát, các ngày đại kỵ, Thiên Đức Hợp/Thiên Xá), KHÔNG xét
 * tương tác với cá nhân hay mục đích cụ thể nào.
 *
 * Đây là "dữ liệu nền" DÙNG CHUNG cho nhiều module mới (Vận May Trong Ngày, Ngày Khai Trương,
 * Ngày Ký Hợp Đồng, Ngày Đại Cát Cá Nhân, Giờ Tốt Trong Ngày) — mỗi module tự cấu hình trọng số
 * riêng (`TrachCatDayBaseRules` của module đó, đặt trong `*_SCORING_RULES` của module) và tự
 * đặt tên hàm bọc ngoài (`calculateTrachCatDayScore`, `calculatePersonalDayBaseScore`,
 * `calculateKhaiTruongBaseScore`, `calculateKyHopDongBaseScore`...) theo đúng kiến trúc đã yêu
 * cầu cho từng module — KHÔNG chia sẻ 1 hàm/1 bộ trọng số tổng hợp duy nhất.
 */
import type { CatHung } from "../trach-nhat/catHung.js";

export interface TrachCatDayBaseRules {
  diemNenTang: number;
  hoangDaoHacDao: Record<"hoàng đạo" | "hắc đạo" | "không xác định", number>;
  nhiThapBatTu: { cat: number; hung: number };
  trucTot: readonly string[];
  trucXau: readonly string[];
  diemTrucTot: number;
  diemTrucXau: number;
  thanSat: {
    diemMoiCat: number;
    diemMoiHung: number;
    tenUuTien: Record<string, number>;
  };
  ngayDaiKy: {
    nguyetKy: number;
    tamNuong: number;
    duongCongKyNhat: number;
    satChu: number;
    diemTranNeuPham: number;
    /**
     * Sát / Bạch Hổ Nhập Trung Cung. TUỲ CHỌN, mặc định -3 nếu module không khai báo — nhờ vậy
     * thêm được đại sát này mà không phải sửa bộ luật của cả 12 module.
     */
    nhapTrungCung?: number;
  };
  ngayCatKhac: {
    diemMoiNgayCat: number;
  };
}

export interface TrachCatDayBaseInput {
  trucName: string;
  hoangDaoHacDao: "hoàng đạo" | "hắc đạo" | "không xác định";
  nhiThapBatTuCatHung: CatHung;
  thanSat: readonly { name: string; catHung: CatHung }[];
  nguyetKy: boolean;
  tamNuong: boolean;
  duongCongKyNhat: boolean;
  satChu: boolean;
  thienDucHop: boolean;
  thienXa: boolean;
  /**
   * Ngày phạm Sát / Bạch Hổ Nhập Trung Cung.
   *
   * Chủ dự án chốt 2026-08-16: đây là nhóm hung KHÔNG hoá giải được, nên phải ƯU TIÊN HUNG — Tam
   * Đại Cát Tinh (kể cả Trực Tinh, vốn trùng đúng 7 ngày này trong tháng Tứ Mạnh) không được phép
   * đảo kết luận thành ngày tốt. Ở lớp nền, nó kéo điểm xuống và áp trần như các ngày đại kỵ khác.
   */
  nhapTrungCung?: boolean;
}

export interface TrachCatDayBaseYeuTo {
  ten: string;
  diem: number;
}

export interface TrachCatDayBaseResult {
  diem: number;
  yeuTo: TrachCatDayBaseYeuTo[];
  phamDaiKy: boolean;
}

export function tinhTrachCatDayBase(input: TrachCatDayBaseInput, rules: TrachCatDayBaseRules): TrachCatDayBaseResult {
  const yeuTo: TrachCatDayBaseYeuTo[] = [];
  let diem: number = rules.diemNenTang;

  const hoangDaoDiem = rules.hoangDaoHacDao[input.hoangDaoHacDao];
  if (hoangDaoDiem !== 0) {
    diem += hoangDaoDiem;
    yeuTo.push({ ten: `Ngày ${input.hoangDaoHacDao}`, diem: hoangDaoDiem });
  }

  const tuDiem = input.nhiThapBatTuCatHung === "cát" ? rules.nhiThapBatTu.cat : rules.nhiThapBatTu.hung;
  diem += tuDiem;
  yeuTo.push({ ten: `Nhị Thập Bát Tú (${input.nhiThapBatTuCatHung})`, diem: tuDiem });

  if (rules.trucTot.includes(input.trucName)) {
    diem += rules.diemTrucTot;
    yeuTo.push({ ten: `Trực ${input.trucName} (thuận lợi)`, diem: rules.diemTrucTot });
  } else if (rules.trucXau.includes(input.trucName)) {
    diem += rules.diemTrucXau;
    yeuTo.push({ ten: `Trực ${input.trucName} (không thuận lợi)`, diem: rules.diemTrucXau });
  }

  for (const t of input.thanSat) {
    const uuTien = rules.thanSat.tenUuTien[t.name];
    if (uuTien !== undefined) {
      diem += uuTien;
      yeuTo.push({ ten: `${t.name} (ưu tiên)`, diem: uuTien });
    } else {
      const d = t.catHung === "cát" ? rules.thanSat.diemMoiCat : rules.thanSat.diemMoiHung;
      diem += d;
      yeuTo.push({ ten: `${t.name} (${t.catHung})`, diem: d });
    }
  }

  let phamDaiKy = false;
  if (input.nguyetKy) {
    diem += rules.ngayDaiKy.nguyetKy;
    yeuTo.push({ ten: "Nguyệt Kỵ (Ngũ Quỷ)", diem: rules.ngayDaiKy.nguyetKy });
    phamDaiKy = true;
  }
  if (input.tamNuong) {
    diem += rules.ngayDaiKy.tamNuong;
    yeuTo.push({ ten: "Tam Nương Sát", diem: rules.ngayDaiKy.tamNuong });
    phamDaiKy = true;
  }
  if (input.duongCongKyNhat) {
    diem += rules.ngayDaiKy.duongCongKyNhat;
    yeuTo.push({ ten: "Dương Công Kỵ Nhật", diem: rules.ngayDaiKy.duongCongKyNhat });
    phamDaiKy = true;
  }
  if (input.satChu) {
    diem += rules.ngayDaiKy.satChu;
    yeuTo.push({ ten: "Sát Chủ", diem: rules.ngayDaiKy.satChu });
    phamDaiKy = true;
  }
  if (input.nhapTrungCung) {
    const d = rules.ngayDaiKy.nhapTrungCung ?? -3;
    diem += d;
    yeuTo.push({ ten: "Sát / Bạch Hổ Nhập Trung Cung (không hoá giải được)", diem: d });
    phamDaiKy = true;
  }

  if (input.thienDucHop) {
    diem += rules.ngayCatKhac.diemMoiNgayCat;
    yeuTo.push({ ten: "Thiên Đức Hợp", diem: rules.ngayCatKhac.diemMoiNgayCat });
  }
  if (input.thienXa) {
    diem += rules.ngayCatKhac.diemMoiNgayCat;
    yeuTo.push({ ten: "Thiên Xá", diem: rules.ngayCatKhac.diemMoiNgayCat });
  }

  if (phamDaiKy) {
    diem = Math.min(diem, rules.ngayDaiKy.diemTranNeuPham);
  }

  diem = Math.max(0, Math.min(10, diem));
  diem = Math.round(diem * 10) / 10;

  return { diem, yeuTo, phamDaiKy };
}
