/**
 * QUÂN SƯ THIÊN ANH — CHUẨN GIỌNG VĂN TRẢ LỜI KHÁCH.
 *
 * Thầy chốt 2026-08-23: "giọng văn gần gũi, vẫn uy nghiêm, xưng anh hoặc chị với tôi, trả lời
 * chắc chắn, không miên man, không cợt nhả, tạo tâm lý thoải mái, không viết tắt."
 *
 * MỌI văn bản hiển thị cho khách — dù sinh bằng luật (advisory-engine) hay bằng AI (prompt gửi
 * Claude) — đều phải theo chuẩn ở đây. Đặt tập trung một chỗ để không mỗi nơi một giọng.
 */

/** Ngôi xưng hô với khách. Biết giới tính thì gọi đích danh; chưa biết thì dùng "anh/chị". */
export type Xung = "anh" | "chị" | "anh/chị";

export function xungHo(gioiTinh?: "Nam" | "Nữ"): Xung {
  if (gioiTinh === "Nam") return "anh";
  if (gioiTinh === "Nữ") return "chị";
  return "anh/chị";
}

/** Viết hoa đầu câu cho ngôi xưng (ví dụ mở đầu câu: "Anh nên…"). */
export function xungHoHoa(gioiTinh?: "Nam" | "Nữ"): string {
  const x = xungHo(gioiTinh);
  return x === "anh/chị" ? "Anh/chị" : x.charAt(0).toUpperCase() + x.slice(1);
}

/**
 * Khối quy tắc giọng văn để nhét vào system prompt khi gọi AI luận giải. Giữ NGẮN và TUYỆT ĐỐI —
 * prompt dài dòng làm model lơ đi các ràng buộc quan trọng.
 */
export function quyTacGiongVan(gioiTinh?: "Nam" | "Nữ"): string {
  const x = xungHo(gioiTinh);
  return [
    "GIỌNG VĂN BẮT BUỘC:",
    `- Gọi người hỏi là "${x}". Tự xưng là "tôi". Tuyệt đối không dùng "bạn", "quý khách", "mình".`,
    "- Gần gũi như người từng trải ngồi nói chuyện, nhưng giữ sự uy nghiêm của người có nghề. Không đùa cợt, không thân mật quá đà.",
    "- Nói chắc chắn. Đã kết luận thì kết luận dứt khoát, không rào đón kiểu \"có thể là\", \"tùy trường hợp\", \"cũng có khi\".",
    "- Không miên man. Mỗi ý một câu gọn. Không nhắc lại điều đã nói.",
    "- Viết đầy đủ, KHÔNG viết tắt (viết \"không\" chứ không viết \"ko\", viết \"được\" chứ không viết \"dc\").",
    "- Người hỏi đang lo lắng nên mới tìm đến. Kể cả khi quẻ xấu, vẫn phải nói sao cho họ thấy có đường đi, không hoang mang.",
    "- Không phán về sinh tử, bệnh tật cụ thể, hay khẳng định điều pháp luật phải quyết.",
  ].join("\n");
}
