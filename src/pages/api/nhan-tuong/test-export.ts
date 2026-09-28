/**
 * XUẤT DỮ LIỆU NGHIÊN CỨU — CHỈ CHẠY Ở DEV (Phase 1D-3A).
 *
 * ⚠️ CỔNG BẢO VỆ LÀ CẮT LÚC BUILD, KHÔNG PHẢI KIỂM LÚC CHẠY.
 * Vite thay `import.meta.env.DEV` bằng hằng số khi build, nên trong worker production
 * toàn bộ thân xử lý bị tree-shake mất — endpoint không "kiểm rồi từ chối", nó KHÔNG
 * TỒN TẠI. Đã kiểm bằng cách grep `dist/` sau khi build.
 *
 * Xuất theo DANH SÁCH sessionId, không theo participant: `SessionStore` chỉ có
 * get/put/delete theo id, KHÔNG liệt kê được, và thêm khoá index vào KV nghĩa là đụng
 * vào đường ghi của production. Máy tính (bảng điều khiển DEV) tự giữ bản đồ
 * participant → sessionId trong localStorage của chính nó và truyền id vào đây.
 *
 * KHÔNG xuất: ảnh, video, âm thanh, đối tượng MediaPipe, landmark thô, thông tin cá nhân.
 */

import type { APIRoute } from "astro";

import { resolveStore } from "../../../features/physiognomy/session/store";
import { buildResult } from "../../../features/physiognomy/session/types";
import type { SampleLabel } from "../../../features/physiognomy/session/sample";
import type { DeviceInfo } from "../../../features/physiognomy/session/device";
import { evaluateResearchSample, type ResearchVerdict } from "../../../features/physiognomy/session/research";
import type { PhysiognomySessionFeaturePayload } from "../../../features/physiognomy/features/transport";

export const prerender = false;

/**
 * KHÔNG export: nếu export thì nó là một binding công khai của module, Vite phải giữ
 * lại kể cả khi thân handler đã bị cắt — và bản build production sẽ vẫn còn chuỗi này.
 * Đã kiểm bằng grep dist/ (xem tài liệu Phase 1D-3A).
 */
const EXPORT_VERSION = "physiognomy-test-export-v1" as const;

/** Tối đa một lần xuất. Đủ cho 5 người × 3 lần, chặn ai đó quét cả kho. */
const MAX_IDS = 30;

/**
 * Một lượt quét đã xuất.
 *
 * Chỉ số đo có cấu trúc. Mọi thứ khác — 6 snapshot thô, writeToken, đường dẫn — đều
 * bị bỏ lại, không phải vì nặng mà vì không cần cho việc đo độ ổn định.
 */
export interface TestExportRun {
  exportVersion: "physiognomy-test-export-v1";
  sample: SampleLabel | null;
  sessionId: string;
  createdAt: number;
  completedAt: number | null;
  featureStatus: "none" | "ok" | "unavailable";
  featureError: string | null;
  /** Máy đã quét, do chính điện thoại khai. null với bản ghi cũ. */
  device: DeviceInfo | null;
  /**
   * Lượt này có đủ provenance để tính vào sổ kiểm chứng không. Xuất kèm để người vận
   * hành thấy ngay, thay vì phải tự đối chiếu bằng mắt sau khi đã tải về.
   */
  research: ResearchVerdict;
  /** Payload Transport V1 nguyên vẹn — provenance không bị cắt gọt. */
  featureProfile: PhysiognomySessionFeaturePayload | null;
  /** Tên tệp gợi ý, khớp với cách gom nhóm của scripts/nhan-tuong-do-lai.mjs. */
  suggestedFileName: string | null;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const GET: APIRoute = async ({ url }) => {
  // Cắt lúc build: ở production cả khối dưới đây biến mất, chỉ còn 404.
  if (!import.meta.env.DEV) {
    return new Response("Not found", { status: 404 });
  }

  const raw = url.searchParams.get("ids") ?? url.searchParams.get("id") ?? "";
  const ids = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) {
    return json({ error: "Thiếu tham số ids (phân tách bằng dấu phẩy)." }, 400);
  }
  if (ids.length > MAX_IDS) {
    return json({ error: `Tối đa ${MAX_IDS} phiên mỗi lần xuất.` }, 400);
  }

  const store = await resolveStore();
  const runs: (TestExportRun | { sessionId: string; error: string })[] = [];

  for (const id of ids) {
    const rec = await store.get(id);
    if (!rec) {
      runs.push({ sessionId: id, error: "Phiên không tồn tại hoặc đã hết hạn." });
      continue;
    }
    const result = rec.status === "complete" ? buildResult(rec) : null;
    const sample = rec.sample ?? null;
    const device = rec.device ?? null;
    const featureProfile = result?.featureProfile ?? rec.featureProfile ?? null;
    runs.push({
      exportVersion: EXPORT_VERSION,
      sample,
      sessionId: rec.sessionId,
      createdAt: rec.createdAt,
      completedAt: rec.completedAt,
      featureStatus: result?.featureStatus ?? rec.featureStatus ?? "none",
      featureError: result?.featureError ?? rec.featureError ?? null,
      device,
      research: evaluateResearchSample({
        sessionId: rec.sessionId,
        status: rec.status,
        completedAt: rec.completedAt,
        sample,
        device,
        hasFeatureProfile: featureProfile !== null,
      }),
      featureProfile,
      suggestedFileName: sample ? `${sample.participantId}__run${sample.runNumber}.json` : null,
    });
  }

  return json({ exportVersion: EXPORT_VERSION, count: runs.length, runs }, 200);
};
