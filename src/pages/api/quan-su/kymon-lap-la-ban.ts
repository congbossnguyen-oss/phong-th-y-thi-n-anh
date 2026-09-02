// API con riêng cho app Quân Sư — phục vụ component LapKyMon.astro (tách khỏi web 1/9/2026, xem
// project_quan_su_tach_doc_lap_khoi_web.md). Bản độc lập của /api/kymon-lap-la-ban.
import type { APIRoute } from "astro";
import { lapLaBan } from "../../../lib/kymon";
import { quetTamThang } from "../../../lib/kymon/tamThang";
import { luanGiaiMenh } from "../../../lib/kymon/luanGiaiMenh";
import type { LapLaBanResult } from "../../../lib/kymon";

// Chế độ Mệnh: kèm luận giải đời thường (SPEC_luan_giai_menh.md) — tính 1 lần ở server, client
// chỉ hiện, không tự suy diễn thêm.
function ketQua(laBan: LapLaBanResult, cheDo: string) {
  return {
    laBan,
    tamThang: quetTamThang(laBan),
    luanGiai: cheDo === "menh" ? luanGiaiMenh(laBan) : null,
  };
}

export const prerender = false;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Nạp km_data.json (~7MB) ở phía server (module Node, tái dùng giữa các request) — client chỉ
// nhận về đúng 1 lá bàn (vài KB JSON), không bao giờ tải cả file dữ liệu gốc.
export const GET: APIRoute = async ({ url }) => {
  const params = url.searchParams;
  const cheDo = params.get("cheDo") ?? "gio";

  try {
    if (cheDo === "1080") {
      const soCucRaw = params.get("soCuc");
      const amDuongRaw = params.get("amDuong");
      const hoaGiap = params.get("hoaGiap");
      if (!soCucRaw || !amDuongRaw || !hoaGiap) {
        return jsonResponse({ error: "Thiếu tham số bắt buộc: soCuc, amDuong, hoaGiap." }, 400);
      }
      const soCuc = Number(soCucRaw);
      if (!Number.isInteger(soCuc) || soCuc < 1 || soCuc > 9) {
        return jsonResponse({ error: "soCuc phải là số nguyên 1-9." }, 400);
      }
      if (amDuongRaw !== "+" && amDuongRaw !== "-") {
        return jsonResponse({ error: 'amDuong phải là "+" hoặc "-".' }, 400);
      }
      const laBan = await lapLaBan({ cheDo: "1080", soCuc, amDuong: amDuongRaw, hoaGiap });
      return jsonResponse(ketQua(laBan, "1080"), 200);
    }

    if (cheDo !== "gio" && cheDo !== "menh") {
      return jsonResponse(
        { error: `Chế độ "${cheDo}" tạm ngưng (Ngày/Tháng/Năm chưa đủ dữ liệu để xác định công thức lập cục).` },
        400,
      );
    }

    const namRaw = params.get("nam");
    const thangRaw = params.get("thang");
    const ngayRaw = params.get("ngay");
    const gioRaw = params.get("gio");
    const phutRaw = params.get("phut");
    if (!namRaw || !thangRaw || !ngayRaw || gioRaw === null || phutRaw === null) {
      return jsonResponse({ error: "Thiếu tham số bắt buộc: nam, thang, ngay, gio, phut." }, 400);
    }
    const nam = Number(namRaw);
    const thang = Number(thangRaw);
    const ngay = Number(ngayRaw);
    const gio = Number(gioRaw);
    const phut = Number(phutRaw);
    if (![nam, thang, ngay, gio, phut].every(Number.isInteger)) {
      return jsonResponse({ error: "nam, thang, ngay, gio, phut phải là số nguyên." }, 400);
    }

    const laBan = await lapLaBan({ cheDo, nam, thang, ngay, gio, phut });
    return jsonResponse(ketQua(laBan, cheDo), 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định.";
    return jsonResponse({ error: message }, 400);
  }
};
