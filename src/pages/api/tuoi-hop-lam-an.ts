import type { APIRoute } from "astro";
import { calculateTuoiHopLamAn } from "@thien-anh/trachnhat-engine";

export const prerender = false;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ url }) => {
  const params = url.searchParams;
  const namSinh1Raw = params.get("namSinh1");
  const namSinh2Raw = params.get("namSinh2");

  if (namSinh1Raw === null || namSinh2Raw === null) {
    return jsonResponse({ error: "Thiếu tham số bắt buộc: namSinh1, namSinh2." }, 400);
  }

  const namSinh1 = Number(namSinh1Raw);
  const namSinh2 = Number(namSinh2Raw);

  if (!Number.isInteger(namSinh1) || !Number.isInteger(namSinh2)) {
    return jsonResponse({ error: "namSinh1, namSinh2 phải là số nguyên." }, 400);
  }

  try {
    const result = calculateTuoiHopLamAn({ namSinh1, namSinh2 });
    return jsonResponse(result, 200);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
