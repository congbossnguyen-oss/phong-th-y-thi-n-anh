/**
 * PHASE 1C — test phiên Desktop↔Điện thoại và 6 cổng bước khuôn mặt.
 *
 * Toàn bộ là logic thuần: kho lưu dùng `MemorySessionStore`, không cần KV/browser.
 */
import { beforeEach, describe, expect, it } from "vitest";

import {
  MemorySessionStore,
  completeSession,
  connectSession,
  createSession,
  failSession,
  generateId,
  generateWriteToken,
  recordStep,
  recordVoice,
} from "../src/features/physiognomy/session/store";
import {
  FACE_STEPS,
  SESSION_TTL_MS,
  STATUS_FOR_STEP,
  buildResult,
  publicView,
  type FaceStep,
  type FaceTestSnapshot,
  type VoiceTestResult,
} from "../src/features/physiognomy/session/types";
import {
  COVERAGE_MAX,
  COVERAGE_MIN,
  FRONT_LIMITS,
  NEAR_MIN_COVERAGE,
  STEP_DEFS,
  TURN_MIN_DEG,
  YAW_SIGN_FOR_USER_LEFT,
  evaluateStep,
  nextStep,
  type StepInput,
} from "../src/features/physiognomy/session/steps";

// ═══════════════════════════════════════════════════════════════ tiện ích

function snap(step: FaceStep, over: Partial<FaceTestSnapshot> = {}): FaceTestSnapshot {
  return {
    step,
    timestamp: 1_700_000_000_000,
    quality: { faceDetected: true, confidence: 0.45, brightness: 0.5, blur: 0.01 },
    pose: { yaw: 1, pitch: -1, roll: 0.5 },
    geometry: {
      faceWidth: 300, faceHeight: 1.28, faceShapeRatio: 1.28,
      middleCourt: 0.426, upperCourt: 0.168, lowerCourt: 0.406,
    },
    ...over,
  };
}

const goodVoice: VoiceTestResult = {
  passed: true, durationMs: 10_500, mimeType: "audio/webm;codecs=opus",
  sampleRate: 48_000, hasAudio: true,
};

let store: MemorySessionStore;
beforeEach(() => {
  store = new MemorySessionStore();
});

/** Chạy hết luồng: tạo → kết nối → 6 bước → giọng nói → hoàn tất. */
async function runFullFlow() {
  const { record } = await createSession(store);
  const conn = await connectSession(store, record.sessionId);
  if (!conn.ok) throw new Error("connect thất bại");
  for (const s of FACE_STEPS) {
    const out = await recordStep(store, record.sessionId, conn.writeToken, snap(s));
    if (!out.ok) throw new Error(`step ${s} thất bại: ${out.message}`);
  }
  await recordVoice(store, record.sessionId, conn.writeToken, goodVoice);
  await completeSession(store, record.sessionId, conn.writeToken);
  return { id: record.sessionId, token: conn.writeToken };
}

// ═══════════════════════════════════════════════════════════════ SESSION

describe("session — tạo phiên", () => {
  it("tạo được, trạng thái đầu là waiting, chưa có writeToken", async () => {
    const { record } = await createSession(store);
    expect(record.status).toBe("waiting");
    expect(record.writeToken).toBeNull();
    expect(record.connectedAt).toBeNull();
    expect(record.snapshots).toEqual({});
    expect(record.voice).toBeNull();
  });

  it("hết hạn đúng SESSION_TTL_MS", async () => {
    const now = 1_700_000_000_000;
    const { record } = await createSession(store, now);
    expect(record.expiresAt).toBe(now + SESSION_TTL_MS);
  });

  it("session id KHÔNG chứa ký tự nhập nhằng (0 O 1 I L)", async () => {
    // Để khách đọc/gõ tay được nếu QR không quét nổi.
    for (let i = 0; i < 200; i++) {
      expect(generateId()).not.toMatch(/[01OIL]/);
    }
  });

  it("session id đủ ngẫu nhiên — 2000 lần không trùng", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 2000; i++) seen.add(generateId());
    expect(seen.size).toBe(2000);
  });

  it("writeToken dài hơn sessionId (nó là thứ chặn ghi đè)", () => {
    expect(generateWriteToken().length).toBeGreaterThan(generateId().length);
  });

  it("session id KHÔNG chứa thông tin cá nhân — chỉ chữ/số từ bộ ký tự cố định", () => {
    expect(generateId(40)).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{40}$/);
  });
});

describe("session — điện thoại kết nối", () => {
  it("kết nối lần đầu: waiting → connected, nhận writeToken", async () => {
    const { record } = await createSession(store);
    const out = await connectSession(store, record.sessionId);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.record.status).toBe("connected");
    expect(out.record.connectedAt).not.toBeNull();
    expect(out.writeToken.length).toBeGreaterThan(20);
  });

  it("PHIÊN DÙNG MỘT LẦN — máy thứ hai quét lại bị chặn", async () => {
    const { record } = await createSession(store);
    const first = await connectSession(store, record.sessionId);
    expect(first.ok).toBe(true);
    const second = await connectSession(store, record.sessionId);
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.code).toBe("already_connected");
  });

  it("id không tồn tại → not_found", async () => {
    const out = await connectSession(store, "KHONGCOTHAT");
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.code).toBe("not_found");
  });

  it("phiên đã hết hạn → không kết nối được", async () => {
    const now = 1_700_000_000_000;
    await createSession(store, now);
    const { record } = await createSession(store, now);
    const out = await connectSession(store, record.sessionId, now + SESSION_TTL_MS + 1);
    expect(out.ok).toBe(false);
  });

  it("phiên đã hoàn tất → không kết nối lại được", async () => {
    const { id } = await runFullFlow();
    const out = await connectSession(store, id);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.code).toBe("finished");
  });
});

describe("session — chuyển trạng thái", () => {
  it("mỗi bước khuôn mặt đặt đúng trạng thái tương ứng", async () => {
    const { record } = await createSession(store);
    const conn = await connectSession(store, record.sessionId);
    if (!conn.ok) throw new Error("connect");
    // 5 bước đầu: trạng thái = bước vừa xong
    for (const s of FACE_STEPS.slice(0, 5)) {
      const out = await recordStep(store, record.sessionId, conn.writeToken, snap(s));
      expect(out.ok).toBe(true);
      if (out.ok) expect(out.record.status).toBe(STATUS_FOR_STEP[s]);
    }
    // Bước thứ 6 xong hết -> tự chuyển sang chờ giọng nói
    const last = await recordStep(
      store, record.sessionId, conn.writeToken, snap(FACE_STEPS[5]),
    );
    expect(last.ok).toBe(true);
    if (last.ok) expect(last.record.status).toBe("voice");
  });

  it("ghi giọng nói → status voice; hoàn tất → status complete + completedAt", async () => {
    const { id } = await runFullFlow();
    const rec = await store.get(id);
    expect(rec?.status).toBe("complete");
    expect(rec?.completedAt).not.toBeNull();
    expect(rec?.voice?.passed).toBe(true);
  });

  it("phiên đã complete thì KHÔNG ghi thêm được", async () => {
    const { id, token } = await runFullFlow();
    const out = await recordStep(store, id, token, snap("front"));
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.code).toBe("finished");
  });

  it("failSession ghi lý do và đóng phiên", async () => {
    const { record } = await createSession(store);
    const conn = await connectSession(store, record.sessionId);
    if (!conn.ok) throw new Error("connect");
    const out = await failSession(store, record.sessionId, conn.writeToken, "Từ chối quyền camera");
    expect(out.ok).toBe(true);
    const rec = await store.get(record.sessionId);
    expect(rec?.status).toBe("failed");
    expect(rec?.failureReason).toBe("Từ chối quyền camera");
  });

  it("lý do lỗi bị cắt 300 ký tự (không để nhét dữ liệu lớn vào phiên)", async () => {
    const { record } = await createSession(store);
    const conn = await connectSession(store, record.sessionId);
    if (!conn.ok) throw new Error("connect");
    await failSession(store, record.sessionId, conn.writeToken, "x".repeat(5000));
    const rec = await store.get(record.sessionId);
    expect(rec?.failureReason).toHaveLength(300);
  });
});

describe("session — bảo mật ghi", () => {
  it("ghi mà KHÔNG có token đúng → bad_token", async () => {
    const { record } = await createSession(store);
    await connectSession(store, record.sessionId);
    const out = await recordStep(store, record.sessionId, "TOKEN-SAI", snap("front"));
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.code).toBe("bad_token");
  });

  it("phiên CHƯA kết nối thì mọi token đều bị từ chối", async () => {
    const { record } = await createSession(store);
    const out = await recordStep(store, record.sessionId, generateWriteToken(), snap("front"));
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.code).toBe("bad_token");
  });

  it("CÁCH LY PHIÊN — token của phiên A không ghi được vào phiên B", async () => {
    const a = await createSession(store);
    const b = await createSession(store);
    const ca = await connectSession(store, a.record.sessionId);
    const cb = await connectSession(store, b.record.sessionId);
    if (!ca.ok || !cb.ok) throw new Error("connect");
    expect(ca.writeToken).not.toBe(cb.writeToken);

    const cross = await recordStep(store, b.record.sessionId, ca.writeToken, snap("front"));
    expect(cross.ok).toBe(false);
    if (!cross.ok) expect(cross.code).toBe("bad_token");

    // và tiến độ của A không bị B làm bẩn
    await recordStep(store, a.record.sessionId, ca.writeToken, snap("front"));
    const recB = await store.get(b.record.sessionId);
    expect(recB?.snapshots.front).toBeUndefined();
  });

  it("publicView KHÔNG lộ writeToken", async () => {
    const { record } = await createSession(store);
    const conn = await connectSession(store, record.sessionId);
    if (!conn.ok) throw new Error("connect");
    const rec = await store.get(record.sessionId);
    const view = publicView(rec!);
    expect(JSON.stringify(view)).not.toContain(conn.writeToken);
    expect(view).not.toHaveProperty("writeToken");
  });

  it("bước lạ bị từ chối", async () => {
    const { record } = await createSession(store);
    const conn = await connectSession(store, record.sessionId);
    if (!conn.ok) throw new Error("connect");
    const bad = snap("front");
    (bad as { step: string }).step = "forehead_fullness";
    const out = await recordStep(store, record.sessionId, conn.writeToken, bad);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.code).toBe("bad_step");
  });
});

describe("session — hết hạn", () => {
  it("đọc sau khi hết hạn trả null (kho tự dọn)", async () => {
    // Dùng Date.now() THẬT, không truyền mốc quá khứ: kho kiểm hết hạn theo
    // Date.now(), nên một phiên "tạo lúc 2023" sẽ chết ngay khi vừa tạo — đó là
    // đúng hành vi, nhưng không phải điều test này muốn kiểm.
    const { record } = await createSession(store);
    expect(await store.get(record.sessionId)).not.toBeNull();
    const rec = await store.get(record.sessionId);
    await store.put({ ...rec!, expiresAt: Date.now() - 1 });
    expect(await store.get(record.sessionId)).toBeNull();
  });

  it("ghi vào phiên đã hết hạn → expired/not_found, không âm thầm tạo lại", async () => {
    const { record } = await createSession(store);
    const conn = await connectSession(store, record.sessionId);
    if (!conn.ok) throw new Error("connect");
    const rec = await store.get(record.sessionId);
    await store.put({ ...rec!, expiresAt: Date.now() - 1 });
    const out = await recordStep(store, record.sessionId, conn.writeToken, snap("front"));
    expect(out.ok).toBe(false);
    if (!out.ok) expect(["expired", "not_found"]).toContain(out.code);
  });
});

describe("session — kết quả", () => {
  it("đủ 6 bước + giọng nói → overall 'pass'", async () => {
    const { id } = await runFullFlow();
    const rec = await store.get(id);
    const r = buildResult(rec!);
    expect(r.quality.faceTestsPassed).toBe(6);
    expect(r.quality.voicePassed).toBe(true);
    expect(r.quality.overall).toBe("pass");
    expect(r.status).toBe("complete");
  });

  it("thiếu bước → 'partial'", async () => {
    const { record } = await createSession(store);
    const conn = await connectSession(store, record.sessionId);
    if (!conn.ok) throw new Error("connect");
    await recordStep(store, record.sessionId, conn.writeToken, snap("front"));
    await recordVoice(store, record.sessionId, conn.writeToken, goodVoice);
    const rec = await store.get(record.sessionId);
    expect(buildResult(rec!).quality.overall).toBe("partial");
  });

  it("không bước nào → 'fail'", async () => {
    const { record } = await createSession(store);
    const rec = await store.get(record.sessionId);
    expect(buildResult(rec!).quality.overall).toBe("fail");
  });

  it("đủ 6 bước nhưng giọng nói KHÔNG đạt → 'partial'", async () => {
    const { record } = await createSession(store);
    const conn = await connectSession(store, record.sessionId);
    if (!conn.ok) throw new Error("connect");
    for (const s of FACE_STEPS) {
      await recordStep(store, record.sessionId, conn.writeToken, snap(s));
    }
    await recordVoice(store, record.sessionId, conn.writeToken, { ...goodVoice, passed: false });
    const rec = await store.get(record.sessionId);
    expect(buildResult(rec!).quality.overall).toBe("partial");
  });

  it("result map đúng snake→camel cho pitch_down/pitch_up", async () => {
    const { id } = await runFullFlow();
    const r = buildResult((await store.get(id))!);
    expect(r.face.pitchDown?.step).toBe("pitch_down");
    expect(r.face.pitchUp?.step).toBe("pitch_up");
  });

  it("kết quả KHÔNG chứa trường độ đầy đặn / phán xét nào", async () => {
    const { id } = await runFullFlow();
    const s = JSON.stringify(buildResult((await store.get(id))!)).toLowerCase();
    for (const bad of ["fullness", "destiny", "fortune", "personality", "luck", "goodbad"]) {
      expect(s, `không được có "${bad}"`).not.toContain(bad);
    }
  });

  it("publicView chỉ trả result khi đã complete", async () => {
    const { record } = await createSession(store);
    expect(publicView((await store.get(record.sessionId))!).result).toBeNull();
    const { id } = await runFullFlow();
    expect(publicView((await store.get(id))!).result).not.toBeNull();
  });

  it("stepsDone theo đúng thứ tự FACE_STEPS, không theo thứ tự gửi lên", async () => {
    const { record } = await createSession(store);
    const conn = await connectSession(store, record.sessionId);
    if (!conn.ok) throw new Error("connect");
    // gửi ngược thứ tự
    for (const s of [...FACE_STEPS].reverse()) {
      await recordStep(store, record.sessionId, conn.writeToken, snap(s));
    }
    expect(publicView((await store.get(record.sessionId))!).stepsDone).toEqual([...FACE_STEPS]);
  });
});

// ═══════════════════════════════════════════════════════════ CỔNG 6 BƯỚC

const base: StepInput = {
  faceCount: 1, yaw: 0, pitch: 0, roll: 0,
  coverage: 0.45, blur: 0.01, brightness: 0.5,
};

describe("bước khuôn mặt — điều kiện chung", () => {
  it("không có mặt → chặn mọi bước", () => {
    for (const s of FACE_STEPS) {
      const v = evaluateStep(s, { ...base, faceCount: 0 });
      expect(v.passed, s).toBe(false);
      expect(v.reasons[0]).toMatch(/Chưa thấy khuôn mặt/);
    }
  });

  it("nhiều mặt → chặn mọi bước", () => {
    for (const s of FACE_STEPS) {
      const v = evaluateStep(s, { ...base, faceCount: 2 });
      expect(v.passed, s).toBe(false);
      expect(v.reasons[0]).toBe("Chỉ để một người trong khung.");
    }
  });

  it("ảnh mờ → chặn", () => {
    expect(evaluateStep("front", { ...base, blur: 0.0001 }).passed).toBe(false);
  });

  it("quá tối / cháy sáng → chặn", () => {
    expect(evaluateStep("front", { ...base, brightness: 0.05 }).passed).toBe(false);
    expect(evaluateStep("front", { ...base, brightness: 0.99 }).passed).toBe(false);
  });
});

describe("bước front — chính diện", () => {
  it("chính diện, đủ sáng, đúng khoảng cách → ĐẠT", () => {
    const v = evaluateStep("front", base);
    expect(v.passed).toBe(true);
    expect(v.reasons).toEqual([]);
    expect(v.progress).toBe(1);
  });

  it("vượt ngưỡng yaw/pitch → 'Vui lòng nhìn thẳng.'", () => {
    const v = evaluateStep("front", { ...base, yaw: FRONT_LIMITS.yaw + 1 });
    expect(v.passed).toBe(false);
    expect(v.reasons).toContain("Vui lòng nhìn thẳng.");
  });

  it("nghiêng đầu quá ngưỡng roll → nhắc riêng về nghiêng", () => {
    const v = evaluateStep("front", { ...base, roll: FRONT_LIMITS.roll + 1 });
    expect(v.passed).toBe(false);
    expect(v.reasons.join(" ")).toMatch(/đừng nghiêng/);
  });

  it("mặt quá nhỏ / quá sát → nhắc đúng chiều", () => {
    expect(evaluateStep("front", { ...base, coverage: COVERAGE_MIN - 0.01 }).reasons)
      .toContain("Đưa điện thoại gần hơn.");
    expect(evaluateStep("front", { ...base, coverage: COVERAGE_MAX + 0.01 }).reasons)
      .toContain("Lùi điện thoại ra một chút.");
  });

  it("thiếu pose (không có ma trận) → KHÔNG đạt, không đoán bừa", () => {
    const v = evaluateStep("front", { ...base, yaw: null, pitch: null, roll: null });
    expect(v.passed).toBe(false);
  });
});

describe("bước left / right — quay ngang", () => {
  const leftYaw = TURN_MIN_DEG * YAW_SIGN_FOR_USER_LEFT;
  const rightYaw = -leftYaw;

  it("quay trái đủ góc → ĐẠT", () => {
    expect(evaluateStep("left", { ...base, yaw: leftYaw }).passed).toBe(true);
  });

  it("quay phải đủ góc → ĐẠT", () => {
    expect(evaluateStep("right", { ...base, yaw: rightYaw }).passed).toBe(true);
  });

  it("quay SAI CHIỀU thì không đạt (left không nhận yaw của right)", () => {
    expect(evaluateStep("left", { ...base, yaw: rightYaw }).passed).toBe(false);
    expect(evaluateStep("right", { ...base, yaw: leftYaw }).passed).toBe(false);
  });

  it("chưa quay đủ → nhắc 'Quay thêm một chút nữa'", () => {
    const v = evaluateStep("left", { ...base, yaw: leftYaw * 0.5 });
    expect(v.passed).toBe(false);
    expect(v.reasons).toContain(STEP_DEFS.left.hint);
    expect(v.progress).toBeCloseTo(0.5, 2);
  });

  it("progress đi từ 0 → 1 theo góc quay", () => {
    expect(evaluateStep("left", { ...base, yaw: 0 }).progress).toBe(0);
    expect(evaluateStep("left", { ...base, yaw: leftYaw }).progress).toBe(1);
  });

  it("quay quá nhiều vẫn ĐẠT, cảnh báo nằm ở `warnings` chứ không chặn", () => {
    const v = evaluateStep("left", { ...base, yaw: leftYaw * 3 });
    expect(v.passed, "cảnh báo không được chặn bước").toBe(true);
    expect(v.reasons).toEqual([]);
    expect(v.warnings.join(" ")).toMatch(/quay khá nhiều/);
  });

  it("đạt bình thường thì warnings rỗng", () => {
    expect(evaluateStep("left", { ...base, yaw: leftYaw }).warnings).toEqual([]);
  });

  it("hằng số dấu yaw có giá trị hợp lệ (1 hoặc -1) — chỉ một chỗ để sửa", () => {
    expect([1, -1]).toContain(YAW_SIGN_FOR_USER_LEFT);
  });
});

describe("bước near — sát mặt", () => {
  it("đủ gần → ĐẠT", () => {
    expect(evaluateStep("near", { ...base, coverage: NEAR_MIN_COVERAGE }).passed).toBe(true);
  });

  it("chưa đủ gần → nhắc, progress tỉ lệ", () => {
    const v = evaluateStep("near", { ...base, coverage: NEAR_MIN_COVERAGE / 2 });
    expect(v.passed).toBe(false);
    expect(v.progress).toBeCloseTo(0.5, 1);
  });

  it("ngưỡng near CAO HƠN ngưỡng coverage thường (đúng nghĩa 'sát mặt')", () => {
    expect(NEAR_MIN_COVERAGE).toBeGreaterThan(COVERAGE_MIN);
  });

  it("KHÔNG dùng pose để xét — chỉ kích thước mặt tương đối", () => {
    // Quay mặt nhưng đủ gần thì vẫn ĐẠT: bước này đo khoảng cách, không đo tư thế.
    const v = evaluateStep("near", { ...base, coverage: 0.7, yaw: 30, pitch: 20 });
    expect(v.passed).toBe(true);
  });

  it("thiếu coverage → không đạt", () => {
    expect(evaluateStep("near", { ...base, coverage: null }).passed).toBe(false);
  });
});

describe("bước pitch_down / pitch_up", () => {
  // Quy ước đã kiểm chứng ở Phase 1B-2 trên ảnh thật: +pitch = chúc xuống.
  it("cúi đủ (pitch dương) → ĐẠT", () => {
    expect(evaluateStep("pitch_down", { ...base, pitch: TURN_MIN_DEG }).passed).toBe(true);
  });

  it("ngẩng đủ (pitch âm) → ĐẠT", () => {
    expect(evaluateStep("pitch_up", { ...base, pitch: -TURN_MIN_DEG }).passed).toBe(true);
  });

  it("cúi mà lại ngẩng thì không đạt, và ngược lại", () => {
    expect(evaluateStep("pitch_down", { ...base, pitch: -TURN_MIN_DEG }).passed).toBe(false);
    expect(evaluateStep("pitch_up", { ...base, pitch: TURN_MIN_DEG }).passed).toBe(false);
  });

  it("chưa đủ → nhắc đúng câu của từng bước", () => {
    expect(evaluateStep("pitch_down", { ...base, pitch: 5 }).reasons)
      .toContain(STEP_DEFS.pitch_down.hint);
    expect(evaluateStep("pitch_up", { ...base, pitch: -5 }).reasons)
      .toContain(STEP_DEFS.pitch_up.hint);
  });
});

describe("thứ tự bước", () => {
  it("đúng 6 bước, đúng thứ tự", () => {
    expect([...FACE_STEPS]).toEqual(["front", "left", "right", "near", "pitch_down", "pitch_up"]);
  });

  it("nextStep đi tuần tự rồi null ở bước cuối", () => {
    expect(nextStep("front")).toBe("left");
    expect(nextStep("near")).toBe("pitch_down");
    expect(nextStep("pitch_up")).toBeNull();
  });

  it("mỗi bước có nhãn + hướng dẫn + câu nhắc tiếng Việt", () => {
    for (const s of FACE_STEPS) {
      expect(STEP_DEFS[s].label, s).toBeTruthy();
      expect(STEP_DEFS[s].instruction, s).toBeTruthy();
      expect(STEP_DEFS[s].hint, s).toBeTruthy();
    }
  });

  it("mỗi bước có trạng thái phiên riêng, không trùng nhau", () => {
    const vals = FACE_STEPS.map((s) => STATUS_FOR_STEP[s]);
    expect(new Set(vals).size).toBe(FACE_STEPS.length);
  });
});

// ═══════════════════════════════════════════════════════ TÍCH HỢP đầu-cuối

describe("tích hợp — Desktop → QR → Mobile → 6 bước → giọng nói → Desktop nhận kết quả", () => {
  it("chạy trọn luồng và máy tính thấy đúng tiến độ ở từng chặng", async () => {
    // 1) Máy tính tạo phiên
    const { record } = await createSession(store);
    let view = publicView((await store.get(record.sessionId))!);
    expect(view.status).toBe("waiting");
    expect(view.stepsDone).toEqual([]);
    expect(view.result).toBeNull();

    // 2) Điện thoại quét QR và kết nối
    const conn = await connectSession(store, record.sessionId);
    if (!conn.ok) throw new Error("connect");
    view = publicView((await store.get(record.sessionId))!);
    expect(view.status).toBe("connected");

    // 3) Sáu bước khuôn mặt — máy tính thấy danh sách tick dài dần
    for (let i = 0; i < FACE_STEPS.length; i++) {
      const s = FACE_STEPS[i];
      const v = evaluateStep(s, stepInputFor(s));
      expect(v.passed, `cổng bước ${s} phải đạt với input hợp lệ`).toBe(true);
      await recordStep(store, record.sessionId, conn.writeToken, snap(s));
      view = publicView((await store.get(record.sessionId))!);
      expect(view.stepsDone).toHaveLength(i + 1);
    }
    expect(view.status).toBe("voice");

    // 4) Giọng nói
    await recordVoice(store, record.sessionId, conn.writeToken, goodVoice);
    view = publicView((await store.get(record.sessionId))!);
    expect(view.voice?.passed).toBe(true);

    // 5) Hoàn tất → máy tính nhận kết quả đầy đủ
    await completeSession(store, record.sessionId, conn.writeToken);
    view = publicView((await store.get(record.sessionId))!);
    expect(view.status).toBe("complete");
    expect(view.result).not.toBeNull();
    expect(view.result!.quality.overall).toBe("pass");
    expect(view.result!.quality.faceTestsPassed).toBe(6);
    // và không lộ token ở bất kỳ chặng nào
    expect(JSON.stringify(view)).not.toContain(conn.writeToken);
  });

  it("hai phiên chạy song song không lẫn dữ liệu", async () => {
    const a = await createSession(store);
    const b = await createSession(store);
    const ca = await connectSession(store, a.record.sessionId);
    const cb = await connectSession(store, b.record.sessionId);
    if (!ca.ok || !cb.ok) throw new Error("connect");

    await recordStep(store, a.record.sessionId, ca.writeToken, snap("front"));
    await recordStep(store, a.record.sessionId, ca.writeToken, snap("left"));
    await recordStep(store, b.record.sessionId, cb.writeToken, snap("front"));

    expect(publicView((await store.get(a.record.sessionId))!).stepsDone).toEqual(["front", "left"]);
    expect(publicView((await store.get(b.record.sessionId))!).stepsDone).toEqual(["front"]);
  });
});

/** Input hợp lệ cho từng bước, dùng ở test tích hợp. */
function stepInputFor(s: FaceStep): StepInput {
  switch (s) {
    case "front": return base;
    case "left": return { ...base, yaw: TURN_MIN_DEG * YAW_SIGN_FOR_USER_LEFT };
    case "right": return { ...base, yaw: -TURN_MIN_DEG * YAW_SIGN_FOR_USER_LEFT };
    case "near": return { ...base, coverage: NEAR_MIN_COVERAGE + 0.02 };
    case "pitch_down": return { ...base, pitch: TURN_MIN_DEG + 2 };
    case "pitch_up": return { ...base, pitch: -(TURN_MIN_DEG + 2) };
  }
}
