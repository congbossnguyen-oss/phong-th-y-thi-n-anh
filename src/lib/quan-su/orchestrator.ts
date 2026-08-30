// QUÂN SƯ THIÊN ANH — Orchestrator: điều phối 1 lượt hỏi từ đầu đến cuối.
//
// CHỌN CÂU HỎI → (input) → GIEO QUẺ → VẬN TRÌNH → LUẬN → KẾT QUẢ.
// Orchestrator KHÔNG tự tính gì — chỉ gọi: engine gieo quẻ (luc-hao qua divination.ts), engine vận
// trình (current-luck.ts), rồi Advisory Engine (advisory-engine.ts) sinh báo cáo cố vấn.

import {
  buildInterpretationPayload,
  castInputNow,
  castLucHaoFromTosses,
  castLucHaoRandom,
  castMaiHoa,
  castSeriTien,
  type DoiTuongHoi,
  type QuanSuInterpretationPayload,
} from "./divination";
import { tinhVanTrinhHienTai, type LuckContext } from "./current-luck";
import { buildAdvisoryReport, type AdvisoryReport } from "./advisory-engine";
import { luanGiaiBangAI, type LuanGiaiKinhDich } from "./luan-giai";
import { getQuestion } from "./index";
import type { CoinLineValue, FullCastResult } from "../luc-hao";
import type { QuestionDefinition } from "./types";

export interface NgaySinhInput {
  day: number;
  month: number;
  year: number;
  gender: "Nam" | "Nữ";
  hour?: number;
}

/**
 * Cách lập quẻ Kinh Dịch — cả 3 cách đều cho ra cùng 1 dạng kết quả (`FullCastResult`, xem luc-hao.ts),
 * chỉ khác nguồn dữ liệu đầu vào. Đây là lựa chọn CỦA NGƯỜI DÙNG khi hỏi 1 câu (divination_method của
 * câu hỏi luôn là "luc-hao" — tức "dùng Kinh Dịch"; castingMethod chỉ là cách NHẬP để lập quẻ đó).
 * - "gieo-tay": tự gieo 3 đồng xu 6 lần (mặc định, cách truyền thống) — dùng `tosses`.
 * - "mai-hoa": Mai Hoa Dịch Số theo giờ hỏi việc — không cần input thêm.
 * - "seri-tien": từ dãy số Seri trên tờ tiền — cần `seriTien`.
 */
export type CastingMethod = "gieo-tay" | "mai-hoa" | "seri-tien";

export interface RunQuanSuInput {
  question_id: string;
  /** Mặc định "gieo-tay". */
  castingMethod?: CastingMethod;
  /** 6 giá trị gieo (6/7/8/9) — dùng khi castingMethod="gieo-tay" và người dùng tự gieo; bỏ trống → app gieo giúp (random). */
  tosses?: CoinLineValue[];
  /** Dãy số Seri trên tờ tiền — bắt buộc khi castingMethod="seri-tien". */
  seriTien?: string;
  /** Ngày sinh — bắt buộc nếu câu hỏi có dùng Bát Tự/Tử Vi (vẽ vận trình). */
  ngaySinh?: NgaySinhInput;
  /** Mô tả tình huống người dùng nhập (chỉ đưa vào ngữ cảnh, không ảnh hưởng quẻ). */
  moTa?: string;
  /** Hỏi việc cho ai — mặc định "chinh-toi". Đổi Dụng Thần theo Lục Thân đại diện người đó (§1.1). */
  doiTuong?: DoiTuongHoi;
  /** Cho phép truyền RNG để test tái lập (mặc định Math.random). */
  rng?: () => number;
  /**
   * Bỏ qua bước luận bằng AI. Dùng cho test phần chấm điểm bằng luật — nếu không có, mỗi lần chạy
   * test lại gọi API thật, vừa chậm vừa tốn tiền.
   */
  boQuaAI?: boolean;
}

export interface QuanSuResult {
  question: { id: string; title: string; category: QuestionDefinition["category"] };
  report: AdvisoryReport; // báo cáo cố vấn 8 phần (verdict + điểm + vận trình + khuyên...)
  /**
   * Dữ liệu quẻ ĐẦY ĐỦ (nguyên `FullCastResult`) — để trang kết quả vẽ được hình quẻ thật (Nạp
   * Giáp, Lục Thân, Lục Thú, Thế/Ứng, Tuần Không đủ 6 hào), không chỉ tên quẻ suông. Thầy, 2026-08-
   * 23: "phải cho anh hiện ra ảnh quẻ dịch... anh đối chiếu mới biết đúng hay sai về cách luận
   * giải" — khách (và Thầy) cần tự soát được số liệu gốc, không chỉ tin lời luận của AI.
   */
  que: FullCastResult;
  vanTrinh: LuckContext | null;
  /** Bài luận sâu do Interpretation Engine (AI) trả về. null khi AI hỏng — khi đó chỉ còn `report`. */
  luanAI: LuanGiaiKinhDich | null;
  /** true khi CHƯA có bài luận sâu — lúc đó văn xuôi chỉ là bản chấm điểm bằng luật. */
  isDemo: boolean;
}

/** Chạy 1 lượt hỏi cho câu hỏi Kinh Dịch (luc-hao). Câu chọn-ngày-giờ đi đường khác (trach-nhat). */
export async function runQuanSu(input: RunQuanSuInput): Promise<QuanSuResult> {
  const question = getQuestion(input.question_id);
  if (!question) throw new Error(`Không tìm thấy câu hỏi: ${input.question_id}`);
  if (question.divination_method !== "luc-hao") {
    throw new Error(
      `Câu hỏi "${question.question_id}" thuộc nhóm chọn ngày giờ (trach-nhat) — dùng luồng trachnhat-engine, không qua orchestrator Kinh Dịch.`,
    );
  }

  // 1) Gieo quẻ — theo castingMethod người dùng chọn (mặc định "gieo-tay", giữ đúng hành vi cũ:
  //    tự gieo nếu có tosses, không thì gieo giúp). Cả 3 cách đều cho FullCastResult cùng dạng.
  const castInput = castInputNow();
  const castingMethod: CastingMethod = input.castingMethod ?? "gieo-tay";
  let cast: FullCastResult;
  let method: QuanSuInterpretationPayload["meta"]["method"];
  if (castingMethod === "mai-hoa") {
    cast = castMaiHoa(castInput);
    method = "mai-hoa";
  } else if (castingMethod === "seri-tien") {
    if (!input.seriTien || input.seriTien.replace(/\D/g, "").length < 2) {
      throw new Error("Cần nhập seri tiền (ít nhất 2 chữ số) để lập quẻ theo Seri tiền.");
    }
    cast = castSeriTien(input.seriTien, castInput);
    method = "seri-tien";
  } else if (input.tosses && input.tosses.length === 6) {
    cast = castLucHaoFromTosses(input.tosses, castInput);
    method = "luc-hao-tosses";
  } else {
    cast = castLucHaoRandom(castInput, input.rng);
    method = "luc-hao-random";
  }

  // 2) Vận trình hiện tại (nếu câu hỏi dùng Bát Tự/Tử Vi và có ngày sinh). CHỈ chạy khi hỏi cho
  //    CHÍNH người dùng — ngày sinh lấy từ hồ sơ tài khoản đăng nhập, nếu doiTuong là người khác
  //    (cha mẹ, con...) thì vận trình này sẽ là của SAI người nên phải bỏ qua, không đưa vào ngữ cảnh.
  const hoiChoChinhMinh = !input.doiTuong || input.doiTuong === "chinh-toi";
  const canVanTrinh =
    hoiChoChinhMinh && (question.recommended_engines.includes("bat-tu") || question.recommended_engines.includes("tu-vi"));
  const vanTrinh: LuckContext | null =
    canVanTrinh && input.ngaySinh
      ? tinhVanTrinhHienTai({
          day: input.ngaySinh.day,
          month: input.ngaySinh.month,
          year: input.ngaySinh.year,
          gender: input.ngaySinh.gender,
          hour: input.ngaySinh.hour,
        })
      : null;

  // 3) Đóng gói payload cho Advisory Engine.
  const payload = buildInterpretationPayload(question, cast, { method, vanTrinh, doiTuong: input.doiTuong });

  // 4) Báo cáo cố vấn bằng LUẬT — điểm số + verdict deterministic. Luôn chạy, vì đây là lưới an
  //    toàn: AI hỏng thì khách vẫn có kết quả để xem.
  const report = buildAdvisoryReport(payload);

  // 5) Bài luận sâu bằng AI (Interpretation Engine). Hỏng thì trả null, KHÔNG ném lỗi — cố ý, để
  //    một lần gọi mạng trục trặc không làm mất trắng lượt hỏi của khách.
  const { luan } = input.boQuaAI
    ? { luan: null }
    : await luanGiaiBangAI(payload, { gioiTinh: input.ngaySinh?.gender, moTa: input.moTa });

  return {
    question: { id: question.question_id, title: question.title, category: question.category },
    report,
    que: cast,
    vanTrinh,
    luanAI: luan,
    isDemo: luan === null,
  };
}
