// TRẠCH CÁT KỲ MÔN — DANH MỤC VIỆC DỤNG SỰ và dụng thần riêng của từng việc.
//
// Nguyên tắc nền (zhicong-11.md Video 5 mục 2.2): "Động thổ phải dùng tượng kỳ môn liên quan
// đến động thổ, khai trương phải dùng tượng kỳ môn của khai trương, kết hôn phải dùng tượng kỳ
// môn của kết hôn" — tức MỖI VIỆC MỘT BỘ DỤNG THẦN RIÊNG, không dùng chung 1 bộ tiêu chí.
//
// Mã trong engine: mon = HƯU/SINH/THƯƠNG/ĐỖ/CẢNH/TỬ/KINH/KHAI;
// than = T.Phù/Đ.Xà/T.Âm/L.Hợp/B.Hổ/H.Vũ/C.Địa/C.Thiên;
// sao = T.Bồng/T.Nhuế/T.Xung/T.Phò/T.Tâm/T.Trụ/T.Nhậm/T.Anh.

export type DungThanViec = {
  /** Môn hợp việc nhất — khớp được thì điểm cao. */
  monChinh?: string[];
  /** Môn chấp nhận được, dùng khi không có môn chính. */
  monPhu?: string[];
  /** Môn kỵ — gặp là loại cung này khỏi danh sách. */
  monKy?: string[];
  /** Bát thần hợp việc. */
  than?: string[];
  /** Bát thần kỵ. */
  thanKy?: string[];
  /** Thiên can hợp việc (thiên bàn hoặc địa bàn). */
  can?: string[];
  /** Thiên can gần như bắt buộc với việc này (vd Mậu = tiền, cho khai trương). */
  canTrongYeu?: string[];
  /** Cửu tinh hợp việc. */
  sao?: string[];
  /** Mã Tinh là dụng thần (phải có). */
  maTinh?: boolean;
  /** Mã Tinh là điều kỵ (việc cần tĩnh, không nên động). */
  maTinhKy?: boolean;
  /** Cặp hợp can (Giáp Kỷ, Ất Canh, Bính Tân, Đinh Nhâm, Mậu Quý) là dụng thần. */
  hopCan?: boolean;
  /** Tam Kỳ (Ất Bính Đinh) dùng làm phương án dự phòng khi không khớp dụng thần chính. */
  tamKy?: boolean;
  /** Trực thần (vòng 12) kỵ riêng cho việc này. */
  trucThanKy?: string[];
};

/** Lựa chọn phụ bên trong một việc — hiện chỉ dùng cho Cúng Thần (mỗi vị thần một hệ tượng riêng). */
export type LuaChonPhu = {
  id: string;
  nhan: string;
  dungThan: DungThanViec;
};

export type ViecTrachCat = {
  id: string;
  nhan: string;
  moTa: string;
  nhom: "Nhà cửa - Xây dựng" | "Kinh doanh - Công việc" | "Đời sống - Di chuyển" | "Tang lễ" | "Hôn nhân - Tín ngưỡng";
  /** Việc gắn với 1 vị trí cố định trong không gian → cần biết toạ sơn của công trình/mộ. */
  canToaSon: boolean;
  ghiChuToaSon?: string;
  dungThan: DungThanViec;
  /** Quy tắc đặc thù xử lý riêng trong engine. */
  quyTacRieng?: ("tranh_phuong_thai_tue" | "tu_mon_khong_tuong_khac")[];
  /** Việc cần bát tự CẢ HAI người (hiện chỉ Kết Hôn) — engine dùng thuật toán cung tương giao riêng. */
  canHaiNguoi?: boolean;
  /** Lựa chọn phụ bắt buộc bên trong việc (Cúng Thần: chọn vị thần). */
  luaChonPhu?: { nhan: string; moTa: string; ds: LuaChonPhu[] };
  /**
   * Không loại cung vì Không Vong. Chỉ Cúng Thần dùng — nguồn nói thẳng:
   * "quái tượng hơn thần sát, cúng thần nếu gặp không vong cũng không sao".
   */
  boQuaKhongVong?: boolean;
  luuY?: string;
  nguon: string;
};

export const DANH_MUC_VIEC_TRACH_CAT: ViecTrachCat[] = [
  // ==========================================================================================
  // NHÀ CỬA - XÂY DỰNG
  // ==========================================================================================
  {
    id: "dong_tho",
    nhan: "Động thổ - Khởi công",
    moTa: "Chọn ngày động thổ làm nhà, khởi công xây dựng (đại động), hoặc tu sửa bếp/vệ sinh/ban công (tiểu động).",
    nhom: "Nhà cửa - Xây dựng",
    canToaSon: true,
    ghiChuToaSon:
      "Cần toạ sơn để tránh đào đúng phương Thái Tuế — nguồn ghi rõ: nhát cuốc đầu tiên không được đào từ phương Thái Tuế.",
    dungThan: {
      than: ["C.Địa", "B.Hổ"],
      can: ["Mậu", "Kỷ", "Nhâm", "Quý"],
      maTinh: true,
      monKy: ["HƯU", "ĐỖ"],
    },
    quyTacRieng: ["tranh_phuong_thai_tue"],
    luuY:
      "Hưu Môn chủ bất động, Đỗ Môn chủ bế tắc — đều nghịch với ý nghĩa động thổ nên bị loại. Mậu/Kỷ là thổ, Nhâm/Quý là tượng động, Mã Tinh và Bạch Hổ chủ đường sá - vận chuyển.",
    nguon: "zhicong-11.md, Video 9",
  },
  {
    id: "lap_cua",
    nhan: "Lắp cửa",
    moTa: "Chọn ngày lắp cửa chính, cửa đại môn, cửa trượt ban công hoặc cửa phòng ngủ.",
    nhom: "Nhà cửa - Xây dựng",
    canToaSon: false,
    dungThan: {
      monChinh: ["HƯU", "SINH", "KHAI"],
      monPhu: ["CẢNH"],
      than: ["T.Phù", "L.Hợp"],
      tamKy: true,
      hopCan: true,
      monKy: ["TỬ", "ĐỖ"],
    },
    luuY:
      "Nguồn xếp ưu tiên rõ: trước hết tìm Hưu/Sinh/Khai Môn; không có thì dùng Cảnh Môn; vẫn không có thì mới xét Trực Phù, Tam Kỳ, Lục Hợp và các cặp hợp can (tượng cửa đóng - mở).",
    nguon: "zhicong-11.md, Video 10",
  },
  {
    id: "nhap_trach",
    nhan: "Nhập trạch - Chuyển nhà",
    moTa: "Chọn ngày dọn vào nhà mới, chuyển nhà hoặc chuyển văn phòng công ty.",
    nhom: "Nhà cửa - Xây dựng",
    canToaSon: true,
    ghiChuToaSon:
      "Cần toạ sơn để loại ngày xung toạ — nguồn nêu ví dụ: nhà toạ Tý hướng Ngọ thì không chọn ngày Ngọ.",
    dungThan: {
      monChinh: ["HƯU", "SINH", "KHAI"],
      than: ["T.Phù", "T.Âm", "C.Thiên", "L.Hợp"],
      can: ["Mậu"],
      hopCan: true,
      monKy: ["TỬ", "KINH"],
    },
    luuY:
      "Nhập trạch cần đủ 3 yếu tố: quý nhân (Trực Phù/Thái Âm/Cửu Thiên), tiền tài (Mậu, Sinh Môn) và nhân duyên (Lục Hợp, Hưu Môn). Nếu chuyển công ty thì thêm Khai Môn cho yếu tố sự nghiệp.",
    nguon: "zhicong-11.md, Video 11",
  },
  {
    id: "dat_bep",
    nhan: "Đặt bếp",
    moTa: "Chọn ngày đặt bếp, an táo thần — một trong Dương trạch tam yếu (môn - chủ - táo).",
    nhom: "Nhà cửa - Xây dựng",
    canToaSon: false,
    dungThan: {
      monChinh: ["CẢNH"],
      can: ["Bính", "Đinh", "Kỷ"],
      sao: ["T.Nhuế"],
    },
    luuY:
      "Bếp thuộc hoả nên lấy Bính/Đinh; Cảnh Môn chủ ăn uống; Kỷ là tượng ăn; Thiên Nhuế Tinh chủ đồ ăn. Cung nhiều thuỷ (Nhâm/Quý, Thiên Bồng, Huyền Vũ) thì nghịch tượng bếp.",
    nguon: "zhicong-11.md, Video 14",
  },
  {
    id: "di_sang",
    nhan: "Đặt giường (di sàng)",
    moTa: "Chọn ngày kê giường cưới hoặc chuyển giường ngủ — liên quan tình cảm vợ chồng, sự ổn định gia đạo.",
    nhom: "Nhà cửa - Xây dựng",
    canToaSon: false,
    dungThan: {
      monChinh: ["HƯU"],
      monPhu: ["SINH", "KHAI"],
      than: ["L.Hợp", "T.Phù", "C.Địa"],
      thanKy: ["H.Vũ", "Đ.Xà"],
      hopCan: true,
      maTinhKy: true,
      trucThanKy: ["Chu Tước", "Huyền Vũ"],
    },
    luuY:
      "Việc này cần TĨNH và ổn định nên Mã Tinh và Cửu Thiên (chủ động) đều không hợp; Cửu Địa lại tốt. Nguồn nhấn mạnh phải có cặp hợp can vì đó là tượng tình cảm hoà hợp trong nhà.",
    nguon: "zhicong-11.md, Video 13",
  },

  // ==========================================================================================
  // KINH DOANH - CÔNG VIỆC
  // ==========================================================================================
  {
    id: "khai_truong",
    nhan: "Khai trương",
    moTa: "Chọn ngày khai trương cửa hàng, công ty, chi nhánh mới.",
    nhom: "Kinh doanh - Công việc",
    canToaSon: false,
    dungThan: {
      monChinh: ["SINH", "KHAI", "CẢNH"],
      canTrongYeu: ["Mậu"],
      than: ["T.Phù", "C.Thiên", "L.Hợp"],
      thanKy: ["C.Địa"],
      tamKy: true,
      monKy: ["TỬ", "ĐỖ", "THƯƠNG", "KINH"],
    },
    luuY:
      "Khai trương lấy CẦU TÀI làm chính nên Mậu (tiền) là yếu tố then chốt; Cửu Thiên chủ phát triển mạnh, ngược lại Cửu Địa chủ doanh số thấp nên bị loại. Hưu Môn chỉ dùng được cho ngành giải trí/thư giãn, còn lại thì không hợp vì chủ trì trệ.",
    nguon: "zhicong-11.md, Video 15",
  },
  {
    id: "dam_phan",
    nhan: "Đàm phán - Ký hợp đồng",
    moTa: "Chọn ngày đàm phán, thương lượng, ký kết hợp đồng hoặc chốt đơn hàng lớn.",
    nhom: "Kinh doanh - Công việc",
    canToaSon: false,
    dungThan: {
      monChinh: ["SINH", "KHAI"],
      can: ["Mậu", "Đinh"],
      than: ["L.Hợp"],
      monKy: ["KINH", "TỬ"],
    },
    luuY:
      "Mậu là tiền, Đinh là hợp đồng/đơn hàng, Lục Hợp là hợp tác. Kinh Môn chủ khẩu thiệt thị phi nên rất kỵ khi đàm phán. Nguồn còn gợi ý chọn chỗ ngồi theo ngũ hành bát quái phương vị so với vị trí đối tác.",
    nguon: "zhicong-11.md, Video 18",
  },

  // ==========================================================================================
  // ĐỜI SỐNG - DI CHUYỂN
  // ==========================================================================================
  {
    id: "xuat_hanh",
    nhan: "Xuất hành - Đi xa",
    moTa: "Chọn ngày khởi hành đi xa, đi công tác, du lịch hoặc xuất ngoại.",
    nhom: "Đời sống - Di chuyển",
    canToaSon: false,
    dungThan: {
      monChinh: ["HƯU"],
      monPhu: ["SINH", "KHAI"],
      than: ["T.Phù", "C.Thiên", "L.Hợp"],
      thanKy: ["B.Hổ", "H.Vũ", "Đ.Xà"],
      maTinh: true,
      monKy: ["THƯƠNG", "TỬ", "ĐỖ", "KINH", "CẢNH"],
    },
    luuY:
      "Xuất hành lấy AN TOÀN làm chính nên Hưu Môn đứng đầu. Kỵ nặng: Thương/Tử Môn chủ tai nạn thương tích, Bạch Hổ chủ tai nạn, Huyền Vũ chủ mất cắp, Đằng Xà chủ phiền phức trói buộc. Cung có Mã Tinh phải không phạm tứ hại.",
    nguon: "zhicong-11.md, Video 16",
  },
  {
    id: "mua_xe",
    nhan: "Mua xe - Nhận xe",
    moTa: "Chọn ngày mua xe, nhận xe, đăng ký biển số hoặc lăn bánh lần đầu.",
    nhom: "Đời sống - Di chuyển",
    canToaSon: false,
    dungThan: {
      monChinh: ["HƯU", "SINH", "KHAI"],
      than: ["B.Hổ"],
      can: ["Canh"],
      maTinh: true,
      monKy: ["TỬ", "THƯƠNG"],
    },
    luuY:
      "Mã Tinh, Bạch Hổ và Canh kim đều là tượng của xe. Cảnh báo quan trọng từ nguồn: các dụng thần này TUYỆT ĐỐI không được gặp kích hình hay nhập mộ — nếu gặp thì chính là tượng tai nạn xe.",
    nguon: "zhicong-11.md, Video 17",
  },

  // ==========================================================================================
  // HÔN NHÂN - TÍN NGƯỠNG
  // ==========================================================================================
  {
    id: "ket_hon",
    nhan: "Kết hôn - Cưới hỏi",
    moTa: "Chọn ngày cưới, ăn hỏi, đăng ký kết hôn — cần ngày giờ sinh của CẢ HAI người.",
    nhom: "Hôn nhân - Tín ngưỡng",
    canToaSon: false,
    canHaiNguoi: true,
    dungThan: {
      than: ["L.Hợp"],
      hopCan: true,
      monPhu: ["HƯU", "SINH", "KHAI"],
    },
    luuY:
      "Việc duy nhất phải lập HAI lá bàn. Nguồn lấy bên nữ làm chủ, bên nam làm phụ, rồi tìm các cung TƯƠNG GIAO giữa hai bàn: mệnh cung (vị trí can ngày), hôn nhân cung (vị trí Lục Hợp), phu cung / thê cung (vị trí can hợp với can ngày của người kia). Ngày chọn ra còn phải không xung năm sinh và ngày sinh của cả hai.",
    nguon: "zhicong-11.md, Video 19",
  },
  {
    id: "cung_than",
    nhan: "Cúng thần - Bái Phật",
    moTa: "Chọn ngày dâng lễ, cúng bái — mỗi vị thần/Phật có hệ tượng Kỳ Môn riêng nên phải chọn đúng vị cần cúng.",
    nhom: "Hôn nhân - Tín ngưỡng",
    canToaSon: false,
    boQuaKhongVong: true,
    dungThan: {},
    luaChonPhu: {
      nhan: "Vị thần / Phật cần cúng",
      moTa: "Mỗi vị ứng với một tổ hợp can - tinh - môn - thần riêng trong Kỳ Môn, nên ngày tốt cũng khác nhau.",
      ds: [
        { id: "tho_dia", nhan: "Thổ Địa", dungThan: { than: ["C.Địa"] } },
        { id: "to_tien", nhan: "Gia tiên (bài vị tổ tiên)", dungThan: { than: ["T.Âm", "C.Địa"] } },
        { id: "dia_tang", nhan: "Địa Tạng Vương Bồ Tát", dungThan: { than: ["T.Âm"] } },
        { id: "quan_am", nhan: "Quan Âm Bồ Tát", dungThan: { sao: ["T.Nhuế"] } },
        { id: "phat_to", nhan: "Phật Tổ / Đại Nhật Như Lai", dungThan: { than: ["T.Phù"], can: ["Bính"] } },
        { id: "di_lac", nhan: "Phật Di Lặc", dungThan: { sao: ["T.Tâm"] } },
        { id: "tien_gia", nhan: "Tiên gia", dungThan: { than: ["Đ.Xà"] } },
        { id: "van_tai_than", nhan: "Văn Tài Thần", dungThan: { monChinh: ["SINH"], can: ["Mậu"] } },
        { id: "vo_tai_than", nhan: "Võ Tài Thần", dungThan: { monChinh: ["SINH"], than: ["B.Hổ"], can: ["Mậu", "Canh"] } },
        { id: "van_xuong", nhan: "Văn Xương Đế Quân / Khổng Tử", dungThan: { sao: ["T.Phò", "T.Nhuế"] } },
        { id: "nguyet_lao", nhan: "Nguyệt Lão / Phúc Lộc Thọ", dungThan: { than: ["L.Hợp"] } },
      ],
    },
    luuY:
      "Nguồn nhấn mạnh với việc cúng thần thì QUÁI TƯỢNG quan trọng hơn thần sát, và gặp Không Vong cũng không sao — nên hệ thống không loại ngày vì Không Vong ở việc này (khác toàn bộ các việc còn lại).",
    nguon: "zhicong-11.md, Video 12",
  },

  // ==========================================================================================
  // TANG LỄ
  // ==========================================================================================
  {
    id: "an_tang",
    nhan: "An táng - Hạ huyệt",
    moTa: "Chọn ngày an táng, hạ huyệt, cải táng hoặc động thổ xây mộ phần.",
    nhom: "Tang lễ",
    canToaSon: true,
    ghiChuToaSon:
      "Bắt buộc có toạ sơn mộ phần: nguồn yêu cầu toạ sơn không được Không Vong và ba hung thần Bạch Hổ / Đằng Xà / Huyền Vũ không được bay đến toạ sơn.",
    dungThan: {
      monChinh: ["TỬ"],
      than: ["C.Địa"],
      thanKy: ["Đ.Xà", "H.Vũ"],
    },
    quyTacRieng: ["tu_mon_khong_tuong_khac", "tranh_phuong_thai_tue"],
    luuY:
      "Âm trạch dùng Tử Môn làm biểu tượng mộ phần (khác dương trạch dùng Sinh Môn). Nguồn yêu cầu thêm: tại cung Tử Môn, sao thiên bàn và địa bàn không được tương khắc.",
    nguon:
      "ky-mon-don-giap-thuc-chien-truong-chan-xuan.md, Bài giảng thứ năm mục III (Nguyên tắc 3 và 4); đối chiếu ky-mon-don-giap-bi-kip-toc-thanh.md phần nhật khoá thực tế",
  },
];

export function traViec(id: string): ViecTrachCat | undefined {
  return DANH_MUC_VIEC_TRACH_CAT.find((v) => v.id === id);
}

/** 24 sơn rút gọn về 8 hướng bát quái — dùng cho ô chọn toạ sơn ở giao diện. */
export const DANH_SACH_TOA_SON: { id: number; nhan: string; chi: string[] }[] = [
  { id: 1, nhan: "Toạ Bắc (Khảm) - hướng Nam", chi: ["Tý"] },
  { id: 8, nhan: "Toạ Đông Bắc (Cấn) - hướng Tây Nam", chi: ["Sửu", "Dần"] },
  { id: 3, nhan: "Toạ Đông (Chấn) - hướng Tây", chi: ["Mão"] },
  { id: 4, nhan: "Toạ Đông Nam (Tốn) - hướng Tây Bắc", chi: ["Thìn", "Tỵ"] },
  { id: 9, nhan: "Toạ Nam (Ly) - hướng Bắc", chi: ["Ngọ"] },
  { id: 2, nhan: "Toạ Tây Nam (Khôn) - hướng Đông Bắc", chi: ["Mùi", "Thân"] },
  { id: 7, nhan: "Toạ Tây (Đoài) - hướng Đông", chi: ["Dậu"] },
  { id: 6, nhan: "Toạ Tây Bắc (Càn) - hướng Đông Nam", chi: ["Tuất", "Hợi"] },
];
