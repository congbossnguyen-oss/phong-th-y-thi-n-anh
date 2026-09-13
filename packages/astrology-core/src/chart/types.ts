/**
 * NormalizedChart — Phase 2 (Normalized Chart). Đúng
 * docs/astrology-module/ARCHITECTURE/DOMAIN_MODEL.md §4 "Canonical Chart Model" (tên gốc
 * trong tài liệu freeze là `Chart` — đổi tên thành `NormalizedChart` ở code cho khớp đúng tên
 * tầng trong pipeline ARCHITECTURE_FREEZE.md §2 "NORMALIZED CHART", KHÔNG đổi field/shape nào)
 * và ADR-004-Canonical-Chart-Model.md.
 *
 * ĐÂY LÀ DATA CONTRACT — KHÔNG được chứa: luận giải, ý nghĩa nhà/cung, yoga, dự đoán, rule,
 * scoring, AI prompt. Mọi field ở đây là dữ kiện đã tính (fact) hoặc dữ kiện suy ra trực tiếp
 * từ hình học (derived fact) — KHÔNG phải phán đoán chiêm tinh.
 *
 * Xem docs/astrology-module/ARCHITECTURE/PHASE2_NORMALIZED_CHART_IMPLEMENTATION.md cho các
 * quyết định triển khai cụ thể (đổi tên tránh trùng, xử lý birthDataRef, v.v.) — tài liệu đó
 * KHÔNG sửa đổi bản freeze gốc, chỉ ghi chú thêm ở tầng implementation.
 */

import type { AyanamsaId, HouseSystemId, PrecisionClass } from "../astronomical/AstronomicalProvider.js";

/**
 * ID trường phái chiêm tinh. Cố ý để `string` (KHÔNG phải union đóng) — ADR-003 yêu cầu các
 * trường phái độc lập và có thể thêm mới (kể cả các hệ phong-thủy tương lai) mà KHÔNG cần sửa
 * schema NormalizedChart. Các giá trị đã biết tại Phase 1-4 (không đóng, chỉ tham khảo):
 * "western" | "vedic" | "hellenistic" | "traditional" | "kp".
 */
export type SchoolId = string;

/** 12 cung hoàng đạo — union đóng vì đây là hằng số thiên văn/quy ước phổ quát, giống nhau ở cả tropical lẫn sidereal (chỉ điểm 0° khác nhau), không phải một "quyết định" riêng của trường phái nào. */
export type ZodiacSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export const ZODIAC_SIGNS: readonly ZodiacSign[] = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];

export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * Loại tương quan góc giữa hai điểm (aspect). Cố ý để `string` mở — DOMAIN_MODEL.md không
 * đóng khung union này, và mỗi trường phái tự định nghĩa tập aspect của mình qua
 * `AstrologySchool.aspect_rules` (Phase 3+ Western: 5 aspect chính; Vedic Drishti dùng tập
 * khác hẳn) — đóng khung ở đây sẽ vi phạm school isolation.
 */
export type AspectType = string;

export type DignityType = "domicile" | "exaltation" | "detriment" | "fall" | "triplicity" | "term" | "decan";

export type AngleType = "ASC" | "MC" | "DESC" | "IC";

/** Re-export để consumer không phải import 2 nơi khác nhau cho cùng khái niệm zodiac type. */
export type ZodiacType = "tropical" | "sidereal";

export interface CalculationMetadata {
  calculationId: string;
  calculatedAt: Date;
  engine: string;
  engineVersion: string;
  ephemerisVersion: string | null;
  precisionClass: PrecisionClass;
  zodiacConfigVersion: string;
  houseSystem: HouseSystemId;
  ayanamsa: AyanamsaId | null;
  precisionPolicyVersion: string;
}

/**
 * Vị trí một hành tinh TRONG NormalizedChart — KHÁC với `PlanetPosition` của
 * `astronomical/AstronomicalProvider.ts` (đó là dữ kiện thiên văn thô từ provider, không có
 * sign/house). Đổi tên `NormalizedPlanetPosition` để tránh trùng tên export công khai của
 * Phase 1 — KHÔNG phải một type khác về ý nghĩa, chỉ là bản đã được Chart Calculation (Phase
 * 3+, CHƯA implement) làm giàu thêm sign/house.
 */
export interface NormalizedPlanetPosition {
  body: string; // CelestialBody (Phase 1) hoặc điểm mở rộng theo trường phái — để string mở như AstronomicalProvider đã làm.
  longitude: number; // độ hoàng đạo, 0-360
  latitude: number; // vĩ độ hoàng đạo, độ
  distanceAu: number | null;
  speedDegreesPerDay: number;
  isRetrograde: boolean; // LUÔN = speedDegreesPerDay < 0, không được suy đoán cách khác
  sign: ZodiacSign;
  signDegree: number; // 0..30, vị trí trong cung
  house: HouseNumber | null; // null nếu unknown-time chart
  source: "astronomical_core";
  precision: number; // độ bất định lan truyền, xem TEST_ARCHITECTURE.md
}

export interface NormalizedHouse {
  number: HouseNumber;
  sign: ZodiacSign;
  ruler: string; // CelestialBody cai quản cung nằm ở nhà này — do bảng cai quản CỦA TỪNG TRƯỜNG PHÁI quyết định (Chart Calculation, Phase 3+), NormalizedChart chỉ giữ chỗ.
}

export interface NormalizedHouseCusp {
  houseNumber: HouseNumber;
  longitude: number;
  houseSystem: HouseSystemId;
}

export interface NormalizedAngle {
  type: AngleType;
  longitude: number;
}

/** Node Mặt Trăng (Bắc Giao/Nam Giao) — tái dùng đúng shape của Phase 1's `astronomical/AstronomicalProvider.ts::NodePosition`, không định nghĩa lại vì DOMAIN_MODEL.md không thêm field nào ở tầng Chart so với tầng Provider cho node. */
export interface NormalizedNodePosition {
  nodeType: "true" | "mean";
  pole: "north" | "south";
  longitude: number;
}

/** Điểm tính toán (KHÔNG lấy trực tiếp từ ephemeris) — vd. Lilith trung bình, Điểm Đạo (Part of Fortune), Vertex... Tên điểm cụ thể do trường phái quyết định, để `string` mở. */
export interface NormalizedPointPosition {
  name: string;
  longitude: number;
  source: "computed" | "ephemeris";
}

export interface NormalizedAspectInstance {
  planetA: string;
  planetB: string;
  type: AspectType;
  exactAngle: number; // góc lý tưởng của loại aspect này, độ (vd. 90 cho square)
  actualAngle: number; // góc thực tế đo được giữa 2 điểm, độ
  orb: number; // |actualAngle - exactAngle|, độ, LUÔN >= 0
  withinOrb: boolean;
}

export interface NormalizedDignityResult {
  planet: string;
  sign: ZodiacSign;
  type: DignityType;
  score: number;
}

export interface NormalizedChart {
  metadata: CalculationMetadata;
  birthDataRef: string;
  school: SchoolId;
  zodiacType: ZodiacType;
  ayanamsa: AyanamsaId | null; // bắt buộc khác null nếu zodiacType === "sidereal" — xem validateNormalizedChart
  houseSystem: HouseSystemId;
  planets: NormalizedPlanetPosition[];
  points: NormalizedPointPosition[];
  houses: NormalizedHouse[];
  houseCusps: NormalizedHouseCusp[];
  angles: NormalizedAngle[];
  aspects: NormalizedAspectInstance[];
  dignities: NormalizedDignityResult[]; // rỗng ở Phase 2 (nội dung thuộc Phase 3+) — KHÔNG bắt buộc rỗng ở validation, chỉ là hiện trạng chưa có ai điền
  nodes: NormalizedNodePosition[];
}

/** Phiên bản schema NormalizedChart hiện tại — xem PHASE2_NORMALIZED_CHART_IMPLEMENTATION.md §Versioning. Tăng MAJOR khi có breaking change (xoá/đổi kiểu field), MINOR khi thêm field mới không bắt buộc. */
export const NORMALIZED_CHART_SCHEMA_VERSION = "1.0.0";
