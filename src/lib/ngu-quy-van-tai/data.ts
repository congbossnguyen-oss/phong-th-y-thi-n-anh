/**
 * Dữ liệu gốc "Ngũ Quỷ Vận Tài" — bảng tra 24 sơn do anh Công cung cấp trực tiếp (đã đối chiếu
 * khớp ảnh chụp bảng Excel gốc 4/9/2026, không chỉnh sửa số liệu).
 *
 * Bản chất công thức: 3 yếu tố Hướng Cửa — Giáng Long (vật/thế TĨNH, cao — đá/núi/tượng đá) —
 * Giáng Thủy (vật/thế ĐỘNG, có nước) phối theo chuỗi tương sinh Hỏa → Thổ → Kim:
 *   Hướng Cửa + Giáng Thủy = Phúc Đức (Kim) — khí Kim (tài lộc) nhập nhà qua Cửa.
 *   Hướng Cửa + Giáng Long = Họa Hại (Thổ) — mắt xích trung gian, không phải né tránh.
 *   Giáng Long + Giáng Thủy = Ngũ Quỷ (Hỏa) — sát khí gốc, được "chế" đúng cách qua chuỗi sinh
 *     mới hóa thành tài lộc.
 * PHẢI bố trí ĐỦ CẢ Giáng Long lẫn Giáng Thủy đúng vị trí cùng lúc thì mới trọn vẹn cách cục
 * (chuỗi Hỏa→Thổ→Kim khép kín) — thiếu 1 bên thì công thức chưa đủ.
 *
 * Chính tả 24 sơn CHUẨN HÓA theo `SON_24` trong `src/lib/huyen-khong-phi-tinh/engine.ts` (dùng
 * "Tỵ", bảng gốc viết "Tị") để tra cứu chéo sang engine Phi Tinh không bị lệch khoá.
 */

export type MucTieuNguQuyVanTai = "phuc-duc" | "hoa-hai" | "ngu-quy";

export interface KetQuaPhoiNguQuyVanTai {
  mucTieu: MucTieuNguQuyVanTai;
  tenMucTieu: string;
  hanh: "Kim" | "Thổ" | "Hỏa";
  ynghia: string;
}

/** Bảng tra: Hướng Cửa (24 sơn) -> {Giáng Thủy (Phúc Đức), Giáng Long (Họa Hại)}. */
export const BANG_TRA_HUONG_CUA: Record<string, { giangThuy: readonly string[]; giangLong: readonly string[] }> = {
  "Nhâm": { giangThuy: ["Thân", "Tý", "Quý", "Thìn"], giangLong: ["Cấn", "Bính"] },
  "Tý":   { giangThuy: ["Dần", "Ngọ", "Tuất", "Nhâm"], giangLong: ["Sửu", "Tỵ", "Đinh", "Dậu"] },
  "Quý":  { giangThuy: ["Dần", "Ngọ", "Tuất", "Nhâm"], giangLong: ["Sửu", "Tỵ", "Đinh", "Dậu"] },
  "Sửu":  { giangThuy: ["Cấn", "Bính"], giangLong: ["Thân", "Tý", "Quý", "Thìn"] },
  "Cấn":  { giangThuy: ["Sửu", "Tỵ", "Đinh", "Dậu"], giangLong: ["Dần", "Ngọ", "Tuất", "Nhâm"] },
  "Dần":  { giangThuy: ["Thân", "Tý", "Quý", "Thìn"], giangLong: ["Cấn", "Bính"] },
  "Giáp": { giangThuy: ["Ất", "Khôn"], giangLong: ["Tốn", "Tân"] },
  "Mão":  { giangThuy: ["Tốn", "Tân"], giangLong: ["Ất", "Khôn"] },
  "Ất":   { giangThuy: ["Giáp", "Càn"], giangLong: ["Mão", "Mùi", "Canh", "Hợi"] },
  "Thìn": { giangThuy: ["Dần", "Ngọ", "Tuất", "Nhâm"], giangLong: ["Sửu", "Tỵ", "Đinh", "Dậu"] },
  "Tốn":  { giangThuy: ["Mão", "Mùi", "Canh", "Hợi"], giangLong: ["Giáp", "Càn"] },
  "Tỵ":   { giangThuy: ["Cấn", "Bính"], giangLong: ["Thân", "Tý", "Quý", "Thìn"] },
  "Bính": { giangThuy: ["Sửu", "Tỵ", "Đinh", "Dậu"], giangLong: ["Dần", "Ngọ", "Tuất", "Nhâm"] },
  "Ngọ":  { giangThuy: ["Thân", "Tý", "Quý", "Thìn"], giangLong: ["Cấn", "Bính"] },
  "Đinh": { giangThuy: ["Cấn", "Bính"], giangLong: ["Thân", "Tý", "Quý", "Thìn"] },
  "Mùi":  { giangThuy: ["Tốn", "Tân"], giangLong: ["Ất", "Khôn"] },
  "Khôn": { giangThuy: ["Giáp", "Càn"], giangLong: ["Mão", "Mùi", "Canh", "Hợi"] },
  "Thân": { giangThuy: ["Dần", "Ngọ", "Tuất", "Nhâm"], giangLong: ["Sửu", "Tỵ", "Đinh", "Dậu"] },
  "Canh": { giangThuy: ["Tốn", "Tân"], giangLong: ["Ất", "Khôn"] },
  "Dậu":  { giangThuy: ["Cấn", "Bính"], giangLong: ["Thân", "Tý", "Quý", "Thìn"] },
  "Tân":  { giangThuy: ["Mão", "Mùi", "Canh", "Hợi"], giangLong: ["Giáp", "Càn"] },
  "Tuất": { giangThuy: ["Thân", "Tý", "Quý", "Thìn"], giangLong: ["Cấn", "Bính"] },
  "Càn":  { giangThuy: ["Ất", "Khôn"], giangLong: ["Tốn", "Tân"] },
  "Hợi":  { giangThuy: ["Tốn", "Tân"], giangLong: ["Ất", "Khôn"] },
};

/** Gợi ý vật phẩm/thế đất bố trí thực tế — đúng phạm vi anh Công liệt kê, không tự thêm. */
export const VAT_PHAM_GIANG_LONG = [
  "Núi/đồi thật (ngoài nhà)",
  "Hòn non bộ KHÔNG có nước",
  "Đá thạch anh",
  "Tượng đá (sư tử đá, Quan Công đá, Tam Đa đá, Tỳ Hưu đá)",
  "Tường/vách/tủ cao",
  "Cột đá",
] as const;

export const VAT_PHAM_GIANG_THUY = [
  "Hồ cá, bể cá",
  "Sông suối tự nhiên",
  "Hòn non bộ CÓ nước chảy róc rách",
  "Phong thủy luân (thủy luân xoay)",
  "Đài phun nước",
  "Thác nước mini",
] as const;

export function laySonHopLe(): string[] {
  return Object.keys(BANG_TRA_HUONG_CUA);
}
