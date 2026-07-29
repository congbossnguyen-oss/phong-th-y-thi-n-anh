import { defineField, defineType } from "sanity";

export default defineType({
  name: "testimonial",
  title: "Đánh giá khách hàng",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Tên khách hàng", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role", title: "Vai trò / Nơi ở", type: "string" }),
    defineField({ name: "quote", title: "Nội dung đánh giá", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "rating", title: "Số sao (1-5)", type: "number", validation: (r) => r.required().min(1).max(5), initialValue: 5 }),
    defineField({ name: "avatar", title: "Ảnh đại diện", type: "image" }),
    defineField({ name: "featured", title: "Hiển thị ở trang chủ", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { title: "name", subtitle: "role" },
  },
});
