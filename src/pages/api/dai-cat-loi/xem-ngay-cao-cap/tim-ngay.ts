import type { APIRoute } from "astro";
import { timNgayXemNgayCaoCap, timThangTrongNam, type XemNgayCaoCapInput } from "@thien-anh/trachnhat-engine";
import { checkRateLimit } from "../../../../lib/rate-limit";

export const prerender = false;

/**
 * ⚠️ TẠM THỜI — endpoint test nội bộ, KHÔNG thu phí (giống `test-calculate.ts`). Khi bật thu phí
 * thật thì gộp vào luồng checkout + result như module giờ liệm.
 *
 * 2 chế độ:
 *   - `tim_thang`: quét cả năm, trả 12 tháng kèm ngày tốt nhất mỗi tháng ("năm nay tháng nào làm được")
 *   - `tim_ngay`: quét 1 khoảng ngày, trả danh sách ngày đã xếp hạng ("tháng này ngày nào làm được")
 */

const SON_HOP_LE = [
  "Tý", "Quý", "Sửu", "Cấn", "Dần", "Giáp", "Mão", "Ất", "Thìn", "Tốn", "Tỵ", "Bính",
  "Ngọ", "Đinh", "Mùi", "Khôn", "Thân", "Canh", "Dậu", "Tân", "Tuất", "Càn", "Hợi", "Nhâm",
];
const LOAI_VIEC_HOP_LE = ["dong_tho", "nhap_trach"];

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** Bỏ `chiTiet` khỏi payload trả về — nó chứa toàn bộ kết quả giám định của TỪNG ngày, gửi hết sẽ
 * rất nặng. Người dùng bấm vào 1 ngày cụ thể thì gọi lại `test-calculate` cho ngày đó. */
function gonNgay(n: Record<string, unknown>) {
  const { chiTiet: _bo, ...gon } = n as { chiTiet?: unknown } & Record<string, unknown>;
  return gon;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Endpoint quét nặng (cả năm ~365 ngày): 15 lần / phút / IP.
  const limited = checkRateLimit({ request, clientAddress }, { key: "tim-ngay-xncc", max: 15, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return jsonResponse({ ok: false, error: "Dữ liệu gửi lên không hợp lệ." }, 400);
  }

  const b = body as Record<string, unknown>;
  const cheDo = b.cheDo === "tim_thang" ? "tim_thang" : "tim_ngay";
  const loaiViec = b.loaiViec;
  const toaNha = b.toaNha;
  const huongNha = typeof b.huongNha === "string" && b.huongNha ? b.huongNha : undefined;
  const namSinhGiaChuChinh = Number(b.namSinhGiaChuChinh);
  const namSinhVoChong = b.namSinhVoChong ? Number(b.namSinhVoChong) : undefined;
  const toaDoSo = b.toaDoSo !== undefined && b.toaDoSo !== "" ? Number(b.toaDoSo) : undefined;
  const apDungLocDanGian = typeof b.apDungLocDanGian === "boolean" ? b.apDungLocDanGian : undefined;

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

  const chung: Omit<XemNgayCaoCapInput, "ngayGiamDinh"> = {
    loaiViec: loaiViec as XemNgayCaoCapInput["loaiViec"],
    toaNha: toaNha as XemNgayCaoCapInput["toaNha"],
    ...(toaDoSo !== undefined ? { toaDoSo } : {}),
    ...(huongNha ? { huongNha: huongNha as XemNgayCaoCapInput["toaNha"] } : {}),
    namSinhGiaChuChinh,
    ...(namSinhVoChong !== undefined ? { namSinhVoChong } : {}),
    ...(apDungLocDanGian !== undefined ? { apDungLocDanGian } : {}),
  };

  try {
    if (cheDo === "tim_thang") {
      const namDuongLich = Number(b.namDuongLich);
      if (!Number.isInteger(namDuongLich) || namDuongLich < 1968 || namDuongLich > 2068) {
        return jsonResponse({ ok: false, error: "Năm cần tìm phải trong khoảng 1968-2068 (phạm vi bảng Cửu Cung)." }, 400);
      }
      const thang = timThangTrongNam({ ...chung, namDuongLich });
      return jsonResponse(
        {
          ok: true,
          cheDo,
          namDuongLich,
          thang: thang.map((t) => ({ ...t, ngayTotNhat: t.ngayTotNhat ? gonNgay(t.ngayTotNhat as unknown as Record<string, unknown>) : null })),
        },
        200,
      );
    }

    const tu = b.tuNgay as Record<string, unknown> | undefined;
    const den = b.denNgay as Record<string, unknown> | undefined;
    const tuNgay = { nam: Number(tu?.nam), thang: Number(tu?.thang), ngay: Number(tu?.ngay) };
    const denNgay = { nam: Number(den?.nam), thang: Number(den?.thang), ngay: Number(den?.ngay) };
    for (const d of [tuNgay, denNgay]) {
      if (!Number.isInteger(d.nam) || !Number.isInteger(d.thang) || !Number.isInteger(d.ngay)) {
        return jsonResponse({ ok: false, error: "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc." }, 400);
      }
    }

    const kq = timNgayXemNgayCaoCap({ ...chung, tuNgay, denNgay, soKetQua: 10 });
    return jsonResponse(
      {
        ok: true,
        cheDo,
        tongSoNgayQuet: kq.tongSoNgayQuet,
        soNgayDung: kq.soNgayDung,
        lyDoLoaiPhoBien: kq.lyDoLoaiPhoBien,
        ketQua: kq.ketQua.map((n) => gonNgay(n as unknown as Record<string, unknown>)),
      },
      200,
    );
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
