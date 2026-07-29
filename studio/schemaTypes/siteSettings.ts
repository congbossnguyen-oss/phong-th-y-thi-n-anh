import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Cấu hình chung",
  type: "document",
  // Singleton: chỉ tạo 1 document duy nhất, ẩn khỏi danh sách tạo mới trong deskStructure.ts
  fields: [
    defineField({ name: "hotline", title: "Số hotline", type: "string" }),
    defineField({ name: "email", title: "Email liên hệ", type: "string" }),
    defineField({ name: "address", title: "Địa chỉ", type: "string" }),
    defineField({ name: "workingHours", title: "Giờ làm việc", type: "string" }),
    defineField({ name: "businessRegistration", title: "Số đăng ký kinh doanh", type: "string" }),
    defineField({
      name: "social",
      title: "Mạng xã hội",
      type: "object",
      fields: [
        defineField({ name: "facebook", title: "Facebook URL", type: "url" }),
        defineField({ name: "youtube", title: "YouTube URL", type: "url" }),
        defineField({ name: "tiktok", title: "TikTok URL", type: "url" }),
        defineField({ name: "zalo", title: "Zalo (link chat)", type: "url" }),
      ],
    }),
    defineField({
      name: "bankTransfer",
      title: "Thông tin chuyển khoản (thanh toán thủ công)",
      type: "object",
      fields: [
        defineField({ name: "bankName", title: "Tên ngân hàng", type: "string" }),
        defineField({ name: "accountNumber", title: "Số tài khoản", type: "string" }),
        defineField({ name: "accountHolder", title: "Chủ tài khoản", type: "string" }),
        defineField({ name: "qrImage", title: "Ảnh mã QR chuyển khoản", type: "image" }),
      ],
    }),
  ],
});
