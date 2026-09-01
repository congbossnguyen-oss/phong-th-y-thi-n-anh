// Bắt trường hợp AI trả JSON HỢP LỆ theo schema (không lỗi parse, `goiAiToolUseVoiRetry` coi là
// thành công) nhưng nội dung thật sự TRỐNG ở một số trường — đã xảy ra thật 1/9/2026: lá số Tử Vi
// Cơ Bản chỉ có đúng cung Phụ Mẫu (cung đầu tiên theo thứ tự prompt) có nội dung, 11/12 cung còn lại
// mọi trường đều là chuỗi rỗng "". Schema JSON chỉ ép `type: "string"` + `required` (trường phải
// XUẤT HIỆN), không ép non-empty, nên DeepSeek vẫn "hợp lệ" khi hết sức viết mà điền "" cho xong.
//
// Dùng ở CẢ 2 tầng AI Tử Vi (aiCoBan.ts, aiNangCao.ts) — khách đã trả tiền, không được để lọt báo
// cáo thiếu mục ra trang/PDF/email (anh Công yêu cầu 1/9/2026, xem thêm khi áp dụng cho Bát Tự).

/**
 * true nếu `value` (hoặc bất kỳ trường con nào, đệ quy qua object/array) là chuỗi rỗng/toàn khoảng
 * trắng, hoặc mảng rỗng. `undefined`/`null` KHÔNG bị coi là rỗng — đó là trường KHÔNG bắt buộc, cố ý
 * không có (vd `toXauSoVoiHanKhac` chỉ có ở Đại Hạn, không có ở Tiểu Hạn), khác với "AI phải điền mà
 * điền rỗng".
 */
export function coTruongRong(value: unknown): boolean {
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0 || value.some(coTruongRong);
  if (value !== null && typeof value === "object") return Object.values(value).some(coTruongRong);
  return false;
}
