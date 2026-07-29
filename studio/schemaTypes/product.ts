import { defineField, defineType } from "sanity";

export default defineType({
  name: "product",
  title: "Vật phẩm phong thủy",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Tên sản phẩm", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Đường dẫn",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Danh mục",
      type: "string",
      options: {
        list: [
          { title: "Công Danh - Sự Nghiệp", value: "cong-danh-su-nghiep" },
          { title: "Hóa Sát - Trấn Trạch", value: "hoa-sat-tran-trach" },
          { title: "Hoá Giải Vận Hạn", value: "hoa-giai-van-han" },
          { title: "Chiêu Tài - Kích Lộc", value: "chieu-tai-kich-loc" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "price", title: "Giá bán (VNĐ)", type: "number", validation: (r) => r.required().positive() }),
    defineField({ name: "images", title: "Hình ảnh sản phẩm", type: "array", of: [{ type: "image", options: { hotspot: true } }] }),
    defineField({ name: "description", title: "Mô tả chi tiết / công dụng", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "inStock", title: "Còn hàng", type: "boolean", initialValue: true }),
    defineField({ name: "featured", title: "Sản phẩm nổi bật (hiển thị trang chủ)", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { title: "name", subtitle: "category", media: "images.0" },
  },
});
