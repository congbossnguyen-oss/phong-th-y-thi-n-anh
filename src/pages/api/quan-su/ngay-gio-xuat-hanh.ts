// Bản ĐỘC LẬP cho app Quân Sư của "Ngày Giờ Xuất Hành Cá Nhân" — xem ghi chú đầu file
// chon-nam-sinh-con.ts (thư mục api/quan-su/). Module miễn phí, không toolSlug/thanh toán.
import type { APIRoute } from "astro";
import { checkRateLimit } from "../../../lib/rate-limit";
import {
  calculateXuatHanhCaNhanRange,
  calculateXuatHanhCaNhanMotNgay,
  type XuatHanhCaNhanPurpose,
  type HuongXuatHanh,
  type XuatHanhCaNhanGioiTinh,
} from "@thien-anh/trachnhat-engine";

export const prerender = false;

const PURPOSE_HOP_LE: readonly XuatHanhCaNhanPurpose[] = [
  "XUAT_HANH_CHUNG",
  "DI_CONG_VIEC",
  "GAP_KHACH_HANG",
  "GAP_DOI_TAC",
  "KY_HOP_DONG",
  "CAU_TAI",
  "DI_LAM_AN",
  "DI_XA",
  "PHONG_VAN",
  "DOI_NO",
  "GIAO_DICH",
  "GIAO_TIEP_TIEC_TUNG",
];
const GIOI_TINH_HOP_LE: readonly XuatHanhCaNhanGioiTinh[] = ["Nam", "Nữ"];
const HUONG_HOP_LE: readonly HuongXuatHanh[] = ["Đông", "Tây", "Nam", "Bắc", "Đông Bắc", "Đông Nam", "Tây Bắc", "Tây Nam"];

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ url, request, clientAddress }) => {
  // Quét khoảng ngày (nặng): 20 lần / phút / IP.
  const limited = checkRateLimit({ request, clientAddress }, { key: "free-qs-xuat-hanh", max: 20, windowMs: 60_000 });
  if (limited) return limited;

  const params = url.searchParams;
  const purpose = params.get("purpose");
  const gioiTinh = params.get("gioiTinh");
  const huongRaw = params.get("huong");
  const namSinhRaw = params.get("namSinh");
  const yearRaw = params.get("year");
  const monthRaw = params.get("month");
  const dayRaw = params.get("day");
  const startYearRaw = params.get("startYear");
  const startMonthRaw = params.get("startMonth");
  const startDayRaw = params.get("startDay");
  const endYearRaw = params.get("endYear");
  const endMonthRaw = params.get("endMonth");
  const endDayRaw = params.get("endDay");

  if (purpose === null || !PURPOSE_HOP_LE.includes(purpose as XuatHanhCaNhanPurpose)) {
    return jsonResponse({ error: "purpose không hợp lệ." }, 400);
  }
  if (gioiTinh === null || !GIOI_TINH_HOP_LE.includes(gioiTinh as XuatHanhCaNhanGioiTinh)) {
    return jsonResponse({ error: "gioiTinh không hợp lệ." }, 400);
  }
  if (huongRaw !== null && huongRaw !== "" && !HUONG_HOP_LE.includes(huongRaw as HuongXuatHanh)) {
    return jsonResponse({ error: "huong không hợp lệ." }, 400);
  }
  if (namSinhRaw === null) {
    return jsonResponse({ error: "Thiếu tham số bắt buộc (năm sinh)." }, 400);
  }
  const namSinh = Number(namSinhRaw);
  if (!Number.isInteger(namSinh)) {
    return jsonResponse({ error: "namSinh phải là số nguyên." }, 400);
  }
  const huong = huongRaw !== null && huongRaw !== "" ? (huongRaw as HuongXuatHanh) : undefined;

  // Chế độ "chỉ xem giờ": đã có sẵn 1 ngày cụ thể (year/month/day) — chỉ xếp hạng 12 giờ trong
  // ngày đó, không quét cả khoảng ngày (đúng mục 25 của đặc tả module).
  if (yearRaw !== null || monthRaw !== null || dayRaw !== null) {
    if (yearRaw === null || monthRaw === null || dayRaw === null) {
      return jsonResponse({ error: "Thiếu tham số ngày (year/month/day)." }, 400);
    }
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    const day = Number(dayRaw);
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
      return jsonResponse({ error: "year/month/day phải là số nguyên." }, 400);
    }
    try {
      const xepHang = calculateXuatHanhCaNhanMotNgay({
        purpose: purpose as XuatHanhCaNhanPurpose,
        gioiTinh: gioiTinh as XuatHanhCaNhanGioiTinh,
        huong,
        namSinh,
        solarDate: { year, month, day },
        timeZone: "Asia/Ho_Chi_Minh",
      });
      return jsonResponse({ xepHang }, 200);
    } catch (err) {
      return jsonResponse({ error: err instanceof Error ? err.message : "Không tính được." }, 400);
    }
  }

  if (
    startYearRaw === null ||
    startMonthRaw === null ||
    startDayRaw === null ||
    endYearRaw === null ||
    endMonthRaw === null ||
    endDayRaw === null
  ) {
    return jsonResponse({ error: "Thiếu tham số bắt buộc (khoảng ngày)." }, 400);
  }

  const startYear = Number(startYearRaw);
  const startMonth = Number(startMonthRaw);
  const startDay = Number(startDayRaw);
  const endYear = Number(endYearRaw);
  const endMonth = Number(endMonthRaw);
  const endDay = Number(endDayRaw);

  if (
    !Number.isInteger(startYear) ||
    !Number.isInteger(startMonth) ||
    !Number.isInteger(startDay) ||
    !Number.isInteger(endYear) ||
    !Number.isInteger(endMonth) ||
    !Number.isInteger(endDay)
  ) {
    return jsonResponse({ error: "Các tham số ngày phải là số nguyên." }, 400);
  }

  try {
    const result = calculateXuatHanhCaNhanRange({
      purpose: purpose as XuatHanhCaNhanPurpose,
      gioiTinh: gioiTinh as XuatHanhCaNhanGioiTinh,
      huong,
      namSinh,
      startDate: { year: startYear, month: startMonth, day: startDay },
      endDate: { year: endYear, month: endMonth, day: endDay },
      timeZone: "Asia/Ho_Chi_Minh",
    });
    return jsonResponse(result, 200);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
