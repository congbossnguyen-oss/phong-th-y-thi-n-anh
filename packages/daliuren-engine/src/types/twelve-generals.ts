/**
 * TwelveGenerals (十二天將) — Algorithm Spec §8. CONFIDENCE A cho thứ tự + tên (nhất quán
 * tuyệt đối mọi nguồn); CONFIDENCE B cho ranh giới thuận/nghịch (nâng sau Phase 2 — repo B là
 * nguồn độc lập thật với A/F, cùng đồng thuận, xem DA_LIU_REN_VALIDATION_REVIEW.md dòng 10b).
 *
 * KHÔNG chấp nhận đơn giản hoá "6 cát + 6 hung" (Phase 2, xem
 * docs/daliuren/DA_LIU_REN_INTERPRETATION_EVIDENCE.md mục 4) — type ở đây CHỈ mô tả VỊ TRÍ
 * (thuộc Tầng 1/FACT), KHÔNG gắn polarity cát/hung tĩnh nào cho từng tướng — ý nghĩa luận đoán
 * (bao gồm polarity) là việc của RuleDefinition/Signal (Tầng 2), xem src/interpretation/.
 */
import type { Chi } from "./ganzhi.js";

/** Đúng thứ tự cố định: 貴人 → 螣蛇 → 朱雀 → 六合 → 勾陳 → 青龍 → 天空 → 白虎 → 太常 → 玄武 → 太陰 → 天后. */
export type TwelveGeneralName =
  | "guiRen" // 貴人
  | "tengShe" // 螣蛇
  | "zhuQue" // 朱雀
  | "liuHe" // 六合
  | "gouChen" // 勾陳
  | "qingLong" // 青龍
  | "tianKong" // 天空
  | "baiHu" // 白虎
  | "taiChang" // 太常
  | "xuanWu" // 玄武
  | "taiYin" // 太陰
  | "tianHou"; // 天后

export interface TwelveGeneralPlacement {
  /** Vị trí trên Địa Bàn. */
  zhi: Chi;
  general: TwelveGeneralName;
}

/** Toàn bộ 12 vị đã đặt xong cho 1 lá số — luôn đúng 12 phần tử, mỗi Địa Chi 1 tướng. */
export type TwelveGenerals = readonly [
  TwelveGeneralPlacement,
  TwelveGeneralPlacement,
  TwelveGeneralPlacement,
  TwelveGeneralPlacement,
  TwelveGeneralPlacement,
  TwelveGeneralPlacement,
  TwelveGeneralPlacement,
  TwelveGeneralPlacement,
  TwelveGeneralPlacement,
  TwelveGeneralPlacement,
  TwelveGeneralPlacement,
  TwelveGeneralPlacement,
];
