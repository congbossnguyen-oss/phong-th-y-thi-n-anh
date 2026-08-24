/**
 * Nạp các phần config cần cho MODULE NGHỀ THEO TỬ VI — đọc từ FILE trong `/handoff/config`, KHÔNG
 * hard-code. Dùng lại `career_mapping.json` (tam_hop_archetype + tam_hop_phu_cach) và
 * `domain_mapping.json` (archetypes + tam_hop_phu_cach) — đã có sẵn, và file MỚI
 * `tu_vi_sao_nganh.json` (chính tinh → ngành).
 *
 * ⚠️ MIGRATION Cloudflare Workers (24/8/2026, nhánh cloudflare-migration): đổi từ readFileSync lúc
 * runtime sang import JSON tĩnh (bundled lúc build) — Workers không có filesystem. Đúng 3 file cũ,
 * đúng nội dung.
 */
import careerMappingJson from "../../../handoff/config/career_mapping.json";
import domainMappingJson from "../../../handoff/config/domain_mapping.json";
import tuViSaoNganhJson from "../../../handoff/config/tu_vi_sao_nganh.json";

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

export function loadTuViConfig() {
  if (cached) return cached;
  const career = careerMappingJson as Record<string, unknown>;
  const domain = domainMappingJson as Record<string, unknown>;
  const saoNganh = tuViSaoNganhJson as TuViSaoNganhConfig;
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
