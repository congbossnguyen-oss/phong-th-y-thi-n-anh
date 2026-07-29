import type { StructureResolver } from "sanity/structure";

// Cấu hình lại sidebar: gộp siteSettings thành singleton (chỉ 1 bản ghi),
// nhóm các loại nội dung còn lại theo nhóm dễ hiểu cho người quản trị không rành kỹ thuật.
export const deskStructure: StructureResolver = (S) =>
  S.list()
    .title("Nội dung Thiên Anh")
    .items([
      S.listItem()
        .title("Cấu hình chung")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.divider(),
      S.listItem()
        .title("Dịch vụ & Đội ngũ")
        .child(
          S.list()
            .title("Dịch vụ & Đội ngũ")
            .items([S.documentTypeListItem("service").title("Dịch vụ"), S.documentTypeListItem("teamMember").title("Đội ngũ chuyên gia")])
        ),
      S.listItem()
        .title("Cửa hàng")
        .child(S.documentTypeList("product").title("Vật phẩm phong thủy")),
      S.listItem()
        .title("Khóa học")
        .child(
          S.list()
            .title("Khóa học")
            .items([S.documentTypeListItem("course").title("Khóa học"), S.documentTypeListItem("lesson").title("Bài học")])
        ),
      S.listItem()
        .title("Kiến thức")
        .child(S.documentTypeList("blogPost").title("Bài viết")),
      S.listItem()
        .title("Công trình & Đánh giá")
        .child(
          S.list()
            .title("Công trình & Đánh giá")
            .items([
              S.documentTypeListItem("portfolioItem").title("Công trình đã thực hiện"),
              S.documentTypeListItem("testimonial").title("Đánh giá khách hàng"),
            ])
        ),
    ]);
