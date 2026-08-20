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
import { chayEngineBatTu, suyDaiVanDuPhong, type EngineBatTu } from "./bat-tu-engine-adapter";
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

  // ENGINE dứt khoát (không cần AI): vượng suy + Dụng/Hỷ/Kỵ Thần + Thập Thần nổi bật. Lấp phần
  // trước đây phụ thuộc AI (hay "insufficient"). AI chỉ còn lo Manh Phái + cách cục + Đại Vận.
  let engine: EngineBatTu | null = null;
  try {
    engine = chayEngineBatTu(facts);
  } catch (err) {
    console.error("[bat-tu-engine] Lỗi tính vượng suy/dụng thần:", err);
  }
  const batTuEngineFields = engine
    ? {
        vuong_suy: engine.vuong_suy as BatTuLuanGiai["vuong_suy"],
        dung_than: engine.dung_than as BatTuLuanGiai["dung_than"],
        hy_than: engine.hy_than as BatTuLuanGiai["hy_than"],
        ky_than: engine.ky_than as BatTuLuanGiai["ky_than"],
        thap_than_noi_bat: engine.thap_than_noi_bat,
      }
    : {};

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
      ...batTuEngineFields,
    },
    manh_phai: INSUFFICIENT_MANH_PHAI,
    dai_van: facts.daiVan.map((dv) => {
      // Có engine (Dụng/Hỷ/Kỵ/Cừu dứt khoát) → suy luôn dungHy/chuDe/mucThuan mỗi Đại Vận, không
      // chờ AI — timeline không bao giờ trống toàn bộ, kể cả khi chưa cấu hình AI.
      const dp = engine ? suyDaiVanDuPhong(dv.canNguHanh, engine.dung_than, engine.hy_than, engine.ky_than, engine.cuu_than, dv.tuTuoi) : null;
      return {
        tuTuoi: dv.tuTuoi,
        denTuoi: dv.denTuoi,
        can_chi: `${dv.can} ${dv.chi}`,
        ngu_hanh: dv.canNguHanh,
        dungHy: dp?.dungHy ?? "insufficient_data",
        chuDe: dp?.chuDe ?? "insufficient_data",
        mucThuan: dp?.mucThuan ?? "insufficient_data",
      };
    }),
    warnings: [...facts.canhBaoKyThuat],
    ai_luan_giai_thanh_cong: false,
    generatedAt,
  };

  if (!isAiConfigured()) {
    baseProfile.warnings.push(
      "Chưa cấu hình ANTHROPIC_API_KEY — vượng suy/Dụng Thần/Thập Thần đã tính bằng engine (thuần code); " +
        "riêng cơ chế Manh Phái + cách cục cần AI nên tạm để trống.",
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
      // Vượng suy + Dụng/Hỷ/Kỵ Thần: ưu tiên ENGINE (dứt khoát); chỉ dùng AI khi engine lỗi.
      vuong_suy: (engine?.vuong_suy ?? output.bat_tu.vuong_suy) as BatTuLuanGiai["vuong_suy"],
      dung_than: (engine?.dung_than ?? output.bat_tu.dung_than) as BatTuLuanGiai["dung_than"],
      hy_than: (engine?.hy_than ?? output.bat_tu.hy_than) as BatTuLuanGiai["hy_than"],
      ky_than: (engine?.ky_than ?? output.bat_tu.ky_than) as BatTuLuanGiai["ky_than"],
      cach_cuc: output.bat_tu.cach_cuc,
      thap_than_noi_bat: engine?.thap_than_noi_bat.length ? engine.thap_than_noi_bat : output.bat_tu.thap_than_noi_bat,
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
    dai_van: facts.daiVan.map((dv, i) => {
      const o = output.dai_van[i];
      // AI để trống 1 Đại Vận nào đó → suy dự phòng bằng công thức (Ngũ Hành vận so với Dụng/Hỷ/Kỵ/Cừu
      // đã có), timeline không bao giờ hiện "đang cập nhật" tràn lan.
      const dp = (!o || o.dungHy === "insufficient_data" || o.chuDe === "insufficient_data" || o.mucThuan === "insufficient_data") && engine
        ? suyDaiVanDuPhong(dv.canNguHanh, engine.dung_than, engine.hy_than, engine.ky_than, engine.cuu_than, dv.tuTuoi)
        : null;
      return {
        tuTuoi: dv.tuTuoi,
        denTuoi: dv.denTuoi,
        can_chi: `${dv.can} ${dv.chi}`,
        ngu_hanh: dv.canNguHanh,
        dungHy: (o?.dungHy !== "insufficient_data" && o?.dungHy ? o.dungHy : dp?.dungHy ?? "insufficient_data") as DaiVanLuanGiai["dungHy"],
        chuDe: (o?.chuDe !== "insufficient_data" && o?.chuDe ? o.chuDe : dp?.chuDe ?? "insufficient_data"),
        mucThuan: (o?.mucThuan !== "insufficient_data" && o?.mucThuan ? o.mucThuan : dp?.mucThuan ?? "insufficient_data") as DaiVanLuanGiai["mucThuan"],
      };
    }),
    warnings: [...facts.canhBaoKyThuat, ...output.warnings],
    ai_luan_giai_thanh_cong: true,
    model: output.model,
  };

  // Chỉ cache khi luận CÓ giá trị lõi (Dụng Thần). Nếu model trả rỗng bất thường thì KHÔNG cache
  // để lần xem sau tự gọi lại AI, tránh kẹt "Chưa xác định" vĩnh viễn cho lá số đó.
  if (profile.bat_tu.dung_than !== "insufficient_data") setCachedProfile(cacheKey, profile);
  return profile;
}
