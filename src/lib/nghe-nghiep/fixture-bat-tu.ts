/**
 * ⚠️ FIXTURE TEST — hồ sơ Bát Tự MẪU dùng để tự kiểm module tính toán (Phase 2) và giao diện
 * (Phase 4) khi CHƯA cấu hình ANTHROPIC_API_KEY. Facts (Tứ Trụ/Đại Vận/Thần Sát...) là THẬT, lấy
 * nguyên từ `getBatTuProfile()` cho ngày 14/3/1996 09:20 (Nam) — nhưng phần luận giải
 * (vuong_suy/dung_than/hy_than/cach_cuc/manh_phai/dai_van[].dungHy|chuDe|mucThuan) là GIÁ TRỊ GIẢ
 * ĐỊNH tự điền để test, KHÔNG PHẢI kết quả AI thật.
 *
 * KHÔNG dùng file này cho khách thật. Khi đã có ANTHROPIC_API_KEY, trang thật phải gọi
 * `getBatTuProfile()` sống theo ngày giờ sinh khách nhập, không phải import fixture này.
 */
import type { BatTuProfile } from "../chart-profile";

export const SAMPLE_BAT_TU_PROFILE: BatTuProfile = {
  meta: { gioi_tinh: "Nam", duong_lich: "1996-03-14T09:20", cache_key: "48347aa5147a2676" },
  tu_tru: { nam: "Bính Tý", thang: "Tân Mão", ngay: "Canh Tuất", gio: "Tân Tỵ" },
  facts: {
    gioiTinh: "Nam",
    duongLich: "1996-03-14T09:20",
    tuTru: {
      nam: {
        can: "Bính", chi: "Tý", napAm: "Giản Hạ Thủy", napAmNguHanh: "thuy",
        tangCan: [{ can: "Quý", thapThan: "Thương Quan" }], thapThan: "Thất Sát", truongSinh: "Tử",
      },
      thang: {
        can: "Tân", chi: "Mão", napAm: "Tùng Bách Mộc", napAmNguHanh: "moc",
        tangCan: [{ can: "Ất", thapThan: "Chính Tài" }], thapThan: "Kiếp Tài", truongSinh: "Thai",
      },
      ngay: {
        can: "Canh", chi: "Tuất", napAm: "Thoa Xuyến Kim", napAmNguHanh: "kim",
        tangCan: [
          { can: "Mậu", thapThan: "Thiên Ấn" },
          { can: "Tân", thapThan: "Kiếp Tài" },
          { can: "Đinh", thapThan: "Chính Quan" },
        ],
        thapThan: "Nhật Chủ", truongSinh: "Suy",
      },
      gio: {
        can: "Tân", chi: "Tỵ", napAm: "Bạch Lạp Kim", napAmNguHanh: "kim",
        tangCan: [
          { can: "Bính", thapThan: "Thất Sát" },
          { can: "Mậu", thapThan: "Thiên Ấn" },
          { can: "Canh", thapThan: "Nhật Chủ" },
        ],
        thapThan: "Kiếp Tài", truongSinh: "Trường Sinh",
      },
    },
    nhatChu: { can: "Canh", nguHanh: "kim", amDuong: "Dương" },
    daiVanThuanNghich: "thuận",
    daiVan: [
      { can: "Nhâm", chi: "Thìn", canNguHanh: "thuy", tuTuoi: 8, denTuoi: 17 },
      { can: "Quý", chi: "Tỵ", canNguHanh: "thuy", tuTuoi: 18, denTuoi: 27 },
      { can: "Giáp", chi: "Ngọ", canNguHanh: "moc", tuTuoi: 28, denTuoi: 37 },
      { can: "Ất", chi: "Mùi", canNguHanh: "moc", tuTuoi: 38, denTuoi: 47 },
      { can: "Bính", chi: "Thân", canNguHanh: "hoa", tuTuoi: 48, denTuoi: 57 },
      { can: "Đinh", chi: "Dậu", canNguHanh: "hoa", tuTuoi: 58, denTuoi: 67 },
      { can: "Mậu", chi: "Tuất", canNguHanh: "tho", tuTuoi: 68, denTuoi: 77 },
      { can: "Kỷ", chi: "Hợi", canNguHanh: "tho", tuTuoi: 78, denTuoi: 87 },
      { can: "Canh", chi: "Tý", canNguHanh: "kim", tuTuoi: 88, denTuoi: 97 },
      { can: "Tân", chi: "Sửu", canNguHanh: "kim", tuTuoi: 98, denTuoi: 107 },
    ],
    menhCung: { can: "Đinh", chi: "Dậu" },
    thaiNguyen: { can: "Nhâm", chi: "Ngọ" },
    nienKhong: "Thân - Dậu",
    nhatKhong: "Dần - Mão",
    thanSat: {
      nam: ["Tai Sát", "Cách Góc"],
      thang: ["Thái Cực (năm)", "Hồng Loan", "Câu Sát", "Đào Hoa"],
      ngay: ["Hoa Cái", "Kim Dư", "Khôi Cương", "Quả Tú", "Điếu Khách", "Huyết Nhẫn"],
      gio: ["Kiếp Sát (năm)", "Vong Thần"],
    },
    canhBaoKyThuat: [],
  },
  bat_tu: {
    vuong_suy: "vuong",
    dung_than: "thuy",
    hy_than: "moc",
    ky_than: "tho",
    cach_cuc: ["thuc_thuong_sinh_tai"],
    thap_than_noi_bat: ["Thực Thần", "Chính Tài"],
    source: "luan-giai-bat-tu",
    nhat_chu: "Canh",
    ngu_hanh_nhat_chu: "kim",
  },
  manh_phai: {
    the: "vuong",
    to_cong: "Nhật chủ Canh vượng, dùng Thủy tiết tú rồi sinh Mộc — dòng chảy thuận, tài năng bộc lộ qua kỹ năng/sáng tạo sinh tài.",
    cau_truc: "thuc_than_sinh_tai",
    chinh_phan_cuc: "phan_cuc",
    hieu_suat: { co_che: "xung", muc: "cao", he_so: 1 },
    source: "luan-giai-bat-tu-manh-phai",
  },
  dai_van: [
    { tuTuoi: 8, denTuoi: 17, can_chi: "Nhâm Thìn", ngu_hanh: "thuy", dungHy: "dung", chuDe: "hoc_tap", mucThuan: "cao" },
    { tuTuoi: 18, denTuoi: 27, can_chi: "Quý Tỵ", ngu_hanh: "thuy", dungHy: "dung", chuDe: "hoc_tap", mucThuan: "cao" },
    { tuTuoi: 28, denTuoi: 37, can_chi: "Giáp Ngọ", ngu_hanh: "moc", dungHy: "hy", chuDe: "su_nghiep", mucThuan: "trung_binh" },
    { tuTuoi: 38, denTuoi: 47, can_chi: "Ất Mùi", ngu_hanh: "moc", dungHy: "hy", chuDe: "tai_van", mucThuan: "trung_binh" },
    { tuTuoi: 48, denTuoi: 57, can_chi: "Bính Thân", ngu_hanh: "hoa", dungHy: "trung", chuDe: "su_nghiep", mucThuan: "trung_binh" },
    { tuTuoi: 58, denTuoi: 67, can_chi: "Đinh Dậu", ngu_hanh: "hoa", dungHy: "trung", chuDe: "tai_van", mucThuan: "trung_binh" },
    { tuTuoi: 68, denTuoi: 77, can_chi: "Mậu Tuất", ngu_hanh: "tho", dungHy: "ky", chuDe: "suc_khoe", mucThuan: "thap" },
    { tuTuoi: 78, denTuoi: 87, can_chi: "Kỷ Hợi", ngu_hanh: "tho", dungHy: "ky", chuDe: "suc_khoe", mucThuan: "thap" },
    { tuTuoi: 88, denTuoi: 97, can_chi: "Canh Tý", ngu_hanh: "kim", dungHy: "trung", chuDe: "suc_khoe", mucThuan: "trung_binh" },
    { tuTuoi: 98, denTuoi: 107, can_chi: "Tân Sửu", ngu_hanh: "kim", dungHy: "trung", chuDe: "suc_khoe", mucThuan: "trung_binh" },
  ],
  warnings: [],
  ai_luan_giai_thanh_cong: true,
  model: "FIXTURE-TEST (không phải AI thật)",
  generatedAt: "2026-08-19T13:18:08.037Z",
};
