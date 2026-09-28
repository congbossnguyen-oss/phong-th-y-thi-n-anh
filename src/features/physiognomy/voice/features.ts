/**
 * Đặc trưng âm thanh cơ bản. TẤT CẢ đều `experimental: true`.
 *
 * Không có một dòng nào ánh xạ âm thanh sang kết luận nhân tướng. Thu và đo trước;
 * việc diễn giải (nếu có) là chuyện của phase sau và cần bằng chứng riêng của nó.
 *
 * Bốn chỉ số, tất cả tính trên PCM mono, không cần thư viện ngoài:
 *   pitchHz          — tự tương quan (autocorrelation), khoảng giọng người 70–400 Hz
 *   energyRms        — RMS trung bình trên các khung CÓ tiếng (bỏ khoảng lặng)
 *   speechRate       — số đoạn có tiếng / giây. Thô, KHÔNG phải speech-to-text
 *   spectralFeatures — trọng tâm phổ (DFT thưa) + tỉ lệ đổi dấu
 */

import { VOICE_WARNING, type VoiceExperimentalFeatures } from "../types/index";

/** Khung 25 ms, bước 10 ms — quy ước chuẩn trong xử lý tiếng nói. */
const FRAME_MS = 25;
const HOP_MS = 10;
/** Dưới mức RMS này coi là khoảng lặng. */
const SILENCE_RMS = 0.01;
const PITCH_MIN_HZ = 70;
const PITCH_MAX_HZ = 400;

export function extractVoiceFeatures(
  samples: Float32Array,
  sampleRate: number,
): VoiceExperimentalFeatures {
  const frameLen = Math.max(64, Math.round((FRAME_MS / 1000) * sampleRate));
  const hop = Math.max(32, Math.round((HOP_MS / 1000) * sampleRate));

  const voicedRms: number[] = [];
  const pitches: number[] = [];
  let zcrSum = 0;
  let zcrFrames = 0;
  let voicedFrames = 0;
  let totalFrames = 0;
  /** Đếm số lần chuyển im lặng → có tiếng, dùng cho speechRate. */
  let onsets = 0;
  let prevVoiced = false;

  for (let start = 0; start + frameLen <= samples.length; start += hop) {
    const frame = samples.subarray(start, start + frameLen);
    totalFrames++;

    let sumSq = 0;
    let crossings = 0;
    for (let i = 0; i < frame.length; i++) {
      sumSq += frame[i] * frame[i];
      if (i > 0 && (frame[i] >= 0) !== (frame[i - 1] >= 0)) crossings++;
    }
    const rms = Math.sqrt(sumSq / frame.length);
    const voiced = rms >= SILENCE_RMS;

    if (voiced) {
      voicedFrames++;
      voicedRms.push(rms);
      zcrSum += crossings / (frame.length - 1);
      zcrFrames++;
      const f0 = estimatePitch(frame, sampleRate);
      if (f0 !== null) pitches.push(f0);
      if (!prevVoiced) onsets++;
    }
    prevVoiced = voiced;
  }

  const durationSec = samples.length / sampleRate;

  return {
    experimental: true,
    pitchHz: pitches.length ? round1(median(pitches)) : null,
    energyRms: voicedRms.length ? round4(mean(voicedRms)) : null,
    // Onset/giây: thô nhưng tương quan với nhịp nói. KHÔNG phải số âm tiết/giây.
    speechRate: durationSec > 0.5 ? round2(onsets / durationSec) : null,
    spectralFeatures: {
      centroidHz: voicedFrames > 0 ? round1(spectralCentroid(samples, sampleRate)) : null,
      zeroCrossingRate: zcrFrames ? round4(zcrSum / zcrFrames) : null,
    },
    warning: VOICE_WARNING,
  };
}

/**
 * Cao độ bằng tự tương quan, chuẩn hoá theo năng lượng để không bị lệch về lag nhỏ.
 * Trả null nếu đỉnh tương quan quá yếu (khung vô thanh hoặc nhiễu).
 */
function estimatePitch(frame: Float32Array, sampleRate: number): number | null {
  const minLag = Math.floor(sampleRate / PITCH_MAX_HZ);
  const maxLag = Math.min(Math.floor(sampleRate / PITCH_MIN_HZ), frame.length - 1);
  if (maxLag <= minLag) return null;

  let energy = 0;
  for (let i = 0; i < frame.length; i++) energy += frame[i] * frame[i];
  if (energy < 1e-8) return null;

  let bestLag = -1;
  let bestScore = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0;
    let norm = 0;
    const n = frame.length - lag;
    for (let i = 0; i < n; i++) {
      corr += frame[i] * frame[i + lag];
      norm += frame[i + lag] * frame[i + lag];
    }
    if (norm < 1e-8) continue;
    const score = corr / Math.sqrt(norm * energy);
    if (score > bestScore) {
      bestScore = score;
      bestLag = lag;
    }
  }
  // 0.3 là ngưỡng thường dùng để loại khung vô thanh. Dưới mức đó thì "cao độ"
  // tìm được chỉ là nhiễu, thà trả null.
  if (bestLag < 0 || bestScore < 0.3) return null;
  return sampleRate / bestLag;
}

/**
 * Trọng tâm phổ bằng DFT THƯA — chỉ lấy 64 dải log-spaced trong 80–8000 Hz.
 *
 * Cố ý không cài FFT: bài này chỉ cần một con số thô, và 64 dải trên một đoạn mẫu
 * rút gọn chạy nhanh hơn viết FFT cho đúng, lại không thêm phụ thuộc.
 * ponytail: DFT thưa O(bands × N); nếu sau này cần phổ đầy đủ thì mới đổi sang FFT.
 */
function spectralCentroid(samples: Float32Array, sampleRate: number): number {
  const BANDS = 64;
  const F_LO = 80;
  const F_HI = Math.min(8000, sampleRate / 2);
  // Lấy tối đa 16k mẫu ở giữa đoạn ghi — phần giữa thường là lúc nói ổn định nhất.
  const N = Math.min(16_384, samples.length);
  const offset = Math.max(0, Math.floor((samples.length - N) / 2));
  const seg = samples.subarray(offset, offset + N);

  let num = 0;
  let den = 0;
  for (let b = 0; b < BANDS; b++) {
    const f = F_LO * Math.pow(F_HI / F_LO, b / (BANDS - 1));
    const w = (2 * Math.PI * f) / sampleRate;
    let re = 0;
    let im = 0;
    // Lấy mẫu mỗi 4 điểm: đủ cho trọng tâm phổ, nhanh hơn 4 lần.
    for (let i = 0; i < N; i += 4) {
      const phase = w * i;
      re += seg[i] * Math.cos(phase);
      im -= seg[i] * Math.sin(phase);
    }
    const mag = Math.hypot(re, im);
    num += f * mag;
    den += mag;
  }
  return den > 1e-9 ? num / den : 0;
}

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const round1 = (v: number) => Math.round(v * 10) / 10;
const round2 = (v: number) => Math.round(v * 100) / 100;
const round4 = (v: number) => Math.round(v * 10_000) / 10_000;
