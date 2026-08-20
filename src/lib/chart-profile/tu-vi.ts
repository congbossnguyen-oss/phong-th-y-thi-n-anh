/**
 * getTuViProfile — điểm vào TỬ VI cho engine chung. An sao THẬT (castTuViFacts) rồi:
 *  - Có ANTHROPIC_API_KEY → gọi AI (knowledge gọn) luận mệnh cách + cát/hung cung + chủ đề Đại Hạn.
 *  - Không có key / AI lỗi → NỀN SƠ BỘ suy máy móc từ facts (đắc/hãm, phân nhóm Tam Hợp chính tinh Mệnh).
 * Archetype: ưu tiên AI; AI để trống thì lấy phân nhóm Tam Hợp làm sàn (hiếm khi rỗng).
 */
import { castTuViFacts, type CastTuViInput } from "./cast-tu-vi";
import { buildTuViSystemPrompt, buildTuViUserPrompt } from "./prompt-tu-vi";
import { callTuViLlm, isTuViAiConfigured } from "./llm-tu-vi";
import type { TuViProfile, TuViFacts, SaoTrongCung, DacHam, ArchetypeKey, PhuCachKey } from "./types-tu-vi";

export { isTuViAiConfigured } from "./llm-tu-vi";
export type { TuViProfile } from "./types-tu-vi";

// --- Phân nhóm Tam Hợp 14 chính tinh (phân loại theo sách — sự thật, không phải luận) ---
const ARCHETYPE_MEMBER: Record<ArchetypeKey, string[]> = {
  tu_phu_vu_tuong: ["tu_vi", "thien_phu", "vu_khuc", "thien_tuong"],
  sat_pha_liem_tham: ["that_sat", "pha_quan", "tham_lang", "liem_trinh"],
  co_nguyet_dong_luong: ["thien_co", "thai_am", "thien_dong", "thien_luong"],
};
const RANK: Record<string, number> = { mieu: 5, vuong: 4, dac: 3, binh: 2, ham: 1 };

function suyArchetype(saoMenh: SaoTrongCung[]): ArchetypeKey | "insufficient_data" {
  const keys = saoMenh.map((s) => s.ten);
  let best: ArchetypeKey | "insufficient_data" = "insufficient_data";
  let bestCount = 0;
  for (const arche of Object.keys(ARCHETYPE_MEMBER) as ArchetypeKey[]) {
    const n = keys.filter((k) => ARCHETYPE_MEMBER[arche].includes(k)).length;
    if (n > bestCount) { bestCount = n; best = arche; }
  }
  return best;
}
function xepCatHung(sao: SaoTrongCung[]): "cat" | "binh" | "hung" {
  if (sao.length === 0) return "binh";
  const top = Math.max(...sao.map((s) => RANK[s.dac_ham] ?? 0));
  return top >= 3 ? "cat" : top === 2 ? "binh" : "hung";
}
function doSang(saoMenh: SaoTrongCung[]): "mieu_vuong" | "binh" | "ham" | "insufficient_data" {
  if (saoMenh.length === 0) return "insufficient_data";
  const top = Math.max(...saoMenh.map((s) => RANK[s.dac_ham as DacHam] ?? 0));
  return top >= 4 ? "mieu_vuong" : top >= 2 ? "binh" : "ham";
}

function meta(facts: TuViFacts, input: CastTuViInput) {
  return { gioi_tinh: facts.gioiTinh, duong_lich: facts.duongLich, am_duong_menh: facts.amDuongMenh, cache_key: `tuvi-${input.day}-${input.month}-${input.year}-${input.hour}-${input.gender}` };
}

/** NỀN SƠ BỘ (không AI) — suy máy móc từ facts. */
function fallbackProfile(facts: TuViFacts, input: CastTuViInput, lyDo: string): TuViProfile {
  return {
    meta: meta(facts, input),
    menh_than_cuc: { menh_cung: facts.menhChi, than_cung: facts.thanChi, cuc: facts.cuc },
    facts,
    menh_cach: {
      chinh: suyArchetype(facts.sao_theo_cung.menh),
      phu: [],
      vo_chinh_dieu: facts.menhVoChinhDieu,
      muon_cach_cung_di: false,
      do_sang: doSang(facts.sao_theo_cung.menh),
      source: "luan-giai-tu-vi-nam-phai",
    },
    danh_gia_cung: {
      quan_loc: xepCatHung(facts.sao_theo_cung.quan_loc),
      tai_bach: xepCatHung(facts.sao_theo_cung.tai_bach),
      thien_di: xepCatHung(facts.sao_theo_cung.thien_di),
      phuc_duc: "binh",
    },
    dai_han: facts.daiHan.map((dh) => ({
      ...dh,
      chuDe: dh.tuTuoi < 22 ? "hoc_tap" : dh.tuTuoi < 52 ? "su_nghiep" : dh.tuTuoi < 62 ? "tai_van" : "suc_khoe",
      mucThuan: "trung_binh" as const,
    })),
    warnings: [`Tử Vi ở mức NỀN SƠ BỘ (suy máy móc từ facts): ${lyDo}`],
    ai_luan_giai_thanh_cong: false,
    model: "NEN-SO-BO",
    generatedAt: new Date().toISOString(),
  };
}

const cache = new Map<string, TuViProfile>();

export async function getTuViProfile(input: CastTuViInput): Promise<TuViProfile> {
  const { facts } = castTuViFacts(input);
  const cacheKey = meta(facts, input).cache_key;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (!isTuViAiConfigured()) return fallbackProfile(facts, input, "chưa cấu hình ANTHROPIC_API_KEY.");

  const res = await callTuViLlm(buildTuViSystemPrompt(), buildTuViUserPrompt(facts), facts.daiHan.length);
  if (!res.ok) return fallbackProfile(facts, input, `gọi AI thất bại (${res.reason}): ${res.detail}`);

  const o = res.output;
  // Archetype: ưu tiên AI; AI để trống thì lấy phân nhóm Tam Hợp làm sàn.
  const archetype = (o.menh_cach.chinh !== "insufficient_data" ? o.menh_cach.chinh : suyArchetype(facts.sao_theo_cung.menh)) as ArchetypeKey | "insufficient_data";

  const profile: TuViProfile = {
    meta: meta(facts, input),
    menh_than_cuc: { menh_cung: facts.menhChi, than_cung: facts.thanChi, cuc: facts.cuc },
    facts,
    menh_cach: {
      chinh: archetype,
      phu: o.menh_cach.phu as PhuCachKey[],
      vo_chinh_dieu: o.menh_cach.vo_chinh_dieu,
      muon_cach_cung_di: o.menh_cach.muon_cach_cung_di,
      do_sang: o.menh_cach.do_sang as TuViProfile["menh_cach"]["do_sang"],
      source: "luan-giai-tu-vi-nam-phai",
    },
    danh_gia_cung: {
      quan_loc: o.danh_gia_cung.quan_loc as TuViProfile["danh_gia_cung"]["quan_loc"],
      tai_bach: o.danh_gia_cung.tai_bach as TuViProfile["danh_gia_cung"]["tai_bach"],
      thien_di: o.danh_gia_cung.thien_di as TuViProfile["danh_gia_cung"]["thien_di"],
      phuc_duc: o.danh_gia_cung.phuc_duc as TuViProfile["danh_gia_cung"]["phuc_duc"],
    },
    dai_han: facts.daiHan.map((dh, i) => ({
      ...dh,
      chuDe: o.dai_han[i]?.chuDe ?? "insufficient_data",
      mucThuan: (o.dai_han[i]?.mucThuan ?? "insufficient_data") as TuViProfile["dai_han"][number]["mucThuan"],
    })),
    warnings: o.warnings,
    ai_luan_giai_thanh_cong: true,
    model: o.model,
    generatedAt: new Date().toISOString(),
  };

  // Chỉ cache khi có archetype thật (tránh kẹt kết quả rỗng).
  if (profile.menh_cach.chinh !== "insufficient_data") cache.set(cacheKey, profile);
  return profile;
}
