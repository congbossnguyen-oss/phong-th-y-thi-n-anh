// ENGINE CHẤM ĐIỂM CÁT/HUNG 12 CUNG — thuần code, KHÔNG dùng AI.
//
// Nguồn: SPEC-ENGINE-DIEM.md (gói luan-giai-tu-vi-ai anh Công gửi 26/8/2026), quy tắc hoá từ
// "Tám Phương Pháp Lượng Giá Cát Hung" trong data/phuong-phap-luan-cung-vi.md mục III.
//
// Lý do tách riêng khỏi lớp AI: cùng một lá số phải luôn ra CÙNG một điểm ở cả 3 tầng
// Free / Cơ Bản / Nâng Cao. Nếu để AI tự chấm thì mỗi lần gọi lại lệch, khách so sánh sẽ thấy mâu
// thuẫn. AI chỉ viết phần chữ "vì sao", điểm số luôn lấy từ file này.

import type { CungKetQua, TuViChart } from "../engine";

/**
 * Sao CÁT tính trong Tam Phương Tứ Chính.
 *
 * ⚠️ Lấy theo danh sách GỐC ở data/phuong-phap-luan-cung-vi.md mục I, KHÔNG theo bản rút gọn trong
 * SPEC-ENGINE-DIEM mục 1 — bản rút gọn bỏ sót **Lộc Tồn và Thiên Mã** (Tiểu Tinh Cát). Hai sao này
 * có mặt trên mọi lá số, bỏ sót khiến điểm lệch hẳn về phía hung: đo thử 360 cung thì 54% rơi vào
 * 2★ và KHÔNG cung nào đạt 5★. Cả hai ví dụ thực hành trong chính tài liệu đó đều đếm chúng là cát
 * (VD1 kể "Lộc Tồn", VD2 kể "Thiên Mã"), nên đây là căn cứ chắc chắn chứ không phải suy diễn.
 */
export const TRUNG_TINH_CAT = new Set([
  "Thiên Khôi", "Thiên Việt", "Tả Phù", "Tả Phụ", "Hữu Bật", "Văn Xương", "Văn Khúc",
  "Lộc Tồn", "Thiên Mã",
]);

/** Trung tinh HUNG. Tuần/Triệt xét riêng vì là cờ của cung, không nằm trong danh sách sao. */
export const TRUNG_TINH_HUNG = new Set([
  "Kình Dương", "Đà La", "Linh Tinh", "Hỏa Tinh", "Địa Không", "Địa Kiếp",
]);

/** Miếu/Vượng/Đắc = sao "sáng"; Bình/Hãm = "tối". "Chưa xác định" không tính về phe nào. */
const TRANG_THAI_SANG = new Set(["Miếu", "Vượng", "Đắc"]);
const TRANG_THAI_TOI = new Set(["Bình", "Hãm"]);

export type LoaiChinhTinh = "CAT" | "HUNG" | "VCD";

export type ChiTietChamDiem = {
  cungName: string;
  chiIndex: number;
  loaiChinhTinh: LoaiChinhTinh;
  soCat: number;
  soHung: number;
  diem: number;
  /** Các cung tạo thành Tam Phương Tứ Chính đã quét (bản cung, đối cung, 2 tam hợp). */
  chiIndexTamPhuong: number[];
};

/**
 * Tam Phương Tứ Chính của một cung: bản cung + đối cung (+6) + 2 cung tam hợp (+4, +8).
 * Đây là quy ước cố định của Tử Vi, không phụ thuộc lá số.
 */
export function tamPhuongTuChinh(chiIndex: number): number[] {
  return [chiIndex, (chiIndex + 4) % 12, (chiIndex + 6) % 12, (chiIndex + 8) % 12];
}

/**
 * Đếm trung tinh cát/hung trên toàn bộ Tam Phương Tứ Chính của một cung.
 *
 * ⚠️ TUẦN/TRIỆT CHỈ TÍNH TẠI BẢN CUNG, không tính khi nằm ở 3 cung chiếu (anh Công duyệt
 * 26/8/2026). Lý do: Tuần/Triệt là cờ của cung chứ không phải sao đơn, và lá số nào cũng có, luôn
 * phủ 4/12 cung — nếu tính cả Tam Phương thì mỗi lần quét 4 cung gần như chắc chắn dính 1-2 dấu
 * hung "miễn phí", khiến điều kiện đạt 5★ (sạch bóng sao hung) gần như không thể xảy ra.
 *
 * Đo trên 2.400 cung của 200 lá số:
 *   - Tính cả Tam Phương: 1★ 1% · 2★ 48% · 3★ 33% · 4★ 18% · 5★ 0%  ← thang 1-5 mất hẳn mức 5
 *   - Chỉ tính tại bản cung: 1★ 1% · 2★ 40% · 3★ 28% · 4★ 30% · 5★ 2%
 * Cách hiểu này cũng đúng thông lệ Tử Vi: Tuần/Triệt chặn chính cung nó đóng, ảnh hưởng lên cung
 * chiếu nhẹ hơn nhiều, không ngang hàng Kình/Đà.
 */
function demTrungTinh(cungs: CungKetQua[], chiIndex: number): { soCat: number; soHung: number } {
  let soCat = 0;
  let soHung = 0;
  for (const i of tamPhuongTuChinh(chiIndex)) {
    const c = cungs.find((x) => x.chiIndex === i);
    if (!c) continue;

    for (const s of c.phuTinh) {
      if (TRUNG_TINH_CAT.has(s.name)) soCat += 1;
      if (TRUNG_TINH_HUNG.has(s.name)) soHung += 1;
    }
    // Tứ Hoá bám vào sao (cả chính tinh lẫn phụ tinh) chứ không phải sao độc lập.
    for (const s of [...c.chinhTinh, ...c.phuTinh]) {
      if (s.tuHoa === "Lộc" || s.tuHoa === "Quyền" || s.tuHoa === "Khoa") soCat += 1;
      if (s.tuHoa === "Kỵ") soHung += 1;
    }
    if (i === chiIndex) {
      if (c.tuan) soHung += 1;
      if (c.triet) soHung += 1;
    }
  }
  return { soCat, soHung };
}

/** Phân loại chính tinh tại cung thành CAT / HUNG / VCD theo trạng thái Miếu-Vượng-Đắc-Bình-Hãm. */
function phanLoaiChinhTinh(cung: CungKetQua): LoaiChinhTinh {
  if (cung.chinhTinh.length === 0) return "VCD";
  let sang = 0;
  let toi = 0;
  for (const s of cung.chinhTinh) {
    if (TRANG_THAI_SANG.has(s.trangThai)) sang += 1;
    else if (TRANG_THAI_TOI.has(s.trangThai)) toi += 1;
  }
  if (sang > 0 && toi === 0) return "CAT";
  if (toi > 0 && sang === 0) return "HUNG";
  if (sang === 0 && toi === 0) return "VCD"; // toàn "Chưa xác định" — coi như không có chỗ dựa
  // Song tinh lệch (có sáng có tối): bên nào nhiều hơn thì bên đó chủ đạo.
  return toi > sang ? "HUNG" : "CAT";
}

/**
 * Chấm điểm 1 cung theo bảng 8 trường hợp gốc (SPEC-ENGINE-DIEM mục 2).
 * Hàm thuần, không phụ thuộc lá số — tách riêng để unit test trực tiếp bằng số liệu.
 */
export function chamDiemCung(loai: LoaiChinhTinh, soCat: number, soHung: number): number {
  let diem: number;

  if (loai === "CAT") {
    if (soCat > 0 && soHung === 0) diem = 5;        // case 1: rất tốt
    else if (soCat === 0 && soHung > 0) diem = 2;   // case 2: xấu
    else if (soCat > 0 && soHung > 0) diem = 3;     // case 3: lẫn lộn — tinh chỉnh ở dưới
    else diem = 4;                                   // case 4: không gặp trung tinh nào
  } else if (loai === "HUNG") {
    if (soCat > 0 && soHung === 0) diem = 4;        // case 5: được cứu
    else if (soCat === 0 && soHung > 0) diem = 1;   // case 6: rất xấu
    else if (soCat > 0 && soHung > 0) diem = 2;     // case 7: lẫn lộn, thiên xấu
    else diem = 2;                                   // case 8: không gặp trung tinh nào
  } else {
    // VCD không có "sàn" hay "trần" từ chính tinh — hoàn toàn theo trung tinh hội về.
    if (soCat > soHung) diem = 4;
    else if (soHung > soCat) diem = 2;
    else diem = 3;
  }

  // Bước 3 — tinh chỉnh riêng case 3 theo tỉ lệ áp đảo.
  if (diem === 3 && loai === "CAT") {
    if (soCat >= soHung * 2) diem = 4;
    else if (soHung >= soCat * 2) diem = 2;
  }

  return diem;
}

/** Chấm điểm một cung trên lá số thật (gộp đếm trung tinh + áp bảng). */
export function chamDiemCungTrenLaSo(chart: TuViChart, chiIndex: number): ChiTietChamDiem {
  const cung = chart.cungs.find((c) => c.chiIndex === chiIndex);
  if (!cung) throw new Error(`Không tìm thấy cung có chiIndex=${chiIndex}`);
  const loai = phanLoaiChinhTinh(cung);
  const { soCat, soHung } = demTrungTinh(chart.cungs, chiIndex);
  return {
    cungName: cung.cungName,
    chiIndex,
    loaiChinhTinh: loai,
    soCat,
    soHung,
    diem: chamDiemCung(loai, soCat, soHung),
    chiIndexTamPhuong: tamPhuongTuChinh(chiIndex),
  };
}

/** Khoá cung dùng trong kết quả — bỏ dấu, snake_case, khớp schema ở SPEC-ENGINE-DIEM mục 6. */
const KHOA_CUNG: Record<string, string> = {
  "Mệnh": "menh",
  "Phụ Mẫu": "phu_mau",
  "Phúc Đức": "phuc_duc",
  "Điền Trạch": "dien_trach",
  "Quan Lộc": "quan_loc",
  "Nô Bộc": "no_boc",
  "Thiên Di": "thien_di",
  "Tật Ách": "tat_ach",
  "Tài Bạch": "tai_bach",
  "Tử Tức": "tu_tuc",
  "Phu Thê": "phu_the",
  "Huynh Đệ": "huynh_de",
};

export type KetQuaChamDiem = {
  /** Điểm 1-5 theo khoá cung snake_case. */
  diem12Cung: Record<string, number>;
  /** Chi tiết từng cung để hiển thị/giải thích, giữ nguyên tên cung có dấu. */
  chiTiet: ChiTietChamDiem[];
  radar6LinhVuc: Record<string, number>;
};

function trungBinh(...ds: number[]): number {
  const co = ds.filter((n) => Number.isFinite(n));
  if (co.length === 0) return 3;
  return Math.round(co.reduce((a, b) => a + b, 0) / co.length);
}

/** Chấm điểm toàn bộ 12 cung + suy ra radar 6 lĩnh vực (SPEC-ENGINE-DIEM mục 5). */
export function chamDiemLaSo(chart: TuViChart): KetQuaChamDiem {
  const chiTiet = chart.cungs.map((c) => chamDiemCungTrenLaSo(chart, c.chiIndex));
  const diem12Cung: Record<string, number> = {};
  for (const ct of chiTiet) {
    const khoa = KHOA_CUNG[ct.cungName];
    if (khoa) diem12Cung[khoa] = ct.diem;
  }

  const radar6LinhVuc = {
    cong_danh: diem12Cung.quan_loc ?? 3,
    tai_loc: trungBinh(diem12Cung.tai_bach ?? 3, diem12Cung.dien_trach ?? 3),
    tinh_duyen: diem12Cung.phu_the ?? 3,
    suc_khoe: diem12Cung.tat_ach ?? 3,
    gia_dao: trungBinh(diem12Cung.phu_mau ?? 3, diem12Cung.huynh_de ?? 3, diem12Cung.tu_tuc ?? 3),
    quan_he_xa_hoi: diem12Cung.no_boc ?? 3,
  };

  return { diem12Cung, chiTiet, radar6LinhVuc };
}

/**
 * Nhãn chữ cho điểm — dùng chung mọi nơi để Free/Cơ Bản/Nâng Cao không nói lệch nhau.
 *
 * Chữ dùng bám theo đúng giọng của nguồn (case 2 "xấu", case 7 "vừa tốt vừa xấu thiên xấu") và
 * quy tắc an toàn SPEC.md mục 0.8 — cung hung nặng phải diễn đạt "cần đặc biệt cẩn trọng", không
 * phán nặng nề. Cố ý KHÔNG dùng "Kém"/"Rất kém": đo trên 360 cung thì 44% rơi vào mức 2, gọi gần
 * nửa số cung của mọi khách là "Kém" vừa sai giọng tư vấn vừa không đúng bản chất thang điểm này
 * (đây là thang tương đối để vẽ đồ hình, không phải phán quyết tuyệt đối).
 */
export function nhanDiem(diem: number): string {
  if (diem >= 5) return "Rất tốt";
  if (diem === 4) return "Tốt";
  if (diem === 3) return "Cát hung lẫn lộn";
  if (diem === 2) return "Thiên về khó";
  return "Cần đặc biệt cẩn trọng";
}
