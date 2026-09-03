// Bản ĐỘC LẬP cho app Quân Sư — xem ghi chú đầu file `checkout.ts` cùng thư mục.
import type { APIRoute } from "astro";
import { apDungPhase2, calculateGioLiemHaHuyet, type GioLiemHaHuyetInput } from "@thien-anh/trachnhat-engine";
import type { TrungTang } from "@thien-anh/rule-engine";
import { Astronomy, type Data } from "@thien-anh/calendar-core";
import { checkRateLimit } from "../../../../../lib/rate-limit";

type Chi = Data.Chi;

export const prerender = false;

/**
 * ⚠️ TẠM THỜI — endpoint test nội bộ, KHÔNG thu phí, KHÔNG tạo đơn hàng, KHÔNG lưu DB. Dùng để
 * kiểm thử trực tiếp trên hệ thống trong lúc module còn đang gỡ khỏi menu công khai (yêu cầu
 * Công 2026-08-14: "đóng lại chạy trên hệ thống để test đã, bỏ thu phí test cho dễ test"). XÓA
 * file này khi module quay lại thu phí — không được để lẫn với `checkout.ts` (bản thật, có tạo
 * đơn + QR SePay).
 */

const CHI_HOP_LE = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const GIOI_TINH_HOP_LE = ["nam", "nu"];

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function parseChiOptional(value: unknown): Chi | undefined {
  if (typeof value !== "string" || value === "") return undefined;
  if (!CHI_HOP_LE.includes(value)) throw new Error("Giá trị Chi không hợp lệ.");
  return value as Chi;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Endpoint tính nặng (đang là đường tính thật lúc TEST_MODE): 15 lần / phút / IP.
  const limited = checkRateLimit({ request, clientAddress }, { key: "testcalc-gio-liem-qs", max: 15, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Dữ liệu gửi lên không hợp lệ." }, 400);
  }

  const b = body as Record<string, unknown>;
  const gioiTinh = b.gioiTinh;
  const namSinhDuongLich = Number(b.namSinhDuongLich);
  const namMat = Number(b.namMat);
  const thangMat = Number(b.thangMat);
  const ngayMat = Number(b.ngayMat);
  const chiGioMat = b.chiGioMat;

  if (typeof gioiTinh !== "string" || !GIOI_TINH_HOP_LE.includes(gioiTinh)) {
    return jsonResponse({ ok: false, error: "gioiTinh không hợp lệ." }, 400);
  }
  if (typeof chiGioMat !== "string" || !CHI_HOP_LE.includes(chiGioMat)) {
    return jsonResponse({ ok: false, error: "Giờ mất không hợp lệ." }, 400);
  }

  const jdnMat = Astronomy.julianDayNumber(namMat, thangMat, ngayMat);
  const homNay = new Date();
  const jdnHomNay = Astronomy.julianDayNumber(homNay.getFullYear(), homNay.getMonth() + 1, homNay.getDate());
  if (Number.isFinite(jdnMat) && jdnMat > jdnHomNay) {
    return jsonResponse({ ok: false, error: "Ngày giờ mất không được ở tương lai." }, 400);
  }

  let thanQuyen: GioLiemHaHuyetInput["thanQuyen"];
  try {
    const tq = (b.thanQuyen ?? {}) as Record<string, unknown>;
    const chiTruongNam = parseChiOptional(tq.chiTruongNam);
    const chiConDauLon = parseChiOptional(tq.chiConDauLon);
    const chiChauDichTon = parseChiOptional(tq.chiChauDichTon);
    const chiAnhTraiLon = parseChiOptional(tq.chiAnhTraiLon);
    if (chiTruongNam || chiConDauLon || chiChauDichTon || chiAnhTraiLon) {
      thanQuyen = {
        ...(chiTruongNam ? { chiTruongNam } : {}),
        ...(chiConDauLon ? { chiConDauLon } : {}),
        ...(chiChauDichTon ? { chiChauDichTon } : {}),
        ...(chiAnhTraiLon ? { chiAnhTraiLon } : {}),
      };
    }
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Dữ liệu thân quyến không hợp lệ." }, 400);
  }

  const input: GioLiemHaHuyetInput = {
    gioiTinh: gioiTinh as GioLiemHaHuyetInput["gioiTinh"],
    namSinhDuongLich,
    namMat,
    thangMat,
    ngayMat,
    chiGioMat: chiGioMat as GioLiemHaHuyetInput["chiGioMat"],
    ...(b.soNgayDuKienToiChon ? { soNgayDuKienToiChon: Number(b.soNgayDuKienToiChon) } : {}),
    ...(thanQuyen ? { thanQuyen } : {}),
    // Quãng đường nhà → huyệt, dùng cho bước 6b (giờ động quan). Engine tự validate 5-480 phút.
    ...(b.thoiGianDiChuyenPhut ? { thoiGianDiChuyenPhut: Number(b.thoiGianDiChuyenPhut) } : {}),
  };

  try {
    const result = calculateGioLiemHaHuyet(input);

    // --- PHASE 2 (gói đầy đủ) — chỉ chạy khi gia đình ĐÃ CÓ huyệt mộ và nhập được tọa độ ---
    const doSoToa = b.doSoToa === undefined || b.doSoToa === "" ? undefined : Number(b.doSoToa);
    if (doSoToa === undefined) return jsonResponse({ ok: true, result }, 200);
    if (!Number.isFinite(doSoToa)) {
      return jsonResponse({ ok: false, error: "Tọa độ huyệt mộ không hợp lệ (cần số đo 0-360°)." }, 400);
    }

    const nguyenNhanMat: TrungTang.NguyenNhanMat =
      b.nguyenNhanMat === "tai-nan-dot-ngot" ? "tai-nan-dot-ngot" : "benh-tuoi-gia";

    const phase2 = apDungPhase2({
      doSoToa,
      // Lọc trên RỔ RỘNG, không lọc trên top 3 — xem ghi chú `tatCaNgayGioHaHuyet` ở engine: lọc
      // trên top 3 thì Tam Sát/Bát Sát quét sạch, trả về rỗng.
      phuongAnPhase1: result.tatCaNgayGioHaHuyet ?? [],
      namMat,
      thangMat,
      ngayMat,
      nguyenNhanMat,
      namSinhDuongLich,
      ...(b.soNgayDuKienToiChon ? { soNgayDuKienToiChon: Number(b.soNgayDuKienToiChon) } : {}),
    });

    // Cắt `diemNoiBo` trước khi trả về trình duyệt. Đặc tả mục 6 cấm hiện điểm thô cho khách
    // "dưới mọi hình thức" — giao diện không vẽ ra là chưa đủ, mở devtools vẫn đọc được JSON.
    // Điểm chỉ dùng để xếp hạng nội bộ, thứ hạng đã nằm sẵn ở `thuHang`.
    const phase2SachDiem =
      phase2.ketCuc === "A" || phase2.ketCuc === "B"
        ? { ...phase2, phuongAn: phase2.phuongAn.map(({ diemNoiBo: _bo, ...pa }) => pa) }
        : phase2;

    return jsonResponse({ ok: true, result, phase2: phase2SachDiem }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
