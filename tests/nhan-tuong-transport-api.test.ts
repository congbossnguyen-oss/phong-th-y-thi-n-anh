/**
 * Phase 1D-2 — feature payload đi qua API phiên ở mức HTTP THẬT.
 *
 * Gọi thẳng handler GET/POST của `src/pages/api/nhan-tuong/session.ts` với `Request`
 * thật, nên kiểm được cả tầng validate, mã lỗi HTTP và chuyện phiên này không ghi đè
 * phiên kia.
 *
 * Tách khỏi `nhan-tuong-api.test.ts` (Phase 1C) để hai phase không lẫn vào nhau khi
 * đọc kết quả test.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { GET, POST } from "../src/pages/api/nhan-tuong/session";
import { buildFeatureProfile } from "../src/features/physiognomy/features/extract";
import { toPhysiognomySessionFeaturePayload } from "../src/features/physiognomy/features/transport";

const FIX = JSON.parse(
  readFileSync(join(import.meta.dirname, "fixtures", "canonical-face.json"), "utf-8"),
) as { frameWidth: number; frameHeight: number; landmarks: { x: number; y: number; z: number }[] };

async function post(body: unknown): Promise<{ status: number; json: Record<string, unknown> }> {
  const res = await POST({
    request: new Request("https://example.test/api/nhan-tuong/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  } as unknown as Parameters<typeof POST>[0]);
  return { status: res.status, json: (await res.json()) as Record<string, unknown> };
}

async function get(id: string): Promise<{ status: number; json: Record<string, unknown>; text: string }> {
  const url = new URL(`https://example.test/api/nhan-tuong/session?id=${encodeURIComponent(id)}`);
  const res = await GET({ url } as unknown as Parameters<typeof GET>[0]);
  const text = await res.text();
  return { status: res.status, json: JSON.parse(text) as Record<string, unknown>, text };
}

async function newSession() {
  const c = await post({ action: "create" });
  const id = String(c.json.sessionId);
  const conn = await post({ action: "connect", sessionId: id });
  return { id, token: String(conn.json.writeToken) };
}

/** Payload THẬT dựng từ fixture, gắn đúng sessionId của phiên đang test. */
function realPayload(sessionId: string): Record<string, unknown> {
  const observation = {
    step: "front" as const,
    landmarks: FIX.landmarks,
    frameWidth: FIX.frameWidth,
    frameHeight: FIX.frameHeight,
    pose: { yaw: 0, pitch: 0, roll: 0 },
    quality: { faceDetected: true, coverage: 0.6, brightness: 0.55, blur: 0.02 },
  };
  const r = toPhysiognomySessionFeaturePayload(
    buildFeatureProfile({ sessionId, capturedAt: Date.now(), observations: [observation] }),
  );
  if (!r.ok) throw new Error(`mapper hỏng: ${r.code}`);
  return JSON.parse(JSON.stringify(r.payload)) as Record<string, unknown>;
}

const feats = (p: Record<string, unknown>) => p.features as Record<string, unknown>[];

describe("API — complete kèm feature payload", () => {
  it("payload hợp lệ → 200, featureStatus ok, máy tính poll thấy lại nguyên vẹn", async () => {
    const { id, token } = await newSession();
    const featureProfile = realPayload(id);
    const done = await post({ action: "complete", sessionId: id, writeToken: token, featureProfile });
    expect(done.status).toBe(200);
    expect(done.json.featureStatus).toBe("ok");

    const result = (await get(id)).json.result as Record<string, unknown>;
    expect(result.featureStatus).toBe("ok");
    const got = result.featureProfile as Record<string, unknown>;
    expect(got.transportVersion).toBe("physiognomy-session-feature-v1");
    expect(got.featureSchemaVersion).toBe("physiognomy-feature-v1");
    expect(feats(got)).toHaveLength(29);
    // provenance còn nguyên sau một vòng KV
    expect(feats(got)[0]).toHaveProperty("m");
    expect(feats(got)[0]).toHaveProperty("l");
  });

  it("không gửi gì → vẫn 200, featureStatus none (tương thích ngược Phase 1C)", async () => {
    const { id, token } = await newSession();
    const done = await post({ action: "complete", sessionId: id, writeToken: token });
    expect(done.status).toBe(200);
    expect(done.json.featureStatus).toBe("none");
    const result = (await get(id)).json.result as Record<string, unknown>;
    expect(result.featureProfile).toBeNull();
    expect(result.featureStatus).toBe("none");
  });

  it("máy khách báo trích hỏng → 200, unavailable, phiên VẪN complete", async () => {
    const { id, token } = await newSession();
    const done = await post({
      action: "complete",
      sessionId: id,
      writeToken: token,
      featureError: "no_measurement: không feature nào đo được",
    });
    expect(done.status).toBe(200);
    expect(done.json.status).toBe("complete");
    expect(done.json.featureStatus).toBe("unavailable");
    const result = (await get(id)).json.result as Record<string, unknown>;
    expect(result.featureProfile).toBeNull();
    expect(String(result.featureError)).toContain("no_measurement");
  });

  it("transportVersion sai → 400", async () => {
    const { id, token } = await newSession();
    const featureProfile = realPayload(id);
    featureProfile.transportVersion = "physiognomy-session-feature-v2";
    const r = await post({ action: "complete", sessionId: id, writeToken: token, featureProfile });
    expect(r.status).toBe(400);
    expect(r.json.code).toBe("bad_transport_version");
  });

  it("featureSchemaVersion sai → 400", async () => {
    const { id, token } = await newSession();
    const featureProfile = realPayload(id);
    featureProfile.featureSchemaVersion = "physiognomy-feature-v2";
    const r = await post({ action: "complete", sessionId: id, writeToken: token, featureProfile });
    expect(r.status).toBe(400);
    expect(r.json.code).toBe("bad_schema_version");
  });

  it("feature hỏng cấu trúc → 400", async () => {
    const { id, token } = await newSession();
    const featureProfile = realPayload(id);
    feats(featureProfile)[0].c = 99;
    const r = await post({ action: "complete", sessionId: id, writeToken: token, featureProfile });
    expect(r.status).toBe(400);
    expect(r.json.code).toBe("bad_shape");
  });

  it("khoá feature lặp → 400", async () => {
    const { id, token } = await newSession();
    const featureProfile = realPayload(id);
    feats(featureProfile).push({ ...feats(featureProfile)[0] });
    const r = await post({ action: "complete", sessionId: id, writeToken: token, featureProfile });
    expect(r.status).toBe(400);
    expect(r.json.code).toBe("duplicate_key");
  });

  it("nhét media thô vào payload → 400, KHÔNG lặng lẽ bỏ qua", async () => {
    const { id, token } = await newSession();
    const featureProfile = realPayload(id);
    featureProfile.imageBase64 = "data:image/jpeg;base64,/9j/4AAQ";
    const r = await post({ action: "complete", sessionId: id, writeToken: token, featureProfile });
    expect(r.status).toBe(400);
    expect(r.json.code).toBe("unknown_field");
  });

  it("payload mang sessionId của phiên khác → 400 session_mismatch", async () => {
    const a = await newSession();
    const b = await newSession();
    const featureProfile = realPayload(a.id);
    const r = await post({
      action: "complete",
      sessionId: b.id,
      writeToken: b.token,
      featureProfile,
    });
    expect(r.status).toBe(400);
    expect(r.json.code).toBe("session_mismatch");
  });

  it("sai writeToken → 403 và phiên gốc KHÔNG bị ghi", async () => {
    const a = await newSession();
    const b = await newSession();
    const featureProfile = realPayload(a.id);
    const r = await post({
      action: "complete",
      sessionId: a.id,
      writeToken: b.token,
      featureProfile,
    });
    expect(r.status).toBe(403);
    expect((await get(a.id)).json.result).toBeNull();
  });

  it("cô lập phiên: ghi vào A không đụng B", async () => {
    const a = await newSession();
    const b = await newSession();
    await post({ action: "complete", sessionId: a.id, writeToken: a.token, featureProfile: realPayload(a.id) });
    const viewB = await get(b.id);
    expect(viewB.json.status).toBe("connected");
    expect(viewB.json.result).toBeNull();
    expect(viewB.text).not.toContain("transportVersion");
  });

  it("body quá cỡ → 413 trước khi chạm kho", async () => {
    const { id, token } = await newSession();
    const featureProfile = realPayload(id);
    feats(featureProfile)[0].m = "x".repeat(20 * 1024);
    const r = await post({ action: "complete", sessionId: id, writeToken: token, featureProfile });
    expect(r.status).toBe(413);
    expect((await get(id)).json.result).toBeNull();
  });

  it("vượt ngân sách 12 KB nhưng body vẫn dưới 16 KB → 400 oversize", async () => {
    const { id, token } = await newSession();
    const featureProfile = realPayload(id);
    feats(featureProfile)[0].m = "x".repeat(8 * 1024);
    const r = await post({ action: "complete", sessionId: id, writeToken: token, featureProfile });
    expect(r.status).toBe(400);
    expect(r.json.code).toBe("oversize");
  });

  it("poll KHÔNG lộ writeToken dù đã gắn payload", async () => {
    const { id, token } = await newSession();
    await post({ action: "complete", sessionId: id, writeToken: token, featureProfile: realPayload(id) });
    expect((await get(id)).text).not.toContain(token);
  });

  it("dữ liệu đã lưu KHÔNG chứa chữ nào mang nghĩa luận giải hay độ đầy đặn", async () => {
    const { id, token } = await newSession();
    await post({ action: "complete", sessionId: id, writeToken: token, featureProfile: realPayload(id) });
    const text = (await get(id)).text.toLowerCase();
    for (const bad of [
      "fullness", "destiny", "fortune", "personality", "auspicious", "wealth", "lucky",
      "base64", "image/", "video", "blob",
    ]) {
      expect(text, bad).not.toContain(bad);
    }
  });
});
