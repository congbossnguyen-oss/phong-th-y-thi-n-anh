/**
 * Phase 1D-2 — Transport: FeatureProfile (nội bộ) → payload phiên → KV → máy tính.
 *
 * Fixture là mesh chuẩn của MediaPipe (xem `nhan-tuong-feature-layer.test.ts`), dùng
 * làm regression fixture chứ không phải dữ liệu người thật.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildFeatureProfile, type ViewObservation } from "../src/features/physiognomy/features/extract";
import type { PhysiognomyFeatureProfile } from "../src/features/physiognomy/features/schema";
import {
  FEATURE_KEYS,
  MAX_FEATURE_TRANSPORT_BYTES,
  PAYLOAD_KEYS,
  TRANSPORT_VERSION,
  parsePhysiognomySessionFeaturePayload,
  payloadBytes,
  summarizeFeatures,
  toPhysiognomySessionFeaturePayload,
  type PhysiognomySessionFeaturePayload,
} from "../src/features/physiognomy/features/transport";
import {
  MemorySessionStore,
  completeSession,
  connectSession,
  createSession,
  recordStep,
} from "../src/features/physiognomy/session/store";
import { FACE_STEPS, publicView } from "../src/features/physiognomy/session/types";

const FIX = JSON.parse(
  readFileSync(join(import.meta.dirname, "fixtures", "canonical-face.json"), "utf-8"),
) as { frameWidth: number; frameHeight: number; landmarks: { x: number; y: number; z: number }[] };

const obs = (over: Partial<ViewObservation> = {}): ViewObservation => ({
  step: "front",
  landmarks: FIX.landmarks,
  frameWidth: FIX.frameWidth,
  frameHeight: FIX.frameHeight,
  pose: { yaw: 0, pitch: 0, roll: 0 },
  quality: { faceDetected: true, coverage: 0.6, brightness: 0.55, blur: 0.02 },
  ...over,
});

const SIX: ViewObservation[] = [
  obs(),
  obs({ step: "left", pose: { yaw: 30, pitch: 0, roll: 0 } }),
  obs({ step: "right", pose: { yaw: -30, pitch: 0, roll: 0 } }),
  obs({ step: "near", quality: { faceDetected: true, coverage: 0.7, brightness: 0.55, blur: 0.02 } }),
  obs({ step: "pitch_down", pose: { yaw: 0, pitch: 25, roll: 0 } }),
  obs({ step: "pitch_up", pose: { yaw: 0, pitch: -25, roll: 0 } }),
];

const SID = "M6ZQGDKGTB";
const profileOf = (o: ViewObservation[]): PhysiognomyFeatureProfile =>
  buildFeatureProfile({ sessionId: SID, capturedAt: 1_700_000_000_000, observations: o });

function payloadOf(o: ViewObservation[]): PhysiognomySessionFeaturePayload {
  const r = toPhysiognomySessionFeaturePayload(profileOf(o));
  if (!r.ok) throw new Error(`mapper hỏng: ${r.code} ${r.message}`);
  return r.payload;
}

// ────────────────────────────────────────────────── 1. mapper đúng đắn

describe("mapper", () => {
  it("1 view và 6 view đều dựng được payload", () => {
    for (const o of [[obs()], SIX]) {
      const r = toPhysiognomySessionFeaturePayload(profileOf(o));
      expect(r.ok, JSON.stringify(r)).toBe(true);
    }
  });

  it("deterministic — chạy hai lần ra payload y hệt, cùng số byte", () => {
    const a = payloadOf(SIX);
    const b = payloadOf(SIX);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(payloadBytes(a)).toBe(payloadBytes(b));
  });

  it("thuần — KHÔNG sửa profile đầu vào", () => {
    const p = profileOf(SIX);
    const before = JSON.stringify(p);
    toPhysiognomySessionFeaturePayload(p);
    expect(JSON.stringify(p)).toBe(before);
  });

  it("chỉ có đúng các khoá cấp cao đã khai", () => {
    expect(Object.keys(payloadOf(SIX)).sort()).toEqual([...PAYLOAD_KEYS].sort());
  });

  it("mỗi feature chỉ có đúng 8 trường provenance", () => {
    for (const f of payloadOf(SIX).features) {
      expect(Object.keys(f).sort()).toEqual([...FEATURE_KEYS].sort());
    }
  });
});

// ─────────────────────────────────── 2. loại bỏ static / redundant

describe("loại bỏ dữ liệu tĩnh và trùng lặp", () => {
  const p = payloadOf(SIX);
  const json = JSON.stringify(p);

  it("KHÔNG mang `note`", () => {
    expect(json).not.toContain('"note"');
    // và không mang nội dung note dưới tên khác
    expect(json).not.toContain("chân tóc");
    expect(json).not.toContain("Chớp mắt");
  });

  it("KHÔNG mang định nghĩa tĩnh của Thập Nhị Cung", () => {
    expect(json).not.toContain("twelvePalaces");
    for (const name of ["menh", "taiBach", "noBoc", "phuThe", "dienTrach"]) {
      expect(json).not.toContain(`"${name}"`);
    }
    expect(json).not.toContain("mappingStatus");
  });

  it("KHÔNG mang `notices` hay văn bản giải thích", () => {
    expect(json).not.toContain("notices");
    expect(json).not.toContain("TẦNG ĐO LƯỜNG");
  });

  it("KHÔNG mang media thô dưới bất kỳ dạng nào", () => {
    for (const bad of ["base64", "image", "video", "audio", "blob", "dataUrl", "landmarks"]) {
      expect(json.toLowerCase()).not.toContain(bad.toLowerCase());
    }
  });

  it("KHÔNG mang cấu trúc thô của MediaPipe", () => {
    for (const bad of ["faceLandmarks", "facialTransformationMatrixes", "faceBlendshapes"]) {
      expect(json).not.toContain(bad);
    }
  });

  it("face_shape_ratio xuất hiện ĐÚNG MỘT lần dù profile nội bộ có hai chỗ", () => {
    // Đếm ĐỐI TƯỢNG feature, không đếm mọi lần chuỗi xuất hiện (khoá còn nằm cả trong
    // `views.front.contributedFeatures`).
    const internal =
      JSON.stringify(profileOf(SIX)).split('"key":"face.geometry.face_shape_ratio"').length - 1;
    expect(internal, "profile nội bộ vẫn giữ hai chỗ").toBe(2);
    const onWire = p.features.filter((f) => f.k === "face.geometry.face_shape_ratio");
    expect(onWire).toHaveLength(1);
  });

  it("không khoá feature nào lặp", () => {
    const keys = p.features.map((f) => f.k);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("đúng 29 feature", () => {
    expect(p.features).toHaveLength(29);
  });
});

// ──────────────────────────────────────── 3. giữ nguyên ngữ nghĩa

describe("giữ nguyên ngữ nghĩa của tầng feature", () => {
  const p = payloadOf(SIX);
  const byKey = new Map(p.features.map((f) => [f.k, f]));

  it("measured vẫn là measured — sau Phase 1D-3 chỉ còn ba trục tư thế", () => {
    for (const k of ["face.pose.yaw", "face.pose.pitch", "face.pose.roll"]) {
      expect(byKey.get(k)!.s, k).toBe("measured");
    }
    expect(p.features.filter((f) => f.s === "measured").map((f) => f.k).sort()).toEqual([
      "face.pose.pitch", "face.pose.roll", "face.pose.yaw",
    ]);
  });

  it("low_confidence vẫn là low_confidence", () => {
    for (const k of ["face.nose.length", "face.three_courts.upper", "face.mouth.height",
      "face.eyes.interocular_distance", "face.three_courts.middle",
      "face.geometry.face_width", "face.geometry.face_height"]) {
      expect(byKey.get(k)!.s, k).toBe("low_confidence");
    }
  });

  it("unsupported vẫn là unsupported và value vẫn null — KHÔNG thành 0", () => {
    // Ở Phase 1D V1, một lần quét thật thì HOẶC mọi feature đều có số, HOẶC không cái
    // nào có (xem mô tả trong docs) — nên dựng thẳng một profile có đúng một feature
    // unsupported để kiểm hành vi của mapper, thay vì chờ một tình huống chưa tồn tại.
    const prof = structuredClone(profileOf(SIX));
    prof.fiveOfficials.mouth.height = {
      ...prof.fiveOfficials.mouth.height,
      value: null,
      status: "unsupported",
      confidence: 0,
      sourceView: null,
    };
    const r = toPhysiognomySessionFeaturePayload(prof);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const f = r.payload.features.find((x) => x.k === "face.mouth.height")!;
    expect(f.s).toBe("unsupported");
    expect(f.v).toBeNull();
    expect(f.v).not.toBe(0);
    // và các feature khác KHÔNG bị lây
    expect(r.payload.features.filter((x) => x.s === "unsupported")).toHaveLength(1);
  });

  it("mọi feature null đều là unsupported — không chỗ nào để null lọt qua status khác", () => {
    for (const f of payloadOf(SIX).features) {
      if (f.v === null) expect(f.s, f.k).toBe("unsupported");
    }
  });

  it("giá trị số đi qua nguyên vẹn, không làm tròn thêm", () => {
    const prof = profileOf(SIX);
    expect(byKey.get("face.nose.bridge_ratio")!.v).toBe(prof.fiveOfficials.nose.bridge_ratio.value);
    expect(byKey.get("face.three_courts.middle")!.v).toBe(prof.threeCourts.middle.value);
  });

  it("provenance đủ 8 phần cho mọi feature", () => {
    for (const f of p.features) {
      expect(typeof f.k).toBe("string");
      expect(typeof f.u).toBe("string");
      expect(typeof f.c).toBe("number");
      expect(typeof f.s).toBe("string");
      expect(f.m.length, `${f.k}.method`).toBeGreaterThan(0);
      expect(Array.isArray(f.l), `${f.k}.sourceLandmarks`).toBe(true);
      if (f.v !== null) expect(f.w, `${f.k}.sourceView`).toBeTruthy();
    }
  });

  it("pose của TỪNG view được giữ", () => {
    expect(p.views.left.pose.yaw).toBe(30);
    expect(p.views.right.pose.yaw).toBe(-30);
    expect(p.views.pitchDown.pose.pitch).toBe(25);
    expect(p.views.pitchUp.pose.pitch).toBe(-25);
  });

  it("quality được giữ", () => {
    expect(p.quality.overall).toBe("excellent");
    expect(p.quality.faceDetected).toBe(true);
    expect(p.quality.poseValid).toBe(true);
    expect(p.quality.coverage).toBe(0.6);
  });

  it("KHÔNG có phân loại/luận giải nào", () => {
    const low = JSON.stringify(p).toLowerCase();
    for (const bad of ["auspicious", "lucky", "wealth", "fortune", "destiny", "personality",
      "face_type", "eye_type", "fullness", "tướng tốt", "tướng xấu"]) {
      expect(low, bad).not.toContain(bad.toLowerCase());
    }
  });
});

// ────────────────────────────────────────────── 4. ngân sách byte

describe("ngân sách byte", () => {
  it("đếm UTF-8 thật, không đếm ký tự", () => {
    // "đ" là 2 byte UTF-8 nhưng 1 ký tự JS.
    expect(payloadBytes({ a: "đ" })).toBe(JSON.stringify({ a: "đ" }).length + 1);
  });

  it("1 view dưới ngân sách", () => {
    const b = payloadBytes(payloadOf([obs()]));
    expect(b).toBeLessThan(MAX_FEATURE_TRANSPORT_BYTES);
  });

  it("6 view dưới ngân sách", () => {
    const b = payloadBytes(payloadOf(SIX));
    expect(b).toBeLessThan(MAX_FEATURE_TRANSPORT_BYTES);
  });

  it("ngân sách phải có khoảng dư so với giới hạn 16 KB của API", () => {
    expect(MAX_FEATURE_TRANSPORT_BYTES).toBeLessThanOrEqual(12 * 1024);
    expect(16 * 1024 - MAX_FEATURE_TRANSPORT_BYTES).toBeGreaterThanOrEqual(4 * 1024);
  });

  it("vượt ngân sách thì BÁO HỎNG, không cắt bớt feature", () => {
    const r = toPhysiognomySessionFeaturePayload(profileOf(SIX), { maxBytes: 100 });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.code).toBe("oversize");
    expect(r.bytes).toBeGreaterThan(100);
    expect(r.message).toContain("KHÔNG cắt bớt");
  });

  it("không có đường nào trả payload thiếu feature", () => {
    // Mọi kết quả ok đều mang đủ 29 feature; không có chế độ "rút gọn".
    for (const o of [[obs()], SIX]) {
      const r = toPhysiognomySessionFeaturePayload(profileOf(o));
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.payload.features).toHaveLength(29);
    }
  });
});

// ──────────────────────────────────────────── 5. mapper báo hỏng

describe("mapper báo hỏng rõ ràng, không tạo payload giả", () => {
  it("schema lạ → schema_mismatch", () => {
    const p = { ...profileOf(SIX), schemaVersion: "physiognomy-feature-v9" } as unknown as PhysiognomyFeatureProfile;
    const r = toPhysiognomySessionFeaturePayload(p);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("schema_mismatch");
  });

  it("không feature nào đo được → no_measurement, KHÔNG payload rỗng", () => {
    // Ảnh mờ quá ngưỡng → không view nào cấp số, mọi giá trị null.
    const r = toPhysiognomySessionFeaturePayload(
      profileOf([
        obs({
          pose: { yaw: null, pitch: null, roll: null },
          quality: { faceDetected: true, coverage: 0.6, brightness: 0.55, blur: 0.000001 },
        }),
      ]),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("no_measurement");
  });

  it("không quan sát nào → no_measurement", () => {
    const r = toPhysiognomySessionFeaturePayload(profileOf([]));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("no_measurement");
  });
});

// ─────────────────────────────────────────────── 6. kiểm payload

describe("parse payload đến từ máy khách", () => {
  const ok = () => JSON.parse(JSON.stringify(payloadOf(SIX)));
  const check = (p: unknown) => parsePhysiognomySessionFeaturePayload(p, { sessionId: SID });

  it("payload hợp lệ được chấp nhận", () => {
    const r = check(ok());
    expect(r.ok, JSON.stringify(r)).toBe(true);
  });

  it("transportVersion sai → từ chối", () => {
    const p = ok();
    p.transportVersion = "physiognomy-session-feature-v2";
    const r = check(p);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("bad_transport_version");
  });

  it("featureSchemaVersion sai → từ chối", () => {
    const p = ok();
    p.featureSchemaVersion = "physiognomy-feature-v2";
    const r = check(p);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("bad_schema_version");
  });

  it("sessionId khác → từ chối (cô lập phiên)", () => {
    const r = parsePhysiognomySessionFeaturePayload(ok(), { sessionId: "KHACPHIEN1" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("session_mismatch");
  });

  it("trường lạ ở cấp cao → TỪ CHỐI, không lặng lẽ bỏ qua", () => {
    const p = ok();
    p.imageBase64 = "data:image/png;base64,AAAA";
    const r = check(p);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("unknown_field");
  });

  it("trường lạ trong feature → từ chối", () => {
    const p = ok();
    p.features[0].forehead_fullness = 0.82;
    const r = check(p);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("unknown_field");
  });

  it("khoá feature lặp → từ chối", () => {
    const p = ok();
    p.features.push({ ...p.features[0] });
    const r = check(p);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("duplicate_key");
  });

  it("khoá feature sai định dạng → từ chối", () => {
    for (const k of ["fullness", "face.Eyes.Width", "cung_mệnh.độ_đầy", "face.a"]) {
      const p = ok();
      p.features[0].k = k;
      const r = check(p);
      expect(r.ok, k).toBe(false);
    }
  });

  it("unsupported mà có giá trị → từ chối", () => {
    const p = ok();
    const i = p.features.findIndex((f: { s: string }) => f.s === "measured");
    p.features[i].s = "unsupported";
    const r = check(p);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("bad_shape");
  });

  it("value null mà status không phải unsupported → từ chối", () => {
    const p = ok();
    p.features[0].v = null;
    const r = check(p);
    expect(r.ok).toBe(false);
  });

  it("confidence ngoài [0,1] → từ chối", () => {
    const p = ok();
    p.features[0].c = 1.5;
    expect(check(p).ok).toBe(false);
  });

  it("sourceLandmarks ngoài 0..467 → từ chối", () => {
    const p = ok();
    p.features[0].l = [999];
    expect(check(p).ok).toBe(false);
  });

  it("thiếu method → từ chối (mất provenance)", () => {
    const p = ok();
    p.features[0].m = "";
    expect(check(p).ok).toBe(false);
  });

  it("view lạ → từ chối", () => {
    const p = ok();
    p.views.profile = { present: true, quality: "good", pose: { yaw: 0, pitch: 0, roll: 0 } };
    const r = check(p);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("unknown_field");
  });

  it("features rỗng → từ chối", () => {
    const p = ok();
    p.features = [];
    expect(check(p).ok).toBe(false);
  });

  it("không phải object → từ chối", () => {
    for (const v of [null, 42, "x", [1, 2]]) expect(check(v).ok).toBe(false);
  });

  it("vượt ngân sách → từ chối", () => {
    const r = parsePhysiognomySessionFeaturePayload(ok(), { sessionId: SID, maxBytes: 100 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("oversize");
  });

  it("parse rồi map lại ra đúng payload ban đầu (round-trip)", () => {
    const a = payloadOf(SIX);
    const r = check(JSON.parse(JSON.stringify(a)));
    expect(r.ok).toBe(true);
    if (r.ok) expect(JSON.stringify(r.payload)).toBe(JSON.stringify(a));
  });
});

// ──────────────────────────────────────── 7. đầu-cuối qua phiên

describe("đầu-cuối: profile → phiên → kho → máy tính", () => {
  async function runSession(body: { payload?: PhysiognomySessionFeaturePayload; error?: string }) {
    const store = new MemorySessionStore();
    const created = await createSession(store);
    const id = created.record.sessionId;
    const conn = await connectSession(store, id);
    if (!conn.ok) throw new Error("connect hỏng");
    const token = conn.writeToken;
    for (const step of FACE_STEPS) {
      const out = await recordStep(store, id, token, {
        step, timestamp: Date.now(),
        quality: { faceDetected: true, confidence: 0.6, brightness: 0.55, blur: 0.02 },
        pose: { yaw: 0, pitch: 0, roll: 0 },
        geometry: { faceWidth: 600, faceHeight: 700, faceShapeRatio: 1.15,
          middleCourt: 0.4, upperCourt: 0.18, lowerCourt: 0.42 },
      });
      if (!out.ok) throw new Error(`step ${step} hỏng`);
    }
    const feature = body.payload
      ? ({ status: "ok", payload: body.payload } as const)
      : body.error
        ? ({ status: "unavailable", error: body.error } as const)
        : undefined;
    const done = await completeSession(store, id, token, Date.now(), feature);
    if (!done.ok) throw new Error("complete hỏng");
    return publicView(done.record);
  }

  it("có payload → máy tính nhận lại ĐÚNG payload", async () => {
    // payload phải mang sessionId của chính phiên đó
    const store = new MemorySessionStore();
    const created = await createSession(store);
    const id = created.record.sessionId;
    const p = toPhysiognomySessionFeaturePayload(
      buildFeatureProfile({ sessionId: id, capturedAt: Date.now(), observations: SIX }),
    );
    expect(p.ok).toBe(true);
    if (!p.ok) return;

    const conn = await connectSession(store, id);
    if (!conn.ok) return;
    const done = await completeSession(store, id, conn.writeToken, Date.now(), {
      status: "ok", payload: p.payload,
    });
    expect(done.ok).toBe(true);
    if (!done.ok) return;
    const view = publicView(done.record);
    expect(view.status).toBe("complete");
    expect(view.result!.featureStatus).toBe("ok");
    expect(JSON.stringify(view.result!.featureProfile)).toBe(JSON.stringify(p.payload));
    expect(view.result!.featureError).toBeNull();
  });

  it("trích hỏng → phiên VẪN complete, featureStatus = unavailable, có lý do", async () => {
    const view = await runSession({ error: "no_measurement: không feature nào đo được" });
    expect(view.status).toBe("complete");
    expect(view.result!.featureStatus).toBe("unavailable");
    expect(view.result!.featureProfile).toBeNull();
    expect(view.result!.featureError).toContain("no_measurement");
    // 6 bước mặt vẫn PASS — thu ảnh và trích feature là hai việc khác nhau.
    expect(view.result!.quality.faceTestsPassed).toBe(FACE_STEPS.length);
  });

  it("client cũ không gửi gì → complete, featureStatus = none (tương thích ngược)", async () => {
    const view = await runSession({});
    expect(view.status).toBe("complete");
    expect(view.result!.featureStatus).toBe("none");
    expect(view.result!.featureProfile).toBeNull();
  });

  it("bản ghi KV cũ (không có ba trường mới) đọc lên vẫn hợp lệ", async () => {
    const store = new MemorySessionStore();
    const created = await createSession(store);
    const rec = created.record;
    const conn = await connectSession(store, rec.sessionId);
    if (!conn.ok) return;
    const loaded = await store.get(rec.sessionId);
    // Mô phỏng bản ghi ghi từ trước Phase 1D-2.
    const legacy = { ...loaded!, status: "complete" as const, completedAt: Date.now() };
    delete (legacy as Record<string, unknown>).featureStatus;
    delete (legacy as Record<string, unknown>).featureProfile;
    delete (legacy as Record<string, unknown>).featureError;
    const view = publicView(legacy);
    expect(view.result!.featureStatus).toBe("none");
    expect(view.result!.featureProfile).toBeNull();
  });

  it("phiên chưa complete thì KHÔNG trả payload ở mỗi lần poll", async () => {
    const store = new MemorySessionStore();
    const created = await createSession(store);
    const view = publicView(created.record);
    expect(view.result).toBeNull();
    expect(JSON.stringify(view)).not.toContain("transportVersion");
  });

  it("payload của phiên khác bị từ chối ở tầng kiểm", () => {
    const foreign = payloadOf(SIX); // sessionId = SID
    const r = parsePhysiognomySessionFeaturePayload(JSON.parse(JSON.stringify(foreign)), {
      sessionId: "PHIENKHAC1",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("session_mismatch");
  });
});

// ──────────────────────────────────────────────── 8. tóm tắt đếm

describe("tóm tắt cho máy tính", () => {
  it("đếm đúng theo status và tổng khớp", () => {
    const p = payloadOf(SIX);
    const s = summarizeFeatures(p);
    expect(s.measured + s.lowConfidence + s.unsupported).toBe(s.total);
    expect(s.total).toBe(p.features.length);
    // Phase 1D-3 hạ 4 feature hình học → chỉ còn 3 trục tư thế.
    expect(s.measured).toBe(3);
    expect(s.unsupported).toBe(0);
  });

  it("chỉ đếm — không có chữ nào mang nghĩa tốt/xấu", () => {
    expect(Object.keys(summarizeFeatures(payloadOf(SIX))).sort()).toEqual([
      "lowConfidence", "measured", "total", "unsupported",
    ]);
  });
});

describe("hằng số", () => {
  it("transportVersion tách khỏi featureSchemaVersion", () => {
    expect(TRANSPORT_VERSION).toBe("physiognomy-session-feature-v1");
    expect(payloadOf(SIX).featureSchemaVersion).toBe("physiognomy-feature-v1");
    expect(TRANSPORT_VERSION).not.toBe(payloadOf(SIX).featureSchemaVersion);
  });
});
