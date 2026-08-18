/**
 * BẢNG 12 TRỰC — ĐÁNH GIÁ TỔNG QUÁT + NÊN/KỴ + MỨC ĐỘ THEO TỪNG MỤC ĐÍCH CÔNG VIỆC.
 *
 * Nguồn:
 *   • Đánh giá tổng quát (`danhGia`): chủ dự án cung cấp trực tiếp 2026-08-15.
 *   • Tính chất + nên/kỵ + phân mức theo mục đích: tài liệu chủ dự án cung cấp 2026-08-18
 *     "12 Trực — Phân loại tốt xấu theo mục đích công việc"
 *     (lưu tại `docs/12-truc-nen-ky-theo-muc-dich.md`). Bản thân cách tính Trực theo tiết khí ở
 *     `truc.ts` lấy từ "Ngọc Hạp Thông Thư – Hứa Chân Quân".
 *
 * ⚠️ NGUYÊN TẮC BẮT BUỘC (trích nguyên văn tài liệu nguồn):
 *
 *   "12 Trực nên được dùng như một LỚP đánh giá theo mục đích công việc, không nên dùng độc lập
 *    để kết luận ngày tốt hoặc ngày xấu tuyệt đối… Không nên code theo kiểu `Trực Thành = ngày
 *    tốt` hoặc `Trực Phá = ngày xấu`."
 *
 * Vì vậy file này KHÔNG phải bộ chấm điểm. Trực chỉ là MỘT lớp; cát/hung thần (Tam Nương, Nguyệt
 * Kỵ, Sát Chủ, Hoàng/Hắc đạo, tuổi người dùng…) vẫn phải xét độc lập và có thể phủ quyết Trực.
 * Khi một module xếp khác bảng này, bắt buộc ghi rõ lý do tại chỗ (xem ví dụ lệch bên dưới).
 *
 * Ví dụ lệch có chủ ý đang tồn tại:
 *   • `kyHopDongCaoCap.ts` cho Trực Mãn 9/10 (bảng này xếp ⚠️) — chủ dự án chốt riêng cho ký kết.
 *   • `kyHopDongCaoCap.ts` cho Trực Trừ 5/10 — "trừ bỏ cái cũ" hợp thanh lý hơn là ký mới.
 *   • `kyHopDongCaoCap.ts` loại thẳng Trực Phá — với ký kết thì không nằm trong số việc Phá dùng được.
 *
 * Về ma trận `mucDich`: CHỈ điền những ô tài liệu nguồn nêu rõ (cột "Nên dùng"/"Không nên dùng",
 * phần "Phân nhóm nhanh", và ví dụ Trực Thành). Ô nào tài liệu không nói thì BỎ TRỐNG — khi tra sẽ
 * mặc định "bình-thuong (cần xét thêm)", KHÔNG suy đoán thêm mức độ.
 */

export type TrucDanhGia = "tot" | "than_trong" | "xau";

/** Mức độ phù hợp của một Trực cho một mục đích cụ thể. */
export type MucDo = "dai-cat" | "hop" | "binh-thuong" | "ky";

/** Các mục đích công việc chuẩn hoá — dùng làm khoá tra chung cho mọi module xem ngày. */
export type MucDichKey =
  | "khai-truong"
  | "cuoi-hoi"
  | "ky-hop-dong"
  | "nhan-chuc"
  | "dong-tho"
  | "nhap-trach"
  | "an-tang"
  | "xuat-hanh"
  | "cau-tai"
  | "chua-benh"
  | "pha-do";

export const MUC_DICH_LABEL: Readonly<Record<MucDichKey, string>> = {
  "khai-truong": "Khai trương – mở cửa hàng",
  "cuoi-hoi": "Cưới hỏi – kết hôn",
  "ky-hop-dong": "Ký hợp đồng – lập cam kết",
  "nhan-chuc": "Nhận chức – nhậm chức",
  "dong-tho": "Động thổ – xây dựng",
  "nhap-trach": "Nhập trạch – về nhà mới",
  "an-tang": "An táng – chôn cất",
  "xuat-hanh": "Xuất hành – đi xa",
  "cau-tai": "Cầu tài – thu tiền, giao dịch",
  "chua-benh": "Chữa bệnh – trừ tà, giải hạn",
  "pha-do": "Phá dỡ – thanh lý cái cũ",
};

export interface TrucTongQuatEntry {
  ten: string;
  han: string;
  yNghia: string;
  /** Tính chất chính của Trực (theo tài liệu nguồn). */
  tinhChat: string;
  /** Mức độ tổng quát do chủ dự án chốt — chỉ để tham chiếu, KHÔNG dùng ra điểm. */
  danhGia: TrucDanhGia;
  /** Việc NÊN làm (nguyên văn cột "Nên dùng cho" của tài liệu nguồn). */
  nen: readonly string[];
  /** Việc KỴ làm (nguyên văn cột "Không nên dùng cho"). */
  ky: readonly string[];
  /**
   * Mức độ theo từng mục đích. CHỈ chứa ô tài liệu nêu rõ; ô thiếu = "bình-thuong" khi tra.
   */
  mucDich: Partial<Record<MucDichKey, MucDo>>;
  /** Ghi chú riêng, nếu có. */
  ghiChu?: string;
}

export const TRUC_DANH_GIA_TONG_QUAT: readonly TrucTongQuatEntry[] = [
  {
    ten: "Kiến",
    han: "建",
    yNghia: "dựng, bắt đầu",
    tinhChat: "Khởi đầu, dựng lập",
    danhGia: "than_trong",
    nen: ["khai trương", "bắt đầu công việc", "xuất hành", "nhận chức", "động thổ", "dựng nhà"],
    ky: ["chôn cất – mai táng", "việc cần kết thúc"],
    mucDich: {
      "khai-truong": "dai-cat",
      "dong-tho": "dai-cat",
      "nhan-chuc": "hop",
      "xuat-hanh": "hop",
      "nhap-trach": "hop",
      "an-tang": "ky",
      "pha-do": "ky",
    },
  },
  {
    ten: "Trừ",
    han: "除",
    yNghia: "loại bỏ, thanh trừ",
    tinhChat: "Loại bỏ, giải trừ",
    danhGia: "tot",
    nen: ["chữa bệnh", "trừ tà – giải hạn", "dọn dẹp", "phá bỏ", "xử lý việc xấu"],
    ky: ["cưới hỏi", "khai trương", "ký kết việc cần lâu dài"],
    mucDich: {
      "chua-benh": "dai-cat",
      "pha-do": "dai-cat",
      "khai-truong": "ky",
      "cuoi-hoi": "ky",
      "ky-hop-dong": "ky",
    },
  },
  {
    ten: "Mãn",
    han: "滿",
    yNghia: "đầy đủ, sung mãn",
    tinhChat: "Đầy đủ, sung túc",
    danhGia: "than_trong",
    nen: ["cầu tài", "thu tiền", "giao dịch", "tiệc tùng", "kết hôn", "nhập kho"],
    ky: ["việc cần khiêm tốn – giảm bớt", "mai táng (tùy hệ phái)"],
    mucDich: {
      "cau-tai": "dai-cat",
      "cuoi-hoi": "hop",
      "khai-truong": "hop",
      "ky-hop-dong": "hop",
    },
    ghiChu: "Mai táng: tài liệu ghi 'tùy hệ phái' — không tự kết luận, để module an táng tự xét.",
  },
  {
    ten: "Bình",
    han: "平",
    yNghia: "bình ổn",
    tinhChat: "Bình ổn, cân bằng",
    danhGia: "than_trong",
    nen: ["sửa chữa nhỏ", "giao dịch thông thường", "đi lại", "xử lý việc thường nhật"],
    ky: ["việc đại sự cần khí thế mạnh (khai trương, cưới hỏi lớn)"],
    mucDich: {
      "cau-tai": "hop",
      "xuat-hanh": "hop",
      "khai-truong": "ky",
      "cuoi-hoi": "ky",
    },
  },
  {
    ten: "Định",
    han: "定",
    yNghia: "định lập, ổn định",
    tinhChat: "Ổn định, quyết định",
    danhGia: "tot",
    nen: ["ký hợp đồng", "cưới hỏi", "lập cam kết", "nhận chức", "giao dịch", "đặt nền móng"],
    ky: ["di chuyển xa", "thay đổi lớn", "phá dỡ"],
    mucDich: {
      "ky-hop-dong": "dai-cat",
      "cuoi-hoi": "hop",
      "nhan-chuc": "hop",
      "cau-tai": "hop",
      "dong-tho": "hop",
      "nhap-trach": "hop",
      "xuat-hanh": "ky",
      "pha-do": "ky",
    },
  },
  {
    ten: "Chấp",
    han: "執",
    yNghia: "nắm giữ, chấp trì",
    tinhChat: "Nắm giữ, chấp hành",
    danhGia: "tot",
    nen: ["thu tiền", "nhập kho", "bắt giữ", "sửa chữa", "xây dựng một số việc"],
    ky: ["khai trương", "xuất hành", "cưới hỏi", "việc cần sự lưu thông"],
    mucDich: {
      "cau-tai": "hop",
      "dong-tho": "hop",
      "khai-truong": "ky",
      "xuat-hanh": "ky",
      "cuoi-hoi": "ky",
    },
  },
  {
    ten: "Phá",
    han: "破",
    yNghia: "phá bỏ",
    tinhChat: "Phá bỏ, kết thúc",
    danhGia: "xau",
    nen: ["phá dỡ", "giải quyết việc tồn đọng", "xử lý tranh chấp", "phá cái cũ"],
    ky: ["cưới hỏi", "khai trương", "ký hợp đồng", "nhập trạch", "động thổ"],
    mucDich: {
      "pha-do": "dai-cat",
      "chua-benh": "hop",
      "cuoi-hoi": "ky",
      "khai-truong": "ky",
      "ky-hop-dong": "ky",
      "nhap-trach": "ky",
      "dong-tho": "ky",
    },
    ghiChu: "Nguồn nhấn mạnh: Phá không xấu tuyệt đối — hợp việc phá dỡ, loại bỏ, xử lý cái cũ.",
  },
  {
    ten: "Nguy",
    han: "危",
    yNghia: "nguy hiểm",
    tinhChat: "Nguy hiểm, bất ổn",
    danhGia: "than_trong",
    nen: ["một số việc nhỏ", "nghiên cứu – học tập (tùy hệ thống)"],
    ky: ["xuất hành xa", "động thổ", "cưới hỏi", "khai trương", "việc trọng đại"],
    mucDich: {
      "xuat-hanh": "ky",
      "dong-tho": "ky",
      "cuoi-hoi": "ky",
      "khai-truong": "ky",
    },
  },
  {
    ten: "Thành",
    han: "成",
    yNghia: "thành tựu, hoàn thành",
    tinhChat: "Thành tựu, hoàn thành",
    danhGia: "tot",
    nen: ["khai trương", "ký kết", "cưới hỏi", "nhập trạch", "nhận chức", "cầu tài", "giao dịch"],
    ky: ["phá dỡ", "kiện tụng", "chữa bệnh", "việc cần tiêu trừ"],
    mucDich: {
      // Theo ví dụ Trực Thành trong tài liệu: Khai trương "Rất hợp"; các việc lập/thành còn lại "Hợp";
      // Động thổ "Hợp nhưng phải xét thêm"; An táng "không tự động kết luận tốt" (để trống); Phá dỡ "không sở trường".
      "khai-truong": "dai-cat",
      "ky-hop-dong": "hop",
      "cuoi-hoi": "hop",
      "nhan-chuc": "hop",
      "nhap-trach": "hop",
      "cau-tai": "hop",
      "dong-tho": "hop",
      "pha-do": "ky",
      "chua-benh": "ky",
    },
  },
  {
    // Tên chuẩn theo `TRUC_NAMES` (truc.ts) là "Thu" (收). Trước đây bảng để "Thâu" nên
    // getTrucDanhGiaTongQuat(ngayInfo.truc.name) trả undefined cho ngày Trực Thu — đã sửa về "Thu".
    ten: "Thu",
    han: "收",
    yNghia: "thu nhận, thu hoạch",
    tinhChat: "Thu vào, thu hoạch",
    danhGia: "than_trong",
    nen: ["thu tiền", "nhập kho", "nhận tài sản", "kết toán", "cầu tài"],
    ky: ["khai trương", "xuất hành", "bắt đầu dự án lớn"],
    mucDich: {
      "cau-tai": "dai-cat",
      "khai-truong": "ky",
      "xuat-hanh": "ky",
    },
    ghiChu: "Còn đọc là 'Thâu'.",
  },
  {
    ten: "Khai",
    han: "開",
    yNghia: "mở, khai thông",
    tinhChat: "Mở ra, thông đạt",
    danhGia: "tot",
    nen: ["khai trương", "mở cửa hàng", "bắt đầu dự án", "xuất hành", "cầu tài", "giao dịch"],
    ky: ["an táng", "đóng cửa", "chấm dứt công việc"],
    mucDich: {
      "khai-truong": "dai-cat",
      "cau-tai": "hop",
      "xuat-hanh": "hop",
      "an-tang": "ky",
      "pha-do": "ky",
    },
  },
  {
    ten: "Bế",
    han: "閉",
    yNghia: "đóng, bế tàng",
    tinhChat: "Đóng lại, kết thúc",
    danhGia: "xau",
    nen: ["đóng cửa", "chôn cất – an táng (tùy hệ)", "xây tường", "phong tỏa", "bảo mật"],
    ky: ["khai trương", "cưới hỏi", "ký hợp đồng", "xuất hành", "bắt đầu việc mới"],
    mucDich: {
      "an-tang": "hop",
      "khai-truong": "ky",
      "cuoi-hoi": "ky",
      "ky-hop-dong": "ky",
      "xuat-hanh": "ky",
    },
    ghiChu: "An táng: tài liệu ghi 'theo một số hệ' — module an táng vẫn phải xét thần sát riêng.",
  },
] as const;

/**
 * Tra đánh giá tổng quát + nên/kỵ của một Trực theo TÊN.
 *
 * Nhận cả tên chuẩn "Thu" lẫn biến thể "Thâu". Trả `undefined` nếu không nằm trong 12 Trực.
 */
export function getTrucDanhGiaTongQuat(tenTruc: string): TrucTongQuatEntry | undefined {
  const ten = tenTruc === "Thâu" ? "Thu" : tenTruc;
  return TRUC_DANH_GIA_TONG_QUAT.find((t) => t.ten === ten);
}

const NHAN_MUC_DO: Readonly<Record<MucDo, string>> = {
  "dai-cat": "Rất phù hợp",
  hop: "Phù hợp",
  "binh-thuong": "Bình thường – cần xét thêm",
  ky: "Không nên",
};

export interface KetQuaTrucMucDich {
  truc: string;
  mucDich: MucDichKey;
  mucDichLabel: string;
  mucDo: MucDo;
  /** Nhãn ngắn gọn để hiển thị: "Rất phù hợp" | "Phù hợp" | "Bình thường – cần xét thêm" | "Không nên". */
  nhan: string;
  /** Câu mô tả sẵn để hiển thị cho khách. */
  moTa: string;
}

/**
 * Tra mức độ phù hợp của một Trực cho MỘT mục đích công việc — LỚP tham chiếu, không phải điểm số.
 *
 * Ô nào tài liệu nguồn không nêu rõ thì trả "bình-thuong (cần xét thêm)", KHÔNG suy đoán. Chỗ gọi
 * vẫn phải kết hợp thần sát / hoàng đạo / tuổi trước khi kết luận ngày.
 *
 * @param tenTruc Tên Trực (vd `ngayInfo.truc.name`), chấp nhận cả "Thu"/"Thâu".
 * @returns `undefined` nếu tên Trực không hợp lệ.
 */
export function danhGiaTrucTheoMucDich(tenTruc: string, mucDich: MucDichKey): KetQuaTrucMucDich | undefined {
  const truc = getTrucDanhGiaTongQuat(tenTruc);
  if (!truc) return undefined;
  const mucDo: MucDo = truc.mucDich[mucDich] ?? "binh-thuong";
  const label = MUC_DICH_LABEL[mucDich];
  const nhan = NHAN_MUC_DO[mucDo];
  const moTa =
    mucDo === "binh-thuong"
      ? `Trực ${truc.ten} (${truc.tinhChat.toLowerCase()}) không thiên rõ cho việc ${label.toLowerCase()} — cần xét thêm thần sát, hoàng đạo và tuổi.`
      : `Trực ${truc.ten} — ${nhan.toLowerCase()} với việc ${label.toLowerCase()} (${truc.tinhChat.toLowerCase()}).`;
  return { truc: truc.ten, mucDich, mucDichLabel: label, mucDo, nhan, moTa };
}
