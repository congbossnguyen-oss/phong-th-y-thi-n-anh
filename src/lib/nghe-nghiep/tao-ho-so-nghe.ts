/**
 * BỘ TẠO KẾT QUẢ "Định hướng Nghề nghiệp (Bát Tự × Tử Vi)" từ ngày giờ sinh thật.
 *
 * Điểm vào DUY NHẤT cho cả 3 nơi dùng: trang kết quả, PDF gửi mail, và (test) API. Tính lại từ
 * input đã lưu — không lưu sẵn kết quả — vì phần deterministic là thuần; phần AI có cache riêng
 * theo hash lá số ở `chart-profile/cache.ts` nên gọi lại không tốn thêm tiền.
 *
 * Nguồn từng hệ:
 *  - Bát Tự: `getBatTuProfile` (AI khi có ANTHROPIC_API_KEY; thiếu key → trả Tứ Trụ/Đại Vận thuần
 *    code + cờ insufficient, KHÔNG bịa).
 *  - Tử Vi: `getTuViProfileLive` (facts thật + luận NỀN SƠ BỘ; Đợt 2 thay bằng AI gọn trích tài liệu).
 */
import { getBatTuProfile } from "../chart-profile";
import { getTuViProfile } from "../chart-profile/tu-vi";
import { buildBatTuVM, buildTuViVM, type DashboardVM } from "./view-model";
import { tinhKetHop, type KetHopResult } from "./module-ket-hop";
import type { Gender } from "../chart-profile/types";

export interface NgheInput {
  day: number;
  month: number;
  year: number;
  hour: number;
  minute?: number;
  gender: Gender;
}

export interface NgheKetQua {
  input: NgheInput;
  batTuVM: DashboardVM;
  tuViVM: DashboardVM;
  ketHop: KetHopResult;
  /** true khi Bát Tự đã luận được bằng AI (có key). Dùng để trang/PDF biết mức hoàn thiện. */
  batTuAiOk: boolean;
  generatedAt: string;
}

export async function taoHoSoNghe(input: NgheInput): Promise<NgheKetQua> {
  // Chạy song song 2 hệ (mỗi hệ 1 lần gọi AI) để giảm độ trễ.
  const [batTuProfile, tuViProfile] = await Promise.all([getBatTuProfile(input), getTuViProfile(input)]);

  const { vm: batTuVM, result: batTuResult } = buildBatTuVM(batTuProfile);
  const { vm: tuViVM, result: tuViResult } = buildTuViVM(tuViProfile);
  const ketHop = tinhKetHop(batTuResult, tuViResult);

  return {
    input,
    batTuVM,
    tuViVM,
    ketHop,
    batTuAiOk: batTuProfile.ai_luan_giai_thanh_cong,
    generatedAt: new Date().toISOString(),
  };
}
