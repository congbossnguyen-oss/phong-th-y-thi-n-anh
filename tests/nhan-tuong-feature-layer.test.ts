/**
 * Phase 1D — Feature Layer nhân tướng.
 *
 * Golden fixture là `tests/fixtures/canonical-face.json`: chính `canonical_face_model.obj`
 * của MediaPipe chiếu trực giao vào khung 1000×1000. Đây là MESH TEMPLATE, không phải
 * người thật — dùng làm REGRESSION FIXTURE (đổi code là số đổi, test đỏ), KHÔNG dùng để
 * khẳng định điều gì về người thật. Vì vậy mọi kỳ vọng đều là KHOẢNG, không phải số khớp
 * tuyệt đối.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildFeatureProfile,
  gradeQuality,
  type ViewObservation,
} from "../src/features/physiognomy/features/extract";
import {
  FEATURE_SCHEMA_VERSION,
  VIEW_NAMES,
  type MeasuredFeature,
  type PhysiognomyFeatureProfile,
} from "../src/features/physiognomy/features/schema";
import { LM, SPANS } from "../src/features/physiognomy/features/landmarks";
import { PALACE_REGIONS } from "../src/features/physiognomy/geometry/index";
import { YAW_SIGN_FOR_USER_LEFT, TURN_MIN_DEG } from "../src/features/physiognomy/session/steps";

// ───────────────────────────────────────────────────────────────── fixture

interface Fixture {
  frameWidth: number;
  frameHeight: number;
  landmarks: { x: number; y: number; z: number }[];
}
const FIX: Fixture = JSON.parse(
  readFileSync(join(import.meta.dirname, "fixtures", "canonical-face.json"), "utf-8"),
);

/** Quan sát mặc định: chính diện, chất lượng tốt. */
function obs(over: Partial<ViewObservation> = {}): ViewObservation {
  return {
    step: "front",
    landmarks: FIX.landmarks,
    frameWidth: FIX.frameWidth,
    frameHeight: FIX.frameHeight,
    pose: { yaw: 0, pitch: 0, roll: 0 },
    quality: { faceDetected: true, coverage: 0.6, brightness: 0.55, blur: 0.02 },
    ...over,
  };
}

function profileOf(observations: ViewObservation[] = [obs()]): PhysiognomyFeatureProfile {
  return buildFeatureProfile({ sessionId: "TEST123456", capturedAt: 1_700_000_000_000, observations });
}

/** Biến đổi landmark TRONG KHÔNG GIAN PIXEL rồi chuẩn hoá lại — khung vuông nên đẳng hướng. */
function transform(
  pts: Fixture["landmarks"],
  fn: (x: number, y: number) => [number, number],
): Fixture["landmarks"] {
  const W = FIX.frameWidth;
  const H = FIX.frameHeight;
  return pts.map((p) => {
    const [x, y] = fn(p.x * W, p.y * H);
    return { x: x / W, y: y / H, z: p.z };
  });
}

const rollDeg = (pts: Fixture["landmarks"], deg: number) => {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  const cx = FIX.frameWidth / 2;
  const cy = FIX.frameHeight / 2;
  return transform(pts, (x, y) => [
    cx + (x - cx) * c - (y - cy) * s,
    cy + (x - cx) * s + (y - cy) * c,
  ]);
};

/**
 * Phóng to/thu nhỏ khuôn mặt — phải scale CẢ z.
 *
 * Bước tới gần camera thì mặt to ra theo cả ba chiều, không phải chỉ x/y. Nếu chỉ
 * scale x/y thì hình dạng 3D bị bóp méo và Tam Đình (chiếu lên trục dọc của đầu, có
 * dùng z) sẽ đổi số — đó là lỗi của bộ sinh test, không phải của code.
 */
const scaleBy = (pts: Fixture["landmarks"], k: number) => {
  const cx = FIX.frameWidth / 2;
  const cy = FIX.frameHeight / 2;
  return transform(pts, (x, y) => [cx + (x - cx) * k, cy + (y - cy) * k]).map((p, i) => ({
    ...p,
    z: pts[i].z * k,
  }));
};

const shiftBy = (pts: Fixture["landmarks"], dx: number, dy: number) =>
  transform(pts, (x, y) => [x + dx, y + dy]);

/** Duyệt mọi MeasuredFeature trong profile. */
function allFeatures(p: PhysiognomyFeatureProfile): MeasuredFeature[] {
  const out: MeasuredFeature[] = [];
  const walk = (v: unknown) => {
    if (v === null || typeof v !== "object") return;
    const o = v as Record<string, unknown>;
    if (typeof o.key === "string" && typeof o.status === "string" && "value" in o) {
      out.push(o as unknown as MeasuredFeature);
      return;
    }
    for (const x of Object.values(o)) walk(x);
  };
  walk(p.geometry);
  walk(p.faceShape);
  walk(p.threeCourts);
  walk(p.fiveOfficials);
  walk(p.pose);
  return out;
}

// ─────────────────────────────────────────────────────────── schema tổng

describe("schema profile", () => {
  const p = profileOf();

  it("có version riêng ngay từ đầu", () => {
    expect(p.schemaVersion).toBe("physiognomy-feature-v1");
    expect(FEATURE_SCHEMA_VERSION).toBe("physiognomy-feature-v1");
  });

  it("có đủ các nhóm theo taxonomy", () => {
    for (const k of [
      "geometry", "faceShape", "threeCourts", "fiveOfficials",
      "twelvePalaces", "pose", "quality", "unsupported", "views",
    ] as const) {
      expect(p, `thiếu nhóm ${k}`).toHaveProperty(k);
    }
  });

  it("liệt kê đủ 6 view, view không thu được thì present = false", () => {
    expect(Object.keys(p.views).sort()).toEqual([...VIEW_NAMES].sort());
    expect(p.views.front.present).toBe(true);
    expect(p.views.left.present).toBe(false);
    expect(p.views.left.quality).toBe("invalid");
  });

  it("mang cảnh báo nói rõ đây KHÔNG phải luận giải", () => {
    expect(p.notices.join(" ")).toContain("TẦNG ĐO LƯỜNG");
    expect(p.notices.join(" ")).toContain("chưa được xây dựng");
  });
});

// ────────────────────────────────────────────────────────────── geometry

describe("geometry + chuẩn hoá", () => {
  it("face_shape_ratio khớp canonical (cao/rộng ≈ 1.1525)", () => {
    const v = profileOf().geometry.face_shape_ratio.value!;
    expect(v).toBeGreaterThan(1.13);
    expect(v).toBeLessThan(1.18);
  });

  it("phóng to/thu nhỏ KHÔNG đổi tỉ lệ — không có ngưỡng pixel tuyệt đối nào", () => {
    const base = profileOf();
    for (const k of [0.55, 1.4]) {
      const scaled = profileOf([obs({ landmarks: scaleBy(FIX.landmarks, k) })]);
      for (const f of allFeatures(base)) {
        if (f.value === null) continue;
        // face_width/face_height chuẩn hoá theo KHUNG HÌNH nên phải đổi theo k — đúng ý đồ.
        if (f.key === "face.geometry.face_width" || f.key === "face.geometry.face_height") continue;
        if (f.unit === "degrees") continue;
        const now = allFeatures(scaled).find((g) => g.key === f.key)!.value!;
        expect(now, `${f.key} đổi khi phóng to ${k}×`).toBeCloseTo(f.value, 3);
      }
    }
  });

  it("dịch khuôn mặt trong khung KHÔNG đổi bất kỳ tỉ lệ nào", () => {
    const base = profileOf();
    const moved = profileOf([obs({ landmarks: shiftBy(FIX.landmarks, 90, -60) })]);
    for (const f of allFeatures(base)) {
      if (f.value === null) continue;
      const now = allFeatures(moved).find((g) => g.key === f.key)!.value!;
      expect(now, `${f.key} đổi khi dịch khuôn mặt`).toBeCloseTo(f.value, 3);
    }
  });

  it("face_width và face_height KHÔNG trùng nhau (mẫu số khác nhau)", () => {
    const g = profileOf().geometry;
    expect(g.face_width.value).not.toBeCloseTo(g.face_shape_ratio.value!, 3);
    expect(g.face_height.value).not.toBeCloseTo(g.face_shape_ratio.value!, 3);
  });

  it("mỗi feature khoảng cách đều khai báo mẫu số, không tự chọn", () => {
    for (const f of allFeatures(profileOf())) {
      expect(f.normalizedBy, `${f.key} thiếu normalizedBy`).toBeTruthy();
    }
    for (const [name, s] of Object.entries(SPANS)) {
      expect(["faceWidth", "faceHeight"], `span ${name}`).toContain(s.normalizedBy);
    }
  });

  it("dáng mặt: jaw/cheek/chin nằm trong khoảng hợp lý của canonical", () => {
    const s = profileOf().faceShape;
    expect(s.jaw_to_face_width.value!).toBeGreaterThan(0.70);
    expect(s.jaw_to_face_width.value!).toBeLessThan(0.85);
    expect(s.cheek_to_face_width.value!).toBeGreaterThan(0.78);
    expect(s.cheek_to_face_width.value!).toBeLessThan(0.90);
    expect(s.chin_to_face_height.value!).toBeGreaterThan(0.18);
    expect(s.chin_to_face_height.value!).toBeLessThan(0.30);
  });

  it("dáng mặt chưa đủ cơ sở thì để low_confidence, không ép thành phân loại", () => {
    const s = profileOf().faceShape;
    for (const f of [s.jaw_to_face_width, s.cheek_to_face_width, s.chin_to_face_height]) {
      expect(f.status).toBe("low_confidence");
      expect(f.note, `${f.key} thiếu note`).toBeTruthy();
    }
  });
});

// ────────────────────────────────────────────────────────────── ngũ quan

describe("ngũ quan — mắt", () => {
  const e = profileOf().fiveOfficials.eyes;

  it("khoảng cách hai khoé mắt trong: bền nhất nhóm nhưng ĐÃ HẠ ở Phase 1D-3", () => {
    // Đo lại trên ảnh người thật: bền với crop/thu phóng/độ sáng, nhưng hai lần chụp
    // khác cự ly cùng qua cổng chính diện vẫn lệch 7.56% — vượt ngưỡng 5%.
    expect(e.interocular_distance.status).toBe("low_confidence");
    expect(e.interocular_distance.note).toContain("7.56%");
    expect(e.interocular_distance.value!).toBeGreaterThan(0.22);
    expect(e.interocular_distance.value!).toBeLessThan(0.27);
  });

  it("mặt đối xứng thì hai mắt ra số bằng nhau", () => {
    expect(e.left_width.value!).toBeCloseTo(e.right_width.value!, 4);
    expect(e.left_height.value!).toBeCloseTo(e.right_height.value!, 4);
    expect(e.left_tilt.value!).toBeCloseTo(e.right_tilt.value!, 3);
  });

  it("chiều cao mắt là độ mở mí, phải nói rõ ràng chuyện chớp mắt", () => {
    expect(e.left_height.status).toBe("low_confidence");
    expect(e.left_height.note).toContain("ĐỘ MỞ MÍ");
    expect(e.left_height.note).toContain("Chớp mắt");
  });

  it("độ nghiêng khe mắt BẤT BIẾN với nghiêng đầu — đo so với trục liên mắt", () => {
    const base = profileOf().fiveOfficials.eyes.left_tilt.value!;
    for (const deg of [-25, -10, 10, 25]) {
      const t = profileOf([obs({ landmarks: rollDeg(FIX.landmarks, deg) })])
        .fiveOfficials.eyes.left_tilt.value!;
      expect(t, `tilt đổi khi roll ${deg}°`).toBeCloseTo(base, 2);
    }
  });

  it("các tỉ lệ khác cũng bất biến với roll (dùng euclidean, không dùng hiệu một trục)", () => {
    const base = profileOf();
    const rolled = profileOf([obs({ landmarks: rollDeg(FIX.landmarks, 20) })]);
    for (const f of allFeatures(base)) {
      if (f.value === null || f.unit === "degrees") continue;
      const now = allFeatures(rolled).find((g) => g.key === f.key)!.value!;
      expect(now, `${f.key} đổi khi nghiêng đầu 20°`).toBeCloseTo(f.value, 2);
    }
  });
});

describe("ngũ quan — mày, mũi, miệng, tai", () => {
  const f = profileOf().fiveOfficials;

  it("lông mày: có số nhưng phải nói rõ landmark không thấy sợi lông", () => {
    for (const b of [f.eyebrows.left_length, f.eyebrows.right_length, f.eyebrows.spacing]) {
      expect(b.status).toBe("low_confidence");
      expect(b.note).toContain("KHÔNG thấy sợi lông mày");
    }
    expect(f.eyebrows.left_length.value!).toBeCloseTo(f.eyebrows.right_length.value!, 4);
  });

  it("mũi: length/width/bridge_ratio đều có số, đều low_confidence", () => {
    expect(f.nose.length.value!).toBeGreaterThan(0.24);
    expect(f.nose.length.value!).toBeLessThan(0.32);
    expect(f.nose.width.value!).toBeGreaterThan(0.18);
    expect(f.nose.width.value!).toBeLessThan(0.24);
    expect(f.nose.bridge_ratio.value!).toBeGreaterThan(0.40);
    expect(f.nose.bridge_ratio.value!).toBeLessThan(0.55);
    for (const n of [f.nose.length, f.nose.width, f.nose.bridge_ratio]) {
      expect(n.status).toBe("low_confidence");
    }
  });

  it("bridge_ratio tự chuẩn hoá trong cùng cái mũi", () => {
    expect(f.nose.bridge_ratio.normalizedBy).toBe("noseWidth");
    expect(f.nose.bridge_ratio.method).toContain("alaL,alaR");
  });

  it("miệng: rộng và cao đều có số", () => {
    expect(f.mouth.width.value!).toBeGreaterThan(0.28);
    expect(f.mouth.width.value!).toBeLessThan(0.36);
    expect(f.mouth.height.value!).toBeGreaterThan(0.10);
    expect(f.mouth.height.value!).toBeLessThan(0.17);
  });

  it("TAI: unsupported, và nói rõ là giới hạn model chứ không phải chưa làm", () => {
    expect(f.ears.status).toBe("unsupported");
    expect(f.ears.reason).toContain("KHÔNG có landmark nào trên vành tai");
    expect(f.ears.reason).toContain("không phải phần chưa làm");
    expect(f.ears).not.toHaveProperty("value");
  });
});

// ─────────────────────────────────────────────────────────────── tam đình

describe("tam đình", () => {
  const t = profileOf().threeCourts;

  it("dùng công thức trục đầu 3D, không dùng hiệu toạ độ ảnh", () => {
    expect(t.method).toBe("headAxis3d");
    expect(t.middle.method).toContain("headAxis3d");
  });

  it("ba đình cộng lại bằng 1", () => {
    expect(t.upper.value! + t.middle.value! + t.lower.value!).toBeCloseTo(1, 3);
  });

  it("KHÔNG được có hai đình bằng nhau y hệt (lỗi kinh điển của bản port cũ)", () => {
    expect(t.upper.value).not.toBe(t.middle.value);
    expect(t.middle.value).not.toBe(t.lower.value);
  });

  it("cả ba đình đều low_confidence sau Phase 1D-3", () => {
    // Trung đình vẫn là chỉ số hình học BỀN NHẤT, nhưng mẫu bằng chứng mới có 1 người
    // / 2 lần chụp hợp lệ — chưa đủ để gọi là đo được.
    expect(t.middle.status).toBe("low_confidence");
    expect(t.middle.note).toContain("1 người");
    expect(t.upper.status).toBe("low_confidence");
    expect(t.lower.status).toBe("low_confidence");
    // và vẫn phải hơn hẳn hai đình kia về độ tin
    expect(t.middle.confidence).toBeGreaterThan(t.upper.confidence);
    expect(t.middle.confidence).toBeGreaterThan(t.lower.confidence);
  });

  it("KHÔNG feature hình học nào còn là measured — chỉ tư thế mới được", () => {
    const p = profileOf();
    for (const f of allFeatures(p)) {
      if (f.status !== "measured") continue;
      expect(f.key, `${f.key} không được phép là measured`).toMatch(/^face\.pose\./);
    }
  });

  it("thượng đình phải ghi rõ đỉnh lưới KHÔNG phải chân tóc", () => {
    expect(t.upper.note).toContain("KHÔNG phải chân tóc");
    expect(t.upper.note).toContain("46%");
    // Canonical cho ~0.179 thay vì 0.333 — chính là bằng chứng của lệch hệ thống.
    expect(t.upper.value!).toBeLessThan(0.25);
  });

  it("hạ đình phải ghi rõ đỉnh cằm trôi khi chúc/ngẩng", () => {
    expect(t.lower.note).toContain("xa trục quay nhất");
  });
});

// ──────────────────────────────────────────────────────── thập nhị cung

describe("thập nhị cung", () => {
  const p = profileOf().twelvePalaces;

  it("có đủ 12 cung", () => {
    expect(Object.keys(p)).toHaveLength(12);
  });

  it("11 cung mapping verified, riêng Nô Bộc là unknown", () => {
    const verified = Object.values(p).filter((x) => x.mappingStatus === "verified");
    expect(verified).toHaveLength(11);
    expect(p.noBoc.mappingStatus).toBe("unknown");
  });

  it("mapping confidence TÁCH RIÊNG measurement confidence", () => {
    // Bản đồ đúng nhưng vẫn không đo được — đúng là hai chuyện khác nhau.
    expect(p.menh.mappingStatus).toBe("verified");
    expect(p.menh.measurementStatus).toBe("unsupported");
    for (const x of Object.values(p)) expect(x.measurementStatus).toBe("unsupported");
  });

  it("Nô Bộc không có region và không cố đo", () => {
    expect(p.noBoc.region).toBeNull();
    expect(p.noBoc.features).toEqual({});
    expect(p.noBoc.note).toContain("z-spread");
  });

  it("cung verified vẫn kèm landmark để kiểm chứng lại được", () => {
    expect(p.phuThe.region!.landmarks.length).toBeGreaterThanOrEqual(4);
    expect(p.phuThe.region!.landmarks).toEqual([
      ...PALACE_REGIONS.phuThe.left, ...PALACE_REGIONS.phuThe.right!,
    ]);
  });

  it("không cung nào có feature số nào", () => {
    for (const x of Object.values(p)) expect(Object.keys(x.features)).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────── pose

describe("pose", () => {
  it("yaw/pitch/roll đi ra đúng số đã đo", () => {
    const p = profileOf([obs({ pose: { yaw: 3.2, pitch: -1.5, roll: 0.8 } })]).pose;
    expect(p.yaw.value).toBeCloseTo(3.2, 4);
    expect(p.pitch.value).toBeCloseTo(-1.5, 4);
    expect(p.roll.value).toBeCloseTo(0.8, 4);
    expect(p.yaw.unit).toBe("degrees");
  });

  it("thiếu số thì null và unsupported, KHÔNG phải 0", () => {
    const p = profileOf([obs({ pose: { yaw: null, pitch: null, roll: null } })]).pose;
    for (const f of [p.yaw, p.pitch, p.roll]) {
      expect(f.value).toBeNull();
      expect(f.status).toBe("unsupported");
    }
  });

  it("pose nói rõ không phải đặc điểm nhân tướng", () => {
    expect(profileOf().pose.yaw.note).toContain("không phải đặc điểm nhân tướng");
  });

  it("KHÔNG đụng quy ước dấu và ngưỡng của Phase 1C", () => {
    expect(YAW_SIGN_FOR_USER_LEFT).toBe(1);
    expect(TURN_MIN_DEG).toBe(20);
  });

  it("ma trận đọc theo THỨ TỰ CỘT — khoá lại phát hiện của Phase 1B", () => {
    expect(profileOf().pose.yaw.method).toContain("column_major");
  });
});

// ────────────────────────────────────────────────────────────── quality

describe("quality", () => {
  it("không thấy mặt → invalid", () => {
    const g = gradeQuality("front", obs({ quality: { faceDetected: false, coverage: null, brightness: null, blur: null } }));
    expect(g.grade).toBe("invalid");
  });

  it("ảnh mờ / tối / quá sáng → poor, kèm lý do cụ thể", () => {
    expect(gradeQuality("front", obs({ quality: { faceDetected: true, coverage: 0.6, brightness: 0.55, blur: 0.0001 } })).reasons)
      .toContain("Ảnh mờ");
    expect(gradeQuality("front", obs({ quality: { faceDetected: true, coverage: 0.6, brightness: 0.05, blur: 0.02 } })).reasons)
      .toContain("Ảnh tối");
    expect(gradeQuality("front", obs({ quality: { faceDetected: true, coverage: 0.6, brightness: 0.99, blur: 0.02 } })).reasons)
      .toContain("Ảnh quá sáng");
  });

  it("cổng pose phụ thuộc view: quay trái thì yaw LỚN mới đạt", () => {
    const turned = { yaw: 30, pitch: 0, roll: 0 };
    expect(gradeQuality("left", obs({ step: "left", pose: turned })).poseValid).toBe(true);
    expect(gradeQuality("front", obs({ pose: turned })).poseValid).toBe(false);
    expect(gradeQuality("left", obs({ step: "left", pose: { yaw: 2, pitch: 0, roll: 0 } })).poseValid).toBe(false);
  });

  it("bước sát mặt đòi coverage cao hơn", () => {
    const q = { faceDetected: true, coverage: 0.4, brightness: 0.55, blur: 0.02 };
    expect(gradeQuality("near", obs({ step: "near", quality: q })).distanceValid).toBe(false);
    expect(gradeQuality("front", obs({ quality: q })).distanceValid).toBe(true);
  });

  it("pose ngay ngắn + ảnh nét + sáng vừa → excellent", () => {
    expect(gradeQuality("front", obs()).grade).toBe("excellent");
  });

  it("pose còn trong ngưỡng nhưng lệch nhiều → good, không phải excellent", () => {
    expect(gradeQuality("front", obs({ pose: { yaw: 7, pitch: 0, roll: 0 } })).grade).toBe("good");
  });

  it("5 mức đều dùng được và KHÔNG có chữ 'accurate'", () => {
    const p = profileOf();
    expect(["excellent", "good", "usable", "poor", "invalid"]).toContain(p.quality.overall);
    expect(JSON.stringify(p).toLowerCase()).not.toContain("accurate");
  });

  it("thiếu view thì ghi rõ thiếu view nào", () => {
    expect(profileOf().quality.reasons.join(" ")).toContain("Thiếu view");
  });
});

// ──────────────────────────────────────────────────── hợp nhất nhiều view

describe("hợp nhất nhiều view", () => {
  const six: ViewObservation[] = [
    obs(),
    obs({ step: "left", pose: { yaw: 30, pitch: 0, roll: 0 } }),
    obs({ step: "right", pose: { yaw: -30, pitch: 0, roll: 0 } }),
    obs({ step: "near", quality: { faceDetected: true, coverage: 0.7, brightness: 0.55, blur: 0.02 } }),
    obs({ step: "pitch_down", pose: { yaw: 0, pitch: 25, roll: 0 } }),
    obs({ step: "pitch_up", pose: { yaw: 0, pitch: -25, roll: 0 } }),
  ];

  it("đủ 6 view thì cả 6 đều present", () => {
    const p = profileOf(six);
    for (const v of VIEW_NAMES) expect(p.views[v].present, v).toBe(true);
    expect(p.quality.reasons.join(" ")).not.toContain("Thiếu view");
  });

  it("KHÔNG trung bình mù — mọi feature hình học đều đến từ ĐÚNG MỘT view", () => {
    const p = profileOf(six);
    const views = new Set(allFeatures(p).filter((f) => f.value !== null).map((f) => f.sourceView));
    expect(views.size).toBe(1);
    expect([...views][0]).toBe("front");
  });

  it("view quay/chúc/ngẩng KHÔNG cấp số hình học nào", () => {
    const p = profileOf(six);
    for (const v of ["left", "right", "pitchDown", "pitchUp"] as const) {
      expect(p.views[v].contributedFeatures, v).toHaveLength(0);
    }
    expect(p.views.front.contributedFeatures.length).toBeGreaterThan(10);
  });

  it("mất view chính diện thì lùi về view sát mặt, và ghi đúng nguồn", () => {
    const p = profileOf(six.filter((o) => o.step !== "front"));
    expect(p.geometry.face_shape_ratio.sourceView).toBe("near");
    expect(p.views.near.contributedFeatures.length).toBeGreaterThan(10);
  });

  it("không có view nào đủ chất lượng → mọi feature null + unsupported, KHÔNG phải 0", () => {
    const p = profileOf([obs({ quality: { faceDetected: true, coverage: 0.6, brightness: 0.55, blur: 0.00001 } })]);
    for (const f of allFeatures(p)) {
      if (f.key.startsWith("face.pose.")) continue; // pose vẫn có số đo thô
      expect(f.value, `${f.key} phải null`).toBeNull();
      expect(f.status, f.key).toBe("unsupported");
    }
  });

  it("không có quan sát nào cũng không nổ", () => {
    const p = profileOf([]);
    expect(p.quality.overall).toBe("invalid");
    expect(p.geometry.face_shape_ratio.value).toBeNull();
  });
});

// ────────────────────────────────────────────────────── evidence + kỷ luật

describe("evidence — truy vết được về dữ liệu gốc", () => {
  const p = profileOf();

  it("mọi feature có số đều đủ key/method/sourceView/sourceLandmarks/confidence/status", () => {
    for (const f of allFeatures(p)) {
      if (f.value === null) continue;
      expect(f.key, "key").toMatch(/^face\.[a-z_]+\.[a-z_]+$/);
      expect(f.method, `${f.key}.method`).toBeTruthy();
      expect(f.status, `${f.key}.status`).toBeTruthy();
      expect(f.confidence, `${f.key}.confidence`).toBeGreaterThan(0);
      expect(f.confidence, `${f.key}.confidence`).toBeLessThanOrEqual(1);
      expect(f.sourceView, `${f.key}.sourceView`).toBeTruthy();
      if (f.key.startsWith("face.pose.")) continue; // pose không đến từ landmark nào
      expect(f.sourceLandmarks.length, `${f.key}.sourceLandmarks`).toBeGreaterThanOrEqual(2);
    }
  });

  it("sourceLandmarks đều là index hợp lệ của lưới 468 điểm", () => {
    for (const f of allFeatures(p)) {
      for (const i of f.sourceLandmarks) {
        expect(Number.isInteger(i)).toBe(true);
        expect(i).toBeGreaterThanOrEqual(0);
        expect(i).toBeLessThan(468);
      }
    }
  });

  it("khoá máy toàn tiếng Anh snake_case, không có tiếng Việt", () => {
    for (const f of allFeatures(p)) expect(f.key).toMatch(/^[a-z0-9._]+$/);
  });

  it("index landmark chỉ khai ở MỘT nơi — extract.ts không có index trần", () => {
    const src = readFileSync(
      join(import.meta.dirname, "..", "src", "features", "physiognomy", "features", "extract.ts"),
      "utf-8",
    );
    // Cho phép các hằng kỹ thuật (0, 1, 2, 3, 4, 468, 180, 100...) nhưng không cho
    // lấy landmark theo chỉ số trần kiểu lm[133].
    expect(src).not.toMatch(/\blm\[\s*\d+\s*\]/);
    expect(src).not.toMatch(/landmarks\[\s*\d+\s*\]/);
  });

  it("mọi tên landmark dùng trong SPANS đều có trong LM", () => {
    for (const s of Object.values(SPANS)) {
      expect(LM, s.from).toHaveProperty(s.from);
      expect(LM, s.to).toHaveProperty(s.to);
    }
  });
});

describe("kỷ luật — unsupported và những gì KHÔNG được có", () => {
  const p = profileOf();

  it("unsupported KHÔNG BAO GIỜ tự biến thành 0", () => {
    for (const f of allFeatures(p)) {
      if (f.status === "unsupported") expect(f.value, f.key).toBeNull();
      if (f.value === null) expect(f.status, f.key).toBe("unsupported");
    }
  });

  it("status khác measured thì BẮT BUỘC có note", () => {
    for (const f of allFeatures(p)) {
      if (f.status !== "measured") expect(f.note, `${f.key} thiếu note`).toBeTruthy();
    }
  });

  it("danh sách unsupported liệt kê đủ tai và 12 cung", () => {
    expect(p.unsupported).toContain("face.five_officials.ears");
    for (const name of Object.keys(PALACE_REGIONS)) {
      expect(p.unsupported).toContain(`face.palaces.${name}`);
    }
  });

  it("KHÔNG có bất kỳ feature độ đầy đặn / độ sâu nào", () => {
    const cam = ["fullness", "depth", "concave", "convex", "protrusion", "sunken", "prominence"];
    const keys: string[] = [];
    const walk = (v: unknown) => {
      if (v === null || typeof v !== "object") return;
      if (Array.isArray(v)) return v.forEach(walk);
      for (const [k, x] of Object.entries(v)) { keys.push(k); walk(x); }
    };
    walk(p);
    for (const k of keys) {
      for (const bad of cam) {
        expect(k.toLowerCase(), `khoá "${k}" chứa "${bad}"`).not.toContain(bad);
      }
    }
    for (const f of allFeatures(p)) {
      expect(f.method.toLowerCase()).not.toContain("z_");
      expect(f.method.toLowerCase()).not.toContain("fullness");
    }
  });

  it("KHÔNG có phân loại tốt/xấu/cát/hung ở bất kỳ đâu", () => {
    // Quét KHOÁ và GIÁ TRỊ CHUỖI, nhưng BỎ QUA các trường giải thích: `note`/`reason`/
    // `notices` được phép nhắc "không mang nghĩa tướng tốt/xấu" — đó chính là câu phủ
    // định cần có. Cấm chuỗi trong văn bản giải thích là cấm nhầm chỗ.
    const cam = [
      "auspicious", "inauspicious", "wealthy", "unlucky", "lucky", "fortune",
      "destiny", "personality", "face_type", "eye_type", "nose_type",
      "tướng tốt", "tướng xấu", "phú quý", "bần hàn", "cát hung", "丰隆", "低陷",
    ];
    const SKIP = new Set(["note", "reason", "notices"]);
    const hay: string[] = [];
    const walk = (v: unknown) => {
      if (v === null) return;
      if (Array.isArray(v)) return v.forEach(walk);
      if (typeof v === "string") return void hay.push(v);
      if (typeof v !== "object") return;
      for (const [k, x] of Object.entries(v)) {
        hay.push(k);
        if (!SKIP.has(k)) walk(x);
      }
    };
    walk(p);
    const low = hay.join(" | ").toLowerCase();
    for (const bad of cam) expect(low, `xuất hiện "${bad}"`).not.toContain(bad.toLowerCase());
  });

  it("KHÔNG có trường good/bad ở bất kỳ khoá nào", () => {
    const keys: string[] = [];
    const walk = (v: unknown) => {
      if (v === null || typeof v !== "object") return;
      if (Array.isArray(v)) return v.forEach(walk);
      for (const [k, x] of Object.entries(v)) { keys.push(k.toLowerCase()); walk(x); }
    };
    walk(p);
    for (const k of keys) {
      expect(["good", "bad", "score", "rating", "grade"], `khoá "${k}"`).not.toContain(k);
    }
  });
});

// ──────────────────────────────────────────────────────── golden fixture

describe("golden fixture — regression", () => {
  /**
   * Khoảng kỳ vọng, KHÔNG phải giá trị pixel cứng. Mục đích: đổi công thức hay đổi
   * landmark index thì test đỏ; đổi độ phân giải hay vị trí khuôn mặt thì test vẫn xanh.
   */
  const RANGES: Record<string, [number, number]> = {
    "face.geometry.face_shape_ratio": [1.10, 1.21],
    "face.shape.jaw_to_face_width": [0.74, 0.81],
    "face.shape.cheek_to_face_width": [0.80, 0.89],
    "face.shape.chin_to_face_height": [0.21, 0.25],
    "face.eyes.interocular_distance": [0.23, 0.26],
    "face.eyes.left_width": [0.16, 0.18],
    "face.eyes.left_height": [0.038, 0.050],
    "face.eyebrows.left_length": [0.25, 0.28],
    "face.eyebrows.spacing": [0.15, 0.17],
    "face.eyebrows.left_height": [0.17, 0.20],
    "face.nose.length": [0.23, 0.27],
    "face.nose.width": [0.20, 0.22],
    "face.nose.bridge_ratio": [0.45, 0.51],
    "face.mouth.width": [0.30, 0.34],
    "face.mouth.height": [0.12, 0.14],
    "face.three_courts.upper": [0.16, 0.20],
    "face.three_courts.middle": [0.38, 0.43],
    "face.three_courts.lower": [0.39, 0.44],
  };

  const p = profileOf();
  const byKey = new Map(allFeatures(p).map((f) => [f.key, f]));

  for (const [key, [lo, hi]] of Object.entries(RANGES)) {
    it(`${key} nằm trong [${lo}, ${hi}]`, () => {
      const f = byKey.get(key);
      expect(f, `thiếu feature ${key}`).toBeDefined();
      expect(f!.value, key).not.toBeNull();
      expect(f!.value!, key).toBeGreaterThanOrEqual(lo);
      expect(f!.value!, key).toBeLessThanOrEqual(hi);
    });
  }

  it("fixture đúng 468 điểm và khung vuông (đẳng hướng, xoay được)", () => {
    expect(FIX.landmarks).toHaveLength(468);
    expect(FIX.frameWidth).toBe(FIX.frameHeight);
  });
});
