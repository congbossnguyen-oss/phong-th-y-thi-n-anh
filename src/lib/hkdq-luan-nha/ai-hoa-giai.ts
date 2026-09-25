/**
 * BƯỚC 9 — ĐỀ XUẤT HÓA GIẢI (lớp AI, `nguon: "ai"`).
 *
 * ⚠️ Đây là phần DUY NHẤT dùng AI. Bước 1–8 (engine.ts) tính thuần túy, không AI.
 * - Chạy QUA NÚT BẤM RIÊNG (form gửi `?taoHoaGiai=1`), KHÔNG tự động gọi kèm khi luận engine —
 *   để anh Công kiểm soát khi nào tốn phí API (README mục "Nếu phần nào dùng AI").
 * - AI CHỈ diễn giải JSON engine đã tính, KHÔNG tự tính lại / suy đoán số liệu; JSON có
 *   `thieuDuLieu` thì phải nói rõ, không im lặng bỏ qua.
 * - Gọi qua `goiAiToolUse` (một cửa AI của repo). goiAiToolUse KHÔNG BAO GIỜ throw — lỗi/thiếu
 *   khoá → trả `input: null`, ở đây ta lùi về thông báo rõ ràng thay vì làm sập trang.
 * - Route DeepSeek (Anthropic đã bị cắt credit) → PHẢI ép model `deepseek-chat` (non-thinking) vì
 *   goiAiToolUse dùng tool_choice ép buộc.
 */
import { goiAiToolUse } from "../ai/goi-ai";
import type { KetQuaLuanNha } from "./engine";

export interface DeXuatHoaGiai {
  viTri: string;
  phuongAn: string;
  lyDoNguHanh: string;
}
export interface KetQuaHoaGiaiAi {
  deXuatHoaGiai: DeXuatHoaGiai[];
  nguon: "ai";
  canhBao: string;
  /** Có giá trị khi AI không tạo được (thiếu khoá/lỗi tạm thời) — để UI báo rõ, không im lặng. */
  loi?: string;
}

const CANH_BAO_MAC_DINH =
  "Phần này do AI diễn giải từ dữ liệu tính toán ở trên, KHÔNG phải kết quả engine tính trực tiếp.";

const SYSTEM = `Bạn là trợ lý diễn giải kết quả phong thủy Huyền Không Đại Quái cho MỘT chuyên gia (không phải khách hàng).
NHIỆM VỤ: từ JSON kết quả engine (đã tính sẵn, nguon="engine") đưa ra đề xuất HÓA GIẢI.

RÀNG BUỘC BẮT BUỘC (vi phạm là sai):
1. CHỈ diễn giải các con số/kết luận đã có trong JSON. TUYỆT ĐỐI không tự tính lại quẻ/Vận/Chính-Linh Thần, không suy đoán thêm số liệu.
2. Nếu JSON có mảng "thieuDuLieu" hoặc field null, phải NÓI RÕ mục đó chưa đủ dữ liệu — không im lặng bỏ qua, không tự lấp.
3. Đề xuất hóa giải CHỈ được dùng nguyên tắc NGŨ HÀNH hợp với Quái Khí tại vị trí đặt (đúng nguyên tắc đã tính trong JSON). KHÔNG tự nghĩ ra vật phẩm/phương pháp ngoài nguyên tắc ngũ hành. Sai ngũ hành so với quái tại vị trí sẽ GÂY HẠI (đã có 2 case thực tế hỏng vì đặt sai).
4. Không khẳng định "Chính Thần → mở cửa, Linh Thần → có Thủy" là nguyên văn tuyệt đối — dùng giọng "theo nguyên tắc chung của lý khí".
5. Nếu quaiChuVan = null (Vận 3) thì nói "chưa xác định trong dữ liệu", không bịa tên quẻ.
Trả về ngắn gọn, đúng schema tool.`;

const SCHEMA = {
  type: "object",
  properties: {
    deXuatHoaGiai: {
      type: "array",
      items: {
        type: "object",
        properties: {
          viTri: { type: "string", description: "Vị trí: toa | huong | cua_<ten> | noi_cuc_<loai> | nuoc_den | nuoc_di" },
          phuongAn: { type: "string", description: "Đề xuất hóa giải ngắn gọn, CHỈ bằng ngũ hành hợp Quái Khí tại vị trí." },
          lyDoNguHanh: { type: "string", description: "Căn cứ ngũ hành / Quái Khí trong JSON dẫn tới đề xuất." },
        },
        required: ["viTri", "phuongAn", "lyDoNguHanh"],
      },
    },
    canhBao: { type: "string", description: "Cảnh báo độ tin cậy / chỗ thiếu dữ liệu cần chuyên gia tự xét." },
  },
  required: ["deXuatHoaGiai"],
};

export async function taoDeXuatHoaGiai(ketQua: KetQuaLuanNha): Promise<KetQuaHoaGiaiAi> {
  const r = await goiAiToolUse({
    tinhNang: "hkdq-hoa-giai",
    systemCoDinh: SYSTEM,
    userMessage: "JSON kết quả engine (nguon: engine) — chỉ diễn giải, không tính lại:\n" + JSON.stringify(ketQua),
    toolName: "de_xuat_hoa_giai",
    schema: SCHEMA,
    maxTokens: 2000,
    modelOverride: { "openai-tuong-thich": "deepseek-chat" },
  });

  const raw = r.input as { deXuatHoaGiai?: unknown; canhBao?: unknown } | null;
  if (!raw || !Array.isArray(raw.deXuatHoaGiai)) {
    return {
      deXuatHoaGiai: [],
      nguon: "ai",
      canhBao: CANH_BAO_MAC_DINH,
      loi: "Chưa tạo được đề xuất hóa giải — thiếu cấu hình khoá AI trên máy chủ hoặc lỗi tạm thời của nhà cung cấp. Xem log server. Engine (Bước 1–8) ở trên vẫn đầy đủ để tự luận.",
    };
  }

  const deXuat: DeXuatHoaGiai[] = (raw.deXuatHoaGiai as unknown[])
    .filter((d): d is Record<string, unknown> => typeof d === "object" && d !== null)
    .map((d) => ({
      viTri: String(d.viTri ?? ""),
      phuongAn: String(d.phuongAn ?? ""),
      lyDoNguHanh: String(d.lyDoNguHanh ?? ""),
    }));

  return {
    deXuatHoaGiai: deXuat,
    nguon: "ai",
    canhBao: typeof raw.canhBao === "string" && raw.canhBao.trim() ? raw.canhBao : CANH_BAO_MAC_DINH,
  };
}
