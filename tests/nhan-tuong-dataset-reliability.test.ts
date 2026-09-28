/**
 * PHASE 1D-4 SLICE 2 — tập dữ liệu → bảng độ tin cậy.
 *
 * ⚠️ TOÀN BỘ DỮ LIỆU LÀ SYNTHETIC — NOT REAL RESEARCH DATA. Xem cảnh báo ở đầu
 * `tests/fixtures/research-samples.ts`. Hình dạng 5 người × 3 lượt × 3 máy = 15 mẫu ở
 * đây tồn tại để chứng minh BỘ ĐẾM THẬT SỰ SUY TỪ DỮ LIỆU, chứ không phải để chứng minh
 * điều gì về khuôn mặt người. Không feature nào thành `validated` vì tệp này.
 *
 * Hai nhóm test:
 *   · ĐỘT BIẾN — bỏ một người / một lượt / một máy / thêm trùng / bỏ feature / null /
 *     hạ confidence, rồi kiểm summary đổi ĐÚNG hướng.
 *   · BẤT BIẾN A–L — những điều phải đúng với MỌI tập, kiểm trên cả tập đầy.
 */
import { describe, expect, it } from "vitest";

import {
  DATASET_RELIABILITY_VERSION,
  buildDatasetReliability,
  loadDatasetReliability,
} from "../src/features/physiognomy/research/dataset-reliability";
import {
  countFeaturesAcrossSamples,
  loadResearchDataset,
} from "../src/features/physiognomy/research/dataset";
import { toReliabilityInput } from "../src/features/physiognomy/research/to-reliability";
import { buildReliability } from "../src/features/physiognomy/measurement-contract/reliability";
import { evaluateAll } from "../src/features/physiognomy/measurement-contract/policy";
import { MAY, fix, nhanh, tapDay } from "./fixtures/research-samples";

const YAW = "face.pose.yaw";
const MID = "face.three_courts.middle";

/** Nạp tập đầy rồi dựng bảng. Ném nếu nạp lỗi — test phải thấy lỗi ngay, không im. */
function dungTapDay(files = tapDay()) {
  const r = loadDatasetReliability(files);
  if (!r.ok) throw new Error(`tập phải nạp được, nhưng: ${r.errors.map((e) => e.code).join(",")}`);
  return r.result;
}

// ─────────────────────────────────────────────── điểm vào

describe("điểm vào duy nhất", () => {
  it("loadDatasetReliability nối đúng ba bước, không có bộ nạp thứ hai", () => {
    const res = dungTapDay();
    expect(res.version).toBe(DATASET_RELIABILITY_VERSION);
    expect(res.summary.sampleCount).toBe(15);
    expect(Object.keys(res.reliability).sort()).toEqual([YAW, MID]);
    // `counts` bày ra chính bộ đếm đã bơm vào hợp đồng — truy được, không phải tin.
    expect(res.counts[YAW].sampleCount).toBe(res.reliability[YAW].sampleCount);
  });

  it("cho kết quả Y HỆT việc tự xâu ba bước bằng tay", () => {
    const loaded = loadResearchDataset(tapDay());
    if (!loaded.ok) throw new Error("phải nạp được");
    const inp = toReliabilityInput(loaded.samples);
    const tay = buildReliability(inp.features, inp.counts);
    expect(dungTapDay().reliability).toEqual(tay);
  });

  it("tập còn nhãn trùng thì KHÔNG dựng bảng — đếm trên tập bẩn là đếm sai", () => {
    const r = loadDatasetReliability([
      fix("a.json", { pid: "A", run: 1, sessionId: "S1" }),
      fix("b.json", { pid: "A", run: 1, sessionId: "S2" }),
    ]);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.map((e) => e.code)).toEqual(["duplicate_sample_id"]);
    expect(r).not.toHaveProperty("result");
  });

  it("buildDatasetReliability thuần: nhận sẵn samples, không nạp lại", () => {
    const loaded = loadResearchDataset(tapDay());
    if (!loaded.ok) throw new Error("phải nạp được");
    const a = buildDatasetReliability(loaded.samples);
    const b = buildDatasetReliability(loaded.samples);
    expect(a).toEqual(b);
  });

  it("tập rỗng → bảng rỗng, KHÔNG phải bảng đầy số 0", () => {
    const res = buildDatasetReliability([]);
    expect(res.summary.sampleCount).toBe(0);
    expect(res.summary.participantCount).toBe(0);
    expect(res.reliability).toEqual({});
    expect(res.counts).toEqual({});
  });
});

// ─────────────────────────────────────────────── một bộ đếm duy nhất

describe("chỉ còn MỘT bộ đếm per-feature", () => {
  it("summary.perFeature và counts của adapter là cùng một hàm", () => {
    const loaded = loadResearchDataset(tapDay());
    if (!loaded.ok) throw new Error("phải nạp được");
    const chung = countFeaturesAcrossSamples(loaded.samples);
    expect(loaded.summary.perFeature).toEqual(chung);
    expect(toReliabilityInput(loaded.samples).counts).toEqual(chung);
  });

  it("feature null ở MỌI lượt vẫn có hàng, ở CẢ HAI nơi", () => {
    // Slice 1 lệch đúng chỗ này: `summarizeDataset` bỏ hàng, adapter thì giữ. Bỏ hàng
    // đi là làm một feature không đo được biến mất khỏi bảng thay vì hiện ra
    // `unsupported`.
    const files = tapDay().map((f, i) => fix(f.name, { pid: "ABCDE"[Math.floor(i / 3)], run: (i % 3) + 1, middle: null }));
    const loaded = loadResearchDataset(files);
    if (!loaded.ok) throw new Error("phải nạp được");
    expect(loaded.summary.perFeature).toHaveProperty(MID);
    expect(loaded.summary.perFeature[MID]).toEqual({
      sampleCount: 0,
      participantCount: 0,
      deviceCount: 0,
    });
    expect(toReliabilityInput(loaded.samples).counts).toHaveProperty(MID);
  });

  it("feature BỎ HẲN khỏi payload thì KHÔNG có hàng — khác với null", () => {
    const files = tapDay().map((f, i) =>
      fix(f.name, { pid: "ABCDE"[Math.floor(i / 3)], run: (i % 3) + 1, boMiddle: true }),
    );
    const loaded = loadResearchDataset(files);
    if (!loaded.ok) throw new Error("phải nạp được");
    // "không có mặt" và "có mặt nhưng không đo được" là hai chuyện khác nhau.
    expect(loaded.summary.perFeature).not.toHaveProperty(MID);
    expect(Object.keys(buildDatasetReliability(loaded.samples).reliability)).toEqual([YAW]);
  });
});

// ─────────────────────────────────────────────── ĐỘT BIẾN

describe("đột biến — summary phải đổi đúng hướng", () => {
  it("bỏ MỘT NGƯỜI → participantCount giảm, sampleCount giảm 3", () => {
    const goc = dungTapDay().summary;
    const res = dungTapDay(tapDay().filter((f) => !f.name.startsWith("C__"))).summary;
    expect(goc.participantCount).toBe(5);
    expect(res.participantCount).toBe(4);
    expect(res.participants).toEqual(["A", "B", "D", "E"]);
    expect(res.sampleCount).toBe(12);
    // Bỏ cả một người thì những người còn lại vẫn đủ 3 lượt.
    expect(res.minRunsPerParticipant).toBe(3);
  });

  it("bỏ MỘT LƯỢT của một người → minRunsPerParticipant tụt, runCount giữ nguyên", () => {
    const res = dungTapDay(tapDay().filter((f) => f.name !== "C__run3.json")).summary;
    expect(res.participantCount).toBe(5);
    expect(res.sampleCount).toBe(14);
    expect(res.runsPerParticipant).toEqual({ A: 3, B: 3, C: 2, D: 3, E: 3 });
    expect(res.minRunsPerParticipant).toBe(2);
    // Lượt số 3 vẫn tồn tại ở người khác, nên runCount không đổi.
    expect(res.runCount).toBe(3);
  });

  it("bỏ lượt 3 của MỌI người → runCount giảm còn 2", () => {
    const res = dungTapDay(tapDay().filter((f) => !f.name.endsWith("run3.json"))).summary;
    expect(res.runCount).toBe(2);
    expect(res.runs).toEqual([1, 2]);
    expect(res.minRunsPerParticipant).toBe(2);
    expect(res.sampleCount).toBe(10);
  });

  it("bỏ MỘT MÁY → deviceCount giảm, số người giữ nguyên", () => {
    // Đổi mọi lượt của C (máy samsung) sang pixel → còn 2 máy.
    const files = tapDay().map((f) =>
      f.name.startsWith("C__")
        ? fix(f.name, { pid: "C", run: Number(f.name.slice(-6, -5)), device: MAY.pixel })
        : f,
    );
    const res = dungTapDay(files).summary;
    expect(res.participantCount).toBe(5);
    expect(res.deviceCount).toBe(2);
  });

  it("MỘT MÁY duy nhất → deviceCount = 1", () => {
    const files = tapDay().map((f, i) =>
      fix(f.name, { pid: "ABCDE"[Math.floor(i / 3)], run: (i % 3) + 1, device: MAY.iphone }),
    );
    expect(dungTapDay(files).summary.deviceCount).toBe(1);
  });

  it("THÊM MỘT MẪU TRÙNG → không dựng được bảng, không âm thầm đếm 16", () => {
    const r = loadDatasetReliability([...tapDay(), fix("A__run1 (1).json", { pid: "A", run: 1, sessionId: "KHAC" })]);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors[0].code).toBe("duplicate_sample_id");
    expect(r.errors[0].sources).toHaveLength(2);
  });

  it("NULL feature ở một lượt → per-feature giảm 1, tổng sampleCount KHÔNG đổi", () => {
    const files = tapDay();
    const bay = nhanh(files[6]).featureProfile as { features: Record<string, unknown>[] };
    bay.features[1].v = null;
    bay.features[1].s = "unsupported";
    const res = dungTapDay(files);
    expect(res.summary.sampleCount).toBe(15);
    expect(res.summary.perFeature[YAW].sampleCount).toBe(15);
    expect(res.summary.perFeature[MID].sampleCount).toBe(14);
    // Và một lượt thiếu KHÔNG kéo status xuống — bài học của Slice 1.
    expect(res.reliability[MID].measurementStatus).toBe("low_confidence");
    expect(res.reliability[MID].sampleCount).toBe(14);
  });

  it("HẠ CONFIDENCE ở một lượt → bảng lấy mức THẤP NHẤT", () => {
    const files = tapDay();
    const bay = nhanh(files[3]).featureProfile as { features: Record<string, unknown>[] };
    bay.features[0].c = 0.11;
    bay.features[0].s = "low_confidence";
    const res = dungTapDay(files);
    expect(res.reliability[YAW].confidence).toBe(0.11);
    expect(res.reliability[YAW].measurementStatus).toBe("low_confidence");
    // Số đếm không bị ảnh hưởng: lượt đó vẫn có số.
    expect(res.reliability[YAW].sampleCount).toBe(15);
  });
});

// ─────────────────────────────────────────────── BẤT BIẾN A–L

describe("bất biến A–L", () => {
  const res = dungTapDay();
  const s = res.summary;
  const loaded = loadResearchDataset(tapDay());
  const samples = loaded.ok ? loaded.samples : [];

  it("A — participantCount === số participantId khác nhau", () => {
    const that = new Set(samples.map((x) => x.sample.participantId)).size;
    expect(s.participantCount).toBe(that);
    expect(s.participantCount).toBe(s.participants.length);
  });

  it("B — deviceCount === số khoá raw.device khác nhau", () => {
    const that = new Set(samples.map((x) => x.deviceKey)).size;
    expect(s.deviceCount).toBe(that);
    expect(s.deviceCount).toBe(s.devices.length);
    // Và KHÔNG đếm theo nhãn người vận hành: cả 15 tệp cùng một nhãn.
    expect(new Set(samples.map((x) => x.sample.deviceLabel)).size).toBe(1);
    expect(s.deviceCount).toBeGreaterThan(1);
  });

  it("C — runCount === số lượt có mặt", () => {
    const that = new Set(samples.map((x) => x.sample.runNumber)).size;
    expect(s.runCount).toBe(that);
    expect(s.runCount).toBe(s.runs.length);
  });

  it("D — sampleCount === số mẫu nghiên cứu HỢP LỆ, không phải số tệp", () => {
    expect(s.sampleCount).toBe(samples.length);
    // Thêm một tệp hỏng: sampleCount không tăng.
    const r2 = loadDatasetReliability([...tapDay(), fix("hong.json", { pid: "Z", device: null })]);
    if (!r2.ok) throw new Error("phải nạp được");
    expect(r2.result.summary.sampleCount).toBe(15);
    expect(r2.rejected).toHaveLength(1);
  });

  it("E/F/G — mọi con số per-feature không vượt con số tổng", () => {
    for (const [k, c] of Object.entries(s.perFeature)) {
      expect(c.sampleCount, `E ${k}`).toBeLessThanOrEqual(s.sampleCount);
      expect(c.participantCount, `F ${k}`).toBeLessThanOrEqual(s.participantCount);
      expect(c.deviceCount, `G ${k}`).toBeLessThanOrEqual(s.deviceCount);
    }
  });

  it("E/F/G — vẫn đúng khi tập bị cắt xén nhiều kiểu", () => {
    const bienThe = [
      tapDay().filter((f) => !f.name.startsWith("C__")),
      tapDay().filter((f) => f.name !== "C__run3.json"),
      tapDay().slice(0, 4),
      [tapDay()[0]],
    ];
    for (const files of bienThe) {
      const t = dungTapDay(files).summary;
      for (const [k, c] of Object.entries(t.perFeature)) {
        expect(c.sampleCount, `E ${k}`).toBeLessThanOrEqual(t.sampleCount);
        expect(c.participantCount, `F ${k}`).toBeLessThanOrEqual(t.participantCount);
        expect(c.deviceCount, `G ${k}`).toBeLessThanOrEqual(t.deviceCount);
      }
    }
  });

  it("H — unsupported ⇒ sampleCount === 0", () => {
    const files = tapDay().map((f, i) =>
      fix(f.name, { pid: "ABCDE"[Math.floor(i / 3)], run: (i % 3) + 1, middle: null }),
    );
    const r = dungTapDay(files);
    for (const v of Object.values(r.reliability)) {
      if (v.measurementStatus === "unsupported") {
        expect(v.sampleCount, v.featureKey).toBe(0);
      }
    }
    expect(r.reliability[MID].measurementStatus).toBe("unsupported");
    expect(r.reliability[MID].sampleCount).toBe(0);
  });

  it("I — sampleCount > 0 ⇒ KHÔNG unsupported", () => {
    // Kiểm trên tập đầy và trên tập có một lượt thiếu số.
    const files = tapDay();
    const bay = nhanh(files[6]).featureProfile as { features: Record<string, unknown>[] };
    bay.features[1].v = null;
    bay.features[1].s = "unsupported";
    for (const r of [dungTapDay(), dungTapDay(files)]) {
      for (const v of Object.values(r.reliability)) {
        if (v.sampleCount > 0) {
          expect(v.measurementStatus, v.featureKey).not.toBe("unsupported");
        }
      }
    }
  });

  it("J — số đếm KHÔNG thể đổi validationStatus", () => {
    const loadedOk = loadResearchDataset(tapDay());
    if (!loadedOk.ok) throw new Error("phải nạp được");
    const inp = toReliabilityInput(loadedOk.samples);
    const khongDem = buildReliability(inp.features);
    const coDem = buildReliability(inp.features, inp.counts);
    for (const k of Object.keys(coDem)) {
      expect(coDem[k].validationStatus, k).toBe(khongDem[k].validationStatus);
      expect(coDem[k].validationStatus, k).not.toBe("validated");
    }
    // Và số đếm thì PHẢI đổi — nếu không thì test này vô nghĩa.
    expect(coDem[YAW].sampleCount).not.toBe(khongDem[YAW].sampleCount);
  });

  it("K — số đếm KHÔNG thể đổi evidenceLevel", () => {
    const loadedOk = loadResearchDataset(tapDay());
    if (!loadedOk.ok) throw new Error("phải nạp được");
    const inp = toReliabilityInput(loadedOk.samples);
    const khongDem = buildReliability(inp.features);
    const coDem = buildReliability(inp.features, inp.counts);
    for (const k of Object.keys(coDem)) {
      expect(coDem[k].evidenceLevel, k).toBe(khongDem[k].evidenceLevel);
      expect(coDem[k].evidenceLevel, k).not.toBe("multi_device");
    }
  });

  it("K2 — ba cờ kiểm chứng cũng KHÔNG bị suy ra từ dữ liệu", () => {
    const loadedOk = loadResearchDataset(tapDay());
    if (!loadedOk.ok) throw new Error("phải nạp được");
    const inp = toReliabilityInput(loadedOk.samples);
    const khongDem = buildReliability(inp.features);
    const coDem = buildReliability(inp.features, inp.counts);
    for (const k of Object.keys(coDem)) {
      expect(coDem[k].distanceTested, k).toBe(khongDem[k].distanceTested);
      expect(coDem[k].poseTested, k).toBe(khongDem[k].poseTested);
      expect(coDem[k].lightingTested, k).toBe(khongDem[k].lightingTested);
    }
  });

  it("L — số đếm KHÔNG thể tự làm eligible = true", () => {
    const el = evaluateAll(res.reliability);
    expect(Object.values(el).filter((v) => v.eligible)).toHaveLength(0);
    const yaw = el[YAW];
    // Ba lý do ĐẾM đã bị dữ liệu dẹp…
    expect(yaw.reasons).not.toContain("not_enough_participants");
    expect(yaw.reasons).not.toContain("not_enough_samples");
    // …deviceCount = 3 ≥ 2 nên lý do máy cũng hết.
    expect(res.summary.deviceCount).toBeGreaterThanOrEqual(2);
    expect(yaw.reasons).not.toContain("not_enough_devices");
    // …NHƯNG hai lý do cốt lõi vẫn chặn, và chúng không phải chuyện đếm.
    expect(yaw.reasons).toContain("validation_not_validated");
    expect(yaw.reasons).toContain("no_verified_source");
    expect(yaw.reasons).toContain("evidence_level_too_low");
  });

  it("L2 — kể cả khi mọi đếm vượt ngưỡng, eligible vẫn 0 trên CẢ bảng", () => {
    expect(res.summary.participantCount).toBeGreaterThanOrEqual(5);
    expect(res.summary.minRunsPerParticipant).toBeGreaterThanOrEqual(3);
    expect(res.summary.deviceCount).toBeGreaterThanOrEqual(2);
    expect(res.summary.sampleCount).toBeGreaterThanOrEqual(15);
    const el = evaluateAll(res.reliability);
    expect(Object.values(el).every((v) => !v.eligible)).toBe(true);
  });
});

// ─────────────────────────────────────────────── tương thích ngược

describe("tương thích ngược", () => {
  it("không truyền datasetCounts → vẫn là số viết tay của bảng tĩnh", () => {
    const a = buildReliability([{ key: YAW, status: "measured", confidence: 0.9 }]);
    expect(a[YAW].sampleCount).toBe(6);
    expect(a[YAW].participantCount).toBe(1);
    expect(a[YAW].deviceCount).toBe(1);
  });

  it("bảng nói rõ số đếm đến từ dataset, không để ai nhầm với bộ mẫu ảnh 1D-3", () => {
    const gh = dungTapDay().reliability[YAW].knownLimitations.join(" ");
    expect(gh).toMatch(/tập dữ liệu nghiên cứu/);
    expect(gh).toMatch(/15 lượt/);
    expect(gh).toMatch(/5 người/);
    expect(gh).toMatch(/3 máy/);
    expect(gh).toMatch(/KHÔNG phải từ bộ mẫu ảnh Phase 1D-3/);
  });

  it("measurementStatus và confidence vẫn đến từ Feature Layer, không từ tầng này", () => {
    const res = dungTapDay();
    expect(res.reliability[YAW].measurementStatus).toBe("measured");
    expect(res.reliability[YAW].confidence).toBe(0.9);
    expect(res.reliability[MID].measurementStatus).toBe("low_confidence");
    expect(res.reliability[MID].confidence).toBe(0.7);
  });
});
