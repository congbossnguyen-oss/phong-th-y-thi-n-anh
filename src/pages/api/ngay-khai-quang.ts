import type { APIRoute } from "astro";
import { checkRateLimit } from "../../lib/rate-limit";
import { calculateNgayKhaiQuangRange, type KhaiQuangPurpose, type KhaiQuangItemType, type KhaiQuangGender } from "@thien-anh/trachnhat-engine";

export const prerender = false;

const PURPOSE_HOP_LE: readonly KhaiQuangPurpose[] = ["KHAI_QUANG", "AN_VI", "THINH", "DAT_VAT_PHAM", "BAT_DAU_SU_DUNG"];
const ITEM_TYPE_HOP_LE: readonly KhaiQuangItemType[] = [
  "TUONG_PHAT",
  "TUONG_THAN",
  "TY_HUU",
  "THIEM_THU",
  "KY_LAN",
  "SU_TU",
  "CHO_DA",
  "NGHE_DA",
  "VOI_DA",
  "VAT_PHAM_PHONG_THUY",
  "VAT_PHAM_CHIEU_TAI",
  "VAT_PHAM_HO_THAN",
  "KHAC",
];
const GENDER_HOP_LE: readonly KhaiQuangGender[] = ["Nam", "Nữ"];

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ url, request, clientAddress }) => {
  // Quét khoảng ngày (nặng): 20 lần / phút / IP.
  const limited = checkRateLimit({ request, clientAddress }, { key: "free-khai-quang", max: 20, windowMs: 60_000 });
  if (limited) return limited;

  const params = url.searchParams;
  const purpose = params.get("purpose");
  const itemType = params.get("itemType");
  const gender = params.get("gender");
  const namSinhChuRaw = params.get("namSinhChu");
  const startYearRaw = params.get("startYear");
  const startMonthRaw = params.get("startMonth");
  const startDayRaw = params.get("startDay");
  const endYearRaw = params.get("endYear");
  const endMonthRaw = params.get("endMonth");
  const endDayRaw = params.get("endDay");

  if (purpose === null || !PURPOSE_HOP_LE.includes(purpose as KhaiQuangPurpose)) {
    return jsonResponse({ error: "purpose không hợp lệ." }, 400);
  }
  if (itemType === null || !ITEM_TYPE_HOP_LE.includes(itemType as KhaiQuangItemType)) {
    return jsonResponse({ error: "itemType không hợp lệ." }, 400);
  }
  if (gender === null || !GENDER_HOP_LE.includes(gender as KhaiQuangGender)) {
    return jsonResponse({ error: "gender không hợp lệ." }, 400);
  }
  if (
    namSinhChuRaw === null ||
    startYearRaw === null ||
    startMonthRaw === null ||
    startDayRaw === null ||
    endYearRaw === null ||
    endMonthRaw === null ||
    endDayRaw === null
  ) {
    return jsonResponse({ error: "Thiếu tham số bắt buộc (năm sinh chủ hoặc khoảng ngày)." }, 400);
  }

  const namSinhChu = Number(namSinhChuRaw);
  const startYear = Number(startYearRaw);
  const startMonth = Number(startMonthRaw);
  const startDay = Number(startDayRaw);
  const endYear = Number(endYearRaw);
  const endMonth = Number(endMonthRaw);
  const endDay = Number(endDayRaw);

  if (
    !Number.isInteger(namSinhChu) ||
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
    const result = calculateNgayKhaiQuangRange({
      purpose: purpose as KhaiQuangPurpose,
      itemType: itemType as KhaiQuangItemType,
      gioiTinhChu: gender as KhaiQuangGender,
      namSinhChu,
      startDate: { year: startYear, month: startMonth, day: startDay },
      endDate: { year: endYear, month: endMonth, day: endDay },
      timeZone: "Asia/Ho_Chi_Minh",
    });
    return jsonResponse(result, 200);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
