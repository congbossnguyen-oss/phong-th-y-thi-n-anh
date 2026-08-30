/**
 * Gọi AI để luận quẻ — CHỈ tầng gọi mạng + ép JSON đúng khuôn. Không luận gì ở đây.
 *
 * Đi qua lớp gọi AI dùng chung (`lib/ai/goi-ai.ts`) — nhà cung cấp (Anthropic hay DeepSeek qua
 * tom.qnt.world) chọn theo bảng BANG_NHA_CUNG_CAP ở đó bằng tinhNang "quan-su-kinh-dich", không
 * hard-code Anthropic ở đây nữa.
 */
import { goiAiToolUse } from "../../ai/goi-ai";
import { ghiLogChiPhi } from "../../chart-profile/ghi-log-chi-phi";

const MAX_TOKENS = 3000;
const TOOL_NAME = "tra_ve_luan_giai_kinh_dich";

export const KET_LUAN_ENUM = ["NEN", "KHONG_NEN", "NEN_CHO", "CO_DIEU_KIEN"] as const;
export type KetLuanKinhDich = (typeof KET_LUAN_ENUM)[number];

export interface LuanGiaiKinhDich {
  dung_than: string;
  phan_tich: string[];
  nguyen_nhan_cot_loi: string;
  ket_luan: KetLuanKinhDich;
  diem_can_luu_y: string[];
  quan_su_khuyen: string[];
  phuong_phap_hoa_giai: string[];
  thoi_diem_khuyen_nghi: string;
}

export type KetQuaLlm =
  | { ok: true; luan: LuanGiaiKinhDich }
  | { ok: false; ly_do: "khong_co_api_key" | "loi_goi_api" | "phan_hoi_khong_hop_le"; chi_tiet: string };

const INPUT_SCHEMA = {
  type: "object",
  properties: {
    dung_than: { type: "string", description: "Dụng Thần đã chọn, ví dụ 'Thê Tài'. Kèm một câu ngắn vì sao chọn." },
    phan_tich: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
    nguyen_nhan_cot_loi: { type: "string" },
    ket_luan: { type: "string", enum: [...KET_LUAN_ENUM] },
    diem_can_luu_y: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
    quan_su_khuyen: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
    phuong_phap_hoa_giai: {
      type: "array",
      items: { type: "string" },
      description: "Để MẢNG RỖNG nếu quẻ không báo hung. Không bịa vấn đề để hóa giải.",
    },
    thoi_diem_khuyen_nghi: { type: "string", description: "Chuỗi rỗng nếu quẻ không có chỉ dấu thời điểm." },
  },
  required: [
    "dung_than", "phan_tich", "nguyen_nhan_cot_loi", "ket_luan",
    "diem_can_luu_y", "quan_su_khuyen", "phuong_phap_hoa_giai", "thoi_diem_khuyen_nghi",
  ],
} as const;

export async function goiLuanGiaiKinhDich(
  promptTriThuc: string,
  promptQuyTac: string,
  promptNguoiDung: string,
): Promise<KetQuaLlm> {
  const ket = await goiAiToolUse({
    tinhNang: "quan-su-kinh-dich",
    systemCoDinh: promptTriThuc,
    systemThayDoi: promptQuyTac,
    userMessage: promptNguoiDung,
    toolName: TOOL_NAME,
    schema: INPUT_SCHEMA,
    maxTokens: MAX_TOKENS,
    // ⚠️ Model mặc định của DeepSeek trên site (deepseek-v4-flash) là model "thinking": từ chối
    // tool_choice ép buộc — đo thật 30/8/2026 khi so sánh nhà cung cấp: gọi thất bại 100% (trả null
    // ngay, không có tool_calls), Hỏi Quân Sư âm thầm rớt về bản luận thuần luật (isDemo=true) dù
    // khách vẫn trả tiền cho bài luận sâu AI. deepseek-chat (non-thinking) gọi tool đúng — cùng fix
    // đã áp cho Huyền Không Phi Tinh (xem luan-ai.ts). Gemini không cần override, dùng AI_GEMINI_MODEL.
    modelOverride: { "openai-tuong-thich": "deepseek-chat" },
  });
  ghiLogChiPhi("Kinh Dịch", ket.model, ket.usage);

  if (!ket.input) {
    return {
      ok: false,
      ly_do: "loi_goi_api",
      chi_tiet: "Chưa cấu hình khóa API hoặc gọi AI thất bại. Quẻ vẫn lập được (thuần code), chỉ chưa luận sâu được.",
    };
  }

  const inp = ket.input;
  const mang = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.trim()).map((x) => (x as string).trim()) : [];
  const chuoi = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

  const ketLuan = chuoi(inp.ket_luan) as KetLuanKinhDich;
  if (!KET_LUAN_ENUM.includes(ketLuan)) {
    return { ok: false, ly_do: "phan_hoi_khong_hop_le", chi_tiet: `Kết luận không hợp lệ: "${chuoi(inp.ket_luan)}".` };
  }

  return {
    ok: true,
    luan: {
      dung_than: chuoi(inp.dung_than),
      phan_tich: mang(inp.phan_tich),
      nguyen_nhan_cot_loi: chuoi(inp.nguyen_nhan_cot_loi),
      ket_luan: ketLuan,
      diem_can_luu_y: mang(inp.diem_can_luu_y),
      quan_su_khuyen: mang(inp.quan_su_khuyen),
      phuong_phap_hoa_giai: mang(inp.phuong_phap_hoa_giai),
      thoi_diem_khuyen_nghi: chuoi(inp.thoi_diem_khuyen_nghi),
    },
  };
}
