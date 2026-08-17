/**
 * 10 nhóm từ trường (điểm xâm nhập) + nguyên tắc đọc vị trí trái–phải.
 *
 * Nguồn: `data/10-nhom-tu-truong.md`, chủ dự án cung cấp 2026-08-17.
 */
import type { TenTinh } from "../types.js";

/**
 * Nguyên tắc trái–phải: khi một tinh làm trung tâm, tinh đứng bên trái và bên phải nó mang ý nghĩa
 * khác nhau. Dùng để ghép câu diễn giải cho từng bộ 3 số ở Bước 2.
 *
 * Key ngoài = tinh làm TRUNG TÂM; key trong = tinh đứng cạnh.
 */
export interface YNghiaViTri {
  trai?: string;
  phai?: string;
}

export const TRAI_PHAI: Readonly<
  Partial<Record<TenTinh, { chuDe: { trai: string; phai: string }; canh: Partial<Record<TenTinh, YNghiaViTri>> }>>
> = {
  "Thiên Y": {
    chuDe: { trai: "tài phú đến từ đâu", phai: "tài phú đi về đâu" },
    canh: {
      "Diên Niên": { trai: "sự nghiệp sinh tài", phai: "có tiền đầu tư vào sự nghiệp" },
      "Tuyệt Mệnh": { trai: "đầu tư sinh tài", phai: "kiếm tiền để đầu tư tiếp hoặc tiêu lớn" },
      "Lục Sát": {
        trai: "nghề nghiệp thiên về giao tế, hình thức sinh tài",
        phai: "chi cho gia đình, người yêu, nữ giới",
      },
      "Ngũ Quỷ": {
        trai: "đầu tư, biến động, xuất nhập khẩu dẫn đến phú",
        phai: "tiêu tốn vì biến động chỗ ở, tình cảm, sự nghiệp, sức khỏe",
      },
      "Họa Hại": {
        trai: "nghề nói chuyện, giáo viên kiếm tiền",
        phai: "tiêu tiền vì tranh chấp hoặc ăn chơi",
      },
    },
  },
  "Diên Niên": {
    chuDe: { trai: "hành động, sự nghiệp", phai: "tâm thái" },
    canh: {
      "Sinh Khí": { trai: "nghề giao tiếp, vui vẻ, không chắc kiếm nhiều tiền" },
      "Thiên Y": {
        trai: "nghề liên quan tiền như ngân hàng, quản lý tài chính",
        phai: "tuỳ duyên, tuỳ tính",
      },
      "Tuyệt Mệnh": { trai: "nghề đầu tư", phai: "cầu nhanh, xung động, tự làm tự chịu" },
      "Lục Sát": { trai: "nghề dịch vụ, giao tế", phai: "tâm trạng không vui vẻ" },
      "Ngũ Quỷ": {
        trai: "nghề chiến lược, thiết kế, quản lý tài chính, có biến động",
        phai: "không thoả mãn hiện tại, nhiều suy nghĩ, khó bền lâu",
      },
      "Họa Hại": {
        trai: "nghề diễn giảng, phục vụ, giao tiếp",
        phai: "nói nhiều dễ tranh chấp, nhiều cản trở",
      },
    },
  },
  "Sinh Khí": {
    chuDe: { trai: "quý nhân đến từ đâu", phai: "quý nhân đi về đâu, có thể biến chất" },
    canh: {
      "Diên Niên": { trai: "quý nhân là đồng nghiệp, bạn bè" },
      "Tuyệt Mệnh": {
        trai: "bạn bè quen biết qua thương trường, đầu tư",
        phai: "quý nhân biến thành tiểu nhân, tiêu tiền của bạn",
      },
      "Lục Sát": {
        trai: "quý nhân khác giới nhờ sức hấp dẫn",
        phai: "quý nhân mang đến khó khăn, chuyện không vui",
      },
      "Ngũ Quỷ": {
        trai: "cơ duyên ngẫu nhiên thành quý nhân",
        phai: "quý nhân biến tiểu nhân, đem đến bất ổn và áp lực",
      },
      "Họa Hại": {
        trai: "nói chuyện mà có quý nhân",
        phai: "quý nhân biến tiểu nhân, nói nhiều tranh cãi",
      },
    },
  },
};

export interface NhomTuTruong {
  ten: string;
  moTa: string;
  /** Mỗi mẫu là một cặp tinh (trái, phải) kèm ý nghĩa và ví dụ tổ hợp trong tài liệu. */
  mau: readonly { cap: readonly [TenTinh, TenTinh]; yNghia: string; viDu: readonly string[] }[];
  /** Ghi chú dạng lời cho nhóm không mô tả được bằng cặp tinh. */
  ghiChu?: readonly string[];
}

export const MUOI_NHOM: readonly NhomTuTruong[] = [
  {
    ten: "Đầu tư",
    moTa: "khả năng và xu hướng bỏ tiền ra sinh lời",
    mau: [
      { cap: ["Tuyệt Mệnh", "Thiên Y"], yNghia: "đầu tư sẽ kiếm được tiền", viDu: ["213", "312"] },
      {
        cap: ["Tuyệt Mệnh", "Diên Niên"],
        yNghia: "đầu tư và quản lý tài chính cho sự nghiệp",
        viDu: ["219", "126"],
      },
    ],
  },
  {
    ten: "Hôn nhân",
    moTa: "nhân duyên và đời sống vợ chồng",
    mau: [
      {
        cap: ["Sinh Khí", "Thiên Y"],
        yNghia: "quý nhân vượng thê tài, nhân duyên đáng mừng",
        viDu: ["413", "827"],
      },
    ],
  },
  {
    ten: "Quan vận",
    moTa: "thăng tiến, chức vụ",
    mau: [
      { cap: ["Sinh Khí", "Diên Niên"], yNghia: "dùng để cầu thăng quan", viDu: ["419", "678"] },
      { cap: ["Diên Niên", "Ngũ Quỷ"], yNghia: "công việc có biến động", viDu: ["918", "197"] },
      { cap: ["Thiên Y", "Diên Niên"], yNghia: "có tiền đầu tư cho chủ", viDu: [] },
    ],
    ghiChu: [
      "Cặp Diên Niên 19 cho thấy năng lực mạnh, tinh thần trách nhiệm cao.",
      "Đại Diên Niên chuyển sang Tiểu Diên Niên (ví dụ 9162) cho thấy độ nhiệt tình với công việc giảm dần.",
    ],
  },
  {
    ten: "Học hành",
    moTa: "khả năng tiếp thu và quan hệ trong học tập",
    mau: [
      {
        cap: ["Sinh Khí", "Diên Niên"],
        yNghia: "nhân duyên tốt, học hành tốt, nhân mạch vượng",
        viDu: ["341", "914", "678", "934", "826"],
      },
    ],
  },
  {
    ten: "Sức khỏe",
    moTa: "nền tảng thể chất",
    mau: [],
    ghiChu: [
      "Nên giảm tối đa các tổ số lặp liên tiếp như 1311, 1333, 1553, 1003.",
      "Nên tận dụng tổ Diên Niên: 19, 91, 78, 87, 34, 43, 26, 62.",
      "Nên giảm tổ Họa Hại: 17, 71, 98, 89, 64, 46, 32, 23.",
    ],
  },
  {
    ten: "Tiêu tiền tài",
    moTa: "tiền kiếm được sẽ chảy đi đâu",
    mau: [
      { cap: ["Thiên Y", "Sinh Khí"], yNghia: "tiền tiêu cho bạn bè", viDu: ["314"] },
      { cap: ["Thiên Y", "Lục Sát"], yNghia: "tiền tiêu cho gia đình, phụ nữ", viDu: ["316"] },
      { cap: ["Thiên Y", "Tuyệt Mệnh"], yNghia: "đầu tư, mở hàng tốn tiền", viDu: ["312"] },
      { cap: ["Thiên Y", "Diên Niên"], yNghia: "hiểu tài chính, biết quản lý", viDu: ["319"] },
    ],
  },
  {
    ten: "Đào hoa",
    moTa: "nhân duyên khác giới",
    mau: [
      { cap: ["Lục Sát", "Họa Hại"], yNghia: "thiên đào hoa, tình cảm nhiều tranh chấp", viDu: ["617"] },
      { cap: ["Lục Sát", "Phục Vị"], yNghia: "tình cảm trì trệ, không vui", viDu: ["6115"] },
    ],
    ghiChu: [
      "Chính đào hoa là năng lượng Thiên Y: 13, 68, 94, 72, 31, 86, 49, 27, 153, 351, 658, 856.",
    ],
  },
  {
    ten: "Nhân mạch",
    moTa: "quan hệ và người trợ giúp",
    mau: [
      {
        cap: ["Sinh Khí", "Thiên Y"],
        yNghia: "quý nhân đem tài vận đến",
        viDu: ["413", "149", "768", "672"],
      },
      { cap: ["Sinh Khí", "Diên Niên"], yNghia: "quý nhân giúp thăng quan", viDu: ["419", "678"] },
      {
        cap: ["Sinh Khí", "Tuyệt Mệnh"],
        yNghia: "quý nhân giúp tiêu tiền, đầu tư",
        viDu: ["412", "673"],
      },
      { cap: ["Sinh Khí", "Phục Vị"], yNghia: "quý nhân nhiều", viDu: ["411", "141", "451"] },
    ],
  },
  {
    ten: "Bệnh tật",
    moTa: "các bộ phận dễ có vấn đề",
    mau: [],
    ghiChu: [
      "Họa Hại mạnh liên quan bệnh hô hấp, khí quản, khoang miệng, tuyến bạch huyết, hệ miễn dịch (ví dụ 171, 1071, 1711).",
      "Hai bên của Họa Hại cho thông tin khác nhau, ví dụ 1231: bên trái 12 ứng gan mật, bên phải 31 ứng huyết áp.",
      "Tổ số lặp kéo dài như 13111 ứng huyết áp, 797 ứng tim mạch, 14141 ứng dạ dày và ruột.",
    ],
  },
  {
    ten: "Họa Hại Thổ mở rộng",
    moTa: "các tổ số Họa Hại thường gặp",
    mau: [],
    ghiChu: [
      "Các tổ hay gặp: 171, 898, 646, 323, 157, 751, 859, 958, 654, 456, 352, 253, 1711, 8988, 6464, 3232.",
    ],
  },
];

/** 4 hiểu lầm phổ biến — luôn hiển thị để khách không tự suy diễn sai. */
export const HIEU_LAM_PHO_BIEN: readonly string[] = [
  "Không phải cứ càng nhiều năng lượng tài phú (Thiên Y) càng tốt — quá cường cũng sinh bệnh và mất cân bằng.",
  "Không phải nữ giới thì không nên có Diên Niên. Diên Niên bản chất là tài lộc và sức khỏe, không đối lập với tình cảm; chỉ khi Diên Niên quá dày đặc mới có lưu ý riêng.",
  "Không phải đàn ông có Lục Sát là ngoại tình — Lục Sát cũng có thể là người hết lòng chăm sóc gia đình, tuỳ phối hợp tổng thể.",
  // Nguyên văn tài liệu là "cứ toàn cát tinh cấp 1 là số tốt nhất". Diễn đạt lại không dùng chữ
  // "cấp 1" vì đó là mã nội bộ của bảng tra, không được lộ ra cho khách (quy tắc trình bày).
  "Không phải cứ toàn cát tinh mạnh nhất là số tốt nhất — dễ quá cường sinh vất vả, bệnh tật và biến động.",
];
