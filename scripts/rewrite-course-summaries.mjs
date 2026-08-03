// Thay mô tả tự sinh hàng loạt ("Khóa học X thuộc nhóm Y...") bằng mô tả riêng biệt cho từng
// khóa học — xử lý rủi ro Helpful Content nêu trong audit SEO (26 trang gần như giống hệt nhau).
// Dùng: node scripts/rewrite-course-summaries.mjs
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";

const envText = readFileSync(new URL("../.env", import.meta.url), "utf-8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const client = createClient({
  projectId: env.SANITY_PROJECT_ID,
  dataset: env.SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: env.SANITY_API_TOKEN,
  useCdn: false,
});

const summaries = {
  "bat-tu-nhap-mon":
    "Nắm vững nền tảng Can Chi, Ngũ Hành, cách lập lá số Tứ Trụ và đọc hiểu cấu trúc cơ bản của một lá số Bát Tự.",
  "bat-tu-trung-cap":
    "Đi sâu vào xác định vượng suy chính xác, tìm Dụng Thần và luận giải các cách cục Tài - Quan - Ấn thường gặp.",
  "bat-tu-chuyen-sau":
    "Luận giải nâng cao về Đại Vận, Lưu Niên, Thần Sát và các cách cục đặc biệt để dự đoán chính xác các mốc thời gian quan trọng trong đời.",

  "bat-trach-nhap-mon":
    "Tìm hiểu nguyên lý Đông Tứ Trạch - Tây Tứ Trạch, cách xác định mệnh quái và hướng nhà hợp mệnh gia chủ.",
  "bat-trach-trung-cap":
    "Ứng dụng Dương Trạch Tam Yếu (Cửa - Chủ - Bếp) để luận giải và bố trí nhà ở thực tế theo Bát Trạch.",
  "bat-trach-cao-cap":
    "Luận giải các trường hợp phức tạp: nhà nhiều tầng, chung cư, nhiều cửa, kết hợp Bát Trạch với các yếu tố loan đầu.",
  "bat-trach-chan-phap":
    "Truyền dạy những bí quyết ứng dụng thực chiến của Bát Trạch chân truyền, khác biệt với các tài liệu phổ biến trên thị trường.",

  "huyen-khong-phi-tinh-nhap-mon":
    "Làm quen với Tam Nguyên Cửu Vận, cách lập tinh bàn Sơn - Hướng - Vận cơ bản theo Lượng Thiên Xích.",
  "huyen-khong-phi-tinh-trung-cap":
    "Luận giải Vượng Sơn Vượng Hướng, Thượng Sơn Hạ Thủy và các cách cục cát hung theo từng cung trong tinh bàn.",
  "huyen-khong-phi-tinh-cao-cap":
    "Ứng dụng Thất Tinh Đả Kiếp, kích hoạt sao tốt - hóa giải sao xấu và luận giải các trường hợp nhà phức tạp.",

  "trach-nhat-co-ban":
    "Nắm vững nguyên tắc chọn ngày giờ tốt theo Chính Ngũ Hành: lọc Tứ Hại, xét Nhị Thập Bát Tú và 12 Trực Thần.",
  "trach-nhat-nang-cao":
    "Kết hợp trạch nhật với mệnh cục gia chủ và luận giải chuyên sâu cho các sự việc lớn: động thổ, cưới hỏi, khai trương, an táng.",

  "huyen-khong-luc-phap-co-ban":
    "Tìm hiểu hệ thống Lưỡng Nguyên Bát Vận và nguyên lý Nhất Tâm, Thư Hùng trong Huyền Không Lục Pháp.",
  "huyen-khong-luc-phap-trung-cap":
    "Thực hành quy trình Xem - Nhận - Lấy - Lập để định cục Thư Hùng và luận giải Kim Long động tĩnh.",
  "huyen-khong-luc-phap-nang-cao":
    "Ứng dụng Thành Môn Quyết, Tứ Quyết và luận giải các trường hợp thực chiến phức tạp theo Huyền Không Lục Pháp.",

  "ky-mon-nhap-mon":
    "Làm quen với cửu cung, Thiên Bàn - Địa Bàn và cách lập một lá bàn Kỳ Môn Độn Giáp cơ bản.",
  "ky-mon-phong-thuy":
    "Ứng dụng Kỳ Môn Độn Giáp vào luận giải phong thủy nhà ở, xác định phương vị cát hung trọng yếu.",
  "ky-mon-menh":
    "Luận giải Kỳ Môn Mệnh — tổng quan cuộc đời một người qua Tứ Trụ kết hợp lá bàn Kỳ Môn, từ tài vận đến hôn nhân, sức khỏe.",

  "tu-vi-nhap-mon":
    "An sao cho lá số Tử Vi và làm quen cách luận giải sơ bộ 12 cung theo vị trí các sao chính.",
  "tu-vi-trung-cap":
    "Luận giải chi tiết các cung Quan, Tài, Di, Phối theo cách cục và bộ sao phối hợp, bao gồm cả trường hợp Vô Chính Diệu.",
  "tu-vi-nang-cao":
    "Luận Đại Hạn, Tiểu Hạn, Lưu Niên và tổng luận trọn vẹn một lá số theo quy trình bài bản 8 bước.",

  "kinh-dich-co-ban":
    "Tìm hiểu 64 quẻ Kinh Dịch, cách gieo quẻ và ý nghĩa cơ bản của Bát Quái trong luận giải sự việc.",
  "kinh-dich-trung-cap":
    "Luận giải Lục Hào chuyên sâu: xác định Dụng Thần, Lục Thân, Lục Thần và phân tích sinh khắc trong quẻ.",
  "kinh-dich-nang-cao":
    "Luận giải các quẻ phức tạp, tìm nguyên nhân cốt lõi qua thủ tượng và đối chiếu nhiều lớp thông tin trong một quẻ.",
  "kinh-dich-phong-thuy":
    "Ứng dụng Kinh Dịch vào luận giải phong thủy nhà ở và công trình, kết hợp quẻ dịch với các yếu tố hình thế.",
  "kinh-dich-hoa-giai":
    "Học cách tìm phương pháp hóa giải phù hợp sau khi luận quẻ, từ điều chỉnh hành động đến vật phẩm hỗ trợ.",
};

const courses = await client.fetch(`*[_type == "course"]{_id, "slug": slug.current, name}`);

let updated = 0;
for (const course of courses) {
  const summary = summaries[course.slug];
  if (!summary) {
    console.log(`⚠ bỏ qua (không có mô tả mới): ${course.slug}`);
    continue;
  }
  await client.patch(course._id).set({ summary }).commit();
  console.log(`✓ ${course.name}`);
  updated++;
}

console.log(`\nXong! Đã cập nhật mô tả riêng cho ${updated}/${courses.length} khóa học.`);
