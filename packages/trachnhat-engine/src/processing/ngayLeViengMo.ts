/**
 * NGÀY TỐT ĐI LỄ – VIẾNG MỘ — quét 1 khoảng ngày, chấm điểm theo
 * `rule-engine/scoring/ngayLeViengMo.ts` (2 mục đích riêng: WORSHIP/GRAVE_VISIT), xếp hạng
 * giảm dần. Có tuổi (`namSinh`) thì thêm lớp cá nhân hóa; không có vẫn tính được ngày chung.
 *
 * Tiết Thanh Minh (chỉ áp dụng khi purpose=GRAVE_VISIT): lấy chính xác từ
 * `calendar-core.getSolarTerms(year)` (mốc "Thanh Minh" 15° → "Cốc Vũ" 30°), KHÔNG hard-code
 * ngày 4/4 hoặc 5/4 — vì khoảng Thanh Minh có thể vắt qua ranh giới năm dương lịch (thường rơi
 * đầu tháng 4, kết thúc khoảng 20/4), quét cả năm trước/sau khoảng ngày người dùng chọn để chắc
 * chắn không bỏ sót mốc biên.
 */
import type { Data } from "@thien-anh/calendar-core";
import { getSolarTerms, Astronomy, Timezone } from "@thien-anh/calendar-core";
import { Scoring } from "@thien-anh/rule-engine";
import { tinhNgayInfo } from "./ngayInfo.js";
import { tinhTuTru } from "./tuTru.js";

const SO_NGAY_TOI_DA = 62;

export type LeViengMoPurpose = Scoring.LeViengMoPurpose;

export interface NgayLeViengMoRangeInput {
  purpose: LeViengMoPurpose;
  startDate: { year: number; month: number; day: number };
  endDate: { year: number; month: number; day: number };
  timeZone: string;
  /** Năm sinh người đi — bỏ trống nếu chỉ cần ngày chung. */
  namSinh?: number;
}

export interface NgayLeViengMoNgay extends Scoring.LeViengMoResult {
  solarDate: { year: number; month: number; day: number };
  lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean };
  thuocTietThanhMinh: boolean;
}

export interface NgayLeViengMoRangeResult {
  purpose: LeViengMoPurpose;
  ngayXepHang: NgayLeViengMoNgay[];
}

/** JDN theo lịch DÂN SỰ của `timeZone` (không phải JDN theo ngày UT) cho 1 thời điểm UTC cho trước. */
function localJdnOfUtcInstant(dateTimeUtc: { year: number; month: number; day: number; hour: number; minute: number; second: number }, timeZone: string): number {
  const instantUtc = new Date(
    Date.UTC(dateTimeUtc.year, dateTimeUtc.month - 1, dateTimeUtc.day, dateTimeUtc.hour, dateTimeUtc.minute, dateTimeUtc.second),
  );
  const local = Timezone.utcToZonedTime(instantUtc, timeZone);
  return Astronomy.julianDayNumber(local.year, local.month, local.day);
}

/**
 * Khoảng JDN [bắt đầu, kết thúc) của tiết Thanh Minh cho 1 năm dương lịch (theo lịch dân sự
 * của `timeZone`). Thanh Minh luôn rơi giữa tháng 4 dương lịch (không bao giờ vắt qua ranh
 * giới năm), nên chỉ cần đúng 24 tiết khí của chính năm `nam`, không cần dò năm liền kề.
 */
function khoangThanhMinhJdn(nam: number, timeZone: string): { batDau: number; ketThuc: number } | null {
  const tietKhi = getSolarTerms(nam);
  const thanhMinh = tietKhi.find((t) => t.name === "Thanh Minh");
  const cocVu = tietKhi.find((t) => t.name === "Cốc Vũ");
  if (!thanhMinh || !cocVu) return null;
  return {
    batDau: localJdnOfUtcInstant(thanhMinh.dateTimeUtc, timeZone),
    ketThuc: localJdnOfUtcInstant(cocVu.dateTimeUtc, timeZone),
  };
}

function tinhMotNgay(
  year: number,
  month: number,
  day: number,
  timeZone: string,
  purpose: LeViengMoPurpose,
  nguoi: Scoring.NguoiTuoi | undefined,
): NgayLeViengMoNgay {
  const tuTru = tinhTuTru({ solarDate: { year, month, day }, timeZone });
  const ngayInfo = tinhNgayInfo(tuTru);

  const dayInput = {
    trucName: ngayInfo.truc.name,
    hoangDaoHacDao: ngayInfo.hoangDaoHacDaoNgay,
    nhiThapBatTuCatHung: ngayInfo.nhiThapBatTu.catHung,
    thanSat: ngayInfo.thanSat,
    nguyetKy: ngayInfo.nguyetKy,
    tamNuong: ngayInfo.tamNuong,
    duongCongKyNhat: ngayInfo.duongCongKyNhat,
    satChu: ngayInfo.satChu,
    thienDucHop: ngayInfo.thienDucHop,
    thienXa: ngayInfo.thienXa,
  };

  const ketQua = Scoring.calculateLeViengMoScore(
    dayInput,
    tuTru.tuTru.ngay.can as Data.Can,
    tuTru.tuTru.ngay.chi as Data.Chi,
    purpose,
    ngayInfo.bachKyNgay,
    nguoi,
  );

  let thuocTietThanhMinh = false;
  if (purpose === "GRAVE_VISIT") {
    const khoang = khoangThanhMinhJdn(year, timeZone);
    if (khoang) {
      thuocTietThanhMinh = tuTru.julianDayNumber >= khoang.batDau && tuTru.julianDayNumber < khoang.ketThuc;
    }
  }

  return { solarDate: { year, month, day }, lunarDate: tuTru.lunarDate, thuocTietThanhMinh, ...ketQua };
}

export function calculateNgayLeViengMoRange(input: NgayLeViengMoRangeInput): NgayLeViengMoRangeResult {
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

  const nguoi = input.namSinh !== undefined ? Scoring.getNguoiTuoi(input.namSinh) : undefined;

  const days: NgayLeViengMoNgay[] = [];
  for (let i = 0; i < soNgay; i++) {
    const d = new Date(startMs + i * 86_400_000);
    days.push(tinhMotNgay(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), input.timeZone, input.purpose, nguoi));
  }

  const ngayXepHang = [...days].sort((a, b) => b.diem - a.diem);
  return { purpose: input.purpose, ngayXepHang };
}
