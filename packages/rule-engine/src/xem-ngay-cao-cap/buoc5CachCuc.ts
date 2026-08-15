/**
 * XEM NGÀY CAO CẤP — Bước 5: luận cách cục Huyền Không Đại Quái. Toàn bộ là hàm THUẦN so sánh
 * cặp số HKNH/Quái Vận đã có từ Bước 4 — không tra bảng ngoài. Nguồn: tang3-luat-hkdq.md.
 *
 * Ngũ hành theo số HKNH: 1,6=Thủy · 2,7=Hỏa · 3,8=Mộc · 4,9=Kim (Quái Vận thêm 5=Thổ).
 */

export type QuanHeHknh = "nhat_quai_thuan_thanh" | "ha_do" | "hop_thap" | "hop_thap_7_3" | "khong_giao";
export type QuanHeQuaiVan = "dong_quai" | "hop_thap" | "hop_thap_7_3" | "hop_ngu" | "ai_tinh_dien_dao" | "khong_giao";
export type SinhKhac = "sinh_nhap" | "khac_nhap" | "sinh_xuat" | "khac_xuat" | "binh_hoa";
export type NguHanh = "Thủy" | "Hỏa" | "Mộc" | "Kim" | "Thổ";

const HA_DO_CAP: readonly (readonly [number, number])[] = [
  [1, 6],
  [2, 7],
  [3, 8],
  [4, 9],
];

/** 4 cặp Hợp Thập. Cặp 7-3 tách riêng vì nguồn yêu cầu hạn chế (Khảm-Ly không hợp dù tổng = 10). */
function laHopThap(a: number, b: number): boolean {
  return a + b === 10;
}
function laCap73(a: number, b: number): boolean {
  return (a === 7 && b === 3) || (a === 3 && b === 7);
}

export function nguHanhCuaHknh(hknh: number): NguHanh {
  if (hknh === 1 || hknh === 6) return "Thủy";
  if (hknh === 2 || hknh === 7) return "Hỏa";
  if (hknh === 3 || hknh === 8) return "Mộc";
  if (hknh === 4 || hknh === 9) return "Kim";
  if (hknh === 5) return "Thổ";
  throw new Error(`Số HKNH không hợp lệ: ${hknh}`);
}

/** Mùa mà mỗi cặp Hà Đồ vượng — dùng cho tiêu chí "Hà Đồ đúng mùa" khi chấm điểm. */
export const HA_DO_VUONG_MUA: readonly { cap: readonly [number, number]; mua: "Đông" | "Hè" | "Xuân" | "Thu" }[] = [
  { cap: [1, 6], mua: "Đông" },
  { cap: [2, 7], mua: "Hè" },
  { cap: [3, 8], mua: "Xuân" },
  { cap: [4, 9], mua: "Thu" },
];

/**
 * Quan hệ giữa 2 số HKNH, theo thứ tự đẹp dần trong nguồn (a.5 → b → c):
 * Nhất Quái Thuần Thanh (đồng số) > Hà Đồ > Hợp Thập (riêng 7-3 tách ra vì miễn cưỡng).
 */
export function xetQuanHe(hknhA: number, hknhB: number): QuanHeHknh {
  if (hknhA === hknhB) return "nhat_quai_thuan_thanh";
  if (HA_DO_CAP.some(([x, y]) => (x === hknhA && y === hknhB) || (x === hknhB && y === hknhA))) return "ha_do";
  if (laHopThap(hknhA, hknhB)) return laCap73(hknhA, hknhB) ? "hop_thap_7_3" : "hop_thap";
  return "khong_giao";
}

const AI_TINH_DIEN_DAO: readonly (readonly [number, number])[] = [
  [1, 3],
  [2, 4],
  [6, 8],
  [7, 9],
];

/**
 * Quan hệ ở lớp Quái Vận. KHÔNG áp dụng Hà Đồ và KHÔNG xét sinh khắc ngũ hành ở lớp này (c.6).
 * Hợp Ngũ/Thập Ngũ Hợp: tổng = 5 hoặc 15 (chỉ Quái Vận mới có số 5 = Thổ).
 */
export function xetQuanHeQuaiVan(qvA: number, qvB: number): QuanHeQuaiVan {
  if (qvA === qvB) return "dong_quai";
  if (laHopThap(qvA, qvB)) return laCap73(qvA, qvB) ? "hop_thap_7_3" : "hop_thap";
  if (qvA + qvB === 5 || qvA + qvB === 15) return "hop_ngu";
  if (AI_TINH_DIEN_DAO.some(([x, y]) => (x === qvA && y === qvB) || (x === qvB && y === qvA))) return "ai_tinh_dien_dao";
  return "khong_giao";
}

const SINH: Readonly<Record<NguHanh, NguHanh>> = {
  Mộc: "Hỏa",
  Hỏa: "Thổ",
  Thổ: "Kim",
  Kim: "Thủy",
  Thủy: "Mộc",
};
const KHAC: Readonly<Record<NguHanh, NguHanh>> = {
  Mộc: "Thổ",
  Thổ: "Thủy",
  Thủy: "Hỏa",
  Hỏa: "Kim",
  Kim: "Mộc",
};

/**
 * Sinh khắc ngũ hành ở lớp HKNH, LẤY `hknhChu` LÀM CHUẨN (bên "chủ"):
 * - khách sinh chủ → sinh_nhập (tốt) · khách khắc chủ → khắc_nhập (tốt)
 * - chủ sinh khách → sinh_xuất (xấu) · chủ khắc khách → khắc_xuất (xấu)
 *
 * Ai là "chủ" tùy ngữ cảnh (mục e + Phần III nguồn):
 * - Quan hệ nội bộ Tứ Trụ (Ngày với Năm/Tháng/Giờ): trụ NGÀY là chủ.
 * - Quan hệ Ngày ↔ Tọa: TỌA là chủ (Ngày sinh/khắc Tọa mới tốt).
 * - Quan hệ Tọa ↔ Mệnh Chủ: MỆNH CHỦ là chủ (Địa sinh Nhân, hoặc Nhân khắc Địa).
 */
export function xetSinhKhac(hknhChu: number, hknhKhach: number): SinhKhac {
  const chu = nguHanhCuaHknh(hknhChu);
  const khach = nguHanhCuaHknh(hknhKhach);
  if (chu === khach) return "binh_hoa";
  if (SINH[khach] === chu) return "sinh_nhap";
  if (KHAC[khach] === chu) return "khac_nhap";
  if (SINH[chu] === khach) return "sinh_xuat";
  if (KHAC[chu] === khach) return "khac_xuat";
  return "binh_hoa";
}

export function laSinhKhacTot(sk: SinhKhac): boolean {
  return sk === "sinh_nhap" || sk === "khac_nhap";
}

/**
 * "Giao" theo nghĩa Tam Tài (Phần III): đạt bất kỳ mức nào trong thứ tự ưu tiên đồng quái khí →
 * Hợp Thập → Hà Đồ → sinh/khắc đúng chiều. Trả về mô tả mức đạt được, hoặc null nếu không giao.
 *
 * `hknhChuKhiXetSinhKhac`: khi cần fallback sang sinh khắc thì bên nào là "chủ" (xem xetSinhKhac).
 */
export interface KetQuaGiao {
  giaoDuoc: boolean;
  mucDat: QuanHeHknh | SinhKhac;
}

export function xetGiao(hknhA: number, hknhB: number, hknhChuKhiXetSinhKhac: number): KetQuaGiao {
  const qh = xetQuanHe(hknhA, hknhB);
  if (qh !== "khong_giao") return { giaoDuoc: true, mucDat: qh };
  const khach = hknhChuKhiXetSinhKhac === hknhA ? hknhB : hknhA;
  const sk = xetSinhKhac(hknhChuKhiXetSinhKhac, khach);
  return { giaoDuoc: laSinhKhacTot(sk), mucDat: sk };
}

// ---------------------------------------------------------------------------------------------
// 5f — Âm dương Tứ Trụ. Quẻ mang số lẻ = dương, số chẵn = âm (theo quy ước số HKNH của nguồn).
// ---------------------------------------------------------------------------------------------

export function laThuanAmHoacThuanDuong(hknhTuTru: readonly number[]): boolean {
  if (hknhTuTru.length === 0) return false;
  const dauTien = hknhTuTru[0]! % 2;
  return hknhTuTru.every((h) => h % 2 === dauTien);
}

// ---------------------------------------------------------------------------------------------
// 5b (bổ sung) — không được để 2 cặp Hà Đồ KHẮC nhau cùng xuất hiện trong Tứ Trụ:
// cặp 1-6 (Thủy) vs 2-7 (Hỏa); cặp 3-8 (Mộc) vs 4-9 (Kim).
// ---------------------------------------------------------------------------------------------

export function coHaiCapHaDoKhacNhau(hknhTuTru: readonly number[]): boolean {
  const coThuy = hknhTuTru.some((h) => h === 1 || h === 6);
  const coHoa = hknhTuTru.some((h) => h === 2 || h === 7);
  const coMoc = hknhTuTru.some((h) => h === 3 || h === 8);
  const coKim = hknhTuTru.some((h) => h === 4 || h === 9);
  return (coThuy && coHoa) || (coMoc && coKim);
}
