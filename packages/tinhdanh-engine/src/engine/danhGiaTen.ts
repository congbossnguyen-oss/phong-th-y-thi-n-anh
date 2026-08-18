/**
 * Chức năng A — đánh giá DANH SÁCH tên khách tự chọn (tối đa 10), dựa trên Tứ Trụ của bé.
 *
 * Cùng bộ máy với gợi ý tên (Tứ Trụ → Hành Khuyết → Tứ Đại Cục), nhưng thay vì tự sinh tên thì
 * chấm điểm đúng những cái tên khách đưa vào, rồi xếp hạng cái nào hợp nhất.
 *
 * Giới hạn 10 tên/lượt (chủ dự án chốt 2026-08-18): gộp chung một lần phí VIP nhưng có mức trần.
 */
import { traHanhCuaTen } from "../data/bangTra.js";
import { lapTuDaiCuc } from "./tuDaiCuc.js";
import { chamDiem, huong, SINH_CHO } from "./goiYTen.js";
import { chonHanhKhuyet, lapTuTru, tinhDiemNguHanh, tyLeNguHanh } from "./tuTru.js";
import type { DanhGiaMotTen, DanhGiaTenResult, GioiTinh, NguHanh } from "../types.js";

export const GIOI_HAN_DANH_GIA = 10;

export interface DanhGiaTenInput {
  ho: string;
  gioiTinh: GioiTinh;
  nam: number;
  thang: number;
  ngay: number;
  gio?: number;
  phut?: number;
  /** Danh sách tên khách chọn — mỗi phần tử là "đệm tên" hoặc chỉ "tên" (họ lấy từ trường ho). */
  danhSach: string[];
}

/** Tách một chuỗi khách nhập thành đệm[] + tên. Từ cuối là tên, các từ trước là đệm. */
function tachTen(chuoi: string): { dem: string[]; ten: string } {
  const tu = chuoi.trim().split(/\s+/).filter(Boolean);
  if (tu.length === 0) return { dem: [], ten: "" };
  const ten = tu[tu.length - 1]!;
  return { dem: tu.slice(0, -1), ten };
}

export function danhGiaTen(input: DanhGiaTenInput): DanhGiaTenResult {
  const canhBao: string[] = [];

  const { tuTru, coGio } = lapTuTru(input);
  if (!coGio) {
    canhBao.push("Không có giờ sinh nên chỉ lập được 3 trụ — kết quả chỉ ở mức tương đối.");
  }
  const diem = tinhDiemNguHanh(tuTru);
  const hanhKhuyetKhaDi = chonHanhKhuyet(diem);
  const tapKhuyet = new Set(hanhKhuyetKhaDi.map((h) => h.hanh));
  const hanhChinh = hanhKhuyetKhaDi[0]?.hanh ?? "Mộc";

  const laDienThucCua = (hanh: NguHanh) =>
    tapKhuyet.has(hanh) || [...tapKhuyet].some((k) => SINH_CHO[k] === hanh);

  const dsSach = input.danhSach.map((s) => s.trim()).filter(Boolean).slice(0, GIOI_HAN_DANH_GIA);
  if (input.danhSach.length > GIOI_HAN_DANH_GIA) {
    canhBao.push(`Chỉ đánh giá tối đa ${GIOI_HAN_DANH_GIA} tên mỗi lượt — đã lấy ${GIOI_HAN_DANH_GIA} tên đầu.`);
  }

  const danhGia: DanhGiaMotTen[] = dsSach.map((chuoi) => {
    const { dem, ten } = tachTen(chuoi);
    const cb: string[] = [];
    const { tuDaiCuc } = lapTuDaiCuc({
      ho: input.ho,
      dem,
      ten,
      gioiTinh: input.gioiTinh,
      hanhKhuyet: hanhChinh,
    });
    const m = tuDaiCuc.menhCuc;

    // Hành của tên: tra kho. Xét cả đệm + tên xem có bổ hành khuyết không.
    const hanhTen = traHanhCuaTen(ten);
    const hanhDem = dem.flatMap((d) => traHanhCuaTen(d));
    const traDuoc = hanhTen.length > 0;
    if (!traDuoc) cb.push("Không tra được ngũ hành của tên trong kho — chỉ đánh giá theo số lý Tứ Đại Cục.");

    const hopHanhKhuyet = traDuoc
      ? [...hanhTen, ...hanhDem].some((h) => laDienThucCua(h))
      : null;
    const laDienThuc = hopHanhKhuyet === true;

    const d = chamDiem(
      m.tinhCuc.catHung,
      m.dongCuc.catHung,
      tuDaiCuc.tienVan.catHung,
      tuDaiCuc.hauVan.catHung,
      tuDaiCuc.phucDucCuc.catHung,
      laDienThuc,
    );

    // Nhận xét gộp: Mệnh Cục + hợp hành khuyết.
    const menhTot = huong(m.tinhCuc.catHung) + huong(m.dongCuc.catHung);
    const cauCuc =
      menhTot >= 2 ? "Mệnh Cục đẹp (cả gốc lẫn ngọn đều tốt)."
      : menhTot > 0 ? "Mệnh Cục khá — có mặt tốt, có mặt cần lưu ý."
      : menhTot === 0 ? "Mệnh Cục trung bình."
      : "Mệnh Cục yếu — nên cân nhắc.";
    const cauHanh =
      hopHanhKhuyet === true ? `Tên bổ đúng Hành Khuyết (${hanhChinh}) — hợp mệnh bé.`
      : hopHanhKhuyet === false ? `Tên KHÔNG bổ Hành Khuyết (${hanhKhuyetKhaDi.map((h) => h.hanh).join("/")}) mà bé đang thiếu.`
      : "Chưa xác định được tên có bổ Hành Khuyết hay không.";

    return {
      hoTenDayDu: [input.ho, ...dem, ten].join(" "),
      ten,
      dem,
      hanhTen,
      hopHanhKhuyet,
      loaiTinhDanh: hopHanhKhuyet === null ? "Chưa xác định" : laDienThuc ? "Điền Thực" : "Bất Tương",
      menhCuc: m,
      tienVan: tuDaiCuc.tienVan,
      hauVan: tuDaiCuc.hauVan,
      phucDucCuc: tuDaiCuc.phucDucCuc,
      tuTucCuc: tuDaiCuc.tuTucCuc,
      diem: d,
      xepHang: 0,
      nhanXet: `${cauCuc} ${cauHanh}`,
      canhBao: cb,
    };
  });

  danhGia.sort((a, b) => b.diem - a.diem);
  danhGia.forEach((x, i) => (x.xepHang = i + 1));

  return {
    ho: input.ho,
    gioiTinh: input.gioiTinh,
    tuTru,
    diemNguHanh: diem,
    tyLeNguHanh: tyLeNguHanh(diem),
    hanhKhuyetKhaDi,
    danhGia,
    canhBaoThieuDuLieu: canhBao,
  };
}
