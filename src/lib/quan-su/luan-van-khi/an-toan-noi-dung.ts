// AN TOÀN NỘI DUNG — SPEC.md §5 (RÀNG BUỘC CỨNG, không được nới).
//
// App người dùng cuối tự đọc kết quả, KHÔNG có thầy lọc ở giữa. Một câu phán "năm X có tang" hay
// "năm Y ly hôn" có thể gây tổn hại tâm lý thật. Module chỉ chấm MỨC ĐỘ THUẬN LỢI để người dùng chủ
// động chuẩn bị, không đóng vai thầy bói phán sự kiện — xem lý do đầy đủ ở SPEC.md §5.
//
// Đây là LƯỚI AN TOÀN TẦNG 2 (tầng 1 là prompt cấm AI dùng từ — xem prompt.ts). Dù prompt có chặt
// đến đâu, model vẫn có thể lọt từ cấm — hàm `hauKiemLoiLuan` ở đây PHẢI chạy sau MỌI lượt gọi AI,
// không có ngoại lệ.
import type { LinhVucKey } from "./types";
import configRaw from "./config-linh-vuc.json";

const CONFIG = configRaw as unknown as {
  content_safety: {
    tu_khoa_cam_tuyet_doi: string[];
    quy_tac_dien_dat: string[];
    disclaimer_bat_buoc: string;
  };
};

export const TU_KHOA_CAM_TUYET_DOI: string[] = CONFIG.content_safety.tu_khoa_cam_tuyet_doi;
export const QUY_TAC_DIEN_DAT: string[] = CONFIG.content_safety.quy_tac_dien_dat;
export const DISCLAIMER_BAT_BUOC: string = CONFIG.content_safety.disclaimer_bat_buoc;

/** Quét 1 đoạn văn, trả về danh sách từ cấm tìm thấy (rỗng nếu sạch). */
export function timTuCam(vanBan: string): string[] {
  return TU_KHOA_CAM_TUYET_DOI.filter((tu) => vanBan.includes(tu));
}

/**
 * Câu mẫu an toàn dự phòng — dùng khi (a) không gọi được AI (thiếu API key / lỗi mạng), hoặc (b) AI
 * trả về vẫn dính từ cấm sau khi đã thử lại. Bám ĐÚNG `content_safety.quy_tac_dien_dat` từng lĩnh
 * vực trong config-linh-vuc.json — không tự sáng tác giọng văn khác.
 */
export function mauCauAnToan(linhVuc: LinhVucKey, diem: number): string {
  const thapHoacCaoDep = diem >= 8 ? "cao" : diem >= 6 ? "kha" : diem === 5 ? "trung" : diem >= 3 ? "luuY" : "thap";

  const MAU: Record<LinhVucKey, Record<"cao" | "kha" | "trung" | "luuY" | "thap", string>> = {
    suc_khoe: {
      cao: "Xu hướng sức khỏe giai đoạn này khá thuận, cơ thể có nền tảng tốt để duy trì nhịp sống hiện tại.",
      kha: "Xu hướng sức khỏe giai đoạn này thuận lợi, vẫn nên giữ nếp sinh hoạt điều độ.",
      trung: "Xu hướng sức khỏe giai đoạn này ở mức bình hòa, không có dấu hiệu gì nổi bật.",
      luuY: "Đây là giai đoạn nên chú ý giữ gìn sức khỏe hơn, khám định kỳ để yên tâm.",
      thap: "Đây là giai đoạn nên đặc biệt chú ý giữ gìn sức khỏe, khám định kỳ và nghỉ ngơi hợp lý.",
    },
    tinh_duyen: {
      cao: "Xu hướng tình duyên giai đoạn này khá thuận lợi, là thời điểm tốt để vun đắp thêm cho mối quan hệ.",
      kha: "Xu hướng tình duyên giai đoạn này thuận lợi, thích hợp để gắn kết và thấu hiểu nhau hơn.",
      trung: "Xu hướng tình duyên giai đoạn này ở mức bình hòa, không có biến động gì nổi bật.",
      luuY: "Giai đoạn tình cảm có thể gặp một vài thử thách, cần dành thời gian vun đắp và thấu hiểu nhau nhiều hơn.",
      thap: "Giai đoạn tình cảm có thể gặp thử thách, nên dành nhiều thời gian vun đắp, lắng nghe và thấu hiểu đối phương hơn.",
    },
    tai_van: {
      cao: "Xu hướng tài vận giai đoạn này khá thuận lợi, là thời điểm tốt để tính toán các kế hoạch tài chính.",
      kha: "Xu hướng tài vận giai đoạn này thuận lợi, thu nhập có cơ hội cải thiện.",
      trung: "Xu hướng tài vận giai đoạn này ở mức bình hòa, không có biến động gì nổi bật.",
      luuY: "Giai đoạn nên thận trọng hơn trong đầu tư và chi tiêu lớn, cân nhắc kỹ trước khi quyết định.",
      thap: "Giai đoạn nên thận trọng trong đầu tư và chi tiêu lớn, ưu tiên giữ an toàn tài chính hơn là mạo hiểm.",
    },
    quan_van: {
      cao: "Xu hướng công việc giai đoạn này khá thuận lợi cho thăng tiến và mở rộng cơ hội.",
      kha: "Xu hướng công việc giai đoạn này thuận lợi, thích hợp để chủ động hơn trong công việc.",
      trung: "Xu hướng công việc giai đoạn này ở mức bình hòa, không có biến động gì nổi bật.",
      luuY: "Giai đoạn công việc có thể nhiều áp lực và cạnh tranh hơn, nên giữ tốt các mối quan hệ và tránh quyết định mạo hiểm.",
      thap: "Giai đoạn công việc có thể nhiều áp lực và cạnh tranh, nên giữ tốt các mối quan hệ, tránh mạo hiểm và giữ vững tâm lý.",
    },
  };
  return MAU[linhVuc][thapHoacCaoDep];
}

export interface KetQuaHauKiem {
  vanBan: string;
  biChan: boolean;
  tuBiChan: string[];
}

/**
 * Lưới an toàn tầng 2 — SPEC.md §4 "Hậu kiểm (code, sau khi AI trả)". Gọi hàm này SAU MỌI lượt AI trả
 * lời luận, không có ngoại lệ. Nếu dính từ cấm → thay bằng câu mẫu an toàn tương ứng mức điểm (không
 * cố "sửa câu AI" bằng code, vì không đoán được ý AI định nói gì — an toàn hơn là thay nguyên câu).
 */
export function hauKiemLoiLuan(vanBan: string, linhVuc: LinhVucKey, diem: number): KetQuaHauKiem {
  const tuBiChan = timTuCam(vanBan);
  if (tuBiChan.length === 0) return { vanBan, biChan: false, tuBiChan: [] };
  return { vanBan: mauCauAnToan(linhVuc, diem), biChan: true, tuBiChan };
}
