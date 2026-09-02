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
import { coTruongRong } from "../../tu-vi/luan-giai/kiemTraDayDu";

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

/** Số lần thử lại khi JSON hợp lệ (parse OK) nhưng nội dung còn trường rỗng — xem kiemTraDayDu.ts. */
const SO_LAN_THU_KHI_THIEU_NOI_DUNG = 2;

export async function luanGiaiBangAI(
  payload: QuanSuInterpretationPayload,
  tuyChon: TuyChonLuan = {},
): Promise<KetQuaLuanGiai> {
  let lyDoCuoi: string | null = null;

  for (let lan = 1; lan <= SO_LAN_THU_KHI_THIEU_NOI_DUNG; lan++) {
    const ketQua = await goiLuanGiaiKinhDich(
      systemPromptTriThuc(),
      systemPromptQuyTac(tuyChon.gioiTinh, payload.question.safety_level),
      userPrompt(payload, tuyChon.moTa),
    );

    if (!ketQua.ok) {
      console.error(`[quan-su] Luận giải AI hỏng (${ketQua.ly_do}): ${ketQua.chi_tiet}`);
      lyDoCuoi = ketQua.chi_tiet;
      continue;
    }

    // Kiểm lại TOÀN BỘ phần LUÔN bắt buộc phải có nội dung (đệ quy qua coTruongRong) — model đôi
    // khi trả JSON hợp lệ theo schema (đủ trường, đủ minItems) nhưng nội dung là chuỗi/phần tử rỗng,
    // giống lỗi đã bắt thật ở Tử Vi 1/9/2026 (xem kiemTraDayDu.ts). CỐ Ý loại `phuong_phap_hoa_giai`
    // và `thoi_diem_khuyen_nghi` khỏi kiểm tra này — 2 trường đó được PHÉP rỗng theo đúng schema khi
    // quẻ không báo hung / không có chỉ dấu thời điểm, không phải dấu hiệu AI làm ẩu.
    const l = ketQua.luan;
    const phanLuonPhaiCo = {
      dung_than: l.dung_than,
      phan_tich: l.phan_tich,
      nguyen_nhan_cot_loi: l.nguyen_nhan_cot_loi,
      diem_can_luu_y: l.diem_can_luu_y,
      quan_su_khuyen: l.quan_su_khuyen,
    };
    if (!coTruongRong(phanLuonPhaiCo)) return { luan: l, lyDoThatBai: null };

    lyDoCuoi = "Model trả về thiếu phần bắt buộc (JSON hợp lệ nhưng còn trường rỗng).";
    console.error(
      `[quan-su] Luận giải AI: lần ${lan}/${SO_LAN_THU_KHI_THIEU_NOI_DUNG} JSON hợp lệ nhưng còn trường rỗng — thử lại.`,
    );
  }

  return { luan: null, lyDoThatBai: lyDoCuoi };
}
