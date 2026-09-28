/**
 * PHASE 1B (web) — test cho những gì kiểm chứng được BẰNG CODE, không cần thiết bị.
 *
 * Năm nhóm theo yêu cầu: Geometry · Pose · Camera · Voice · JSON.
 * Camera/Voice test bằng cách cài giả (stub) `navigator.mediaDevices` và
 * `MediaRecorder` — kiểm được vòng đời và dọn dẹp mà không cần camera thật.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  MAX_FACE_COVERAGE,
  MIN_FACE_COVERAGE,
  decomposePose,
  evaluatePose,
  evaluateQuality,
  qualityToErrorState,
} from "../src/features/physiognomy/capture/quality";
import {
  MESSAGES,
  RECOVERABLE_ERRORS,
  canTransition,
  needsCamera,
  type ScanState,
} from "../src/features/physiognomy/capture/state-machine";
import {
  IDX,
  PALACE_INDICES,
  PALACE_REGIONS,
  measureFiveOrgans,
  measureGeometry,
  measureStructural,
  measureThreeCourts,
} from "../src/features/physiognomy/geometry/index";
import {
  MIME_CANDIDATES,
  pickSupportedMimeType,
} from "../src/features/physiognomy/voice/recorder";
import { extractVoiceFeatures } from "../src/features/physiognomy/voice/features";
import { assembleScanResult } from "../src/features/physiognomy/index";
import {
  POSE_LIMITS,
  type CaptureQuality,
  type LandmarkPoint,
  type TwelvePalaceName,
} from "../src/features/physiognomy/types/index";

// ══════════════════════════════════════════════════════ tiện ích dựng khuôn mặt giả

const W = 640;
const H = 480;

/**
 * Dựng 468 landmark hợp lý rồi cho phép QUAY quanh tâm mặt.
 *
 * ★ QUAN TRỌNG — phép quay được thực hiện trong KHÔNG GIAN PIXEL, không phải trong
 * không gian toạ độ chuẩn hoá [0,1].
 *
 * Lý do: MediaPipe chuẩn hoá `x` theo BỀ NGANG ảnh và `y` theo CHIỀU CAO ảnh. Khi
 * W ≠ H (ở đây 640×480) thì không gian chuẩn hoá bị KÉO DÃN theo trục — quay trong
 * không gian đó rồi nhân lại với (W, H) KHÔNG cho ra một phép quay thật trong mặt
 * phẳng ảnh, và mọi khoảng cách sẽ đổi.
 *
 * Bản đầu của test này quay trong không gian chuẩn hoá và làm faceShapeRatio "trượt"
 * 7% ở roll 20° — trông như lỗi code, thật ra là lỗi của chính bộ sinh dữ liệu test.
 * Pixel ảnh là vuông, nên quay trong pixel space mới là mô hình đúng của việc nghiêng
 * điện thoại/nghiêng đầu.
 */
function makeFace(opts: { roll?: number; yaw?: number; pitch?: number; scale?: number } = {}) {
  const { roll = 0, yaw = 0, pitch = 0, scale = 1 } = opts;
  /** Toạ độ theo PIXEL, gốc ở tâm khuôn mặt. Bề ngang mặt ~282 px. */
  const base: Record<number, [number, number, number]> = {
    [IDX.foreheadTop]: [0, -163, 0],
    [IDX.chin]: [0, 173, 5],
    [IDX.cheekLeft]: [-141, 0, -32],
    [IDX.cheekRight]: [141, 0, -32],
    [IDX.browLeft]: [-51, -82, 6],
    [IDX.browRight]: [51, -82, 6],
    [IDX.subnasale]: [0, 58, 32],
    [IDX.noseTip]: [0, 38, 38],
    [IDX.nasion]: [0, -58, 19],
    [IDX.eyeLeftInner]: [-32, -38, 6],
    [IDX.eyeRightInner]: [32, -38, 6],
    [IDX.eyeLeftOuter]: [-83, -38, 0],
    [IDX.eyeRightOuter]: [83, -38, 0],
    [IDX.mouthLeft]: [-45, 96, 13],
    [IDX.mouthRight]: [45, 96, 13],
    [IDX.alaLeft]: [-26, 48, 26],
    [IDX.alaRight]: [26, 48, 26],
    [IDX.jawLeft]: [-109, 115, -13],
    [IDX.jawRight]: [109, 115, -13],
    [IDX.foreheadLeft]: [-102, -134, -6],
    [IDX.foreheadRight]: [102, -134, -6],
  };
  const r = (d: number) => (d * Math.PI) / 180;
  const [cz, sz] = [Math.cos(r(roll)), Math.sin(r(roll))];
  const [cy, sy] = [Math.cos(r(yaw)), Math.sin(r(yaw))];
  const [cx, sx] = [Math.cos(r(pitch)), Math.sin(r(pitch))];

  const lm: LandmarkPoint[] = Array.from({ length: 468 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  for (const [k, v] of Object.entries(base)) {
    let [x, y, z] = v;
    // yaw (quanh Y) → pitch (quanh X) → roll (quanh Z)
    [x, z] = [x * cy + z * sy, -x * sy + z * cy];
    [y, z] = [y * cx - z * sx, y * sx + z * cx];
    [x, y] = [x * cz - y * sz, x * sz + y * cz];
    // Trả về đúng quy ước MediaPipe: x chuẩn hoá theo W, y theo H, z theo W.
    lm[Number(k)] = {
      x: 0.5 + (x * scale) / W,
      y: 0.5 + (y * scale) / H,
      z: (z * scale) / W,
    };
  }
  return lm;
}

// ══════════════════════════════════════════════════════════════════ 1. GEOMETRY

describe("geometry — khoảng cách phải là euclidean, không phải hiệu toạ độ", () => {
  it("faceHeight/faceWidth bất biến với roll (vì dùng khoảng cách điểm-điểm)", () => {
    const a = measureGeometry(makeFace(), W, H);
    const b = measureGeometry(makeFace({ roll: 20 }), W, H);
    // Cùng một khuôn mặt, chỉ nghiêng đầu -> tỉ lệ phải giữ nguyên.
    expect(b.faceHeight.value!).toBeCloseTo(a.faceHeight.value!, 3);
    expect(b.faceShapeRatio.value!).toBeCloseTo(a.faceShapeRatio.value!, 3);
  });

  it("eyeDistance/mouthWidth/noseWidth bất biến với roll", () => {
    const a = measureGeometry(makeFace(), W, H);
    const b = measureGeometry(makeFace({ roll: 25 }), W, H);
    for (const k of ["eyeDistance", "mouthWidth", "noseWidth"] as const) {
      expect(b[k].value!, `${k} phải bất biến với roll`).toBeCloseTo(a[k].value!, 3);
    }
  });

  it("khoảng cách mày–mắt (ngũ quan) cũng bất biến với roll", () => {
    // Đây là field từng dùng hiệu toạ độ y — nếu ai đổi lại, test này đổ.
    const g = measureGeometry(makeFace(), W, H);
    const a = measureFiveOrgans(
      makeFace(), W, H, g.referencePx.faceWidthPx, g.referencePx.faceHeightPx,
    );
    const g2 = measureGeometry(makeFace({ roll: 20 }), W, H);
    const b = measureFiveOrgans(
      makeFace({ roll: 20 }), W, H, g2.referencePx.faceWidthPx, g2.referencePx.faceHeightPx,
    );
    expect(b.eyebrow.value!).toBeCloseTo(a.eyebrow.value!, 2);
  });

  it("tỉ lệ bất biến với khoảng cách chụp (scale ảnh) — không có ngưỡng pixel", () => {
    const a = measureGeometry(makeFace({ scale: 1 }), W, H);
    const b = measureGeometry(makeFace({ scale: 1.6 }), W, H);
    // faceWidth (px) phải TĂNG; mọi tỉ lệ phải giữ nguyên.
    expect(b.faceWidth.value!).toBeGreaterThan(a.faceWidth.value! * 1.5);
    expect(b.eyeDistance.value!).toBeCloseTo(a.eyeDistance.value!, 4);
    expect(b.faceShapeRatio.value!).toBeCloseTo(a.faceShapeRatio.value!, 4);
  });

  it("ba đình head-axis bất biến với roll VÀ với pitch (ground truth tổng hợp)", () => {
    const base = measureThreeCourts(makeFace(), W, H);
    for (const opts of [{ roll: 20 }, { pitch: 18 }, { pitch: -25 }, { yaw: 25 }]) {
      const t = measureThreeCourts(makeFace(opts), W, H);
      expect(t.middle.value!, `trung đình với ${JSON.stringify(opts)}`)
        .toBeCloseTo(base.middle.value!, 2);
    }
  });

  it("ba đình dùng phương pháp headAxis3d, không dùng imageY", () => {
    expect(measureThreeCourts(makeFace(), W, H).method).toBe("headAxis3d");
  });

  it("chỉ trung đình là measured; thượng/hạ đình là estimated kèm note", () => {
    const t = measureThreeCourts(makeFace(), W, H);
    expect(t.middle.status).toBe("measured");
    expect(t.upper.status).toBe("estimated");
    expect(t.lower.status).toBe("estimated");
    expect(t.upper.note).toMatch(/chân tóc/);
  });

  it("landmark suy biến → trả unknown, không trả số bịa", () => {
    const flat: LandmarkPoint[] = Array.from({ length: 468 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
    const t = measureThreeCourts(flat, W, H);
    expect(t.status).toBe("unknown");
    expect(t.middle.value).toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════════════ 2. POSE

describe("pose gate — số đo thô tách khỏi phán quyết", () => {
  it("ngưỡng đúng 8/8/5", () => {
    expect(POSE_LIMITS).toEqual({ yaw: 8, pitch: 8, roll: 5 });
  });

  it("trong ngưỡng → pass, exceeded rỗng", () => {
    const p = evaluatePose({ yaw: 7.9, pitch: -7.9, roll: 4.9 });
    expect(p.status).toBe("pass");
    expect(p.exceeded).toEqual([]);
    // Số đo thô PHẢI được giữ nguyên, không bị làm tròn/ép về 0.
    expect(p.yaw).toBe(7.9);
    expect(p.pitch).toBe(-7.9);
  });

  it("yaw vượt → fail và nêu đúng trục", () => {
    const p = evaluatePose({ yaw: 8.1, pitch: 0, roll: 0 });
    expect(p.status).toBe("fail");
    expect(p.exceeded).toEqual(["yaw"]);
  });

  it("pitch vượt → fail", () => {
    expect(evaluatePose({ yaw: 0, pitch: -8.1, roll: 0 }).exceeded).toEqual(["pitch"]);
  });

  it("roll vượt → fail (ngưỡng 5 chặt hơn 8)", () => {
    expect(evaluatePose({ yaw: 0, pitch: 0, roll: 5.1 }).exceeded).toEqual(["roll"]);
    expect(evaluatePose({ yaw: 0, pitch: 0, roll: 4.9 }).status).toBe("pass");
  });

  it("nhiều trục vượt → liệt kê đủ", () => {
    expect(evaluatePose({ yaw: 30, pitch: -20, roll: 10 }).exceeded)
      .toEqual(["yaw", "pitch", "roll"]);
  });

  it("thiếu ma trận pose → status unknown, KHÔNG đoán bừa thành pass", () => {
    const p = evaluatePose({ yaw: null, pitch: null, roll: null });
    expect(p.status).toBe("unknown");
    expect(p.exceeded).toEqual([]);
  });

  it("pose KHÔNG mang ý nghĩa nhân tướng — chỉ có 3 trạng thái kỹ thuật", () => {
    const all = new Set(
      [
        evaluatePose({ yaw: 0, pitch: 0, roll: 0 }).status,
        evaluatePose({ yaw: 90, pitch: 0, roll: 0 }).status,
        evaluatePose({ yaw: null, pitch: null, roll: null }).status,
      ],
    );
    expect([...all].sort()).toEqual(["fail", "pass", "unknown"]);
  });

  it("decomposePose đọc column-major (quy ước của MediaPipe JS)", () => {
    const colMajor = (rows: number[][]) => {
      const o: number[] = [];
      for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o.push(rows[r][c]);
      return o;
    };
    const a = (30 * Math.PI) / 180;
    const m = colMajor([
      [Math.cos(a), 0, Math.sin(a), 0], [0, 1, 0, 0],
      [-Math.sin(a), 0, Math.cos(a), 0], [0, 0, 0, 1],
    ]);
    expect(decomposePose(m).yaw).toBeCloseTo(30, 1);
  });
});

describe("cổng chất lượng — thông điệp UX", () => {
  const good = {
    faceCount: 1, yaw: 1, pitch: -1, roll: 0.5,
    faceCoverage: 0.45, blurScore: 0.01, lightingScore: 0.5,
  };

  it("mặt quá nhỏ → 'Đưa điện thoại gần hơn.'", () => {
    const q = evaluateQuality({ ...good, faceCoverage: MIN_FACE_COVERAGE - 0.01 });
    expect(qualityToErrorState(q)).toBe("face_too_small");
    expect(q.reasons[0]).toBe("Đưa điện thoại gần hơn.");
  });

  it("mặt quá lớn → CHẶN với 'Lùi điện thoại ra một chút.'", () => {
    // Phase 1 để warn; Phase 1B đổi thành fail vì Phase 1B-2 đo được 16% méo
    // phối cảnh còn sót ở cự ly gần.
    const q = evaluateQuality({ ...good, faceCoverage: MAX_FACE_COVERAGE + 0.01 });
    expect(q.captureQuality).toBe("fail");
    expect(qualityToErrorState(q)).toBe("face_too_large");
    expect(q.reasons[0]).toBe("Lùi điện thoại ra một chút.");
  });

  it("nhiều mặt → 'Chỉ để một người trong khung.'", () => {
    const q = evaluateQuality({ ...good, faceCount: 3 });
    expect(qualityToErrorState(q)).toBe("multiple_faces");
    expect(MESSAGES.multiple_faces).toBe("Chỉ để một người trong khung.");
  });

  it("pose sai → câu nhắc bắt đầu bằng 'Vui lòng'", () => {
    const q = evaluateQuality({ ...good, yaw: 20 });
    expect(qualityToErrorState(q)).toBe("pose_invalid");
    expect(q.reasons[0]).toMatch(/^Vui lòng/);
  });

  it("chỉ nhắc MỘT lý do pose, không đổ cả 3 câu lên khách", () => {
    const q = evaluateQuality({ ...good, yaw: 30, pitch: -20, roll: 10 });
    const poseReasons = q.reasons.filter((r) => r.startsWith("Vui lòng"));
    expect(poseReasons).toHaveLength(1);
  });

  it("face_too_large là lỗi CHỮA ĐƯỢC — camera vẫn mở", () => {
    expect(RECOVERABLE_ERRORS.has("face_too_large" as ScanState)).toBe(true);
    expect(needsCamera("face_too_large" as ScanState)).toBe(true);
    expect(canTransition("face_too_large" as ScanState, "guiding_user")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════ 3. CAMERA

/** Stub MediaStreamTrack tối thiểu, theo dõi được đã stop hay chưa. */
class FakeTrack {
  readyState: "live" | "ended" = "live";
  stopCount = 0;
  stop() {
    this.stopCount++;
    this.readyState = "ended";
  }
}
class FakeStream {
  tracks: FakeTrack[];
  constructor(n = 1) {
    this.tracks = Array.from({ length: n }, () => new FakeTrack());
  }
  getTracks() {
    return this.tracks as unknown as MediaStreamTrack[];
  }
  getAudioTracks() {
    return this.tracks as unknown as MediaStreamTrack[];
  }
}

function fakeVideo(): HTMLVideoElement {
  const attrs: Record<string, string> = {};
  return {
    videoWidth: 640,
    videoHeight: 480,
    srcObject: null as unknown,
    playsInline: false,
    muted: false,
    autoplay: false,
    setAttribute: (k: string, v: string) => { attrs[k] = v; },
    getAttribute: (k: string) => attrs[k] ?? null,
    play: () => Promise.resolve(),
    pause: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  } as unknown as HTMLVideoElement;
}

describe("camera lifecycle", () => {
  const origNav = globalThis.navigator;
  const origWin = globalThis.window;

  afterEach(() => {
    vi.unstubAllGlobals();
    if (origNav) Object.defineProperty(globalThis, "navigator", { value: origNav, configurable: true });
    if (origWin) Object.defineProperty(globalThis, "window", { value: origWin, configurable: true });
  });

  function stubEnv(getUserMedia: () => Promise<unknown>) {
    vi.stubGlobal("window", { isSecureContext: true });
    vi.stubGlobal("navigator", { mediaDevices: { getUserMedia } });
    vi.stubGlobal("WebAssembly", { validate: () => true });
  }

  it("permission denied → CameraError kind 'denied', không rò stream", async () => {
    const { openCamera } = await import("../src/features/physiognomy/camera/index");
    stubEnv(() => Promise.reject(Object.assign(new Error("no"), { name: "NotAllowedError" })));
    await expect(openCamera(fakeVideo())).rejects.toMatchObject({ kind: "denied" });
  });

  it("không có camera → kind 'not_found'", async () => {
    const { openCamera } = await import("../src/features/physiognomy/camera/index");
    stubEnv(() => Promise.reject(Object.assign(new Error("x"), { name: "NotFoundError" })));
    await expect(openCamera(fakeVideo())).rejects.toMatchObject({ kind: "not_found" });
  });

  it("camera bị app khác chiếm → kind 'other' với lý do rõ", async () => {
    const { openCamera } = await import("../src/features/physiognomy/camera/index");
    stubEnv(() => Promise.reject(Object.assign(new Error("x"), { name: "NotReadableError" })));
    await expect(openCamera(fakeVideo())).rejects.toMatchObject({
      kind: "other",
      message: expect.stringContaining("chiếm dụng"),
    });
  });

  it("không phải secure context → kind 'unsupported' (chặn TRƯỚC khi xin quyền)", async () => {
    const { openCamera } = await import("../src/features/physiognomy/camera/index");
    let asked = false;
    vi.stubGlobal("window", { isSecureContext: false });
    vi.stubGlobal("navigator", {
      mediaDevices: { getUserMedia: () => { asked = true; return Promise.resolve(new FakeStream()); } },
    });
    vi.stubGlobal("WebAssembly", { validate: () => true });
    await expect(openCamera(fakeVideo())).rejects.toMatchObject({ kind: "unsupported" });
    expect(asked, "không được xin quyền khi chưa có HTTPS").toBe(false);
  });

  it("thành công → state 'active', và đặt playsinline + muted cho iOS", async () => {
    const { openCamera } = await import("../src/features/physiognomy/camera/index");
    const stream = new FakeStream(1);
    stubEnv(() => Promise.resolve(stream));
    const v = fakeVideo();
    const h = await openCamera(v);
    expect(h.state).toBe("active");
    expect(v.playsInline).toBe(true);
    expect(v.muted).toBe(true);
    expect(v.getAttribute("playsinline")).toBe("");
    expect(v.getAttribute("webkit-playsinline")).toBe("");
  });

  it("release() dừng MỌI track và idempotent (gọi 3 lần chỉ stop 1 lần)", async () => {
    const { openCamera } = await import("../src/features/physiognomy/camera/index");
    const stream = new FakeStream(2);
    stubEnv(() => Promise.resolve(stream));
    const h = await openCamera(fakeVideo());
    h.release();
    h.release();
    h.release();
    expect(h.state).toBe("stopped");
    expect(h.isReleased()).toBe(true);
    for (const t of stream.tracks) {
      expect(t.stopCount, "mỗi track phải stop đúng 1 lần").toBe(1);
    }
  });

  it("release() gỡ srcObject — không giữ camera sau khi rời trang", async () => {
    const { openCamera } = await import("../src/features/physiognomy/camera/index");
    stubEnv(() => Promise.resolve(new FakeStream()));
    const v = fakeVideo();
    const h = await openCamera(v);
    h.release();
    expect(v.srcObject).toBeNull();
  });

  it("retry sau khi bị deny: lần hai thành công, không dính lỗi cũ", async () => {
    const { openCamera } = await import("../src/features/physiognomy/camera/index");
    let n = 0;
    stubEnv(() => {
      n++;
      return n === 1
        ? Promise.reject(Object.assign(new Error("no"), { name: "NotAllowedError" }))
        : Promise.resolve(new FakeStream());
    });
    await expect(openCamera(fakeVideo())).rejects.toMatchObject({ kind: "denied" });
    const h = await openCamera(fakeVideo());
    expect(h.state).toBe("active");
  });

  it("markCapturing chỉ đổi trạng thái khi đang active, không hồi sinh stream đã stop", async () => {
    const { openCamera } = await import("../src/features/physiognomy/camera/index");
    stubEnv(() => Promise.resolve(new FakeStream()));
    const h = await openCamera(fakeVideo());
    h.markCapturing();
    expect(h.state).toBe("capture");
    h.release();
    h.markCapturing();
    expect(h.state, "đã stopped thì không được quay lại capture").toBe("stopped");
  });

  it("chỉ xin video, KHÔNG xin gộp audio (micro xin riêng ở bước giọng nói)", async () => {
    const { openCamera } = await import("../src/features/physiognomy/camera/index");
    let constraints: MediaStreamConstraints | undefined;
    stubEnv((c?: MediaStreamConstraints) => {
      constraints = c;
      return Promise.resolve(new FakeStream());
    });
    await openCamera(fakeVideo());
    expect(constraints?.audio).toBe(false);
    expect(constraints?.video).toMatchObject({ facingMode: "user" });
  });
});

// ════════════════════════════════════════════════════════════════════ 4. VOICE

describe("voice — thương lượng MIME", () => {
  it("Chrome/Android (hỗ trợ webm) → chọn webm;codecs=opus", () => {
    expect(pickSupportedMimeType((t) => t.startsWith("audio/webm")))
      .toBe("audio/webm;codecs=opus");
  });

  it("iOS Safari (chỉ mp4) → chọn mp4, KHÔNG chọn webm", () => {
    const picked = pickSupportedMimeType((t) => t.startsWith("audio/mp4"));
    expect(picked).toBe("audio/mp4;codecs=mp4a.40.2");
    expect(picked).not.toMatch(/webm/);
  });

  it("chỉ hỗ trợ mp4 trần (không có codec string) → vẫn chọn được", () => {
    expect(pickSupportedMimeType((t) => t === "audio/mp4")).toBe("audio/mp4");
  });

  it("Firefox cũ (chỉ ogg) → fallback ogg", () => {
    expect(pickSupportedMimeType((t) => t.startsWith("audio/ogg")))
      .toBe("audio/ogg;codecs=opus");
  });

  it("không hỗ trợ gì → null (để MediaRecorder tự chọn, KHÔNG hard-code webm)", () => {
    expect(pickSupportedMimeType(() => false)).toBeNull();
  });

  it("isTypeSupported throw (Safari cũ) → không làm sập, coi như không hỗ trợ", () => {
    expect(() =>
      pickSupportedMimeType((t) => {
        if (t.includes("webm")) throw new Error("boom");
        return t.startsWith("audio/mp4");
      }),
    ).not.toThrow();
  });

  it("danh sách ứng viên có cả webm và mp4, webm đứng trước", () => {
    const list = [...MIME_CANDIDATES];
    expect(list.some((t) => t.includes("webm"))).toBe(true);
    expect(list.some((t) => t.includes("mp4"))).toBe(true);
    expect(list.findIndex((t) => t.includes("webm")))
      .toBeLessThan(list.findIndex((t) => t.includes("mp4")));
  });
});

describe("voice — đặc trưng âm thanh", () => {
  /** Sóng sin thuần: cao độ đã biết trước, dùng để kiểm hàm ước lượng. */
  function sine(freq: number, sec: number, rate = 16_000, amp = 0.3) {
    const n = Math.round(sec * rate);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) out[i] = amp * Math.sin((2 * Math.PI * freq * i) / rate);
    return out;
  }

  it("bắt đúng cao độ của sin 150 Hz (sai số < 5%)", () => {
    const f = extractVoiceFeatures(sine(150, 1.0), 16_000);
    expect(f.pitchHz).not.toBeNull();
    expect(Math.abs(f.pitchHz! - 150) / 150).toBeLessThan(0.05);
  });

  it("im lặng → pitch null, energy null, KHÔNG trả 0 giả", () => {
    const f = extractVoiceFeatures(new Float32Array(16_000), 16_000);
    expect(f.pitchHz).toBeNull();
    expect(f.energyRms).toBeNull();
  });

  it("mọi đặc trưng đều mang cờ experimental + warning", () => {
    const f = extractVoiceFeatures(sine(200, 0.8), 16_000);
    expect(f.experimental).toBe(true);
    expect(f.warning).toMatch(/THỬ NGHIỆM/);
  });

  it("KHÔNG có field nào ánh xạ âm thanh sang kết luận nhân tướng", () => {
    const f = extractVoiceFeatures(sine(180, 0.8), 16_000);
    const keys = JSON.stringify(f).toLowerCase();
    for (const bad of ["destiny", "fortune", "personality", "tuong", "menh", "van"]) {
      expect(keys, `không được có field "${bad}"`).not.toContain(`"${bad}`);
    }
  });

  it("energyRms tăng theo biên độ", () => {
    const quiet = extractVoiceFeatures(sine(200, 0.8, 16_000, 0.05), 16_000);
    const loud = extractVoiceFeatures(sine(200, 0.8, 16_000, 0.5), 16_000);
    expect(loud.energyRms!).toBeGreaterThan(quiet.energyRms!);
  });
});

// ═════════════════════════════════════════════════════════════════════ 5. JSON

describe("JSON contract — kỷ luật", () => {
  function fullResult() {
    const lm = makeFace();
    const q = evaluateQuality({
      faceCount: 1, yaw: 1, pitch: -1, roll: 0.5,
      faceCoverage: 0.45, blurScore: 0.01, lightingScore: 0.5,
    });
    return assembleScanResult({
      landmarks: lm, transformMatrix: null, frameWidth: W, frameHeight: H,
      quality: q,
      voice: { voiceCaptured: false, durationMs: null, mimeType: null, sampleRate: null, channels: null },
    });
  }

  it("schemaVersion là 1.0 và có trong cả metadata", () => {
    const r = fullResult();
    expect(r.schemaVersion).toBe("1.0");
    expect(r.metadata.schemaVersion).toBe("1.0");
    expect(r.metadata.modelVersion).toMatch(/face_landmarker/);
  });

  it("KHÔNG có bất kỳ TÊN FIELD nào là fullness/depth/score", () => {
    // Kiểm tra TÊN KHOÁ, không kiểm cả chuỗi JSON: phần văn bản giải thích được
    // phép nhắc tới 丰隆/低陷 để nói rõ vì sao KHÔNG đo được. Cấm là cấm có field
    // mang những tên đó, vì một con số dưới tên như vậy trông như sự thật.
    // Cố tình KHÔNG cấm cả chữ "score": blurScore/lightingScore là chỉ số CHẤT LƯỢNG
    // ẢNH, hoàn toàn hợp lệ. Chỉ cấm những tên hàm ý phán xét về con người.
    const banned = [
      "fullness", "palacedepth", "depthscore", "destiny", "personality",
      "fortune", "goodbad", "luck", "physiognomyscore", "facescore",
    ];
    const keys: string[] = [];
    const walk = (o: unknown): void => {
      if (!o || typeof o !== "object") return;
      if (Array.isArray(o)) {
        for (const v of o) walk(v);
        return;
      }
      for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
        keys.push(k);
        walk(v);
      }
    };
    walk(fullResult());
    for (const k of keys) {
      const lower = k.toLowerCase();
      for (const bad of banned) {
        expect(lower, `field "${k}" mang tên bị cấm ("${bad}")`).not.toContain(bad);
      }
    }
    // blurScore/lightingScore là chỉ số CHẤT LƯỢNG ẢNH — không phải điểm nhân tướng.
    // Chúng chứa chữ "score" nên phải nằm ngoài lệnh cấm một cách tường minh:
    expect(keys).toContain("blurScore");
    expect(keys).toContain("lightingScore");
  });

  it("experimentalDepth chỉ chứa cờ + cảnh báo, KHÔNG chứa số nào", () => {
    const d = fullResult().experimentalDepth;
    expect(Object.keys(d).sort()).toEqual(["enabled", "warning"]);
  });

  it("experimentalDepth TẮT mặc định và có warning", () => {
    const r = fullResult();
    expect(r.experimentalDepth.enabled).toBe(false);
    expect(r.experimentalDepth.values).toBeUndefined();
    expect(r.experimentalDepth.warning).toMatch(/KHÔNG DÙNG ĐỂ LUẬN GIẢI/);
  });

  it("mọi Measurement có value null đều PHẢI có status giải thích + note", () => {
    const r = fullResult();
    const walk = (o: unknown, path = ""): void => {
      if (!o || typeof o !== "object") return;
      const rec = o as Record<string, unknown>;
      if ("value" in rec && "status" in rec) {
        if (rec.value === null) {
          expect(rec.status, `${path}: value null thì status không được là measured`)
            .not.toBe("measured");
          expect(rec.note, `${path}: value null thì phải có note giải thích`).toBeTruthy();
        }
        return;
      }
      for (const [k, v] of Object.entries(rec)) walk(v, `${path}.${k}`);
    };
    walk(r);
  });

  it("KHÔNG dùng 0 làm giá trị thiếu — ear phải là null chứ không phải 0", () => {
    const r = fullResult();
    expect(r.structural!.fiveOrgans.ear.value).toBeNull();
    expect(r.structural!.fiveOrgans.ear.status).toBe("unsupported");
  });

  it("đủ 4 trạng thái measured/estimated/unsupported/unknown được dùng đúng chỗ", () => {
    const r = fullResult();
    expect(r.geometry!.eyeDistance.status).toBe("measured");
    expect(r.geometry!.noseLength.status).toBe("estimated");
    expect(r.structural!.fiveOrgans.ear.status).toBe("unsupported");
    // unknown: dùng khi dữ liệu lần quét này không đủ
    const flat: LandmarkPoint[] = Array.from({ length: 468 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
    expect(measureThreeCourts(flat, W, H).status).toBe("unknown");
  });

  it("pose trong JSON có cả số thô và status", () => {
    const r = fullResult();
    expect(r.captureQuality.pose).toMatchObject({
      status: "pass", exceeded: [], limits: { yaw: 8, pitch: 8, roll: 5 },
    });
    expect(typeof r.captureQuality.pose.yaw).toBe("number");
  });

  it("giữ đủ 468 landmark để tính lại được mà không phải chụp lại khách", () => {
    expect(fullResult().structural!.landmarks).toHaveLength(468);
  });
});

// ══════════════════════════════════════════════════ 6. BẢN ĐỒ 12 CUNG (sửa ở 1B)

describe("bản đồ 12 cung — đã thiết kế lại và kiểm bằng canonical mesh", () => {
  const names = Object.keys(PALACE_REGIONS) as TwelvePalaceName[];

  it("đủ 12 cung", () => {
    expect(names).toHaveLength(12);
  });

  it("cung nào 'verified' thì metrics phải đạt cả 4 tiêu chí", () => {
    for (const n of names) {
      const d = PALACE_REGIONS[n];
      if (d.mapping !== "verified") continue;
      expect(d.metrics.zSpread, `${n} z-spread`).toBeLessThanOrEqual(0.2);
      expect(d.metrics.diameter, `${n} đường kính`).toBeLessThanOrEqual(0.45);
      expect(d.metrics.contourPoints, `${n} điểm contour`).toBe(0);
      expect(d.left.length, `${n} số điểm`).toBeGreaterThanOrEqual(4);
    }
  });

  it("cung nào KHÔNG đạt thì phải là 'unknown' kèm note — không ép thành verified", () => {
    for (const n of names) {
      const d = PALACE_REGIONS[n];
      const passes =
        d.metrics.zSpread <= 0.2 && d.metrics.diameter <= 0.45 &&
        d.metrics.contourPoints === 0 && d.left.length >= 4;
      if (!passes) {
        expect(d.mapping, `${n} chưa đạt tiêu chí thì phải là unknown`).toBe("unknown");
        expect(d.note, `${n} unknown thì phải giải thích`).toBeTruthy();
      }
    }
  });

  it("noBoc là cung duy nhất unknown, vì viền hàm cong thật theo độ sâu", () => {
    expect(PALACE_REGIONS.noBoc.mapping).toBe("unknown");
    expect(PALACE_REGIONS.noBoc.metrics.zSpread).toBeGreaterThan(0.2);
    expect(names.filter((n) => PALACE_REGIONS[n].mapping === "unknown")).toEqual(["noBoc"]);
  });

  it("PHU THÊ đã sửa: không còn điểm vành mắt và viền mặt", () => {
    const all = [...PALACE_REGIONS.phuThe.left, ...(PALACE_REGIONS.phuThe.right ?? [])];
    // 33/133/263/362 là vành contour mắt; 234/454/127/356/162/389 là viền mặt/thái dương.
    for (const bad of [33, 133, 263, 362, 234, 454, 127, 356, 162, 389]) {
      expect(all, `Phu Thê không được chứa ${bad}`).not.toContain(bad);
    }
    expect(PALACE_REGIONS.phuThe.metrics.zSpread).toBeLessThan(0.11);
    expect(PALACE_REGIONS.phuThe.note).toMatch(/S\/N = 1\.01/);
  });

  it("ĐIỀN TRẠCH đã sửa: không còn điểm vành mắt", () => {
    const all = [...PALACE_REGIONS.dienTrach.left, ...(PALACE_REGIONS.dienTrach.right ?? [])];
    for (const bad of [155, 154, 153, 144, 145, 33, 382, 381, 380, 373, 374, 263]) {
      expect(all, `Điền Trạch không được chứa ${bad}`).not.toContain(bad);
    }
    expect(PALACE_REGIONS.dienTrach.metrics.zSpread).toBeLessThan(0.05);
  });

  it("cung song phương giữ TRÁI/PHẢI riêng, không gộp thành một", () => {
    for (const n of ["huynhDe", "dienTrach", "tuNu", "noBoc", "phuThe", "thienDi", "phucDuc", "phuMau"] as const) {
      const d = PALACE_REGIONS[n];
      expect(d.right, `${n} phải có vùng bên phải riêng`).not.toBeNull();
      expect(d.right!.length, `${n} hai bên phải cùng số điểm`).toBe(d.left.length);
      expect(d.right, `${n} hai bên không được trùng index`).not.toEqual(d.left);
    }
  });

  it("cung trên đường giữa thì right = null", () => {
    for (const n of ["menh", "taiBach", "tatAch", "quanLoc"] as const) {
      expect(PALACE_REGIONS[n].right, `${n} nằm giữa nên không có bên phải`).toBeNull();
    }
  });

  it("mọi index trong [0,467] và không trùng trong cùng một vùng", () => {
    for (const n of names) {
      for (const side of [PALACE_REGIONS[n].left, PALACE_REGIONS[n].right ?? []]) {
        for (const i of side) {
          expect(i, `${n}: index ${i}`).toBeGreaterThanOrEqual(0);
          expect(i, `${n}: index ${i}`).toBeLessThan(468);
        }
        expect(new Set(side).size, `${n} có index trùng`).toBe(side.length);
      }
    }
  });

  it("dù mapping verified, PHÉP ĐO vẫn unsupported (bản đồ đúng ≠ đo được)", () => {
    const st = measureStructural(makeFace(), W, H, 100, 128, false);
    expect(st.twelvePalaces.status).toBe("unsupported");
    for (const n of names) {
      expect(st.twelvePalaces.palaces[n].status).toBe("unsupported");
    }
    expect(st.twelvePalaces.palaces.phuThe.mapping).toBe("verified");
    expect(st.twelvePalaces.palaces.noBoc.mapping).toBe("unknown");
  });

  it("PALACE_INDICES (phẳng) = trái + phải, dùng cho chỗ chỉ cần tập index", () => {
    for (const n of names) {
      const d = PALACE_REGIONS[n];
      expect(PALACE_INDICES[n]).toEqual([...d.left, ...(d.right ?? [])]);
    }
  });
});

describe("regression — landmark index đã từng sai", () => {
  it("133 là khoé mắt trong, không key 'brow' nào trỏ vào nó", () => {
    expect(IDX.eyeLeftInner).toBe(133);
    for (const [k, v] of Object.entries(IDX)) {
      if (k.toLowerCase().includes("brow")) expect(v).not.toBe(133);
    }
  });

  it("mốc chuẩn hoá bề ngang mặt vẫn là 234/454", () => {
    expect([IDX.cheekLeft, IDX.cheekRight]).toEqual([234, 454]);
  });
});

// khoá kiểu để bảo đảm CaptureQuality vẫn có shape mong đợi
describe("kiểu dữ liệu", () => {
  it("CaptureQuality có pose lồng, không còn yaw/pitch/roll phẳng", () => {
    const q: CaptureQuality = evaluateQuality({
      faceCount: 1, yaw: 0, pitch: 0, roll: 0,
      faceCoverage: 0.4, blurScore: 0.01, lightingScore: 0.5,
    });
    expect(q).toHaveProperty("pose.yaw");
    expect(q).not.toHaveProperty("yaw");
  });
});
