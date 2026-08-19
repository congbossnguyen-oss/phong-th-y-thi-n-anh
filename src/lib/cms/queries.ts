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

// Slug neo (anchor id) cho từng nhóm — dùng để menu điều hướng liên kết thẳng tới từng nhóm trên /khoa-hoc.
export const COURSE_CATEGORY_SLUGS: Record<string, string> = {
  "Bát tự": "bat-tu",
  "Bát trạch": "bat-trach",
  "Huyền không phi tinh": "huyen-khong-phi-tinh",
  "Huyền không lục pháp": "huyen-khong-luc-phap",
  "Kinh dịch": "kinh-dich",
  "Kỳ môn": "ky-mon",
  "Trạch nhật": "trach-nhat",
  "Tử vi": "tu-vi",
};

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

// ───────────────────────── Blog / Kiến thức (blogPost) ─────────────────────────
// Bài viết đọc động từ Sanity (trang /kien-thuc để prerender=false). Bài mẫu tĩnh cũ
// trong placeholder-data.ts vẫn được các trang gộp thêm để không mất nội dung hiện có.

export interface CmsBlogPost {
  slug: string;
  title: string;
  seoTitle: string | null;
  excerpt: string;
  category: string;      // nhãn hiển thị (vd "Nhà ở")
  categorySlug: string;  // giá trị dùng trong URL (vd "nha-o")
  image: string | null;  // URL ảnh bìa trên Sanity CDN
  imageAlt: string | null;
  publishedAt: string | null;
  tags: string[];
  body: unknown[] | null; // Portable Text
  relatedLinks: { label: string; href: string }[];
  faq: { question: string; answer: string }[];
}

const BLOG_CATEGORY_LABELS: Record<string, string> = {
  "kien-thuc-ung-dung": "Kiến thức ứng dụng",
  "nha-o": "Nhà ở",
  "van-phong-kinh-doanh": "Văn phòng / Kinh doanh",
  "vat-pham": "Vật phẩm phong thủy",
};

const blogProjection = `{
  "slug": slug.current,
  title,
  seoTitle,
  "excerpt": coalesce(excerpt, ""),
  category,
  "image": coverImage.asset->url,
  "imageAlt": coalesce(coverImage.alt, coverImageAlt),
  publishedAt,
  "tags": coalesce(tags, []),
  body,
  "relatedLinks": coalesce(internalLinks[]{label, href}, []),
  "faq": coalesce(faq[]{question, answer}, [])
}`;

function mapBlogPost(doc: any): CmsBlogPost {
  const value: string = doc?.category ?? "kien-thuc-ung-dung";
  return {
    slug: doc.slug,
    title: doc.title,
    seoTitle: doc.seoTitle ?? null,
    excerpt: doc.excerpt ?? "",
    category: BLOG_CATEGORY_LABELS[value] ?? "Kiến thức",
    categorySlug: value,
    image: doc.image ?? null,
    imageAlt: doc.imageAlt ?? null,
    publishedAt: doc.publishedAt ?? null,
    tags: doc.tags ?? [],
    body: doc.body ?? null,
    relatedLinks: (doc.relatedLinks ?? []).filter((l: any) => l && l.href),
    faq: (doc.faq ?? []).filter((f: any) => f && f.question),
  };
}

export async function getBlogPosts(): Promise<CmsBlogPost[]> {
  const docs = await sanityClient.fetch(
    `*[_type == "blogPost" && !(_id in path("drafts.**")) && defined(slug.current)] | order(publishedAt desc) ${blogProjection}`,
  );
  return (docs ?? []).map(mapBlogPost);
}

export async function getBlogPostBySlug(slug: string): Promise<CmsBlogPost | null> {
  const doc = await sanityClient.fetch(
    `*[_type == "blogPost" && !(_id in path("drafts.**")) && slug.current == $slug][0] ${blogProjection}`,
    { slug },
  );
  return doc ? mapBlogPost(doc) : null;
}
