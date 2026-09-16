/**
 * Mock CỨNG `../db/client` — job-manager không được phép chạm DB THẬT trong test (Neon production).
 * `db` thật là lazy Proxy chỉ throw khi có query, nhưng ở CI/local không có DATABASE_URL nên nếu
 * quên mock, test này sẽ throw "DATABASE_URL chưa được thiết lập" thay vì âm thầm gọi nhầm prod —
 * vẫn AN TOÀN, nhưng mock rõ ràng hơn và cho phép kiểm tra logic mà không cần Neon.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VideoProviderError } from "./providers/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let jobRow: any;

/**
 * STEP 6 §6: `createAndSubmitJob` giờ gọi `select().from().where().orderBy().limit()` để kiểm tra
 * job trùng lặp TRƯỚC KHI insert — tách riêng thành 1 mock có thể override `mockResolvedValueOnce`
 * cho từng test, mặc định trả về `[jobRow]` nếu có (giữ hành vi cũ cho `getJob`/`pollJob`/`cancelJob`
 * vốn cũng dùng chung `select().where().limit()`, không có `orderBy`).
 */
const selectLimitMock = vi.fn(async () => (jobRow ? [jobRow] : []));

vi.mock("../db/client", () => ({
  db: {
    insert: () => ({
      values: (v: Record<string, unknown>) => ({
        returning: async () => {
          jobRow = { id: "job-1", createdAt: new Date(), updatedAt: new Date(), ...v };
          return [jobRow];
        },
      }),
    }),
    update: () => ({
      set: (patch: Record<string, unknown>) => ({
        where: () => ({
          returning: async () => {
            jobRow = { ...jobRow, ...patch };
            return [jobRow];
          },
        }),
      }),
    }),
    select: () => ({
      from: () => ({
        where: () => ({
          orderBy: () => ({ limit: () => selectLimitMock() }),
          limit: () => selectLimitMock(),
        }),
      }),
    }),
  },
}));

const mockProvider = {
  id: "wan" as const,
  getProviderInfo: vi.fn(),
  validateCredentials: vi.fn(),
  // Mặc định "identity" — không điền default gì (giống provider không có default nào cần resolve).
  // Test §3 override implementation này để mô phỏng provider CÓ default (như LTXProvider thật).
  resolveRequest: vi.fn((r: Record<string, unknown>) => r),
  generateVideo: vi.fn(),
  getGenerationStatus: vi.fn(),
  cancelGeneration: vi.fn(),
};

vi.mock("./providers/registry", () => ({
  getVideoProvider: () => mockProvider,
}));

const { createAndSubmitJob, pollJob, cancelJob, listRecentJobs, retryJob, JobRetryError } = await import("./job-manager");

describe("job-manager", () => {
  beforeEach(() => {
    jobRow = undefined;
    vi.clearAllMocks();
    mockProvider.resolveRequest.mockImplementation((r: Record<string, unknown>) => r);
  });

  it("createAndSubmitJob: submit thành công -> lưu externalJobId + status theo handle của provider", async () => {
    mockProvider.generateVideo.mockResolvedValue({ externalJobId: "ext-1", status: "submitted" });
    const job = await createAndSubmitJob({ createdBy: "user-1", provider: "wan", request: { prompt: "a scene" } });
    expect(job.status).toBe("submitted");
    expect(job.externalJobId).toBe("ext-1");
  });

  it("createAndSubmitJob: provider ném VideoProviderError KHÔNG retryable -> lưu đúng status/errorMessage, CHỈ gọi generateVideo 1 lần", async () => {
    mockProvider.generateVideo.mockRejectedValue(new VideoProviderError("auth_error", "Chưa cấu hình WAN_API_KEY.", false));
    const job = await createAndSubmitJob({ createdBy: "user-1", provider: "wan", request: { prompt: "a" } });
    expect(job.status).toBe("auth_error");
    expect(job.errorMessage).toContain("WAN_API_KEY");
    expect(mockProvider.generateVideo).toHaveBeenCalledTimes(1);
  });

  describe("STEP 6 §3 — Provenance: resolveRequest được gọi và persist đúng giá trị đã resolve", () => {
    it("provider có default (mô phỏng LTX) -> DB lưu model/resolution/duration ĐÃ RESOLVE, không lưu undefined", async () => {
      mockProvider.resolveRequest.mockImplementation((r: Record<string, unknown>) => ({
        ...r,
        model: r.model ?? "ltx-2-5-fast",
        resolution: r.resolution ?? "1280x720",
        durationSeconds: r.durationSeconds ?? 6,
      }));
      mockProvider.generateVideo.mockResolvedValue({ externalJobId: "ext-1", status: "queued" });

      const job = await createAndSubmitJob({ createdBy: "user-1", provider: "wan", request: { prompt: "a scene" } });

      expect(job.model).toBe("ltx-2-5-fast");
      expect(job.resolution).toBe("1280x720");
      expect(job.durationSeconds).toBe(6);
      // generateVideo phải nhận request ĐÃ RESOLVE, không phải request thô ban đầu.
      expect(mockProvider.generateVideo).toHaveBeenCalledWith(expect.objectContaining({ model: "ltx-2-5-fast" }));
    });

    it("request đã có model/resolution rõ ràng -> DB lưu ĐÚNG giá trị explicit, không bị resolveRequest ghi đè", async () => {
      mockProvider.resolveRequest.mockImplementation((r: Record<string, unknown>) => ({
        ...r,
        model: r.model ?? "ltx-2-5-fast",
        resolution: r.resolution ?? "1280x720",
      }));
      mockProvider.generateVideo.mockResolvedValue({ externalJobId: "ext-1", status: "queued" });

      const job = await createAndSubmitJob({
        createdBy: "user-1",
        provider: "wan",
        request: { prompt: "a scene", model: "ltx-2-5-pro", resolution: "1920x1080" },
      });

      expect(job.model).toBe("ltx-2-5-pro");
      expect(job.resolution).toBe("1920x1080");
    });
  });

  describe("STEP 6 §5 — Retry: chỉ retry lỗi retryable, bounded, không tạo job trùng", () => {
    it("lỗi retryable ở lần 1, thành công ở lần 2 -> job cuối cùng THÀNH CÔNG, generateVideo gọi đúng 2 lần", async () => {
      mockProvider.generateVideo
        .mockRejectedValueOnce(new VideoProviderError("rate_limit", "Vượt rate limit.", true))
        .mockResolvedValueOnce({ externalJobId: "ext-1", status: "queued" });

      const job = await createAndSubmitJob({ createdBy: "user-1", provider: "wan", request: { prompt: "a" } });

      expect(mockProvider.generateVideo).toHaveBeenCalledTimes(2);
      expect(job.status).toBe("queued");
      expect(job.externalJobId).toBe("ext-1");
    });

    it("lỗi retryable ở CẢ 2 lần -> dừng lại (không retry vô hạn), lưu lỗi cuối cùng", async () => {
      mockProvider.generateVideo.mockRejectedValue(new VideoProviderError("rate_limit", "Vượt rate limit mãi.", true));

      const job = await createAndSubmitJob({ createdBy: "user-1", provider: "wan", request: { prompt: "a" } });

      expect(mockProvider.generateVideo).toHaveBeenCalledTimes(2); // đúng SO_LAN_THU_SUBMIT_TOI_DA, không hơn
      expect(job.status).toBe("rate_limit");
    });

    it("lỗi KHÔNG retryable (vd auth_error) -> KHÔNG retry, chỉ gọi generateVideo 1 lần", async () => {
      mockProvider.generateVideo.mockRejectedValue(new VideoProviderError("auth_error", "Sai key.", false));

      const job = await createAndSubmitJob({ createdBy: "user-1", provider: "wan", request: { prompt: "a" } });

      expect(mockProvider.generateVideo).toHaveBeenCalledTimes(1);
      expect(job.status).toBe("auth_error");
    });
  });

  describe("STEP 6 §6 — Idempotency: cùng request khi job cũ CÒN đang chạy -> không tạo job/generate mới", () => {
    it("có job ACTIVE trùng khớp (createdBy+provider+model+prompt+duration+resolution) -> trả về job đó, KHÔNG gọi generateVideo, KHÔNG insert mới", async () => {
      const jobDangChay = {
        id: "job-dang-chay",
        status: "processing",
        provider: "wan",
        model: undefined,
        prompt: "a scene",
        durationSeconds: undefined,
        resolution: undefined,
        createdBy: "user-1",
      };
      selectLimitMock.mockResolvedValueOnce([jobDangChay]);

      const job = await createAndSubmitJob({ createdBy: "user-1", provider: "wan", request: { prompt: "a scene" } });

      expect(job).toEqual(jobDangChay);
      expect(mockProvider.generateVideo).not.toHaveBeenCalled();
    });

    it("prompt KHÁC -> KHÔNG coi là trùng, tạo job mới bình thường", async () => {
      selectLimitMock.mockResolvedValueOnce([]); // không có job trùng
      mockProvider.generateVideo.mockResolvedValue({ externalJobId: "ext-2", status: "queued" });

      const job = await createAndSubmitJob({ createdBy: "user-1", provider: "wan", request: { prompt: "prompt khác hẳn" } });

      expect(mockProvider.generateVideo).toHaveBeenCalledTimes(1);
      expect(job.externalJobId).toBe("ext-2");
    });

    it("model/resolution KHÁC (qua resolveRequest) -> KHÔNG coi là trùng, tạo job mới", async () => {
      mockProvider.resolveRequest.mockImplementation((r: Record<string, unknown>) => ({ ...r, model: "model-moi", resolution: "1920x1080" }));
      selectLimitMock.mockResolvedValueOnce([]);
      mockProvider.generateVideo.mockResolvedValue({ externalJobId: "ext-3", status: "queued" });

      const job = await createAndSubmitJob({ createdBy: "user-1", provider: "wan", request: { prompt: "a scene" } });

      expect(mockProvider.generateVideo).toHaveBeenCalledTimes(1);
      expect(job.externalJobId).toBe("ext-3");
    });

    it("job cũ ĐÃ kết thúc (vd 'ready') khớp request y hệt -> KHÔNG bị coi là trùng, admin render lại được bình thường", async () => {
      // selectLimitMock mặc định (không override) trả `jobRow ? [jobRow] : []` — jobRow chưa set nên
      // trả [] ở lần gọi đầu (kiểm tra trùng) — mô phỏng đúng hành vi thật: job "ready" cũ KHÔNG nằm
      // trong danh sách "đang hoạt động" (query thật lọc bằng notInArray(status, TRANG_THAI_KET_THUC)).
      mockProvider.generateVideo.mockResolvedValue({ externalJobId: "ext-4", status: "queued" });
      const job = await createAndSubmitJob({ createdBy: "user-1", provider: "wan", request: { prompt: "render lại y hệt" } });
      expect(mockProvider.generateVideo).toHaveBeenCalledTimes(1);
      expect(job.externalJobId).toBe("ext-4");
    });
  });

  describe("STEP 6 FINAL GATE — Concurrency: 2 request GIỐNG HỆT gửi ĐỒNG THỜI không được double-submit", () => {
    it("2 createAndSubmitJob() y hệt nhau gọi qua Promise.all -> CHỈ 1 lần SELECT kiểm tra trùng, CHỈ 1 lần generateVideo thật, cả 2 nhận CÙNG 1 job", async () => {
      // Test này KHÔNG dựa vào timing/setTimeout (sẽ flaky) — dựa vào chính ngữ nghĩa đồng bộ của JS:
      // `createAndSubmitJob` chạy đồng bộ (resolveRequest, tính fingerprint, set map) cho tới tận
      // `await timJobDangHoatDongTrungKhop(...)` bên trong `taoJobVaSubmit` — nghĩa là lệnh gọi ĐẦU
      // TIÊN trong `Promise.all([...])` LUÔN kịp ghi fingerprint vào `cacYeuCauDangXuLy` TRƯỚC KHI
      // JS bắt đầu chạy lệnh gọi THỨ HAI (Promise.all đánh giá các phần tử tuần tự, đồng bộ). Đây
      // CHÍNH LÀ cách chứng minh chặn được đúng trình tự race đã phân tích (A SELECT/B SELECT/A
      // INSERT/B INSERT/A submit/B submit) mà KHÔNG cần đoán mò độ trễ thật.
      let soLanGoiSelect = 0;
      selectLimitMock.mockImplementation(async () => {
        soLanGoiSelect++;
        return jobRow ? [jobRow] : [];
      });
      mockProvider.generateVideo.mockImplementation(async () => ({ externalJobId: "ext-song-song", status: "queued" }));

      const requestGiongHet = { createdBy: "user-1", provider: "wan" as const, request: { prompt: "prompt giong het nhau" } };

      const [jobA, jobB] = await Promise.all([createAndSubmitJob(requestGiongHet), createAndSubmitJob(requestGiongHet)]);

      // 1 lần createAndSubmitJob() THÀNH CÔNG tự nhiên gọi select 2 lần (kiểm tra trùng +
      // getJob() bên trong submitJob) — soLanGoiSelect === 2 nghĩa là CHỈ CÓ A thực sự chạy hết
      // luồng, B không hề tự SELECT lần nào (nếu B cũng tự chạy độc lập, con số này sẽ là 4).
      expect(soLanGoiSelect).toBe(2);
      expect(mockProvider.generateVideo).toHaveBeenCalledTimes(1); // KHÔNG double-submit thật lên provider
      expect(jobA.id).toBe(jobB.id); // cả 2 request nhận CÙNG 1 job, không phải 2 job riêng biệt
      expect(jobA.externalJobId).toBe("ext-song-song");
    });

    it("mutex được GIẢI PHÓNG sau khi xong — request MỚI (fingerprint y hệt) gửi SAU khi request trước đã xong vẫn được xử lý bình thường qua đường DB", async () => {
      mockProvider.generateVideo.mockResolvedValue({ externalJobId: "ext-lan-1", status: "queued" });
      const inputLap = { createdBy: "user-2", provider: "wan" as const, request: { prompt: "prompt lap lai" } };

      await createAndSubmitJob(inputLap); // lần 1 — xong, mutex tự xoá khỏi map (finally)

      // Lần 2: jobRow hiện là job vừa tạo (status "queued", CHƯA kết thúc) -> đường DB idempotency
      // (không phải mutex) sẽ coi đây là job đang hoạt động trùng khớp -> trả về CHÍNH job đó, không
      // gọi generateVideo thêm lần nữa. Đây là hành vi ĐÚNG (đã test riêng ở §6), test này chỉ xác
      // nhận mutex KHÔNG kẹt cứng vĩnh viễn — request lần 2 vẫn được XỬ LÝ (không bị treo/deadlock).
      const jobLan2 = await createAndSubmitJob(inputLap);
      expect(jobLan2.externalJobId).toBe("ext-lan-1");
      expect(mockProvider.generateVideo).toHaveBeenCalledTimes(1);
    });
  });

  it("pollJob: job đã ở trạng thái KẾT THÚC (ready) -> không gọi lại provider (đỡ tốn quota)", async () => {
    jobRow = { id: "job-1", status: "ready", externalJobId: "ext-1", provider: "wan" };
    const job = await pollJob("job-1");
    expect(job.status).toBe("ready");
    expect(mockProvider.getGenerationStatus).not.toHaveBeenCalled();
  });

  it("pollJob: đang processing, provider báo completed+videoUrl -> chuyển 'ready' và lưu resultUrl", async () => {
    jobRow = { id: "job-1", status: "processing", externalJobId: "ext-1", provider: "wan" };
    mockProvider.getGenerationStatus.mockResolvedValue({ status: "completed", videoUrl: "https://cdn/video.mp4" });
    const job = await pollJob("job-1");
    expect(job.status).toBe("ready");
    expect(job.resultUrl).toBe("https://cdn/video.mp4");
  });

  it("pollJob: provider báo lỗi KHÔNG retryable (vd insufficient funds trả về provider_error) -> job chuyển sang status lỗi tương ứng", async () => {
    jobRow = { id: "job-1", status: "processing", externalJobId: "ext-1", provider: "wan" };
    mockProvider.getGenerationStatus.mockResolvedValue({ status: "provider_error", errorMessage: "insufficient_funds_error: ..." });
    const job = await pollJob("job-1");
    expect(job.status).toBe("provider_error");
  });

  it("STEP 6 §5: pollJob ném lỗi RETRYABLE (429/5xx khi tra cứu) -> KHÔNG đánh dấu job kết thúc, chỉ ghi errorMessage — lần poll sau (client tự gọi lại) mới là retry thật", async () => {
    jobRow = { id: "job-1", status: "processing", externalJobId: "ext-1", provider: "wan" };
    mockProvider.getGenerationStatus.mockRejectedValue(new VideoProviderError("rate_limit", "Vượt rate limit.", true));
    const job = await pollJob("job-1");
    expect(job.status).toBe("processing"); // KHÔNG đổi thành "rate_limit" — vẫn còn sống để poll tiếp
    expect(job.errorMessage).toContain("Vượt rate limit");
  });

  it("pollJob: lỗi KHÔNG retryable khi tra cứu -> job chuyển sang status lỗi (terminal) như cũ", async () => {
    jobRow = { id: "job-1", status: "processing", externalJobId: "ext-1", provider: "wan" };
    mockProvider.getGenerationStatus.mockRejectedValue(new VideoProviderError("auth_error", "Sai key.", false));
    const job = await pollJob("job-1");
    expect(job.status).toBe("auth_error");
  });

  it("cancelJob: job đã ở trạng thái kết thúc -> không gọi cancelGeneration của provider", async () => {
    jobRow = { id: "job-1", status: "failed", externalJobId: "ext-1", provider: "wan" };
    const job = await cancelJob("job-1");
    expect(job.status).toBe("failed");
    expect(mockProvider.cancelGeneration).not.toHaveBeenCalled();
  });

  it("cancelJob: job đang chạy -> gọi cancelGeneration rồi đánh dấu 'cancelled'", async () => {
    jobRow = { id: "job-1", status: "processing", externalJobId: "ext-1", provider: "wan" };
    const job = await cancelJob("job-1");
    expect(mockProvider.cancelGeneration).toHaveBeenCalledWith("ext-1");
    expect(job.status).toBe("cancelled");
  });

  it("listRecentJobs: trả về danh sách job qua select().from().where().orderBy().limit() (đọc DB, không gọi provider)", async () => {
    jobRow = { id: "job-1", status: "ready", createdBy: "user-1", provider: "ltx" };
    const jobs = await listRecentJobs("user-1");
    expect(jobs).toEqual([jobRow]);
    expect(mockProvider.getGenerationStatus).not.toHaveBeenCalled();
  });

  describe("retryJob — Phase 2 §1: tạo job MỚI từ request đã lưu của job cũ, không gọi lại scene-planner", () => {
    const oldFailedJob = {
      id: "job-old",
      status: "failed",
      createdBy: "user-1",
      provider: "wan" as const,
      topic: "chu de goc",
      sceneIndex: 2,
      sceneTitle: "Canh 2",
      sceneKnowledgeRef: "k2",
      prompt: "prompt da luu tu truoc",
      negativePrompt: "neg da luu",
      model: "model-cu",
      durationSeconds: 5,
      resolution: "720p",
      aspectRatio: "16:9",
    };

    it("A+B: retry job lỗi -> tạo job MỚI, request gửi cho provider LẤY ĐÚNG dữ liệu đã lưu của job cũ (không tạo prompt mới)", async () => {
      selectLimitMock.mockResolvedValueOnce([oldFailedJob]); // getJob(jobId) bên trong retryJob
      selectLimitMock.mockResolvedValueOnce([]); // dedup-check bên trong createAndSubmitJob -> không có job active trùng
      mockProvider.generateVideo.mockResolvedValue({ externalJobId: "ext-retry", status: "submitted" });

      const newJob = await retryJob("job-old", "user-1");

      expect(newJob.id).not.toBe("job-old"); // job MỚI, không phải ghi đè job cũ
      expect(newJob.status).toBe("submitted");
      expect(newJob.externalJobId).toBe("ext-retry");
      expect(mockProvider.generateVideo).toHaveBeenCalledTimes(1);
      expect(mockProvider.generateVideo).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: oldFailedJob.prompt,
          negativePrompt: oldFailedJob.negativePrompt,
          model: oldFailedJob.model,
          durationSeconds: oldFailedJob.durationSeconds,
          resolution: oldFailedJob.resolution,
          aspectRatio: oldFailedJob.aspectRatio,
        }),
      );
      expect(newJob.prompt).toBe(oldFailedJob.prompt);
      expect(newJob.provider).toBe(oldFailedJob.provider);
      expect(newJob.sceneTitle).toBe(oldFailedJob.sceneTitle);
    });

    it("C: job đã 'ready' (không lỗi) -> từ chối retry với status 400, KHÔNG gọi generateVideo", async () => {
      const readyJob = { ...oldFailedJob, id: "job-ready", status: "ready", resultUrl: "https://x/video.mp4" };
      selectLimitMock.mockResolvedValueOnce([readyJob]);

      await expect(retryJob("job-ready", "user-1")).rejects.toMatchObject({ status: 400 });
      expect(mockProvider.generateVideo).not.toHaveBeenCalled();
    });

    it("C2: job đang chạy dở ('processing', không phải lỗi) -> từ chối retry với status 400", async () => {
      const runningJob = { ...oldFailedJob, id: "job-run", status: "processing" };
      selectLimitMock.mockResolvedValueOnce([runningJob]);

      await expect(retryJob("job-run", "user-1")).rejects.toBeInstanceOf(JobRetryError);
      expect(mockProvider.generateVideo).not.toHaveBeenCalled();
    });

    it("D: job thuộc user KHÁC -> từ chối với status 403, KHÔNG gọi generateVideo", async () => {
      selectLimitMock.mockResolvedValueOnce([oldFailedJob]); // createdBy: "user-1"

      await expect(retryJob("job-old", "user-2")).rejects.toMatchObject({ status: 403 });
      expect(mockProvider.generateVideo).not.toHaveBeenCalled();
    });

    it("E: provider từ chối lần retry (lỗi KHÔNG retryable) -> retryJob vẫn RESOLVE với job mới mang status lỗi, đúng contract sẵn có của createAndSubmitJob (không throw, không có đường tắt riêng)", async () => {
      selectLimitMock.mockResolvedValueOnce([oldFailedJob]);
      selectLimitMock.mockResolvedValueOnce([]);
      mockProvider.generateVideo.mockRejectedValue(new VideoProviderError("auth_error", "LTX từ chối API key.", false));

      const newJob = await retryJob("job-old", "user-1");

      expect(newJob.status).toBe("auth_error");
      expect(newJob.errorMessage).toBe("LTX từ chối API key.");
      expect(mockProvider.generateVideo).toHaveBeenCalledTimes(1); // không retry thêm (lỗi không retryable)
    });
  });
});
