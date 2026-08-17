/**
 * CƯỚI HỎI — HÒA THƯỢNG SÁT (何尚公煞 / 和尚煞), chỉ áp cho THÀNH HÔN / giá thú.
 *
 * Nguồn: `HOA_THUONG_SAT_NI_CO_SAT_THIEN_ANH.md` (chủ dự án cấp 2026-08-17), dẫn 《陳子性藏書》.
 *
 * BA RANH GIỚI NGUỒN NÊU RÕ, KHÔNG ĐƯỢC NỚI:
 *   1. CHỦ MỆNH = NAM MỆNH = CHÚ RỂ. Tuyệt đối không dùng tuổi cô dâu để tính sát này
 *      ("和尚 là nam, nên chỉ luận nam mệnh").
 *   2. CHỈ LUẬN NGÀY (只論日犯). Không tự chế công thức theo tháng / năm / giờ, không gộp thành
 *      "tam hợp hội cục".
 *   3. CHỈ áp Thành Hôn. Không áp nhận chức, ký hợp đồng, khai trương, động thổ, nhập trạch,
 *      an táng.
 */
import type { Data } from "@thien-anh/calendar-core";

type Chi = Data.Chi;

/**
 * Bảng Hoà Thượng Sát — Chi năm sinh CHÚ RỂ (nhóm 3 Chi) → các Chi NGÀY bị kỵ.
 *
 * Lưu theo NHÓM đúng như nguồn trình bày, thay vì trải phẳng 12 dòng: giữ được cấu trúc gốc nên
 * đọc lại còn đối chiếu được với sách, và sửa cũng khó sai hơn.
 */
export const HOA_THUONG_SAT_NHOM: readonly { nhomTuoi: readonly Chi[]; ngayKy: readonly Chi[] }[] = [
  { nhomTuoi: ["Tỵ", "Ngọ", "Mùi"], ngayKy: ["Thân", "Tý", "Thìn"] },
  { nhomTuoi: ["Thân", "Dậu", "Tuất"], ngayKy: ["Hợi", "Mão", "Mùi"] },
  { nhomTuoi: ["Hợi", "Tý", "Sửu"], ngayKy: ["Dần", "Ngọ", "Tuất"] },
  { nhomTuoi: ["Dần", "Mão", "Thìn"], ngayKy: ["Tỵ", "Dậu", "Sửu"] },
];

export interface KetQuaHoaThuongSat {
  pham: boolean;
  /** Luôn là chú rể — nguồn chốt chủ mệnh là nam mệnh. */
  doiTuong: "chu-re";
  /** Câu giải thích đầy đủ để hiện cho khách, rỗng khi không phạm. */
  lyDo: string;
}

/**
 * Xét Hoà Thượng Sát cho một ngày cưới.
 *
 * @param chiNamSinhChuRe Chi năm sinh của CHÚ RỂ (không phải cô dâu).
 * @param chiNgayCuoi     Chi của ngày cưới.
 */
export function xetHoaThuongSat(chiNamSinhChuRe: Chi, chiNgayCuoi: Chi): KetQuaHoaThuongSat {
  const nhom = HOA_THUONG_SAT_NHOM.find((n) => n.nhomTuoi.includes(chiNamSinhChuRe));
  if (!nhom) {
    // 4 nhóm phủ trọn 12 Chi nên nhánh này chỉ xảy ra khi truyền vào giá trị không phải Chi.
    throw new Error(`Chi năm sinh chú rể không hợp lệ: ${chiNamSinhChuRe}`);
  }
  const pham = nhom.ngayKy.includes(chiNgayCuoi);
  return {
    pham,
    doiTuong: "chu-re",
    lyDo: pham
      ? `Chú rể tuổi ${chiNamSinhChuRe}; nhóm ${nhom.nhomTuoi.join("-")} kỵ ngày ${nhom.ngayKy.join("-")}; ngày cưới là ${chiNgayCuoi}.`
      : "",
  };
}

/**
 * ⚠️ NI CÔ SÁT — CHƯA XÁC NHẬN, CỐ Ý CHƯA CÀI.
 *
 * Nguồn cấm rõ hai cách làm tắt mà người viết code rất dễ bị cám dỗ:
 *   - `Ni Cô Sát = reverse(Hoà Thượng Sát)`
 *   - `Ni Cô Sát = áp bảng Hoà Thượng Sát cho cô dâu`
 * 《陳子性藏書》 phân biệt hai sát này, nên đảo bảng là bịa ra một quy tắc không tồn tại — và bịa
 * ở đây thì hậu quả là khuyên sai một đám cưới.
 *
 * Chỉ bổ sung khi có nguồn riêng nêu đủ: tên sát, đối tượng nữ mệnh, bảng Chi năm sinh nữ, bảng
 * Chi ngày kỵ, phạm vi dụng sự, mức độ hung, quy tắc hoá giải.
 */
export const NI_CO_SAT = {
  batBuoc: false,
  trangThai: "CHO_XAC_NHAN" as const,
  congThuc: null,
  nguon: null,
} as const;

/**
 * ⚠️ MỨC ĐỘ CỦA HOÀ THƯỢNG SÁT — CHỜ CHỦ DỰ ÁN CHỐT.
 *
 * Nguồn xác nhận CÓ PHẠM hay không, nhưng nói thẳng là chưa đủ căn cứ để tự quyết loại thẳng hay
 * trừ điểm bao nhiêu. Vì vậy:
 *   - `hardBlock: false`  → chưa loại thẳng.
 *   - `diemPhat: null`    → chưa có trọng số; tầng chấm điểm phải BỎ QUA thay vì đoán một con số.
 *   - `catTinhHoaGiaiDuoc: null` → KHÔNG để cát tinh tự xoá sát này, nhưng cũng KHÔNG tuyên bố
 *     "vĩnh viễn không hoá giải". Cả hai đều là kết luận chưa có căn cứ.
 *
 * Trong khi chờ, module vẫn HIỆN cảnh báo cho thầy thấy — biết mà cân nhắc còn hơn không biết.
 */
export const MUC_DO_HOA_THUONG_SAT = {
  batBuoc: true,
  phamVi: "thanh-hon" as const,
  doiTuong: "chu-re" as const,
  canCu: "chi-nam-sinh-chu-re" as const,
  soVoi: "chi-ngay-cuoi" as const,
  chiXetNgay: true,
  mucDo: "CHO_CAU_HINH" as const,
  hardBlock: false,
  diemPhat: null,
  catTinhHoaGiaiDuoc: null,
} as const;
