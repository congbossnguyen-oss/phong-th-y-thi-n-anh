/**
 * Gọi AI để viết lời luận Vận Khí — CHỈ tầng gọi mạng + ép JSON đúng khuôn, không tính toán gì.
 *
 * Đi qua lớp gọi AI dùng chung (`lib/ai/goi-ai.ts`) — tinhNang "quan-su-van-khi" hiện chọn DeepSeek
 * (rẻ hơn Anthropic). ⚠️ Bên gọi (index.ts) PHẢI chia danh sách năm thành lô tối đa 5/lệnh khi qua
 * DeepSeek — xem SO_NAM_TOI_DA_MOI_LENH ở index.ts và ghi chú đo thật trong luu-nien-dai-van.ts
 * (10 mục kèm văn xuôi dài mất 97-125s, chạm trần ~100s của Cloudflare trước tom.qnt.world).
 */
import { goiAiToolUse } from "../../ai/goi-ai";
import { ghiLogChiPhi } from "../../chart-profile/ghi-log-chi-phi";

// 5 năm × 4 lĩnh vực trong 1 lệnh — an toàn cho cả Anthropic lẫn DeepSeek (xem ghi chú ở trên).
const MAX_TOKENS = 3500;
const TOOL_NAME = "tra_ve_loi_luan_van_khi";

export interface LoiLuan4LinhVuc {
  tai_van: string;
  quan_van: string;
  suc_khoe: string;
  tinh_duyen: string;
}

export type KetQuaLlmVanKhi =
  | { ok: true; loiLuan: Map<number, LoiLuan4LinhVuc> }
  | { ok: false; ly_do: "khong_co_api_key" | "loi_goi_api" | "phan_hoi_khong_hop_le"; chi_tiet: string };

const INPUT_SCHEMA = {
  type: "object",
  properties: {
    danh_sach: {
      type: "array",
      description: "Đúng 1 phần tử cho MỖI năm trong danh sách đầu vào, theo đúng thứ tự chi_so — không bỏ sót, không thêm năm lạ.",
      items: {
        type: "object",
        properties: {
          chi_so: { type: "integer", description: "Số thứ tự của năm trong danh sách đầu vào, bắt đầu từ 0." },
          tai_van: { type: "string", description: "Lời luận Tài vận, 2-4 câu, viết từ canCu được cung cấp." },
          quan_van: { type: "string", description: "Lời luận Quan vận/Sự nghiệp, 2-4 câu." },
          suc_khoe: { type: "string", description: "Lời luận Sức khỏe, 2-4 câu, không nêu bệnh danh cụ thể." },
          tinh_duyen: { type: "string", description: "Lời luận Tình duyên/Hôn nhân, 2-4 câu, không nói ly hôn/chia tay/mất người." },
        },
        required: ["chi_so", "tai_van", "quan_van", "suc_khoe", "tinh_duyen"],
      },
    },
  },
  required: ["danh_sach"],
} as const;

/** Gọi AI 1 LẦN DUY NHẤT cho cả danh sách năm (không phải N lệnh riêng — xem index.ts để hiểu lý do). */
export async function goiLoiLuanVanKhi(
  promptTriThuc: string,
  promptQuyTac: string,
  promptNguoiDung: string,
): Promise<KetQuaLlmVanKhi> {
  const ket = await goiAiToolUse({
    tinhNang: "quan-su-van-khi",
    systemCoDinh: promptTriThuc,
    systemThayDoi: promptQuyTac,
    userMessage: promptNguoiDung,
    toolName: TOOL_NAME,
    schema: INPUT_SCHEMA,
    maxTokens: MAX_TOKENS,
  });
  ghiLogChiPhi("Vận Khí", ket.model, ket.usage);

  if (!ket.input) {
    return {
      ok: false,
      ly_do: "loi_goi_api",
      chi_tiet: "Chưa cấu hình khóa API hoặc gọi AI thất bại. Điểm số vẫn tính được (thuần code), dùng câu mẫu an toàn thay lời luận AI.",
    };
  }

  const danhSach = Array.isArray(ket.input.danh_sach) ? (ket.input.danh_sach as Record<string, unknown>[]) : [];
  if (danhSach.length === 0) {
    return { ok: false, ly_do: "phan_hoi_khong_hop_le", chi_tiet: "Model không trả danh_sach hoặc danh_sach rỗng." };
  }

  const chuoi = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
  const loiLuan = new Map<number, LoiLuan4LinhVuc>();
  for (const d of danhSach) {
    const chiSo = Number(d.chi_so);
    if (!Number.isInteger(chiSo)) continue;
    const item: LoiLuan4LinhVuc = {
      tai_van: chuoi(d.tai_van),
      quan_van: chuoi(d.quan_van),
      suc_khoe: chuoi(d.suc_khoe),
      tinh_duyen: chuoi(d.tinh_duyen),
    };
    if (item.tai_van && item.quan_van && item.suc_khoe && item.tinh_duyen) loiLuan.set(chiSo, item);
  }
  if (loiLuan.size === 0) {
    return { ok: false, ly_do: "phan_hoi_khong_hop_le", chi_tiet: "Không có mục nào đủ 4 lĩnh vực hợp lệ." };
  }
  return { ok: true, loiLuan };
}
