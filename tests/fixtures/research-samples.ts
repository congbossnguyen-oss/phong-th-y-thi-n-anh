/**
 * ⚠️⚠️ SYNTHETIC — NOT REAL RESEARCH DATA. ⚠️⚠️
 *
 * Mọi thứ trong tệp này do người viết test dựng bằng tay. KHÔNG một byte nào đến từ
 * người thật, từ camera thật hay từ điện thoại thật. Dùng nó để kiểm HỢP ĐỒNG của
 * đường ống — nhận gì, từ chối gì, đếm ra sao — và KHÔNG được coi nó là bằng chứng về
 * bất cứ điều gì liên quan tới khuôn mặt người.
 *
 * Repo hiện không có tệp nghiên cứu thật nào: mẫu thật duy nhất (Q3DD4K22BY) đã bị KV
 * xoá vì hết TTL 15 phút, và nó vốn cũng thiếu cả nhãn mẫu lẫn khai báo máy.
 *
 * Con số 5 người / 3 lượt / 2+ máy / 15 mẫu ở đây là HÌNH DẠNG của tập đích, dựng ra để
 * chứng minh bộ đếm thật sự suy từ dữ liệu. Nó không làm feature nào thành `validated`.
 */

import {
  FEATURE_SCHEMA_VERSION,
  VIEW_NAMES,
} from "../../src/features/physiognomy/features/schema";
import { TRANSPORT_VERSION } from "../../src/features/physiognomy/features/transport";
import { DEVICE_MODEL_UNAVAILABLE } from "../../src/features/physiognomy/session/device";
import type { DatasetInput } from "../../src/features/physiognomy/research/dataset";

/** Ba máy khác nhau. `iphone` cố ý không có model — web không bao giờ cho biết. */
export const MAY = {
  pixel: { os: "Android 14", browser: "Chrome 126", model: "Pixel 8" },
  iphone: { os: "iOS 17", browser: "Safari 17", model: DEVICE_MODEL_UNAVAILABLE },
  samsung: { os: "Android 13", browser: "Samsung Internet 23", model: "SM-S918B" },
};

export const NGUOI = ["A", "B", "C", "D", "E"] as const;
export const LUOT = [1, 2, 3] as const;

const view = (present: boolean) => ({
  present,
  quality: "usable" as const,
  pose: { yaw: 1, pitch: -1, roll: 0.5 },
});

export interface PayloadOpts {
  /** Ít hơn `VIEW_NAMES.length` để dựng lượt quét DỞ. */
  soView?: number;
  /** `null` → feature `unsupported`; `undefined` → giá trị bình thường. */
  middle?: number | null;
  /** Bỏ hẳn feature khỏi payload (khác với `null`). */
  boMiddle?: boolean;
}

/** Payload Transport V1 hợp lệ. */
export function payload(sessionId: string, opts: PayloadOpts = {}) {
  const soView = opts.soView ?? VIEW_NAMES.length;
  const views: Record<string, ReturnType<typeof view>> = {};
  VIEW_NAMES.forEach((v, i) => (views[v] = view(i < soView)));
  const features: Record<string, unknown>[] = [
    { k: "face.pose.yaw", v: 1, u: "degrees", c: 0.9, s: "measured", m: "m", w: "front", l: [] },
  ];
  if (!opts.boMiddle) {
    features.push({
      k: "face.three_courts.middle",
      v: opts.middle === undefined ? 0.4387 : opts.middle,
      u: "normalized_ratio",
      c: 0.7,
      s: opts.middle === null ? "unsupported" : "low_confidence",
      m: "headAxis3d_projection_ratio",
      w: "front",
      l: [10, 105, 334, 2, 152],
    });
  }
  return {
    transportVersion: TRANSPORT_VERSION,
    featureSchemaVersion: FEATURE_SCHEMA_VERSION,
    sessionId,
    capturedAt: 1_790_000_000_000,
    primaryView: "front" as const,
    views,
    quality: {
      overall: "usable" as const,
      faceDetected: true,
      poseValid: true,
      distanceValid: true,
      blur: 0.0017,
      brightness: 0.49,
      coverage: 0.37,
    },
    features,
  };
}

export interface FixOpts extends PayloadOpts {
  pid?: string;
  run?: number;
  device?: Record<string, string> | null;
  sessionId?: string;
  completedAt?: number | null;
  provenance?: unknown;
}

/** Một tệp đã xuất, HỢP LỆ theo mặc định. Mỗi test chỉ phá đúng một chỗ. */
export function fix(name: string, o: FixOpts = {}): DatasetInput {
  const pid = o.pid ?? "A";
  const run = o.run ?? 1;
  const sid = o.sessionId ?? `SESS${pid}${run}`;
  const device = o.device === undefined ? MAY.pixel : o.device;
  const completedAt = o.completedAt === undefined ? 1_790_000_000_001 : o.completedAt;
  const sampleId = `${pid}-${String(run).padStart(2, "0")}`;
  return {
    name,
    content: {
      exportVersion: "physiognomy-test-export-v1",
      sample: { participantId: pid, runNumber: run, sampleId, deviceLabel: "may-van-hanh" },
      sessionId: sid,
      createdAt: 1_790_000_000_000,
      completedAt,
      featureStatus: "ok",
      featureError: null,
      device,
      research: {
        gateVersion: "physiognomy-research-sample-v1",
        valid: true,
        gaps: [],
        explanation: "",
        provenance:
          o.provenance === undefined
            ? {
                participantId: pid,
                runNumber: run,
                sampleId,
                device,
                sessionId: sid,
                capturedAt: completedAt,
              }
            : o.provenance,
      },
      featureProfile: payload(sid, {
        soView: o.soView,
        middle: o.middle,
        boMiddle: o.boMiddle,
      }),
      suggestedFileName: `${pid}__run${run}.json`,
    },
  };
}

/**
 * Tập ĐÍCH bằng fixture: 5 người × 3 lượt = 15 mẫu, luân phiên 3 máy.
 *
 * ⚠️ SYNTHETIC. Đây là hình dạng của tập cần thu, không phải tập đã thu.
 */
export function tapDay(): DatasetInput[] {
  const may = [MAY.pixel, MAY.iphone, MAY.samsung];
  const out: DatasetInput[] = [];
  NGUOI.forEach((pid, i) => {
    for (const run of LUOT) {
      out.push(fix(`${pid}__run${run}.json`, { pid, run, device: may[i % may.length] }));
    }
  });
  return out;
}

/** Đọc nhánh sâu trong một `DatasetInput` để test đột biến từng trường. */
export function nhanh(f: DatasetInput): Record<string, unknown> {
  return f.content as Record<string, unknown>;
}
