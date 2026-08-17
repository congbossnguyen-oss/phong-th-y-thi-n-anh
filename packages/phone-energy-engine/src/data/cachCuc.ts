/**
 * Các "cách cục" — câu chốt về bản chất của một dãy số, luận CHÍNH từ ba số cuối.
 *
 * Danh sách tên cách cục do chủ dự án đưa 2026-08-17 ("số này là Ngũ Quỷ vận tài, hay quý nhân
 * chiêu cảm bát phương tài, hay số này là cách cục ông chủ lớn…"). Phần diễn giải của từng cách
 * KHÔNG được bịa: mỗi câu đều ghép từ mục Tài vận / Sự nghiệp / Quý nhân của `mo-ta-8-tinh.md`, và
 * `canCu` giữ lại nguyên văn để rà ngược.
 *
 * Điều kiện kích hoạt luôn ưu tiên ĐUÔI SỐ, vì đó là chỗ quyết định kết cục (SKILL Bước 3). Năng
 * lượng nằm giữa dãy chỉ đóng vai phụ trợ — dùng làm điều kiện đi kèm chứ không tự kích hoạt.
 */
import type { TenTinh } from "../types.js";

/**
 * `tốt` — nên giữ số. `hai mặt` — được việc này mất việc kia, phải biết mà dùng.
 * `cần lưu ý` — khuyết điểm thật, nói thẳng.
 */
export type LoaiCachCuc = "tốt" | "hai mặt" | "cần lưu ý";

export interface BoiCanhCachCuc {
  /** Tinh có mặt trong (các cặp thuộc) ba số cuối. */
  oDuoi: ReadonlySet<TenTinh>;
  /** Tinh có mặt ở bất kỳ đâu trong dãy. */
  trongDay: ReadonlySet<TenTinh>;
  /** Tinh nằm ở đuôi mà CHƯA được cát tinh bên phải hoá giải (Cơ chế A). */
  oDuoiChuaHoaGiai: ReadonlySet<TenTinh>;
}

export interface DinhNghiaCachCuc {
  ma: string;
  ten: string;
  loai: LoaiCachCuc;
  dieuKien: (b: BoiCanhCachCuc) => boolean;
  dienGiai: string;
  canCu: string;
}

export const CACH_CUC: readonly DinhNghiaCachCuc[] = [
  {
    ma: "ngu_quy_van_tai",
    ten: "Ngũ Quỷ vận tài",
    loai: "hai mặt",
    dieuKien: (b) => b.oDuoi.has("Ngũ Quỷ") && b.trongDay.has("Thiên Y"),
    dienGiai:
      "Ngũ Quỷ nằm ở đuôi mà trong dãy lại có Thiên Y đỡ — đây là cách hung tinh được dùng để vận tài. Tiền vào nhanh, nhạy cơ hội, hợp buôn bán và những việc xoay vòng liên tục. Nhưng đúng như bản chất Ngũ Quỷ, tiền đến nhanh thì đi cũng nhanh, không ổn định; phải chủ động cất giữ chứ đừng để tiền nằm trong tay lâu.",
    canCu:
      "Ngũ Quỷ — Tài vận: “Buôn bán… tiền đến nhanh đi cũng nhanh, không ổn định”. Thiên Y — Tài vận: “Tiền tài đến từ tám phương”.",
  },
  {
    ma: "quy_nhan_chieu_cam",
    ten: "Quý nhân chiêu cảm, bát phương tài",
    loai: "tốt",
    dieuKien: (b) =>
      b.trongDay.has("Sinh Khí") &&
      b.trongDay.has("Thiên Y") &&
      (b.oDuoi.has("Sinh Khí") || b.oDuoi.has("Thiên Y")),
    dienGiai:
      "Dãy số có đủ cả Sinh Khí lẫn Thiên Y, lại kết bằng một trong hai — tiền tài đến từ tám phương và luôn có quý nhân đưa tới. Đi đâu cũng gặp người đỡ, gặp dữ hoá lành, làm việc gì cũng có người mở đường. Đây là cách cục dễ chịu nhất trong nghề: không phải giành giật mà vẫn có phần.",
    canCu:
      "Thiên Y — Tài vận: “Tiền tài đến từ tám phương (chính tài, thiên tài)”. Sinh Khí — Tài vận: “Quý nhân mang tài đến”; Quý nhân: “cứu mạng chi tinh, luôn có người trợ giúp khi nguy khốn”.",
  },
  {
    ma: "ong_chu_lon",
    ten: "Cách cục ông chủ lớn",
    loai: "tốt",
    dieuKien: (b) =>
      b.trongDay.has("Thiên Y") &&
      b.trongDay.has("Diên Niên") &&
      (b.oDuoi.has("Thiên Y") || b.oDuoi.has("Diên Niên")),
    dienGiai:
      "Thiên Y đi cùng Diên Niên và kết ở đuôi số — một bên cho tài và tầm nhìn, một bên cho sức phán đoán và khả năng gánh vác. Người dùng số này thường ngồi được ghế chủ hoặc làm cánh tay phải của người đứng đầu, quản được một mảng lớn và giữ được thành quả chứ không chỉ kiếm giỏi rồi tiêu hết.",
    canCu:
      "Thiên Y — Sự nghiệp: “Dễ thành ông chủ hoặc cánh tay đắc lực của ông chủ, công trạng tốt”. Diên Niên — Sự nghiệp: “có thể gánh vác một phương”; Tài vận: “Vất vả kiếm tiền nhưng giữ được tiền”.",
  },
  {
    ma: "som_muon_ra_lam_rieng",
    ten: "Sớm muộn cũng ra làm riêng",
    loai: "hai mặt",
    dieuKien: (b) => b.oDuoi.has("Tuyệt Mệnh"),
    dienGiai:
      "Tuyệt Mệnh nằm ở đuôi số — người dùng số này rất khó ở yên làm công ăn lương lâu dài, sớm muộn cũng tách ra làm riêng hoặc dồn tiền vào đầu tư. Quyết nhanh, dám liều, kiếm tiền nhanh hơn người khác một bước. Mặt trái là giữ tiền kém và hay quyết bằng cảm tính, nên cần một người tỉnh táo bên cạnh khi xuống tiền lớn.",
    canCu:
      "Tuyệt Mệnh — Sự nghiệp: “Đầu tư, tài chính, cổ phiếu, tự lập nghiệp — dám liều, quyết định cảm tính”; Tài vận: “Kiếm tiền nhanh hơn người khác một bước, nhưng không giữ được tiền”.",
  },
  {
    ma: "thong_minh_tai_hoa",
    ten: "Thông minh, tài hoa hơn người",
    loai: "hai mặt",
    dieuKien: (b) => b.oDuoi.has("Ngũ Quỷ"),
    dienGiai:
      "Ngũ Quỷ ở đuôi cho đầu óc nhanh khác thường: học gì cũng vào, nghĩ ra thứ người khác không nghĩ tới, giàu trí tưởng tượng và làm được nhiều nghề cùng lúc. Đây là năng lượng của người tài hoa. Nhưng cũng chính nó khiến tư tưởng hay thay đổi, khó an phận, và nếu không có cát tinh ghìm lại thì dễ bỏ dở giữa chừng.",
    canCu:
      "Ngũ Quỷ — Ưu điểm: “Tài hoa dồi dào, tư tưởng hay thay đổi, phản ứng nhanh, năng lực học tập mạnh”; Khuyết điểm: “Không ổn định”.",
  },
  {
    ma: "nghi_khac_nguoi_ma_pha_tai",
    ten: "Suy nghĩ không giống ai mà phá tài",
    loai: "cần lưu ý",
    dieuKien: (b) =>
      b.trongDay.has("Ngũ Quỷ") &&
      b.trongDay.has("Tuyệt Mệnh") &&
      (b.oDuoiChuaHoaGiai.has("Ngũ Quỷ") || b.oDuoiChuaHoaGiai.has("Tuyệt Mệnh")),
    dienGiai:
      "Ngũ Quỷ đi cùng Tuyệt Mệnh mà đuôi số lại chưa có cát tinh đủ mạnh hoá giải — đây là tổ hợp cần nói thẳng. Đầu óc nghĩ khác người, lại thêm tính dám liều và quyết bằng cảm tính, nên hay xuống tiền vào những thứ không ai làm rồi mất trắng. Tài liệu còn xếp Ngũ Quỷ nặng đi cùng Tuyệt Mệnh vào nhóm dễ liên quan bệnh nặng, nên đây là chỗ phải chú ý cả sức khoẻ chứ không riêng tiền bạc.",
    canCu:
      "Ngũ Quỷ — Nhân cách: “nhiều ý đồ, thay đổi thất thường”; Đặc thù: “Năng lượng Ngũ Quỷ cao + Tuyệt Mệnh dễ liên quan bệnh nặng”. Tuyệt Mệnh — Tài vận: “không giữ được tiền, dễ phá tài”.",
  },
  {
    ma: "thi_phi_pha_tai",
    ten: "Số thị phi, dễ phá tài vì lời nói",
    loai: "cần lưu ý",
    dieuKien: (b) =>
      b.oDuoiChuaHoaGiai.has("Họa Hại") ||
      (b.trongDay.has("Họa Hại") && b.oDuoiChuaHoaGiai.has("Tuyệt Mệnh")),
    dienGiai:
      "Họa Hại nằm ở chỗ quyết định mà chưa được hoá giải. Miệng lưỡi thì lưu loát, nói là người ta nghe, nhưng tính nóng và thẳng quá nên rất dễ sinh cãi vã, kiện tụng, mất lòng đối tác — mà phần lớn tiền mất của số này là mất vì lời nói chứ không phải vì làm ăn kém. Nếu trong dãy có Thiên Y đi kèm thì lại thành “mở miệng là được tài”; không có thì phải tự giữ mồm.",
    canCu:
      "Họa Hại — Tài vận: “Mở miệng là được tài (nếu có thêm Thiên Y), hoặc dễ vì cãi vã mà phá tài”; Quý nhân: “Không có quý nhân tương trợ, nhiều thị phi”.",
  },
  {
    ma: "nhan_duyen_tien_tai",
    ten: "Nhiều nhân duyên, tiền tài đi theo quan hệ",
    loai: "hai mặt",
    dieuKien: (b) => b.oDuoi.has("Lục Sát") && (b.trongDay.has("Thiên Y") || b.trongDay.has("Sinh Khí")),
    dienGiai:
      "Lục Sát ở đuôi mà trong dãy có cát tinh đỡ — duyên với người rất mạnh, giỏi giao tế, và tiền của số này đến chủ yếu qua quan hệ chứ không qua sức lao động thuần tuý. Hợp những nghề sống bằng mối quan hệ. Mặt cần giữ: duyên khác phái mạnh quá thì dễ lệch, và tiền hay tiêu cho người khác nên khó tích luỹ.",
    canCu:
      "Lục Sát — Tài vận: “Dựa vào quan hệ nhân mạch để kiếm tiền, tiêu tiền cho gia đình/người khác giới, không giữ được tiền”; Nhân cách: “Nhân duyên tốt, am hiểu giao tế”.",
  },
  {
    ma: "hao_huu_quy_nhan",
    ten: "Hảo hữu nhiều, quý nhân phù hộ",
    loai: "tốt",
    dieuKien: (b) => b.oDuoi.has("Sinh Khí"),
    dienGiai:
      "Sinh Khí kết ở đuôi số — bạn bè nhiều, nhân duyên tốt, cần là có người gọi nhau lên đường giúp. Tài liệu gọi Sinh Khí là “cứu mạng chi tinh”: lúc nguy khốn luôn có người đỡ, gặp dữ hoá lành. Sức khoẻ cũng thuộc nhóm nhẹ nhất trong tám năng lượng. Điểm cần tự nhắc: quá tuỳ duyên thì thiếu lòng cầu tiến, và tiền dễ tiêu cho bạn bè.",
    canCu:
      "Sinh Khí — Quý nhân: “Bằng hữu nhiều, nhân duyên tốt — là cứu mạng chi tinh, luôn có người trợ giúp khi nguy khốn”; Sức khoẻ: “thường không nghiêm trọng”; Khuyết điểm: “thiếu lòng cầu tiến”.",
  },
  {
    ma: "chuyen_gia_ganh_vac",
    ten: "Cách cục chuyên gia, gánh vác một phương",
    loai: "tốt",
    dieuKien: (b) => b.oDuoi.has("Diên Niên") && !b.oDuoi.has("Thiên Y"),
    dienGiai:
      "Diên Niên kết ở đuôi số — có chủ trương, phán đoán mạnh, ý chí kiên định và sức chịu đựng siêu cường. Đây là năng lượng của người làm nghề đến nơi đến chốn, sống bằng chuyên môn thật và giữ được tiền mình kiếm ra. Tài liệu nói thẳng đây là năng lượng quan trọng nhất trong một số điện thoại mà người ta hay coi nhẹ. Đổi lại: cường thế, cố chấp, ít vận quý nhân nên phải tự thân là chính.",
    canCu:
      "Diên Niên — Ưu điểm: “Thường là người lãnh đạo, có chủ trương, sức phán đoán mạnh… chịu đựng siêu cường”; Sự nghiệp: “Đây là năng lượng quan trọng nhất trong số điện thoại nhưng thường bị coi nhẹ”; Quý nhân: “ít vận quý nhân”.",
  },
  {
    ma: "ben_bi_giu_cua",
    ten: "Bền bỉ giữ của, nhưng chậm bứt phá",
    loai: "hai mặt",
    dieuKien: (b) => b.oDuoi.has("Phục Vị") && b.oDuoi.size === 1,
    dienGiai:
      "Đuôi số kết bằng Phục Vị — năng lượng giữ nguyên trạng. Mặt được là sức chịu đựng và nghị lực hơn người: sóng gió cỡ nào cũng trụ được, giữ được cái đang có, hợp với thu nhập ổn định lâu dài. Mặt phải chấp nhận là ngại thay đổi, xử lý việc do dự, cơ hội lớn đến thì thường cân nhắc quá lâu rồi để lỡ.",
    canCu:
      "Phục Vị — Ưu điểm: “Sức chịu đựng, nghị lực hơn người, có thể chờ đợi cơ hội”; Khuyết điểm: “Không dễ biến động… xử lý sự việc do dự, quá bảo thủ”; Sự nghiệp: “dễ bỏ lỡ cơ hội tốt vì quá bảo thủ”.",
  },
];
