/**
 * NGÀY ĐỘNG PHÒNG — tính điểm cho từng ngày trong 1 khoảng thời gian rồi xếp hạng từ cao
 * xuống thấp, có xét thêm Chi tuổi (con giáp) chồng/vợ nếu người dùng cung cấp. Toàn bộ logic
 * chấm điểm nằm trong `rule-engine/scoring/dongPhong.ts` — ở đây chỉ gọi lại
 * `tinhTuTru`/`tinhNgayInfo` đã có cho từng ngày trong khoảng, rồi đưa dữ liệu ngày (+ Chi tuổi
 * nếu có) vào hàm chấm điểm đó. Không hard-code điểm số cho bất kỳ ngày cụ thể nào.
 */
import type { Data } from "@thien-anh/calendar-core";
import { Scoring } from "@thien-anh/rule-engine";
import { tinhNgayInfo } from "./ngayInfo.js";
import { tinhTuTru } from "./tuTru.js";

type Chi = Data.Chi;

/** Số ngày tối đa cho 1 lần tính khoảng — tránh lạm dụng/quá tải khi người dùng chọn khoảng quá rộng. */
const SO_NGAY_TOI_DA = 62;

export interface DongPhongNgay extends Scoring.DongPhongResult {
  solarDate: { year: number; month: number; day: number };
  lunarDay: number;
  /** 0=Chủ Nhật ... 6=Thứ Bảy. */
  weekday: number;
}

export interface DongPhongRangeInput {
  startDate: { year: number; month: number; day: number };
  endDate: { year: number; month: number; day: number };
  timeZone: string;
  /** Chi tuổi (con giáp) chồng — bỏ trống nếu không có, không suy đoán. */
  chiTuoiChong?: Chi;
  /** Chi tuổi (con giáp) vợ — bỏ trống nếu không có, không suy đoán. */
  chiTuoiVo?: Chi;
}

export interface DongPhongRangeResult {
  /** Đã sắp xếp điểm giảm dần (ngày tốt nhất trước); cùng điểm thì giữ nguyên thứ tự ngày tăng dần. */
  ngayXepHang: DongPhongNgay[];
}

function tinhMotNgay(
  year: number,
  month: number,
  day: number,
  timeZone: string,
  chiTuoiChong: Chi | undefined,
  chiTuoiVo: Chi | undefined,
): DongPhongNgay {
  const tuTru = tinhTuTru({ solarDate: { year, month, day }, timeZone });
  const ngayInfo = tinhNgayInfo(tuTru);
  const ketQua = Scoring.tinhDiemDongPhong({
    dayChi: tuTru.tuTru.ngay.chi as Chi,
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
    chiTuoiChong,
    chiTuoiVo,
  });
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  return {
    solarDate: { year, month, day },
    lunarDay: tuTru.lunarDate.day,
    weekday,
    ...ketQua,
  };
}

export function calculateDongPhongRange(input: DongPhongRangeInput): DongPhongRangeResult {
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

  const days: DongPhongNgay[] = [];
  for (let i = 0; i < soNgay; i++) {
    const d = new Date(startMs + i * 86_400_000);
    days.push(
      tinhMotNgay(
        d.getUTCFullYear(),
        d.getUTCMonth() + 1,
        d.getUTCDate(),
        input.timeZone,
        input.chiTuoiChong,
        input.chiTuoiVo,
      ),
    );
  }

  const ngayXepHang = [...days].sort((a, b) => b.diem - a.diem);
  return { ngayXepHang };
}
