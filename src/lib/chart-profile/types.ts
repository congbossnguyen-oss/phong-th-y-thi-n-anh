/**
 * ENGINE CHUNG "chart-profile" — kiểu dữ liệu dùng chung.
 *
 * Nguồn đặc tả: handoff/docs/module-nghe-bat-tu.md mục 2 (schema `bat_tu_profile`) và
 * handoff/docs/module-nghe-tu-vi.md mục 2 (schema `tu_vi_profile`, CHƯA triển khai ở v1 — xem
 * ghi chú trong index.ts). Đây là "hợp đồng" mọi module con (Nghề nghiệp, và sau này Tình duyên/
 * Sức khỏe...) đọc theo, KHÔNG được tự suy diễn ngoài các trường này.
 *
 * Nguyên tắc: mọi trường có thể tính thuần code (Tứ Trụ, Đại Vận, Tàng Can, Thập Thần...) do
 * `cast-bat-tu.ts` cung cấp làm SỰ THẬT bất biến; mọi trường cần LUẬN (vượng suy, dụng thần, cách
 * cục, tố công) do LLM điền dựa trên đúng sự thật đó + /handoff/knowledge — không được tự tính lại.
 */

export type Gender = "Nam" | "Nữ";

/** Nguồn của một kết luận — bắt buộc gắn cho mọi nhận định (handoff §"RÀNG BUỘC"). */
export type SourceTag = "SOURCE" | "THIEN_ANH_MODEL" | "SUPPORTING_INFERENCE";

/** Giá trị đặc biệt khi tài liệu /knowledge không đủ căn cứ để kết luận — KHÔNG được bịa thay vào. */
export const INSUFFICIENT_DATA = "insufficient_data" as const;
export type Insufficient = typeof INSUFFICIENT_DATA;

export type NguHanh = "kim" | "moc" | "thuy" | "hoa" | "tho";

// ---------------------------------------------------------------------------------------------
// Sự thật thuần code (từ `cast-bat-tu.ts`, gọi lại `tinhBatTu()` có sẵn — KHÔNG tính lại)
// ---------------------------------------------------------------------------------------------

export interface TruPillarFact {
  can: string;
  chi: string;
  napAm: string;
  napAmNguHanh: NguHanh;
  /** Tàng Can trong Chi trụ này, kèm Thập Thần so với Nhật Chủ — engine đã tính sẵn. */
  tangCan: { can: string; thapThan: string }[];
  /** Thập Thần của Can trụ này so với Nhật Chủ (trụ Ngày = "Nhật Chủ"). */
  thapThan: string;
  truongSinh?: string;
}

export interface DaiVanFact {
  can: string;
  chi: string;
  canNguHanh: NguHanh;
  tuTuoi: number;
  denTuoi: number;
}

export interface BatTuFacts {
  gioiTinh: Gender;
  duongLich: string; // ISO, vd "1996-03-14T09:20"
  tuTru: { nam: TruPillarFact; thang: TruPillarFact; ngay: TruPillarFact; gio: TruPillarFact };
  nhatChu: { can: string; nguHanh: NguHanh; amDuong: "Dương" | "Âm" };
  daiVanThuanNghich: "thuận" | "nghịch";
  daiVan: DaiVanFact[];
  menhCung: { can: string; chi: string };
  thaiNguyen: { can: string; chi: string };
  nienKhong: string;
  nhatKhong: string;
  /** Thần Sát engine sẵn có đã tra được cho từng trụ (nếu có), theo đúng tên trong `bat-tu.ts`. */
  thanSat: { nam: string[]; thang: string[]; ngay: string[]; gio: string[] };
  /** Cảnh báo kỹ thuật từ tầng lập lá số (vd giờ sinh gần ranh giới tiết khí) — KHÔNG phải luận giải. */
  canhBaoKyThuat: string[];
}

// ---------------------------------------------------------------------------------------------
// Hồ sơ luận giải Bát Tự — phần LLM điền (theo schema handoff/docs/module-nghe-bat-tu.md §2)
// ---------------------------------------------------------------------------------------------

export type VuongSuy =
  | "cuc_cuong" | "cuong_vuong" | "vuong" | "trung_hoa" | "suy" | "nhuoc" | "cuc_nhuoc"
  | Insufficient;

/** Khoá cơ chế Manh Phái — PHẢI khớp `career_mapping.json._contract.mechanism_keys`. */
export type ManhPhaiMechanismKey =
  | "thuc_thuong_che_quan_sat" | "tai_che_an" | "quan_sat_che_ty_kiep" | "an_che_thuc_thuong"
  | "ty_kiep_che_tai" | "hoa_quan_sat_sinh_an" | "thuc_than_sinh_tai" | "thuong_quan_sinh_tai"
  | "hop_dung" | "che_mo_kho";

export interface BatTuLuanGiai {
  nhat_chu: string;
  ngu_hanh_nhat_chu: NguHanh;
  vuong_suy: VuongSuy;
  dung_than: NguHanh | Insufficient;
  hy_than: NguHanh | Insufficient;
  ky_than: NguHanh | Insufficient;
  /** 1 hoặc nhiều trong 10 Cách Cục Tài Quan biến hoá (Manh Phái không dùng khái niệm này — đây
   *  là 10 cách cục của skill `luan-giai-bat-tu`, khác `manh_phai.cau_truc`). */
  cach_cuc: string[];
  thap_than_noi_bat: string[];
  source: "luan-giai-bat-tu";
}

export interface ManhPhaiLuanGiai {
  the: "vuong" | "nhuoc" | Insufficient;
  to_cong: string | Insufficient;
  /** PHẢI là 1 trong `ManhPhaiMechanismKey` (khớp career_mapping.json) hoặc insufficient_data. */
  cau_truc: ManhPhaiMechanismKey | Insufficient;
  chinh_phan_cuc: "chinh_cuc" | "phan_cuc" | Insufficient;
  hieu_suat: {
    co_che: "xung" | "hinh" | "hai" | Insufficient;
    muc: "cao" | "trung_binh" | "thap" | Insufficient;
    /** Hệ số nhân ĐỘ MẠNH — lấy nguyên từ career_mapping.json.to_cong_strength_factor[co_che], KHÔNG tự đặt. */
    he_so: number | null;
  };
  source: "luan-giai-bat-tu-manh-phai";
}

/**
 * Đánh giá 1 Đại Vận theo Dụng/Hỷ/Kỵ — phần LUẬN, gắn với `BatTuFacts.daiVan[i]` theo index.
 * `can_chi`/`ngu_hanh` KHÔNG phải luận giải — chép nguyên từ `facts.daiVan[i]` (can+chi, canNguHanh),
 * đưa vào đây để đúng schema `docs/module-nghe-bat-tu.md` mục 2 (mọi trường module Nghề cần đọc
 * phải có ngay trong từng phần tử `dai_van`, không phải dò lại `facts` theo index).
 */
export interface DaiVanLuanGiai {
  tuTuoi: number;
  denTuoi: number;
  can_chi: string;
  ngu_hanh: NguHanh;
  dungHy: "dung" | "hy" | "trung" | "ky" | Insufficient;
  chuDe: string | Insufficient;
  mucThuan: "cao" | "trung_binh" | "thap" | Insufficient;
}

export interface BatTuProfile {
  meta: { gioi_tinh: Gender; duong_lich: string; cache_key: string };
  tu_tru: { nam: string; thang: string; ngay: string; gio: string };
  facts: BatTuFacts;
  bat_tu: BatTuLuanGiai;
  manh_phai: ManhPhaiLuanGiai;
  dai_van: DaiVanLuanGiai[];
  warnings: string[];
  /** Có gọi được AI để luận không. false = mới có `facts` (Tứ Trụ thuần code), các trường luận
   *  giải khác đều insufficient_data vì CHƯA cấu hình ANTHROPIC_API_KEY — không phải lỗi hệ thống. */
  ai_luan_giai_thanh_cong: boolean;
  model?: string;
  generatedAt: string;
}
