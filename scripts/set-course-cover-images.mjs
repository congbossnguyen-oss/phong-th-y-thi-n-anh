// Gán ảnh đại diện (coverImage) cho từng khóa học theo nhóm môn học, dùng ảnh nhóm đã có sẵn.
// Dùng: node scripts/set-course-cover-images.mjs
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

// category (đúng giá trị lưu trong Sanity) -> file ảnh trong public/images/courses/categories/
const categoryImages = {
  "Bát tự": "bat-tu.png",
  "Bát trạch": "bat-trach.png",
  "Huyền không phi tinh": "huyen-khong-phi-tinh.png",
  "Huyền không lục pháp": "huyen-khong-luc-phap.png",
  "Trạch nhật": "trach-nhat.png",
  "Kỳ môn": "ky-mon.png",
  "Kinh dịch": "kinh-dich.png",
  "Tử vi": "tu-vi.png",
};

for (const [category, filename] of Object.entries(categoryImages)) {
  const filePath = new URL(`../public/images/courses/categories/${filename}`, import.meta.url);
  const buffer = readFileSync(filePath);
  const asset = await client.assets.upload("image", buffer, { filename });
  console.log(`✓ đã upload ảnh cho nhóm "${category}": ${asset._id}`);

  const courses = await client.fetch(`*[_type == "course" && category == $category]{_id, name}`, { category });
  for (const course of courses) {
    await client
      .patch(course._id)
      .set({
        coverImage: {
          _type: "image",
          asset: { _type: "reference", _ref: asset._id },
        },
      })
      .commit();
    console.log(`  ✓ gán ảnh cho khóa: ${course.name}`);
  }
}

console.log("\nXong! Đã gán ảnh đại diện cho các khóa học theo 6 nhóm có ảnh.");
console.log("Chưa có ảnh cho nhóm: Huyền không lục pháp, Tử vi.");
