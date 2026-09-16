/**
 * SMOKE TEST API THẬT — CONG AI VIDEO STEP 2.
 *
 * Mục tiêu DUY NHẤT: chứng minh `VideoProvider` gọi được API video THẬT và tải về được MP4 thật.
 * KHÔNG dùng job-manager/DB — gọi thẳng provider (`registry.getVideoProvider`) để tách biệt "provider
 * abstraction có hoạt động không" khỏi "DB/job-manager có hoạt động không" (đã có test riêng, mock DB).
 *
 * TỰ ĐỘNG SKIP trừ khi có CẢ HAI: (1) API key tương ứng trong `.env` VÀ (2) cờ bật tường minh
 * `RUN_AI_VIDEO_SMOKE_TEST=1`. CHỈ có key KHÔNG ĐỦ để chạy thật — `.env` production sẽ luôn có key
 * (app cần key đó để hoạt động), nếu chỉ xét "có key" thì MỌI lần chạy `vitest run` (kể cả CI, kể cả
 * `npm test` thường ngày) sẽ âm thầm tốn tiền gọi API video thật mỗi lần. Cờ riêng đảm bảo việc gọi
 * API thật luôn là hành động CÓ CHỦ ĐÍCH, không phải tác dụng phụ của việc chạy test suite.
 *
 * CHẠY THẬT (cần key thật + thời gian chờ vài phút + tốn tiền theo giá API thật):
 *   RUN_AI_VIDEO_SMOKE_TEST=1 npx vitest run src/lib/ai-video/smoke --testTimeout=300000
 *   (PowerShell: $env:RUN_AI_VIDEO_SMOKE_TEST=1; npx vitest run src/lib/ai-video/smoke --testTimeout=300000)
 *
 * KHÔNG BAO GIỜ in API key ra log — chỉ in trạng thái job và đường dẫn file đã tải.
 */
import { existsSync } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { getVideoProvider } from "../providers/registry";
import { TRANG_THAI_KET_THUC, type VideoProviderId } from "../providers/types";
import { coBienMoiTruong, sanSangChayThat, sleep, taiEnvTuFileNeuThieu } from "./_shared";

taiEnvTuFileNeuThieu();

const PROMPT = "A modern Vietnamese house exterior, cinematic daylight, slow camera movement.";
const OUTPUT_DIR = path.join(process.cwd(), "generated", "test");
const POLL_INTERVAL_MS = 8_000; // Wan docs: poll mỗi 5-10s, không dưới 3s.
const MAX_WAIT_MS = 4 * 60_000; // đa số job Wan/LTX hoàn thành trong 1-3 phút — 4 phút là biên an toàn.
const MIN_VALID_MP4_BYTES = 10_000; // loại trừ file rỗng/lỗi tải (trang lỗi HTML nhỏ, MP4 thật luôn lớn hơn nhiều)

async function taiVideoVeDia(videoUrl: string, fileName: string): Promise<{ path: string; bytes: number }> {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const res = await fetch(videoUrl);
  if (!res.ok) throw new Error(`Tải video thất bại — HTTP ${res.status}.`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const filePath = path.join(OUTPUT_DIR, fileName);
  await writeFile(filePath, buffer);
  return { path: filePath, bytes: buffer.byteLength };
}

async function chaySmokeTest(providerId: VideoProviderId): Promise<void> {
  const provider = getVideoProvider(providerId);

  console.log(`[smoke:${providerId}] Gửi prompt: "${PROMPT}"`);
  // 6s = giá trị nhỏ nhất hợp lệ theo support-matrix của LTX (docs.ltx.io/models/ltx-2-5) — cũng nằm
  // gọn trong khoảng hợp lệ của Wan (2-15s).
  const handle = await provider.generateVideo({ prompt: PROMPT, durationSeconds: 6, aspectRatio: "16:9" });
  console.log(`[smoke:${providerId}] Đã submit — externalJobId=${handle.externalJobId}, status=${handle.status}`);
  expect(handle.externalJobId).toBeTruthy();

  // "completed" (provider vừa xong, chưa re-host) và "ready" (job-manager đã re-host, không dùng ở
  // đây vì gọi provider trực tiếp) đều là điểm dừng hợp lệ — thiếu "completed" ở đây khiến vòng lặp
  // chạy mãi dù provider đã báo xong (bug thật gặp 13/9/2026: LTX xong sau ~16s nhưng test cứ poll
  // tới khi hết MAX_WAIT_MS mới timeout, dù không có gì sai ở phía API).
  const DIEM_DUNG: ReadonlySet<string> = new Set([...TRANG_THAI_KET_THUC, "completed"]);
  const batDau = Date.now();
  let ketQua = await provider.getGenerationStatus(handle.externalJobId);
  while (!DIEM_DUNG.has(ketQua.status)) {
    if (Date.now() - batDau > MAX_WAIT_MS) {
      throw new Error(`[smoke:${providerId}] Quá ${MAX_WAIT_MS / 1000}s vẫn chưa xong (trạng thái cuối: ${ketQua.status}).`);
    }
    await sleep(POLL_INTERVAL_MS);
    ketQua = await provider.getGenerationStatus(handle.externalJobId);
    console.log(`[smoke:${providerId}] Poll — status=${ketQua.status}`);
  }

  expect(ketQua.status).toBe("completed");
  expect(ketQua.videoUrl, "Provider báo completed nhưng không có videoUrl").toBeTruthy();

  const { path: filePath, bytes } = await taiVideoVeDia(ketQua.videoUrl!, `${providerId}-smoke-${Date.now()}.mp4`);
  console.log(`[smoke:${providerId}] Đã tải MP4: ${filePath} (${bytes} bytes)`);

  expect(existsSync(filePath)).toBe(true);
  const kichThuoc = await stat(filePath);
  expect(kichThuoc.size).toBeGreaterThan(MIN_VALID_MP4_BYTES);
}

describe("SMOKE TEST — Wan API thật", () => {
  it.skipIf(!sanSangChayThat("WAN_API_KEY"))(
    "TEXT -> Wan -> VIDEO -> MP4 thật",
    async () => {
      await chaySmokeTest("wan");
    },
    MAX_WAIT_MS + 30_000,
  );

  if (!sanSangChayThat("WAN_API_KEY")) {
    it("báo rõ lý do bỏ qua (không fake key, không âm thầm tốn tiền)", () => {
      const ly_do = !coBienMoiTruong("WAN_API_KEY")
        ? "chưa có WAN_API_KEY trong .env"
        : "có key nhưng thiếu cờ RUN_AI_VIDEO_SMOKE_TEST=1 (tránh test suite thường ngày âm thầm gọi API thật tốn tiền)";
      console.warn(`[smoke:wan] BỎ QUA — ${ly_do}.`);
      expect(true).toBe(true);
    });
  }
});

describe("SMOKE TEST — LTX API thật", () => {
  it.skipIf(!sanSangChayThat("LTX_API_KEY"))(
    "TEXT -> LTX -> VIDEO -> MP4 thật",
    async () => {
      await chaySmokeTest("ltx");
    },
    MAX_WAIT_MS + 30_000,
  );

  if (!sanSangChayThat("LTX_API_KEY")) {
    it("báo rõ lý do bỏ qua (không fake key, không âm thầm tốn tiền)", () => {
      const ly_do = !coBienMoiTruong("LTX_API_KEY")
        ? "chưa có LTX_API_KEY trong .env"
        : "có key nhưng thiếu cờ RUN_AI_VIDEO_SMOKE_TEST=1 (tránh test suite thường ngày âm thầm gọi API thật tốn tiền)";
      console.warn(`[smoke:ltx] BỎ QUA — ${ly_do}.`);
      expect(true).toBe(true);
    });
  }
});
