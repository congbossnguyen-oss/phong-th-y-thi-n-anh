/**
 * `AstronomicalProvider` — BIÊN DUY NHẤT mà mọi code nghiệp vụ chiêm tinh (Phase 3+: Western,
 * Vedic...) được phép dùng để lấy dữ kiện thiên văn. KHÔNG code nào ngoài một implementation
 * cụ thể của interface này được import trực tiếp một thư viện ephemeris (Swiss Ephemeris hay
 * bất kỳ engine nào khác).
 *
 * Đúng docs/astrology-module/ARCHITECTURE/DOMAIN_MODEL.md §3 và ADR-001-Ephemeris-Strategy.
 * Interface này KHÔNG biết gì về cung hoàng đạo, nhà (ý nghĩa), dignity, hay bất kỳ phán đoán
 * chiêm tinh nào — chỉ trả dữ kiện hình học/thiên văn thuần tuý.
 *
 * PHASE 1: chỉ định nghĩa interface + kiểu dữ liệu hỗ trợ. KHÔNG có implementation nào import
 * Swiss Ephemeris/pysweph/pyswisseph — xem LICENSE_BOUNDARY.md (LEGAL DECISION REQUIRED).
 */

/**
 * Danh sách thiên thể ĐÃ BIẾT — chỉ để gợi ý autocomplete/tài liệu, KHÔNG phải danh sách đóng.
 * Đây là phần vá lỗi Phase 2.1 (Approved Decision 1, xem
 * docs/astrology-module/ARCHITECTURE/PHASE2_1_CONTRACT_HARDENING.md): bản Phase 1 gốc dùng
 * union đóng 10 giá trị, mâu thuẫn với chính DOMAIN_MODEL.md §3 ("extensible, not exhaustive")
 * và chặn đường Chiron/Lilith/tiểu hành tinh/sao cố định/điểm riêng theo trường phái — không
 * ai trong số đó liệt kê hết được bằng một union hữu hạn (vd. có hơn 800.000 tiểu hành tinh đã
 * đặt tên).
 */
export type KnownCelestialBody =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto"
  | "chiron"
  | "mean_lilith"
  | "true_lilith";

/**
 * Định danh thiên thể dùng trong `AstronomicalProvider` — mở (`string`) nhưng vẫn gợi ý được
 * 13 giá trị đã biết qua `KnownCelestialBody` nhờ kỹ thuật `(string & {})` (TypeScript vẫn
 * autocomplete các literal đã khai báo, đồng thời chấp nhận bất kỳ chuỗi nào khác — KHÔNG có
 * union đóng nào chặn thiên thể mới). Hoàn toàn tương thích ngược: mọi giá trị hợp lệ trước
 * Phase 2.1 (10 hành tinh cổ điển) vẫn là `CelestialBody` hợp lệ, KHÔNG đổi kiểu, KHÔNG đổi
 * hành vi — đây thuần là NỚI RỘNG tập giá trị chấp nhận được, không phải thay hình dạng.
 */
export type CelestialBody = KnownCelestialBody | (string & {});

export type NodeType = "true" | "mean";

export type HouseSystemId = string; // vd. "placidus", "whole_sign" — tập giá trị hợp lệ do school config (Phase 3+) quyết định, KHÔNG cố định ở Phase 1.

export type AyanamsaId = string; // vd. "lahiri" — chỉ cần khi school yêu cầu sidereal zodiac (Phase 4+).

/** Mức độ chính xác THỰC TẾ của kết quả — PHẢI được provider báo cáo trung thực, không mặc định lạc quan.
 * Lý do bắt buộc field này: Swiss Ephemeris được xác nhận (audit) có thể ÂM THẦM hạ xuống
 * xấp xỉ Moshier khi thiếu file dữ liệu mà KHÔNG báo lỗi — xem SWISS_EPHEMERIS_AUDIT.md
 * "Critical finding: silent Moshier fallback". */
export type PrecisionClass = "file_based" | "analytic_fallback" | "unknown";

export interface ProviderMetadata {
  engineName: string;
  engineVersion: string;
  ephemerisVersion: string | null;
  precisionClass: PrecisionClass;
}

export interface PlanetPosition {
  body: CelestialBody;
  /** Kinh độ hoàng đạo, độ, 0-360. */
  longitude: number;
  /** Vĩ độ hoàng đạo, độ. */
  latitude: number;
  /** Khoảng cách, đơn vị thiên văn (AU) — `null` nếu provider không cung cấp. */
  distanceAu: number | null;
  /** Tốc độ biểu kiến theo kinh độ, độ/ngày. Dấu quyết định nghịch hành. */
  speedDegreesPerDay: number;
  /** LUÔN đúng bằng `speedDegreesPerDay < 0` — provider tự tính, nơi gọi KHÔNG được tự suy đoán lại bằng cách khác. Để tường minh vì "retrograde" là một khả năng bắt buộc của interface này. */
  isRetrograde: boolean;
}

export interface NodePosition {
  nodeType: NodeType;
  /** "north" hoặc "south" — south luôn = north + 180°, nhưng provider vẫn trả rõ để tránh nơi gọi tự suy luận sai. */
  pole: "north" | "south";
  longitude: number;
}

export interface HouseCusps {
  houseSystem: HouseSystemId;
  /** Đúng 12 phần tử, index 0 = cusp nhà 1, ..., index 11 = cusp nhà 12. Độ, 0-360. */
  cusps: readonly [number, number, number, number, number, number, number, number, number, number, number, number];
}

export interface AngleResult {
  /** Độ, 0-360. */
  longitude: number;
}

/**
 * Chữ ký hàm chung: mọi phép tính đều cần MỘT thời điểm UTC chính xác (đã qua Timezone/DST
 * Engine — xem `timezone/resolveBirthDataInstant.ts`) cộng toạ độ nơi sinh khi cần (house
 * cusps/ASC/MC phụ thuộc vị trí quan sát, planet longitude thì không).
 */
export interface AstronomicalProvider {
  getMetadata(): ProviderMetadata;

  getPlanetPosition(utcInstant: Date, body: CelestialBody): PlanetPosition;

  getNodePosition(utcInstant: Date, nodeType: NodeType, pole: "north" | "south"): NodePosition;

  getHouseCusps(utcInstant: Date, latitude: number, longitude: number, houseSystem: HouseSystemId): HouseCusps;

  getAscendant(utcInstant: Date, latitude: number, longitude: number, houseSystem: HouseSystemId): AngleResult;

  getMidheaven(utcInstant: Date, latitude: number, longitude: number, houseSystem: HouseSystemId): AngleResult;

  /** Chỉ cần khi school yêu cầu sidereal zodiac (Phase 4+) — Phase 1 định nghĩa chữ ký, chưa có implementation nào gọi thật. */
  getAyanamsa(utcInstant: Date, ayanamsaId: AyanamsaId): number;
}
