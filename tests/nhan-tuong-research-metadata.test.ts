/**
 * PHASE 1D-3B — provenance mẫu nghiên cứu + hiệu chuẩn trái/phải.
 *
 * Ba thứ được kiểm ở đây, và cả ba đều là chuyện ĐÚNG/SAI chứ không phải chuyện chạy
 * được hay không:
 *
 *   1. Máy quét tự khai được mình là gì, và KHÔNG ĐOÁN khi không biết.
 *   2. Một lượt quét thiếu giấy tờ thì KHÔNG được tính là mẫu nghiên cứu.
 *   3. Phép hiệu chuẩn trái/phải KHÔNG được suy hướng quay từ chính dấu yaw.
 *
 * Điểm (3) là điểm dễ hỏng nhất: nếu để lọt, phép thử sẽ luôn PASS kể cả khi hằng số
 * sai ngược, vì nó lấy thứ cần kiểm ra làm bằng chứng cho chính nó.
 */
import { describe, expect, it } from "vitest";

import { POST } from "../src/pages/api/nhan-tuong/session";
import {
  DEVICE_MODEL_UNAVAILABLE,
  DEVICE_UNKNOWN,
  deviceIsIdentified,
  deviceLabelOf,
  parseDeviceInfo,
  parseDeviceInfoPayload,
} from "../src/features/physiognomy/session/device";
import {
  RESEARCH_GATE_VERSION,
  evaluateResearchSample,
  type ResearchCandidate,
} from "../src/features/physiognomy/session/research";
import {
  CALIBRATION_VERSION,
  TURN_INSTRUCTION,
  expectedYawSignFor,
  judgeTrial,
  summarizeCalibration,
  type CalibrationTrial,
} from "../src/features/physiognomy/acquisition/yaw-calibration";
import {
  TURN_MIN_DEG,
  YAW_SIGN_FOR_USER_LEFT,
} from "../src/features/physiognomy/acquisition/thresholds";

// ─────────────────────────────────────────────────────────── A. nhận dạng máy

/**
 * Chuỗi User-Agent thật, chép nguyên văn từ tài liệu nhà sản xuất. KHÔNG bịa: nếu bịa
 * thì test chỉ chứng minh bộ đọc khớp với trí tưởng tượng của người viết test.
 */
const UA = {
  iphoneSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  iphoneChrome:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.54 Mobile/15E148 Safari/604.1",
  androidChrome:
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
  samsung:
    "Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36",
  desktopEdge:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.2592.68",
  firefox:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0",
};

describe("A — nhận dạng máy quét", () => {
  it("iPhone Safari: đọc đúng iOS và Safari", () => {
    const d = parseDeviceInfo(UA.iphoneSafari);
    expect(d.os).toBe("iOS 17");
    expect(d.browser).toBe("Safari 17");
  });

  it("iPhone KHÔNG BAO GIỜ có model — ghi rõ là không biết, không đoán", () => {
    for (const ua of [UA.iphoneSafari, UA.iphoneChrome]) {
      expect(parseDeviceInfo(ua).model).toBe(DEVICE_MODEL_UNAVAILABLE);
    }
  });

  it("Chrome trên iOS vẫn là Chrome iOS, không nhận nhầm thành Safari", () => {
    expect(parseDeviceInfo(UA.iphoneChrome).browser).toBe("Chrome iOS 126");
  });

  it('Android Chrome khai model "K" cho MỌI máy — không được nhận đó là model', () => {
    const d = parseDeviceInfo(UA.androidChrome);
    expect(d.os).toBe("Android 10");
    expect(d.browser).toBe("Chrome 126");
    // "K" là chuỗi máy chung Chrome dùng sau khi rút gọn User-Agent. Nhận nó là model
    // sẽ sinh ra một dữ liệu sai trông y như dữ liệu đúng.
    expect(d.model).toBe(DEVICE_MODEL_UNAVAILABLE);
  });

  it("chỉ Client Hints mới cấp được model thật", () => {
    const d = parseDeviceInfo(UA.androidChrome, { model: "Pixel 8" });
    expect(d.model).toBe("Pixel 8");
  });

  it("Edge không bị nhận nhầm thành Chrome, Chrome không bị nhận nhầm thành Safari", () => {
    expect(parseDeviceInfo(UA.desktopEdge).browser).toBe("Edge 126");
    expect(parseDeviceInfo(UA.samsung).browser).toBe("Samsung Internet 23");
    expect(parseDeviceInfo(UA.firefox).browser).toBe("Firefox 127");
  });

  it("chỉ giữ số hiệu CHÍNH, không giữ đuôi phiên bản", () => {
    // Đuôi ".0.6478.54" không thêm thông tin cho việc đo, chỉ làm máy dễ bị nhận diện.
    const d = parseDeviceInfo(UA.iphoneChrome);
    expect(d.browser).not.toMatch(/\d+\.\d+/);
  });

  it("chuỗi rỗng / không phải chuỗi → unknown, không ném lỗi", () => {
    for (const x of ["", null, undefined, 42, {}]) {
      const d = parseDeviceInfo(x);
      expect(d.os).toBe(DEVICE_UNKNOWN);
      expect(d.browser).toBe(DEVICE_UNKNOWN);
    }
  });

  it("deviceIsIdentified: model thiếu vẫn được, os/browser thiếu thì không", () => {
    expect(
      deviceIsIdentified({ os: "iOS 17", browser: "Safari 17", model: DEVICE_MODEL_UNAVAILABLE }),
    ).toBe(true);
    expect(deviceIsIdentified({ os: DEVICE_UNKNOWN, browser: "Safari 17", model: "x" })).toBe(false);
    expect(deviceIsIdentified({ os: "iOS 17", browser: DEVICE_UNKNOWN, model: "x" })).toBe(false);
    expect(deviceIsIdentified(null)).toBe(false);
  });

  it("nhãn ngắn bỏ phần model khi không biết", () => {
    expect(
      deviceLabelOf({ os: "iOS 17", browser: "Safari 17", model: DEVICE_MODEL_UNAVAILABLE }),
    ).toBe("iOS 17 · Safari 17");
    expect(deviceLabelOf({ os: "Android 14", browser: "Chrome 126", model: "Pixel 8" })).toBe(
      "Android 14 · Chrome 126 · Pixel 8",
    );
  });
});

describe("A2 — biên tin cậy: payload device từ máy khách", () => {
  it("nhận đúng ba trường", () => {
    expect(parseDeviceInfoPayload({ os: "iOS 17", browser: "Safari 17", model: "x" })).toEqual({
      os: "iOS 17",
      browser: "Safari 17",
      model: "x",
    });
  });

  it("TỪ CHỐI trường lạ — whitelist, không phải blacklist", () => {
    expect(
      parseDeviceInfoPayload({ os: "iOS", browser: "Safari", model: "x", ten: "Nguyễn Văn A" }),
    ).toBeNull();
  });

  it("không phải object thì từ chối", () => {
    for (const x of [null, "iOS", 1, [], undefined]) {
      expect(parseDeviceInfoPayload(x)).toBeNull();
    }
  });

  it("chặn dấu hiệu thông tin cá nhân y như nhãn mẫu", () => {
    const d = parseDeviceInfoPayload({ os: "a@b.com", browser: "0912345678", model: "ok" });
    expect(d?.os).toBe(DEVICE_UNKNOWN);
    expect(d?.browser).toBe(DEVICE_UNKNOWN);
    expect(d?.model).toBe("ok");
  });

  it("chuỗi quá dài bị thay bằng giá trị mặc định, không bị cắt rồi giữ lại", () => {
    const d = parseDeviceInfoPayload({ os: "x".repeat(200), browser: "Safari", model: "y" });
    expect(d?.os).toBe(DEVICE_UNKNOWN);
  });
});

// ─────────────────────────────────────────────────────────── B. cổng mẫu nghiên cứu

const MAU_DU: ResearchCandidate = {
  sessionId: "ABC123",
  status: "complete",
  completedAt: 1790000000000,
  sample: { participantId: "A", runNumber: 1, sampleId: "A-01", deviceLabel: "unknown" },
  device: { os: "Android 14", browser: "Chrome 126", model: "Pixel 8" },
  hasFeatureProfile: true,
};

describe("B — cổng MẪU NGHIÊN CỨU", () => {
  it("đủ giấy tờ thì hợp lệ, và truy được trọn chuỗi", () => {
    const v = evaluateResearchSample(MAU_DU);
    expect(v.valid).toBe(true);
    expect(v.gaps).toEqual([]);
    expect(v.gateVersion).toBe(RESEARCH_GATE_VERSION);
    // Người → Lượt → Máy → Phiên → Feature
    expect(v.provenance).toEqual({
      participantId: "A",
      runNumber: 1,
      sampleId: "A-01",
      device: { os: "Android 14", browser: "Chrome 126", model: "Pixel 8" },
      sessionId: "ABC123",
      capturedAt: 1790000000000,
    });
  });

  it("thiếu nhãn người/lượt → không hợp lệ", () => {
    const v = evaluateResearchSample({ ...MAU_DU, sample: null });
    expect(v.valid).toBe(false);
    expect(v.gaps).toContain("no_sample_label");
    expect(v.provenance).toBeNull();
  });

  it("thiếu khai báo máy → không hợp lệ", () => {
    const v = evaluateResearchSample({ ...MAU_DU, device: null });
    expect(v.gaps).toContain("no_device_info");
  });

  it("máy khai nhưng không nhận ra → không hợp lệ", () => {
    const v = evaluateResearchSample({
      ...MAU_DU,
      device: { os: DEVICE_UNKNOWN, browser: DEVICE_UNKNOWN, model: DEVICE_MODEL_UNAVAILABLE },
    });
    expect(v.gaps).toContain("device_not_identified");
  });

  it("iOS không có model VẪN hợp lệ — vì không máy iOS nào khai được model", () => {
    const v = evaluateResearchSample({
      ...MAU_DU,
      device: { os: "iOS 17", browser: "Safari 17", model: DEVICE_MODEL_UNAVAILABLE },
    });
    expect(v.valid).toBe(true);
  });

  it("chưa hoàn tất / không có feature → không hợp lệ", () => {
    expect(evaluateResearchSample({ ...MAU_DU, status: "connected" }).gaps).toContain(
      "not_complete",
    );
    expect(evaluateResearchSample({ ...MAU_DU, hasFeatureProfile: false }).gaps).toContain(
      "no_feature_profile",
    );
    expect(evaluateResearchSample({ ...MAU_DU, completedAt: null }).gaps).toContain(
      "no_capture_timestamp",
    );
  });

  it("liệt kê ĐỦ thiếu sót, không dừng ở cái đầu tiên", () => {
    const v = evaluateResearchSample({
      sessionId: "X",
      status: "waiting",
      completedAt: null,
      sample: null,
      device: null,
      hasFeatureProfile: false,
    });
    expect(v.gaps).toEqual([
      "no_sample_label",
      "no_device_info",
      "not_complete",
      "no_capture_timestamp",
      "no_feature_profile",
    ]);
  });

  it("mẫu thật đầu tiên Q3DD4K22BY KHÔNG qua cổng — thiếu nhãn và thiếu máy", () => {
    // Bản ghi thật: quét xong, có Feature JSON, nhưng tạo bằng phiên không nhãn và
    // điện thoại chưa hề khai máy. Chạy được ≠ đủ tư cách nghiên cứu.
    const v = evaluateResearchSample({
      sessionId: "Q3DD4K22BY",
      status: "complete",
      completedAt: 1790425958634,
      sample: null,
      device: null,
      hasFeatureProfile: true,
    });
    expect(v.valid).toBe(false);
    expect(v.gaps).toEqual(["no_sample_label", "no_device_info"]);
  });

  it("cổng KHÔNG nâng và KHÔNG nhắc tới trạng thái đo", () => {
    const s = JSON.stringify(evaluateResearchSample(MAU_DU));
    for (const cam of ["measured", "validated", "eligible", "evidenceLevel"]) {
      expect(s).not.toContain(cam);
    }
  });
});

// ─────────────────────────────────────────────────────────── C. hiệu chuẩn trái/phải

const LUOT = (o: Partial<CalibrationTrial>): CalibrationTrial => ({
  sessionId: "S1",
  requestedDirection: "left",
  observedDirection: "left",
  yaw: 25,
  at: 0,
  ...o,
});

/** Dấu yaw mà hằng số HIỆN TẠI coi là ứng với hướng đó. */
const dauTrai = YAW_SIGN_FOR_USER_LEFT;
const dauPhai = (YAW_SIGN_FOR_USER_LEFT * -1) as 1 | -1;

describe("C — hiệu chuẩn trái/phải", () => {
  it("câu lệnh nói rõ là trái/phải CỦA NGƯỜI TEST", () => {
    expect(TURN_INSTRUCTION.left).toBe("Quay đầu sang trái của bạn.");
    expect(TURN_INSTRUCTION.right).toBe("Quay đầu sang phải của bạn.");
  });

  it("dấu mong đợi của hai hướng luôn NGƯỢC nhau", () => {
    expect(expectedYawSignFor("left")).toBe(dauTrai);
    expect(expectedYawSignFor("right")).toBe(dauPhai);
    expect(expectedYawSignFor("left")).not.toBe(expectedYawSignFor("right"));
  });

  it("làm đúng lệnh + dấu khớp → pass", () => {
    const v = judgeTrial(LUOT({ requestedDirection: "left", observedDirection: "left", yaw: 25 * dauTrai }));
    expect(v.outcome).toBe("pass");
    expect(v.pass).toBe(true);
  });

  it("làm đúng lệnh + dấu NGƯỢC → sign_mismatch, đây mới là bằng chứng chống hằng số", () => {
    const v = judgeTrial(
      LUOT({ requestedDirection: "left", observedDirection: "left", yaw: 25 * dauPhai }),
    );
    expect(v.outcome).toBe("sign_mismatch");
    expect(v.pass).toBe(false);
  });

  it("⚠️ KHÔNG suy hướng quay từ dấu yaw: quay nhầm bên là invalid_trial, dù dấu có khớp", () => {
    // Giao diện bảo TRÁI, người test quay PHẢI, và yaw mang dấu của PHẢI. Nếu chương
    // trình suy hướng từ dấu thì nó sẽ thấy "khớp" và chấm PASS — che mất lỗi thao tác.
    const v = judgeTrial(
      LUOT({ requestedDirection: "left", observedDirection: "right", yaw: 25 * dauPhai }),
    );
    expect(v.outcome).toBe("invalid_trial");
    expect(v.pass).toBe(false);
    expect(v.actualSign).toBeNull();
  });

  it("quay chưa đủ ngưỡng → no_turn, không đọc dấu của số gần 0", () => {
    const v = judgeTrial(LUOT({ yaw: TURN_MIN_DEG - 1 }));
    expect(v.outcome).toBe("no_turn");
    expect(v.actualSign).toBeNull();
    expect(judgeTrial(LUOT({ yaw: Number.NaN })).outcome).toBe("no_turn");
  });

  it("chưa đủ cả hai hướng → NOT_TESTED, không kết luận sớm", () => {
    // Chỉ thử mỗi bên trái: một hằng số sai ngược vẫn có thể trông như đúng.
    const s = summarizeCalibration([
      LUOT({ requestedDirection: "left", observedDirection: "left", yaw: 25 * dauTrai }),
      LUOT({ requestedDirection: "left", observedDirection: "left", yaw: 30 * dauTrai }),
    ]);
    expect(s.verdict).toBe("NOT_TESTED");
    expect(s.usable).toEqual({ left: 2, right: 0 });
  });

  it("không có lượt nào → NOT_TESTED", () => {
    const s = summarizeCalibration([]);
    expect(s.verdict).toBe("NOT_TESTED");
    expect(s.calibrationVersion).toBe(CALIBRATION_VERSION);
  });

  it("đủ hai hướng, đều khớp → PASS", () => {
    const s = summarizeCalibration([
      LUOT({ requestedDirection: "left", observedDirection: "left", yaw: 25 * dauTrai }),
      LUOT({ requestedDirection: "right", observedDirection: "right", yaw: 28 * dauPhai }),
    ]);
    expect(s.verdict).toBe("PASS");
    expect(s.recommendation).toContain("Giữ nguyên hằng số");
  });

  it("đủ hai hướng, ĐỀU ngược → mới được đề nghị đảo hằng số", () => {
    const s = summarizeCalibration([
      LUOT({ requestedDirection: "left", observedDirection: "left", yaw: 25 * dauPhai }),
      LUOT({ requestedDirection: "right", observedDirection: "right", yaw: 28 * dauTrai }),
    ]);
    expect(s.verdict).toBe("FLIP_RECOMMENDED");
    expect(s.recommendation).toContain("ĐỀ NGHỊ");
    expect(s.recommendation).toContain(String(YAW_SIGN_FOR_USER_LEFT * -1));
  });

  it("lẫn lộn → INCONSISTENT, KHÔNG đề nghị đảo", () => {
    const s = summarizeCalibration([
      LUOT({ requestedDirection: "left", observedDirection: "left", yaw: 25 * dauTrai }),
      LUOT({ requestedDirection: "right", observedDirection: "right", yaw: 28 * dauTrai }),
    ]);
    expect(s.verdict).toBe("INCONSISTENT");
    expect(s.recommendation).not.toContain("ĐỀ NGHỊ");
    expect(s.recommendation).toContain("Giữ nguyên hằng số");
  });

  it("lượt hỏng không được tính vào phần dùng được", () => {
    const s = summarizeCalibration([
      LUOT({ requestedDirection: "left", observedDirection: "right" }),
      LUOT({ requestedDirection: "right", observedDirection: "left" }),
      LUOT({ requestedDirection: "left", observedDirection: "left", yaw: 1 }),
    ]);
    expect(s.counts.invalid_trial).toBe(2);
    expect(s.counts.no_turn).toBe(1);
    expect(s.usable).toEqual({ left: 0, right: 0 });
    expect(s.verdict).toBe("NOT_TESTED");
  });

  it("module hiệu chuẩn KHÔNG tự sửa hằng số", () => {
    summarizeCalibration([
      LUOT({ requestedDirection: "left", observedDirection: "left", yaw: 25 * dauPhai }),
      LUOT({ requestedDirection: "right", observedDirection: "right", yaw: 28 * dauTrai }),
    ]);
    expect(YAW_SIGN_FOR_USER_LEFT).toBe(dauTrai);
  });
});

// ─────────────────────────────────────────────────────────── D. đường API thật

async function post(body: unknown): Promise<{ status: number; json: Record<string, unknown> }> {
  const res = await POST({
    request: new Request("https://example.test/api/nhan-tuong/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  } as unknown as Parameters<typeof POST>[0]);
  return { status: res.status, json: (await res.json()) as Record<string, unknown> };
}

describe("D — khai báo máy đi qua API thật", () => {
  it("connect kèm device → được nhận, và phiên nhớ được máy", async () => {
    const tao = await post({ action: "create" });
    const id = String(tao.json.sessionId);
    const kn = await post({
      action: "connect",
      sessionId: id,
      device: { os: "Android 14", browser: "Chrome 126", model: "Pixel 8" },
    });
    expect(kn.status).toBe(200);

    const { resolveStore } = await import("../src/features/physiognomy/session/store");
    const rec = await (await resolveStore()).get(id);
    expect(rec?.device).toEqual({ os: "Android 14", browser: "Chrome 126", model: "Pixel 8" });
  });

  it("device có trường lạ → 400, không ghi bừa", async () => {
    const tao = await post({ action: "create" });
    const id = String(tao.json.sessionId);
    const kn = await post({
      action: "connect",
      sessionId: id,
      device: { os: "iOS", browser: "Safari", model: "x", hoTen: "Nguyễn Văn A" },
    });
    expect(kn.status).toBe(400);
    expect(kn.json.code).toBe("bad_device");
  });

  it("connect KHÔNG kèm device vẫn chạy — luồng khách không bị bắt khai máy", async () => {
    const tao = await post({ action: "create" });
    const id = String(tao.json.sessionId);
    const kn = await post({ action: "connect", sessionId: id });
    expect(kn.status).toBe(200);

    const { resolveStore } = await import("../src/features/physiognomy/session/store");
    const rec = await (await resolveStore()).get(id);
    expect(rec?.device ?? null).toBeNull();
  });

  it("nhãn mẫu và khai báo máy đi cùng nhau suốt vòng đời phiên", async () => {
    const tao = await post({
      action: "create",
      sample: { participantId: "A", runNumber: 1, deviceLabel: "may-muon" },
    });
    const id = String(tao.json.sessionId);
    await post({
      action: "connect",
      sessionId: id,
      device: { os: "iOS 17", browser: "Safari 17", model: "device_model_unavailable" },
    });

    const { resolveStore } = await import("../src/features/physiognomy/session/store");
    const rec = await (await resolveStore()).get(id);
    expect(rec?.sample?.sampleId).toBe("A-01");
    expect(rec?.device?.os).toBe("iOS 17");
    // Nhãn người vận hành gõ và khai báo của máy là HAI trường khác nhau, không đè nhau.
    expect(rec?.sample?.deviceLabel).toBe("may-muon");
  });
});

// ─────────────────────────────────────────────────────────── E. bày ra cho người vận hành

describe("E — người vận hành thấy được provenance TRƯỚC khi quét", () => {
  it("publicView mang cả nhãn mẫu và khai báo máy", async () => {
    const { publicView } = await import("../src/features/physiognomy/session/types");
    const v = publicView({
      sessionId: "S",
      status: "connected",
      createdAt: 1,
      expiresAt: 2,
      connectedAt: 1,
      completedAt: null,
      snapshots: {},
      voice: null,
      writeToken: "t",
      failureReason: null,
      sample: { participantId: "B", runNumber: 2, sampleId: "B-02", deviceLabel: "x" },
      device: { os: "iOS 17", browser: "Safari 17", model: DEVICE_MODEL_UNAVAILABLE },
    });
    // Hai trường này là thứ để phân biệt phiên nghiên cứu với phiên chẩn đoán ngay trên
    // màn hình, thay vì chỉ phát hiện lúc xuất dữ liệu.
    expect(v.sample?.sampleId).toBe("B-02");
    expect(v.device?.os).toBe("iOS 17");
  });

  it("phiên không nhãn → cả hai trường là null, không phải undefined", async () => {
    const { publicView } = await import("../src/features/physiognomy/session/types");
    const v = publicView({
      sessionId: "S",
      status: "waiting",
      createdAt: 1,
      expiresAt: 2,
      connectedAt: null,
      completedAt: null,
      snapshots: {},
      voice: null,
      writeToken: null,
      failureReason: null,
    });
    expect(v.sample).toBeNull();
    expect(v.device).toBeNull();
  });

  it("publicView KHÔNG để lộ writeToken", async () => {
    const { publicView } = await import("../src/features/physiognomy/session/types");
    const v = publicView({
      sessionId: "S",
      status: "connected",
      createdAt: 1,
      expiresAt: 2,
      connectedAt: 1,
      completedAt: null,
      snapshots: {},
      voice: null,
      writeToken: "BI-MAT",
      failureReason: null,
      device: { os: "iOS 17", browser: "Safari 17", model: DEVICE_MODEL_UNAVAILABLE },
    });
    expect(JSON.stringify(v)).not.toContain("BI-MAT");
  });
});
