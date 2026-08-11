/**
 * NGÀY ĐỘNG PHÒNG — chấm điểm mức độ phù hợp của 1 ngày cho việc vợ chồng động phòng sau hôn
 * lễ (mã nội bộ `DONG_PHONG`). Mục đích RIÊNG, không dùng chung trọng số với
 * `GIAO_TIEP_TIEC_TUNG` hay bất kỳ mục đích nào khác — 1 ngày có thể tốt cho giao tế nhưng chỉ
 * trung bình cho động phòng, hoặc ngược lại.
 *
 * Toàn bộ trọng số nằm trong `DONG_PHONG_SCORING_RULES` — tách riêng khỏi hàm tính điểm để có
 * thể điều chỉnh sau này mà không phải sửa thuật toán hay giao diện.
 *
 * Nếu người dùng cung cấp Chi tuổi (con giáp) của chồng và/hoặc vợ, hệ thống xét thêm quan hệ
 * Chi ngày với TỪNG người (Lục Xung/Tam Hình/Lục Hại = trừ điểm, Tam Hợp = cộng điểm hòa hợp)
 * — tái dùng đúng các hàm nền tảng Can Chi đã có (`lucXung.ts`, `thaiTue.ts`, `tamHop.ts`),
 * không suy đoán thêm quy tắc mới. Nếu KHÔNG cung cấp tuổi bên nào thì bỏ qua hẳn phần đó cho
 * bên đó (không suy đoán).
 *
 * ⚠️ Trọng số cho nhóm Trực (`trucTot`/`trucXau`) và mức ưu tiên "hỷ khánh/hôn nhân" (Thiên
 * Hỷ, Thiên Thành) là QUY ƯỚC PHỔ BIẾN do chủ dự án + hệ thống tự đặt ra cho đúng mục đích
 * "động phòng" này — KHÔNG trích dẫn từ 1 trang sách cụ thể nào, khác với các module
 * `trach-nhat/*` vốn trích nguyên văn 1 nguồn xác định.
 */
import type { CatHung } from "../trach-nhat/catHung.js";
import { getLucXungChi } from "../trach-nhat/lucXung.js";
import { getHaiThaiTueChi, getHinhThaiTueChi } from "../trach-nhat/thaiTue.js";
import { isTamHop } from "../trach-nhat/tamHop.js";
import type { Data } from "@thien-anh/calendar-core";

type Chi = Data.Chi;

export const DONG_PHONG_SCORING_RULES = {
  /** Điểm khởi điểm trung tính trên thang 0-10, các yếu tố cộng/trừ dựa trên mức này. */
  diemNenTang: 5,

  hoangDaoHacDao: {
    "hoàng đạo": 1,
    "hắc đạo": -1,
    "không xác định": 0,
  } as Record<"hoàng đạo" | "hắc đạo" | "không xác định", number>,

  nhiThapBatTu: {
    cat: 1,
    hung: -1,
  },

  /**
   * Nhóm Trực theo quy ước phổ biến cho hôn nhân/kết hợp — Thành (thành tựu, viên mãn hôn
   * nhân), Mãn (viên mãn, đoàn tụ) thuận lợi; Phá (đổ vỡ), Nguy, Bế bất lợi trực tiếp cho hôn
   * nhân. 8 Trực còn lại trung tính cho mục đích này.
   */
  trucTot: ["Thành", "Mãn"] as readonly string[],
  trucXau: ["Phá", "Nguy", "Bế"] as readonly string[],
  diemTrucTot: 2,
  diemTrucXau: -2,

  thanSat: {
    diemMoiCat: 0.5,
    diemMoiHung: -0.5,
    /** Ưu tiên đặc biệt cho các sao liên quan trực tiếp hỷ khánh/hôn nhân/hòa hợp. */
    tenUuTien: {
      "Thiên Hỷ": 3,
      "Thiên Thành": 3,
      "Tam Hợp": 1,
    } as Record<string, number>,
  },

  /** Các ngày đại kỵ đã có sẵn trong hệ thống — mỗi loại phạm phải trừ điểm mạnh. */
  ngayDaiKy: {
    nguyetKy: -3,
    tamNuong: -3,
    duongCongKyNhat: -5,
    satChu: -3,
    /**
     * Nếu phạm BẤT KỲ đại kỵ nào ở trên, điểm cuối cùng bị ép trần ở mức này — luôn rơi vào
     * hạng 🔴 Không nên chọn dù các yếu tố khác cộng điểm bao nhiêu.
     */
    diemTranNeuPham: 3,
  },

  /** Quan hệ Chi ngày với tuổi (con giáp) chồng/vợ — áp dụng độc lập cho từng người nếu có Chi. */
  xungHopTuoi: {
    diemXung: -3,
    diemHinh: -1.5,
    diemHai: -1.5,
    diemTamHop: 1,
  },

  /** Thiên Đức Hợp / Thiên Xá — ngày tốt chung, cộng nhẹ (không đặc thù hôn nhân). */
  ngayCatKhac: {
    diemMoiNgayCat: 0.5,
  },
} as const;

export interface DongPhongInput {
  dayChi: Chi;
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
  /** Chi tuổi (con giáp) của chồng — bỏ trống nếu không có, KHÔNG suy đoán. */
  chiTuoiChong?: Chi | undefined;
  /** Chi tuổi (con giáp) của vợ — bỏ trống nếu không có, KHÔNG suy đoán. */
  chiTuoiVo?: Chi | undefined;
}

export type DongPhongHang = "rat-tot" | "tot" | "co-the-dung" | "khong-nen";

export interface DongPhongYeuTo {
  ten: string;
  diem: number;
}

export interface DongPhongXungHopMotNguoi {
  chi: Chi;
  xung: boolean;
  hinh: boolean;
  hai: boolean;
  tamHop: boolean;
  moTa: string;
}

export interface DongPhongResult {
  diem: number;
  hang: DongPhongHang;
  nhan: string;
  goiY: string;
  yeuTo: readonly DongPhongYeuTo[];
  phamDaiKy: boolean;
  /** null nếu không cung cấp Chi tuổi chồng. */
  xungHopChong: DongPhongXungHopMotNguoi | null;
  /** null nếu không cung cấp Chi tuổi vợ. */
  xungHopVo: DongPhongXungHopMotNguoi | null;
}

const NHAN_THEO_HANG: Record<DongPhongHang, string> = {
  "rat-tot": "⭐ Rất tốt",
  "tot": "🟢 Tốt",
  "co-the-dung": "🟡 Có thể dùng",
  "khong-nen": "🔴 Không nên chọn",
};

const GOI_Y_THEO_HANG: Record<DongPhongHang, string> = {
  "rat-tot": "Rất tốt cho động phòng",
  "tot": "Tốt cho động phòng",
  "co-the-dung": "Có thể dùng cho động phòng",
  "khong-nen": "",
};

function xepHang(diem: number): DongPhongHang {
  if (diem >= 8) return "rat-tot";
  if (diem >= 6) return "tot";
  if (diem >= 4) return "co-the-dung";
  return "khong-nen";
}

function tinhXungHopMotNguoi(
  dayChi: Chi,
  chiTuoi: Chi,
): { ketQua: DongPhongXungHopMotNguoi; diem: number; yeuTo: DongPhongYeuTo[] } {
  const R = DONG_PHONG_SCORING_RULES.xungHopTuoi;
  const xung = getLucXungChi(dayChi) === chiTuoi;
  const hinh = getHinhThaiTueChi(dayChi).includes(chiTuoi);
  const hai = getHaiThaiTueChi(dayChi) === chiTuoi;
  const tamHop = isTamHop(dayChi, chiTuoi);

  const yeuTo: DongPhongYeuTo[] = [];
  let diem = 0;
  if (xung) {
    diem += R.diemXung;
    yeuTo.push({ ten: `Xung tuổi (ngày ${dayChi} xung ${chiTuoi})`, diem: R.diemXung });
  }
  if (hinh) {
    diem += R.diemHinh;
    yeuTo.push({ ten: `Hình tuổi (ngày ${dayChi} hình ${chiTuoi})`, diem: R.diemHinh });
  }
  if (hai) {
    diem += R.diemHai;
    yeuTo.push({ ten: `Hại tuổi (ngày ${dayChi} hại ${chiTuoi})`, diem: R.diemHai });
  }
  if (tamHop) {
    diem += R.diemTamHop;
    yeuTo.push({ ten: `Hòa hợp tuổi (ngày ${dayChi} tam hợp ${chiTuoi})`, diem: R.diemTamHop });
  }

  let moTa: string;
  if (xung) moTa = "Xung tuổi";
  else if (hinh) moTa = "Hình tuổi";
  else if (hai) moTa = "Hại tuổi";
  else if (tamHop) moTa = "Hòa hợp (Tam Hợp)";
  else moTa = "Bình thường, không xung khắc";

  return { ketQua: { chi: chiTuoi, xung, hinh, hai, tamHop, moTa }, diem, yeuTo };
}

export function tinhDiemDongPhong(input: DongPhongInput): DongPhongResult {
  const R = DONG_PHONG_SCORING_RULES;
  const yeuTo: DongPhongYeuTo[] = [];
  let diem: number = R.diemNenTang;

  const hoangDaoDiem = R.hoangDaoHacDao[input.hoangDaoHacDao];
  if (hoangDaoDiem !== 0) {
    diem += hoangDaoDiem;
    yeuTo.push({ ten: `Ngày ${input.hoangDaoHacDao}`, diem: hoangDaoDiem });
  }

  const tuDiem = input.nhiThapBatTuCatHung === "cát" ? R.nhiThapBatTu.cat : R.nhiThapBatTu.hung;
  diem += tuDiem;
  yeuTo.push({ ten: `Nhị Thập Bát Tú (${input.nhiThapBatTuCatHung})`, diem: tuDiem });

  if (R.trucTot.includes(input.trucName)) {
    diem += R.diemTrucTot;
    yeuTo.push({ ten: `Trực ${input.trucName} (thuận lợi hôn nhân)`, diem: R.diemTrucTot });
  } else if (R.trucXau.includes(input.trucName)) {
    diem += R.diemTrucXau;
    yeuTo.push({ ten: `Trực ${input.trucName} (bất lợi hôn nhân)`, diem: R.diemTrucXau });
  }

  for (const t of input.thanSat) {
    const uuTien = R.thanSat.tenUuTien[t.name];
    if (uuTien !== undefined) {
      diem += uuTien;
      yeuTo.push({ ten: `${t.name} (ưu tiên hỷ khánh/hôn nhân)`, diem: uuTien });
    } else {
      const d = t.catHung === "cát" ? R.thanSat.diemMoiCat : R.thanSat.diemMoiHung;
      diem += d;
      yeuTo.push({ ten: `${t.name} (${t.catHung})`, diem: d });
    }
  }

  let phamDaiKy = false;
  if (input.nguyetKy) {
    diem += R.ngayDaiKy.nguyetKy;
    yeuTo.push({ ten: "Nguyệt Kỵ (Ngũ Quỷ)", diem: R.ngayDaiKy.nguyetKy });
    phamDaiKy = true;
  }
  if (input.tamNuong) {
    diem += R.ngayDaiKy.tamNuong;
    yeuTo.push({ ten: "Tam Nương Sát", diem: R.ngayDaiKy.tamNuong });
    phamDaiKy = true;
  }
  if (input.duongCongKyNhat) {
    diem += R.ngayDaiKy.duongCongKyNhat;
    yeuTo.push({ ten: "Dương Công Kỵ Nhật", diem: R.ngayDaiKy.duongCongKyNhat });
    phamDaiKy = true;
  }
  if (input.satChu) {
    diem += R.ngayDaiKy.satChu;
    yeuTo.push({ ten: "Sát Chủ", diem: R.ngayDaiKy.satChu });
    phamDaiKy = true;
  }

  if (input.thienDucHop) {
    diem += R.ngayCatKhac.diemMoiNgayCat;
    yeuTo.push({ ten: "Thiên Đức Hợp", diem: R.ngayCatKhac.diemMoiNgayCat });
  }
  if (input.thienXa) {
    diem += R.ngayCatKhac.diemMoiNgayCat;
    yeuTo.push({ ten: "Thiên Xá", diem: R.ngayCatKhac.diemMoiNgayCat });
  }

  let xungHopChong: DongPhongXungHopMotNguoi | null = null;
  if (input.chiTuoiChong) {
    const r = tinhXungHopMotNguoi(input.dayChi, input.chiTuoiChong);
    xungHopChong = r.ketQua;
    diem += r.diem;
    for (const y of r.yeuTo) yeuTo.push({ ten: `Chồng — ${y.ten}`, diem: y.diem });
  }

  let xungHopVo: DongPhongXungHopMotNguoi | null = null;
  if (input.chiTuoiVo) {
    const r = tinhXungHopMotNguoi(input.dayChi, input.chiTuoiVo);
    xungHopVo = r.ketQua;
    diem += r.diem;
    for (const y of r.yeuTo) yeuTo.push({ ten: `Vợ — ${y.ten}`, diem: y.diem });
  }

  if (phamDaiKy) {
    diem = Math.min(diem, R.ngayDaiKy.diemTranNeuPham);
  }

  diem = Math.max(0, Math.min(10, diem));
  diem = Math.round(diem * 10) / 10;

  const hang = xepHang(diem);
  return {
    diem,
    hang,
    nhan: NHAN_THEO_HANG[hang],
    goiY: GOI_Y_THEO_HANG[hang],
    yeuTo,
    phamDaiKy,
    xungHopChong,
    xungHopVo,
  };
}
