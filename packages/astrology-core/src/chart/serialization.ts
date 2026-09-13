/**
 * Serialization ổn định cho `NormalizedChart` — dùng cho golden fixture, snapshot,
 * reproducibility check, evidence reference (Phase 7+) và debug. Key luôn sắp bảng chữ cái,
 * KHÔNG phụ thuộc locale/thứ tự chèn field — xem `stableStringify.ts`.
 *
 * Envelope bọc ngoài luôn kèm `schemaVersion` — bắt buộc theo yêu cầu "versionable"/"suitable
 * for golden fixtures". `deserializeNormalizedChart` từ chối thẳng nếu major version khác
 * (breaking change), chấp nhận minor/patch khác (field mới không bắt buộc).
 */
import { NORMALIZED_CHART_SCHEMA_VERSION, type NormalizedChart } from "./types.js";
import { stableStringify } from "./stableStringify.js";

interface SerializedEnvelope {
  schemaVersion: string;
  chart: NormalizedChart;
}

export function serializeNormalizedChart(chart: NormalizedChart): string {
  const envelope: SerializedEnvelope = { schemaVersion: NORMALIZED_CHART_SCHEMA_VERSION, chart };
  return stableStringify(envelope);
}

export class NormalizedChartVersionMismatchError extends Error {
  constructor(
    readonly expectedMajor: number,
    readonly actualVersion: string,
  ) {
    super(
      `NormalizedChart schemaVersion "${actualVersion}" không tương thích — cần major version ${expectedMajor}.x.x ` +
        `(đang chạy NORMALIZED_CHART_SCHEMA_VERSION=${NORMALIZED_CHART_SCHEMA_VERSION}).`,
    );
    this.name = "NormalizedChartVersionMismatchError";
  }
}

function majorVersionOf(semver: string): number {
  const major = Number(semver.split(".")[0]);
  return Number.isFinite(major) ? major : Number.NaN;
}

/**
 * Deserialize + kiểm tra tương thích version. KHÔNG tự validate cấu trúc (`validateNormalizedChart`
 * là bước riêng, gọi thêm sau nếu cần) — hàm này chỉ đảm nhiệm parse JSON + kiểm version.
 * `Date` fields (`calculatedAt`) được parse lại thành `Date` thật, KHÔNG để nguyên string ISO,
 * để round-trip cho ra đúng KIỂU DỮ LIỆU gốc, không chỉ đúng giá trị hiển thị.
 */
export function deserializeNormalizedChart(json: string): NormalizedChart {
  const parsed = JSON.parse(json) as SerializedEnvelope;
  const currentMajor = majorVersionOf(NORMALIZED_CHART_SCHEMA_VERSION);
  const parsedMajor = majorVersionOf(parsed.schemaVersion);
  if (parsedMajor !== currentMajor) {
    throw new NormalizedChartVersionMismatchError(currentMajor, parsed.schemaVersion);
  }
  return {
    ...parsed.chart,
    metadata: { ...parsed.chart.metadata, calculatedAt: new Date(parsed.chart.metadata.calculatedAt) },
  };
}
