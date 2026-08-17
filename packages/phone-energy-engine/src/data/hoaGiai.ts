/**
 * Công thức hoá giải hung tinh, mục đích → tinh ưu tiên, Dụng Thần → chữ số.
 *
 * Nguồn: `data/hoa-giai.md`, chủ dự án cung cấp 2026-08-17.
 *
 * ⚠️ Hai cơ chế SONG SONG, không loại trừ nhau:
 *   • Cơ chế A — hoá giải NỘI BỘ trong chính số điện thoại (Song Tinh Hội Ứng). Cài ở `coCheA.ts`.
 *   • Cơ chế B — hoá giải LIÊN NGUỒN CCCD ↔ số điện thoại. Cài ở `coCheB.ts`.
 * Cơ chế A đánh giá bản thân dãy số tốt/xấu; Cơ chế B đánh giá mức hỗ trợ giữa CCCD và số đang dùng.
 */
import type { MucDich, NguHanh, TenTinh } from "../types.js";

/** Công thức hoá giải cho từng hung tinh khi nó nằm trong CCCD (Tiên Thiên). */
export interface CongThucHoaGiai {
  hungTinh: TenTinh;
  /** Các cách hoá giải, mỗi cách là chuỗi cát tinh cần có ĐÚNG THỨ TỰ trái→phải. */
  cach: readonly { moTa: string; canCatTinh: readonly TenTinh[] }[];
  lyGiai: string;
}

export const CONG_THUC_HOA_GIAI: readonly CongThucHoaGiai[] = [
  {
    hungTinh: "Tuyệt Mệnh",
    lyGiai: "Tuyệt Mệnh gây mất tiền mất sức, Thiên Y là quý nhân đến cứu",
    cach: [{ moTa: "Dùng Thiên Y Thổ", canCatTinh: ["Thiên Y"] }],
  },
  {
    hungTinh: "Lục Sát",
    lyGiai: "Diên Niên đại diện dương cương mạnh mẽ, áp chế Lục Sát vốn âm nhu, đào hoa",
    cach: [{ moTa: "Dùng Diên Niên Kim", canCatTinh: ["Diên Niên"] }],
  },
  {
    hungTinh: "Ngũ Quỷ",
    lyGiai: "Ngũ Quỷ Hỏa cần bộ ba cát tinh phối đúng thứ tự, hoặc tăng cường Diên Niên",
    cach: [
      {
        moTa: "Sinh Khí + Thiên Y + Diên Niên phối đúng thứ tự",
        canCatTinh: ["Sinh Khí", "Thiên Y", "Diên Niên"],
      },
      { moTa: "Diên Niên Kim + Phục Vị phối đúng thứ tự", canCatTinh: ["Diên Niên", "Phục Vị"] },
      { moTa: "Tăng cường thêm Diên Niên Kim mạnh hơn trong dãy số", canCatTinh: ["Diên Niên"] },
    ],
  },
  {
    hungTinh: "Họa Hại",
    lyGiai: "Họa Hại Thổ cần Sinh Khí Mộc dẫn đầu",
    cach: [
      { moTa: "Sinh Khí Mộc + Diên Niên Kim phối đúng thứ tự", canCatTinh: ["Sinh Khí", "Diên Niên"] },
      { moTa: "Lặp Sinh Khí hai lần", canCatTinh: ["Sinh Khí", "Sinh Khí"] },
      { moTa: "Tăng cường thêm Sinh Khí trong dãy số", canCatTinh: ["Sinh Khí"] },
    ],
  },
];

/**
 * Phục Vị trung tính, dễ trì trệ — khi cần "kích hoạt" thì dùng Sinh Khí hoặc Thiên Y.
 * Tách riêng khỏi `CONG_THUC_HOA_GIAI` vì Phục Vị là CÁT tinh, không phải hung tinh cần hoá.
 */
export const KICH_HOAT_PHUC_VI: readonly TenTinh[] = ["Sinh Khí", "Thiên Y"];

/** Cặp cụ thể nên có trong số điện thoại khi cần một cát tinh — trích từ ví dụ trong tài liệu. */
export const CAP_GOI_Y_THEO_TINH: Readonly<Partial<Record<TenTinh, readonly string[]>>> = {
  "Thiên Y": ["13", "68", "49", "27"],
  "Diên Niên": ["19", "87", "34", "26"],
  "Sinh Khí": ["14", "67", "39", "28"],
  "Phục Vị": ["11", "22", "88", "99"],
};

/** Mục đích khách nêu → tinh cần chú trọng. Nguồn: mục "Kích hoạt theo đúng mục đích cụ thể". */
export const TINH_THEO_MUC_DICH: Readonly<Record<MucDich, { tinh: TenTinh[]; moTa: string }>> = {
  "tài lộc": { tinh: ["Thiên Y"], moTa: "muốn lợi về tiền tài thì chú trọng năng lượng Thiên Y" },
  "hôn nhân": {
    tinh: ["Thiên Y"],
    moTa: "muốn lợi về hôn nhân gia đình cũng chú trọng Thiên Y, không phải Sinh Khí",
  },
  "sự nghiệp": {
    tinh: ["Diên Niên"],
    moTa: "muốn lợi về công việc, sự nghiệp thì chú trọng năng lượng Diên Niên",
  },
  "sức khỏe": {
    tinh: ["Diên Niên"],
    moTa: "Diên Niên gắn với sức khỏe và sự bền bỉ; đồng thời nên hạn chế Họa Hại và Lục Sát",
  },
  "học hành": {
    tinh: ["Sinh Khí", "Diên Niên"],
    moTa: "Sinh Khí cộng Diên Niên cho nhân duyên tốt, học hành tốt, nhân mạch vượng",
  },
  "tổng quát": {
    tinh: ["Thiên Y", "Diên Niên", "Sinh Khí"],
    moTa: "xét lần lượt Thiên Y, rồi Diên Niên, rồi Sinh Khí, cuối cùng mới xét cân bằng cả dãy",
  },
};

/** Thứ tự ưu tiên khi chọn hoặc hoá giải số. Nguồn: mục nguyên tắc số 3. */
export const THU_TU_UU_TIEN: readonly TenTinh[] = ["Thiên Y", "Diên Niên", "Sinh Khí"];

/** Dụng Thần / Hỷ Thần Tứ Trụ → chữ số nên dùng. */
export const CHU_SO_THEO_DUNG_THAN: Readonly<Record<NguHanh, readonly number[]>> = {
  Kim: [6, 7],
  Thủy: [1],
  Mộc: [3, 4],
  Hỏa: [9],
  Thổ: [2, 5, 8],
};

/** Cảnh báo bắt buộc kèm mọi gợi ý hoá giải — tài liệu nhấn mạnh, không được bỏ. */
export const LUU_Y_KHI_GOI_Y: readonly string[] = [
  "Số điện thoại có thể cải vận theo hướng tốt hoặc xấu tuỳ cách phối — không có số nào tự thân là xấu tuyệt đối hay tốt tuyệt đối.",
  "Đổi số hay hoá giải từ trường cần thời gian mới thấy rõ, thường vài tháng đến vài năm — không nên kỳ vọng hiệu quả tức thì.",
  "Tuyệt đối không nên nhồi toàn bộ số thành cát tinh: quá cường cũng sinh vất vả, biến động và bệnh tật. Mục tiêu là cân bằng, không phải tối đa hoá cát tinh.",
  "Số tự năng lượng chỉ là một yếu tố từ trường hỗ trợ, không phải yếu tố quyết định — nỗ lực, tâm thái và hành vi mới là gốc rễ.",
];
