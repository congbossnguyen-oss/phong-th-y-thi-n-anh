/**
 * PHASE 2 — LỌC THEO TỌA HƯỚNG MỘ PHẦN (đặc tả `spec-module-phase2-toa-huong-mo.md` v2.0).
 *
 * Vai trò: tầng LỌC + XẾP HẠNG LẠI danh sách phương án ngày giờ mà Phase 1 đã đề xuất — KHÔNG
 * tính lại từ đầu. Nhận thêm đúng một dữ kiện: tọa độ số huyệt mộ đo bằng la kinh.
 *
 * ⚠️ KHÔNG NHÂN BẢN DỮ LIỆU. Toàn bộ bảng nền (24 sơn, cửu cung 1968-2068, 64 quẻ độ số, 60 Giáp
 * Tý, Ngũ Hoàng, Bát Sát, Tam Sát, Thái Tuế, Tuế Phá, cách cục Hà Đồ/Hợp Thập) ĐÃ CÓ SẴN ở module
 * dùng chung `xem-ngay-cao-cap/` — file này chỉ gọi vào. Đây là nguyên tắc chủ dự án chốt
 * 2026-08-16: "thần sát hay cách tính thì dùng chung rồi", tránh cảnh mỗi module một bản sao.
 *
 * File này hiện cài BƯỚC ① (điều kiện loại / hard constraint). Bước ②-⑤ làm tiếp sau.
 */
import { Data } from "@thien-anh/calendar-core";
import {
  DANH_SACH_24_SON,
  phuongTuDoSo,
  traNguHoangNam,
  traNguHoangThang,
  phamTamSat,
  phamBatSat,
  phamThaiTue,
  phamTuePha,
  kiemMoLongBienVan,
  type CungBatQuai,
  type PhuongChinh,
  type TenSon,
} from "../xem-ngay-cao-cap/index.js";

type Can = Data.Can;
type Chi = Data.Chi;

/** Bảng Cửu Cung chỉ phủ khoảng này — ngoài khoảng thì CHẶN, không suy đoán (mục 1 đặc tả). */
export const NAM_CO_DU_LIEU_TU = 1968;
export const NAM_CO_DU_LIEU_DEN = 2068;

/** Mỗi sơn rộng 15°; sai 1 sơn là đổi kết quả nên phải cảnh báo khi đo sát ranh giới. */
export const DO_RONG_MOI_SON = 15;
/** Sát ranh giới trong khoảng này (độ) thì yêu cầu đo lại, KHÔNG tự chọn bên (mục 1 đặc tả). */
export const NGUONG_CANH_BAO_RANH_GIOI = 1;

/** Bảng tra index Can/Chi — `kiemMoLongBienVan` nhận index chứ không nhận tên. */
const CAN_INDEX = new Map<Can, number>((Data.CAN as readonly Can[]).map((c, i) => [c, i]));
const CHI_INDEX_NAM = new Map<Chi, number>((Data.CHI as readonly Chi[]).map((c, i) => [c, i]));

function chuanHoaDo(doSo: number): number {
  return ((doSo % 360) + 360) % 360;
}

export interface ToaHuongMo {
  /** Tọa — độ số đo được. */
  doSoToa: number;
  /** Hướng = (tọa + 180) mod 360, tự suy, khách không phải nhập. */
  doSoHuong: number;
  sonToa: TenSon;
  sonHuong: TenSon;
  cungToa: CungBatQuai;
  cungHuong: CungBatQuai;
  phuongToa: PhuongChinh;
  phuongHuong: PhuongChinh;
}

export type KetQuaQuyToa =
  | { hopLe: true; toaHuong: ToaHuongMo }
  | { hopLe: false; lyDo: string; canDoLai: boolean };

/**
 * Quy tọa độ số về sơn / cung / phương cho CẢ tọa lẫn hướng.
 *
 * Ba mức này dùng cho ba loại sát khác nhau ở Bước ①: Thái Tuế/Tuế Phá xét theo SƠN, Ngũ
 * Hoàng/Bát Sát xét theo CUNG, Tam Sát xét theo PHƯƠNG.
 */
export function quyToaDoVeToaHuong(doSoToa: number): KetQuaQuyToa {
  if (!Number.isFinite(doSoToa)) {
    return { hopLe: false, lyDo: "Tọa độ không hợp lệ — cần một số đo từ la kinh.", canDoLai: true };
  }
  const toa = chuanHoaDo(doSoToa);

  // Ranh giới giữa 2 sơn nằm ở tâm ± 7.5°. Đo sát ranh giới thì KHÔNG tự chọn bên.
  const lechSoVoiTam = Math.abs(((toa + DO_RONG_MOI_SON / 2) % DO_RONG_MOI_SON) - DO_RONG_MOI_SON / 2);
  const cachRanhGioi = DO_RONG_MOI_SON / 2 - lechSoVoiTam;
  if (cachRanhGioi <= NGUONG_CANH_BAO_RANH_GIOI) {
    return {
      hopLe: false,
      lyDo: `Tọa ${toa.toFixed(1)}° nằm sát ranh giới giữa hai sơn (cách ${cachRanhGioi.toFixed(1)}°). Sai một sơn là đổi hẳn kết quả — vui lòng đo lại bằng la kinh cho chắc.`,
      canDoLai: true,
    };
  }

  const timSon = (d: number): TenSon => {
    const idx = Math.floor((chuanHoaDo(d) + DO_RONG_MOI_SON / 2) / DO_RONG_MOI_SON) % DANH_SACH_24_SON.length;
    return DANH_SACH_24_SON[idx]!.ten;
  };
  const cungCua = (d: number): CungBatQuai => {
    const idx = Math.floor((chuanHoaDo(d) + DO_RONG_MOI_SON / 2) / DO_RONG_MOI_SON) % DANH_SACH_24_SON.length;
    return DANH_SACH_24_SON[idx]!.cung;
  };

  const huong = chuanHoaDo(toa + 180);
  return {
    hopLe: true,
    toaHuong: {
      doSoToa: toa,
      doSoHuong: huong,
      sonToa: timSon(toa),
      sonHuong: timSon(huong),
      cungToa: cungCua(toa),
      cungHuong: cungCua(huong),
      // Dùng phuongTuDoSo (độ số thật) chứ KHÔNG dùng phuongTuSon — 4 sơn duy Cấn/Tốn/Khôn/Càn
      // nằm đúng ranh giới phương nên suy từ tên sơn sẽ không xác định được.
      phuongToa: phuongTuDoSo(toa),
      phuongHuong: phuongTuDoSo(huong),
    },
  };
}

/** Ba kết cục của Bước ① (mục 2.1 đặc tả). */
export type KetCucPhase2 = "A" | "B" | "C";

export interface SatCapNam {
  ten: string;
  /** "toa" hoặc "huong" — sát đáo vào đâu. */
  dao: "toa" | "huong";
}

export interface KetQuaSatCapNam {
  /** true = phạm sát cấp NĂM → kết cục C, dừng toàn bộ, KHÔNG THU PHÍ. */
  phamCapNam: boolean;
  danhSach: SatCapNam[];
  /** Có mục nào không tra được dữ liệu không (ngoài khoảng 1968-2068 chẳng hạn). */
  thieuDuLieu: string[];
}

/**
 * MỤC 2.1 — sát phương vị cấp NĂM đáo tọa/hướng.
 *
 * Năm an táng gần như cố định bởi thời điểm mất, nên phạm ở cấp Năm thì KHÔNG ngày giờ nào cứu
 * được. Nguồn: "Ngũ Hoàng và Bát Sát đáo Tọa/Hướng thì không có phép phá."
 *
 * Đây là hàm chạy TRƯỚC TRANG THANH TOÁN (mục 2.1b): phạm thì báo "chưa thu phí" + mời đặt lịch
 * khảo sát, không bao giờ để khách trả 999k rồi mới báo không làm được.
 */
export function kiemSatCapNam(
  toaHuong: ToaHuongMo,
  namAnTang: number,
  canNam: Can,
  chiNam: Chi,
  /** Mục 2.1 cho phép tắt Mộ Long Biến Vận; mặc định BẬT theo đề xuất của đặc tả. */
  batMoLong = true,
): KetQuaSatCapNam {
  const danhSach: SatCapNam[] = [];
  const thieuDuLieu: string[] = [];

  if (namAnTang < NAM_CO_DU_LIEU_TU || namAnTang > NAM_CO_DU_LIEU_DEN) {
    thieuDuLieu.push(`Bảng Cửu Cung chỉ phủ ${NAM_CO_DU_LIEU_TU}-${NAM_CO_DU_LIEU_DEN}, không có dữ liệu năm ${namAnTang}.`);
  }

  // --- Ngũ Hoàng NĂM đáo tọa hoặc hướng ---
  const nguHoang = traNguHoangNam(namAnTang);
  if (!nguHoang.tinhDuocKhong) {
    thieuDuLieu.push(nguHoang.lyDo);
  } else if (nguHoang.cungNguHoang !== "Trung") {
    if (nguHoang.cungNguHoang === toaHuong.cungToa) danhSach.push({ ten: "Ngũ Hoàng", dao: "toa" });
    else if (nguHoang.cungNguHoang === toaHuong.cungHuong) danhSach.push({ ten: "Ngũ Hoàng", dao: "huong" });
  }

  // --- Thái Tuế / Tuế Phá: chỉ áp khi tọa/hướng là 1 trong 12 sơn Chi ---
  if (phamThaiTue(toaHuong.sonToa, chiNam)) danhSach.push({ ten: "Thái Tuế", dao: "toa" });
  if (phamThaiTue(toaHuong.sonHuong, chiNam)) danhSach.push({ ten: "Thái Tuế", dao: "huong" });
  if (phamTuePha(toaHuong.sonToa, chiNam)) danhSach.push({ ten: "Tuế Phá", dao: "toa" });
  if (phamTuePha(toaHuong.sonHuong, chiNam)) danhSach.push({ ten: "Tuế Phá", dao: "huong" });

  // --- Bát Sát Hoàng Tuyền theo trụ NĂM ---
  if (phamBatSat(toaHuong.cungToa, canNam, chiNam)) danhSach.push({ ten: "Bát Sát Hoàng Tuyền", dao: "toa" });
  if (phamBatSat(toaHuong.cungHuong, canNam, chiNam)) danhSach.push({ ten: "Bát Sát Hoàng Tuyền", dao: "huong" });

  // --- Mộ Long Biến Vận (Thái Tuế Sát mở rộng) ---
  //
  // Đặc tả mục 2.1: so nạp âm Thái Tuế năm với nạp âm 4 khố Thìn-Tuất-Sửu-Mùi; Thái Tuế khắc khố
  // nào thì Long nhóm đó phạm, trùng tọa mộ thì kết cục C. Đặc tả ghi "đề xuất bật mặc định,
  // cấu hình tắt được" nên có tham số `batMoLong`.
  //
  // Dùng lại `kiemMoLongBienVan` của module Xem Ngày Cao Cấp — cùng một phép, không chép bảng.
  if (batMoLong) {
    const iCan = CAN_INDEX.get(canNam);
    const iChi = CHI_INDEX_NAM.get(chiNam);
    if (iCan !== undefined && iChi !== undefined) {
      // `kiemMoLongBienVan` NÉM khi cặp Can/Chi không thuộc 60 Giáp Tý (vd Nhâm Mão — sai âm
      // dương). Lịch thật không sinh ra cặp như vậy, nhưng hàm này là CỔNG KIỂM TRƯỚC THANH TOÁN:
      // ném ra ngoài thì cả phép kiểm "có được thu phí không" sập theo. Hỏng mục này thì ghi vào
      // `thieuDuLieu` để nói thật là chưa tra được, chứ không âm thầm coi như sạch.
      try {
        const moLong = kiemMoLongBienVan(iCan, iChi, toaHuong.sonToa);
        if (moLong.pham) danhSach.push({ ten: "Mộ Long Biến Vận", dao: "toa" });
      } catch (err) {
        thieuDuLieu.push(
          `Không tra được Mộ Long Biến Vận cho năm ${canNam} ${chiNam}: ${err instanceof Error ? err.message : "lỗi không rõ"}.`,
        );
      }
    }
  }

  return { phamCapNam: danhSach.length > 0, danhSach, thieuDuLieu };
}

export interface KetQuaSatCapNgayGio {
  /** true = loại phương án này (kết cục B — chỉ loại phương án, không chặn cả module). */
  loai: boolean;
  lyDo: string[];
}

/**
 * MỤC 2.1 kết cục B — Tam Sát / Bát Sát đáo ở trụ NGÀY hoặc GIỜ.
 *
 * Khác cấp Năm: chỉ loại đúng phương án đó, phần còn lại vẫn giữ, và KHÔNG chặn thanh toán.
 */
export function kiemSatCapNgayGio(
  toaHuong: ToaHuongMo,
  tru: { can: Can; chi: Chi },
  nhan: "ngày" | "giờ",
): KetQuaSatCapNgayGio {
  const lyDo: string[] = [];

  // Tam Sát tra theo PHƯƠNG của tọa/hướng.
  if (phamTamSat(toaHuong.phuongToa, tru.chi)) lyDo.push(`Tam Sát đáo tọa theo ${nhan}`);
  if (phamTamSat(toaHuong.phuongHuong, tru.chi)) lyDo.push(`Tam Sát đáo hướng theo ${nhan}`);
  // Bát Sát tra theo CUNG, cần trọn cặp Can Chi.
  if (phamBatSat(toaHuong.cungToa, tru.can, tru.chi)) lyDo.push(`Bát Sát đáo tọa theo ${nhan}`);
  if (phamBatSat(toaHuong.cungHuong, tru.can, tru.chi)) lyDo.push(`Bát Sát đáo hướng theo ${nhan}`);

  return { loai: lyDo.length > 0, lyDo };
}

/**
 * MỤC 2.1 — Ngũ Hoàng THÁNG. Đáo tọa/hướng thì chỉ loại các ngày thuộc tháng đó (kết cục B),
 * KHÔNG phải kết cục C như Ngũ Hoàng năm.
 */
export function kiemNguHoangThang(
  toaHuong: ToaHuongMo,
  namDuongLich: number,
  canThang: Can,
  chiThang: Chi,
): { loai: boolean; lyDo: string | null; thieuDuLieu: string | null } {
  const kq = traNguHoangThang(namDuongLich, canThang, chiThang);
  if (!kq.tinhDuocKhong) return { loai: false, lyDo: null, thieuDuLieu: kq.lyDo };
  if (kq.cungNguHoang === "Trung") return { loai: false, lyDo: null, thieuDuLieu: null };
  if (kq.cungNguHoang === toaHuong.cungToa) return { loai: true, lyDo: "Ngũ Hoàng tháng đáo tọa", thieuDuLieu: null };
  if (kq.cungNguHoang === toaHuong.cungHuong) return { loai: true, lyDo: "Ngũ Hoàng tháng đáo hướng", thieuDuLieu: null };
  return { loai: false, lyDo: null, thieuDuLieu: null };
}

/** Nguyên nhân mất — dùng cho nhánh miễn trừ "Thừa hung mai táng" (mục 2.4). */
export type NguyenNhanMat = "benh-tuoi-gia" | "tai-nan-dot-ngot";

export interface KetQuaMienTru {
  duocMienTru: boolean;
  nhanh: string | null;
  giaiThich: string | null;
}

/**
 * MỤC 2.4 — phép quyền biến, chạy TRƯỚC mọi thứ.
 *
 * ⚠️ Mới cài nhánh "Thừa hung mai táng" (chết tai nạn/oan, chôn trong 3-5 ngày) vì nhánh này chỉ
 * cần 2 dữ kiện đã có sẵn. Nhánh "Thừa loạn mai táng" (sau Đại Hàn 5 ngày → Lập Xuân; hoặc 23 →
 * trưa 30 tháng Chạp) cần mốc tiết khí + ngày âm lịch nên do tầng facade tính rồi truyền vào.
 */
export function kiemMienTruThuaHung(nguyenNhan: NguyenNhanMat, soNgayToiChon: number | undefined): KetQuaMienTru {
  if (nguyenNhan !== "tai-nan-dot-ngot") return { duocMienTru: false, nhanh: null, giaiThich: null };
  const n = soNgayToiChon ?? 0;
  if (n > 5) return { duocMienTru: false, nhanh: null, giaiThich: null };
  return {
    duocMienTru: true,
    nhanh: "Thừa hung mai táng",
    giaiThich:
      "Người mất do tai nạn/đột ngột và chôn trong vòng 3-5 ngày — theo phép quyền biến thì được miễn chọn ngày giờ, kể cả khi phạm Kim Thần Thất Sát.",
  };
}
