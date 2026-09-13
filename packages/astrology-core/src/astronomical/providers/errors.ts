/**
 * Lỗi riêng của `SwissEphemerisProvider` — KHÔNG dùng chung `AstrologyCoreErrorCode`
 * (bảng đó là lỗi INPUT ở biên BirthData, đã freeze ở Phase 1; lỗi ở đây là lỗi TẦNG TÍNH TOÁN
 * thiên văn, một phạm trù khác). Mọi lỗi đều có `.name` ổn định + thông điệp tiếng Việt rõ ràng,
 * KHÔNG bao giờ để lộ nguyên văn chuỗi lỗi native của Swiss Ephemeris ra `message` chính (chuỗi
 * gốc, nếu có, nằm trong `nativeError` để debug nội bộ) — đúng yêu cầu Phase 3A "Do not leak
 * native library internals unnecessarily".
 */

export class SwissEphemerisUnsupportedBodyError extends Error {
  constructor(readonly body: string) {
    super(
      `SwissEphemerisProvider chưa hỗ trợ thiên thể "${body}" ở Phase 3A. ` +
        `Phase 3A chỉ tính: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, ` +
        `mean_lilith, true_lilith (qua getPlanetPosition), và mean/true node (qua getNodePosition). ` +
        `Tiểu hành tinh/sao cố định/điểm riêng trường phái khác chưa có ánh xạ sang Swiss Ephemeris ID.`,
    );
    this.name = "SwissEphemerisUnsupportedBodyError";
  }
}

export class SwissEphemerisCalculationError extends Error {
  constructor(
    readonly operation: string,
    readonly nativeError: string,
  ) {
    super(`SwissEphemerisProvider: phép tính "${operation}" thất bại (xem .nativeError để biết chi tiết native).`);
    this.name = "SwissEphemerisCalculationError";
  }
}

/**
 * Ném khi một phép tính CỤ THỂ âm thầm rớt xuống Moshier (hoặc ephemeris khác) thay vì dùng file
 * `.se1` thật — vd. ngày ngoài phạm vi 1800-2400 mà file hỗ trợ, hoặc file bị thiếu/hỏng. Đây là
 * chính xác phát hiện "Critical finding: silent Moshier fallback" của
 * docs/astrology-module/AUDIT/SWISS_EPHEMERIS_AUDIT.md — provider này CHỦ ĐỘNG throw thay vì trả
 * về kết quả âm thầm kém chính xác hơn được gắn nhãn như thể vẫn là file-based. Nơi gọi muốn chấp
 * nhận Moshier fallback (vd. ngày rất xa quá khứ) phải tự bắt lỗi này và quyết định — provider
 * không tự quyết định thay.
 */
export class SwissEphemerisPrecisionDegradedError extends Error {
  constructor(
    readonly requestedFlags: number,
    readonly returnedFlags: number,
    readonly nativeError: string,
  ) {
    super(
      `SwissEphemerisProvider: phép tính rớt xuống ephemeris xấp xỉ (Moshier hoặc khác) thay vì file ` +
        `dữ liệu thật — có thể do ngày nằm ngoài phạm vi 1800-2400 mà file .se1 hiện có hỗ trợ, hoặc file ` +
        `ephemeris bị thiếu/hỏng. requestedFlags=${requestedFlags}, returnedFlags=${returnedFlags}. ` +
        `Xem .nativeError để biết chi tiết native.`,
    );
    this.name = "SwissEphemerisPrecisionDegradedError";
  }
}

/** Ném bởi các method CHƯA implement ở Phase 3A (house cusps/ASC/MC/ayanamsa) — nằm ngoài phạm vi đã khai trong task brief Phase 3A, KHÔNG phải lỗi cấu hình. */
export class SwissEphemerisPhase3AScopeError extends Error {
  constructor(method: string) {
    super(
      `SwissEphemerisProvider.${method}() CHƯA implement ở Phase 3A — phạm vi Phase 3A chỉ gồm vị trí ` +
        `hành tinh/node thô (getPlanetPosition/getNodePosition). House cusps/Ascendant/Midheaven/Ayanamsa ` +
        `thuộc Phase 3B+ (Western house calculation) hoặc Phase 4+ (Vedic/ayanamsa) — xem ` +
        `docs/astrology-module/ARCHITECTURE/PHASE3A_ASTRONOMICAL_CORE.md.`,
    );
    this.name = "SwissEphemerisPhase3AScopeError";
  }
}
