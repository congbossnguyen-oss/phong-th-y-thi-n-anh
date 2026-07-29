import { defineField, defineType } from "sanity";

export default defineType({
  name: "teamMember",
  title: "Đội ngũ chuyên gia",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Họ tên", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role", title: "Chức danh", type: "string" }),
    defineField({ name: "bio", title: "Giới thiệu ngắn", type: "text", rows: 3 }),
    defineField({ name: "photo", title: "Ảnh chân dung", type: "image", options: { hotspot: true } }),
    defineField({ name: "order", title: "Thứ tự hiển thị", type: "number" }),
  ],
  orderings: [{ title: "Thứ tự hiển thị", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "role", media: "photo" },
  },
});
