// Phase 19 — bảng Ngũ Hành CANONICAL (quan-su/ngu-hanh.ts) + nguHanhTac dùng chung.
import { describe, it, expect } from "vitest";
import { NGU_HANH_SINH, NGU_HANH_KHAC } from "./ngu-hanh";
import { nguHanhTac } from "./advisory-engine";
import type { NguHanh } from "../menh-nap-am";

const ELS: NguHanh[] = ["Mộc", "Hỏa", "Thổ", "Kim", "Thủy"];

describe("Phase 19 — canonical ngũ hành", () => {
  it("vòng sinh + vòng khắc kinh điển đủ 5 hành", () => {
    expect(NGU_HANH_SINH).toEqual({ Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc" });
    expect(NGU_HANH_KHAC).toEqual({ Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" });
  });
  it("nguHanhTac khớp bảng canonical cho MỌI cặp (sinh/khắc/đồng hành)", () => {
    for (const a of ELS) for (const b of ELS) {
      const r = nguHanhTac(a, b);
      if (a === b) expect(r).toBe("ti-hoa");
      else if (NGU_HANH_SINH[a] === b) expect(r).toBe("a-sinh-b");
      else if (NGU_HANH_KHAC[a] === b) expect(r).toBe("a-khac-b");
      else if (NGU_HANH_SINH[b] === a) expect(r).toBe("b-sinh-a");
      else if (NGU_HANH_KHAC[b] === a) expect(r).toBe("b-khac-a");
    }
  });
  it("mỗi hành sinh đúng 1, khắc đúng 1, được sinh 1, bị khắc 1 (đồ hình đầy đủ)", () => {
    for (const x of ELS) {
      expect(ELS.filter((e) => NGU_HANH_SINH[e] === x)).toHaveLength(1); // 1 hành sinh ra x
      expect(ELS.filter((e) => NGU_HANH_KHAC[e] === x)).toHaveLength(1); // 1 hành khắc x
    }
  });
});
