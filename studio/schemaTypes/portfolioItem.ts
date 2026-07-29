import { defineField, defineType } from "sanity";

export default defineType({
  name: "portfolioItem",
  title: "Công trình đã thực hiện",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Tên công trình", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Đường dẫn",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "location", title: "Địa điểm", type: "string" }),
    defineField({ name: "coverImage", title: "Ảnh đại diện", type: "image", options: { hotspot: true } }),
    defineField({ name: "gallery", title: "Bộ ảnh công trình", type: "array", of: [{ type: "image", options: { hotspot: true } }] }),
    defineField({ name: "body", title: "Mô tả bài toán & giải pháp", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "completedAt", title: "Thời gian hoàn thành", type: "date" }),
  ],
  preview: {
    select: { title: "title", subtitle: "location", media: "coverImage" },
  },
});
