/**
 * BẢNG MASTER 64 QUẺ ĐẠI QUÁI — vòng 64 quẻ phối độ số la bàn, Quái khí (HKNH), Quái vận, Can Chi.
 *
 * Nguồn: "Bảng 64 Quẻ Đại Quái — Thiên Anh" do chủ dự án (Công) cung cấp 2026-08-15, đọc từ la
 * kinh 64 quẻ Tam Nguyên. 360° chia đều 64 quẻ, mỗi quẻ 5.625°, mốc 0° là quẻ Phục.
 *
 * ĐÃ KIỂM CHỨNG CHÉO 4 LỚP — khớp 100%, không sai lệch dòng nào:
 *
 * 1. Khớp toàn bộ 5 bài thực hành trong `vi-du-thuc-hanh.md`:
 *    - Bài 4 (mạnh nhất, có CẢ độ số lẫn quẻ): tọa Càn 318° → rơi đúng quẻ Bĩ (315-320.625) = 9/9 ✓
 *    - Bài 1: tọa Ất 6/9 → Tổn (95.625-101.25) ✓ | Bài 3: tọa Ất 7/8 → Tiết (101.25-106.875) ✓
 *      (cùng tên "tọa Ất" nhưng khác độ số → khác quẻ, đúng bản chất hệ Đại Quái)
 *    - Bài 2: tọa Đinh 8/9 → Hằng (196.875-202.5) ✓ | Bài 5: tọa Canh, Hoán 2/6 (247.5-253.125) ✓
 * 2. Quái khí/Quái vận của cả 64 dòng khớp 100% với `bang60GiapTy.ts` (nguồn độc lập: sách
 *    "Trạch Nhật Cao Cấp" — Biểu Đồ Lục Thập Giáp Tý Phối Quẻ).
 * 3. Can Chi của cả 64 dòng khớp 100% với ánh xạ Can Chi → quẻ của `bang60GiapTy.ts`, kể cả 4
 *    trường hợp 1 Can Chi mang 2 quẻ (Giáp Tý: Phục+Khôn · Canh Dần: Ly+Cách · Giáp Ngọ: Càn+Cấu
 *    · Canh Thân: Khảm+Mông).
 * 4. Quy luật quẻ thác: quẻ thứ N và N+32 đối nhau đúng 180°, thỏa "HKNH hợp thập (=10) + Quái
 *    Vận đồng" (VD #1 Phục 1/8 ↔ #33 Cấu 9/8; #14 Ly 3/1 ↔ #46 Khảm 7/1) — kiểm tự động trong test.
 *
 * ⚠️ Không trộn `Quái khí / Quái vận` với `Thượng quái / Hạ quái` — đây là 2 hệ khác nhau.
 *
 * Nhờ bảng này, quẻ Tọa/Hướng suy TRỰC TIẾP từ độ số la bàn thực đo — người dùng không phải tự
 * nhập HKNH/Quái Vận, và hệ thống không bao giờ suy đoán từ tên sơn (mỗi sơn 15° chứa 2-3 quẻ).
 */
import type { Data } from "@thien-anh/calendar-core";

type Can = Data.Can;
type Chi = Data.Chi;

/** Số quẻ trên vòng tròn và độ rộng mỗi quẻ. */
export const SO_QUE = 64;
export const DO_RONG_MOI_QUE = 360 / SO_QUE; // 5.625°

export interface QueMaster {
  /** Tên ngắn như đọc trên la kinh, VD "Tổn". */
  tenNgan: string;
  /** Quái khí = Huyền Không Ngũ Hành (1-4, 6-9 — không có 5). */
  hknh: number;
  /** Quái vận (1-9). */
  quaiVan: number;
  can: Can;
  chi: Chi;
}

/**
 * 64 quẻ theo thứ tự vòng la bàn, bắt đầu từ 0° (chính Bắc). Quẻ thứ i (0-based) phủ khoảng
 * [i * 5.625°, (i+1) * 5.625°).
 */
export const BANG_64_QUE_MASTER: readonly QueMaster[] = [
  { tenNgan: "Phục", hknh: 1, quaiVan: 8, can: "Giáp", chi: "Tý" },
  { tenNgan: "Di", hknh: 6, quaiVan: 3, can: "Bính", chi: "Tý" },
  { tenNgan: "Truân", hknh: 7, quaiVan: 4, can: "Mậu", chi: "Tý" },
  { tenNgan: "Ích", hknh: 2, quaiVan: 9, can: "Canh", chi: "Tý" },
  { tenNgan: "Chấn", hknh: 8, quaiVan: 1, can: "Nhâm", chi: "Tý" },
  { tenNgan: "Phệ Hạp", hknh: 3, quaiVan: 6, can: "Ất", chi: "Sửu" },
  { tenNgan: "Tùy", hknh: 4, quaiVan: 7, can: "Đinh", chi: "Sửu" },
  { tenNgan: "Vô Vọng", hknh: 9, quaiVan: 2, can: "Kỷ", chi: "Sửu" },
  { tenNgan: "Minh Di", hknh: 1, quaiVan: 3, can: "Tân", chi: "Sửu" },
  { tenNgan: "Bí", hknh: 6, quaiVan: 8, can: "Quý", chi: "Sửu" },
  { tenNgan: "Ký Tế", hknh: 7, quaiVan: 9, can: "Giáp", chi: "Dần" },
  { tenNgan: "Gia Nhân", hknh: 2, quaiVan: 4, can: "Bính", chi: "Dần" },
  { tenNgan: "Phong", hknh: 8, quaiVan: 6, can: "Mậu", chi: "Dần" },
  { tenNgan: "Ly", hknh: 3, quaiVan: 1, can: "Canh", chi: "Dần" },
  { tenNgan: "Cách", hknh: 4, quaiVan: 2, can: "Canh", chi: "Dần" },
  { tenNgan: "Đồng Nhân", hknh: 9, quaiVan: 7, can: "Nhâm", chi: "Dần" },
  { tenNgan: "Lâm", hknh: 1, quaiVan: 4, can: "Ất", chi: "Mão" },
  { tenNgan: "Tổn", hknh: 6, quaiVan: 9, can: "Đinh", chi: "Mão" },
  { tenNgan: "Tiết", hknh: 7, quaiVan: 8, can: "Kỷ", chi: "Mão" },
  { tenNgan: "Trung Phu", hknh: 2, quaiVan: 3, can: "Tân", chi: "Mão" },
  { tenNgan: "Quy Muội", hknh: 8, quaiVan: 7, can: "Quý", chi: "Mão" },
  { tenNgan: "Khuê", hknh: 3, quaiVan: 2, can: "Giáp", chi: "Thìn" },
  { tenNgan: "Đoài", hknh: 4, quaiVan: 1, can: "Bính", chi: "Thìn" },
  { tenNgan: "Lý", hknh: 9, quaiVan: 6, can: "Mậu", chi: "Thìn" },
  { tenNgan: "Thái", hknh: 1, quaiVan: 9, can: "Canh", chi: "Thìn" },
  { tenNgan: "Đại Súc", hknh: 6, quaiVan: 4, can: "Nhâm", chi: "Thìn" },
  { tenNgan: "Nhu", hknh: 7, quaiVan: 3, can: "Ất", chi: "Tỵ" },
  { tenNgan: "Tiểu Súc", hknh: 2, quaiVan: 8, can: "Đinh", chi: "Tỵ" },
  { tenNgan: "Đại Tráng", hknh: 8, quaiVan: 2, can: "Kỷ", chi: "Tỵ" },
  { tenNgan: "Đại Hữu", hknh: 3, quaiVan: 7, can: "Tân", chi: "Tỵ" },
  { tenNgan: "Quải", hknh: 4, quaiVan: 6, can: "Quý", chi: "Tỵ" },
  { tenNgan: "Càn", hknh: 9, quaiVan: 1, can: "Giáp", chi: "Ngọ" },
  { tenNgan: "Cấu", hknh: 9, quaiVan: 8, can: "Giáp", chi: "Ngọ" },
  { tenNgan: "Đại Quá", hknh: 4, quaiVan: 3, can: "Bính", chi: "Ngọ" },
  { tenNgan: "Đỉnh", hknh: 3, quaiVan: 4, can: "Mậu", chi: "Ngọ" },
  { tenNgan: "Hằng", hknh: 8, quaiVan: 9, can: "Canh", chi: "Ngọ" },
  { tenNgan: "Tốn", hknh: 2, quaiVan: 1, can: "Nhâm", chi: "Ngọ" },
  { tenNgan: "Tỉnh", hknh: 7, quaiVan: 6, can: "Ất", chi: "Mùi" },
  { tenNgan: "Cổ", hknh: 6, quaiVan: 7, can: "Đinh", chi: "Mùi" },
  { tenNgan: "Thăng", hknh: 1, quaiVan: 2, can: "Kỷ", chi: "Mùi" },
  { tenNgan: "Tụng", hknh: 9, quaiVan: 3, can: "Tân", chi: "Mùi" },
  { tenNgan: "Khốn", hknh: 4, quaiVan: 8, can: "Quý", chi: "Mùi" },
  { tenNgan: "Vị Tế", hknh: 3, quaiVan: 9, can: "Giáp", chi: "Thân" },
  { tenNgan: "Giải", hknh: 8, quaiVan: 4, can: "Bính", chi: "Thân" },
  { tenNgan: "Hoán", hknh: 2, quaiVan: 6, can: "Mậu", chi: "Thân" },
  { tenNgan: "Khảm", hknh: 7, quaiVan: 1, can: "Canh", chi: "Thân" },
  { tenNgan: "Mông", hknh: 6, quaiVan: 2, can: "Canh", chi: "Thân" },
  { tenNgan: "Sư", hknh: 1, quaiVan: 7, can: "Nhâm", chi: "Thân" },
  { tenNgan: "Độn", hknh: 9, quaiVan: 4, can: "Ất", chi: "Dậu" },
  { tenNgan: "Hàm", hknh: 4, quaiVan: 9, can: "Đinh", chi: "Dậu" },
  { tenNgan: "Lữ", hknh: 3, quaiVan: 8, can: "Kỷ", chi: "Dậu" },
  { tenNgan: "Tiểu Quá", hknh: 8, quaiVan: 3, can: "Tân", chi: "Dậu" },
  { tenNgan: "Tiệm", hknh: 2, quaiVan: 7, can: "Quý", chi: "Dậu" },
  { tenNgan: "Kiển", hknh: 7, quaiVan: 2, can: "Giáp", chi: "Tuất" },
  { tenNgan: "Cấn", hknh: 6, quaiVan: 1, can: "Bính", chi: "Tuất" },
  { tenNgan: "Khiêm", hknh: 1, quaiVan: 6, can: "Mậu", chi: "Tuất" },
  { tenNgan: "Bĩ", hknh: 9, quaiVan: 9, can: "Canh", chi: "Tuất" },
  { tenNgan: "Tụy", hknh: 4, quaiVan: 4, can: "Nhâm", chi: "Tuất" },
  { tenNgan: "Tấn", hknh: 3, quaiVan: 3, can: "Ất", chi: "Hợi" },
  { tenNgan: "Dự", hknh: 8, quaiVan: 8, can: "Đinh", chi: "Hợi" },
  { tenNgan: "Quan", hknh: 2, quaiVan: 2, can: "Kỷ", chi: "Hợi" },
  { tenNgan: "Tỷ", hknh: 7, quaiVan: 7, can: "Tân", chi: "Hợi" },
  { tenNgan: "Bác", hknh: 6, quaiVan: 6, can: "Quý", chi: "Hợi" },
  { tenNgan: "Khôn", hknh: 1, quaiVan: 1, can: "Giáp", chi: "Tý" },
];

/** Danh sách tên quẻ theo thứ tự vòng — tiện cho các chỗ chỉ cần tên. */
export const VONG_64_QUE: readonly string[] = BANG_64_QUE_MASTER.map((q) => q.tenNgan);

/**
 * Tên ngắn (trên la kinh) → tên đầy đủ trong `bang60GiapTy.ts`. Bảng 60 Giáp Tý ghi tên đầy đủ
 * kiểu "Sơn Trạch Tổn", la kinh ghi ngắn "Tổn" — cần cầu nối khi tra chéo 2 bảng.
 */
export const TEN_NGAN_SANG_TEN_DAY_DU: Readonly<Record<string, string>> = {
  Phục: "Địa Lôi Phục",
  Di: "Sơn Lôi Di",
  Truân: "Thủy Lôi Truân",
  Ích: "Phong Lôi Ích",
  Chấn: "Lôi Vi Chấn",
  "Phệ Hạp": "Hỏa Lôi Phệ Hạp",
  Tùy: "Trạch Lôi Tùy",
  "Vô Vọng": "Thiên Lôi Vô Vọng",
  "Minh Di": "Địa Hỏa Minh Di",
  Bí: "Sơn Hỏa Bí",
  "Ký Tế": "Thủy Hỏa Ký Tế",
  "Gia Nhân": "Phong Hỏa Gia Nhân",
  Phong: "Lôi Hỏa Phong",
  Ly: "Ly Vi Hỏa",
  Cách: "Trạch Hỏa Cách",
  "Đồng Nhân": "Thiên Hỏa Đồng Nhân",
  Lâm: "Địa Trạch Lâm",
  Tổn: "Sơn Trạch Tổn",
  Tiết: "Thủy Trạch Tiết",
  "Trung Phu": "Phong Trạch Trung Phu",
  "Quy Muội": "Lôi Trạch Quy Muội",
  Khuê: "Hỏa Trạch Khuê",
  Đoài: "Đoài Vi Trạch",
  Lý: "Thiên Trạch Lý",
  Thái: "Địa Thiên Thái",
  "Đại Súc": "Sơn Thiên Đại Súc",
  Nhu: "Thủy Thiên Nhu",
  "Tiểu Súc": "Phong Thiên Tiểu Súc",
  "Đại Tráng": "Lôi Thiên Đại Tráng",
  "Đại Hữu": "Hỏa Thiên Đại Hữu",
  Quải: "Trạch Thiên Quải",
  Càn: "Càn Vi Thiên",
  Cấu: "Thiên Phong Cấu",
  "Đại Quá": "Trạch Phong Đại Quá",
  Đỉnh: "Hỏa Phong Đỉnh",
  Hằng: "Lôi Phong Hằng",
  Tốn: "Tốn Vi Phong",
  Tỉnh: "Thủy Phong Tỉnh",
  Cổ: "Sơn Phong Cổ",
  Thăng: "Địa Phong Thăng",
  Tụng: "Thiên Thủy Tụng",
  Khốn: "Trạch Thủy Khốn",
  "Vị Tế": "Hỏa Thủy Vị Tế",
  Giải: "Lôi Thủy Giải",
  Hoán: "Phong Thủy Hoán",
  Khảm: "Khảm Vi Thủy",
  Mông: "Sơn Thủy Mông",
  Sư: "Địa Thủy Sư",
  Độn: "Thiên Sơn Độn",
  Hàm: "Trạch Sơn Hàm",
  Lữ: "Hỏa Sơn Lữ",
  "Tiểu Quá": "Lôi Sơn Tiểu Quá",
  Tiệm: "Phong Sơn Tiệm",
  Kiển: "Thủy Sơn Kiển",
  Cấn: "Cấn Vi Sơn",
  Khiêm: "Địa Sơn Khiêm",
  Bĩ: "Thiên Địa Bĩ",
  Tụy: "Trạch Địa Tụy",
  Tấn: "Hỏa Địa Tấn",
  Dự: "Lôi Địa Dự",
  Quan: "Phong Địa Quan",
  Tỷ: "Thủy Địa Tỷ",
  Bác: "Sơn Địa Bác",
  Khôn: "Địa Vi Khôn",
};

export interface QueTheoDoSo extends QueMaster {
  /** Tên đầy đủ khớp `bang60GiapTy.ts`, VD "Sơn Trạch Tổn". */
  tenDayDu: string;
  /** Thứ tự quẻ trên vòng, 1-64. */
  thuTu: number;
  doBatDau: number;
  doKetThuc: number;
}

function chuanHoaDo(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Xác định quẻ theo độ số la bàn thực đo. Nhận mọi số thực (tự chuẩn hóa về 0-359.99), nên
 * 360°/-5° đều hợp lệ.
 */
export function queTuDoSo(doSo: number): QueTheoDoSo {
  if (!Number.isFinite(doSo)) {
    throw new Error(`Độ số la bàn không hợp lệ: ${doSo}`);
  }
  const d = chuanHoaDo(doSo);
  const idx = Math.floor(d / DO_RONG_MOI_QUE);
  const master = BANG_64_QUE_MASTER[idx]!;
  const tenDayDu = TEN_NGAN_SANG_TEN_DAY_DU[master.tenNgan];
  if (!tenDayDu) {
    throw new Error(`Thiếu ánh xạ tên đầy đủ cho quẻ "${master.tenNgan}".`);
  }
  return {
    ...master,
    tenDayDu,
    thuTu: idx + 1,
    doBatDau: idx * DO_RONG_MOI_QUE,
    doKetThuc: (idx + 1) * DO_RONG_MOI_QUE,
  };
}
