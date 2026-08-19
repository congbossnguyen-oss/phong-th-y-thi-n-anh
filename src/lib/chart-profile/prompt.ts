/**
 * Dựng prompt gửi Claude để luận Bát Tự — CHỈ dựng chuỗi văn bản, không tự luận gì ở đây.
 *
 * Nguyên tắc "grounding" tham khảo `docs/08-ai-engine.md` (thiết kế AI Engine nội bộ, chưa triển
 * khai nhưng cùng nguyên tắc): prompt hệ thống chỉ chứa (1) tri thức trong /handoff/knowledge và
 * (2) sự thật Tứ Trụ đã tính sẵn — không đưa thêm kiến thức nền nào khác, và ra lệnh tường minh
 * "thiếu căn cứ thì trả insufficient_data, không suy diễn".
 */
import type { BatTuFacts } from "./types";
import { loadBatTuKnowledge } from "./knowledge";

const OUTPUT_SCHEMA_INSTRUCTIONS = `
Trả lời DUY NHẤT một khối JSON hợp lệ (không kèm chữ nào khác ngoài JSON, không dùng markdown code fence),
đúng cấu trúc sau. Với MỌI trường liệt kê dưới, nếu tài liệu /knowledge không đủ căn cứ để kết luận, điền
đúng chuỗi "insufficient_data" — TUYỆT ĐỐI không suy diễn hay bịa ra một giá trị "nghe hợp lý":

{
  "vuong_suy": "cuc_cuong | cuong_vuong | vuong | trung_hoa | suy | nhuoc | cuc_nhuoc | insufficient_data",
  "dung_than": "kim | moc | thuy | hoa | tho | insufficient_data",
  "hy_than": "kim | moc | thuy | hoa | tho | insufficient_data",
  "ky_than": "kim | moc | thuy | hoa | tho | insufficient_data",
  "cach_cuc": ["<tên 1 trong 10 Cách Cục Tài Quan biến hoá của skill luan-giai-bat-tu, có thể nhiều hoặc rỗng>"],
  "thap_than_noi_bat": ["<2-4 Thập Thần nổi bật nhất trong lá số>"],
  "manh_phai": {
    "the": "vuong | nhuoc | insufficient_data",
    "to_cong": "<1 câu mô tả Tố Công theo skill Manh Phái, hoặc insufficient_data>",
    "cau_truc": "<PHẢI là đúng 1 trong các key: thuc_thuong_che_quan_sat, tai_che_an, quan_sat_che_ty_kiep, an_che_thuc_thuong, ty_kiep_che_tai, hoa_quan_sat_sinh_an, thuc_than_sinh_tai, thuong_quan_sinh_tai, hop_dung, che_mo_kho — hoặc insufficient_data nếu lá số không rơi rõ vào cơ chế nào>",
    "chinh_phan_cuc": "chinh_cuc | phan_cuc | insufficient_data",
    "hieu_suat": {
      "co_che": "xung | hinh | hai | insufficient_data",
      "muc": "cao | trung_binh | thap | insufficient_data"
    }
  },
  "dai_van": [
    // ĐÚNG SỐ LƯỢNG PHẦN TỬ và ĐÚNG THỨ TỰ như "daiVan" trong DỮ LIỆU ĐẦU VÀO bên dưới — mỗi phần tử
    // đánh giá 1 Đại Vận tương ứng theo Dụng/Hỷ/Kỵ đã kết luận ở trên.
    { "dungHy": "dung | hy | trung | ky | insufficient_data", "chuDe": "<chủ đề vận: hoc_tap | tai_van | su_nghiep | hon_nhan | suc_khoe | insufficient_data>", "mucThuan": "cao | trung_binh | thap | insufficient_data" }
  ],
  "warnings": ["<liệt kê nếu có mâu thuẫn/nghi vấn khi luận — câu tiếng Việt ngắn>"]
}

Quy tắc bắt buộc:
- "cau_truc" (cơ chế Manh Phái) chỉ điền khi lá số THỰC SỰ khớp mô hình vị trí của cơ chế đó theo
  đúng tài liệu — không ép cho khớp một cơ chế nào chỉ vì phải điền.
- "he_so" của hiệu suất KHÔNG cần bạn tự tính — hệ thống sẽ tự tra từ "muc"/"co_che" bạn chọn.
- Chỉ dùng tri thức trong phần TRI THỨC bên dưới. Không dùng kiến thức Bát Tự chung ngoài tài liệu này.
`.trim();

export function buildBatTuSystemPrompt(): string {
  const kb = loadBatTuKnowledge();
  return [
    "Bạn là bộ luận giải Bát Tự (Tứ Trụ) của Phong Thủy Thiên Anh — CHỈ được luận giải dựa trên",
    "đúng tri thức trong phần TRI THỨC dưới đây (trích từ 2 skill: luan-giai-bat-tu, ",
    "luan-giai-bat-tu-manh-phai). Đây là NGUỒN DUY NHẤT — không dùng kiến thức Bát Tự chung mà bạn",
    "biết từ trước, kể cả khi nó \"đúng về mặt lý thuyết\". Nếu tài liệu không đề cập một trường hợp",
    "cụ thể đang gặp, PHẢI trả \"insufficient_data\" cho trường đó — tuyệt đối không suy diễn hay bịa.",
    "",
    "===== TRI THỨC (nguồn duy nhất được phép dùng) =====",
    kb.text,
    "===== HẾT TRI THỨC =====",
  ].join("\n");
}

export function buildBatTuUserPrompt(facts: BatTuFacts): string {
  return [
    "DỮ LIỆU ĐẦU VÀO (Tứ Trụ + Đại Vận đã lập sẵn bằng công thức xác định — coi là SỰ THẬT bất biến,",
    "không được tính lại hay nghi ngờ, chỉ dùng để LUẬN):",
    "",
    "```json",
    JSON.stringify(facts, null, 2),
    "```",
    "",
    OUTPUT_SCHEMA_INSTRUCTIONS,
  ].join("\n");
}
