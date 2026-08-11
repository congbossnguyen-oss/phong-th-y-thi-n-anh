/**
 * @thien-anh/rule-engine — Quy tắc/dữ liệu cổ điển thuần túy dùng chung giữa các Engine bộ
 * môn. Hiện chỉ có nhóm `trach-nhat` (đúng phạm vi đã chốt: chỉ 1 công cụ "Lịch Vạn Sự" phổ
 * thông). Các nhóm khác (bat-tu, luc-hao, tu-vi, ky-mon) sẽ thêm khi tới lượt module tương ứng
 * — xem docs/02-rule-engine.md.
 */
export * as TrachNhat from "./trach-nhat/index.js";
export * as Scoring from "./scoring/index.js";
