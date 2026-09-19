/**
 * Layer 7 — Astrological Factors (shared, school-agnostic contract).
 * Đúng `docs/astrology-module/ARCHITECTURE/FACTOR_ENGINE_SPEC.md` + `ARCHITECTURE_FREEZE.md` §3
 * (Layer 7) + `ADR/ADR-003-Astrology-School-Isolation.md` + `ADR/ADR-008-Versioning-Strategy.md`.
 *
 * Một `Factor` là DỮ LIỆU — KHÔNG bao giờ là verdict, score tổng hợp theo lĩnh vực, hay prose.
 * File này CHỈ chứa hình dạng hợp đồng dùng chung giữa các trường phái (Factor/FactorInput/
 * FactorEngine interface). MỌI logic trích xuất factor thực tế nằm trong module TỪNG trường phái
 * (vd. `western/factors.ts`) — KHÔNG có implementation dùng chung xuyên trường phái (ADR-003).
 *
 * Phase 5 (ROADMAP.md) = Western FactorEngine. Vedic FactorEngine DEFERRED.
 */

import type { NormalizedChart, SchoolId } from "../chart/types.js";

/** Định danh factor ổn định, con-người-đọc-được — vd. "sun_in_leo", "mars_in_house_10", "aspect:mars-saturn:square". Ổn định qua các lần chạy/phiên bản để Rule Engine (Phase 6) tham chiếu bằng pattern. */
export type FactorId = string;

/**
 * Từ vựng category cho `western.factors.v1` — FROZEN là tập CẤU TRÚC tối thiểu (KHÔNG phải
 * lĩnh-vực-đời-sống như career/wealth — những cái đó thuộc tầng Rule/Scoring downstream, xem
 * `INTERPRETATION_SPEC.md` §Scoring). Mở (versioned) — có thể mở rộng ở phiên bản sau mà không cần
 * schema migration.
 */
export type FactorCategory = "placement" | "aspect" | "sign_quality";

/** Loại phần tử chart mà factor được suy ra từ đó (`FACTOR_ENGINE_SPEC.md` §Schema). Mở theo spec (`| ...`); tập dưới đây đủ cho western.factors.v1. */
export type FactorInputType = "planet" | "house" | "aspect" | "sign";

/** Một phần tử chart nguồn của factor — dùng cho provenance (truy vết Factor → Chart). */
export interface FactorInput {
  type: FactorInputType;
  /** vd. "mars", "house_10", "mars-saturn:square", "leo". */
  ref: string;
}

/**
 * Một fact-có-ý-nghĩa-chiêm-tinh trích xuất từ Normalized Chart (Layer 7). Trường camelCase theo
 * đúng quy ước của toàn package (khác pseudocode snake_case trong spec — spec chỉ mô tả hình dạng).
 */
export interface Factor {
  /** @see FactorId */
  id: FactorId;
  /** = `NormalizedChart.metadata.calculationId` — truy về đúng Chart + CalculationMetadata đã tạo ra factor này. */
  chartId: string;
  school: SchoolId;
  category: FactorCategory;
  /** Các phần tử chart mà factor này suy ra từ đó. */
  inputs: FactorInput[];
  /**
   * strength ∈ [-1, 1]. `western.factors.v1` (FROZEN): LUÔN = 0 — v1 KHÔNG thiết lập bất kỳ polarity
   * xác định-không-diễn-giải nào cho các họ factor, và |strength| CHƯA phải cường độ hiệu chỉnh
   * (magnitude liên tục DEFERRED sang v2). Dấu (sign) CHỈ được dùng khi bản thân định nghĩa factor
   * cho polarity xác định không phụ thuộc ngữ cảnh — không có trường hợp nào như vậy ở v1.
   */
  strength: number;
  /** = `NormalizedChart.metadata.calculatedAt` — dùng mốc thời gian của chart để trích xuất factor là HÀM THUẦN xác định (cùng Chart ⇒ cùng computedAt), thoả DoD "same Chart + config + version ⇒ identical Factor[]" (ADR-008). */
  computedAt: Date;
  /** Phiên bản engine/công thức đã tạo ra factor — vd. "western.factors.v1" (ADR-008). */
  version: string;
}

/** Cấu hình trường phái truyền vào FactorEngine. Tối thiểu ở v1 (chỉ `school`); mở rộng sau (aspect_set, dignity_rules...) mà không phá vỡ hợp đồng. */
export interface FactorSchoolConfig {
  school: SchoolId;
}

/**
 * `FACTOR_ENGINE_SPEC.md` §Interface. MỘT implementation cho MỖI trường phái (western/vedic/...) —
 * KHÔNG bao giờ dùng chung xuyên trường phái (ADR-003). Deterministic: cùng `chart` + `schoolConfig`
 * + phiên bản engine ⇒ LUÔN cùng `Factor[]`.
 */
export interface FactorEngine {
  extractFactors(chart: NormalizedChart, schoolConfig: FactorSchoolConfig): Factor[];
}
