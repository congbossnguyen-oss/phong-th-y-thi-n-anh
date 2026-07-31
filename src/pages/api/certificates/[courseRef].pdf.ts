import type { APIRoute } from "astro";
import { and, eq } from "drizzle-orm";
import { db } from "../../../lib/db/client";
import { courseCertificates } from "../../../../db/schema";
import { courses } from "../../../lib/placeholder-courses";
import { generateCertificatePdf } from "../../../lib/certificate/generate";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  if (!locals.user) {
    return new Response("Cần đăng nhập.", { status: 401 });
  }

  const courseRef = params.courseRef!;
  const course = courses.find((c) => c.slug === courseRef);
  if (!course) {
    return new Response("Không tìm thấy khóa học.", { status: 404 });
  }

  const [certificate] = await db
    .select()
    .from(courseCertificates)
    .where(and(eq(courseCertificates.userId, locals.user.id), eq(courseCertificates.courseRef, courseRef)))
    .limit(1);

  if (!certificate) {
    return new Response("Bạn chưa hoàn thành khóa học này.", { status: 403 });
  }

  const pdfBytes = await generateCertificatePdf({
    studentName: locals.user.name,
    courseName: course.name,
    certificateCode: certificate.certificateCode,
    issuedAt: certificate.issuedAt,
  });

  return new Response(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="chung-chi-${certificate.certificateCode}.pdf"`,
    },
  });
};
