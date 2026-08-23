import type { APIRoute } from "astro";
import { eq, inArray } from "drizzle-orm";
import { db } from "../../../lib/db/client";
import { pushSubscriptions } from "../../../../db/schema";
import { cannhacHomNay, ngayVietNam, noiDungThongBao, type KieuNhac } from "../../../lib/thong-bao/ngay-le-am-lich";
import { chuThePush, docKhoaVapid, guiTinHieuDay } from "../../../lib/thong-bao/web-push";
import { docBien } from "../../../lib/thong-bao/env";

export const prerender = false;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/**
 * Việc chạy định giờ: gửi lời nhắc mùng Một / ngày Rằm cho mọi máy đã bật thông báo.
 *
 * BẢO VỆ bằng CRON_SECRET — endpoint này gửi thông báo hàng loạt, để lộ là bị người ngoài spam
 * toàn bộ khách hàng. Trên Render đặt Cron Job gọi vào đây kèm header Authorization.
 *
 * LỊCH CHẠY (máy chủ Render chạy giờ UTC, phải quy đổi):
 *   - kiểu "bao-truoc"   → 11 giờ trưa giờ Việt Nam  = 04:00 UTC  → cron: 0 4 * * *
 *   - kiểu "dung-hom-do" →  6 giờ sáng giờ Việt Nam  = 23:00 UTC hôm trước → cron: 0 23 * * *
 *
 * Cron chạy MỖI NGÀY, còn việc "hôm nay có phải dịp cần nhắc không" do hàm cannhacHomNay() quyết —
 * không ngày lễ thì thoát sớm, không gửi gì.
 */
export const POST: APIRoute = async ({ request, url }) => {
  const secret = docBien("CRON_SECRET");
  if (!secret) {
    return json({ ok: false, error: "Chưa cấu hình CRON_SECRET trên máy chủ." }, 500);
  }
  const dua = request.headers.get("authorization") ?? "";
  if (dua !== `Bearer ${secret}`) {
    return json({ ok: false, error: "Không có quyền." }, 401);
  }

  const keys = docKhoaVapid();
  if (!keys) return json({ ok: false, error: "Chưa cấu hình khóa VAPID." }, 500);

  const kieu = (docBien("KIEU_NHAC_NGAY_LE") as KieuNhac) || "bao-truoc";
  const le = cannhacHomNay(ngayVietNam(), kieu);

  // `?buoc=1` để chạy thử: gửi thật kể cả hôm nay không phải ngày lễ.
  const chayThu = url.searchParams.get("buoc") === "1";
  if (!le && !chayThu) {
    return json({ ok: true, boQua: true, lyDo: "Hôm nay không phải dịp cần nhắc." }, 200);
  }

  const danhSach = await db
    .select({ id: pushSubscriptions.id, endpoint: pushSubscriptions.endpoint })
    .from(pushSubscriptions);

  let daGui = 0;
  let hetHan = 0;
  let loi = 0;
  const canXoa: string[] = [];

  // Gửi theo từng lô để không mở quá nhiều kết nối cùng lúc.
  const KICH_THUOC_LO = 50;
  for (let i = 0; i < danhSach.length; i += KICH_THUOC_LO) {
    const lo = danhSach.slice(i, i + KICH_THUOC_LO);
    const ketQua = await Promise.all(lo.map((s) => guiTinHieuDay(s.endpoint, keys, chuThePush())));
    ketQua.forEach((kq, j) => {
      if (kq === "da-gui") daGui++;
      else if (kq === "het-han") {
        hetHan++;
        canXoa.push(lo[j].id);
      } else loi++;
    });
  }

  // Máy đã gỡ đăng ký thì xóa hẳn, khỏi gửi mãi vào chỗ chết.
  if (canXoa.length > 0) {
    await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.id, canXoa));
  }

  return json(
    {
      ok: true,
      kieu,
      dip: le ? noiDungThongBao(le) : "(chạy thử, không phải ngày lễ)",
      tong: danhSach.length,
      daGui,
      hetHan,
      loi,
    },
    200,
  );
};
