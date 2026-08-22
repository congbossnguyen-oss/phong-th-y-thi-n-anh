// QUÂN SƯ THIÊN ANH — Bản DEMO của Interpretation Engine (tạm thời).
//
// ⚠️ ĐÂY KHÔNG PHẢI luận giải thật. Luận giải thật cần LLM + bộ quy tắc Kinh Dịch của Thầy
// (KINH_DICH_INTERPRETATION_TEMPLATE.md Phần A-E, đặc biệt Phần E — quẻ mẫu). Khi có, thay hàm này
// bằng `interpretation-engine.ts` gọi LLM (tái dùng hạ tầng chart-profile). Xem INTERPRETATION_ENGINE.md.
//
// Bản demo này CHỈ đóng gói lại các DỮ KIỆN đã tính (quẻ + vận trình) thành bố cục Mở bài/Thân bài/
// Kết luận để khung chạy đầu-cuối và bấm thử được — KHÔNG đưa ra phán đoán cát hung thật, KHÔNG cam kết.

import type { QuanSuInterpretationPayload } from "./divination";

export interface OutputSchema {
  mo_bai: string;
  than_bai: string;
  ket_luan: {
    cau_tra_loi: string;
    khuyen_nghi_hanh_dong: string;
    thoi_diem_de_xuat: string | null;
    luu_y: string[];
  };
}

const SAFETY_LUU_Y: Record<string, string[]> = {
  cao: [
    "Đây là góc nhìn tham khảo, KHÔNG thay thế ý kiến chuyên gia.",
  ],
  "nhay-cam": [
    "Đây là góc nhìn tham khảo, không phải lời khuyên tài chính/pháp lý chính thức.",
  ],
  thuong: [],
};

// Cảnh báo bắt buộc theo nhóm nhạy cảm (khớp categories.ts notice + safety_rules).
const SAFETY_BY_CATEGORY: Record<string, string> = {
  "suc-khoe": "Vấn đề sức khỏe nghiêm trọng xin gặp bác sĩ — nội dung này không thay thế chẩn đoán y khoa.",
  "kien-tung-tranh-chap": "Với việc kiện tụng, xin tham vấn luật sư/chuyên gia pháp lý.",
};

function moTaDanhGia(d: "tot" | "binh_thuong" | "xau"): string {
  return d === "tot" ? "đang khá thuận" : d === "xau" ? "còn nhiều trắc trở" : "ở mức tạm ổn";
}

/**
 * Sinh "KẾT QUẢ QUÂN SƯ" bản DEMO từ payload. Deterministic, không gọi AI, không phán đoán thật.
 */
export function interpretDemo(payload: QuanSuInterpretationPayload): OutputSchema {
  const { question, cast, van_trinh } = payload;
  const chinh = cast.chinh.name;
  const bien = cast.bien ? cast.bien.name : null;
  const soDong = cast.dongPositions.length;
  const theHao = cast.chinh.hao.find((h) => h.theUng === "Thế");

  // Mở bài — nêu câu hỏi + quẻ gieo được + vận thế chung.
  const vanChung = van_trinh ? ` Về thời vận, giai đoạn này của bạn ${moTaDanhGia(van_trinh.daiVanHienTai.danhGia)}.` : "";
  const mo_bai =
    `Bạn đang hỏi: "${question.title}". ` +
    `Quẻ gieo được là ${chinh}${bien ? `, có ${soDong} hào động, biến sang ${bien}` : `, không có hào động`}.` +
    vanChung;

  // Thân bài — nêu các dữ kiện chính (Dụng Thần gợi ý, Thế hào), KÈM ghi chú đây là bản demo.
  const dungThanMoTa =
    question.dung_than_hint.kind === "luc-than"
      ? `Với loại việc này, hào cần xem chính là ${question.dung_than_hint.value} (Dụng Thần).`
      : question.dung_than_hint.kind === "the-hao"
        ? `Với loại việc này, chủ yếu xem Hào Thế (chính bạn).`
        : `Loại việc này cần đọc theo khung riêng — ${question.dung_than_hint.note ?? ""}`;
  const theMoTa = theHao ? ` Trong quẻ, Hào Thế nằm ở hào ${theHao.hao} (${theHao.lucThan}, ${theHao.lucThu}).` : "";
  const vanTrinhMoTa = van_trinh
    ? ` ${van_trinh.tomTat.join(" ")}`
    : "";
  const than_bai =
    `${dungThanMoTa}${theMoTa}${vanTrinhMoTa}\n\n` +
    `— (Đây là bản demo của khung: hệ thống mới đang hiển thị các dữ kiện đã tính. ` +
    `Phần luận giải chi tiết theo đúng phép Kinh Dịch sẽ do Quân Sư đảm nhận khi hoàn thiện.)`;

  // Kết luận — trung tính, KHÔNG phán đoán thật; kèm cảnh báo an toàn theo nhóm.
  const luu_y: string[] = [...(SAFETY_LUU_Y[question.safety_level] ?? [])];
  if (SAFETY_BY_CATEGORY[question.category]) luu_y.unshift(SAFETY_BY_CATEGORY[question.category]);
  if (van_trinh?.coNhap) luu_y.push("Chỉ số vận trình đang ở bản thử nghiệm, mang tính tham khảo.");

  const ket_luan = {
    cau_tra_loi: "Khung đã dựng xong và chạy thông suốt. Kết luận chính thức sẽ hiện khi phần luận giải Quân Sư được kích hoạt.",
    khuyen_nghi_hanh_dong: "Giữ tâm bình tĩnh, cân nhắc kỹ; đây mới là bản chạy thử của quy trình.",
    thoi_diem_de_xuat: null,
    luu_y,
  };

  return { mo_bai, than_bai, ket_luan };
}
