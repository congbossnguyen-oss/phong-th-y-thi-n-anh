import type { APIRoute } from "astro";
import { and, eq } from "drizzle-orm";
import { db } from "../../../lib/db/client";
import { courseEnrollments } from "../../../../db/schema";
import { courses } from "../../../lib/placeholder-courses";

export const prerender = false;

// hls.js sẽ tự gọi endpoint này (URI được nhúng sẵn trong file .m3u8 lúc mã hóa bằng FFmpeg)
// mỗi khi cần khóa giải mã đoạn video AES-128 — CHỈ trả khóa nếu request có cookie session hợp lệ
// và user thực sự đã ghi danh khóa học chứa bài học đó.
export const GET: APIRoute = async ({ url, locals }) => {
  if (!locals.user) {
    return new Response("Chưa đăng nhập", { status: 401 });
  }

  const courseRef = url.searchParams.get("course");
  const lessonRef = url.searchParams.get("lesson");
  if (!courseRef || !lessonRef) {
    return new Response("Thiếu course/lesson", { status: 400 });
  }

  const [enrollment] = await db
    .select({ id: courseEnrollments.id })
    .from(courseEnrollments)
    .where(and(eq(courseEnrollments.userId, locals.user.id), eq(courseEnrollments.courseRef, courseRef)))
    .limit(1);

  if (!enrollment) {
    return new Response("Chưa ghi danh khóa học này", { status: 403 });
  }

  const course = courses.find((c) => c.slug === courseRef);
  const lesson = course?.lessons?.find((l) => l.slug === lessonRef);
  const keyHex = lesson?.hlsKeyHex;

  if (!keyHex || keyHex.length !== 32) {
    return new Response("Bài học chưa có khóa giải mã HLS", { status: 404 });
  }

  const keyBytes = Buffer.from(keyHex, "hex");

  return new Response(keyBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-store",
    },
  });
};
