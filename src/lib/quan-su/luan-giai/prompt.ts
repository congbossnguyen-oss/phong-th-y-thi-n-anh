/**
 * Dựng system prompt + user prompt cho Interpretation Engine.
 *
 * RANH GIỚI CỨNG (mục 22 tài liệu PHASE): model CHỈ được diễn giải dữ liệu quẻ do Casting Engine
 * đưa sang. Không được tự tính Can Chi, Lục Thân, Không Vong, hồi đầu sinh khắc, hay bất cứ số
 * liệu huyền học nào. Thiếu dữ liệu thì im lặng ở phần đó, không được suy đoán bù.
 */
import type { QuanSuInterpretationPayload } from "../divination";
import { quyTacGiongVan } from "../giong-van";
import { TRI_THUC_LOI } from "./kien-thuc";

/**
 * Phần tri thức — GIỐNG NHAU ở mọi lượt gọi nên tách riêng để bật prompt caching (xem llm.ts).
 * Đặt tri thức trước, quy tắc sau, để quy tắc là thứ model đọc gần chỗ làm việc nhất.
 */
export function systemPromptTriThuc(): string {
  return [
    "Bạn là bộ máy luận giải Kinh Dịch (Lục Hào) của Quân Sư Thiên Anh.",
    "Dưới đây là toàn bộ phương pháp luận bắt buộc phải theo. Luận đúng quy trình, không tự chế phương pháp khác.",
    "",
    TRI_THUC_LOI,
  ].join("\n");
}

/** Phần quy tắc riêng theo từng lượt (giọng văn đổi theo giới tính người hỏi). */
export function systemPromptQuyTac(gioiTinh?: "Nam" | "Nữ", mucNhayCam?: "thuong" | "nhay-cam" | "cao"): string {
  const canhBao: string[] = [];
  if (mucNhayCam === "cao") {
    canhBao.push(
      "- Câu hỏi này thuộc nhóm NHẠY CẢM CAO (sức khỏe hoặc pháp lý). Bắt buộc nói rõ đây là góc nhìn tham khảo theo phương pháp huyền học, không thay thế bác sĩ hoặc luật sư.",
      "- Tuyệt đối KHÔNG chẩn đoán bệnh, KHÔNG phán về sinh tử, KHÔNG khuyên bỏ điều trị, KHÔNG khẳng định chắc chắn kết quả pháp lý.",
    );
  } else if (mucNhayCam === "nhay-cam") {
    canhBao.push("- Câu hỏi liên quan tiền bạc. Không cam kết lợi nhuận, không thay thế tư vấn tài chính chuyên môn.");
  }

  return [
    "RANH GIỚI TUYỆT ĐỐI VỀ DỮ LIỆU:",
    "- Chỉ dùng đúng số liệu quẻ trong phần DỮ LIỆU QUẺ được cung cấp. Không tự tính, không tự suy đoán bất kỳ Can Chi, Lục Thân, Lục Thần, Không Vong, Nguyệt Phá, Phục Thần, hay quan hệ sinh khắc nào không có sẵn ở đó.",
    "- Nếu một thông tin không có trong dữ liệu, im lặng bỏ qua phần đó. Không được bịa ra cho đủ bài.",
    "- Không nhắc tới tên trường dữ liệu hay thuật ngữ kỹ thuật của hệ thống trong câu trả lời cho người hỏi.",
    "",
    quyTacGiongVan(gioiTinh),
    ...(canhBao.length > 0 ? ["", "AN TOÀN:", ...canhBao] : []),
    "",
    "CÁCH VIẾT TỪNG PHẦN:",
    "- phan_tich: 3 ý, mỗi ý một câu gọn, bám đúng Bước 2 của quy trình (vượng suy, Không Vong, hào động, Thế/Ứng...). Nói bằng lời thường, người không biết Kinh Dịch vẫn hiểu.",
    "- nguyen_nhan_cot_loi: một câu, rút ra từ Bước 3 (thủ tượng) — chỉ ra việc đời thực đang vướng ở đâu, không nói chung chung.",
    "- ket_luan: chọn đúng một trong bốn giá trị cho phép.",
    "- diem_can_luu_y: 3 ý, mỗi ý một việc cụ thể cần để tâm.",
    "- quan_su_khuyen: 2 đến 4 hành động làm được ngay, không phải lời khuyên đạo lý chung.",
    "- phuong_phap_hoa_giai: CHỈ điền khi quẻ thật sự báo hung. Quẻ tốt thì để mảng rỗng, tuyệt đối không bịa vấn đề ra để hóa giải. Viết ở mức GỢI Ý HƯỚNG chung (vd hướng xử lý, thái độ nên có, việc nên tránh), KHÔNG khẳng định chắc chắn hiệu quả và KHÔNG kê đơn vật phẩm/nghi thức cụ thể (an vị, khai quang...) — phần đó cần thầy trực tiếp xem mới đúng, giao diện đã tự thêm dòng khuyến nghị liên hệ chuyên sâu, không cần model nhắc lại.",
    "- thoi_diem_khuyen_nghi: nếu quẻ có chỉ dấu thời điểm thì nói rõ, không có thì để chuỗi rỗng.",
  ].join("\n");
}

/** Gói dữ liệu quẻ thành phần người dùng. Giữ nguyên JSON để model không hiểu sai. */
export function userPrompt(payload: QuanSuInterpretationPayload, moTa?: string): string {
  const q = payload.question;
  const phan: string[] = [
    `CÂU HỎI CỦA NGƯỜI HỎI: ${q.title}`,
    `Nhóm việc: ${q.category}`,
    `Gợi ý Dụng Thần theo nhóm việc (do hệ thống tra sẵn, vẫn phải tự kiểm lại theo Bước 1): ${JSON.stringify(q.dung_than_hint)}`,
  ];

  if (q.doi_tuong_hoi && q.doi_tuong_hoi !== "chinh-toi") {
    const XUNG_HO: Record<string, string> = {
      "cha-me": "cha/mẹ của người hỏi",
      con: "con của người hỏi",
      vo: "vợ của người hỏi",
      chong: "chồng của người hỏi",
      "anh-chi-em": "anh/chị/em hoặc bạn của người hỏi",
      "nguoi-khac": "một người khác mà người hỏi quan tâm (không phải chính người hỏi)",
    };
    phan.push(
      `NGƯỜI ĐƯỢC HỎI: Đây là quẻ hỏi CHO ${XUNG_HO[q.doi_tuong_hoi] ?? "người khác"}, KHÔNG PHẢI hỏi cho chính người hỏi. Dụng Thần ở trên đã đổi đúng theo người này — khi viết bài luận, xưng hô đúng đối tượng (vd "cha/mẹ anh/chị", "cháu"...), không mặc định nói về bản thân người hỏi.`,
    );
  }

  if (moTa && moTa.trim()) {
    phan.push("", `HOÀN CẢNH NGƯỜI HỎI TỰ KỂ:\n${moTa.trim()}`);
  }

  phan.push(
    "",
    "DỮ LIỆU QUẺ (do engine lập quẻ tính, là nguồn sự thật duy nhất):",
    JSON.stringify(payload.cast, null, 1),
  );

  if (payload.van_trinh) {
    phan.push(
      "",
      "VẬN TRÌNH HIỆN TẠI (Bát Tự, chỉ để tham khảo bối cảnh — KHÔNG dùng thay quẻ để kết luận):",
      JSON.stringify(
        {
          dai_van: payload.van_trinh.daiVanHienTai,
          luu_nien: payload.van_trinh.luuNienHienTai,
          tom_tat: payload.van_trinh.tomTat,
        },
        null,
        1,
      ),
    );
  }

  if (payload.tien_thoai_than.co) {
    phan.push(
      "",
      "TIẾN THẦN / THOÁI THẦN (engine tính sẵn — đà của việc là lên hay xuống):",
      JSON.stringify(payload.tien_thoai_than, null, 1),
    );
  }

  if (payload.tam_hop_cuc.co) {
    phan.push(
      "",
      "TAM HỢP CỤC (engine tính sẵn — các hào tham gia ĐỔI HẲN sang ngũ hành của cục):",
      JSON.stringify(payload.tam_hop_cuc, null, 1),
      "Cục hình thành là tốt hay xấu tùy hành của cục sinh/khắc gì với Dụng Thần — tự luận, KHÔNG mặc định cục là điềm lành.",
    );
  }

  if (payload.ung_ky) {
    phan.push(
      "",
      "ỨNG KỲ — MỐC THỜI GIAN (engine tính sẵn theo 8 quy luật, ĐÃ xếp theo độ ưu tiên):",
      JSON.stringify(payload.ung_ky, null, 1),
      "Cách dùng phần này khi viết `thoi_diem_khuyen_nghi`:",
      `- Ưu tiên các mốc uuTien nhỏ nhất. Đọc theo đơn vị "${payload.ung_ky.donViGoiY}" như trường donViGoiY đã ghi.`,
      "- Nói theo lời thường: 'vào những ngày Tý', 'khoảng tháng Thân' — KHÔNG đọc tên trường dữ liệu, không nói 'ưu tiên 1'.",
      "- Mốc nào có canAudit=true thì nói dè dặt hơn ('có thể', 'thường rơi vào'), không khẳng định chắc.",
      "- Mọi câu trong `ghiChu` là ràng buộc bắt buộc — nhất là các dòng CẢNH BÁO, phải phản ánh vào bài, không được lược bỏ.",
      "- TUYỆT ĐỐI không tự nghĩ ra mốc thời gian nào khác ngoài danh sách trên.",
    );
  } else {
    phan.push(
      "",
      "ỨNG KỲ: hệ thống KHÔNG tính được mốc sẵn cho nhóm việc này (Dụng Thần không đơn nhất).",
      "→ Nếu quẻ có chỉ dấu thời điểm thì tự luận theo tài liệu; nếu không rõ thì để `thoi_diem_khuyen_nghi` rỗng. Không được bịa mốc.",
    );
  }

  phan.push("", `Thời điểm lập quẻ: ${payload.meta.castAtISO}. Cách lập quẻ: ${payload.meta.method}.`);
  phan.push("", "Hãy luận theo đúng quy trình và trả kết quả qua công cụ đã cho.");
  return phan.join("\n");
}
