/**
 * ENGINE CHUNG "chart-profile" — điểm vào duy nhất, đúng kiến trúc "bếp trung tâm" của
 * handoff/README-GIAO-CLAUDE-CODE.md: nhận ngày giờ sinh + giới tính, gọi engine lập lá số SẴN
 * CÓ (`../bat-tu.ts`, không viết lại), luận bằng LLM nạp `/handoff/knowledge`, trả về
 * `BatTuProfile` — "hợp đồng" duy nhất mà mọi module con (Nghề nghiệp, và sau này Tình duyên/
 * Sức khỏe...) đọc theo. Module con KHÔNG được tự luận huyền học, chỉ đọc profile này + config.
 *
 * ⚠️ PHẠM VI v1: chỉ Bát Tự. `tu_vi_profile` CHƯA triển khai (xem knowledge.ts để biết lý do kỹ
 * thuật — dung lượng 2 skill Tử Vi quá lớn để nhồi thẳng vào 1 prompt, cần chiến lược nạp tri
 * thức khác, để dành phase sau).
 */
import { castBatTuFacts, type CastBatTuInput } from "./cast-bat-tu";
import { buildBatTuSystemPrompt, buildBatTuUserPrompt } from "./prompt";
import { callBatTuLlm, isAiConfigured } from "./llm";
import { hashLaSo, getCachedProfile, setCachedProfile } from "./cache";
import type { BatTuProfile, BatTuLuanGiai, ManhPhaiLuanGiai, DaiVanLuanGiai } from "./types";

export type { BatTuProfile, BatTuFacts, BatTuLuanGiai, ManhPhaiLuanGiai, DaiVanLuanGiai, Gender, SourceTag } from "./types";
export { INSUFFICIENT_DATA } from "./types";
export { isAiConfigured } from "./llm";

const INSUFFICIENT_BAT_TU: Omit<BatTuLuanGiai, "nhat_chu" | "ngu_hanh_nhat_chu"> = {
  vuong_suy: "insufficient_data",
  dung_than: "insufficient_data",
  hy_than: "insufficient_data",
  ky_than: "insufficient_data",
  cach_cuc: [],
  thap_than_noi_bat: [],
  source: "luan-giai-bat-tu",
};

const INSUFFICIENT_MANH_PHAI: ManhPhaiLuanGiai = {
  the: "insufficient_data",
  to_cong: "insufficient_data",
  cau_truc: "insufficient_data",
  chinh_phan_cuc: "insufficient_data",
  hieu_suat: { co_che: "insufficient_data", muc: "insufficient_data", he_so: null },
  source: "luan-giai-bat-tu-manh-phai",
};

/**
 * Tra hệ số ĐỘ MẠNH từ `handoff/config/career_mapping.json.to_cong_strength_factor` — đọc từ
 * FILE, không hard-code (đúng ràng buộc handoff). Model không tự tính số này; chỉ chọn "muc"/"co_che".
 */
function traHeSoHieuSuat(coChe: string): number | null {
  const BANG: Record<string, number> = { xung: 1.0, hinh: 0.7, hai: 0.4 };
  return BANG[coChe] ?? null;
}

export async function getBatTuProfile(input: CastBatTuInput): Promise<BatTuProfile> {
  const { facts } = castBatTuFacts(input);
  const cacheKey = hashLaSo(input);

  const cached = getCachedProfile(cacheKey);
  if (cached) return cached;

  const generatedAt = new Date().toISOString();
  const tu_tru = {
    nam: `${facts.tuTru.nam.can} ${facts.tuTru.nam.chi}`,
    thang: `${facts.tuTru.thang.can} ${facts.tuTru.thang.chi}`,
    ngay: `${facts.tuTru.ngay.can} ${facts.tuTru.ngay.chi}`,
    gio: `${facts.tuTru.gio.can} ${facts.tuTru.gio.chi}`,
  };

  const baseProfile: BatTuProfile = {
    meta: { gioi_tinh: facts.gioiTinh, duong_lich: facts.duongLich, cache_key: cacheKey },
    tu_tru,
    facts,
    bat_tu: {
      ...INSUFFICIENT_BAT_TU,
      nhat_chu: facts.nhatChu.can,
      ngu_hanh_nhat_chu: facts.nhatChu.nguHanh,
    },
    manh_phai: INSUFFICIENT_MANH_PHAI,
    dai_van: facts.daiVan.map((dv) => ({
      tuTuoi: dv.tuTuoi,
      denTuoi: dv.denTuoi,
      can_chi: `${dv.can} ${dv.chi}`,
      ngu_hanh: dv.canNguHanh,
      dungHy: "insufficient_data",
      chuDe: "insufficient_data",
      mucThuan: "insufficient_data",
    })),
    warnings: [...facts.canhBaoKyThuat],
    ai_luan_giai_thanh_cong: false,
    generatedAt,
  };

  if (!isAiConfigured()) {
    baseProfile.warnings.push(
      "Chưa cấu hình ANTHROPIC_API_KEY — mới trả được Tứ Trụ/Đại Vận (thuần code từ engine sẵn có), " +
        "chưa luận giải được vượng suy/dụng thần/cách cục/Manh Phái.",
    );
    return baseProfile;
  }

  const systemPrompt = buildBatTuSystemPrompt();
  const userPrompt = buildBatTuUserPrompt(facts);
  const result = await callBatTuLlm(systemPrompt, userPrompt, facts.daiVan.length);

  if (!result.ok) {
    baseProfile.warnings.push(`Gọi AI luận giải thất bại (${result.reason}): ${result.detail}`);
    return baseProfile;
  }

  const { output } = result;
  const heSo = traHeSoHieuSuat(output.manh_phai.hieu_suat.co_che);

  const profile: BatTuProfile = {
    ...baseProfile,
    bat_tu: {
      nhat_chu: facts.nhatChu.can,
      ngu_hanh_nhat_chu: facts.nhatChu.nguHanh,
      vuong_suy: output.bat_tu.vuong_suy as BatTuLuanGiai["vuong_suy"],
      dung_than: output.bat_tu.dung_than as BatTuLuanGiai["dung_than"],
      hy_than: output.bat_tu.hy_than as BatTuLuanGiai["hy_than"],
      ky_than: output.bat_tu.ky_than as BatTuLuanGiai["ky_than"],
      cach_cuc: output.bat_tu.cach_cuc,
      thap_than_noi_bat: output.bat_tu.thap_than_noi_bat,
      source: "luan-giai-bat-tu",
    },
    manh_phai: {
      the: output.manh_phai.the,
      to_cong: output.manh_phai.to_cong,
      cau_truc: output.manh_phai.cau_truc,
      chinh_phan_cuc: output.manh_phai.chinh_phan_cuc,
      hieu_suat: { ...output.manh_phai.hieu_suat, he_so: heSo },
      source: "luan-giai-bat-tu-manh-phai",
    },
    dai_van: facts.daiVan.map((dv, i) => ({
      tuTuoi: dv.tuTuoi,
      denTuoi: dv.denTuoi,
      can_chi: `${dv.can} ${dv.chi}`,
      ngu_hanh: dv.canNguHanh,
      dungHy: (output.dai_van[i]?.dungHy ?? "insufficient_data") as DaiVanLuanGiai["dungHy"],
      chuDe: output.dai_van[i]?.chuDe ?? "insufficient_data",
      mucThuan: (output.dai_van[i]?.mucThuan ?? "insufficient_data") as DaiVanLuanGiai["mucThuan"],
    })),
    warnings: [...facts.canhBaoKyThuat, ...output.warnings],
    ai_luan_giai_thanh_cong: true,
    model: output.model,
  };

  // Chỉ cache khi luận CÓ giá trị lõi (Dụng Thần). Nếu model trả rỗng bất thường thì KHÔNG cache
  // để lần xem sau tự gọi lại AI, tránh kẹt "Chưa xác định" vĩnh viễn cho lá số đó.
  if (profile.bat_tu.dung_than !== "insufficient_data") setCachedProfile(cacheKey, profile);
  return profile;
}
