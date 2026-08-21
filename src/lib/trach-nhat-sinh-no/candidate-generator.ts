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

export function sinhTatCaUngVien(input: BirthSelectionInput): BirthCandidate[] {
  const out: BirthCandidate[] = [];
  for (const date of iterateDates(input.startDate, input.endDate)) {
    for (const gio of GIO_DIA_CHI) {
      const medicalEligible =
        input.deliveryMode === "scheduled_c_section"
          ? trongKhungBenhVien(date, gio.hourRepr, input.hospitalTimeWindows)
          : true; // sinh thường/chưa rõ: không giả định chọn được giờ, nhưng vẫn liệt kê để đánh giá NGÀY
      out.push({
        id: `${toDateKey(date)}-${gio.hourRepr}h${gio.chi}`,
        date,
        chiGio: gio.chi,
        khungGio: gio.khungGio,
        hourRepr: gio.hourRepr,
        status: medicalEligible ? "GENERATED" : "MEDICAL_REJECTED",
        medicalEligible,
        hardFilterRejections: [],
        redFlags: medicalEligible
          ? []
          : [{ source: "medical", severity: "critical", code: "MEDICAL_OUT_OF_WINDOW", title: "Ngoài khung giờ bệnh viện cho phép", explanation: "Khung giờ này nằm ngoài thời gian bệnh viện cho phép mổ — y tế luôn là ràng buộc cứng, không dùng điểm mệnh lý để cứu." }],
      });
    }
  }
  return out;
}
