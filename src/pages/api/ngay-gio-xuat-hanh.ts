import type { APIRoute } from "astro";
import {
  calculateXuatHanhCaNhanRange,
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

export const GET: APIRoute = async ({ url }) => {
  const params = url.searchParams;
  const purpose = params.get("purpose");
  const gioiTinh = params.get("gioiTinh");
  const huongRaw = params.get("huong");
  const namSinhRaw = params.get("namSinh");
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
  if (
    namSinhRaw === null ||
    startYearRaw === null ||
    startMonthRaw === null ||
    startDayRaw === null ||
    endYearRaw === null ||
    endMonthRaw === null ||
    endDayRaw === null
  ) {
    return jsonResponse({ error: "Thiếu tham số bắt buộc (năm sinh hoặc khoảng ngày)." }, 400);
  }

  const namSinh = Number(namSinhRaw);
  const startYear = Number(startYearRaw);
  const startMonth = Number(startMonthRaw);
  const startDay = Number(startDayRaw);
  const endYear = Number(endYearRaw);
  const endMonth = Number(endMonthRaw);
  const endDay = Number(endDayRaw);

  if (
    !Number.isInteger(namSinh) ||
    !Number.isInteger(startYear) ||
    !Number.isInteger(startMonth) ||
    !Number.isInteger(startDay) ||
    !Number.isInteger(endYear) ||
    !Number.isInteger(endMonth) ||
    !Number.isInteger(endDay)
  ) {
    return jsonResponse({ error: "Các tham số ngày và năm sinh phải là số nguyên." }, 400);
  }

  try {
    const result = calculateXuatHanhCaNhanRange({
      purpose: purpose as XuatHanhCaNhanPurpose,
      gioiTinh: gioiTinh as XuatHanhCaNhanGioiTinh,
      huong: huongRaw !== null && huongRaw !== "" ? (huongRaw as HuongXuatHanh) : undefined,
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
