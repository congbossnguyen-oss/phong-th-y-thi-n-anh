// LH-M02 (Động Mộ, V3-01 13/9/2026) — kiểm chứng cầu nối Engine → Quân Sư → prompt gửi AI:
// (1) quan hệ Động Mộ (source="YAO") đi được từ luc-hao.ts, qua buildInterpretationPayload, tới
//     đúng chuỗi userPrompt() gửi DeepSeek (Audit 9, V2.15/V3-01 — "LH-M02 appears in dữ liệu gửi AI").
// (2) tri thức Động Mộ (methodology definition) có mặt trong systemPromptTriThuc() — tức AI nhận được
//     CẢ fact lẫn định nghĩa methodology cho cùng 1 rule, không phải "raw leakage" (Audit 10 / Section 10 đề bài).

import { describe, expect, it } from "vitest";
import { lucHaoCastManual } from "../src/lib/luc-hao";
import { buildInterpretationPayload } from "../src/lib/quan-su/divination";
import { getQuestion } from "../src/lib/quan-su";
import { userPrompt, systemPromptTriThuc } from "../src/lib/quan-su/luan-giai/prompt";

const NGAY_SUU = { day: 7, month: 8, year: 2026, hour: 8, minute: 0 };

describe("LH-M02 Động Mộ — cầu nối tới Context Builder / prompt AI", () => {
  it("quẻ có Động Mộ thật => userPrompt() (chuỗi gửi DeepSeek) chứa đúng dữ liệu Động Mộ", () => {
    const cast = lucHaoCastManual([1, 1, 1, 1, 1, 1] as any, [6], NGAY_SUU); // hào 6 động => hào 4 Động Mộ (relatedYao=6)
    const question = getQuestion("xin-viec")!;
    const payload = buildInterpretationPayload(question, cast, { method: "luc-hao-tosses" });

    const prompt = userPrompt(payload);

    // "Data leakage thô" đã xác nhận từ trước (JSON.stringify nguyên khối payload.cast) — verify vẫn đúng.
    expect(prompt).toContain('"source": "YAO"');
    expect(prompt).toContain('"relatedYao": 6');
  });

  it("systemPromptTriThuc() có định nghĩa methodology cho Động Mộ (KHÔNG còn là raw fact vô nghĩa)", () => {
    const tri_thuc = systemPromptTriThuc();
    expect(tri_thuc).toContain("Động Mộ");
    // phải phân biệt rõ với 3 dạng kia, không gộp mập mờ.
    expect(tri_thuc).toContain("Nhật Mộ");
    expect(tri_thuc).toContain("Hóa Mộ");
    // và phải nói rõ Nguyệt Mộ KHÔNG phải Tam Mộ — điều kiện bắt buộc từ V2.11 Human Decision.
    expect(tri_thuc).toMatch(/Nguyệt Mộ KHÔNG thuộc "Tam Mộ"/);
  });

  it("Nguyệt Mộ KHÔNG bị đổi thành 'Tam Mộ' hay nâng cấp ngang hàng Động Mộ trong tri thức gửi AI", () => {
    const tri_thuc = systemPromptTriThuc();
    // Không có câu khẳng định trực tiếp kiểu "Nguyệt Mộ là Tam Mộ" / "Nguyệt Mộ thuộc Tam Mộ"
    // (phân biệt với câu ĐÚNG đã assert ở test trên: "Nguyệt Mộ KHÔNG thuộc 'Tam Mộ' cổ điển").
    expect(tri_thuc).not.toContain("Nguyệt Mộ là Tam Mộ");
    expect(tri_thuc).not.toContain("Nguyệt Mộ thuộc Tam Mộ");
    expect(tri_thuc).not.toContain("Nguyệt Mộ là 1 trong Tam Mộ");
    expect(tri_thuc).not.toContain("Nguyệt Mộ là một trong Tam Mộ");
  });
});
