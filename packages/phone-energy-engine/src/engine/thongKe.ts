/**
 * Số liệu tổng hợp phục vụ biểu đồ — tính sẵn ở engine để tầng hiển thị không phải tự suy diễn.
 *
 * Đây là lớp TRÌNH BÀY, không phải luật nghiệp vụ: chỉ đếm và quy đổi những gì các bước trước đã
 * xác định. Không có quy tắc mới nào của Bát Cực Linh Số phát sinh ở đây.
 */
import type { CapDo, KetQuaCap, NguHanh, TenTinh, ThongKe } from "../types.js";

/** Cấp 1 mạnh nhất nên giá trị lớn nhất. Dùng cho biểu đồ sóng và biểu đồ cột. */
const GIA_TRI_THEO_CAP: Readonly<Record<CapDo, number>> = { 1: 100, 2: 75, 3: 50, 4: 30 };

const lamTron1 = (n: number) => Math.round(n * 10) / 10;

export function tinhThongKe(capGoc: KetQuaCap[]): ThongKe {
  const tong = capGoc.length;
  const soCapCat = capGoc.filter((c) => c.catHung === "cát").length;
  const soCapHung = tong - soCapCat;

  // --- Tỷ trọng theo từng Bát tinh ---
  const demTinh = new Map<TenTinh, { catHung: "cát" | "hung"; soLan: number }>();
  for (const c of capGoc) {
    const cu = demTinh.get(c.ten);
    if (cu) cu.soLan += 1;
    else demTinh.set(c.ten, { catHung: c.catHung, soLan: 1 });
  }
  const theoTinh = [...demTinh.entries()]
    .map(([ten, v]) => ({
      ten,
      catHung: v.catHung,
      soLan: v.soLan,
      tyLe: tong > 0 ? lamTron1((v.soLan / tong) * 100) : 0,
    }))
    .sort((a, b) => b.soLan - a.soLan);

  // --- Tỷ trọng ngũ hành, tính theo NGŨ HÀNH CỦA TỪNG CẶP BÁT TINH ---
  //
  // Lấy hành của tinh (Thiên Y Thổ, Sinh Khí Mộc, Diên Niên Kim...) chứ không lấy hành của từng chữ
  // số. Hai cách đều có căn cứ trong tài liệu, chọn cách theo tinh vì nó ăn khớp với biểu đồ tỷ
  // trọng năng lượng ngay bên cạnh — cùng một mẫu số là số cặp, nên hai biểu đồ đọc được cùng nhau.
  const demHanh = new Map<NguHanh, number>();
  for (const c of capGoc) {
    demHanh.set(c.nguHanhTinh, (demHanh.get(c.nguHanhTinh) ?? 0) + 1);
  }
  const theoNguHanh = (["Kim", "Mộc", "Thủy", "Hỏa", "Thổ"] as NguHanh[]).map((hanh) => {
    const soLan = demHanh.get(hanh) ?? 0;
    return { hanh, soLan, tyLe: tong > 0 ? lamTron1((soLan / tong) * 100) : 0 };
  });

  // Hành riêng của chữ số 0 và 5 (Thủy / Hỏa) cố ý KHÔNG vào biểu đồ này vì chúng không tạo cặp
  // nào; ảnh hưởng của chúng đã nằm ở phần hiệu ứng và ở các cảnh báo đếm số lượng.

  // --- Biểu đồ sóng: dương là cát, âm là hung, độ lớn theo cấp độ ---
  const song = capGoc.map((c) => ({
    cap: c.capGoc.cap,
    ten: c.ten,
    // Cặp hung đã được hoá giải thì kéo về mức nhẹ thay vì âm sâu — phản ánh đúng kết luận đã có.
    giaTri:
      c.catHung === "cát"
        ? GIA_TRI_THEO_CAP[c.capDo]
        : c.daHoaGiai
          ? Math.round(GIA_TRI_THEO_CAP[c.capDo] * 0.2)
          : -GIA_TRI_THEO_CAP[c.capDo],
  }));

  return {
    tongSoCap: tong,
    soCapCat,
    soCapHung,
    tyLeCat: tong > 0 ? lamTron1((soCapCat / tong) * 100) : 0,
    tyLeHung: tong > 0 ? lamTron1((soCapHung / tong) * 100) : 0,
    theoTinh,
    theoNguHanh,
    song,
  };
}
