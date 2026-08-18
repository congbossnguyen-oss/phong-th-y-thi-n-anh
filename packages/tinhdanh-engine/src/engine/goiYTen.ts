/**
 * Chức năng B — Gợi ý tên cho con (Bước 3-5 của SKILL Việt Danh Học).
 *
 * Luồng: từ ngày giờ sinh → Tứ Trụ → Hành Khuyết (tính ngầm) → lọc kho âm tiết hợp hành →
 * ghép Họ + Đệm + tên ứng viên → lập Tứ Đại Cục → chấm điểm → chỉ trả Top N.
 *
 * Nguyên tắc chốt: KHÔNG đổ toàn bộ kho (riêng Mộc ~1.000 âm tiết). Chấm điểm rồi cắt Top N.
 */
import { KHO_TEN_DEP, MA_SANG_HANH } from "../data/bangTra.js";
import { lapTuDaiCuc } from "./tuDaiCuc.js";
import { chonHanhKhuyet, lapTuTru, tinhDiemNguHanh, tyLeNguHanh } from "./tuTru.js";
import type { GoiYTenInput, GoiYTenResult, NguHanh, TenGoiY } from "../types.js";

/** Hành sinh RA hành khuyết (bổ hành này cũng là Điền Thực). Vd Mộc sinh Hỏa → bổ Hỏa dùng Mộc. */
const SINH_CHO: Readonly<Record<NguHanh, NguHanh>> = {
  Hỏa: "Mộc", Thổ: "Hỏa", Kim: "Thổ", Thủy: "Kim", Mộc: "Thủy",
};

/** Tập hành hợp lệ để bổ một Hành Khuyết: chính nó + hành sinh ra nó. */
function hanhHopChoKhuyet(khuyet: NguHanh): Set<NguHanh> {
  return new Set<NguHanh>([khuyet, SINH_CHO[khuyet]]);
}

/** cát = +1, hung = −1, bán cát bán hung / bình hoà = 0 (trung tính). */
function huong(catHung: string): number {
  if (catHung === "cat") return 1;
  if (catHung === "hung") return -1;
  return 0;
}

/** Điểm một tên ứng viên: ưu tiên Mệnh Cục (TC+ĐC) > Vận > Phúc Đức, cộng thưởng Điền Thực. */
function chamDiem(
  menhTc: string,
  menhDc: string,
  tien: string,
  hau: string,
  phuc: string,
  laDienThuc: boolean,
): number {
  let d = 0;
  d += huong(menhTc) * 40; // Mệnh Tĩnh Cục — gốc, nặng nhất
  d += huong(menhDc) * 30; // Mệnh Động Cục — ngọn
  d += huong(tien) * 12;
  d += huong(hau) * 12;
  d += huong(phuc) * 6;
  if (laDienThuc) d += 10;
  return d;
}

export function goiYTen(input: GoiYTenInput): GoiYTenResult {
  const canhBao: string[] = [];
  const dem = (input.dem ?? []).map((d) => d.trim()).filter(Boolean);
  const soLuong = input.soLuong ?? 15;

  // Bước 1-2: Tứ Trụ → Hành Khuyết.
  const { tuTru, coGio } = lapTuTru(input);
  if (!coGio) {
    canhBao.push(
      "Không có giờ sinh nên chỉ lập được 3 trụ — Hành Khuyết chỉ ở mức tương đối. Có giờ sinh sẽ chính xác hơn.",
    );
  }
  const diem = tinhDiemNguHanh(tuTru);
  const hanhKhuyetKhaDi = chonHanhKhuyet(diem);
  if (hanhKhuyetKhaDi.length > 1) {
    canhBao.push(
      "Tứ Trụ có nhiều hành gần bằng nhau nên đưa ra 2 phương án Hành Khuyết — chuyên gia sẽ chốt phương án phù hợp nhất với cả bát tự.",
    );
  }

  // Bước 3: lọc kho theo TẤT CẢ hành khuyết khả dĩ (chính hành + hành sinh cho nó).
  const hanhHop = new Set<NguHanh>();
  for (const hk of hanhKhuyetKhaDi) for (const h of hanhHopChoKhuyet(hk.hanh)) hanhHop.add(h);

  // Nguồn gợi ý là KHO TÊN ĐẸP (chủ dự án đã lọc tay) — lọc theo hành hợp + giới tính.
  const gioiVN = input.gioiTinh === "nam" ? "Nam" : "Nữ";
  const ungVien = KHO_TEN_DEP.filter((a) => {
    const hanh = MA_SANG_HANH[a.hanh];
    return hanh && hanhHop.has(hanh) && (a.gioiTinh === gioiVN || a.gioiTinh === "Unisex");
  });

  // Bước 4-5: ghép tên, lập cục, chấm điểm.
  const hanhChinh = hanhKhuyetKhaDi[0]?.hanh ?? "Mộc";
  const tapKhuyet = new Set(hanhKhuyetKhaDi.map((h) => h.hanh));
  const daCham: TenGoiY[] = ungVien.map((a) => {
    const hanh = MA_SANG_HANH[a.hanh];
    const { tuDaiCuc } = lapTuDaiCuc({
      ho: input.ho,
      dem,
      ten: a.ten,
      gioiTinh: input.gioiTinh,
      hanhKhuyet: hanhChinh,
    });
    const m = tuDaiCuc.menhCuc;
    // Điền Thực nếu âm tiết mang chính hành khuyết; hành sinh-cho cũng tính Điền Thực.
    const laDienThuc = tapKhuyet.has(hanh) || [...tapKhuyet].some((k) => SINH_CHO[k] === hanh);
    const d = chamDiem(
      m.tinhCuc.catHung,
      m.dongCuc.catHung,
      tuDaiCuc.tienVan.catHung,
      tuDaiCuc.hauVan.catHung,
      tuDaiCuc.phucDucCuc.catHung,
      laDienThuc,
    );
    return {
      hoTenDayDu: [input.ho, ...dem, a.ten].join(" "),
      ten: a.ten,
      hanh,
      yNghia: a.yNghia,
      soNet: a.soNet,
      menhCuc: m,
      diem: d,
      loaiTinhDanh: laDienThuc ? "Điền Thực" : "Bất Tương",
    };
  });

  // Khử tên trùng (một âm tiết có thể nằm ở hai hành hợp) — giữ bản điểm cao nhất.
  const theoTen = new Map<string, TenGoiY>();
  for (const t of daCham) {
    const cu = theoTen.get(t.ten);
    if (!cu || t.diem > cu.diem) theoTen.set(t.ten, t);
  }
  const duyNhat = [...theoTen.values()];

  // Xếp hạng: điểm giảm dần, ưu tiên Điền Thực khi bằng điểm.
  duyNhat.sort((a, b) => b.diem - a.diem || (a.loaiTinhDanh === "Điền Thực" ? -1 : 1));

  if (duyNhat.length === 0) {
    canhBao.push("Kho tên đẹp chưa có âm tiết hợp Hành Khuyết + giới tính — cần bổ sung kho.");
  }

  return {
    ho: input.ho,
    gioiTinh: input.gioiTinh,
    tuTru,
    diemNguHanh: diem,
    tyLeNguHanh: tyLeNguHanh(diem),
    hanhKhuyetKhaDi,
    danhSachTen: duyNhat.slice(0, soLuong),
    canhBaoThieuDuLieu: canhBao,
  };
}
