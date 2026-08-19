import { defineField, defineType } from "sanity";

export default defineType({
  name: "blogPost",
  title: "Bài viết kiến thức",
  type: "document",
  groups: [
    { name: "content", title: "Nội dung", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ name: "title", title: "Tiêu đề", type: "string", group: "content", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Đường dẫn",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Danh mục",
      type: "string",
      group: "content",
      options: {
        list: [
          { title: "Kiến thức ứng dụng", value: "kien-thuc-ung-dung" },
          { title: "Nhà ở", value: "nha-o" },
          { title: "Văn phòng / Kinh doanh", value: "van-phong-kinh-doanh" },
          { title: "Vật phẩm phong thủy", value: "vat-pham" },
        ],
      },
    }),
    defineField({
      name: "excerpt",
      title: "Mô tả ngắn (Meta description SEO + hiển thị ở danh sách)",
      type: "text",
      rows: 3,
      group: "content",
      validation: (r) => r.max(200),
    }),
    defineField({
      name: "coverImage",
      title: "Ảnh bìa",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Mô tả ảnh (alt — cho SEO)", type: "string" })],
    }),
    defineField({
      name: "body",
      title: "Nội dung bài viết",
      type: "array",
      group: "content",
      of: [{ type: "block" }, { type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "faq",
      title: "Câu hỏi thường gặp (FAQ)",
      type: "array",
      group: "content",
      of: [
        defineField({
          name: "faqItem",
          title: "Câu hỏi",
          type: "object",
          fields: [
            defineField({ name: "question", title: "Câu hỏi", type: "string" }),
            defineField({ name: "answer", title: "Trả lời", type: "text", rows: 3 }),
          ],
          preview: { select: { title: "question" } },
        }),
      ],
    }),
    defineField({
      name: "publishedAt",
      title: "Ngày đăng",
      type: "datetime",
      group: "content",
      initialValue: () => new Date().toISOString(),
    }),

    // ───────────────── SEO ─────────────────
    defineField({
      name: "seoTitle",
      title: "Tiêu đề SEO (thẻ <title>)",
      type: "string",
      group: "seo",
      description: "Để trống sẽ dùng Tiêu đề. Nên ~60 ký tự, từ khóa chính đứng đầu.",
    }),
    defineField({ name: "focusKeyword", title: "Từ khóa chính", type: "string", group: "seo" }),
    defineField({
      name: "tags",
      title: "Thẻ (tags)",
      type: "array",
      group: "seo",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "internalLinks",
      title: "Liên kết nội bộ (khối “Khám phá thêm”)",
      type: "array",
      group: "seo",
      of: [
        defineField({
          name: "internalLink",
          title: "Liên kết",
          type: "object",
          fields: [
            defineField({ name: "label", title: "Nhãn hiển thị", type: "string" }),
            defineField({ name: "href", title: "Đường dẫn (vd /dich-vu)", type: "string" }),
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        }),
      ],
    }),
  ],
  orderings: [{ title: "Mới nhất", name: "publishedDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: {
    select: { title: "title", subtitle: "category", media: "coverImage" },
  },
});
