// QUÂN SƯ THIÊN ANH — Cửa vào duy nhất của Thư Viện Câu Hỏi.
//
// UI (trang chọn nhóm, trang chọn câu hỏi, luồng hỏi-đáp) import từ đây — không đọc thẳng
// questions.ts/categories.ts để nếu sau này đổi nguồn dữ liệu (vd chuyển sang Sanity CMS) chỉ
// cần sửa 1 chỗ. Toàn bộ câu hỏi là DỮ LIỆU, không hard-code vào component.

import { getAllCategories, getCategory } from "./categories";
import { questions } from "./questions";
import type { CategoryId, QuestionDefinition } from "./types";

export type {
  CategoryDefinition,
  CategoryId,
  DivinationMethod,
  EngineRef,
  InputField,
  InputType,
  OutputType,
  PricingTier,
  QuestionDefinition,
  SafetyLevel,
} from "./types";
export { APP_OPENING_PROMPT, getAllCategories, getCategory } from "./categories";
export {
  buildInterpretationPayload,
  castInputNow,
  castLucHaoFromTosses,
  castLucHaoRandom,
  dungThanHintFor,
  type DungThanHint,
  type QuanSuInterpretationPayload,
} from "./divination";
export {
  tinhVanTrinhHienTai,
  type DanhGia,
  type LuckContext,
  type LuckDimension,
  type LuckInput,
} from "./current-luck";

const questionById = new Map(questions.map((q) => [q.question_id, q]));

/** Toàn bộ câu hỏi (theo thứ tự khai báo trong seed). */
export function getAllQuestions(): QuestionDefinition[] {
  return questions;
}

/** Các câu hỏi thuộc 1 nhóm. */
export function getQuestionsByCategory(category: CategoryId): QuestionDefinition[] {
  return questions.filter((q) => q.category === category);
}

/** 1 câu hỏi theo id, hoặc undefined nếu không có. */
export function getQuestion(question_id: string): QuestionDefinition | undefined {
  return questionById.get(question_id);
}

/** Nhóm + câu hỏi của nhóm đó — tiện cho trang hiển thị 1 nhóm. */
export function getCategoryWithQuestions(category: CategoryId) {
  const cat = getCategory(category);
  if (!cat) return undefined;
  return { category: cat, questions: getQuestionsByCategory(category) };
}

/** Toàn bộ nhóm kèm số câu hỏi mỗi nhóm — tiện cho trang "Anh đang quan tâm điều gì?". */
export function getCategoriesWithCounts() {
  return getAllCategories().map((cat) => ({
    ...cat,
    questionCount: getQuestionsByCategory(cat.id).length,
  }));
}

export const TOTAL_QUESTION_COUNT = questions.length;
