/**
 * MODULE ĐỊNH HƯỚNG NGHỀ NGHIỆP THEO BÁT TỰ (Phase 2) — đúng mục 3 của
 * `handoff/docs/module-nghe-bat-tu.md`.
 *
 * ⚠️ Module này KHÔNG luận huyền học — chỉ ĐỌC `BatTuProfile` (đã luận sẵn ở tầng
 * `chart-profile`, xem `src/lib/chart-profile/`) và 3 file config trong `/handoff/config`, rồi
 * tính thuần số học theo đúng công thức tài liệu. Không tự đặt trọng số/hệ số mới ngoài config.
 *
 * Nếu `BatTuProfile` chưa luận giải xong (còn `insufficient_data` ở `manh_phai.cau_truc` /
 * `bat_tu.dung_than` / `bat_tu.hy_than` / `manh_phai.hieu_suat`) thì các bước phụ thuộc phải trả
 * `insufficient: true` — KHÔNG tự suy diễn thay AI.
 */
import type { BatTuProfile } from "../chart-profile";
import {
  loadCareerConfig,
  DOMAIN_KEYS,
  type DomainKey,
  type CareerMappingConfig,
  type DomainMappingConfig,
  type BatTuNganhNguHanhConfig,
} from "./config";

const round2 = (n: number): number => Math.round(n * 100) / 100;

// ---------------------------------------------------------------------------------------------
// Bước 1 — Career Vector (5 trục)
// ---------------------------------------------------------------------------------------------

export interface CareerVector5Truc {
  specialist: number;
  authority: number;
  management: number;
  business: number;
  investment: number;
}

export interface CareerVectorResult {
  insufficient: boolean;
  vector: CareerVector5Truc | null;
  detail: string;
}

const TRUC_5 = ["specialist", "authority", "management", "business", "investment"] as const;

export function tinhCareerVector(profile: BatTuProfile, career: CareerMappingConfig): CareerVectorResult {
  const cauTruc = profile.manh_phai.cau_truc;
  const heSo = profile.manh_phai.hieu_suat.he_so;

  if (cauTruc === "insufficient_data") {
    return { insufficient: true, vector: null, detail: "Chưa xác định cơ chế Manh Phái (manh_phai.cau_truc) — cần AI luận giải trước." };
  }
  if (heSo === null || heSo === undefined) {
    return { insufficient: true, vector: null, detail: "Chưa có hệ số hiệu suất Tố Công (manh_phai.hieu_suat.he_so)." };
  }
  const mech = career.manh_phai_mechanism[cauTruc];
  if (!mech) {
    return { insufficient: true, vector: null, detail: `Cơ chế "${cauTruc}" không tồn tại trong career_mapping.json.manh_phai_mechanism.` };
  }

  const vector = {} as CareerVector5Truc;
  for (const truc of TRUC_5) {
    // Trục vắng mặt trong mech.vector coi là 0 (đặc tả: "vector chỉ chứa các trục có mặt"),
    // KHÔNG tự điền giá trị khác 0 cho trục cơ chế không nhắc tới.
    const base = mech.vector[truc] ?? 0;
    vector[truc] = round2(base * heSo);
  }

  return {
    insufficient: false,
    vector,
    detail: `Từ cơ chế "${mech.label}" (${cauTruc}) × hệ số hiệu suất ${heSo} (${profile.manh_phai.hieu_suat.co_che}/${profile.manh_phai.hieu_suat.muc}).`,
  };
}

// ---------------------------------------------------------------------------------------------
// Bước 2 — Trục Quan Lộc ↔ Kinh Doanh
// ---------------------------------------------------------------------------------------------

export interface AxisResult {
  insufficient: boolean;
  /** -100 (thiên Quan Lộc) .. 0 .. +100 (thiên Kinh Doanh). */
  axis: number | null;
  detail: string;
}

export function tinhTrucQuanLocKinhDoanh(profile: BatTuProfile, career: CareerMappingConfig): AxisResult {
  const cpc = profile.manh_phai.chinh_phan_cuc;
  if (cpc === "insufficient_data") {
    return { insufficient: true, axis: null, detail: "Chưa xác định Chính Cục/Phản Cục (manh_phai.chinh_phan_cuc)." };
  }
  const base = cpc === "chinh_cuc" ? career.authority_business_axis.chinh_cuc_pull : career.authority_business_axis.phan_cuc_pull;
  return {
    insufficient: false,
    axis: base,
    detail:
      `Trục cơ bản theo ${cpc === "chinh_cuc" ? "Chính Cục" : "Phản Cục"} = ${base}. ` +
      `career_mapping.json.authority_business_axis.note ghi nguồn "nudge theo cơ chế" là archetype + cung Quan Lộc/Tài ` +
      `Bạch/Thiên Di của TỬ VI — chưa có trong hồ sơ Bát Tự v1 nên CHƯA áp dụng (không tự bịa độ lớn nudge).`,
  };
}

// ---------------------------------------------------------------------------------------------
// Bước 3 — Điểm ngành (2 nguồn cộng lại) + 3+3+3 + dedup
// ---------------------------------------------------------------------------------------------

export interface MajorItem {
  name: string;
  weight: number;
}

export interface DomainBucketItem {
  domain: DomainKey;
  label: string;
  score: number;
  majors: MajorItem[];
}

export interface DomainScoreResult {
  insufficient: boolean;
  detail: string;
  scores: Record<DomainKey, number> | null;
  priority: DomainBucketItem[];
  suitable: DomainBucketItem[];
  possible: DomainBucketItem[];
}

export function tinhDiemNganh(
  profile: BatTuProfile,
  domain: DomainMappingConfig,
  batTuNganh: BatTuNganhNguHanhConfig,
): DomainScoreResult {
  const cauTruc = profile.manh_phai.cau_truc;
  const dungThan = profile.bat_tu.dung_than;
  const hyThan = profile.bat_tu.hy_than;
  const empty = { insufficient: true as const, scores: null, priority: [], suitable: [], possible: [] };

  if (cauTruc === "insufficient_data") return { ...empty, detail: "Chưa xác định cơ chế Manh Phái (manh_phai.cau_truc)." };
  if (dungThan === "insufficient_data") return { ...empty, detail: "Chưa xác định Dụng Thần (bat_tu.dung_than)." };
  if (hyThan === "insufficient_data") return { ...empty, detail: "Chưa xác định Hỷ Thần (bat_tu.hy_than)." };

  const mech = domain.mechanisms[cauTruc];
  const dungThanEntry = batTuNganh.nguu_hanh_to_domain[dungThan];
  const hyThanEntry = batTuNganh.nguu_hanh_to_domain[hyThan];
  if (!mech) return { ...empty, detail: `Cơ chế "${cauTruc}" không có trong domain_mapping.json.mechanisms.` };
  if (!dungThanEntry) return { ...empty, detail: `Dụng Thần "${dungThan}" không có trong bat_tu_nganh_ngu_hanh.json.` };
  if (!hyThanEntry) return { ...empty, detail: `Hỷ Thần "${hyThan}" không có trong bat_tu_nganh_ngu_hanh.json.` };

  const scores = {} as Record<DomainKey, number>;
  for (const d of DOMAIN_KEYS) {
    scores[d] = round2((mech.domains[d] ?? 0) + (dungThanEntry.domains[d] ?? 0) * 1.0 + (hyThanEntry.domains[d] ?? 0) * 0.5);
  }

  const th = domain.output_rules.recommended_initial_thresholds;
  const sortedAll = [...DOMAIN_KEYS].map((d) => ({ domain: d, score: scores[d] })).sort((a, b) => b.score - a.score);

  const picked = new Set<DomainKey>();
  const priorityRaw = sortedAll.filter((x) => x.score >= th.positive).slice(0, 3);
  priorityRaw.forEach((x) => picked.add(x.domain));
  const suitableRaw = sortedAll.filter((x) => !picked.has(x.domain) && x.score >= th.neutral).slice(0, 3);
  suitableRaw.forEach((x) => picked.add(x.domain));
  const possibleRaw = sortedAll.filter((x) => !picked.has(x.domain) && x.score >= th.negative).slice(0, 3);

  const selected = [...priorityRaw, ...suitableRaw, ...possibleRaw];
  const selectedKeys = new Set(selected.map((x) => x.domain));

  // Khử trùng major theo domain_mapping.json.deduplication_rules: 1 major xuất hiện ở nhiều domain
  // thì chỉ giữ dưới domain có điểm cao hơn trong số các domain ĐÃ ĐƯỢC CHỌN.
  const aliasWinner = new Map<string, DomainKey>(); // majorName -> domain thắng
  for (const [majorName, domains] of Object.entries(domain.deduplication_rules.canonical_major_aliases)) {
    const candidates = domains.filter((d): d is DomainKey => selectedKeys.has(d as DomainKey));
    if (candidates.length <= 1) continue;
    const winner = candidates.reduce((best, d) => (scores[d] > scores[best] ? d : best), candidates[0]!);
    aliasWinner.set(majorName, winner);
  }

  function buildBucket(raw: { domain: DomainKey; score: number }[]): DomainBucketItem[] {
    return raw.map(({ domain: d, score }) => {
      const catalog = domain.domain_catalog[d];
      const majors = (catalog?.majors ?? [])
        .filter((m) => !aliasWinner.has(m.name) || aliasWinner.get(m.name) === d)
        .slice()
        .sort((a, b) => b.weight - a.weight);
      return { domain: d, label: catalog?.label ?? d, score, majors };
    });
  }

  return {
    insufficient: false,
    detail: `domain_score[d] = mechanisms["${cauTruc}"].domains[d] + nguu_hanh["${dungThan}"].domains[d]×1.0 + nguu_hanh["${hyThan}"].domains[d]×0.5`,
    scores,
    priority: buildBucket(priorityRaw),
    suitable: buildBucket(suitableRaw),
    possible: buildBucket(possibleRaw),
  };
}

// ---------------------------------------------------------------------------------------------
// Bước 4 — Career Path + Timeline (đọc thẳng profile.dai_van, không tính lại)
// ---------------------------------------------------------------------------------------------

const CHU_DE_NHAN: Record<string, string> = {
  hoc_tap: "Học tập",
  tai_van: "Tài vận",
  su_nghiep: "Sự nghiệp",
  hon_nhan: "Hôn nhân",
  suc_khoe: "Sức khỏe",
};

const DUNG_HY_NHAN: Record<string, string> = {
  dung: "Vận Dụng Thần (thuận)",
  hy: "Vận Hỷ Thần (thuận nhẹ)",
  trung: "Trung tính",
  ky: "Vận Kỵ Thần (nên thận trọng)",
};

export interface CareerPathEntry {
  tuTuoi: number;
  denTuoi: number;
  canChi: string;
  nguHanh: string;
  dungHy: string;
  dungHyNhan: string;
  chuDe: string;
  chuDeNhan: string;
  mucThuan: string;
}

export function tinhCareerPath(profile: BatTuProfile): CareerPathEntry[] {
  return profile.dai_van.map((dv) => ({
    tuTuoi: dv.tuTuoi,
    denTuoi: dv.denTuoi,
    canChi: dv.can_chi,
    nguHanh: dv.ngu_hanh,
    dungHy: dv.dungHy,
    dungHyNhan: DUNG_HY_NHAN[dv.dungHy] ?? "Chưa xác định (insufficient_data)",
    chuDe: dv.chuDe,
    chuDeNhan: CHU_DE_NHAN[dv.chuDe] ?? (dv.chuDe === "insufficient_data" ? "Chưa xác định (insufficient_data)" : dv.chuDe),
    mucThuan: dv.mucThuan,
  }));
}

// ---------------------------------------------------------------------------------------------
// Tổng hợp
// ---------------------------------------------------------------------------------------------

export interface ModuleNgheBatTuResult {
  careerVector: CareerVectorResult;
  axis: AxisResult;
  domainScore: DomainScoreResult;
  careerPath: CareerPathEntry[];
  warnings: string[];
}

export function tinhModuleNgheBatTu(profile: BatTuProfile): ModuleNgheBatTuResult {
  const { career, domain, batTuNganh } = loadCareerConfig();

  const careerVector = tinhCareerVector(profile, career);
  const axis = tinhTrucQuanLocKinhDoanh(profile, career);
  const domainScore = tinhDiemNganh(profile, domain, batTuNganh);
  const careerPath = tinhCareerPath(profile);

  const warnings = [...profile.warnings];
  if (careerVector.insufficient) warnings.push(`Career Vector: ${careerVector.detail}`);
  if (axis.insufficient) warnings.push(`Trục Quan Lộc↔Kinh Doanh: ${axis.detail}`);
  if (domainScore.insufficient) warnings.push(`Điểm ngành: ${domainScore.detail}`);

  return { careerVector, axis, domainScore, careerPath, warnings };
}
