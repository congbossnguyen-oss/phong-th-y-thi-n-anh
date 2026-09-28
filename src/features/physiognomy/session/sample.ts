/**
 * Nhãn mẫu nghiên cứu cho Phase 1D-3A — CHỈ DÙNG KHI THU DỮ LIỆU, không phải tính năng
 * cho khách.
 *
 * Mục đích duy nhất: gắn một lượt quét vào đúng người thứ mấy, lần thứ mấy, máy nào,
 * để `scripts/nhan-tuong-do-lai.mjs` gom nhóm được.
 *
 * TUYỆT ĐỐI KHÔNG chứa thông tin cá nhân. `participantId` là MÃ NGHIÊN CỨU (A, B, C…),
 * không phải tên. Bộ kiểm dưới đây cố tình chặt tới mức KHÔNG THỂ nhét được họ tên,
 * email, số điện thoại hay địa chỉ vào — chặn ở server chứ không trông vào UI.
 */

export interface SampleLabel {
  /** Mã nghiên cứu, ví dụ "A". KHÔNG phải tên người. */
  participantId: string;
  /** Lần quét thứ mấy của người này, 1..20. */
  runNumber: number;
  /** Suy ra từ hai trường trên: "A-01". Không nhận từ máy khách. */
  sampleId: string;
  /** Nhãn máy do người vận hành tự ghi, ví dụ "iPhone-15". "unknown" nếu không rõ. */
  deviceLabel: string;
}

/** Mã nghiên cứu: 1–4 ký tự HOA/số. Đủ cho A…E, không đủ cho một cái tên. */
const MA_NGHIEN_CUU = /^[A-Z0-9]{1,4}$/;

/** Nhãn máy: chữ, số, khoảng trắng và - _ . — tối đa 24 ký tự. */
const NHAN_MAY = /^[A-Za-z0-9 ._-]{1,24}$/;

/**
 * Chuỗi ≥ 7 chữ số liên tiếp. Chặn số điện thoại lọt qua đường `deviceLabel`
 * (`NHAN_MAY` vốn cho phép chữ số vì "iPhone-15", "A55" cần chúng).
 */
const DAY_SO_DAI = /\d{7,}/;

/** Có dấu hiệu là thông tin cá nhân không. Chặn thô nhưng đúng chỗ. */
function coDauHieuPII(s: string): boolean {
  return s.includes("@") || DAY_SO_DAI.test(s);
}

export const MAX_RUN_NUMBER = 20;

export type ParseSampleResult =
  | { ok: true; sample: SampleLabel }
  | { ok: false; message: string };

/**
 * Kiểm nhãn mẫu đến từ máy khách. WHITELIST — trường lạ là TỪ CHỐI.
 *
 * `sampleId` do server tự dựng, KHÔNG nhận từ máy khách: để nhãn luôn khớp với
 * participant/run, không ai gửi lệch được.
 */
export function parseSampleLabel(raw: unknown): ParseSampleResult {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, message: "sample phải là object." };
  }
  const o = raw as Record<string, unknown>;
  for (const k of Object.keys(o)) {
    if (!["participantId", "runNumber", "deviceLabel"].includes(k)) {
      return { ok: false, message: `Trường không được phép trong sample: "${k}".` };
    }
  }

  const pid = o.participantId;
  if (typeof pid !== "string" || !MA_NGHIEN_CUU.test(pid)) {
    return {
      ok: false,
      message:
        "participantId phải là MÃ NGHIÊN CỨU 1–4 ký tự HOA/số (ví dụ A, B, C). " +
        "Đây không phải chỗ ghi tên người.",
    };
  }

  const run = o.runNumber;
  if (typeof run !== "number" || !Number.isInteger(run) || run < 1 || run > MAX_RUN_NUMBER) {
    return { ok: false, message: `runNumber phải là số nguyên 1..${MAX_RUN_NUMBER}.` };
  }

  const dev = o.deviceLabel === undefined ? "unknown" : o.deviceLabel;
  if (typeof dev !== "string" || !NHAN_MAY.test(dev)) {
    return {
      ok: false,
      message: "deviceLabel chỉ được chứa chữ, số, khoảng trắng và - _ . (tối đa 24 ký tự).",
    };
  }
  if (coDauHieuPII(dev) || coDauHieuPII(pid)) {
    return {
      ok: false,
      message: "Nhãn có dấu hiệu là thông tin cá nhân (email hoặc dãy số dài). Không nhận.",
    };
  }

  return {
    ok: true,
    sample: {
      participantId: pid,
      runNumber: run,
      sampleId: `${pid}-${String(run).padStart(2, "0")}`,
      deviceLabel: dev,
    },
  };
}

/**
 * Tên tệp cho bộ đo `scripts/nhan-tuong-do-lai.mjs`, vốn gom nhóm theo
 * `<người>__<điều-kiện>.json`. Mỗi lần quét là một cự ly khác nhau, nên lần quét
 * CHÍNH LÀ điều kiện.
 */
export function sampleFileName(s: SampleLabel): string {
  return `${s.participantId}__run${s.runNumber}.json`;
}
