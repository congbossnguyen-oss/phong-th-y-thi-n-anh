/**
 * 九宗門 (Cửu Tông Môn) — Phase 9B + Remediation + 9C. TOÀN BỘ 9 pháp + 2 pre-check đã có công
 * thức: 伏吟 (CHỈ điều kiện kích hoạt — công thức chọn giá trị vẫn CONFLICT 2 nguồn, xem
 * errors.ts), 返吟 (điều kiện kích hoạt + CẢ 2 nhánh: có khắc → delegate 賊克/比用/涉害; vô khắc
 * → 驛馬, Phase 9C), 賊克法, 比用法, 涉害法 (CHỈ nhánh main count-based + 孟/仲/季 tie-break),
 * 遙克法 (Remediation), 昴星法 (Remediation, wired), 別責法 (Phase 9C, MỚI), 八專法 (Phase 9C,
 * MỚI). Thuật toán: Algorithm Spec §7.1-7.2, XÁC MINH ĐỘC LẬP THÊM qua dò tay VÀ CHẠY THẬT
 * `d1210182010/daliuren-web-engine` (commit d5cb9a7, shipan.py `SanChuan`) — xem provenance.ts
 * cho trích dẫn đầy đủ TỪNG pháp, kể cả các phát hiện CHƯA GIẢI QUYẾT (昴星's Trung/Mạt khác
 * repo A; 伏吟's xung đột cấu trúc thật giữa 2 nguồn) và các pháp SINGLE-SOURCE (涉害/遙克/別責/
 * 八專 — chấp nhận theo quyết định của chủ dự án, không coi là blocker).
 *
 * PHẠM VI: đây CHỌN Sơ truyền + (別責/八專/返吟-vô-khắc) CẢ Trung/Mạt truyền tường minh (TYPE B
 * — xem `NineMethodSelection.middle`/`.final`). Chuỗi tra Thiên Bàn chuẩn cho các pháp KHÔNG tự
 * cung cấp Trung/Mạt (TYPE A) thuộc `three-transmissions/compute.ts`, KHÔNG lặp lại ở đây.
 * 課體/十二天將/元首-重審-知一/interpretation đều KHÔNG thuộc phạm vi file này.
 */
import { Data } from "@thien-anh/calendar-core";
import { TrachNhat } from "@thien-anh/rule-engine";
import type { Can, Chi } from "../types/ganzhi.js";
import type { FourLessons, LessonFromBranch } from "../types/four-lessons.js";
import type { HeavenEarthPlate } from "../types/plates.js";
import type { NineMethod } from "../types/three-transmissions.js";
import { earthChiOfHeavenValue, heavenPlateAt } from "../heaven-earth-plate/compute.js";
import { EARTH_PLATE } from "../heaven-earth-plate/table.js";
import { JI_GONG_TABLE } from "../four-lessons/table.js";
import { computeYiMa } from "../yi-ma/compute.js";
import { amDuongOfCan, amDuongOfChi, isKhac, nguHanhOfCan, nguHanhOfChi } from "./wuxing.js";
import { JI_GONG_INVERSE, MENG_CHI, ZHONG_CHI, isBaZhuanDay } from "./table.js";
import {
  ZEIKE_BIYONG_PROVENANCE,
  SHEHAI_PROVENANCE,
  MAOXING_PROVENANCE,
  YAOKE_PROVENANCE,
  BIEZE_PROVENANCE,
  BAZHUAN_SELECTION_PROVENANCE,
  FANYIN_WUQIN_PROVENANCE,
} from "./provenance.js";
import { NineMethodsError } from "./errors.js";

export interface NineMethodSelection {
  method: NineMethod;
  /** Mô tả phụ tự do (vd tên cách cục cụ thể, tie-break đã dùng) — CHỈ hiển thị, KHÔNG dùng để suy luận logic (cùng quy ước `ThreeTransmissions.methodSubcase`). */
  methodSubcase?: string;
  initial: Chi;
  /**
   * TYPE B — Trung/Mạt truyền TƯỜNG MINH (Phase 9C Remediation): CHỈ set khi pháp KHÔNG theo
   * chuỗi tra Thiên Bàn chuẩn 2 lần (別責/八專/返吟-vô-賊克, xem provenance.ts từng pháp) — khi
   * đó `three-transmissions/compute.ts` PHẢI dùng ĐÚNG giá trị này, KHÔNG tự tra lại. Để trống
   * (TYPE A, đa số pháp: 賊克/比用/涉害/遙克/昴星/返吟-có-khắc) → tầng gọi tự chuỗi
   * `heavenPlateAt` 2 lần từ `initial` như trước, KHÔNG đổi hành vi cũ.
   */
  middle?: Chi;
  final?: Chi;
  provenanceId: string;
}

type KeType = "zei" | "ke" | "none";

interface Candidate {
  /** 1-4, đúng số thứ tự Khóa — CHỈ để debug/methodSubcase, KHÔNG dùng để suy luận. */
  lessonNumber: 1 | 2 | 3 | 4;
  upper: Chi;
  keType: KeType;
}

function classify(upperNguHanh: ReturnType<typeof nguHanhOfChi>, lowerNguHanh: ReturnType<typeof nguHanhOfChi>): KeType {
  if (isKhac(lowerNguHanh, upperNguHanh)) return "zei"; // hạ khắc thượng — "賊"
  if (isKhac(upperNguHanh, lowerNguHanh)) return "ke"; // thượng khắc hạ — "克 thường"
  return "none";
}

function buildCandidates(fourLessons: FourLessons): Candidate[] {
  const lesson1 = fourLessons.lesson1;
  const others: [2 | 3 | 4, LessonFromBranch][] = [
    [2, fourLessons.lesson2],
    [3, fourLessons.lesson3],
    [4, fourLessons.lesson4],
  ];

  const candidates: Candidate[] = [
    { lessonNumber: 1, upper: lesson1.upper, keType: classify(nguHanhOfChi(lesson1.upper), nguHanhOfCan(lesson1.lower)) },
  ];
  for (const [n, lesson] of others) {
    candidates.push({ lessonNumber: n, upper: lesson.upper, keType: classify(nguHanhOfChi(lesson.upper), nguHanhOfChi(lesson.lower)) });
  }
  return candidates;
}

/** Xóa khóa trùng — nhiều khóa cùng chung 1 giá trị `upper` chỉ tính 1 lần (đúng dedup của repo A). */
function dedupByUpper(candidates: Candidate[]): Candidate[] {
  const seen = new Set<Chi>();
  const result: Candidate[] = [];
  for (const c of candidates) {
    if (!seen.has(c.upper)) {
      seen.add(c.upper);
      result.push(c);
    }
  }
  return result;
}

/**
 * "Độ sâu thiệp hại" của 1 khóa ứng viên — duyệt vòng Chi tự nhiên từ vị trí Địa Bàn hiện tại
 * của `candidate.upper` cho tới (không tính) chính `candidate.upper`, cộng dồn số lần khắc từ
 * CHÍNH Chi đang duyệt lẫn (các) Can ký thác tại đó. XÁC MINH ĐỘC LẬP: dò tay
 * `d1210182010/daliuren-web-engine` shipan.py `__涉害` dòng 553-577 (xem provenance.ts).
 */
function sheHaiDepth(candidate: Candidate, heavenEarthPlate: HeavenEarthPlate): number {
  const anchor = earthChiOfHeavenValue(heavenEarthPlate, candidate.upper);
  const anchorIndex = EARTH_PLATE.indexOf(anchor);
  const candidateNguHanh = nguHanhOfChi(candidate.upper);

  let count = 0;
  for (let i = 0; i < 12; i++) {
    const d = EARTH_PLATE[(anchorIndex + i) % 12]!;
    if (d === candidate.upper) break;

    const dNguHanh = nguHanhOfChi(d);
    const lodgingCans = JI_GONG_INVERSE[d] ?? [];

    if (candidate.keType === "zei") {
      if (isKhac(dNguHanh, candidateNguHanh)) count++;
      for (const can of lodgingCans) {
        if (isKhac(nguHanhOfCan(can), candidateNguHanh)) count++;
      }
    } else {
      if (isKhac(candidateNguHanh, dNguHanh)) count++;
      for (const can of lodgingCans) {
        if (isKhac(candidateNguHanh, nguHanhOfCan(can))) count++;
      }
    }
  }
  return count;
}

function selectSheHai(tied: Candidate[], fourLessons: FourLessons, heavenEarthPlate: HeavenEarthPlate, dayCan: Can): NineMethodSelection {
  const depths = tied.map((candidate) => ({ candidate, depth: sheHaiDepth(candidate, heavenEarthPlate) }));
  const maxDepth = Math.max(...depths.map((d) => d.depth));
  const atMax = depths.filter((d) => d.depth === maxDepth).map((d) => d.candidate);

  if (atMax.length === 1) {
    return { method: "shehai", initial: atMax[0]!.upper, provenanceId: SHEHAI_PROVENANCE.id };
  }

  const meng = atMax.find((c) => MENG_CHI.has(earthChiOfHeavenValue(heavenEarthPlate, c.upper)));
  if (meng) {
    return { method: "shehai", methodSubcase: "見機卦 (tie-break 孟)", initial: meng.upper, provenanceId: SHEHAI_PROVENANCE.id };
  }
  const zhong = atMax.find((c) => ZHONG_CHI.has(earthChiOfHeavenValue(heavenEarthPlate, c.upper)));
  if (zhong) {
    return { method: "shehai", methodSubcase: "察微卦 (tie-break 仲)", initial: zhong.upper, provenanceId: SHEHAI_PROVENANCE.id };
  }

  // Còn lại đều 季 (Thìn/Tuất/Sửu/Mùi) — fallback theo Âm/Dương Can Ngày.
  const initial = amDuongOfCan(dayCan) === "Dương" ? fourLessons.lesson1.upper : fourLessons.lesson3.upper;
  return { method: "shehai", methodSubcase: "復等卦 (季, fallback Âm/Dương Can Ngày)", initial, provenanceId: SHEHAI_PROVENANCE.id };
}

function selectBiYong(tied: Candidate[], fourLessons: FourLessons, heavenEarthPlate: HeavenEarthPlate, dayCan: Can): NineMethodSelection {
  const dayCanAmDuong = amDuongOfCan(dayCan);
  const matched = tied.filter((c) => amDuongOfChi(c.upper) === dayCanAmDuong);

  if (matched.length === 1) {
    return { method: "biyong", initial: matched[0]!.upper, provenanceId: ZEIKE_BIYONG_PROVENANCE.id };
  }
  if (matched.length === 0) {
    return selectSheHai(tied, fourLessons, heavenEarthPlate, dayCan);
  }
  return selectSheHai(matched, fourLessons, heavenEarthPlate, dayCan);
}

function selectZeiKeCore(candidates: Candidate[], fourLessons: FourLessons, heavenEarthPlate: HeavenEarthPlate, dayCan: Can): NineMethodSelection {
  const zei = dedupByUpper(candidates.filter((c) => c.keType === "zei"));
  if (zei.length === 1) {
    return { method: "zeike", initial: zei[0]!.upper, provenanceId: ZEIKE_BIYONG_PROVENANCE.id };
  }
  if (zei.length >= 2) {
    return selectBiYong(zei, fourLessons, heavenEarthPlate, dayCan);
  }

  const ke = dedupByUpper(candidates.filter((c) => c.keType === "ke"));
  if (ke.length === 1) {
    return { method: "zeike", initial: ke[0]!.upper, provenanceId: ZEIKE_BIYONG_PROVENANCE.id };
  }
  if (ke.length >= 2) {
    return selectBiYong(ke, fourLessons, heavenEarthPlate, dayCan);
  }

  throw new NineMethodsError(
    "INSUFFICIENT_EVIDENCE_BEYOND_ZEIKE_CASCADE",
    "Tứ Khóa hoàn toàn vô khắc trực tiếp (賊克 rỗng) — theo thứ tự ưu tiên cố định (Algorithm " +
      "Spec §7.2), bước tiếp theo là 遙克法/昴星法.",
  );
}

/**
 * 遙克法 — Phase 9B Remediation. Trả `null` khi 遙克 KHÔNG áp dụng được (ngày 八專, hoặc không
 * tìm được khắc gián tiếp theo cả 2 chiều) để tầng gọi biết chuyển tiếp sang 昴星, KHÔNG throw
 * ở đây (throw là quyết định của tầng dispatcher, xem `computeNineMethodSelection`).
 *
 * Thuật toán (XÁC MINH ĐỘC LẬP qua chạy thật `d1210182010/daliuren-web-engine` shipan.py
 * `__遥克`, xem provenance.ts YAOKE_PROVENANCE): CHỈ xét chữ TRÊN của Khóa 2/3/4 (KHÔNG xét
 * Khóa 1) so với chính Can Ngày — trực tiếp trước, rồi ngược lại nếu rỗng — khử trùng theo
 * `upper`, 1 kết quả dùng luôn, ≥2 delegate sang 比用 (giữ `method:'yaoke'`).
 */
function selectYaoKe(candidates: Candidate[], fourLessons: FourLessons, heavenEarthPlate: HeavenEarthPlate, dayCan: Can, dayChi: Chi): NineMethodSelection | null {
  if (isBaZhuanDay(dayCan, dayChi)) return null;

  const dayCanNguHanh = nguHanhOfCan(dayCan);
  const others = candidates.filter((c) => c.lessonNumber !== 1);

  let matched = others.filter((c) => isKhac(nguHanhOfChi(c.upper), dayCanNguHanh));
  if (matched.length === 0) {
    matched = others.filter((c) => isKhac(dayCanNguHanh, nguHanhOfChi(c.upper)));
  }
  const deduped = dedupByUpper(matched);
  if (deduped.length === 0) return null;

  if (deduped.length === 1) {
    return { method: "yaoke", initial: deduped[0]!.upper, provenanceId: YAOKE_PROVENANCE.id };
  }
  return withYaoKeContext(selectBiYong(deduped, fourLessons, heavenEarthPlate, dayCan));
}

/** Gắn tag "yaoke" lên kết quả delegate sang 比用/涉害 — ĐÚNG hành vi repo A (tự gắn '遙克卦' TRƯỚC KHI delegate, khác 返吟 không tự gắn tag). */
function withYaoKeContext(selection: NineMethodSelection): NineMethodSelection {
  const delegateNote = selection.method !== "yaoke" ? `delegate → ${selection.method}` : undefined;
  const parts = [delegateNote, selection.methodSubcase].filter((s): s is string => Boolean(s));
  const methodSubcase = parts.length > 0 ? parts.join(", ") : undefined;
  return { ...selection, method: "yaoke", ...(methodSubcase !== undefined ? { methodSubcase } : {}) };
}

/**
 * 昴星法 — Sơ truyền = chữ Thiên Bàn tại cung Dậu (Algorithm Spec §7.2 mục 5, confidence A).
 *
 * Phase 9B Remediation: NAY ĐƯỢC GỌI từ `computeNineMethodSelection` — 遙克 (đứng ngay trước
 * 昴星 trong cascade cố định) đã implement (xem `selectYaoKe`), nên dispatcher có thể xác nhận
 * ĐÚNG rằng 遙克 không áp dụng trước khi thử 昴星, không còn rủi ro chọn sai pháp như checkpoint
 * gốc. Vẫn export riêng để test độc lập.
 *
 * XÁC MINH ĐỘC LẬP (Phase 9B): dò tay `d1210182010/daliuren-web-engine` shipan.py `__昂星`
 * (dòng 674-694) cho Trung/Mạt truyền giá trị KHÁC (không theo chuỗi tra chuẩn §7.3) — xem
 * cảnh báo đầy đủ ở provenance.ts. Hàm này dùng chuỗi tra CHUẨN cho Trung/Mạt (đúng phạm vi
 * Phase 9B đã khoá), KHÔNG dùng giá trị 虎視卦/冬蛇掩目 của repo A.
 */
export function selectMaoXing(fourLessons: FourLessons, heavenEarthPlate: HeavenEarthPlate): NineMethodSelection {
  const upperValues = new Set([fourLessons.lesson1.upper, fourLessons.lesson2.upper, fourLessons.lesson3.upper, fourLessons.lesson4.upper]);
  if (upperValues.size !== 4) {
    throw new NineMethodsError(
      "INSUFFICIENT_EVIDENCE_BEYOND_ZEIKE_CASCADE",
      "昴星法 yêu cầu Tứ Khóa đủ 4 khóa không trùng lặp (Algorithm Spec §7.2 mục 5) — lá số này không thỏa điều kiện tiên quyết.",
    );
  }
  return { method: "maoxing", initial: heavenPlateAt(heavenEarthPlate, "Dậu"), provenanceId: MAOXING_PROVENANCE.id };
}

/** mod luôn không âm — dùng cho phép dịch Chi/Can trực tiếp của 別責/八專 (KHÔNG qua `heavenPlateAt`). */
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/** Dịch 1 Chi tới `n` vị trí (âm = lùi) theo thứ tự tự nhiên CỐ ĐỊNH — KHÔNG phải phép tra Thiên Bàn. */
function shiftChi(chi: Chi, n: number): Chi {
  const index = EARTH_PLATE.indexOf(chi);
  return EARTH_PLATE[mod(index + n, 12)]!;
}

/** Dịch 1 Can tới `n` vị trí theo vòng 10 Can CỐ ĐỊNH — KHÔNG phải phép tra Thiên Bàn. */
function shiftCan(can: Can, n: number): Can {
  const index = Data.CAN.indexOf(can);
  return Data.CAN[mod(index + n, 10)]!;
}

/**
 * 別責法 — Phase 9C. Trả `null` khi KHÔNG áp dụng (Tứ Khóa không đúng 3 giá trị `upper` phân
 * biệt). TYPE B: Trung/Mạt truyền tự cung cấp, KHÔNG qua `heavenPlateAt` (xem provenance.ts
 * BIEZE_PROVENANCE — single-source, confidence B, đã re-check Phase 9C không tìm được nguồn
 * độc lập thứ 2 cho công thức, CHẤP NHẬN theo cùng tiêu chuẩn 涉害/遙克).
 */
function selectBieZe(fourLessons: FourLessons, heavenEarthPlate: HeavenEarthPlate, dayCan: Can): NineMethodSelection | null {
  const distinctUppers = new Set([fourLessons.lesson1.upper, fourLessons.lesson2.upper, fourLessons.lesson3.upper, fourLessons.lesson4.upper]);
  if (distinctUppers.size !== 3) return null;

  const isYang = amDuongOfCan(dayCan) === "Dương";
  const initial = isYang ? heavenPlateAt(heavenEarthPlate, JI_GONG_TABLE[shiftCan(dayCan, 5)]) : shiftChi(fourLessons.lesson3.lower, 4);
  const middle = fourLessons.lesson1.upper;

  return { method: "bieze", initial, middle, final: middle, provenanceId: BIEZE_PROVENANCE.id };
}

/**
 * 八專法 — Phase 9C. Trả `null` khi KHÔNG phải 1 trong 5 ngày 八專 cố định. TYPE B: Trung/Mạt
 * truyền tự cung cấp, KHÔNG qua `heavenPlateAt` (xem provenance.ts BAZHUAN_SELECTION_PROVENANCE
 * — single-source, confidence B, cùng tiêu chuẩn như trên).
 */
function selectBaZhuan(fourLessons: FourLessons, dayCan: Can, dayChi: Chi): NineMethodSelection | null {
  if (!isBaZhuanDay(dayCan, dayChi)) return null;

  const isYang = amDuongOfCan(dayCan) === "Dương";
  const initial = isYang ? shiftChi(fourLessons.lesson1.upper, 2) : shiftChi(fourLessons.lesson4.upper, -2);
  const middle = fourLessons.lesson1.upper;

  return { method: "bazhuan", initial, middle, final: middle, provenanceId: BAZHUAN_SELECTION_PROVENANCE.id };
}

/** Gắn bối cảnh "返吟 (delegate)" vào kết quả đã chọn được từ chuỗi 賊克/比用/涉害, KHÔNG đổi `method` gốc (đúng hành vi repo A: 返吟-có-khắc dùng thẳng kết quả của pháp con, không có tên riêng). */
function withFanyinContext(selection: NineMethodSelection): NineMethodSelection {
  const suffix = selection.methodSubcase ? ` — trong bối cảnh 返吟 (đối xung 6 cung), ${selection.methodSubcase}` : " — trong bối cảnh 返吟 (đối xung 6 cung), delegate sang chuỗi 賊克/比用/涉害 vì Tứ Khóa CÓ khắc";
  return { ...selection, methodSubcase: `${selection.methodSubcase ?? ""}${suffix}`.trim() };
}

/**
 * Chọn Sơ truyền. NO HIDDEN FALLBACK / KHÔNG ĐOÁN: mọi nhánh chưa đủ evidence (伏吟's công
 * thức chọn giá trị; 返吟 khi Tứ Khóa vô khắc hoàn toàn — cần 驛馬; hoặc Tứ Khóa vô khắc mà
 * không phải 伏吟/返吟 — cần 遙克) ném `NineMethodsError` tường minh, KHÔNG trả về giá trị đoán.
 */
export function computeNineMethodSelection(fourLessons: FourLessons, heavenEarthPlate: HeavenEarthPlate, dayCan: Can): NineMethodSelection {
  const candidates = buildCandidates(fourLessons);

  // Pre-check 伏吟 (Algorithm Spec §7.1): Thiên Bàn ≡ Địa Bàn toàn bộ <=> kiểm 1 điểm bất kỳ là
  // ĐỦ (phép xoay CỐ ĐỊNH đều cho toàn bộ 12 vị trí, xem heaven-earth-plate/compute.ts) — dùng
  // dayChi (lesson3) làm điểm kiểm, đúng cách repo A dùng `支阳神 == 支`.
  if (fourLessons.lesson3.upper === fourLessons.lesson3.lower) {
    throw new NineMethodsError(
      "INSUFFICIENT_EVIDENCE_FUYIN_SELECTION",
      "伏吟 đã kích hoạt (Thiên Bàn ≡ Địa Bàn, Nguyệt Tướng gia thời) nhưng công thức chọn " +
        "Sơ/Trung/Mạt truyền CHƯA đủ evidence để code (2 nguồn độc lập mô tả cơ chế khác nhau, " +
        "1 trong 2 cần bảng 刑 chưa tồn tại) — xem docs Phase 9B mục 伏吟.",
    );
  }

  // Pre-check 返吟 (Algorithm Spec §7.1): mỗi vị trí Thiên Bàn đối xung 6 cung so với Địa Bàn
  // <=> kiểm 1 điểm là ĐỦ (cùng lý do trên) — lesson3.upper phải là Lục Xung của dayChi.
  if (TrachNhat.getLucXungChi(fourLessons.lesson3.lower) === fourLessons.lesson3.upper) {
    try {
      return withFanyinContext(selectZeiKeCore(candidates, fourLessons, heavenEarthPlate, dayCan));
    } catch (error) {
      if (error instanceof NineMethodsError && error.code === "INSUFFICIENT_EVIDENCE_BEYOND_ZEIKE_CASCADE") {
        // Tứ Khóa hoàn toàn vô khắc — Phase 9C: 驛馬 nay ĐÃ implement (yi-ma/), dùng công thức
        // TYPE B (xem FANYIN_WUQIN_PROVENANCE): initial=驛馬(Chi Ngày), middle=支陽神
        // (Khóa3.upper), final=干陽神 (Khóa1.upper) — KHÔNG qua `heavenPlateAt`.
        const { yiMa } = computeYiMa(fourLessons.lesson3.lower);
        return {
          method: "fanyin",
          methodSubcase: "vô khắc trực tiếp — dùng 驛馬 (xem provenance FANYIN_WUQIN_PROVENANCE, tên gọi cổ điển KHÔNG thống nhất giữa nguồn)",
          initial: yiMa,
          middle: fourLessons.lesson3.upper,
          final: fourLessons.lesson1.upper,
          provenanceId: FANYIN_WUQIN_PROVENANCE.id,
        };
      }
      throw error;
    }
  }

  return selectZeiKeThenYaoKeThenMaoXieThenBieZeThenBaZhuan(candidates, fourLessons, heavenEarthPlate, dayCan, fourLessons.lesson3.lower);
}

/**
 * Cascade CHÍNH (không phải nhánh 返吟): 賊克(⊃比用⊃涉害) → 遙克 → 昴星 → 別責 → 八專, ĐÚNG thứ tự
 * ưu tiên cố định Algorithm Spec §7.2 — KHÔNG "nhảy cóc" bước nào (Phase 9B Remediation + 9C).
 * Nếu CẢ 5 đều không áp dụng → ném lại lỗi
 * gốc từ `selectZeiKeCore`, KHÔNG nuốt/đổi mã lỗi.
 */
function selectZeiKeThenYaoKeThenMaoXieThenBieZeThenBaZhuan(candidates: Candidate[], fourLessons: FourLessons, heavenEarthPlate: HeavenEarthPlate, dayCan: Can, dayChi: Chi): NineMethodSelection {
  try {
    return selectZeiKeCore(candidates, fourLessons, heavenEarthPlate, dayCan);
  } catch (error) {
    if (!(error instanceof NineMethodsError) || error.code !== "INSUFFICIENT_EVIDENCE_BEYOND_ZEIKE_CASCADE") {
      throw error;
    }

    const yaoke = selectYaoKe(candidates, fourLessons, heavenEarthPlate, dayCan, dayChi);
    if (yaoke) return yaoke;

    const maoXingApplies = new Set([fourLessons.lesson1.upper, fourLessons.lesson2.upper, fourLessons.lesson3.upper, fourLessons.lesson4.upper]).size === 4;
    if (maoXingApplies) return selectMaoXing(fourLessons, heavenEarthPlate);

    const bieze = selectBieZe(fourLessons, heavenEarthPlate, dayCan);
    if (bieze) return bieze;

    const bazhuan = selectBaZhuan(fourLessons, dayCan, dayChi);
    if (bazhuan) return bazhuan;

    throw new NineMethodsError(
      "INSUFFICIENT_EVIDENCE_BEYOND_ZEIKE_CASCADE",
      "Tứ Khóa vô khắc trực tiếp; đã thử hết 遙克/昴星/別責/八專 (toàn bộ 9 pháp trong phạm vi " +
        "đã implement) — không pháp nào áp dụng được cho lá số này. Theo Algorithm Spec §7.2, " +
        "đây không nên xảy ra nếu 7 pháp cascade đủ bao phủ mọi trường hợp còn lại — nếu gặp, " +
        "coi là lỗi engine thật (KHÔNG silently trả giá trị đoán).",
    );
  }
}
