/**
 * Phase 1D-3A — chế độ thu dữ liệu nghiên cứu (CHỈ DEV).
 *
 * Trong vitest, `import.meta.env.DEV` là true, nên các test dưới đây chạy đúng nhánh
 * DEV. Phần "production phải chặn" được kiểm bằng cách khác: grep bản build, xem
 * `docs/…1D3A…` §cổng production và test cuối file.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { GET as SESSION_GET, POST } from "../src/pages/api/nhan-tuong/session";
import { GET as EXPORT_GET } from "../src/pages/api/nhan-tuong/test-export";
import {
  MAX_RUN_NUMBER,
  parseSampleLabel,
  sampleFileName,
} from "../src/features/physiognomy/session/sample";
import { buildFeatureProfile } from "../src/features/physiognomy/features/extract";
import { toPhysiognomySessionFeaturePayload } from "../src/features/physiognomy/features/transport";

const FIX = JSON.parse(
  readFileSync(join(import.meta.dirname, "fixtures", "canonical-face.json"), "utf-8"),
) as { frameWidth: number; frameHeight: number; landmarks: { x: number; y: number; z: number }[] };

async function post(body: unknown) {
  const res = await POST({
    request: new Request("https://example.test/api/nhan-tuong/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  } as unknown as Parameters<typeof POST>[0]);
  return { status: res.status, json: (await res.json()) as Record<string, unknown> };
}

async function getSession(id: string) {
  const url = new URL(`https://example.test/api/nhan-tuong/session?id=${id}`);
  const res = await SESSION_GET({ url } as unknown as Parameters<typeof SESSION_GET>[0]);
  return { status: res.status, json: JSON.parse(await res.text()) as Record<string, unknown> };
}

async function exportIds(ids: string[]) {
  const url = new URL(`https://example.test/api/nhan-tuong/test-export?ids=${ids.join(",")}`);
  const res = await EXPORT_GET({ url } as unknown as Parameters<typeof EXPORT_GET>[0]);
  const text = await res.text();
  return { status: res.status, text, json: res.ok ? (JSON.parse(text) as Record<string, unknown>) : null };
}

function payloadFor(sessionId: string) {
  const r = toPhysiognomySessionFeaturePayload(
    buildFeatureProfile({
      sessionId,
      capturedAt: Date.now(),
      observations: [
        {
          step: "front",
          landmarks: FIX.landmarks,
          frameWidth: FIX.frameWidth,
          frameHeight: FIX.frameHeight,
          pose: { yaw: 0, pitch: 0, roll: 0 },
          quality: { faceDetected: true, coverage: 0.6, brightness: 0.55, blur: 0.02 },
        },
      ],
    }),
  );
  if (!r.ok) throw new Error(r.code);
  return JSON.parse(JSON.stringify(r.payload)) as Record<string, unknown>;
}

/** Tạo một mẫu đã quét xong, có payload. */
async function runMau(participantId: string, runNumber: number, deviceLabel = "unknown") {
  const c = await post({ action: "create", sample: { participantId, runNumber, deviceLabel } });
  const id = String(c.json.sessionId);
  const conn = await post({ action: "connect", sessionId: id });
  const token = String(conn.json.writeToken);
  await post({ action: "complete", sessionId: id, writeToken: token, featureProfile: payloadFor(id) });
  return { id, token, created: c };
}

// ───────────────────────────────────────────────── nhãn mẫu

describe("nhãn mẫu — không nhận thông tin cá nhân", () => {
  it("mã nghiên cứu hợp lệ thì dựng đúng sampleId", () => {
    const r = parseSampleLabel({ participantId: "A", runNumber: 1, deviceLabel: "iPhone-15" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.sample.sampleId).toBe("A-01");
    expect(sampleFileName(r.sample)).toBe("A__run1.json");
  });

  it("run 2 chữ số vẫn đệm 0 đúng", () => {
    const r = parseSampleLabel({ participantId: "B", runNumber: 12 });
    expect(r.ok && r.sample.sampleId).toBe("B-12");
  });

  it("thiếu deviceLabel thì mặc định unknown, KHÔNG đoán máy", () => {
    const r = parseSampleLabel({ participantId: "C", runNumber: 1 });
    expect(r.ok && r.sample.deviceLabel).toBe("unknown");
  });

  it("TỪ CHỐI tên người", () => {
    for (const ten of ["Nguyen Van A", "cong", "Công", "Alice"]) {
      expect(parseSampleLabel({ participantId: ten, runNumber: 1 }).ok, ten).toBe(false);
    }
  });

  it("TỪ CHỐI email và số điện thoại ở mọi trường", () => {
    expect(parseSampleLabel({ participantId: "A", runNumber: 1, deviceLabel: "a@b.com" }).ok).toBe(false);
    expect(parseSampleLabel({ participantId: "A", runNumber: 1, deviceLabel: "0912345678" }).ok).toBe(false);
    // nhưng "A55" và "iPhone-15" phải qua được
    expect(parseSampleLabel({ participantId: "A", runNumber: 1, deviceLabel: "Samsung-A55" }).ok).toBe(true);
    expect(parseSampleLabel({ participantId: "A", runNumber: 1, deviceLabel: "iPhone-15" }).ok).toBe(true);
  });

  it("TỪ CHỐI trường lạ — không lặng lẽ bỏ qua", () => {
    const r = parseSampleLabel({ participantId: "A", runNumber: 1, fullName: "x" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain("fullName");
  });

  it("KHÔNG nhận sampleId từ máy khách — server tự dựng", () => {
    expect(parseSampleLabel({ participantId: "A", runNumber: 1, sampleId: "Z-99" }).ok).toBe(false);
  });

  it("runNumber ngoài khoảng → từ chối", () => {
    for (const n of [0, -1, 1.5, MAX_RUN_NUMBER + 1, "1"]) {
      expect(parseSampleLabel({ participantId: "A", runNumber: n }).ok, String(n)).toBe(false);
    }
  });
});

// ───────────────────────────────────────────────── định danh mẫu

describe("định danh mẫu qua API", () => {
  it("A-01 và A-02 tạo đúng, là hai phiên độc lập", async () => {
    const a1 = await runMau("A", 1);
    const a2 = await runMau("A", 2);
    expect(a1.created.json.sample).toMatchObject({ sampleId: "A-01", participantId: "A", runNumber: 1 });
    expect(a2.created.json.sample).toMatchObject({ sampleId: "A-02" });
    expect(a1.id).not.toBe(a2.id);
  });

  it("B-01 KHÔNG đụng A-01", async () => {
    const a = await runMau("A", 1);
    const b = await runMau("B", 1);
    const va = await getSession(a.id);
    const vb = await getSession(b.id);
    expect((va.json.sample as Record<string, unknown>).sampleId).toBe("A-01");
    expect((vb.json.sample as Record<string, unknown>).sampleId).toBe("B-01");
    expect(a.id).not.toBe(b.id);
  });

  it("token của phiên A không ghi được vào phiên B", async () => {
    const a = await runMau("A", 3);
    const c = await post({ action: "create", sample: { participantId: "B", runNumber: 3 } });
    const bid = String(c.json.sessionId);
    await post({ action: "connect", sessionId: bid });
    const r = await post({ action: "complete", sessionId: bid, writeToken: a.token });
    expect(r.status).toBe(403);
  });

  it("nhãn xấu → 400 và KHÔNG tạo phiên nào", async () => {
    const r = await post({ action: "create", sample: { participantId: "Nguyen Van A", runNumber: 1 } });
    expect(r.status).toBe(400);
    expect(r.json.code).toBe("bad_sample");
    expect(r.json).not.toHaveProperty("sessionId");
  });

  it("luồng bình thường (không gửi sample) vẫn như Phase 1C — sample = null", async () => {
    const c = await post({ action: "create" });
    expect(c.status).toBe(201);
    expect(c.json).not.toHaveProperty("sample");
    const v = await getSession(String(c.json.sessionId));
    expect(v.json.sample).toBeNull();
  });
});

// ───────────────────────────────────────────────── xuất dữ liệu

describe("xuất dữ liệu nghiên cứu", () => {
  it("xuất đúng payload, giữ nguyên provenance", async () => {
    const a = await runMau("A", 1, "iPhone-15");
    const e = await exportIds([a.id]);
    expect(e.status).toBe(200);
    const run = (e.json!.runs as Record<string, unknown>[])[0];
    expect(run.exportVersion).toBe("physiognomy-test-export-v1");
    expect(run.featureStatus).toBe("ok");
    expect(run.sample).toMatchObject({ sampleId: "A-01", deviceLabel: "iPhone-15" });
    const p = run.featureProfile as Record<string, unknown>;
    expect(p.transportVersion).toBe("physiognomy-session-feature-v1");
    expect(p.featureSchemaVersion).toBe("physiognomy-feature-v1");
    const feats = p.features as Record<string, unknown>[];
    expect(feats).toHaveLength(29);
    // provenance còn đủ tám trường
    expect(Object.keys(feats[0]).sort()).toEqual(["c", "k", "l", "m", "s", "u", "v", "w"]);
  });

  it("tên tệp gợi ý khớp cách gom nhóm của scripts/nhan-tuong-do-lai.mjs", async () => {
    const a = await runMau("A", 2);
    const e = await exportIds([a.id]);
    const run = (e.json!.runs as Record<string, unknown>[])[0];
    expect(run.suggestedFileName).toBe("A__run2.json");
    // bộ đo tách theo "__" → phải ra đúng người và điều kiện
    const [nguoi, dk] = String(run.suggestedFileName).replace(".json", "").split("__");
    expect(nguoi).toBe("A");
    expect(dk).toBe("run2");
  });

  it("xuất nhiều phiên một lần", async () => {
    const ids = [(await runMau("C", 1)).id, (await runMau("C", 2)).id, (await runMau("C", 3)).id];
    const e = await exportIds(ids);
    expect(e.json!.count).toBe(3);
    const runs = e.json!.runs as Record<string, unknown>[];
    expect(runs.map((r) => (r.sample as Record<string, unknown>).sampleId)).toEqual(["C-01", "C-02", "C-03"]);
  });

  it("KHÔNG xuất media thô, landmark thô hay writeToken", async () => {
    const a = await runMau("A", 1);
    const e = await exportIds([a.id]);
    const low = e.text.toLowerCase();
    for (const bad of ["writetoken", "base64", "image", "video", "audio", "blob",
      "facelandmarks", "facialtransformationmatrixes", "snapshots"]) {
      expect(low, bad).not.toContain(bad);
    }
  });

  it("KHÔNG có thông tin cá nhân trong bản xuất", async () => {
    const a = await runMau("A", 1, "Pixel-8");
    const e = await exportIds([a.id]);
    const low = e.text.toLowerCase();
    expect(low).not.toContain("@");                 // email
    // Dãy số dài chỉ được phép ở các trường thời gian của hệ thống. Soi đúng phần
    // NGƯỜI VẬN HÀNH gõ vào — đó mới là chỗ thông tin cá nhân có thể lọt.
    const run = (e.json!.runs as Record<string, unknown>[])[0];
    expect(JSON.stringify(run.sample)).not.toMatch(/\d{7,}/);
    expect(JSON.stringify(run.sample)).not.toContain("@");
  });

  it("KHÔNG có chữ nào mang nghĩa luận giải", async () => {
    const a = await runMau("A", 1);
    const low = (await exportIds([a.id])).text.toLowerCase();
    for (const bad of ["fullness", "destiny", "fortune", "personality", "auspicious", "wealth", "health"]) {
      expect(low, bad).not.toContain(bad);
    }
  });

  it("id không tồn tại → ghi rõ lỗi, không làm hỏng cả bản xuất", async () => {
    const a = await runMau("A", 1);
    const e = await exportIds([a.id, "KHONGCOTHAT"]);
    expect(e.status).toBe(200);
    const runs = e.json!.runs as Record<string, unknown>[];
    expect(runs).toHaveLength(2);
    expect(runs[1].error).toBeTruthy();
  });

  it("thiếu ids → 400", async () => {
    const e = await exportIds([]);
    expect(e.status).toBe(400);
  });

  it("quá nhiều ids → 400 (chặn quét cả kho)", async () => {
    const e = await exportIds(Array.from({ length: 31 }, (_, i) => `X${i}`));
    expect(e.status).toBe(400);
  });
});

// ───────────────────────────────────────────────── cổng production

describe("cổng production", () => {
  const src = readFileSync(
    join(import.meta.dirname, "..", "src", "pages", "api", "nhan-tuong", "test-export.ts"),
    "utf-8",
  );

  it("endpoint xuất được bọc bằng import.meta.env.DEV (cắt lúc build)", () => {
    expect(src).toContain("if (!import.meta.env.DEV)");
    expect(src).toContain('return new Response("Not found", { status: 404 })');
    // cổng phải là câu lệnh ĐẦU TIÊN trong handler, trước mọi truy cập kho
    const iGate = src.indexOf("import.meta.env.DEV");
    const iStore = src.indexOf("resolveStore()");
    expect(iGate).toBeGreaterThan(-1);
    expect(iGate).toBeLessThan(iStore);
  });

  it("bảng thu dữ liệu nằm TRỌN trong khối DEV — cả markup lẫn script", () => {
    const d = readFileSync(
      join(import.meta.dirname, "..", "src", "components", "tools", "NhanTuongDesktop.astro"),
      "utf-8",
    );
    // markup
    expect(d).toMatch(/import\.meta\.env\.DEV && \(\s*<section\s+id="ntd-collect"/);
    // script: khối mở ngay trước phần thu dữ liệu và đóng trước `start()`
    expect(d).toContain("if (import.meta.env.DEV) {");
    const iDev = d.indexOf("if (import.meta.env.DEV) {");
    // Các định danh CHỈ có trong script — không xuất hiện ở markup.
    for (const can of ["nt-collect-v1", "markSampleComplete =", "dongBoMauDangQuet"]) {
      expect(d.indexOf(can), `${can} phải nằm SAU khi mở khối DEV`).toBeGreaterThan(iDev);
    }
    // `ntd-c-grid` có ở CẢ markup (đã bọc DEV riêng) lẫn script; chỗ trong script là
    // lần xuất hiện cuối và phải nằm sau khi mở khối.
    expect(d.lastIndexOf("ntd-c-grid")).toBeGreaterThan(iDev);
    // móc phải khai báo null để bản production không giữ khối lại
    expect(d).toContain("let markSampleComplete: ((sid: string) => void) | null = null;");
    expect(d).toContain("markSampleComplete?.(sessionId)");
  });

  it("có cơ chế dò lại mẫu kẹt ở 'đang quét'", () => {
    const d = readFileSync(
      join(import.meta.dirname, "..", "src", "components", "tools", "NhanTuongDesktop.astro"),
      "utf-8",
    );
    expect(d).toContain("async function dongBoMauDangQuet()");
    // chạy cả lúc mở trang lẫn trước khi tạo phiên mới
    expect(d).toContain("void dongBoMauDangQuet();");
    expect(d).toContain("await dongBoMauDangQuet();");
  });

  /**
   * HỒI QUY — mất nhãn khi phiên hết hạn (đã xảy ra thật, 27/9/2026).
   *
   * A-01 hết hạn lúc 01:48:13Z. Bảy giây sau, nút "Tạo phiên mới" trên màn hình lỗi gọi
   * `start()` KHÔNG đối số → phiên mới không có nhãn. Người tham gia quét đúng phiên đó
   * và hoàn tất trọn 6 bước + giọng nói trong 59 giây trên iPhone thật. Dữ liệu tốt,
   * nhưng `sample = null` nên không biết là của ai, lượt nào → không tính được vào bộ
   * nghiên cứu, và bảng thu vẫn hiện "chưa". Người vận hành không làm gì sai.
   */
  it("nút tạo lại trên màn hình LỖI giữ nguyên nhãn mẫu, nút trên màn hình XONG thì không", () => {
    const d = readFileSync(
      join(import.meta.dirname, "..", "src", "components", "tools", "NhanTuongDesktop.astro"),
      "utf-8",
    );
    // Nhãn phải được nhớ từ dữ liệu SERVER (sống qua F5), không từ lúc tạo phiên.
    expect(d).toContain("let nhanDangQuet:");
    expect(d).toContain("nhanDangQuet = view.sample");

    // Màn hình LỖI/HẾT HẠN: lượt chưa thu được → dựng lại ĐÚNG nhãn đó.
    const iLoi = d.indexOf('$("ntd-error-restart")');
    expect(iLoi).toBeGreaterThan(-1);
    const khoiLoi = d.slice(iLoi, iLoi + 400);
    expect(khoiLoi).toContain("nhanDangQuet");
    expect(khoiLoi).toContain("start(");
    // Màn hình XONG: lượt đã thu được → sang lượt tiếp theo, KHÔNG giữ nhãn cũ.
    expect(d).toContain('$("ntd-restart")?.addEventListener("click", () => void start());');
  });

  /**
   * HỒI QUY — mất nhãn qua cửa THỨ HAI: phiên tự tạo khi mở trang.
   *
   * Bản vá đầu chỉ chặn đường nút "Tạo phiên mới" trên màn hình lỗi. Cửa còn lại vẫn mở
   * và đã làm mất thêm HAI lượt quét thật (6XW4XV36NT 10:01:57, KSE96KZ6SX 10:03:29 —
   * mỗi lượt đủ 6 bước, 29 feature, iPhone iOS 18) vì QR của phiên không nhãn trông y
   * hệt QR của A-01. Cảnh báo bằng chữ không đủ: người bấm nút và người quét là hai
   * người khác nhau.
   */
  /**
   * HỒI QUY — mất nhãn qua cửa THỨ BA: phiên hết hạn TRƯỚC khi trang được mở.
   *
   * `nhanDangQuet` học nhãn từ server qua poll. Nhưng mở lại link `?session=…` sau khi
   * phiên đã hết hạn thì poll đầu tiên trả 404 ngay, `apply()` chưa bao giờ chạy, nên
   * không có nhãn nào để giữ. Đã mất capture thật lần thứ tư đúng vì lỗ này
   * (XHJP7KYZ9W, 6/6 bước, 29 feature, iPhone iOS 18, 70 giây). Bản đồ localStorage
   * BIẾT phiên đó là A-01 — code chỉ việc tra.
   */
  it("phiên hết hạn trước khi mở trang: nhãn tra được từ bản đồ localStorage", () => {
    const d = readFileSync(
      join(import.meta.dirname, "..", "src", "components", "tools", "NhanTuongDesktop.astro"),
      "utf-8",
    );
    expect(d).toContain("let traNhanTheoPhien:");
    // Hook được gán trong khối DEV của bảng thu, đọc từ `docKho()`.
    expect(d).toContain("traNhanTheoPhien = (sid) => {");
    expect(d).toMatch(/traNhanTheoPhien = \(sid\) => \{[\s\S]{0,200}docKho\(\)/);

    // Nút lỗi phải thử CẢ HAI nguồn, server trước rồi localStorage.
    const i = d.indexOf('$("ntd-error-restart")');
    const khoi = d.slice(i, i + 400);
    expect(khoi).toContain("nhanDangQuet ??");
    expect(khoi).toContain("traNhanTheoPhien?.(sessionId)");
  });

  it("bảng thu hiện thì KHÔNG tự tạo phiên không nhãn lúc mở trang", () => {
    const d = readFileSync(
      join(import.meta.dirname, "..", "src", "components", "tools", "NhanTuongDesktop.astro"),
      "utf-8",
    );
    expect(d).toContain("let tuTaoPhienKhiMoTrang = true;");
    // Khối DEV của bảng thu phải tắt cơ chế đó…
    expect(d).toContain("tuTaoPhienKhiMoTrang = false;");
    // …và điểm tự tạo phải tôn trọng cờ.
    expect(d).toContain("} else if (tuTaoPhienKhiMoTrang) {");

    // THỨ TỰ: cờ phải được tắt TRƯỚC khi tới điểm kiểm, nếu không thì vô nghĩa.
    expect(d.indexOf("tuTaoPhienKhiMoTrang = false;")).toBeLessThan(
      d.indexOf("} else if (tuTaoPhienKhiMoTrang) {"),
    );
  });

  it("production vẫn tự tạo phiên khi mở trang — mặc định là CHO PHÉP", () => {
    const d = readFileSync(
      join(import.meta.dirname, "..", "src", "components", "tools", "NhanTuongDesktop.astro"),
      "utf-8",
    );
    // Giá trị khởi tạo `true` nằm NGOÀI khối DEV, nên luồng khách không đổi.
    const iKhaiBao = d.indexOf("let tuTaoPhienKhiMoTrang = true;");
    const iKhoiDev = d.indexOf("tuTaoPhienKhiMoTrang = false;");
    expect(iKhaiBao).toBeGreaterThan(-1);
    expect(iKhaiBao).toBeLessThan(iKhoiDev);
  });

  it("không truyền sampleId ngược lên server — whitelist sẽ từ chối", () => {
    const d = readFileSync(
      join(import.meta.dirname, "..", "src", "components", "tools", "NhanTuongDesktop.astro"),
      "utf-8",
    );
    // `view.sample` có thêm `sampleId`; phải bóc ra đúng ba trường server nhận.
    const i = d.indexOf("nhanDangQuet = view.sample");
    const khoi = d.slice(i, i + 320);
    expect(khoi).toContain("participantId: view.sample.participantId");
    expect(khoi).toContain("runNumber: view.sample.runNumber");
    expect(khoi).toContain("deviceLabel: view.sample.deviceLabel");
    expect(khoi).not.toContain("sampleId: view.sample.sampleId");
  });

  it("nhận nhãn mẫu ở API phiên cũng bọc DEV", () => {
    const s = readFileSync(
      join(import.meta.dirname, "..", "src", "pages", "api", "nhan-tuong", "session.ts"),
      "utf-8",
    );
    expect(s).toContain("import.meta.env.DEV && body.sample != null");
    expect(s).toContain("!import.meta.env.DEV && body.sample != null");
  });

  // Quét cả dist/ mất lâu (94 MB) nên chỉ soi dist/server — nơi chứa worker.
  it("bản build production KHÔNG còn thân xử lý của endpoint xuất", { timeout: 60_000 }, async () => {
    const dist = join(import.meta.dirname, "..", "dist", "server");
    // Chưa build thì không có gì để kiểm — đây là test chỉ có nghĩa SAU `astro build`.
    if (!existsSync(dist)) return;
    const { readdirSync, statSync } = await import("node:fs");
    // Chuỗi này CHỈ tồn tại bên trong nhánh DEV của endpoint xuất.
    const CAN = "physiognomy-test-export-v1";
    const dinh: string[] = [];
    const quet = (d: string) => {
      for (const ten of readdirSync(d)) {
        const p = join(d, ten);
        if (statSync(p).isDirectory()) quet(p);
        else if (/\.(js|mjs|html|json)$/.test(ten) && readFileSync(p, "utf-8").includes(CAN)) {
          dinh.push(p);
        }
      }
    };
    quet(dist);
    expect(dinh, "bản build vẫn còn endpoint xuất").toEqual([]);
  });
});
