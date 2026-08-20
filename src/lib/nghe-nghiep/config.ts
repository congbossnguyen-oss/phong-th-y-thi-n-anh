/**
 * Nạp 3 file config cho MODULE NGHỀ THEO BÁT TỰ — đọc từ FILE trong `/handoff/config`, KHÔNG
 * hard-code bất kỳ bảng số nào trong code (đúng ràng buộc handoff/README-GIAO-CLAUDE-CODE.md).
 *
 * Module này KHÔNG luận huyền học — chỉ đọc `BatTuProfile` (đã luận sẵn ở tầng `chart-profile`)
 * + 3 file dưới đây rồi tính theo đúng công thức mục 3 của `handoff/docs/module-nghe-bat-tu.md`.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const CONFIG_DIR = join(process.cwd(), "handoff", "config");

export interface CareerMechanismEntry {
  label: string;
  direction: string;
  /** CHỈ chứa các trục có mặt — trục vắng mặt coi là 0, KHÔNG tự điền. */
  vector: Partial<Record<"specialist" | "authority" | "management" | "business" | "investment", number>>;
}

export interface CareerMappingConfig {
  _contract: { mechanism_keys: string[] };
  manh_phai_mechanism: Record<string, CareerMechanismEntry>;
  authority_business_axis: { chinh_cuc_pull: number; phan_cuc_pull: number; note: string };
  to_cong_strength_factor: Record<string, number>;
}

export interface DomainCatalogEntry {
  label: string;
  majors: { name: string; weight: number }[];
}

export interface DomainMechanismEntry {
  label: string;
  domains: Record<string, number>;
  rationale: string;
}

export interface DomainMappingConfig {
  mechanisms: Record<string, DomainMechanismEntry>;
  domain_catalog: Record<string, DomainCatalogEntry>;
  output_rules: {
    buckets: { priority: { count: number }; suitable: { count: number }; possible: { count: number } };
    recommended_initial_thresholds: { strong: number; positive: number; neutral: number; negative: number; avoid: number };
  };
  deduplication_rules: {
    canonical_major_aliases: Record<string, string[]>;
  };
}

export interface NguHanhDomainEntry {
  label: string;
  domains: Record<string, number>;
  vi_du_nghe: string;
}

export interface BatTuNganhNguHanhConfig {
  nguu_hanh_to_domain: Record<string, NguHanhDomainEntry>;
}

/** Bảng DỰ PHÒNG Thập Thần → nghề (dùng khi Manh Phái insufficient). THIEN_ANH_MODEL — bản nháp. */
export interface ThapThanNgheConfig {
  thap_than_aliases: Record<string, string>;
  thap_than_to_truc: Record<string, Partial<Record<"specialist" | "authority" | "management" | "business" | "investment", number>>>;
  thap_than_axis_pull: Record<string, number>;
}

let cached: {
  career: CareerMappingConfig;
  domain: DomainMappingConfig;
  batTuNganh: BatTuNganhNguHanhConfig;
  thapThanNghe: ThapThanNgheConfig;
} | null = null;

function readJson<T>(fileName: string): T {
  const raw = readFileSync(join(CONFIG_DIR, fileName), "utf-8");
  return JSON.parse(raw) as T;
}

/** Nạp + cache 3 file config trong bộ nhớ tiến trình — nội dung không đổi giữa các request. */
export function loadCareerConfig(): { career: CareerMappingConfig; domain: DomainMappingConfig; batTuNganh: BatTuNganhNguHanhConfig; thapThanNghe: ThapThanNgheConfig } {
  if (cached) return cached;
  cached = {
    career: readJson<CareerMappingConfig>("career_mapping.json"),
    domain: readJson<DomainMappingConfig>("domain_mapping.json"),
    batTuNganh: readJson<BatTuNganhNguHanhConfig>("bat_tu_nganh_ngu_hanh.json"),
    thapThanNghe: readJson<ThapThanNgheConfig>("thap_than_nghe.json"),
  };
  return cached;
}

export const DOMAIN_KEYS = [
  "economics_finance", "management_business", "technology_engineering", "science_research",
  "health_medicine", "law_policy_social", "media_language", "education_consulting",
  "arts_design", "real_estate_assets",
] as const;
export type DomainKey = (typeof DOMAIN_KEYS)[number];
