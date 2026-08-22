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
  type ThapThanNgheConfig,
} from "./config";

const round2 = (n: number): number => Math.round(n * 100) / 100;
const NGU_HANH_VI: Record<string, string> = { kim: "Kim", moc: "Mộc", thuy: "Thủy", hoa: "Hỏa", tho: "Thổ" };

/** Nguồn dữ liệu của một bước: Manh Phái (chính) hay dự phòng Thập Thần. */
export type NguonNghe = "manh_phai" | "thap_than" | "none";

/** Chuẩn hoá tên Thập Thần (tiếng Việt) → khoá, bỏ tên không nhận diện. */
function normThapThan(names: string[], aliases: Record<string, string>): string[] {
  return names.map((n) => aliases[n.trim()]).filter((k): k is string => Boolean(k));
}

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
  nguon: NguonNghe;
  detail: string;
}

const TRUC_5 = ["specialist", "authority", "management", "business", "investment"] as const;

export function tinhCareerVector(profile: BatTuProfile, career: CareerMappingConfig, thapThan: ThapThanNgheConfig): CareerVectorResult {
  const cauTruc = profile.manh_phai.cau_truc;
  const heSo = profile.manh_phai.hieu_suat.he_so;

  // Ưu tiên MANH PHÁI khi đủ dữ liệu.
  if (cauTruc !== "insufficient_data" && heSo != null) {
    const mech = career.manh_phai_mechanism[cauTruc];
    if (mech) {
      const vector = {} as CareerVector5Truc;
      // Trục vắng trong mech.vector coi là 0 — KHÔNG tự điền.
      for (const truc of TRUC_5) vector[truc] = round2((mech.vector[truc] ?? 0) * heSo);
      return {
        insufficient: false,
        vector,
        nguon: "manh_phai",
        detail: `Từ cơ chế Manh Phái "${mech.label}", với hiệu suất Tố Công ở mức ${profile.manh_phai.hieu_suat.muc === "cao" ? "cao" : profile.manh_phai.hieu_suat.muc === "trung_binh" ? "trung bình" : profile.manh_phai.hieu_suat.muc === "thap" ? "thấp" : "chưa xác định"}.`,
      };
    }
  }

  // DỰ PHÒNG: suy 5 trục từ Thập Thần nổi bật (cách luận nghề kinh điển, không bịa).
  const keys = normThapThan(profile.bat_tu.thap_than_noi_bat, thapThan.thap_than_aliases);
  if (keys.length === 0) {
    return { insufficient: true, vector: null, nguon: "none", detail: "Không đủ dữ liệu để xác định 5 trục nghề nghiệp từ Bát Tự." };
  }
  const vector: CareerVector5Truc = { specialist: 0, authority: 0, management: 0, business: 0, investment: 0 };
  for (const k of keys) {
    const w = thapThan.thap_than_to_truc[k];
    if (!w) continue;
    for (const truc of TRUC_5) vector[truc] = round2(vector[truc] + (w[truc] ?? 0));
  }
  return {
    insufficient: false,
    vector,
    nguon: "thap_than",
    detail: `Dự phòng theo Thập Thần nổi bật (${profile.bat_tu.thap_than_noi_bat.join(", ")}) vì cơ chế Manh Phái chưa đủ căn cứ.`,
  };
}

// ---------------------------------------------------------------------------------------------
// Bước 2 — Trục Quan Lộc ↔ Kinh Doanh
// ---------------------------------------------------------------------------------------------

export interface AxisResult {
  insufficient: boolean;
  /** -100 (thiên Quan Lộc) .. 0 .. +100 (thiên Kinh Doanh). */
  axis: number | null;
  nguon: NguonNghe;
  detail: string;
}

export function tinhTrucQuanLocKinhDoanh(profile: BatTuProfile, career: CareerMappingConfig, thapThan: ThapThanNgheConfig): AxisResult {
  const cpc = profile.manh_phai.chinh_phan_cuc;
  if (cpc !== "insufficient_data") {
    const base = cpc === "chinh_cuc" ? career.authority_business_axis.chinh_cuc_pull : career.authority_business_axis.phan_cuc_pull;
    return {
      insufficient: false,
      axis: base,
      nguon: "manh_phai",
      detail: `Trục theo ${cpc === "chinh_cuc" ? "Chính Cục" : "Phản Cục"} (Manh Phái) = ${base}.`,
    };
  }

  // DỰ PHÒNG: trung bình "lực kéo" của các Thập Thần nổi bật (Quan/Ấn kéo về Quan Lộc; Tài/Thực
  // Thương/Tỷ Kiếp kéo về Kinh Doanh).
  const keys = normThapThan(profile.bat_tu.thap_than_noi_bat, thapThan.thap_than_aliases);
  const pulls = keys.map((k) => thapThan.thap_than_axis_pull[k]).filter((v): v is number => typeof v === "number");
  if (pulls.length === 0) {
    return { insufficient: true, axis: null, nguon: "none", detail: "Không đủ dữ liệu để xác định hướng làm chủ / làm thuê từ Bát Tự." };
  }
  const axis = Math.max(-100, Math.min(100, Math.round(pulls.reduce((s, v) => s + v, 0) / pulls.length)));
  return {
    insufficient: false,
    axis,
    nguon: "thap_than",
    detail: `Dự phòng theo Thập Thần nổi bật (${profile.bat_tu.thap_than_noi_bat.join(", ")}) vì cơ chế Manh Phái chưa đủ căn cứ.`,
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
  nguon: NguonNghe;
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
  const empty = { insufficient: true as const, nguon: "none" as const, scores: null, priority: [], suitable: [], possible: [] };

  // Dụng/Hỷ Thần LÀ BẮT BUỘC (nền ngũ hành → ngành). Cơ chế Manh Phái là TÙY: có thì cộng thêm,
  // không có thì tính từ Dụng/Hỷ Thần (nguồn dự phòng), KHÔNG để trống toàn bộ ngành.
  if (dungThan === "insufficient_data") return { ...empty, detail: "Đang cập nhật phần luận ngành (chờ xác định Dụng Thần)." };
  if (hyThan === "insufficient_data") return { ...empty, detail: "Đang cập nhật phần luận ngành (chờ xác định Hỷ Thần)." };

  const mech = cauTruc !== "insufficient_data" ? domain.mechanisms[cauTruc] : null;
  const dungThanEntry = batTuNganh.nguu_hanh_to_domain[dungThan];
  const hyThanEntry = batTuNganh.nguu_hanh_to_domain[hyThan];
  if (!dungThanEntry) return { ...empty, detail: `Chưa tra được dữ liệu ngành cho Dụng Thần "${NGU_HANH_VI[dungThan] ?? dungThan}".` };
  if (!hyThanEntry) return { ...empty, detail: `Chưa tra được dữ liệu ngành cho Hỷ Thần "${NGU_HANH_VI[hyThan] ?? hyThan}".` };

  const nguon: NguonNghe = mech ? "manh_phai" : "thap_than";
  const scores = {} as Record<DomainKey, number>;
  for (const d of DOMAIN_KEYS) {
    scores[d] = round2((mech?.domains[d] ?? 0) + (dungThanEntry.domains[d] ?? 0) * 1.0 + (hyThanEntry.domains[d] ?? 0) * 0.5);
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
    nguon,
    detail: mech
      ? `Điểm ngành tính từ cơ chế Manh Phái "${mech.label}", cộng thêm ảnh hưởng của Dụng Thần ${NGU_HANH_VI[dungThan] ?? dungThan} và Hỷ Thần ${NGU_HANH_VI[hyThan] ?? hyThan}.`
      : `Điểm ngành tính từ Dụng Thần ${NGU_HANH_VI[dungThan] ?? dungThan} và Hỷ Thần ${NGU_HANH_VI[hyThan] ?? hyThan}.`,
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
    dungHyNhan: DUNG_HY_NHAN[dv.dungHy] ?? "Đang cập nhật",
    chuDe: dv.chuDe,
    chuDeNhan: CHU_DE_NHAN[dv.chuDe] ?? (dv.chuDe === "insufficient_data" ? "Đang cập nhật" : dv.chuDe),
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
  const { career, domain, batTuNganh, thapThanNghe } = loadCareerConfig();

  const careerVector = tinhCareerVector(profile, career, thapThanNghe);
  const axis = tinhTrucQuanLocKinhDoanh(profile, career, thapThanNghe);
  const domainScore = tinhDiemNganh(profile, domain, batTuNganh);
  const careerPath = tinhCareerPath(profile);

  const warnings = [...profile.warnings];
  if (careerVector.insufficient) warnings.push(`5 trục năng lực: ${careerVector.detail}`);
  if (axis.insufficient) warnings.push(`Trục Quan Lộc↔Kinh Doanh: ${axis.detail}`);
  if (domainScore.insufficient) warnings.push(`Điểm ngành: ${domainScore.detail}`);

  return { careerVector, axis, domainScore, careerPath, warnings };
}
