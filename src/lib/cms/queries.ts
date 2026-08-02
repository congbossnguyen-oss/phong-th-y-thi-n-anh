import { sanityClient } from "./client";

// Điểm truy cập duy nhất cho dữ liệu khóa học/bài học — pages chỉ gọi qua các hàm dưới đây,
// không tự viết GROQ rải rác khắp nơi.

export interface CmsLesson {
  slug: string;
  title: string;
  order: number;
  bunnyVideoId: string | null;
  durationSeconds: number | null;
  isFreePreview: boolean;
}

export interface CmsCourse {
  slug: string;
  name: string;
  format: "online" | "offline";
  summary: string;
  price: number;
  lessonsCount: number;
}

export interface CmsCourseWithLessons extends CmsCourse {
  lessons: CmsLesson[];
}

const courseListProjection = `{
  "slug": slug.current,
  name,
  format,
  summary,
  price,
  "lessonsCount": count(*[_type == "lesson" && references(^._id)])
}`;

export async function getCourses(): Promise<CmsCourse[]> {
  return sanityClient.fetch(`*[_type == "course"] | order(name asc) ${courseListProjection}`);
}

export async function getCourseBySlug(slug: string): Promise<CmsCourse | null> {
  return sanityClient.fetch(
    `*[_type == "course" && slug.current == $slug][0] ${courseListProjection}`,
    { slug },
  );
}

const lessonProjection = `{
  "slug": slug.current,
  title,
  order,
  bunnyVideoId,
  durationSeconds,
  isFreePreview
} | order(order asc)`;

export async function getCourseWithLessons(slug: string): Promise<CmsCourseWithLessons | null> {
  const course = await sanityClient.fetch<CmsCourse | null>(
    `*[_type == "course" && slug.current == $slug][0] ${courseListProjection}`,
    { slug },
  );
  if (!course) return null;

  const lessons = await sanityClient.fetch<CmsLesson[]>(
    `*[_type == "lesson" && course->slug.current == $slug] ${lessonProjection}`,
    { slug },
  );

  return { ...course, lessons };
}

export function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
