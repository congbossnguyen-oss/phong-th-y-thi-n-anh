/**
 * METHOD YEAR CONTRACT (V3-07B, Phase C) — "PHONG BÌ" tường minh để 1 phương pháp KHAI BÁO quy ước
 * năm nó cần, thay vì truyền 1 `number` tên "year" mơ hồ qua ranh giới phương pháp.
 *
 * TRUNG LẬP TUYỆT ĐỐI: file này (và calendar-core nói chung) KHÔNG chứa bảng map "method → convention".
 * Mỗi phương pháp TỰ khai `MethodYearRequest` của nó trong module CỦA CHÍNH NÓ (tầng rule-engine/app),
 * rồi gọi `resolveMethodYear`. calendar-core chỉ cung cấp CƠ CHẾ, không quyết định phương pháp nào cần
 * quy ước nào — đúng nguyên tắc "Calendar Core provides facts, Methodology decides which fact it needs".
 *
 * ĐẶC BIỆT: file này KHÔNG hard-code "Mệnh Quái = Lập Xuân" hay "Mệnh Quái = Tết". Câu hỏi đó
 * (CF-01, V3-05) VẪN CHƯA có Human Decision. Kiến trúc này cho phép đổi lựa chọn đó SAU NÀY bằng cách
 * đổi DUY NHẤT giá trị `convention` trong request của phương pháp — không đụng calendar-core, không
 * đụng BirthDate (xem test `tet-vs-lich-xuan-safety`).
 */
import type { BirthDate } from "./birthDate.js";
import {
  type YearConvention,
  type ResolvedYearContext,
  YEAR_CONVENTIONS,
  UnknownYearConventionError,
  resolveYearContext,
} from "./yearContext.js";

/**
 * Khai báo của 1 phương pháp: "điểm dùng NÀY cần quy ước năm NÀY".
 * `method` là NHÃN truy vết (vd "trach-nhat.tuoi-can-chi", "tu-vi.tru-nam", "bat-trach.cung-phi") —
 * chi tiết tới từng TRƯỜNG dữ liệu vì 1 module có thể cần nhiều quy ước cho nhiều trường (V3-06 Track 5).
 */
export interface MethodYearRequest {
  readonly method: string;
  readonly convention: YearConvention;
}

/** Kết quả: quy ước đã khai + năm/trụ đã dẫn xuất + BirthDate gốc (truy vết đầy đủ). Bất biến. */
export interface MethodYearContract {
  readonly method: string;
  readonly convention: YearConvention;
  readonly resolved: ResolvedYearContext;
  readonly birthDate: BirthDate;
}

/**
 * Giải quyết 1 MethodYearRequest trên 1 BirthDate → MethodYearContract đầy đủ.
 * Validate convention (ném `UnknownYearConventionError` nếu sai) — buộc mọi phương pháp phải khai 1
 * trong 4 quy ước hợp lệ, KHÔNG có giá trị mặc định ngầm.
 */
export function resolveMethodYear(request: MethodYearRequest, birthDate: BirthDate): MethodYearContract {
  if (!YEAR_CONVENTIONS.includes(request.convention)) {
    throw new UnknownYearConventionError(request.convention as string);
  }
  return {
    method: request.method,
    convention: request.convention,
    resolved: resolveYearContext(birthDate, request.convention),
    birthDate,
  };
}
