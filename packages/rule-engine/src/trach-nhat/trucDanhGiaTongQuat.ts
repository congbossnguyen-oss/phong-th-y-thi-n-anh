/**
 * BẢNG ĐÁNH GIÁ TỔNG QUÁT 12 TRỰC — nguồn tham chiếu chung.
 *
 * Nguồn: chủ dự án cung cấp trực tiếp 2026-08-15, kèm lời dặn nguyên văn:
 *
 *   "nhưng phải xét cát thần, hung thần và tính chất của từng việc,
 *    không thể máy móc áp dụng"
 *
 * ⚠️ VÌ VẬY: file này KHÔNG phải bộ chấm điểm, và KHÔNG module nào được đọc thẳng nó ra điểm.
 * Nó chỉ là mốc tham chiếu để:
 *   1. Người viết module biết mặc định của một Trực là gì trước khi quyết định cho module mình.
 *   2. Khi một module xếp khác bảng này, bắt buộc phải ghi rõ lý do tại chỗ — vì đó là "tính chất
 *      của từng việc" chứ không được im lặng lệch chuẩn.
 *
 * Ví dụ lệch có chủ ý đang tồn tại:
 *   • `kyHopDongCaoCap.ts` cho Trực Mãn 9/10 (bảng này xếp ⚠️) — chủ dự án chốt riêng cho ký kết:
 *     "Mãn là đầy đủ, sung túc, hoàn thành; hợp việc thu hoạch, thu tiền, hoàn tất giao dịch".
 *   • `kyHopDongCaoCap.ts` cho Trực Trừ 5/10 (bảng này xếp ✅) — "trừ bỏ cái cũ" hợp thanh lý hợp
 *     đồng cũ hơn là ký hợp đồng mới.
 *   • `kyHopDongCaoCap.ts` loại thẳng Trực Phá, trong khi bảng này ghi "một số việc lại dùng được"
 *     — với ký kết thì không nằm trong số đó.
 */

export type TrucDanhGia = "tot" | "than_trong" | "xau";

export interface TrucTongQuatEntry {
  ten: string;
  han: string;
  yNghia: string;
  danhGia: TrucDanhGia;
  /** Ghi chú riêng của chủ dự án, nếu có. */
  ghiChu?: string;
}

export const TRUC_DANH_GIA_TONG_QUAT: readonly TrucTongQuatEntry[] = [
  { ten: "Kiến", han: "建", yNghia: "dựng, bắt đầu", danhGia: "than_trong" },
  { ten: "Trừ", han: "除", yNghia: "loại bỏ, thanh trừ", danhGia: "tot" },
  { ten: "Mãn", han: "滿", yNghia: "đầy đủ, sung mãn", danhGia: "than_trong" },
  { ten: "Bình", han: "平", yNghia: "bình ổn", danhGia: "than_trong" },
  { ten: "Định", han: "定", yNghia: "định lập, ổn định", danhGia: "tot" },
  {
    ten: "Chấp",
    han: "執",
    yNghia: "nắm giữ, chấp trì",
    danhGia: "tot",
    ghiChu: "Nguồn ghi ✅/⚠️ — tốt nhưng còn tùy việc.",
  },
  {
    ten: "Phá",
    han: "破",
    yNghia: "phá bỏ",
    danhGia: "xau",
    ghiChu: "Nguồn ghi rõ: một số việc lại dùng được (vd việc cần phá dỡ, chấm dứt).",
  },
  { ten: "Nguy", han: "危", yNghia: "nguy hiểm", danhGia: "than_trong" },
  { ten: "Thành", han: "成", yNghia: "thành tựu, hoàn thành", danhGia: "tot" },
  { ten: "Thâu", han: "收", yNghia: "thu nhận, thu hoạch", danhGia: "than_trong" },
  { ten: "Khai", han: "開", yNghia: "mở, khai thông", danhGia: "tot" },
  { ten: "Bế", han: "閉", yNghia: "đóng, bế tàng", danhGia: "xau" },
] as const;

/** Tra nhanh đánh giá tổng quát của một Trực. Trả `undefined` nếu tên không nằm trong 12 Trực. */
export function getTrucDanhGiaTongQuat(tenTruc: string): TrucTongQuatEntry | undefined {
  return TRUC_DANH_GIA_TONG_QUAT.find((t) => t.ten === tenTruc);
}
