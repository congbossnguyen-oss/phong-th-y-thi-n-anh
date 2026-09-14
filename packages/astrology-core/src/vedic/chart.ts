/**
 * Phase 4 — Integration/E2E. Lắp ráp pipeline Vedic V1 ĐẦY ĐỦ: Rashi/D1 (Step 3) + Nakshatra/Pada/
 * Lord (Step 4) + Vimshottari Mahadasha (Step 6) — ĐÚNG vai trò "hàm tiện dụng điều phối" mà
 * `western/chart.ts::buildWesternChart` đã làm cho Tây phương, KHÔNG thêm bất kỳ tính toán MỚI
 * nào ngoài việc gọi lại các hàm đã có (`calculateRashi`, `calculateNakshatraPosition`,
 * `calculateVimshottariDasha`) — KHÔNG import `sweph`, KHÔNG import `western/`.
 *
 * KHÔNG lắp ráp `NormalizedChart` — pipeline được yêu cầu validate (Birth → UTC → JD → tropical →
 * ayanamsa → sidereal → Rashi → Nakshatra Mặt Trăng → Dasha) KHÔNG có Ascendant/house cusps nào cả
 * (chưa từng có quyết định/implementation Vedic Ascendant/Whole-Sign house assignment ở bất kỳ
 * Step nào trước đây — D2 chỉ chọn "whole_sign" làm house SYSTEM mặc định, KHÔNG kèm theo một
 * implementation Ascendant/house-cusp nào). Ép dữ liệu hiện có vào `NormalizedChart` sẽ cần bịa
 * `houseCusps`/`house` cho planets (luôn rỗng/null) hoặc mở rộng kiến trúc ngoài phạm vi task này
 * — đúng nguyên tắc "Do not modify NormalizedChart unless the existing architecture proves it is
 * genuinely required" (KHÔNG genuinely required ở đây) và "Do not introduce a broad refactor just
 * to make integration easier".
 *
 * VỀ GIỜ SINH KHÔNG RÕ (`hasKnownLocalTime=false`): `resolveBirthDataInstant` (Phase 1) khi nhận
 * `BirthData.localTime === null` tự thay thế bằng 00:00:00 giờ địa phương làm "mốc ngày dương
 * lịch tham chiếu" — trả về một `Date` UTC trông HOÀN TOÀN BÌNH THƯỜNG, KHÔNG tự đánh dấu "đây là
 * giờ bịa". Vì vậy orchestrator này BẮT BUỘC nhận `hasKnownLocalTime` làm input RIÊNG (KHÔNG suy
 * ra được từ chính `utcInstant`) — CÙNG quy ước `buildWesternChart`'s `hasKnownLocalTime` — để
 * biết có được phép gọi `calculateVimshottariDasha` hay không. Rashi/Nakshatra VẪN được tính bằng
 * `utcInstant` đã cho (kể cả khi là mốc nửa đêm thay thế) — ĐÚNG quyết định D6 đã duyệt ("Rashi/D1
 * still computable, Nakshatra/Pada per-contract with boundary care") — CHỈ Dasha bị chặn hoàn
 * toàn (`null`, KHÔNG bịa object) vì độ nhạy với giờ chính xác cao hơn hẳn (xem
 * PHASE4_STEP5_DASHA_PREFLIGHT.md mục 3.12).
 */

import type { AstrologyCoreError } from "../errors.js";
import type { AstronomicalProvider, AyanamsaId, CelestialBody } from "../astronomical/AstronomicalProvider.js";
import type { NormalizedNakshatraPosition } from "../chart/types.js";
import { VEDIC_DEFAULT_AYANAMSA, calculateRashi, type RashiResult } from "./rashi.js";
import { calculateNakshatraPosition } from "./nakshatra.js";
import { calculateVimshottariDasha, mapPlanetProviderError, type VimshottariMahadashaSequence } from "./dasha/vimshottari.js";

/** Vị trí Rashi/D1 của MỘT hành tinh/điểm — `RashiResult` (Step 3) + định danh `body` (Step 3's `calculateRashi` là hàm thuần theo longitude, không tự biết đang tính cho hành tinh nào). */
export interface VedicRashiPosition extends RashiResult {
  body: string;
}

export interface CalculateVedicCoreInput {
  provider: AstronomicalProvider;
  /** UTC ĐÃ quy đổi qua `resolveBirthDataInstant` (Phase 1) — hàm này KHÔNG tự làm timezone/DST. Có thể là mốc "nửa đêm thay thế" nếu `hasKnownLocalTime=false` (xem doc comment ở trên). */
  utcInstant: Date;
  /**
   * `false` cho chart KHÔNG rõ giờ sinh (`BirthData.localTime === null`) — Vimshottari Dasha SẼ
   * KHÔNG được tính (`result.dasha === null`), Rashi/Nakshatra vẫn tính bình thường. Mặc định
   * `true`, ĐÚNG quy ước `buildWesternChart`'s `hasKnownLocalTime`.
   */
  hasKnownLocalTime?: boolean;
  /** Danh sách hành tinh/điểm cần Rashi + Nakshatra — KHÔNG có mặc định (bắt buộc truyền tường minh, tránh tự bịa một danh sách "mặc định" Vedic chưa từng được duyệt). */
  bodies: readonly CelestialBody[];
  /** Mặc định `VEDIC_DEFAULT_AYANAMSA` ("lahiri", D1 đã duyệt) nếu bỏ trống. */
  ayanamsaId?: AyanamsaId;
}

export interface VedicCoreResult {
  ayanamsaId: AyanamsaId;
  utcInstant: Date;
  hasKnownLocalTime: boolean;
  /** Rashi/D1 cho từng hành tinh/điểm trong `input.bodies`, ĐÚNG thứ tự đã truyền vào. */
  planets: VedicRashiPosition[];
  /** Nakshatra/Pada/Lord cho từng hành tinh/điểm trong `input.bodies` — CÙNG type `NormalizedChart.nakshatraPositions[]` dùng (Step 4), sẵn sàng ghép vào một `NormalizedChart` sau này nếu cần, KHÔNG cần chuyển đổi. */
  nakshatraPositions: NormalizedNakshatraPosition[];
  /**
   * `null` khi `hasKnownLocalTime=false` — KHÔNG BAO GIỜ là một object "unavailable" bịa ra (đúng
   * yêu cầu D6/Step 6: "Dasha must not be fabricated when exact birth instant is unavailable").
   * Tính ĐỘC LẬP với `bodies` (Dasha luôn cần Mặt Trăng, tự lấy qua provider, KHÔNG phụ thuộc
   * "moon" có nằm trong `bodies` hay không).
   */
  dasha: VimshottariMahadashaSequence | null;
}

export type CalculateVedicCoreResult = { ok: true; result: VedicCoreResult } | { ok: false; errors: AstrologyCoreError[] };

/**
 * Điều phối pipeline Vedic V1 đầy đủ — HÀM THUẦN ngoại trừ việc gọi `provider`/hàm đã có (đúng
 * hợp đồng `AstronomicalProvider`). KHÔNG throw ra ngoài trừ lỗi lập trình không lường trước, ĐÚNG
 * quy ước `buildWesternChart`/`calculateRashi`/`calculateVimshottariDasha` (dừng ở lỗi ĐẦU TIÊN,
 * KHÔNG gộp nhiều lỗi).
 */
export function calculateVedicCore(input: CalculateVedicCoreInput): CalculateVedicCoreResult {
  const ayanamsaId = input.ayanamsaId ?? VEDIC_DEFAULT_AYANAMSA;
  const hasKnownLocalTime = input.hasKnownLocalTime ?? true;

  const planets: VedicRashiPosition[] = [];
  const nakshatraPositions: NormalizedNakshatraPosition[] = [];

  for (const body of input.bodies) {
    let tropicalLongitude: number;
    try {
      tropicalLongitude = input.provider.getPlanetPosition(input.utcInstant, body).longitude;
    } catch (error) {
      return { ok: false, errors: [mapPlanetProviderError(error, body)] };
    }

    const rashi = calculateRashi({ provider: input.provider, utcInstant: input.utcInstant, tropicalLongitude, ayanamsaId });
    if (!rashi.ok) {
      return rashi;
    }
    planets.push({ body, ...rashi.result });
    nakshatraPositions.push(calculateNakshatraPosition(body, rashi.result.siderealLongitude));
  }

  let dasha: VimshottariMahadashaSequence | null = null;
  if (hasKnownLocalTime) {
    const dashaResult = calculateVimshottariDasha({ provider: input.provider, utcInstant: input.utcInstant, ayanamsaId });
    if (!dashaResult.ok) {
      return dashaResult;
    }
    dasha = dashaResult.result;
  }

  return {
    ok: true,
    result: {
      ayanamsaId,
      utcInstant: input.utcInstant,
      hasKnownLocalTime,
      planets,
      nakshatraPositions,
      dasha,
    },
  };
}
