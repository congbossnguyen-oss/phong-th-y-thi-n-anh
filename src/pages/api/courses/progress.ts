import type { APIRoute } from "astro";
import { and, eq } from "drizzle-orm";
import { db } from "../../../lib/db/client";
import { courseEnrollments, lessonProgress } from "../../../../db/schema";
import { issueCertificateIfCourseCompleted } from "../../../lib/db/certificates";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ ok: false, error: "Cần đăng nhập." }), { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const courseRef = body?.courseRef;
  const lessonRef = body?.lessonRef;
  if (!courseRef || !lessonRef) {
    return new Response(JSON.stringify({ ok: false, error: "Thiếu courseRef/lessonRef." }), { status: 400 });
  }

  // Chỉ cho đánh dấu hoàn thành nếu thực sự đã ghi danh khóa học đó — chặn giả mạo tiến độ qua API.
  const [enrollment] = await db
    .select({ id: courseEnrollments.id })
    .from(courseEnrollments)
    .where(and(eq(courseEnrollments.userId, locals.user.id), eq(courseEnrollments.courseRef, courseRef)))
    .limit(1);

  if (!enrollment) {
    return new Response(JSON.stringify({ ok: false, error: "Bạn chưa ghi danh khóa học này." }), { status: 403 });
  }

  const [existing] = await db
    .select({ id: lessonProgress.id })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, locals.user.id),
        eq(lessonProgress.courseRef, courseRef),
        eq(lessonProgress.lessonRef, lessonRef)
      )
    )
    .limit(1);

  if (!existing) {
    await db.insert(lessonProgress).values({
      userId: locals.user.id,
      courseRef,
      lessonRef,
      completedAt: new Date(),
    });
  }

  const certificate = await issueCertificateIfCourseCompleted({
    userId: locals.user.id,
    userName: locals.user.name,
    userEmail: locals.user.email,
    courseRef,
  });

  return new Response(JSON.stringify({ ok: true, certificateIssued: Boolean(certificate) }), { status: 200 });
};
