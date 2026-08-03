// Bảng Lục Thập Hoa Giáp (60 năm Can Chi) và Ngũ Hành Nạp Âm — dữ liệu truyền thống cố định,
// không phụ thuộc dữ liệu khách hàng. Công thức: cycleIndex = ((year - 4) % 60 + 60) % 60.

export const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
export const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

export const CON_GIAP: Record<string, string> = {
  Tý: "Chuột",
  Sửu: "Trâu",
  Dần: "Hổ",
  Mão: "Mèo",
  Thìn: "Rồng",
  Tỵ: "Rắn",
  Ngọ: "Ngựa",
  Mùi: "Dê",
  Thân: "Khỉ",
  Dậu: "Gà",
  Tuất: "Chó",
  Hợi: "Lợn",
};

export type NguHanh = "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";

// 30 cặp Nạp Âm theo đúng thứ tự chu kỳ 60 Can Chi (2 năm liên tiếp chung 1 nạp âm).
export const NAP_AM: { name: string; element: NguHanh }[] = [
  { name: "Hải Trung Kim", element: "Kim" },
  { name: "Lư Trung Hỏa", element: "Hỏa" },
  { name: "Đại Lâm Mộc", element: "Mộc" },
  { name: "Lộ Bàng Thổ", element: "Thổ" },
  { name: "Kiếm Phong Kim", element: "Kim" },
  { name: "Sơn Đầu Hỏa", element: "Hỏa" },
  { name: "Giản Hạ Thủy", element: "Thủy" },
  { name: "Thành Đầu Thổ", element: "Thổ" },
  { name: "Bạch Lạp Kim", element: "Kim" },
  { name: "Dương Liễu Mộc", element: "Mộc" },
  { name: "Tuyền Trung Thủy", element: "Thủy" },
  { name: "Ốc Thượng Thổ", element: "Thổ" },
  { name: "Tích Lịch Hỏa", element: "Hỏa" },
  { name: "Tùng Bách Mộc", element: "Mộc" },
  { name: "Trường Lưu Thủy", element: "Thủy" },
  { name: "Sa Trung Kim", element: "Kim" },
  { name: "Sơn Hạ Hỏa", element: "Hỏa" },
  { name: "Bình Địa Mộc", element: "Mộc" },
  { name: "Bích Thượng Thổ", element: "Thổ" },
  { name: "Kim Bạch Kim", element: "Kim" },
  { name: "Phú Đăng Hỏa", element: "Hỏa" },
  { name: "Thiên Hà Thủy", element: "Thủy" },
  { name: "Đại Trạch Thổ", element: "Thổ" },
  { name: "Thoa Xuyến Kim", element: "Kim" },
  { name: "Tang Đố Mộc", element: "Mộc" },
  { name: "Đại Khê Thủy", element: "Thủy" },
  { name: "Sa Trung Thổ", element: "Thổ" },
  { name: "Thiên Thượng Hỏa", element: "Hỏa" },
  { name: "Thạch Lựu Mộc", element: "Mộc" },
  { name: "Đại Hải Thủy", element: "Thủy" },
];

export const NGU_HANH_MO_TA: Record<NguHanh, string> = {
  Kim: "Cứng cỏi, quyết đoán, đề cao nguyên tắc. Hợp màu trắng, ghi, vàng ánh kim.",
  Mộc: "Nhân hậu, hướng ngoại, thích phát triển và mở rộng. Hợp màu xanh lá, xanh dương (Thủy sinh Mộc).",
  Thủy: "Linh hoạt, thông minh, thích ứng nhanh với thay đổi. Hợp màu đen, xanh dương, trắng (Kim sinh Thủy).",
  Hỏa: "Nhiệt huyết, quyết liệt, giàu năng lượng. Hợp màu đỏ, cam, tím (Mộc sinh Hỏa).",
  Thổ: "Trầm ổn, đáng tin cậy, coi trọng nền tảng lâu dài. Hợp màu vàng, nâu, cam đất (Hỏa sinh Thổ).",
};

// Chu kỳ tương sinh: Kim -> Thủy -> Mộc -> Hỏa -> Thổ -> Kim
const SINH_CYCLE: NguHanh[] = ["Kim", "Thủy", "Mộc", "Hỏa", "Thổ"];
// Chu kỳ tương khắc: Kim -> Mộc -> Thổ -> Thủy -> Hỏa -> Kim
const KHAC_CYCLE: NguHanh[] = ["Kim", "Mộc", "Thổ", "Thủy", "Hỏa"];

export function tuongSinhTuongKhac(element: NguHanh) {
  const si = SINH_CYCLE.indexOf(element);
  const ki = KHAC_CYCLE.indexOf(element);
  return {
    sinhRa: SINH_CYCLE[(si + 1) % 5], // mệnh này sinh ra mệnh nào
    duocSinh: SINH_CYCLE[(si + 4) % 5], // mệnh nào sinh ra mệnh này
    khacDuoc: KHAC_CYCLE[(ki + 1) % 5], // mệnh này khắc mệnh nào
    biKhac: KHAC_CYCLE[(ki + 4) % 5], // mệnh nào khắc mệnh này
  };
}

export function tinhMenhTheoNamSinh(year: number) {
  const cycleIndex = ((year - 4) % 60 + 60) % 60;
  const canIndex = cycleIndex % 10;
  const chiIndex = cycleIndex % 12;
  const pairIndex = Math.floor(cycleIndex / 2);
  const can = CAN[canIndex];
  const chi = CHI[chiIndex];
  const napAm = NAP_AM[pairIndex];
  return {
    canChi: `${can} ${chi}`,
    conGiap: CON_GIAP[chi],
    napAm: napAm.name,
    element: napAm.element,
    moTa: NGU_HANH_MO_TA[napAm.element],
    quanHe: tuongSinhTuongKhac(napAm.element),
  };
}
