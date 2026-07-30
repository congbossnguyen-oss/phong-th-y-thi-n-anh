import { defineField, defineType } from "sanity";

export default defineType({
  name: "lesson",
  title: "Bài học (khóa online)",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Tên bài học", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Đường dẫn",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "course", title: "Thuộc khóa học", type: "reference", to: [{ type: "course" }], validation: (r) => r.required() }),
    defineField({ name: "order", title: "Thứ tự trong khóa", type: "number", validation: (r) => r.required() }),
    defineField({
      name: "bunnyVideoId",
      title: "Bunny Stream Video GUID",
      type: "string",
      description: "GUID video trong thư viện Bunny Stream — dùng để tạo URL nhúng có ký (xem src/lib/video/bunnyStream.ts)",
    }),
    defineField({ name: "durationSeconds", title: "Thời lượng (giây)", type: "number" }),
    defineField({
      name: "isFreePreview",
      title: "Cho xem thử miễn phí (chưa đăng ký vẫn xem được)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "description", title: "Mô tả bài học", type: "text", rows: 2 }),
  ],
  orderings: [{ title: "Thứ tự trong khóa", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "title", subtitle: "course.name" },
  },
});
