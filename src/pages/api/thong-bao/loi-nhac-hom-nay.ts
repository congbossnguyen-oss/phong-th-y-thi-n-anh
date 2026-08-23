import type { APIRoute } from "astro";
import { cannhacHomNay, ngayVietNam, noiDungThongBao, tieuDeThongBao, type KieuNhac } from "../../../lib/thong-bao/ngay-le-am-lich";
import { docBien } from "../../../lib/thong-bao/env";

export const prerender = false;

/**
 * Service worker gọi endpoint này khi nhận tín hiệu đẩy, để lấy lời nhắc đúng ngày.
 * Công khai (không cần đăng nhập) vì service worker chạy ngoài phiên đăng nhập, và nội dung
 * cũng không có gì riêng tư — chỉ là ngày âm lịch.
 */
export const GET: APIRoute = async () => {
  const kieu = (docBien("KIEU_NHAC_NGAY_LE") as KieuNhac) || "bao-truoc";
  const le = cannhacHomNay(ngayVietNam(), kieu);

  // Không phải ngày cần nhắc (ví dụ khách bấm thử, hoặc tín hiệu tới muộn sang hôm sau) — vẫn trả
  // một lời nhắn tử tế thay vì lỗi, để service worker không phải hiện thông báo trống.
  if (!le) {
    return new Response(
      JSON.stringify({
        tieuDe: "Phong Thủy Thiên Anh",
        noiDung: "Hôm nay chưa tới ngày Rằm hay mùng Một. Quân Sư sẽ nhắc quý bằng hữu đúng dịp.",
        tag: "nhac-ngay-le",
        url: "/quan-su",
      }),
      { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } },
    );
  }

  return new Response(
    JSON.stringify({
      tieuDe: tieuDeThongBao(le),
      noiDung: noiDungThongBao(le),
      // Gắn theo đúng ngày lễ để hai lần gửi cùng một dịp thì thay thế nhau, không chồng đống.
      tag: `ngay-le-${le.duong.nam}-${le.duong.thang}-${le.duong.ngay}`,
      url: "/quan-su",
    }),
    { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } },
  );
};
