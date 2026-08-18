/**
 * Kiểu dữ liệu chung cho engine luận số điện thoại (Bát Cực Linh Số).
 *
 * Nguyên tắc xuyên suốt: gặp tổ hợp không có trong bảng thì trả `thieuDuLieu`, KHÔNG suy đoán.
 */
import type { TongKet } from "./engine/tongKet.js";
import type { KhoiDienKet } from "./engine/khoiDienKet.js";

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
/**
 * Số 5 đẩy năng lượng lên (kích phát / kéo dài).
 * Số 0 rẽ theo bản chất cặp: với cát tinh thì "giảm nửa lực" (giảm chứ không mất hẳn), với hung
 * tinh thì "tăng nặng".
 */
export type LoaiHieuUng = "kích phát" | "kéo dài" | "giảm nửa lực" | "tăng nặng";

export interface HieuUngSo50 {
  /** 5 hoặc 0. */
  so: 5 | 0;
  viTri: number;
  /** Vị trí tương đối so với cặp gốc. */
  /**
   * Vị trí so với cặp gốc mà nó tác động. Chỉ có "giữa" và "sau": số 0/5 luôn lặp lại chữ số bên
   * TRÁI mình nên không bao giờ đứng "trước" cặp mà nó ảnh hưởng.
   */
  viTriTuongDoi: "giữa" | "sau";
  hieuUng: LoaiHieuUng;
  moTa: string;
  /** true khi hiệu ứng này làm một hung tinh mạnh lên — cần cảnh báo đậm. */
  lamManhHungTinh: boolean;
  /**
   * Chữ số đứng ngay trước nó mà nó lặp lại để thành Phục Vị — cả số 5 lẫn số 0 đều có.
   * Vd "985" → soLapLai = 8, tức 8-5 đọc thành Phục Vị 88.
   */
  soLapLai: number;
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
  /** Giai đoạn khách đang ở — chỉ xác định được khi có năm sinh. */
  laHienTai?: boolean;
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
  /**
   * Lời chúc mừng khi số đạt mức tốt trở lên. Chuỗi rỗng với số ở mức trung bình hoặc kém — không
   * khen lấy lệ, vì khen sai chỗ thì mất tin tưởng.
   */
  loiKhen: string;
  thanhPhan: { ten: string; diem: number; ghiChu: string }[];
}

export interface LuanSoDienThoaiInput {
  soDienThoai: string;
  cccd?: string;
  gioiTinh?: GioiTinh;
  mucDich?: MucDich;
  /** Năm sinh dương lịch — chỉ dùng để biết khách đang ở giai đoạn vận thế nào. */
  namSinh?: number;
  /** Mã nhóm nghề (xem `data/ngheNghiep.ts`). Bỏ trống thì engine không luận phần đối chiếu nghề. */
  ngheNghiep?: string;
}

/** Số liệu tổng hợp cho phần biểu đồ. Tính sẵn ở engine để tầng hiển thị không phải tự suy. */
export interface ThongKe {
  tongSoCap: number;
  soCapCat: number;
  soCapHung: number;
  /** Cặp Phục Vị — trung tính, tách riêng khỏi cát và hung. */
  soCapTrungTinh: number;
  tyLeCat: number;
  tyLeHung: number;
  tyLeTrungTinh: number;
  /** Tỷ trọng từng Bát tinh trong dãy, sắp giảm dần. */
  theoTinh: { ten: TenTinh; catHung: CatHung; soLan: number; tyLe: number }[];
  /** Tỷ trọng ngũ hành, tính trên TỪNG CHỮ SỐ (kể cả 0 và 5 vốn có hành riêng). */
  theoNguHanh: { hanh: NguHanh; soLan: number; tyLe: number }[];
  /**
   * Giá trị năng lượng từng cặp theo thứ tự trong dãy, thang -100..100 — dùng vẽ biểu đồ sóng.
   * Dương là cát, âm là hung, độ lớn theo cấp độ.
   */
  song: { cap: string; ten: TenTinh; giaTri: number }[];
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
  thongKe: ThongKe;
  /** Tuổi suy từ năm sinh, null nếu khách không nhập. */
  tuoiHienTai: number | null;
  diem: ScoreCard;
  /** Bảng tổng kết cuối bài — luận chính từ ba số cuối, kèm đối chiếu nghề nghiệp nếu khách nhập. */
  tongKet: TongKet;
  /** Luận theo trục đời người Khởi – Diễn – Kết, kèm cảnh báo điểm gãy giữa dãy. */
  khoiDienKet: KhoiDienKet;
  /** Bài luận văn xuôi 8 bước, ghép từ template — không gọi AI. */
  baiLuan: { tieuDe: string; noiDung: string[] }[];
  thieuDuLieu: ThieuDuLieu[];
}
