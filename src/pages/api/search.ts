import type { APIRoute } from "astro";
import { services, products, posts } from "../../lib/placeholder-data";
import { getCourses } from "../../lib/cms/queries";
import { daiCatLoiTools } from "../../lib/dai-cat-loi-tools";

export const prerender = false;

type SearchResult = { title: string; description: string; url: string; type: string };

// Yêu cầu Công: icon kính lúp không tìm thấy các module trong mục "Công cụ" — trước đây chỉ có đúng 1 mục
// (Tra cứu mệnh) trong staticPages, thiếu toàn bộ 6 công cụ chính (menu Header/site-config.ts) và 17 công
// cụ con của "Đại Cát Lợi". Bổ sung đủ 6 công cụ chính ở đây; 17 công cụ con của Đại Cát Lợi lấy từ
// src/lib/dai-cat-loi-tools.ts (dùng chung với trang dai-cat-loi/index.astro, không khai báo trùng lặp).
const staticPages: SearchResult[] = [
  { title: "Về Phong Thủy Thiên Anh", description: "Câu chuyện thương hiệu và giá trị cốt lõi.", url: "/gioi-thieu/ve-cong-ty", type: "Trang" },
  { title: "Chuyên gia Zhi Gong", description: "Hành trình nghiên cứu và kinh nghiệm tư vấn.", url: "/gioi-thieu/chuyen-gia-zhi-gong", type: "Trang" },
  { title: "Thuật ngữ phong thủy", description: "Giải thích Ngũ Hành, Bát Trạch, Huyền Không, Bát Tự, Trạch Nhật...", url: "/kien-thuc/thuat-ngu-phong-thuy", type: "Trang" },
  { title: "Tra cứu mệnh theo năm sinh", description: "Can Chi, con giáp và mệnh Ngũ Hành Nạp Âm.", url: "/tra-cuu-menh", type: "Công cụ" },
  { title: "Đại Cát Lợi", description: "Bộ 17 công cụ Trạch Cát cá nhân hóa: chọn ngày giờ tốt, tuổi hợp, con số may mắn...", url: "/dai-cat-loi", type: "Công cụ" },
  { title: "Lập lá số Bát Tự", description: "Lập lá số Tứ Trụ (Bát Tự) theo ngày giờ sinh: Can Chi, Tàng Can, Thập Thần, Đại Vận, Lưu Niên.", url: "/lap-la-so-bat-tu", type: "Công cụ" },
  { title: "Lập quẻ Kinh Dịch", description: "Gieo quẻ và luận giải theo Nạp Giáp, Lục Thân, Lục Thú, Thế/Ứng, Tuần Không.", url: "/gieo-que-kinh-dich", type: "Công cụ" },
  { title: "Lập lá số Tử Vi", description: "Lập lá số Tử Vi Đẩu Số: 12 cung, 14 chính tinh, Tứ Hóa, Đại Vận, sao Lưu Niên.", url: "/lap-la-so-tu-vi", type: "Công cụ" },
  { title: "Xem ngày tốt xấu", description: "Xem cát hung của 1 ngày cụ thể theo Can Chi, thần sát và tuổi (nếu có).", url: "/xem-ngay-tot-xau", type: "Công cụ" },
  { title: "Tính Trùng Tang", description: "Tính Trùng Tang – Nhập Mộ – Thiên Di theo Chưởng pháp cổ truyền, danh sách tuổi cần tránh mặt.", url: "/tinh-trung-tang", type: "Công cụ" },
  { title: "Câu hỏi thường gặp", description: "Giải đáp thắc mắc thường gặp.", url: "/cau-hoi-thuong-gap", type: "Trang" },
  { title: "Liên hệ", description: "Đặt lịch tư vấn cùng Phong Thủy Thiên Anh.", url: "/lien-he", type: "Trang" },
  ...daiCatLoiTools.map((m) => ({ title: m.title, description: m.desc, url: m.href, type: "Công cụ" })),
];

// Chuẩn hóa để tìm kiếm không phân biệt dấu tiếng Việt (vd: "bat tu" vẫn khớp "Bát Tự").
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase();
}

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return new Response(JSON.stringify({ results: [] }), { status: 200 });
  }
  const nq = normalize(q);

  const pool: SearchResult[] = [
    ...staticPages,
    ...services.map((s) => ({ title: s.name, description: s.summary, url: `/dich-vu/${s.slug}`, type: "Dịch vụ" })),
    ...products.map((p) => ({ title: p.name, description: p.description, url: `/vat-pham/${p.slug}`, type: "Vật phẩm" })),
    ...posts.map((p) => ({ title: p.title, description: p.excerpt, url: `/kien-thuc/${p.categorySlug}/${p.slug}`, type: "Kiến thức" })),
  ];

  try {
    const courses = await getCourses();
    for (const c of courses) {
      pool.push({ title: c.name, description: c.summary, url: `/khoa-hoc/${c.slug}`, type: "Khóa học" });
    }
  } catch {
    // Sanity có thể chưa sẵn sàng lúc build/dev — bỏ qua, vẫn trả kết quả từ các nguồn khác.
  }

  const results = pool
    .filter((item) => normalize(item.title).includes(nq) || normalize(item.description).includes(nq))
    .slice(0, 8);

  return new Response(JSON.stringify({ results }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
