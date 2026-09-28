/**
 * THƯ VIỆN LUẬN GIẢI NHÂN TƯỚNG — kiến thức skill-derived, TÁCH HẲN khỏi KNOWLEDGE_SOURCES.
 *
 * ⚠️ ĐÂY KHÔNG PHẢI NGUỒN CỔ THƯ ĐÃ XÁC MINH. Toàn bộ nội dung dưới đây rút từ ba file
 * tư liệu người dùng cung cấp (Nhân Diện Học — Joey Yap; Nhân Tướng Học Sơ/Trung/Cao Cấp
 * — Học Viện Phong Thủy Nam Việt). Là kiến thức luận giải ĐỊNH TÍNH, tóm tắt hiện đại —
 * KHÔNG có trang/chương/nguyên văn/hiện vật, nên KHÔNG đạt `verified`.
 *
 * VÌ SAO TÁCH RIÊNG (ranh giới cứng):
 *   KNOWLEDGE_SOURCES (verified) → Rule Engine match → tầng luận giải → THƯ VIỆN NÀY → câu chữ
 *
 * Thư viện này ngồi ở CUỐI chuỗi, chỉ cung cấp CÂU CHỮ sau khi một luật đã match hợp lệ
 * bằng feature + threshold + nguồn verified. Nó KHÔNG được và KHÔNG THỂ:
 *   · tạo luật, kích hoạt luật
 *   · tạo threshold số (mọi điều kiện ở đây là ĐỊNH TÍNH, giữ nguyên dạng chữ)
 *   · xác nhận evidence, nâng verificationStatus/validationStatus
 *   · biến skill-derived thành verified source
 *
 * Là MODULE LÁ: chỉ có dữ liệu + hàm đọc thuần. Không import feature/rule/engine/session/
 * sensor/interpretation. Không nhận ảnh/video/landmark. Không có số min/max nào.
 *
 * Nội dung được GIỮ NGUYÊN thuật ngữ và cấu trúc của tư liệu gốc. Không thêm kiến thức
 * ngoài tài liệu, không hợp nhất khái niệm, không suy diễn threshold.
 */

export const INTERPRETATION_LIBRARY_VERSION = "physiognomy-interpretation-library-v1" as const;

/**
 * Mức độ một mục kiến thức gắn được với 29 feature ĐO ĐƯỢC hiện tại.
 *   direct              — feature đo trực tiếp khái niệm này
 *   partial             — có liên quan, nhưng chưa đủ (thiếu threshold, hoặc chỉ một phần)
 *   interpretation_only — chỉ dùng làm câu chữ sau khi rule match, không map số
 *   no_mapping          — 29 feature hiện tại không đo được khái niệm này
 */
export type FeatureMappingKind = "direct" | "partial" | "interpretation_only" | "no_mapping";

/**
 * Provenance CỐ ĐỊNH cho mọi mục trong thư viện này. Kiểu literal ép cứng: không mục nào
 * có thể tự khai `verified`, không locator, không evidence artifact.
 */
export interface SkillDerivedProvenance {
  type: "skill-derived";
  verificationStatus: "unverified";
  /** null vì tư liệu không cung cấp locator đủ chuẩn (trang/chương/scan). */
  locator: null;
  /** null vì không có hiện vật (bản scan/ảnh trang sách). */
  evidenceRef: null;
  /** Tên nguồn ghi trong tài liệu — chép nguyên, không truy nguyên hộ. */
  attribution: string;
}

export interface InterpretationItem {
  id: string;
  /** Nhóm hệ thống, giữ theo cách tư liệu tổ chức. */
  category: string;
  /** Tên khái niệm gốc, giữ nguyên thuật ngữ tư liệu. */
  concept: string;
  /** Feature key trong 29 feature mà mục này liên quan; [] nếu không map. */
  featureConcepts: string[];
  mappingKind: FeatureMappingKind;
  /** Nội dung luận giải, chép từ tư liệu. */
  interpretation: string;
  /** Câu điều kiện ĐỊNH TÍNH nếu tài liệu có (ví dụ "dài ~1/3 khuôn mặt"). KHÔNG phải số. */
  conditionsText: string | null;
  provenance: SkillDerivedProvenance;
  /** Giới hạn/ghi chú, gồm cả cảnh báo đảo chiều nam–nữ khi tư liệu nêu. */
  notes: string | null;
}

/** Gắn nguồn cho gọn — cả kho dùng chung ba nguồn tài liệu đã khai. */
const ATTR_DATA = "Nhân Diện Học (Joey Yap); Nhân Tướng Học Sơ/Trung/Cao Cấp — Học Viện Phong Thủy Nam Việt";
const ATTR_NANGCAO = "Kho Nhân Tướng Học — Module nâng cao (Học Viện Phong Thủy Nam Việt)";
const ATTR_PIPELINE = "Quy trình luận giải Nhân Tướng Học — tài liệu skill nội bộ";
/**
 * Nhánh RIÊNG — tài liệu tự dặn "để thành nhánh riêng đối chiếu, không trộn làm một".
 * Giữ category `giang_ho_phai_*` tách khỏi hệ cổ điển. Nhiều luật mang quan niệm xã hội
 * cũ (hôn nhân phụ nữ) và dự đoán sức khỏe — chính tài liệu ghi rõ chỉ để THAM KHẢO,
 * KHÔNG phán quyết, KHÔNG thay chẩn đoán y khoa. Các cảnh báo đó giữ trong `notes`.
 */
const ATTR_GIANGHO = "Nhân Tướng Giang Hồ Phái — bản dịch Hoàng Hồng Tâm (bản rút gọn chỉ giữ luật CHẮC CHẮN)";

function prov(attribution: string): SkillDerivedProvenance {
  return { type: "skill-derived", verificationStatus: "unverified", locator: null, evidenceRef: null, attribution };
}

/**
 * KHO — chép từ ba file tư liệu. Mỗi mục là một khái niệm/bộ vị theo cách tư liệu chia.
 *
 * `featureConcepts` chỉ GHI NHẬN liên quan để tra cứu; nó KHÔNG cấp quyền cho luật, và
 * `mappingKind` nói rõ mức độ. Không mục nào dưới đây chứa số min/max.
 */
export const INTERPRETATION_LIBRARY: readonly InterpretationItem[] = Object.freeze([
  // ───────────────────────────────── Ngũ Hành hình tướng (nhan-tuong-data)
  {
    id: "ngu-hanh-moc",
    category: "ngu_hanh_hinh_tuong",
    concept: "Mộc hình",
    featureConcepts: ["face.geometry.face_shape_ratio"],
    mappingKind: "interpretation_only",
    interpretation:
      "Thân hình thon dài mỏng, trán hơi rộng cằm nhỏ, mũi cân đối, tai dài, dáng gầy cao thẳng, da xanh ánh nhuận. Tính cách chủ đạo: Nhân — lương thiện, ôn hòa, kiên nhẫn, học thức, mưu tính sâu xa. Giáp Mộc: thân thẳng cứng, kỵ phá Kim hoặc bị gọt giữa. Ất Mộc: mềm dẻo, kỵ nghịch hợp với hình Kim.",
    conditionsText: "Thân thon dài, trán rộng cằm nhỏ, dáng gầy cao thẳng",
    provenance: prov(ATTR_DATA),
    notes: "Phân loại tổng thể khuôn mặt/thân — cần đánh giá toàn diện, không suy từ một tỉ lệ đơn.",
  },
  {
    id: "ngu-hanh-hoa",
    category: "ngu_hanh_hinh_tuong",
    concept: "Hỏa hình",
    featureConcepts: ["face.geometry.face_shape_ratio"],
    mappingKind: "interpretation_only",
    interpretation:
      "Trên nhọn dưới rộng, da đỏ, mày khô, mũi hoặc gò má lộ rõ, hơi mập, mắt sáng có sức hút. Tính cách: Lễ — nóng vội nhưng chuộng người, hào phóng, thiếu tự tin nội tâm dù bên ngoài tích cực. Người Hỏa hình KHÔNG bị tính là lỗi lộ của bốn hành kia (mắt lộ, tai lộ, mũi lộ, răng lộ, hầu lộ đều không tính xấu) vì bản chất Hỏa là phát tán.",
    conditionsText: "Trên nhọn dưới rộng, da đỏ, gò má/mũi lộ",
    provenance: prov(ATTR_DATA),
    notes: "Ngoại lệ quan trọng: Hỏa hình không kỵ các dạng lộ.",
  },
  {
    id: "ngu-hanh-tho",
    category: "ngu_hanh_hinh_tuong",
    concept: "Thổ hình",
    featureConcepts: ["face.geometry.face_shape_ratio"],
    mappingKind: "interpretation_only",
    interpretation:
      "To béo, đôn hậu, lưng dày, cổ ngắn, tay chân vuông dày, tiếng trầm chậm, mặt vuông lớn. Tính cách: Tín — đôn hậu, cẩn thận, nói đi đôi với làm, có mưu kế, bền bỉ sống thọ. Kỵ phá Mộc (Mộc khắc Thổ); nhưng nếu có chút Mộc chỉ số thông (mày thanh mắt sáng, râu tóc tươi nhuận) thì lại là quý cách hiếm — gọi là Trọc trung hữu Thanh.",
    conditionsText: "To béo, mặt vuông lớn, cổ ngắn, tay chân vuông dày",
    provenance: prov(ATTR_DATA),
    notes: "Trọc trung hữu Thanh: Thổ hình có chút Mộc chỉ số thông là quý cách.",
  },
  {
    id: "ngu-hanh-kim",
    category: "ngu_hanh_hinh_tuong",
    concept: "Kim hình",
    featureConcepts: ["face.geometry.face_shape_ratio"],
    mappingKind: "interpretation_only",
    interpretation:
      "Vóc ngay ngắn, da trắng non, xương gọn nhưng vững, mũi thẳng, tai đỏ, tiếng vang rõ, mặt vuông. Tính cách: Nghĩa — trượng nghĩa, quả quyết, kiên nghị, công bằng; dễ giận dữ, tính toán. Cằm hoặc trán hẹp phẳng thì là người thủ đại cố chấp.",
    conditionsText: "Vóc ngay ngắn, da trắng, mặt vuông, xương vững",
    provenance: prov(ATTR_DATA),
    notes: null,
  },
  {
    id: "ngu-hanh-thuy",
    category: "ngu_hanh_hinh_tuong",
    concept: "Thủy hình",
    featureConcepts: ["face.geometry.face_shape_ratio"],
    mappingKind: "interpretation_only",
    interpretation:
      "Mập tròn, mặt ngắn, da đen, thân trên dưới đều tròn, bụng rủ, hình oval. Tính cách: Trí — linh hoạt, thích nghi nhanh, nắm bắt cơ hội, tự lập, thành công tài chính sớm. Miệng hoặc cằm quá rộng (quá nhiều Thủy) là không trung thực, xảo quyệt; mặt mày cần tăng sức, kỵ lộ/dài/sâu.",
    conditionsText: "Mập tròn, mặt ngắn, thân tròn, hình oval",
    provenance: prov(ATTR_DATA),
    notes: null,
  },
  {
    id: "ngu-hanh-phoi-hop",
    category: "ngu_hanh_hinh_tuong",
    concept: "Nguyên tắc phối hợp Ngũ Hành",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Ba cấp mỗi hành: Chính cách (hội đủ đặc điểm chuẩn của hành đó → Quý); Liệt cách (thiếu vài đặc điểm, chỉ trung bình); Phá cách (pha tạp hành khác khắc mạnh hoặc dị dạng → Xấu). Kiêm hình cục: Thuận hợp (hai hành sinh hoặc hài hòa → tốt, tăng giá trị); Nghịch hợp (hai hành khắc nhau → xấu, giảm giá trị, có thể ảnh hưởng thọ mệnh).",
    conditionsText: null,
    provenance: prov(ATTR_DATA),
    notes: "Nguyên tắc tổng hợp cho phân loại Ngũ Hành, không map feature.",
  },

  // ───────────────────────────────── Tam Đình
  {
    id: "tam-dinh-thuong",
    category: "tam_dinh",
    concept: "Thượng Đình",
    featureConcepts: ["face.three_courts.upper"],
    mappingKind: "partial",
    interpretation:
      "Vị trí: chân tóc đến giữa hai đầu mày. Ứng vận 15–30 tuổi, thiếu niên. Bộ vị trọng yếu: trán. Ý nghĩa: thiên phú trí tuệ, nền tảng gia đình.",
    conditionsText: "Tam Đình cân xứng, đều đặn, không khuyết hãm thì cả đời không lo cơm áo (định tính)",
    provenance: prov(ATTR_DATA),
    notes: "three_courts.upper đo tỉ lệ đình trên, nhưng tư liệu chỉ nói 'cân xứng' — KHÔNG có ngưỡng số.",
  },
  {
    id: "tam-dinh-trung",
    category: "tam_dinh",
    concept: "Trung Đình",
    featureConcepts: ["face.three_courts.middle"],
    mappingKind: "partial",
    interpretation:
      "Vị trí: giữa hai mày đến dưới hai cánh mũi. Ứng vận 31–50 tuổi, trung niên. Bộ vị trọng yếu: mũi, mày, mắt, tai. Ý nghĩa: nỗ lực bản thân, khí lực.",
    conditionsText: "Trung Đình đầy đặn cân xứng ứng trung vận vượng (định tính)",
    provenance: prov(ATTR_DATA),
    notes: "Là feature của rule draft THREE_COURTS_MIDDLE_001. Tư liệu cho Ý NGHĨA, KHÔNG cho threshold.",
  },
  {
    id: "tam-dinh-ha",
    category: "tam_dinh",
    concept: "Hạ Đình",
    featureConcepts: ["face.three_courts.lower"],
    mappingKind: "partial",
    interpretation:
      "Vị trí: dưới mũi đến cằm. Ứng vận từ 51 tuổi, về già. Bộ vị trọng yếu: cằm, Địa Các, nhân trung, pháp lệnh, miệng. Ý nghĩa: kết quả thực tế, hoạt lực.",
    conditionsText: "Hạ Đình đầy đặn cân xứng ứng hậu vận tốt (định tính)",
    provenance: prov(ATTR_DATA),
    notes: null,
  },
  {
    id: "tam-dinh-nguyen-tac",
    category: "tam_dinh",
    concept: "Nguyên tắc Tam Đình / Tam Tài",
    featureConcepts: ["face.three_courts.upper", "face.three_courts.middle", "face.three_courts.lower"],
    mappingKind: "partial",
    interpretation:
      "Tam Đình cân xứng, đều đặn, không khuyết hãm thì cả đời không lo cơm áo. Tam Tài: Trán là Thiên, Mũi là Nhân, Cằm là Địa — luôn xét cả ba, không xem riêng lẻ. Áp dụng nguyên tắc Tam Đình bình ổn nhất sinh phú quý.",
    conditionsText: "Ba đình cân xứng đều nhau (định tính, không có tỉ lệ số cụ thể)",
    provenance: prov(ATTR_DATA),
    notes: "Cân xứng là phán đoán định tính; KHÔNG suy thành ràng buộc số cho ba feature three_courts.",
  },

  // ───────────────────────────────── Ngũ Nhạc (no_mapping)
  {
    id: "ngu-nhac",
    category: "ngu_nhac",
    concept: "Ngũ Nhạc triều cung",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Nam Nhạc–Hành Sơn (trán), Bắc Nhạc–Hằng Sơn (cằm), Đông Nhạc–Thái Sơn (quyền trái), Tây Nhạc–Hoa Sơn (quyền phải), Trung Nhạc–Tung Sơn (mũi). Trung Nhạc quan trọng nhất, là long mạch trung tâm, bốn nhạc còn lại phải triều cung về đấy. Ba lỗi tứ kỵ: Quần sơn vô chủ (mũi quá nhỏ khuyết so với 4 nhạc); Cô phong vô viện (mũi nổi bật riêng lẻ nhưng 4 nhạc không hỗ trợ); Hữu viên bất tiếp (4 nhạc tốt nhưng không liên hoàn với Trung Nhạc).",
    conditionsText: "Mũi làm chủ, bốn nhạc triều cung (định tính)",
    provenance: prov(ATTR_DATA),
    notes: "29 feature không đo quyền/trán/cằm dạng 'triều cung'.",
  },

  // ───────────────────────────────── Tứ Đậu, Lục Phủ (no_mapping)
  {
    id: "tu-dau",
    category: "tu_dau",
    concept: "Tứ Đậu Tứ Độc",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Giang Đậu–Trường Giang (tai): sâu, rộng nhưng lỗ tai thu gọn → giàu, thông minh. Hoài Đậu–Hoàng Hà (mắt): sâu, dài, đồng tử linh động → thọ, quý. Hà Đậu–Hoài Thủy (miệng): vuông, môi trên dưới khít nhau → thọ, có phúc. Tế Đậu–Tế Thủy (mũi): đầy đặn cân xứng, không lộ lỗ → sung túc. Nguyên tắc: núi cao (Ngũ Nhạc đẹp) mà nước không tụ (Tứ Đậu xấu) vẫn thất bại, chỉ buôn bán nhỏ; cả núi lẫn nước đẹp mới là đại cách phú quý.",
    conditionsText: "Tai/mắt/miệng/mũi thanh, không lộ (định tính)",
    provenance: prov(ATTR_DATA),
    notes: null,
  },
  {
    id: "luc-phu",
    category: "luc_phu",
    concept: "Lục Phủ",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Thượng nhị phủ–Thiên Thương (dưới mày đến chân tóc): thiếu niên, cha mẹ/tổ ấm. Trung nhị phủ–Quyền cốt (vùng Trung Đình): trung niên, tự lập sự nghiệp. Hạ nhị phủ–quai hàm, Địa Các (vùng Hạ Đình): về già, được vận bởi tôn kính. Xét ba cặp xương hai bên mặt đầy đặn hay khuyết hãm theo từng giai đoạn.",
    conditionsText: "Ba cặp xương hai bên mặt đầy đặn (định tính)",
    provenance: prov(ATTR_DATA),
    notes: null,
  },

  // ───────────────────────────────── Ngũ Quan
  {
    id: "ngu-quan-bao-tho",
    category: "ngu_quan",
    concept: "Bảo Thọ Quan (mày)",
    featureConcepts: ["face.eyebrows.left_length", "face.eyebrows.right_length", "face.eyebrows.spacing"],
    mappingKind: "partial",
    interpretation:
      "Bộ vị: mày. Ngũ Hành: Hỏa. Chức năng: chủ uy thế, tình anh em. Điều kiện thành: dài, cong như trăng non, thanh tú, ngay ngắn, thuận chiều, không giao nhau. Hạn kỳ 4 năm.",
    conditionsText: "Mày dài, cong thanh tú, không giao nhau (định tính)",
    provenance: prov(ATTR_DATA),
    notes: "eyebrows.length/spacing liên quan nhưng 'thanh tú/thuận chiều' không đo được; không threshold.",
  },
  {
    id: "ngu-quan-giam-sat",
    category: "ngu_quan",
    concept: "Giám Sát Quan (mắt)",
    featureConcepts: ["face.eyes.interocular_distance", "face.eyes.left_width", "face.eyes.right_width"],
    mappingKind: "partial",
    interpretation:
      "Bộ vị: mắt. Ngũ Hành: Mộc. Chức năng: chủ hình phạt, thọ yểu, thần thái. Điều kiện thành: đen trắng phân minh, đồng tử đoan chính, ánh sáng ôn hòa, tàng ẩn không lộ. Hạn kỳ 6 năm.",
    conditionsText: "Đen trắng phân minh, đồng tử đoan chính, tàng ẩn không lộ (định tính)",
    provenance: prov(ATTR_DATA),
    notes: "eyes.* đo kích thước/độ nghiêng, KHÔNG đo 'thần'/'đen trắng phân minh'.",
  },
  {
    id: "ngu-quan-tham-bien",
    category: "ngu_quan",
    concept: "Thẩm Biện Quan (mũi)",
    featureConcepts: ["face.nose.length", "face.nose.width", "face.nose.bridge_ratio"],
    mappingKind: "partial",
    interpretation:
      "Bộ vị: mũi. Ngũ Hành: Kim (có sách xếp Thổ). Chức năng: chủ tài phú. Điều kiện thành: chuẩn đầu tròn nổi như túi mật treo, ngay thẳng, cánh mũi nở. Hạn kỳ 10 năm.",
    conditionsText: "Chuẩn đầu tròn đầy, ngay thẳng, cánh mũi nở (định tính)",
    provenance: prov(ATTR_DATA),
    notes: "nose.* đo chiều dài/rộng/tỉ lệ sống nhưng 'tròn đầy như túi mật' không đo; không threshold.",
  },
  {
    id: "ngu-quan-xuat-nap",
    category: "ngu_quan",
    concept: "Xuất Nạp Quan (miệng)",
    featureConcepts: ["face.mouth.width", "face.mouth.height"],
    mappingKind: "partial",
    interpretation:
      "Bộ vị: miệng. Ngũ Hành: Thổ. Chức năng: chủ tài đường, phúc lộc. Điều kiện thành: vuông lớn, môi đỏ, ngay ngắn, mở lớn hợp nhỏ. Hạn kỳ 20 năm.",
    conditionsText: "Vuông lớn, môi đỏ, ngay ngắn (định tính)",
    provenance: prov(ATTR_DATA),
    notes: null,
  },
  {
    id: "ngu-quan-thai-thinh",
    category: "ngu_quan",
    concept: "Thái Thinh Quan (tai)",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Bộ vị: tai. Ngũ Hành: Thủy. Chức năng: chủ trí, hiền/ngu, thọ. Điều kiện thành: rõ, sung mãn, cao vượt lông mày. Hạn kỳ 15 năm. Câu quyết Ngũ Quan: Nhất quan thành, thập niên phú quý; Ngũ quan giai thành, phú quý đáo lão.",
    conditionsText: "Tai rõ, sung mãn, cao vượt lông mày (định tính)",
    provenance: prov(ATTR_DATA),
    notes: "29 feature không đo tai.",
  },

  // ───────────────────────────────── Bộ vị chi tiết
  {
    id: "bo-vi-tran",
    category: "bo_vi",
    concept: "Trán",
    featureConcepts: ["face.three_courts.upper"],
    mappingKind: "partial",
    interpretation:
      "Chuẩn: cao, rộng, đầy đặn, hơi gồ nhẹ khi nhìn ngang (không phẳng lì). Các dạng: trán rộng (trí nhớ cụ thể mạnh); trán cao (óc tưởng tượng, tập trung tốt); trán vuông (thực tiễn); chân tóc chữ M cao rộng (văn học thiên bẩm); chữ M thấp hẹp (mỹ thuật nhưng ít thực tế); gồ giữa (viển vông); gồ hai bên (khó thích nghi nghịch cảnh); gồ phần dưới (óc quan sát tổng hợp tốt); trán lẹm (trí tuệ và tình cảm thô lậu); trán nhọn hẹp (công danh trắc trở, vỡ thọ). Vân trán: đủ ba đường Thiên/Nhân/Địa hướng lên là cát tường cao nhất; một đường thẳng cắt ba đường thành chữ Vương là trí tuệ mạnh nhưng vợ chồng dễ ly tán.",
    conditionsText: "Cao, rộng, đầy đặn, hơi gồ nhẹ nhìn ngang (định tính)",
    provenance: prov(ATTR_DATA),
    notes: null,
  },
  {
    id: "bo-vi-long-may",
    category: "bo_vi",
    concept: "Lông mày",
    featureConcepts: ["face.eyebrows.left_length", "face.eyebrows.right_length", "face.eyebrows.spacing", "face.eyebrows.left_height", "face.eyebrows.right_height"],
    mappingKind: "partial",
    interpretation:
      "Chuẩn: dài hơn mắt, cong tự nhiên, mọc thuận chiều, đậm vừa phải, mịn, không lấn vào mắt. Loại tốt: Nhất tự mi (thẳng như chữ nhất, mịn đen, dài hơn/bằng mắt → phát đạt từ nhỏ, giàu sang thọ); Tân nguyệt mi (cong nhẹ như trăng non → chuẩn cho nữ); Long mi (thân cong, đuôi cao hơn đầu → chuẩn cho nam, trường thọ giàu có); Hổ mi (xếch, to bản → gan lớn, đại quý); Thanh tú mi (thanh tự nhiên → thông minh). Loại xấu: mày quỷ (thô, lấn vào mắt → giả nhân giả nghĩa); mày đao câu (nhỏ hẹp nhọn → tâm địa nham hiểm); mày gián đoạn (đứt quãng → rất xấu về mạng); mày chổi xuể (xù, rời rạc → thiếu tình cốt nhục); hai đầu mày giao nhau (chân mày nối liền → anh em xung khắc, hay nóng vội, không dư tiêu).",
    conditionsText: "Dài hơn mắt, cong thuận, không giao nhau (định tính)",
    provenance: prov(ATTR_DATA),
    notes: "'Hai đầu mày giao nhau' ~ eyebrows.spacing nhỏ, nhưng KHÔNG có ngưỡng số. Đếm anh em/trái-phải: đảo chiều nam-nữ.",
  },
  {
    id: "bo-vi-mat",
    category: "bo_vi",
    concept: "Mắt",
    featureConcepts: ["face.eyes.interocular_distance", "face.eyes.left_width", "face.eyes.right_width", "face.eyes.left_height", "face.eyes.right_height", "face.eyes.left_tilt", "face.eyes.right_tilt"],
    mappingKind: "partial",
    interpretation:
      "Bảy điều kiện chuẩn: đẹp và ngay; trầm ổn mà sáng; rõ ra mà thu vào; trên dưới không lộ tam bạch; nhìn lâu không chớp; gặp nguy không mở loạn thần; không liếc xéo hoảng loạn. Cảnh báo: tam bạch (nhãn cầu chạm 1 mí, lộ lòng trắng 3 mặt → tâm tính gian ác, dễ tai họa hình phạt); tứ bạch (lộ cả 4 phía → càng xấu). Loại tốt: mắt rồng (đại quý); mắt phượng (quý nhưng chưa chắc phú); mắt voi (từ ái, an nhàn); mắt sư tử (rất quý, trọng nghĩa khí); mắt tê giác (nhân từ, đại quý phúc lộc thọ toàn); mắt nai (nghị lực, hiếu nghĩa). Loại xấu: mắt tam giác (âm độc; nữ dễ khắc chồng — sát phu chi tướng); mắt rắn (ngoan độc, hình khắc); mắt ngựa (cực xấu, vất vả suốt đời); mắt dê (bất thành tựu, chết bất đắc kỳ tử); mắt say/gấu (vô thần, bất thành tựu); hoa luân nhãn (quanh đồng tử đỏ như vòng lửa → tàn bạo, chết vì tai nạn). Mắt là bộ vị quan trọng bậc nhất đánh giá vận số và tâm trạng hiện tại — nên quan sát vào buổi sáng sớm.",
    conditionsText: "Bảy điều kiện chuẩn; không lộ tam bạch/tứ bạch (định tính)",
    provenance: prov(ATTR_DATA),
    notes: "eyes.* đo kích thước/độ nghiêng; dạng mắt (rồng/phượng...) và 'thần' KHÔNG đo được. 'Mắt tam giác/sát phu' đảo chiều nam-nữ.",
  },
  {
    id: "bo-vi-tai",
    category: "bo_vi",
    concept: "Tai",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Cấu tạo: Luân (vành ngoài), Quách (vành sụn trong), Thùy (dái tai), Nhĩ Căn (gốc đỉnh đầu). Chuẩn: cân xứng hai tai, Luân Quách rõ phân minh, màu tươi, tai cao hơn lông mày, thùy châu dày rủ, áp sát đầu. Loại tốt: Thổ nhĩ (phú quý trường thọ, chính trực); Thủy nhĩ (đại thành tựu); Kim nhĩ (phú quý thọ nhưng phát muộn); tai tướng Phật (cực kỳ phú quý, sống thọ); tai đơn não – Điểm não nhĩ (hiền lành, phúc lộc song toàn). Loại xấu: tai mũi tên (nhỏ nhiều bệnh, hình khắc lục thân, ly hương); Để phản nhĩ (cực xấu, xung khắc cha mẹ, cô độc về già); tai chuột (trí trá, tham lam, dễ tù tội); tai quạt (bôn ba, cô độc về già). Bản đồ 1–14 tuổi: tai đầy đặn phát triển tốt là tuổi thơ được nuôi dạy tốt; sứt khuyết lõm là tuổi thơ gian khó.",
    conditionsText: "Cân xứng, Luân Quách rõ, thùy châu dày, áp sát đầu (định tính)",
    provenance: prov(ATTR_DATA),
    notes: "29 feature không đo tai.",
  },
  {
    id: "bo-vi-mui",
    category: "bo_vi",
    concept: "Mũi",
    featureConcepts: ["face.nose.length", "face.nose.width", "face.nose.bridge_ratio"],
    mappingKind: "partial",
    interpretation:
      "Cấu tạo: Sơn Căn (gốc mũi giữa hai mắt), Tỵ Lương (thân sống mũi), Chuẩn Đầu (chóp mũi), cánh mũi. Chuẩn: dài khoảng 1/3 khuôn mặt, ngay thẳng, không lệch cong lõm gãy khúc, chuẩn đầu tròn đầy, cánh mũi nở cân xứng. Loại tốt: Thông Thiên Tỵ/Phục Tê Tỵ (đại quý cách, tướng đế vương); Huyền Đảm Tỵ – mũi túi mật treo (Thẩm Biện Quan thành tựu bậc nhất); Long Tỵ – mũi rồng (cực tốt, thông minh quý song toàn); Sư Tử Tỵ, Ngưu Tỵ (phú quý). Loại xấu: Ưng Trảo Tỵ – mũi chim ưng (trí trá, gian hiểm, hậu vận bất tường); Kiếm Phong Tỵ – mũi kiếm (rất xấu, khắc vợ con, cô độc lúc già); Cô Phong Tỵ – núi cô độc (cô độc, dù mặt tốt cũng không đại phát); Lộ Tỵ – lỗ mũi lộ rộng (hữu danh vô thực, nghèo túng). Phối hợp với quyền: Quyền không tự làm tăng giá trị Mũi mà chỉ có thể LÀM GIẢM — Mũi Quý mà Quyền xấu thì Quý giảm; Mũi Phú mà Quyền xấu thì giàu tạm thời; Mũi Thiên thì Quyền không ảnh hưởng.",
    conditionsText: "Dài khoảng 1/3 khuôn mặt, ngay thẳng, chuẩn đầu tròn đầy, cánh mũi nở (giữ nguyên dạng chữ — KHÔNG chuyển thành số)",
    provenance: prov(ATTR_DATA),
    notes: "'1/3 khuôn mặt' giữ nguyên văn định tính. nose.length đo theo faceHeight nhưng KHÔNG suy thành min/max.",
  },
  {
    id: "bo-vi-mieng-moi-rang",
    category: "bo_vi",
    concept: "Miệng môi răng",
    featureConcepts: ["face.mouth.width", "face.mouth.height"],
    mappingKind: "partial",
    interpretation:
      "Cấu tạo: Hải Giác (hai khóe miệng), Kim Phúc (môi trên), Kim Tái (môi dưới), Thừa Tương (dưới môi dưới). Chuẩn: vuông vắn, ngậm nhỏ mở lớn, môi trên dưới cân xứng, hai khóe hướng lên, màu tươi hồng đỏ. Loại tốt: miệng chữ Tứ/vuông/cọp/rồng (phú quý song toàn, uy quyền hiển hách). Loại xấu: miệng heo (môi trên trùm môi dưới, hai khóe trễ → xung khắc lục thân, muộn hạnh phúc); miệng thổi lửa (hai môi nhọn túm, khóe cúp → xấu nhất, gia đình bất hòa, tuổi già cô độc); miệng chữ (chữ ra như thổi loa → hậu vận bần hàn). Răng: đều, trắng ngà, ngay ngắn, số lượng nhiều là tốt; thưa có khe hở là hôn nhân trắc trở, khó tích tài; vẩu khấp khểnh là thích nói dối, tâm cơ. Cảnh báo Pháp Lệnh ăn vào khóe miệng (xà nhập khẩu) là tối kỵ: chủ chết đói/chết đường, không sống quá khoảng 77 tuổi.",
    conditionsText: "Vuông vắn, ngậm nhỏ mở lớn, hai khóe hướng lên (định tính)",
    provenance: prov(ATTR_DATA),
    notes: "mouth.width/height liên quan; dạng miệng và màu/răng KHÔNG đo được.",
  },
  {
    id: "bo-vi-nhan-trung",
    category: "bo_vi",
    concept: "Nhân trung",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Ngoại lệ: là bộ vị DUY NHẤT càng sâu và rộng càng tốt. Ý nghĩa: ví như dòng sông cuộc đời; sâu rộng là thử thách vượt qua tốt, con cháu đông, thọ. Hẹp nông có sẹo lệch là khó khăn tuổi già, tài vận kém. Với nữ: cách tốt nhất để xem đường con cái/sinh sản — trên hẹp dưới rộng dễ sinh, con cháu vượng; trên rộng dưới hẹp hoặc có vạch ngang là khó/hiếm con. Với nam: hẹp và cạn là vấn đề sinh dục/tinh trùng.",
    conditionsText: "Sâu và rộng (ngoại lệ: càng sâu rộng càng tốt) (định tính)",
    provenance: prov(ATTR_DATA),
    notes: "29 feature không đo nhân trung. Đảo chiều ý nghĩa nam-nữ.",
  },
  {
    id: "bo-vi-cam-dia-cac",
    category: "bo_vi",
    concept: "Cằm Địa Các",
    featureConcepts: ["face.shape.chin_to_face_height"],
    mappingKind: "partial",
    interpretation:
      "Chuẩn: đầy đặn, tròn, cân xứng, hơi hướng ra trước. Nam nên hơi vuông; nữ nên tròn. Cảnh báo: nữ cằm vuông sắc là vất vả, bướng bỉnh dù về già; cằm nhọn lẹm lệch là cô đơn, vô hậu vận, tuổi già khó khăn; cằm chẻ là sáng tạo nhưng nhiều vấn đề khác; cằm đôi là trung niên được phúc.",
    conditionsText: "Đầy đặn, tròn, cân xứng, hướng ra trước (định tính; nam hơi vuông, nữ tròn)",
    provenance: prov(ATTR_DATA),
    notes: "chin_to_face_height liên quan vùng cằm; dạng cằm/hướng KHÔNG đo. Đảo chiều nam-nữ.",
  },
  {
    id: "bo-vi-phap-lenh",
    category: "bo_vi",
    concept: "Pháp lệnh",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Chuẩn: rõ ràng, dài, ôm gọn quanh miệng, không đứt quãng. Ý nghĩa: thọ, uy quyền, sự nghiệp vững; với nữ pháp lệnh sâu là cuộc sống tốt, khí chất siêu quần. Xấu: rãnh ngắn/nông/đứt đoạn là sự nghiệp gián đoạn, tuổi già cô quả. Tối kỵ: pháp lệnh nhập miệng. Trái xem cha (tuổi trẻ), phải xem mẹ hoặc tuổi già tùy trường phái.",
    conditionsText: "Rõ, dài, ôm gọn quanh miệng, không đứt quãng (định tính)",
    provenance: prov(ATTR_DATA),
    notes: "29 feature không đo pháp lệnh.",
  },
  {
    id: "bo-vi-go-ma-luong-quyen",
    category: "bo_vi",
    concept: "Gò má Lưỡng Quyền",
    featureConcepts: ["face.shape.cheek_to_face_width"],
    mappingKind: "partial",
    interpretation:
      "Chuẩn: cao và rộng vừa phải, phẳng mà cao hơn vùng xung quanh (không gồ như đồi). Ý nghĩa: ý chí tranh đấu, tự tin vững, hữu tín nghĩa. Xấu: quyền hẹp là tinh thần bạc nhược, dễ khích động, âm hiểm; quyền nổi gồ lộ xương là phá hoại nhiều hơn xây dựng, tàn nhẫn.",
    conditionsText: "Cao rộng vừa phải, phẳng cao hơn xung quanh (định tính)",
    provenance: prov(ATTR_DATA),
    notes: "cheek_to_face_width đo bề ngang gò má; 'cao/phẳng/gồ' KHÔNG đo được.",
  },
  {
    id: "bo-vi-son-can",
    category: "bo_vi",
    concept: "Sơn Căn",
    featureConcepts: ["face.nose.bridge_ratio", "face.eyes.interocular_distance"],
    mappingKind: "partial",
    interpretation:
      "Vị trí: gốc mũi, giữa hai mắt — Cung Phu Thê của nữ theo một số trường phái. Tốt: cao thẳng không lệch là tập trung cao độ, đạo đức/kiên nhẫn. Xấu: thấp quá là thiếu tự tin, phải tự lập vất vả (không đáng ngại nếu sức khỏe tốt); có đường ngang cắt qua/nốt ruồi với nữ liên quan quan hệ bất chính hoặc sức khỏe; nam Sơn Căn thấp nên cưới muộn.",
    conditionsText: "Cao thẳng không lệch (định tính)",
    provenance: prov(ATTR_DATA),
    notes: "Sơn Căn nằm vùng giữa hai mắt; bridge_ratio/interocular liên quan gián tiếp, KHÔNG threshold. Đảo chiều nam-nữ.",
  },

  // ───────────────────────────────── 12 Cung (no_mapping — vị trí, không đo hình)
  {
    id: "muoi-hai-cung",
    category: "muoi_hai_cung",
    concept: "12 Cung",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Mệnh (Ấn Đường, giữa hai mày — quan trọng nhất, tổng quan vận mệnh/tính cách/trí tuệ); Quan Lộc (giữa trán — sự nghiệp, địa vị); Tài Bạch (chóp mũi Chuẩn Đầu — tài lộc, khả năng giữ tiền); Điền Trạch (trên mày dưới trán — nhà cửa, tài sản cố định); Huynh Đệ (lông mày — anh chị em); Tử Tức (dưới mắt — con cái); Nô Bộc (cằm, quai hàm — cấp dưới); Phu Thê (đuôi mắt, Gian Môn — hôn nhân); Tật Ách (Sơn Căn — sức khỏe); Phụ Mẫu (hai bên trán trên — cha mẹ); Thiên Di (hai bên trán gần chân tóc — di chuyển, xuất ngoại); Phúc Đức (trên lông mày cạnh Thiên Thương — vốn liếng nền tảng, quyết định 11 cung còn lại). Nguyên tắc: luôn đối chiếu Cung với Ngũ Quan/Tam Đình/Ngũ Nhạc, không kết luận từ một cung riêng lẻ.",
    conditionsText: "Xét đủ 12 cung, ưu tiên theo mục đích khách hỏi (định tính)",
    provenance: prov(ATTR_DATA),
    notes: "Là hệ vị trí trên mặt; 29 feature không đo theo cung.",
  },

  // ───────────────────────────────── Bạch Tuế Đồ (no_mapping)
  {
    id: "bach-tue-do",
    category: "bach_tue_do",
    concept: "Bạch Tuế Đồ (bản đồ tuổi)",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Bản đồ vị trí ứng từng tuổi trên khuôn mặt. Nguyên tắc: cộng thêm 1 tuổi Hư Linh khi tra bảng; giới tính ảnh hưởng chiều trái phải (nam trái, nữ phải) trừ các điểm trên trục dọc chính giữa. Một số mốc: 1–14 tai; 15 Hỏa Tinh (giữa trán); 28 Ấn Đường–Cung Mệnh; 31–34 lông mày; 41 Sơn Căn; 44–45 Niên Thượng/Thọ Thượng; 48 Chuẩn Đầu; 51 Nhân Trung; 57–58 Pháp Lệnh; 60 Thủy Tinh (khóe miệng); 70 Cằm. Từ 76–100: 12 Địa Chi viền quanh mặt — CHƯA CÓ DỮ LIỆU CHÍNH XÁC TỪNG TUỔI, chỉ dùng định tính, ưu tiên xem Thần/Khí Sắc/giọng nói. Không đọc một điểm riêng lẻ — phải đối chiếu Hỗn Lưu với các hệ khác.",
    conditionsText: "Cộng 1 tuổi Hư Linh; chiều trái-phải theo giới tính (định tính)",
    provenance: prov(ATTR_DATA),
    notes: "Bản đồ tuổi theo vị trí; 29 feature không đo. Từ 76 tuổi tài liệu tự ghi thiếu dữ liệu.",
  },

  // ───────────────────────────────── Thần Khí Sắc, nốt ruồi (no_mapping)
  {
    id: "than-khi-sac",
    category: "than_khi_sac",
    concept: "Thần Khí Sắc",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Thần (xem tại mắt, quan trọng nhất, khó giả tạo nhất — 7 điều kiện mục quang tối hảo giống 7 điều kiện mắt quý). Khí: Tự nhiên (bẩm sinh, ổn định), Hàm dưỡng (tích lũy qua tu dưỡng), Tà khí (bất ổn, báo hiệu xấu). Sắc theo màu: Vàng (tốt nhất, hỷ sự tài lộc); Tía/đỏ tía (quý khí); Đỏ thường (họa tai/kiện tụng); Đen (tai họa/bệnh/tử vong); Xanh (bệnh/tai ương); Trắng (tang/hao tổn). Phải xác định Ngũ Hành của người trước khi áp bảng màu theo mùa; phân biệt Hư Sắc (tạm thời) và Thực Sắc.",
    conditionsText: "Xem Thần tại mắt; Sắc đối chiếu Ngũ Hành + mùa (định tính, động, theo màu)",
    provenance: prov(ATTR_DATA),
    notes: "Màu sắc/thần là dữ liệu động, ánh sáng — module hiện KHÔNG đo (đã loại từ Phase feature).",
  },
  {
    id: "not-ruoi",
    category: "not_ruoi",
    concept: "Nốt ruồi và vết chàm",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Ưu tiên nốt ruồi hơn vết chàm; ý nghĩa phụ thuộc hoàn toàn vào vị trí, không đoán chung chung. Hoạt chí (nốt sống, bóng, đỏ sẫm) cát tường theo vị trí; nốt xấu (mờ, thô, màu xám) hung bất kể vị trí. Nốt ruồi lộ ra ngoài da phần lớn là không tốt; nốt ở vùng thân thể bị che khuất thường lại tốt hơn.",
    conditionsText: "Ý nghĩa theo vị trí; phân biệt hoạt chí và nốt mờ thô (định tính)",
    provenance: prov(ATTR_DATA),
    notes: "29 feature không phát hiện nốt ruồi.",
  },

  // ───────────────────────────────── Nguyên tắc tổng hợp
  {
    id: "thanh-troc",
    category: "nguyen_tac_tong_hop",
    concept: "Thanh Trọc",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Thanh là thanh tú, tinh tế; Trọc là thô nặng, đầy đặn. Lý tưởng nhất là Thanh trung hữu Trọc, Trọc trung hữu Thanh (trong thanh có chút trọc làm vững chãi, trong trọc có chút thanh làm sáng giá). Lỗi Hàn (lạnh lẽo, thiếu sinh khí); lỗi Thô (quá nặng nề, thô kệch không tinh tế).",
    conditionsText: "Xác định nghiêng Thanh hay Trọc, tìm điểm sáng trong thô (định tính)",
    provenance: prov(ATTR_DATA),
    notes: null,
  },
  {
    id: "am-duong-ngu-hanh-phoi-hop",
    category: "nguyen_tac_tong_hop",
    concept: "Âm Dương Ngũ Hành phối hợp",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Bốn mức phối hợp: Tối thuận (các hành sinh nhau hoàn toàn); Khá thuận (phần lớn sinh, một phần trung tính); Khá xấu (có yếu tố khắc nhẹ); Xấu hoàn toàn (khắc chế mạnh, đối kháng rõ rệt).",
    conditionsText: "Xếp mức phối hợp từ tối thuận đến xấu hoàn toàn (định tính)",
    provenance: prov(ATTR_DATA),
    notes: null,
  },
  {
    id: "phu-quy-pha-bai-tho-yeu",
    category: "nguyen_tac_tong_hop",
    concept: "Phú Quý Phá Bại Thọ Yểu",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Quý cách: Đại quý (hội đủ Ngũ Quan thành, Tam Đình cân đối, Thần khí vượng); Trung quý (phần lớn bộ vị tốt, một vài điểm trung bình). Phú cách: Đại phú (mũi và Chuẩn Đầu đặc cách, Địa Các dày); Tiểu phú (một vài bộ vị tốt riêng lẻ). Phá bại: Lục cực, Lục hại, Lục ác, Thập sát. Trường thọ: Tam Đình cân đối, mắt sâu ánh sáng ẩn tàng, tai dày, nhân trung sâu. Cảnh báo non yểu: mắt lộ vô thần; mũi lộ lỗ rõ; trán và cằm cùng nhọn ra; sắc mặt thường xuyên ám trệ; giọng nói yếu đứt hơi; tai quá nhỏ hoặc không có thùy châu; thần khí luôn bất ổn hoảng loạn. Nên trình bày nhẹ nhàng, không phán xét nặng nề khi gặp dấu hiệu phá bại.",
    conditionsText: "Bảng tra nhanh Phú/Quý/Phá bại/Thọ yểu (định tính, tổng hợp)",
    provenance: prov(ATTR_DATA),
    notes: "Tổng hợp nhiều hệ; không map feature đơn.",
  },
  {
    id: "quy-tac-nu",
    category: "quy_tac_nu",
    concept: "Quy tắc dành riêng cho nữ",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Nguyên tắc đảo ngược: rất nhiều đặc điểm tốt trên nam lại xấu trên nữ và ngược lại; vị trí trái/phải cũng đảo chiều theo giới tính. Cửu Thiên: 9 dấu hiệu cát tường, cần ít nhất 5/9 để được xem là tướng tốt. Ba bộ vị then chốt của nữ: Mắt xem con cái, Mũi xem chồng, Môi miệng xem phúc lộc/tính cách. Trình bày các dấu hiệu khắc chồng/vượng phu/đào hoa nhẹ nhàng — là xu hướng chứ không phải phán quyết, gắn với Tướng do tâm sanh. Cái đẹp thế tục không đồng nghĩa cái đẹp tướng học.",
    conditionsText: "Chỉ áp dụng khi giới tính là nữ (đảo chiều nhiều quy tắc)",
    provenance: prov(ATTR_DATA),
    notes: "Meta-rule đảo chiều giới tính — áp cho mọi mục khi đối tượng là nữ.",
  },

  // ───────────────────────────────── Nâng cao (nhan-tuong-nang-cao)
  {
    id: "an-duong-cung-menh",
    category: "an_duong",
    concept: "Ấn Đường (Cung Mệnh)",
    featureConcepts: ["face.eyebrows.spacing"],
    mappingKind: "partial",
    interpretation:
      "Vị trí: khoảng giữa hai đầu lông mày. Điểm quan trọng nhất toàn khuôn mặt, là Cung Mệnh, ứng tuổi 28 trên Bạch Tuế Đồ. Chuẩn: rộng bằng hai ngón tay trỏ, phẳng đầy, sáng sủa, không nốt ruồi/sẹo/vằn nhăn xấu, hai đầu mày không chạm vào. Dấu hiệu: Ấn Đường rộng sáng (tấm lòng rộng rãi, vận thông, dễ gặp quý nhân); hẹp hai đầu mày sát nhau (hay lo nghĩ, tính nóng vội, vận hay bế tắc trung niên, khó tích tụ tài lộc); có vằn dọc chính giữa Huyền Châm (chí lớn kiên trì, nhưng quá sâu là cô độc vất vả); có nốt ruồi (vận mệnh dễ bị cản trở ở tuổi 28); lõm tối (dễ gặp tai ách bất ngờ).",
    conditionsText: "Rộng bằng hai ngón trỏ, phẳng đầy sáng, hai đầu mày không chạm (định tính)",
    provenance: prov(ATTR_NANGCAO),
    notes: "eyebrows.spacing đo khoảng giữa hai đầu mày — liên quan trực tiếp khái niệm rộng/hẹp Ấn Đường, NHƯNG không có ngưỡng số ('rộng bằng hai ngón tay').",
  },
  {
    id: "ngu-tinh-luc-dieu",
    category: "ngu_tinh_luc_dieu",
    concept: "Ngũ Tinh Lục Diệu",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Hệ 5 sao và 6 sao gắn với các điểm trên mặt. Quý ở chỗ sung mãn cân xứng sáng sủa; hung ở chỗ nghiêng lệch ám trệ sẹo nốt. Ngũ Tinh: Hỏa Tinh (trán), Thổ Tinh (mũi/Chuẩn Đầu), Mộc Tinh (tai phải), Kim Tinh (tai trái), Thủy Tinh (miệng). Lục Diệu: Tử Khí (Ấn Đường), Kế Đô (mày phải), La Hầu (mày trái), Nguyệt Bột (Sơn Căn), Thái Âm (mắt trái), Thái Dương (mắt phải).",
    conditionsText: "Các sao sung mãn cân xứng sáng sủa (định tính)",
    provenance: prov(ATTR_NANGCAO),
    notes: "Hệ điểm-sao; không map feature đo.",
  },
  {
    id: "hoc-duong",
    category: "hoc_duong",
    concept: "Học Đường",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Các bộ vị phản ánh học vấn, trí tuệ, khả năng tiếp thu. Tốt khi không lộ, không sẹo, sáng sủa đầy đặn. Tứ Học Đường: Quan học đường (mắt — độ thông minh linh lợi); Lộc học đường (trán — công danh phúc lộc từ học vấn); Nội học đường (hai răng cửa — trung tín, tình cốt nhục); Ngoại học đường (trước tai — tài trí học rộng). Bát Học Đường: đỉnh đầu, Thái Dương huyệt, Ấn Đường, lưỡi, lông mày, và ba học đường đầu.",
    conditionsText: "Không lộ, không sẹo, sáng sủa đầy đặn (định tính)",
    provenance: prov(ATTR_NANGCAO),
    notes: null,
  },
  {
    id: "ngu-truong-ngu-doan-ngu-lo",
    category: "than_the",
    concept: "Ngũ Trường Ngũ Đoản Ngũ Lộ",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Ngũ Trường: 5 phần dài (đầu, mặt, thân mình, tay, chân) cân xứng nhau mới tốt; dài lẻ loi là xấu — cả 5 đều dài cân xứng là quý tướng. Ngũ Đoản: 5 phần ngắn phải ngắn cân xứng và xương thịt chắc, thần khí đủ mới tốt — ngắn mà dày chắc thần sắc vượng thì vẫn phú quý; ngắn mà yếu ớt thì nghèo hèn. Ngũ Lộ: 5 bộ vị lộ ra (mắt lộ, mũi lộ, tai phản, môi lộ răng lộ, hầu kết lộ) — thông thường lộ là xấu trừ khi có bộ vị khác cứu lại, hoặc người Hỏa hình không kỵ lộ; đủ 5 lộ mà có cứu ứng đầy đủ lại thành cách đặc biệt.",
    conditionsText: "Năm phần cân xứng (định tính); cần ảnh toàn thân",
    provenance: prov(ATTR_NANGCAO),
    notes: "Cần ảnh toàn thân — module chỉ có ảnh mặt.",
  },
  {
    id: "tuong-cam-thu",
    category: "tuong_cam_thu",
    concept: "Tướng cầm thú",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Xếp khuôn mặt và thần thái vào dạng gần giống con vật nào để nắm nhanh thần cốt và tính cách — chỉ là công cụ hỗ trợ, không kết luận đơn lẻ. Các dạng: rồng (đại quý, uy nghi, lãnh đạo); hổ (uy mạnh, quyền lực, gan dạ); sư tử (nghĩa khí, đại phú quý); trâu (cần cù, bền bỉ, phúc hậu, giàu về sau); voi (thô, an nhàn, từ ái); chó sói (tham lam, tàn nhẫn, cần cảnh giác); chuột (trí trá, nhỏ mọn, tính toán vặt); ngựa (bôn ba vất vả suốt đời); khỉ (nhanh nhẹn linh lợi nhưng thiếu ổn định).",
    conditionsText: "Xếp dáng con vật để nắm thần cốt (định tính, hỗ trợ)",
    provenance: prov(ATTR_NANGCAO),
    notes: null,
  },
  {
    id: "than-minh",
    category: "than_the",
    concept: "Thân mình",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Tướng thân thể bổ sung cho tướng mặt. Cổ (tròn đầy, chắc, không quá dài quá ngắn — cổ ngắn dày hợp người mập là phúc; cổ dài gầy hợp người gầy là Mộc hình đúng cách). Vai (cân đối, đầy đặn, không xuôi sệch — vai vững chắc là gánh vác tốt, tự chủ; vai lệch xuôi là vất vả). Lưng (dày, thẳng, có thế — lưng dày là có hậu vận, nền tảng vững). Xương thịt (cân bằng, không lộ xương không béo bụng — xương là Kim/quý, thịt là Thổ/phú; cân bằng mới phú quý song toàn).",
    conditionsText: "Cổ/vai/lưng/xương thịt cân đối (định tính); cần ảnh thân",
    provenance: prov(ATTR_NANGCAO),
    notes: "Cần ảnh thân thể — module chỉ có ảnh mặt.",
  },
  {
    id: "rau-toc",
    category: "rau_toc",
    concept: "Râu tóc",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Tóc: đen, mượt, mọc thuận, chân tóc rõ ràng, không khô xác rối rụng → than khí vượng, sức khỏe tốt, trí tuệ sáng; tóc khô vàng rụng sớm là thần khí hao, vận hay trở. Râu (nam): mọc thuận, rõ chân, dày vừa phải, hợp khí sắc → có uy tín hậu vận, con cháu nhờ cậy; râu thưa loạn xoăn không đều là vận hậu niên kém ổn định. Xét râu phải hợp với hình và tuổi; râu chỉ bàn về giai đoạn trung và hậu niên.",
    conditionsText: "Tóc đen mượt mọc thuận; râu hợp hình và tuổi (định tính)",
    provenance: prov(ATTR_NANGCAO),
    notes: null,
  },
  {
    id: "giong-noi-khi-phach",
    category: "giong_noi_khi_phach",
    concept: "Giọng nói và khí phách",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Giọng nói: một trong những yếu tố quan trọng nhất, đặc biệt cho giai đoạn 76 tuổi trở lên khi Bạch Tuế Đồ hết dữ liệu chính xác. Tốt: giọng phát từ đơn điền, trầm mà vang xa, kết thúc câu chắc, nghe như chuông khánh. Xấu: giọng nông cạn phát từ cổ họng, đứt hơi giữa chừng, khàn đục hoặc the thé không hợp giới tính. Khí phách: khí thế toát ra tổng thể, cách đi đứng ngồi nói, không thể giả tạo lâu dài. Tốt: ung dung, vững vàng, không va vấp hấp tấp. Xấu: bồn chồn, mắt lao đao, ngồi không yên, đi như chạy hoặc lắc lư.",
    conditionsText: "Giọng trầm vang từ đơn điền; khí phách ung dung vững vàng (định tính, động/âm thanh)",
    provenance: prov(ATTR_NANGCAO),
    notes: "voice/features.ts đo pitch/energy/speechRate ở mức thực nghiệm nhưng CHƯA nối; không map chắc.",
  },
  {
    id: "sat-tuong",
    category: "sat_tuong",
    concept: "Sát tướng (Thập Nhị Sát, Ngũ Sát)",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Các dấu hiệu hung sát cần kiểm tra loại trừ — nhiều dấu hiệu mới đáng lo, một dấu lẻ có thể do cách chụp hoặc trạng thái tạm thời. Thập Nhị Sát Tướng: mắt lộ hung quang; tam bạch tứ bạch; mày giao nhau rối loạn; mũi gồ sống dao (khoằm); quyền lộ xương không thịt; miệng thổi lửa khóe cúp; pháp lệnh nhập khẩu; tai phản cúp mỏng; răng lộ khấp khểnh; cằm nhọn lệch về một bên; giọng nói đứt hơi khàn đục; thần sắc thường xuyên ám trệ. Ngũ Sát: Thần sát (mắt vô thần), Cốt sát (xương lộ thô), Nhục sát (thịt béo nhão vô khí), Sắc sát (sắc mặt tối ám), Thanh sát (giọng nói xấu đoản). Cách dùng: kiểm tra loại trừ trước khi kết luận tốt — không có sát tướng là một điểm cộng quan trọng, không phải chuyện đương nhiên.",
    conditionsText: "Kiểm tra loại trừ, nhiều dấu hiệu mới đáng lo (định tính)",
    provenance: prov(ATTR_NANGCAO),
    notes: null,
  },
  {
    id: "khi-sac-theo-mua",
    category: "khi_sac",
    concept: "Khí sắc theo mùa",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Phải xác định Ngũ Hành của người trước, rồi đối chiếu màu khí sắc với mùa hiện tại. Màu hợp mùa là cát, màu bị mùa khắc chế là hung. Xuân (Mộc vượng): tốt xanh nhạt sáng/hồng nhuận, xấu trắng bệnh. Hạ (Hỏa vượng): tốt hồng đỏ tươi/tía sáng, xấu đen ám. Thu (Kim vượng): tốt trắng sáng/vàng nhuận, xấu đỏ gắt. Đông (Thủy vượng): tốt đen nhuận/xanh sáng, xấu vàng khô. Tứ quý (tháng chuyển mùa, Thổ vượng): tốt vàng tươi/hồng hào, xấu xanh ám.",
    conditionsText: "Màu khí sắc đối chiếu mùa và Ngũ Hành (định tính, màu sắc/động)",
    provenance: prov(ATTR_NANGCAO),
    notes: "Màu sắc động theo mùa — module không đo.",
  },

  // ───────────────────────────────── Quy trình (reference, không phải feature)
  {
    id: "quy-trinh-luan-giai",
    category: "quy_trinh",
    concept: "Quy trình luận giải 13 bước",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Pipeline luận giải theo thứ tự (bước 0–12): thu thập đầu vào và chấm độ tin cậy; xác định Ngũ Hành hình tượng; đánh giá Tam Đình; Ngũ Nhạc/Tứ Đậu/Lục Phủ; luận Ngũ Quan và tương tác; luận từng bộ vị; đối chiếu 12 Cung; tra Bạch Tuế Đồ; xem Thần/Khí/Sắc/nốt ruồi; các hệ nâng cao; áp dụng nguyên tắc tổng hợp (Thanh Trọc, Âm Dương Ngũ Hành, Hỗn Lưu); chấm điểm 10 trục và xếp hạng; trình bày kết luận và tư vấn hành động. Nguyên tắc xuyên suốt: Hỗn Lưu (không chốt từ một bộ vị riêng lẻ); Tướng do tâm sanh (trình bày xây dựng); nói rõ độ tin cậy; đảo chiều giới tính; không trộn với Phong Thủy nhà/Bát Tự/tên tuổi.",
    conditionsText: "Quy trình 13 bước — dùng làm khung tổ chức, không phải điều kiện feature",
    provenance: prov(ATTR_PIPELINE),
    notes: "Reference entry: quy trình, không map feature. Giữ nguyên để không mất nội dung file thứ ba.",
  },

  // ═══════════════════════════════ NHÁNH GIANG HỒ PHÁI (tách riêng, skill-derived) ═══
  {
    id: "gh-tuong-trach-duong",
    category: "giang_ho_phai_tuong_trach",
    concept: "Tướng trạch — Dương trạch (đọc nhà cửa qua mặt)",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Toàn khuôn mặt coi như một cái sân: trán là phương Nam mặt trước, cằm là Bắc phía sau, trái là Đông, phải là Tây; từ lông mày xuống miệng là trong sân, Ấn Đường là cửa chính. Vằn dọc giữa hai lông mày: 1 vằn 1 sân, 2 vằn 2 sân; vằn thô đậm nhà đã xây xong, vằn mỏng chưa xây xong. Vằn ngang ở trán: thô đậm là trước cửa có dãy nhà, mỏng/sáng là ngoại sân có đường đi. Cánh mũi là kho phòng: mũi thông thiên cao vút là nhà rộng thoáng sáng; hai cánh mũi dày đặn là nhà sinh tài. Pháp lệnh trái phải cân bằng dài đối xứng thì để ở nhà chính hướng Nam Bắc; Ngũ Quan đoan chính pháp lệnh cân đối thì để gian cạnh hướng Đông Tây. Người mặt bên to bên nhỏ nên ở căn phòng to nhất. Thừa Tương dưới môi sắc quang nhuận thì có tổ trạch thừa hưởng, thiếu khuyết thì không, có nốt ruồi thì phải tự bỏ tổ trạch, có vằn sẹo vết đỏ thì tổ trạch bị phân chia. Cây lớn đối diện cửa hoặc cửa đối cửa xung thì trong 3 năm có 2 lần tai họa.",
    conditionsText: "Đọc bản đồ nhà qua vằn/cánh mũi/pháp lệnh/Thừa Tương (định tính)",
    provenance: prov(ATTR_GIANGHO),
    notes: "Đặc trưng nhất của Giang Hồ Phái. 29 feature không đo vằn/khí sắc/nốt ruồi.",
  },
  {
    id: "gh-tuong-trach-am",
    category: "giang_ho_phai_tuong_trach",
    concept: "Tướng trạch — Âm trạch (mồ mả tổ tiên)",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Xem mồ mả tổ tiên, từ tuổi 35–40 trở lên mới chuẩn. Nguyên tắc: phong thủy quản ba đời, sơn quản nhân đinh, thủy quản tài. Xem mồ mả tốt xấu nhìn ở mép tóc gần tóc: trắng sáng là phong thủy tốt, u ám hiện xanh trùng xương là xấu. Nhân trung nghiêng lệch như hướng mộ: nghiêng trái là mộ tọa Đông Nam hướng Tây Bắc, nghiêng phải là tọa Đông Bắc hướng Tây Nam.",
    conditionsText: "Xem mép tóc / nhân trung nghiêng (định tính, từ 35–40 tuổi)",
    provenance: prov(ATTR_GIANGHO),
    notes: "29 feature không đo khí sắc mép tóc.",
  },
  {
    id: "gh-bach-tue-do",
    category: "giang_ho_phai_bach_tue_do",
    concept: "Bạch Tuế Đồ Giang Hồ (lưu niên + khí sắc)",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Bảng lưu niên ghép trọn 15–75 tuổi (một số mốc: 28 Ấn Đường Cung Mệnh; 35–40 vùng mắt Hạnh Nhân vân; 41 Sơn Căn; 44–45 Niên Thượng Thọ Thượng cung Tật Ách trên mũi; 48–50 vùng mũi; 51 Nhân Trung; 56–57 Pháp Lệnh; 60 miệng; 61 Thừa Tương; 70 giữa cằm; 71 Địa Các). Dưới 15 tuổi chỉ xem hai tai (nam tai trái Kim tinh 1–7, tai phải Mộc tinh 8–14; nữ ngược lại). Trên 76 xem giọng nói, làn da, sắc trán, hồn trong mắt — không xem bộ vị nữa. Dùng khí sắc theo lưu niên: mỗi vị trí nếu có sẹo/bớt/nốt ruồi không lông hoặc khí sắc đen u ám thì năm đó vất vả; nhuận sắc hồng thì may mắn. Vùng mắt 35–40 kỵ đen u ám và gân đỏ chằng chịt; vùng mũi 44–50 sắc sáng hồng là tốt, đỏ đậm xanh nhạt là có tai họa; Thừa Tương 61 u ám thì người trẻ dễ gặp thủy ách.",
    conditionsText: "Cộng lưu niên; đối chiếu khí sắc từng vị trí (định tính, động)",
    provenance: prov(ATTR_GIANGHO),
    notes: "Bản đồ tuổi + khí sắc động; module không đo. Khác Bạch Tuế Đồ hệ cổ điển ở một số mốc.",
  },
  {
    id: "gh-phap-lenh",
    category: "giang_ho_phai_bo_vi",
    concept: "Pháp lệnh (Giang Hồ Phái)",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Pháp lệnh gãy hoặc mờ là không tốt, vị trí này cần rõ ràng. Pháp lệnh dài quá môi dưới cách hai mép môi khoảng một phần đi xuống: nam thì cơ may phát lớn, nữ thì hôn nhân không hạnh phúc, ra đời lăn lộn sớm, vất vả. Pháp lệnh dài tới tận cằm là dấu hiệu người rất thọ (các cụ trên 80 tuổi pháp lệnh rất dài). Pháp lệnh chạm tới môi trên cạnh mép môi thì chú ý bệnh trung–hậu vận; nếu bộ vị khác xấu thì dễ trầm cảm. Trán khuyết hãm kết hợp pháp lệnh hai bên ngắn dài không đều thì vất vả. Vằn pháp lệnh dài rộng chủ đại gia tộc nhận định thịnh vượng.",
    conditionsText: "Pháp lệnh rõ, cân đối, không gãy mờ (định tính)",
    provenance: prov(ATTR_GIANGHO),
    notes: "29 feature không đo pháp lệnh. Luật hôn nhân nữ: trình bày tham khảo, không phán quyết.",
  },
  {
    id: "gh-khi-sac-bao-viec",
    category: "giang_ho_phai_khi_sac",
    concept: "Khí sắc báo việc",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Khí sắc để bắt việc hiện tại. Sắc trắng như tơ ở Niên Thượng Thọ Thượng thì năm nay có tang gần; Chuẩn Đầu ứng cho cha mẹ. Ấn Đường sắc hồng phát ánh tía: nam phát tài thăng quan, nữ thì chồng vận tốt; Ấn Đường đen u ám vận kém, trắng bệch phá thì đề phòng tai nạn tang phúc. Bệnh nặng lâu ngày sợ nhất môi đỏ thẫm, lông mày và răng chuyển màu; người bệnh mắt không thần, mồm há cơ méo tật là nguy.",
    conditionsText: "Khí sắc động theo vị trí (định tính)",
    provenance: prov(ATTR_GIANGHO),
    notes: "Khí sắc động — module không đo. Dự đoán tang/bệnh: chỉ tham khảo, không thay chẩn đoán y khoa.",
  },
  {
    id: "gh-mat",
    category: "giang_ho_phai_bo_vi",
    concept: "Mắt (Giang Hồ Phái)",
    featureConcepts: ["face.eyes.interocular_distance", "face.eyes.left_width", "face.eyes.right_width"],
    mappingKind: "partial",
    interpretation:
      "Mắt lồi tính nóng nảy dễ kích động, khó giữ bí mật, không hợp kinh doanh, nên làm nghề ăn lương hoặc kỹ thuật; mắt lồi thần lộ có gân đỏ trong tròng trắng là yếu tướng dễ dính kiện tụng. Mắt sâu tính nóng vội không tin người, thích tự làm, hợp làm chuyên gia, kết hôn muộn. Nhân vi quan, mi vi thần: mắt là vua, mày là quan, thần phải tương xứng. Hai mắt cao thấp không đều dễ có tướng hai mẹ hai cha. Hai mắt quá sát nhau là nhật nguyệt tranh uy, trung niên dễ thất bại sự nghiệp. Dưới mắt phát đen vợ mất sớm; mắt hay chớp thiếu nghị lực sự nghiệp nhiều thất bại. Ca dao: người khôn con mắt đen sì, người dại con mắt nửa chì nửa thau.",
    conditionsText: "Hai mắt không quá sát/không cao thấp lệch (định tính)",
    provenance: prov(ATTR_GIANGHO),
    notes: "'Hai mắt quá sát' ~ interocular_distance nhỏ, NHƯNG không ngưỡng số. Luật 'vợ mất sớm' đảo chiều nam-nữ, chỉ tham khảo.",
  },
  {
    id: "gh-long-may",
    category: "giang_ho_phai_bo_vi",
    concept: "Lông mày (Giang Hồ Phái)",
    featureConcepts: ["face.eyebrows.left_length", "face.eyebrows.right_length"],
    mappingKind: "partial",
    interpretation:
      "Nam lấy mày trái làm chủ, nữ lấy mày phải làm chủ khi luận anh em. Đầu mày đậm đuôi mày nhạt là tướng gả nhầm người/tin nhầm bạn, lưu niên 33–34 trục trặc hôn nhân. Mày mọc lộn xộn là tình cảm anh em bất hòa. Mày trên 60 tuổi tự nhiên mọc sợi dài bất thường là dấu hiệu thêm thọ hoặc sắp ra làm thầy huyền học. Mày dài hơn mắt là thông minh, ngắn hơn mắt là ít anh em.",
    conditionsText: "Mày dài hơn mắt, mọc thuận, đầu-đuôi đều (định tính)",
    provenance: prov(ATTR_GIANGHO),
    notes: "'dài hơn mắt' so sánh định tính, không ngưỡng số. Đảo chiều nam-nữ khi luận anh em.",
  },
  {
    id: "gh-mui",
    category: "giang_ho_phai_bo_vi",
    concept: "Mũi (Giang Hồ Phái)",
    featureConcepts: ["face.nose.length", "face.nose.width", "face.nose.bridge_ratio"],
    mappingKind: "partial",
    interpretation:
      "Hỉ tại ở mắt, hỉ phú ở mũi: mắt xem tài duyên, mũi xem tích lũy tiền. Mũi hếch lộ lỗ mũi không tụ tiền, gia cảnh bần hàn; mũi thẳng đầy đặn nhỏ cao chạy thẳng nối Ấn Đường là tài lộc cuồn cuộn. Mũi cao gò má thấp là cô phong, trung niên dễ bại nghiệp, khắc thê thất bại hôn nhân. Mũi diều hâu khoằm vô khấu tâm địa độc, có mưu, dễ phá sản. Lỗ to mũi nhỏ thích cờ bạc đầu cơ, đánh là thua. Cánh mũi không tụ tài khi quá mỏng nhỏ, có nốt đen, kim giáp không thu, một to một nhỏ, vằn pháp lệnh xung, có sẹo, hoặc lộ mũi: phòng lưu niên 44 45 48 49 50 phá tài. Sơn Căn đứt gãy hình khắc lục thân, thân ít trợ giúp, con muộn; Sơn Căn thấp dễ bệnh tim. Mũi lệch cong cột sống có vấn đề, tính cố chấp. Mũi là Long gò má là Hổ, cần Long Hổ tương xứng mới phú hiển.",
    conditionsText: "Mũi thẳng đầy đặn, cánh mũi tụ, Long Hổ tương xứng (định tính)",
    provenance: prov(ATTR_GIANGHO),
    notes: "nose.* liên quan; 'diều hâu/hếch/cô phong' và phối gò má KHÔNG đo. Dự đoán bệnh: tham khảo.",
  },
  {
    id: "gh-tai",
    category: "giang_ho_phai_bo_vi",
    concept: "Tai (Giang Hồ Phái)",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Tai to nhưng mỏng bại nghiệp gia tiên, tuổi thơ vất vả; tai dày thì dù bộ vị khác xấu cũng không thảm bại. Tai nhọn tính không kìm chế được dễ kích động; tai nhọn mà cao thì càng hung. Tai vểnh phản nhĩ ngang bướng khó nghe lời nhưng chủ tay trắng lập nghiệp; tai định sát tầm tỉ mỉ tuân thủ lễ nghĩa pháp luật. Thùy châu hướng về miệng là nhĩ châu triều hải, chăm chỉ cứ 10 năm đổi vận, đặc cách tài lộc. Người phú quý không nhất định có tai quý nhưng nhất định có mắt quý; người hèn không nhất định không có tai quý nhưng nhất định không có mắt quý. Người không có thùy châu không có vốn kim tiền, có tiền cũng tiêu nhanh, nên mua bất động sản để giữ tiền.",
    conditionsText: "Tai dày, thùy châu đầy hướng miệng (định tính)",
    provenance: prov(ATTR_GIANGHO),
    notes: "29 feature không đo tai.",
  },
  {
    id: "gh-mieng-moi-rang-nhan-trung",
    category: "giang_ho_phai_bo_vi",
    concept: "Miệng môi răng nhân trung (Giang Hồ Phái)",
    featureConcepts: ["face.mouth.width", "face.mouth.height"],
    mappingKind: "partial",
    interpretation:
      "Khóe miệng hướng lên sự nghiệp hậu vận tốt, cong xuống đi hướng suy vận. Miệng thường xuyên mở ý chí yếu, khó giữ bí mật, tì vị suy. Môi dày đều đặn lời nói trung tín hiền lành hậu vận tốt con cái hiền; môi mỏng dễ thờ ơ lạnh nhạt, nữ môi mỏng quá hay đào hoa. Nhân trung sâu dài trên hẹp dưới rộng con cháu đông; trên rộng dưới hẹp con cái càng thành công càng khó hiếu thuận; nhân trung ngắn nhưng sâu kết hôn sinh con muộn; bằng phẳng khó có tử tức. Nhân trung nghiêng trái sinh trai nghiêng phải sinh gái. Nhân trung có vằn ngang đứt là tuyệt cầu, khắc con, đàn bà khắc cả chồng, dễ đột tử — một trong những vằn hung. Răng cửa hở khe hở lâu tài giữ tiền kém, cũng chủ quan hệ với cha mẹ không tốt hay đi xa.",
    conditionsText: "Khóe miệng hướng lên, môi dày đều, nhân trung sâu (định tính)",
    provenance: prov(ATTR_GIANGHO),
    notes: "mouth.* liên quan; nhân trung/răng KHÔNG đo. Luật khắc chồng/đột tử: đảo chiều nam-nữ, chỉ tham khảo không phán quyết.",
  },
  {
    id: "gh-tran-an-duong-go-ma",
    category: "giang_ho_phai_bo_vi",
    concept: "Trán, Ấn Đường, gò má (Giang Hồ Phái)",
    featureConcepts: ["face.three_courts.upper", "face.eyebrows.spacing", "face.shape.cheek_to_face_width"],
    mappingKind: "partial",
    interpretation:
      "Trán cao rộng dày phẳng không sẹo nốt ruồi phúc lộc thọ, thuận lợi đi xa. Trán răng cưa chân tóc lởm chởm cha mất trước; kèm Sơn Căn thấp thì mẹ mất trước (không áp đặt hoàn toàn, nhưng cha mẹ sức khỏe kém). Nữ trán cao quá chủ kiến mạnh hay đối đầu chồng. Ấn Đường chuẩn rộng bằng 2 ngón tay: rộng khoáng đạt độ lượng hợp làm ăn xa; hẹp lông mày sát hay để tâm chuyện vụn vặt đố kỵ ích kỷ tự ti, hợp nghề nghiên cứu huyền học. Ấn rộng cao một đời cận quý; Ấn Đường tốt cộng sống mũi cao thì một đời nhiều quý nhân; nữ Ấn Đường là phu tinh, tốt thì chồng vận tốt. Ấn Đường có vằn Huyền Châm một vằn dọc dễ sinh con gái, ít được trợ giúp gia đình; vằn Huyền Châm dài quá Sơn Căn thì khắc sát chồng con. Vằn chữ xuyên ở Ấn Đường: nam khó làm nên trò trống, nữ đố kỵ cao hôn nhân không đẹp. Gò má cao hơn nửa mũi là gò má cao; nữ là sát phu, quyền cốt cao tính sở hữu chồng mạnh. Nốt ruồi gò má trái phá phu, gò má phải phá bản thân.",
    conditionsText: "Trán cao rộng phẳng; Ấn Đường rộng bằng 2 ngón; gò má cân xứng (định tính)",
    provenance: prov(ATTR_GIANGHO),
    notes: "three_courts.upper/eyebrows.spacing/cheek liên quan; KHÔNG ngưỡng. Luật 'sát phu'/nữ trán cao: quan niệm xã hội cũ, trình bày tham khảo không phán quyết.",
  },
  {
    id: "gh-con-cai",
    category: "giang_ho_phai_cung",
    concept: "Con cái (Cung Tử Tức)",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Cung Tử Tức là mí dưới bọng mắt Ngọa Tâm: đầy đặn khí sắc sáng bóng có con cháu; khô trũng khó mang thai ít duyên con. Cung Tử có vòng vằn loạn/vằn hình khắc sinh ly tử biệt, con cái khó thành người. Vợ mang thai thịt Cung Tử phồng lên: sắc vàng sáng tươi xuyên lông mày là thai con trai, sắc xanh nhạt con gái. Mắt dài như mắt lươn không con cái; Địa khẩu cằm trũng lõm khó mang thai.",
    conditionsText: "Ngọa Tâm đầy đặn sáng bóng (định tính, khí sắc)",
    provenance: prov(ATTR_GIANGHO),
    notes: "29 feature không đo bọng mắt/khí sắc. Dự đoán sinh sản: chỉ tham khảo.",
  },
  {
    id: "gh-hon-nhan",
    category: "giang_ho_phai_cung",
    concept: "Hôn nhân (Sơn Căn, Gian Môn)",
    featureConcepts: ["face.nose.bridge_ratio", "face.eyes.interocular_distance"],
    mappingKind: "partial",
    interpretation:
      "Sơn Căn và Gian Môn là 2 vị trí xem hôn nhân mạnh nhất, quyết định trên 90% cát hung hôn nhân. Sơn Căn không đứt vợ chồng hòa thuận; cao vút thông cống sống mũi cao dày ngay ngắn nhất định được vợ hiền chồng như ý. Sơn Căn gãy dễ dính quan phi/dính pháp luật; nữ Sơn Căn gãy kèm lộ mũi lộ chồng dễ đi tù. Gian Môn trước kết hôn màu như hoa thì hôn nhân thuận lợi, u ám thì khó thành sau bất hòa hoặc ngoại tình. Cung Phu Thê tự nhiên xuất hiện mụn sẹo là hôn nhân sắp có vấn đề. Xem số lần tái hôn đếm vằn ngũ vị (một vằn một lần); vằn Huyền Châm qua Sơn Căn một đường thẳng là ly hôn và tái hôn. Nốt ruồi trái Sơn Căn nữ có quanh phòng gian dâm, phải Sơn Căn có gian phu; đầu mũi có nốt ruồi trung niên khó thoát hủy hoại danh tiếng vì tình.",
    conditionsText: "Sơn Căn không đứt/gãy; Gian Môn sắc nhuận (định tính)",
    provenance: prov(ATTR_GIANGHO),
    notes: "bridge_ratio/interocular liên quan gián tiếp Sơn Căn; Gian Môn/khí sắc KHÔNG đo. Toàn bộ mục: trình bày tham khảo, không phán quyết đời tư.",
  },
  {
    id: "gh-khau-quyet-quan-loc-tai-van",
    category: "giang_ho_phai_khau_quyet",
    concept: "Khẩu quyết quan lộc tài vận",
    featureConcepts: ["face.nose.length", "face.nose.width", "face.nose.bridge_ratio"],
    mappingKind: "partial",
    interpretation:
      "Vận quý ở mắt, vận quan ở Ấn, vận quyền ở gò má, vận danh ở tai, vận lộc ở khẩu. Trình tự phát quan theo tuổi: Thiên Đình đẹp 25–30 công danh, mắt tốt 31–40 vinh quang, mũi tốt 41–50 phát triển, miệng tốt 50–60 quan vận hưng. Xem tài vận trước tiên xem mũi là Cung Tài Bạch: sống mũi thẳng nối Ấn Đường, chóp mũi dày, hai cánh mũi đối xứng là một đời tài vận hanh thông. (Khẩu quyết dịch từ sách, mang quan niệm xã hội cũ, chỉ tham khảo.) Tướng số vợ nạn: mắt trái nhỏ mắt phải to, Sơn Căn thấp kém, xương gò má thấp, má trái thấp, dưới mắt cụp xuống, mồm nhỏ tai mềm đều — trình bày nhẹ như xu hướng.",
    conditionsText: "Mũi thẳng chóp dày cánh đối xứng (định tính); khẩu quyết ứng tuổi",
    provenance: prov(ATTR_GIANGHO),
    notes: "'Tướng số vợ nạn' quan niệm cũ — chỉ tham khảo, không phán quyết cá nhân.",
  },
  {
    id: "gh-thap-dien-tu",
    category: "giang_ho_phai_thap_dien_tu",
    concept: "Thập Điền Tự (10 khuôn mặt chữ)",
    featureConcepts: ["face.geometry.face_shape_ratio"],
    mappingKind: "interpretation_only",
    interpretation:
      "10 khuôn mặt chữ, phân loại nhanh tính cách và vận theo hình chữ: Do (thượng đình hẹp dưới to trên nhỏ → trước 30 vất vả, tham vọng vật chất mạnh, hấp tấp); Giáp (trán rộng trên to dưới nhỏ → thông minh giỏi lập kế hoạch nhưng đa nghi hay đổi ý, hợp nghiên cứu/luật sư/thư ký); Thân (giữa to trên dưới nhỏ → nhiều tạp niệm khó thực hiện, chần chừ); Điền (mặt vuông → ổn định thực tế ý chí kiên cường, ngũ quan tốt thì lãnh đạo, xấu dễ vào tệ nạn); Đồng (hàm dưới rộng miệng rộng pháp lệnh rõ → có thực lực ít nói trách nhiệm cao, quản lý tiền kém nhưng giỏi kết giao); Vương (lộ cốt gò má trán to lộ xương → nhiều mưu kế nhưng cả đời vất vả ít bạn); Viên (mặt tròn đầu mũi to → hứng thú ăn uống thích náo nhiệt coi trọng tín nghĩa); Mục (mặt dài hẹp → cứng nhắc ứng biến kém, có linh cảm tốt); Dụng (mặt lệch không cân → hai loại tính cách không kiên định dễ trầm cảm, một đời trắc trở); Phong (ứng biến cực tốt cực sĩ diện → tự tin thẳng thắn, nữ chủ Phong hôn nhân không thuận).",
    conditionsText: "Phân loại theo hình chữ khuôn mặt (định tính)",
    provenance: prov(ATTR_GIANGHO),
    notes: "face_shape_ratio liên quan hình mặt nhưng 10 chữ cần phân loại tổng thể, không map 1 số.",
  },
  {
    id: "gh-tuong-suc-khoe",
    category: "giang_ho_phai_suc_khoe",
    concept: "Tướng sức khỏe (tham khảo)",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Mắt sắc đen tím hệ tuần hoàn máu không tốt; mắt trắng tái thiếu máu; tròng trắng khô nứt nẻ gan hỏa nhiều. Sơn Căn Niên Thượng Thọ Thượng khớp xương lồi hoặc trũng: chức năng tràng vị thận không tốt. Môi hiện sắc xanh thận máu huyết có vấn đề; chảy nước miếng buổi sáng tì vị suy hàn; hai bên Sơn Căn u ám lưng đau mỏi; đầu mũi trắng không sức nguy hiểm. Da mặt căng như da trống dù mũi nhân trung dài là tướng yểu; dưới môi Thừa Tương có ngấn sâu chết vì nước; dọc sống mũi có sắc xanh viêm xoang.",
    conditionsText: "Đối chiếu sắc/khớp xương với sức khỏe (định tính)",
    provenance: prov(ATTR_GIANGHO),
    notes: "CHỈ THAM KHẢO, KHÔNG thay chẩn đoán y khoa (cảnh báo của chính tài liệu). Module không đo sắc.",
  },
  {
    id: "gh-tinh-cach-nhin-nhanh",
    category: "giang_ho_phai_tinh_cach",
    concept: "Tính cách nhìn nhanh",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Mắt nhỏ lại sâu không nên gần không phải tâm phúc; người nhìn ghé nhìn trộm tiểu nhân gian xảo; mắt ít tròng đen nhiều gian kế. Ngồi thường cúi đầu tâm địa xấu; đi cứ cúi quay lại nhìn là tướng sói lang; không giận mà nghiến răng tướng hổ tâm địa nan trắc. Mắt lồi đỏ như mắt rắn tâm độc bất nghĩa cả anh em ruột; gò má xương cốt gồ ra tâm báo thù mạnh thường không có bạn bè. Ba xoáy trên đỉnh đầu người ác nhân.",
    conditionsText: "Quan sát ánh mắt/dáng ngồi đứng (định tính, động)",
    provenance: prov(ATTR_GIANGHO),
    notes: "Hành vi động — module không đo. Trình bày xây dựng, không dán nhãn con người.",
  },
  {
    id: "gh-not-ruoi-ban-do",
    category: "giang_ho_phai_not_ruoi",
    concept: "Nốt ruồi bản đồ mặt–cơ thể",
    featureConcepts: [],
    mappingKind: "no_mapping",
    interpretation:
      "Chỉ tính nốt ruồi nổi màu đỏ chu sa hoặc đen bóng như hạt na mới tốt/mới tính; nâu trắng mờ không tính. Nốt lộ xấu, nốt ẩn tốt. Bản đồ mặt tương ứng cơ thể: tai ↔ khuỷu tay/cạnh sườn thân; môi trái ↔ vú phải (và ngược lại); sống mũi nam ↔ bộ phận sinh dục nam; Ấn Đường Cung Mệnh ↔ quanh rốn; pháp lệnh ↔ cánh tay nữ/ống chân nam; mang tai ↔ dấu hiệu tướng chết bất ngờ tai nạn.",
    conditionsText: "Phân biệt nốt son/đen bóng với nốt mờ; vị trí ↔ cơ thể (định tính)",
    provenance: prov(ATTR_GIANGHO),
    notes: "29 feature không phát hiện nốt ruồi. Bản đồ cơ thể: tham khảo.",
  },
]);

// ───────────────────────────────── API đọc (chỉ đọc, không quyết định gì)

/**
 * Tra các mục liên quan MỘT feature key. CHỈ ĐỌC.
 *
 * ⚠️ Trả về không có nghĩa feature đó "đủ tư cách" hay luật "khớp". Việc đó do
 * Measurement Contract + Rule Engine + KNOWLEDGE_SOURCES quyết định TRƯỚC. Hàm này chỉ
 * để tầng luận giải lấy CÂU CHỮ sau khi đã có match hợp lệ.
 */
export function getInterpretationsForFeature(featureKey: string): InterpretationItem[] {
  return INTERPRETATION_LIBRARY.filter((it) => it.featureConcepts.includes(featureKey));
}

/** Tra theo nhóm hệ thống. CHỈ ĐỌC. */
export function getInterpretationsByCategory(category: string): InterpretationItem[] {
  return INTERPRETATION_LIBRARY.filter((it) => it.category === category);
}

/** Tra một mục theo id. CHỈ ĐỌC. */
export function getInterpretationItem(id: string): InterpretationItem | null {
  return INTERPRETATION_LIBRARY.find((it) => it.id === id) ?? null;
}

/** Danh sách nhóm có trong kho. */
export function listCategories(): string[] {
  return [...new Set(INTERPRETATION_LIBRARY.map((it) => it.category))].sort();
}
