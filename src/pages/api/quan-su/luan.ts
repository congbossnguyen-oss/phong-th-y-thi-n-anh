// API Quân Sư Thiên Anh — nhận câu hỏi + input + kết quả gieo quẻ của người dùng → chạy orchestrator
// (gieo quẻ bằng engine có sẵn ở server, KHÔNG để client tự tính) → trả KẾT QUẢ QUÂN SƯ + chi tiết.

import type { APIRoute } from "astro";
import { runQuanSu, type CastingMethod, type NgaySinhInput } from "../../../lib/quan-su/orchestrator";
import type { DoiTuongHoi } from "../../../lib/quan-su/divination";
import { getQuestion } from "../../../lib/quan-su";
import { coQuyenTruyCap, hangYeuCauTheoCauHoi, layGoiDangHoatDong } from "../../../lib/subscriptions/access";
import { conLuotHoiKhong, ghiNhanLuotHoi, tongLuotDaDung } from "../../../lib/subscriptions/usage";
import { duocKhuyenMai, TONG_LUOT_MIEN_PHI_KHUYEN_MAI } from "../../../lib/quan-su/khuyen-mai-luan-giai";
import { checkRateLimit } from "../../../lib/rate-limit";
import type { CoinLineValue } from "../../../lib/luc-hao";

export const prerender = false;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

const VALID_TOSS = new Set([6, 7, 8, 9]);
const VALID_CASTING_METHODS = new Set<CastingMethod>(["gieo-tay", "mai-hoa", "seri-tien"]);
const VALID_DOI_TUONG = new Set<DoiTuongHoi>(["chinh-toi", "cha-me", "con", "vo", "chong", "anh-chi-em", "nguoi-khac"]);

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  // Chống spam dồn dập (script/click liên tục) — TÁCH RIÊNG khỏi hạn mức lượt/tháng bên dưới, đây
  // chỉ chặn tốc độ, không phải hạn mức thật.
  const limited = checkRateLimit({ request, clientAddress }, { key: "quan-su-luan", max: 10, windowMs: 60_000 });
  if (limited) return limited;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Body phải là JSON hợp lệ." }, 400);
  }

  const body = payload as {
    question_id?: unknown;
    castingMethod?: unknown;
    tosses?: unknown;
    seriTien?: unknown;
    moTa?: unknown;
    doiTuong?: unknown;
  };

  if (typeof body.question_id !== "string" || body.question_id.length === 0) {
    return json({ error: "Thiếu question_id." }, 400);
  }

  // Luận quẻ là sản phẩm chính trả phí — bắt buộc đăng nhập + có gói đủ hạng theo pricing_tier của
  // câu hỏi (Thầy, 2026-08-23). Không chặn ở lớp UI vì client có thể gọi thẳng API này.
  const question = getQuestion(body.question_id);
  if (!question) {
    return json({ error: "Không tìm thấy câu hỏi." }, 400);
  }
  if (!locals.user) {
    return json({ error: "Vui lòng đăng nhập để xem luận giải." }, 401);
  }
  // KHUYẾN MÃI 20 tài khoản đăng ký sớm nhất (31/8/2026, xem khuyen-mai-luan-giai.ts) — được luận
  // giải MIỄN PHÍ (không cần gói thuê bao) trong hạn mức TỔNG riêng, tách biệt hoàn toàn khỏi hạn
  // mức/tháng của gói trả tiền/dùng thử thật.
  const coKhuyenMai = await duocKhuyenMai(locals.user.id);
  const hangYeuCau = hangYeuCauTheoCauHoi(question.pricing_tier);
  if (!coKhuyenMai && !(await coQuyenTruyCap(locals.user.id, hangYeuCau, locals.user.isAdmin))) {
    const tenHang = hangYeuCau === "cao_cap" ? "Cao cấp" : "Cơ bản";
    return json({ error: `Câu hỏi này cần gói ${tenHang} đang hoạt động. Hãy đăng ký gói chính thức.` }, 403);
  }

  if (coKhuyenMai) {
    const daDung = await tongLuotDaDung(locals.user.id);
    if (daDung >= TONG_LUOT_MIEN_PHI_KHUYEN_MAI) {
      return json(
        { error: `Bạn đã dùng hết ${TONG_LUOT_MIEN_PHI_KHUYEN_MAI} lượt luận giải miễn phí (đã dùng ${daDung}/${TONG_LUOT_MIEN_PHI_KHUYEN_MAI}). Vui lòng đăng ký gói chính thức để tiếp tục.` },
        429,
      );
    }
  } else if (locals.user.isAdmin !== true) {
    // DÙNG THỬ KHÔNG ĐƯỢC HỎI QUÂN SƯ (anh Công quyết định 27/8/2026, xem dung-thu.ts) — chặn ở đây
    // là lớp phòng thủ thứ 2 (endpoint tạo trial đã ngưng cấp mới), phòng trường hợp còn bản ghi
    // subscriptions isTrial=true cũ từ lúc trial còn hoạt động (test nội bộ trước 27/8/2026).
    const goi = await layGoiDangHoatDong(locals.user.id);
    if (goi?.isTrial) {
      return json({ error: "Bản dùng thử không bao gồm tính năng hỏi Quân Sư (dùng AI thật) — vui lòng đăng ký gói chính thức." }, 403);
    }

    // Hạn mức lượt hỏi/tháng — admin bỏ qua. Đọc GÓI THẬT của tài khoản (không phải hangYeuCau của
    // câu hỏi) vì hạn mức tính theo gói đang có, không theo câu hỏi đang hỏi.
    if (goi) {
      const { conLuot, daDung, hanMuc } = await conLuotHoiKhong(locals.user.id, goi.tier, false);
      if (!conLuot) {
        return json(
          { error: `Bạn đã dùng hết ${hanMuc} lượt hỏi của gói tháng này (đã dùng ${daDung}/${hanMuc}). Hạn mức làm mới vào đầu tháng sau, hoặc nâng lên gói Cao cấp để có thêm lượt.` },
          429,
        );
      }
    }
  }

  // castingMethod (tùy chọn) — mặc định "gieo-tay" ở orchestrator nếu bỏ trống.
  let castingMethod: CastingMethod | undefined;
  if (body.castingMethod !== undefined) {
    if (typeof body.castingMethod !== "string" || !VALID_CASTING_METHODS.has(body.castingMethod as CastingMethod)) {
      return json({ error: "castingMethod phải là một trong: gieo-tay, mai-hoa, seri-tien." }, 400);
    }
    castingMethod = body.castingMethod as CastingMethod;
  }

  // tosses (tùy chọn) — nếu có phải đúng 6 giá trị 6/7/8/9.
  let tosses: CoinLineValue[] | undefined;
  if (body.tosses !== undefined) {
    if (!Array.isArray(body.tosses) || body.tosses.length !== 6 || !body.tosses.every((v) => VALID_TOSS.has(v))) {
      return json({ error: "tosses phải là 6 giá trị trong {6,7,8,9}." }, 400);
    }
    tosses = body.tosses as CoinLineValue[];
  }

  // seriTien (tùy chọn) — chỉ cần khi castingMethod="seri-tien"; orchestrator tự kiểm tra bắt buộc.
  let seriTien: string | undefined;
  if (body.seriTien !== undefined) {
    if (typeof body.seriTien !== "string") return json({ error: "seriTien phải là chuỗi." }, 400);
    seriTien = body.seriTien;
  }

  // doiTuong (tùy chọn) — hỏi việc cho ai; mặc định "chinh-toi" ở orchestrator nếu bỏ trống.
  let doiTuong: DoiTuongHoi | undefined;
  if (body.doiTuong !== undefined) {
    if (typeof body.doiTuong !== "string" || !VALID_DOI_TUONG.has(body.doiTuong as DoiTuongHoi)) {
      return json({ error: "doiTuong không hợp lệ." }, 400);
    }
    doiTuong = body.doiTuong as DoiTuongHoi;
  }

  // Ngày sinh KHÔNG còn thu qua form câu hỏi — tự lấy từ hồ sơ tài khoản đã đăng nhập (khai báo lúc
  // đăng ký hoặc bổ sung ở /hoc-vien/ho-so). Thầy, 2026-08-23: "khai báo lúc đăng ký, lúc đó mới
  // chạy" — tài khoản chưa khai thì vẫn luận được bình thường, chỉ không có lớp vận trình.
  const hs = locals.user.hoSoSinh;
  const ngaySinh: NgaySinhInput | undefined = hs
    ? { day: hs.day, month: hs.month, year: hs.year, gender: hs.gender, hour: hs.hour ?? undefined }
    : undefined;

  try {
    const result = await runQuanSu({
      question_id: body.question_id,
      castingMethod,
      tosses,
      seriTien,
      ngaySinh,
      moTa: typeof body.moTa === "string" ? body.moTa : undefined,
      doiTuong,
    });
    // Chỉ tính lượt khi luận giải THÀNH CÔNG — khách không nhận được gì thì không bị trừ lượt.
    if (locals.user.isAdmin !== true) await ghiNhanLuotHoi(locals.user.id);

    // Phần "Cách hóa giải" CHỈ mở cho gói Cao cấp đang hoạt động (anh Công quyết định 30/8/2026) —
    // gói Cơ bản vẫn xem đủ phần luận giải + kết quả quân sư, chỉ riêng phương pháp hóa giải cụ thể
    // bị khóa lại kèm gợi ý nâng cấp. Đọc GÓI THẬT của tài khoản (không phải pricing_tier của câu
    // hỏi) — 1 câu hỏi Cơ bản do khách gói Cao cấp hỏi vẫn phải thấy đủ hóa giải.
    let hoaGiaiBiKhoa = false;
    if (locals.user.isAdmin !== true && !coKhuyenMai && result.luanAI && result.luanAI.phuong_phap_hoa_giai.length > 0) {
      const goiThat = await layGoiDangHoatDong(locals.user.id);
      if (goiThat?.tier !== "cao_cap") {
        hoaGiaiBiKhoa = true;
        result.luanAI.phuong_phap_hoa_giai = [];
      }
    }

    return json({ ...result, hoaGiaiBiKhoa }, 200);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi không xác định.";
    // Câu chọn ngày giờ / câu không tồn tại / thiếu seri tiền → 400 (lỗi đầu vào, message tự viết sẵn
    // tiếng Việt, an toàn hiện cho khách), còn lại là lỗi hệ thống bất ngờ (AI, DB...) → 500, KHÔNG
    // lộ message kỹ thuật thô (cùng nguyên tắc đã áp dụng ở dung-thu.ts 27/8/2026).
    const laLoiDauVao = /không tìm thấy|chọn ngày giờ|cần nhập/i.test(msg);
    if (laLoiDauVao) return json({ error: msg }, 400);
    console.error("[quan-su/luan] Lỗi không mong đợi khi luận giải:", err);
    return json({ error: "Rất tiếc, hệ thống đang gặp trục trặc khi luận giải. Bạn thử lại sau ít phút giúp mình nhé." }, 500);
  }
};
