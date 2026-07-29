import { defineField, defineType } from "sanity";

export default defineType({
  name: "service",
  title: "Dịch vụ",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Tên dịch vụ", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Đường dẫn",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "summary", title: "Mô tả ngắn (hiển thị ở danh sách)", type: "text", rows: 2 }),
    defineField({ name: "description", title: "Nội dung chi tiết", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "priceFrom", title: "Giá tham khảo (vd: 3.000.000đ)", type: "string" }),
    defineField({ name: "coverImage", title: "Ảnh đại diện", type: "image", options: { hotspot: true } }),
    defineField({ name: "order", title: "Thứ tự hiển thị", type: "number" }),
  ],
  orderings: [{ title: "Thứ tự hiển thị", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "priceFrom", media: "coverImage" },
  },
});
