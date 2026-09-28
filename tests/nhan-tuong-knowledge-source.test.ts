/**
 * KHO NGUỒN — khoá lại tính trung thực của provenance.
 *
 * Phase kiểm kê nguồn tìm được **0 nguồn nhân tướng** trong repo. Bộ test này chứng
 * minh hệ thống vẫn đúng ở trạng thái đó, và quan trọng hơn: **không có đường nào để
 * nhét một nguồn bịa vào** — kể cả từ phía người gọi.
 *
 * Xem docs/PHYSIOGNOMY_KNOWLEDGE_SOURCE_INVENTORY.md.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

import {
  KNOWLEDGE_SOURCES,
  LOCATOR_REQUIRED,
  NO_EVIDENCE_RESOLVER,
  getSource,
  hasVerifiedSource,
  isUsableSource,
  locatorMatchesPolicy,
  rejectSource,
  type EvidenceResolver,
  type KnowledgeSource,
} from "../src/knowledge/physiognomy/source";
import { PHYSIOGNOMY_RULES } from "../src/rules/physiognomy/rule";
import { evaluate } from "../src/rules/physiognomy/engine";
import { runPhysiognomyPipeline } from "../src/features/physiognomy/pipeline";
import { buildFeatureProfile } from "../src/features/physiognomy/features/extract";
import { POLICY_VERSION } from "../src/features/physiognomy/measurement-contract/policy";

const SRC = resolve(import.meta.dirname, "..", "src");

/** Nguồn giả lập ĐỦ mọi điều kiện — dùng làm mốc để mỗi test chỉ hỏng đúng một biến. */
const NGUON_DU: KnowledgeSource = {
  sourceId: "TEST_FIXTURE_ONLY",
  title: "Tài liệu giả lập dùng trong test",
  author: "Không rõ",
  era: null,
  tradition: null,
  edition: null,
  publisher: null,
  year: null,
  locatorPolicy: "page",
  locator: { page: "1" },
  text: "",
  language: "zh",
  provenance: "Hiện vật giả lập, chỉ tồn tại trong tệp test này.",
  citation: "Tài liệu giả lập, tr.1",
  verificationStatus: "verified",
  // Tham chiếu DUY NHẤT mà `RESOLVER_GIA` bên dưới chịu mở được.
  evidenceRef: "test://co-that",
  schemaVersion: "physiognomy-knowledge-v1",
};

/**
 * Resolver GIẢ LẬP, chỉ sống trong tệp test.
 *
 * Nó KHÔNG mở tệp thật — nó chỉ giả vờ biết đúng một tham chiếu. Đủ để chứng minh
 * ngữ nghĩa cổng, và cố ý KHÔNG đưa vào `src/`: repo chưa có kho hiện vật nào, dựng
 * một resolver "thật" mà không có hiện vật chính là thứ phase này cấm.
 */
const RESOLVER_GIA: EvidenceResolver = {
  name: "test-resolver",
  resolve: (ref) =>
    ref === "test://co-that" ? "resolved" : ref.startsWith("test://") ? "missing" : "unresolvable",
};

// ─────────────────────────────────────────── A

describe("A — nguồn chưa xác minh không vào được registry", () => {
  it("registry RỖNG và đóng băng", () => {
    expect(Object.keys(KNOWLEDGE_SOURCES)).toHaveLength(0);
    expect(Object.isFrozen(KNOWLEDGE_SOURCES)).toBe(true);
  });

  it("verificationStatus khác `verified` đều bị từ chối", () => {
    for (const st of ["unverified", "disputed"] as const) {
      expect(rejectSource({ ...NGUON_DU, verificationStatus: st }, RESOLVER_GIA), st).toBe(
        "not_verified",
      );
    }
    expect(isUsableSource(NGUON_DU, RESOLVER_GIA)).toBe(true);
  });

  it("không thể ghi thêm vào registry lúc chạy", () => {
    const truoc = Object.keys(KNOWLEDGE_SOURCES).length;
    try {
      (KNOWLEDGE_SOURCES as Record<string, KnowledgeSource>).FAKE = NGUON_DU;
    } catch {
      /* strict mode ném lỗi — cũng là chặn được */
    }
    expect(Object.keys(KNOWLEDGE_SOURCES)).toHaveLength(truoc);
    expect(getSource("FAKE")).toBeNull();
  });
});

// ─────────────────────────────────────────── B

describe("B — thiếu locator thì không VERIFIED", () => {
  it("locator rỗng → từ chối", () => {
    expect(rejectSource({ ...NGUON_DU, locator: {} }, RESOLVER_GIA)).toBe("locator_empty");
  });

  it("chỉ có `note` mơ hồ → từ chối; phải có mốc định vị thật", () => {
    expect(rejectSource({ ...NGUON_DU, locator: { note: "đâu đó trong sách" } }, RESOLVER_GIA)).toBe(
      "locator_empty",
    );
  });

  it("mốc phải KHỚP cách định vị đã khai, không phải cứ có mốc nào cũng được", () => {
    // `NGUON_DU` khai locatorPolicy = "page".
    expect(isUsableSource({ ...NGUON_DU, locator: { page: "137" } }, RESOLVER_GIA)).toBe(true);
    // Có mốc, nhưng không phải mốc mà policy đòi → loại.
    for (const l of [{ chapter: "Quyển 2" }, { section: "Ngũ Quan" }, { paragraph: "3" }, { scanPage: "0142" }]) {
      expect(rejectSource({ ...NGUON_DU, locator: l }, RESOLVER_GIA), JSON.stringify(l)).toBe(
        "locator_policy_mismatch",
      );
    }
  });
});

// ─────────────────────────────────────────── C

describe("C — thiếu danh tính tối thiểu thì không VERIFIED", () => {
  it("thiếu tiêu đề / trích dẫn / xuất xứ → từ chối", () => {
    expect(rejectSource({ ...NGUON_DU, title: "" }, RESOLVER_GIA)).toBe("missing_title");
    expect(rejectSource({ ...NGUON_DU, title: "   " }, RESOLVER_GIA)).toBe("missing_title");
    expect(rejectSource({ ...NGUON_DU, citation: "" }, RESOLVER_GIA)).toBe("missing_citation");
    expect(rejectSource({ ...NGUON_DU, provenance: "" }, RESOLVER_GIA)).toBe("missing_provenance");
  });

  it("KHÔNG có hiện vật để đối chiếu → từ chối", () => {
    // Đây là chỗ chặn "nguồn sinh ra từ trí nhớ mô hình": trích dẫn nghe rất thật
    // nhưng không có bản scan/mã thư viện nào thì vô dụng.
    expect(rejectSource({ ...NGUON_DU, evidenceRef: null }, RESOLVER_GIA)).toBe("missing_evidence_ref");
    expect(rejectSource({ ...NGUON_DU, evidenceRef: "  " }, RESOLVER_GIA)).toBe("missing_evidence_ref");
  });

  it("publisher / year là TUỲ CHỌN CÓ CHỦ ĐÍCH — null vẫn dùng được", () => {
    // Không phải test hình dạng: gọi thẳng cổng và khẳng định null KHÔNG loại nguồn.
    // Căn cứ: tài liệu thật duy nhất trong repo là bản "LƯU HÀNH NỘI BỘ", không NXB,
    // không năm in. Bắt buộc hai trường này sẽ loại đúng loại tài liệu cần nhất.
    expect(rejectSource({ ...NGUON_DU, publisher: null, year: null }, RESOLVER_GIA)).toBeNull();
    expect(rejectSource({ ...NGUON_DU, publisher: "NXB Văn Hoá", year: 1998 }, RESOLVER_GIA)).toBeNull();
  });

  it("author / edition / era / text cũng tuỳ chọn — không trường nào trong số này loại nguồn", () => {
    expect(
      rejectSource({ ...NGUON_DU, author: null, edition: null, era: null, text: "" }, RESOLVER_GIA),
    ).toBeNull();
  });
});

// ─────────────────────────────────── H: hợp đồng locatorPolicy

describe("H — locatorPolicy phải khớp locator thật", () => {
  it("bảng hợp đồng phủ đủ 4 cách định vị, không thừa không thiếu", () => {
    expect(Object.keys(LOCATOR_REQUIRED).sort()).toEqual(
      ["chapter_section", "page", "scan_page", "volume_chapter"],
    );
  });

  it("locator ĐÚNG policy thì qua", () => {
    const ca: [KnowledgeSource["locatorPolicy"], KnowledgeSource["locator"]][] = [
      ["page", { page: "137" }],
      ["chapter_section", { chapter: "Quyển 2" }],
      ["chapter_section", { section: "Ngũ Quan" }],
      ["volume_chapter", { chapter: "Quyển 2 — Thiên Ngũ Quan" }],
      ["scan_page", { scanPage: "0142" }],
    ];
    for (const [pol, loc] of ca) {
      const s = { ...NGUON_DU, locatorPolicy: pol, locator: loc };
      expect(locatorMatchesPolicy(s), `${pol} ${JSON.stringify(loc)}`).toBe(true);
      expect(rejectSource(s, RESOLVER_GIA), `${pol} ${JSON.stringify(loc)}`).toBeNull();
    }
  });

  it("locator LỆCH policy thì loại — đây là GAP đã bị bỏ sót trước đây", () => {
    const lech: [KnowledgeSource["locatorPolicy"], KnowledgeSource["locator"]][] = [
      // chính ví dụ trong yêu cầu: khai scan_page nhưng đưa số trang sách
      ["scan_page", { page: "137" }],
      ["page", { scanPage: "0142" }],
      ["page", { chapter: "Quyển 2" }],
      ["volume_chapter", { page: "137" }],
      ["chapter_section", { page: "137" }],
    ];
    for (const [pol, loc] of lech) {
      const s = { ...NGUON_DU, locatorPolicy: pol, locator: loc };
      expect(locatorMatchesPolicy(s), `${pol} ${JSON.stringify(loc)}`).toBe(false);
      expect(rejectSource(s, RESOLVER_GIA), `${pol} ${JSON.stringify(loc)}`).toBe(
        "locator_policy_mismatch",
      );
    }
  });

  it("chuỗi rỗng/khoảng trắng KHÔNG tính là có mốc", () => {
    expect(rejectSource({ ...NGUON_DU, locator: { page: "   " } }, RESOLVER_GIA)).toBe("locator_empty");
  });

  it("paragraph/note chỉ là tinh chỉnh thêm, không bao giờ đủ một mình", () => {
    for (const pol of ["page", "chapter_section", "volume_chapter", "scan_page"] as const) {
      const s = { ...NGUON_DU, locatorPolicy: pol, locator: { paragraph: "3" } };
      expect(rejectSource(s, RESOLVER_GIA), pol).toBe("locator_policy_mismatch");
    }
  });
});

// ─────────────────────────────────── I: hiện vật phải MỞ ĐƯỢC

describe("I — evidenceRef có giá trị ≠ evidenceRef trỏ tới hiện vật có thật", () => {
  it("không có resolver → KHÔNG nguồn nào VERIFIED, kể cả nguồn hoàn hảo", () => {
    // Đây là trạng thái THẬT của repo: chưa có kho hiện vật nào.
    expect(isUsableSource(NGUON_DU)).toBe(false);
    expect(rejectSource(NGUON_DU)).toBe("evidence_unresolvable");
    expect(NO_EVIDENCE_RESOLVER.resolve("bat-ky-thu-gi")).toBe("unresolvable");
  });

  it("ref BỊA — đúng cú pháp nhưng không có hiện vật → loại", () => {
    for (const ref of ["test://khong-ton-tai", "test://sach-co-quyen-2-trang-137"]) {
      expect(rejectSource({ ...NGUON_DU, evidenceRef: ref }, RESOLVER_GIA), ref).toBe(
        "evidence_missing",
      );
    }
  });

  it("ref resolver không hiểu → loại (unresolvable), khác với missing", () => {
    expect(rejectSource({ ...NGUON_DU, evidenceRef: "https://vi.wikipedia.org/..." }, RESOLVER_GIA)).toBe(
      "evidence_unresolvable",
    );
  });

  it("chỉ ref MỞ ĐƯỢC mới cho VERIFIED", () => {
    expect(rejectSource({ ...NGUON_DU, evidenceRef: "test://co-that" }, RESOLVER_GIA)).toBeNull();
  });

  it("phân giải là cửa CUỐI — thiếu thứ khác vẫn báo đúng thứ thiếu trước", () => {
    expect(rejectSource({ ...NGUON_DU, title: "", evidenceRef: "test://co-that" }, RESOLVER_GIA)).toBe(
      "missing_title",
    );
  });

  // Cùng lý do như trên: duyệt cây nguồn, chậm theo số tệp chứ không theo logic.
  it("src/ KHÔNG có bản cài đặt resolver nào — không giả lập kho hiện vật", { timeout: 60_000 }, () => {
    const walk = (d: string, out: string[] = []): string[] => {
      for (const n of readdirSync(d)) {
        const p = join(d, n);
        if (statSync(p).isDirectory()) walk(p, out);
        else if (/\.ts$/.test(n)) out.push(p);
      }
      return out;
    };
    const caiDat = walk(SRC).filter((f) => {
      const s = readFileSync(f, "utf-8");
      return /:\s*EvidenceResolver/.test(s) && !s.includes("NO_EVIDENCE_RESOLVER: EvidenceResolver");
    });
    expect(caiDat.map((f) => relative(SRC, f).split(sep).join("/"))).toEqual([]);
  });

  it("hasVerifiedSource mặc định dùng resolver TỪ CHỐI", () => {
    expect(hasVerifiedSource(["TEST_FIXTURE_ONLY"], RESOLVER_GIA)).toBe(false); // registry rỗng
    expect(hasVerifiedSource([])).toBe(false);
  });
});

// ─────────────────────────────────────────── D

describe("D — không thể tiêm nguồn giả từ phía người gọi", () => {
  it("`hasVerifiedSource` chỉ tra registry, không nhận object từ ngoài", () => {
    expect(hasVerifiedSource(["TEST_FIXTURE_ONLY"])).toBe(false);
    expect(hasVerifiedSource(["BAT_KY_ID_NAO"])).toBe(false);
    expect(hasVerifiedSource([])).toBe(false);
  });

  it("engine tự tra nguồn — mở cổng feature từ ngoài KHÔNG giúp gì", () => {
    const feature = {
      key: "face.three_courts.middle", value: 0.4063, unit: "normalized_ratio",
      confidence: 0.9, status: "measured", method: "headAxis3d_projection_ratio",
      sourceView: "front",
    };
    const r = evaluate({
      features: [feature],
      // cổng feature bị ép mở
      eligibility: {
        "face.three_courts.middle": {
          featureKey: "face.three_courts.middle", eligible: true, reasons: [],
          explanation: "", policyVersion: POLICY_VERSION,
        },
      },
      rules: [{
        ruleId: "INJECT_TEST", domain: "three_courts",
        featureRequirements: ["face.three_courts.middle"],
        conditions: [{ featureKey: "face.three_courts.middle", min: 0.3, max: 0.5, thresholdSource: "X" }],
        interpretation: "Câu giả lập.", sourceRefs: ["TEST_FIXTURE_ONLY"],
        confidence: 0.9, applicability: "test", limitations: [],
        status: "active", schemaVersion: "physiognomy-rule-v1",
      }],
    });
    expect(r[0].skipped).toBe(true);
    expect(r[0].skipReasons).toContain("source_not_verified");
    expect(r[0].sourceEvidence).toEqual([]);
  });

  it("pipeline: bơm sourceLookup luôn true vẫn không qua được cổng nguồn", () => {
    const FIX = JSON.parse(
      readFileSync(join(import.meta.dirname, "fixtures", "canonical-face.json"), "utf-8"),
    ) as { frameWidth: number; frameHeight: number; landmarks: { x: number; y: number; z: number }[] };
    const p = buildFeatureProfile({
      sessionId: "SRC1234567", capturedAt: 1_700_000_000_000,
      observations: [{
        step: "front", landmarks: FIX.landmarks,
        frameWidth: FIX.frameWidth, frameHeight: FIX.frameHeight,
        pose: { yaw: 0, pitch: 0, roll: 0 },
        quality: { faceDetected: true, coverage: 0.6, brightness: 0.55, blur: 0.02 },
      }],
    });
    const out = runPhysiognomyPipeline(p, { sourceLookup: () => true });
    expect(out.interpretation.outcome).toBe("INSUFFICIENT_EVIDENCE");
    expect(out.summary.rulesMatched).toBe(0);
  });
});

// ─────────────────────────────────────────── E

describe("E — engine fail-closed khi registry rỗng", () => {
  it("mọi luật trong kho thật đều bị bỏ qua vì thiếu nguồn", () => {
    const r = evaluate({ features: [], eligibility: {}, rules: PHYSIOGNOMY_RULES });
    expect(r).toHaveLength(PHYSIOGNOMY_RULES.length);
    for (const x of r) {
      expect(x.skipped).toBe(true);
      expect(x.matched).toBeNull();
      expect(x.skipReasons).toContain("source_not_verified");
    }
  });
});

// ─────────────────────────────────────────── F

describe("F — hành vi pipeline KHÔNG đổi", () => {
  const FIX = JSON.parse(
    readFileSync(join(import.meta.dirname, "fixtures", "canonical-face.json"), "utf-8"),
  ) as { frameWidth: number; frameHeight: number; landmarks: { x: number; y: number; z: number }[] };
  const out = runPhysiognomyPipeline(
    buildFeatureProfile({
      sessionId: "SRC1234567", capturedAt: 1_700_000_000_000,
      observations: [{
        step: "front", landmarks: FIX.landmarks,
        frameWidth: FIX.frameWidth, frameHeight: FIX.frameHeight,
        pose: { yaw: 0, pitch: 0, roll: 0 },
        quality: { faceDetected: true, coverage: 0.6, brightness: 0.55, blur: 0.02 },
      }],
    }),
  );

  it("3 measured · 26 low_confidence · 0 unsupported", () => {
    const st = Object.values(out.reliability).map((r) => r.measurementStatus);
    expect(st.filter((s) => s === "measured")).toHaveLength(3);
    expect(st.filter((s) => s === "low_confidence")).toHaveLength(26);
    expect(st.filter((s) => s === "unsupported")).toHaveLength(0);
  });

  it("0 validated · 0 đủ tư cách luận giải", () => {
    expect(out.summary.validated).toBe(0);
    expect(out.summary.eligible).toBe(0);
  });
});

// ─────────────────────────────────────────── G

describe("G — bundle production không chứa nguồn chỉ-dùng-cho-test", () => {
  it("không tệp nào trong src/ chứa literal trích dẫn", () => {
    const walk = (d: string, out: string[] = []): string[] => {
      for (const n of readdirSync(d)) {
        const p = join(d, n);
        if (statSync(p).isDirectory()) walk(p, out);
        else if (/\.(ts|astro)$/.test(n)) out.push(p);
      }
      return out;
    };
    for (const f of walk(SRC)) {
      const s = readFileSync(f, "utf-8");
      expect(s, relative(SRC, f).split(sep).join("/")).not.toMatch(
        /["'](citation|chapter|paragraph|scanPage)["']\s*:\s*["'][^"']+["']/,
      );
    }
  });

  /**
   * Quét cả `dist/` là 518 tệp / 108 MB. Với bộ nhớ đệm tệp nguội, lần quét vượt 5 000 ms
   * mặc định của vitest và test ĐỎ VÌ TIMEOUT chứ không phải vì tìm thấy chuỗi cấm —
   * đã gặp đúng một lần. Nới timeout để kết quả nói đúng điều nó định nói.
   */
  it("bản build không mang id nguồn giả lập", { timeout: 60_000 }, () => {
    const dist = resolve(import.meta.dirname, "..", "dist");
    if (!existsSync(dist)) return;
    const walk = (d: string, out: string[] = []): string[] => {
      for (const n of readdirSync(d)) {
        const p = join(d, n);
        if (statSync(p).isDirectory()) walk(p, out);
        else if (/\.(js|mjs|html|json)$/.test(n)) out.push(p);
      }
      return out;
    };
    const dinh: string[] = [];
    for (const f of walk(dist)) {
      const s = readFileSync(f, "utf-8");
      if (s.includes("TEST_FIXTURE_ONLY") || s.includes("INJECT_TEST")) dinh.push(f);
    }
    expect(dinh).toEqual([]);
  });
});
