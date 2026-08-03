import type { APIRoute } from "astro";
import { services, products, posts } from "../../lib/placeholder-data";
import { getCourses } from "../../lib/cms/queries";

export const prerender = false;

type SearchResult = { title: string; description: string; url: string; type: string };

const staticPages: SearchResult[] = [
  { title: "Về Phong Thủy Thiên Anh", description: "Câu chuyện thương hiệu và giá trị cốt lõi.", url: "/gioi-thieu/ve-cong-ty", type: "Trang" },
  { title: "Chuyên gia Zhi Gong", description: "Hành trình nghiên cứu và kinh nghiệm tư vấn.", url: "/gioi-thieu/chuyen-gia-zhi-gong", type: "Trang" },
  { title: "Thuật ngữ phong thủy", description: "Giải thích Ngũ Hành, Bát Trạch, Huyền Không, Bát Tự, Trạch Nhật...", url: "/kien-thuc/thuat-ngu-phong-thuy", type: "Trang" },
  { title: "Tra cứu mệnh theo năm sinh", description: "Can Chi, con giáp và mệnh Ngũ Hành Nạp Âm.", url: "/tra-cuu-menh", type: "Công cụ" },
  { title: "Câu hỏi thường gặp", description: "Giải đáp thắc mắc thường gặp.", url: "/cau-hoi-thuong-gap", type: "Trang" },
  { title: "Liên hệ", description: "Đặt lịch tư vấn cùng Phong Thủy Thiên Anh.", url: "/lien-he", type: "Trang" },
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
