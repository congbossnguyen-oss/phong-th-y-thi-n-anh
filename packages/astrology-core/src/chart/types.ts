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

/**
 * Phase 2.1 (Approved Decision 2 — xem
 * docs/astrology-module/ARCHITECTURE/PHASE2_1_CONTRACT_HARDENING.md): `DignityType` (union
 * đóng chỉ gồm từ vựng dignity Tây phương) đã BỊ LOẠI BỎ — nó khiến Vedic (moolatrikona, ngũ
 * bậc thân/thù...) không có cách nào biểu diễn hợp lệ trong cùng field. Thay bằng cặp định
 * danh MỞ `scheme` (hệ thống dignity/strength nào) + `type` (ý nghĩa cụ thể, do CHÍNH `scheme`
 * đó định nghĩa) — giống hệt cách `AspectType`/`HouseSystemId`/`SchoolId` đã làm trong file
 * này, không phải một cách tiếp cận mới.
 */
export type DignitySchemeId = string; // vd. "western_traditional", "vedic_shadbala" — mở, do trường phái quyết định.
export type DignityTypeId = string; // ý nghĩa phụ thuộc `scheme`; vd. scheme="western_traditional" => "domicile"|"exaltation"|"detriment"|"fall"|"triplicity"|"term"|"decan" (KHÔNG ép ở kiểu, chỉ theo quy ước của scheme đó).

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

/**
 * Kết quả dignity/strength — trung lập trường phái (Phase 2.1, Approved Decision 2). Shape
 * đúng theo yêu cầu duyệt: scheme/system identifier, type identifier, body identifier,
 * value/result, KHÔNG có field nào giả định riêng một trường phái.
 *
 * `sign` để TUỲ CHỌN (không bắt buộc như bản cũ) — dignity Tây phương (domicile/exaltation...)
 * luôn gắn với 1 cung nên sẽ điền field này, nhưng nhiều thành phần strength Vedic (vd. Dig
 * Bala theo NHÀ, Kaala Bala theo THỜI ĐIỂM, Cheshta Bala theo CHUYỂN ĐỘNG — 3 trong 6 thành
 * phần Shadbala) không gắn với một cung cụ thể nào cả — bắt buộc `sign` sẽ tự nó là một giả
 * định Tây phương trá hình, đúng lỗi Audit 4 đã chỉ ra.
 */
export interface NormalizedDignityResult {
  /** Hệ dignity/strength nào tạo ra kết quả này — vd. "western_traditional", "vedic_shadbala". Trường phái tự định nghĩa, KHÔNG cố định ở đây. */
  scheme: DignitySchemeId;
  /** Ý nghĩa cụ thể TRONG hệ `scheme` — vd. scheme="western_traditional" thì type="domicile"|"exaltation"|...; scheme="vedic_shadbala" thì type="sthana_bala"|"dig_bala"|... Ý nghĩa hoàn toàn do `scheme` quyết định, contract này không ép. */
  type: DignityTypeId;
  /** Hành tinh/điểm mà kết quả này áp dụng — đổi tên từ `planet` (bản cũ) vì Vedic có thể tính strength cho cả điểm không phải hành tinh cổ điển (vd. Lagna). */
  body: string;
  /** CHỈ điền khi bản thân kết quả dignity thực sự gắn với một cung cụ thể (đa số dignity Tây phương) — bỏ trống nếu scheme đó không dựa trên cung (vd. nhiều thành phần Shadbala). */
  sign?: ZodiacSign;
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

/**
 * Phiên bản schema NormalizedChart hiện tại — xem PHASE2_NORMALIZED_CHART_IMPLEMENTATION.md
 * §Versioning. Tăng MAJOR khi có breaking change (xoá/đổi kiểu field), MINOR khi thêm field
 * mới không bắt buộc.
 *
 * 1.0.0 -> 2.0.0 (Phase 2.1, Approved Decision 2): `NormalizedDignityResult` đổi hình dạng
 * (`planet` -> `body`, thêm `scheme` bắt buộc, `sign` từ bắt buộc thành tuỳ chọn, `type` đổi
 * từ union đóng sang định danh mở) — đây là breaking change đúng nghĩa của field lồng bên
 * trong `NormalizedChart.dignities[]`, nên PHẢI tăng MAJOR theo đúng chính sách đã có, dù thực
 * tế CHƯA có fixture/dữ liệu nào từng điền `dignities[]` khác rỗng (nội dung dignity là Phase
 * 3+) — chính sách versioning áp theo HÌNH DẠNG hợp đồng, không áp theo có dữ liệu thật hay
 * chưa. Xem PHASE2_1_CONTRACT_HARDENING.md §Versioning cho lý giải đầy đủ. Thay đổi
 * `CelestialBody` (Approved Decision 1) KHÔNG ảnh hưởng version này — đó là type của tầng
 * `AstronomicalProvider` (Phase 1), không thuộc schema `NormalizedChart`, và bản thân thay đổi
 * đó là NỚI RỘNG (mọi giá trị cũ vẫn hợp lệ), không phải breaking.
 */
export const NORMALIZED_CHART_SCHEMA_VERSION = "2.0.0";
