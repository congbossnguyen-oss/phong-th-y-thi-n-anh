import { defineField, defineType } from "sanity";

export default defineType({
  name: "course",
  title: "Khóa học",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Tên khóa học", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Đường dẫn",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Nhóm môn học",
      type: "string",
      options: {
        list: [
          { title: "Bát tự", value: "Bát tự" },
          { title: "Bát trạch", value: "Bát trạch" },
          { title: "Huyền không phi tinh", value: "Huyền không phi tinh" },
          { title: "Trạch nhật", value: "Trạch nhật" },
          { title: "Huyền không lục pháp", value: "Huyền không lục pháp" },
          { title: "Kỳ môn", value: "Kỳ môn" },
          { title: "Tử vi", value: "Tử vi" },
          { title: "Kinh dịch", value: "Kinh dịch" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "format",
      title: "Hình thức",
      type: "string",
      options: {
        list: [
          { title: "Học online (video trên web)", value: "online" },
          { title: "Offline / Zoom (đăng ký, học trực tiếp)", value: "offline" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "order",
      title: "Thứ tự trong nhóm (nhập môn → nâng cao)",
      type: "number",
      initialValue: 0,
    }),
    defineField({ name: "summary", title: "Mô tả ngắn", type: "text", rows: 2 }),
    defineField({ name: "description", title: "Nội dung chi tiết / bạn sẽ học được gì", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "price", title: "Học phí (VNĐ)", type: "number", validation: (r) => r.required().min(0) }),
    defineField({ name: "coverImage", title: "Ảnh/thumbnail khóa học", type: "image", options: { hotspot: true } }),
    // Với khóa online: danh sách bài học tham chiếu document `lesson`, sắp theo field `order` trong lesson.
    // Với khóa offline: có thể bỏ trống, chỉ dùng form đăng ký ở trang chi tiết.
  ],
  preview: {
    select: { title: "name", subtitle: "format", media: "coverImage" },
  },
});
