// Kiểu dữ liệu cho engine lập lá bàn Kỳ Môn Độn Giáp.
// Xem SPEC_cho_Claude_Code.md (Công đã gửi) để biết đầy đủ ngữ nghĩa từng trường.

export type AmDuong = "+" | "-";

export type CanChiPillar = {
  can: string;
  chi: string;
};

/** Tứ trụ hiển thị — có thể thiếu trụ nào đó tùy chế độ (vd chế độ Năm không có trụ Giờ/Ngày
 * mang ý nghĩa thật, chỉ trụ Năm là trụ người dùng thật sự quan tâm). */
export type TuTru = {
  gio?: CanChiPillar;
  ngay?: CanChiPillar;
  thang?: CanChiPillar;
  nam?: CanChiPillar;
};

export type CungInfo = {
  soCung: number;
  huong: string;
  saoThienBan: string;
  mon: string;
  than: string;
  thienBanCan: string;
  diaBanCan: string;
  diaChi: string[];
  KV: boolean;
  Ma: boolean;
};

/** 6 chế độ lập bàn theo SPEC mục 6B. Tất cả dùng chung 1 engine lõi (`layLaBanTuThoiThan`)
 * — chỉ khác trụ nào làm "thời thần" và cục lấy từ đâu. NGÀY/THÁNG/NĂM tạm ngưng public API
 * (xem README mục "Prompt 2" — đây là 3 hệ lập cục riêng biệt trong lý thuyết Kỳ Môn: Nhật
 * gia/Nguyệt gia/Niên gia, khác hẳn Thời gia mà km_data.json hỗ trợ — chưa đủ dữ liệu mẫu để
 * xác định công thức, KHÔNG được đoán/nội suy). Logic chọn trụ tháng/năm theo tiết khí vẫn giữ
 * nguyên trong code (đúng, dùng lại được sau) — chỉ không còn expose qua `lapLaBan()` công khai.
 */
export type CheDo = "gio" | "ngay" | "thang" | "nam" | "menh" | "1080";

/** Chế độ đang được HỖ TRỢ CHÍNH THỨC (public API) — xem README trước khi bật lại Ngày/Tháng/Năm. */
export type CheDoHoTro = "gio" | "menh" | "1080";

/** Giờ/Mệnh nhận cùng 1 dạng đầu vào: 1 thời điểm dương lịch đầy đủ (ngày-giờ-phút). Với chế
 * độ Mệnh, đây là ngày-giờ SINH (không phải ngày-giờ hiện tại) — engine xử lý y hệt chế độ Giờ. */
export type LapLaBanInputLich = {
  cheDo?: Exclude<CheDoHoTro, "1080">; // mặc định 'gio'
  nam: number;
  thang: number;
  ngay: number;
  gio: number;
  phut: number;
};

/** Chế độ 1080: nhập tay số cục + âm/dương + 1 hoa giáp (vd "Ất Hợi"), bỏ qua hoàn toàn bước
 * tra lịch — vào thẳng bước bày Địa Bàn theo (cục, âm/dương) rồi tính Trực Phù/Trực Sử theo
 * hoa giáp đã chọn làm thời thần. */
export type LapLaBanInput1080 = {
  cheDo: "1080";
  soCuc: number;
  amDuong: AmDuong;
  /** Tên hoa giáp, dạng "Can Chi" — vd "Ất Hợi", phải khớp đúng 1 trong 60 dòng km_giaptytable.json. */
  hoaGiap: string;
};

export type LapLaBanInput = LapLaBanInputLich | LapLaBanInput1080;

export type LapLaBanResult = {
  cheDo: CheDo;
  tuTru: TuTru;
  cuc: number;
  amDuong: AmDuong;
  phuDau: string;
  tuanKhongChi: [string, string];
  trucPhu: string;
  trucPhuCung: number;
  trucSu: string;
  trucSuCung: number;
  cungList: CungInfo[];
  /** Cờ cảnh báo các phần chưa chắc chắn 100% — xem báo cáo kèm theo. */
  ghiChu: string[];
  /** Các giá trị trung gian của công thức Trực Phù/Trực Sử (mục 5 SPEC) — để đối chiếu tay
   * với Excel khi có sai lệch, tránh phải đoán lại từ đầu. */
  debugTrucSu: {
    W62: string;
    X62: string;
    W63: number;
    X63: number;
    Y63: number;
    traNguon: "bang_chinh_xac" | "xap_xi_du_phong";
    tra: number;
    X64: number;
    cuc: number;
    amDuong: AmDuong;
    X65: number;
    X66: number;
  };
};
