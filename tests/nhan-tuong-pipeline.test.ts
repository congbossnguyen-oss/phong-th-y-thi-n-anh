/**
 * Kiến trúc đầu-cuối: FeatureProfile → MeasurementContract → EligibilityGate
 *                   → RuleEngine → EvidenceBundle → Interpretation
 *
 * Điều quan trọng nhất mà bộ test này phải chứng minh: **fixture KHÔNG làm cho feature
 * nào trở thành validated, và không gì đi tới được tầng luận giải.**
 *
 * Luật/nguồn giả lập chỉ tồn tại TRONG tệp test, để kiểm engine khi mọi cổng đều mở.
 * Kho thật (`PHYSIOGNOMY_RULES`, `KNOWLEDGE_SOURCES`) không được chứa tri thức bịa.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildFeatureProfile, type ViewObservation } from "../src/features/physiognomy/features/extract";
import { runPhysiognomyPipeline } from "../src/features/physiognomy/pipeline";
import {
  buildReliability,
  EVIDENCE_LEVELS,
  evidenceRank,
  type FeatureReliability,
} from "../src/features/physiognomy/measurement-contract/reliability";
import {
  evaluateEligibility,
  NGUONG,
  POLICY_VERSION,
} from "../src/features/physiognomy/measurement-contract/policy";
import { KNOWLEDGE_SOURCES, isUsableSource } from "../src/knowledge/physiognomy/source";
import { PHYSIOGNOMY_RULES, isRunnable, type PhysiognomyRule } from "../src/rules/physiognomy/rule";
import { evaluate } from "../src/rules/physiognomy/engine";
import { REFUSING_PROVIDER } from "../src/interpretation/physiognomy/index";

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

const profile = () =>
  buildFeatureProfile({ sessionId: "PIPE123456", capturedAt: 1_700_000_000_000, observations: [obs()] });

// ─────────────────────────────────────────── hợp đồng đo

describe("hợp đồng đo", () => {
  const rel = buildReliability([
    { key: "face.three_courts.middle", status: "low_confidence", confidence: 0.7 },
    { key: "face.pose.yaw", status: "measured", confidence: 0.9 },
    { key: "face.nose.bridge_ratio", status: "low_confidence", confidence: 0.5 },
  ]);

  it("lấy measurementStatus TỪ Feature Layer, không chép tay", () => {
    expect(rel["face.three_courts.middle"].measurementStatus).toBe("low_confidence");
    expect(rel["face.pose.yaw"].measurementStatus).toBe("measured");
  });

  it("feature chưa kiểm người thật → synthetic + unvalidated", () => {
    expect(rel["face.nose.bridge_ratio"].evidenceLevel).toBe("synthetic");
    expect(rel["face.nose.bridge_ratio"].validationStatus).toBe("unvalidated");
    expect(rel["face.nose.bridge_ratio"].participantCount).toBe(0);
  });

  it("feature đã kiểm ảnh thật → real_image, nhưng vẫn 1 người / 1 máy", () => {
    const m = rel["face.three_courts.middle"];
    expect(m.evidenceLevel).toBe("real_image");
    expect(m.validationStatus).toBe("provisional");
    expect(m.participantCount).toBe(1);
    expect(m.deviceCount).toBe(1);
    expect(m.lastValidatedAt).toBe("2026-09-25");
  });

  it("KHÔNG feature nào đạt validated", () => {
    for (const r of Object.values(rel)) expect(r.validationStatus).not.toBe("validated");
  });

  it("thang bằng chứng xếp đúng thứ tự", () => {
    expect(evidenceRank("synthetic")).toBeLessThan(evidenceRank("real_image"));
    expect(evidenceRank("real_image")).toBeLessThan(evidenceRank("real_device"));
    expect(evidenceRank("multi_person")).toBeLessThan(evidenceRank("multi_device"));
    expect(EVIDENCE_LEVELS).toHaveLength(6);
  });
});

// ─────────────────────────────────────────── cổng tư cách

describe("cổng tư cách luận giải", () => {
  const duTieuChuan: FeatureReliability = {
    featureKey: "x.y.z",
    measurementStatus: "measured",
    validationStatus: "validated",
    confidence: 0.95,
    evidenceLevel: "multi_device",
    sampleCount: 15,
    participantCount: 5,
    deviceCount: 2,
    distanceTested: true,
    poseTested: true,
    lightingTested: true,
    knownLimitations: [],
    lastValidatedAt: "2026-09-26",
    schemaVersion: "physiognomy-reliability-v1",
  };

  it("đủ mọi điều kiện + có nguồn → đủ tư cách", () => {
    const v = evaluateEligibility(duTieuChuan, true);
    expect(v.eligible).toBe(true);
    expect(v.reasons).toEqual([]);
    expect(v.policyVersion).toBe(POLICY_VERSION);
  });

  it("thiếu nguồn xác minh → TỪ CHỐI, dù đo hoàn hảo", () => {
    const v = evaluateEligibility(duTieuChuan, false);
    expect(v.eligible).toBe(false);
    expect(v.reasons).toContain("no_verified_source");
  });

  it("low_confidence → TỪ CHỐI", () => {
    const v = evaluateEligibility({ ...duTieuChuan, measurementStatus: "low_confidence" }, true);
    expect(v.eligible).toBe(false);
    expect(v.reasons).toContain("measurement_not_measured");
  });

  it("unsupported → TỪ CHỐI", () => {
    const v = evaluateEligibility({ ...duTieuChuan, measurementStatus: "unsupported" }, true);
    expect(v.eligible).toBe(false);
  });

  it("measured + provisional → TỪ CHỐI", () => {
    const v = evaluateEligibility({ ...duTieuChuan, validationStatus: "provisional" }, true);
    expect(v.eligible).toBe(false);
    expect(v.reasons).toContain("validation_not_validated");
  });

  it("không đủ người / máy / lượt → TỪ CHỐI, kèm đủ lý do", () => {
    const v = evaluateEligibility(
      { ...duTieuChuan, participantCount: 1, deviceCount: 1, sampleCount: 6 },
      true,
    );
    expect(v.reasons).toEqual(
      expect.arrayContaining(["not_enough_participants", "not_enough_devices", "not_enough_samples"]),
    );
  });

  it("chưa kiểm cự ly / tư thế / ánh sáng → TỪ CHỐI", () => {
    const v = evaluateEligibility(
      { ...duTieuChuan, distanceTested: false, poseTested: false, lightingTested: false },
      true,
    );
    expect(v.reasons).toEqual(
      expect.arrayContaining(["distance_not_tested", "pose_not_tested", "lighting_not_tested"]),
    );
  });

  it("liệt kê ĐỦ lý do, không dừng ở lý do đầu tiên", () => {
    const v = evaluateEligibility(
      { ...duTieuChuan, measurementStatus: "unsupported", validationStatus: "unvalidated", participantCount: 0 },
      false,
    );
    expect(v.reasons.length).toBeGreaterThanOrEqual(4);
  });

  it("ngưỡng khớp tài liệu validation §7", () => {
    expect(NGUONG.soNguoiToiThieu).toBe(5);
    expect(NGUONG.soLuotMoiNguoiToiThieu).toBe(3);
    expect(NGUONG.soMayToiThieu).toBe(2);
  });
});

// ─────────────────────────────────────────── kho tri thức

describe("kho nguồn — KHÔNG được bịa", () => {
  it("registry RỖNG", () => {
    expect(Object.keys(KNOWLEDGE_SOURCES)).toHaveLength(0);
  });

  it("nguồn chưa xác minh hoặc thiếu locator đều KHÔNG dùng được", () => {
    // Nguồn giả lập ĐỦ danh tính, để test chỉ soi đúng một biến mỗi lần.
    const base = {
      sourceId: "S1", title: "T", author: null, era: null, tradition: null, edition: null,
      publisher: null, year: null, locatorPolicy: "page" as const,
      text: "", language: "zh" as const, provenance: "kho test", citation: "T, tr.1",
      evidenceRef: "test://fixture", schemaVersion: "physiognomy-knowledge-v1" as const,
    };
    expect(isUsableSource({ ...base, locator: { page: "1" }, verificationStatus: "unverified" })).toBe(false);
    expect(isUsableSource({ ...base, locator: {}, verificationStatus: "verified" })).toBe(false);
    expect(isUsableSource({ ...base, locator: { page: "1" }, verificationStatus: "disputed" })).toBe(false);
    // Đầy đủ mọi thứ, NHƯNG không có resolver hiện vật → vẫn KHÔNG dùng được.
    // Đây là fail-closed có chủ đích: xem `NO_EVIDENCE_RESOLVER`.
    expect(isUsableSource({ ...base, locator: { page: "1" }, verificationStatus: "verified" })).toBe(false);
    expect(isUsableSource(null)).toBe(false);
  });
});

describe("kho luật — chỉ một luật nháp, không ngưỡng, không nguồn", () => {
  it("mọi luật đang có đều KHÔNG chạy được", () => {
    for (const r of PHYSIOGNOMY_RULES) expect(isRunnable(r), r.ruleId).toBe(false);
  });

  it("luật nháp không có ngưỡng bịa và không có nguồn bịa", () => {
    const r = PHYSIOGNOMY_RULES[0];
    expect(r.status).toBe("draft");
    expect(r.sourceRefs).toEqual([]);
    expect(r.interpretation).toBe("");
    for (const c of r.conditions) {
      expect(c.min).toBeNull();
      expect(c.max).toBeNull();
      expect(c.thresholdSource).toBeNull();
    }
  });

  it("luật chỉ khai KHOÁ feature — không có landmark, không có ảnh", () => {
    for (const r of PHYSIOGNOMY_RULES) {
      for (const k of r.featureRequirements) expect(k).toMatch(/^face\.[a-z0-9_]+\.[a-z0-9_]+$/);
      const s = JSON.stringify(r).toLowerCase();
      for (const bad of ["landmark", "image", "video", "audio", "base64", "sessionid"]) {
        expect(s, bad).not.toContain(bad);
      }
    }
  });
});

// ─────────────────────────────────────────── engine

describe("rule engine", () => {
  const feature = {
    key: "face.three_courts.middle",
    value: 0.4063,
    unit: "normalized_ratio",
    confidence: 0.9,
    status: "measured",
    method: "headAxis3d_projection_ratio",
    sourceView: "front",
  };
  const eligible = {
    "face.three_courts.middle": {
      featureKey: "face.three_courts.middle", eligible: true, reasons: [],
      explanation: "", policyVersion: POLICY_VERSION,
    },
  };
  /** Luật giả lập CHỈ TỒN TẠI TRONG TEST — không bao giờ vào kho thật. */
  const luatGia: PhysiognomyRule = {
    ruleId: "TEST_RULE",
    domain: "three_courts",
    featureRequirements: ["face.three_courts.middle"],
    conditions: [{ featureKey: "face.three_courts.middle", min: 0.3, max: 0.5, thresholdSource: "TEST_SRC" }],
    interpretation: "Câu giả lập dùng cho test.",
    sourceRefs: ["TEST_SRC"],
    confidence: 0.8,
    applicability: "test",
    limitations: [],
    status: "active",
    schemaVersion: "physiognomy-rule-v1",
  };

  it("luật nháp trong kho thật luôn bị BỎ QUA", () => {
    const r = evaluate({ features: [feature], eligibility: eligible, rules: PHYSIOGNOMY_RULES });
    expect(r[0].skipped).toBe(true);
    expect(r[0].matched).toBeNull();
    expect(r[0].skipReasons).toContain("rule_not_runnable");
    expect(r[0].skipReasons).toContain("source_not_verified");
  });

  it("luật đủ hình dạng nhưng KHÔNG có nguồn thật → vẫn bỏ qua", () => {
    // TEST_SRC không nằm trong kho nguồn (kho rỗng) nên không tra ra được.
    const r = evaluate({ features: [feature], eligibility: eligible, rules: [luatGia] });
    expect(r[0].skipped).toBe(true);
    expect(r[0].skipReasons).toContain("source_not_verified");
    expect(r[0].sourceEvidence).toEqual([]);
  });

  it("feature không đủ tư cách → bỏ qua, KHÔNG đoán", () => {
    const r = evaluate({
      features: [feature],
      eligibility: {
        "face.three_courts.middle": {
          featureKey: "face.three_courts.middle", eligible: false,
          reasons: ["validation_not_validated"], explanation: "", policyVersion: POLICY_VERSION,
        },
      },
      rules: [luatGia],
    });
    expect(r[0].skipped).toBe(true);
    expect(r[0].skipReasons).toContain("feature_not_eligible");
  });

  it("thiếu feature → bỏ qua", () => {
    const r = evaluate({ features: [], eligibility: {}, rules: [luatGia] });
    expect(r[0].skipReasons).toContain("feature_missing");
  });

  it("bị bỏ qua thì matched là null, KHÔNG phải false", () => {
    const r = evaluate({ features: [], eligibility: {}, rules: [luatGia] });
    expect(r[0].matched).toBeNull();
    expect(r[0].matched).not.toBe(false);
  });

  it("engine không bao giờ nhận landmark hay ảnh", () => {
    const src = readFileSync(
      join(import.meta.dirname, "..", "src", "rules", "physiognomy", "engine.ts"),
      "utf-8",
    );
    for (const bad of ["landmarks", "getUserMedia", "fetch(", "import(", "canvas"]) {
      expect(src, bad).not.toContain(bad);
    }
  });
});

// ─────────────────────────────────────────── pipeline đầu-cuối

describe("pipeline đầu-cuối trên fixture", () => {
  const out = runPhysiognomyPipeline(profile());

  it("chạy được từ profile tới luận giải", () => {
    expect(out.pipelineVersion).toBe("physiognomy-pipeline-v1");
    expect(out.summary.totalFeatures).toBe(29);
    expect(out.ruleResults.length).toBe(PHYSIOGNOMY_RULES.length);
    expect(out.interpretation.version).toBe("physiognomy-interpretation-v1");
  });

  it("FIXTURE KHÔNG làm feature nào thành validated", () => {
    expect(out.summary.validated).toBe(0);
    for (const r of Object.values(out.reliability)) {
      expect(r.validationStatus, r.featureKey).not.toBe("validated");
    }
  });

  it("KHÔNG feature nào đủ tư cách luận giải", () => {
    expect(out.summary.eligible).toBe(0);
  });

  it("low_confidence KHÔNG tới được tầng luận giải", () => {
    const lc = Object.values(out.reliability).filter((r) => r.measurementStatus === "low_confidence");
    expect(lc.length).toBeGreaterThan(20);
    for (const r of lc) {
      expect(out.eligibility[r.featureKey].eligible, r.featureKey).toBe(false);
      expect(out.eligibility[r.featureKey].reasons).toContain("measurement_not_measured");
    }
  });

  it("thiếu provenance KHÔNG tới được tầng luận giải", () => {
    for (const v of Object.values(out.eligibility)) {
      expect(v.reasons, v.featureKey).toContain("no_verified_source");
    }
  });

  it("mọi luật đều bị bỏ qua, không luật nào khớp", () => {
    expect(out.summary.rulesSkipped).toBe(out.summary.rulesConsidered);
    expect(out.summary.rulesMatched).toBe(0);
  });

  it("kết quả luận giải là INSUFFICIENT_EVIDENCE và KHÔNG có câu nào", () => {
    expect(out.interpretation.outcome).toBe("INSUFFICIENT_EVIDENCE");
    expect(out.interpretation.statements).toEqual([]);
    expect(out.interpretation.reasons.length).toBeGreaterThan(0);
  });

  it("nói được VÌ SAO chưa luận được, theo từng feature", () => {
    expect(out.interpretation.bundle.blocked.length).toBe(29);
    const middle = out.interpretation.bundle.blocked.find(
      (b) => b.featureKey === "face.three_courts.middle",
    );
    expect(middle!.reasons).toContain("validation_not_validated");
    expect(middle!.reasons).toContain("not_enough_participants");
  });

  it("ba feature measured vẫn KHÔNG được nâng lên production-ready", () => {
    for (const k of ["face.pose.yaw", "face.pose.pitch", "face.pose.roll"]) {
      expect(out.reliability[k].measurementStatus).toBe("measured");
      expect(out.reliability[k].validationStatus).toBe("provisional");
      expect(out.eligibility[k].eligible).toBe(false);
    }
  });

  it("KHÔNG có ảnh/video/âm thanh/landmark thô đi vào bất kỳ tầng nào sau feature", () => {
    const s = JSON.stringify(out).toLowerCase();
    for (const bad of ["base64", "blob", "image/", "video/", "audio/", "facelandmarks", "getusermedia"]) {
      expect(s, bad).not.toContain(bad);
    }
    // landmark chỉ được phép là CHỈ SỐ, và chỉ ở trong feature evidence
    expect(s).not.toContain('"landmarks"');
  });

  it("KHÔNG có chữ nào mang nghĩa luận giải", () => {
    const s = JSON.stringify(out).toLowerCase();
    for (const bad of ["auspicious", "fortune", "destiny", "wealth", "personality", "health",
      "tướng tốt", "tướng xấu", "phú quý"]) {
      expect(s, bad).not.toContain(bad.toLowerCase());
    }
  });
});

describe("pipeline khi MỌI cổng đều mở (chỉ trong test)", () => {
  /**
   * Chứng minh engine chạy đúng khi đủ điều kiện — nhưng phải bơm cả luật, cả nguồn,
   * cả tra-nguồn từ ngoài vào. Không đường nào để kho thật tự đạt tới trạng thái này.
   */
  const luat: PhysiognomyRule = {
    ruleId: "OPEN_GATE_TEST",
    domain: "three_courts",
    featureRequirements: ["face.three_courts.middle"],
    conditions: [{ featureKey: "face.three_courts.middle", min: 0.3, max: 0.5, thresholdSource: "X" }],
    interpretation: "Câu giả lập.",
    sourceRefs: ["X"],
    confidence: 0.8,
    applicability: "test",
    limitations: [],
    status: "active",
    schemaVersion: "physiognomy-rule-v1",
  };

  it("vẫn bị chặn vì kho nguồn thật rỗng — cổng nguồn không bơm qua được", () => {
    const out = runPhysiognomyPipeline(profile(), { rules: [luat], sourceLookup: () => true });
    // Cổng feature mở được bằng sourceLookup, nhưng engine tự tra nguồn và không thấy.
    expect(out.ruleResults[0].skipped).toBe(true);
    expect(out.ruleResults[0].skipReasons).toContain("source_not_verified");
    expect(out.interpretation.outcome).toBe("INSUFFICIENT_EVIDENCE");
  });
});

describe("adapter LLM", () => {
  it("provider mặc định TỪ CHỐI, không bịa", async () => {
    const out = runPhysiognomyPipeline(profile());
    const r = await REFUSING_PROVIDER.explain(out.interpretation.bundle);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("INSUFFICIENT_EVIDENCE");
  });

  it("interface chỉ nhận EvidenceBundle — không có đường nào khác", () => {
    const src = readFileSync(
      join(import.meta.dirname, "..", "src", "interpretation", "physiognomy", "index.ts"),
      "utf-8",
    );
    expect(src).toContain("explain(bundle: EvidenceBundle)");
    for (const bad of ["fetch(", "landmarks", "getUserMedia", "process.env"]) {
      expect(src, bad).not.toContain(bad);
    }
  });
});
