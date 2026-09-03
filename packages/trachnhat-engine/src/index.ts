/**
 * Trạch Nhật Engine — điểm vào duy nhất. Xem docs/15-trach-nhat-engine.md (đã chủ dự án
 * duyệt kiến trúc/module/dependency 2026-08-09) để biết thiết kế đầy đủ.
 */

import { fail, ok } from "@thien-anh/engine-contract";
import type { EngineMeta, EngineResult } from "@thien-anh/engine-contract";
import { ENGINE_NAME, ENGINE_VERSION } from "./engine-metadata.js";
import { tinhGio12 } from "./processing/gioBang.js";
import { tinhNgayInfo } from "./processing/ngayInfo.js";
import { calculateMonthGrid } from "./processing/monthGrid.js";
import { calculateGiaoTeTiecTungRange } from "./processing/giaoTeTiecTung.js";
import { calculateDongPhongRange } from "./processing/dongPhong.js";
import { calculateTuoiHopLamAn } from "./processing/tuoiHopLamAn.js";
import { calculateGioTotTrongNgay } from "./processing/gioTotTrongNgay.js";
import { calculateVanMayTrongNgay, calculateVanMayRange } from "./processing/vanMayTrongNgay.js";
import { calculateNgayKhaiTruongRange } from "./processing/ngayKhaiTruong.js";
import { calculateNgayKyHopDongRange } from "./processing/ngayKyHopDong.js";
import { calculateNgayDaiCatCaNhan } from "./processing/ngayDaiCatCaNhan.js";
import { calculateTrungTang } from "./processing/trungTang.js";
import { convertSolarToLunar, convertLunarToSolar } from "./processing/doiLichAmDuong.js";
import { calculateHoangOcKimLau, calculateHoangOcKimLauRange } from "./processing/hoangOcKimLau.js";
import { calculateConSoMayMan } from "./processing/conSoMayMan.js";
import { calculateChonTuoiKetHon, timTuoiKetHonPhuHop } from "./processing/chonTuoiKetHon.js";
import { calculateChonNamSinhCon } from "./processing/chonNamSinhCon.js";
import { calculateXemTuoiXongDat } from "./processing/xemTuoiXongDat.js";
import { calculateChonNgayGiaoDichRange } from "./processing/chonNgayGiaoDich.js";
import { calculateNgayLeViengMoRange } from "./processing/ngayLeViengMo.js";
import { calculateNgayKhaiQuangRange } from "./processing/ngayKhaiQuang.js";
import { calculateXuatHanhCaNhanRange, calculateXuatHanhCaNhanMotNgay } from "./processing/xuatHanhCaNhanTongHop.js";
import { calculateSuaChuaCaiTaoNhaRange, calculateSuaChuaCaiTaoNhaMotNgay } from "./processing/suaChuaCaiTaoNha.js";
import { calculateGioLiemHaHuyet } from "./processing/gioLiemHaHuyet.js";
import { calculateXemNgayCaoCap } from "./processing/xemNgayCaoCap.js";
import { timNgayXemNgayCaoCap, timThangTrongNam } from "./processing/xemNgayCaoCapTimNgay.js";
import { tinhTuTru } from "./processing/tuTru.js";
import type { TrachNhatInput, TrachNhatOutput } from "./types.js";
import { validateTrachNhatInput } from "./validation.js";
import { TrachNhat } from "@thien-anh/rule-engine";

// Bảng 12 Trực (tính chất, nên/kỵ, mức độ theo mục đích) — mở ra ở facade để các trang/module xem
// ngày lấy dữ liệu trực tiếp mà không phải phụ thuộc thẳng vào rule-engine. `ngayInfo.truc` cũng đã
// bao sẵn tinhChat/danhGia/nen/ky cho từng ngày; hàm `danhGiaTrucTheoMucDich` dùng khi cần chấm mức
// độ theo MỘT mục đích cụ thể (vd trang "xem ngày" cho việc ký hợp đồng).
export const getTrucDanhGiaTongQuat = TrachNhat.getTrucDanhGiaTongQuat;
export const danhGiaTrucTheoMucDich = TrachNhat.danhGiaTrucTheoMucDich;
export const TRUC_DANH_GIA_TONG_QUAT = TrachNhat.TRUC_DANH_GIA_TONG_QUAT;
export const MUC_DICH_LABEL = TrachNhat.MUC_DICH_LABEL;
export type TrucTongQuatEntry = TrachNhat.TrucTongQuatEntry;
export type TrucMucDo = TrachNhat.MucDo;
export type TrucMucDichKey = TrachNhat.MucDichKey;
export type KetQuaTrucMucDich = TrachNhat.KetQuaTrucMucDich;

export type { MonthGridInput, MonthGridResult, MonthGridDay } from "./processing/monthGrid.js";
export { calculateMonthGrid };
export type {
  GiaoTeTiecTungRangeInput,
  GiaoTeTiecTungRangeResult,
  GiaoTeTiecTungNgay,
} from "./processing/giaoTeTiecTung.js";
export { calculateGiaoTeTiecTungRange };
export type { DongPhongRangeInput, DongPhongRangeResult, DongPhongNgay } from "./processing/dongPhong.js";
export { calculateDongPhongRange };
export type { TuoiHopLamAnInput, TuoiHopLamAnResult } from "./processing/tuoiHopLamAn.js";
export { calculateTuoiHopLamAn };
export type { GioTotTrongNgayInput, GioTotTrongNgayResult, GioTotTrongNgayGio } from "./processing/gioTotTrongNgay.js";
export { calculateGioTotTrongNgay };
export type { VanMayTrongNgayInput, VanMayTrongNgayResult, VanMayRangeInput, VanMayRangeResult } from "./processing/vanMayTrongNgay.js";
export { calculateVanMayTrongNgay, calculateVanMayRange };
export type { NgayKhaiTruongRangeInput, NgayKhaiTruongRangeResult, NgayKhaiTruongNgay } from "./processing/ngayKhaiTruong.js";
export { calculateNgayKhaiTruongRange };
export type { NgayKhaiTruongCaoCapInput, NgayKhaiTruongCaoCapResult, NgayKhaiTruongCaoCapNgay } from "./processing/ngayKhaiTruongCaoCap.js";
export { calculateNgayKhaiTruongCaoCap } from "./processing/ngayKhaiTruongCaoCap.js";
export type { NgayKyHopDongRangeInput, NgayKyHopDongRangeResult, NgayKyHopDongNgay } from "./processing/ngayKyHopDong.js";
// Bản cao cấp (dịch vụ thu phí) — engine riêng, không dùng chung công thức với bản miễn phí ở trên.
export {
  calculateNgayKyHopDongCaoCap,
  type NgayKyHopDongCaoCapInput,
  type NgayKyHopDongCaoCapResult,
  type NgayKyHopDongCaoCapNgay,
  type GioKyDeXuat,
  type NgaySinhDayDu,
} from "./processing/ngayKyHopDongCaoCap.js";
export { calculateNgayKyHopDongRange };
export type { NgayDaiCatCaNhanInput, NgayDaiCatCaNhanResult, NgayDaiCatCaNhanNgay } from "./processing/ngayDaiCatCaNhan.js";
export { calculateNgayDaiCatCaNhan };
export type { TrungTangInput, TrungTangOutput, TrungTangResult, TrungTangThanQuyenInput } from "./processing/trungTang.js";
export { calculateTrungTang };
export type {
  SolarToLunarInput,
  SolarToLunarResult,
  LunarToSolarInput,
  LunarToSolarResult,
  NamAmLichCanChi,
} from "./processing/doiLichAmDuong.js";
export { convertSolarToLunar, convertLunarToSolar };
export type { HoangOcKimLauInput, HoangOcKimLauRangeInput, HoangOcKimLauResult } from "./processing/hoangOcKimLau.js";
export { calculateHoangOcKimLau, calculateHoangOcKimLauRange };
export type { ConSoMayManInput, ConSoMayManResult } from "./processing/conSoMayMan.js";
export { calculateConSoMayMan };
export type {
  GioiTinh,
  KetHonPersonInput,
  ChonTuoiKetHonInput,
  ChonTuoiKetHonResult,
  TimTuoiKetHonInput,
  TimTuoiKetHonResult,
} from "./processing/chonTuoiKetHon.js";
export { calculateChonTuoiKetHon, timTuoiKetHonPhuHop };
export type { GioiTinhCon, ChonNamSinhConInput, ChonNamSinhConResult } from "./processing/chonNamSinhCon.js";
export { calculateChonNamSinhCon };
export type {
  XemTuoiXongDatInput,
  XemTuoiXongDatOutput,
  XongDatCandidateResult,
  XongDatExcludedResult,
} from "./processing/xemTuoiXongDat.js";
export { calculateXemTuoiXongDat };
export type {
  AssetType,
  TransactionPurpose,
  ChonNgayGiaoDichRangeInput,
  ChonNgayGiaoDichNgay,
  ChonNgayGiaoDichRangeResult,
} from "./processing/chonNgayGiaoDich.js";
export { calculateChonNgayGiaoDichRange };
export type {
  LeViengMoPurpose,
  NgayLeViengMoRangeInput,
  NgayLeViengMoNgay,
  NgayLeViengMoRangeResult,
} from "./processing/ngayLeViengMo.js";
export { calculateNgayLeViengMoRange };
export type {
  KhaiQuangPurpose,
  KhaiQuangItemType,
  KhaiQuangGender,
  NgayKhaiQuangRangeInput,
  NgayKhaiQuangNgay,
  NgayKhaiQuangRangeResult,
} from "./processing/ngayKhaiQuang.js";
export { calculateNgayKhaiQuangRange };
export type {
  XuatHanhCaNhanPurpose,
  HuongXuatHanh,
  XuatHanhCaNhanGioiTinh,
  XuatHanhCaNhanToHop,
  XuatHanhCaNhanRangeInput,
  XuatHanhCaNhanRangeResult,
  XuatHanhCaNhanMotNgayInput,
} from "./processing/xuatHanhCaNhanTongHop.js";
export { calculateXuatHanhCaNhanRange, calculateXuatHanhCaNhanMotNgay };
export type {
  RenovationType,
  RenovationLevel,
  SuaChuaCaiTaoNhaInput,
  SuaChuaCaiTaoToHop,
  SuaChuaCaiTaoNhaRangeInput,
  SuaChuaCaiTaoNhaRangeResult,
  SuaChuaCaiTaoNhaMotNgayInput,
} from "./processing/suaChuaCaiTaoNha.js";
export { calculateSuaChuaCaiTaoNhaRange, calculateSuaChuaCaiTaoNhaMotNgay };
export type {
  GioLiemHaHuyetThanQuyenInput,
  GioLiemHaHuyetInput,
  NgayDuongLich,
  UngVienGioLiem,
  UngVienNgayGioHaHuyet,
  GioLiemHaHuyetOutput,
  KhungGioThucTe,
  GioDongQuan,
} from "./processing/gioLiemHaHuyet.js";
export { calculateGioLiemHaHuyet };
export { kiemToaHuongTruocThanhToan, kiemDayDuTruocThanhToan, gomLyDoBiLoai } from "./processing/phase2CongKiemToaHuong.js";
export type {
  CongKiemToaHuongInput,
  KetQuaCongKiem,
  NamTrongCuaSo,
  CongKiemDayDuInput,
  KetQuaCongKiemDayDu,
} from "./processing/phase2CongKiemToaHuong.js";
export { apDungPhase2 } from "./processing/phase2ApDung.js";
export { calculateCuoiHoiRange, calculateGioCuoiHoi, calculateLichCuoiHoi, calculateCuoiHoiTronGoi } from "./processing/cuoiHoi.js";
export type { CuoiHoiRangeInput, CuoiHoiRangeResult, CuoiHoiNgay } from "./processing/cuoiHoi.js";
export type { CuoiHoiGioInput, CuoiHoiGioResult, CuoiHoiGio } from "./processing/cuoiHoi.js";
export type { LichCuoiHoiInput, LichCuoiHoiResult, LichCuoiHoiMuc } from "./processing/cuoiHoi.js";
export type { CuoiHoiTronGoiInput, CuoiHoiTronGoiResult, CuoiHoiNgayVoiGio, CheDoCuoiHoi } from "./processing/cuoiHoi.js";
export type { Phase2Input, Phase2Output, PhuongAnBiLoai } from "./processing/phase2ApDung.js";
export type {
  LoaiViec,
  XemNgayCaoCapInput,
  XemNgayCaoCapResult,
  TruQue,
  MenhChuQue,
  BuocKetQua,
  TrangThaiBuoc,
} from "./processing/xemNgayCaoCap.js";
export { calculateXemNgayCaoCap };
export type {
  MucChatLuong,
  YeuToDat,
  NgayXepHang,
  ThangXepHang,
  TimNgayInput,
} from "./processing/xemNgayCaoCapTimNgay.js";
export { timNgayXemNgayCaoCap, timThangTrongNam };
// Ngày Giờ Nhận Chức (dịch vụ VIP) — engine riêng, xem chú thích đầu file cho quy tắc TODO/PENDING.
export {
  calculateNhanChuc,
  type NhanChucInput,
  type NhanChucResult,
  type NhanChucNgay,
  type GioNhanChucDeXuat,
  type NgaySinhDayDu as NhanChucNgaySinhDayDu,
} from "./processing/nhanChuc.js";

// Đẩu Thủ Chọn Ngày (dịch vụ VIP) — hệ độc lập với HKĐQ, xem chú thích đầu file cho phạm vi/giới hạn.
export {
  tinhDauThuChonNgay,
  xepMucDauThu,
  type LoaiViecDauThu,
  type DauThuChonNgayInput,
  type DauThuChonNgayResult,
  type TruDauThuKetQua,
  type GioDauThu,
  type MucDauThu,
  type ThanSatDanGian,
} from "./processing/dauThuChonNgay.js";
export {
  timNgayDauThuChonNgay,
  type DauThuTimNgayInput,
  type DauThuNgayXepHang,
  type ThongKeDauThu,
} from "./processing/dauThuChonNgayTimNgay.js";

// Chọn Ngày Thúc Đinh · Tài · Quý (VIP, đang thử nghiệm nội bộ) — xem chú thích đầu file cho phạm vi.
export {
  tinhThucDinhTaiQuy,
  type LoaiTrachThucDinh,
  type ThucDinhTaiQuyInput,
  type ThucDinhTaiQuyResult,
  type KetQuaMotMucTieuThucDinh,
  type NgayPhuHopThucDinh,
} from "./processing/thucDinhTaiQuy.js";

export * from "./types.js";

/** Version `@thien-anh/calendar-core` đang dùng — giữ đồng bộ tay với calendar-core/package.json. */
const CORE_CALENDAR_VERSION = "0.1.0";

function buildMeta(): EngineMeta {
  return {
    engine: ENGINE_NAME,
    engineVersion: ENGINE_VERSION,
    coreCalendarVersion: CORE_CALENDAR_VERSION,
    calculatedAt: new Date().toISOString(),
  };
}

export function calculate(input: TrachNhatInput): EngineResult<TrachNhatOutput> {
  const errors = validateTrachNhatInput(input);
  if (errors.length > 0) {
    return fail(errors, buildMeta());
  }

  const tuTru = tinhTuTru(input);
  const ngayInfo = tinhNgayInfo(tuTru);
  const gio12 = tinhGio12({
    julianDayNumber: tuTru.julianDayNumber,
    dayChiIndex: tuTru.dayChiIndex,
    lunarMonth: tuTru.lunarDate.month,
    lunarDay: tuTru.lunarDate.day,
  });

  const output: TrachNhatOutput = {
    solarDate: input.solarDate,
    lunarDate: tuTru.lunarDate,
    julianDayNumber: tuTru.julianDayNumber,
    tietKhi: tuTru.tietKhi,
    tuTru: tuTru.tuTru,
    truc: ngayInfo.truc,
    nhiThapBatTu: ngayInfo.nhiThapBatTu,
    hoangDaoHacDaoNgay: ngayInfo.hoangDaoHacDaoNgay,
    thanSat: ngayInfo.thanSat,
    tuoiXungNgay: ngayInfo.tuoiXungNgay,
    nguyetKy: ngayInfo.nguyetKy,
    tamNuong: ngayInfo.tamNuong,
    duongCongKyNhat: ngayInfo.duongCongKyNhat,
    nhomTuoiPhamTamTai: ngayInfo.nhomTuoiPhamTamTai,
    satChu: ngayInfo.satChu,
    canNamSinhKyKimThanThatSat: ngayInfo.canNamSinhKyKimThanThatSat,
    chiNgayKyKimThanThatSatTheoNam: ngayInfo.chiNgayKyKimThanThatSatTheoNam,
    bachKyNgay: ngayInfo.bachKyNgay,
    catTocDep: ngayInfo.catTocDep,
    thienDucHop: ngayInfo.thienDucHop,
    thienXa: ngayInfo.thienXa,
    phamThaiTue: ngayInfo.phamThaiTue,
    gio12,
  };

  return ok(output, buildMeta());
}
