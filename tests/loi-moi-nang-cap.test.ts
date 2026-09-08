// Hàng rào cho LỜI MỜI NÂNG CẤP (component GoiYNangCap): không được mời khách mua bằng một slug
// đã nghỉ bán.
//
// Vì sao cần: `GoiYNangCap` suy ra HAI thứ từ cùng một `slug` — giá hiển thị (tra `GIA_CONG_CU`)
// và đường dẫn (qua `TRANG_KHAC_SLUG`). Khi gộp gói ngày 01/09/2026, các slug bậc cũ được GIỮ LẠI
// trong bảng giá để đọc đơn cũ, nên truyền nhầm slug cũ vào lời mời vẫn chạy, vẫn ra link đúng,
// chỉ có GIÁ là của sản phẩm đã ngừng bán. Không có gì đỏ, không có 404 — lỗi đi thẳng ra mặt
// khách. Trang `/kiem-chung-van-menh` đã sống với lỗi đó suốt từ 01/09 tới 08/09/2026 vì lúc gộp
// gói nó bị bỏ sót, trong khi `/lap-la-so-bat-tu` thì được sửa.
//
// Bài kiểm thử này KHÔNG đòi xoá slug cũ. Slug cũ PHẢI còn trong bảng giá và trong logic đọc đơn
// (orders.ts, email/send.ts, grandfather) — có bài riêng bên dưới khoá lại đúng điều đó.
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { GIA_CONG_CU, type ToolSlug } from "../src/lib/payments/gia-cong-cu";

const GOC_TRANG = join(import.meta.dirname, "..", "src", "pages");

/**
 * Slug các bậc CŨ, đã gộp vào gói duy nhất ngày 01/09/2026. Vẫn tồn tại trong hệ thống để đọc đơn
 * cũ, nhưng KHÔNG được dùng để mời khách mua nữa.
 */
const SLUG_DA_NGHI_BAN: ToolSlug[] = [
  "luan-giai-bat-tu-co-ban",
  "luan-giai-bat-tu-nang-cao",
  "luan-giai-tu-vi-co-ban",
  "luan-giai-tu-vi-nang-cao",
];

/** Duyệt mọi tệp .astro dưới src/pages. */
function moiTrang(): string[] {
  return readdirSync(GOC_TRANG, { recursive: true, encoding: "utf-8" }).filter((t) =>
    t.endsWith(".astro"),
  );
}

/** Các slug được truyền vào <GoiYNangCap> trong một tệp — hỗ trợ cả dạng 1 dòng lẫn nhiều dòng. */
function slugTrongLoiMoi(noiDung: string): string[] {
  const ra: string[] = [];
  for (const khoi of noiDung.matchAll(/<GoiYNangCap\b[\s\S]*?\/>/g)) {
    for (const m of khoi[0].matchAll(/\bslug="([^"]+)"/g)) ra.push(m[1]);
  }
  return ra;
}

describe("lời mời nâng cấp không được dùng slug đã nghỉ bán", () => {
  const trangCoLoiMoi = moiTrang().filter((t) =>
    readFileSync(join(GOC_TRANG, t), "utf-8").includes("<GoiYNangCap"),
  );

  it("có tìm thấy lời mời nâng cấp để kiểm — nếu 0 thì regex đã hỏng, không phải web sạch", () => {
    expect(trangCoLoiMoi.length).toBeGreaterThan(0);
  });

  for (const trang of trangCoLoiMoi) {
    it(`${trang.replace(/\\/g, "/")} chỉ mời bằng slug còn bán`, () => {
      const slugs = slugTrongLoiMoi(readFileSync(join(GOC_TRANG, trang), "utf-8"));
      expect(slugs.length).toBeGreaterThan(0);
      for (const s of slugs) {
        expect(SLUG_DA_NGHI_BAN, `${trang} đang mời bằng slug đã nghỉ bán "${s}"`).not.toContain(s);
      }
    });
  }

  // Trường hợp cụ thể đã gây ra lỗi — khoá riêng để nếu ai đó đổi lại thì báo đúng chỗ.
  it("/kiem-chung-van-menh mời đúng gói Bát Tự Toàn Diện", () => {
    const noiDung = readFileSync(join(GOC_TRANG, "kiem-chung-van-menh.astro"), "utf-8");
    expect(slugTrongLoiMoi(noiDung)).toEqual(["luan-giai-bat-tu-toan-dien"]);
  });

  it("giá mời ở /kiem-chung-van-menh khớp giá thật của trang đích", () => {
    const noiDung = readFileSync(join(GOC_TRANG, "kiem-chung-van-menh.astro"), "utf-8");
    const [slug] = slugTrongLoiMoi(noiDung);
    expect(GIA_CONG_CU[slug as ToolSlug]).toBe(GIA_CONG_CU["luan-giai-bat-tu-toan-dien"]);
  });
});

describe("slug cũ vẫn phải còn — đơn hàng cũ trong CSDL tham chiếu tới chúng", () => {
  for (const slug of SLUG_DA_NGHI_BAN) {
    it(`bảng giá vẫn còn "${slug}" để đọc lại đơn cũ`, () => {
      expect(GIA_CONG_CU[slug]).toBeGreaterThan(0);
    });
  }

  it("gói mới vẫn là 1 gói duy nhất và đắt hơn bậc Cơ Bản cũ", () => {
    expect(GIA_CONG_CU["luan-giai-bat-tu-toan-dien"]).toBeGreaterThan(
      GIA_CONG_CU["luan-giai-bat-tu-co-ban"],
    );
  });
});
