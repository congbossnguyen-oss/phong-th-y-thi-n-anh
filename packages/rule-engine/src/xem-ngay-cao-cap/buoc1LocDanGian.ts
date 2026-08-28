/**
 * BƯỚC 1 — Lọc thô thần sát dân gian THEO NGÀY (bổ sung 28/8/2026).
 *
 * ⚠️ LÝ DO CÓ FILE NÀY: module Xem Ngày Cao Cấp trước đây CHỈ chạy Bước 2-6 (Huyền Không Đại Quái
 * thuần), chủ đích bỏ Bước 1 (xem comment cũ trong `xemNgayCaoCap.ts`). Anh Công tự kiểm chứng độc
 * lập 1 lô ngày do hệ thống đề xuất và phát hiện: ngày phạm Sát Chủ ("chủ chầu Diêm Vương") và ngày
 * Trực Mãn (Hung) vẫn lọt vào danh sách "Lý tưởng" vì không có lớp nào chặn. Nguồn:
 * `references/tang1-loc-than-sat-hung.md` mục A + D.
 *
 * Cờ `apDungLocDanGian` (mặc định BẬT — xem SKILL.md mục Bước 0 #8): khi TẮT, các hàm trong file
 * này KHÔNG được gọi cho phần "Dân gian"; phần "Luôn bắt buộc" (Trực theo việc, Lục Xung) vẫn chạy
 * ở nơi khác (`xemNgayCaoCap.ts`), không phụ thuộc cờ này.
 *
 * ⚠️ Kim Lâu / Hoang Ốc / Tam Tai KHÔNG nằm trong file này — 3 mục đó tính theo TUỔI GIA CHỦ × NĂM
 * dự kiến (không theo từng ngày cụ thể như các mục dưới đây), và Kim Lâu/Hoang Ốc đang có mâu thuẫn
 * công thức với module có sẵn `hoang-oc-kim-lau/` — CẦN anh Công xác nhận trước khi code (xem báo
 * cáo trong hội thoại 28/8/2026), không tự ý chọn 1 trong 2 nguồn.
 */

export interface KetQuaLocDanGian {
  phamTamNuong: boolean;
  phamNguyetKy: boolean;
  phamNguyetTan: boolean;
  phamTuLy: boolean;
  phamTuTuyet: boolean;
  phamKimThanThatSat: boolean;
  phamSatChuDuong: boolean;
  phamSatChuAm: boolean;
  phamSatChuTheoMua: boolean;
  phamThoTu: boolean;
  lyDo: string[];
}

// ── A. Tam Nương / Nguyệt Kỵ (theo ngày Âm Lịch) ────────────────────────────────────────────────
// Nguồn: tang1-loc-than-sat-hung.md mục A.
const NGAY_TAM_NUONG = [3, 7, 13, 18, 22, 27];
const NGAY_NGUYET_KY = [5, 14, 23];

export function phamTamNuong(ngayAL: number): boolean {
  return NGAY_TAM_NUONG.includes(ngayAL);
}

export function phamNguyetKy(ngayAL: number): boolean {
  return NGAY_NGUYET_KY.includes(ngayAL);
}

// ── Kim Thần Thất Sát (theo Can Năm + Chi Ngày) — KHÔNG hóa giải được ───────────────────────────
const KIM_THAN_THAT_SAT: Record<string, readonly string[]> = {
  "Giáp": ["Ngọ", "Mùi"], "Kỷ": ["Ngọ", "Mùi"],
  "Ất": ["Thìn", "Tỵ"], "Canh": ["Thìn", "Tỵ"],
  "Bính": ["Tý", "Sửu", "Dần", "Mão"], "Tân": ["Tý", "Sửu", "Dần", "Mão"],
  "Đinh": ["Tuất", "Hợi"], "Nhâm": ["Tuất", "Hợi"],
  "Mậu": ["Thân", "Dậu"], "Quý": ["Thân", "Dậu"],
};

export function phamKimThanThatSat(canNam: string, chiNgay: string): boolean {
  return (KIM_THAN_THAT_SAT[canNam] ?? []).includes(chiNgay);
}

// ── Sát Chủ Dương/Âm/theo mùa (theo tháng Âm Lịch, và theo mùa Tiết Khí cho "theo mùa") ─────────
// ⚠️ Cố ý KHÔNG có key 10 — nguồn không nêu Sát Chủ Dương tháng 10 (xem ghi chú ở traSatChuDuong).
const SAT_CHU_DUONG: Record<number, string> = {
  1: "Tý", 2: "Sửu", 3: "Sửu", 4: "Tuất", 5: "Thìn", 6: "Thìn",
  7: "Sửu", 8: "Thìn", 9: "Sửu", 11: "Mùi", 12: "Thìn",
};
const SAT_CHU_AM: Record<number, string> = {
  1: "Tỵ", 2: "Tý", 3: "Mùi", 4: "Mão", 5: "Thân", 6: "Tuất",
  7: "Sửu", 8: "Hợi", 9: "Ngọ", 10: "Dậu", 11: "Dần", 12: "Thìn",
};
/** Sát Chủ theo mùa — mùa xác định theo nhóm Chi Tháng Bát Tự (Kiến Nguyệt), không phải tháng ÂL. */
const SAT_CHU_MUA: Record<"Xuan" | "Ha" | "Thu" | "Dong", string> = { Xuan: "Ngọ", Ha: "Tý", Thu: "Dậu", Dong: "Mão" };

/**
 * ⚠️ Tháng 10 ÂL không có trong bảng gốc Sát Chủ Dương (nguồn liệt kê "T5,6,8,12 → Thìn" nhưng
 * không nhắc T10 dù T10 rõ ràng bị thiếu trong dãy 1-12). Đối chiếu Sát Chủ ÂM có đủ 12 tháng —
 * KHÔNG suy đoán giá trị thiếu này cho bảng Dương, trả `null` và báo thiếu dữ liệu khi gặp tháng 10.
 */
export function traSatChuDuong(thangAL: number): string | null {
  return SAT_CHU_DUONG[thangAL] ?? null;
}
export function traSatChuAm(thangAL: number): string | null {
  return SAT_CHU_AM[thangAL] ?? null;
}
export function traSatChuTheoMua(mua: "Xuan" | "Ha" | "Thu" | "Dong"): string {
  return SAT_CHU_MUA[mua];
}
/** Suy mùa từ Chi Tháng Bát Tự (Kiến Nguyệt) — Dần Mão Thìn=Xuân, Tỵ Ngọ Mùi=Hạ, Thân Dậu Tuất=Thu, Hợi Tý Sửu=Đông. */
export function muaTuChiThangBatTu(chiThang: string): "Xuan" | "Ha" | "Thu" | "Dong" {
  if (["Dần", "Mão", "Thìn"].includes(chiThang)) return "Xuan";
  if (["Tỵ", "Ngọ", "Mùi"].includes(chiThang)) return "Ha";
  if (["Thân", "Dậu", "Tuất"].includes(chiThang)) return "Thu";
  return "Dong"; // Hợi Tý Sửu
}

// ── Thọ Tử (theo tháng ÂL, đúng cặp Can Chi Ngày) ───────────────────────────────────────────────
const THO_TU: Record<number, { can: string; chi: string }> = {
  1: { can: "Bính", chi: "Tuất" }, 2: { can: "Nhâm", chi: "Thìn" }, 3: { can: "Tân", chi: "Hợi" },
  4: { can: "Đinh", chi: "Tỵ" }, 5: { can: "Mậu", chi: "Tý" }, 6: { can: "Bính", chi: "Ngọ" },
  7: { can: "Ất", chi: "Sửu" }, 8: { can: "Quý", chi: "Mùi" }, 9: { can: "Giáp", chi: "Dần" },
  10: { can: "Mậu", chi: "Thân" }, 11: { can: "Tân", chi: "Mão" }, 12: { can: "Tân", chi: "Dậu" },
};
export function phamThoTu(thangAL: number, canNgay: string, chiNgay: string): boolean {
  const ct = THO_TU[thangAL];
  return !!ct && ct.can === canNgay && ct.chi === chiNgay;
}

// ── Kim Lâu / Hoang Ốc — TẠM DỪNG, KHÔNG CODE Ở ĐÂY ─────────────────────────────────────────────
// ⚠️ Phát hiện 28/8/2026: package này ĐÃ CÓ SẴN module `hoang-oc-kim-lau/` (dùng ở module khác,
// vd Chọn Ngày Giờ Sinh Cho Bé) — NHƯNG dùng công thức KHÁC với công thức trong tài liệu skill
// xem-ngay-cao-cap (`tang2-chon-thang-theo-toa.md`, đã verify khớp 2 ví dụ minh họa cụ thể trong
// tài liệu đó). Module có sẵn tự nhận "công thức dân gian phổ biến nhất, KHÔNG đối chiếu được với
// 1 nguồn cụ thể nào" — khác hẳn với công thức có ví dụ minh họa của tài liệu này.
// KHÔNG tự ý chọn 1 trong 2 — đây là quyết định ảnh hưởng nhất quán dữ liệu TOÀN HỆ THỐNG (nếu
// khách dùng 2 module khác nhau mà ra 2 kết quả Kim Lâu/Hoang Ốc khác nhau cho cùng 1 tuổi sẽ mất
// niềm tin nghiêm trọng). Cần anh Công xác nhận dùng công thức nào làm chuẩn trước khi code phần
// này. Xem báo cáo trong hội thoại 28/8/2026.

// ── Tam Tai — TÁI DÙNG module có sẵn `trach-nhat/tamTai.ts`, KHÔNG viết bảng thứ hai ────────────
export { getNhomTuoiPhamTamTai, TAM_TAI_GROUPS } from "../trach-nhat/tamTai.js";

/**
 * Tổng hợp Bước 1 mục A (Tam Nương/Nguyệt Kỵ/Nguyệt Tận/Tứ Ly/Tứ Tuyệt/Kim Thần Thất Sát/Sát Chủ/
 * Thọ Tử). KHÔNG bao gồm Kim Lâu/Hoang Ốc (chỉ áp cho động thổ/khởi công, tính riêng theo tuổi gia
 * chủ — xem `traHoangOc`/`traKimLau`) và KHÔNG bao gồm Trực (đã có sẵn `trach-nhat/truc.ts`, thuộc
 * nhóm "Luôn bắt buộc", không nằm trong cờ lọc dân gian).
 */
export function locThoDanGian(input: {
  ngayAL: number;
  thangAL: number;
  canNam: string;
  canNgay: string;
  chiNgay: string;
  phamTuLy: boolean;
  phamTuTuyet: boolean;
  chiThangBatTu: string;
}): KetQuaLocDanGian {
  const lyDo: string[] = [];
  const r: KetQuaLocDanGian = {
    phamTamNuong: phamTamNuong(input.ngayAL),
    phamNguyetKy: phamNguyetKy(input.ngayAL),
    phamNguyetTan: false, // điền từ ngoài (cần biết ngày dương lịch hôm sau, xem xemNgayCaoCap.ts)
    phamTuLy: input.phamTuLy,
    phamTuTuyet: input.phamTuTuyet,
    phamKimThanThatSat: phamKimThanThatSat(input.canNam, input.chiNgay),
    phamSatChuDuong: traSatChuDuong(input.thangAL) === input.chiNgay,
    phamSatChuAm: traSatChuAm(input.thangAL) === input.chiNgay,
    phamSatChuTheoMua: traSatChuTheoMua(muaTuChiThangBatTu(input.chiThangBatTu)) === input.chiNgay,
    phamThoTu: phamThoTu(input.thangAL, input.canNgay, input.chiNgay),
    lyDo,
  };
  if (r.phamTamNuong) lyDo.push(`Tam Nương Sát (mùng ${input.ngayAL} ÂL)`);
  if (r.phamNguyetKy) lyDo.push(`Nguyệt Kỵ (mùng ${input.ngayAL} ÂL)`);
  if (r.phamTuLy) lyDo.push("Tứ Ly (1 ngày trước Xuân/Thu Phân hoặc Hạ/Đông Chí)");
  if (r.phamTuTuyet) lyDo.push("Tứ Tuyệt (1 ngày trước Lập Xuân/Hạ/Thu/Đông)");
  if (r.phamKimThanThatSat) lyDo.push(`Kim Thần Thất Sát (Can năm ${input.canNam}, Chi ngày ${input.chiNgay}) — không hóa giải được`);
  if (r.phamSatChuDuong) lyDo.push(`Sát Chủ Dương (tháng ${input.thangAL} ÂL → Chi ${input.chiNgay}) — "chủ chầu Diêm Vương", cực kỵ động thổ/khởi tạo`);
  if (r.phamSatChuAm) lyDo.push(`Sát Chủ Âm (tháng ${input.thangAL} ÂL → Chi ${input.chiNgay})`);
  if (r.phamSatChuTheoMua) lyDo.push(`Sát Chủ theo mùa (Chi ${input.chiNgay})`);
  if (r.phamThoTu) lyDo.push(`Ngày Thọ Tử (tháng ${input.thangAL} ÂL)`);
  return r;
}
