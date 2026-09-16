/**
 * JOB MANAGER — Phase 10 của kiến trúc CONG AI VIDEO: vòng đời job tạo video AI
 * (queued → submitted → processing → completed → ready | failed/...), lưu ở DB (`ai_video_jobs`)
 * vì generation là ASYNC và có thể mất vài phút — route API không được giữ request chờ suốt lúc đó.
 *
 * KHÔNG có worker/queue nền: `pollJob` được gọi TRỰC TIẾP bởi route GET jobs/[id] mỗi khi UI hỏi
 * trạng thái (client tự setInterval) — đủ dùng ở quy mô nội bộ 1 admin, không cần Redis/BullMQ.
 *
 * STEP 6 — 3 thay đổi so với bản gốc (mỗi thay đổi có lý do riêng, xem đúng chỗ):
 *   §3 Provenance: `createAndSubmitJob` gọi `provider.resolveRequest()` NGAY ĐẦU, persist giá trị ĐÃ
 *      RESOLVE (model/resolution/duration thật sẽ gửi đi) thay vì giá trị thô caller gửi (có thể thiếu).
 *   §5 Retry: `submitJob` tự retry (bounded, có backoff) khi lỗi `retryable`; `pollJob` KHÔNG đánh dấu
 *      job kết thúc khi gặp lỗi tạm thời khi tra cứu trạng thái (để lần poll tự nhiên tiếp theo của
 *      UI đóng vai trò retry, không cần thêm queue/sleep chặn request).
 *   §6 Idempotency: `createAndSubmitJob` kiểm tra job ĐANG HOẠT ĐỘNG (chưa kết thúc) có cùng
 *      (createdBy, provider, model, prompt, duration, resolution) hay không — có thì trả về job đó
 *      thay vì tạo job/generate mới. Dùng NGUYÊN cột hiện có, không thêm cột DB mới.
 */
import { and, desc, eq, isNull, notInArray } from "drizzle-orm";
import { db } from "../db/client";
import { aiVideoJobs } from "../../../db/schema";
import { uocTinhChiPhi } from "./cost";
import { getVideoProvider } from "./providers/registry";
import {
  VideoProviderError,
  TRANG_THAI_KET_THUC,
  TRANG_THAI_LOI,
  type VideoGenerationRequest,
  type VideoJobStatus,
  type VideoProviderId,
} from "./providers/types";

export interface CreateJobInput {
  createdBy: string;
  provider: VideoProviderId;
  request: VideoGenerationRequest;
  topic?: string;
  sceneIndex?: number;
  sceneTitle?: string;
  sceneKnowledgeRef?: string;
}

export type AiVideoJobRow = typeof aiVideoJobs.$inferSelect;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function updateJob(id: string, patch: Partial<typeof aiVideoJobs.$inferInsert>): Promise<AiVideoJobRow> {
  const [row] = await db
    .update(aiVideoJobs)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(aiVideoJobs.id, id))
    .returning();
  return row;
}

/**
 * STEP 6 §6: tìm job CÙNG request, CÒN ĐANG HOẠT ĐỘNG (chưa tới trạng thái kết thúc) của đúng người
 * tạo — double-submit (double-click, network retry ở client) sẽ trả về job đang chạy thay vì tạo
 * job/generate thật lần 2. CỐ TÌNH chỉ so khớp job CHƯA kết thúc — job cũ đã ready/failed/cancelled
 * KHÔNG được tính, để admin muốn render lại y hệt (chọn lại đúng scene, đúng provider) vẫn tạo được
 * job mới, không bị chặn oan.
 */
async function timJobDangHoatDongTrungKhop(input: {
  createdBy: string;
  provider: VideoProviderId;
  model?: string;
  prompt: string;
  durationSeconds?: number;
  resolution?: string;
}): Promise<AiVideoJobRow | null> {
  const [row] = await db
    .select()
    .from(aiVideoJobs)
    .where(
      and(
        eq(aiVideoJobs.createdBy, input.createdBy),
        eq(aiVideoJobs.provider, input.provider),
        eq(aiVideoJobs.prompt, input.prompt),
        input.model !== undefined ? eq(aiVideoJobs.model, input.model) : isNull(aiVideoJobs.model),
        input.durationSeconds !== undefined ? eq(aiVideoJobs.durationSeconds, input.durationSeconds) : isNull(aiVideoJobs.durationSeconds),
        input.resolution !== undefined ? eq(aiVideoJobs.resolution, input.resolution) : isNull(aiVideoJobs.resolution),
        notInArray(aiVideoJobs.status, Array.from(TRANG_THAI_KET_THUC)),
      ),
    )
    .orderBy(desc(aiVideoJobs.createdAt))
    .limit(1);
  return row ?? null;
}

/**
 * STEP 6 FINAL GATE — mutex TRONG TIẾN TRÌNH, khoá theo "dấu vân tay" request (createdBy+provider+
 * model+prompt+duration+resolution) — xem phân tích race condition đầy đủ ở comment
 * `createAndSubmitJob` bên dưới. Không phải distributed lock (không Redis, không DB, không cần
 * transaction) — chỉ đủ cho ĐÚNG quy mô V1 (1 tiến trình Node duy nhất qua PM2, không cluster nhiều
 * instance cho module nội bộ này). Nếu sau này chạy nhiều instance/process thì mutex này KHÔNG còn
 * đủ — giải pháp đúng lúc đó là unique index (created_by, provider, model, prompt, duration_seconds,
 * resolution) WHERE status NOT IN (...) + `INSERT ... ON CONFLICT`, nhưng đó là migration DB, CHƯA
 * làm ở đây (không tự ý migrate khi chưa thật sự cần cho quy mô hiện tại).
 */
const cacYeuCauDangXuLy = new Map<string, Promise<AiVideoJobRow>>();

function tinhFingerprint(input: {
  createdBy: string;
  provider: VideoProviderId;
  model?: string;
  prompt: string;
  durationSeconds?: number;
  resolution?: string;
}): string {
  return JSON.stringify([input.createdBy, input.provider, input.model, input.prompt, input.durationSeconds, input.resolution]);
}

/**
 * Tạo job (status "queued") RỒI submit ngay cho provider — tách 2 bước để job luôn có 1 dòng DB dù
 * bước submit thất bại (vd thiếu API key), thay vì mất trắng thông tin request đã nhập.
 *
 * PHÂN TÍCH RACE CONDITION (STEP 6 FINAL GATE): 2 request giống hệt nhau (cùng createdBy/provider/
 * model/prompt/duration/resolution) đến gần như đồng thời — nếu KHÔNG có mutex bên dưới, trình tự
 *   1. A SELECT (timJobDangHoatDongTrungKhop) -> [] (chưa có job nào)
 *   2. B SELECT -> [] (A CHƯA insert xong, B cũng không thấy gì)
 *   3. A INSERT -> tạo job A
 *   4. B INSERT -> tạo job B (KHÁC job A — không có unique constraint nào ngăn)
 *   5. A submit -> gọi provider.generateVideo() THẬT lần 1
 *   6. B submit -> gọi provider.generateVideo() THẬT lần 2 — DUPLICATE, tốn tiền 2 lần
 * HOÀN TOÀN CÓ THỂ xảy ra: driver DB đang dùng (`drizzle-orm/neon-http`) KHÔNG hỗ trợ transaction
 * (`db.transaction()` ném lỗi "No transactions support in neon-http driver" — đã xác nhận trực tiếp
 * trong node_modules), nên không có cách nào khoá SELECT+INSERT thành 1 thao tác nguyên tử ở tầng
 * Postgres mà không đổi driver (ngoài phạm vi) hoặc thêm unique index (migration, chưa thật sự cần
 * cho quy mô 1 admin dùng nội bộ). Mutex trong tiến trình bên dưới đóng đúng khoảng hở này: request
 * thứ 2 với CÙNG fingerprint trong lúc request 1 còn đang xử lý sẽ CHỜ CHUNG kết quả của request 1
 * thay vì tự SELECT/INSERT/submit — loại bỏ hoàn toàn khả năng duplicate submission ở bước 2/4/6.
 */
export async function createAndSubmitJob(input: CreateJobInput): Promise<AiVideoJobRow> {
  const provider = getVideoProvider(input.provider);
  // §3: resolve TRƯỚC — mọi thứ persist/ước tính chi phí/kiểm tra trùng lặp/fingerprint bên dưới đều
  // dùng giá trị ĐÃ RESOLVE (model/resolution/duration thật sẽ gửi lên provider).
  const resolvedRequest = provider.resolveRequest(input.request);
  const fingerprint = tinhFingerprint({
    createdBy: input.createdBy,
    provider: input.provider,
    model: resolvedRequest.model,
    prompt: resolvedRequest.prompt,
    durationSeconds: resolvedRequest.durationSeconds,
    resolution: resolvedRequest.resolution,
  });

  const dangXuLy = cacYeuCauDangXuLy.get(fingerprint);
  if (dangXuLy) return dangXuLy; // request y hệt đang trong lúc SELECT/INSERT/submit -> chờ CHUNG kết quả

  const promise = taoJobVaSubmit(input, resolvedRequest);
  cacYeuCauDangXuLy.set(fingerprint, promise);
  try {
    return await promise;
  } finally {
    // Xoá khỏi map NGAY KHI xong (dù thành công hay lỗi) — mutex chỉ khoá khoảng hở SELECT→INSERT→
    // submit LẦN ĐẦU, không khoá suốt vòng đời job. Request y hệt gửi SAU khi job đã tồn tại trong DB
    // (dù đang chạy hay đã xong) đi qua `timJobDangHoatDongTrungKhop` như bình thường — job đã kết
    // thúc (ready/failed/...) vẫn render lại được, không bị mutex này chặn oan.
    cacYeuCauDangXuLy.delete(fingerprint);
  }
}

async function taoJobVaSubmit(input: CreateJobInput, resolvedRequest: VideoGenerationRequest): Promise<AiVideoJobRow> {
  const daTrung = await timJobDangHoatDongTrungKhop({
    createdBy: input.createdBy,
    provider: input.provider,
    model: resolvedRequest.model,
    prompt: resolvedRequest.prompt,
    durationSeconds: resolvedRequest.durationSeconds,
    resolution: resolvedRequest.resolution,
  });
  if (daTrung) return daTrung;

  const chiPhi = uocTinhChiPhi({
    provider: input.provider,
    model: resolvedRequest.model,
    durationSeconds: resolvedRequest.durationSeconds,
    resolution: resolvedRequest.resolution,
  });

  const [job] = await db
    .insert(aiVideoJobs)
    .values({
      createdBy: input.createdBy,
      topic: input.topic,
      sceneIndex: input.sceneIndex,
      sceneTitle: input.sceneTitle,
      sceneKnowledgeRef: input.sceneKnowledgeRef,
      provider: input.provider,
      model: resolvedRequest.model,
      prompt: resolvedRequest.prompt,
      negativePrompt: resolvedRequest.negativePrompt,
      durationSeconds: resolvedRequest.durationSeconds,
      resolution: resolvedRequest.resolution,
      aspectRatio: resolvedRequest.aspectRatio,
      status: "queued",
      estimatedCostUsd: chiPhi.khoaGia ? String(chiPhi.usd) : null,
    })
    .returning();

  return submitJob(job.id, resolvedRequest);
}

const SO_LAN_THU_SUBMIT_TOI_DA = 2; // 1 lần gốc + tối đa 1 lần thử lại — nhỏ, deterministic, không vô hạn
const BACKOFF_MS = 800;

/**
 * STEP 6 §5: retry BOUNDED, chỉ khi lỗi `retryable` (429/5xx tạm thời) — KHÔNG retry lỗi 400/401/403/
 * insufficient-funds/invalid request (adapter đã tự gắn `retryable:false` cho các lỗi này). Retry CHỈ
 * gọi lại `generateVideo` trên CÙNG jobId (không tạo dòng DB mới), nên không tạo duplicate job.
 */
async function submitJob(jobId: string, request: VideoGenerationRequest): Promise<AiVideoJobRow> {
  const job = await getJob(jobId);
  const provider = getVideoProvider(job.provider);

  let loiCuoi: unknown;
  for (let lan = 1; lan <= SO_LAN_THU_SUBMIT_TOI_DA; lan++) {
    try {
      const handle = await provider.generateVideo(request);
      return updateJob(jobId, { status: handle.status, externalJobId: handle.externalJobId });
    } catch (err) {
      loiCuoi = err;
      const coTheThuLai = err instanceof VideoProviderError && err.retryable;
      if (!coTheThuLai || lan === SO_LAN_THU_SUBMIT_TOI_DA) break;
      await sleep(BACKOFF_MS * lan);
    }
  }
  return updateJob(jobId, mapErrorToPatch(loiCuoi));
}

/**
 * Poll trạng thái job từ provider và ĐỒNG BỘ lại DB — gọi mỗi lần UI hỏi trạng thái. Job đã ở trạng
 * thái kết thúc (ready/failed/...) thì trả thẳng dòng DB, KHÔNG gọi lại provider (tránh tốn quota API
 * vô ích cho 1 job đã xong từ lâu).
 */
export async function pollJob(jobId: string): Promise<AiVideoJobRow> {
  const job = await getJob(jobId);
  if (TRANG_THAI_KET_THUC.has(job.status)) return job;
  if (!job.externalJobId) return job; // chưa submit thành công thì không có gì để poll

  const provider = getVideoProvider(job.provider);
  try {
    const result = await provider.getGenerationStatus(job.externalJobId);
    if (result.status === "completed" && result.videoUrl) {
      return updateJob(jobId, { status: "ready", resultUrl: result.videoUrl });
    }
    return updateJob(jobId, { status: result.status, errorMessage: result.errorMessage });
  } catch (err) {
    // §5: lỗi TẠM THỜI (429/5xx) khi TRA CỨU trạng thái — KHÔNG đánh dấu job kết thúc, chỉ ghi lại
    // message để hiển thị. Lần poll TIẾP THEO (client tự gọi lại ~5s sau, xem cong-ai-video/index.astro)
    // sẽ tự thử lại — đây CHÍNH LÀ retry của V1 cho việc poll, không cần thêm sleep/backoff chặn request
    // HTTP hiện tại (khác `submitJob` ở trên — submit chỉ xảy ra 1 lần/job nên retry inline hợp lý hơn).
    if (err instanceof VideoProviderError && err.retryable) {
      return updateJob(jobId, { errorMessage: err.message });
    }
    return updateJob(jobId, mapErrorToPatch(err));
  }
}

export async function cancelJob(jobId: string): Promise<AiVideoJobRow> {
  const job = await getJob(jobId);
  if (TRANG_THAI_KET_THUC.has(job.status)) return job;

  const provider = getVideoProvider(job.provider);
  if (job.externalJobId) {
    await provider.cancelGeneration(job.externalJobId);
  }
  return updateJob(jobId, { status: "cancelled" });
}

export async function getJob(jobId: string): Promise<AiVideoJobRow> {
  const [row] = await db.select().from(aiVideoJobs).where(eq(aiVideoJobs.id, jobId)).limit(1);
  if (!row) throw new Error(`Không tìm thấy job ${jobId}.`);
  return row;
}

/**
 * Danh sách job gần nhất CỦA CHÍNH người tạo (`createdBy`) — dùng cho UI hiển thị lại lịch sử job
 * (trước đây job "biến mất" khỏi UI ngay khi rời trang dù đã lưu DB, dù đã TỐN TIỀN generate — video
 * cũ không xem/tải lại được nếu không tự nhớ jobId). KHÔNG poll lại provider — chỉ đọc DB, để mở danh
 * sách không tốn quota API cho các job đã kết thúc từ lâu.
 */
export async function listRecentJobs(createdBy: string, limit = 20): Promise<AiVideoJobRow[]> {
  return db.select().from(aiVideoJobs).where(eq(aiVideoJobs.createdBy, createdBy)).orderBy(desc(aiVideoJobs.createdAt)).limit(limit);
}

/** Lỗi retry có `status` HTTP đính kèm sẵn — route chỉ cần `jsonResponse({...}, err.status)`, không tự đoán mã lỗi bằng cách so khớp chuỗi message (giống cách `SceneValidationError` đã làm ở scene-validator.ts). */
export class JobRetryError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "JobRetryError";
    this.status = status;
  }
}

/**
 * Retry job Phase 2 §1: tạo job MỚI, TÁI SỬ DỤNG NGUYÊN request đã lưu của job cũ (prompt/
 * negativePrompt/model/duration/resolution/aspectRatio/provider) — KHÔNG gọi lại scene-planner, KHÔNG
 * tạo prompt mới, KHÔNG đổi provider/model đã lưu. Đi qua NGUYÊN `createAndSubmitJob` nên mọi
 * validation/idempotency/provenance hiện có vẫn áp dụng y hệt job thường — không có đường tắt riêng.
 *
 * CHỈ cho phép khi CẢ HAI: đúng người tạo (`requestedBy`) VÀ job cũ đang ở 1 trạng thái thuộc
 * `TRANG_THAI_LOI` (constant DÙNG CHUNG có sẵn, không tự định nghĩa danh sách mới) — job "ready" (có
 * resultUrl) hoặc đang chạy dở (queued/submitted/processing/...) đều bị từ chối, vì `TRANG_THAI_LOI`
 * chỉ chứa đúng các trạng thái lỗi.
 */
export async function retryJob(jobId: string, requestedBy: string): Promise<AiVideoJobRow> {
  const oldJob = await getJob(jobId); // throw Error thường (not-found) nếu không có — route map sang 404
  if (oldJob.createdBy !== requestedBy) {
    throw new JobRetryError(403, "Không có quyền retry job này.");
  }
  if (!TRANG_THAI_LOI.has(oldJob.status)) {
    throw new JobRetryError(400, `Chỉ retry được job ở trạng thái lỗi — job này đang ở trạng thái "${oldJob.status}".`);
  }

  return createAndSubmitJob({
    createdBy: oldJob.createdBy,
    provider: oldJob.provider,
    request: {
      prompt: oldJob.prompt,
      negativePrompt: oldJob.negativePrompt ?? undefined,
      model: oldJob.model ?? undefined,
      durationSeconds: oldJob.durationSeconds ?? undefined,
      resolution: oldJob.resolution ?? undefined,
      aspectRatio: oldJob.aspectRatio ?? undefined,
    },
    topic: oldJob.topic ?? undefined,
    sceneIndex: oldJob.sceneIndex ?? undefined,
    sceneTitle: oldJob.sceneTitle ?? undefined,
    sceneKnowledgeRef: oldJob.sceneKnowledgeRef ?? undefined,
  });
}

/**
 * Map lỗi provider (đã chuẩn hoá thành `VideoProviderError`) sang patch cập nhật DB — KHÔNG BAO GIỜ
 * ghi API key vào `errorMessage` (adapter đã tự đảm bảo message không chứa key, đây chỉ ghi lại message).
 */
function mapErrorToPatch(err: unknown): { status: VideoJobStatus; errorMessage: string } {
  if (err instanceof VideoProviderError) {
    return { status: err.status, errorMessage: err.message };
  }
  console.error("[ai-video] job-manager: lỗi không xác định", err);
  return { status: "provider_error", errorMessage: "Lỗi không xác định — xem log máy chủ." };
}
