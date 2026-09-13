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

/** Ném bởi các method CHƯA implement (ayanamsa — thuộc Phase 4+ Vedic, ZERO scope ở Phase 3A/3B-1). House cusps/ASC/MC ĐÃ implement từ Phase 3B-1 — KHÔNG còn dùng error này cho 3 method đó nữa. */
export class SwissEphemerisPhase3AScopeError extends Error {
  constructor(method: string) {
    super(
      `SwissEphemerisProvider.${method}() CHƯA implement — thuộc Phase 4+ (Vedic/ayanamsa), ` +
        `ZERO scope ở Western (Phase 3A/3B-1). Xem ` +
        `docs/astrology-module/ARCHITECTURE/PHASE3B1_HOUSES_ANGLES.md.`,
    );
    this.name = "SwissEphemerisPhase3AScopeError";
  }
}

/**
 * Ném khi `houseSystem` là một chuỗi KHÔNG nằm trong bảng ánh xạ Swiss Ephemeris đã biết của
 * provider này — KHÁC với `SwissEphemerisHouseSystemUndefinedAtLatitudeError` (đó là hệ ĐÃ biết
 * nhưng không tính được ở vĩ độ này). Quan trọng: Swiss Ephemeris (native) KHÔNG tự báo lỗi cho
 * một mã hệ nhà không xác định (`hsys` lạ) — nó âm thầm rơi về một hành vi mặc định (đã xác nhận
 * bằng thực nghiệm: hsys="Z" vẫn trả flag=OK). Vì vậy provider này PHẢI tự validate `houseSystem`
 * TRƯỚC KHI gọi native, không dựa vào native tự từ chối.
 */
export class SwissEphemerisUnsupportedHouseSystemError extends Error {
  constructor(readonly houseSystem: string) {
    super(
      `SwissEphemerisProvider chưa hỗ trợ house system "${houseSystem}". Xem ` +
        `docs/astrology-module/ARCHITECTURE/PHASE3B1_HOUSES_ANGLES.md để biết danh sách hệ đã hỗ trợ.`,
    );
    this.name = "SwissEphemerisUnsupportedHouseSystemError";
  }
}

/**
 * Ném khi house system ĐÃ BIẾT (có trong bảng ánh xạ) nhưng Swiss Ephemeris xác nhận KHÔNG tính
 * được tại vĩ độ này — vd. Placidus/Koch bên trong vòng cực (`ARCHITECTURE_FREEZE.md` §5:
 * "UNSUPPORTED_HOUSE_SYSTEM_AT_LATITUDE (e.g. Placidus undefined inside the polar circle)").
 * Phát hiện bằng cách đọc CHÍNH THÔNG ĐIỆP LỖI native ("within polar circle, switched to
 * Porphyry") — KHÔNG tự đoán ngưỡng vĩ độ (66.5°) vì đó là chi tiết thuật toán của Swiss Ephemeris,
 * không phải hằng số nên tự tay hardcode lại ở tầng gọi.
 */
export class SwissEphemerisHouseSystemUndefinedAtLatitudeError extends Error {
  constructor(
    readonly houseSystem: string,
    readonly latitude: number,
    readonly nativeError: string,
  ) {
    super(
      `SwissEphemerisProvider: house system "${houseSystem}" không xác định được tại vĩ độ ${latitude}° ` +
        `(Swiss Ephemeris tự chuyển sang Porphyry cho các cusp trung gian — provider này CHỦ ĐỘNG từ chối ` +
        `kết quả đó thay vì âm thầm trả về dưới nhãn "${houseSystem}"). Xem .nativeError để biết chi tiết native.`,
    );
    this.name = "SwissEphemerisHouseSystemUndefinedAtLatitudeError";
  }
}

/** Ném khi Swiss Ephemeris trả lỗi tính house/angle KHÔNG PHẢI do vĩ độ cực (vd. lỗi native khác không lường trước). */
export class SwissEphemerisHouseCalculationError extends Error {
  constructor(
    readonly operation: string,
    readonly nativeError: string,
  ) {
    super(`SwissEphemerisProvider: phép tính house/angle "${operation}" thất bại (xem .nativeError để biết chi tiết native).`);
    this.name = "SwissEphemerisHouseCalculationError";
  }
}
