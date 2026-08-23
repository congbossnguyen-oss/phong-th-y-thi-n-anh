import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/client";
import { pushSubscriptions } from "../../../../db/schema";
import { checkRateLimit } from "../../../lib/rate-limit";

export const prerender = false;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** Khách tắt thông báo — xóa hẳn đăng ký của máy đó. */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const limited = checkRateLimit({ request, clientAddress }, { key: "huy-thong-bao", max: 20, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const endpoint = typeof (body as any)?.endpoint === "string" ? (body as any).endpoint.trim() : "";
  if (!endpoint) return json({ ok: false, error: "Thiếu địa chỉ đăng ký." }, 400);

  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
  return json({ ok: true }, 200);
};
