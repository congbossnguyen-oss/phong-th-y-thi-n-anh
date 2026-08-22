// Kiểm tra tính toàn vẹn của Thư Viện Câu Hỏi Quân Sư Thiên Anh (seed data thuần).
// Không kiểm nội dung luận giải — chỉ đảm bảo dữ liệu hợp lệ, nhất quán, không trùng/lệch.

import { describe, expect, it } from "vitest";
import { categories, getAllCategories } from "../src/lib/quan-su/categories";
import { questions } from "../src/lib/quan-su/questions";
import {
  getAllQuestions,
  getCategoriesWithCounts,
  getQuestion,
  getQuestionsByCategory,
  TOTAL_QUESTION_COUNT,
} from "../src/lib/quan-su";
import type { CategoryId } from "../src/lib/quan-su/types";

const CATEGORY_IDS = new Set(categories.map((c) => c.id));
const ENGINES = new Set(["bat-tu", "tu-vi", "trach-nhat"]);
const DIVINATION = new Set(["luc-hao", "trach-nhat"]);
const OUTPUT = new Set(["luan-giai", "chon-thoi-diem", "so-sanh-phuong-an"]);
const PRICING = new Set(["co-ban", "nang-cao", "cao-cap"]);
const SAFETY = new Set(["thuong", "nhay-cam", "cao"]);

describe("Question Library — cấu trúc nhóm", () => {
  it("có đúng 15 nhóm, id không trùng, order không trùng", () => {
    expect(categories).toHaveLength(15);
    const ids = categories.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    const orders = categories.map((c) => c.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("getAllCategories trả về theo thứ tự order tăng dần", () => {
    const orders = getAllCategories().map((c) => c.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it("2 nhóm nhạy cảm (sức khỏe, kiện tụng) phải có cảnh báo", () => {
    expect(getAllCategories().find((c) => c.id === "suc-khoe")?.notice).toBeTruthy();
    expect(getAllCategories().find((c) => c.id === "kien-tung-tranh-chap")?.notice).toBeTruthy();
  });
});

describe("Question Library — câu hỏi", () => {
  it("question_id không trùng nhau", () => {
    const ids = questions.map((q) => q.question_id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("mọi câu hỏi trỏ về 1 category tồn tại", () => {
    for (const q of questions) {
      expect(CATEGORY_IDS.has(q.category), `category lạ ở ${q.question_id}: ${q.category}`).toBe(true);
    }
  });

  it("mọi nhóm đều có ít nhất 1 câu hỏi (không có nhóm rỗng)", () => {
    for (const c of categories) {
      expect(getQuestionsByCategory(c.id).length, `nhóm rỗng: ${c.id}`).toBeGreaterThan(0);
    }
  });

  it("mọi enum (engine/divination/output/pricing/safety) đều hợp lệ", () => {
    for (const q of questions) {
      for (const e of q.recommended_engines) {
        expect(ENGINES.has(e), `engine lạ ở ${q.question_id}: ${e}`).toBe(true);
      }
      expect(DIVINATION.has(q.divination_method)).toBe(true);
      expect(OUTPUT.has(q.output_type)).toBe(true);
      expect(PRICING.has(q.pricing_tier)).toBe(true);
      expect(SAFETY.has(q.safety_level)).toBe(true);
    }
  });

  it("mọi câu hỏi có title, subtitle không rỗng", () => {
    for (const q of questions) {
      expect(q.title.trim().length, q.question_id).toBeGreaterThan(0);
      expect(q.subtitle.trim().length, q.question_id).toBeGreaterThan(0);
    }
  });

  it("required_inputs không rỗng và mọi input required=true; key không trùng trong 1 câu", () => {
    for (const q of questions) {
      expect(q.required_inputs.length, q.question_id).toBeGreaterThan(0);
      for (const inp of q.required_inputs) expect(inp.required, `${q.question_id}/${inp.key}`).toBe(true);
      for (const inp of q.optional_inputs) expect(inp.required, `${q.question_id}/${inp.key}`).toBe(false);
      const keys = [...q.required_inputs, ...q.optional_inputs].map((i) => i.key);
      expect(new Set(keys).size, `input key trùng ở ${q.question_id}`).toBe(keys.length);
    }
  });
});

describe("Question Library — quy tắc routing engine (khớp kiến trúc Phase 1)", () => {
  it("Kinh Dịch KHÔNG bao giờ nằm trong recommended_engines (nó là divination_method, luôn chạy)", () => {
    for (const q of questions) {
      expect((q.recommended_engines as string[]).includes("kinh-dich"), q.question_id).toBe(false);
    }
  });

  it("KHÔNG dùng Kỳ Môn / Phong Thủy nhà ở (ngoài phạm vi app)", () => {
    for (const q of questions) {
      for (const e of q.recommended_engines as string[]) {
        expect(["ky-mon", "phong-thuy"].includes(e), q.question_id).toBe(false);
      }
    }
  });

  it("câu chọn ngày giờ: divination='trach-nhat', output='chon-thoi-diem', engine=['trach-nhat'], không gieo quẻ", () => {
    for (const q of getQuestionsByCategory("chon-ngay-gio")) {
      expect(q.divination_method).toBe("trach-nhat");
      expect(q.output_type).toBe("chon-thoi-diem");
      expect(q.recommended_engines).toEqual(["trach-nhat"]);
      expect(q.required_inputs.some((i) => i.type === "gieo-que")).toBe(false);
    }
  });

  it("câu Kinh Dịch (luc-hao) phải có bước gieo quẻ trong required_inputs", () => {
    for (const q of questions) {
      if (q.divination_method === "luc-hao") {
        expect(q.required_inputs.some((i) => i.type === "gieo-que"), q.question_id).toBe(true);
      }
    }
  });

  it("câu dùng Bát Tự/Tử Vi (sơ đồ vận trình) phải yêu cầu ngày sinh", () => {
    for (const q of questions) {
      const canVanTrinh = q.recommended_engines.includes("bat-tu") || q.recommended_engines.includes("tu-vi");
      if (canVanTrinh) {
        expect(q.required_inputs.some((i) => i.key === "ngay_sinh"), q.question_id).toBe(true);
      }
    }
  });

  it("nhóm 'quyết định' dùng output so-sanh-phuong-an và có ô nhập danh sách phương án", () => {
    for (const q of getQuestionsByCategory("quyet-dinh")) {
      expect(q.output_type).toBe("so-sanh-phuong-an");
      expect(q.required_inputs.some((i) => i.type === "phuong-an-list"), q.question_id).toBe(true);
    }
  });

  it("nhóm Nhà cửa: luận qua Kinh Dịch (luc-hao + luan-giai), KHÔNG dùng phong-thuy engine", () => {
    const nhaCua = getQuestionsByCategory("nha-cua");
    expect(nhaCua.length).toBe(7);
    for (const q of nhaCua) {
      expect(q.divination_method).toBe("luc-hao");
      expect(q.output_type).toBe("luan-giai");
      expect(q.required_inputs.some((i) => i.type === "gieo-que"), q.question_id).toBe(true);
      for (const e of q.recommended_engines as string[]) {
        expect(["ky-mon", "phong-thuy"].includes(e), q.question_id).toBe(false);
      }
    }
  });

  it("nhóm nhạy cảm gán đúng safety_level (sức khỏe/kiện tụng='cao', tài chính/đầu tư>='nhay-cam')", () => {
    for (const q of getQuestionsByCategory("suc-khoe")) expect(q.safety_level).toBe("cao");
    for (const q of getQuestionsByCategory("kien-tung-tranh-chap")) expect(q.safety_level).toBe("cao");
    for (const q of getQuestionsByCategory("tai-chinh")) expect(q.safety_level).not.toBe("thuong");
    for (const q of getQuestionsByCategory("dau-tu")) expect(q.safety_level).not.toBe("thuong");
  });
});

describe("Question Library — hàm truy vấn", () => {
  it("getQuestion tra được theo id, trả undefined nếu không có", () => {
    expect(getQuestion("chuyen-viec")?.category).toBe("su-nghiep");
    expect(getQuestion("khong-ton-tai")).toBeUndefined();
  });

  it("TOTAL_QUESTION_COUNT khớp số câu thật và tổng các nhóm", () => {
    expect(TOTAL_QUESTION_COUNT).toBe(getAllQuestions().length);
    const sum = getCategoriesWithCounts().reduce((s, c) => s + c.questionCount, 0);
    expect(sum).toBe(TOTAL_QUESTION_COUNT);
  });
});

// Đảm bảo import CategoryId được dùng (tránh cảnh báo unused ở strict mode).
const _typecheck: CategoryId = "su-nghiep";
void _typecheck;
