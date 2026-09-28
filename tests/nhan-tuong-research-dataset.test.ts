/**
 * PHASE 1D-4 — nạp tập dữ liệu nghiên cứu (Validation Foundation, lát 1).
 *
 * ⚠️ MỌI DỮ LIỆU TRONG TỆP NÀY LÀ FIXTURE DỰNG TAY. Không một byte nào đến từ người
 * thật. Test ở đây chứng minh HỢP ĐỒNG của loader — nó nhận gì, từ chối gì, đếm ra sao
 * — chứ KHÔNG chứng minh bất cứ điều gì về khuôn mặt người. Repo hiện không có tệp
 * nghiên cứu thật nào để dùng (mẫu thật duy nhất, Q3DD4K22BY, đã bị KV xoá vì hết TTL
 * 15 phút, và nó vốn cũng thiếu nhãn lẫn khai báo máy).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ACCEPTED_EXPORT_VERSION,
  REQUIRED_VIEW_COUNT,
  RESEARCH_DATASET_VERSION,
  deviceKeyOf,
  loadResearchDataset,
  parseResearchSample,
  summarizeDataset,
  viewsPresentIn,
  type DatasetInput,
} from "../src/features/physiognomy/research/dataset";
import { toReliabilityInput } from "../src/features/physiognomy/research/to-reliability";
import { buildReliability } from "../src/features/physiognomy/measurement-contract/reliability";
import { evaluateAll } from "../src/features/physiognomy/measurement-contract/policy";
import { VIEW_NAMES } from "../src/features/physiognomy/features/schema";
import { DEVICE_MODEL_UNAVAILABLE } from "../src/features/physiognomy/session/device";
// Fixture dùng chung với test Slice 2 — xem cảnh báo SYNTHETIC ở đầu tệp đó.
import { MAY, fix, payload, tapDay } from "./fixtures/research-samples";

// ─────────────────────────────────────────────────────────── A. nạp hợp lệ

describe("A — nạp mẫu hợp lệ", () => {
  it("một tệp hợp lệ → ResearchSample đủ trường", () => {
    const r = parseResearchSample(fix("A__run1.json"));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.sample.sample).toEqual({
      participantId: "A",
      runNumber: 1,
      sampleId: "A-01",
      deviceLabel: "may-van-hanh",
    });
    expect(r.sample.device).toEqual(MAY.pixel);
    expect(r.sample.sessionId).toBe("SESSA1");
    expect(r.sample.completedAt).toBe(1_790_000_000_001);
    expect(r.sample.deviceKey).toBe("Android 14|Chrome 126|Pixel 8");
    expect(r.sample.source).toBe("A__run1.json");
  });

  it("nhận cả chuỗi JSON thô, không chỉ object đã parse", () => {
    const f = fix("A__run1.json");
    const r = parseResearchSample({ name: f.name, content: JSON.stringify(f.content) });
    expect(r.ok).toBe(true);
  });

  it("tập đầy 15 tệp → ok", () => {
    const r = loadResearchDataset(tapDay());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.samples).toHaveLength(15);
    expect(r.rejected).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────── B–E. từ chối

describe("B — từ chối tệp hỏng, KHÔNG sửa chữa âm thầm", () => {
  const xau = (content: unknown, code: string) => {
    const r = parseResearchSample({ name: "x.json", content });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.rejection.code).toBe(code);
  };

  it("JSON hỏng cú pháp", () => xau("{ khong phai json", "malformed_json"));
  it("không phải object", () => xau("[1,2,3]", "not_object"));
  it("sai exportVersion", () => {
    const f = fix("x.json");
    xau({ ...(f.content as object), exportVersion: "v0" }, "bad_export_version");
  });
  it("Feature JSON sai version", () => {
    const c = f2({ featureProfile: { transportVersion: "sai" } });
    xau(c, "bad_feature_profile");
  });
  it("Feature JSON thuộc phiên KHÁC", () => {
    const c = f2({ featureProfile: payload("PHIEN_KHAC") });
    xau(c, "session_mismatch");
  });
  it("provenance lệch thân tệp", () => {
    const f = fix("x.json", {
      provenance: {
        participantId: "A",
        runNumber: 1,
        sampleId: "A-01",
        device: MAY.pixel,
        sessionId: "SESSA1",
        capturedAt: 999,
      },
    });
    xau(f.content, "provenance_mismatch");
  });
  it("sampleId tự mâu thuẫn với participant/run", () => {
    const c = f2({ sample: { participantId: "A", runNumber: 1, sampleId: "B-99", deviceLabel: "x" } });
    xau(c, "bad_sample_id");
  });
});

/** Ghi đè một nhánh của fixture hợp lệ. */
function f2(patch: Record<string, unknown>): unknown {
  const base = fix("x.json").content as Record<string, unknown>;
  return { ...base, ...patch };
}

describe("C — từ chối khi thiếu khai báo máy", () => {
  it("device = null → no_device", () => {
    const r = parseResearchSample(fix("x.json", { device: null }));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.rejection.code).toBe("no_device");
    // Nói rõ vì sao nhãn người vận hành không thay được khai báo máy.
    expect(r.rejection.message).toMatch(/deviceLabel/);
  });

  it("device có nhưng không nhận ra os/browser → device_not_identified", () => {
    const r = parseResearchSample(
      fix("x.json", { device: { os: "unknown", browser: "unknown", model: DEVICE_MODEL_UNAVAILABLE } }),
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.rejection.code).toBe("device_not_identified");
  });

  it("iOS không có model VẪN nhận — web không bao giờ cho biết model iPhone", () => {
    const r = parseResearchSample(fix("x.json", { device: MAY.iphone }));
    expect(r.ok).toBe(true);
  });
});

describe("D — từ chối khi thiếu người", () => {
  it("không có nhãn sample", () => {
    const r = parseResearchSample({ name: "x.json", content: f2({ sample: null }) });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.rejection.code).toBe("no_sample_label");
  });

  it("participantId không phải mã nghiên cứu", () => {
    for (const pid of ["Nguyễn Văn A", "", "abcde", "a"]) {
      const c = f2({ sample: { participantId: pid, runNumber: 1, sampleId: "A-01", deviceLabel: "x" } });
      const r = parseResearchSample({ name: "x.json", content: c });
      expect(r.ok, pid).toBe(false);
      if (!r.ok) expect(r.rejection.code).toBe("bad_participant_id");
    }
  });
});

describe("E — từ chối khi thiếu lượt / phiên / thời điểm", () => {
  it("runNumber sai", () => {
    for (const run of [0, -1, 1.5, 999, "1"]) {
      const c = f2({ sample: { participantId: "A", runNumber: run, sampleId: "A-01", deviceLabel: "x" } });
      const r = parseResearchSample({ name: "x.json", content: c });
      expect(r.ok, String(run)).toBe(false);
      if (!r.ok) expect(r.rejection.code).toBe("bad_run_number");
    }
  });

  it("thiếu sessionId", () => {
    const r = parseResearchSample({ name: "x.json", content: f2({ sessionId: "" }) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.rejection.code).toBe("no_session_id");
  });

  it("thiếu completedAt → lượt chưa hoàn tất", () => {
    const r = parseResearchSample(fix("x.json", { completedAt: null }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.rejection.code).toBe("no_completed_at");
  });

  it("thiếu Feature JSON, và mang theo lý do nếu tệp có ghi", () => {
    const r = parseResearchSample({
      name: "x.json",
      content: f2({ featureProfile: null, featureError: "MediaPipe không nạp được" }),
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.rejection.code).toBe("no_feature_profile");
      expect(r.rejection.message).toMatch(/MediaPipe/);
    }
  });
});

// ─────────────────────────────────────────────────────────── F–G. trùng

describe("F — TRÙNG sampleId làm cả tập không dùng được", () => {
  it("hai tệp cùng nhãn A-01 → ok:false, liệt kê CẢ HAI tệp", () => {
    const r = loadResearchDataset([
      fix("A__run1.json", { sessionId: "S1" }),
      fix("A__run1 (1).json", { sessionId: "S2" }),
    ]);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.map((e) => e.code)).toContain("duplicate_sample_id");
    const e = r.errors.find((x) => x.code === "duplicate_sample_id")!;
    expect(e.sources.sort()).toEqual(["A__run1 (1).json", "A__run1.json"]);
  });

  it("KHÔNG tự chọn 'bản mới thắng' — không trả summary khi còn trùng", () => {
    const r = loadResearchDataset([
      fix("a.json", { sessionId: "S1", completedAt: 1_790_000_000_001 }),
      fix("b.json", { sessionId: "S2", completedAt: 1_790_000_009_999 }),
    ]);
    expect(r.ok).toBe(false);
    // Hai lượt vẫn parse được, nhưng tập không có summary: chọn hộ là quyết định thay người.
    if (!r.ok) expect(r).not.toHaveProperty("summary");
  });
});

describe("G — TRÙNG người+lượt", () => {
  it("cùng A lượt 1 ở hai tệp khác tên → bị bắt, DƯỚI DẠNG trùng sampleId", () => {
    // Bản test đầu chỉ khẳng định `errors.length > 0`, nên nó xanh mà không chứng minh
    // được điều nó nói. `sampleId` bị buộc phải bằng `${pid}-${run}`, nên trùng
    // người+lượt TẤT YẾU hiện ra là trùng sampleId — và đó là mã duy nhất phát ra.
    const r = loadResearchDataset([
      fix("x.json", { pid: "A", run: 1, sessionId: "S1" }),
      fix("y.json", { pid: "A", run: 1, sessionId: "S2" }),
    ]);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.map((e) => e.code)).toEqual(["duplicate_sample_id"]);
    expect(r.errors[0].sources.sort()).toEqual(["x.json", "y.json"]);
    // Thông điệp phải nói được CẢ người và lượt, để người vận hành không phải tự giải mã.
    expect(r.errors[0].message).toMatch(/người A/);
    expect(r.errors[0].message).toMatch(/lượt 1/);
  });

  it("không thể có trùng người+lượt mà KHÔNG trùng sampleId", () => {
    // Nếu ai đó sửa tay sampleId cho khác đi, lượt đó bị loại từ trước ở `bad_sample_id`
    // — nên nhánh "trùng người+lượt riêng" là bất khả, và code không giữ nhánh đó.
    const a = fix("x.json", { pid: "A", run: 1, sessionId: "S1" });
    (((a.content as Record<string, unknown>).sample) as Record<string, unknown>).sampleId = "A-99";
    const r = parseResearchSample(a);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.rejection.code).toBe("bad_sample_id");
  });

  it("người khác nhau cùng số lượt thì KHÔNG phải trùng", () => {
    const r = loadResearchDataset([
      fix("a.json", { pid: "A", run: 1 }),
      fix("b.json", { pid: "B", run: 1 }),
    ]);
    expect(r.ok).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────── phiên dở

describe("phiên quét DỞ bị chặn ở tầng nạp dữ liệu", () => {
  it(`ít hơn ${REQUIRED_VIEW_COUNT} view → incomplete_session`, () => {
    for (const n of [0, 1, 3, 5]) {
      const r = parseResearchSample(fix("x.json", { soView: n }));
      expect(r.ok, `${n} view`).toBe(false);
      if (!r.ok) expect(r.rejection.code).toBe("incomplete_session");
    }
  });

  it(`đủ ${REQUIRED_VIEW_COUNT} view → nhận`, () => {
    expect(parseResearchSample(fix("x.json", { soView: REQUIRED_VIEW_COUNT })).ok).toBe(true);
  });

  it("đếm view đọc từ payload, không từ trường nào khác", () => {
    expect(viewsPresentIn(payload("S") as never)).toBe(REQUIRED_VIEW_COUNT);
    expect(viewsPresentIn(payload("S", { soView: 2 }) as never)).toBe(2);
  });

  it("một lượt dở KHÔNG làm chết cả tập — chỉ nó bị loại", () => {
    const r = loadResearchDataset([
      fix("a.json", { pid: "A", run: 1 }),
      fix("b.json", { pid: "B", run: 1, soView: 1 }),
    ]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.samples).toHaveLength(1);
    expect(r.rejected).toHaveLength(1);
    expect(r.rejected[0].code).toBe("incomplete_session");
  });
});

// ─────────────────────────────────────────────────────────── H–K. đếm

describe("H–K — mọi con số SUY TỪ dữ liệu, không hằng số", () => {
  it("tập rỗng → 0/0/0/0, không phải 5/2/15", () => {
    const s = summarizeDataset([]);
    expect(s.sampleCount).toBe(0);
    expect(s.participantCount).toBe(0);
    expect(s.deviceCount).toBe(0);
    expect(s.runCount).toBe(0);
    expect(s.minRunsPerParticipant).toBe(0);
    expect(s.datasetVersion).toBe(RESEARCH_DATASET_VERSION);
  });

  it("H — participantCount đếm NGƯỜI khác nhau, không đếm tệp", () => {
    const r = loadResearchDataset(tapDay());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.summary.participantCount).toBe(5);
    expect(r.summary.participants).toEqual(["A", "B", "C", "D", "E"]);
  });

  it("I — deviceCount đọc raw.device, KHÔNG đọc sample.deviceLabel", () => {
    // Cả ba tệp có deviceLabel GIỐNG NHAU ("may-van-hanh") nhưng device KHÁC nhau.
    // Nếu đếm theo nhãn người vận hành thì ra 1; đếm theo máy tự khai thì ra 3.
    const r = loadResearchDataset([
      fix("a.json", { pid: "A", run: 1, device: MAY.pixel }),
      fix("b.json", { pid: "B", run: 1, device: MAY.iphone }),
      fix("c.json", { pid: "C", run: 1, device: MAY.samsung }),
    ]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.summary.deviceCount).toBe(3);
    expect(r.samples.every((s) => s.sample.deviceLabel === "may-van-hanh")).toBe(true);
  });

  it("I — ngược lại: nhãn người vận hành KHÁC nhau mà máy giống thì vẫn là 1 máy", () => {
    const a = fix("a.json", { pid: "A", run: 1, device: MAY.pixel });
    const b = fix("b.json", { pid: "B", run: 1, device: MAY.pixel });
    (((a.content as Record<string, unknown>).sample) as Record<string, unknown>).deviceLabel = "iPhone-15";
    (((b.content as Record<string, unknown>).sample) as Record<string, unknown>).deviceLabel = "Pixel-8";
    const r = loadResearchDataset([a, b]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.summary.deviceCount).toBe(1);
  });

  it("khoá máy chỉ ghép ba trường DeviceInfo, không sinh thêm thông tin", () => {
    expect(deviceKeyOf(MAY.pixel)).toBe("Android 14|Chrome 126|Pixel 8");
    // model không biết → bỏ trống, KHÔNG nhét chuỗi "device_model_unavailable" vào khoá.
    expect(deviceKeyOf(MAY.iphone)).toBe("iOS 17|Safari 17|");
  });

  it("J — runCount và số lượt mỗi người", () => {
    const r = loadResearchDataset(tapDay());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.summary.runCount).toBe(3);
    expect(r.summary.runs).toEqual([1, 2, 3]);
    expect(r.summary.runsPerParticipant).toEqual({ A: 3, B: 3, C: 3, D: 3, E: 3 });
    expect(r.summary.minRunsPerParticipant).toBe(3);
  });

  it("J — thiếu lượt của MỘT người thì minRunsPerParticipant tụt theo người đó", () => {
    const tap = tapDay().filter((f) => f.name !== "C__run3.json");
    const r = loadResearchDataset(tap);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.summary.runsPerParticipant.C).toBe(2);
    expect(r.summary.minRunsPerParticipant).toBe(2);
  });

  it("K — sampleCount là số lượt NHẬN được, không phải số tệp đưa vào", () => {
    const r = loadResearchDataset([...tapDay(), fix("hong.json", { pid: "Z", device: null })]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.summary.sampleCount).toBe(15);
    expect(r.rejected).toHaveLength(1);
  });

  it("đếm RIÊNG từng feature, chỉ tính lượt feature đó có số thật", () => {
    // B-01 có middle = null (unsupported) → feature đó chỉ còn 1 lượt, 1 người.
    const r = loadResearchDataset([
      fix("a.json", { pid: "A", run: 1, device: MAY.pixel }),
      fix("b.json", { pid: "B", run: 1, device: MAY.iphone, middle: null }),
    ]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.summary.perFeature["face.pose.yaw"]).toEqual({
      sampleCount: 2,
      participantCount: 2,
      deviceCount: 2,
    });
    expect(r.summary.perFeature["face.three_courts.middle"]).toEqual({
      sampleCount: 1,
      participantCount: 1,
      deviceCount: 1,
    });
  });
});

// ─────────────────────────────────────────────────────────── L. payload nguyên vẹn

describe("L — Feature JSON giữ nguyên qua loader", () => {
  it("payload sau khi nạp khớp payload trong tệp", () => {
    const f = fix("a.json");
    const goc = (f.content as Record<string, unknown>).featureProfile;
    const r = parseResearchSample(f);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.sample.featureProfile).toEqual(goc);
  });

  it("loader KHÔNG thêm, bớt hay đổi feature nào", () => {
    const r = parseResearchSample(fix("a.json"));
    if (!r.ok) throw new Error("phải nạp được");
    const fs = r.sample.featureProfile.features;
    expect(fs).toHaveLength(2);
    expect(fs.map((x) => x.k)).toEqual(["face.pose.yaw", "face.three_courts.middle"]);
    // Không biến null thành 0, không nâng status.
    expect(fs.find((x) => x.k === "face.three_courts.middle")!.s).toBe("low_confidence");
  });
});

// ─────────────────────────────────────────────────────────── M. không nâng trạng thái

describe("M — số đếm thật KHÔNG nâng trạng thái kiểm chứng", () => {
  it("lượt KHÔNG ra số thì không được bỏ phiếu về status", () => {
    // Bản đầu để lượt `v === null` bỏ phiếu, nên MỘT lượt thiếu view kéo cả feature
    // xuống `unsupported` trong khi phần đếm vẫn ghi đủ lượt còn lại — bản ghi tự mâu
    // thuẫn: "không đo được" mà lại "đo N lần". Phần đếm vốn bỏ qua `v === null`; phần
    // gộp status nay theo cùng một luật.
    const r = loadResearchDataset([
      fix("a.json", { pid: "A", run: 1 }),
      fix("b.json", { pid: "B", run: 1, middle: null }),
    ]);
    if (!r.ok) throw new Error("phải nạp được");
    const inp = toReliabilityInput(r.samples);
    const mid = inp.features.find((f) => f.key === "face.three_courts.middle")!;
    expect(mid.status).toBe("low_confidence");
    expect(inp.counts["face.three_courts.middle"].sampleCount).toBe(1);
  });

  it("bất đồng status GIỮA CÁC LƯỢT CÓ SỐ thì vẫn lấy bản XẤU NHẤT", () => {
    const a = fix("a.json", { pid: "A", run: 1 });
    const b = fix("b.json", { pid: "B", run: 1 });
    // Cùng có số, nhưng một lượt tự khai status thấp hơn và confidence thấp hơn.
    const fb = ((b.content as Record<string, unknown>).featureProfile) as {
      features: Record<string, unknown>[];
    };
    fb.features[0].s = "low_confidence";
    fb.features[0].c = 0.31;
    const r = loadResearchDataset([a, b]);
    if (!r.ok) throw new Error("phải nạp được");
    const inp = toReliabilityInput(r.samples);
    const yaw = inp.features.find((f) => f.key === "face.pose.yaw")!;
    expect(yaw.status).toBe("low_confidence");
    expect(yaw.confidence).toBe(0.31);
  });

  it("KHÔNG lượt nào ra số → unsupported với đếm 0, không phải một con số giả", () => {
    const r = loadResearchDataset([
      fix("a.json", { pid: "A", run: 1, middle: null }),
      fix("b.json", { pid: "B", run: 1, middle: null }),
    ]);
    if (!r.ok) throw new Error("phải nạp được");
    const inp = toReliabilityInput(r.samples);
    const mid = inp.features.find((f) => f.key === "face.three_courts.middle")!;
    expect(mid.status).toBe("unsupported");
    expect(mid.confidence).toBe(0);
    expect(inp.counts["face.three_courts.middle"]).toEqual({
      sampleCount: 0,
      participantCount: 0,
      deviceCount: 0,
    });
  });

  it("bản ghi cuối KHÔNG được tự mâu thuẫn: unsupported thì đếm phải là 0", () => {
    // Đây là bất biến mà lỗi cũ vi phạm. Khoá lại trên tập 15 lượt, một lượt thiếu số.
    const tap = tapDay();
    const bay = (tap[6].content as Record<string, unknown>).featureProfile as {
      features: Record<string, unknown>[];
    };
    bay.features[1].v = null;
    bay.features[1].s = "unsupported";
    const r = loadResearchDataset(tap);
    if (!r.ok) throw new Error("phải nạp được");
    const inp = toReliabilityInput(r.samples);
    const rel = buildReliability(inp.features, inp.counts);
    for (const v of Object.values(rel)) {
      if (v.measurementStatus === "unsupported") {
        expect(v.sampleCount, v.featureKey).toBe(0);
      }
      if (v.sampleCount > 0) {
        expect(v.measurementStatus, v.featureKey).not.toBe("unsupported");
      }
    }
    // Và feature bị thiếu ở 1 lượt vẫn giữ được 14 lượt kia.
    expect(rel["face.three_courts.middle"].sampleCount).toBe(14);
    expect(rel["face.three_courts.middle"].measurementStatus).toBe("low_confidence");
  });

  it("dataset ĐÍCH (5 người / 3 máy / 15 lượt) vào contract: số đếm đổi, kiểm chứng KHÔNG", () => {
    const r = loadResearchDataset(tapDay());
    if (!r.ok) throw new Error("phải nạp được");
    const inp = toReliabilityInput(r.samples);

    const khongDem = buildReliability(inp.features);
    const coDem = buildReliability(inp.features, inp.counts);

    const k = "face.pose.yaw";
    // Trước: 6/1/1 viết tay. Sau: đếm từ dữ liệu.
    expect(khongDem[k].sampleCount).toBe(6);
    expect(khongDem[k].participantCount).toBe(1);
    expect(coDem[k].sampleCount).toBe(15);
    expect(coDem[k].participantCount).toBe(5);
    expect(coDem[k].deviceCount).toBe(3);

    // NHƯNG hai thứ quyết định việc phong thì y nguyên.
    expect(coDem[k].validationStatus).toBe(khongDem[k].validationStatus);
    expect(coDem[k].evidenceLevel).toBe(khongDem[k].evidenceLevel);
    expect(coDem[k].validationStatus).not.toBe("validated");
  });

  it("KHÔNG feature nào thành validated dù đếm đủ ngưỡng", () => {
    const r = loadResearchDataset(tapDay());
    if (!r.ok) throw new Error("phải nạp được");
    const inp = toReliabilityInput(r.samples);
    const rel = buildReliability(inp.features, inp.counts);
    for (const v of Object.values(rel)) {
      expect(v.validationStatus, v.featureKey).not.toBe("validated");
    }
  });

  it("cổng tư cách vẫn ĐÓNG: số đếm đủ nhưng chưa kiểm chứng, chưa có nguồn", () => {
    const r = loadResearchDataset(tapDay());
    if (!r.ok) throw new Error("phải nạp được");
    const inp = toReliabilityInput(r.samples);
    const el = evaluateAll(buildReliability(inp.features, inp.counts));
    expect(Object.values(el).filter((v) => v.eligible)).toHaveLength(0);
    const yaw = el["face.pose.yaw"];
    // Ba lý do ĐẾM đã được dẹp bởi dữ liệu thật…
    expect(yaw.reasons).not.toContain("not_enough_participants");
    expect(yaw.reasons).not.toContain("not_enough_devices");
    expect(yaw.reasons).not.toContain("not_enough_samples");
    // …nhưng hai lý do CỐT LÕI vẫn còn, và chúng mới là thứ chặn.
    expect(yaw.reasons).toContain("validation_not_validated");
    expect(yaw.reasons).toContain("no_verified_source");
  });

  it("không truyền số đếm → hành vi y như trước lát này (tương thích ngược)", () => {
    const fs = [{ key: "face.pose.yaw", status: "measured" as const, confidence: 0.9 }];
    const a = buildReliability(fs);
    expect(a["face.pose.yaw"].sampleCount).toBe(6);
    expect(a["face.pose.yaw"].participantCount).toBe(1);
    expect(a["face.pose.yaw"].deviceCount).toBe(1);
  });

  it("khi số đếm đến từ dữ liệu, bảng NÓI RÕ điều đó", () => {
    const rel = buildReliability(
      [{ key: "face.pose.yaw", status: "measured", confidence: 0.9 }],
      { "face.pose.yaw": { sampleCount: 15, participantCount: 5, deviceCount: 2 } },
    );
    const gh = rel["face.pose.yaw"].knownLimitations.join(" ");
    expect(gh).toMatch(/tập dữ liệu nghiên cứu/);
    expect(gh).toMatch(/15 lượt/);
    // Không để ai nhầm với bộ mẫu ảnh Phase 1D-3.
    expect(gh).toMatch(/KHÔNG phải từ bộ mẫu ảnh Phase 1D-3/);
  });
});

// ─────────────────────────────────────────────────────────── chống trôi

describe("chống trôi hằng số", () => {
  it("ACCEPTED_EXPORT_VERSION khớp chuỗi thật trong test-export.ts", () => {
    // Chuỗi bị chép lại vì `test-export.ts` cố ý KHÔNG export hằng số của nó (một
    // binding được export sẽ lọt vào bản build production). Test này khoá hai chuỗi
    // không trôi khỏi nhau.
    const src = readFileSync(
      join(process.cwd(), "src/pages/api/nhan-tuong/test-export.ts"),
      "utf-8",
    );
    const m = /const EXPORT_VERSION = "([^"]+)"/.exec(src);
    expect(m, "không tìm thấy EXPORT_VERSION trong test-export.ts").not.toBeNull();
    expect(m![1]).toBe(ACCEPTED_EXPORT_VERSION);
  });

  it("REQUIRED_VIEW_COUNT suy từ hợp đồng view, không phải số tự chọn", () => {
    expect(REQUIRED_VIEW_COUNT).toBe(VIEW_NAMES.length);
  });

  it("module nạp dữ liệu KHÔNG nhắc tới luận giải hay nguồn cổ thư", () => {
    const src = readFileSync(
      join(process.cwd(), "src/features/physiognomy/research/dataset.ts"),
      "utf-8",
    );
    for (const cam of ["interpret", "KNOWLEDGE_SOURCES", "hasVerifiedSource", "tướng"]) {
      expect(src, cam).not.toContain(cam);
    }
  });
});
