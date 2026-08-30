/**
 * BÁT TRẠCH NHÀ — hàm tổng hợp, ghép các lớp tính theo đúng mô hình "kết quả lũy tiến" của
 * `SPEC-OVERRIDE-MOT-MODULE.md` §2: input tối thiểu ra kết quả ngay, mỗi input thêm mở ra 1 lớp
 * mới, không tính lại lớp trước.
 */
import { calculateCungPhi, isDongTuMenh, CUNG_BAT_TRACH_NGU_HANH, type CungBatTrach, type GioiTinh } from "../cung-menh-bat-trach/cungPhi.js";
import { getKhiBatTrach, KHI_BAT_TRACH_INFO, type KhiBatTrach } from "../cung-menh-bat-trach/duNienBatQuai.js";
import type { Data } from "@thien-anh/calendar-core";
import { DEFAULT_BAT_TRACH_CONFIG, type BatTrachConfig } from "./config.js";
import { doToCung, doToSon, huongToToa, canhBaoLapHuong, doTuDauVaoHuong, type DauVaoHuong, type CanhBaoLapHuong } from "./toaHuong.js";
import { tinhHungSatDacBiet, type HungSatDacBiet } from "./hungSat.js";
import { tinh4PhuongCatHung, HANG_MUC_CO_BAN, NGUYEN_TAC_UU_TIEN_XUNG_DOT, HOA_GIAI_KHONG_HOP_MENH, DAI_KY_LOAN_DAU, HANG_MUC_MO_RONG, type BonPhuongCatHung } from "./boTri.js";
import { tinhDuongTrachTamYeu, type KetQuaTamYeu, type DauVaoTamYeu } from "./tamYeu.js";
import { xetSinhKhacCungSaoCaHai, CUNG_THANH_VIEN_GIA_DINH, type SinhKhacCaHaiPhuongAn } from "./sinhKhacCungSao.js";
import { tinhXuyenCungTang, type KetQuaXuyenCungTang } from "./xuyenCungTang.js";
import { tinhThaiTuePhuongVi, tinhDoThien, type KetQuaThaiTuePhuongVi, type KetQuaDoThien } from "./thaiTue.js";
import { THIEN_TINH_THEO_KHI } from "./thienTinhCa.js";
import { tinhNienTinhHopMenh, type KetQuaNienTinh } from "./nienTinh.js";

type NguHanh = Data.NguHanh;

// -----------------------------------------------------------------------------------------------
// TẦNG TỐI THIỂU — năm sinh + giới tính + hướng nhà.
// -----------------------------------------------------------------------------------------------
export interface BatTrachNhaInputToiThieu {
  namSinh: number;
  gioiTinh: GioiTinh;
  huong: DauVaoHuong;
}

export interface HopMenhMotChieu {
  khi: KhiBatTrach;
  tenKhi: string;
  hop: boolean;
}

export interface KetQuaHopMenh {
  theoHuong: HopMenhMotChieu;
  theoToa: HopMenhMotChieu;
  /** Kết luận CHÍNH thức theo cờ `luanHopMenhTheo` (data/00 MĐ-1). */
  ketLuanChinh: HopMenhMotChieu;
  dungHuongLamChinh: boolean;
  /** true nếu 2 cách luận ra kết luận (hợp/không hợp) khác nhau — ca cần tự thẩm định. */
  lech: boolean;
}

export interface KetQuaBatTrachToiThieu {
  cungMenh: CungBatTrach;
  nguHanhMenh: NguHanh;
  nhomMenh: "dong" | "tay";
  huong: { do: number; cung: CungBatTrach; canhBao: CanhBaoLapHuong };
  toa: { do: number; cung: CungBatTrach };
  hopMenh: KetQuaHopMenh;
  bonPhuong: BonPhuongCatHung;
  goiYBoTri: {
    coBan: typeof HANG_MUC_CO_BAN;
    nguyenTacUuTien: string;
    hoaGiaiNeuKhongHop: string[] | null;
    daiKyLoanDau: string[];
  };
  hungSatDacBiet: HungSatDacBiet;
}

function hopMenhMotChieu(cungMenh: CungBatTrach, cungKia: CungBatTrach): HopMenhMotChieu {
  const khi = getKhiBatTrach(cungMenh, cungKia);
  return { khi, tenKhi: KHI_BAT_TRACH_INFO[khi].ten, hop: KHI_BAT_TRACH_INFO[khi].cat };
}

/** Lớp tối thiểu — luôn tính được ngay khi có năm sinh + giới tính + hướng nhà. */
export function luanBatTrachToiThieu(input: BatTrachNhaInputToiThieu, config: BatTrachConfig = DEFAULT_BAT_TRACH_CONFIG): KetQuaBatTrachToiThieu {
  const cungMenh = calculateCungPhi(input.namSinh, input.gioiTinh);
  const huongDo = doTuDauVaoHuong(input.huong);
  const toaDo = huongToToa(huongDo);
  const cungHuong = doToCung(huongDo);
  const cungToa = doToCung(toaDo);

  const theoHuong = hopMenhMotChieu(cungMenh, cungHuong);
  const theoToa = hopMenhMotChieu(cungMenh, cungToa);
  const dungHuongLamChinh = config.luanHopMenhTheo === "huong";

  const bonPhuong = tinh4PhuongCatHung(cungMenh);
  const hopMenh: KetQuaHopMenh = {
    theoHuong,
    theoToa,
    ketLuanChinh: dungHuongLamChinh ? theoHuong : theoToa,
    dungHuongLamChinh,
    lech: theoHuong.hop !== theoToa.hop,
  };

  return {
    cungMenh,
    nguHanhMenh: CUNG_BAT_TRACH_NGU_HANH[cungMenh],
    nhomMenh: isDongTuMenh(cungMenh) ? "dong" : "tay",
    huong: { do: huongDo, cung: cungHuong, canhBao: canhBaoLapHuong(huongDo) },
    toa: { do: toaDo, cung: cungToa },
    hopMenh,
    bonPhuong,
    goiYBoTri: {
      coBan: HANG_MUC_CO_BAN,
      nguyenTacUuTien: NGUYEN_TAC_UU_TIEN_XUNG_DOT,
      hoaGiaiNeuKhongHop: hopMenh.ketLuanChinh.hop ? null : HOA_GIAI_KHONG_HOP_MENH,
      daiKyLoanDau: DAI_KY_LOAN_DAU,
    },
    hungSatDacBiet: tinhHungSatDacBiet(huongDo),
  };
}

// -----------------------------------------------------------------------------------------------
// LỚP + CỬA–CHỦ–BẾP — Dương Trạch Tam Yếu + sinh khắc Cung–Sao chi tiết (tầng Cao Cấp).
// Quy ước Tọa×Môn (data/00 "lưu ý không đổi"): Cửa luôn làm Gốc, không đổi theo cờ luanHopMenhTheo.
// -----------------------------------------------------------------------------------------------
export interface KetQuaTamYeuVaSinhKhac {
  tamYeu: KetQuaTamYeu;
  sinhKhacChu: SinhKhacCaHaiPhuongAn;
  sinhKhacBep: SinhKhacCaHaiPhuongAn;
  thienTinhBep: (typeof THIEN_TINH_THEO_KHI)[KhiBatTrach];
  thanhVienAnhHuongNeuXauChu: string;
  thanhVienAnhHuongNeuXauBep: string;
}

export function luanTamYeuVaSinhKhac(input: DauVaoTamYeu): KetQuaTamYeuVaSinhKhac {
  const tamYeu = tinhDuongTrachTamYeu(input);
  return {
    tamYeu,
    sinhKhacChu: xetSinhKhacCungSaoCaHai(input.chuCung, tamYeu.khiChu),
    sinhKhacBep: xetSinhKhacCungSaoCaHai(input.bepCung, tamYeu.khiBep),
    thienTinhBep: THIEN_TINH_THEO_KHI[tamYeu.khiBep],
    thanhVienAnhHuongNeuXauChu: CUNG_THANH_VIEN_GIA_DINH[input.chuCung],
    thanhVienAnhHuongNeuXauBep: CUNG_THANH_VIEN_GIA_DINH[input.bepCung],
  };
}

// -----------------------------------------------------------------------------------------------
// LỚP + SỐ TẦNG — Xuyên Cung Cửu Tinh.
// -----------------------------------------------------------------------------------------------
export function luanXuyenCung(toaCung: CungBatTrach, monCung: CungBatTrach, soTang: number): KetQuaXuyenCungTang {
  return tinhXuyenCungTang(toaCung, monCung, soTang);
}

// -----------------------------------------------------------------------------------------------
// LỚP + NĂM CẦN XEM — Thái Tuế/Tuế Phá/Tam Sát (phương vị) + Đô Thiên (theo Can năm sinh) +
// Niên Tinh hợp mệnh (ADDENDUM mục 2 — "xem năm nay nhà/tuổi này có hợp không").
// -----------------------------------------------------------------------------------------------
export interface KetQuaLuuNien {
  thaiTue: KetQuaThaiTuePhuongVi;
  doThien: KetQuaDoThien;
  /**
   * null khi caller không truyền `cungMenh` + `saoNamNayNhapTrung` — 2 tham số này KHÔNG tự tính
   * trong package (đúng nguyên tắc bao-trùm, xem nienTinh.ts): `saoNamNayNhapTrung` phải lấy từ
   * `nienTinhNhapTrung()` của engine `huyen-khong-phi-tinh` (app layer, `src/lib/`) rồi truyền vào.
   */
  nienTinh: KetQuaNienTinh | null;
}

export function luanLuuNien(namSinh: number, namCanXem: number, cungMenh?: CungBatTrach, saoNamNayNhapTrung?: number): KetQuaLuuNien {
  return {
    thaiTue: tinhThaiTuePhuongVi(namCanXem),
    doThien: tinhDoThien(namSinh),
    nienTinh: cungMenh !== undefined && saoNamNayNhapTrung !== undefined ? tinhNienTinhHopMenh(cungMenh, saoNamNayNhapTrung) : null,
  };
}

export { HANG_MUC_MO_RONG, doToSon };
export type { BatTrachConfig } from "./config.js";
export { DEFAULT_BAT_TRACH_CONFIG } from "./config.js";
