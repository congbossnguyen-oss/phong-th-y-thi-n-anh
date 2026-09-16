/**
 * ƯỚC TÍNH CHI PHÍ trước khi generate — Phase 12 của kiến trúc CONG AI VIDEO. Đơn giá đọc từ
 * handoff/config/gia-ai-video.json (KHÔNG hard-code trong code), cùng idiom với
 * chart-profile/ghi-log-chi-phi.ts (đơn giá AI văn bản).
 *
 * STEP 6 §2: SỬA BUG — bản cũ so `params.resolution === "1080p"` (chữ thường) trong khi provider thật
 * trả `"1080P"` (Wan, hoa) hoặc `"1920x1080"` (LTX, dạng WIDTHxHEIGHT) — KHÔNG BAO GIỜ khớp, khiến hệ
 * số độ phân giải chết, luôn tính giá như hạng thấp nhất mà không hề báo lỗi. Sửa bằng
 * `normalizeResolution()`: mọi định dạng resolution (dù "720p"/"720P"/"1280x720"/"1920x1080"...) đều
 * quy về 1 trong 5 giá trị canonical (480p/720p/1080p/1440p/2160p) trước khi tính giá — cost
 * calculation từ đây CHỈ làm việc với giá trị canonical, không so chuỗi thô nữa.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { VideoProviderId } from "./providers/types";

export type CanonicalResolution = "480p" | "720p" | "1080p" | "1440p" | "2160p";

const CAC_MUC_P_HOP_LE: ReadonlySet<number> = new Set([480, 720, 1080, 1440, 2160]);

/**
 * Quy resolution THÔ (bất kỳ định dạng provider nào trả về) về 1 giá trị canonical — trả `null` nếu
 * không nhận dạng được (không đoán mò, để cost calculation coi như "chưa biết" thay vì tính sai).
 *
 * Nhận diện 2 dạng:
 *   - "<số>p" / "<số>P" (Wan: "720P", "1080P")
 *   - "<rộng>x<cao>" (LTX: "1280x720", "1920x1080", kể cả chiều dọc "720x1280")
 * Với dạng WIDTHxHEIGHT, lấy MIN(rộng, cao) làm mức "p" — cùng 1 mức dù xoay ngang/dọc (vd "1280x720"
 * và "720x1280" đều là mức 720p, chỉ khác hướng khung hình).
 */
export function normalizeResolution(resolution: string | undefined | null): CanonicalResolution | null {
  if (!resolution) return null;
  const trimmed = resolution.trim().toLowerCase();

  const khopP = trimmed.match(/^(\d+)p$/);
  if (khopP) {
    const p = Number(khopP[1]);
    return CAC_MUC_P_HOP_LE.has(p) ? (`${p}p` as CanonicalResolution) : null;
  }

  const khopKichThuoc = trimmed.match(/^(\d+)x(\d+)$/);
  if (khopKichThuoc) {
    const rong = Number(khopKichThuoc[1]);
    const cao = Number(khopKichThuoc[2]);
    const p = Math.min(rong, cao);
    return CAC_MUC_P_HOP_LE.has(p) ? (`${p}p` as CanonicalResolution) : null;
  }

  return null;
}

interface GiaModelVideo {
  usd_per_second: number;
  /** Hệ số nhân theo độ phân giải canonical — thiếu key nào coi hệ số key đó = 1 (giá cơ bản). */
  he_so_theo_resolution?: Partial<Record<CanonicalResolution, number>>;
}
interface CauHinhGiaVideo {
  ty_gia_vnd_tren_usd: number;
  models: Record<string, GiaModelVideo>;
}

let cache: CauHinhGiaVideo | null = null;
function loadGia(): CauHinhGiaVideo {
  if (!cache) {
    cache = JSON.parse(
      readFileSync(join(process.cwd(), "handoff", "config", "gia-ai-video.json"), "utf-8"),
    ) as CauHinhGiaVideo;
  }
  return cache;
}

export interface UocTinhChiPhi {
  usd: number;
  vnd: number;
  /** Khoá giá thực tế đã dùng (provider:model) — null nếu chưa có giá cho tổ hợp này (không chặn generate, chỉ không hiện số ước tính). */
  khoaGia: string | null;
}

/**
 * Ước tính chi phí — trả `khoaGia: null` (không throw) khi chưa có giá cho provider/model, vì thiếu
 * bảng giá không nên chặn admin generate video, chỉ nên ẩn phần "Estimated cost" trên UI.
 */
export function uocTinhChiPhi(params: {
  provider: VideoProviderId;
  model?: string;
  durationSeconds?: number;
  resolution?: string;
}): UocTinhChiPhi {
  const gia = loadGia();
  const khoaGia = `${params.provider}:${params.model ?? ""}`;
  const g = gia.models[khoaGia];
  if (!g) return { usd: 0, vnd: 0, khoaGia: null };

  const giay = params.durationSeconds ?? 5;
  const doPhanGiai = normalizeResolution(params.resolution);
  const heSo = doPhanGiai ? (g.he_so_theo_resolution?.[doPhanGiai] ?? 1) : 1;
  const usd = giay * g.usd_per_second * heSo;

  return {
    usd: Math.round(usd * 10000) / 10000,
    vnd: Math.round(usd * gia.ty_gia_vnd_tren_usd),
    khoaGia,
  };
}
