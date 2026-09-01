/**
 * Bảng giá các công cụ thu phí — NGUỒN SỰ THẬT DUY NHẤT về giá.
 *
 * ⚠️ Mọi chỗ tính tiền phải đọc từ đây, KHÔNG bao giờ nhận số tiền client gửi lên. Trang .astro chỉ
 * hiển thị giá cho khách xem; con số quyết định đơn hàng luôn lấy từ file này ở phía máy chủ.
 */
/**
 * ⚠️ CHỐT GIÁ 27/8/2026 (anh Công: "không để 499k nữa mà để thẳng 500k, các giá khác cũng làm tròn").
 *
 * Ngoài việc làm tròn, bảng giá được PHÂN TẦNG LẠI theo MỨC HỆ TRỌNG của quyết định — trước đây
 * 499k xuất hiện 7 lần cho những việc có sức nặng rất khác nhau (chọn ngày cưới = việc cả đời, ngang
 * giá chọn ngày ký hợp đồng = làm lại được), khiến khách tinh ý thấy giá đặt theo cảm tính:
 *
 *   1.000.000đ — việc CẢ ĐỜI, không làm lại được: hợp hôn, an táng đầy đủ, động thổ/nhập trạch.
 *     500.000đ — việc LỚN, ảnh hưởng nhiều năm: cưới hỏi, đặt tên con, chọn giờ sinh, nghề nghiệp…
 *     300.000đ — việc THƯỜNG, lặp lại được: ký hợp đồng, khai trương, luận mệnh mức cơ bản.
 *     200.000đ / 150.000đ — CỬA VÀO cho khách chưa từng mua, giá đủ thấp để thử.
 */
export const GIA_CONG_CU = {
  // ─ Hạng 1.000.000đ — việc cả đời ─────────────────────────────────────────────────────────────
  "xem-ngay-cao-cap": 1000000,
  // Hợp Hôn: cần ĐỦ 2 lá số (gấp đôi dữ liệu đầu vào so với mọi module khác), chạy 6 tầng qua cả
  // Bát Tự lẫn Tử Vi, phục vụ quyết định lớn nhất đời người.
  "hop-hon": 1000000,
  // Bản ĐỘC LẬP cho app Quân Sư (từ 1/9/2026, xem project_quan_su_tach_doc_lap_khoi_web) — cùng
  // giá, cùng engine `tinhHopHon`, chỉ khác toolSlug để tách bạch đơn hàng web/app trong thống kê.
  "hop-hon-qs": 1000000,

  // ─ Hạng 500.000đ — việc lớn ──────────────────────────────────────────────────────────────────
  "gio-liem-ha-huyet": 500000, // = bậc CƠ BẢN; bậc đầy đủ 1.000.000đ xem GIA_GIO_LIEM_HA_HUYET
  "ngay-cuoi-hoi": 500000,
  "dat-ten-cho-con": 500000,
  "nhan-chuc": 500000,
  // Bản ĐỘC LẬP cho app Quân Sư (từ 1/9/2026, xem project_quan_su_tach_doc_lap_khoi_web) — cùng
  // giá, cùng engine `calculateNhanChuc`, chỉ khác toolSlug để tách bạch đơn hàng web/app. Bản
  // web có bug không gửi PDF/email cho khách — bản này CỐ Ý COPY ĐÚNG hành vi đó, không tự vá.
  "nhan-chuc-qs": 500000,
  "dinh-huong-nghe-nghiep": 500000,
  // Bản ĐỘC LẬP cho app Quân Sư (từ 1/9/2026, xem project_quan_su_tach_doc_lap_khoi_web) — cùng
  // giá, cùng engine `castBatTuFacts`/`taoHoSoNghe`, chỉ khác toolSlug để tách bạch đơn hàng.
  "dinh-huong-nghe-nghiep-qs": 500000,
  "trach-nhat-sinh-no": 500000,
  // Bản ĐỘC LẬP cho app Quân Sư (từ 1/9/2026, xem project_quan_su_tach_doc_lap_khoi_web) — cùng
  // giá, cùng engine `phanTichTrachNhatSinhNo`, chỉ khác toolSlug để tách bạch đơn hàng web/app.
  "trach-nhat-sinh-no-qs": 500000,
  "trach-cat-ky-mon": 500000,
  // ⚠️ Trước 27/8/2026 để 999.999đ — con số này KHÔNG phải giá thật mà là số đặt tạm rồi quên (không
  // ai định giá lẻ tới hàng đơn vị). Chốt về 500.000đ: module luận số để khách quyết có nên bỏ vài
  // triệu mua sim hay không, giá trị ngang các module "việc lớn" khác.
  "sim-phong-thuy-khai-van": 500000,

  // ─ Hạng 300.000đ — việc thường ───────────────────────────────────────────────────────────────
  "ngay-khai-truong-cao-cap": 300000,
  "ngay-ky-hop-dong-cao-cap": 300000,
  "ky-mon-menh-chi-tiet": 300000,
  // Bản ĐỘC LẬP cho app Quân Sư (từ 1/9/2026, xem project_quan_su_tach_doc_lap_khoi_web) — cùng
  // giá, cùng engine `lapLaBan`/`luanGiaiMenh`, chỉ khác toolSlug để tách bạch đơn hàng web/app.
  "ky-mon-menh-chi-tiet-qs": 300000,
  // Đẩu Thủ Chọn Ngày — hệ đối chiếu chéo/thay thế cho Xem Ngày Cao Cấp (HKĐQ), phạm vi tương
  // đương "chọn ngày theo tọa" chứ không phải quyết định cả đời như HKĐQ → giá 300.000đ (chủ dự
  // án chốt 1/9/2026, giá thẳng khi giao việc, chưa qua vòng đối chiếu tầng giá như bảng trên).
  "dau-thu-chon-ngay": 300000,

  // ─ Luận Giải Bát Tự Toàn Diện — 1 GÓI DUY NHẤT (anh Công chốt 1/9/2026) ─────────────────────
  // Trước đây tách 2 bậc Cơ Bản 300k / Trọn Đời 700k, nhưng gây 2 bug: (1) khách mua Cơ Bản cho
  // người MỚI không thấy nút mua Nâng Cao nếu tài khoản từng mua Nâng Cao cho người KHÁC trước đó
  // (gate tính theo "đơn Nâng Cao gần nhất" chứ không theo đúng lá số); (2) trang admin có thể hiện
  // ĐỒNG THỜI báo cáo Cơ Bản của người A và báo cáo Nâng Cao của người B (2 luồng đơn độc lập, có
  // thể là 2 người khác nhau) → "lẫn lộn ngày sinh của anh và của khách". Gộp về 1 gói loại bỏ cả
  // 2 bug vì chỉ còn 1 luồng đơn duy nhất. Khách đã mua CHỈ Cơ Bản trước đây (slug "…-co-ban")
  // được coi như đã mua đủ gói mới — xem logic grandfather ở luan-giai-bat-tu-toan-dien.astro.
  "luan-giai-bat-tu-toan-dien": 700000,
  // ⚠️ 2 slug dưới đây KHÔNG còn bán mới (checkout chỉ tạo đơn "…-toan-dien" ở trên) — GIỮ LẠI
  // trong bảng giá vì đơn CŨ trong DB vẫn tham chiếu đúng các slug này (đổi/xoá sẽ làm vỡ kiểu
  // ToolSlug ở những chỗ đọc lại đơn cũ, xem orders.ts + luan-giai-bat-tu-toan-dien.astro).
  "luan-giai-bat-tu-co-ban": 300000,
  "luan-giai-bat-tu-nang-cao": 700000,

  // ─ Luận Giải Tử Vi — 1 GÓI DUY NHẤT (anh Công chốt 1/9/2026, cùng đợt và cùng lý do Bát Tự ở
  // trên) — phát hiện thêm 1 bug khi gộp: checkout.ts CŨ có 1 chốt chặn RIÊNG "chỉ admin được mua"
  // sót lại từ hồi 26/8/2026 (trước khi MODULE_KHOA_THU_NGHIEM gỡ khoá 31/8/2026), khiến TÀI KHOẢN
  // KHÁCH THẬT không tạo được đơn dù module đã mở bán — đã gỡ chốt đó cùng lúc gộp gói.
  "luan-giai-tu-vi-toan-dien": 500000,
  // ⚠️ 2 slug dưới đây KHÔNG còn bán mới — GIỮ LẠI vì đơn CŨ trong DB vẫn tham chiếu đúng các slug
  // này (xem orders.ts + luan-giai-tu-vi.astro).
  "luan-giai-tu-vi-co-ban": 200000,
  "luan-giai-tu-vi-nang-cao": 500000,

  // ─ Cửa vào — cho khách chưa từng mua ─────────────────────────────────────────────────────────
  "ky-mon-hoi-dap": 200000,
} as const;

/**
 * Module ĐANG KHÓA THU PHÍ để thử nghiệm nội bộ — khách KHÔNG mua được, chỉ tài khoản quản trị
 * chạy thử được trọn luồng.
 *
 * ⚠️ Anh Công chốt 27/8/2026: *"hiện tại anh chưa muốn cho chạy thu phí 2 mục này vội, anh cần test
 * kỹ đã"* (Luận Giải Bát Tự Toàn Diện + Luận Giải Tử Vi). Vừa đổi giá và làm sâu bản xem trước nên
 * cần chạy thử kỹ trước khi mở cho khách.
 *
 * **GỠ KHÓA 31/8/2026** (anh Công: "em cứ mở ra luôn để anh test tổng thể") — danh sách để rỗng.
 * Gỡ khóa = xoá slug khỏi danh sách này. KHÔNG cần sửa chỗ nào khác.
 */
export const MODULE_KHOA_THU_NGHIEM: readonly ToolSlug[] = [] as const;

/** true = module đang khóa, khách thường không được tạo đơn (admin vẫn chạy thử được). */
export function dangKhoaThuNghiem(slug: ToolSlug): boolean {
  return MODULE_KHOA_THU_NGHIEM.includes(slug);
}

/**
 * Giá "gốc" hiển thị gạch ngang cạnh giá thật để tạo hiệu ứng đã giảm giá — THUẦN QUẢNG CÁO,
 * không dùng để tính tiền (tiền luôn lấy từ GIA_CONG_CU). Chỉ thêm slug nào Công yêu cầu hiệu ứng
 * này (Kỳ Môn Hỏi Đáp: 199k thật, hiện kèm 399k gạch ngang -50%, theo yêu cầu 2026-08-25).
 */
export const GIA_GOC_HIEN_THI: Partial<Record<ToolSlug, number>> = {
  "ky-mon-hoi-dap": 400000, // giá thật 200.000đ → hiện "-50%"
  "trach-cat-ky-mon": 1000000, // giá thật 500.000đ → hiện "-50%"
};

export type ToolSlug = keyof typeof GIA_CONG_CU;

/**
 * Module tang lễ có HAI BẬC GIÁ (đặc tả Phase 2 mục 8) — đây là ĐỊNH TUYẾN, không phải upsell:
 *
 *   - Gia đình CHƯA có huyệt (hỏa táng, gửi chùa, chưa mua đất) → gói cơ bản là sản phẩm ĐÚNG với
 *     họ. Không có tọa mộ để nhập thì gói đầy đủ vô nghĩa, tuyệt đối không gợi ý nâng cấp.
 *   - Gia đình ĐÃ có huyệt → gói đầy đủ mới đúng; gói cơ bản với họ là thiếu, không phải rẻ hơn.
 *
 * `GIA_CONG_CU["gio-liem-ha-huyet"]` giữ nguyên bằng giá gói cơ bản để các chỗ dùng chung (bảng
 * giá, mã khuyến mãi, trang danh sách công cụ) không phải sửa gì.
 */
export const GIA_GIO_LIEM_HA_HUYET = {
  /** Chỉ Phase 1 — chưởng pháp + thần sát trạch nhật. */
  coBan: 500000,
  /** Phase 1 + Phase 2 — lọc và xếp hạng lại theo tọa hướng huyệt mộ. Chủ dự án chốt 2026-08-17. */
  dayDu: 1000000,
} as const;

/**
 * Bậc giá suy từ việc CÓ TỌA ĐỘ HUYỆT hay không.
 *
 * ⚠️ Chỉ được gọi ở phía máy chủ với tọa độ đã kiểm. Không bao giờ nhận bậc giá do client gửi —
 * nếu không, ai cũng tự khai "gói cơ bản" rồi vẫn nhận kết quả Phase 2.
 */
export function giaGioLiemHaHuyet(coToaHuyet: boolean): number {
  return coToaHuyet ? GIA_GIO_LIEM_HA_HUYET.dayDu : GIA_GIO_LIEM_HA_HUYET.coBan;
}

export function laToolSlug(v: unknown): v is ToolSlug {
  // Dùng Object.hasOwn chứ KHÔNG dùng `in`: toán tử `in` xét cả chuỗi nguyên mẫu nên
  // laToolSlug("toString") / ("constructor") sẽ trả về true, lọt qua kiểm tra đầu vào.
  return typeof v === "string" && Object.hasOwn(GIA_CONG_CU, v);
}

/** Định dạng tiền để hiển thị, vd 500000 → "500.000đ". */
export function dinhDangTien(soTien: number): string {
  return `${soTien.toLocaleString("vi-VN")}đ`;
}

/**
 * Nhãn giá "500.000đ / lượt" để hiển thị trên thẻ dịch vụ.
 *
 * ⚠️ BẮT BUỘC dùng hàm này thay vì gõ tay chuỗi giá vào UI. Phát hiện 27/8/2026: có tới 42 chỗ trong
 * `src/` gõ cứng chuỗi giá ("499.000đ / lượt"…) tách rời khỏi `GIA_CONG_CU`, nên khi đổi giá ở đây
 * thì trang vẫn hiện giá CŨ trong khi thanh toán tính giá MỚI — khách thấy một đằng trả một nẻo,
 * mất niềm tin và dễ thành khiếu nại. Sinh nhãn từ đúng một nguồn thì không bao giờ lệch được nữa.
 */
export function nhanGiaLuot(slug: ToolSlug): string {
  return `${dinhDangTien(GIA_CONG_CU[slug])} / lượt`;
}
