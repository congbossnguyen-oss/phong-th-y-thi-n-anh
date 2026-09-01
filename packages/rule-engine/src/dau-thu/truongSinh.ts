/**
 * Vòng Trường Sinh 12 cung — Bước 5 phương pháp Đẩu Thủ Chọn Ngày (dùng cho mọi mục vượng suy
 * ở Bước 4: Sơn Đầu được lệnh tháng, Nguyên Thần đắc vị, Phá Quân thất vị...).
 *
 * Cài bằng công thức Trường Sinh chuẩn phổ thông (Mộc sinh tại Hợi, Hỏa/Thổ sinh tại Dần, Kim
 * sinh tại Tỵ, Thủy sinh tại Thân, đi THUẬN qua 12 Chi) thay vì chép tay bảng 12×4 — đã đối
 * chiếu khớp 100% với bảng tra cho sẵn trong `data/dau-thu-chon-ngay.md` Bước 5 trước khi chọn
 * cách này (chính nguồn cũng ghi bảng đó "khớp hoàn toàn với vòng Trường Sinh chuẩn phổ thông").
 */
import { Data } from "@thien-anh/calendar-core";
import type { NguHanh } from "./nguHanhDauThu.js";

type Chi = Data.Chi;

export const TRUONG_SINH_STAGES = [
  "Trường Sinh", "Mộc Dục", "Quan Đới", "Lâm Quan", "Đế Vượng", "Suy",
  "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng",
] as const;
export type TruongSinhStage = (typeof TRUONG_SINH_STAGES)[number];

/**
 * Thứ tự tốt dần: Tuyệt < Thai < Dưỡng < Mộc Dục < Quan Đới < Lâm Quan < Đế Vượng, rồi giảm dần
 * Suy > Bệnh > Tử > Mộ (nguyên văn `dau-thu-chon-ngay.md` Bước 5). Nguồn không xếp riêng Trường
 * Sinh vào thang này — xếp cùng bậc với Quan Đới (cả hai đều thuộc nhóm "đắc vị" theo Bước 4).
 */
const RANK_VUONG: Readonly<Record<TruongSinhStage, number>> = {
  "Tuyệt": 0, "Thai": 1, "Dưỡng": 2, "Mộc Dục": 3, "Quan Đới": 4, "Lâm Quan": 5, "Đế Vượng": 6,
  "Suy": 5, "Bệnh": 4, "Tử": 3, "Mộ": 1, "Trường Sinh": 4,
};

const CHI_ORDER: readonly Chi[] = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const CHI_INDEX = new Map<Chi, number>(CHI_ORDER.map((c, i) => [c, i]));

/** Chi khởi Trường Sinh của mỗi hành (Hỏa và Thổ dùng chung 1 vòng, khởi tại Dần). */
const CHI_KHOI_TRUONG_SINH: Readonly<Record<NguHanh, Chi>> = {
  Mộc: "Hợi", Hỏa: "Dần", Thổ: "Dần", Kim: "Tỵ", Thủy: "Thân",
};

/** Vị trí trên vòng Trường Sinh của hành `hanh`, tại Địa Chi `chi`. */
export function traTruongSinh(chi: Chi, hanh: NguHanh): TruongSinhStage {
  const chiKhoi = CHI_KHOI_TRUONG_SINH[hanh];
  const stageIndex = (CHI_INDEX.get(chi)! - CHI_INDEX.get(chiKhoi)! + 12) % 12;
  return TRUONG_SINH_STAGES[stageIndex]!;
}

/** Điểm "vượng" của 1 vị trí trên vòng Trường Sinh — cao hơn = vượng hơn (Đế Vượng cao nhất). */
export function diemVuong(stage: TruongSinhStage): number {
  return RANK_VUONG[stage];
}

/** Có ở nhóm "đắc vị" (Trường Sinh/Quan Đới/Lâm Quan/Đế Vượng) không — theo Bước 4. */
export function dacVi(stage: TruongSinhStage): boolean {
  return stage === "Trường Sinh" || stage === "Quan Đới" || stage === "Lâm Quan" || stage === "Đế Vượng";
}

/** Có ở nhóm "thất vị/vô khí" (Tử/Mộ/Tuyệt) không — theo Bước 4. */
export function thatVi(stage: TruongSinhStage): boolean {
  return stage === "Tử" || stage === "Mộ" || stage === "Tuyệt";
}
