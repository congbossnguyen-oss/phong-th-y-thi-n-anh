import { defineField, defineType } from "sanity";

export default defineType({
  name: "blogPost",
  title: "Bài viết kiến thức",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Tiêu đề", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Đường dẫn",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Danh mục",
      type: "string",
      options: {
        list: [
          { title: "Kiến thức ứng dụng", value: "kien-thuc-ung-dung" },
          { title: "Nhà ở", value: "nha-o" },
          { title: "Văn phòng / Kinh doanh", value: "van-phong-kinh-doanh" },
          { title: "Vật phẩm phong thủy", value: "vat-pham" },
        ],
      },
    }),
    defineField({ name: "excerpt", title: "Mô tả ngắn (SEO + danh sách)", type: "text", rows: 3, validation: (r) => r.max(200) }),
    defineField({ name: "coverImage", title: "Ảnh bìa", type: "image", options: { hotspot: true } }),
    defineField({ name: "body", title: "Nội dung bài viết", type: "array", of: [{ type: "block" }, { type: "image", options: { hotspot: true } }] }),
    defineField({ name: "publishedAt", title: "Ngày đăng", type: "datetime", initialValue: () => new Date().toISOString() }),
  ],
  orderings: [{ title: "Mới nhất", name: "publishedDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: {
    select: { title: "title", subtitle: "category", media: "coverImage" },
  },
});
