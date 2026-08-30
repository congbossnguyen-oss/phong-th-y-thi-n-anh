/**
 * BÁT TRẠCH NHÀ — Sinh khắc Cung–Sao (lớp phân tích sâu tầng Cao Cấp).
 * Nguồn: gói build `data/09-sinh-khac-cung-sao-chuan.md` (lý thuyết + phương án A/B, đã kiểm
 * toán bằng chương trình khớp 8/8 bảng "số cung cát" theo A và 6/6 ví dụ theo B — xem
 * `tests/unit/bat-trach-nha/sinhKhacCungSao.test.ts` port lại đúng 2 bộ kiểm toán này) và
 * `data/06-sao-du-nien-ngu-hanh-sau.md` mục 3 (bảng mô tả biểu hiện 25 tổ hợp — bảng tra cứu
 * TĨNH, không phải công thức tổng quát, xem cảnh báo trong file đó).
 *
 * ⚠️ Nguồn tự mâu thuẫn về quy tắc lọc "cung sao đồng đạo" (data/09 mục 4) — dùng cờ cấu hình
 * `SinhKhacCungSaoPhuongAn` (config.ts), KHÔNG tự chọn 1 phương án duy nhất trong file này.
 */
import type { CungBatTrach } from "../cung-menh-bat-trach/cungPhi.js";
import type { KhiBatTrach } from "../cung-menh-bat-trach/duNienBatQuai.js";
import type { Data } from "@thien-anh/calendar-core";
import type { SinhKhacCungSaoPhuongAn } from "./config.js";

type NguHanh = Data.NguHanh;

export type AmDuong = "duong" | "am";

/** Âm dương + ngũ hành của 8 CUNG (nguyên văn data/09 mục 1). */
export const CUNG_AM_DUONG_NGU_HANH: Record<CungBatTrach, { amDuong: AmDuong; nguHanh: NguHanh }> = {
  Càn: { amDuong: "duong", nguHanh: "Kim" },
  Khảm: { amDuong: "duong", nguHanh: "Thủy" },
  Cấn: { amDuong: "duong", nguHanh: "Thổ" },
  Chấn: { amDuong: "duong", nguHanh: "Mộc" },
  Tốn: { amDuong: "am", nguHanh: "Mộc" },
  Ly: { amDuong: "am", nguHanh: "Hỏa" },
  Khôn: { amDuong: "am", nguHanh: "Thổ" },
  Đoài: { amDuong: "am", nguHanh: "Kim" },
};

/** Tên sao + âm dương + ngũ hành của mỗi khí Du Niên (nguyên văn data/09 mục 2). */
export const SAO_DU_NIEN: Record<KhiBatTrach, { ten: string; amDuong: AmDuong; nguHanh: NguHanh; cat: boolean }> = {
  "sinh-khi": { ten: "Tham Lang", amDuong: "duong", nguHanh: "Mộc", cat: true },
  "thien-y": { ten: "Cự Môn", amDuong: "duong", nguHanh: "Thổ", cat: true },
  "dien-nien": { ten: "Vũ Khúc", amDuong: "duong", nguHanh: "Kim", cat: true },
  "phuc-vi": { ten: "Phụ Bật", amDuong: "am", nguHanh: "Mộc", cat: true },
  "tuyet-menh": { ten: "Phá Quân", amDuong: "am", nguHanh: "Kim", cat: false },
  "ngu-quy": { ten: "Liêm Trinh", amDuong: "am", nguHanh: "Hỏa", cat: false },
  "hoa-hai": { ten: "Lộc Tồn", amDuong: "am", nguHanh: "Thổ", cat: false },
  "luc-sat": { ten: "Văn Khúc", amDuong: "duong", nguHanh: "Thủy", cat: false },
};

const NGU_HANH_KHAC: Record<NguHanh, NguHanh> = { Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" };

export type TrangThaiSinhKhac = "dong-dao" | "cung-khac-sao" | "sao-khac-cung" | "khong-tuong-khac";

/**
 * Xét trạng thái sinh khắc giữa 1 CUNG (nơi sao đóng) và khí Du Niên (sao) tại đó.
 * `phuongAn`: 'A' = có áp quy tắc đồng đạo (không xét sinh khắc nếu cùng âm dương) — dùng khi
 * đánh giá TỔNG THỂ 1 trạch. 'B' = bỏ quy tắc đồng đạo, luôn xét sinh khắc — dùng khi luận 1 CẶP
 * cụ thể (2 cửa / cửa–phương cao / cửa phòng–giường). Xem data/00 mục MĐ-2.
 */
export function xetSinhKhacCungSao(cungNhan: CungBatTrach, khi: KhiBatTrach, phuongAn: "A" | "B"): TrangThaiSinhKhac {
  const c = CUNG_AM_DUONG_NGU_HANH[cungNhan];
  const s = SAO_DU_NIEN[khi];
  if (phuongAn === "A" && c.amDuong === s.amDuong) return "dong-dao";
  if (NGU_HANH_KHAC[c.nguHanh] === s.nguHanh) return "cung-khac-sao"; // nội khắc, hoàn toàn hung nếu nghiêm trọng
  if (NGU_HANH_KHAC[s.nguHanh] === c.nguHanh) return "sao-khac-cung"; // ngoại chiến, bán hung
  return "khong-tuong-khac";
}

/**
 * Kết quả sinh khắc theo CẢ HAI phương án cùng lúc — dùng khi cờ cấu hình = 'theoNguCanh' (mặc
 * định data/00): trả về cả 2 để tầng trên tự chọn hiển thị theo ngữ cảnh (tổng thể dùng A, luận
 * cặp cụ thể dùng B), và biết được có "lệch" giữa 2 phương án hay không.
 */
export interface SinhKhacCaHaiPhuongAn {
  phuongAnA: TrangThaiSinhKhac;
  phuongAnB: TrangThaiSinhKhac;
  lech: boolean;
}

export function xetSinhKhacCungSaoCaHai(cungNhan: CungBatTrach, khi: KhiBatTrach): SinhKhacCaHaiPhuongAn {
  const phuongAnA = xetSinhKhacCungSao(cungNhan, khi, "A");
  const phuongAnB = xetSinhKhacCungSao(cungNhan, khi, "B");
  return { phuongAnA, phuongAnB, lech: phuongAnA !== phuongAnB };
}

/** Áp cờ cấu hình `SinhKhacCungSaoPhuongAn` để lấy 1 kết quả — dùng cho hiển thị nhanh không cần so 2 phương án. */
export function xetSinhKhacTheoConfig(
  cungNhan: CungBatTrach,
  khi: KhiBatTrach,
  phuongAn: SinhKhacCungSaoPhuongAn,
  nguCanh: "tong-the" | "cap-cu-the",
): TrangThaiSinhKhac {
  if (phuongAn === "theoNguCanh") {
    return xetSinhKhacCungSao(cungNhan, khi, nguCanh === "tong-the" ? "A" : "B");
  }
  return xetSinhKhacCungSao(cungNhan, khi, phuongAn);
}

// -----------------------------------------------------------------------------------------------
// Bảng số cung CÁT còn lại sau khi xét sinh khắc (data/09 mục 5) — phương án A, khớp 8/8 nguyên văn
// sách. Cho xếp hạng chất lượng trạch ngay khi biết Tọa, trước cả khi biết mệnh gia chủ.
// -----------------------------------------------------------------------------------------------
export const SO_CUNG_CAT_CON_LAI: Record<CungBatTrach, number> = {
  Đoài: 4,
  Tốn: 4,
  Khôn: 4,
  Ly: 3,
  Chấn: 3,
  Khảm: 3,
  Càn: 2,
  Cấn: 2,
};

// -----------------------------------------------------------------------------------------------
// Bảng mô tả biểu hiện 25 tổ hợp (data/06-sao-du-nien-ngu-hanh-sau.md mục 3) — TRA CỨU TĨNH,
// không suy diễn thêm. `null` = 3 ô Phá Quân nguồn không mô tả riêng (data/00 MĐ-4: để trống,
// hiển thị "đang bổ sung").
// -----------------------------------------------------------------------------------------------
export type QuanHeSinhKhac = "ty-hoa" | "cung-sinh-sao" | "sao-sinh-cung" | "cung-khac-sao" | "sao-khac-cung";

export const MO_TA_25_TO_HOP: Record<KhiBatTrach, Partial<Record<QuanHeSinhKhac, string>>> = {
  "dien-nien": {
    // Vũ Khúc (cát, Kim)
    "ty-hoa": "Tốt — sinh nhiều con trai, tài lộc gia tăng.",
    "sao-sinh-cung": "Tốt — nhân khẩu bình an, tài lộc dồi dào, hưng vượng.",
    "sao-khac-cung": "Xấu — tổn hại trưởng nam (tại Chấn)/trưởng nữ (tại Tốn), dễ hung tử, bệnh gân cốt/phổi.",
    "cung-khac-sao": "Xấu đặc biệt nghiêm trọng — tổn thương nặng, tài sản hao tán nhanh, con cháu tuyệt tự, bệnh nan y.",
    "cung-sinh-sao": "Tốt — gia nghiệp hưng vượng mãi mãi, sinh 4 con trai (giảm nếu là Âm Thổ).",
  },
  "tuyet-menh": {
    // Phá Quân (hung, Kim) — 3 ô nguồn không mô tả riêng, để trống theo data/00 MĐ-4.
    "ty-hoa": "Xấu nặng — âm khí trùng trùng, tuyệt tự, gia tộc suy vong.",
    "sao-sinh-cung": "Xấu (hung nhiều hơn cát).",
  },
  "sinh-khi": {
    // Tham Lang (cát, Mộc)
    "ty-hoa": "Đại cát — gia đạo hưng vượng, con cháu đông đúc, vạn sự thuận lợi, phúc lộc bền vững (TỐT NHẤT của nhóm Mộc).",
    "cung-sinh-sao": "Rất tốt — được nuôi dưỡng mạnh mẽ, sinh 5 con trai, tài vận đại phát, phúc lộc lâu dài.",
    "sao-sinh-cung": "Tốt CÓ ĐIỀU KIỆN — hưng vượng, NHƯNG sợ Hỏa quá vượng sẽ \"đốt cháy gốc Mộc\", gây tuyệt tự nếu mất cân bằng.",
    "sao-khac-cung": "Xấu, mức độ tăng dần — thân thể tổn hại dần, tài sản hao tán dần, bệnh tỳ vị/da liễu.",
    "cung-khac-sao": "Bán cát bán hung — ban đầu tốt, 30 năm sau bắt đầu xấu (hao tán, bệnh tật) — tính chất THẤT THƯỜNG hơn là \"xấu nặng nhất\".",
  },
  "phuc-vi": {
    // Phụ Bật (cát, Mộc) — cùng chung kết quả với Tham Lang (data/06 nói rõ "cả hai đều cát, cùng chung 1 kết quả")
    "ty-hoa": "Đại cát — gia đạo hưng vượng, con cháu đông đúc, vạn sự thuận lợi, phúc lộc bền vững (TỐT NHẤT của nhóm Mộc).",
    "cung-sinh-sao": "Rất tốt — được nuôi dưỡng mạnh mẽ, sinh 5 con trai, tài vận đại phát, phúc lộc lâu dài.",
    "sao-sinh-cung": "Tốt CÓ ĐIỀU KIỆN — hưng vượng, NHƯNG sợ Hỏa quá vượng sẽ \"đốt cháy gốc Mộc\", gây tuyệt tự nếu mất cân bằng.",
    "sao-khac-cung": "Xấu, mức độ tăng dần — thân thể tổn hại dần, tài sản hao tán dần, bệnh tỳ vị/da liễu.",
    "cung-khac-sao": "Bán cát bán hung — ban đầu tốt, 30 năm sau bắt đầu xấu (hao tán, bệnh tật) — tính chất THẤT THƯỜNG hơn là \"xấu nặng nhất\".",
  },
  "luc-sat": {
    // Văn Khúc (hung, Thủy) — không có sao cát cùng hành Thủy
    "ty-hoa": "Xấu — \"âm hàn quá nặng\", gia đạo suy bại, nam giới đoản mệnh, con cháu thưa thớt.",
    "cung-sinh-sao": "Ban đầu tốt (hưng vượng) → về sau suy bại hoàn toàn — phụ nữ nắm quyền, kiện tụng, bệnh tật.",
    "sao-sinh-cung": "Ban đầu tốt (hợp cách, hưng thịnh) → về sau chồng chết trước, vợ góa nắm quyền.",
    "sao-khac-cung": "Xấu rõ — kiện tụng, trộm cướp, tổn hại thanh niên rồi đến trẻ nhỏ/người già, bệnh về mắt/huyết.",
    "cung-khac-sao": "Xấu — tổn hại dần, kiện tụng, ly hương; Văn Khúc tại Khôn: tổn hại nữ giới; tại Cấn: tổn hại nam giới.",
  },
  "ngu-quy": {
    // Liêm Trinh (hung, Hỏa) — không có sao cát cùng hành Hỏa
    "ty-hoa": "Xấu nặng, đến rất nhanh — thiêu rụi, bệnh ngoài da khó trị, nguy cơ tuyệt tự.",
    "cung-sinh-sao": "Không sinh cát lợi dù được sinh — gia sản suy bại, trộm cướp, con cái bất hòa, kiện tụng liên miên.",
    "sao-khac-cung": "Xấu — tổn hại trưởng bối (tại Càn)/thiếu nữ (tại Đoài), bệnh tim/phổi, kiện tụng, án tù.",
    "cung-khac-sao": "Xấu — tài sản tiêu tán, hỏa hoạn liên tiếp, con thứ/con út mất trước rồi đến cha.",
    "sao-sinh-cung": "Vẫn hung nhiều hơn cát dù được sinh — Hỏa tại Khôn: mẹ già chết trước; tại Cấn: con trai út mất sớm.",
  },
  "thien-y": {
    // Cự Môn (cát, Thổ)
    "ty-hoa": "Xấu dù là sao cát — tại Cấn: tổn hại con trai út; tại Khôn: tổn hại mẹ già (\"hai Thổ chồng lên nhau\" gây trệ).",
    "sao-sinh-cung": "Rất tốt — tài lộc đại phát, gia súc sinh sôi, con cháu đông đúc hưng vượng.",
    "cung-khac-sao": "Xấu — tổn hại nam giới, bệnh phù thũng/dạ dày.",
    "sao-khac-cung": "Xấu — cơ thể suy yếu dần, gia nghiệp suy bại (không có ưu thế đặc biệt dù là sao cát khắc cung).",
    "cung-sinh-sao": "Rất tốt, ổn định lâu dài — phú quý, tài lộc dồi dào, gia đạo thịnh vượng đời đời.",
  },
  "hoa-hai": {
    // Lộc Tồn (hung, Thổ)
    "ty-hoa": "Tương tự xấu, gây tổn hại nữ giới.",
    "sao-sinh-cung": "Xấu dù được sinh — Âm Thổ cuối cùng \"bị chôn vùi\"; tại Đoài: phụ nữ chết yểu; tại Càn: đàn ông đoản mệnh.",
    "cung-khac-sao": "Xấu — tổn hại phụ nữ, bại liệt.",
    "sao-khac-cung": "(cùng nhóm, xấu tương tự).",
    "cung-sinh-sao": "Vẫn hung nhiều hơn cát dù được sinh.",
  },
};

/** Lấy mô tả 1 tổ hợp (khí × quan hệ sinh khắc) — trả `null` nếu nguồn chưa mô tả (3 ô Phá Quân). */
export function moTaToHop(khi: KhiBatTrach, quanHe: QuanHeSinhKhac): string | null {
  return MO_TA_25_TO_HOP[khi][quanHe] ?? null;
}

// -----------------------------------------------------------------------------------------------
// Cung ↔ Thành viên gia đình (data/06 mục 5).
// -----------------------------------------------------------------------------------------------
export const CUNG_THANH_VIEN_GIA_DINH: Record<CungBatTrach, string> = {
  Càn: "Cha / trưởng bối nam",
  Khôn: "Mẹ",
  Chấn: "Trưởng nam",
  Tốn: "Trưởng nữ",
  Khảm: "Trung nam",
  Ly: "Trung nữ",
  Cấn: "Thiếu nam (con út trai)",
  Đoài: "Thiếu nữ (con út gái)",
};
