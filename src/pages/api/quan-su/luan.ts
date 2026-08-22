// API Quân Sư Thiên Anh — nhận câu hỏi + input + kết quả gieo quẻ của người dùng → chạy orchestrator
// (gieo quẻ bằng engine có sẵn ở server, KHÔNG để client tự tính) → trả KẾT QUẢ QUÂN SƯ + chi tiết.

import type { APIRoute } from "astro";
import { runQuanSu, type NgaySinhInput } from "../../../lib/quan-su/orchestrator";
import type { CoinLineValue } from "../../../lib/luc-hao";

export const prerender = false;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

const VALID_TOSS = new Set([6, 7, 8, 9]);

export const POST: APIRoute = async ({ request }) => {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Body phải là JSON hợp lệ." }, 400);
  }

  const body = payload as {
    question_id?: unknown;
    tosses?: unknown;
    ngaySinh?: unknown;
    moTa?: unknown;
  };

  if (typeof body.question_id !== "string" || body.question_id.length === 0) {
    return json({ error: "Thiếu question_id." }, 400);
  }

  // tosses (tùy chọn) — nếu có phải đúng 6 giá trị 6/7/8/9.
  let tosses: CoinLineValue[] | undefined;
  if (body.tosses !== undefined) {
    if (!Array.isArray(body.tosses) || body.tosses.length !== 6 || !body.tosses.every((v) => VALID_TOSS.has(v))) {
      return json({ error: "tosses phải là 6 giá trị trong {6,7,8,9}." }, 400);
    }
    tosses = body.tosses as CoinLineValue[];
  }

  // ngaySinh (tùy chọn) — nếu có phải đủ ngày/tháng/năm/giới tính.
  let ngaySinh: NgaySinhInput | undefined;
  if (body.ngaySinh !== undefined && body.ngaySinh !== null) {
    const ns = body.ngaySinh as Partial<NgaySinhInput>;
    if (
      typeof ns.day !== "number" || typeof ns.month !== "number" || typeof ns.year !== "number" ||
      (ns.gender !== "Nam" && ns.gender !== "Nữ")
    ) {
      return json({ error: "ngaySinh cần { day, month, year, gender: 'Nam'|'Nữ', hour? }." }, 400);
    }
    ngaySinh = { day: ns.day, month: ns.month, year: ns.year, gender: ns.gender, hour: typeof ns.hour === "number" ? ns.hour : undefined };
  }

  try {
    const result = runQuanSu({
      question_id: body.question_id,
      tosses,
      ngaySinh,
      moTa: typeof body.moTa === "string" ? body.moTa : undefined,
    });
    return json(result, 200);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi không xác định.";
    // Câu chọn ngày giờ / câu không tồn tại → 400 (lỗi đầu vào), còn lại 500.
    const status = /không tìm thấy|chọn ngày giờ/i.test(msg) ? 400 : 500;
    return json({ error: msg }, status);
  }
};
