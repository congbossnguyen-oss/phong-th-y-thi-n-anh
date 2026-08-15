/**
 * Bảng 60 Giáp Tý phối 64 quẻ — bảng tra lõi của Huyền Không Đại Quái (Bước 4). Quy mọi trụ
 * (Năm/Tháng/Ngày/Giờ) + tọa nhà + năm sinh mệnh chủ về cặp số HKNH/Quái Vận trước khi luận cách
 * cục. Nguồn: skill xem-ngay-cao-cap/references/bang-60-giap-ty-64-que.md ("Biểu Đồ Lục Thập
 * Giáp Tý Phối Quẻ", sách Trạch Nhật Cao Cấp — đã phục hồi OCR + kiểm chứng, 1 lỗi OCR đã sửa:
 * Đinh Dậu HKNH=4, không phải 1 như bản OCR gốc).
 *
 * 4 Can Chi (Giáp Tý, Giáp Ngọ, Canh Dần, Canh Thân) mang 2 quẻ hợp lệ — trả về mảng 2 phần tử,
 * tầng gọi phải tự chọn quẻ phù hợp theo ngữ cảnh (độ số la bàn thực tế nếu là tọa nhà; quẻ tạo
 * cách cục hợp lý nếu là trụ thời gian) và ghi rõ đã chọn quẻ nào.
 */
import type { Data } from "@thien-anh/calendar-core";
import type { CungBatQuai } from "./sonBatQuai.js";

type Can = Data.Can;
type Chi = Data.Chi;

export interface QueHknhQuaiVan {
  que: string;
  hknh: number;
  quaiVan: number;
}

const RAW: readonly [Can, Chi, string, number, number][] = [
  ["Giáp", "Tý", "Địa Lôi Phục", 1, 8],
  ["Giáp", "Tý", "Địa Vi Khôn", 1, 1],
  ["Bính", "Tý", "Sơn Lôi Di", 6, 3],
  ["Mậu", "Tý", "Thủy Lôi Truân", 7, 4],
  ["Canh", "Tý", "Phong Lôi Ích", 2, 9],
  ["Nhâm", "Tý", "Lôi Vi Chấn", 8, 1],
  ["Ất", "Sửu", "Hỏa Lôi Phệ Hạp", 3, 6],
  ["Đinh", "Sửu", "Trạch Lôi Tùy", 4, 7],
  ["Kỷ", "Sửu", "Thiên Lôi Vô Vọng", 9, 2],
  ["Tân", "Sửu", "Địa Hỏa Minh Di", 1, 3],
  ["Quý", "Sửu", "Sơn Hỏa Bí", 6, 8],
  ["Giáp", "Dần", "Thủy Hỏa Ký Tế", 7, 9],
  ["Bính", "Dần", "Phong Hỏa Gia Nhân", 2, 4],
  ["Mậu", "Dần", "Lôi Hỏa Phong", 8, 6],
  ["Canh", "Dần", "Trạch Hỏa Cách", 4, 2],
  ["Canh", "Dần", "Ly Vi Hỏa", 3, 1],
  ["Nhâm", "Dần", "Thiên Hỏa Đồng Nhân", 9, 7],
  ["Ất", "Mão", "Địa Trạch Lâm", 1, 4],
  ["Đinh", "Mão", "Sơn Trạch Tổn", 6, 9],
  ["Kỷ", "Mão", "Thủy Trạch Tiết", 7, 8],
  ["Tân", "Mão", "Phong Trạch Trung Phu", 2, 3],
  ["Quý", "Mão", "Lôi Trạch Quy Muội", 8, 7],
  ["Giáp", "Thìn", "Hỏa Trạch Khuê", 3, 2],
  ["Bính", "Thìn", "Đoài Vi Trạch", 4, 1],
  ["Mậu", "Thìn", "Thiên Trạch Lý", 9, 6],
  ["Canh", "Thìn", "Địa Thiên Thái", 1, 9],
  ["Nhâm", "Thìn", "Sơn Thiên Đại Súc", 6, 4],
  ["Ất", "Tỵ", "Thủy Thiên Nhu", 7, 3],
  ["Đinh", "Tỵ", "Phong Thiên Tiểu Súc", 2, 8],
  ["Kỷ", "Tỵ", "Lôi Thiên Đại Tráng", 8, 2],
  ["Tân", "Tỵ", "Hỏa Thiên Đại Hữu", 3, 7],
  ["Quý", "Tỵ", "Trạch Thiên Quải", 4, 6],
  ["Giáp", "Ngọ", "Thiên Phong Cấu", 9, 8],
  ["Giáp", "Ngọ", "Càn Vi Thiên", 9, 1],
  ["Bính", "Ngọ", "Trạch Phong Đại Quá", 4, 3],
  ["Mậu", "Ngọ", "Hỏa Phong Đỉnh", 3, 4],
  ["Canh", "Ngọ", "Lôi Phong Hằng", 8, 9],
  ["Nhâm", "Ngọ", "Tốn Vi Phong", 2, 1],
  ["Ất", "Mùi", "Thủy Phong Tỉnh", 7, 6],
  ["Đinh", "Mùi", "Sơn Phong Cổ", 6, 7],
  ["Kỷ", "Mùi", "Địa Phong Thăng", 1, 2],
  ["Tân", "Mùi", "Thiên Thủy Tụng", 9, 3],
  ["Quý", "Mùi", "Trạch Thủy Khốn", 4, 8],
  ["Giáp", "Thân", "Hỏa Thủy Vị Tế", 3, 9],
  ["Bính", "Thân", "Lôi Thủy Giải", 8, 4],
  ["Mậu", "Thân", "Phong Thủy Hoán", 2, 6],
  ["Canh", "Thân", "Sơn Thủy Mông", 6, 2],
  ["Canh", "Thân", "Khảm Vi Thủy", 7, 1],
  ["Nhâm", "Thân", "Địa Thủy Sư", 1, 7],
  ["Ất", "Dậu", "Thiên Sơn Độn", 9, 4],
  ["Đinh", "Dậu", "Trạch Sơn Hàm", 4, 9],
  ["Kỷ", "Dậu", "Hỏa Sơn Lữ", 3, 8],
  ["Tân", "Dậu", "Lôi Sơn Tiểu Quá", 8, 3],
  ["Quý", "Dậu", "Phong Sơn Tiệm", 2, 7],
  ["Giáp", "Tuất", "Thủy Sơn Kiển", 7, 2],
  ["Bính", "Tuất", "Cấn Vi Sơn", 6, 1],
  ["Mậu", "Tuất", "Địa Sơn Khiêm", 1, 6],
  ["Canh", "Tuất", "Thiên Địa Bĩ", 9, 9],
  ["Nhâm", "Tuất", "Trạch Địa Tụy", 4, 4],
  ["Ất", "Hợi", "Hỏa Địa Tấn", 3, 3],
  ["Đinh", "Hợi", "Lôi Địa Dự", 8, 8],
  ["Kỷ", "Hợi", "Phong Địa Quan", 2, 2],
  ["Tân", "Hợi", "Thủy Địa Tỷ", 7, 7],
  ["Quý", "Hợi", "Sơn Địa Bác", 6, 6],
];

const TABLE = new Map<string, QueHknhQuaiVan[]>();
for (const [can, chi, que, hknh, quaiVan] of RAW) {
  const key = `${can} ${chi}`;
  const list = TABLE.get(key) ?? [];
  list.push({ que, hknh, quaiVan });
  TABLE.set(key, list);
}

/** 60 Can Chi này chỉ có 1 quẻ hợp lệ (không thuộc nhóm 4 Can Chi mang 2 quẻ). */
export function traCanChi(can: Can, chi: Chi): readonly QueHknhQuaiVan[] {
  const ketQua = TABLE.get(`${can} ${chi}`);
  if (!ketQua) throw new Error(`Không tìm thấy Can Chi ${can} ${chi} trong bảng 60 Giáp Tý.`);
  return ketQua;
}

/** Tra HKNH/Quái Vận theo TÊN QUẺ đầy đủ (VD "Sơn Trạch Tổn"). Dùng cho luồng quy độ số la bàn →
 * quẻ (`bang64QueDoSo.ts`) → cặp số, thay cho việc bắt người dùng tự nhập HKNH/Quái Vận. */
const TABLE_THEO_TEN_QUE = new Map<string, QueHknhQuaiVan>();
for (const [, , que, hknh, quaiVan] of RAW) {
  TABLE_THEO_TEN_QUE.set(que, { que, hknh, quaiVan });
}

export function traTheoTenQue(tenQue: string): QueHknhQuaiVan {
  const ketQua = TABLE_THEO_TEN_QUE.get(tenQue);
  if (!ketQua) throw new Error(`Không tìm thấy quẻ "${tenQue}" trong bảng 60 Giáp Tý.`);
  return ketQua;
}

/** Bát Thuần quẻ theo 8 cung Bát Quái — trích trực tiếp từ bảng trên, dùng để quy Tọa nhà → quẻ. */
export const BAT_THUAN_THEO_CUNG: Readonly<Record<CungBatQuai, QueHknhQuaiVan>> = {
  Khảm: { que: "Khảm Vi Thủy", hknh: 7, quaiVan: 1 },
  Cấn: { que: "Cấn Vi Sơn", hknh: 6, quaiVan: 1 },
  Chấn: { que: "Lôi Vi Chấn", hknh: 8, quaiVan: 1 },
  Tốn: { que: "Tốn Vi Phong", hknh: 2, quaiVan: 1 },
  Ly: { que: "Ly Vi Hỏa", hknh: 3, quaiVan: 1 },
  Khôn: { que: "Địa Vi Khôn", hknh: 1, quaiVan: 1 },
  Đoài: { que: "Đoài Vi Trạch", hknh: 4, quaiVan: 1 },
  Càn: { que: "Càn Vi Thiên", hknh: 9, quaiVan: 1 },
};
