/**
 * XEM NGÀY CAO CẤP — chế độ TÌM NGÀY (quét khoảng + xếp hạng).
 *
 * Bám đúng nhu cầu thực tế chủ dự án mô tả 2026-08-15: khách hay hỏi "trong năm này tháng nào
 * làm được", rồi "trong tháng đó ngày nào làm được", rồi mới tới "giờ nào trong ngày". Nên module
 * chia 2 tầng quét (tháng → ngày), còn tầng giờ đã có sẵn trong kết quả từng ngày (`gioDeXuat`).
 *
 * NGUYÊN TẮC CHẤM ĐIỂM (chủ dự án chốt): "cứ phù hợp yếu tố nào thì cộng yếu tố đó, càng nhiều
 * yếu tố tốt thì điểm càng cao". Vì vậy điểm là TỔNG CỘNG DỒN các yếu tố đạt, không phải công
 * thức bí ẩn — và mỗi kết quả đều kèm danh sách yếu tố đã đạt để người dùng tự kiểm chứng.
 *
 * ⚠️ Trọng số dưới đây KHÔNG phải số liệu từ sách cổ — sách chỉ cho thang định tính 4 mức (Lý
 * tưởng / Tốt / Được / Loại, xem `tang3-luat-hkdq.md` Phần II). Trọng số chỉ là cách quy 4 mức đó
 * thành số để sắp thứ tự. Điều kiện LOẠI thì bám đúng sách, không tự chế:
 *   - Phạm bất kỳ phương vị sát nào (Bước 3) → loại, không cứu (bài học Bài 4 trong nguồn).
 *   - Nhật Khóa không giao được Sơn Gia HOẶC Mệnh Chủ chính (Bước 5e) → loại.
 *   - Sách: "chỉ 1 trụ hoặc 0 trụ hỗ trợ ngày → tuyệt đối tránh".
 */
import { Astronomy } from "@thien-anh/calendar-core";
import { calculateXemNgayCaoCap, type LoaiViec, type XemNgayCaoCapInput, type XemNgayCaoCapResult } from "./xemNgayCaoCap.js";

/** Mức định tính theo sách (Phần II `tang3-luat-hkdq.md`). */
export type MucChatLuong = "ly_tuong" | "tot" | "duoc" | "khong_dung";

export interface YeuToDat {
  ten: string;
  diem: number;
}

export interface NgayXepHang {
  ngayDuongLich: { nam: number; thang: number; ngay: number };
  amLich: { ngay: number; thang: number; nam: number; nhuan: boolean };
  canChiNgay: string;
  diem: number;
  muc: MucChatLuong;
  yeuToDat: YeuToDat[];
  /** 3 giờ tốt nhất trong ngày (rút từ Bước 6). */
  gioTot: { chiGio: string; khungGio: string; tenSao: string }[];
  /** Kết quả đầy đủ để hiển thị chi tiết khi người dùng bấm vào 1 ngày. */
  chiTiet: XemNgayCaoCapResult;
}

export interface ThangXepHang {
  thangDuongLich: number;
  namDuongLich: number;
  soNgayDung: number;
  /** Ngày tốt nhất tìm được trong tháng (null nếu không có ngày nào dùng được). */
  ngayTotNhat: NgayXepHang | null;
  diemCaoNhat: number;
}

/**
 * Cộng điểm theo từng yếu tố đạt — minh bạch, không giấu công thức.
 *
 * ⚠️ Hợp Thập được TĂNG TRỌNG SỐ riêng khi `loaiViec === "nhap_trach"` — theo `tang3-luat-hkdq.md`
 * mục c: "Dùng cho: nhập trạch... → Đây là cách cục nên ưu tiên cho nhập trạch và các việc dài hạn,
 * dù về thứ hạng tổng thể Hợp Thập đứng sau Hà Đồ." Trước đây `loaiViec` chỉ đổi 1 câu cảnh báo chữ,
 * không ảnh hưởng chấm điểm — anh Công xác nhận cần sửa đúng phần này (28/8/2026), và KHÔNG thêm
 * Kim Lâu/Hoang Ốc vào module này (đó là trạch nhật dân gian, khác hệ Huyền Không Đại Quái).
 * Mức tăng: đưa Hợp Thập lên bằng Hà Đồ (15→20) khi là Nhập Trạch — không đưa nó vượt Nhất Quái
 * Thuần Thanh (30), vì tài liệu không nói Hợp Thập vượt qua mức đó ở bất kỳ mục đích nào.
 */
export function chamDiem(kq: XemNgayCaoCapResult, loaiViec: LoaiViec): { diem: number; yeuToDat: YeuToDat[] } {
  const y = kq.yeuTo;
  const ds: YeuToDat[] = [];
  const them = (ten: string, diem: number) => ds.push({ ten, diem });

  // --- Tam Tài giao (lõi của HKĐQ) ---
  const uuTienNhapTrach = loaiViec === "nhap_trach";
  const diemTheoMuc: Record<string, number> = {
    nhat_quai_thuan_thanh: 30, // đẹp nhất
    ha_do: 20,
    hop_thap: uuTienNhapTrach ? 20 : 15,
    hop_thap_7_3: 5, // miễn cưỡng (Khảm-Ly không hợp) — vẫn hạn chế dù mục đích là nhập trạch
    sinh_nhap: 10,
    khac_nhap: 10,
  };
  const hauToUuTien = (muc: string) => (uuTienNhapTrach && muc === "hop_thap" ? " — ưu tiên cho Nhập Trạch" : "");
  if (y.giaoSonGia) them(`Nhật Khóa giao Sơn Gia (${y.giaoSonGia})${hauToUuTien(y.giaoSonGia)}`, diemTheoMuc[y.giaoSonGia] ?? 8);
  if (y.giaoMenhChuChinh) them(`Nhật Khóa giao Mệnh Chủ (${y.giaoMenhChuChinh})${hauToUuTien(y.giaoMenhChuChinh)}`, diemTheoMuc[y.giaoMenhChuChinh] ?? 8);
  if (y.giaoMenhChuPhu) them("Giao thêm được Mệnh Chủ phụ (vợ/chồng)", 10);
  if (y.toaGiaoMenhChu) them("Tọa hợp với Mệnh Chủ", 8);

  // --- Số trụ hỗ trợ trụ Ngày (sách xếp hạng chính theo con số này) ---
  if (y.soTruHoTroNgay >= 2) them(`${y.soTruHoTroNgay} trụ hỗ trợ trụ Ngày`, 15);
  else if (y.soTruHoTroNgay === 1) them("1 trụ hỗ trợ trụ Ngày", 5);

  // --- Khung tháng theo Tọa (Bước 2, cả 2 phương pháp) ---
  if (y.nhomThang === "tu_hop") them("Tháng tự hợp theo mùa (nhất khí thuần thanh)", 10);
  else if (y.nhomThang === "sinh_hop") them("Tháng sinh hợp theo mùa", 6);
  else if (y.nhomThang === "tam_hop") them("Tháng tam hợp theo mùa", 4);
  if (y.thuocCucBoLong) them("Tháng thuộc cục Bổ Long", 5);

  // --- Địa chi & âm dương ---
  if (y.tamHopVoiToa) them("Địa chi Tứ Trụ hợp cục tam hợp với Tọa", 10);
  if (y.amDuongHaiHoa) them("Âm dương Tứ Trụ hài hòa", 5);
  if (y.haiCapHaDoKhacNhau) them("Có 2 cặp Hà Đồ khắc nhau (nguồn khuyến cáo tránh)", -10);

  return { diem: ds.reduce((s, x) => s + x.diem, 0), yeuToDat: ds };
}

/** Quy điểm về 4 mức định tính của sách. */
function xepMuc(diem: number, soTruHoTro: number): MucChatLuong {
  if (soTruHoTro <= 1) return "khong_dung"; // sách: 0-1 trụ hỗ trợ → tuyệt đối tránh
  if (diem >= 70) return "ly_tuong";
  if (diem >= 45) return "tot";
  return "duoc";
}

function jdnToNgay(jdn: number): { nam: number; thang: number; ngay: number } {
  const d = Astronomy.julianDayNumberToCalendarDate(jdn);
  return { nam: d.year, thang: d.month, ngay: d.day };
}

export interface TimNgayInput extends Omit<XemNgayCaoCapInput, "ngayGiamDinh"> {
  tuNgay: { nam: number; thang: number; ngay: number };
  denNgay: { nam: number; thang: number; ngay: number };
  /** Số ngày tối đa trả về (mặc định 10). */
  soKetQua?: number;
}

/** Giới hạn an toàn: quét tối đa 400 ngày/lần để tránh treo (đủ cho "cả năm"). */
const SO_NGAY_QUET_TOI_DA = 400;

/**
 * Quét mọi ngày trong khoảng, LOẠI ngày phạm sát hoặc không đạt Tam Tài giao, rồi xếp hạng phần
 * còn lại theo tổng điểm yếu tố đạt.
 */
export function timNgayXemNgayCaoCap(input: TimNgayInput): {
  tongSoNgayQuet: number;
  soNgayDung: number;
  ketQua: NgayXepHang[];
  /** Khi không tìm được ngày nào — lý do bị loại nhiều nhất, kèm số ngày dính. Trả rỗng nếu có kết quả. */
  lyDoLoaiPhoBien: { lyDo: string; soNgay: number }[];
} {
  const jdnTu = Astronomy.julianDayNumber(input.tuNgay.nam, input.tuNgay.thang, input.tuNgay.ngay);
  const jdnDen = Astronomy.julianDayNumber(input.denNgay.nam, input.denNgay.thang, input.denNgay.ngay);
  if (jdnDen < jdnTu) throw new Error("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.");
  const soNgay = Math.min(jdnDen - jdnTu + 1, SO_NGAY_QUET_TOI_DA);

  const dung: NgayXepHang[] = [];
  const demLyDo = new Map<string, number>();
  const ghiLyDo = (l: string) => demLyDo.set(l, (demLyDo.get(l) ?? 0) + 1);
  for (let i = 0; i < soNgay; i++) {
    const ngay = jdnToNgay(jdnTu + i);
    let kq: XemNgayCaoCapResult;
    try {
      kq = calculateXemNgayCaoCap({ ...input, ngayGiamDinh: ngay });
    } catch {
      continue; // ngày lỗi dữ liệu (vd ngoài phạm vi bảng) — bỏ qua, không đoán
    }
    if (kq.ketLuan === "khong_dung") {
      // Gom lý do để giải thích khi cả khoảng không có ngày nào dùng được.
      // CHỈ lấy Bước 3 (phương vị sát) và Bước 5 (cách cục) — đây là 2 bước duy nhất khiến ngày
      // bị loại. Bước 2 (khung tháng) chỉ ảnh hưởng xếp hạng, không loại ngày, nên nếu lấy "bước
      // hỏng đầu tiên" sẽ báo nhầm sang Bước 2 và làm người dùng hiểu sai nguyên nhân.
      const buocHong = kq.chieuTungBuoc.find((b) => b.trangThai === "khong_dat" && (b.buoc === 3 || b.buoc === 5));
      if (buocHong) ghiLyDo(`Bước ${buocHong.buoc} — ${buocHong.lyDo}`);
      continue;
    }

    const { diem, yeuToDat } = chamDiem(kq, input.loaiViec);
    const muc = xepMuc(diem, kq.yeuTo.soTruHoTroNgay);
    if (muc === "khong_dung") {
      ghiLyDo("Chỉ 0-1 trụ hỗ trợ trụ Ngày — sách xếp mức phải tránh tuyệt đối.");
      continue;
    }

    dung.push({
      ngayDuongLich: kq.ngayDuongLich,
      amLich: kq.amLich,
      canChiNgay: `${kq.tuTru.ngay.can} ${kq.tuTru.ngay.chi}`,
      diem,
      muc,
      yeuToDat,
      gioTot: kq.gioDeXuat.filter((g) => g.laHoangDao && !g.xungChiNgay && !g.phamTamSatGio).slice(0, 3)
        .map((g) => ({ chiGio: g.chiGio, khungGio: g.khungGio, tenSao: g.tenSao })),
      chiTiet: kq,
    });
  }

  dung.sort((a, b) => b.diem - a.diem);
  const lyDoLoaiPhoBien =
    dung.length > 0
      ? []
      : [...demLyDo.entries()]
          .map(([lyDo, soNgay]) => ({ lyDo, soNgay }))
          .sort((a, b) => b.soNgay - a.soNgay)
          .slice(0, 3);
  return {
    tongSoNgayQuet: soNgay,
    soNgayDung: dung.length,
    ketQua: dung.slice(0, input.soKetQua ?? 10),
    lyDoLoaiPhoBien,
  };
}

/**
 * Quét cả năm theo THÁNG DƯƠNG LỊCH — trả lời câu "trong năm này tháng nào làm được".
 * Mỗi tháng chỉ giữ ngày tốt nhất để người dùng thấy nhanh tháng nào khả thi.
 */
export function timThangTrongNam(
  input: Omit<XemNgayCaoCapInput, "ngayGiamDinh"> & { namDuongLich: number },
): ThangXepHang[] {
  const ketQua: ThangXepHang[] = [];
  for (let thang = 1; thang <= 12; thang++) {
    const soNgayTrongThang = new Date(Date.UTC(input.namDuongLich, thang, 0)).getUTCDate();
    const quet = timNgayXemNgayCaoCap({
      ...input,
      tuNgay: { nam: input.namDuongLich, thang, ngay: 1 },
      denNgay: { nam: input.namDuongLich, thang, ngay: soNgayTrongThang },
      soKetQua: 1,
    });
    ketQua.push({
      thangDuongLich: thang,
      namDuongLich: input.namDuongLich,
      soNgayDung: quet.soNgayDung,
      ngayTotNhat: quet.ketQua[0] ?? null,
      diemCaoNhat: quet.ketQua[0]?.diem ?? 0,
    });
  }
  return ketQua;
}
