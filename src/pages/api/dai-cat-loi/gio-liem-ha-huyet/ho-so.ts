import type { APIRoute } from "astro";
import type { Data } from "@thien-anh/calendar-core";
import type { TrungTang } from "@thien-anh/rule-engine";
import { taoHoSoTangLe, type DauVaoHoSo } from "../../../../lib/dai-cat-loi/tao-ho-so-tang-le";

type Chi = Data.Chi;

export const prerender = false;

/**
 * Xuất HỒ SƠ PDF (đặc tả Phase 2 mục 9).
 *
 * ⚠️ Endpoint TỰ TÍNH LẠI từ dữ liệu đầu vào, KHÔNG nhận kết quả do trình duyệt gửi lên. Nếu tin
 * kết quả phía client thì bất kỳ ai cũng sửa được nội dung hồ sơ mang tên Phong Thủy Thiên Anh.
 *
 * Việc dựng hồ sơ nằm ở `lib/dai-cat-loi/tao-ho-so-tang-le.ts` để dùng chung với email gửi sau
 * thanh toán — hai đường phải cho ra đúng một bản.
 */

const CHI_HOP_LE = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const GIOI_TINH_HOP_LE = ["nam", "nu"];

function loi(msg: string, status: number): Response {
  return new Response(JSON.stringify({ ok: false, error: msg }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return loi("Dữ liệu gửi lên không hợp lệ.", 400);

  const b = body as Record<string, unknown>;
  const gioiTinh = b.gioiTinh;
  const chiGioMat = b.chiGioMat;
  const namMat = Number(b.namMat);
  const thangMat = Number(b.thangMat);
  const ngayMat = Number(b.ngayMat);

  if (typeof gioiTinh !== "string" || !GIOI_TINH_HOP_LE.includes(gioiTinh)) return loi("gioiTinh không hợp lệ.", 400);
  if (typeof chiGioMat !== "string" || !CHI_HOP_LE.includes(chiGioMat)) return loi("Giờ mất không hợp lệ.", 400);

  const doSoToa = b.doSoToa === undefined || b.doSoToa === "" ? undefined : Number(b.doSoToa);
  if (doSoToa !== undefined && !Number.isFinite(doSoToa)) return loi("Tọa độ huyệt mộ không hợp lệ.", 400);

  const dauVao: DauVaoHoSo = {
    gioiTinh: gioiTinh as DauVaoHoSo["gioiTinh"],
    namSinhDuongLich: Number(b.namSinhDuongLich),
    namMat,
    thangMat,
    ngayMat,
    chiGioMat: chiGioMat as Chi,
    ...(b.soNgayDuKienToiChon ? { soNgayDuKienToiChon: Number(b.soNgayDuKienToiChon) } : {}),
    ...(b.thoiGianDiChuyenPhut ? { thoiGianDiChuyenPhut: Number(b.thoiGianDiChuyenPhut) } : {}),
    ...(b.thanQuyen && typeof b.thanQuyen === "object" ? { thanQuyen: b.thanQuyen as DauVaoHoSo["thanQuyen"] } : {}),
    ...(typeof b.hoTenNguoiMat === "string" ? { hoTenNguoiMat: b.hoTenNguoiMat } : {}),
    ...(b.nguyenNhanMat === "tai-nan-dot-ngot"
      ? { nguyenNhanMat: "tai-nan-dot-ngot" as TrungTang.NguyenNhanMat }
      : {}),
    ...(doSoToa !== undefined ? { doSoToa } : {}),
  };

  try {
    const kq = await taoHoSoTangLe(dauVao);
    if (!kq.taoDuoc) return loi(kq.lyDo, 409);

    return new Response(Buffer.from(kq.pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ho-so-tang-le-${namMat}${String(thangMat).padStart(2, "0")}${String(ngayMat).padStart(2, "0")}.pdf"`,
      },
    });
  } catch (err) {
    return loi(err instanceof Error ? err.message : "Không xuất được hồ sơ.", 400);
  }
};
