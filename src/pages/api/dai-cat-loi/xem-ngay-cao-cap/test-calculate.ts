import type { APIRoute } from "astro";
import { calculateXemNgayCaoCap, type XemNgayCaoCapInput } from "@thien-anh/trachnhat-engine";

export const prerender = false;

/**
 * ⚠️ TẠM THỜI — endpoint test nội bộ, KHÔNG thu phí, KHÔNG tạo đơn hàng (yêu cầu Công: cho chạy
 * bình thường, bỏ qua thu phí để test trước). Khi bật thu phí thật, làm giống module giờ liệm:
 * thêm `checkout.ts` (tạo đơn + QR SePay) + `result.ts` (đọc kết quả sau khi thanh toán), rồi
 * xóa file này.
 */

const SON_HOP_LE = [
  "Tý", "Quý", "Sửu", "Cấn", "Dần", "Giáp", "Mão", "Ất", "Thìn", "Tốn", "Tỵ", "Bính",
  "Ngọ", "Đinh", "Mùi", "Khôn", "Thân", "Canh", "Dậu", "Tân", "Tuất", "Càn", "Hợi", "Nhâm",
];
const LOAI_VIEC_HOP_LE = ["dong_tho", "nhap_trach"];

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Dữ liệu gửi lên không hợp lệ." }, 400);
  }

  const b = body as Record<string, unknown>;
  const loaiViec = b.loaiViec;
  const toaNha = b.toaNha;
  const huongNha = typeof b.huongNha === "string" && b.huongNha ? b.huongNha : undefined;
  const namSinhGiaChuChinh = Number(b.namSinhGiaChuChinh);
  const namSinhVoChong = b.namSinhVoChong ? Number(b.namSinhVoChong) : undefined;
  const toaDoSo = b.toaDoSo !== undefined && b.toaDoSo !== "" ? Number(b.toaDoSo) : undefined;

  if (typeof loaiViec !== "string" || !LOAI_VIEC_HOP_LE.includes(loaiViec)) {
    return jsonResponse({ ok: false, error: "Loại việc không hợp lệ." }, 400);
  }
  if (typeof toaNha !== "string" || !SON_HOP_LE.includes(toaNha)) {
    return jsonResponse({ ok: false, error: "Tọa nhà không hợp lệ." }, 400);
  }
  if (huongNha !== undefined && !SON_HOP_LE.includes(huongNha)) {
    return jsonResponse({ ok: false, error: "Hướng nhà không hợp lệ." }, 400);
  }
  if (!Number.isInteger(namSinhGiaChuChinh) || namSinhGiaChuChinh < 1900 || namSinhGiaChuChinh > 2100) {
    return jsonResponse({ ok: false, error: "Năm sinh gia chủ không hợp lệ (1900-2100)." }, 400);
  }
  if (namSinhVoChong !== undefined && (!Number.isInteger(namSinhVoChong) || namSinhVoChong < 1900 || namSinhVoChong > 2100)) {
    return jsonResponse({ ok: false, error: "Năm sinh vợ/chồng không hợp lệ (1900-2100)." }, 400);
  }
  if (toaDoSo !== undefined && (!Number.isFinite(toaDoSo) || toaDoSo < 0 || toaDoSo >= 360)) {
    return jsonResponse({ ok: false, error: "Độ số la bàn phải trong khoảng 0-359.99." }, 400);
  }

  // Quẻ tọa (HKNH/Quái Vận) — tùy chọn; thiếu thì engine tự trả `thieu_du_lieu` ở Bước 5.
  const toaHknhRaw = b.toaHknh;
  const toaQuaiVanRaw = b.toaQuaiVan;
  const coToaQue = toaHknhRaw !== undefined && toaHknhRaw !== "" && toaQuaiVanRaw !== undefined && toaQuaiVanRaw !== "";
  let toaQue: { hknh: number; quaiVan: number } | undefined;
  if (coToaQue) {
    const hknh = Number(toaHknhRaw);
    const quaiVan = Number(toaQuaiVanRaw);
    // HKNH chỉ có 1-4,6-9 (không có 5 — số 5 = Thổ chỉ tồn tại ở Quái Vận). Quái Vận có đủ 1-9.
    if (!Number.isInteger(hknh) || hknh < 1 || hknh > 9 || hknh === 5) {
      return jsonResponse({ ok: false, error: "HKNH của quẻ tọa phải là 1,2,3,4,6,7,8 hoặc 9 (không có số 5)." }, 400);
    }
    if (!Number.isInteger(quaiVan) || quaiVan < 1 || quaiVan > 9) {
      return jsonResponse({ ok: false, error: "Quái Vận của quẻ tọa phải từ 1 đến 9." }, 400);
    }
    toaQue = { hknh, quaiVan };
  }

  const ngay = b.ngayGiamDinh as Record<string, unknown> | undefined;
  const nam = Number(ngay?.nam);
  const thang = Number(ngay?.thang);
  const ngayTrongThang = Number(ngay?.ngay);
  if (!Number.isInteger(nam) || !Number.isInteger(thang) || !Number.isInteger(ngayTrongThang)) {
    return jsonResponse({ ok: false, error: "Vui lòng chọn đầy đủ ngày cần giám định." }, 400);
  }

  const input: XemNgayCaoCapInput = {
    loaiViec: loaiViec as XemNgayCaoCapInput["loaiViec"],
    toaNha: toaNha as XemNgayCaoCapInput["toaNha"],
    ...(toaDoSo !== undefined ? { toaDoSo } : {}),
    ...(toaQue ? { toaQue } : {}),
    ...(huongNha ? { huongNha: huongNha as XemNgayCaoCapInput["toaNha"] } : {}),
    namSinhGiaChuChinh,
    ...(namSinhVoChong !== undefined ? { namSinhVoChong } : {}),
    ngayGiamDinh: { nam, thang, ngay: ngayTrongThang },
  };

  try {
    const result = calculateXemNgayCaoCap(input);
    return jsonResponse({ ok: true, result }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
