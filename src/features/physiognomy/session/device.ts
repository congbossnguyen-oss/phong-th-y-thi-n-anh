/**
 * Nhận dạng máy đã QUÉT — provenance cho mẫu nghiên cứu (Phase 1D-3B).
 *
 * ⚠️ VÌ SAO PHẢI CÓ MODULE NÀY: trước đây `deviceLabel` do người vận hành GÕ TAY trên
 * MÁY TÍNH, trong khi máy thật sự quét là ĐIỆN THOẠI. Hai máy khác nhau, nên nhãn có
 * thể ghi "iPhone-15" trong lúc người test cầm Android. Một mẫu nghiên cứu mà không
 * biết chắc đo bằng máy nào thì không dùng để so sánh liên-thiết-bị được.
 *
 * KHÔNG PHẢI FINGERPRINTING. Chỉ đọc đúng ba thứ trình duyệt vốn tự khai trong mọi
 * request: hệ điều hành, trình duyệt, và model máy NẾU trình duyệt chịu nói. Không đọc
 * canvas, không đọc danh sách font, không đọc độ phân giải, không đọc múi giờ, không
 * sinh id bền. Chỉ lấy SỐ HIỆU CHÍNH của phiên bản — "Chrome 131" chứ không phải
 * "Chrome 131.0.6778.85" — vì chữ số đuôi chỉ làm máy dễ bị nhận diện chứ không thêm
 * thông tin nào cho việc đo.
 *
 * KHÔNG ĐOÁN MODEL. iOS không hề công bố model qua web; Chrome trên Android cũng đã
 * rút gọn User-Agent thành một chuỗi máy chung ("K"). Nên khi không có nguồn đáng tin,
 * trường này là `device_model_unavailable` — ghi thẳng ra là không biết, chứ không suy
 * từ kích thước màn hình hay bất cứ thứ gì tương tự.
 */

/** Ghi rõ "không biết" thay vì đoán. Đây là giá trị hợp lệ, không phải lỗi. */
export const DEVICE_MODEL_UNAVAILABLE = "device_model_unavailable";

/** Dùng chung cho os/browser khi không nhận ra. */
export const DEVICE_UNKNOWN = "unknown";

export interface DeviceInfo {
  /** Ví dụ "iOS 18", "Android 14", "Windows", hoặc "unknown". */
  os: string;
  /** Ví dụ "Safari 18", "Chrome 131", hoặc "unknown". */
  browser: string;
  /** Model máy, hoặc `device_model_unavailable`. KHÔNG BAO GIỜ đoán. */
  model: string;
}

/**
 * Gợi ý từ User-Agent Client Hints. Chỉ Chromium có, và chỉ ba trường này được đọc.
 * iOS Safari không có `navigator.userAgentData` nên luôn là `undefined` ở đó.
 */
export interface DeviceHints {
  model?: string;
  platform?: string;
  platformVersion?: string;
}

/** Số hiệu chính, ví dụ "18.1.2" → "18". Cắt đuôi để bớt tính nhận diện. */
function major(v: string | undefined | null): string {
  if (!v) return "";
  const m = /^(\d+)/.exec(v.trim());
  return m ? m[1] : "";
}

function nhan(ten: string, ver: string): string {
  return ver ? `${ten} ${ver}` : ten;
}

/** Hệ điều hành. Thứ tự có chủ ý: iPadOS khai là Macintosh nên phải xét sau cùng. */
function docOs(ua: string, hints: DeviceHints): string {
  const hv = major(hints.platformVersion);
  const hp = (hints.platform ?? "").trim();

  if (/Android/i.test(ua)) {
    return nhan("Android", major(/Android\s+([\d.]+)/i.exec(ua)?.[1]) || hv);
  }
  if (/iPhone|iPod/i.test(ua)) {
    return nhan("iOS", major(/OS\s+(\d+)[_.]/i.exec(ua)?.[1]));
  }
  if (/iPad/i.test(ua)) {
    return nhan("iPadOS", major(/OS\s+(\d+)[_.]/i.exec(ua)?.[1]));
  }
  if (/Windows/i.test(ua)) return nhan("Windows", hp === "Windows" ? hv : "");
  if (/Mac OS X|Macintosh/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return hp || DEVICE_UNKNOWN;
}

/**
 * Trình duyệt. THỨ TỰ LÀ BẮT BUỘC: User-Agent của Chrome chứa cả chữ "Safari", và của
 * Edge chứa cả "Chrome" — xét sai thứ tự là nhận nhầm hết.
 */
function docBrowser(ua: string): string {
  const lay = (re: RegExp): string => major(re.exec(ua)?.[1]);

  if (/Edg\//.test(ua)) return nhan("Edge", lay(/Edg\/([\d.]+)/));
  if (/OPR\/|Opera/.test(ua)) return nhan("Opera", lay(/OPR\/([\d.]+)/));
  if (/SamsungBrowser\//.test(ua)) {
    return nhan("Samsung Internet", lay(/SamsungBrowser\/([\d.]+)/));
  }
  if (/Firefox\/|FxiOS\//.test(ua)) {
    return nhan("Firefox", lay(/(?:Firefox|FxiOS)\/([\d.]+)/));
  }
  // CriOS = Chrome trên iOS. Vẫn là WebKit bên dưới, nhưng ghi đúng tên người dùng thấy.
  if (/CriOS\//.test(ua)) return nhan("Chrome iOS", lay(/CriOS\/([\d.]+)/));
  if (/Chrome\//.test(ua)) return nhan("Chrome", lay(/Chrome\/([\d.]+)/));
  if (/Safari\//.test(ua)) return nhan("Safari", lay(/Version\/([\d.]+)/));
  return DEVICE_UNKNOWN;
}

/**
 * Model máy — CHỈ từ Client Hints.
 *
 * Không rút từ User-Agent: Chrome trên Android nay khai model là "K" cho mọi máy, còn
 * iOS chưa bao giờ khai. Rút từ đó chỉ sinh ra dữ liệu sai trông như dữ liệu đúng.
 */
function docModel(hints: DeviceHints): string {
  const m = (hints.model ?? "").trim();
  if (!m || m === "K") return DEVICE_MODEL_UNAVAILABLE;
  // Cắt cho khỏi thành bãi chứa chuỗi tuỳ ý từ máy khách.
  return m.slice(0, 40);
}

/**
 * Dựng `DeviceInfo` từ User-Agent (+ Client Hints nếu có).
 *
 * Hàm thuần, không đụng `navigator` — để test chạy được với chuỗi UA thật của máy thật
 * mà không cần máy thật.
 */
export function parseDeviceInfo(ua: unknown, hints: DeviceHints = {}): DeviceInfo {
  const s = typeof ua === "string" ? ua : "";
  return { os: docOs(s, hints), browser: docBrowser(s), model: docModel(hints) };
}

/**
 * Kiểm `DeviceInfo` đến từ máy khách. WHITELIST — trường lạ là TỪ CHỐI.
 *
 * Máy khách tự khai nên đây là biên tin cậy: chặn độ dài để không ai nhét được một
 * đoạn văn (hay thông tin cá nhân) vào bản ghi phiên.
 */
export function parseDeviceInfoPayload(raw: unknown): DeviceInfo | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  for (const k of Object.keys(o)) {
    if (!["os", "browser", "model"].includes(k)) return null;
  }
  const lay = (v: unknown, mac: string): string => {
    if (typeof v !== "string") return mac;
    const t = v.trim();
    if (t === "" || t.length > 40) return mac;
    // Không nhận "@" và dãy số dài — cùng một lằn ranh như `sample.ts`.
    if (t.includes("@") || /\d{7,}/.test(t)) return mac;
    return t;
  };
  return {
    os: lay(o.os, DEVICE_UNKNOWN),
    browser: lay(o.browser, DEVICE_UNKNOWN),
    model: lay(o.model, DEVICE_MODEL_UNAVAILABLE),
  };
}

/** Máy đã nói đủ để một mẫu nghiên cứu truy được về thiết bị chưa. */
export function deviceIsIdentified(d: DeviceInfo | null | undefined): boolean {
  if (!d) return false;
  // Model được phép là "không biết" (iOS không bao giờ nói) — nhưng OS/trình duyệt thì
  // phải biết, nếu không thì chẳng còn gì để phân biệt máy này với máy kia.
  return d.os !== DEVICE_UNKNOWN && d.browser !== DEVICE_UNKNOWN;
}

/** Nhãn ngắn cho bảng điều khiển. */
export function deviceLabelOf(d: DeviceInfo | null | undefined): string {
  if (!d) return DEVICE_UNKNOWN;
  const m = d.model === DEVICE_MODEL_UNAVAILABLE ? "" : ` · ${d.model}`;
  return `${d.os} · ${d.browser}${m}`;
}

/**
 * Đọc thông tin máy TỪ TRONG TRÌNH DUYỆT đang quét.
 *
 * Chỉ gọi được ở phía máy khách. `getHighEntropyValues` là API tiêu chuẩn, không cần
 * xin quyền, và ở đây chỉ hỏi đúng ba trường — vẫn ít hơn những gì User-Agent cũ vốn
 * đã gửi kèm mọi request. Bọc `try/catch` vì Firefox và iOS Safari không có
 * `userAgentData`, và một số bản Chromium cũ ném lỗi thay vì trả rỗng.
 */
export async function collectDeviceInfo(): Promise<DeviceInfo> {
  const nav = typeof navigator === "undefined" ? null : navigator;
  if (!nav) return { os: DEVICE_UNKNOWN, browser: DEVICE_UNKNOWN, model: DEVICE_MODEL_UNAVAILABLE };

  let hints: DeviceHints = {};
  try {
    const uad = (nav as unknown as { userAgentData?: { getHighEntropyValues?: (k: string[]) => Promise<DeviceHints> } })
      .userAgentData;
    if (uad?.getHighEntropyValues) {
      hints = (await uad.getHighEntropyValues(["model", "platform", "platformVersion"])) ?? {};
    }
  } catch {
    // Không có hints thì thôi — `parseDeviceInfo` tự ghi `device_model_unavailable`.
  }
  return parseDeviceInfo(nav.userAgent, hints);
}
