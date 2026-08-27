/**
 * Lỗi AN TOÀN để hiển thị thẳng cho khách — chỉ dùng cho các trường hợp nghiệp vụ đã biết trước
 * (validate input, quy tắc kinh doanh...), KHÔNG BAO GIỜ chứa chi tiết kỹ thuật/SQL/stack trace.
 *
 * Bối cảnh: phát hiện 2026-08-26 — 1 route để lộ nguyên văn lỗi driver Postgres/Neon ("Failed
 * query: select ... params: ...") ra thẳng response JSON cho khách, lộ tên bảng/cột/tham số thật.
 * Từ giờ MỌI route DB dùng đúng 1 khuôn: throw new LoiNguoiDung(...) cho lỗi nghiệp vụ (hiển thị
 * nguyên văn, an toàn vì tự viết); mọi lỗi khác (driver DB, bug code, network...) đi qua
 * `boiKinDoanh()` để bị chặn lại, ghi log server, đổi thành câu chung chung trước khi ra client.
 */
export class LoiNguoiDung extends Error {}

/**
 * Bọc 1 hàm nghiệp vụ (thường là hàm ghi/đọc DB) — lỗi `LoiNguoiDung` bên trong đi qua nguyên vẹn,
 * MỌI lỗi khác bị chặn lại, ghi log đầy đủ ở server, ném ra ngoài dưới dạng `LoiNguoiDung` với câu
 * chung chung `macDinh` (an toàn để route handler hiển thị thẳng cho khách).
 */
export async function boiLoiHeThong<T>(nhan: string, macDinh: string, viec: () => Promise<T>): Promise<T> {
  try {
    return await viec();
  } catch (err) {
    if (err instanceof LoiNguoiDung) throw err;
    console.error(`[${nhan}] Lỗi hệ thống bị chặn không cho hiển thị:`, err);
    throw new LoiNguoiDung(macDinh);
  }
}

/**
 * Rút thông báo AN TOÀN từ 1 lỗi bất kỳ để trả cho client, dùng ở catch cuối cùng trong route
 * handler. Chỉ hiện nguyên văn nếu là `LoiNguoiDung` (đã soạn sẵn, an toàn); mọi lỗi khác (kể cả lọt
 * qua không qua `boiLoiHeThong`) đều bị chặn, ghi log server, trả câu chung chung.
 */
export function thongBaoLoiAnToan(err: unknown, macDinh = "Có lỗi hệ thống, vui lòng thử lại sau."): string {
  if (err instanceof LoiNguoiDung) return err.message;
  console.error("[api] Lỗi hệ thống bị chặn không cho hiển thị:", err);
  return macDinh;
}
