/**
 * API phiên cho POC nhân tướng — điểm ĐỘNG duy nhất của module.
 *
 * Trang `/nhan-tuong` vẫn là `prerender = true` (HTML tĩnh ở edge). Chỉ route này
 * động, nên middleware chỉ chạy cho nó chứ không cho trang.
 *
 * KHÔNG nhận ảnh, video, âm thanh. Chỉ số đo có cấu trúc.
 * KHÔNG nhận tên, ngày sinh, số điện thoại — Phase 1C không lưu thông tin cá nhân.
 *
 * GET  ?id=…                  → máy tính poll, trả SessionPublicView (không có writeToken)
 * POST {action:"create"}      → máy tính tạo phiên
 * POST {action:"connect"}     → điện thoại kết nối lần đầu, nhận writeToken
 * POST {action:"step"}        → điện thoại báo xong một bước (cần token)
 * POST {action:"voice"}       → điện thoại báo xong giọng nói (cần token)
 * POST {action:"complete"}    → điện thoại báo xong phiên (cần token)
 * POST {action:"fail"}        → điện thoại báo hỏng (cần token)
 */

import type { APIRoute } from "astro";

import {
  completeSession,
  connectSession,
  createSession,
  failSession,
  recordStep,
  recordVoice,
  resolveStore,
} from "../../../features/physiognomy/session/store";
import { FACE_STEPS, publicView, type FaceStep, type FaceTestSnapshot, type VoiceTestResult } from "../../../features/physiognomy/session/types";
import { parsePhysiognomySessionFeaturePayload } from "../../../features/physiognomy/features/transport";
import { parseDeviceInfoPayload } from "../../../features/physiognomy/session/device";
import { parseSampleLabel } from "../../../features/physiognomy/session/sample";

export const prerender = false;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      // Phiên là dữ liệu sống — không được để CDN hay trình duyệt cache.
      "Cache-Control": "no-store",
    },
  });
}

/** Giới hạn kích thước body: chặn ai đó nhét ảnh base64 vào đây. */
const MAX_BODY_BYTES = 16 * 1024;

const isFiniteNumOrNull = (v: unknown): v is number | null =>
  v === null || (typeof v === "number" && Number.isFinite(v));

/**
 * Kiểm tra snapshot do điện thoại gửi. Từ chối bất kỳ trường lạ.
 *
 * Cố ý chặt: nếu sau này ai thêm `forehead_fullness` vào phía client, request sẽ bị
 * từ chối ở đây chứ không âm thầm lọt vào dữ liệu phiên.
 */
function parseSnapshot(v: unknown): FaceTestSnapshot | { error: string } {
  if (typeof v !== "object" || v === null) return { error: "snapshot phải là object" };
  const o = v as Record<string, unknown>;

  if (typeof o.step !== "string" || !FACE_STEPS.includes(o.step as FaceStep)) {
    return { error: `step không hợp lệ: ${String(o.step)}` };
  }
  if (typeof o.timestamp !== "number" || !Number.isFinite(o.timestamp)) {
    return { error: "timestamp phải là số" };
  }

  const q = o.quality as Record<string, unknown> | undefined;
  const p = o.pose as Record<string, unknown> | undefined;
  const g = o.geometry as Record<string, unknown> | undefined;
  if (!q || !p || !g) return { error: "thiếu quality/pose/geometry" };

  if (typeof q.faceDetected !== "boolean") return { error: "quality.faceDetected phải là boolean" };
  for (const k of ["confidence", "brightness", "blur"] as const) {
    if (!isFiniteNumOrNull(q[k])) return { error: `quality.${k} phải là số hoặc null` };
  }
  for (const k of ["yaw", "pitch", "roll"] as const) {
    if (!isFiniteNumOrNull(p[k])) return { error: `pose.${k} phải là số hoặc null` };
  }
  const geoKeys = [
    "faceWidth", "faceHeight", "faceShapeRatio",
    "middleCourt", "upperCourt", "lowerCourt",
  ] as const;
  for (const k of geoKeys) {
    if (!isFiniteNumOrNull(g[k])) return { error: `geometry.${k} phải là số hoặc null` };
  }

  // Chỉ lấy đúng những trường đã khai — trường lạ bị loại bỏ, không lưu.
  return {
    step: o.step as FaceStep,
    timestamp: o.timestamp,
    quality: {
      faceDetected: q.faceDetected,
      confidence: q.confidence as number | null,
      brightness: q.brightness as number | null,
      blur: q.blur as number | null,
    },
    pose: {
      yaw: p.yaw as number | null,
      pitch: p.pitch as number | null,
      roll: p.roll as number | null,
    },
    geometry: {
      faceWidth: g.faceWidth as number | null,
      faceHeight: g.faceHeight as number | null,
      faceShapeRatio: g.faceShapeRatio as number | null,
      middleCourt: g.middleCourt as number | null,
      upperCourt: g.upperCourt as number | null,
      lowerCourt: g.lowerCourt as number | null,
    },
  };
}

function parseVoice(v: unknown): VoiceTestResult | { error: string } {
  if (typeof v !== "object" || v === null) return { error: "voice phải là object" };
  const o = v as Record<string, unknown>;
  if (typeof o.passed !== "boolean") return { error: "voice.passed phải là boolean" };
  if (typeof o.durationMs !== "number" || !Number.isFinite(o.durationMs)) {
    return { error: "voice.durationMs phải là số" };
  }
  if (typeof o.hasAudio !== "boolean") return { error: "voice.hasAudio phải là boolean" };
  if (o.mimeType !== null && typeof o.mimeType !== "string") {
    return { error: "voice.mimeType phải là chuỗi hoặc null" };
  }
  if (!isFiniteNumOrNull(o.sampleRate)) return { error: "voice.sampleRate phải là số hoặc null" };
  return {
    passed: o.passed,
    durationMs: o.durationMs,
    // Chỉ giữ tên MIME, cắt ngắn — không để lọt chuỗi dài bất thường vào phiên.
    mimeType: o.mimeType === null ? null : (o.mimeType as string).slice(0, 80),
    sampleRate: o.sampleRate as number | null,
    hasAudio: o.hasAudio,
  };
}

export const GET: APIRoute = async ({ url }) => {
  const id = url.searchParams.get("id");
  if (!id) return json({ error: "Thiếu tham số id." }, 400);
  const store = await resolveStore();
  const rec = await store.get(id);
  if (!rec) return json({ error: "Phiên không tồn tại hoặc đã hết hạn." }, 404);
  // publicView cố tình KHÔNG trả writeToken.
  return json(publicView(rec), 200);
};

export const POST: APIRoute = async ({ request }) => {
  const len = Number(request.headers.get("content-length") ?? "0");
  if (len > MAX_BODY_BYTES) {
    return json({ error: "Body quá lớn. API này chỉ nhận số đo, không nhận ảnh/âm thanh." }, 413);
  }

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json({ error: "Body quá lớn." }, 413);
    }
    body = JSON.parse(raw || "{}") as Record<string, unknown>;
  } catch {
    return json({ error: "Body không phải JSON hợp lệ." }, 400);
  }

  const action = body.action;
  const store = await resolveStore();

  if (action === "create") {
    // Nhãn mẫu nghiên cứu (Phase 1D-3A) CHỈ nhận khi chạy DEV. Vite thay
    // `import.meta.env.DEV` bằng hằng số lúc build, nên ở bản production cả nhánh này
    // biến mất khỏi bundle — không phải "kiểm rồi từ chối" mà là "không tồn tại".
    if (import.meta.env.DEV && body.sample != null) {
      const parsed = parseSampleLabel(body.sample);
      if (!parsed.ok) return json({ error: parsed.message, code: "bad_sample" }, 400);
      const rec = await createSession(store, Date.now(), parsed.sample);
      return json(
        { sessionId: rec.record.sessionId, expiresAt: rec.record.expiresAt, sample: parsed.sample },
        201,
      );
    }
    if (!import.meta.env.DEV && body.sample != null) {
      return json({ error: "Không nhận nhãn mẫu ở môi trường này.", code: "dev_only" }, 400);
    }
    const { record } = await createSession(store);
    return json({ sessionId: record.sessionId, expiresAt: record.expiresAt }, 201);
  }

  const id = typeof body.sessionId === "string" ? body.sessionId : null;
  if (!id) return json({ error: "Thiếu sessionId." }, 400);

  if (action === "connect") {
    // Khai báo máy CHỈ nhận khi chạy DEV — cùng một cổng như nhãn mẫu ở trên, và cùng
    // một lý do: đây là dữ liệu phục vụ nghiên cứu, bản production không cần nên không
    // thu. Ở production cả nhánh này bị cắt lúc build.
    let device = null as ReturnType<typeof parseDeviceInfoPayload>;
    if (import.meta.env.DEV && body.device != null) {
      device = parseDeviceInfoPayload(body.device);
      if (device === null) {
        return json({ error: "device không hợp lệ.", code: "bad_device" }, 400);
      }
    }
    if (!import.meta.env.DEV && body.device != null) {
      return json({ error: "Không nhận khai báo máy ở môi trường này.", code: "dev_only" }, 400);
    }
    const out = await connectSession(store, id, Date.now(), device);
    if (!out.ok) {
      return json({ error: out.message, code: out.code }, out.code === "not_found" ? 404 : 409);
    }
    // writeToken CHỈ trả ở đây, cho đúng điện thoại kết nối đầu tiên.
    return json({ writeToken: out.writeToken, status: out.record.status }, 200);
  }

  const token = typeof body.writeToken === "string" ? body.writeToken : null;
  if (!token) return json({ error: "Thiếu writeToken." }, 401);

  const statusFor = (code: string) =>
    code === "not_found" ? 404 : code === "bad_token" ? 403 : 409;

  if (action === "step") {
    const parsed = parseSnapshot(body.snapshot);
    if ("error" in parsed) return json({ error: parsed.error }, 400);
    const out = await recordStep(store, id, token, parsed);
    if (!out.ok) return json({ error: out.message, code: out.code }, statusFor(out.code));
    return json({ status: out.record.status }, 200);
  }

  if (action === "voice") {
    const parsed = parseVoice(body.voice);
    if ("error" in parsed) return json({ error: parsed.error }, 400);
    const out = await recordVoice(store, id, token, parsed);
    if (!out.ok) return json({ error: out.message, code: out.code }, statusFor(out.code));
    return json({ status: out.record.status }, 200);
  }

  if (action === "complete") {
    // `featureProfile` TUỲ CHỌN và phải là TRANSPORT PAYLOAD đã version hoá — API
    // KHÔNG nhận `PhysiognomyFeatureProfile` nội bộ (27.6 KB, vượt MAX_BODY_BYTES).
    //
    // `featureError` là đường báo hỏng tường minh: máy khách trích không được thì nói
    // ra, chứ không im lặng gửi complete trần rồi để máy tính tự đoán.
    if (body.featureProfile != null) {
      const parsed = parsePhysiognomySessionFeaturePayload(body.featureProfile, { sessionId: id });
      if (!parsed.ok) return json({ error: parsed.message, code: parsed.code }, 400);
      const out = await completeSession(store, id, token, Date.now(), {
        status: "ok",
        payload: parsed.payload,
      });
      if (!out.ok) return json({ error: out.message, code: out.code }, statusFor(out.code));
      return json({ status: out.record.status, featureStatus: "ok" }, 200);
    }

    if (typeof body.featureError === "string" && body.featureError.length > 0) {
      const out = await completeSession(store, id, token, Date.now(), {
        status: "unavailable",
        error: body.featureError.slice(0, 300),
      });
      if (!out.ok) return json({ error: out.message, code: out.code }, statusFor(out.code));
      return json({ status: out.record.status, featureStatus: "unavailable" }, 200);
    }

    const out = await completeSession(store, id, token);
    if (!out.ok) return json({ error: out.message, code: out.code }, statusFor(out.code));
    return json({ status: out.record.status, featureStatus: "none" }, 200);
  }

  if (action === "fail") {
    const reason = typeof body.reason === "string" ? body.reason : "không rõ";
    const out = await failSession(store, id, token, reason);
    if (!out.ok) return json({ error: out.message, code: out.code }, statusFor(out.code));
    return json({ status: out.record.status }, 200);
  }

  return json({ error: `action không hợp lệ: ${String(action)}` }, 400);
};
