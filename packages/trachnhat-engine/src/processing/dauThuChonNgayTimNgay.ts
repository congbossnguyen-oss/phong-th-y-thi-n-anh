/**
 * ĐẨU THỦ CHỌN NGÀY — chế độ TÌM NGÀY (quét khoảng + xếp hạng).
 *
 * Cùng khuôn với `xemNgayCaoCapTimNgay.ts`: quét từng ngày qua `tinhDauThuChonNgay` (điểm đã tính
 * sẵn đầy đủ ở đó), xếp giảm dần theo điểm. Ngày bị lọc sớm (`loaiSomTrungNgay`) vẫn giữ lại
 * trong kết quả (điểm đã bị trừ rất nặng nên tự rơi xuống đáy) thay vì loại cứng — SPEC dùng chữ
 * "hạ hạng mạnh hoặc loại", chọn hạ hạng để khách vẫn thấy được nếu cả khoảng không còn ngày nào
 * khá hơn.
 *
 * `thongKe` đếm theo TOÀN BỘ số ngày đã quét (không chỉ top kết quả trả về) — chủ dự án yêu cầu
 * 1/9/2026: cần thống kê rõ để khách thấy ngay bức tranh chung của cả khoảng, không chỉ 10 ngày
 * đầu bảng.
 */
import { Astronomy } from "@thien-anh/calendar-core";
import {
  tinhDauThuChonNgay,
  xepMucDauThu,
  type DauThuChonNgayInput,
  type DauThuChonNgayResult,
  type MucDauThu,
  type ThanSatDanGian,
} from "./dauThuChonNgay.js";

export interface DauThuNgayXepHang {
  ngayDuongLich: { nam: number; thang: number; ngay: number };
  amLich: { ngay: number; thang: number; nam: number; nhuan: boolean };
  canChiNgay: string;
  diem: number;
  muc: MucDauThu;
  cachCuc: string[];
  loaiSomTrungNgay: boolean;
  /** Tên + mô tả từng thần sát dân gian phạm phải (rỗng = không phạm) — anh Công yêu cầu
   * 1/9/2026: liệt kê rõ tên, không chỉ đếm số lượng. */
  thanSatDanGian: ThanSatDanGian[];
  gioTot: { chiGio: string; khungGio: string; tenSao: string }[];
  chiTiet: DauThuChonNgayResult;
}

export interface DauThuTimNgayInput extends Omit<DauThuChonNgayInput, "ngayGiamDinh"> {
  tuNgay: { nam: number; thang: number; ngay: number };
  denNgay: { nam: number; thang: number; ngay: number };
  soKetQua?: number;
}

export interface ThongKeDauThu {
  ratTot: number;
  kha: number;
  trungBinh: number;
  nenTranh: number;
}

const SO_NGAY_QUET_TOI_DA = 400;

function jdnToNgay(jdn: number): { nam: number; thang: number; ngay: number } {
  const d = Astronomy.julianDayNumberToCalendarDate(jdn);
  return { nam: d.year, thang: d.month, ngay: d.day };
}

export function timNgayDauThuChonNgay(input: DauThuTimNgayInput): {
  tongSoNgayQuet: number;
  thongKe: ThongKeDauThu;
  ketQua: DauThuNgayXepHang[];
} {
  const jdnTu = Astronomy.julianDayNumber(input.tuNgay.nam, input.tuNgay.thang, input.tuNgay.ngay);
  const jdnDen = Astronomy.julianDayNumber(input.denNgay.nam, input.denNgay.thang, input.denNgay.ngay);
  if (jdnDen < jdnTu) throw new Error("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.");
  const soNgay = Math.min(jdnDen - jdnTu + 1, SO_NGAY_QUET_TOI_DA);

  const ds: DauThuNgayXepHang[] = [];
  const thongKe: ThongKeDauThu = { ratTot: 0, kha: 0, trungBinh: 0, nenTranh: 0 };
  const CONG: Record<MucDauThu, keyof ThongKeDauThu> = {
    rat_tot: "ratTot", kha: "kha", trung_binh: "trungBinh", nen_tranh: "nenTranh",
  };

  for (let i = 0; i < soNgay; i++) {
    const ngay = jdnToNgay(jdnTu + i);
    let kq: DauThuChonNgayResult;
    try {
      kq = tinhDauThuChonNgay({ ...input, ngayGiamDinh: ngay });
    } catch {
      continue;
    }
    const muc = xepMucDauThu(kq.diem);
    thongKe[CONG[muc]]++;
    ds.push({
      ngayDuongLich: kq.ngayDuongLich,
      amLich: kq.amLich,
      canChiNgay: `${kq.tuTru[2]!.can} ${kq.tuTru[2]!.chi}`,
      diem: kq.diem,
      muc,
      cachCuc: kq.cachCuc,
      loaiSomTrungNgay: kq.loaiSomTrungNgay,
      thanSatDanGian: kq.thanSatDanGian,
      gioTot: kq.gioDeXuat.filter((g) => g.laHoangDao && (g.vaiTro === "Nguyên Thần" || g.vaiTro === "Võ Tài")).slice(0, 3)
        .map((g) => ({ chiGio: g.chiGio, khungGio: g.khungGio, tenSao: g.tenSao })),
      chiTiet: kq,
    });
  }

  ds.sort((a, b) => b.diem - a.diem);
  return { tongSoNgayQuet: soNgay, thongKe, ketQua: ds.slice(0, input.soKetQua ?? 10) };
}
