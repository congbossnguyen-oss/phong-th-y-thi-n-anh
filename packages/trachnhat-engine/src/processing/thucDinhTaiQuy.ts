/**
 * MODULE VIP (đang thử nghiệm nội bộ) — Chọn Ngày Thúc Đinh · Tài · Quý (Nạp Giáp Tiên Thiên).
 * Đặc tả chủ dự án cung cấp 3/9/2026 (gói zip `module-thuc-dinh-tai-quy`), nguồn "Chính Ngũ Hành
 * Trạch Nhật Học" (Lại Cửu Đỉnh), Chương 10.
 *
 * Chỉ dùng làm LỚP XẾP HẠNG ƯU TIÊN BỔ SUNG sau khi ngày đã qua các bước lọc hung sát nền khác
 * của trachnhat-engine (Tam Sát/Xung Sơn/hung sát chính) — module này KHÔNG tự lọc hung sát,
 * chỉ đối chiếu can-chi ngày với "bộ mã" nạp giáp của quái sơn/quái đối ứng (SPEC.md mục 1).
 *
 * 2 trường `doTinCay` và `ghiChuApDungDuongTrach` BẮT BUỘC giữ nguyên ở output theo yêu cầu minh
 * bạch dữ liệu của README-CLAUDE-CODE.md mục 4 — không được bỏ khi build UI.
 */
import { Astronomy, getGanzhiDay, getLunarDate } from "@thien-anh/calendar-core";
import { ThucDinhTaiQuy } from "@thien-anh/rule-engine";

type Quai = ThucDinhTaiQuy.Quai;
type MucTieuThucDinhTaiQuy = ThucDinhTaiQuy.MucTieuThucDinhTaiQuy;
type PhanLoaiTai = ThucDinhTaiQuy.PhanLoaiTai;
type CanChiThucDinh = ThucDinhTaiQuy.CanChiThucDinh;

const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";
const SO_NGAY_QUET_TOI_DA = 400;

export type LoaiTrachThucDinh = "am" | "duong";

export interface ThucDinhTaiQuyInput {
  /** Độ số la kinh của TỌA (không phải hướng) — bắt buộc nếu không có `sonName`. */
  toaDoSo?: number;
  /** 1 trong 24 sơn — bắt buộc nếu không có `toaDoSo`. */
  sonName?: string;
  mucTieu: MucTieuThucDinhTaiQuy;
  khoangThoiGian?: {
    tuNgay: { nam: number; thang: number; ngay: number };
    denNgay: { nam: number; thang: number; ngay: number };
  };
  loaiTrach: LoaiTrachThucDinh;
  timeZone?: string;
}

export interface NgayPhuHopThucDinh {
  ngayDuongLich: { nam: number; thang: number; ngay: number };
  amLich: { ngay: number; thang: number; nam: number; nhuan: boolean };
  canChiNgay: string;
  /** Chỉ có khi nhánh là "tai" — Đinh/Quý không có khái niệm Chân/Giả (SPEC mục 3 Bước C). */
  phanLoaiTai?: PhanLoaiTai;
}

export interface KetQuaMotMucTieuThucDinh {
  mucTieuNhanh: "tai" | "dinh" | "quy";
  /** Quái THỰC SỰ dùng để tra bộ mã — với dinh/quy đây là quái đối ứng/tiên thiên, không phải quái sơn gốc. */
  quaiDungDeTra: Quai;
  boMa: readonly CanChiThucDinh[];
  ngayPhuHop: NgayPhuHopThucDinh[];
}

export interface ThucDinhTaiQuyResult {
  quaiSon: Quai;
  canhBaoBienGioi: boolean;
  doTinCay: "cong-thuc-da-kiem-chung";
  /** Chỉ xuất hiện khi `loaiTrach === "duong"` (SPEC mục 4) — KHÔNG được bỏ khi build UI. */
  ghiChuApDungDuongTrach?: string;
  nhanh: KetQuaMotMucTieuThucDinh[];
}

const GHI_CHU_DUONG_TRACH =
  "Suy diễn đúng phạm vi lý thuyết sách nêu (áp dụng cho sơn gia + dụng sự nói chung); sách KHÔNG có ví dụ thực tế cho dương trạch, chỉ có 3 ví dụ đều là an táng. Với âm trạch: đã có ví dụ thực tế đối chiếu.";

function jdnToNgay(jdn: number): { nam: number; thang: number; ngay: number } {
  const d = Astronomy.julianDayNumberToCalendarDate(jdn);
  return { nam: d.year, thang: d.month, ngay: d.day };
}

const CAC_NHANH: readonly ("tai" | "dinh" | "quy")[] = ["tai", "dinh", "quy"];

function tinhMotNhanh(
  quaiSon: Quai,
  mucTieuNhanh: "tai" | "dinh" | "quy",
  khoangThoiGian: ThucDinhTaiQuyInput["khoangThoiGian"],
  timeZone: string,
): KetQuaMotMucTieuThucDinh {
  const quaiDungDeTra = ThucDinhTaiQuy.quaiDungDeTraBoMa(quaiSon, mucTieuNhanh);
  const boMa = ThucDinhTaiQuy.boMaCuaQuai(quaiDungDeTra);

  const ngayPhuHop: NgayPhuHopThucDinh[] = [];
  if (khoangThoiGian) {
    const jdnTu = Astronomy.julianDayNumber(khoangThoiGian.tuNgay.nam, khoangThoiGian.tuNgay.thang, khoangThoiGian.tuNgay.ngay);
    const jdnDen = Astronomy.julianDayNumber(khoangThoiGian.denNgay.nam, khoangThoiGian.denNgay.thang, khoangThoiGian.denNgay.ngay);
    if (jdnDen < jdnTu) throw new Error("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.");
    const soNgay = Math.min(jdnDen - jdnTu + 1, SO_NGAY_QUET_TOI_DA);

    for (let i = 0; i < soNgay; i++) {
      const ngay = jdnToNgay(jdnTu + i);
      const canChiNgay = getGanzhiDay({ year: ngay.nam, month: ngay.thang, day: ngay.ngay, hour: 12, timeZone });
      const lunar = getLunarDate({ year: ngay.nam, month: ngay.thang, day: ngay.ngay, timeZone });

      if (mucTieuNhanh === "tai") {
        const phanLoai = ThucDinhTaiQuy.phanLoaiTai(canChiNgay.can, canChiNgay.chi, quaiDungDeTra);
        if (phanLoai === "voTai") continue;
        ngayPhuHop.push({
          ngayDuongLich: ngay,
          amLich: { ngay: lunar.day, thang: lunar.month, nam: lunar.year, nhuan: lunar.isLeapMonth },
          canChiNgay: `${canChiNgay.can} ${canChiNgay.chi}`,
          phanLoaiTai: phanLoai,
        });
      } else {
        if (!ThucDinhTaiQuy.khopDinhQuy(canChiNgay.can, canChiNgay.chi, boMa)) continue;
        ngayPhuHop.push({
          ngayDuongLich: ngay,
          amLich: { ngay: lunar.day, thang: lunar.month, nam: lunar.year, nhuan: lunar.isLeapMonth },
          canChiNgay: `${canChiNgay.can} ${canChiNgay.chi}`,
        });
      }
    }
  }

  return { mucTieuNhanh, quaiDungDeTra, boMa, ngayPhuHop };
}

export function tinhThucDinhTaiQuy(input: ThucDinhTaiQuyInput): ThucDinhTaiQuyResult {
  const timeZone = input.timeZone ?? DEFAULT_TIME_ZONE;

  if (input.toaDoSo === undefined && !input.sonName) {
    throw new Error("Cần nhập độ số la kinh (toaDoSo) hoặc tên sơn (sonName).");
  }

  let quaiSon: Quai;
  let canhBaoBienGioi = false;
  if (input.sonName) {
    quaiSon = ThucDinhTaiQuy.quaiTuTenSon(input.sonName);
  } else {
    const kq = ThucDinhTaiQuy.quaiTuDoSo(input.toaDoSo!);
    quaiSon = kq.quai;
    canhBaoBienGioi = kq.canhBaoBienGioi;
  }

  const nhanhCanTinh = input.mucTieu === "all" ? CAC_NHANH : [input.mucTieu];
  const nhanh = nhanhCanTinh.map((m) => tinhMotNhanh(quaiSon, m, input.khoangThoiGian, timeZone));

  return {
    quaiSon,
    canhBaoBienGioi,
    doTinCay: "cong-thuc-da-kiem-chung",
    ...(input.loaiTrach === "duong" ? { ghiChuApDungDuongTrach: GHI_CHU_DUONG_TRACH } : {}),
    nhanh,
  };
}
