/**
 * RANH GIỚI KIẾN TRÚC — khoá lại bằng đồ thị import THẬT, không bằng lời hứa.
 *
 * Bộ test này đọc mã nguồn, dựng đồ thị phụ thuộc giữa các tầng, rồi khẳng định những
 * cạnh CẤM không tồn tại. Thêm một import sai chỗ là test đỏ ngay — đó là điểm khác
 * biệt so với việc chỉ ghi ranh giới trong tài liệu.
 */
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

const SRC = resolve(import.meta.dirname, "..", "src");

/** Thứ tự QUAN TRỌNG: khớp từ cụ thể đến chung chung. */
const LAYER_RULES: [string, string[]][] = [
  /** Lá của đồ thị: chỉ chứa hằng số thu nhận, không import gì. */
  ["acquisition", ["features/physiognomy/acquisition/"]],
  ["transport", ["features/physiognomy/features/transport.ts"]],
  ["pipeline", ["features/physiognomy/pipeline.ts"]],
  ["contract", ["features/physiognomy/measurement-contract/"]],
  ["knowledge", ["knowledge/physiognomy/"]],
  ["rules", ["rules/physiognomy/"]],
  ["interp", ["interpretation/physiognomy/"]],
  ["sensor", [
    "features/physiognomy/camera/", "features/physiognomy/landmarker/",
    "features/physiognomy/capture/", "features/physiognomy/voice/",
  ]],
  ["feature", [
    "features/physiognomy/features/", "features/physiognomy/geometry/",
    "features/physiognomy/types/", "features/physiognomy/index.ts",
  ]],
  /** Nạp tập dữ liệu nghiên cứu. Ngồi TRÊN session/transport/contract, không ai dưới
   * được phép biết tới nó. */
  ["research", ["features/physiognomy/research/"]],
  ["session", ["features/physiognomy/session/", "pages/api/nhan-tuong/"]],
  ["ui", ["components/tools/NhanTuong", "pages/nhan-tuong.astro"]],
];

function layerOf(abs: string): string | null {
  const q = relative(SRC, abs).split(sep).join("/");
  for (const [name, pats] of LAYER_RULES) {
    for (const p of pats) if (q.endsWith(p) || q.includes(p)) return name;
  }
  return null;
}

function walkFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkFiles(p, out);
    else if (/\.(ts|tsx|astro)$/.test(name)) out.push(p);
  }
  return out;
}

/**
 * ⚠️ `[^;]*?` chứ KHÔNG phải `[^;\n]*?`.
 *
 * Bản đầu dùng `[^;\n]` nên BỎ SÓT mọi `import { A, B } from "…"` viết nhiều dòng —
 * đồ thị thiếu cạnh, và test ranh giới xanh một cách SAI. Bắt được khi tách ngưỡng
 * thu nhận: cạnh `feature → acquisition` vừa thêm không hề xuất hiện trong đồ thị.
 * Câu lệnh import luôn kết thúc bằng `;` nên `[^;]` là biên an toàn.
 */
const IMPORT_RE =
  /(?:^|\n)\s*(?:import|export)\b[^;]*?from\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;

interface Edge {
  from: string;
  to: string;
  file: string;
  /** `import type` bị xoá lúc biên dịch — không tạo phụ thuộc lúc chạy. */
  typeOnly: boolean;
}

function buildGraph(): Edge[] {
  const edges: Edge[] = [];
  for (const file of walkFiles(SRC)) {
    const from = layerOf(file);
    if (from === null) continue;
    const src = readFileSync(file, "utf-8");
    for (const m of src.matchAll(IMPORT_RE)) {
      const spec = m[1] ?? m[2];
      if (!spec?.startsWith(".")) continue;
      const base = resolve(dirname(file), spec);
      const cand = [base, base + ".ts", join(base, "index.ts"), base + ".astro"];
      const real = cand.find((c) => {
        try {
          return statSync(c).isFile();
        } catch {
          return false;
        }
      });
      if (!real) continue;
      const to = layerOf(real);
      if (to === null || to === from) continue;
      edges.push({
        from,
        to,
        file: relative(SRC, file).split(sep).join("/"),
        typeOnly: /^\s*(?:import|export)\s+type\s/.test(m[0]),
      });
    }
  }
  return edges;
}

const GRAPH = buildGraph();
const has = (from: string, to: string) => GRAPH.filter((e) => e.from === from && e.to === to);

// ─────────────────────────────────────────── cạnh CẤM

describe("cạnh cấm trong đồ thị phụ thuộc", () => {
  /** Ghi đúng như tài liệu tuyên bố. Thêm import sai chỗ là test đỏ. */
  const CAM: [string, string, string][] = [
    ["rules", "sensor", "Luật không được nhìn camera"],
    ["rules", "session", "Luật không được biết phiên"],
    ["rules", "ui", "Luật không được biết giao diện"],
    ["rules", "interp", "Luật không được gọi ngược tầng luận giải"],
    ["knowledge", "sensor", "Kho nguồn không được biết cảm biến"],
    ["knowledge", "feature", "Kho nguồn không được biết feature"],
    ["knowledge", "rules", "Kho nguồn không được biết luật"],
    ["knowledge", "session", "Kho nguồn không được biết phiên"],
    ["feature", "knowledge", "Feature Layer không được biết kho nguồn"],
    ["feature", "rules", "Feature Layer không được biết luật"],
    ["feature", "interp", "Feature Layer không được biết luận giải"],
    ["feature", "pipeline", "Feature Layer không được biết pipeline"],
    ["contract", "knowledge", "Hợp đồng đo không được biết kho nguồn"],
    ["contract", "rules", "Hợp đồng đo không được biết luật"],
    ["contract", "interp", "Hợp đồng đo không được biết luận giải"],
    ["contract", "session", "Hợp đồng đo không được biết phiên"],
    ["contract", "sensor", "Hợp đồng đo không được biết cảm biến"],
    ["interp", "sensor", "Luận giải không được nhìn camera"],
    ["interp", "session", "Luận giải không được biết phiên"],
    ["interp", "knowledge", "Luận giải không được tự tra nguồn"],
    ["session", "rules", "Phiên không được chạy luật"],
    ["session", "knowledge", "Phiên không được tra nguồn"],
    ["session", "interp", "Phiên không được luận giải"],
    ["transport", "rules", "Transport không được biết luật"],
    ["transport", "knowledge", "Transport không được biết nguồn"],
    ["transport", "interp", "Transport không được biết luận giải"],
    ["transport", "sensor", "Transport không được biết cảm biến"],
    ["ui", "rules", "Giao diện không được đụng ruột engine — phải đi qua pipeline"],
    ["ui", "knowledge", "Giao diện không được nhúng tri thức cổ thư"],
    ["ui", "contract", "Giao diện không được tự chấm độ tin — phải đi qua pipeline"],
    ["acquisition", "session", "Ngưỡng thu nhận không được biết phiên"],
    ["acquisition", "feature", "Ngưỡng thu nhận phải là LÁ"],
    ["acquisition", "sensor", "Ngưỡng thu nhận phải là LÁ"],
    ["acquisition", "knowledge", "Ngưỡng thu nhận không được biết kho nguồn"],
    ["acquisition", "rules", "Ngưỡng thu nhận không được biết luật"],
    ["acquisition", "interp", "Ngưỡng thu nhận không được biết luận giải"],
    ["acquisition", "transport", "Ngưỡng thu nhận không được biết transport"],
    ["acquisition", "ui", "Ngưỡng thu nhận không được biết giao diện"],
    ["acquisition", "pipeline", "Ngưỡng thu nhận không được biết pipeline"],
    ["acquisition", "research", "Ngưỡng thu nhận phải là LÁ"],
    // Tầng nạp dữ liệu chỉ được nhìn XUỐNG số đo, không được biết tri thức hay luận giải.
    ["research", "sensor", "Nạp dữ liệu không được nhìn camera"],
    ["research", "knowledge", "Nạp dữ liệu không được tra nguồn"],
    ["research", "rules", "Nạp dữ liệu không được chạy luật"],
    ["research", "interp", "Nạp dữ liệu không được luận giải"],
    ["research", "ui", "Nạp dữ liệu không được biết giao diện"],
    ["research", "pipeline", "Nạp dữ liệu không được biết pipeline"],
    // Và không tầng nào dưới nó được phụ thuộc NGƯỢC LÊN.
    ["contract", "research", "Hợp đồng đo không được biết tầng nạp dữ liệu"],
    ["session", "research", "Phiên không được biết tầng nạp dữ liệu"],
    ["feature", "research", "Feature Layer không được biết tầng nạp dữ liệu"],
    ["transport", "research", "Transport không được biết tầng nạp dữ liệu"],
  ];

  for (const [from, to, viSao] of CAM) {
    it(`${from} KHÔNG được phụ thuộc ${to} — ${viSao}`, () => {
      const e = has(from, to);
      expect(e.map((x) => x.file), `${from} -> ${to}`).toEqual([]);
    });
  }
});

describe("ranh giới ngưỡng thu nhận", () => {
  const THRESHOLDS = "features/physiognomy/acquisition/thresholds.ts";

  it("A — Feature Layer KHÔNG còn import GIÁ TRỊ từ session", () => {
    const valueEdges = has("feature", "session").filter((e) => !e.typeOnly);
    expect(valueEdges.map((e) => e.file)).toEqual([]);
  });

  it("A — phần còn lại của feature → session chỉ là `import type`", () => {
    const all = has("feature", "session");
    expect(all.length).toBeGreaterThan(0);
    for (const e of all) expect(e.typeOnly, `${e.file} phải là import type`).toBe(true);
  });

  it("B — module ngưỡng là LÁ: không import bất cứ thứ gì", () => {
    const src = readFileSync(join(SRC, THRESHOLDS), "utf-8");
    // Không có bất kỳ `… from "…"` nào — kể cả viết nhiều dòng.
    expect(src).not.toMatch(/(?:^|\n)\s*(?:import|export)\b[^;]*?from/);
    expect(src).not.toMatch(/\bimport\s*\(/);
    expect(src).not.toMatch(/\brequire\s*\(/);
  });

  it("B — không chạm runtime trình duyệt hay mạng", () => {
    const src = readFileSync(join(SRC, THRESHOLDS), "utf-8");
    const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "");
    for (const bad of ["window", "document", "navigator", "fetch", "process", "localStorage"]) {
      expect(code, bad).not.toContain(bad);
    }
  });

  it("session ĐƯỢC PHÉP phụ thuộc xuống ngưỡng thu nhận", () => {
    expect(has("session", "acquisition").length).toBeGreaterThan(0);
  });

  it("feature phụ thuộc xuống ngưỡng thu nhận", () => {
    expect(has("feature", "acquisition").length).toBeGreaterThan(0);
  });

  it("C — 11 ngưỡng giữ nguyên giá trị sau khi chuyển chỗ", async () => {
    const A = await import("../src/features/physiognomy/acquisition/thresholds");
    // Snapshot chép từ `session/steps.ts` TRƯỚC khi tách. Đổi bất kỳ con số nào là đỏ.
    const TRUOC = {
      YAW_SIGN_FOR_USER_LEFT: 1,
      TURN_MIN_DEG: 20,
      TURN_SAFE_MAX_DEG: 45,
      NEAR_MIN_COVERAGE: 0.62,
      COVERAGE_MIN: 0.25,
      COVERAGE_MAX: 0.85,
      BLUR_MIN: 0.0015,
      BRIGHTNESS_MIN: 0.18,
      BRIGHTNESS_MAX: 0.92,
      STEP_STABLE_FRAMES: 3,
    } as const;
    for (const [k, v] of Object.entries(TRUOC)) {
      expect((A as Record<string, unknown>)[k], k).toBe(v);
    }
    expect(A.FRONT_LIMITS).toEqual({ yaw: 8, pitch: 8, roll: 5 });
  });

  it("C — session/steps tái xuất ĐÚNG cùng một đối tượng, không phải bản sao", async () => {
    const A = await import("../src/features/physiognomy/acquisition/thresholds");
    const S = await import("../src/features/physiognomy/session/steps");
    expect(S.FRONT_LIMITS).toBe(A.FRONT_LIMITS);
    for (const k of ["TURN_MIN_DEG", "BLUR_MIN", "COVERAGE_MIN", "YAW_SIGN_FOR_USER_LEFT"] as const) {
      expect((S as Record<string, unknown>)[k], k).toBe((A as Record<string, unknown>)[k]);
    }
  });

  // Quét toàn bộ src/ + đọc từng tệp: trên Windows vốn đã sát 5 000 ms mặc định của
  // vitest, nên chỉ cần thêm vài tệp nguồn là ĐỎ VÌ TIMEOUT chứ không phải vì sai.
  it("C — mỗi ngưỡng chỉ được ĐỊNH NGHĨA một lần trong domain nhân tướng", { timeout: 60_000 }, () => {
    const TEN = ["FRONT_LIMITS", "TURN_MIN_DEG", "TURN_SAFE_MAX_DEG", "NEAR_MIN_COVERAGE",
      "COVERAGE_MIN", "COVERAGE_MAX", "BLUR_MIN", "BRIGHTNESS_MIN", "BRIGHTNESS_MAX",
      "STEP_STABLE_FRAMES", "YAW_SIGN_FOR_USER_LEFT"];
    // Đọc cây nguồn MỘT lần rồi dùng lại. Bản đầu gọi `walkFiles` + `readFileSync`
    // riêng cho từng tên (11 lượt quét toàn bộ src/) nên vượt 5 000 ms mặc định của
    // vitest và ĐỎ VÌ TIMEOUT chứ không phải vì có định nghĩa trùng.
    const noiDung = walkFiles(SRC).map((f) => ({
      duong: relative(SRC, f).split(sep).join("/"),
      src: readFileSync(f, "utf-8"),
    }));
    for (const ten of TEN) {
      const re = new RegExp(String.raw`export const ${ten}\b`);
      const dinh = noiDung.filter((x) => re.test(x.src)).map((x) => x.duong);
      expect(dinh, ten).toEqual([THRESHOLDS]);
    }
  });
});

describe("chu trình", () => {
  /**
   * Hai chu trình còn tồn tại trong đồ thị TĨNH, nhưng cả hai đều đi qua `import type`
   * (bị xoá lúc biên dịch) hoặc qua tệp gom (barrel). Test này khoá lại điều đó: nếu
   * ai biến một cạnh type-only thành cạnh giá trị, chu trình thành THẬT và test đỏ.
   */
  it("cạnh quay ngược từ session về transport phải là type-only", () => {
    const e = has("session", "transport").filter((x) => !x.file.startsWith("pages/api/"));
    expect(e.length).toBeGreaterThan(0);
    for (const x of e) expect(x.typeOnly, `${x.file} phải là import type`).toBe(true);
  });

  it("không có chu trình nào chỉ gồm cạnh giá trị", () => {
    const adj = new Map<string, Set<string>>();
    for (const e of GRAPH) {
      if (e.typeOnly) continue;
      // Tệp gom (barrel) chỉ tái xuất, không tạo phụ thuộc thật giữa các tầng.
      if (e.file === "features/physiognomy/index.ts") continue;
      if (!adj.has(e.from)) adj.set(e.from, new Set());
      adj.get(e.from)!.add(e.to);
    }
    const chuTrinh: string[][] = [];
    const dfs = (n: string, path: string[]) => {
      for (const m of adj.get(n) ?? []) {
        if (path.includes(m)) {
          chuTrinh.push([...path.slice(path.indexOf(m)), m]);
          continue;
        }
        if (path.length > 8) continue;
        dfs(m, [...path, m]);
      }
    };
    for (const n of adj.keys()) dfs(n, [n]);
    expect(chuTrinh.map((c) => c.join(" -> "))).toEqual([]);
  });
});

// ─────────────────────────────────────────── cổng duy nhất

describe("chỉ có MỘT cổng tư cách", () => {
  it("evaluateEligibility định nghĩa đúng một lần", () => {
    const dinh = walkFiles(SRC).filter((f) =>
      /export function evaluateEligibility\b/.test(readFileSync(f, "utf-8")),
    );
    expect(dinh.map((f) => relative(SRC, f).split(sep).join("/"))).toEqual([
      "features/physiognomy/measurement-contract/policy.ts",
    ]);
  });

  it("không nơi nào tự chấm đủ-tư-cách ngoài policy", () => {
    for (const f of walkFiles(SRC)) {
      const q = relative(SRC, f).split(sep).join("/");
      if (q.endsWith("measurement-contract/policy.ts")) continue;
      const src = readFileSync(f, "utf-8");
      // Gán giá trị cho `eligible` = tự quyết. Chỉ engine được ĐỌC verdict.
      expect(src, `${q} tự gán eligible`).not.toMatch(/\beligible\s*[:=]\s*(true|false)\b/);
    }
  });

  it("chỉ pipeline gọi evaluateAll", () => {
    const goi = walkFiles(SRC)
      .filter((f) => /\bevaluateAll\s*\(/.test(readFileSync(f, "utf-8")))
      .map((f) => relative(SRC, f).split(sep).join("/"))
      .filter((q) => !q.endsWith("measurement-contract/policy.ts"));
    expect(goi).toEqual(["features/physiognomy/pipeline.ts"]);
  });
});

// ─────────────────────────────────────────── ranh giới dữ liệu thô

describe("media thô không đi quá tầng cảm biến", () => {
  const SAU_FEATURE = [
    "features/physiognomy/features/transport.ts",
    "features/physiognomy/measurement-contract/reliability.ts",
    "features/physiognomy/measurement-contract/policy.ts",
    "features/physiognomy/pipeline.ts",
    "features/physiognomy/session/store.ts",
    "features/physiognomy/session/types.ts",
    "knowledge/physiognomy/source.ts",
    "rules/physiognomy/rule.ts",
    "rules/physiognomy/engine.ts",
    "interpretation/physiognomy/index.ts",
  ];

  for (const rel of SAU_FEATURE) {
    it(`${rel} không chạm media thô`, () => {
      const src = readFileSync(join(SRC, rel), "utf-8");
      // Bỏ chú thích: các tệp này CÓ nhắc tên media trong phần giải thích điều cấm.
      const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "");
      for (const bad of [
        "getUserMedia", "HTMLVideoElement", "createElement", "canvas", "ImageData",
        "MediaRecorder", "AudioContext", "FaceLandmarker", "faceLandmarks",
        "facialTransformationMatrixes", "arrayBuffer",
      ]) {
    expect(code, `${rel} chứa "${bad}"`).not.toContain(bad);
      }
    });
  }

  it("engine và luận giải không gọi mạng, không nạp động", () => {
    for (const rel of ["rules/physiognomy/engine.ts", "interpretation/physiognomy/index.ts"]) {
      const src = readFileSync(join(SRC, rel), "utf-8");
      const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "");
      for (const bad of ["fetch(", "XMLHttpRequest", "WebSocket", "process.env", "import("]) {
    expect(code, `${rel} chứa "${bad}"`).not.toContain(bad);
      }
    }
  });
});

// ─────────────────────────────────────────── kho nguồn

describe("kho nguồn không có tri thức bịa", () => {
  it("không tệp nào trong src/ chứa literal nguồn cổ thư", () => {
    for (const f of walkFiles(SRC)) {
      const src = readFileSync(f, "utf-8");
      // Một object nguồn thật sẽ có cặp khoá-giá trị kiểu "citation": "…"
      expect(src, relative(SRC, f)).not.toMatch(
        /["'](citation|chapter|paragraph)["']\s*:\s*["'][^"']+["']/,
      );
    }
  });

  it("registry rỗng và đóng băng", () => {
    const src = readFileSync(join(SRC, "knowledge/physiognomy/source.ts"), "utf-8");
    expect(src).toContain("Object.freeze({})");
  });

  it("không có nguồn dự phòng ẩn", () => {
    const src = readFileSync(join(SRC, "knowledge/physiognomy/source.ts"), "utf-8");
    const code = src.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(code).not.toMatch(/\?\?\s*\{[^}]*sourceId/);
    expect(code).not.toContain("DEFAULT_SOURCE");
  });
});

// ─────────────────────────────────────────── hợp đồng đo thuần

describe("hợp đồng đo là hàm thuần", () => {
  it("không sửa gì trong profile đầu vào", async () => {
    const { buildFeatureProfile } = await import("../src/features/physiognomy/features/extract");
    const { runPhysiognomyPipeline } = await import("../src/features/physiognomy/pipeline");
    const FIX = JSON.parse(
      readFileSync(join(import.meta.dirname, "fixtures", "canonical-face.json"), "utf-8"),
    ) as { frameWidth: number; frameHeight: number; landmarks: { x: number; y: number; z: number }[] };
    const profile = buildFeatureProfile({
      sessionId: "BOUND12345",
      capturedAt: 1_700_000_000_000,
      observations: [{
        step: "front", landmarks: FIX.landmarks,
        frameWidth: FIX.frameWidth, frameHeight: FIX.frameHeight,
        pose: { yaw: 0, pitch: 0, roll: 0 },
        quality: { faceDetected: true, coverage: 0.6, brightness: 0.55, blur: 0.02 },
      }],
    });
    const truoc = JSON.stringify(profile);
    runPhysiognomyPipeline(profile);
    runPhysiognomyPipeline(profile);
    expect(JSON.stringify(profile)).toBe(truoc);
  });

  it("chạy hai lần ra kết quả y hệt", async () => {
    const { buildFeatureProfile } = await import("../src/features/physiognomy/features/extract");
    const { runPhysiognomyPipeline } = await import("../src/features/physiognomy/pipeline");
    const FIX = JSON.parse(
      readFileSync(join(import.meta.dirname, "fixtures", "canonical-face.json"), "utf-8"),
    ) as { frameWidth: number; frameHeight: number; landmarks: { x: number; y: number; z: number }[] };
    const mk = () =>
      buildFeatureProfile({
        sessionId: "BOUND12345", capturedAt: 1_700_000_000_000,
        observations: [{
          step: "front", landmarks: FIX.landmarks,
          frameWidth: FIX.frameWidth, frameHeight: FIX.frameHeight,
          pose: { yaw: 0, pitch: 0, roll: 0 },
          quality: { faceDetected: true, coverage: 0.6, brightness: 0.55, blur: 0.02 },
        }],
      });
    expect(JSON.stringify(runPhysiognomyPipeline(mk()))).toBe(
      JSON.stringify(runPhysiognomyPipeline(mk())),
    );
  });
});
