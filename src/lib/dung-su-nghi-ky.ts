/**
 * Nghi/Kỵ theo từng việc (dụng sự) — trích từ bản OCR "Hiệp Kỷ Biện Phương Thư Tập 1 –
 * Mai Cốc Thành" (chủ dự án cung cấp 2026-08-11), Quyển 11 "DỤNG SỰ", khoảng dòng 9176-9578
 * trong file OCR gốc.
 *
 * ⚠️ CẢNH BÁO ĐỘ TIN CẬY: bản OCR này bị xáo trộn thứ tự từ trong câu ở rất nhiều chỗ (lỗi
 * OCR/scan phổ biến của sách chữ Hán dịch cũ). Tên các thần sát/Trực riêng lẻ (vd. "Thiên
 * Đức", "Nguyệt Đức", "Kiếp Sát", "ngày Khai"...) vẫn đọc được, nhưng thứ tự liệt kê và mức
 * độ đầy đủ của từng dòng Nghi/Kỵ thì KHÔNG chắc chắn — chưa đối chiếu lại với 979 trang bản
 * gốc (mục lục cuối file OCR ghi phần "Quyển 11 Dụng sự" ở trang 839).
 *
 * Do đó: các trường `nghiRaw`/`kyRaw` dưới đây giữ NGUYÊN VĂN đúng như OCR đọc được (không
 * tự ý sắp xếp lại, không tự suy đoán thêm từ bị thiếu) — chỉ cắt đúng đoạn text nằm sau nhãn
 * "Nghi:"/"Kị:" rõ ràng trong file gốc. Chỉ chọn vào danh sách này những mục có nhãn Nghi/Kị
 * tách bạch, dễ quy về đúng 1 việc — bỏ qua các mục bị OCR trộn lẫn 2-3 việc vào nhau hoặc
 * không còn nhãn rõ ràng.
 *
 * `dongOcr` = số dòng trong file OCR gốc, dùng để tra lại khi cần đối chiếu.
 *
 * TODO: đối chiếu lại toàn bộ với bản PDF gốc trang 764-839 khi có điều kiện, rồi xoá cảnh
 * báo này.
 */

export interface DungSuNghiKyEntry {
  ten: string;
  /** Nguyên văn OCR sau nhãn "Nghi:" — null nếu sách không có mục Nghi riêng cho việc này. */
  nghiRaw: string | null;
  /** Nguyên văn OCR sau nhãn "Kị:" — null nếu sách không có mục Kị riêng cho việc này. */
  kyRaw: string | null;
  /** Ghi chú thêm nếu có (vd. điều kiêng kỵ đặc biệt riêng lẻ nằm ngay dưới mục). */
  ghiChu?: string;
  dongOcr: string;
}

export const DUNG_SU_NGHI_KY: readonly DungSuNghiKyEntry[] = [
  {
    ten: "Cúng tế",
    nghiRaw: "Thiên đức, Nguyệt Thiên xá, Thiên nguyện, Nguyệt dức, hợP",
    kyRaw: "Thiên cẩu, ngày Dàn",
    dongOcr: "9180, 9182",
  },
  {
    ten: "Cầu phúc",
    nghiRaw:
      "Thiên đức, Nguyệt dúc, Thiên đức Thien xá, Thiên nguyện, Nguyệt ngày Khai, Phả bộ, Phúc sinh, Tlánh tam, Ích hậu, hạp, Tục",
    kyRaw: null,
    dongOcr: "9188",
  },
  {
    ten: "Nhập học",
    nghiRaw: "ngày Thành, ngày Khai; ngày Đjnh",
    kyRaw: "Nguyệt phá, ngày Bình, ngày Thu, ngày Bế, Kiếp...",
    ghiChu:
      "Đoạn dòng 9270-9280 bị OCR trộn lẫn với nội dung mục khác ở gần đó — chỉ giữ lại phần rõ nhất, có thể còn thiếu.",
    dongOcr: "9272, 9274, 9276",
  },
  {
    ten: "Lễ cưới, đón dâu",
    nghiRaw: "Thiên đức, Nguyệt dúc Thiên dức hợp; Nguyệt đức Thiên hỷ, Lục hạp, hợp,",
    kyRaw: "Nguyệt Phá, ngày Blnh, ngày thời, Thiên lại, Tứ kị, Tứ vong; Bát chuyên, ngày Hại Thu, cùng",
    dongOcr: "9322, 9324",
  },
  {
    ten: "Cầu thầy, chữa bệnh",
    nghiRaw: "Thiên đức, Nguyệt dúc, Thien đức Nguyệt dức ngày Trừ, ngày hợP, hậu,",
    kyRaw: "Nguyệt Kiến, ngày Blnh, ngày Thu, Tử thàn, ngày Man, ngày Bế, Kiếp ngày 15, ngày Sóc, Huyen; Vọng sát, tháng",
    dongOcr: "9368, 9370",
  },
  {
    ten: "May đo, cắt may quần áo",
    nghiRaw: "Thien dúc, Nguyệt đức, Thiên dức Nguyệt dúc hợp, Thiên xá, Thiên nguyện, Nguyệt Thài ngày hạp, an, đức,",
    kyRaw: "Nguyệt Phá, ngày Blnh, ngày Thu, Kiếp sát, Tai sát, Nguyệt",
    dongOcr: "9384, 9386",
  },
  {
    ten: "Xây dựng cung thất (làm nhà)",
    nghiRaw: "Thiên đức, Nguyet đức, Thiên đúc Nguyệt đức Thien xá, Tbien ân hợP, hợP,",
    kyRaw: "ngày Bế, Kiep sát, Tai gát, Nguyệt Nguyệt hỉnh, Nguyệt yếm, Đại thời, Thiên lại,",
    dongOcr: "9390, 9392",
  },
  {
    ten: "Khởi tạo, động thổ, tu tạo",
    nghiRaw: "Thien đức Nguyệt dức Thiên đức Nguyệt đức Thiên xá, Thiên nguyện, Nguyệt ngày Khai. hợP, an, bợP,",
    kyRaw: "Nguyệt ngày Bế, Kiếp sát, Tai sát, Nguyệt sát, Nguyệt hỉnh, Nguyệt yếm, kiến,",
    dongOcr: "9414, 9416",
  },
  {
    ten: "Khai trương",
    nghiRaw: null,
    kyRaw:
      "Nguyệt phá, Đại hao, ngày Blnb, ngày Thu, ngày Be, Kiếp Taí sát, Nguyệt sát, Nguyệt hÌnh, Nguyệt hại, Nguyệt yếm, Đại Ngũ mộ, Cửu không.",
    ghiChu: "Đoạn OCR quanh mục này không thấy nhãn 'Nghi:' riêng — không có nghĩa là không có ngày tốt cho việc này.",
    dongOcr: "9450",
  },
  {
    ten: "Lập khế ước, hợp đồng, giao dịch",
    nghiRaw: "Thiên nguyện, ngày Dân, Tam ngày Lục hợp, hợp,",
    kyRaw:
      "Nguyệt phá, Đại hao; ngày Blnh, ngày Thu, Kiếp sát, Tai sát, Nguyệt sát, Nguyệt hỉnh, Nguyệt hại, Nguyệt yếm, Đại thời, Thiên lạí, Tiểu hao, Tứ ly. Ngú hao,",
    dongOcr: "9454, 9456",
  },
  {
    ten: "Khai mương, đào giếng",
    nghiRaw: "ngày Khai",
    kyRaw: "Thổ phủ, Nguyệt phá, ngày Bình, ngày Thu, ngày Bế, Kiếp sát, sau Thổ vương dụng sự",
    ghiChu: "Sách còn ghi riêng: 'Ngày Nhâm kỵ khai mương, ngày Mão kỵ đào giếng' (dòng 9484).",
    dongOcr: "9480, 9482, 9484",
  },
  {
    ten: "Phá, vỡ đất",
    nghiRaw: "Ô phệ, Ô phệ đối",
    kyRaw: "Nguyệt kiến, Thổ phủ, Nguyệt phá, ngày Blnb, ngày Thu, Kiếp sát, sau Thổ vương dụng sự",
    dongOcr: "9558, 9560",
  },
  {
    ten: "An táng",
    nghiRaw: "Thiên dúc, Nguyệt đức, Thiên đức Nguyệt đuc hợp, Thien xá, Thiên nguyệt, Lục Ô phệ bợp, bợp,",
    kyRaw: "Nguyệt kiến, Nguyệt phá, ngày Bỉnh, ngày Thu, Kiếp sát, Ngũ mọ, ngày Trọng, cùng, Phục",
    dongOcr: "9564, 9568",
  },
  {
    ten: "Trồng trọt",
    nghiRaw: "ngày Dan, ngày Khai, Ngú phú. hợP, an,",
    kyRaw:
      "Kiếp sát, Iai sát, Nguyệt Đại tbời, Thien lại, Tử khí, Tứ phế, Ngũ mọ, Cửu Thổ phù, Địa nang, ngày Át, sau Thổ vưđng dung sự",
    dongOcr: "9542, 9544",
  },
  {
    ten: "Chăn thả gia súc, gia cầm",
    nghiRaw: "Thien dức, Nguyet dửc, Thien đức Nguyệt đức hợP, hợP,",
    kyRaw: "Nguyệt phá, ngày Bình, Tử thần, Kiếp sát, Thi sát, Nguyệt",
    dongOcr: "9552, 9554",
  },
] as const;
