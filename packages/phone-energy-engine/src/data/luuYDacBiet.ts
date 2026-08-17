/**
 * Ngưỡng cảnh báo đặc biệt + nguyên tắc "hung tinh không chắc đã hung".
 *
 * Nguồn: `data/luu-y-dac-biet.md`, chủ dự án cung cấp 2026-08-17.
 */
import type { TenTinh } from "../types.js";

/** Ngưỡng đếm — để ở đây thay vì rải trong logic, sau chỉnh dễ. */
export const NGUONG = {
  /** "nhiều hơn 3 số 5" → >3, tức từ 4 trở lên. */
  soLuong5: 3,
  /** "nhiều hơn 2 số 0" → >2, tức từ 3 trở lên. */
  soLuong0: 2,
  /** Số cặp Diên Niên coi là "dày đặc". */
  dienNienDayDac: 3,
} as const;

/** Các cặp Diên Niên dùng để đếm mức độ dày đặc. */
export const CAP_DIEN_NIEN: readonly string[] = ["19", "91", "78", "87", "34", "43", "26", "62"];

/** Ý nghĩa số 0 khi rơi vào từng lĩnh vực — dùng diễn giải chi tiết khi 0 chen vào một cặp. */
export const Y_NGHIA_SO_0_THEO_LINH_VUC: Readonly<Record<string, string>> = {
  "sự nghiệp": "đình trệ",
  "tình cảm": "có vấn đề",
  "tiền tài": "bị hao mất",
  "quý nhân": "biến thành tiểu nhân gây trở ngại",
  "trí tuệ": "do dự, thiếu quyết đoán",
  "tai họa": "liên tục không ngừng",
  "sức khỏe": "dễ phát sinh bệnh tật",
};

/**
 * Mỗi Bát tinh thuộc lĩnh vực nào — để biết số 0 chen vào cặp đó thì diễn giải theo dòng nào của
 * `Y_NGHIA_SO_0_THEO_LINH_VUC`.
 *
 * Ánh xạ này KHÔNG tự nghĩ ra: lấy đúng cột chủ đề của từng tinh trong bảng tra gốc
 * (`bang-tra-bat-tinh.md` mục 2-3). Tinh nào chủ đề gộp nhiều mặt thì liệt kê đủ các mặt đó.
 *
 * ⚠️ Phục Vị CỐ Ý để trống: chủ đề của nó trong bảng gốc là "trung tính, giữ nguyên trạng", không
 * ứng với lĩnh vực nào trong bảy lĩnh vực trên. Gán bừa một lĩnh vực cho nó là bịa.
 */
export const LINH_VUC_THEO_TINH: Readonly<Record<string, readonly string[]>> = {
  "Thiên Y": ["tiền tài"],
  "Diên Niên": ["sự nghiệp", "sức khỏe"],
  "Sinh Khí": ["quý nhân"],
  "Phục Vị": [],
  "Tuyệt Mệnh": ["tiền tài", "sức khỏe", "tai họa"],
  "Ngũ Quỷ": ["tai họa"],
  "Lục Sát": ["tình cảm"],
  "Họa Hại": ["tai họa"],
};

export const BAN_CHAT_SO_0 =
  "Người có nhiều số 0 thường thông minh, hay suy nghĩ sâu, thích triết lý. Mặt tích cực là trí tuệ sâu sắc; mặt tiêu cực là thiếu tập trung, do dự, hay trở thành cầu nối giúp người khác thành công còn bản thân khó tích luỹ.";

export const BAN_CHAT_SO_5 =
  "Người có nhiều số 5 thường năng động, quyết đoán, dễ thành người tiên phong — nhưng cũng dễ nóng nảy, thiếu kiên nhẫn, dễ xung đột và cực đoan nếu số 5 xuất hiện quá nhiều.";

/** Đuôi số bất lợi hôn nhân nữ giới (có Diên Niên Kim làm sự nghiệp nữ quá vượng). */
export const DUOI_BAT_LOI_HON_NHAN_NU: readonly string[] = ["901", "109", "807", "708"];

/** Cặp Lục Sát ở đuôi số — bất lợi hôn nhân nữ giới, càng gần cuối càng rõ. */
export const CAP_LUC_SAT_DUOI: readonly string[] = ["16", "61"];

/**
 * "Hung tinh không chắc đã hung" — cùng một tinh biểu hiện khác nhau tuỳ nghề nghiệp.
 * Bắt buộc nêu khi kết luận, tránh áp máy móc hung tinh = xấu.
 */
export const HUNG_TINH_CO_MAT_LOI: Readonly<Partial<Record<TenTinh, string>>> = {
  "Tuyệt Mệnh": "người làm cảnh sát, pháp luật hưởng lợi từ khí chất quyết đoán của năng lượng này",
  "Họa Hại": "người làm ngoại giao, thuyết phục hưởng lợi từ sự kiên trì và tận tâm của năng lượng này",
  "Ngũ Quỷ": "người làm sáng tạo, kỹ thuật hưởng lợi từ sự linh hoạt và hay đổi mới của năng lượng này",
  "Lục Sát": "người làm nghệ thuật, thẩm mỹ hưởng lợi từ sự tinh tế và chuyên sâu của năng lượng này",
};

/** Cặp cần diễn đạt cẩn trọng, tránh gây hoang mang. */
export const CAP_CAN_THAN_TRONG: readonly string[] = ["12", "21", "73", "37", "84", "48"];

export const LOI_THAN_TRONG =
  "Dân gian có cách nói ví von nặng nề về tổ số này, nhưng đó chỉ là cách nhấn mạnh mức độ hao tổn tài chính, kiện tụng hoặc bệnh tật — không nên hiểu theo nghĩa đen.";
