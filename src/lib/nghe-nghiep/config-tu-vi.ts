/**
 * Nạp các phần config cần cho MODULE NGHỀ THEO TỬ VI — đọc từ FILE trong `/handoff/config`, KHÔNG
 * hard-code. Dùng lại `career_mapping.json` (tam_hop_archetype + tam_hop_phu_cach) và
 * `domain_mapping.json` (archetypes + tam_hop_phu_cach) — đã có sẵn, và file MỚI
 * `tu_vi_sao_nganh.json` (chính tinh → ngành).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const CONFIG_DIR = join(process.cwd(), "handoff", "config");

interface VectorPartial {
  vector: Partial<Record<"specialist" | "authority" | "management" | "business" | "investment", number>>;
}
export interface CareerTuViConfig {
  tam_hop_archetype: Record<string, { label: string; archetype_key?: string } & VectorPartial>;
  tam_hop_phu_cach: Record<string, { label: string } & VectorPartial>;
}
export interface DomainTuViConfig {
  archetypes: Record<string, { label: string; domains: Record<string, number> }>;
  tam_hop_phu_cach: Record<string, { label: string; domains: Record<string, number> }>;
}
export interface TuViSaoNganhConfig {
  chinh_tinh_to_domain: Record<string, { label: string; domains: Record<string, number>; vi_du: string }>;
  trung_tinh_bo_sung: Record<string, unknown>;
}

let cached: { careerTV: CareerTuViConfig; domainTV: DomainTuViConfig; saoNganh: TuViSaoNganhConfig } | null = null;

function readJson<T>(f: string): T {
  return JSON.parse(readFileSync(join(CONFIG_DIR, f), "utf-8")) as T;
}

export function loadTuViConfig() {
  if (cached) return cached;
  const career = readJson<Record<string, unknown>>("career_mapping.json");
  const domain = readJson<Record<string, unknown>>("domain_mapping.json");
  const saoNganh = readJson<TuViSaoNganhConfig>("tu_vi_sao_nganh.json");
  cached = {
    careerTV: {
      tam_hop_archetype: (career.tam_hop_archetype ?? {}) as CareerTuViConfig["tam_hop_archetype"],
      tam_hop_phu_cach: (career.tam_hop_phu_cach ?? {}) as CareerTuViConfig["tam_hop_phu_cach"],
    },
    domainTV: {
      archetypes: (domain.archetypes ?? {}) as DomainTuViConfig["archetypes"],
      tam_hop_phu_cach: (domain.tam_hop_phu_cach ?? {}) as DomainTuViConfig["tam_hop_phu_cach"],
    },
    saoNganh,
  };
  return cached;
}
