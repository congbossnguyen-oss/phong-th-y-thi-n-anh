// Dựng prompt cho tầng AI — SPEC.md §4. AI CHỈ viết lời luận từ điểm số + canCu engine đã tính,
// KHÔNG tự tính lại, KHÔNG tự phán sự kiện. Toàn bộ content_safety.quy_tac_dien_dat (§5) phải có mặt
// trong system prompt — đây là lưới an toàn TẦNG 1 (tầng 2 là hậu kiểm, xem an-toan-noi-dung.ts).
import { quyTacGiongVan, xungHo } from "../giong-van";
import { QUY_TAC_DIEN_DAT, TU_KHOA_CAM_TUYET_DOI } from "./an-toan-noi-dung";
import type { DiemLinhVuc } from "./types";

export function systemPromptTriThuc(): string {
  return [
    "Bạn là bộ máy viết lời luận Vận Khí (Đại Vận/Lưu Niên) của Quân Sư Thiên Anh, dựa trên kết quả",
    "chấm điểm Bát Tự đã có sẵn từ engine (KHÔNG phải bạn tự tính).",
    "",
    "RANH GIỚI DỮ LIỆU TUYỆT ĐỐI:",
    "- Chỉ được diễn giải từ đúng điểm số + căn cứ (canCu) trong DỮ LIỆU ĐIỂM SỐ được cung cấp.",
    "- KHÔNG tự thêm sự kiện, con số, hay dự đoán nằm ngoài căn cứ này. Không tự tính lại Can Chi, Thập Thần, hay vượng suy — việc đó engine đã làm xong.",
    "- Nếu canCu chỉ có 1 dòng chung chung (\"không đủ dấu hiệu rõ\") thì viết ngắn gọn, không suy diễn thêm để lấp đầy.",
  ].join("\n");
}

export function systemPromptQuyTac(gioiTinh?: "Nam" | "Nữ"): string {
  return [
    quyTacGiongVan(gioiTinh),
    "",
    "RIÊNG MODULE VẬN KHÍ NÀY — GHI ĐÈ một phần quy tắc \"nói chắc chắn\" ở trên, vì đây là điểm số xu",
    "hướng chứ không phải quẻ đã lập cụ thể:",
    "- Đóng khung MỌI điều là XU HƯỚNG/KHUYNH HƯỚNG cần lưu ý, không phải điều chắc chắn xảy ra.",
    "- Điểm cao cũng KHÔNG hứa hẹn tuyệt đối (\"chắc chắn giàu\", \"chắc chắn thăng chức\") — dùng \"thuận lợi cho\", \"là thời điểm tốt để\".",
    "",
    "AN TOÀN NỘI DUNG — RÀNG BUỘC CỨNG, KHÔNG ĐƯỢC NỚI (app người dùng cuối tự đọc, không có thầy lọc):",
    ...QUY_TAC_DIEN_DAT.map((q) => `- ${q}`),
    `- TUYỆT ĐỐI KHÔNG dùng bất kỳ từ/cụm nào sau đây, dưới mọi hình thức: ${TU_KHOA_CAM_TUYET_DOI.join(", ")}.`,
    "- Đây là quy tắc cứng nhất trong toàn bộ prompt này — vi phạm dù chỉ 1 từ cũng khiến câu trả lời bị chặn và thay bằng câu mẫu an toàn, không hiển thị được nội dung bạn viết.",
    "",
    "MỖI LĨNH VỰC (tai_van, quan_van, suc_khoe, tinh_duyen): viết 2-4 câu, dựa đúng canCu của lĩnh vực đó. Không lặp lại y nguyên canCu, hãy diễn đạt lại bằng lời tự nhiên cho người đọc dễ hiểu.",
  ].join("\n");
}

export interface DiemLinhVucChoAI {
  daiVanCanChi: string;
  namLuuNien: number;
  tuoi: number;
  gioiTinh: "Nam" | "Nữ";
  diem4LinhVuc: DiemLinhVuc[];
}

export function userPrompt(input: DiemLinhVucChoAI): string {
  const x = xungHo(input.gioiTinh);
  return [
    `Người hỏi (gọi là "${x}") đang ở Đại Vận ${input.daiVanCanChi}, Lưu Niên năm ${input.namLuuNien} (${input.tuoi} tuổi).`,
    "",
    "DỮ LIỆU ĐIỂM SỐ (do engine tính, là nguồn sự thật duy nhất — viết lời luận TỪ đây):",
    JSON.stringify(
      Object.fromEntries(input.diem4LinhVuc.map((d) => [d.linhVuc, { diem: d.diem, nhan: d.nhan, canCu: d.canCu }])),
      null,
      1,
    ),
    "",
    "Hãy viết lời luận qua công cụ đã cho, đủ 4 lĩnh vực.",
  ].join("\n");
}
