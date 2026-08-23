/**
 * INTERPRETATION ENGINE — Giai đoạn 1.
 *
 * Cửa vào duy nhất của phần luận quẻ bằng AI. Nhận payload đã đóng gói sẵn (câu hỏi + quẻ + vận
 * trình) rồi trả bài luận có cấu trúc.
 *
 * NGUYÊN TẮC: engine này KHÔNG tính bất kỳ số liệu huyền học nào — mọi số liệu đến từ Casting
 * Engine (`luc-hao.ts`). Ở đây chỉ dựng prompt, gọi model, và kiểm lại kết quả trả về.
 *
 * KHI AI HỎNG: trả `null` chứ không ném lỗi. Bên gọi phải tự lùi về bài chấm điểm bằng luật của
 * `advisory-engine.ts` — khách vẫn xem được quẻ, chỉ là không có bài luận sâu. Đây là hành vi cố ý,
 * giống cách `chart-profile` đã làm với `suyDaiVanDuPhong`.
 */
import type { QuanSuInterpretationPayload } from "../divination";
import { goiLuanGiaiKinhDich, type LuanGiaiKinhDich, type KetLuanKinhDich } from "./llm";
import { systemPromptQuyTac, systemPromptTriThuc, userPrompt } from "./prompt";

export type { LuanGiaiKinhDich, KetLuanKinhDich };

export interface TuyChonLuan {
  /** Giới tính người hỏi — quyết định gọi "anh" hay "chị". Không có thì dùng "anh/chị". */
  gioiTinh?: "Nam" | "Nữ";
  /** Hoàn cảnh người hỏi tự kể (ô "Kể ngắn gọn chuyện anh/chị đang gặp"). */
  moTa?: string;
}

export interface KetQuaLuanGiai {
  luan: LuanGiaiKinhDich | null;
  /** Vì sao không có bài luận sâu — để log và để UI biết đường báo. null nghĩa là thành công. */
  lyDoThatBai: string | null;
}

/** Nhãn tiếng Việt của kết luận, dùng khi hiển thị. */
export const NHAN_KET_LUAN: Record<KetLuanKinhDich, string> = {
  NEN: "NÊN",
  KHONG_NEN: "KHÔNG NÊN",
  NEN_CHO: "NÊN CHỜ",
  CO_DIEU_KIEN: "CÓ ĐIỀU KIỆN",
};

export async function luanGiaiBangAI(
  payload: QuanSuInterpretationPayload,
  tuyChon: TuyChonLuan = {},
): Promise<KetQuaLuanGiai> {
  const ketQua = await goiLuanGiaiKinhDich(
    systemPromptTriThuc(),
    systemPromptQuyTac(tuyChon.gioiTinh, payload.question.safety_level),
    userPrompt(payload, tuyChon.moTa),
  );

  if (!ketQua.ok) {
    console.error(`[quan-su] Luận giải AI hỏng (${ketQua.ly_do}): ${ketQua.chi_tiet}`);
    return { luan: null, lyDoThatBai: ketQua.chi_tiet };
  }

  // Kiểm lại phần bắt buộc — model đôi khi trả mảng rỗng dù schema đã yêu cầu số lượng tối thiểu.
  const l = ketQua.luan;
  if (l.phan_tich.length === 0 || l.diem_can_luu_y.length === 0 || l.quan_su_khuyen.length === 0) {
    const thieu = "Model trả về thiếu phần bắt buộc (phân tích / điểm lưu ý / lời khuyên).";
    console.error(`[quan-su] ${thieu}`);
    return { luan: null, lyDoThatBai: thieu };
  }

  return { luan: l, lyDoThatBai: null };
}
