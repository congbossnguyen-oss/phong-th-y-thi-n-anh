// HẬU KIỂM — chạy SAU khi AI trả lời, TRƯỚC khi hiển thị/lưu cho khách. Hai việc bắt buộc theo
// SPEC.md mục 0.8 và SPEC-ENGINE-DIEM.md mục 4:
//   1. Lọc an toàn nội dung: không được có từ ngữ hạn tử biệt/ngày chết/tự tử.
//   2. Đối chiếu điểm engine với chiều hướng câu "Kết luận nhanh" AI viết — lệch thì KHÔNG tự sửa
//      điểm, mà thay câu chữ bằng câu trung tính dựa trên chính điểm đó (không gọi lại AI để tránh
//      tốn thêm chi phí cho lỗi hiếm gặp).

import type { KetQuaCoBan, LuanCung } from "./aiCoBan";
import { TEN_CUNG_HIEN_THI, TEN_CUNG_SNAKE, type KhoaCungSnake } from "./aiCoBan";
import { nhanDiem } from "./chamDiem";
import type { DuLieuLaSoTuVi } from "./adapter";
import type { KetQuaNangCao, LuanHan, TongKet } from "./aiNangCao";

/** Từ khoá TUYỆT ĐỐI cấm — hạn tử biệt/ngày chết/tự tử. Có mặt bất kỳ đâu là phải lọc. */
const TU_KHOA_CAM = [
  "tử vong", "qua đời", "chết", "tự tử", "tự sát", "quyên sinh", "đoản mệnh", "yểu mệnh",
  "hạn tử", "vong mạng", "mất mạng", "ngày mất", "năm mất",
];

const TU_TOT = ["tốt", "cát", "thuận lợi", "may mắn", "vinh hiển", "phát", "thành công", "an lành", "vượng"];
const TU_XAU = ["xấu", "hung", "khó khăn", "bất lợi", "trắc trở", "vất vả", "hao", "tổn", "khó"];

export type CanhBaoHauKiem = {
  loai: "an_toan" | "lech_diem";
  viTri: string;
  chiTiet: string;
};

/** Quét toàn văn 1 chuỗi, trả về từ cấm tìm thấy (nếu có). */
function timTuCam(text: string): string | null {
  const lower = text.toLowerCase();
  for (const tu of TU_KHOA_CAM) {
    if (lower.includes(tu)) return tu;
  }
  return null;
}

/** Thay mọi câu chứa từ cấm bằng câu trung tính — không xoá cả field vì có thể cắt mất nội dung hợp lệ khác. */
function locAnToan(text: string, canhBao: CanhBaoHauKiem[], viTri: string): string {
  const tuCam = timTuCam(text);
  if (!tuCam) return text;
  canhBao.push({ loai: "an_toan", viTri, chiTiet: `Phát hiện từ khoá cấm "${tuCam}" — đã thay bằng câu trung tính.` });
  return "Giai đoạn này cần đặc biệt cẩn trọng — nên chủ động phòng ngừa và theo dõi sát tình hình thực tế.";
}

/** true nếu câu văn có xu hướng NGÔN TỪ ngược với điểm (điểm tốt mà câu chữ nói xấu, hoặc ngược lại). */
function xetLechChieu(ketLuanNhanh: string, diem: number): boolean {
  if (diem === 3) return false; // Cát Hung lẫn lộn — không bắt buộc kiểm chiều (SPEC-ENGINE-DIEM mục 4).
  const lower = ketLuanNhanh.toLowerCase();
  const coTot = TU_TOT.some((t) => lower.includes(t));
  const coXau = TU_XAU.some((t) => lower.includes(t));
  if (diem >= 4) return coXau && !coTot; // điểm Cát mà câu chữ thuần theo hướng Hung.
  return coTot && !coXau; // điểm ≤2 (Hung) mà câu chữ thuần theo hướng Cát.
}

function locCung(khoa: KhoaCungSnake, cung: LuanCung, diem: number, canhBao: CanhBaoHauKiem[]): LuanCung {
  const ten = TEN_CUNG_HIEN_THI[khoa];
  const out: LuanCung = {
    ketLuanNhanh: locAnToan(cung.ketLuanNhanh, canhBao, `cung ${ten} — kết luận nhanh`),
    phanTichCauTruc: locAnToan(cung.phanTichCauTruc, canhBao, `cung ${ten} — phân tích cấu trúc`),
    diemManh: locAnToan(cung.diemManh, canhBao, `cung ${ten} — điểm mạnh`),
    diemYeu: locAnToan(cung.diemYeu, canhBao, `cung ${ten} — điểm yếu`),
    nguyenNhan: locAnToan(cung.nguyenNhan, canhBao, `cung ${ten} — nguyên nhân`),
    khaNangUngNghiem: locAnToan(cung.khaNangUngNghiem, canhBao, `cung ${ten} — khả năng ứng nghiệm`),
    khuyenNghi: locAnToan(cung.khuyenNghi, canhBao, `cung ${ten} — khuyến nghị`),
  };

  if (xetLechChieu(out.ketLuanNhanh, diem)) {
    canhBao.push({
      loai: "lech_diem",
      viTri: `cung ${ten}`,
      chiTiet: `Câu "Kết luận nhanh" có vẻ ngược chiều điểm engine (${diem}/5) — đã thay bằng câu trung tính theo đúng điểm, GIỮ NGUYÊN điểm engine.`,
    });
    out.ketLuanNhanh = `${nhanDiem(diem)} (${diem}/5) — xem chi tiết phân tích bên dưới.`;
  }
  return out;
}

/** Hậu kiểm toàn bộ kết quả Cơ Bản. Trả kết quả đã lọc + danh sách cảnh báo (để log, không hiện cho khách). */
export function hauKiemCoBan(ketQua: KetQuaCoBan, duLieu: DuLieuLaSoTuVi): { ketQua: KetQuaCoBan; canhBao: CanhBaoHauKiem[] } {
  const canhBao: CanhBaoHauKiem[] = [];
  const diemTheoKhoa = new Map(duLieu.cung.map((c) => [c.ten, c.diem]));

  const luanThienBan = locAnToan(ketQua.luanThienBan, canhBao, "Luận Thiên Bàn");
  const chuDe = Object.fromEntries(
    Object.entries(ketQua.chuDe).map(([k, v]) => [k, locAnToan(v, canhBao, `chủ đề ${k}`)]),
  ) as KetQuaCoBan["chuDe"];

  const cung = Object.fromEntries(
    TEN_CUNG_SNAKE.map((k) => {
      const diem = diemTheoKhoa.get(TEN_CUNG_HIEN_THI[k]) ?? 3;
      return [k, locCung(k, ketQua.cung[k], diem, canhBao)];
    }),
  ) as KetQuaCoBan["cung"];

  return { ketQua: { luanThienBan, chuDe, cung }, canhBao };
}

/** Hậu kiểm chuỗi bất kỳ (dùng cho phần Nâng Cao — Đại Hạn/Tiểu Hạn/Tổng kết, chỉ cần lọc an toàn). */
export function locAnToanChuoi(text: string, canhBao: CanhBaoHauKiem[], viTri: string): string {
  return locAnToan(text, canhBao, viTri);
}

function locHan(han: LuanHan, viTri: string, canhBao: CanhBaoHauKiem[]): LuanHan {
  return {
    doanMoDau: locAnToan(han.doanMoDau, canhBao, `${viTri} — đoạn mở đầu`),
    quanTamNhieuNhat: locAnToan(han.quanTamNhieuNhat, canhBao, `${viTri} — quan tâm nhiều nhất`),
    suKienQuanTrong: {
      congViec: locAnToan(han.suKienQuanTrong.congViec, canhBao, `${viTri} — sự kiện công việc`),
      taiBach: locAnToan(han.suKienQuanTrong.taiBach, canhBao, `${viTri} — sự kiện tài bạch`),
      tinhCam: locAnToan(han.suKienQuanTrong.tinhCam, canhBao, `${viTri} — sự kiện tình cảm`),
      conCai: locAnToan(han.suKienQuanTrong.conCai, canhBao, `${viTri} — sự kiện con cái`),
      sucKhoe: locAnToan(han.suKienQuanTrong.sucKhoe, canhBao, `${viTri} — sự kiện sức khỏe`),
    },
    toXauSoVoiHanKhac: han.toXauSoVoiHanKhac ? locAnToan(han.toXauSoVoiHanKhac, canhBao, `${viTri} — so hạn khác`) : undefined,
    loiKhuyenNen: han.loiKhuyenNen.map((s, i) => locAnToan(s, canhBao, `${viTri} — nên làm #${i + 1}`)),
    loiKhuyenKhongNen: han.loiKhuyenKhongNen.map((s, i) => locAnToan(s, canhBao, `${viTri} — không nên #${i + 1}`)),
    chotLai: locAnToan(han.chotLai, canhBao, `${viTri} — chốt lại`),
  };
}

/** Hậu kiểm toàn bộ kết quả Nâng Cao — chỉ lọc an toàn (điểm-chữ không áp dụng, vì phần này không có badge điểm 1-1 như 12 cung). */
export function hauKiemNangCao(ketQua: KetQuaNangCao): { ketQua: KetQuaNangCao; canhBao: CanhBaoHauKiem[] } {
  const canhBao: CanhBaoHauKiem[] = [];
  const daiHan = locHan(ketQua.daiHan, "Đại Hạn", canhBao);
  const tieuHanNamNay = locHan(ketQua.tieuHanNamNay, "Tiểu Hạn năm nay", canhBao);
  const tieuHanNamSau = locHan(ketQua.tieuHanNamSau, "Tiểu Hạn năm sau", canhBao);
  const tk = ketQua.tongKet;
  const tongKet: TongKet = {
    diemManh: tk.diemManh.map((s, i) => locAnToan(s, canhBao, `Tổng kết — điểm mạnh #${i + 1}`)),
    diemYeu: tk.diemYeu.map((s, i) => locAnToan(s, canhBao, `Tổng kết — điểm yếu #${i + 1}`)),
    giaiDoanPhatTrienNhat: locAnToan(tk.giaiDoanPhatTrienNhat, canhBao, "Tổng kết — giai đoạn phát triển nhất"),
    giaiDoanCanCanTrong: locAnToan(tk.giaiDoanCanCanTrong, canhBao, "Tổng kết — giai đoạn cần cẩn trọng"),
    nganhNghePhuHop: locAnToan(tk.nganhNghePhuHop, canhBao, "Tổng kết — ngành nghề phù hợp"),
    dieuNenTranh: locAnToan(tk.dieuNenTranh, canhBao, "Tổng kết — điều nên tránh"),
    chienLuocDaiHan: locAnToan(tk.chienLuocDaiHan, canhBao, "Tổng kết — chiến lược dài hạn"),
  };
  return { ketQua: { daiHan, tieuHanNamNay, tieuHanNamSau, tongKet }, canhBao };
}
