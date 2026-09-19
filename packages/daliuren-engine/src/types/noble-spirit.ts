/**
 * NobleSpirit (貴人 Quý Nhân) — Algorithm Spec §4. Tách RÕ 2 quyết định độc lập theo đúng
 * yêu cầu Phase 5A mục 13 (KHÔNG trộn thành 1 black-box function):
 *   (a) `guiRenPair` — cặp vị trí (晝/夜) theo Can Ngày, CONFIDENCE B (khẩu quyết có nguồn tốt).
 *   (b) `dayNightAssignment` — CHIỀU nào trong cặp ứng với 晝 hay 夜, CONFIDENCE C — Phase 4 xác
 *       nhận đây là tranh cãi THẬT về BẢNG ÁNH XẠ (phái truyền thống vs phái Quách Phác/Khang Hy),
 *       không phải về ranh giới 晝/夜 (ranh giới đã READY, xem DayNight).
 */
import type { Chi } from "./ganzhi.js";

/** Bảng ánh xạ Can→Chi Quý Nhân đang dùng — xem `DayNightProfile.guiRenMappingTable`. */
export type GuiRenMappingTableId = "traditional" | "guopo-kangxi";

export interface NobleSpirit {
  /** Vị trí Quý Nhân đã chọn cho lượt chiêm này (1 trong 2 giá trị của cặp, theo dayOrNight). */
  zhi: Chi;
  /** Bảng ánh xạ đã dùng để tra — gắn kèm để truy vết nếu sau đổi profile. */
  mappingTable: GuiRenMappingTableId;
}
