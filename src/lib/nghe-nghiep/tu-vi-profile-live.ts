/**
 * Dựng `TuViProfile` LIVE từ ngày giờ sinh — dùng cho luồng dịch vụ thật (thay `fixture-tu-vi.ts`).
 *
 * ⚠️ PHÂN TẦNG NGUỒN (đúng ràng buộc handoff "không tự bịa huyền học"):
 *  - FACTS (an sao 12 cung, chính tinh, đắc/hãm, Đại Hạn): THẬT, từ `castTuViFacts()` (engine sẵn có).
 *  - Mệnh cách + đánh giá cát/hung cung + chủ đề Đại Hạn ở đây là mức NỀN SƠ BỘ, suy máy móc từ
 *    facts (phân nhóm Tam Hợp theo chính tinh Mệnh, đắc/hãm → cát/hung). KHÔNG phải luận AI.
 *
 * Đợt 2 (khi có ANTHROPIC_API_KEY): thay hàm này bằng "AI gọn + trích tài liệu" — nạp phần
 * mệnh-cách/nghề trích từ knowledge Tử Vi cho LLM để luận đúng tài liệu, có phụ cách + muốn cách.
 */
import { castTuViFacts, type CastTuViInput } from "../chart-profile/cast-tu-vi";
import type { TuViProfile, SaoTrongCung, DacHam, ArchetypeKey } from "../chart-profile/types-tu-vi";

// Phân nhóm Tam Hợp của 14 chính tinh — phân loại theo SÁCH (sự thật phân nhóm, không phải luận).
// Thái Dương / Cự Môn (bộ Cự Nhật) không nằm trong 3 archetype nền của config → để insufficient.
const ARCHETYPE_MEMBER: Record<ArchetypeKey, string[]> = {
  tu_phu_vu_tuong: ["tu_vi", "thien_phu", "vu_khuc", "thien_tuong"],
  sat_pha_liem_tham: ["that_sat", "pha_quan", "tham_lang", "liem_trinh"],
  co_nguyet_dong_luong: ["thien_co", "thai_am", "thien_dong", "thien_luong"],
};

/** Chọn archetype nền theo chính tinh Mệnh: nhóm nào có nhiều sao Mệnh nhất. Không rõ → insufficient. */
function suyArchetype(saoMenh: SaoTrongCung[]): ArchetypeKey | "insufficient_data" {
  const keys = saoMenh.map((s) => s.ten);
  let best: ArchetypeKey | "insufficient_data" = "insufficient_data";
  let bestCount = 0;
  for (const arche of Object.keys(ARCHETYPE_MEMBER) as ArchetypeKey[]) {
    const n = keys.filter((k) => ARCHETYPE_MEMBER[arche].includes(k)).length;
    if (n > bestCount) {
      bestCount = n;
      best = arche;
    }
  }
  return best;
}

const RANK: Record<string, number> = { mieu: 5, vuong: 4, dac: 3, binh: 2, ham: 1 };

/** Đắc/hãm TỐT NHẤT trong một cung → xếp sơ bộ cát/bình/hung. Cung Vô Chính Diệu coi là "bình". */
function xepCatHung(sao: SaoTrongCung[]): "cat" | "binh" | "hung" {
  if (sao.length === 0) return "binh";
  const top = Math.max(...sao.map((s) => RANK[s.dac_ham] ?? 0));
  if (top >= 3) return "cat"; // miếu/vượng/đắc
  if (top === 2) return "binh";
  return "hung"; // hãm
}

function doSang(saoMenh: SaoTrongCung[]): "mieu_vuong" | "binh" | "ham" | "insufficient_data" {
  if (saoMenh.length === 0) return "insufficient_data";
  const top = Math.max(...saoMenh.map((s) => RANK[s.dac_ham as DacHam] ?? 0));
  if (top >= 4) return "mieu_vuong";
  if (top >= 2) return "binh";
  return "ham";
}

export function getTuViProfileLive(input: CastTuViInput): TuViProfile {
  const { facts } = castTuViFacts(input);
  const archetype = suyArchetype(facts.sao_theo_cung.menh);

  return {
    meta: { gioi_tinh: facts.gioiTinh, duong_lich: facts.duongLich, am_duong_menh: facts.amDuongMenh, cache_key: `tuvi-live-${input.day}-${input.month}-${input.year}-${input.hour}-${input.gender}` },
    menh_than_cuc: { menh_cung: facts.menhChi, than_cung: facts.thanChi, cuc: facts.cuc },
    facts,
    menh_cach: {
      chinh: archetype,
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
      phuc_duc: "binh", // Phúc Đức không nằm trong 4 cung facts → để bình, AI bổ sung ở Đợt 2.
    },
    // Chủ đề Đại Hạn theo dải tuổi (nền chung — AI sẽ luận riêng ở Đợt 2). mucThuan để trung bình.
    dai_han: facts.daiHan.map((dh) => ({
      ...dh,
      chuDe: dh.tuTuoi < 22 ? "hoc_tap" : dh.tuTuoi < 52 ? "su_nghiep" : dh.tuTuoi < 62 ? "tai_van" : "suc_khoe",
      mucThuan: "trung_binh" as const,
    })),
    warnings: ["Phần luận Tử Vi đang ở mức NỀN SƠ BỘ (suy máy móc từ facts). Luận sâu (mệnh cách chuẩn tài liệu, phụ cách, cát/hung từng cung) sẽ bật khi cấu hình AI — Đợt 2."],
    ai_luan_giai_thanh_cong: false,
    model: "NEN-SO-BO (chưa phải AI)",
    generatedAt: new Date().toISOString(),
  };
}
