/**
 * MODULE THU PHÍ — Chọn giờ liệm / giờ đóng quan / ngày giờ hạ huyệt (đặc tả chủ dự án cung cấp
 * 2026-08-14). Lớp facade: nhận ngày giờ mất DƯƠNG LỊCH (không phải âm lịch như công cụ Tính
 * Trùng Tang miễn phí) + năm sinh dương lịch, tự quy đổi âm lịch, tự tính mọi Can Chi ngày/giờ
 * thật, rồi gọi các hàm thuần trong `TrungTang.*` (rule-engine, `gioLiemHaHuyet.ts`) để xếp hạng.
 *
 * KHÔNG chẩn đoán lại Trùng Tang — chỉ dùng `TrungTang.tinhBonCungTrungTang` (đã có, dùng chung
 * với công cụ miễn phí) để lấy 4 cung làm nền cho việc xếp hạng giờ/ngày.
 */
import { Astronomy, Calendar, Data, getCanChi, getLunarDate } from "@thien-anh/calendar-core";
import { TrachNhat, TrungTang, Scoring } from "@thien-anh/rule-engine";

type Can = Data.Can;
type Chi = Data.Chi;

const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";
const NAM_TOI_THIEU = 1900;
const NAM_TOI_DA = 2100;
/** Bước 5 — quét tối đa 20 ngày thực để tránh vòng lặp vô hạn, giữ lại tối đa 10 ứng viên qua lọc tuyệt đối. */
const SO_NGAY_QUET_TOI_DA = 20;
const SO_NGAY_UNG_VIEN_GIU_LAI = 10;
/** Trực không thuộc nhóm này thì được coi là "tốt" (bước 7 mục 10.3, dòng "+5 nếu Trực không phải Kiến/Phá/Thu"). */
const TRUC_XAU = new Set(["Kiến", "Phá", "Thu"]);

/** Giờ dân sự đại diện (0-23) cho mỗi Chi giờ — cùng quy ước với `gioBang.ts`. */
function representativeHour(chiIndex: number): number {
  return chiIndex === 0 ? 0 : 2 * chiIndex - 1;
}

function jdnToNgayDuongLich(jdn: number): NgayDuongLich {
  const d = Astronomy.julianDayNumberToCalendarDate(jdn);
  return { nam: d.year, thang: d.month, ngay: d.day };
}

export interface GioLiemHaHuyetThanQuyenInput {
  chiTruongNam?: Chi;
  chiConDauLon?: Chi;
  chiChauDichTon?: Chi;
  /** Dùng thay thế khi không có trưởng nam/con dâu lớn/cháu đích tôn. */
  chiAnhTraiLon?: Chi;
  chiChaMe?: readonly Chi[];
}

export interface GioLiemHaHuyetInput {
  gioiTinh: TrungTang.GioiTinh;
  /** Năm sinh DƯƠNG LỊCH của người mất — dùng tính tuổi ta (= năm mất dương lịch - năm sinh + 1). */
  namSinhDuongLich: number;
  namMat: number;
  thangMat: number;
  ngayMat: number;
  /** 1 trong 12 Chi — khung giờ mất (mỗi Chi phủ 2 tiếng). */
  chiGioMat: Chi;
  /** Số ngày dự kiến tới khi hạ huyệt — bỏ trống hoặc ≤3 sẽ áp quy tắc miễn trừ (bước 4). */
  soNgayDuKienToiChon?: number;
  thanQuyen?: GioLiemHaHuyetThanQuyenInput;
  timeZone?: string;
}

export interface NgayDuongLich {
  nam: number;
  thang: number;
  ngay: number;
}

export interface UngVienGioLiem {
  chiGio: Chi;
  canGio: Can;
  ngayDuongLich: NgayDuongLich;
  cungGio: Chi;
  phanLoaiCung: TrungTang.PhanLoaiCung;
  hoangDaoTen: string;
  hoangDaoLaCat: boolean;
  canGioDatBangDep: boolean;
  diem: number;
}

export interface UngVienNgayGioHaHuyet {
  ngayDuongLich: NgayDuongLich;
  canChiNgay: { can: Can; chi: Chi };
  chiGio: Chi;
  canGio: Can;
  cungGio: Chi;
  phanLoaiCung: TrungTang.PhanLoaiCung;
  hoangDaoTen: string;
  hoangDaoLaCat: boolean;
  canGioDatBangDep: boolean;
  ngayHopVoiVong: "tam-hop" | "luc-hop" | null;
  trucTot: boolean;
  /** Chi giờ thuộc Dần/Thân/Tỵ/Hợi — chỉ khuyến nghị tránh cho hạ huyệt, không loại tuyệt đối. */
  chiGioThuocTuSinh: boolean;
  diem: number;
}

export interface GioLiemHaHuyetOutput {
  tuoiTa: number;
  duoi10Tuoi: boolean;
  bonCung?: TrungTang.BonCungTrungTang;
  /** Top 3 (đã lọc theo tuổi thân quyến khi có dữ liệu) — dùng chung cho cả giờ liệm và giờ đóng quan. */
  gioLiemDongQuan?: UngVienGioLiem[];
  /** true nếu lọc thân quyến làm hết sạch danh sách nên phải bỏ ràng buộc đó để có kết quả. */
  thanQuyenDaNoiLong?: boolean;
  apDungMienTru3Ngay?: boolean;
  /** Top 3 ngày+giờ hạ huyệt. */
  ngayGioHaHuyet?: UngVienNgayGioHaHuyet[];
  /** true nếu quét hết 20 ngày mà không còn ngày nào qua được lọc tuyệt đối (rất hiếm). */
  khongTimThayNgayHaHuyet?: boolean;
}

function validateInput(input: GioLiemHaHuyetInput): void {
  if (!Number.isInteger(input.namSinhDuongLich) || input.namSinhDuongLich < NAM_TOI_THIEU || input.namSinhDuongLich > NAM_TOI_DA) {
    throw new Error(`namSinhDuongLich không hợp lệ: phải là số nguyên trong khoảng ${NAM_TOI_THIEU}-${NAM_TOI_DA}.`);
  }
  if (!Number.isInteger(input.namMat) || input.namMat < NAM_TOI_THIEU || input.namMat > NAM_TOI_DA) {
    throw new Error(`namMat không hợp lệ: phải là số nguyên trong khoảng ${NAM_TOI_THIEU}-${NAM_TOI_DA}.`);
  }
  if (input.namMat < input.namSinhDuongLich) {
    throw new Error("Năm mất phải sau hoặc bằng năm sinh.");
  }
  if (!Number.isInteger(input.thangMat) || input.thangMat < 1 || input.thangMat > 12) {
    throw new Error("thangMat phải từ 1 đến 12.");
  }
  if (!Number.isInteger(input.ngayMat) || input.ngayMat < 1 || input.ngayMat > 31) {
    throw new Error("ngayMat không hợp lệ.");
  }
}

function tinhTuoiTa(namSinhDuongLich: number, namMatDuongLich: number): number {
  return namMatDuongLich - namSinhDuongLich + 1;
}

export function calculateGioLiemHaHuyet(input: GioLiemHaHuyetInput): GioLiemHaHuyetOutput {
  validateInput(input);
  const timeZone = input.timeZone ?? DEFAULT_TIME_ZONE;
  const tuoiTa = tinhTuoiTa(input.namSinhDuongLich, input.namMat);

  if (tuoiTa < TrungTang.TUOI_TOI_THIEU_TINH_TRUNG_TANG) {
    return { tuoiTa, duoi10Tuoi: true };
  }

  const lunarMat = getLunarDate({ year: input.namMat, month: input.thangMat, day: input.ngayMat, timeZone });
  const bonCung = TrungTang.tinhBonCungTrungTang(input.gioiTinh, tuoiTa, lunarMat.month, lunarMat.day, input.chiGioMat);
  const jdnMat = Astronomy.julianDayNumber(input.namMat, input.thangMat, input.ngayMat);
  const idxGioMat = Data.CHI.indexOf(input.chiGioMat);
  const chiTuoiVong = Scoring.getChi(input.namSinhDuongLich);

  // ------------------------------------------------------------------
  // Bước 3 + 7 + 8 — Giờ liệm / đóng quan (dùng chung 1 danh sách xếp hạng cho cả 2 mục).
  // ------------------------------------------------------------------
  const ungVienGioLiem: UngVienGioLiem[] = [];
  for (let step = 0; step < 12; step++) {
    const idxChi = (idxGioMat + step) % 12;
    const chiGio = Data.CHI[idxChi]!;
    if ((TrungTang.LUON_TRANH_LIEM as readonly Chi[]).includes(chiGio)) continue; // Dần/Thân/Tỵ/Hợi — loại tuyệt đối
    if (step * 2 < 8) continue; // dưới 8 tiếng kể từ khi mất

    const dayOffset = Math.floor((idxGioMat + step) / 12);
    const jdnCandidate = jdnMat + dayOffset;
    const hourPillar = Calendar.getGanzhiHour(jdnCandidate, representativeHour(idxChi));
    const dayPillar = Calendar.getGanzhiDay(jdnCandidate);
    const cungGio = TrungTang.tinhCungTheoChiGio(input.gioiTinh, bonCung.cungNgay, chiGio);
    const phanLoaiCungGio = TrungTang.phanLoaiCung(cungGio);
    const hoangDao = TrachNhat.getHoangDaoHacDaoGio(dayPillar.chiIndex, hourPillar.chiIndex);

    ungVienGioLiem.push({
      chiGio,
      canGio: hourPillar.can,
      ngayDuongLich: jdnToNgayDuongLich(jdnCandidate),
      cungGio,
      phanLoaiCung: phanLoaiCungGio,
      hoangDaoTen: hoangDao.name,
      hoangDaoLaCat: hoangDao.catHung === "cát",
      canGioDatBangDep: TrungTang.isCanGioDep(hourPillar.can, dayPillar.chi),
      diem: 0,
    });
  }

  const coNhapMoGioLiem = ungVienGioLiem.some((c) => c.phanLoaiCung === "nhap-mo");
  const thanQuyenParam: TrungTang.ThanQuyenGioLiem = {
    ...(input.thanQuyen?.chiTruongNam ? { chiTruongNam: input.thanQuyen.chiTruongNam } : {}),
    ...(input.thanQuyen?.chiConDauLon ? { chiConDauLon: input.thanQuyen.chiConDauLon } : {}),
    ...(input.thanQuyen?.chiChauDichTon ? { chiChauDichTon: input.thanQuyen.chiChauDichTon } : {}),
    ...(input.thanQuyen?.chiAnhTraiLon ? { chiAnhTraiLon: input.thanQuyen.chiAnhTraiLon } : {}),
    ...(input.thanQuyen?.chiChaMe ? { chiChaMe: input.thanQuyen.chiChaMe } : {}),
  };

  for (const c of ungVienGioLiem) {
    c.diem = TrungTang.tinhDiemUngVien({
      phanLoaiCung: c.phanLoaiCung,
      apDungThienDi: !coNhapMoGioLiem,
      hoangDaoTen: c.hoangDaoTen,
      hoangDaoLaCat: c.hoangDaoLaCat,
      canGioDatBangDep: c.canGioDatBangDep,
      boiCanh: "liem",
      chiGioThuocTuSinh: false, // nhóm này đã bị loại ở vòng lọc tuyệt đối phía trên
    });
  }
  ungVienGioLiem.sort((a, b) => b.diem - a.diem);

  // Bước 8 — lọc thân quyến. Đặc tả mục 11 gợi ý "nới lỏng dần: bỏ tầng Can giờ, rồi tầng Hoàng
  // Đạo" nếu lọc hết sạch — NHƯNG lọc ở đây loại theo Chi giờ (chiGio) tuyệt đối, không theo
  // ngưỡng điểm, nên chấm lại điểm với ít/không bonus không đổi được TẬP Chi nào bị loại — chỉ
  // đổi thứ tự trong tập không đổi. Do đó việc duy nhất "nới lỏng" thực sự làm được là bỏ hẳn
  // ràng buộc thân quyến (đã có sẵn trong `locTheoTuoiThanQuyen`, gắn cờ `daNoiLong` cho tầng UI
  // biết mà cảnh báo) — không có tầng trung gian nào khác hợp lý về mặt logic.
  const locThanQuyen = TrungTang.locTheoTuoiThanQuyen(ungVienGioLiem, thanQuyenParam);

  // ------------------------------------------------------------------
  // Bước 4 — quy tắc miễn trừ: chôn trong ≤3 ngày (hoặc không rõ) → bỏ hẳn bước chọn NGÀY,
  // chỉ chọn GIỜ hạ huyệt của chính ngày mất (Cung_Ngày giữ nguyên = Cung_Ngày_mat).
  // ------------------------------------------------------------------
  const apDungMienTru3Ngay = !input.soNgayDuKienToiChon || input.soNgayDuKienToiChon <= 3;

  interface NgayUngVienHaHuyet {
    ngayDuongLich: NgayDuongLich;
    jdn: number;
    jdUT: number;
    canChiNgay: { can: Can; chi: Chi; chiIndex: number };
    cungNgay: Chi;
    ngayHopVoiVong: "tam-hop" | "luc-hop" | null;
  }

  function xepHangGioTrongNgay(ngay: NgayUngVienHaHuyet): UngVienNgayGioHaHuyet[] {
    const monthOrderIndex = Calendar.monthBoundaryOrderIndex(ngay.jdUT);
    const truc = TrachNhat.getTruc(ngay.canChiNgay.chiIndex, monthOrderIndex);
    const trucTot = !TRUC_XAU.has(truc.name);

    const cungTheoK: Chi[] = [];
    for (let k = 1; k <= 12; k++) cungTheoK.push(TrungTang.tinhCungGioHaHuyet(ngay.cungNgay, k));
    const coNhapMoTrongNgay = cungTheoK.some((c) => TrungTang.phanLoaiCung(c) === "nhap-mo");

    const ketQua: UngVienNgayGioHaHuyet[] = [];
    for (let k = 1; k <= 12; k++) {
      const idxChi = k - 1;
      const chiGio = Data.CHI[idxChi]!;
      const hourPillar = Calendar.getGanzhiHour(ngay.jdn, representativeHour(idxChi));
      const cungGio = cungTheoK[idxChi]!;
      const phanLoaiCungGio = TrungTang.phanLoaiCung(cungGio);
      const hoangDao = TrachNhat.getHoangDaoHacDaoGio(ngay.canChiNgay.chiIndex, hourPillar.chiIndex);
      const canGioDatBangDep = TrungTang.isCanGioDep(hourPillar.can, ngay.canChiNgay.chi);
      const chiGioThuocTuSinh = (TrungTang.KHUYEN_TRANH_CHON as readonly Chi[]).includes(chiGio);

      const diem = TrungTang.tinhDiemUngVien({
        phanLoaiCung: phanLoaiCungGio,
        apDungThienDi: !coNhapMoTrongNgay,
        hoangDaoTen: hoangDao.name,
        hoangDaoLaCat: hoangDao.catHung === "cát",
        canGioDatBangDep,
        boiCanh: "ha-huyet",
        chiGioThuocTuSinh,
        ngayHopVoiVong: ngay.ngayHopVoiVong !== null,
        trucTot,
      });

      ketQua.push({
        ngayDuongLich: ngay.ngayDuongLich,
        canChiNgay: { can: ngay.canChiNgay.can, chi: ngay.canChiNgay.chi },
        chiGio,
        canGio: hourPillar.can,
        cungGio,
        phanLoaiCung: phanLoaiCungGio,
        hoangDaoTen: hoangDao.name,
        hoangDaoLaCat: hoangDao.catHung === "cát",
        canGioDatBangDep,
        ngayHopVoiVong: ngay.ngayHopVoiVong,
        trucTot,
        chiGioThuocTuSinh,
        diem,
      });
    }
    return ketQua;
  }

  function ngayHopVoiVongCua(chiNgay: Chi): "tam-hop" | "luc-hop" | null {
    if (TrachNhat.isTamHop(chiNgay, chiTuoiVong)) return "tam-hop";
    if (TrachNhat.isLucHop(chiNgay, chiTuoiVong)) return "luc-hop";
    return null;
  }

  let tatCaGioHaHuyet: UngVienNgayGioHaHuyet[] = [];
  let khongTimThayNgayHaHuyet = false;

  if (apDungMienTru3Ngay) {
    const canChiMat = getCanChi({ year: input.namMat, month: input.thangMat, day: input.ngayMat, hour: 12, timeZone });
    tatCaGioHaHuyet = xepHangGioTrongNgay({
      ngayDuongLich: { nam: input.namMat, thang: input.thangMat, ngay: input.ngayMat },
      jdn: jdnMat,
      jdUT: canChiMat.julianDay,
      canChiNgay: { can: canChiMat.day.can, chi: canChiMat.day.chi, chiIndex: canChiMat.day.chiIndex },
      cungNgay: bonCung.cungNgay,
      ngayHopVoiVong: ngayHopVoiVongCua(canChiMat.day.chi),
    });
  } else {
    const chiXungVong = TrachNhat.getLucXungChi(chiTuoiVong);
    const dsNgayUngVien: NgayUngVienHaHuyet[] = [];
    for (let offset = 1; offset <= SO_NGAY_QUET_TOI_DA && dsNgayUngVien.length < SO_NGAY_UNG_VIEN_GIU_LAI; offset++) {
      const jdnCandidate = jdnMat + offset;
      const rawDate = Astronomy.julianDayNumberToCalendarDate(jdnCandidate);
      const canChiCandidate = getCanChi({ ...rawDate, hour: 12, timeZone });
      const lunarCandidate = getLunarDate({ ...rawDate, timeZone });

      if (TrungTang.isTrungNhat(canChiCandidate.day.chi)) continue;
      if (TrungTang.isPhucNhat(canChiCandidate.day.can, lunarMat.month)) continue;
      if (canChiCandidate.day.chi === chiXungVong) continue;

      const cungNgay = TrungTang.tinhCungNgayUngVien(input.gioiTinh, bonCung.cungThang, lunarCandidate.day);
      dsNgayUngVien.push({
        ngayDuongLich: jdnToNgayDuongLich(jdnCandidate),
        jdn: jdnCandidate,
        jdUT: canChiCandidate.julianDay,
        canChiNgay: { can: canChiCandidate.day.can, chi: canChiCandidate.day.chi, chiIndex: canChiCandidate.day.chiIndex },
        cungNgay,
        ngayHopVoiVong: ngayHopVoiVongCua(canChiCandidate.day.chi),
      });
    }

    if (dsNgayUngVien.length === 0) {
      khongTimThayNgayHaHuyet = true;
    } else {
      for (const ngay of dsNgayUngVien) {
        tatCaGioHaHuyet.push(...xepHangGioTrongNgay(ngay));
      }
    }
  }

  tatCaGioHaHuyet.sort((a, b) => b.diem - a.diem);

  return {
    tuoiTa,
    duoi10Tuoi: false,
    bonCung,
    gioLiemDongQuan: locThanQuyen.ketQua.slice(0, 3),
    thanQuyenDaNoiLong: locThanQuyen.daNoiLong,
    apDungMienTru3Ngay,
    ngayGioHaHuyet: tatCaGioHaHuyet.slice(0, 3),
    khongTimThayNgayHaHuyet,
  };
}
