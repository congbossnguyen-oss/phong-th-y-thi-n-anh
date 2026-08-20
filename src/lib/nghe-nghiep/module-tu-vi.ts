/**
 * MODULE ĐỊNH HƯỚNG NGHỀ NGHIỆP THEO TỬ VI (Phase 2) — đúng mục 3 của
 * `handoff/docs/module-nghe-tu-vi.md`. Đọc `TuViProfile` (đã an sao sẵn ở tầng chart-profile) +
 * 3 file config. KHÔNG tự luận huyền học.
 *
 * ⚠️ Phần "hình dạng nghề" (archetype vector, archetype→ngành) phụ thuộc `menh_cach.chinh` — mà
 * việc xác định archetype "đạt cách" cần LLM luận (skill Tử Vi). Chưa có AI → trả insufficient cho
 * các bước đó. RIÊNG lớp "chính tinh Quan Lộc/Mệnh → ngành" (`tu_vi_sao_nganh.json`) tính được
 * THẲNG từ lá số (không cần AI) nên vẫn cho ra điểm ngành sơ bộ.
 *
 * Hệ số Đắc/Hãm & Tuần/Triệt (do_sang ×1.0/×0.85/×0.6, Tuần-Triệt ×0.8) là THAM SỐ MÔ HÌNH nháp
 * theo mô tả apply_rule của tài liệu (tài liệu ghi định tính "Hãm giảm nudge", chưa cho con số) —
 * đánh dấu THIEN_ANH_MODEL/nháp, chưa calibrate.
 */
import type { TuViProfile } from "../chart-profile/types-tu-vi";
import { loadTuViConfig } from "./config-tu-vi";
import { DOMAIN_KEYS, type DomainKey } from "./config";
import { loadCareerConfig } from "./config";

const round2 = (n: number): number => Math.round(n * 100) / 100;
const TRUC_5 = ["specialist", "authority", "management", "business", "investment"] as const;
export type Truc = (typeof TRUC_5)[number];

// Hệ số đắc/hãm cho ĐỘ SÁNG bộ sao cách (menh_cach.do_sang) — tham số nháp.
const DO_SANG_FACTOR: Record<string, number> = { mieu_vuong: 1.0, binh: 0.85, ham: 0.6 };
const DO_SANG_VI: Record<string, string> = { mieu_vuong: "Miếu/Vượng", binh: "Bình hòa", ham: "Hãm" };
// Hệ số đắc/hãm cho TỪNG chính tinh khi cộng nudge theo tu_vi_sao_nganh — tham số nháp.
const DAC_HAM_FACTOR: Record<string, number> = { mieu: 1.0, vuong: 1.0, dac: 0.9, binh: 0.75, ham: 0.5 };

export interface TuViCareerVectorResult {
  insufficient: boolean;
  vector: Record<Truc, number> | null;
  detail: string;
}

export function tinhCareerVectorTuVi(profile: TuViProfile): TuViCareerVectorResult {
  const { careerTV } = loadTuViConfig();
  const mc = profile.menh_cach;
  if (mc.chinh === "insufficient_data") {
    return { insufficient: true, vector: null, detail: "Chưa xác định được mệnh cách — cần luận thêm cách cục." };
  }
  const arche = careerTV.tam_hop_archetype[mc.chinh];
  if (!arche) return { insufficient: true, vector: null, detail: "Chưa tra được dữ liệu ngành cho mệnh cách này." };

  const doSang = mc.do_sang === "insufficient_data" ? 1.0 : (DO_SANG_FACTOR[mc.do_sang] ?? 1.0);
  const tuanTriet = profile.facts.tuanTrietCung.length > 0 ? 0.8 : 1.0;

  const vector = {} as Record<Truc, number>;
  for (const t of TRUC_5) {
    let v = arche.vector[t] ?? 0;
    for (const p of mc.phu) v += careerTV.tam_hop_phu_cach[p]?.vector[t] ?? 0;
    vector[t] = round2(v * doSang * tuanTriet);
  }
  return {
    insufficient: false,
    vector,
    detail: `Từ mệnh cách "${arche.label}"${mc.phu.length ? ` kèm ${mc.phu.length} phụ cách` : ""}${mc.do_sang !== "insufficient_data" ? `, độ sáng ${DO_SANG_VI[mc.do_sang] ?? mc.do_sang}` : ""}${tuanTriet < 1 ? ", có Tuần/Triệt nên giảm nhẹ" : ""}.`,
  };
}

export interface TuViAxisResult {
  insufficient: boolean;
  axis: number | null;
  detail: string;
}

// Độ nghiêng theo mệnh cách: tổ chức/chuyên môn kéo về Quan Lộc (âm), tiên phong kéo Kinh Doanh (dương).
const ARCHE_AXIS_NUDGE: Record<string, number> = { organizer: -30, specialist: -20, pioneer: 30 };
const ARCHE_KEY_VI: Record<string, string> = { organizer: "thiên tổ chức", specialist: "thiên chuyên môn", pioneer: "thiên tiên phong/kinh doanh" };
const CAT_HUNG_VI: Record<string, string> = { cat: "cát", binh: "bình hòa", hung: "hung" };

export function tinhTrucTuVi(profile: TuViProfile): TuViAxisResult {
  const { careerTV } = loadTuViConfig();
  const mc = profile.menh_cach;
  if (mc.chinh === "insufficient_data") return { insufficient: true, axis: null, detail: "Chưa xác định được mệnh cách." };
  const archeKey = careerTV.tam_hop_archetype[mc.chinh]?.archetype_key;
  let axis = archeKey ? (ARCHE_AXIS_NUDGE[archeKey] ?? 0) : 0;

  const dg = profile.danh_gia_cung;
  let ghiChuDg = "chưa đủ đánh giá cát/hung cung";
  if (dg.quan_loc !== "insufficient_data" && dg.tai_bach !== "insufficient_data") {
    const diem = (c: string) => (c === "cat" ? 1 : c === "hung" ? -1 : 0);
    const chenh = diem(dg.tai_bach) - diem(dg.quan_loc); // Tài mạnh hơn Quan → kéo Kinh Doanh (dương)
    axis += chenh * 20;
    ghiChuDg = `Quan Lộc ${CAT_HUNG_VI[dg.quan_loc] ?? dg.quan_loc}, Tài Bạch ${CAT_HUNG_VI[dg.tai_bach] ?? dg.tai_bach}`;
  }
  axis = Math.max(-100, Math.min(100, axis));
  return { insufficient: false, axis, detail: `Mệnh cách ${archeKey ? ARCHE_KEY_VI[archeKey] ?? archeKey : "chưa rõ hướng"}, kết hợp đánh giá cung (${ghiChuDg}).` };
}

export interface TuViDomainItem {
  domain: DomainKey;
  label: string;
  score: number;
  majors: { name: string; weight: number }[];
}
export interface TuViDomainResult {
  insufficient: boolean;
  detail: string;
  scores: Record<DomainKey, number> | null;
  priority: TuViDomainItem[];
  suitable: TuViDomainItem[];
  possible: TuViDomainItem[];
  warnings: string[];
}

export function tinhDiemNganhTuVi(profile: TuViProfile): TuViDomainResult {
  const { careerTV, domainTV, saoNganh } = loadTuViConfig();
  const { domain } = loadCareerConfig();
  const warnings: string[] = [];
  const empty = { insufficient: true as const, scores: null, priority: [], suitable: [], possible: [], warnings };

  const mc = profile.menh_cach;

  // Lớp nudge chính tinh Quan Lộc/Mệnh (KHÔNG cần AI) — luôn tính được.
  const scores = {} as Record<DomainKey, number>;
  for (const d of DOMAIN_KEYS) scores[d] = 0;

  function congSaoNganh(saoList: { ten: string; dac_ham: string }[], heSoCung: number): void {
    for (const s of saoList) {
      const entry = saoNganh.chinh_tinh_to_domain[s.ten];
      if (!entry) continue;
      const fHam = DAC_HAM_FACTOR[s.dac_ham] ?? 0.75;
      for (const d of DOMAIN_KEYS) scores[d] += round2((entry.domains[d] ?? 0) * heSoCung * fHam);
    }
  }
  congSaoNganh(profile.facts.sao_theo_cung.quan_loc, 1.0);
  congSaoNganh(profile.facts.sao_theo_cung.menh, 0.7);

  // Vô Chính Diệu cung Quan Lộc → mượn sao Thiên Di × 0.7 (apply_rule).
  if (profile.facts.quanLocVoChinhDieu) {
    congSaoNganh(profile.facts.sao_theo_cung.thien_di, 0.7);
    warnings.push("Cung Quan Lộc Vô Chính Diệu — mượn sao cung Thiên Di (×0.7) theo apply_rule.");
  }

  // Lớp archetype base (CẦN AI). Có thì cộng thêm; không thì chỉ có lớp chính tinh + cảnh báo.
  let coArchetype = false;
  if (mc.chinh !== "insufficient_data" && domainTV.archetypes[mc.chinh]) {
    coArchetype = true;
    const base = domainTV.archetypes[mc.chinh]!;
    for (const d of DOMAIN_KEYS) scores[d] += base.domains[d] ?? 0;
    for (const p of mc.phu) {
      const pc = domainTV.tam_hop_phu_cach[p];
      if (pc) for (const d of DOMAIN_KEYS) scores[d] += pc.domains[d] ?? 0;
    }
  } else {
    warnings.push("Chưa xác định được mệnh cách nền — điểm ngành mới tính từ chính tinh Quan Lộc/Mệnh, chưa cộng thêm phần mệnh cách.");
  }
  for (const d of DOMAIN_KEYS) scores[d] = round2(scores[d]);

  // Nếu KHÔNG có sao nào ở cả Quan Lộc/Mệnh/Di và cũng không có archetype → thực sự không đủ dữ liệu.
  const coTinHieu = coArchetype || profile.facts.sao_theo_cung.quan_loc.length > 0 || profile.facts.sao_theo_cung.menh.length > 0;
  if (!coTinHieu) return { ...empty, detail: "Chưa đủ dữ liệu để gợi ý ngành (không có chính tinh Quan Lộc/Mệnh và chưa xác định mệnh cách)." };

  const th = domain.output_rules.recommended_initial_thresholds;
  const sortedAll = [...DOMAIN_KEYS].map((d) => ({ domain: d, score: scores[d] })).sort((a, b) => b.score - a.score);
  const picked = new Set<DomainKey>();
  const priorityRaw = sortedAll.filter((x) => x.score >= th.positive).slice(0, 3);
  priorityRaw.forEach((x) => picked.add(x.domain));
  const suitableRaw = sortedAll.filter((x) => !picked.has(x.domain) && x.score >= th.neutral).slice(0, 3);
  suitableRaw.forEach((x) => picked.add(x.domain));
  const possibleRaw = sortedAll.filter((x) => !picked.has(x.domain) && x.score >= th.negative).slice(0, 3);

  const selectedKeys = new Set([...priorityRaw, ...suitableRaw, ...possibleRaw].map((x) => x.domain));
  const aliasWinner = new Map<string, DomainKey>();
  for (const [majorName, domains] of Object.entries(domain.deduplication_rules.canonical_major_aliases)) {
    const cand = domains.filter((d): d is DomainKey => selectedKeys.has(d as DomainKey));
    if (cand.length <= 1) continue;
    aliasWinner.set(majorName, cand.reduce((best, d) => (scores[d] > scores[best] ? d : best), cand[0]!));
  }
  const buildBucket = (raw: { domain: DomainKey; score: number }[]): TuViDomainItem[] =>
    raw.map(({ domain: d, score }) => {
      const catalog = domain.domain_catalog[d];
      const majors = (catalog?.majors ?? [])
        .filter((m) => !aliasWinner.has(m.name) || aliasWinner.get(m.name) === d)
        .slice()
        .sort((a, b) => b.weight - a.weight);
      return { domain: d, label: catalog?.label ?? d, score, majors };
    });

  return {
    insufficient: false,
    detail: `Điểm ngành tính từ chính tinh cung Quan Lộc và Mệnh (có điều chỉnh theo Đắc/Hãm)${coArchetype ? ", cộng thêm phần mệnh cách nền" : " — mệnh cách nền chưa xác định nên chưa cộng thêm"}.`,
    scores,
    priority: buildBucket(priorityRaw),
    suitable: buildBucket(suitableRaw),
    possible: buildBucket(possibleRaw),
    warnings,
  };
}

const CHU_DE_NHAN: Record<string, string> = {
  hoc_tap: "Học tập", tai_van: "Tài vận", su_nghiep: "Sự nghiệp", hon_nhan: "Hôn nhân", suc_khoe: "Sức khỏe",
};

export interface TuViPathEntry {
  tuTuoi: number; denTuoi: number; cungName: string; cungChi: string;
  chuDe: string; chuDeNhan: string; mucThuan: string;
}

export function tinhCareerPathTuVi(profile: TuViProfile): TuViPathEntry[] {
  return profile.dai_han.map((dh) => ({
    tuTuoi: dh.tuTuoi, denTuoi: dh.denTuoi, cungName: dh.cungName, cungChi: dh.cungChi,
    chuDe: dh.chuDe, mucThuan: dh.mucThuan,
    chuDeNhan: CHU_DE_NHAN[dh.chuDe] ?? (dh.chuDe === "insufficient_data" ? "Chưa xác định" : dh.chuDe),
  }));
}

export interface ModuleNgheTuViResult {
  careerVector: TuViCareerVectorResult;
  axis: TuViAxisResult;
  domainScore: TuViDomainResult;
  careerPath: TuViPathEntry[];
  warnings: string[];
}

export function tinhModuleNgheTuVi(profile: TuViProfile): ModuleNgheTuViResult {
  const careerVector = tinhCareerVectorTuVi(profile);
  const axis = tinhTrucTuVi(profile);
  const domainScore = tinhDiemNganhTuVi(profile);
  const careerPath = tinhCareerPathTuVi(profile);

  const warnings = [...profile.warnings, ...domainScore.warnings];
  if (careerVector.insufficient) warnings.push(`5 trục năng lực (Tử Vi): ${careerVector.detail}`);
  if (axis.insufficient) warnings.push(`Trục Quan Lộc↔Kinh Doanh (Tử Vi): ${axis.detail}`);

  return { careerVector, axis, domainScore, careerPath, warnings };
}
