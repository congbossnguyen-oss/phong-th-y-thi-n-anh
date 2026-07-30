import type { APIRoute } from "astro";
import { invalidateSession, SESSION_COOKIE_NAME } from "../../../lib/auth/session";

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await invalidateSession(token);
  }
  cookies.delete(SESSION_COOKIE_NAME, { path: "/" });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
