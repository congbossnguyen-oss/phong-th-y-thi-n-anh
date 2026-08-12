import type { APIRoute } from "astro";
import { calculateHoangOcKimLau, calculateHoangOcKimLauRange } from "@thien-anh/trachnhat-engine";

export const prerender = false;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ url }) => {
  const params = url.searchParams;
  const namSinhRaw = params.get("namSinh");
  const tuNamRaw = params.get("tuNam");
  const denNamRaw = params.get("denNam");
  const namXemRaw = params.get("namXem");

  if (namSinhRaw === null) {
    return jsonResponse({ error: "Thiếu tham số bắt buộc: namSinh." }, 400);
  }
  const namSinh = Number(namSinhRaw);
  if (!Number.isInteger(namSinh)) {
    return jsonResponse({ error: "namSinh phải là số nguyên." }, 400);
  }

  try {
    if (tuNamRaw !== null && denNamRaw !== null) {
      const tuNam = Number(tuNamRaw);
      const denNam = Number(denNamRaw);
      if (!Number.isInteger(tuNam) || !Number.isInteger(denNam)) {
        return jsonResponse({ error: "tuNam, denNam phải là số nguyên." }, 400);
      }
      const results = calculateHoangOcKimLauRange({ namSinh, tuNam, denNam });
      return jsonResponse({ results }, 200);
    }

    if (namXemRaw === null) {
      return jsonResponse({ error: "Thiếu tham số: namXem (hoặc cặp tuNam/denNam)." }, 400);
    }
    const namXem = Number(namXemRaw);
    if (!Number.isInteger(namXem)) {
      return jsonResponse({ error: "namXem phải là số nguyên." }, 400);
    }
    const result = calculateHoangOcKimLau({ namSinh, namXem });
    return jsonResponse({ result }, 200);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
