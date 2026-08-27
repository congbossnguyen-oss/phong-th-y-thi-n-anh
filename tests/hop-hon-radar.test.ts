import { describe, expect, it } from "vitest";
import { diemRadarTheoTruc, diemVongTron } from "../src/lib/hop-hon/radar";
import type { TrucKetQua } from "../src/lib/hop-hon/bat-tu-tang";

const TRUC_MAU: TrucKetQua[] = [
  { ma: "bo_khuyet", ten: "A", muc: "rat_thuan", tomTat: "", canCu: [] },
  { ma: "phu_the", ten: "B", muc: "thuan", tomTat: "", canCu: [] },
  { ma: "tinh_cach", ten: "C", muc: "can_dieu_chinh", tomTat: "", canCu: [] },
  { ma: "tu_vi", ten: "D", muc: "khong_du_du_lieu", tomTat: "", canCu: [] },
  { ma: "dai_van", ten: "E", muc: "can_can_nhac", tomTat: "", canCu: [] },
];

describe("diemRadarTheoTruc", () => {
  it("đỉnh đầu tiên ở đúng đỉnh trên cùng (góc 90°)", () => {
    const ds = diemRadarTheoTruc(TRUC_MAU);
    expect(ds[0].goc).toBeCloseTo(Math.PI / 2, 5);
  });

  it("5 đỉnh cách đều nhau đúng 72°, đi theo chiều kim đồng hồ (góc giảm dần)", () => {
    const ds = diemRadarTheoTruc(TRUC_MAU);
    for (let i = 1; i < ds.length; i++) {
      expect(ds[i - 1].goc - ds[i].goc).toBeCloseTo((2 * Math.PI) / 5, 5);
    }
  });

  it("rat_thuan ra rìa ngoài cùng (tyLe=1), can_can_nhac gần tâm nhất trong các mức có dữ liệu", () => {
    const ds = diemRadarTheoTruc(TRUC_MAU);
    expect(ds.find((d) => d.muc === "rat_thuan")!.tyLe).toBe(1);
    const coDuLieu = ds.filter((d) => d.muc !== "khong_du_du_lieu");
    const min = Math.min(...coDuLieu.map((d) => d.tyLe));
    expect(ds.find((d) => d.muc === "can_can_nhac")!.tyLe).toBe(min);
  });

  it("khong_du_du_lieu nằm Ở GIỮA (0.5) — không lẫn với mức xấu nhất lẫn tốt nhất", () => {
    const ds = diemRadarTheoTruc(TRUC_MAU);
    const na = ds.find((d) => d.muc === "khong_du_du_lieu")!.tyLe;
    expect(na).toBe(0.5);
    expect(na).toBeGreaterThan(ds.find((d) => d.muc === "can_can_nhac")!.tyLe);
    expect(na).toBeLessThan(ds.find((d) => d.muc === "rat_thuan")!.tyLe);
  });

  it("giữ đúng thứ tự + tên trục đầu vào", () => {
    const ds = diemRadarTheoTruc(TRUC_MAU);
    expect(ds.map((d) => d.ten)).toEqual(["A", "B", "C", "D", "E"]);
  });
});

describe("diemVongTron", () => {
  it("góc 0 → (1,0); góc 90° → (0,1) theo quy ước toán học", () => {
    expect(diemVongTron(0, 1).dx).toBeCloseTo(1, 5);
    expect(diemVongTron(0, 1).dy).toBeCloseTo(0, 5);
    expect(diemVongTron(Math.PI / 2, 1).dx).toBeCloseTo(0, 5);
    expect(diemVongTron(Math.PI / 2, 1).dy).toBeCloseTo(1, 5);
  });
});
