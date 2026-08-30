/**
 * BÁT TRẠCH NHÀ — 4 phương Cát/Hung của gia chủ + gợi ý bố trí nhanh + hóa giải + đại kỵ loan
 * đầu. Nguồn: gói build `data/04-bo-tri-va-hoa-giai.md` (bảng cơ bản) + skill `bat-trach-luan-
 * nha/references/06-cac-hang-muc.md` (hạng mục mở rộng — cầu thang, giếng nước, gương, giếng
 * trời, bể cá — theo ADDENDUM mục 1: "nội dung đầy đủ đã có sẵn trong skill, chỉ cần copy thêm
 * dòng vào bảng, không cần xác thực lại").
 */
import type { CungBatTrach } from "../cung-menh-bat-trach/cungPhi.js";
import { DU_NIEN_BAT_QUAI, KHI_BAT_TRACH_INFO } from "../cung-menh-bat-trach/duNienBatQuai.js";

const TAM_CUNG: readonly CungBatTrach[] = ["Càn", "Khảm", "Cấn", "Chấn", "Tốn", "Ly", "Khôn", "Đoài"];

export interface BonPhuongCatHung {
  catList: CungBatTrach[];
  hungList: CungBatTrach[];
}

/** 4 phương Cát (Sinh khí/Thiên y/Diên niên/Phục vị) và 4 phương Hung của 1 mệnh cung (data/02). */
export function tinh4PhuongCatHung(cungMenh: CungBatTrach): BonPhuongCatHung {
  const catList: CungBatTrach[] = [];
  const hungList: CungBatTrach[] = [];
  for (const cung of TAM_CUNG) {
    const khi = DU_NIEN_BAT_QUAI[cungMenh][cung];
    (KHI_BAT_TRACH_INFO[khi].cat ? catList : hungList).push(cung);
  }
  return { catList, hungList };
}

// -----------------------------------------------------------------------------------------------
// Gợi ý bố trí nhanh — bản CƠ BẢN (data/04, không cần mặt bằng chi tiết).
// -----------------------------------------------------------------------------------------------
export interface HangMucCoBan {
  ten: string;
  datOPhuong: "cat" | "hung";
  ghiChu: string;
}

export const HANG_MUC_CO_BAN: HangMucCoBan[] = [
  { ten: "Cửa chính", datOPhuong: "cat", ghiChu: "Ưu tiên Sinh khí, Diên niên — nơi nạp khí, quan trọng nhất." },
  { ten: "Bàn làm việc / bàn học", datOPhuong: "cat", ghiChu: "Sinh khí tốt nhất cho công danh — ngồi tựa lưng phương cát." },
  { ten: "Giường ngủ", datOPhuong: "cat", ghiChu: "Đầu giường tựa Sinh khí/Thiên y/Diên niên/Phục vị — có tường tựa vững." },
  { ten: "Bàn thờ", datOPhuong: "cat", ghiChu: "Phục vị hợp ổn định — có điểm tựa, tránh trên/dưới WC, không đối bếp." },
  { ten: "Bếp (vị trí đặt)", datOPhuong: "hung", ghiChu: "Tọa hung, miệng bếp quay về phương Cát (\"tọa hung hướng cát\")." },
  { ten: "WC / nhà tắm", datOPhuong: "hung", ghiChu: "Tránh trung cung, tránh cung bản mệnh." },
];

export const NGUYEN_TAC_UU_TIEN_XUNG_DOT =
  "Cửa chính > Bếp/Chủ (phòng ngủ chính) > phòng ngủ khác > WC > hạng mục phụ (giếng, cầu thang, gương, bàn thờ).";

export const HOA_GIAI_KHONG_HOP_MENH: string[] = [
  "Nhà khó đổi hướng → chỉnh cửa chính sang 1 trong 4 phương cát (nếu kết cấu cho phép).",
  "Cửa khó đổi → chỉnh vị trí giường gia chủ về phương cát (đầu giường tựa phương cát).",
  "Các biện pháp này chỉ \"tích tụ phúc khí\" phần nào, không bằng nhà hợp hướng từ đầu — không cường điệu hiệu quả.",
];

export const DAI_KY_LOAN_DAU: string[] = [
  "Bếp nhìn/dựa thẳng vào WC; bếp đối cửa đâm thẳng; bếp trên/dưới bể phốt; bếp đối chậu rửa/vòi nước.",
  "Giường: đối gương, dưới xà ngang, chân giường thẳng cửa chính/cửa WC, đầu giường không tựa.",
  "WC: tránh trung cung, tránh ngay cửa ra vào, tránh cung bản mệnh gia chủ.",
  "Bàn thờ: tránh trên/dưới WC, tránh đối bếp, tránh xà đè.",
];

// -----------------------------------------------------------------------------------------------
// Hạng mục MỞ RỘNG — skill `06-cac-hang-muc.md` (ADDENDUM mục 1). Mỗi hạng mục có nguyên tắc
// riêng, không quy về đơn giản "đặt phương cát/hung" như bảng cơ bản.
// -----------------------------------------------------------------------------------------------
export interface HangMucMoRong {
  ten: string;
  nguyenTac: string[];
}

export const HANG_MUC_MO_RONG: HangMucMoRong[] = [
  {
    ten: "Cầu thang",
    nguyenTac: [
      "\"Động khẩu\" (3 bậc đầu tính từ tầng trệt) quan trọng nhất — cần đặt phương cát, tránh Hoàng Tuyền/Bát Sát.",
      "Tránh cầu thang đâm thẳng lên/xuống ngay hướng cửa ra vào.",
      "Số bậc nên là số lẻ; tầng 1 thường 21-25 bậc, các tầng trên thường 21 bậc (tính riêng từng tầng).",
      "Nên đặt bên phải nhà (nhìn từ trong cửa chính ra), đi lên rẽ trái tốt hơn; vị trí lý tưởng khoảng 1/2 chiều dài nhà.",
    ],
  },
  {
    ten: "Giếng nước (đào/khoan mới)",
    nguyenTac: [
      "Ưu tiên đào tại phương thuộc Thiên Can dương (Giáp, Bính, Canh, Nhâm) hơn Thiên Can âm (Ất, Đinh, Tân, Quý).",
      "Nên đào bên phía \"thanh long\" (thường quy ước bên trái nhà nhìn từ trong ra).",
      "Tránh: đào trước cửa bếp, đào giữa nhà (trung cung), đào ngay dưới bếp, trồng hoa cạnh giếng.",
      "Tránh các năm phạm Hoàng Tuyền/Bát Sát khi tu sửa giếng.",
    ],
  },
  {
    ten: "Lấp giếng cũ",
    nguyenTac: [
      "Dọn dẹp sạch giếng, tẩy uế bằng nước thơm/nước gừng.",
      "Làm lễ xin phép Thần linh/thổ địa/thủy thần trước khi lấp.",
      "Thả tiền xu (6 hoặc 100 đồng), chỉ ngũ sắc, đặt 1-3 ống nhỏ thông lên mặt đất (\"giếng vẫn thở\"), rồi lấp bằng đất/cát sạch.",
    ],
  },
  {
    ten: "Gương",
    nguyenTac: [
      "Tránh đặt đối diện giường ngủ, bàn thờ, bếp, hoặc trong WC chiếu ra cửa/vào bồn cầu.",
      "Gương bát quái (hóa giải ngoại cảnh xấu) cần hướng ra ngoài, không tùy tiện treo trong nhà chiếu vào người ở.",
    ],
  },
  {
    ten: "Giếng trời",
    nguyenTac: [
      "Lấy sáng/thông gió cho nhà ống — vị trí, kích thước cần cân đối với tổng thể phân cung.",
      "Nếu rơi vào đúng hung phương của gia chủ, cân nhắc bố trí thêm cây xanh/vật phẩm hóa giải thay vì để trống hoàn toàn.",
    ],
  },
  {
    ten: "Bể cá",
    nguyenTac: ["Tránh đặt giữa nhà (trung cung) — dễ phạm \"thủy đọng trung cung\"."],
  },
];
