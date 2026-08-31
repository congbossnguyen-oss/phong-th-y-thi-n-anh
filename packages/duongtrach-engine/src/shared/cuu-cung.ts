/**
 * Cửu cung (Bát Quái + Trung cung) dùng chung cho Dương Trạch — tên cung, hướng, ngũ hành, và
 * độ số → cung vật lý (tái dùng `BatTrachNha.doToCung` của rule-engine, README-CLAUDE-CODE.md:
 * "Module xem-huong-nha-bat-trach cũng cần — nếu đã dựng thì DÙNG LẠI, đừng viết bản thứ hai").
 */
import { BatTrachNha } from "@thien-anh/rule-engine";
import type { Hanh } from "./ngu-hanh.js";

export type TenCung = "Càn" | "Khảm" | "Cấn" | "Chấn" | "Tốn" | "Ly" | "Khôn" | "Đoài" | "Trung cung";

/** Thứ tự phi Lường Thiên Xích: bước 0 = trung cung, rồi 1..8 (data/01-bang-tra-do-so.md mục "Bước 4"). */
export const LTX: readonly TenCung[] = ["Trung cung", "Càn", "Đoài", "Cấn", "Ly", "Khảm", "Khôn", "Chấn", "Tốn"];

/** Ngũ hành cửu cung (data/01-bang-tra-do-so.md mục 4) — Trung cung = Thổ. */
export const NGU_HANH_CUNG: Record<TenCung, Hanh> = {
  Khảm: "Thủy",
  Cấn: "Thổ",
  Chấn: "Mộc",
  Tốn: "Mộc",
  Ly: "Hỏa",
  Khôn: "Thổ",
  Đoài: "Kim",
  Càn: "Kim",
  "Trung cung": "Thổ",
};

/** Hướng địa lý ứng với mỗi cung — Trung cung không phải hướng, chỉ là tâm nhà. */
export const HUONG_CUNG: Record<TenCung, string> = {
  Khảm: "Bắc",
  Cấn: "Đông Bắc",
  Chấn: "Đông",
  Tốn: "Đông Nam",
  Ly: "Nam",
  Khôn: "Tây Nam",
  Đoài: "Tây",
  Càn: "Tây Bắc",
  "Trung cung": "Tâm nhà",
};

/**
 * Cung VẬT LÝ mà 1 độ số rơi vào (8 hướng, 45°/hướng) — dùng cho môn khí (Bước 6). Trung cung
 * KHÔNG phải cửa nên không nằm trong miền giá trị của hàm này (README-CLAUDE-CODE.md bẫy #3:
 * "cung vật lý của cửa tra theo ĐỘ SỐ, không suy từ tên phân kim").
 */
export function cungVatLyTuDo(deg: number): TenCung {
  return BatTrachNha.doToCung(deg);
}
