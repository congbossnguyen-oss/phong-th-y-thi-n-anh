/**
 * PHASE 1C — test API phiên ở mức HTTP THẬT.
 *
 * Gọi trực tiếp handler GET/POST của `src/pages/api/nhan-tuong/session.ts` với
 * `Request` thật, nên kiểm được cả tầng kiểm tra dữ liệu vào (validation), mã lỗi
 * HTTP, và header — những thứ test nghiệp vụ ở `nhan-tuong-session.test.ts` không chạm.
 *
 * Trong vitest (Node), `resolveStore()` trả về MemorySessionStore dùng chung cho cả
 * tiến trình — nên các test dưới đây chia nhau một kho, và mỗi test tự tạo phiên riêng.
 */
import { describe, expect, it } from "vitest";

import { GET, POST } from "../src/pages/api/nhan-tuong/session";
import { FACE_STEPS, type FaceStep } from "../src/features/physiognomy/session/types";

/** Gọi POST với body JSON. */
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

/**
 * Gọi GET. Trả về CẢ `json` lẫn `text` — body của `Response` chỉ đọc được MỘT LẦN,
 * nên helper đọc một lần rồi phát lại hai dạng, thay vì trả `res` cho người gọi tự
 * đọc lần nữa (lần thứ hai sẽ ra rỗng).
 */
async function get(
  id: string,
): Promise<{ status: number; json: Record<string, unknown>; text: string; headers: Headers }> {
  const url = new URL(`https://example.test/api/nhan-tuong/session?id=${encodeURIComponent(id)}`);
  const res = await GET({ url } as unknown as Parameters<typeof GET>[0]);
  const text = await res.text();
  return {
    status: res.status,
    json: JSON.parse(text) as Record<string, unknown>,
    text,
    headers: res.headers,
  };
}

function snapshotBody(step: FaceStep) {
  return {
    step,
    timestamp: Date.now(),
    quality: { faceDetected: true, confidence: 0.45, brightness: 0.5, blur: 0.01 },
    pose: { yaw: 1, pitch: -1, roll: 0.5 },
    geometry: {
      faceWidth: 300, faceHeight: 384, faceShapeRatio: 1.28,
      middleCourt: 0.426, upperCourt: 0.168, lowerCourt: 0.406,
    },
  };
}

async function newSession() {
  const c = await post({ action: "create" });
  const id = String(c.json.sessionId);
  const conn = await post({ action: "connect", sessionId: id });
  return { id, token: String(conn.json.writeToken) };
}

// ═══════════════════════════════════════════════════════════════ create

describe("API — create", () => {
  it("trả 201 kèm sessionId và expiresAt", async () => {
    const { status, json } = await post({ action: "create" });
    expect(status).toBe(201);
    expect(typeof json.sessionId).toBe("string");
    expect(typeof json.expiresAt).toBe("number");
  });

  it("KHÔNG trả writeToken ở bước create", async () => {
    const { json } = await post({ action: "create" });
    expect(json).not.toHaveProperty("writeToken");
  });

  it("action lạ → 400", async () => {
    const { status } = await post({ action: "xoa_het_du_lieu" });
    expect(status).toBe(400);
  });

  it("body không phải JSON → 400, không sập", async () => {
    const res = await POST({
      request: new Request("https://example.test/api", { method: "POST", body: "{{{" }),
    } as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
  });
});

// ═══════════════════════════════════════════════════════════════ GET

describe("API — GET (máy tính poll)", () => {
  it("thiếu id → 400", async () => {
    const res = await GET({ url: new URL("https://example.test/api") } as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(400);
  });

  it("id không tồn tại → 404", async () => {
    const { status } = await get("KHONGCOTHATDAU");
    expect(status).toBe(404);
  });

  it("phiên mới → status waiting, stepsDone rỗng, result null", async () => {
    const c = await post({ action: "create" });
    const { status, json } = await get(String(c.json.sessionId));
    expect(status).toBe(200);
    expect(json.status).toBe("waiting");
    expect(json.stepsDone).toEqual([]);
    expect(json.result).toBeNull();
  });

  it("đặt Cache-Control: no-store — phiên là dữ liệu sống, không được cache", async () => {
    const c = await post({ action: "create" });
    const { headers } = await get(String(c.json.sessionId));
    expect(headers.get("Cache-Control")).toBe("no-store");
  });

  it("KHÔNG BAO GIỜ lộ writeToken qua GET", async () => {
    const { id, token } = await newSession();
    const { text } = await get(id);
    expect(text).not.toContain(token);
    expect(text).not.toContain("writeToken");
  });
});

// ═══════════════════════════════════════════════════════════════ connect

describe("API — connect (điện thoại)", () => {
  it("kết nối lần đầu → 200 + writeToken", async () => {
    const c = await post({ action: "create" });
    const { status, json } = await post({ action: "connect", sessionId: String(c.json.sessionId) });
    expect(status).toBe(200);
    expect(typeof json.writeToken).toBe("string");
    expect(json.status).toBe("connected");
  });

  it("kết nối lần hai → 409 already_connected (phiên dùng một lần)", async () => {
    const { id } = await newSession();
    const { status, json } = await post({ action: "connect", sessionId: id });
    expect(status).toBe(409);
    expect(json.code).toBe("already_connected");
  });

  it("sessionId không tồn tại → 404", async () => {
    const { status } = await post({ action: "connect", sessionId: "KHONGCOTHAT" });
    expect(status).toBe(404);
  });

  it("thiếu sessionId → 400", async () => {
    const { status } = await post({ action: "connect" });
    expect(status).toBe(400);
  });
});

// ═══════════════════════════════════════════════════════ step: validation

describe("API — step: kiểm tra dữ liệu vào", () => {
  it("thiếu writeToken → 401", async () => {
    const { id } = await newSession();
    const { status } = await post({ action: "step", sessionId: id, snapshot: snapshotBody("front") });
    expect(status).toBe(401);
  });

  it("writeToken sai → 403", async () => {
    const { id } = await newSession();
    const { status, json } = await post({
      action: "step", sessionId: id, writeToken: "SAI-BET", snapshot: snapshotBody("front"),
    });
    expect(status).toBe(403);
    expect(json.code).toBe("bad_token");
  });

  it("gửi đúng → 200 và status đổi theo bước", async () => {
    const { id, token } = await newSession();
    const { status, json } = await post({
      action: "step", sessionId: id, writeToken: token, snapshot: snapshotBody("front"),
    });
    expect(status).toBe(200);
    expect(json.status).toBe("face_front");
  });

  it("step lạ → 400", async () => {
    const { id, token } = await newSession();
    const bad = { ...snapshotBody("front"), step: "forehead_fullness" };
    const { status, json } = await post({ action: "step", sessionId: id, writeToken: token, snapshot: bad });
    expect(status).toBe(400);
    expect(String(json.error)).toMatch(/step không hợp lệ/);
  });

  it("thiếu quality/pose/geometry → 400", async () => {
    const { id, token } = await newSession();
    const { status } = await post({
      action: "step", sessionId: id, writeToken: token,
      snapshot: { step: "front", timestamp: Date.now() },
    });
    expect(status).toBe(400);
  });

  it("số không hợp lệ (NaN/chuỗi) → 400", async () => {
    const { id, token } = await newSession();
    const bad = snapshotBody("front");
    (bad.pose as unknown as Record<string, unknown>).yaw = "nghiêng nhiều";
    const { status, json } = await post({ action: "step", sessionId: id, writeToken: token, snapshot: bad });
    expect(status).toBe(400);
    expect(String(json.error)).toMatch(/pose\.yaw/);
  });

  it("null được chấp nhận cho số đo (chưa đo được ≠ lỗi)", async () => {
    const { id, token } = await newSession();
    const s = snapshotBody("front");
    s.pose = { yaw: null, pitch: null, roll: null } as unknown as typeof s.pose;
    s.geometry.middleCourt = null as unknown as number;
    const { status } = await post({ action: "step", sessionId: id, writeToken: token, snapshot: s });
    expect(status).toBe(200);
  });

  it("TRƯỜNG LẠ bị loại bỏ, không lưu vào phiên", async () => {
    // Nếu sau này ai thêm forehead_fullness ở phía client, nó không được lọt vào dữ liệu.
    const { id, token } = await newSession();
    const s = {
      ...snapshotBody("front"),
      forehead_fullness: 0.82,
      geometry: { ...snapshotBody("front").geometry, nose_fullness: 0.7 },
    };
    const r = await post({ action: "step", sessionId: id, writeToken: token, snapshot: s });
    expect(r.status).toBe(200);
    const { text } = await get(id);
    expect(text).not.toContain("forehead_fullness");
    expect(text).not.toContain("nose_fullness");
  });

  it("body quá lớn → 413 (chặn nhét ảnh base64 vào API số đo)", async () => {
    const { id, token } = await newSession();
    const huge = "A".repeat(20 * 1024);
    const res = await POST({
      request: new Request("https://example.test/api", {
        method: "POST",
        body: JSON.stringify({ action: "step", sessionId: id, writeToken: token, snapshot: huge }),
      }),
    } as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(413);
  });
});

// ═══════════════════════════════════════════════════════════════ voice

describe("API — voice", () => {
  it("gửi đúng → 200", async () => {
    const { id, token } = await newSession();
    const { status } = await post({
      action: "voice", sessionId: id, writeToken: token,
      voice: { passed: true, durationMs: 10_200, mimeType: "audio/mp4", sampleRate: 44_100, hasAudio: true },
    });
    expect(status).toBe(200);
  });

  it("thiếu trường bắt buộc → 400", async () => {
    const { id, token } = await newSession();
    const { status } = await post({
      action: "voice", sessionId: id, writeToken: token, voice: { passed: true },
    });
    expect(status).toBe(400);
  });

  it("mimeType dài bất thường bị cắt 80 ký tự", async () => {
    const { id, token } = await newSession();
    await post({
      action: "voice", sessionId: id, writeToken: token,
      voice: {
        passed: true, durationMs: 1000, mimeType: "x".repeat(500),
        sampleRate: 48_000, hasAudio: true,
      },
    });
    const { json } = await get(id);
    const voice = json.voice as { mimeType: string };
    expect(voice.mimeType).toHaveLength(80);
  });

  it("mimeType null được chấp nhận (trình duyệt tự chọn)", async () => {
    const { id, token } = await newSession();
    const { status } = await post({
      action: "voice", sessionId: id, writeToken: token,
      voice: { passed: true, durationMs: 1000, mimeType: null, sampleRate: null, hasAudio: true },
    });
    expect(status).toBe(200);
  });
});

// ═══════════════════════════════════════════════════ tích hợp đầu-cuối

describe("API — tích hợp: Desktop → QR → Mobile → 6 bước → giọng nói → Desktop", () => {
  it("chạy trọn luồng, máy tính thấy tiến độ tăng dần và nhận kết quả cuối", async () => {
    // 1) Máy tính tạo phiên
    const created = await post({ action: "create" });
    expect(created.status).toBe(201);
    const id = String(created.json.sessionId);

    let view = (await get(id)).json;
    expect(view.status).toBe("waiting");

    // 2) Điện thoại quét QR, kết nối
    const conn = await post({ action: "connect", sessionId: id });
    const token = String(conn.json.writeToken);
    view = (await get(id)).json;
    expect(view.status).toBe("connected");

    // 3) Sáu bước
    for (let i = 0; i < FACE_STEPS.length; i++) {
      const r = await post({
        action: "step", sessionId: id, writeToken: token, snapshot: snapshotBody(FACE_STEPS[i]),
      });
      expect(r.status).toBe(200);
      view = (await get(id)).json;
      expect((view.stepsDone as string[]).length).toBe(i + 1);
    }
    expect(view.status).toBe("voice");

    // 4) Giọng nói
    await post({
      action: "voice", sessionId: id, writeToken: token,
      voice: { passed: true, durationMs: 10_400, mimeType: "audio/webm;codecs=opus", sampleRate: 48_000, hasAudio: true },
    });

    // 5) Hoàn tất
    const done = await post({ action: "complete", sessionId: id, writeToken: token });
    expect(done.status).toBe(200);
    expect(done.json.status).toBe("complete");

    // 6) Máy tính nhận kết quả
    view = (await get(id)).json;
    expect(view.status).toBe("complete");
    const result = view.result as {
      quality: { overall: string; faceTestsPassed: number; voicePassed: boolean };
      face: Record<string, unknown>;
    };
    expect(result.quality.overall).toBe("pass");
    expect(result.quality.faceTestsPassed).toBe(6);
    expect(result.quality.voicePassed).toBe(true);
    expect(result.face.pitchDown).not.toBeNull();
    expect(result.face.pitchUp).not.toBeNull();
  });

  it("sau complete thì mọi lệnh ghi đều bị chặn", async () => {
    const created = await post({ action: "create" });
    const id = String(created.json.sessionId);
    const conn = await post({ action: "connect", sessionId: id });
    const token = String(conn.json.writeToken);
    await post({ action: "complete", sessionId: id, writeToken: token });

    const again = await post({ action: "step", sessionId: id, writeToken: token, snapshot: snapshotBody("front") });
    expect(again.status).toBe(409);
    expect(again.json.code).toBe("finished");
  });

  it("fail: điện thoại báo hỏng → máy tính thấy status failed + lý do", async () => {
    const { id, token } = await newSession();
    await post({ action: "fail", sessionId: id, writeToken: token, reason: "Từ chối quyền camera" });
    const { json } = await get(id);
    expect(json.status).toBe("failed");
    expect(json.failureReason).toBe("Từ chối quyền camera");
  });

  it("CÁCH LY: token phiên A không ghi được vào phiên B", async () => {
    const a = await newSession();
    const b = await newSession();
    const cross = await post({
      action: "step", sessionId: b.id, writeToken: a.token, snapshot: snapshotBody("front"),
    });
    expect(cross.status).toBe(403);
    const viewB = (await get(b.id)).json;
    expect(viewB.stepsDone).toEqual([]);
  });

  it("kết quả API KHÔNG chứa trường độ đầy đặn / phán xét nào", async () => {
    const { id, token } = await newSession();
    for (const s of FACE_STEPS) {
      await post({ action: "step", sessionId: id, writeToken: token, snapshot: snapshotBody(s) });
    }
    await post({ action: "complete", sessionId: id, writeToken: token });
    const text = (await get(id)).text.toLowerCase();
    for (const bad of ["fullness", "destiny", "fortune", "personality", "luck", "goodbad", "tuong_tot", "tuong_xau"]) {
      expect(text, `không được có "${bad}"`).not.toContain(bad);
    }
  });
});
