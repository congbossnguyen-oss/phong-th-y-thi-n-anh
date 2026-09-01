/**
 * @thien-anh/rule-engine — Quy tắc/dữ liệu cổ điển thuần túy dùng chung giữa các Engine bộ
 * môn. Hiện chỉ có nhóm `trach-nhat` (đúng phạm vi đã chốt: chỉ 1 công cụ "Lịch Vạn Sự" phổ
 * thông). Các nhóm khác (bat-tu, luc-hao, tu-vi, ky-mon) sẽ thêm khi tới lượt module tương ứng
 * — xem docs/02-rule-engine.md.
 */
export * as TrachNhat from "./trach-nhat/index.js";
export * as Scoring from "./scoring/index.js";
export * as TrungTang from "./trung-tang/index.js";
export * as CuoiHoi from "./cuoi-hoi/index.js";
export * as HoangOcKimLau from "./hoang-oc-kim-lau/index.js";
export * as ConSoMayMan from "./con-so-may-man/index.js";
export * as CungMenhBatTrach from "./cung-menh-bat-trach/index.js";
export * as ChonTuoiKetHon from "./chon-tuoi-ket-hon/index.js";
export * as ChonNamSinhCon from "./chon-nam-sinh-con/index.js";
export * as XemTuoiXongDat from "./xem-tuoi-xong-dat/index.js";
export * as XemNgayCaoCap from "./xem-ngay-cao-cap/index.js";
export * as BatTrachNha from "./bat-trach-nha/index.js";
export * as DauThu from "./dau-thu/index.js";
