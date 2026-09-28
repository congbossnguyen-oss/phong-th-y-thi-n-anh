/**
 * TẬP DỮ LIỆU NGHIÊN CỨU — Validation Foundation, lát 1 (Phase 1D-4).
 *
 * Nhận N tệp đã xuất từ `/api/nhan-tuong/test-export`, trả về `ResearchSample[]` đã
 * chuẩn hoá, cộng các con số đếm ĐƯỢC SUY TỪ CHÍNH DỮ LIỆU.
 *
 * ⚠️ VÌ SAO MODULE NÀY TỒN TẠI: trước đây `participantCount` / `deviceCount` /
 * `sampleCount` chỉ được ghi ở HAI chỗ, cả hai đều là hằng số viết tay
 * (`chuaKiem()` → 0/0/0 và `BO_MAU_1D3` → 6/1/1). Không có đường nào để dữ liệu thật
 * chạm tới chúng, nên dù thu bao nhiêu mẫu thì các bộ đếm vẫn đứng yên. Module này là
 * đường đó.
 *
 * ⚠️ MODULE NÀY KHÔNG NÂNG BẤT CỨ TRẠNG THÁI NÀO. Nó không tính, không sửa và không
 * đề nghị `validationStatus` hay `evidenceLevel` — hai thứ đó vẫn do bảng tĩnh quyết
 * định. Nó chỉ ĐẾM. Việc đếm là dữ kiện; việc phong là quyết định của người, ở lát sau.
 *
 * KHÔNG SỬA CHỮA ÂM THẦM. Thiếu một trường là TỪ CHỐI cả lượt quét, kèm mã lý do.
 * Trùng nhãn là TỪ CHỐI cả tập — không có "bản mới thắng", vì chọn hộ nghĩa là quyết
 * định thay người vận hành xem lượt nào mới là thật.
 *
 * KHÔNG ĐỌC TỆP. Nhận nội dung đã đọc sẵn, để module chạy được ở mọi nơi và test không
 * cần dựng thư mục.
 */

import { VIEW_NAMES } from "../features/schema";
import {
  MAX_FEATURE_TRANSPORT_BYTES,
  parsePhysiognomySessionFeaturePayload,
  type PhysiognomySessionFeaturePayload,
} from "../features/transport";
import { deviceIsIdentified, DEVICE_MODEL_UNAVAILABLE, type DeviceInfo } from "../session/device";
import { MAX_RUN_NUMBER, type SampleLabel } from "../session/sample";

export const RESEARCH_DATASET_VERSION = "physiognomy-research-dataset-v1" as const;

/**
 * Phiên bản export mà loader chấp nhận.
 *
 * CỐ Ý chép lại chuỗi thay vì import: `test-export.ts` KHÔNG export hằng số của nó, và
 * đó là có lý do — một binding được export là API công khai của module nên trình đóng
 * gói phải giữ lại, khiến chuỗi này lọt vào bản build production dù thân handler đã bị
 * cắt. Đổi lại, một test đọc thẳng tệp nguồn kia để khoá hai chuỗi không trôi khỏi nhau.
 */
export const ACCEPTED_EXPORT_VERSION = "physiognomy-test-export-v1" as const;

/** Số view mà một lượt quét ĐẦY ĐỦ phải có. Suy từ hợp đồng, không phải số tự chọn. */
export const REQUIRED_VIEW_COUNT = VIEW_NAMES.length;

/**
 * Một lượt quét đã chuẩn hoá.
 *
 * Dùng lại `SampleLabel` và `DeviceInfo` nguyên vẹn thay vì dàn phẳng ra — hai kiểu đó
 * đã là hợp đồng, sao chép trường sang đây chỉ tạo thêm một chỗ nữa để lệch.
 *
 * KHÔNG mang `research.provenance`: nó chỉ là bốn trường dưới đây ghép lại. Loader
 * ĐỐI CHIẾU với nó rồi bỏ đi — lệch là từ chối, khớp thì giữ bản gốc cho gọn.
 */
export interface ResearchSample {
  sample: SampleLabel;
  device: DeviceInfo;
  sessionId: string;
  completedAt: number;
  featureProfile: PhysiognomySessionFeaturePayload;
  /**
   * Khoá định danh máy dùng để ĐẾM. Ghép từ đúng ba trường `DeviceInfo` đã có, không
   * thu thập thêm gì. Máy không khai được model vẫn phân biệt được nhau qua hệ điều
   * hành + trình duyệt — chấp nhận rằng hai iPhone cùng bản iOS sẽ bị đếm là một máy,
   * vì web không cho biết nhiều hơn thế, và đếm thiếu thì an toàn hơn đếm thừa.
   */
  deviceKey: string;
  /** Tên tệp nguồn. Chỉ để chỉ mặt lỗi cho người vận hành. */
  source: string;
}

export type SampleRejectCode =
  | "malformed_json"
  | "not_object"
  | "bad_export_version"
  | "no_sample_label"
  | "bad_participant_id"
  | "bad_run_number"
  | "bad_sample_id"
  | "no_device"
  | "device_not_identified"
  | "no_session_id"
  | "no_completed_at"
  | "no_feature_profile"
  | "bad_feature_profile"
  | "session_mismatch"
  | "provenance_mismatch"
  | "incomplete_session";

/**
 * Chỉ MỘT mã, và đó là đủ: `sampleId` được kiểm bắt buộc phải bằng
 * `${participantId}-${runNumber}` (mã `bad_sample_id`), nên "trùng người + lượt" TẤT YẾU
 * hiện ra dưới dạng "trùng sampleId". Bản đầu có thêm mã `duplicate_participant_run`;
 * nó không bao giờ chạy được, và cách khử trùng giữa hai mã lại so sánh danh sách tệp
 * bằng `sources.join()` — mong manh theo thứ tự. Bỏ cả hai.
 */
export type DatasetErrorCode = "duplicate_sample_id";

export interface SampleRejection {
  source: string;
  code: SampleRejectCode;
  message: string;
}

export interface DatasetError {
  code: DatasetErrorCode;
  message: string;
  /** Các tệp cùng tranh một chỗ. Liệt kê đủ để người vận hành tự chọn bỏ cái nào. */
  sources: string[];
}

export interface FeatureCounts {
  sampleCount: number;
  participantCount: number;
  deviceCount: number;
}

export interface DatasetSummary {
  datasetVersion: typeof RESEARCH_DATASET_VERSION;
  sampleCount: number;
  participantCount: number;
  deviceCount: number;
  /** Số lượt KHÁC NHAU thấy trong tập (1, 2, 3…), không phải tổng số lượt quét. */
  runCount: number;
  participants: string[];
  devices: string[];
  runs: number[];
  runsPerParticipant: Record<string, number>;
  /** 0 khi tập rỗng. Đây là con số mà ngưỡng "3 lượt mỗi người" cần. */
  minRunsPerParticipant: number;
  /**
   * Đếm RIÊNG cho từng feature, chỉ tính những lượt mà feature đó THỰC SỰ có số.
   *
   * Không dùng số tổng: một feature `unsupported` ở 10 trong 15 lượt thì nó chỉ có 5
   * lượt làm bằng chứng, và gộp nó vào con số 15 là khai khống.
   */
  perFeature: Record<string, FeatureCounts>;
}

export type LoadResult =
  | { ok: true; samples: ResearchSample[]; summary: DatasetSummary; rejected: SampleRejection[] }
  | { ok: false; errors: DatasetError[]; samples: ResearchSample[]; rejected: SampleRejection[] };

/** Một tệp đã xuất. `content` có thể là chuỗi JSON thô hoặc object đã parse. */
export interface DatasetInput {
  name: string;
  content: unknown;
}

const MA_NGHIEN_CUU = /^[A-Z0-9]{1,4}$/;

function bad(source: string, code: SampleRejectCode, message: string): SampleRejection {
  return { source, code, message };
}

/** Khoá đếm máy. Chỉ ghép ba trường đã có, không sinh thêm thông tin. */
export function deviceKeyOf(d: DeviceInfo): string {
  const model = d.model === DEVICE_MODEL_UNAVAILABLE ? "" : d.model;
  return `${d.os}|${d.browser}|${model}`;
}

/**
 * Đếm theo TỪNG feature trên cả tập. MỘT bản cài đặt duy nhất.
 *
 * Slice 1 có hai bản: một trong `summarizeDataset`, một trong `toReliabilityInput`.
 * Chúng đã lệch nhau ở đúng một điểm — feature `v === null` ở MỌI lượt thì bản đầu bỏ
 * hẳn hàng, bản sau vẫn tạo hàng với số 0. Bản sau mới đúng: feature CÓ trong payload
 * nghĩa là hệ thống đã thử đo nó, và bỏ hàng đi là làm một feature không đo được biến
 * mất khỏi bảng độ tin cậy thay vì hiện ra là `unsupported`.
 *
 * Quy tắc, một lần cho cả hệ:
 *   - CÓ MẶT trong payload  → có hàng (dù đếm 0).
 *   - `v === null`          → không cộng vào bất cứ con số nào.
 */
export function countFeaturesAcrossSamples(
  samples: readonly ResearchSample[],
): Record<string, FeatureCounts> {
  const tam = new Map<string, { luot: number; nguoi: Set<string>; may: Set<string> }>();
  for (const s of samples) {
    for (const f of s.featureProfile.features) {
      let e = tam.get(f.k);
      if (!e) {
        e = { luot: 0, nguoi: new Set(), may: new Set() };
        tam.set(f.k, e);
      }
      if (f.v === null) continue;
      e.luot += 1;
      e.nguoi.add(s.sample.participantId);
      e.may.add(s.deviceKey);
    }
  }
  const out: Record<string, FeatureCounts> = {};
  for (const [k, e] of tam) {
    out[k] = { sampleCount: e.luot, participantCount: e.nguoi.size, deviceCount: e.may.size };
  }
  return out;
}

/** Số view `present: true` trong payload. Đây là cách duy nhất biết lượt quét có đủ. */
export function viewsPresentIn(p: PhysiognomySessionFeaturePayload): number {
  return VIEW_NAMES.filter((v) => p.views[v]?.present === true).length;
}

/**
 * Kiểm MỘT tệp đã xuất.
 *
 * Thứ tự xét đi từ ngoài vào trong: định dạng → nhãn → máy → phiên → payload → tính
 * đầy đủ. Mỗi lượt chỉ trả về lý do ĐẦU TIÊN, vì các lớp sau không đọc được khi lớp
 * trước đã hỏng.
 */
export function parseResearchSample(
  input: DatasetInput,
): { ok: true; sample: ResearchSample } | { ok: false; rejection: SampleRejection } {
  const src = input.name;

  let raw: unknown = input.content;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch (err) {
      return {
        ok: false,
        rejection: bad(src, "malformed_json", `Không parse được JSON: ${(err as Error).message}`),
      };
    }
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, rejection: bad(src, "not_object", "Nội dung tệp không phải object.") };
  }
  const o = raw as Record<string, unknown>;

  if (o.exportVersion !== ACCEPTED_EXPORT_VERSION) {
    return {
      ok: false,
      rejection: bad(
        src,
        "bad_export_version",
        `exportVersion phải là "${ACCEPTED_EXPORT_VERSION}", nhận được "${String(o.exportVersion)}".`,
      ),
    };
  }

  // ── nhãn người / lượt
  const s = o.sample as Record<string, unknown> | null | undefined;
  if (s == null || typeof s !== "object") {
    return { ok: false, rejection: bad(src, "no_sample_label", "Thiếu nhãn mẫu (sample).") };
  }
  const pid = s.participantId;
  if (typeof pid !== "string" || !MA_NGHIEN_CUU.test(pid)) {
    return {
      ok: false,
      rejection: bad(src, "bad_participant_id", `participantId không hợp lệ: ${String(pid)}.`),
    };
  }
  const run = s.runNumber;
  if (typeof run !== "number" || !Number.isInteger(run) || run < 1 || run > MAX_RUN_NUMBER) {
    return {
      ok: false,
      rejection: bad(src, "bad_run_number", `runNumber không hợp lệ: ${String(run)}.`),
    };
  }
  const mongDoiSampleId = `${pid}-${String(run).padStart(2, "0")}`;
  if (s.sampleId !== mongDoiSampleId) {
    // Nhãn tự mâu thuẫn: không sửa hộ, vì không biết trường nào mới là ý thật.
    return {
      ok: false,
      rejection: bad(
        src,
        "bad_sample_id",
        `sampleId "${String(s.sampleId)}" không khớp participant/run (phải là "${mongDoiSampleId}").`,
      ),
    };
  }
  const deviceLabel = typeof s.deviceLabel === "string" ? s.deviceLabel : "unknown";

  // ── máy đã quét
  const d = o.device as Record<string, unknown> | null | undefined;
  if (d == null || typeof d !== "object") {
    return {
      ok: false,
      rejection: bad(
        src,
        "no_device",
        "Thiếu khai báo máy (device). Nhãn `sample.deviceLabel` do người vận hành gõ " +
          "KHÔNG thay được — máy quét là điện thoại, người gõ ngồi ở máy tính.",
      ),
    };
  }
  const device: DeviceInfo = {
    os: String(d.os ?? ""),
    browser: String(d.browser ?? ""),
    model: String(d.model ?? DEVICE_MODEL_UNAVAILABLE),
  };
  if (!deviceIsIdentified(device)) {
    return {
      ok: false,
      rejection: bad(
        src,
        "device_not_identified",
        `Máy khai nhưng không nhận ra: os="${device.os}", browser="${device.browser}".`,
      ),
    };
  }

  // ── phiên
  const sessionId = o.sessionId;
  if (typeof sessionId !== "string" || sessionId.length === 0) {
    return { ok: false, rejection: bad(src, "no_session_id", "Thiếu sessionId.") };
  }
  const completedAt = o.completedAt;
  if (typeof completedAt !== "number" || !Number.isFinite(completedAt)) {
    return {
      ok: false,
      rejection: bad(src, "no_completed_at", "Thiếu completedAt — lượt quét chưa hoàn tất."),
    };
  }

  // ── payload đo
  if (o.featureProfile == null) {
    const viCo = typeof o.featureError === "string" && o.featureError ? ` (${o.featureError})` : "";
    return {
      ok: false,
      rejection: bad(src, "no_feature_profile", `Không có Feature JSON${viCo}.`),
    };
  }
  // Dùng ĐÚNG cổng của tầng transport, không viết lại bộ kiểm thứ hai: hai bộ kiểm là
  // hai cơ hội để lệch nhau.
  const parsed = parsePhysiognomySessionFeaturePayload(o.featureProfile, {
    sessionId,
    maxBytes: MAX_FEATURE_TRANSPORT_BYTES,
  });
  if (!parsed.ok) {
    const code: SampleRejectCode =
      parsed.code === "session_mismatch" ? "session_mismatch" : "bad_feature_profile";
    return { ok: false, rejection: bad(src, code, `Feature JSON không hợp lệ: ${parsed.message}`) };
  }
  const featureProfile = parsed.payload;

  // ── provenance trong tệp phải khớp phần trên, nếu tệp có mang
  const research = o.research as Record<string, unknown> | undefined;
  const prov = research?.provenance as Record<string, unknown> | null | undefined;
  if (prov != null && typeof prov === "object") {
    const lech: string[] = [];
    if (prov.sessionId !== sessionId) lech.push("sessionId");
    if (prov.sampleId !== mongDoiSampleId) lech.push("sampleId");
    if (prov.participantId !== pid) lech.push("participantId");
    if (prov.runNumber !== run) lech.push("runNumber");
    if (prov.capturedAt !== completedAt) lech.push("capturedAt");
    const pd = prov.device as Record<string, unknown> | undefined;
    if (pd?.os !== device.os || pd?.browser !== device.browser || pd?.model !== device.model) {
      lech.push("device");
    }
    if (lech.length > 0) {
      return {
        ok: false,
        rejection: bad(
          src,
          "provenance_mismatch",
          `research.provenance lệch với thân tệp ở: ${lech.join(", ")}.`,
        ),
      };
    }
  }

  // ── tính đầy đủ của lượt quét
  //
  // Đây là chỗ DUY NHẤT trong hệ thống chặn được lượt quét dở. Máy chủ cho `complete`
  // dù mới xong 1 bước, và cổng `evaluateResearchSample` không thấy số view — nên một
  // lượt 1/6 vẫn được đánh dấu hợp lệ lúc xuất. Tập dữ liệu thì không nhận.
  const soView = viewsPresentIn(featureProfile);
  if (soView < REQUIRED_VIEW_COUNT) {
    return {
      ok: false,
      rejection: bad(
        src,
        "incomplete_session",
        `Chỉ có ${soView}/${REQUIRED_VIEW_COUNT} view — lượt quét chưa đủ bước.`,
      ),
    };
  }

  return {
    ok: true,
    sample: {
      sample: { participantId: pid, runNumber: run, sampleId: mongDoiSampleId, deviceLabel },
      device,
      sessionId,
      completedAt,
      featureProfile,
      deviceKey: deviceKeyOf(device),
      source: src,
    },
  };
}

/**
 * Nạp cả tập.
 *
 * Lượt hỏng bị loại RIÊNG (nằm trong `rejected`), nhưng nhãn TRÙNG làm cả tập không
 * dùng được: hai tệp cùng mang nhãn A-01 nghĩa là có một sai sót trong lúc thu, và
 * loader không có cách nào biết cái nào mới là lượt thật. Tự chọn "bản mới thắng" là
 * lặng lẽ bỏ dữ liệu của người khác.
 */
export function loadResearchDataset(inputs: readonly DatasetInput[]): LoadResult {
  const samples: ResearchSample[] = [];
  const rejected: SampleRejection[] = [];

  for (const inp of inputs) {
    const r = parseResearchSample(inp);
    if (r.ok) samples.push(r.sample);
    else rejected.push(r.rejection);
  }

  const errors: DatasetError[] = [];

  const theoSampleId = new Map<string, string[]>();
  for (const s of samples) {
    const a = theoSampleId.get(s.sample.sampleId) ?? [];
    a.push(s.source);
    theoSampleId.set(s.sample.sampleId, a);
  }
  for (const [id, srcs] of theoSampleId) {
    if (srcs.length > 1) {
      const [p, r] = id.split("-");
      errors.push({
        code: "duplicate_sample_id",
        message:
          `Nhãn ${id} (người ${p}, lượt ${Number(r)}) xuất hiện ${srcs.length} lần. ` +
          "Bỏ bớt cho còn một — loader không chọn hộ.",
        sources: srcs,
      });
    }
  }

  if (errors.length > 0) return { ok: false, errors, samples, rejected };
  return { ok: true, samples, summary: summarizeDataset(samples), rejected };
}

/** Mọi con số dưới đây SUY TỪ `samples`. Không hằng số nào được viết tay ở đây. */
export function summarizeDataset(samples: readonly ResearchSample[]): DatasetSummary {
  const participants = [...new Set(samples.map((s) => s.sample.participantId))].sort();
  const devices = [...new Set(samples.map((s) => s.deviceKey))].sort();
  const runs = [...new Set(samples.map((s) => s.sample.runNumber))].sort((a, b) => a - b);

  const runsPerParticipant: Record<string, number> = {};
  for (const p of participants) {
    runsPerParticipant[p] = new Set(
      samples.filter((s) => s.sample.participantId === p).map((s) => s.sample.runNumber),
    ).size;
  }

  return {
    datasetVersion: RESEARCH_DATASET_VERSION,
    sampleCount: samples.length,
    participantCount: participants.length,
    deviceCount: devices.length,
    runCount: runs.length,
    participants,
    devices,
    runs,
    runsPerParticipant,
    minRunsPerParticipant: participants.length === 0
      ? 0
      : Math.min(...participants.map((p) => runsPerParticipant[p])),
    // Cùng một bộ đếm mà `toReliabilityInput` dùng — không thể lệch nhau nữa.
    perFeature: countFeaturesAcrossSamples(samples),
  };
}
