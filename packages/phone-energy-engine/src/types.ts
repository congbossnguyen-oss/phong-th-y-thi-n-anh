/**
 * Kiểu dữ liệu chung cho engine luận số điện thoại (Bát Cực Linh Số).
 *
 * Nguyên tắc xuyên suốt: gặp tổ hợp không có trong bảng thì trả `thieuDuLieu`, KHÔNG suy đoán.
 */

/** 8 từ trường năng lượng số. Phục Vị là cát nhưng mang tính trung lập. */
export type TenTinh =
  | "Thiên Y"
  | "Diên Niên"
  | "Sinh Khí"
  | "Phục Vị"
  | "Tuyệt Mệnh"
  | "Ngũ Quỷ"
  | "Lục Sát"
  | "Họa Hại";

export type CatHung = "cát" | "hung";

/** Cấp 1 mạnh nhất → Cấp 4 yếu nhất. */
export type CapDo = 1 | 2 | 3 | 4;

/** Cấp 1-2 = động số (đã thành hiện thực); cấp 3-4 = tĩnh số (mới là ý nghĩ). */
export type DongTinh = "động" | "tĩnh";

export type NguHanh = "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";

export type GioiTinh = "nam" | "nữ";

export type MucDich =
  | "tổng quát"
  | "tài lộc"
  | "hôn nhân"
  | "sự nghiệp"
  | "sức khỏe"
  | "học hành";

/** Một mục dữ liệu engine không tra được — phải nói với khách, không được đoán. */
export interface ThieuDuLieu {
  ma: string;
  moTa: string;
}

/**
 * Một cặp Bát tinh gốc đã tách được từ dãy số.
 *
 * `viTri` là chỉ số của hai chữ số trong dãy ĐÃ chuẩn hoá (đã bỏ số 0 đầu nhà mạng) — giữ lại để
 * biết cặp nằm ở đầu hay đuôi dãy, và để gắn đúng hiệu ứng số 5/0 quanh nó.
 */
export interface CapGoc {
  /** Hai chữ số của cặp gốc, vd "93". */
  cap: string;
  soTrai: number;
  soPhai: number;
  viTriTrai: number;
  viTriPhai: number;
}

/** Hiệu ứng của một số 5 hoặc số 0 lên một cặp gốc. */
export type LoaiHieuUng =
  | "giữ nguyên"
  | "đột hiển"
  | "khuếch đại"
  | "ẩn ngầm"
  | "mất hẳn";

export interface HieuUngSo50 {
  /** 5 hoặc 0. */
  so: 5 | 0;
  viTri: number;
  /** Vị trí tương đối so với cặp gốc. */
  viTriTuongDoi: "trước" | "giữa" | "sau";
  hieuUng: LoaiHieuUng;
  moTa: string;
  /** true khi hiệu ứng này làm một hung tinh mạnh lên — cần cảnh báo đậm. */
  lamManhHungTinh: boolean;
  /**
   * Số 0 ẩn hoặc làm mất năng lượng thì cụ thể là mất ở mặt nào của cuộc sống.
   * Rỗng với số 5, và rỗng với cặp Phục Vị (bảng gốc không gán lĩnh vực cho Phục Vị).
   */
  yNghiaLinhVuc?: string;
}

/** Kết quả tra một cặp gốc vào bảng Bát tinh. */
export interface KetQuaCap {
  capGoc: CapGoc;
  ten: TenTinh;
  catHung: CatHung;
  capDo: CapDo;
  dongTinh: DongTinh;
  nguHanhTinh: NguHanh;
  hieuUng: HieuUngSo50[];
  /** Cặp đã được cát tinh bên phải hoá giải (Cơ chế A). */
  daHoaGiai: boolean;
}

/** Một bộ 3 số liên tiếp và câu diễn giải trái–phải của nó. */
export interface Bo3So {
  bo: string;
  /** null khi bộ có chứa 0/5 nên không ghép được 2 cặp trái–phải độc lập. */
  capTrai: KetQuaCap | null;
  capPhai: KetQuaCap | null;
  dienGiai: string;
  /** Cơ chế A: hung bên trái được cát bên phải đủ mạnh hoá giải. */
  hoaGiaiNoiBo: boolean;
}

export interface CanhBao {
  ma: string;
  tieuDe: string;
  moTa: string;
  mucDo: "nhẹ" | "nặng";
}

/** Một giai đoạn vận thế tính từ CCCD. */
export interface GiaiDoanVanThe {
  cap: string;
  tuoiTu: number;
  tuoiDen: number;
  ten: TenTinh | null;
  capDo: CapDo | null;
  catHung: CatHung | null;
  /** Cặp không tra được Bát tinh rõ ràng thì ghi lý do ở đây. */
  ghiChu?: string;
}

export interface NhomTuTruongResult {
  nhom: string;
  trungKhop: string[];
  dienGiai: string;
}

export interface GoiYHoaGiai {
  hungTinh: TenTinh;
  nguon: "số điện thoại" | "CCCD";
  cachHoaGiai: string;
  toHopGoiY: string[];
}

export interface ScoreCard {
  diem: number;
  nhan: string;
  thanhPhan: { ten: string; diem: number; ghiChu: string }[];
}

export interface LuanSoDienThoaiInput {
  soDienThoai: string;
  cccd?: string;
  gioiTinh?: GioiTinh;
  mucDich?: MucDich;
}

export interface LuanSoDienThoaiResult {
  soDaChuanHoa: string;
  capGoc: KetQuaCap[];
  bo3So: Bo3So[];
  ketCuc: {
    baSoDuoi: string;
    capTrongDuoi: KetQuaCap[];
    dienGiai: string;
    toHopXau: string[];
  };
  tinhChuDao: { ten: TenTinh; soLan: number } | null;
  nhomTuTruong: NhomTuTruongResult[];
  canhBao: CanhBao[];
  vanThe: GiaiDoanVanThe[] | null;
  hoaGiai: GoiYHoaGiai[];
  diem: ScoreCard;
  /** Bài luận văn xuôi 8 bước, ghép từ template — không gọi AI. */
  baiLuan: { tieuDe: string; noiDung: string[] }[];
  thieuDuLieu: ThieuDuLieu[];
}
