/**
 * PHASE 1D-6 — Thư viện luận giải skill-derived.
 *
 * Khoá HAI thứ: (1) nội dung import đủ và đúng nhóm; (2) ranh giới — thư viện KHÔNG
 * đụng KNOWLEDGE_SOURCES, KHÔNG tạo threshold/rule, KHÔNG tự phong verified, và Rule
 * Engine vẫn fail-closed y như trước.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  INTERPRETATION_LIBRARY,
  INTERPRETATION_LIBRARY_VERSION,
  getInterpretationItem,
  getInterpretationsByCategory,
  getInterpretationsForFeature,
  listCategories,
  type InterpretationItem,
} from "../src/knowledge/physiognomy/interpretation-library";
import { KNOWLEDGE_SOURCES } from "../src/knowledge/physiognomy/source";
import { runPipelineOnFeatures } from "../src/features/physiognomy/pipeline";
import { payload as fixturePayload } from "./fixtures/research-samples";

// ─────────────────────────────────────────── 1-2. load + đủ item

describe("thư viện load được và có nội dung", () => {
  it("load được, có version, không rỗng", () => {
    expect(INTERPRETATION_LIBRARY_VERSION).toBe("physiognomy-interpretation-library-v1");
    expect(INTERPRETATION_LIBRARY.length).toBeGreaterThan(0);
  });

  it("id là duy nhất", () => {
    const ids = INTERPRETATION_LIBRARY.map((x) => x.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it("mỗi nhóm lớn của tư liệu đều có mặt", () => {
    const cats = listCategories();
    for (const c of [
      "ngu_hanh_hinh_tuong", "tam_dinh", "ngu_nhac", "tu_dau", "luc_phu", "ngu_quan",
      "bo_vi", "muoi_hai_cung", "bach_tue_do", "than_khi_sac", "not_ruoi",
      "nguyen_tac_tong_hop", "quy_tac_nu", "an_duong", "ngu_tinh_luc_dieu", "hoc_duong",
      "than_the", "tuong_cam_thu", "rau_toc", "giong_noi_khi_phach", "sat_tuong", "khi_sac",
      "quy_trinh",
    ]) {
      expect(cats, c).toContain(c);
    }
  });
});

// ─────────────────────────────────────────── 3-4. provenance skill-derived, không verified

describe("provenance: skill-derived / unverified — KHÔNG BAO GIỜ verified", () => {
  it("mọi item có type skill-derived, verificationStatus unverified", () => {
    for (const it of INTERPRETATION_LIBRARY) {
      expect(it.provenance.type, it.id).toBe("skill-derived");
      expect(it.provenance.verificationStatus, it.id).toBe("unverified");
    }
  });

  it("mọi item KHÔNG có locator và KHÔNG có evidenceRef", () => {
    for (const it of INTERPRETATION_LIBRARY) {
      expect(it.provenance.locator, it.id).toBeNull();
      expect(it.provenance.evidenceRef, it.id).toBeNull();
    }
  });

  it("KHÔNG item nào tự nhận verified/primary", () => {
    const j = JSON.stringify(INTERPRETATION_LIBRARY).toLowerCase();
    expect(j).not.toContain('"verified"');
    expect(j).not.toContain("verified_primary");
  });

  it("mỗi item có attribution ghi nguồn tài liệu", () => {
    for (const it of INTERPRETATION_LIBRARY) {
      expect(it.provenance.attribution.length, it.id).toBeGreaterThan(0);
    }
  });
});

// ─────────────────────────────────────────── 5-6. không threshold, không rule

describe("KHÔNG threshold số, KHÔNG tạo rule", () => {
  it("không item nào chứa min/max hay số ngưỡng đo", () => {
    for (const it of INTERPRETATION_LIBRARY) {
      // conditionsText là ĐỊNH TÍNH: không được là ràng buộc số kiểu "> 0.3" / "min:"
      const c = (it.conditionsText ?? "").toLowerCase();
      expect(c, it.id).not.toMatch(/\bmin\b|\bmax\b/);
      expect(c, it.id).not.toMatch(/[<>]=?\s*\d/);
      expect(c, it.id).not.toMatch(/\d+\.\d+/); // không tỉ lệ số thập phân
    }
  });

  it("item KHÔNG có trường tạo rule (không conditions số, không sourceRefs, không ruleId)", () => {
    for (const it of INTERPRETATION_LIBRARY) {
      expect(it).not.toHaveProperty("conditions");
      expect(it).not.toHaveProperty("sourceRefs");
      expect(it).not.toHaveProperty("ruleId");
      expect(it).not.toHaveProperty("threshold");
    }
  });

  it("'mũi dài 1/3 khuôn mặt' giữ nguyên dạng chữ, KHÔNG thành số", () => {
    const mui = getInterpretationItem("bo-vi-mui")!;
    expect(mui.conditionsText).toContain("1/3 khuôn mặt");
    // "1/3" là phân số văn bản, không phải ngưỡng thập phân — chấp nhận; nhưng không có min/max.
    expect(mui.conditionsText!.toLowerCase()).not.toMatch(/\bmin\b|\bmax\b/);
  });
});

// ─────────────────────────────────────────── 7-8. KNOWLEDGE_SOURCES rỗng, engine fail-closed

describe("ranh giới cứng với Rule Engine / Knowledge", () => {
  it("KNOWLEDGE_SOURCES chỉ có nguồn cổ thư đã xác minh — tách biệt với thư viện luận giải", () => {
    // Kho nguồn (cổ thư) và thư viện luận giải (skill-derived) là hai thứ khác nhau; thêm một
    // nguồn cổ thư KHÔNG được nâng cấp thư viện luận giải này.
    expect(Object.keys(KNOWLEDGE_SOURCES)).toEqual(["SHEN_XIANG_QUAN_BIAN_XIANG_MEI_001"]);
  });

  it("thư viện KHÔNG import source/engine/rule/feature (là module lá)", () => {
    const src = readFileSync(
      join(import.meta.dirname, "..", "src", "knowledge", "physiognomy", "interpretation-library.ts"),
      "utf-8",
    );
    // Không import bất cứ module nào — kho thuần dữ liệu.
    expect(src).not.toMatch(/(?:^|\n)\s*import\b[^;]*?from/);
  });

  it("Rule Engine vẫn fail-closed: evidence rỗng → INSUFFICIENT_EVIDENCE", () => {
    const p = fixturePayload("SESSLIB01");
    const out = runPipelineOnFeatures(
      (p.features as { k: string; v: number | null; u: string; c: number; s: string; m: string; w: string | null }[]).map((f) => ({
        key: f.k, value: f.v, unit: f.u, confidence: f.c, status: f.s, method: f.m, sourceView: f.w,
      })),
    );
    expect(out.interpretation.outcome).toBe("INSUFFICIENT_EVIDENCE");
    expect(out.summary.eligible).toBe(0);
    expect(out.summary.rulesMatched).toBe(0);
  });
});

// ─────────────────────────────────────────── 9-10. API chỉ đọc, không nhận media

describe("API chỉ đọc, không chạm dữ liệu thô", () => {
  it("getInterpretationsForFeature trả mục có featureConcepts chứa key đó", () => {
    const items = getInterpretationsForFeature("face.three_courts.middle");
    expect(items.length).toBeGreaterThan(0);
    for (const it of items) expect(it.featureConcepts).toContain("face.three_courts.middle");
  });

  it("feature key không map → trả rỗng, KHÔNG ép map", () => {
    // pose không có khái niệm tướng học tương ứng.
    expect(getInterpretationsForFeature("face.pose.yaw")).toEqual([]);
  });

  it("thư viện không chứa trường ảnh/video/landmark", () => {
    const j = JSON.stringify(INTERPRETATION_LIBRARY).toLowerCase();
    for (const cam of ['"l":', "base64", "data:image", "videourl", "landmarks"]) {
      expect(j.includes(cam), cam).toBe(false);
    }
  });

  it("mọi featureConcepts đều là key hợp lệ trong 29 feature (hoặc rỗng)", () => {
    const KEYS = new Set([
      "face.geometry.face_width", "face.geometry.face_height", "face.geometry.face_shape_ratio",
      "face.shape.jaw_to_face_width", "face.shape.cheek_to_face_width", "face.shape.chin_to_face_height",
      "face.three_courts.upper", "face.three_courts.middle", "face.three_courts.lower",
      "face.eyes.interocular_distance", "face.eyes.left_width", "face.eyes.right_width",
      "face.eyes.left_height", "face.eyes.right_height", "face.eyes.left_tilt", "face.eyes.right_tilt",
      "face.eyebrows.left_length", "face.eyebrows.right_length", "face.eyebrows.left_height",
      "face.eyebrows.right_height", "face.eyebrows.spacing",
      "face.nose.length", "face.nose.width", "face.nose.bridge_ratio",
      "face.mouth.width", "face.mouth.height",
      "face.pose.yaw", "face.pose.pitch", "face.pose.roll",
    ]);
    for (const it of INTERPRETATION_LIBRARY) {
      for (const k of it.featureConcepts) {
        expect(KEYS.has(k), `${it.id}: ${k}`).toBe(true);
      }
    }
  });
});

// ─────────────────────────────────────────── item cụ thể mỗi nhóm lớn

describe("kiểm nội dung một item mỗi nhóm lớn", () => {
  const check = (id: string, conceptPart: string, cat: string) => {
    const it = getInterpretationItem(id) as InterpretationItem;
    expect(it, id).toBeTruthy();
    expect(it.concept).toContain(conceptPart);
    expect(it.category).toBe(cat);
    expect(it.interpretation.length).toBeGreaterThan(20);
  };

  it("Tam Đình", () => check("tam-dinh-trung", "Trung Đình", "tam_dinh"));
  it("Mũi", () => check("bo-vi-mui", "Mũi", "bo_vi"));
  it("Mắt", () => check("bo-vi-mat", "Mắt", "bo_vi"));
  it("Mày", () => check("bo-vi-long-may", "Lông mày", "bo_vi"));
  it("Miệng", () => check("bo-vi-mieng-moi-rang", "Miệng", "bo_vi"));
  it("Ngũ Hành hình tướng", () => check("ngu-hanh-moc", "Mộc", "ngu_hanh_hinh_tuong"));

  it("mapping phân loại đúng: Tam Đình = partial, Ngũ Nhạc = no_mapping", () => {
    expect(getInterpretationItem("tam-dinh-trung")!.mappingKind).toBe("partial");
    expect(getInterpretationItem("ngu-nhac")!.mappingKind).toBe("no_mapping");
    expect(getInterpretationsByCategory("ngu_hanh_hinh_tuong").length).toBeGreaterThanOrEqual(5);
  });
});
