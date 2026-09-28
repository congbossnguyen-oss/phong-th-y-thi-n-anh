/**
 * Thu giọng nói. Module này CHỈ THU — không đo, không diễn giải.
 *
 * Bẫy iOS đã xử lý ở đây:
 *   - KHÔNG hard-code "audio/webm". iOS Safari trả audio/mp4, Chrome Android trả
 *     audio/webm. Hard-code webm là lỗi kinh điển làm iPhone im lặng không báo gì.
 *   - MediaRecorder chỉ có từ iOS 14.3. Máy cũ hơn phải báo rõ, không để trang chết im.
 *   - AudioContext phải resume() sau cử chỉ người dùng — cùng bài mà repo đã gặp ở
 *     src/components/quan-su/TourChaoMung.astro:552.
 */

/**
 * Thứ tự ưu tiên MIME. webm/opus tốt nhất (nén tốt, mở được ở mọi nơi), mp4/aac cho
 * iOS Safari (nó KHÔNG hỗ trợ webm), ogg cho Firefox cũ.
 *
 * Hard-code "audio/webm" là lỗi kinh điển: trên iPhone `new MediaRecorder(stream,
 * {mimeType:'audio/webm'})` throw NotSupportedError, và nếu không bắt thì trang im
 * lặng không báo gì.
 */
export const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4;codecs=mp4a.40.2",
  "audio/mp4",
  "audio/ogg;codecs=opus",
] as const;

/** Hàm kiểm tra khả năng hỗ trợ — tách ra để test mock được mà không cần browser thật. */
export type MimeSupportCheck = (type: string) => boolean;

function defaultSupportCheck(type: string): boolean {
  if (typeof MediaRecorder === "undefined") return false;
  try {
    return MediaRecorder.isTypeSupported(type);
  } catch {
    // Một số bản Safari throw thay vì trả false.
    return false;
  }
}

/**
 * Chọn MIME đầu tiên mà trình duyệt hỗ trợ.
 *
 * Trả `null` khi không có ứng viên nào được hỗ trợ — lúc đó KHÔNG truyền mimeType
 * cho MediaRecorder, để nó tự chọn mặc định của trình duyệt (vẫn tốt hơn là throw).
 */
export function pickSupportedMimeType(
  isSupported: MimeSupportCheck = defaultSupportCheck,
): string | null {
  for (const t of MIME_CANDIDATES) {
    // try/catch ở ĐÂY, không chỉ trong defaultSupportCheck: một bản Safari cũ throw
    // ở đúng một loại MIME vẫn phải cho ta thử tiếp các loại còn lại, chứ không
    // được làm sập cả bước dò.
    try {
      if (isSupported(t)) return t;
    } catch {
      /* loại này coi như không hỗ trợ, thử loại tiếp theo */
    }
  }
  return null;
}

export function checkVoiceSupport(): { ok: true } | { ok: false; reason: string } {
  if (typeof window === "undefined") return { ok: false, reason: "Không ở môi trường browser" };
  if (!navigator.mediaDevices?.getUserMedia) {
    return { ok: false, reason: "Trình duyệt không hỗ trợ getUserMedia" };
  }
  if (typeof MediaRecorder === "undefined") {
    return {
      ok: false,
      reason: "Trình duyệt chưa hỗ trợ ghi âm (MediaRecorder). iOS cần bản 14.3 trở lên.",
    };
  }
  return { ok: true };
}

export interface VoiceRecording {
  blob: Blob;
  mimeType: string;
  durationMs: number;
  sampleRate: number | null;
  channels: number | null;
  /** Mẫu PCM mono để tính đặc trưng. null nếu giải mã thất bại. */
  samples: Float32Array | null;
}

export interface RecorderHandle {
  /** Dừng sớm (khách bấm "Xong"). Trả về bản ghi. */
  stop: () => Promise<VoiceRecording>;
  /** Huỷ và giải phóng, không trả dữ liệu. */
  abort: () => void;
  /** RMS tức thời 0..1 để vẽ thanh mức — đọc mỗi frame animation. */
  getLevel: () => number;
}

export const MIN_DURATION_MS = 8_000;
export const TARGET_DURATION_MS = 15_000;
export const MAX_DURATION_MS = 20_000;

/**
 * Bắt đầu ghi. PHẢI gọi từ trong handler của một cử chỉ thật (iOS).
 *
 * `onTick` được gọi mỗi ~100 ms với số ms đã ghi, để UI đếm ngược.
 */
export async function startRecording(opts: {
  onTick?: (elapsedMs: number) => void;
  maxDurationMs?: number;
}): Promise<RecorderHandle> {
  const support = checkVoiceSupport();
  if (!support.ok) throw new Error(support.reason);

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        // Tắt AGC: nó bóp biên độ, làm chỉ số energyRms mất ý nghĩa so sánh.
        autoGainControl: false,
      },
      video: false,
    });
  } catch (err) {
    const name = (err as DOMException)?.name ?? "";
    if (name === "NotAllowedError" || name === "SecurityError") {
      throw new Error("DENIED");
    }
    throw new Error(`Không mở được micro: ${(err as Error)?.message ?? err}`);
  }

  const track = stream.getAudioTracks()[0];
  const settings = track?.getSettings?.() ?? {};

  const mime = pickSupportedMimeType();
  const recorder = mime
    ? new MediaRecorder(stream, { mimeType: mime })
    : new MediaRecorder(stream);

  const chunks: Blob[] = [];
  recorder.addEventListener("dataavailable", (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  });

  // Thanh mức: AudioContext riêng, chỉ để đọc biên độ. Có fallback webkit cho Safari cũ.
  const AudioCtor: typeof AudioContext | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  let audioCtx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let levelBuf: Float32Array | null = null;
  if (AudioCtor) {
    try {
      audioCtx = new AudioCtor();
      // Safari mở AudioContext ở trạng thái "suspended" — resume ngay, ta đang ở
      // trong cử chỉ người dùng nên được phép.
      if (audioCtx.state === "suspended") void audioCtx.resume();
      const src = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);
      levelBuf = new Float32Array(analyser.fftSize);
    } catch {
      audioCtx = null;
      analyser = null;
    }
  }

  const startedAt = performance.now();
  const maxMs = opts.maxDurationMs ?? MAX_DURATION_MS;
  let settled = false;

  const tickTimer = opts.onTick
    ? window.setInterval(() => opts.onTick?.(performance.now() - startedAt), 100)
    : null;

  // Timeslice 1000 ms: Safari đôi khi chỉ phát dataavailable ở cuối nếu không có
  // timeslice, và mất trắng nếu tab bị treo giữa đường.
  recorder.start(1000);

  const stopped = new Promise<void>((resolve) => {
    recorder.addEventListener("stop", () => resolve(), { once: true });
  });

  const cleanup = () => {
    if (tickTimer !== null) clearInterval(tickTimer);
    for (const t of stream.getTracks()) {
      try {
        t.stop();
      } catch {
        /* đã dừng */
      }
    }
    try {
      void audioCtx?.close();
    } catch {
      /* đã đóng */
    }
  };

  const finish = async (): Promise<VoiceRecording> => {
    if (recorder.state !== "inactive") recorder.stop();
    await stopped;
    const durationMs = Math.round(performance.now() - startedAt);
    const type = recorder.mimeType || mime || "audio/webm";
    const blob = new Blob(chunks, { type });
    cleanup();

    const decoded = await decodeToMono(blob);
    return {
      blob,
      mimeType: type,
      durationMs,
      sampleRate: decoded?.sampleRate ?? settings.sampleRate ?? null,
      channels: decoded?.channels ?? settings.channelCount ?? null,
      samples: decoded?.samples ?? null,
    };
  };

  // Tự dừng khi đủ thời lượng tối đa — không để khách nói mãi.
  const autoStop = window.setTimeout(() => {
    if (!settled && recorder.state !== "inactive") recorder.stop();
  }, maxMs);

  return {
    stop: async () => {
      settled = true;
      clearTimeout(autoStop);
      return finish();
    },
    abort: () => {
      settled = true;
      clearTimeout(autoStop);
      try {
        if (recorder.state !== "inactive") recorder.stop();
      } catch {
        /* ignore */
      }
      cleanup();
    },
    getLevel: () => {
      if (!analyser || !levelBuf) return 0;
      analyser.getFloatTimeDomainData(levelBuf);
      let sum = 0;
      for (let i = 0; i < levelBuf.length; i++) sum += levelBuf[i] * levelBuf[i];
      return Math.min(1, Math.sqrt(sum / levelBuf.length) * 4);
    },
  };
}

/**
 * Giải mã blob về PCM mono để tính đặc trưng.
 *
 * Dùng AudioContext offline thật (không OfflineAudioContext) vì decodeAudioData
 * của Safari cần một context đang sống. Thất bại thì trả null — đặc trưng âm thanh
 * là experimental, không đáng để làm sập cả lần quét.
 */
async function decodeToMono(
  blob: Blob,
): Promise<{ samples: Float32Array; sampleRate: number; channels: number } | null> {
  const AudioCtor: typeof AudioContext | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  let ctx: AudioContext | null = null;
  try {
    ctx = new AudioCtor();
    const buf = await blob.arrayBuffer();
    const audio = await ctx.decodeAudioData(buf);
    const channels = audio.numberOfChannels;
    const len = audio.length;
    const out = new Float32Array(len);
    for (let c = 0; c < channels; c++) {
      const ch = audio.getChannelData(c);
      for (let i = 0; i < len; i++) out[i] += ch[i] / channels;
    }
    return { samples: out, sampleRate: audio.sampleRate, channels };
  } catch {
    return null;
  } finally {
    try {
      void ctx?.close();
    } catch {
      /* ignore */
    }
  }
}
