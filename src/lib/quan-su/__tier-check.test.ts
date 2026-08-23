// Kiểm tra BẤT BIẾN của việc phân tầng gói trong Thư Viện Câu Hỏi. Chạy tự động để tránh việc
// thêm câu hỏi mới mà quên gắn đúng tầng — sai tầng nghĩa là khách trả tiền sai gói.
import { describe, it, expect } from "vitest";
import { questions } from "./questions";

describe("phân tầng thư viện câu hỏi", () => {
  it("không có question_id trùng nhau", () => {
    const ids = questions.map((q) => q.question_id);
    const trung = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(trung).toEqual([]);
  });

  it("mọi câu so sánh phương án đều thuộc gói Cao cấp", () => {
    const sai = questions.filter((q) => q.output_type === "so-sanh-phuong-an" && q.pricing_tier !== "cao-cap");
    expect(sai.map((q) => q.question_id)).toEqual([]);
  });

  it("mọi câu chọn ngày giờ đều thuộc gói Cơ bản", () => {
    const sai = questions.filter((q) => q.output_type === "chon-thoi-diem" && q.pricing_tier !== "co-ban");
    expect(sai.map((q) => q.question_id)).toEqual([]);
  });

  it("cả hai gói đều có đủ câu hỏi để bán được", () => {
    const coBan = questions.filter((q) => q.pricing_tier === "co-ban");
    const caoCap = questions.filter((q) => q.pricing_tier === "cao-cap");
    // Cao cấp phải có lượng câu riêng đáng kể, nếu không hai gói gần như giống nhau và khách
    // không có lý do trả thêm tiền.
    expect(coBan.length).toBeGreaterThanOrEqual(50);
    expect(caoCap.length).toBeGreaterThanOrEqual(40);
  });

  it("mức nhạy cảm KHÔNG quyết định tầng gói (rủi ro do safety_level lo riêng)", () => {
    // Phải còn tồn tại câu nhạy cảm/cao ở gói Cơ bản — nếu không nghĩa là ai đó đã lại đẩy câu
    // rủi ro lên Cao cấp, làm lẫn hai khái niệm khác nhau.
    const nhayCamCoBan = questions.filter((q) => q.pricing_tier === "co-ban" && q.safety_level !== "thuong");
    expect(nhayCamCoBan.length).toBeGreaterThan(0);
  });
});
