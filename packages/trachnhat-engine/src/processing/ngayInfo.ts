/**
 * Trực, 28 Tú, Hoàng-Hắc theo ngày, Thần Sát, tuổi xung — theo docs/15-trach-nhat-engine.md
 * mục 2.3, gọi thuần `rule-engine` (nhóm `trach-nhat`) với Chi/tháng âm lịch/JDN đã có từ
 * `tuTru.ts`.
 */

import { Data } from "@thien-anh/calendar-core";
import { TrachNhat } from "@thien-anh/rule-engine";
import type { CatHungValue } from "../types.js";
import type { TuTruResult } from "./tuTru.js";

type Chi = Data.Chi;
type Can = Data.Can;

export interface NgayInfoResult {
  /**
   * Trực của ngày + dữ liệu tham chiếu (tính chất, đánh giá tổng quát, nên/kỵ) lấy sẵn từ
   * `TrachNhat.getTrucDanhGiaTongQuat` — để MỌI module xem ngày và trang hiển thị dùng chung,
   * không phải tự tra lại. `nen`/`ky` là NHÃN tham chiếu, không phải điểm số (xem trucDanhGiaTongQuat.ts).
   */
  truc: {
    index: number;
    name: string;
    tinhChat: string;
    danhGia: "tot" | "than_trong" | "xau";
    nen: string[];
    ky: string[];
  };
  nhiThapBatTu: { index: number; name: string; catHung: "cát" | "hung" };
  hoangDaoHacDaoNgay: "hoàng đạo" | "hắc đạo" | "không xác định";
  thanSat: CatHungValue[];
  /** Tên các sao trong Tam Đại Cát Tinh có mặt — dùng cho quy tắc hoá giải hung tinh. */
  tamDaiCatTinh: string[];
  /** Ngày phạm Sát / Bạch Hổ Nhập Trung Cung — nhóm hung KHÔNG hoá giải được. */
  nhapTrungCung: boolean;
  tuoiXungNgay: string[];
  nguyetKy: boolean;
  tamNuong: boolean;
  duongCongKyNhat: boolean;
  nhomTuoiPhamTamTai: string[][];
  satChu: boolean;
  canNamSinhKyKimThanThatSat: string[];
  chiNgayKyKimThanThatSatTheoNam: string[];
  bachKyNgay: { nhan: string; viec: string }[];
  catTocDep: boolean;
  thienDucHop: boolean;
  thienXa: boolean;
  phamThaiTue: {
    namChi: string;
    tuoiPhamThaiTue: string;
    tuoiXungThaiTue: string;
    tuoiHinhThaiTue: string[];
    namTuHinh: boolean;
    tuoiHaiThaiTue: string;
    tuoiPhaThaiTue: string;
  };
}

export function tinhNgayInfo(tuTru: TuTruResult): NgayInfoResult {
  const dayChi = tuTru.tuTru.ngay.chi as Chi;
  const dayCan = tuTru.tuTru.ngay.can as Can;
  const lunarMonth = tuTru.lunarDate.month;

  const truc = TrachNhat.getTruc(tuTru.dayChiIndex, tuTru.monthOrderIndex);
  // Dữ liệu tham chiếu của Trực (tính chất, nên/kỵ theo mục đích) — bảng chung ở rule-engine.
  const trucRef = TrachNhat.getTrucDanhGiaTongQuat(truc.name);
  const nhiThapBatTu = TrachNhat.getNhiThapBatTu(tuTru.julianDayNumber);
  const hoangDaoHacDaoNgay = TrachNhat.getNgayHoangDaoHacDao(lunarMonth, tuTru.dayChiIndex);
  const thanSat = TrachNhat.getThanSatTrongNgay(lunarMonth, dayChi);
  // 4 cát tinh tra theo THIÊN CAN của ngày (Tuế Đức, Tuế Đức Hợp, Nguyệt Đức, Nguyệt Đức Hợp) —
  // hệ khác với `getThanSatTrongNgay` (tra theo Địa Chi), nên gọi riêng rồi gộp danh sách.
  // Gộp ở đây để MỌI module chấm điểm đều nhận được, không phải sửa từng module.
  // Tam Đại Cát Tinh (Sát Cống · Trực Tinh · Nhân Chuyên) — so CẢ Can lẫn Chi, nên phải gọi riêng.
  const tamDaiCatTinh = TrachNhat.getTamDaiCatTinhTrongNgay(lunarMonth, dayCan, dayChi);
  // Sát / Bạch Hổ Nhập Trung Cung — tra theo vị trí ngày trong vòng 60 Hoa Giáp, hệ khác hẳn.
  const nhapTrungCung = TrachNhat.getNhapTrungCungTrongNgay(dayCan, dayChi);

  const catTinhTheoCan = TrachNhat.getCatTinhTheoCanTrongNgay(
    tuTru.tuTru.nam.can as Can,
    lunarMonth,
    dayCan,
  );
  const xungChi = TrachNhat.getLucXungChi(dayChi);
  const nguyetKy = TrachNhat.isNguyetKy(tuTru.lunarDate.day);
  const tamNuong = TrachNhat.isTamNuong(tuTru.lunarDate.day);
  const duongCongKyNhat = TrachNhat.isDuongCongKyNhat(tuTru.lunarDate.month, tuTru.lunarDate.day);
  const nhomTuoiPhamTamTai = TrachNhat.getNhomTuoiPhamTamTai(tuTru.tuTru.nam.chi as Chi);
  const satChu = TrachNhat.isSatChuNgay(dayChi, tuTru.monthOrderIndex);
  const canNamSinhKyKimThanThatSat = TrachNhat.getCanNamSinhKyKimThanThatSat(dayChi);
  const chiNgayKyKimThanThatSatTheoNam = TrachNhat.getChiNgayKyKimThanThatSatTheoNam(tuTru.tuTru.nam.can as Can);
  const bachKyNgay = TrachNhat.getBachKyNgay(dayCan, dayChi);
  const catTocDep = TrachNhat.isNgayDepCatToc(
    truc.name,
    thanSat.map((entry) => entry.name),
  );
  const thienDucHop = TrachNhat.isThienDucHopNgay(lunarMonth, dayCan, dayChi);
  const thienXa = TrachNhat.isThienXaNgay(lunarMonth, dayCan, dayChi);
  const phamThaiTue = TrachNhat.getPhamThaiTueTheoNam(tuTru.tuTru.nam.chi as Chi);

  return {
    truc: {
      index: truc.index,
      name: truc.name,
      tinhChat: trucRef?.tinhChat ?? "",
      danhGia: trucRef?.danhGia ?? "than_trong",
      nen: trucRef ? [...trucRef.nen] : [],
      ky: trucRef ? [...trucRef.ky] : [],
    },
    nhiThapBatTu: { index: nhiThapBatTu.index, name: nhiThapBatTu.name, catHung: nhiThapBatTu.catHung },
    hoangDaoHacDaoNgay,
    thanSat: [...thanSat, ...catTinhTheoCan, ...tamDaiCatTinh, ...nhapTrungCung].map((entry) => ({
      name: entry.name,
      catHung: entry.catHung,
    })),
    tamDaiCatTinh: tamDaiCatTinh.map((e) => e.name),
    nhapTrungCung: nhapTrungCung.length > 0,
    tuoiXungNgay: [xungChi],
    nguyetKy,
    tamNuong,
    duongCongKyNhat,
    nhomTuoiPhamTamTai: nhomTuoiPhamTamTai.map((g) => [...g]),
    satChu,
    canNamSinhKyKimThanThatSat: [...canNamSinhKyKimThanThatSat],
    chiNgayKyKimThanThatSatTheoNam: [...chiNgayKyKimThanThatSatTheoNam],
    bachKyNgay,
    catTocDep,
    thienDucHop,
    thienXa,
    phamThaiTue,
  };
}
