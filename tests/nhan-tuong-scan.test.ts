/**
 * Test cho phần logic THUẦN của POC nhân tướng — state machine, cổng chất lượng,
 * phân rã pose, và hình dạng hợp đồng dữ liệu.
 *
 * Cố ý không test camera/MediaRecorder/MediaPipe: chúng cần browser thật, và Phase K
 * đã quy định phần đó phải test tay trên thiết bị thật.
 */
import { describe, expect, it } from "vitest";

import {
  MESSAGES,
  RECOVERABLE_ERRORS,
  STABLE_FRAMES_REQUIRED,
  TERMINAL_ERRORS,
  canTransition,
  initialContext,
  isErrorState,
  needsCamera,
  needsMicrophone,
  transition,
  type ScanState,
} from "../src/features/physiognomy/capture/state-machine";
import {
  MIN_FACE_COVERAGE,
  decomposePose,
  evaluateQuality,
  qualityToErrorState,
} from "../src/features/physiognomy/capture/quality";
import { POSE_LIMITS, measured, estimated, unsupported } from "../src/features/physiognomy/types/index";
import { PALACE_INDICES, IDX } from "../src/features/physiognomy/geometry/index";

// ───────────────────────────────────────────────────────── state machine

describe("state machine — luồng hạnh phúc", () => {
  it("đi hết từ idle tới complete bằng các cạnh hợp lệ", () => {
    const happyPath: ScanState[] = [
      "requesting_camera", "camera_ready", "detecting_face", "guiding_user",
      "stable_capture", "face_captured", "voice_intro", "requesting_microphone",
      "recording_voice", "voice_captured", "feature_extraction", "complete",
    ];
    let ctx = initialContext();
    expect(ctx.state).toBe("idle");
    for (const next of happyPath) {
      ctx = transition(ctx, next);
      expect(ctx.state).toBe(next);
      expect(ctx.message).toBe(MESSAGES[next]);
    }
  });

  it("từ complete quay được về idle để quét lại", () => {
    const ctx = transition({ ...initialContext(), state: "complete" }, "idle");
    expect(ctx.state).toBe("idle");
  });
});

describe("state machine — chặn nhảy tắt", () => {
  it("không cho idle nhảy thẳng sang face_captured", () => {
    expect(canTransition("idle", "face_captured")).toBe(false);
    const ctx = transition(initialContext(), "face_captured");
    // Giữ nguyên trạng thái cũ, chỉ ghi lastError — KHÔNG throw, vì một cạnh sai
    // giữa lúc camera đang chạy không đáng làm sập cả trang.
    expect(ctx.state).toBe("idle");
    expect(ctx.lastError).toMatch(/không hợp lệ/);
  });

  it("không cho bỏ qua bước chụp mặt để sang ghi âm", () => {
    expect(canTransition("camera_ready", "recording_voice")).toBe(false);
  });

  it("mọi trạng thái đều có ít nhất một đường ra (không có ngõ cụt)", () => {
    const all = [...Object.keys(MESSAGES)] as ScanState[];
    for (const s of all) {
      const outs = all.filter((t) => canTransition(s, t));
      expect(outs.length, `trạng thái ${s} không có đường ra`).toBeGreaterThan(0);
    }
  });
});

describe("state machine — phân loại lỗi", () => {
  it("lỗi chữa được thì quay lại guiding_user, camera vẫn mở", () => {
    for (const e of RECOVERABLE_ERRORS) {
      expect(canTransition(e, "guiding_user"), `${e} phải về được guiding_user`).toBe(true);
      expect(needsCamera(e), `${e} vẫn phải giữ camera`).toBe(true);
    }
  });

  it("lỗi dừng hẳn thì không giữ camera và không về guiding_user", () => {
    for (const e of TERMINAL_ERRORS) {
      expect(needsCamera(e), `${e} không được giữ camera`).toBe(false);
      expect(canTransition(e, "guiding_user")).toBe(false);
    }
  });

  it("micro bị từ chối vẫn đi tiếp được — không bỏ cả lần quét", () => {
    // Khuôn mặt đã chụp xong rồi, không nên vứt đi chỉ vì khách không muốn nói.
    expect(canTransition("microphone_denied", "feature_extraction")).toBe(true);
  });

  it("bỏ qua giọng nói: voice_intro đi thẳng tới feature_extraction", () => {
    expect(canTransition("voice_intro", "feature_extraction")).toBe(true);
  });

  it("isErrorState nhận đúng cả hai nhóm và không nhận trạng thái thường", () => {
    expect(isErrorState("camera_denied")).toBe(true);
    expect(isErrorState("no_face")).toBe(true);
    expect(isErrorState("complete")).toBe(false);
    expect(isErrorState("idle")).toBe(false);
  });

  it("chỉ hai trạng thái cần micro", () => {
    expect(needsMicrophone("requesting_microphone")).toBe(true);
    expect(needsMicrophone("recording_voice")).toBe(true);
    expect(needsMicrophone("detecting_face")).toBe(false);
  });
});

// ────────────────────────────────────────────────────────── cổng chất lượng

const goodInput = {
  faceCount: 1,
  yaw: 1.2,
  pitch: -0.8,
  roll: 0.4,
  faceCoverage: 0.45,
  blurScore: 0.01,
  lightingScore: 0.5,
};

describe("cổng chất lượng", () => {
  it("ảnh tốt thì pass và không có lý do nào", () => {
    const q = evaluateQuality(goodInput);
    expect(q.captureQuality).toBe("pass");
    expect(q.reasons).toEqual([]);
    expect(q.faceDetected).toBe(true);
    expect(qualityToErrorState(q)).toBeNull();
  });

  it("không có mặt → fail + no_face", () => {
    const q = evaluateQuality({ ...goodInput, faceCount: 0, yaw: null, pitch: null, roll: null, faceCoverage: null });
    expect(q.captureQuality).toBe("fail");
    expect(q.faceDetected).toBe(false);
    expect(qualityToErrorState(q)).toBe("no_face");
  });

  it("hai mặt → fail + multiple_faces", () => {
    const q = evaluateQuality({ ...goodInput, faceCount: 2 });
    expect(q.captureQuality).toBe("fail");
    expect(qualityToErrorState(q)).toBe("multiple_faces");
  });

  it("mặt quá nhỏ → fail + face_too_small", () => {
    const q = evaluateQuality({ ...goodInput, faceCoverage: MIN_FACE_COVERAGE - 0.05 });
    expect(q.captureQuality).toBe("fail");
    expect(qualityToErrorState(q)).toBe("face_too_small");
  });

  it("mặt quá sát camera → CHẶN (đổi từ warn sang fail ở Phase 1B)", () => {
    // Phase 1 để "warn" và cho chụp tiếp. Phase 1B đổi thành "fail" vì Phase 1B-2
    // đo được 16% méo phối cảnh CÒN SÓT ở cự ly gần, kể cả sau khi đã chuẩn hoá
    // theo bề ngang mặt. Bảo khách lùi ra rẻ hơn là đo sai rồi không biết.
    const q = evaluateQuality({ ...goodInput, faceCoverage: 0.9 });
    expect(q.captureQuality).toBe("fail");
    expect(qualityToErrorState(q)).toBe("face_too_large");
    expect(q.reasons[0]).toBe("Lùi điện thoại ra một chút.");
  });

  it("yaw vượt ngưỡng → fail + pose_invalid", () => {
    const q = evaluateQuality({ ...goodInput, yaw: POSE_LIMITS.yaw + 1 });
    expect(q.captureQuality).toBe("fail");
    expect(qualityToErrorState(q)).toBe("pose_invalid");
    expect(q.reasons.join(" ")).toMatch(/quay ngang/);
  });

  it("pitch vượt ngưỡng → fail, và nói đúng hướng chúc/ngẩng", () => {
    const down = evaluateQuality({ ...goodInput, pitch: POSE_LIMITS.pitch + 5 });
    expect(qualityToErrorState(down)).toBe("pose_invalid");
    expect(down.reasons.join(" ")).toMatch(/chúc xuống/);

    const up = evaluateQuality({ ...goodInput, pitch: -(POSE_LIMITS.pitch + 5) });
    expect(up.reasons.join(" ")).toMatch(/ngẩng lên/);
  });

  it("roll vượt ngưỡng → fail + pose_invalid", () => {
    const q = evaluateQuality({ ...goodInput, roll: POSE_LIMITS.roll + 2 });
    expect(qualityToErrorState(q)).toBe("pose_invalid");
  });

  it("ảnh mờ → fail + blur_invalid", () => {
    const q = evaluateQuality({ ...goodInput, blurScore: 0.0001 });
    expect(q.captureQuality).toBe("fail");
    expect(qualityToErrorState(q)).toBe("blur_invalid");
  });

  it("quá tối → fail", () => {
    const q = evaluateQuality({ ...goodInput, lightingScore: 0.05 });
    expect(q.captureQuality).toBe("fail");
  });

  it("cháy sáng chỉ warn", () => {
    const q = evaluateQuality({ ...goodInput, lightingScore: 0.98 });
    expect(q.captureQuality).toBe("warn");
  });

  it("ngưỡng pose đúng như đã chốt ở Phase D", () => {
    expect(POSE_LIMITS).toEqual({ yaw: 8, pitch: 8, roll: 5 });
  });
});

// ──────────────────────────────────────────────────────────── phân rã pose

describe("phân rã ma trận pose", () => {
  /**
   * MediaPipe JS trả `matrix.data` theo THỨ TỰ CỘT. Helper này nhận ma trận viết
   * theo hàng cho người đọc dễ, rồi chuyển vị để mô phỏng đúng cách MediaPipe xếp.
   * Đọc sai thứ tự là bug đã tìm ra khi test trên ảnh thật — xem comment trong
   * quality.ts decomposePose().
   */
  const colMajor = (rows: number[][]): number[] => {
    const out: number[] = [];
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) out.push(rows[r][c]);
    return out;
  };
  const rot = (axis: "x" | "y" | "z", deg: number) => {
    const a = (deg * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    if (axis === "z") return colMajor([[c, -s, 0, 0], [s, c, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]);
    if (axis === "y") return colMajor([[c, 0, s, 0], [0, 1, 0, 0], [-s, 0, c, 0], [0, 0, 0, 1]]);
    return colMajor([[1, 0, 0, 0], [0, c, -s, 0], [0, s, c, 0], [0, 0, 0, 1]]);
  };

  it("ma trận đơn vị → pose 0/0/0", () => {
    const identity = colMajor([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]);
    const p = decomposePose(identity);
    expect(p.yaw).toBeCloseTo(0, 5);
    expect(p.pitch).toBeCloseTo(0, 5);
    expect(p.roll).toBeCloseTo(0, 5);
  });

  it("xoay quanh trục Z 20° → đúng roll 20°, yaw/pitch không đổi", () => {
    const p = decomposePose(rot("z", 20));
    expect(p.roll).toBeCloseTo(20, 1);
    expect(p.yaw).toBeCloseTo(0, 1);
    expect(p.pitch).toBeCloseTo(0, 1);
  });

  it("xoay quanh trục Y 30° → đúng yaw 30°", () => {
    const p = decomposePose(rot("y", 30));
    expect(p.yaw).toBeCloseTo(30, 1);
    expect(p.roll).toBeCloseTo(0, 1);
  });

  it("xoay quanh trục X 15° → đúng pitch 15°", () => {
    const p = decomposePose(rot("x", 15));
    expect(p.pitch).toBeCloseTo(15, 1);
    expect(p.yaw).toBeCloseTo(0, 1);
  });

  it("REGRESSION: đọc row-major cho kết quả KHÁC — không được đổi lại", () => {
    // Chốt quy ước. Nếu ai sửa decomposePose về row-major, test này đổ.
    // Số kỳ vọng lấy từ 4 ảnh thật đối chiếu Python ở Phase 1B-2.
    const m = rot("y", 30);
    const asRowMajor = (v: number[]) => {
      const out: number[] = [];
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) out.push(v[c * 4 + r]);
      return out;
    };
    const wrong = decomposePose(asRowMajor(m));
    expect(wrong.yaw).toBeCloseTo(-30, 1); // chuyển vị = nghịch đảo -> góc đổi dấu
    expect(decomposePose(m).yaw).toBeCloseTo(30, 1);
  });
});

// ─────────────────────────────────────────────── hợp đồng dữ liệu (kỷ luật)

describe("hợp đồng dữ liệu — kỷ luật trung thực", () => {
  it("helper unsupported luôn trả value null, không trả 0", () => {
    // 0 là một giá trị hợp lệ; dùng 0 làm "thiếu dữ liệu" là mời người đọc hiểu sai.
    const m = unsupported("không đo được");
    expect(m.value).toBeNull();
    expect(m.status).toBe("unsupported");
    expect(m.note).toBeTruthy();
  });

  it("estimated bắt buộc có note giải thích vì sao không phải measured", () => {
    const m = estimated(0.5, "ratio", "lệch 20% khi pitch");
    expect(m.status).toBe("estimated");
    expect(m.note).toBeTruthy();
  });

  it("measured ghi rõ chuẩn hoá theo cái gì", () => {
    const m = measured(0.2, "ratio", "faceWidth");
    expect(m.normalizedBy).toBe("faceWidth");
  });
});

describe("landmark index — chống lặp lại lỗi đã tìm ra ở Phase 1B", () => {
  it("133 được dùng làm KHOÉ MẮT TRONG, không phải điểm lông mày", () => {
    // ljtnine/face gán 133 cho biến `leftEyebrowOuter`. Đối chiếu canonical mesh:
    // 133 ở y=+2.59 còn dải lông mày ở y=+3.88..+5.11 → nằm dưới mày 1.3–2.5 đơn vị.
    expect(IDX.eyeLeftInner).toBe(133);
    expect(Object.values(IDX)).not.toContain(undefined);
    // Không có key nào chứa "brow" mà trỏ vào 133.
    for (const [key, val] of Object.entries(IDX)) {
      if (key.toLowerCase().includes("brow")) expect(val).not.toBe(133);
    }
  });

  it("mốc chuẩn hoá bề ngang mặt là hai gò má 234/454", () => {
    expect(IDX.cheekLeft).toBe(234);
    expect(IDX.cheekRight).toBe(454);
  });

  it("đủ 12 cung trong bản đồ, mỗi cung có ít nhất 3 landmark", () => {
    const names = Object.keys(PALACE_INDICES);
    expect(names).toHaveLength(12);
    for (const n of names) {
      expect(PALACE_INDICES[n as keyof typeof PALACE_INDICES].length).toBeGreaterThanOrEqual(3);
    }
  });

  it("mọi landmark index đều nằm trong [0, 467]", () => {
    for (const [name, idxs] of Object.entries(PALACE_INDICES)) {
      for (const i of idxs) {
        expect(i, `${name} có index ngoài phạm vi: ${i}`).toBeGreaterThanOrEqual(0);
        expect(i, `${name} có index ngoài phạm vi: ${i}`).toBeLessThan(468);
      }
    }
  });
});

describe("hằng số chụp ổn định", () => {
  it("cần 3 frame liên tiếp — đủ loại nhiễu một-frame, không bắt khách ngồi lâu", () => {
    expect(STABLE_FRAMES_REQUIRED).toBe(3);
  });
});
