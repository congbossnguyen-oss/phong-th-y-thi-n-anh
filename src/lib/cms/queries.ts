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
  category: string | null;
  order: number;
  format: "online" | "offline";
  summary: string;
  price: number;
  coverImageUrl: string | null;
  lessonsCount: number;
}

export interface CmsCourseWithLessons extends CmsCourse {
  lessons: CmsLesson[];
}

// Thứ tự hiển thị các nhóm môn học trên trang /khoa-hoc.
export const COURSE_CATEGORY_ORDER = [
  "Bát tự",
  "Bát trạch",
  "Huyền không phi tinh",
  "Trạch nhật",
  "Huyền không lục pháp",
  "Kỳ môn",
  "Tử vi",
  "Kinh dịch",
];

const courseListProjection = `{
  "slug": slug.current,
  name,
  category,
  order,
  format,
  summary,
  price,
  "coverImageUrl": coverImage.asset->url,
  "lessonsCount": count(*[_type == "lesson" && references(^._id)])
}`;

export async function getCourses(): Promise<CmsCourse[]> {
  return sanityClient.fetch(`*[_type == "course"] | order(order asc, name asc) ${courseListProjection}`);
}

export function groupCoursesByCategory(courses: CmsCourse[]): { category: string; courses: CmsCourse[] }[] {
  const groups = COURSE_CATEGORY_ORDER.map((category) => ({
    category,
    courses: courses.filter((c) => c.category === category),
  })).filter((g) => g.courses.length > 0);

  const uncategorized = courses.filter((c) => !c.category || !COURSE_CATEGORY_ORDER.includes(c.category));
  if (uncategorized.length > 0) groups.push({ category: "Khác", courses: uncategorized });

  return groups;
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
