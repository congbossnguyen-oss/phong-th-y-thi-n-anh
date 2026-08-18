/**
 * `@thien-anh/tinhdanh-engine` — Tính Danh Học (Việt Danh Học).
 *
 * Hàm thuần, xác định, KHÔNG gọi AI lúc chạy. Chỗ nào thiếu dữ liệu chuẩn thì trả về ở
 * `canhBaoThieuDuLieu`, không suy đoán.
 *
 * Phạm vi bản này: chức năng B — gợi ý tên cho con. (Chức năng A — đánh giá tên có sẵn — dùng
 * chung lapTuTru / lapTuDaiCuc, sẽ bổ sung sau.)
 */
export * from "./types.js";
export { goiYTen } from "./engine/goiYTen.js";
export { danhGiaTen, GIOI_HAN_DANH_GIA } from "./engine/danhGiaTen.js";
export type { DanhGiaTenInput } from "./engine/danhGiaTen.js";
export { lapTuTru, tinhDiemNguHanh, chonHanhKhuyet, tyLeNguHanh } from "./engine/tuTru.js";
export { lapTuDaiCuc, thanhPhanNet } from "./engine/tuDaiCuc.js";
export { tinhSoNet } from "./engine/soNet.js";
export { BANG_81_CUC, KHO_TEN, traCuc } from "./data/bangTra.js";
