// Hàng rào SEO: khoá lại quyết định "trang nào được Google index, trang nào giữ ẩn".
//
// Vì sao cần test này: `noIndex` là MỘT dòng trong lời gọi <BaseLayout>. Thêm hoặc xoá nhầm một
// dòng là đổi hẳn trạng thái hiển thị của trang trên Google — mà không có gì báo động, không gãy
// build, không sai kiểu. Ba trang A1 dưới đây từng bị mâu thuẫn đúng như vậy: sitemap khai chúng
// (mời Google vào) trong khi chính trang gắn noIndex (đuổi Google ra).
//
// Nguồn quyết định: chủ dự án duyệt ngày 08/09/2026 — A1 CHO PHÉP INDEX, hoc-vien và thanh-toan
// GIỮ ẨN. Đây là ý định của chủ dự án, không phải suy luận kỹ thuật; muốn đổi thì phải đổi ở đây
// một cách có ý thức.
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const GOC_TRANG = join(import.meta.dirname, "..", "src", "pages");

function docTrang(duongDan: string): string {
  return readFileSync(join(GOC_TRANG, duongDan), "utf-8");
}

/** Trang có tự chặn Google không — đọc thẳng thuộc tính truyền vào <BaseLayout>. */
function coNoIndex(duongDan: string): boolean {
  return /(^|\s)noIndex(\s|>|=|$)/m.test(docTrang(duongDan));
}

/** Ba trang A1: chủ dự án đã duyệt CHO PHÉP INDEX (08/09/2026). */
const A1_CHO_PHEP_INDEX = [
  "dai-cat-loi/hop-hon.astro",
  "dai-cat-loi/luan-giai-bat-tu-toan-dien.astro",
  "dai-cat-loi/luan-giai-tu-vi.astro",
];

/** Trang thanh toán: chủ dự án đã duyệt GIỮ ẨN (08/09/2026). */
const E_THANH_TOAN_GIU_AN = ["thanh-toan.astro"];

describe("A1 — ba trang được duyệt cho phép Google index", () => {
  for (const trang of A1_CHO_PHEP_INDEX) {
    it(`${trang} KHÔNG được có noIndex`, () => {
      expect(coNoIndex(trang)).toBe(false);
    });
  }

  it("không trang A1 nào tự gắn thẻ meta robots noindex bằng tay", () => {
    for (const trang of A1_CHO_PHEP_INDEX) {
      expect(docTrang(trang).toLowerCase()).not.toContain("noindex");
    }
  });
});

describe("E-hoc-vien — chủ dự án duyệt GIỮ ẨN, không được vô tình mở ra", () => {
  const trangHocVien = readdirSync(join(GOC_TRANG, "hoc-vien"), {
    recursive: true,
    encoding: "utf-8",
  }).filter((t) => t.endsWith(".astro"));

  it("thư mục hoc-vien vẫn còn trang để bảo vệ", () => {
    expect(trangHocVien.length).toBeGreaterThan(0);
  });

  for (const trang of trangHocVien) {
    it(`hoc-vien/${trang} vẫn giữ noIndex`, () => {
      expect(coNoIndex(join("hoc-vien", trang))).toBe(true);
    });
  }
});

describe("E-thanh-toan — chủ dự án duyệt GIỮ ẨN, không được vô tình mở ra", () => {
  for (const trang of E_THANH_TOAN_GIU_AN) {
    it(`${trang} vẫn giữ noIndex`, () => {
      expect(coNoIndex(trang)).toBe(true);
    });
  }
});

describe("bộ lọc sitemap không được đụng tới", () => {
  const config = readFileSync(join(import.meta.dirname, "..", "astro.config.mjs"), "utf-8");

  // Ba trang A1 phải Ở LẠI sitemap. Cách duy nhất chúng rơi ra là ai đó thêm một mục loại trừ
  // mới vào bộ lọc, nên khoá luôn danh sách loại trừ.
  it("chỉ loại trừ đúng 5 nhóm riêng tư/giao dịch đã thống nhất", () => {
    const loaiTru = [...config.matchAll(/!page\.includes\('([^']+)'\)/g)].map((m) => m[1]);
    expect(loaiTru).toEqual(["/hoc-vien", "/gio-hang", "/don-hang", "/thanh-toan", "/api/"]);
  });

  it("không nhóm loại trừ nào trùng vào đường dẫn của ba trang A1", () => {
    const loaiTru = [...config.matchAll(/!page\.includes\('([^']+)'\)/g)].map((m) => m[1]);
    const duongDanA1 = [
      "/dai-cat-loi/hop-hon/",
      "/dai-cat-loi/luan-giai-bat-tu-toan-dien/",
      "/dai-cat-loi/luan-giai-tu-vi/",
    ];
    for (const duongDan of duongDanA1) {
      for (const mau of loaiTru) {
        expect(duongDan.includes(mau)).toBe(false);
      }
    }
  });
});

describe("canonical vẫn do BaseLayout tự dựng, không trang nào tự ghi đè", () => {
  it("BaseLayout dựng canonical từ đường dẫn thật của trang", () => {
    const layout = readFileSync(
      join(import.meta.dirname, "..", "src", "layouts", "BaseLayout.astro"),
      "utf-8",
    );
    expect(layout).toContain("new URL(Astro.url.pathname");
    expect(layout).toContain('<link rel="canonical"');
  });

  it("không trang A1 nào tự khai canonical riêng", () => {
    for (const trang of A1_CHO_PHEP_INDEX) {
      expect(docTrang(trang)).not.toContain('rel="canonical"');
    }
  });
});
