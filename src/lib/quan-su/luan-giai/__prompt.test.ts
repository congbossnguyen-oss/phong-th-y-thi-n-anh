// Kiểm tra phần DỰNG PROMPT (không gọi mạng). Quan trọng nhất là xác nhận tri thức được nhúng
// thật vào bundle qua `?raw` — nếu hỏng thì model mất sạch phương pháp luận mà vẫn trả lời trôi
// chảy, tức là hỏng âm thầm, không có lỗi nào để nhìn thấy.
import { describe, it, expect } from "vitest";
import { TRI_THUC_LOI } from "./kien-thuc";
import { systemPromptQuyTac, systemPromptTriThuc, userPrompt } from "./prompt";
import { buildInterpretationPayload, castLucHaoFromTosses, castInputNow } from "../divination";
import { getQuestion } from "../index";
import type { CoinLineValue } from "../../luc-hao";

const TOSSES: CoinLineValue[] = [7, 8, 9, 7, 6, 8];

function payloadMau(questionId: string) {
  const q = getQuestion(questionId)!;
  const cast = castLucHaoFromTosses(TOSSES, castInputNow());
  return buildInterpretationPayload(q, cast, { method: "luc-hao-tosses" });
}

describe("dựng prompt luận giải", () => {
  it("tri thức lõi được nhúng đủ, không rỗng", () => {
    // Đủ dung lượng nghĩa là các file .md đã vào bundle thật chứ không phải chuỗi rỗng.
    expect(TRI_THUC_LOI.length).toBeGreaterThan(20000);
    // Mỗi khối tri thức phải có mặt.
    expect(TRI_THUC_LOI).toContain("Dụng thần");
    expect(TRI_THUC_LOI).toContain("Thủ tượng");
    expect(TRI_THUC_LOI).toContain("Không Vong");
    expect(TRI_THUC_LOI).toContain("THỦ TƯỢNG BÁT QUÁI");
    expect(TRI_THUC_LOI).toContain("THỦ TƯỢNG ĐỊA CHI");
    expect(TRI_THUC_LOI).toContain("PHƯƠNG PHÁP HÓA GIẢI");
  });

  it("đã bỏ frontmatter YAML của SKILL.md", () => {
    // Frontmatter chứa mô tả kích hoạt skill — vô nghĩa với model và tốn token.
    expect(systemPromptTriThuc()).not.toContain("name: hoa-giai-kinh-dich");
  });

  it("quy tắc xưng hô đổi theo giới tính", () => {
    expect(systemPromptQuyTac("Nam")).toContain('Gọi người hỏi là "anh"');
    expect(systemPromptQuyTac("Nữ")).toContain('Gọi người hỏi là "chị"');
    expect(systemPromptQuyTac()).toContain('Gọi người hỏi là "anh/chị"');
  });

  it("mọi quy tắc đều cấm dùng 'bạn' và cấm viết tắt", () => {
    const qt = systemPromptQuyTac("Nam");
    expect(qt).toContain('không dùng "bạn"');
    expect(qt).toContain("KHÔNG viết tắt");
  });

  it("câu nhạy cảm CAO thì thêm cảnh báo bắt buộc", () => {
    const cao = systemPromptQuyTac("Nam", "cao");
    expect(cao).toContain("không thay thế bác sĩ hoặc luật sư");
    expect(cao).toContain("KHÔNG chẩn đoán bệnh");
    // Câu thường thì không được nhét cảnh báo y tế vào cho loãng.
    expect(systemPromptQuyTac("Nam", "thuong")).not.toContain("KHÔNG chẩn đoán bệnh");
  });

  it("ranh giới chống bịa số liệu luôn có mặt", () => {
    const qt = systemPromptQuyTac("Nam");
    expect(qt).toContain("Không tự tính");
    expect(qt).toContain("im lặng bỏ qua phần đó");
  });

  it("user prompt chứa dữ liệu quẻ thật và câu hỏi", () => {
    const p = payloadMau("vay-tien");
    const up = userPrompt(p, "Tôi đang tính vay ngân hàng để mở quán.");
    expect(up).toContain("Có nên vay khoản này không?");
    expect(up).toContain("Tôi đang tính vay ngân hàng để mở quán.");
    expect(up).toContain("DỮ LIỆU QUẺ");
    // Tên quẻ thật phải nằm trong JSON gửi đi.
    expect(up).toContain(p.cast.chinh.name);
  });

  it("không có mô tả thì prompt vẫn hợp lệ, không lòi chữ undefined", () => {
    const up = userPrompt(payloadMau("chuyen-viec"));
    expect(up).not.toContain("undefined");
    expect(up).not.toContain("HOÀN CẢNH NGƯỜI HỎI TỰ KỂ");
  });
});

// Khoá riêng lỗi đã gặp: Git trên Windows đổi LF sang CRLF khi checkout, làm biểu thức cắt
// frontmatter không khớp và toàn bộ khối YAML lọt vào prompt.
describe("chịu được kiểu xuống dòng Windows", () => {
  it("cắt được frontmatter dù file dùng CRLF", async () => {
    const { TRI_THUC_LOI } = await import("./kien-thuc");
    expect(TRI_THUC_LOI).not.toContain("name: hoa-giai-kinh-dich");
    expect(TRI_THUC_LOI).not.toContain("\r\n");
  });
});
