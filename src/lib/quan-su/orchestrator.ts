// QUÂN SƯ THIÊN ANH — Orchestrator: điều phối 1 lượt hỏi từ đầu đến cuối.
//
// CHỌN CÂU HỎI → (input) → GIEO QUẺ → VẬN TRÌNH → LUẬN → KẾT QUẢ.
// Orchestrator KHÔNG tự tính gì — chỉ gọi: engine gieo quẻ (luc-hao qua divination.ts), engine vận
// trình (current-luck.ts), rồi Interpretation Engine (hiện là bản demo interpretation-stub.ts).

import {
  buildInterpretationPayload,
  castInputNow,
  castLucHaoFromTosses,
  castLucHaoRandom,
  type QuanSuInterpretationPayload,
} from "./divination";
import { tinhVanTrinhHienTai, type LuckContext } from "./current-luck";
import { interpretDemo, type OutputSchema } from "./interpretation-stub";
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

export interface RunQuanSuInput {
  question_id: string;
  /** 6 giá trị gieo (6/7/8/9) nếu người dùng tự gieo; bỏ trống → app gieo giúp (random). */
  tosses?: CoinLineValue[];
  /** Ngày sinh — bắt buộc nếu câu hỏi có dùng Bát Tự/Tử Vi (vẽ vận trình). */
  ngaySinh?: NgaySinhInput;
  /** Mô tả tình huống người dùng nhập (chỉ đưa vào ngữ cảnh, không ảnh hưởng quẻ). */
  moTa?: string;
  /** Cho phép truyền RNG để test tái lập (mặc định Math.random). */
  rng?: () => number;
}

export interface QuanSuResult {
  question: { id: string; title: string; category: QuestionDefinition["category"] };
  ketQuaQuanSu: OutputSchema; // hiện TRƯỚC cho người dùng (bài luận)
  chiTiet: {
    // "Xem luận giải chi tiết" — dữ liệu quẻ + vận trình (bấm mới mở)
    que: {
      chinh: string;
      bien: string | null;
      dongPositions: number[];
      canChiText: string;
      tuanKhong: string;
    };
    vanTrinh: LuckContext | null;
    payload: QuanSuInterpretationPayload; // giữ nguyên payload để sau này AI thật luận lại
  };
  isDemo: true; // luận giải hiện là bản demo (chưa có AI thật)
}

/** Chạy 1 lượt hỏi cho câu hỏi Kinh Dịch (luc-hao). Câu chọn-ngày-giờ đi đường khác (trach-nhat). */
export function runQuanSu(input: RunQuanSuInput): QuanSuResult {
  const question = getQuestion(input.question_id);
  if (!question) throw new Error(`Không tìm thấy câu hỏi: ${input.question_id}`);
  if (question.divination_method !== "luc-hao") {
    throw new Error(
      `Câu hỏi "${question.question_id}" thuộc nhóm chọn ngày giờ (trach-nhat) — dùng luồng trachnhat-engine, không qua orchestrator Kinh Dịch.`,
    );
  }

  // 1) Gieo quẻ (tự gieo nếu có tosses, không thì gieo giúp).
  const castInput = castInputNow();
  let cast: FullCastResult;
  let method: QuanSuInterpretationPayload["meta"]["method"];
  if (input.tosses && input.tosses.length === 6) {
    cast = castLucHaoFromTosses(input.tosses, castInput);
    method = "luc-hao-tosses";
  } else {
    cast = castLucHaoRandom(castInput, input.rng);
    method = "luc-hao-random";
  }

  // 2) Vận trình hiện tại (nếu câu hỏi dùng Bát Tự/Tử Vi và có ngày sinh).
  const canVanTrinh = question.recommended_engines.includes("bat-tu") || question.recommended_engines.includes("tu-vi");
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

  // 3) Đóng gói payload cho Interpretation Engine.
  const payload = buildInterpretationPayload(question, cast, { method, vanTrinh });

  // 4) Luận (hiện là bản demo — thay bằng LLM khi có bộ quy tắc + Phần E của Thầy).
  const ketQuaQuanSu = interpretDemo(payload);

  return {
    question: { id: question.question_id, title: question.title, category: question.category },
    ketQuaQuanSu,
    chiTiet: {
      que: {
        chinh: cast.chinh.name,
        bien: cast.bien ? cast.bien.name : null,
        dongPositions: cast.dongPositions,
        canChiText: cast.canChiText,
        tuanKhong: cast.tuanKhong,
      },
      vanTrinh,
      payload,
    },
    isDemo: true,
  };
}
