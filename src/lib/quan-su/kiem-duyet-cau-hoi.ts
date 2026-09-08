/**
 * HÀNG RÀO KIỂM DUYỆT cho ô "mô tả tình huống" (khách tự gõ) trong Luận Quẻ Kinh Dịch — anh Công
 * yêu cầu 8/9/2026: chặn TRƯỚC khi luận (không tốn lượt, không chạy AI luận giải thật) nếu nội
 * dung khách tự gõ thuộc 1 trong các nhóm:
 *   - Tục tĩu.
 *   - Mang tính chất hại người / vô đạo đức / hành vi tổn hại người khác.
 *   - Lừa đảo, chiếm đoạt tài sản.
 *   - Hành vi/âm mưu chống phá Đảng và Nhà nước.
 *
 * Áp dụng cho CẢ 120 câu hỏi (mở rộng 8/9/2026, anh Công: "cứ kiểm duyệt tránh sai sót") — ban đầu
 * chỉ định cho "cau-hoi-tu-do", nhưng 119 câu hỏi định sẵn còn lại CŨNG dùng chung ô "mo_ta_tinh_huong"
 * tự gõ (IN_MO_TA, xem questions.ts) nên cùng rủi ro. Đánh đổi: mọi câu hỏi (kể cả câu hỏi lành
 * trong danh sách định sẵn) đều tốn thêm 1 lượt gọi AI kiểm duyệt nhỏ trước khi luận — chi phí và
 * độ trễ tăng thêm không đáng kể so với lượt luận giải chính.
 *
 * AI LỖI (mất mạng/hết credit...) → COI NHƯ VI PHẠM, chặn lại (fail-CLOSED) — khác với các bước AI
 * khác trong site vốn fail-OPEN (AI hỏng thì vẫn cho khách xem bản luận thuần luật). Cố ý khác vì
 * đây là hàng rào an toàn/pháp lý (đặc biệt nhóm chống phá Nhà nước) — thà chặn nhầm 1 câu hỏi lành
 * lúc AI đang lỗi (khách thử lại là được) còn hơn để lọt 1 câu hỏi vi phạm chỉ vì lúc đó AI đang lỗi.
 */
import { goiAiToolUseVoiRetry } from "../ai/goi-ai";

export type KetQuaKiemDuyet = { viPham: false } | { viPham: true; nhomViPham: string };

const TOOL_NAME = "tra_ve_ket_qua_kiem_duyet";
const SCHEMA = {
  type: "object",
  properties: {
    vi_pham: { type: "boolean", description: "true nếu nội dung thuộc 1 trong các nhóm bị cấm nêu ở system prompt." },
    nhom_vi_pham: {
      type: "string",
      description: "Tên ngắn nhóm vi phạm (vd 'tục tĩu', 'lừa đảo/chiếm đoạt tài sản'...) — chuỗi rỗng nếu không vi phạm.",
    },
  },
  required: ["vi_pham", "nhom_vi_pham"],
} as const;

const SYSTEM_PROMPT = `Bạn là bộ lọc kiểm duyệt nội dung cho một app hỏi đáp Kinh Dịch tại Việt Nam. Khách tự gõ 1 câu hỏi/mô tả tình huống muốn hỏi Quân Sư. Nhiệm vụ DUY NHẤT của bạn: xác định nội dung đó có thuộc 1 trong các nhóm BỊ CẤM sau không — KHÔNG luận giải, KHÔNG bình luận gì thêm về nội dung câu hỏi.

Các nhóm BỊ CẤM:
1. Tục tĩu, dung tục, khiêu dâm.
2. Mang tính chất hại người, vô đạo đức, mô tả/lên kế hoạch hành vi gây tổn hại tới người khác (bạo lực, trả thù, hãm hại...).
3. Lừa đảo, chiếm đoạt tài sản của người khác.
4. Hành vi hoặc âm mưu chống phá Đảng Cộng sản Việt Nam và Nhà nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.

QUAN TRỌNG — KHÔNG chặn nhầm câu hỏi đời thường lành mạnh: hỏi về tình cảm, công việc, tài chính, sức khỏe, gia đạo, kiện tụng dân sự thông thường, các quyết định cá nhân... dù có nhắc tới xung đột/mâu thuẫn với người khác theo nghĩa đời thường (vd "có nên đòi lại nợ", "có nên ly hôn", "công ty đang tranh chấp hợp đồng") ĐỀU KHÔNG vi phạm — chỉ chặn khi nội dung THẬT SỰ mô tả/cổ súy hành vi phạm pháp hoặc thuộc đúng 4 nhóm trên.`;

/**
 * true nếu câu hỏi tự do bị chặn. AI lỗi → coi như vi phạm (xem ghi chú đầu file — fail-closed có
 * chủ đích, khác các luồng AI khác trong site).
 */
export async function kiemDuyetCauHoiTuDo(cauHoi: string): Promise<KetQuaKiemDuyet> {
  const ket = await goiAiToolUseVoiRetry({
    tinhNang: "quan-su-kiem-duyet",
    systemCoDinh: SYSTEM_PROMPT,
    userMessage: `Câu hỏi/mô tả tình huống khách vừa gõ:\n"""${cauHoi}"""`,
    toolName: TOOL_NAME,
    schema: SCHEMA,
    maxTokens: 200,
    modelOverride: { "openai-tuong-thich": "deepseek-chat" },
  });

  if (!ket.input) {
    console.error("[kiem-duyet-cau-hoi] Gọi AI kiểm duyệt thất bại — coi như vi phạm (fail-closed), chặn lại.");
    return { viPham: true, nhomViPham: "loi_he_thong_khi_kiem_duyet" };
  }

  const viPham = ket.input.vi_pham === true;
  const nhomViPham = typeof ket.input.nhom_vi_pham === "string" ? ket.input.nhom_vi_pham.trim() : "";
  return viPham ? { viPham: true, nhomViPham: nhomViPham || "khong_ro" } : { viPham: false };
}
