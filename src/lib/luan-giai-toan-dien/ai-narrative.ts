// TẦNG 2 — AI NARRATIVE. Gọi Claude API THEO TỪNG GIAI ĐOẠN (không gộp), đúng khung prompt trong
// content/bat-tu/prompts/khung-chung.md + giai-doan-A-L.md. Cùng hạ tầng gọi AI với
// `nghe-nghiep/llm-luan-van.ts` (retry 429/5xx, cache_control ephemeral, log chi phí).
import { ghiLogChiPhi, type UsageAnthropic } from "../chart-profile/ghi-log-chi-phi";
import { docNhieuKnowledge } from "./content-loader";
import {
  tuKhoaCamTuyetDoiDangText,
  tuDienThayTheDangText,
  quyTacDienDatChungDangText,
  quyTacRiengGiaiDoan,
  xoaTheLaConSot,
} from "./content-safety";
import type { GiaiDoanFindings, MaGiaiDoan } from "./types";
import { goiAiToolUse, type TinhNangAi } from "../ai/goi-ai";

const DEFAULT_MODEL = "claude-sonnet-5";
const TOOL_NAME = "tra_ve_doan_van";

export interface GiaiDoanConfig {
  ma: MaGiaiDoan;
  ten: string;
  tang: "co_ban" | "nang_cao";
  knowledgeFiles: string[];
  doDaiGoiY: string;
  quyTacRieng?: "D" | "E" | "F";
  canKiemDuyet?: boolean; // F, I: gọi thêm 1 lượt AI chỉnh từ ngữ sau khi viết xong.
  /** Chỉ dẫn riêng thay cho việc đọc knowledge (Giai đoạn A) hoặc tổng hợp nhiều giai đoạn (L). */
  huongDanRieng?: string;
}

export const GIAI_DOAN_CO_BAN: GiaiDoanConfig[] = [
  { ma: "A", ten: "Nền tảng", tang: "co_ban", knowledgeFiles: [], doDaiGoiY: "150-200 chữ",
    huongDanRieng: "Viết đoạn mở đầu báo cáo, tóm tắt: Nhật Chủ là gì, mức độ vượng/suy (dùng cách nói dễ hiểu, ví dụ \"Nhật Chủ khá yếu, cần thêm trợ lực\" thay vì chỉ nói \"Nhược\"), Dụng Thần là hành gì và vì sao (1 câu lý do ngắn gọn, không cần giải thích kỹ thuật đầy đủ), và nếu có Cách Cục đặc biệt/Cách Cục Tài Quan nào thành thì nhắc ngắn gọn. Đây là đoạn MỞ ĐẦU cho khách chưa biết gì về Bát Tự — viết dễ hiểu, không dùng thuật ngữ mà không giải thích kèm." },
  { ma: "B", ten: "Tính cách", tang: "co_ban", knowledgeFiles: ["tinh-cach-nhat-nguyen.md", "tuong-y-can-chi.md"], doDaiGoiY: "250-350 chữ" },
  { ma: "C", ten: "Thập Thần theo cung", tang: "co_ban", knowledgeFiles: ["thap-than.md"], doDaiGoiY: "200-300 chữ" },
  { ma: "G", ten: "Nghề nghiệp / Tài / Quan / Công danh", tang: "co_ban", knowledgeFiles: ["dung-than.md", "tai-van.md", "quan-van.md"], doDaiGoiY: "400-500 chữ" },
  { ma: "H", ten: "Hôn nhân", tang: "co_ban", knowledgeFiles: ["hon-nhan.md"], doDaiGoiY: "300-450 chữ" },
  { ma: "J", ten: "Ngũ hành thực hành", tang: "co_ban", knowledgeFiles: [], doDaiGoiY: "100-150 chữ" },
  { ma: "L", ten: "Kết luận", tang: "co_ban", knowledgeFiles: [], doDaiGoiY: "200-300 chữ",
    huongDanRieng: "Bạn đã nhận được findings của các Giai đoạn thuộc bản LUẬN CƠ BẢN: A, B, C, G, H, J (KHÔNG có D, E, F, I, K — vì đó thuộc bản Nâng Cao, khách có thể chưa mua). Nhiệm vụ: 1) Tóm tắt 1 đoạn ngắn: vượng suy, Dụng/Hỷ/Kỵ Thần, Cách Cục chính, 2-3 nét tính cách cốt lõi. 2) Chọn ra ĐIỂM MẠNH NHẤT và ĐIỂM CẦN LƯU Ý NHẤT trong PHẠM VI đã luận (tính cách/Thập Thần/nghề nghiệp-tài-quan/hôn nhân) — không liệt kê lại tất cả, chỉ ưu tiên hóa 1-2 điểm quan trọng nhất mỗi loại. 3) Đưa ra 2-3 gợi ý hành động cụ thể theo Dụng Thần (nghề nghiệp/tài chính/quan hệ — KHÔNG nói về sức khỏe hay lục thân chi tiết vì thuộc phạm vi bản Nâng Cao). 4) Kết đoạn bằng 1-2 câu mời gọi tự nhiên (không sale sống sượng) về việc bản Nâng Cao sẽ đi sâu hơn vào Thần Sát, gia đình - lục thân, sức khỏe, và trọn vẹn vận trình từ nhỏ đến già — chỉ nêu đây là lựa chọn thêm nếu khách muốn hiểu sâu hơn, không tạo cảm giác bản Cơ Bản là \"thiếu\" hay \"cắt xén\". Giữ đúng mọi nguyên tắc an toàn nội dung như các giai đoạn khác." },
];

export const GIAI_DOAN_NANG_CAO: GiaiDoanConfig[] = [
  { ma: "D", ten: "Thần Sát", tang: "nang_cao", knowledgeFiles: ["than-sat.md"], doDaiGoiY: "200-350 chữ (tùy số sao có mặt)", quyTacRieng: "D" },
  { ma: "E", ten: "Mộ Khố", tang: "nang_cao", knowledgeFiles: ["mo-kho.md"], doDaiGoiY: "100-150 chữ (bỏ qua nếu không có Mộ Khố nào)", quyTacRieng: "E" },
  { ma: "F", ten: "Lục Thân", tang: "nang_cao", knowledgeFiles: ["luc-than.md"], doDaiGoiY: "400-600 chữ", quyTacRieng: "F", canKiemDuyet: true },
  { ma: "I", ten: "Sức khỏe", tang: "nang_cao", knowledgeFiles: ["benh-tat.md"], doDaiGoiY: "250-350 chữ", canKiemDuyet: true },
  { ma: "K", ten: "Đại Vận trọn đời", tang: "nang_cao", knowledgeFiles: ["ung-ky.md", "quan-he-can-chi.md"], doDaiGoiY: "80-120 chữ",
    huongDanRieng: "Chỉ viết đoạn GIỚI THIỆU ngắn cho phần Đại Vận trọn đời — nêu quy luật chung 1-2 câu (Đại Vận nào hành trùng/sinh Dụng-Hỷ Thần thì thuận, trùng/sinh Kỵ-Cừu Thần thì cần thận trọng hơn). KHÔNG liệt kê chi tiết từng giai đoạn — phần chi tiết từng giai đoạn (điểm số sức khỏe/công việc/tài lộc/lục thân) đã có đồ hình riêng ngay bên dưới đoạn này, không cần lặp lại bằng văn xuôi." },
];

const SCHEMA = {
  type: "object",
  properties: {
    noi_dung: { type: "string", description: "Đoạn văn xuôi hoàn chỉnh cho giai đoạn này. Để chuỗi rỗng nếu findings không đủ căn cứ để viết." },
  },
  required: ["noi_dung"],
} as const;

function buildSystemPrompt(cfg: GiaiDoanConfig, laSoJSON: string, findingsJSON: string): string {
  const noiDungKnowledgeMd = cfg.knowledgeFiles.length > 0 ? docNhieuKnowledge(cfg.knowledgeFiles) : "(không cần — dùng thẳng dữ liệu lá số/findings đã có, không có tài liệu diễn giải riêng cho giai đoạn này.)";
  const quyTacRiengGiaiDoanText = cfg.quyTacRieng ? quyTacRiengGiaiDoan(cfg.quyTacRieng) : "";

  return [
    "Bạn là trợ lý viết báo cáo luận giải Bát Tự cho website phongthuythienanh.com. Nhiệm vụ của bạn CHỈ là viết văn xuôi từ dữ liệu đã được xác định sẵn — bạn KHÔNG tự tính toán lại Bát Tự, KHÔNG bịa thêm dấu hiệu không có trong dữ liệu.",
    "",
    "## Lá số đang luận",
    laSoJSON,
    "(Tứ Trụ, Nhật Chủ, vượng suy, Dụng/Hỷ/Kỵ/Cừu Thần đã được engine tính sẵn — dùng nguyên, không tính lại.)",
    "",
    `## Dữ kiện đã xác định cho giai đoạn "${cfg.ten}" (structural findings)`,
    findingsJSON,
    "Đây là TOÀN BỘ những gì bạn được phép nói tới. Nếu 1 mục trong findings rỗng/không có, bỏ qua mục đó, không cố viết cho đủ, không suy diễn thêm.",
    "",
    "## Tài liệu tham khảo cho giai đoạn này",
    noiDungKnowledgeMd,
    "(Đọc kỹ — đây là nguồn tri thức Bát Tự duy nhất bạn được dùng để diễn giải findings ở trên. Không dùng kiến thức Bát Tự khác ngoài tài liệu này.)",
    "",
    "## NGUYÊN TẮC AN TOÀN NỘI DUNG (BẮT BUỘC TUÂN THỦ TUYỆT ĐỐI)",
    "",
    "Nguyên tắc cốt lõi: Nói THẲNG nội dung — đúng những gì findings chỉ ra, không né tránh, không giấu bớt, không thêm dấu hiệu tích cực giả để \"cho đỡ nặng\". Chỉ CÁCH DÙNG TỪ mới cần nhẹ nhàng.",
    "",
    `Tuyệt đối KHÔNG dùng các từ sau trong bất kỳ hoàn cảnh nào: ${tuKhoaCamTuyetDoiDangText()}`,
    "",
    "Từ điển thay thế cách gọi (dùng CHỦ ĐỘNG khi viết, không chờ bị sửa sau):",
    tuDienThayTheDangText(),
    "",
    "Quy tắc diễn đạt chung:",
    quyTacDienDatChungDangText(),
    "",
    quyTacRiengGiaiDoanText,
    "",
    cfg.huongDanRieng ? `## Chỉ dẫn riêng cho giai đoạn này\n${cfg.huongDanRieng}` : "",
    "",
    "## Yêu cầu định dạng",
    "- Viết văn xuôi tiếng Việt tự nhiên, giọng điềm đạm, ấm áp, không giáo điều.",
    `- Độ dài: ${cfg.doDaiGoiY} (điều chỉnh theo lượng findings thực có, findings ít thì viết ngắn, không độn chữ).`,
    "- Không dùng gạch đầu dòng liệt kê khô khan, viết thành đoạn văn liền mạch.",
    "- Không lặp lại nguyên văn thuật ngữ Hán Việt (Thất Sát, Kiếp Tài...) quá nhiều lần liên tiếp, xen kẽ diễn giải bằng ngôn ngữ đời thường.",
    "- TUYỆT ĐỐI KHÔNG dùng dấu gạch ngang \"-\" hay chấm phẩy \";\" để nối câu (đây là lỗi văn phong lộ rõ là AI viết) — thay bằng dấu phẩy, chấm câu, hoặc viết lại thành 2 câu riêng.",
    "- TUYỆT ĐỐI KHÔNG chèn bất kỳ thẻ/ký hiệu nào giống code hoặc XML (vd </noi_dung>, <invoke>, **, ##) vào NỘI DUNG văn xuôi — chỉ viết văn xuôi thuần tuý tiếng Việt, không có ký hiệu định dạng nào khác ngoài dấu câu thông thường.",
    "- KHÔNG viết các câu sáo rỗng kiểu AI tự nhận xét về dữ liệu (vd \"dữ liệu chưa đủ căn cứ để xác định rõ\", \"không có đủ thông tin để phân tích sâu hơn\") — nếu 1 khía cạnh không đủ căn cứ, ĐƠN GIẢN LÀ BỎ QUA khía cạnh đó, không nhắc tới việc thiếu dữ liệu.",
  ].join("\n");
}

/**
 * `system` nhận 1 chuỗi, HOẶC `[phầnCốĐịnh, phầnThayĐổi]`.
 *
 * Dạng 2 phần dùng cho prompt caching giữa NHIỀU lệnh gọi khác nhau: Anthropic khớp cache theo TIỀN
 * TỐ (tools → system → messages), nên khối tri thức lớn phải nằm TRƯỚC dữ liệu riêng của từng lệnh
 * thì lệnh sau mới đọc lại được cache (0,1x) thay vì ghi cache mới (1,25x). Chỉ đánh dấu
 * `cache_control` ở phần cố định; phần thay đổi nằm sau breakpoint nên không phá cache.
 * ⚠️ Muốn cache dùng chung được thì `tools` (render TRƯỚC system) cũng phải giống hệt nhau.
 */
/**
 * `system` nhận 1 chuỗi, HOẶC `[phầnCốĐịnh, phầnThayĐổi]` để bật prompt caching dùng chung giữa
 * nhiều lệnh (xem ghi chú ở `luu-nien-dai-van.ts`).
 *
 * Nay uỷ quyền cho `goiAiToolUse` — lớp dùng chung tự chọn nhà cung cấp (Anthropic / OpenAI tương
 * thích) theo BẢNG trong `src/lib/ai/goi-ai.ts`, nên đổi nhà cung cấp không phải sửa file này.
 */
export async function goiClaudeToolUse(
  system: string | [string, string],
  userMessage: string,
  toolName: string,
  schema: object,
  maxTokens: number,
  tinhNang: TinhNangAi = "bat-tu-giai-doan",
  // ⚠️ Model mặc định của DeepSeek trên site (deepseek-v4-flash) là model "thinking": từ chối
  // tool_choice ép buộc mà goiAiToolUse LUÔN dùng — đo thật 30/8/2026 (Huyền Không, Kinh Dịch): gọi
  // thất bại 100%. Truyền modelOverride cho các tinhNang đang route sang DeepSeek (bat-tu-cham-diem,
  // bat-tu-kiem-duyet) để ép deepseek-chat (non-thinking, đã kiểm chứng chạy đúng).
  modelOverride?: Parameters<typeof goiAiToolUse>[0]["modelOverride"],
): Promise<{ input: Record<string, unknown> | null; usage?: UsageAnthropic; model?: string }> {
  const [systemCoDinh, systemThayDoi] = Array.isArray(system) ? system : [system, undefined];
  const kq = await goiAiToolUse({ tinhNang, systemCoDinh, systemThayDoi, userMessage, toolName, schema, maxTokens, modelOverride });
  return { input: kq.input, usage: kq.usage, model: kq.model };
}

/**
 * Viết văn cho 1 giai đoạn. `findingsPhu` (chỉ dùng cho L): mảng findings của các giai đoạn khác
 * cần tổng hợp thêm ngoài findings chính truyền vào `findings`.
 */
export async function viecGiaiDoan(cfg: GiaiDoanConfig, laSo: unknown, findings: GiaiDoanFindings, findingsPhu?: GiaiDoanFindings[]): Promise<string | null> {
  const laSoJSON = JSON.stringify(laSo, null, 2);
  const findingsGop = findingsPhu ? [findings, ...findingsPhu] : [findings];
  const findingsJSON = JSON.stringify(findingsGop.length === 1 ? findingsGop[0] : findingsGop, null, 2);

  const system = buildSystemPrompt(cfg, laSoJSON, findingsJSON);
  const userMessage = `Hãy viết đoạn văn cho giai đoạn "${cfg.ten}" (${cfg.ma}) theo đúng dữ liệu và nguyên tắc đã nêu ở system prompt.`;

  const { input, usage, model } = await goiClaudeToolUse(system, userMessage, TOOL_NAME, SCHEMA, 2000);
  ghiLogChiPhi(`Luận giải Bát Tự — Giai đoạn ${cfg.ma}`, model ?? DEFAULT_MODEL, usage);
  if (!input) return null;
  const noiDung = typeof input.noi_dung === "string" ? xoaTheLaConSot(input.noi_dung.trim()) : "";
  return noiDung.length > 0 ? noiDung : null;
}

const SCHEMA_KIEM_DUYET = {
  type: "object",
  properties: {
    noi_dung: { type: "string", description: "Đoạn văn sau khi kiểm duyệt (hoặc nguyên văn nếu không cần sửa)." },
  },
  required: ["noi_dung"],
} as const;

/** Lượt "kiểm duyệt viên" riêng cho Giai đoạn F/I — CHỈ chỉnh từ ngữ, không xóa/pha loãng kết luận. */
export async function kiemDuyetDoanVan(doanVan: string): Promise<string> {
  const system = [
    "Bạn là người kiểm duyệt nội dung nhạy cảm. Dưới đây là 1 đoạn báo cáo Bát Tự đã được viết.",
    "Nhiệm vụ của bạn KHÔNG phải xóa bớt hay pha loãng nội dung/kết luận đã có — mà CHỈ kiểm tra và",
    `chỉnh sửa CÁCH DÙNG TỪ nếu có chỗ nào còn nặng nề, gây hoang mang, hoặc lỡ dùng phải từ trong`,
    `danh sách cấm sau: ${tuKhoaCamTuyetDoiDangText()}.`,
    "",
    "Nếu đoạn văn đã ổn, trả về NGUYÊN VĂN không đổi gì.",
    "Nếu cần sửa, chỉ sửa TỪ NGỮ của câu có vấn đề, giữ nguyên toàn bộ những câu khác và giữ nguyên Ý đang truyền tải.",
  ].join("\n");
  const userMessage = `Đoạn văn cần kiểm tra:\n${doanVan}`;

  const { input, usage, model } = await goiClaudeToolUse(system, userMessage, "tra_ve_doan_van_da_kiem_duyet", SCHEMA_KIEM_DUYET, 2000, "bat-tu-kiem-duyet", { "openai-tuong-thich": "deepseek-chat" });
  ghiLogChiPhi("Luận giải Bát Tự — Kiểm duyệt F/I", model ?? DEFAULT_MODEL, usage);
  if (!input) return doanVan; // AI lỗi → giữ nguyên bản gốc thay vì mất nội dung.
  const noiDung = typeof input.noi_dung === "string" ? xoaTheLaConSot(input.noi_dung.trim()) : "";
  return noiDung.length > 0 ? noiDung : doanVan;
}
