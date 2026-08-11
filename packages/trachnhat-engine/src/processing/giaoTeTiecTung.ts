/**
 * NGÀY GIAO TẾ – TIỆC TÙNG — tính điểm cho từng ngày trong 1 khoảng thời gian rồi xếp hạng từ
 * cao xuống thấp. Toàn bộ logic chấm điểm (trọng số, ngưỡng xếp hạng) nằm trong
 * `rule-engine/scoring/giaoTeTiecTung.ts` — ở đây chỉ gọi lại `tinhTuTru`/`tinhNgayInfo` đã có
 * cho từng ngày trong khoảng, rồi đưa dữ liệu ngày vào hàm chấm điểm đó. Không hard-code điểm
 * số cho bất kỳ ngày cụ thể nào — luôn tính lại từ dữ liệu ngày thực tế.
 */
import { Scoring } from "@thien-anh/rule-engine";
import { tinhNgayInfo } from "./ngayInfo.js";
import { tinhTuTru } from "./tuTru.js";

/** Số ngày tối đa cho 1 lần tính khoảng — tránh lạm dụng/quá tải khi người dùng chọn khoảng quá rộng. */
const SO_NGAY_TOI_DA = 62;

export interface GiaoTeTiecTungNgay extends Scoring.GiaoTeTiecTungResult {
  solarDate: { year: number; month: number; day: number };
  lunarDay: number;
  /** 0=Chủ Nhật ... 6=Thứ Bảy. */
  weekday: number;
}

export interface GiaoTeTiecTungRangeInput {
  startDate: { year: number; month: number; day: number };
  endDate: { year: number; month: number; day: number };
  timeZone: string;
}

export interface GiaoTeTiecTungRangeResult {
  /** Đã sắp xếp điểm giảm dần (ngày tốt nhất trước); cùng điểm thì giữ nguyên thứ tự ngày tăng dần. */
  ngayXepHang: GiaoTeTiecTungNgay[];
}

function tinhMotNgay(year: number, month: number, day: number, timeZone: string): GiaoTeTiecTungNgay {
  const tuTru = tinhTuTru({ solarDate: { year, month, day }, timeZone });
  const ngayInfo = tinhNgayInfo(tuTru);
  const ketQua = Scoring.tinhDiemGiaoTeTiecTung({
    trucName: ngayInfo.truc.name,
    hoangDaoHacDao: ngayInfo.hoangDaoHacDaoNgay,
    nhiThapBatTuCatHung: ngayInfo.nhiThapBatTu.catHung,
    thanSat: ngayInfo.thanSat,
    nguyetKy: ngayInfo.nguyetKy,
    tamNuong: ngayInfo.tamNuong,
    duongCongKyNhat: ngayInfo.duongCongKyNhat,
    satChu: ngayInfo.satChu,
    bachKyNgay: ngayInfo.bachKyNgay,
    thienDucHop: ngayInfo.thienDucHop,
    thienXa: ngayInfo.thienXa,
  });
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  return {
    solarDate: { year, month, day },
    lunarDay: tuTru.lunarDate.day,
    weekday,
    ...ketQua,
  };
}

export function calculateGiaoTeTiecTungRange(input: GiaoTeTiecTungRangeInput): GiaoTeTiecTungRangeResult {
  const startMs = Date.UTC(input.startDate.year, input.startDate.month - 1, input.startDate.day);
  const endMs = Date.UTC(input.endDate.year, input.endDate.month - 1, input.endDate.day);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    throw new Error("startDate/endDate không hợp lệ.");
  }
  if (endMs < startMs) {
    throw new Error("endDate phải sau hoặc bằng startDate.");
  }
  const soNgay = Math.round((endMs - startMs) / 86_400_000) + 1;
  if (soNgay > SO_NGAY_TOI_DA) {
    throw new Error(`Khoảng ngày tối đa ${SO_NGAY_TOI_DA} ngày cho 1 lần tính.`);
  }

  const days: GiaoTeTiecTungNgay[] = [];
  for (let i = 0; i < soNgay; i++) {
    const d = new Date(startMs + i * 86_400_000);
    days.push(tinhMotNgay(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), input.timeZone));
  }

  const ngayXepHang = [...days].sort((a, b) => b.diem - a.diem);
  return { ngayXepHang };
}
