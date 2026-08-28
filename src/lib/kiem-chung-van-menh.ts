/**
 * KIỂM CHỨNG VẬN MỆNH — module "phễu tin cậy" (Bậc 0, miễn phí).
 *
 * Ý tưởng: thay vì mô tả chung chung dễ ai đọc cũng thấy đúng (kiểu horoscope), module này đối
 * chiếu lá số với SỰ KIỆN THẬT khách đã tự tay khai (cưới năm nào, mất việc năm nào...) rồi trả về
 * "hệ thống đọc đúng hướng X/Y sự kiện" — bằng chứng cụ thể thay vì lời nói chung.
 *
 * THUẦN CÔNG THỨC, KHÔNG GỌI AI — dùng đúng cơ chế đã có sẵn trong engine, không phát minh tri thức
 * mới:
 *   - `phanTichBatTuTaiDaiVan()` (bat-tu-engine/engine.ts): tính LẠI Dụng/Hỷ/Kỵ/Cừu Thần coi Đại Vận
 *     là "trụ thứ 5" — chính xác hơn cách tính tĩnh theo nguyên cục mà bản mồi free-template.ts dùng,
 *     vì đây là công cụ CHỨNG MINH độ chính xác nên phải dùng phép tính tốt nhất đang có.
 *   - `tinhLuuNien()` (bat-tu.ts): lấy đúng Can/Chi Lưu Niên của năm sự kiện.
 *   - `diemHanhTheoDungThan()` (free-template.ts): điểm thô ±1/0 so hành với Dụng/Hỷ/Kỵ/Cừu Thần.
 *
 * ⚠️ GIỚI HẠN THÀNH THẬT (phải nói rõ với khách, không tô hồng):
 *   - Chỉ xét TRỤC Đại Vận + Lưu Niên theo Dụng Thần — CHƯA xét Thần Sát/hình-xung-hợp-hại của riêng
 *     năm đó (phần này cần bản đầy đủ). Đây là kiểm tra ở tầng "xu hướng lớn", không phải luận chi
 *     tiết từng năm.
 *   - Khách chỉ khai NĂM (không có ngày/tháng), nên năm Bát Tự (ranh giới Lập Xuân ~4/2) có thể lệch
 *     ±1 năm so với năm dương lịch khách nhớ — chấp nhận sai số này, không giả vờ chính xác tuyệt đối.
 *   - "Khớp" chỉ có nghĩa là ĐÚNG HƯỚNG (thuận/nghịch), không phải đúng MỨC ĐỘ hay đúng LĨNH VỰC cụ
 *     thể (sự nghiệp/sức khỏe/tình cảm) — bản đầy đủ mới tách được từng lĩnh vực.
 */
import { tinhBatTu, tinhLuuNien, type BatTuInput } from "./bat-tu";
import { phanTichBatTuTaiDaiVan, hanhCan, hanhChi, type TuTruInput } from "./bat-tu-engine/engine";
import { diemHanhTheoDungThan } from "./luan-giai-toan-dien/free-template";

export type HuongSuKien = "tich_cuc" | "tieu_cuc";

export interface SuKienDauVao {
  nam: number;
  moTa?: string;
  huong: HuongSuKien;
}

export type KetLuanSuKien = "khop" | "lech" | "trung_tinh" | "ngoai_pham_vi";

export interface SuKienKetQua extends SuKienDauVao {
  tuoi: number;
  daiVan: { can: string; chi: string; startAge: number; endAge: number } | null;
  luuNien: { can: string; chi: string };
  diem: number;
  ketLuan: KetLuanSuKien;
}

export interface KiemChungVanMenhKetQua {
  tongSo: number;
  khop: number;
  lech: number;
  trungTinh: number;
  chiTiet: SuKienKetQua[];
}

function tuTruInputTuChart(input: BatTuInput, chart: ReturnType<typeof tinhBatTu>): TuTruInput {
  return {
    nam: { can: chart.year.can, chi: chart.year.chi },
    thang: { can: chart.month.can, chi: chart.month.chi },
    ngay: { can: chart.day.can, chi: chart.day.chi },
    gio: { can: chart.hour.can, chi: chart.hour.chi },
    gioiTinh: input.gender,
  };
}

/** Tìm Đại Vận (đã tính sẵn trong chart) mà 1 năm dương lịch rơi vào. `null` nếu trước khi nhập vận. */
function timDaiVanChoNam(chart: ReturnType<typeof tinhBatTu>, nam: number) {
  const dv = chart.daiVan.find((v, i) => {
    const ketThuc = chart.daiVan[i + 1]?.startDate.y ?? Infinity;
    return nam >= v.startDate.y && nam < ketThuc;
  });
  return dv ?? null;
}

export function kiemChungVanMenh(input: BatTuInput, danhSachSuKien: SuKienDauVao[]): KiemChungVanMenhKetQua {
  const chart = tinhBatTu(input);
  const tt = tuTruInputTuChart(input, chart);

  const chiTiet: SuKienKetQua[] = danhSachSuKien.map((sk) => {
    const luuNienRaw = tinhLuuNien(sk.nam, input.year, 1)[0];
    const luuNien = { can: luuNienRaw.can, chi: luuNienRaw.chi };
    const tuoi = luuNienRaw.tuoi;

    const dv = timDaiVanChoNam(chart, sk.nam);
    if (!dv) {
      // Sự kiện xảy ra trước khi nhập Đại Vận đầu tiên (thời thơ ấu) — vận trình lúc này chịu ảnh
      // hưởng nhiều bởi cha mẹ/môi trường hơn là Bát Tự tự thân, không đủ căn cứ để chấm.
      return { ...sk, tuoi, daiVan: null, luuNien, diem: 0, ketLuan: "ngoai_pham_vi" };
    }

    const phanTich = phanTichBatTuTaiDaiVan(tt, { can: dv.can, chi: dv.chi });
    const diem = (diemHanhTheoDungThan(hanhCan(luuNien.can), phanTich.dungThan) + diemHanhTheoDungThan(hanhChi(luuNien.chi), phanTich.dungThan)) / 2;

    let ketLuan: KetLuanSuKien;
    if (diem === 0) ketLuan = "trung_tinh";
    else if (sk.huong === "tich_cuc") ketLuan = diem > 0 ? "khop" : "lech";
    else ketLuan = diem < 0 ? "khop" : "lech";

    return {
      ...sk, tuoi, luuNien, diem, ketLuan,
      daiVan: { can: dv.can, chi: dv.chi, startAge: dv.startAge, endAge: dv.endAge },
    };
  });

  const khop = chiTiet.filter((s) => s.ketLuan === "khop").length;
  const lech = chiTiet.filter((s) => s.ketLuan === "lech").length;
  const trungTinh = chiTiet.filter((s) => s.ketLuan === "trung_tinh" || s.ketLuan === "ngoai_pham_vi").length;

  return { tongSo: chiTiet.length, khop, lech, trungTinh, chiTiet };
}
