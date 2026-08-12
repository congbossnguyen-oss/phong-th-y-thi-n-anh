import type { APIRoute } from "astro";
import { calculateChonNgayGiaoDichRange, type AssetType, type TransactionPurpose } from "@thien-anh/trachnhat-engine";

export const prerender = false;

const ASSET_TYPE_HOP_LE: readonly AssetType[] = ["NHA", "XE"];
const PURPOSE_HOP_LE: readonly TransactionPurpose[] = ["MUA", "NHAN"];

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ url }) => {
  const params = url.searchParams;
  const assetType = params.get("assetType");
  const purpose = params.get("purpose");
  const startYearRaw = params.get("startYear");
  const startMonthRaw = params.get("startMonth");
  const startDayRaw = params.get("startDay");
  const endYearRaw = params.get("endYear");
  const endMonthRaw = params.get("endMonth");
  const endDayRaw = params.get("endDay");
  const namSinhChuRaw = params.get("namSinhChu");

  if (assetType === null || !ASSET_TYPE_HOP_LE.includes(assetType as AssetType)) {
    return jsonResponse({ error: "assetType không hợp lệ (phải là NHA hoặc XE)." }, 400);
  }
  if (purpose === null || !PURPOSE_HOP_LE.includes(purpose as TransactionPurpose)) {
    return jsonResponse({ error: "purpose không hợp lệ (phải là MUA hoặc NHAN)." }, 400);
  }
  if (
    startYearRaw === null ||
    startMonthRaw === null ||
    startDayRaw === null ||
    endYearRaw === null ||
    endMonthRaw === null ||
    endDayRaw === null
  ) {
    return jsonResponse({ error: "Thiếu tham số ngày bắt đầu/kết thúc." }, 400);
  }

  const startYear = Number(startYearRaw);
  const startMonth = Number(startMonthRaw);
  const startDay = Number(startDayRaw);
  const endYear = Number(endYearRaw);
  const endMonth = Number(endMonthRaw);
  const endDay = Number(endDayRaw);
  const namSinhChu = namSinhChuRaw !== null ? Number(namSinhChuRaw) : undefined;

  if (
    !Number.isInteger(startYear) ||
    !Number.isInteger(startMonth) ||
    !Number.isInteger(startDay) ||
    !Number.isInteger(endYear) ||
    !Number.isInteger(endMonth) ||
    !Number.isInteger(endDay) ||
    (namSinhChu !== undefined && !Number.isInteger(namSinhChu))
  ) {
    return jsonResponse({ error: "Các tham số ngày và namSinhChu phải là số nguyên." }, 400);
  }

  try {
    const result = calculateChonNgayGiaoDichRange({
      assetType: assetType as AssetType,
      purpose: purpose as TransactionPurpose,
      startDate: { year: startYear, month: startMonth, day: startDay },
      endDate: { year: endYear, month: endMonth, day: endDay },
      timeZone: "Asia/Ho_Chi_Minh",
      ...(namSinhChu !== undefined ? { namSinhChu } : {}),
    });
    return jsonResponse(result, 200);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
