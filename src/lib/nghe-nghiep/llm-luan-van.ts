/**
 * TẦNG AI VIẾT LUẬN CHO KHÁCH ĐỌC.
 *
 * Anh Công 22/8/2026: "anh đã nạp tiền vào để AI đồng hành trả lời, tuy nhiên lại chưa thấy gì hay
 * ho". Nguyên nhân: tầng AI cũ (`chart-profile/llm.ts`) CHỈ trả nhãn phân loại (cau_truc,
 * chinh_phan_cuc, chuDe…) để code tra bảng — không có một trường văn xuôi nào cho khách đọc. Khách
 * trả tiền mà không thấy AI nói gì.
 *
 * Tầng này gọi lần thứ hai, SAU khi mọi con số đã chốt, và chỉ làm đúng một việc: DIỄN GIẢI thành
 * câu chữ. Ba ràng buộc cứng:
 *   1. KHÔNG được đổi kết luận đã tính (ngành nào ưu tiên, điểm bao nhiêu, Dụng Thần là gì).
 *   2. KHÔNG được thêm dữ kiện huyền học mới ngoài phần đã đưa vào.
 *   3. Thiếu căn cứ cho mục nào thì để TRỐNG mục đó — giao diện tự ẩn (anh Công: "không có thông
 *      tin thì nên bỏ qua").
 *
 * CHI PHÍ: prompt ở đây chỉ vài KB (không nhồi 183.000 ký tự tri thức như tầng phân loại), nên rẻ
 * hơn tầng kia khoảng 10 lần. Mọi lượt gọi đều được ghi log [AI-COST].
 */
import { layAnthropicApiKey } from "../chart-profile/api-key";
import { ghiLogChiPhi, type UsageAnthropic } from "../chart-profile/ghi-log-chi-phi";
import type { DashboardVM } from "./view-model";
import { ANTHROPIC_MESSAGES_URL as ANTHROPIC_API_URL, anthropicHeaders } from "../anthropic-gateway";

const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-sonnet-5";
const MAX_TOKENS = 3000;
const TOOL_NAME = "tra_ve_luan_van_nghe_nghiep";

export interface LuanVanNghe {
  chanDung: string;
  theManh: string[];
  canLuuY: string[];
  moiTruongHop: string;
  viSaoNganhNay: string;
  loTrinh: { giaiDoan: string; loiKhuyen: string }[];
}

const SCHEMA = {
  type: "object",
  properties: {
    chan_dung: { type: "string", description: "4-6 câu chân dung nghề nghiệp của người này. Xưng hô trung tính ('bạn'). Để chuỗi rỗng nếu không đủ căn cứ." },
    the_manh: { type: "array", items: { type: "string" }, description: "3-5 thế mạnh nghề nghiệp, mỗi ý 1-2 câu, PHẢI bám vào dữ liệu đã đưa." },
    can_luu_y: { type: "array", items: { type: "string" }, description: "2-4 điểm cần lưu ý/hạn chế, nói thẳng nhưng không doạ dẫm." },
    moi_truong_hop: { type: "string", description: "2-3 câu về môi trường làm việc phù hợp (quy mô tổ chức, cách quản lý, nhịp độ)." },
    vi_sao_nganh_nay: { type: "string", description: "3-5 câu giải thích VÌ SAO nhóm ngành ưu tiên lại hợp, dựa trên Dụng/Hỷ Thần và 5 trục đã tính. Không được đề xuất ngành khác ngoài danh sách." },
    lo_trinh: {
      type: "array",
      items: {
        type: "object",
        properties: {
          giai_doan: { type: "string", description: "Khoảng tuổi, đúng như đã đưa vào, ví dụ '25–34 tuổi'." },
          loi_khuyen: { type: "string", description: "1-2 câu nên làm gì trong giai đoạn đó." },
        },
        required: ["giai_doan", "loi_khuyen"],
      },
    },
  },
  required: ["chan_dung", "the_manh", "can_luu_y", "moi_truong_hop", "vi_sao_nganh_nay", "lo_trinh"],
} as const;

const SYSTEM = [
  "Bạn là người viết bản luận nghề nghiệp cho khách của Phong Thủy Thiên Anh.",
  "",
  "MỌI KẾT LUẬN HUYỀN HỌC ĐÃ ĐƯỢC TÍNH XONG và đưa cho bạn ở phần DỮ LIỆU. Việc của bạn CHỈ LÀ",
  "DIỄN GIẢI chúng thành câu chữ dễ hiểu cho một phụ huynh/người đi làm bình thường đọc.",
  "",
  "RÀNG BUỘC CỨNG:",
  "1. KHÔNG được đổi bất kỳ kết luận nào đã tính: Dụng/Hỷ/Kỵ Thần, vượng suy, thứ tự nhóm ngành,",
  "   điểm số, khoảng tuổi Đại Vận. Nếu thấy vô lý, cứ diễn giải theo dữ liệu, không tự sửa.",
  "2. KHÔNG được thêm dữ kiện huyền học mới (không thêm sao, thần sát, cách cục, ngành nghề nào",
  "   không có trong dữ liệu). Không suy diễn ngoài phạm vi đã cho.",
  "3. KHÔNG hứa hẹn chắc chắn ('sẽ giàu', 'chắc chắn thành công'), không doạ dẫm, không nói về",
  "   bệnh tật cụ thể hay tuổi thọ.",
  "4. Mục nào không đủ căn cứ trong dữ liệu thì để TRỐNG (chuỗi rỗng hoặc mảng rỗng) — tuyệt đối",
  "   KHÔNG viết 'chưa xác định', 'chưa đủ dữ liệu', 'đang cập nhật'. Giao diện sẽ tự ẩn mục trống.",
  "",
  "VĂN PHONG: tiếng Việt tự nhiên, ấm, đi thẳng vào việc. Xưng 'bạn'. Không dùng thuật ngữ Hán Việt",
  "khó mà không giải thích ngay trong câu. Không dùng tiếng Anh. Không lặp lại nguyên văn dữ liệu",
  "thô — phải chuyển thành lời nói của người tư vấn.",
].join("\n");

function dungUserPrompt(vm: DashboardVM, hoTen?: string): string {
  const nhomNganh = (ten: string, ds: DashboardVM["priority"]) =>
    ds.length === 0 ? "" : `${ten}: ${ds.map((d) => `${d.label} (${d.score} điểm — ví dụ: ${d.majors.slice(0, 4).map((m) => m.name).join(", ")})`).join(" | ")}`;

  return [
    hoTen ? `Khách hàng: ${hoTen}` : "",
    "",
    "=== NỀN LÁ SỐ (đã tính bằng công thức, coi là sự thật) ===",
    vm.chips.map((c) => `- ${c.label}: ${c.value}`).join("\n"),
    vm.tuTru ? `- Tứ Trụ: ${vm.tuTru.map((t) => `${t.can} ${t.chi}`).join(" / ")}` : "",
    vm.nguHanhPhanBo ? `- Phân bố Ngũ Hành: ${vm.nguHanhPhanBo.map((p) => `${p.hanh} ${p.phanTram}%`).join(", ")}` : "",
    "",
    "=== 5 TRỤC NGHỀ NGHIỆP (điểm càng cao càng nghiêng về trục đó) ===",
    vm.vectorInsufficient || !vm.vector ? "(không đủ dữ liệu)" : Object.entries(vm.vector).map(([k, v]) => `- ${k}: ${v}`).join("\n"),
    vm.vectorDetail ? `Cách tính: ${vm.vectorDetail}` : "",
    "",
    "=== TRỤC LÀM CHỦ / LÀM THUÊ ===",
    vm.axisInsufficient ? "(không đủ dữ liệu)" : `Điểm trục: ${vm.axis}. Kết luận đã chốt: ${vm.axisKetLuan}`,
    "",
    "=== NHÓM NGÀNH ĐÃ CHẤM (KHÔNG được thêm/bớt ngành) ===",
    nhomNganh("Ưu tiên", vm.priority),
    nhomNganh("Phù hợp", vm.suitable),
    nhomNganh("Có thể cân nhắc", vm.possible),
    vm.domainDetail ? `Cách tính điểm ngành: ${vm.domainDetail}` : "",
    "",
    "=== CÁC GIAI ĐOẠN VẬN (dùng đúng khoảng tuổi này cho mục lo_trinh) ===",
    vm.timeline.map((s) => `- ${s.tuTuoi}–${s.denTuoi} tuổi: ${s.top}, chủ đề ${s.chuDe}, mức ${s.badge?.label ?? ""}`).join("\n"),
    "",
    "Hãy viết bản luận theo đúng cấu trúc công cụ. Nhớ: mục nào không đủ căn cứ thì để trống.",
  ]
    .filter((x) => x !== "")
    .join("\n");
}

export async function luanVanNghe(vm: DashboardVM, hoTen?: string): Promise<LuanVanNghe | null> {
  const apiKey = layAnthropicApiKey();
  if (!apiKey) return null;
  const model = (typeof process !== "undefined" ? process.env?.ANTHROPIC_MODEL : undefined) || DEFAULT_MODEL;

  const body = JSON.stringify({
    model,
    max_tokens: MAX_TOKENS,
    // System giống nhau mọi khách → cache lại cho rẻ.
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: dungUserPrompt(vm, hoTen) }],
    tools: [{ name: TOOL_NAME, description: "Trả về bản luận nghề nghiệp đã diễn giải.", input_schema: SCHEMA }],
    tool_choice: { type: "tool", name: TOOL_NAME },
  });

  const RETRYABLE = new Set([429, 500, 502, 503, 504, 529]);
  let res: Response | null = null;
  for (let lan = 1; lan <= 3; lan++) {
    try {
      res = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: anthropicHeaders(apiKey, ANTHROPIC_VERSION),
        body,
      });
    } catch {
      res = null;
    }
    if (res && res.ok) break;
    if (res && !RETRYABLE.has(res.status)) break;
    if (lan < 3) await new Promise((r) => setTimeout(r, 800 * lan));
  }
  if (!res || !res.ok) {
    console.error(`[luan-van-nghe] Gọi AI thất bại: ${res ? `HTTP ${res.status}` : "lỗi mạng"}`);
    return null;
  }

  const data = (await res.json()) as { content?: { type: string; input?: unknown }[]; usage?: UsageAnthropic };
  ghiLogChiPhi("Luận văn nghề nghiệp", model, data.usage);

  const toolUse = data.content?.find((c) => c.type === "tool_use");
  if (!toolUse || typeof toolUse.input !== "object" || toolUse.input === null) return null;
  const o = toolUse.input as Record<string, unknown>;

  const chuoi = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
  const mang = (v: unknown): string[] => (Array.isArray(v) ? v.map(chuoi).filter(Boolean) : []);

  const luan: LuanVanNghe = {
    chanDung: chuoi(o.chan_dung),
    theManh: mang(o.the_manh),
    canLuuY: mang(o.can_luu_y),
    moiTruongHop: chuoi(o.moi_truong_hop),
    viSaoNganhNay: chuoi(o.vi_sao_nganh_nay),
    loTrinh: Array.isArray(o.lo_trinh)
      ? (o.lo_trinh as Record<string, unknown>[])
          .map((x) => ({ giaiDoan: chuoi(x?.giai_doan), loiKhuyen: chuoi(x?.loi_khuyen) }))
          .filter((x) => x.giaiDoan && x.loiKhuyen)
      : [],
  };

  // Rỗng hoàn toàn thì coi như không có, để giao diện ẩn cả khối.
  const coNoiDung = luan.chanDung || luan.theManh.length || luan.canLuuY.length || luan.moiTruongHop || luan.viSaoNganhNay || luan.loTrinh.length;
  return coNoiDung ? luan : null;
}
