/**
 * KIỂM CHỨNG VẬN MỆNH — module "phễu tin cậy" (Bậc 0, miễn phí).
 *
 * Ý tưởng: thay vì mô tả chung chung dễ ai đọc cũng thấy đúng (kiểu horoscope), module này đối
 * chiếu lá số với SỰ KIỆN THẬT khách đã tự tay khai (cưới năm nào, mất việc năm nào...) rồi trả về
 * "hệ thống đọc đúng hướng X/Y sự kiện" — bằng chứng cụ thể thay vì lời nói chung.
 *
 * ⚠️ PHIÊN BẢN 2 (28/8/2026) — VIẾT LẠI SAU KHI ANH CÔNG TỰ TEST VÀ RA QUÁ NHIỀU "TRUNG TÍNH/LỆCH":
 * bản đầu (V1) chỉ xét "hành Lưu Niên thuận hay nghịch với Dụng Thần" — MỘT tín hiệu duy nhất, và
 * LẤY TRUNG BÌNH điểm Can + điểm Chi. Lỗi ở đây: nếu Can thuận (+1) mà Chi nghịch (-1), trung bình
 * ra 0 → báo "trung tính" — dù năm đó thực ra có tác động rõ ràng theo cả 2 chiều, chỉ là phép tính
 * triệt tiêu nhau. Nặng hơn: theo `content/bat-tu/knowledge/ung-ky.md` (đúc kết từ án lệ, đối chiếu
 * `quan-he-can-chi.md` mục 4 "Tầng thứ"), năm có SỰ KIỆN LỚN thường là năm Lưu Niên tạo XUNG/HỢP/ĐỦ
 * TAM HỢP-TAM HỘI CỤC với lá số — tức năm bị "kích hoạt/động" — chứ không chỉ đơn thuần là năm có
 * hành thuận/nghịch. V1 bỏ hoàn toàn tín hiệu này.
 *
 * V2 xét đủ 3 tín hiệu (đúng 3/5 "dấu hiệu kích hoạt ứng kỳ" liệt kê trong `ung-ky.md` mục 2 mà dữ
 * liệu hiện có đủ để tính an toàn — 2 loại còn lại là "Mộ Khố xung khai" và "Thần Sát đúng cung vị",
 * chưa làm vì cần thêm hạ tầng riêng, xem giới hạn cuối file):
 *   1. Hành Lưu Niên thuận/nghịch Dụng-Hỷ-Kỵ-Cừu Thần (giữ từ V1, nhưng XÉT RIÊNG Can/Chi, không lấy
 *      trung bình nữa).
 *   2. XUNG — Lưu Niên Chi xung với Chi nào trong (4 trụ nguyên cục + Đại Vận).
 *   3. HỢP (nhị hợp) hoặc BỔ SUNG ĐỦ Tam Hợp/Tam Hội cục đang thiếu 1 chân.
 * Đếm SỐ LỚP tín hiệu trùng khớp — đúng nguyên tắc `ung-ky.md` mục 3.2: "mức độ chắc chắn tỷ lệ
 * thuận với số lớp thông tin trùng khớp", KHÔNG chỉ dựa 1 tín hiệu đơn lẻ như V1.
 *
 * THUẦN CÔNG THỨC, KHÔNG GỌI AI:
 *   - `phanTichBatTuTaiDaiVan()`: tính LẠI Dụng/Hỷ/Kỵ/Cừu Thần coi Đại Vận là "trụ thứ 5".
 *   - `coLucXung()`, `TAM_HOP`, `TAM_HOI` (bat-tu-engine/engine.ts): dữ liệu Xung/Tam Hợp/Tam Hội đã
 *     có sẵn, dùng nguyên, không phát minh thêm.
 *   - Bảng Lục Hợp (nhị hợp) CHƯA có trong `base-data.json` (chỉ có Tam Hợp/Tam Hội/Lục Xung) — trích
 *     đúng từ `quan-he-can-chi.md` mục 1 (bảng tóm tắt quan hệ Địa Chi), đặt cục bộ trong file này
 *     (không sửa base-data.json dùng chung ở nơi khác — tránh rủi ro ảnh hưởng module khác).
 *
 * ⚠️ GIỚI HẠN THÀNH THẬT CÒN LẠI (phải nói rõ với khách, không tô hồng):
 *   - CHƯA xét "Tầng thứ" đầy đủ (quan-he-can-chi.md mục 4): khi mệnh cục tự có Hợp/Xung nội tại rồi
 *     bị Đại Vận/Lưu Niên "giải" hoặc "ghi đè", quan hệ gốc có thể mất hiệu lực — việc resolve đầy đủ
 *     các lớp chồng chéo này là bài toán lớn hơn nhiều, để dành cho bản đầy đủ. V2 chỉ xét Lưu Niên
 *     tác động TRỰC TIẾP vào (nguyên cục + Đại Vận), không resolve xung đột nội bộ giữa các trụ khác.
 *   - CHƯA xét Mộ Khố xung khai và Thần Sát đúng cung vị (2/5 dấu hiệu kích hoạt trong ung-ky.md).
 *   - Khách chỉ khai NĂM (không ngày/tháng) nên năm Bát Tự (ranh giới Lập Xuân ~4/2) có thể lệch 1 năm.
 *   - "Khớp" là ĐÚNG HƯỚNG, không phải đúng mức độ/lĩnh vực cụ thể.
 */
import { tinhBatTu, tinhLuuNien, type BatTuInput } from "./bat-tu";
import { phanTichBatTuTaiDaiVan, hanhCan, hanhChi, chiChuan, coLucXung, TAM_HOP, TAM_HOI, type TuTruInput, type Hanh } from "./bat-tu-engine/engine";
import { diemHanhTheoDungThan } from "./luan-giai-toan-dien/free-template";

export type HuongSuKien = "tich_cuc" | "tieu_cuc";

export interface SuKienDauVao {
  nam: number;
  moTa?: string;
  huong: HuongSuKien;
}

export type KetLuanSuKien = "khop" | "lech" | "co_bien_dong_chua_ro_huong" | "khong_du_can_cu" | "ngoai_pham_vi";

export interface SuKienKetQua extends SuKienDauVao {
  tuoi: number;
  daiVan: { can: string; chi: string; startAge: number; endAge: number } | null;
  luuNien: { can: string; chi: string };
  /** Mô tả ngắn các dấu hiệu kích hoạt tìm được (xung/hợp/tam hợp/hành) — để khách thấy CĂN CỨ cụ thể. */
  tinHieu: string[];
  ketLuan: KetLuanSuKien;
}

export interface KiemChungVanMenhKetQua {
  tongSo: number;
  khop: number;
  lech: number;
  trungTinh: number;
  chiTiet: SuKienKetQua[];
}

// Lục Hợp (nhị hợp) — trích nguyên từ `quan-he-can-chi.md` mục 1 (bảng tóm tắt quan hệ Địa Chi).
const LUC_HOP: [string, string][] = [
  ["Tý", "Sửu"], ["Dần", "Hợi"], ["Mão", "Tuất"], ["Thìn", "Dậu"], ["Tị", "Thân"], ["Ngọ", "Mùi"],
];

function coLucHop(chi: string, cacChi: string[]): boolean {
  const c = chiChuan(chi);
  return cacChi.some((o) => {
    const oc = chiChuan(o);
    return LUC_HOP.some(([a, b]) => (a === c && b === oc) || (b === c && a === oc));
  });
}

/** Lưu Niên có bổ sung đủ 1 bộ Tam Hợp/Tam Hội đang thiếu ĐÚNG 1 chân trong `chiNenTang` không. */
function boSungDuCuc(chiLuuNien: string, chiNenTang: string[]): { boChi: string; hoaHanh: Hanh } | null {
  const cLuuNien = chiChuan(chiLuuNien);
  const nenChuan = chiNenTang.map(chiChuan);
  for (const [boChiStr, hanh] of [...Object.entries(TAM_HOP), ...Object.entries(TAM_HOI)]) {
    const boChi = boChiStr.split("-");
    if (!boChi.includes(cLuuNien)) continue;
    const conLai = boChi.filter((c) => c !== cLuuNien);
    if (conLai.every((c) => nenChuan.includes(c))) return { boChi: boChiStr, hoaHanh: hanh as Hanh };
  }
  return null;
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
  const chiNguyenCuc = [chart.year.chi, chart.month.chi, chart.day.chi, chart.hour.chi];

  const chiTiet: SuKienKetQua[] = danhSachSuKien.map((sk) => {
    const luuNienRaw = tinhLuuNien(sk.nam, input.year, 1)[0];
    const luuNien = { can: luuNienRaw.can, chi: luuNienRaw.chi };
    const tuoi = luuNienRaw.tuoi;

    const dv = timDaiVanChoNam(chart, sk.nam);
    if (!dv) {
      // Sự kiện xảy ra trước khi nhập Đại Vận đầu tiên (thời thơ ấu) — vận trình lúc này chịu ảnh
      // hưởng nhiều bởi cha mẹ/môi trường hơn là Bát Tự tự thân, không đủ căn cứ để chấm.
      return { ...sk, tuoi, daiVan: null, luuNien, tinHieu: [], ketLuan: "ngoai_pham_vi" };
    }

    const phanTich = phanTichBatTuTaiDaiVan(tt, { can: dv.can, chi: dv.chi });
    const chiNenTang = [...chiNguyenCuc, dv.chi]; // nguyên cục + Đại Vận (trụ thứ 5) — nền để Lưu Niên tác động vào

    const tinHieu: string[] = [];

    // ─ 3 tín hiệu kích hoạt cấu trúc (ung-ky.md mục 2) ────────────────────────────────────────────
    let coKichHoatCauTruc = false;
    if (coLucXung(luuNien.chi, chiNenTang)) { tinHieu.push(`Lưu Niên ${luuNien.chi} xung với gốc lá số`); coKichHoatCauTruc = true; }
    if (coLucHop(luuNien.chi, chiNenTang)) { tinHieu.push(`Lưu Niên ${luuNien.chi} hợp với gốc lá số`); coKichHoatCauTruc = true; }
    const bsd = boSungDuCuc(luuNien.chi, chiNenTang);
    if (bsd) { tinHieu.push(`Lưu Niên ${luuNien.chi} bổ sung đủ cục ${bsd.boChi} (${bsd.hoaHanh})`); coKichHoatCauTruc = true; }

    // ─ Hành thuận/nghịch — XÉT RIÊNG Can và Chi, không lấy trung bình (lỗi đã sửa so với V1) ────────
    const diemCan = diemHanhTheoDungThan(hanhCan(luuNien.can), phanTich.dungThan);
    const diemChi = diemHanhTheoDungThan(hanhChi(luuNien.chi), phanTich.dungThan);
    if (diemCan !== 0) tinHieu.push(`Can ${luuNien.can} (${hanhCan(luuNien.can)}) ${diemCan > 0 ? "thuận" : "nghịch"} Dụng/Hỷ/Kỵ/Cừu Thần vận này`);
    if (diemChi !== 0) tinHieu.push(`Chi ${luuNien.chi} (${hanhChi(luuNien.chi)}) ${diemChi > 0 ? "thuận" : "nghịch"} Dụng/Hỷ/Kỵ/Cừu Thần vận này`);

    // Xác định hướng dự đoán từ hành: đồng thuận thì rõ; 1 bên có tín hiệu 1 bên không thì theo bên
    // có tín hiệu; trái dấu nhau (Can/Chi mâu thuẫn) thì KHÔNG rõ hướng (khác V1: trước đây triệt
    // tiêu thành 0 rồi coi là "trung tính", nay tách bạch "có biến động nhưng chưa rõ hướng").
    let huongDuDoan: 1 | -1 | 0 | null; // 1=tích cực, -1=tiêu cực, 0=mâu thuẫn/không rõ, null=không có tín hiệu hành
    if (diemCan === 0 && diemChi === 0) huongDuDoan = null;
    else if (diemCan === diemChi) huongDuDoan = diemCan as 1 | -1;
    else if (diemCan === 0) huongDuDoan = diemChi as 1 | -1;
    else if (diemChi === 0) huongDuDoan = diemCan as 1 | -1;
    else huongDuDoan = 0; // trái dấu

    let ketLuan: KetLuanSuKien;
    if (huongDuDoan === 1 || huongDuDoan === -1) {
      const huongHeThongDuDoan: HuongSuKien = huongDuDoan === 1 ? "tich_cuc" : "tieu_cuc";
      ketLuan = huongHeThongDuDoan === sk.huong ? "khop" : "lech";
    } else if (coKichHoatCauTruc) {
      // Có Xung/Hợp/Tam hợp (chắc chắn "năm động") nhưng hành không cho hướng rõ ràng.
      ketLuan = "co_bien_dong_chua_ro_huong";
    } else {
      ketLuan = "khong_du_can_cu";
    }

    return {
      ...sk, tuoi, luuNien, tinHieu, ketLuan,
      daiVan: { can: dv.can, chi: dv.chi, startAge: dv.startAge, endAge: dv.endAge },
    };
  });

  const khop = chiTiet.filter((s) => s.ketLuan === "khop").length;
  const lech = chiTiet.filter((s) => s.ketLuan === "lech").length;
  const trungTinh = chiTiet.filter((s) => s.ketLuan !== "khop" && s.ketLuan !== "lech").length;

  return { tongSo: chiTiet.length, khop, lech, trungTinh, chiTiet };
}
