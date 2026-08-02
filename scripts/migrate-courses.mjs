// Chạy 1 lần để đưa dữ liệu khóa học/bài học từ placeholder-courses.ts (cũ) vào Sanity thật.
// Dùng: node scripts/migrate-courses.mjs
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";

const envText = readFileSync(new URL("../.env", import.meta.url), "utf-8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const client = createClient({
  projectId: env.SANITY_PROJECT_ID,
  dataset: env.SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: env.SANITY_API_TOKEN,
  useCdn: false,
});

const courses = [
  {
    slug: "nhap-mon-phong-thuy",
    name: "Nhập môn Phong thủy ứng dụng",
    format: "online",
    price: 1990000,
    summary: "Nền tảng lý thuyết Ngũ Hành, Bát Quái và cách ứng dụng vào không gian sống.",
    lessons: [
      { slug: "gioi-thieu-khoa-hoc", title: "Giới thiệu khóa học", durationSeconds: 320 },
      { slug: "nguyen-ly-ngu-hanh", title: "Nguyên lý Ngũ Hành", durationSeconds: 1120 },
      { slug: "bat-quai-co-ban", title: "Bát Quái cơ bản", durationSeconds: 1330 },
      { slug: "dong-tay-tu-trach", title: "Đông Tứ Trạch — Tây Tứ Trạch", durationSeconds: 1500 },
      { slug: "ung-dung-nha-o", title: "Ứng dụng vào nhà ở thực tế", durationSeconds: 1815 },
      { slug: "tong-ket-bai-tap", title: "Tổng kết & bài tập thực hành", durationSeconds: 945 },
    ],
  },
  {
    slug: "trach-nhat-thuc-chien",
    name: "Trạch Nhật thực chiến",
    format: "offline",
    price: 4990000,
    summary: "Khóa học trực tiếp cùng chuyên gia, thực hành chọn ngày cho các sự kiện quan trọng.",
    lessons: [],
  },
  {
    slug: "bat-tu-chuyen-sau",
    name: "Bát Tự chuyên sâu",
    format: "online",
    price: 3490000,
    summary: "Luận giải lá số bát tự từ cơ bản đến nâng cao, có bài tập thực hành.",
    lessons: [
      { slug: "nhap-mon-bat-tu", title: "Nhập môn Bát Tự — Can Chi cơ bản", durationSeconds: 1200 },
      { slug: "lap-la-so", title: "Cách lập lá số Tứ Trụ", durationSeconds: 1470 },
      { slug: "vuong-suy-than", title: "Xác định vượng suy của Thân", durationSeconds: 1690 },
      { slug: "dung-than-hy-than", title: "Dụng Thần — Hỷ Thần", durationSeconds: 1605 },
      { slug: "luan-tai-quan", title: "Luận Tài — Quan trong lá số", durationSeconds: 1340 },
      { slug: "bai-tap-thuc-hanh", title: "Bài tập thực hành luận giải", durationSeconds: 1140 },
    ],
  },
];

for (const c of courses) {
  const courseId = `course-${c.slug}`;
  await client.createOrReplace({
    _id: courseId,
    _type: "course",
    name: c.name,
    slug: { _type: "slug", current: c.slug },
    format: c.format,
    summary: c.summary,
    price: c.price,
  });
  console.log(`✓ course: ${c.name}`);

  for (const [i, l] of c.lessons.entries()) {
    await client.createOrReplace({
      _id: `lesson-${c.slug}-${l.slug}`,
      _type: "lesson",
      title: l.title,
      slug: { _type: "slug", current: l.slug },
      course: { _type: "reference", _ref: courseId },
      order: i + 1,
      durationSeconds: l.durationSeconds,
      isFreePreview: false,
    });
    console.log(`  ✓ lesson: ${l.title}`);
  }
}

console.log("\nXong! Đã tạo", courses.length, "khóa học trong Sanity.");
