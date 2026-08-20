/**
 * Dựng prompt gửi Claude để luận TỬ VI (Nam Phái) — chỉ dựng chuỗi, không tự luận.
 * Nguồn DUY NHẤT: tri thức gọn trích ở `knowledge-tu-vi.ts`. Thiếu căn cứ → insufficient_data.
 */
import type { TuViFacts } from "./types-tu-vi";
import { loadTuViKnowledge } from "./knowledge-tu-vi";

const OUTPUT_SCHEMA_INSTRUCTIONS = `
Trả lời DUY NHẤT một khối JSON hợp lệ (không kèm chữ nào ngoài JSON, không markdown fence), đúng cấu trúc
sau. Với MỌI trường, nếu tài liệu /knowledge và DỮ LIỆU ĐẦU VÀO không đủ căn cứ, điền đúng chuỗi
"insufficient_data" — TUYỆT ĐỐI không suy diễn/bịa:

{
  "menh_cach": {
    "chinh": "tu_phu_vu_tuong | sat_pha_liem_tham | co_nguyet_dong_luong | insufficient_data",
    "phu": ["<0..n cách phụ, mỗi phần tử là 1 key: cu_nhat, cu_co_mao_dau, tham_vu_dong_hanh, tang_ho_thu_menh, van_tinh_am_cung, dich_ma>"],
    "vo_chinh_dieu": true/false,
    "muon_cach_cung_di": true/false,
    "do_sang": "mieu_vuong | binh | ham | insufficient_data"
  },
  "danh_gia_cung": {
    "quan_loc": "cat | binh | hung | insufficient_data",
    "tai_bach": "cat | binh | hung | insufficient_data",
    "thien_di": "cat | binh | hung | insufficient_data",
    "phuc_duc": "cat | binh | hung | insufficient_data"
  },
  "dai_han": [
    // ĐÚNG SỐ LƯỢNG và ĐÚNG THỨ TỰ như "daiHan" trong DỮ LIỆU ĐẦU VÀO — mỗi phần tử 1 Đại Hạn.
    { "chuDe": "hoc_tap | su_nghiep | tai_van | hon_nhan | suc_khoe | insufficient_data", "mucThuan": "cao | trung_binh | thap | insufficient_data" }
  ],
  "warnings": ["<mâu thuẫn/nghi vấn khi luận — câu tiếng Việt ngắn, nếu có>"]
}

Quy tắc bắt buộc:
- "chinh" (mệnh cách nền) chỉ điền 1 trong 3 tam hợp cách khi lá số ĐẠT cách theo tài liệu (đủ bộ sao
  ở Mệnh/Thiên Di/Tài/Quan). Không ép cho khớp.
- "danh_gia_cung": chỉ đánh giá cung mà DỮ LIỆU ĐẦU VÀO có chính tinh; cung không có dữ liệu (vd Phúc Đức
  nếu không xuất hiện) → "insufficient_data".
- Chỉ dùng tri thức trong phần TRI THỨC bên dưới; không dùng kiến thức Tử Vi chung ngoài tài liệu này.
`.trim();

export function buildTuViSystemPrompt(): string {
  const kb = loadTuViKnowledge();
  return [
    "Bạn là bộ luận giải TỬ VI (Nam Phái - Tống Nguyên Trung) của Phong Thủy Thiên Anh — CHỈ được luận",
    "dựa trên đúng tri thức trong phần TRI THỨC dưới đây (trích gọn từ skill luan-giai-tu-vi-nam-phai).",
    "Đây là NGUỒN DUY NHẤT — không dùng kiến thức Tử Vi chung mà bạn biết từ trước. Thiếu căn cứ cho một",
    "trường cụ thể thì trả \"insufficient_data\" cho trường đó — tuyệt đối không suy diễn hay bịa.",
    "",
    "===== TRI THỨC (nguồn duy nhất được phép dùng) =====",
    kb.text,
    "===== HẾT TRI THỨC =====",
  ].join("\n");
}

export function buildTuViUserPrompt(facts: TuViFacts): string {
  return [
    "DỮ LIỆU ĐẦU VÀO (an sao đã lập sẵn bằng engine — coi là SỰ THẬT bất biến, chỉ dùng để LUẬN):",
    "",
    "```json",
    JSON.stringify(facts, null, 2),
    "```",
    "",
    OUTPUT_SCHEMA_INSTRUCTIONS,
  ].join("\n");
}
