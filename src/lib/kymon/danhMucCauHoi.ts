// Danh mục chủ đề/tình huống cho tính năng "Hỏi 1 việc cụ thể" (Kỳ Môn chế độ Giờ/1080) — theo
// SPEC_danh_muc_cau_hoi_ky_mon.md (Công cung cấp 2026-08-25). File này CHỈ chứa danh mục để dựng
// menu chọn chủ đề + form nhập liệu; PHẦN TỰ SINH CÂU TRẢ LỜI cho từng chủ đề chưa có ở đây — sẽ
// làm riêng từng chủ đề theo yêu cầu Công (xem SPEC mục cuối).

export interface TinhHuongCauHoi {
  id: string;
  nhan: string;
  cauHoiMau: string;
  dungThanChinh: string;
  /** Gợi ý input bổ sung (vd "Giới tính 2 người", "Năm sinh vợ, chồng") — hiển thị làm placeholder
   * cho ô "Thông tin bổ sung" tự do, không dựng form có cấu trúc riêng cho từng tình huống. */
  inputThem?: string;
}

export interface ChuDeCauHoi {
  id: string;
  nhan: string;
  tinhHuong: TinhHuongCauHoi[];
}

export const DANH_MUC_CAU_HOI: ChuDeCauHoi[] = [
  {
    id: "tai_chinh",
    nhan: "Tài chính",
    tinhHuong: [
      { id: "tai_van_chung", nhan: "Tài vận chung", cauHoiMau: "Tháng này/dạo này tài vận thế nào?", dungThanChinh: "Can Ngày (người hỏi)" },
      { id: "vay_tien", nhan: "Vay tiền", cauHoiMau: "Tôi có vay được tiền của [ngân hàng/người] không?", dungThanChinh: "Trực Phù (chủ nợ) / Thiên Ất (người vay)" },
      { id: "cho_vay", nhan: "Cho vay", cauHoiMau: "Cho [người] vay có nên không?", dungThanChinh: "Trực Phù (người cho vay) / Thiên Ất (con nợ) / Sinh Môn (lợi tức)" },
      { id: "doi_no", nhan: "Đòi nợ", cauHoiMau: "Khoản nợ này đòi được không, đòi hết hay 1 phần?", dungThanChinh: "Trực Phù / Thiên Ất / Thương Môn (người đòi nợ)" },
      { id: "dau_tu", nhan: "Đầu tư", cauHoiMau: "Đầu tư khoản này có lời không, lời nhiều hay ít?", dungThanChinh: "Giáp Tý/Mậu (vốn) / Sinh Môn (lợi nhuận)" },
      { id: "mua_hang", nhan: "Mua hàng", cauHoiMau: "Mua lô hàng này có lời không, chất lượng thế nào?", dungThanChinh: "Can Ngày (người mua) / Can Giờ (hàng hóa)" },
      { id: "ban_hang", nhan: "Bán hàng", cauHoiMau: "Bán lô hàng này có lời không?", dungThanChinh: "Can Ngày (người bán) / Can Giờ (hàng hóa) / Giáp Tý (vốn) / Sinh Môn (lợi nhuận)" },
      { id: "mo_cua_hang", nhan: "Mở cửa hàng/công ty", cauHoiMau: "Mở ở đây có phát đạt không?", dungThanChinh: "Khai Môn / Can Ngày (người hỏi)" },
      { id: "giao_dich", nhan: "Giao dịch mua bán (đối tác)", cauHoiMau: "Giao dịch này ai lợi hơn, có công bằng không?", dungThanChinh: "Can Ngày (bên mua) / Can Giờ (bên bán) / Lục Hợp (trung gian nếu có)" },
      { id: "hop_tac_lam_an", nhan: "Hợp tác làm ăn", cauHoiMau: "Hợp tác với [đối tác] ai lợi hơn?", dungThanChinh: "Can Ngày (mình) / Can Giờ (đối tác)" },
    ],
  },
  {
    id: "cong_viec",
    nhan: "Công việc",
    tinhHuong: [
      { id: "xin_viec", nhan: "Xin việc", cauHoiMau: "Xin việc ở [công ty] có được nhận không?", dungThanChinh: "Can Ngày (người hỏi) / Khai Môn" },
      { id: "thang_chuc", nhan: "Thăng chức", cauHoiMau: "Kỳ này có được thăng chức không?", dungThanChinh: "Can Ngày / Quan Lộc-liên quan" },
      { id: "nhay_viec", nhan: "Nhảy việc", cauHoiMau: "Có nên nhảy việc lúc này không?", dungThanChinh: "Can Ngày" },
      { id: "hop_tac_canh_tranh", nhan: "Hợp tác/cạnh tranh", cauHoiMau: "Hợp tác/cạnh tranh với [ai] thế nào?", dungThanChinh: "Can Ngày (mình) / Can Giờ (đối phương)" },
    ],
  },
  {
    id: "tinh_cam",
    nhan: "Tình cảm",
    tinhHuong: [
      { id: "hop_khong_hop", nhan: "Hợp/không hợp", cauHoiMau: "Người này với tôi có hợp không?", dungThanChinh: "Ất (Nữ) / Canh (Nam) / Lục Hợp (mai mối)", inputThem: "Giới tính 2 người" },
      { id: "tinh_trang_hon_nhan", nhan: "Tình trạng hôn nhân", cauHoiMau: "Vợ chồng tôi dạo này thế nào?", dungThanChinh: "Ất/Canh theo năm sinh 2 người", inputThem: "Năm sinh vợ, chồng" },
      { id: "nghi_ngoai_tinh", nhan: "Nghi ngoại tình", cauHoiMau: "Vợ/chồng tôi có đang ngoại tình không?", dungThanChinh: "Đinh Kỳ (bồ của chồng) / Bính Kỳ (bồ của vợ)", inputThem: "Năm sinh 2 người, thời điểm nghi ngờ" },
      { id: "nen_cuoi", nhan: "Nên cưới không", cauHoiMau: "Có nên tiến tới cưới không?", dungThanChinh: "Ất/Canh, Lục Hợp" },
    ],
  },
  {
    id: "suc_khoe",
    nhan: "Sức khỏe",
    tinhHuong: [
      { id: "benh_tinh_chung", nhan: "Bệnh tình chung", cauHoiMau: "Sức khỏe dạo này có vấn đề gì cần lưu ý?", dungThanChinh: "Can Ngày (người hỏi) hoặc Can Năm/Tháng/Giờ theo quan hệ", inputThem: "Quan hệ người hỏi-người bệnh" },
      { id: "cap_cuu", nhan: "Cấp cứu", cauHoiMau: "[Người] đang cấp cứu, tình hình ra sao?", dungThanChinh: "Can theo quan hệ + xét Không Vong/nhập Mộ/Tử khí", inputThem: "Quan hệ, năm sinh người bệnh" },
    ],
  },
  {
    id: "phong_thuy",
    nhan: "Phong thủy",
    tinhHuong: [
      { id: "xem_nha_dat", nhan: "Xem nhà/đất", cauHoiMau: "Căn nhà/mảnh đất này có hợp để ở/mua không?", dungThanChinh: "Can Ngày (người hỏi) / các cung liên quan", inputThem: "Hướng nhà nếu có" },
      { id: "chon_huong_dat_vat", nhan: "Chọn hướng đặt vật", cauHoiMau: "Nên đặt bếp/bàn thờ hướng nào?", dungThanChinh: "Xét các cung theo Bát Môn/Cửu Tinh" },
    ],
  },
  {
    id: "phap_ly",
    nhan: "Pháp lý",
    tinhHuong: [
      { id: "kien_tung", nhan: "Kiện tụng", cauHoiMau: "Vụ kiện này có thắng không?", dungThanChinh: "Can Ngày (mình) / Can Giờ (đối phương) / Kinh Môn, Tử Môn" },
      { id: "tranh_chap", nhan: "Tranh chấp", cauHoiMau: "Tranh chấp với [ai] nên xử lý thế nào?", dungThanChinh: "Can Ngày / Can Giờ" },
    ],
  },
  {
    id: "hoc_hanh",
    nhan: "Học hành",
    tinhHuong: [
      { id: "thi_cu", nhan: "Thi cử", cauHoiMau: "Thi vào [trường] có đậu không?", dungThanChinh: "Can Ngày hoặc Can Giờ (nếu cha mẹ hỏi cho con) / Thiên Phụ Tinh / Trực Phù / Can Năm (trường)", inputThem: "Ai hỏi cho ai, năm sinh thí sinh" },
      { id: "tim_thay_hoc_dao", nhan: "Tìm thầy học đạo", cauHoiMau: "Tìm được thầy giỏi nhận dạy không?", dungThanChinh: "Thiên Nhuế Tinh (học trò) / Thiên Phụ Tinh (thầy)" },
    ],
  },
  {
    id: "di_lai",
    nhan: "Đi lại",
    tinhHuong: [
      { id: "nen_di_khong", nhan: "Nên đi không", cauHoiMau: "Chuyến đi [đâu] vào [khi] có thuận lợi không?", dungThanChinh: "Can Ngày (người đi)", inputThem: "Hướng đến" },
      { id: "phuong_tien", nhan: "Phương tiện", cauHoiMau: "Đi ô tô/tàu thuyền/máy bay thì thuận lợi hơn?", dungThanChinh: "Cảnh Môn+Thương Môn (xe) / Hưu Môn+Thương Môn (thuyền) / Cửu Thiên+Khai Môn (máy bay)", inputThem: "Phương tiện dự định" },
      { id: "an_toan_doc_duong", nhan: "An toàn dọc đường", cauHoiMau: "Đi xe có bị mất cắp/cháy nổ không?", dungThanChinh: "Xét cấu trúc trận C/B, B/C tại vị trí phương tiện" },
      { id: "khi_nao_ve", nhan: "Khi nào về", cauHoiMau: "Bao giờ thì [người đi xa] về?", dungThanChinh: "Canh cách theo Can ngày +/-, hoặc theo Không Vong/Mã Tinh" },
    ],
  },
  {
    id: "tim_kiem",
    nhan: "Tìm kiếm",
    tinhHuong: [
      { id: "tim_do_vat", nhan: "Tìm đồ vật", cauHoiMau: "Đồ bị mất là gì, tìm được không, ở đâu?", dungThanChinh: "Can Ngày (người mất đồ) / Can Giờ (đồ vật)" },
      { id: "tim_nguoi", nhan: "Tìm người", cauHoiMau: "[Người] mất liên lạc/bỏ nhà đi hiện ra sao?", dungThanChinh: "Can Ngày, hoặc Can Năm/Tháng/Giờ theo quan hệ / Lục Hợp (hướng đi)", inputThem: "Quan hệ người hỏi-người mất tích, năm sinh người đó" },
    ],
  },
  {
    id: "thoi_tiet",
    nhan: "Thời tiết",
    tinhHuong: [
      { id: "mua", nhan: "Mưa", cauHoiMau: "Ngày [X] có mưa không, to hay nhỏ?", dungThanChinh: "Thiên Trụ Tinh, Thiên Bồng Tinh (gặp Nhâm/Quý)", inputThem: "Ngày cần xem" },
      { id: "sam_chop", nhan: "Sấm chớp", cauHoiMau: "Có sấm chớp không?", dungThanChinh: "Thiên Trụ/Thiên Bồng gặp Nhâm Quý tại cung Chấn" },
      { id: "tuyet", nhan: "Tuyết", cauHoiMau: "Có tuyết rơi không, khi nào?", dungThanChinh: "Thiên Tâm, Thiên Trụ gặp Nhâm/Quý tại Càn/Đoài" },
      { id: "gio", nhan: "Gió", cauHoiMau: "Gió thổi hướng nào, mạnh hay nhẹ?", dungThanChinh: "Thiên Phụ Tinh (hướng gió)" },
    ],
  },
];

export type QuanHeCauHoi = "ban_than" | "cha_me_be_tren" | "anh_chi_em_ban_be" | "con_cai_nguoi_khac";

export const QUAN_HE_LABELS: Record<QuanHeCauHoi, string> = {
  ban_than: "Bản thân",
  cha_me_be_tren: "Cha mẹ / bề trên",
  anh_chi_em_ban_be: "Anh chị em / bạn bè",
  con_cai_nguoi_khac: "Con cái / người khác",
};

export function laQuanHeCauHoi(v: unknown): v is QuanHeCauHoi {
  return typeof v === "string" && Object.hasOwn(QUAN_HE_LABELS, v);
}

/** Tra 1 tình huống theo (chuDeId, tinhHuongId) — dùng để validate ở server + hiển thị nhãn. */
export function traTinhHuong(chuDeId: string, tinhHuongId: string): { chuDe: ChuDeCauHoi; tinhHuong: TinhHuongCauHoi } | undefined {
  const chuDe = DANH_MUC_CAU_HOI.find((c) => c.id === chuDeId);
  if (!chuDe) return undefined;
  const tinhHuong = chuDe.tinhHuong.find((t) => t.id === tinhHuongId);
  if (!tinhHuong) return undefined;
  return { chuDe, tinhHuong };
}
