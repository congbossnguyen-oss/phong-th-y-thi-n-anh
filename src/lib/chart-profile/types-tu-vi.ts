/**
 * Hồ sơ lá số TỬ VI (`tu_vi_profile`) — khối thứ hai của engine chung, song song `BatTuProfile`.
 * Schema theo handoff/docs/module-nghe-tu-vi.md mục 2.
 *
 * Chia rõ 2 loại trường (giống Bát Tự):
 *  - FACTS thuần code từ engine an sao sẵn có (`src/lib/tu-vi/engine.ts` → `tinhTuVi`): Mệnh/Thân/
 *    Cục, chính tinh + đắc/hãm ở từng cung, Vô Chính Diệu, Tuần/Triệt, khung tuổi Đại Hạn.
 *  - LUẬN do LLM điền (menh_cach archetype + phụ cách, đánh giá cát/hung cung, chủ đề đại hạn) —
 *    CHƯA có ANTHROPIC_API_KEY thì trả `insufficient_data`, KHÔNG bịa.
 */
import type { Gender, Insufficient } from "./types";

export type DacHam = "mieu" | "vuong" | "dac" | "binh" | "ham" | Insufficient;

/** Khoá chính tinh — khớp `tu_vi_sao_nganh.json.chinh_tinh_to_domain`. */
export type ChinhTinhKey =
  | "tu_vi" | "thien_co" | "thai_duong" | "vu_khuc" | "thien_dong" | "liem_trinh" | "thien_phu"
  | "thai_am" | "tham_lang" | "cu_mon" | "thien_tuong" | "thien_luong" | "that_sat" | "pha_quan";

/** Khoá archetype Tam Hợp — khớp `career_mapping.json._contract.archetype_keys`. */
export type ArchetypeKey = "tu_phu_vu_tuong" | "sat_pha_liem_tham" | "co_nguyet_dong_luong";
/** Khoá 6 cách phụ Tam Hợp — khớp `career_mapping.json._contract.phu_cach_keys`. */
export type PhuCachKey =
  | "cu_nhat" | "cu_co_mao_dau" | "tham_vu_dong_hanh" | "tang_ho_thu_menh" | "van_tinh_am_cung" | "dich_ma";

export interface SaoTrongCung {
  ten: ChinhTinhKey;
  ten_hien_thi: string;
  dac_ham: DacHam;
}

export interface TuViFacts {
  gioiTinh: Gender;
  duongLich: string;
  amDuongMenh: string; // "Dương Nam" | "Âm Nữ"...
  menhChi: string;
  thanChi: string;
  cuc: string; // vd "Thổ Ngũ Cục"
  banMenhNapAm: string;
  /** Chính tinh + đắc/hãm ở 4 cung quan trọng cho nghề (từ engine an sao — SỰ THẬT). */
  sao_theo_cung: {
    menh: SaoTrongCung[];
    quan_loc: SaoTrongCung[];
    tai_bach: SaoTrongCung[];
    thien_di: SaoTrongCung[];
  };
  menhVoChinhDieu: boolean;
  quanLocVoChinhDieu: boolean;
  tuanTrietCung: string[]; // các cung bị Tuần/Triệt (tên Chi)
  /** Khung tuổi 10 Đại Hạn (từ engine — SỰ THẬT). Chủ đề mỗi hạn do LLM điền ở tầng luận. */
  daiHan: { tuTuoi: number; denTuoi: number; cungChi: string; cungName: string }[];
  canhBaoKyThuat: string[];
}

export interface MenhCachLuanGiai {
  chinh: ArchetypeKey | Insufficient;
  phu: PhuCachKey[];
  vo_chinh_dieu: boolean;
  muon_cach_cung_di: boolean;
  do_sang: "mieu_vuong" | "binh" | "ham" | Insufficient;
  source: "luan-giai-tu-vi-nam-phai";
}

export interface DaiHanLuanGiai {
  tuTuoi: number;
  denTuoi: number;
  cungChi: string;
  cungName: string;
  chuDe: string | Insufficient;
  mucThuan: "cao" | "trung_binh" | "thap" | Insufficient;
}

export interface TuViProfile {
  meta: { gioi_tinh: Gender; duong_lich: string; am_duong_menh: string; cache_key: string };
  menh_than_cuc: { menh_cung: string; than_cung: string; cuc: string };
  facts: TuViFacts;
  menh_cach: MenhCachLuanGiai;
  danh_gia_cung: {
    quan_loc: "cat" | "binh" | "hung" | Insufficient;
    tai_bach: "cat" | "binh" | "hung" | Insufficient;
    thien_di: "cat" | "binh" | "hung" | Insufficient;
    phuc_duc: "cat" | "binh" | "hung" | Insufficient;
  };
  dai_han: DaiHanLuanGiai[];
  warnings: string[];
  ai_luan_giai_thanh_cong: boolean;
  model?: string;
  generatedAt: string;
}
