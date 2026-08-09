import type { APIRoute } from "astro";
import { calculate } from "@thien-anh/trachnhat-engine";

export const prerender = false;

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

  // Cả ok:true lẫn ok:false đều là dữ liệu nghiệp vụ hợp lệ (vd. ngày không tồn tại trong
  // lịch) — chỉ dùng 400 cho lỗi HÌNH THỨC request ở trên, không dùng cho lỗi nghiệp vụ.
  return jsonResponse(result, 200);
};
