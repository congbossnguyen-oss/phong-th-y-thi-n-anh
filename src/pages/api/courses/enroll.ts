import type { APIRoute } from "astro";
import { and, eq } from "drizzle-orm";
import { db } from "../../../lib/db/client";
import { courseEnrollments } from "../../../../db/schema";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ ok: false, error: "Cần đăng nhập." }), { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const courseRef = body?.courseRef;
  if (!courseRef) {
    return new Response(JSON.stringify({ ok: false, error: "Thiếu courseRef." }), { status: 400 });
  }

  const [existing] = await db
    .select({ id: courseEnrollments.id })
    .from(courseEnrollments)
    .where(and(eq(courseEnrollments.userId, locals.user.id), eq(courseEnrollments.courseRef, courseRef)))
    .limit(1);

  if (!existing) {
    await db.insert(courseEnrollments).values({
      userId: locals.user.id,
      courseRef,
      source: "online_purchase",
    });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
