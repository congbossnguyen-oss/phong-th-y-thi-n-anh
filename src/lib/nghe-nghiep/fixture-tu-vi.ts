/**
 * ⚠️ FIXTURE TEST — hồ sơ TỬ VI mẫu. FACTS (an sao 12 cung, chính tinh, đắc/hãm, Đại Hạn) là THẬT,
 * lấy từ `castTuViFacts()` (engine sẵn có) cho ngày 14/3/1996 09:20 (Nam). Phần LUẬN (archetype mệnh
 * cách, đánh giá cát/hung cung, chủ đề Đại Hạn) là GIÁ TRỊ GIẢ ĐỊNH tự điền để test/hiển thị giao
 * diện — KHÔNG PHẢI kết quả AI thật.
 *
 * Cùng người với fixture Bát Tự (14/3/1996 09:20 Nam) để phần Kết hợp so được 2 hệ trên 1 lá số.
 */
import { castTuViFacts } from "../chart-profile/cast-tu-vi";
import type { TuViProfile } from "../chart-profile/types-tu-vi";

export function getSampleTuViProfile(): TuViProfile {
  const { facts } = castTuViFacts({ day: 14, month: 3, year: 1996, hour: 9, gender: "Nam" });
  return {
    meta: { gioi_tinh: "Nam", duong_lich: facts.duongLich, am_duong_menh: facts.amDuongMenh, cache_key: "tuvi-fixture" },
    menh_than_cuc: { menh_cung: facts.menhChi, than_cung: facts.thanChi, cuc: facts.cuc },
    facts,
    // Mệnh có Vũ Khúc (nhóm Tử Phủ Vũ Tướng) → archetype giả định tu_phu_vu_tuong; phụ cách Tham Vũ.
    menh_cach: {
      chinh: "tu_phu_vu_tuong",
      phu: ["tham_vu_dong_hanh"],
      vo_chinh_dieu: false,
      muon_cach_cung_di: false,
      do_sang: "mieu_vuong",
      source: "luan-giai-tu-vi-nam-phai",
    },
    danh_gia_cung: { quan_loc: "cat", tai_bach: "binh", thien_di: "binh", phuc_duc: "cat" },
    dai_han: facts.daiHan.map((dh, i) => ({
      ...dh,
      chuDe: i < 2 ? "hoc_tap" : i < 5 ? "su_nghiep" : i < 7 ? "tai_van" : "suc_khoe",
      mucThuan: i < 5 ? "cao" : "trung_binh",
    })),
    warnings: [],
    ai_luan_giai_thanh_cong: true,
    model: "FIXTURE-TEST (không phải AI thật)",
    generatedAt: new Date().toISOString(),
  };
}
