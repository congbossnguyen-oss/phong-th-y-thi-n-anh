/**
 * HÌNH HỌC RADAR NGŨ GIÁC cho "Bản đồ 5 trục" — thuần toán, không vẽ. Web (SVG, trục y hướng
 * XUỐNG) và PDF (pdf-lib, trục y hướng LÊN) tự quy đổi từ đây, tránh 2 nơi tính lệch nhau.
 *
 * Quy ước: đỉnh đầu tiên (trục "Bổ khuyết ngũ hành") luôn ở ĐỈNH TRÊN CÙNG, các đỉnh sau đi
 * THEO CHIỀU KIM ĐỒNG HỒ khi nhìn trên màn hình/trang giấy — đúng cách đọc quen mắt.
 */
import type { TrucKetQua, MucTruc } from "./bat-tu-tang";

/** Khoảng cách từ tâm ra mỗi mức, tỉ lệ 0..1 — "chưa đủ dữ liệu" đặt Ở GIỮA (trung tính), KHÔNG
 *  phải gần tâm (dễ đọc nhầm thành "tệ nhất") và KHÔNG phải ngoài rìa (dễ đọc nhầm thành "tốt"). */
const TY_LE_THEO_MUC: Record<MucTruc, number> = {
  rat_thuan: 1,
  thuan: 0.75,
  can_dieu_chinh: 0.45,
  can_can_nhac: 0.2,
  khong_du_du_lieu: 0.5,
};

export interface DiemRadar {
  ten: string;
  ma: TrucKetQua["ma"];
  muc: MucTruc;
  /** Góc chuẩn toán học (radian) — 0 = phải, dương = ngược kim đồng hồ. Renderer tự quy đổi trục y. */
  goc: number;
  /** 0..1, khoảng cách từ tâm ra theo mức. */
  tyLe: number;
}

export function diemRadarTheoTruc(cacTruc: readonly TrucKetQua[]): DiemRadar[] {
  const n = cacTruc.length;
  return cacTruc.map((t, i) => ({
    ten: t.ten,
    ma: t.ma,
    muc: t.muc,
    // Đỉnh 0 ở góc 90° (đỉnh trên); mỗi đỉnh sau lùi thêm 360/n theo chiều kim đồng hồ → trừ dần.
    goc: (Math.PI / 2) - (2 * Math.PI * i) / n,
    tyLe: TY_LE_THEO_MUC[t.muc],
  }));
}

/** Toạ độ 1 điểm trên vòng tròn (dùng vẽ lưới nền + trục) tại tỉ lệ bán kính cho trước. */
export function diemVongTron(goc: number, tyLe: number): { dx: number; dy: number } {
  return { dx: Math.cos(goc) * tyLe, dy: Math.sin(goc) * tyLe };
}
