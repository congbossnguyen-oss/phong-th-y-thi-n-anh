/**
 * TRANSPORT — `PhysiognomyFeatureProfile` (nội bộ)  →  payload gửi qua phiên.
 *
 * Hai lớp biểu diễn TÁCH RIÊNG, cố ý:
 *
 *   PhysiognomyFeatureProfile          = biểu diễn chuẩn NỘI BỘ. Đầy đủ, tự giải thích,
 *                                        có `note` cho người đọc. KHÔNG bao giờ bị cắt
 *                                        gọt chỉ để payload nhỏ đi.
 *   PhysiognomySessionFeaturePayload   = biểu diễn MẠNG. Chỉ mang dữ liệu RIÊNG của
 *                                        người này; mọi thứ tĩnh suy lại được từ
 *                                        `featureSchemaVersion`.
 *
 * Vì sao phải tách (đo thật, xem docs/PHYSIOGNOMY_FEATURE_TRANSPORT_AUDIT.md):
 *   · profile đầy đủ nặng ~27.6 KB
 *   · `session.ts` có MAX_BODY_BYTES = 16 KB → gửi nguyên là HTTP 413, chưa chạm KV
 *   · 60% profile là văn bản TĨNH: `note` ~7.8 KB + `twelvePalaces` ~8.8 KB, giống hệt
 *     nhau ở mọi người
 *
 * KHÔNG luận giải, KHÔNG phân loại, KHÔNG Rule Engine/KB/LLM. Tầng này chỉ đổi hình
 * dạng dữ liệu, không đổi ý nghĩa: `unsupported` vẫn là `unsupported`, `null` vẫn là
 * `null`, không có giá trị nào bị bịa ra.
 */

import type {
  FeatureStatus,
  FeatureUnit,
  PhysiognomyFeatureProfile,
  QualityGrade,
  ViewName,
} from "./schema";
import { FEATURE_SCHEMA_VERSION, VIEW_NAMES } from "./schema";

export const TRANSPORT_VERSION = "physiognomy-session-feature-v1" as const;

/**
 * Ngân sách byte cho payload feature.
 *
 * API chặn ở 16 KB (`MAX_BODY_BYTES`). Đặt 12 KB để còn 4 KB cho phần vỏ của request
 * (`action`, `sessionId`, `writeToken`, header JSON). KHÔNG nhắm sát 16 KB.
 *
 * Đo thật trên fixture: 1 view ≈ 5.2 KB, 6 view ≈ 5.3 KB → dư hơn gấp đôi.
 */
export const MAX_FEATURE_TRANSPORT_BYTES = 12 * 1024;

/**
 * Một feature trên dây. Khoá viết tắt một chữ cái — KHÔNG phải để "tối ưu cho vui" mà
 * vì tên đầy đủ lặp 29 lần tốn ~1.4 KB. Ý nghĩa ghi ngay đây, và `FIELD_MEANING` bên
 * dưới là bản máy đọc được để người nhận không phải tra tài liệu.
 *
 * TÁM trường provenance, không được thiếu trường nào.
 */
export interface TransportFeature {
  /** key — khoá máy, ví dụ "face.nose.bridge_ratio" */
  k: string;
  /** value — null khi unsupported. KHÔNG BAO GIỜ là 0 thay cho "thiếu". */
  v: number | null;
  /** unit */
  u: FeatureUnit;
  /** confidence, 0..1 */
  c: number;
  /** status */
  s: FeatureStatus;
  /** method — công thức, dạng máy đọc được */
  m: string;
  /** source view — view nào cấp số này */
  w: ViewName | null;
  /** source landmarks — chỉ số MediaPipe. Là HẰNG SỐ của model, KHÔNG phải toạ độ. */
  l: number[];
}

/** Bảng nghĩa của khoá viết tắt, để người đọc JSON không phải mở tài liệu. */
export const FIELD_MEANING: Readonly<Record<keyof TransportFeature, string>> = {
  k: "key",
  v: "value",
  u: "unit",
  c: "confidence",
  s: "status",
  m: "method",
  w: "sourceView",
  l: "sourceLandmarks",
} as const;

export interface TransportViewSummary {
  present: boolean;
  quality: QualityGrade;
  /** Tư thế đầu ở view này. Số đo TƯ THẾ, không phải đặc điểm nhân tướng. */
  pose: { yaw: number | null; pitch: number | null; roll: number | null };
}

export interface TransportQuality {
  overall: QualityGrade;
  faceDetected: boolean;
  poseValid: boolean;
  distanceValid: boolean;
  blur: number | null;
  brightness: number | null;
  /** Bề ngang mặt / bề ngang khung hình. MediaPipe face mesh KHÔNG trả confidence thật. */
  coverage: number | null;
}

export interface PhysiognomySessionFeaturePayload {
  transportVersion: typeof TRANSPORT_VERSION;
  /** Bản feature schema đã sinh ra payload này. Đổi độc lập với transportVersion. */
  featureSchemaVersion: typeof FEATURE_SCHEMA_VERSION;
  sessionId: string;
  capturedAt: number;
  /** View cấp số cho các feature hình học. null khi không view nào đủ chất lượng. */
  primaryView: ViewName | null;
  views: Record<ViewName, TransportViewSummary>;
  quality: TransportQuality;
  /** PHẲNG và KHỬ TRÙNG theo `k`. */
  features: TransportFeature[];
}

/** Khoá cấp cao nhất được phép. Dùng cho cả dựng lẫn kiểm — một nguồn sự thật. */
export const PAYLOAD_KEYS = [
  "transportVersion", "featureSchemaVersion", "sessionId", "capturedAt",
  "primaryView", "views", "quality", "features",
] as const;

export const FEATURE_KEYS = ["k", "v", "u", "c", "s", "m", "w", "l"] as const;

// ───────────────────────────────────────────────────────────── kết quả mapper

export type MapResult =
  | { ok: true; payload: PhysiognomySessionFeaturePayload; bytes: number }
  | { ok: false; code: MapErrorCode; message: string; bytes?: number };

export type MapErrorCode =
  | "schema_mismatch"
  | "no_measurement"
  | "oversize"
  | "duplicate_key";

/** Số byte UTF-8 thật của payload sau khi JSON hoá. Không đếm ký tự. */
export function payloadBytes(payload: unknown): number {
  const json = JSON.stringify(payload);
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(json).length;
  // Node cũ / môi trường không có TextEncoder.
  return Buffer.byteLength(json, "utf8");
}

// ───────────────────────────────────────────────────────────────── mapper

/**
 * Gom mọi `MeasuredFeature` trong profile theo thứ tự duyệt ổn định.
 *
 * `face.geometry.face_shape_ratio` nằm ở HAI chỗ trong profile nội bộ (nhóm `geometry`
 * và nhóm `faceShape`) — cố ý ở tầng nội bộ, nhưng trên dây thì phải xuất hiện đúng
 * MỘT lần. Lần gặp đầu tiên thắng; lần sau bị bỏ qua nếu giống hệt.
 */
function collectFeatures(
  profile: PhysiognomyFeatureProfile,
): { features: TransportFeature[]; conflict: string | null } {
  const byKey = new Map<string, TransportFeature>();
  let conflict: string | null = null;

  const walk = (v: unknown) => {
    if (v === null || typeof v !== "object") return;
    if (Array.isArray(v)) return;
    const o = v as Record<string, unknown>;
    if (typeof o.key === "string" && typeof o.status === "string" && "value" in o) {
      const t: TransportFeature = {
        k: o.key,
        v: (o.value as number | null) ?? null,
        u: o.unit as FeatureUnit,
        c: o.confidence as number,
        s: o.status as FeatureStatus,
        m: o.method as string,
        w: (o.sourceView as ViewName | null) ?? null,
        l: Array.isArray(o.sourceLandmarks) ? [...(o.sourceLandmarks as number[])] : [],
      };
      const seen = byKey.get(t.k);
      if (seen === undefined) {
        byKey.set(t.k, t);
      } else if (JSON.stringify(seen) !== JSON.stringify(t)) {
        // Cùng khoá nhưng KHÁC giá trị — đây là lỗi thật của tầng feature, không phải
        // chuyện nén. Không được tự chọn bản nào.
        conflict ??= t.k;
      }
      return;
    }
    for (const x of Object.values(o)) walk(x);
  };

  // Thứ tự cố định để payload deterministic.
  walk(profile.geometry);
  walk(profile.faceShape);
  walk(profile.threeCourts);
  walk(profile.fiveOfficials);
  walk(profile.pose);

  return { features: [...byKey.values()], conflict };
}

/**
 * `PhysiognomyFeatureProfile` → payload.
 *
 * Thuần và deterministic: cùng profile thì luôn ra cùng payload, cùng số byte. Không
 * gọi mạng, không chạm KV, không đụng DOM, KHÔNG sửa `profile`.
 *
 * Trả lỗi rõ ràng thay vì payload giả khi:
 *   · `schema_mismatch` — profile không phải bản schema tầng này biết đọc
 *   · `duplicate_key`   — cùng khoá cho hai giá trị khác nhau (lỗi tầng feature)
 *   · `no_measurement`  — KHÔNG feature nào có số. Gửi payload rỗng chỉ làm desktop
 *                         tưởng đã đo được; thà báo hỏng.
 *   · `oversize`        — vượt ngân sách. KHÔNG cắt bớt feature cho vừa.
 */
export function toPhysiognomySessionFeaturePayload(
  profile: PhysiognomyFeatureProfile,
  context?: { maxBytes?: number },
): MapResult {
  if (profile.schemaVersion !== FEATURE_SCHEMA_VERSION) {
    return {
      ok: false,
      code: "schema_mismatch",
      message:
        `Profile có schemaVersion "${String(profile.schemaVersion)}", tầng transport ` +
        `chỉ đọc được "${FEATURE_SCHEMA_VERSION}".`,
    };
  }

  const { features, conflict } = collectFeatures(profile);
  if (conflict !== null) {
    return {
      ok: false,
      code: "duplicate_key",
      message: `Khoá "${conflict}" xuất hiện hai lần với giá trị khác nhau trong profile.`,
    };
  }

  if (!features.some((f) => f.v !== null)) {
    return {
      ok: false,
      code: "no_measurement",
      message:
        "Không feature nào đo được (mọi value đều null). Không dựng payload — gửi đi " +
        "chỉ làm máy tính tưởng đã đo được.",
    };
  }

  const views = {} as Record<ViewName, TransportViewSummary>;
  for (const v of VIEW_NAMES) {
    const s = profile.views[v];
    views[v] = {
      present: s.present,
      quality: s.quality,
      pose: { yaw: s.pose.yaw, pitch: s.pose.pitch, roll: s.pose.roll },
    };
  }

  const payload: PhysiognomySessionFeaturePayload = {
    transportVersion: TRANSPORT_VERSION,
    featureSchemaVersion: FEATURE_SCHEMA_VERSION,
    sessionId: profile.sessionId,
    capturedAt: profile.capturedAt,
    // Lấy từ chính feature chứ không đoán: view nào đang cấp số hình học.
    primaryView: features.find((f) => f.v !== null && f.w !== null)?.w ?? null,
    views,
    quality: {
      overall: profile.quality.overall,
      faceDetected: profile.quality.faceDetected,
      poseValid: profile.quality.poseValid,
      distanceValid: profile.quality.distanceValid,
      blur: profile.quality.blur,
      brightness: profile.quality.brightness,
      coverage: profile.quality.confidence,
    },
    features,
  };

  const bytes = payloadBytes(payload);
  const budget = context?.maxBytes ?? MAX_FEATURE_TRANSPORT_BYTES;
  if (bytes > budget) {
    return {
      ok: false,
      code: "oversize",
      message:
        `Payload ${bytes} byte, vượt ngân sách ${budget} byte. KHÔNG cắt bớt feature ` +
        "để vừa — sửa phần biểu diễn tĩnh, đừng bỏ provenance.",
      bytes,
    };
  }
  return { ok: true, payload, bytes };
}

// ─────────────────────────────────────────────────────────────── kiểm payload

export type ParseResult =
  | { ok: true; payload: PhysiognomySessionFeaturePayload }
  | { ok: false; code: ParseErrorCode; message: string };

export type ParseErrorCode =
  | "not_object"
  | "bad_transport_version"
  | "bad_schema_version"
  | "unknown_field"
  | "bad_shape"
  | "duplicate_key"
  | "session_mismatch"
  | "oversize";

const GRADES: readonly QualityGrade[] = ["excellent", "good", "usable", "poor", "invalid"];
const STATUSES: readonly FeatureStatus[] = ["measured", "low_confidence", "unsupported"];
const UNITS: readonly FeatureUnit[] = ["normalized_ratio", "degrees", "score", "boolean"];

const isNumOrNull = (v: unknown): v is number | null =>
  v === null || (typeof v === "number" && Number.isFinite(v));

/**
 * Kiểm payload đến từ máy khách. WHITELIST — trường lạ là TỪ CHỐI, không phải bỏ qua.
 *
 * Từ chối trường lạ (chứ không lặng lẽ loại) là có chủ đích: nếu máy khách nhét
 * `imageBase64` hay `landmarks` vào, ta muốn biết ngay chứ không muốn nó trôi qua.
 */
export function parsePhysiognomySessionFeaturePayload(
  raw: unknown,
  expect: { sessionId: string; maxBytes?: number },
): ParseResult {
  const bad = (code: ParseErrorCode, message: string): ParseResult => ({ ok: false, code, message });

  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return bad("not_object", "featureProfile phải là object.");
  }
  const o = raw as Record<string, unknown>;

  for (const k of Object.keys(o)) {
    if (!(PAYLOAD_KEYS as readonly string[]).includes(k)) {
      return bad("unknown_field", `Trường không được phép trong payload: "${k}".`);
    }
  }
  if (o.transportVersion !== TRANSPORT_VERSION) {
    return bad(
      "bad_transport_version",
      `transportVersion phải là "${TRANSPORT_VERSION}", nhận được "${String(o.transportVersion)}".`,
    );
  }
  if (o.featureSchemaVersion !== FEATURE_SCHEMA_VERSION) {
    return bad(
      "bad_schema_version",
      `featureSchemaVersion phải là "${FEATURE_SCHEMA_VERSION}", nhận được "${String(o.featureSchemaVersion)}".`,
    );
  }
  if (o.sessionId !== expect.sessionId) {
    return bad("session_mismatch", "sessionId trong payload không khớp phiên đang ghi.");
  }
  if (typeof o.capturedAt !== "number" || !Number.isFinite(o.capturedAt)) {
    return bad("bad_shape", "capturedAt phải là số.");
  }
  if (o.primaryView !== null && !(VIEW_NAMES as readonly string[]).includes(o.primaryView as string)) {
    return bad("bad_shape", `primaryView không hợp lệ: ${String(o.primaryView)}.`);
  }

  // ── views
  if (typeof o.views !== "object" || o.views === null || Array.isArray(o.views)) {
    return bad("bad_shape", "views phải là object.");
  }
  const rawViews = o.views as Record<string, unknown>;
  for (const k of Object.keys(rawViews)) {
    if (!(VIEW_NAMES as readonly string[]).includes(k)) {
      return bad("unknown_field", `View không hợp lệ: "${k}".`);
    }
  }
  const views = {} as Record<ViewName, TransportViewSummary>;
  for (const v of VIEW_NAMES) {
    const s = rawViews[v] as Record<string, unknown> | undefined;
    if (!s || typeof s !== "object") return bad("bad_shape", `Thiếu view "${v}".`);
    for (const k of Object.keys(s)) {
      if (!["present", "quality", "pose"].includes(k)) {
        return bad("unknown_field", `Trường lạ trong view "${v}": "${k}".`);
      }
    }
    if (typeof s.present !== "boolean") return bad("bad_shape", `view.${v}.present phải là boolean.`);
    if (!GRADES.includes(s.quality as QualityGrade)) {
      return bad("bad_shape", `view.${v}.quality không hợp lệ.`);
    }
    const p = s.pose as Record<string, unknown> | undefined;
    if (!p || typeof p !== "object") return bad("bad_shape", `view.${v}.pose phải là object.`);
    for (const axis of ["yaw", "pitch", "roll"] as const) {
      if (!isNumOrNull(p[axis])) return bad("bad_shape", `view.${v}.pose.${axis} phải là số hoặc null.`);
    }
    views[v] = {
      present: s.present,
      quality: s.quality as QualityGrade,
      pose: { yaw: p.yaw as number | null, pitch: p.pitch as number | null, roll: p.roll as number | null },
    };
  }

  // ── quality
  const q = o.quality as Record<string, unknown> | undefined;
  if (!q || typeof q !== "object") return bad("bad_shape", "quality phải là object.");
  const QKEYS = ["overall", "faceDetected", "poseValid", "distanceValid", "blur", "brightness", "coverage"];
  for (const k of Object.keys(q)) {
    if (!QKEYS.includes(k)) return bad("unknown_field", `Trường lạ trong quality: "${k}".`);
  }
  if (!GRADES.includes(q.overall as QualityGrade)) return bad("bad_shape", "quality.overall không hợp lệ.");
  for (const k of ["faceDetected", "poseValid", "distanceValid"] as const) {
    if (typeof q[k] !== "boolean") return bad("bad_shape", `quality.${k} phải là boolean.`);
  }
  for (const k of ["blur", "brightness", "coverage"] as const) {
    if (!isNumOrNull(q[k])) return bad("bad_shape", `quality.${k} phải là số hoặc null.`);
  }

  // ── features
  if (!Array.isArray(o.features)) return bad("bad_shape", "features phải là mảng.");
  if (o.features.length === 0) return bad("bad_shape", "features rỗng.");
  const features: TransportFeature[] = [];
  const seen = new Set<string>();
  for (const item of o.features) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      return bad("bad_shape", "Mỗi feature phải là object.");
    }
    const f = item as Record<string, unknown>;
    for (const k of Object.keys(f)) {
      if (!(FEATURE_KEYS as readonly string[]).includes(k)) {
        return bad("unknown_field", `Trường lạ trong feature: "${k}".`);
      }
    }
    // Khoá máy: chỉ chữ thường, số, chấm và gạch dưới. Chặn luôn khoá tiếng Việt.
    if (typeof f.k !== "string" || !/^face\.[a-z0-9_]+\.[a-z0-9_]+$/.test(f.k)) {
      return bad("bad_shape", `Khoá feature không hợp lệ: ${String(f.k)}.`);
    }
    if (seen.has(f.k)) return bad("duplicate_key", `Khoá feature lặp: "${f.k}".`);
    seen.add(f.k);
    if (!isNumOrNull(f.v)) return bad("bad_shape", `${f.k}: value phải là số hoặc null.`);
    if (!UNITS.includes(f.u as FeatureUnit)) return bad("bad_shape", `${f.k}: unit không hợp lệ.`);
    if (typeof f.c !== "number" || !(f.c >= 0 && f.c <= 1)) {
      return bad("bad_shape", `${f.k}: confidence phải trong [0,1].`);
    }
    if (!STATUSES.includes(f.s as FeatureStatus)) return bad("bad_shape", `${f.k}: status không hợp lệ.`);
    // KỶ LUẬT NGỮ NGHĨA: unsupported thì value BẮT BUỘC null, và ngược lại.
    if (f.s === "unsupported" && f.v !== null) {
      return bad("bad_shape", `${f.k}: unsupported nhưng có giá trị — không chấp nhận.`);
    }
    if (f.v === null && f.s !== "unsupported") {
      return bad("bad_shape", `${f.k}: value null nhưng status không phải unsupported.`);
    }
    if (typeof f.m !== "string" || f.m.length === 0) return bad("bad_shape", `${f.k}: thiếu method.`);
    if (f.w !== null && !(VIEW_NAMES as readonly string[]).includes(f.w as string)) {
      return bad("bad_shape", `${f.k}: sourceView không hợp lệ.`);
    }
    if (!Array.isArray(f.l) || f.l.some((i) => !Number.isInteger(i) || (i as number) < 0 || (i as number) > 467)) {
      return bad("bad_shape", `${f.k}: sourceLandmarks phải là mảng chỉ số 0..467.`);
    }
    features.push({
      k: f.k, v: f.v as number | null, u: f.u as FeatureUnit, c: f.c,
      s: f.s as FeatureStatus, m: f.m, w: (f.w as ViewName | null) ?? null,
      l: [...(f.l as number[])],
    });
  }

  const payload: PhysiognomySessionFeaturePayload = {
    transportVersion: TRANSPORT_VERSION,
    featureSchemaVersion: FEATURE_SCHEMA_VERSION,
    sessionId: o.sessionId as string,
    capturedAt: o.capturedAt,
    primaryView: (o.primaryView as ViewName | null) ?? null,
    views,
    quality: {
      overall: q.overall as QualityGrade,
      faceDetected: q.faceDetected as boolean,
      poseValid: q.poseValid as boolean,
      distanceValid: q.distanceValid as boolean,
      blur: q.blur as number | null,
      brightness: q.brightness as number | null,
      coverage: q.coverage as number | null,
    },
    features,
  };

  const bytes = payloadBytes(payload);
  const budget = expect.maxBytes ?? MAX_FEATURE_TRANSPORT_BYTES;
  if (bytes > budget) {
    return bad("oversize", `Payload ${bytes} byte, vượt ngân sách ${budget} byte.`);
  }
  return { ok: true, payload };
}

/** Đếm feature theo status — dùng cho phần tóm tắt kỹ thuật trên máy tính. */
export function summarizeFeatures(payload: PhysiognomySessionFeaturePayload): {
  measured: number;
  lowConfidence: number;
  unsupported: number;
  total: number;
} {
  let measured = 0;
  let lowConfidence = 0;
  let unsupported = 0;
  for (const f of payload.features) {
    if (f.s === "measured") measured++;
    else if (f.s === "low_confidence") lowConfidence++;
    else unsupported++;
  }
  return { measured, lowConfidence, unsupported, total: payload.features.length };
}
