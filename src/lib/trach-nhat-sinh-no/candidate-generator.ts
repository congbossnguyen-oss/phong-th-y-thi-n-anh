/**
 * Sinh TOÀN BỘ ứng viên (mỗi ngày × 12 giờ Địa Chi) trong khung dự sinh, đúng nguyên tắc §1 spec:
 * "lập toàn bộ ứng viên trước rồi mới lọc" — không nhìn vài ngày rồi phán.
 *
 * Mỗi ứng viên chỉ mang thông tin thô (ngày, giờ đại diện) — CHƯA tính Bát Tự/Tử Vi ở bước này
 * (đó là việc của hard-filter/structural-bat-tu/tu-vi-layer, gọi thẳng `tinhBatTu()`/`tinhTuVi()`
 * đã có sẵn, không viết lại).
 */
import type { BirthSelectionInput, BirthCandidate } from "./types";

/** 12 giờ Địa Chi, hourRepr = giờ bắt đầu khối 2 tiếng (quy ước Ngũ Thử Độn chuẩn). */
export const GIO_DIA_CHI: { chi: string; hourRepr: number; khungGio: string }[] = [
  { chi: "Tý", hourRepr: 23, khungGio: "23h–01h" },
  { chi: "Sửu", hourRepr: 1, khungGio: "01h–03h" },
  { chi: "Dần", hourRepr: 3, khungGio: "03h–05h" },
  { chi: "Mão", hourRepr: 5, khungGio: "05h–07h" },
  { chi: "Thìn", hourRepr: 7, khungGio: "07h–09h" },
  { chi: "Tỵ", hourRepr: 9, khungGio: "09h–11h" },
  { chi: "Ngọ", hourRepr: 11, khungGio: "11h–13h" },
  { chi: "Mùi", hourRepr: 13, khungGio: "13h–15h" },
  { chi: "Thân", hourRepr: 15, khungGio: "15h–17h" },
  { chi: "Dậu", hourRepr: 17, khungGio: "17h–19h" },
  { chi: "Tuất", hourRepr: 19, khungGio: "19h–21h" },
  { chi: "Hợi", hourRepr: 21, khungGio: "21h–23h" },
];

function toDateKey(d: { year: number; month: number; day: number }): string {
  return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
}

/** Liệt kê từng ngày dương lịch từ startDate đến endDate (bao gồm cả 2 đầu), dùng UTC để tránh lệch DST. */
function* iterateDates(start: BirthSelectionInput["startDate"], end: BirthSelectionInput["endDate"]) {
  const startUtc = Date.UTC(start.year, start.month - 1, start.day);
  const endUtc = Date.UTC(end.year, end.month - 1, end.day);
  if (endUtc < startUtc) throw new Error("endDate phải sau hoặc bằng startDate.");
  for (let t = startUtc; t <= endUtc; t += 86_400_000) {
    const d = new Date(t);
    yield { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
  }
}

/** Khung giờ bệnh viện cho phép giờ đại diện `hourRepr` của 1 ngày cụ thể hay không. */
function trongKhungBenhVien(
  date: { year: number; month: number; day: number },
  hourRepr: number,
  windows: BirthSelectionInput["hospitalTimeWindows"],
): boolean {
  if (!windows || windows.length === 0) return true; // không giới hạn → xét đủ 12 giờ
  const dateKey = toDateKey(date);
  const apDung = windows.filter((w) => !w.date || toDateKey(w.date) === dateKey);
  if (apDung.length === 0) return false; // có khai báo windows nhưng không áp dụng cho ngày này
  return apDung.some((w) => {
    // Khung giờ bệnh viện thường không qua nửa đêm (vd 8h-17h); xử lý cả trường hợp qua đêm cho chắc.
    if (w.startHour <= w.endHour) return hourRepr >= w.startHour && hourRepr < w.endHour;
    return hourRepr >= w.startHour || hourRepr < w.endHour;
  });
}

/**
 * Sinh ứng viên trên ĐỦ 12 CANH GIỜ mỗi ngày.
 *
 * ⚠️ ĐỔI HƯỚNG 27/8/2026 (anh Công chốt): *"chúng ta sẽ tính dựa trên 12 canh giờ, không liên quan
 * việc bác sỹ có làm hay không"*. Trước đây khung giờ bệnh viện là RÀNG BUỘC CỨNG, ứng viên ngoài
 * khung bị loại thẳng (`MEDICAL_REJECTED`) — đo thật cho thấy với khung mổ 7h–17h thì **0/336** ứng
 * viên sống sót, tức là ca dùng phổ biến nhất (mổ chủ động) gần như luôn trả về "không có phương án".
 *
 * Nay: luôn chấm đủ 12 canh giờ theo mệnh lý; khung giờ bệnh viện (nếu gia đình có khai) chỉ còn là
 * GHI CHÚ tham khảo gắn kèm phương án, KHÔNG loại và KHÔNG trừ điểm. Việc thu xếp với bệnh viện là
 * quyết định của gia đình, công cụ không thay họ cắt bớt lựa chọn.
 */
export function sinhTatCaUngVien(input: BirthSelectionInput): BirthCandidate[] {
  const out: BirthCandidate[] = [];
  for (const date of iterateDates(input.startDate, input.endDate)) {
    for (const gio of GIO_DIA_CHI) {
      // Chỉ để GẮN NHÃN cho gia đình dễ thu xếp — không ảnh hưởng lọc/xếp hạng.
      const trongKhungGioBenhVien = trongKhungBenhVien(date, gio.hourRepr, input.hospitalTimeWindows);
      out.push({
        id: `${toDateKey(date)}-${gio.hourRepr}h${gio.chi}`,
        date,
        chiGio: gio.chi,
        khungGio: gio.khungGio,
        hourRepr: gio.hourRepr,
        status: "GENERATED",
        medicalEligible: true, // luôn xét — xem ghi chú đổi hướng ở trên
        ngoaiKhungGioBenhVien: !trongKhungGioBenhVien,
        hardFilterRejections: [],
        redFlags: trongKhungGioBenhVien
          ? []
          : [{
              source: "medical",
              severity: "low",
              code: "MEDICAL_OUT_OF_WINDOW",
              title: "Ngoài khung giờ bệnh viện gia đình đã khai",
              explanation: "Giờ này nằm ngoài khung mổ mà gia đình khai báo. Đây CHỈ là ghi chú để tiện thu xếp — công cụ vẫn chấm đủ 12 canh giờ theo mệnh lý, không loại giờ nào vì lý do lịch bệnh viện.",
            }],
      });
    }
  }
  return out;
}
