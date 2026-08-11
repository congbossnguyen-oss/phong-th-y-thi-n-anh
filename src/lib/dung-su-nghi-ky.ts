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
 * 2026-08-11: đã làm 1 lượt dọn chính tả/viết hoa hiển nhiên (vd. "Thien"→"Thiên",
 * "Blnh"→"Bình", "hợP"→"hợp", thiếu dấu như "Dan"→"Dần") cho dễ đọc hơn — CHỈ sửa lỗi ký tự rõ
 * ràng khi từ đúng khớp với thuật ngữ/tên Chi đã biết trong hệ thống, KHÔNG sắp xếp lại thứ tự
 * từ, KHÔNG suy đoán thêm nội dung. Những chỗ không chắc nghĩa gì (vd. "Tlánh tam", "Phả bộ")
 * vẫn giữ nguyên như OCR, không đoán sửa.
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
    nghiRaw: "Thiên đức, Nguyệt Thiên xá, Thiên nguyện, Nguyệt đức, hợp",
    kyRaw: "Thiên cẩu, ngày Dần",
    dongOcr: "9180, 9182",
  },
  {
    ten: "Cầu phúc",
    nghiRaw:
      "Thiên đức, Nguyệt đức, Thiên đức Thiên xá, Thiên nguyện, Nguyệt ngày Khai, Phả bộ, Phúc sinh, Tlánh tam, Ích hậu, hạp, Tục",
    kyRaw: null,
    dongOcr: "9188",
  },
  {
    ten: "Nhập học",
    nghiRaw: "ngày Thành, ngày Khai; ngày Định",
    kyRaw: "Nguyệt phá, ngày Bình, ngày Thu, ngày Bế, Kiếp...",
    ghiChu:
      "Đoạn dòng 9270-9280 bị OCR trộn lẫn với nội dung mục khác ở gần đó — chỉ giữ lại phần rõ nhất, có thể còn thiếu.",
    dongOcr: "9272, 9274, 9276",
  },
  {
    ten: "Lễ cưới, đón dâu",
    nghiRaw: "Thiên đức, Nguyệt đức Thiên đức hợp; Nguyệt đức Thiên hỷ, Lục hạp, hợp,",
    kyRaw: "Nguyệt Phá, ngày Bình, ngày thời, Thiên lại, Tứ kị, Tứ vong; Bát chuyên, ngày Hại Thu, cùng",
    dongOcr: "9322, 9324",
  },
  {
    ten: "Cầu thầy, chữa bệnh",
    nghiRaw: "Thiên đức, Nguyệt đức, Thiên đức Nguyệt đức ngày Trừ, ngày hợp, hậu,",
    kyRaw: "Nguyệt Kiến, ngày Bình, ngày Thu, Tử thần, ngày Mãn, ngày Bế, Kiếp ngày 15, ngày Sóc, Huyền; Vọng sát, tháng",
    dongOcr: "9368, 9370",
  },
  {
    ten: "May đo, cắt may quần áo",
    nghiRaw: "Thiên đức, Nguyệt đức, Thiên đức Nguyệt đức hợp, Thiên xá, Thiên nguyện, Nguyệt Thời ngày hạp, an, đức,",
    kyRaw: "Nguyệt Phá, ngày Bình, ngày Thu, Kiếp sát, Tai sát, Nguyệt",
    dongOcr: "9384, 9386",
  },
  {
    ten: "Xây dựng cung thất (làm nhà)",
    nghiRaw: "Thiên đức, Nguyệt đức, Thiên đức Nguyệt đức Thiên xá, Thiên ân hợp, hợp,",
    kyRaw: "ngày Bế, Kiếp sát, Tai sát, Nguyệt Nguyệt hình, Nguyệt yếm, Đại thời, Thiên lại,",
    dongOcr: "9390, 9392",
  },
  {
    ten: "Khởi tạo, động thổ, tu tạo",
    nghiRaw: "Thiên đức Nguyệt đức Thiên đức Nguyệt đức Thiên xá, Thiên nguyện, Nguyệt ngày Khai. hợp, an, hợp,",
    kyRaw: "Nguyệt ngày Bế, Kiếp sát, Tai sát, Nguyệt sát, Nguyệt hình, Nguyệt yếm, kiến,",
    dongOcr: "9414, 9416",
  },
  {
    ten: "Khai trương",
    nghiRaw: null,
    kyRaw:
      "Nguyệt phá, Đại hao, ngày Bình, ngày Thu, ngày Bế, Kiếp Tai sát, Nguyệt sát, Nguyệt hình, Nguyệt hại, Nguyệt yếm, Đại Ngũ mộ, Cửu không.",
    ghiChu: "Đoạn OCR quanh mục này không thấy nhãn 'Nghi:' riêng — không có nghĩa là không có ngày tốt cho việc này.",
    dongOcr: "9450",
  },
  {
    ten: "Lập khế ước, hợp đồng, giao dịch",
    nghiRaw: "Thiên nguyện, ngày Dần, Tam ngày Lục hợp, hợp,",
    kyRaw:
      "Nguyệt phá, Đại hao; ngày Bình, ngày Thu, Kiếp sát, Tai sát, Nguyệt sát, Nguyệt hình, Nguyệt hại, Nguyệt yếm, Đại thời, Thiên lại, Tiểu hao, Tứ ly. Ngũ hao,",
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
    kyRaw: "Nguyệt kiến, Thổ phủ, Nguyệt phá, ngày Bình, ngày Thu, Kiếp sát, sau Thổ vương dụng sự",
    dongOcr: "9558, 9560",
  },
  {
    ten: "An táng",
    nghiRaw: "Thiên đức, Nguyệt đức, Thiên đức Nguyệt đức hợp, Thiên xá, Thiên nguyệt, Lục Ô phệ hợp, hợp,",
    kyRaw: "Nguyệt kiến, Nguyệt phá, ngày Bình, ngày Thu, Kiếp sát, Ngũ mộ, ngày Trọng, cùng, Phục",
    dongOcr: "9564, 9568",
  },
  {
    ten: "Trồng trọt",
    nghiRaw: "ngày Dần, ngày Khai, Ngũ phú. hợp, an,",
    kyRaw:
      "Kiếp sát, Tai sát, Nguyệt Đại thời, Thiên lại, Tử khí, Tứ phế, Ngũ mộ, Cửu Thổ phù, Địa nang, ngày Ất, sau Thổ vương dụng sự",
    dongOcr: "9542, 9544",
  },
  {
    ten: "Chăn thả gia súc, gia cầm",
    nghiRaw: "Thiên đức, Nguyệt đức, Thiên đức Nguyệt đức hợp, hợp,",
    kyRaw: "Nguyệt phá, ngày Bình, Tử thần, Kiếp sát, Thi sát, Nguyệt",
    dongOcr: "9552, 9554",
  },
] as const;
