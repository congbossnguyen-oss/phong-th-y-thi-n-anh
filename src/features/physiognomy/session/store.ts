/**
 * Kho lưu phiên. Logic nghiệp vụ nằm ở đây; nơi CHỨA dữ liệu thì cắm được thay thế.
 *
 * ── VÌ SAO CHỌN KV ────────────────────────────────────────────────────────────
 * Đã audit trước khi chọn (Phase 1C §A):
 *   · WebSocket / Durable Object: KHÔNG có sẵn. Thêm DO = thêm binding + đổi
 *     wrangler.jsonc + một class runtime mới → đúng thứ yêu cầu nói "không dựng
 *     backend lớn chỉ cho POC".
 *   · Neon Postgres (Drizzle): CÓ sẵn và nhất quán mạnh, nhưng phải thêm bảng +
 *     chạy migration lên DB production chỉ để demo. Nặng và rủi ro hơn mức cần.
 *   · Cloudflare KV: binding `SESSION` ĐÃ được cấp trong wrangler.jsonc (id
 *     6d7b9d11…, adapter tự khai cho Astro Sessions mà app này không dùng). Không
 *     phải cấp hạ tầng mới, có TTL sẵn → hết hạn phiên miễn phí.
 *
 * → Chọn KV + máy tính POLL. Khoá có tiền tố `nt:sess:` để không đụng vào không
 *   gian tên mà adapter có thể dùng nếu sau này ai bật Astro Sessions.
 *
 * ⚠️ HẠN CHẾ ĐÃ BIẾT: KV nhất quán theo thời gian (eventually consistent). Trong
 * cùng một colo thì đọc thấy sau khi ghi gần như ngay; khác colo có thể tới 60 giây.
 * Máy tính và điện thoại của khách ở cùng phòng → cùng colo (HKG) → thực tế ổn cho
 * demo. Nếu thấy tiến độ trên máy tính bị trễ, đường nâng cấp là Durable Object:
 * chỉ cần viết một implementation `SessionStore` khác, phần còn lại không phải sửa.
 */

import type { PhysiognomySessionFeaturePayload } from "../features/transport";
import type { DeviceInfo } from "./device";
import type { SampleLabel } from "./sample";
import {
  FACE_STEPS,
  SESSION_TTL_MS,
  STATUS_FOR_STEP,
  buildResult,
  type FaceStep,
  type FaceTestSnapshot,
  type PhysiognomySessionStatus,
  type SessionRecord,
  type VoiceTestResult,
} from "./types";

const KEY_PREFIX = "nt:sess:";

export interface SessionStore {
  get(id: string): Promise<SessionRecord | null>;
  put(rec: SessionRecord): Promise<void>;
  delete(id: string): Promise<void>;
}

// ───────────────────────────────────────────────────────────── bộ nhớ (dev/test)

/**
 * Kho trong RAM. Dùng cho vitest và cho `astro dev` (Node, không có KV).
 *
 * ponytail: Map toàn cục, không TTL nền — hết hạn được kiểm lúc đọc. Đủ cho dev
 * và test; nếu cần chạy nhiều tiến trình thì mới phải đổi sang kho thật.
 */
export class MemorySessionStore implements SessionStore {
  private map = new Map<string, SessionRecord>();

  async get(id: string): Promise<SessionRecord | null> {
    const r = this.map.get(id);
    if (!r) return null;
    if (r.expiresAt <= Date.now()) {
      this.map.delete(id);
      return null;
    }
    return r;
  }

  async put(rec: SessionRecord): Promise<void> {
    this.map.set(rec.sessionId, rec);
  }

  async delete(id: string): Promise<void> {
    this.map.delete(id);
  }

  /** Chỉ dùng trong test. */
  clear(): void {
    this.map.clear();
  }
}

// ─────────────────────────────────────────────────────────── Cloudflare KV

interface KVLike {
  get(key: string, type: "text"): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

export class KvSessionStore implements SessionStore {
  constructor(private kv: KVLike) {}

  async get(id: string): Promise<SessionRecord | null> {
    const raw = await this.kv.get(KEY_PREFIX + id, "text");
    if (!raw) return null;
    let rec: SessionRecord;
    try {
      rec = JSON.parse(raw) as SessionRecord;
    } catch {
      // Dữ liệu rác trong KV không đáng để làm sập API — coi như không có phiên.
      return null;
    }
    if (rec.expiresAt <= Date.now()) {
      await this.kv.delete(KEY_PREFIX + id);
      return null;
    }
    return rec;
  }

  async put(rec: SessionRecord): Promise<void> {
    // KV tính TTL theo giây và đòi tối thiểu 60s.
    const ttl = Math.max(60, Math.ceil((rec.expiresAt - Date.now()) / 1000));
    await this.kv.put(KEY_PREFIX + rec.sessionId, JSON.stringify(rec), { expirationTtl: ttl });
  }

  async delete(id: string): Promise<void> {
    await this.kv.delete(KEY_PREFIX + id);
  }
}

/**
 * Chọn kho theo môi trường đang chạy.
 *
 * Nhận diện Workers theo cách chuẩn (`navigator.userAgent`) và lấy env qua module
 * `cloudflare:workers` — CÙNG cách `src/lib/kymon/tables.ts` đã làm, vì
 * `Astro.locals.runtime.env` đã bị bỏ từ Astro v6.
 */
let memoryFallback: MemorySessionStore | null = null;

export async function resolveStore(): Promise<SessionStore> {
  const isWorkerd =
    typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
  if (isWorkerd) {
    try {
      const cf = (await import(/* @vite-ignore */ "cloudflare:workers")) as {
        env: { SESSION?: KVLike };
      };
      if (cf.env.SESSION) return new KvSessionStore(cf.env.SESSION);
    } catch {
      /* rơi xuống bộ nhớ — vẫn chạy được, chỉ không chia sẻ giữa instance */
    }
  }
  memoryFallback ??= new MemorySessionStore();
  return memoryFallback;
}

// ────────────────────────────────────────────────────────────── sinh id

/**
 * Sinh id ngẫu nhiên an toàn, chữ-số không nhập nhằng.
 *
 * Bỏ 0/O/1/I/L để khách đọc/gõ tay được nếu QR không quét nổi. 32 ký tự × 10 ký tự
 * ≈ 50 bit — đủ để không đoán được trong vòng 15 phút phiên sống, và không chứa
 * thông tin cá nhân nào.
 */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateId(length = 10): string {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Không có WebCrypto thì thà báo lỗi hơn là dùng Math.random cho id phiên.
    throw new Error("Thiếu crypto.getRandomValues — không sinh được session id an toàn.");
  }
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}

/** Khoá ghi dài hơn id vì nó là thứ chặn ghi đè. */
export function generateWriteToken(): string {
  return generateId(24);
}

// ──────────────────────────────────────────────────────── nghiệp vụ phiên

export interface CreateResult {
  record: SessionRecord;
}

export async function createSession(
  store: SessionStore,
  now = Date.now(),
  sample?: SampleLabel | null,
): Promise<CreateResult> {
  const rec: SessionRecord = {
    sessionId: generateId(),
    status: "waiting",
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
    connectedAt: null,
    completedAt: null,
    snapshots: {},
    voice: null,
    writeToken: null,
    failureReason: null,
    // null ở luồng bình thường; chỉ có giá trị khi thu dữ liệu nghiên cứu (DEV).
    sample: sample ?? null,
  };
  await store.put(rec);
  return { record: rec };
}

export type ConnectOutcome =
  | { ok: true; record: SessionRecord; writeToken: string }
  | { ok: false; code: "not_found" | "already_connected" | "expired" | "finished"; message: string };

/**
 * Điện thoại kết nối. CHỈ THÀNH CÔNG MỘT LẦN — phiên dùng một lần.
 *
 * Lần đầu sinh `writeToken` và trả về cho đúng điện thoại đó. Máy thứ hai quét lại
 * cùng QR sẽ bị `already_connected`, nên không ghi đè được tiến độ đang chạy.
 */
export async function connectSession(
  store: SessionStore,
  id: string,
  now = Date.now(),
  device?: DeviceInfo | null,
): Promise<ConnectOutcome> {
  const rec = await store.get(id);
  if (!rec) {
    return { ok: false, code: "not_found", message: "Phiên không tồn tại hoặc đã hết hạn." };
  }
  if (rec.expiresAt <= now) {
    return { ok: false, code: "expired", message: "Phiên đã hết hạn. Hãy tạo mã QR mới." };
  }
  if (rec.status === "complete" || rec.status === "failed") {
    return { ok: false, code: "finished", message: "Phiên này đã kết thúc." };
  }
  if (rec.writeToken !== null) {
    return {
      ok: false,
      code: "already_connected",
      message: "Phiên này đã có một điện thoại kết nối.",
    };
  }
  const writeToken = generateWriteToken();
  const next: SessionRecord = {
    ...rec,
    status: "connected",
    connectedAt: now,
    writeToken,
    // Chỉ ghi khi điện thoại thật sự khai; không bịa `unknown` để bản ghi trông đầy đủ.
    device: device ?? rec.device ?? null,
  };
  await store.put(next);
  return { ok: true, record: next, writeToken };
}

export type WriteOutcome =
  | { ok: true; record: SessionRecord }
  | { ok: false; code: "not_found" | "expired" | "bad_token" | "finished" | "bad_step"; message: string };

async function loadForWrite(
  store: SessionStore,
  id: string,
  token: string,
  now: number,
): Promise<{ rec: SessionRecord } | Extract<WriteOutcome, { ok: false }>> {
  const rec = await store.get(id);
  if (!rec) return { ok: false, code: "not_found", message: "Phiên không tồn tại hoặc đã hết hạn." };
  if (rec.expiresAt <= now) return { ok: false, code: "expired", message: "Phiên đã hết hạn." };
  if (rec.status === "complete" || rec.status === "failed") {
    return { ok: false, code: "finished", message: "Phiên này đã kết thúc." };
  }
  // So sánh khoá: phiên chưa kết nối (token null) thì mọi khoá đều sai.
  if (rec.writeToken === null || rec.writeToken !== token) {
    return { ok: false, code: "bad_token", message: "Không có quyền ghi vào phiên này." };
  }
  return { rec };
}

/** Điện thoại báo: đã xong một bước khuôn mặt. */
export async function recordStep(
  store: SessionStore,
  id: string,
  token: string,
  snapshot: FaceTestSnapshot,
  now = Date.now(),
): Promise<WriteOutcome> {
  const loaded = await loadForWrite(store, id, token, now);
  if ("ok" in loaded) return loaded;
  const { rec } = loaded;

  if (!FACE_STEPS.includes(snapshot.step)) {
    return { ok: false, code: "bad_step", message: `Bước không hợp lệ: ${snapshot.step}` };
  }

  const next: SessionRecord = {
    ...rec,
    snapshots: { ...rec.snapshots, [snapshot.step]: snapshot },
  };
  // Trạng thái = bước VỪA XONG. Máy tính đọc `stepsDone` để vẽ danh sách tick.
  next.status = STATUS_FOR_STEP[snapshot.step];
  // Xong hết 6 bước thì chuyển sang chờ giọng nói.
  if (FACE_STEPS.every((s) => next.snapshots[s] != null)) {
    next.status = "voice";
  }
  await store.put(next);
  return { ok: true, record: next };
}

/** Điện thoại báo: đã xong bước giọng nói. */
export async function recordVoice(
  store: SessionStore,
  id: string,
  token: string,
  voice: VoiceTestResult,
  now = Date.now(),
): Promise<WriteOutcome> {
  const loaded = await loadForWrite(store, id, token, now);
  if ("ok" in loaded) return loaded;
  const next: SessionRecord = { ...loaded.rec, voice, status: "voice" };
  await store.put(next);
  return { ok: true, record: next };
}

/**
 * Điện thoại báo: xong cả phiên.
 *
 * `feature` là TUỲ CHỌN. Không có nó thì phiên vẫn `complete` — thu ảnh và trích
 * feature là hai việc khác nhau, hỏng việc sau không xoá việc trước. Nhưng trạng thái
 * phải nói thẳng: `featureStatus` là "ok" / "unavailable" / "none", không im lặng.
 *
 * KHÔNG thêm lượt ghi KV: payload đi cùng chính lượt `put` của `complete` đang có.
 */
export async function completeSession(
  store: SessionStore,
  id: string,
  token: string,
  now = Date.now(),
  feature?:
    | { status: "ok"; payload: PhysiognomySessionFeaturePayload }
    | { status: "unavailable"; error: string },
): Promise<WriteOutcome> {
  const loaded = await loadForWrite(store, id, token, now);
  if ("ok" in loaded) return loaded;
  const next: SessionRecord = {
    ...loaded.rec,
    status: "complete",
    completedAt: now,
    featureStatus: feature?.status ?? "none",
    featureProfile: feature?.status === "ok" ? feature.payload : null,
    featureError: feature?.status === "unavailable" ? feature.error : null,
  };
  await store.put(next);
  // Gọi để chắc chắn result dựng được (và để lỗi lộ ra ngay ở đây, không phải lúc poll).
  buildResult(next);
  return { ok: true, record: next };
}

/** Điện thoại báo hỏng (mất quyền, trình duyệt không hỗ trợ…). */
export async function failSession(
  store: SessionStore,
  id: string,
  token: string,
  reason: string,
  now = Date.now(),
): Promise<WriteOutcome> {
  const loaded = await loadForWrite(store, id, token, now);
  if ("ok" in loaded) return loaded;
  const next: SessionRecord = {
    ...loaded.rec,
    status: "failed",
    failureReason: reason.slice(0, 300),
    completedAt: now,
  };
  await store.put(next);
  return { ok: true, record: next };
}

export const ALL_STATUSES: readonly PhysiognomySessionStatus[] = [
  "waiting", "connected", "face_front", "face_left", "face_right", "face_near",
  "face_pitch_down", "face_pitch_up", "voice", "complete", "failed",
];
