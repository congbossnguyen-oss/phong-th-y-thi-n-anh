/**
 * STEP 6 §1, test D: chứng minh route `/api/internal/ai-video/generate` KHÔNG THỂ bị bypass grounding
 * bằng cách gửi thẳng 1 Scene tự tạo (bỏ qua `/scenes`/`scene-planner.ts` hoàn toàn).
 *
 * Gọi TRỰC TIẾP hàm `POST` đã export của route (không cần dựng server Astro thật) — mock
 * `job-manager` để không chạm DB/provider, chỉ kiểm tra route có early-return lỗi TRƯỚC khi gọi
 * `createAndSubmitJob` hay không.
 *
 * ĐẶT Ở ĐÂY (src/lib/ai-video/), KHÔNG đặt trong src/pages/ — Astro coi MỌI file .ts trong
 * src/pages/** là 1 route, kể cả *.test.ts (bug thật gặp khi build STEP 6: `astro build` cố render
 * route "/api/internal/ai-video/generate.test" rồi vỡ vì gọi `vi.mock` ngoài môi trường Vitest).
 * Import thẳng route module từ đây bằng đường dẫn tương đối — vitest mock theo ĐƯỜNG DẪN ĐÃ RESOLVE
 * nên `job-manager` vẫn bị mock đúng dù `generate.ts` tự import bằng specifier khác.
 */
import { describe, expect, it, vi } from "vitest";
import type { APIContext } from "astro";

const createAndSubmitJobMock = vi.fn();
vi.mock("./job-manager", () => ({
  createAndSubmitJob: (...args: unknown[]) => createAndSubmitJobMock(...args),
}));

import { POST } from "../../pages/api/internal/ai-video/generate";

function sceneHopLe() {
  return {
    id: "scene-k1",
    title: "Giường đối diện cửa",
    order: 1,
    durationSeconds: 6,
    knowledgeReference: "k1",
    knowledgeStatement: "Giường ngủ đặt trên trục đối diện trực tiếp với cửa phòng.",
    visualDescription: "Phòng ngủ hiện đại, camera cho thấy giường đối diện cửa.",
    camera: "static wide shot",
    movement: "slow dolly-in",
    environment: "modern bedroom",
    lighting: "soft natural daylight",
    style: "cinematic",
    constraints: [],
    negativeConstraints: [],
    narrationHint: "",
  };
}

function goiPost(body: Record<string, unknown>) {
  const request = new Request("https://noibo.test/api/internal/ai-video/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const context = { request, locals: { user: { id: "admin-1", isAdmin: true } } } as unknown as APIContext;
  return POST(context);
}

describe("POST /api/internal/ai-video/generate — không bypass được grounding (STEP 6 §1, test D)", () => {
  it("A. Scene hợp lệ, đúng nội dung -> qua được, gọi createAndSubmitJob", async () => {
    createAndSubmitJobMock.mockResolvedValue({ id: "job-1", status: "queued" });
    const res = await goiPost({ provider: "ltx", scene: sceneHopLe() });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(createAndSubmitJobMock).toHaveBeenCalledTimes(1);
  });

  it("D. Scene tự tạo (KHÔNG qua /scenes) chứa kết luận phong thủy bịa đặt -> bị chặn TRƯỚC khi tạo job, KHÔNG gọi createAndSubmitJob", async () => {
    createAndSubmitJobMock.mockClear();
    const sceneBiaDat = {
      ...sceneHopLe(),
      visualDescription: "Giường đối diện cửa, cách bố trí này gây mất tài lộc nghiêm trọng cho gia chủ.",
    };
    const res = await goiPost({ provider: "ltx", scene: sceneBiaDat });
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.error).toContain("mất tài lộc");
    expect(createAndSubmitJobMock).not.toHaveBeenCalled();
  });

  it("Scene thiếu knowledgeStatement (client tự bỏ qua, không gửi) -> bị chặn, KHÔNG tự suy đoán knowledge source", async () => {
    createAndSubmitJobMock.mockClear();
    const { knowledgeStatement: _bo, ...sceneThieu } = sceneHopLe();
    const res = await goiPost({ provider: "ltx", scene: sceneThieu });
    expect(res.status).toBe(400);
    expect(createAndSubmitJobMock).not.toHaveBeenCalled();
  });
});
