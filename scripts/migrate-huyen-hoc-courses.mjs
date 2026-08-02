// Tái cấu trúc danh mục khóa học: "Khóa học phong thủy" -> "Khóa học huyền học",
// thay 3 khóa học tạm bằng 26 khóa học chia theo 8 nhóm môn học.
// Dùng: node scripts/migrate-huyen-hoc-courses.mjs
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

const OLD_COURSE_IDS = ["course-nhap-mon-phong-thuy", "course-trach-nhat-thuc-chien", "course-bat-tu-chuyen-sau"];

const groups = [
  {
    category: "Bát tự",
    items: ["Bát tự nhập môn", "Bát tự trung cấp", "Bát tự chuyên sâu"],
  },
  {
    category: "Bát trạch",
    items: ["Bát trạch nhập môn", "Bát trạch trung cấp", "Bát trạch cao cấp", "Bát trạch chân pháp"],
  },
  {
    category: "Huyền không phi tinh",
    items: ["Huyền không phi tinh nhập môn", "Huyền không phi tinh trung cấp", "Huyền không phi tinh cao cấp"],
  },
  {
    category: "Trạch nhật",
    items: ["Trạch nhật cơ bản", "Trạch nhật nâng cao"],
  },
  {
    category: "Huyền không lục pháp",
    items: ["Huyền không lục pháp cơ bản", "Huyền không lục pháp trung cấp", "Huyền không lục pháp nâng cao"],
  },
  {
    category: "Kỳ môn",
    items: ["Kỳ môn nhập môn", "Kỳ môn phong thủy", "Kỳ môn mệnh"],
  },
  {
    category: "Tử vi",
    items: ["Tử vi nhập môn", "Tử vi trung cấp", "Tử vi nâng cao"],
  },
  {
    category: "Kinh dịch",
    items: ["Kinh dịch cơ bản", "Kinh dịch trung cấp", "Kinh dịch nâng cao", "Kinh dịch phong thủy", "Kinh dịch hóa giải"],
  },
];

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

for (const oldId of OLD_COURSE_IDS) {
  const lessons = await client.fetch(`*[_type == "lesson" && course._ref == $id]{_id}`, { id: oldId });
  for (const l of lessons) {
    await client.delete(l._id);
  }
  await client.delete(oldId);
  console.log(`✓ đã xóa khóa học cũ: ${oldId} (${lessons.length} bài học)`);
}

for (const group of groups) {
  for (const [i, name] of group.items.entries()) {
    const slug = slugify(name);
    const id = `course-${slug}`;
    await client.createOrReplace({
      _id: id,
      _type: "course",
      name,
      slug: { _type: "slug", current: slug },
      category: group.category,
      order: i,
      format: "offline",
      summary: `Khóa học ${name} thuộc nhóm ${group.category}, giảng dạy cùng chuyên gia Thiên Anh.`,
      price: 0,
    });
    console.log(`✓ course: ${name} [${group.category}] order=${i}`);
  }
}

console.log("\nXong! Đã tạo 26 khóa học huyền học, chia theo 8 nhóm.");
console.log("Lưu ý: giá (price=0 -> hiển thị 'Liên hệ') và ảnh cover đang để trống, vào Sanity Studio để cập nhật.");
