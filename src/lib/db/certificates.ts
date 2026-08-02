import { randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "./client";
import { courseCertificates, lessonProgress } from "../../../db/schema";
import { getCourseWithLessons } from "../cms/queries";
import { generateCertificatePdf } from "../certificate/generate";
import { sendCourseCertificateEmail } from "../email/send";

function generateCertificateCode(): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = randomBytes(6);
  let code = "";
  for (const b of bytes) code += alphabet[b % alphabet.length];
  return `THA-CERT-${code}`;
}

/**
 * Kiểm tra nếu học viên vừa hoàn thành 100% khóa học thì tự động cấp chứng chỉ (nếu chưa có) —
 * gọi sau mỗi lần đánh dấu hoàn thành bài học. Idempotent: gọi nhiều lần chỉ cấp 1 chứng chỉ/khóa.
 */
export async function issueCertificateIfCourseCompleted(params: {
  userId: string;
  userName: string;
  userEmail: string;
  courseRef: string;
}) {
  const course = await getCourseWithLessons(params.courseRef);
  if (!course || course.lessons.length === 0) return null;

  const progressRows = await db
    .select({ lessonRef: lessonProgress.lessonRef })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, params.userId), eq(lessonProgress.courseRef, params.courseRef)));

  const completedSlugs = new Set(progressRows.map((p) => p.lessonRef));
  const isComplete = course.lessons.every((l) => completedSlugs.has(l.slug));
  if (!isComplete) return null;

  const [existing] = await db
    .select({ id: courseCertificates.id })
    .from(courseCertificates)
    .where(and(eq(courseCertificates.userId, params.userId), eq(courseCertificates.courseRef, params.courseRef)))
    .limit(1);

  if (existing) return null;

  const certificateCode = generateCertificateCode();
  const issuedAt = new Date();

  await db.insert(courseCertificates).values({
    userId: params.userId,
    courseRef: params.courseRef,
    certificateCode,
    issuedAt,
  });

  // Chứng chỉ trong DB đã được ghi nhận ở trên (nguồn sự thật) — PDF luôn tạo lại được từ đó
  // qua endpoint tải về, nên lỗi tạo/gửi PDF ở đây không được làm hỏng luồng đánh dấu hoàn thành bài học.
  try {
    const pdfBytes = await generateCertificatePdf({
      studentName: params.userName,
      courseName: course.name,
      certificateCode,
      issuedAt,
    });

    await sendCourseCertificateEmail({
      to: params.userEmail,
      customerName: params.userName,
      courseName: course.name,
      certificateCode,
      pdfBytes,
    });
  } catch (err) {
    console.error("[certificate] Không tạo/gửi được PDF chứng chỉ:", err);
  }

  return { certificateCode };
}
