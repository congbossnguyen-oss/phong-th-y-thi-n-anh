import type { APIRoute } from "astro";
import { apDungPhase2, calculateGioLiemHaHuyet, type GioLiemHaHuyetInput } from "@thien-anh/trachnhat-engine";
import { getLunarDate, type Data } from "@thien-anh/calendar-core";
import type { TrungTang } from "@thien-anh/rule-engine";
import { generateHoSoTangLePdf } from "../../../../lib/dai-cat-loi/ho-so-tang-le-pdf";

type Chi = Data.Chi;

export const prerender = false;

/**
 * Xuất HỒ SƠ PDF (đặc tả Phase 2 mục 9).
 *
 * ⚠️ Endpoint TỰ TÍNH LẠI từ dữ liệu đầu vào, KHÔNG nhận kết quả do trình duyệt gửi lên. Nếu tin
 * kết quả phía client thì bất kỳ ai cũng sửa được nội dung hồ sơ mang tên Phong Thủy Thiên Anh.
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

  const input: GioLiemHaHuyetInput = {
    gioiTinh: gioiTinh as GioLiemHaHuyetInput["gioiTinh"],
    namSinhDuongLich: Number(b.namSinhDuongLich),
    namMat,
    thangMat,
    ngayMat,
    chiGioMat: chiGioMat as Chi,
    ...(b.soNgayDuKienToiChon ? { soNgayDuKienToiChon: Number(b.soNgayDuKienToiChon) } : {}),
    ...(b.thoiGianDiChuyenPhut ? { thoiGianDiChuyenPhut: Number(b.thoiGianDiChuyenPhut) } : {}),
    ...(b.thanQuyen && typeof b.thanQuyen === "object" ? { thanQuyen: b.thanQuyen as GioLiemHaHuyetInput["thanQuyen"] } : {}),
  };

  try {
    const ketQua = calculateGioLiemHaHuyet(input);

    const doSoToa = b.doSoToa === undefined || b.doSoToa === "" ? undefined : Number(b.doSoToa);
    let phase2;
    if (doSoToa !== undefined && Number.isFinite(doSoToa)) {
      phase2 = apDungPhase2({
        doSoToa,
        phuongAnPhase1: ketQua.tatCaNgayGioHaHuyet ?? [],
        namMat,
        thangMat,
        ngayMat,
        nguyenNhanMat: (b.nguyenNhanMat === "tai-nan-dot-ngot" ? "tai-nan-dot-ngot" : "benh-tuoi-gia") as TrungTang.NguyenNhanMat,
        ...(b.soNgayDuKienToiChon ? { soNgayDuKienToiChon: Number(b.soNgayDuKienToiChon) } : {}),
      });
      // Kết cục C thì không có hồ sơ để xuất — và cũng chưa thu phí, nên chặn luôn ở đây.
      if (phase2.ketCuc === "C") return loi(phase2.thongDiep, 409);
    }

    // Âm lịch của từng phương án hạ huyệt — đặc tả mục 9 yêu cầu ghi cả dương lẫn âm lịch.
    const amLichHaHuyet: Record<string, string> = {};
    for (const h of ketQua.ngayGioHaHuyet ?? []) {
      const d = h.ngayDuongLich;
      const am = getLunarDate({ year: d.nam, month: d.thang, day: d.ngay, hour: 12 });
      amLichHaHuyet[`${String(d.ngay).padStart(2, "0")}/${String(d.thang).padStart(2, "0")}/${d.nam}|${h.chiGio}`] =
        `${am.day}/${am.month}${am.isLeapMonth ? " nhuận" : ""}`;
    }

    const pdf = await generateHoSoTangLePdf({
      ...(typeof b.hoTenNguoiMat === "string" ? { hoTenNguoiMat: b.hoTenNguoiMat } : {}),
      gioiTinh: gioiTinh as "nam" | "nu",
      namSinhDuongLich: Number(b.namSinhDuongLich),
      ngayMat: { ngay: ngayMat, thang: thangMat, nam: namMat },
      chiGioMat,
      ketQua,
      ...(phase2 ? { phase2 } : {}),
      amLichHaHuyet,
    });

    return new Response(Buffer.from(pdf), {
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
