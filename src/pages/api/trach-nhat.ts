import type { APIRoute } from "astro";
import {
  calculate,
  danhGiaTrucTheoMucDich,
  MUC_DICH_LABEL,
  type TrucMucDichKey,
} from "@thien-anh/trachnhat-engine";

export const prerender = false;

// Danh sách mục đích công việc chuẩn hoá — dùng để chấm mức độ Trực cho MỌI mục đích trong 1 lần
// gọi, trang chỉ việc lọc theo mục đích khách chọn (không phải gọi lại máy chủ mỗi lần đổi).
const MUC_DICH_KEYS = Object.keys(MUC_DICH_LABEL) as TrucMucDichKey[];

const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ url }) => {
  const params = url.searchParams;
  const yearRaw = params.get("year");
  const monthRaw = params.get("month");
  const dayRaw = params.get("day");
  const timeZone = params.get("timeZone") ?? DEFAULT_TIME_ZONE;

  if (yearRaw === null || monthRaw === null || dayRaw === null) {
    return jsonResponse(
      { error: "Thiếu tham số bắt buộc: year, month, day." },
      400,
    );
  }

  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return jsonResponse(
      { error: "year, month, day phải là số nguyên." },
      400,
    );
  }

  const result = calculate({ solarDate: { year, month, day }, timeZone });

  // Bổ sung mức độ hợp/kỵ của Trực theo từng mục đích công việc (bảng 12 Trực). Tính sẵn cho cả
  // 11 mục đích để trang lọc tại chỗ khi khách đổi mục đích, không phải gọi lại API.
  if (result.ok && result.data) {
    const trucMucDich = MUC_DICH_KEYS.map((k) => danhGiaTrucTheoMucDich(result.data.truc.name, k)).filter(
      (x): x is NonNullable<typeof x> => Boolean(x),
    );
    return jsonResponse({ ...result, data: { ...result.data, trucMucDich } }, 200);
  }

  // Cả ok:true lẫn ok:false đều là dữ liệu nghiệp vụ hợp lệ (vd. ngày không tồn tại trong
  // lịch) — chỉ dùng 400 cho lỗi HÌNH THỨC request ở trên, không dùng cho lỗi nghiệp vụ.
  return jsonResponse(result, 200);
};
