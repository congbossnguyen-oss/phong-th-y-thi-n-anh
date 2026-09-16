/**
 * REAL FENG SHUI VIDEO PROOF — CONG AI VIDEO STEP 4.
 *
 * Chứng minh trọn pipeline bằng dữ liệu THẬT:
 *   Knowledge (đúng case "Giường ngủ đối diện cửa phòng") → Scene Planner → Scene Validation →
 *   Prompt Builder → VideoGenerationRequest → LTX THẬT → poll → MP4 thật.
 *
 * TỰ ĐỘNG SKIP trừ khi có CẢ HAI: LTX_API_KEY trong `.env` VÀ `RUN_AI_VIDEO_SMOKE_TEST=1` (cùng cơ
 * chế `real-api.smoke.test.ts` ở STEP 2 — xem `_shared.ts`, lý do tách "chỉ có key không đủ").
 *
 * Scene Planner ở đây CỐ TÌNH mock AI-văn-bản về `input: null` (buộc dùng nhánh fallback grounded) —
 * pipeline text-AI → Scene đã được chứng minh riêng, mocked, đầy đủ ở STEP 3
 * (`../feng-shui-proof.test.ts`, `../scene-planner.test.ts`). STEP 4 chỉ cần chứng minh THÊM đúng 1
 * việc: phần VIDEO (LTX) là thật — trộn thêm 1 lệnh gọi AI văn bản thật (DeepSeek/Anthropic/Gemini,
 * chưa ai xác minh ở step nào) vào đây sẽ làm phép thử không còn kiểm tra đúng 1 biến số.
 *
 * CHẠY THẬT (tốn tiền theo giá LTX thật — xem STEP 2 để biết mức giá thực tế đã quan sát được):
 *   RUN_AI_VIDEO_SMOKE_TEST=1 npx vitest run src/lib/ai-video/smoke/feng-shui-proof --testTimeout=300000
 *
 * KHÔNG BAO GIỜ in API key ra log. Metadata ghi ra file KHÔNG chứa key.
 */
import { existsSync } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { coBienMoiTruong, sanSangChayThat, sleep, taiEnvTuFileNeuThieu } from "./_shared";

taiEnvTuFileNeuThieu();

const goiAiToolUseVoiRetryMock = vi.fn();
vi.mock("../../ai/goi-ai", () => ({
  goiAiToolUseVoiRetry: (...args: unknown[]) => goiAiToolUseVoiRetryMock(...args),
}));

const OUTPUT_DIR = path.join(process.cwd(), "generated", "test");
const POLL_INTERVAL_MS = 8_000;
const MAX_WAIT_MS = 4 * 60_000;
const MIN_VALID_MP4_BYTES = 10_000;

const TOPIC = "Giường ngủ đối diện cửa phòng";
const KNOWLEDGE_STATEMENT = "Giường ngủ đặt trên trục đối diện trực tiếp với cửa phòng.";
const CONSTRAINTS = [
  "Phải thể hiện rõ cửa phòng và giường.",
  "Cửa và giường nằm trên cùng một trục nhìn.",
  "Không được thay đổi quan hệ vị trí này trong quá trình visualizing.",
];

describe("REAL FENG SHUI VIDEO PROOF — Giường ngủ đối diện cửa phòng", () => {
  it.skipIf(!sanSangChayThat("LTX_API_KEY"))(
    "Knowledge -> Scene -> Validation -> Prompt -> LTX thật -> MP4 thật (hoặc dừng đúng lúc nếu hết credit)",
    async () => {
      goiAiToolUseVoiRetryMock.mockResolvedValue({ input: null });

      // Import SAU khi mock đăng ký — planScenes/buildPrompt/validateScene/registry đều import module
      // đã bị mock ở trên qua chuỗi phụ thuộc (scene-planner -> ../ai/goi-ai).
      const { planScenes } = await import("../scene-planner");
      const { buildPrompt } = await import("../prompt-builder");
      const { validateScene } = await import("../scene-validator");
      const { getVideoProvider } = await import("../providers/registry");
      const { TRANG_THAI_KET_THUC } = await import("../providers/types");
      const { uocTinhChiPhi } = await import("../cost");

      // ---- Scene Planner ----
      const planned = await planScenes({
        topic: TOPIC,
        knowledge: [{ id: "k1", statement: KNOWLEDGE_STATEMENT, constraints: CONSTRAINTS }],
      });
      const scene = planned.scenes[0];
      expect(scene.knowledgeStatement).toBe(KNOWLEDGE_STATEMENT);
      expect(scene.constraints).toEqual(CONSTRAINTS);

      // ---- Scene Validation (§5 — chặn TRƯỚC khi có bất kỳ lệnh gọi mạng nào tới LTX) ----
      const validation = validateScene(scene);
      expect(validation).toEqual({ valid: true, errors: [] });

      // ---- Prompt Builder ----
      const built = buildPrompt(scene, { aspectRatio: "16:9" });
      for (const c of CONSTRAINTS) expect(built.prompt).toContain(c);

      const model = "ltx-2-5-fast"; // model LTX đã VERIFIED thật ở STEP 2
      const resolution = "1280x720"; // đã VERIFIED thật ở STEP 2

      // ---- LTX thật ----
      const provider = getVideoProvider("ltx");
      const thoiDiemBatDauGoi = Date.now();
      console.log(`[feng-shui-proof] Gửi prompt thật tới LTX (scene "${scene.title}")`);
      const handle = await provider.generateVideo({
        prompt: built.prompt,
        negativePrompt: built.negativePrompt,
        durationSeconds: built.durationSeconds,
        aspectRatio: built.aspectRatio,
        resolution,
        model,
      });
      console.log(`[feng-shui-proof] Đã submit — jobId=${handle.externalJobId}, status=${handle.status}`);

      const diemDung: ReadonlySet<string> = new Set([...TRANG_THAI_KET_THUC, "completed"]);
      let ketQua = await provider.getGenerationStatus(handle.externalJobId);
      while (!diemDung.has(ketQua.status)) {
        if (Date.now() - thoiDiemBatDauGoi > MAX_WAIT_MS) {
          throw new Error(`[feng-shui-proof] Quá ${MAX_WAIT_MS / 1000}s vẫn chưa xong (trạng thái cuối: ${ketQua.status}).`);
        }
        await sleep(POLL_INTERVAL_MS);
        ketQua = await provider.getGenerationStatus(handle.externalJobId);
        console.log(`[feng-shui-proof] Poll — status=${ketQua.status}`);
      }

      // §7: hết credit -> DỪNG ĐÚNG LÚC, KHÔNG coi là bug, KHÔNG thử lại/nạp tiền tự động.
      if (ketQua.status !== "completed" && ketQua.errorMessage?.includes("insufficient_funds")) {
        console.warn(
          `[feng-shui-proof] READY FOR REAL GENERATION — pipeline hợp lệ tới tận request cuối cùng, ` +
            `nhưng tài khoản LTX.io hết credit (${ketQua.errorMessage}). Không tự nạp tiền, dừng ở đây.`,
        );
        expect(ketQua.errorMessage).toContain("insufficient_funds");
        return;
      }

      expect(ketQua.status).toBe("completed");
      expect(ketQua.videoUrl).toBeTruthy();

      // ---- Download MP4 thật ----
      await mkdir(OUTPUT_DIR, { recursive: true });
      const res = await fetch(ketQua.videoUrl!);
      if (!res.ok) throw new Error(`Tải video thất bại — HTTP ${res.status}.`);
      const buffer = Buffer.from(await res.arrayBuffer());
      const tenFile = `feng-shui-proof-${handle.externalJobId}.mp4`;
      const duongDanFile = path.join(OUTPUT_DIR, tenFile);
      await writeFile(duongDanFile, buffer);
      console.log(`[feng-shui-proof] Đã tải MP4: ${duongDanFile} (${buffer.byteLength} bytes)`);

      expect(existsSync(duongDanFile)).toBe(true);
      const kichThuoc = await stat(duongDanFile);
      expect(kichThuoc.size).toBeGreaterThan(MIN_VALID_MP4_BYTES);

      // ---- Video Quality Review Data (§8) — KHÔNG ghi API key ----
      const chiPhi = uocTinhChiPhi({ provider: "ltx", model, durationSeconds: built.durationSeconds, resolution });
      const metadata = {
        provider: "ltx",
        model,
        durationSeconds: built.durationSeconds,
        resolution,
        aspectRatio: built.aspectRatio,
        prompt: built.prompt,
        negativePrompt: built.negativePrompt,
        sceneId: scene.id,
        knowledgeReference: scene.knowledgeReference,
        knowledgeStatement: scene.knowledgeStatement,
        constraints: scene.constraints,
        generationJobId: handle.externalJobId,
        generatedFile: tenFile,
        generationTimeMs: Date.now() - thoiDiemBatDauGoi,
        estimatedCostUsd: chiPhi.khoaGia ? chiPhi.usd : null,
        createdAt: new Date().toISOString(),
      };
      await writeFile(path.join(OUTPUT_DIR, `feng-shui-proof-${handle.externalJobId}-metadata.json`), JSON.stringify(metadata, null, 2));
      console.log("[feng-shui-proof] Đã ghi metadata:", JSON.stringify(metadata));
    },
    MAX_WAIT_MS + 30_000,
  );

  if (!sanSangChayThat("LTX_API_KEY")) {
    it("báo rõ lý do bỏ qua (không fake key, không âm thầm tốn tiền)", () => {
      const lyDo = !coBienMoiTruong("LTX_API_KEY")
        ? "chưa có LTX_API_KEY trong .env"
        : "có key nhưng thiếu cờ RUN_AI_VIDEO_SMOKE_TEST=1 (tránh test suite thường ngày âm thầm gọi API thật tốn tiền)";
      console.warn(`[feng-shui-proof] BỎ QUA — ${lyDo}.`);
      expect(true).toBe(true);
    });
  }
});
