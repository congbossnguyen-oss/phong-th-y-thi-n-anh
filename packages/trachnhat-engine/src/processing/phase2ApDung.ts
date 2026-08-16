/**
 * PHASE 2 — FACADE NỐI TRỌN LUỒNG ① → ⑤ LÊN ĐẦU RA CỦA PHASE 1.
 *
 * Interface đúng đặc tả mục 7: nhận `list<PhuongAn>` mà Phase 1 đã đề xuất, trả
 * `list<PhuongAnDaXepHang>` kèm `ketCuc (A/B/C)`. KHÔNG tính lại ngày giờ từ đầu — Phase 2 chỉ
 * lọc bớt và xếp hạng lại.
 *
 * Bước ① viết như guard clause: kết cục C thì return sớm, khỏi tính ②-⑤ (mục 7).
 */
import { getCanChi } from "@thien-anh/calendar-core";
import { TrungTang } from "@thien-anh/rule-engine";
import type { UngVienNgayGioHaHuyet } from "./gioLiemHaHuyet.js";
import { kiemToaHuongTruocThanhToan } from "./phase2CongKiemToaHuong.js";

const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";

export interface Phase2Input {
  /** Độ số tọa huyệt đo bằng la kinh. */
  doSoToa: number;
  /** Danh sách phương án Phase 1 đã đề xuất — Phase 2 chỉ lọc và xếp hạng lại. */
  phuongAnPhase1: readonly UngVienNgayGioHaHuyet[];
  namMat: number;
  thangMat: number;
  ngayMat: number;
  nguyenNhanMat: TrungTang.NguyenNhanMat;
  soNgayDuKienToiChon?: number;
  /** Mục 2.5 — nguồn cho phép bỏ trụ Giờ nếu quá khó. Mặc định bật. */
  tinhTruGio?: boolean;
  /** Số phương án trả về sau khi đã lọc và xếp hạng. Mặc định 3, như Phase 1. */
  soPhuongAnTraVe?: number;
  timeZone?: string;
}

/** Mặc định trả 3 phương án, giữ nhất quán với Phase 1. */
export const SO_PHUONG_AN_TRA_VE_MAC_DINH = 3;

export interface PhuongAnBiLoai {
  id: string;
  lyDo: string[];
}

export type Phase2Output =
  /** Tọa độ chưa dùng được — mời đo lại, chưa tính gì cả. */
  | { ketCuc: "can-do-lai"; thongDiep: string }
  /** Kết cục C — dừng toàn bộ, không trả phương án, KHÔNG THU PHÍ. */
  | { ketCuc: "C"; thongDiep: string; duocPhepThuPhi: false }
  /** Miễn trừ theo phép quyền biến mục 2.4 — giữ nguyên đề xuất Phase 1, không lọc theo tọa. */
  | {
      ketCuc: "mien-tru";
      nhanh: string;
      giaiThich: string;
      phuongAn: readonly UngVienNgayGioHaHuyet[];
    }
  /** A hoặc B — có kết quả để trả. B nghĩa là đã phải loại bớt phương án ở cấp ngày/giờ. */
  | {
      ketCuc: "A" | "B";
      toaHuong: TrungTang.ToaHuongMo;
      /** Đã cắt top theo `soPhuongAnTraVe`. */
      phuongAn: TrungTang.PhuongAnDaXepHang[];
      /** Số phương án QUA được lọc, trước khi cắt top — luôn bằng (số vào − số bị loại). */
      soPhuongAnQuaLoc: number;
      biLoai: PhuongAnBiLoai[];
      cauKetLuan: string | null;
      canhBao: string[];
      thieuDuLieu: string[];
    };

/** Khoá hiển thị của một phương án — dùng làm id, và cũng là nhãn khách đọc được. */
function idPhuongAn(p: UngVienNgayGioHaHuyet): string {
  const { nam, thang, ngay } = p.ngayDuongLich;
  return `${String(ngay).padStart(2, "0")}/${String(thang).padStart(2, "0")}/${nam} giờ ${p.chiGio}`;
}

export function apDungPhase2(input: Phase2Input): Phase2Output {
  const timeZone = input.timeZone ?? DEFAULT_TIME_ZONE;
  const tinhTruGio = input.tinhTruGio ?? true;

  // --- Mục 2.4 — phép quyền biến chạy TRƯỚC mọi thứ ---
  const mienTru = TrungTang.kiemMienTruThuaHung(input.nguyenNhanMat, input.soNgayDuKienToiChon);
  if (mienTru.duocMienTru) {
    return {
      ketCuc: "mien-tru",
      nhanh: mienTru.nhanh!,
      giaiThich: mienTru.giaiThich!,
      phuongAn: input.phuongAnPhase1,
    };
  }

  // --- BƯỚC ① guard clause: kết cục C thì return sớm ---
  const cong = kiemToaHuongTruocThanhToan({
    doSoToa: input.doSoToa,
    namMat: input.namMat,
    thangMat: input.thangMat,
    ngayMat: input.ngayMat,
    timeZone,
  });
  if (cong.ketCuc === "can-do-lai") return { ketCuc: "can-do-lai", thongDiep: cong.thongDiep };
  if (cong.ketCuc === "C") return { ketCuc: "C", thongDiep: cong.thongDiep, duocPhepThuPhi: false };

  const { toaHuong } = cong;
  const thieuDuLieu = new Set(cong.thieuDuLieu);
  const biLoai: PhuongAnBiLoai[] = [];
  const deXepHang: TrungTang.PhuongAnDeXepHang[] = [];

  for (const pa of input.phuongAnPhase1) {
    const id = idPhuongAn(pa);
    const { nam, thang, ngay } = pa.ngayDuongLich;
    // Phase 1 chỉ mang Can Chi ngày và giờ; Can Chi năm/tháng tính lại tại đây theo đúng ngày của
    // từng phương án — không mượn Can Chi của ngày mất, vì cửa sổ quét có thể vắt qua Lập Xuân.
    const canChi = getCanChi({ year: nam, month: thang, day: ngay, hour: 12, timeZone });

    // --- BƯỚC ① phần cấp ngày / giờ / tháng: phạm là LOẠI, không phải trừ điểm ---
    const lyDoLoai: string[] = [];
    lyDoLoai.push(...TrungTang.kiemSatCapNgayGio(toaHuong, pa.canChiNgay, "ngày").lyDo);
    if (tinhTruGio) {
      lyDoLoai.push(...TrungTang.kiemSatCapNgayGio(toaHuong, { can: pa.canGio, chi: pa.chiGio }, "giờ").lyDo);
    }
    const nguHoangThang = TrungTang.kiemNguHoangThang(toaHuong, nam, canChi.month.can, canChi.month.chi);
    if (nguHoangThang.thieuDuLieu) thieuDuLieu.add(nguHoangThang.thieuDuLieu);
    if (nguHoangThang.loai && nguHoangThang.lyDo) lyDoLoai.push(nguHoangThang.lyDo);

    if (lyDoLoai.length > 0) {
      biLoai.push({ id, lyDo: lyDoLoai });
      continue;
    }

    // --- BƯỚC ② phẩm cấp cách cục ---
    const cachCuc = TrungTang.phanLopPhuongAn(
      {
        nam: { can: canChi.year.can, chi: canChi.year.chi },
        thang: { can: canChi.month.can, chi: canChi.month.chi },
        ngay: pa.canChiNgay,
        ...(tinhTruGio ? { gio: { can: pa.canGio, chi: pa.chiGio } } : {}),
      },
      toaHuong.doSoToa,
    );

    // --- BƯỚC ①, mục 2.5 — cổng vào Tứ Trụ: 0-1 trụ hỗ trợ là "tuyệt đối tránh" ---
    const soTruHoTro = TrungTang.demTruHoTro(cachCuc);
    if (soTruHoTro <= 1) {
      biLoai.push({ id, lyDo: [`Chỉ ${soTruHoTro} trụ hỗ trợ trụ Ngày (nguồn ghi "tuyệt đối tránh")`] });
      continue;
    }

    // --- BƯỚC ③ bảy chiều đo ---
    const cacChieu = TrungTang.danhGiaBayChieu({
      cachCuc,
      quanHeMenhVong: pa.ngayHopVoiVong ?? "trung-tinh",
    });

    deXepHang.push({
      id,
      cachCuc,
      cacChieu,
      canhBao: [
        ...TrungTang.canhBaoMem(cachCuc, false),
        ...(cachCuc.coTruHaiQue
          ? [`Có trụ mang 2 quẻ — đã chọn: ${cachCuc.queDaChon.map((q) => `${q.tru} ${q.que}`).join(", ")}`]
          : []),
      ],
    });
  }

  // --- BƯỚC ④ + ⑤ --- xếp hạng trên TOÀN rổ rồi mới cắt top, không cắt trước khi lọc.
  const phuongAn = TrungTang.xepHangPhuongAn(deXepHang).slice(
    0,
    input.soPhuongAnTraVe ?? SO_PHUONG_AN_TRA_VE_MAC_DINH,
  );

  return {
    ketCuc: biLoai.length > 0 ? "B" : "A",
    toaHuong,
    phuongAn,
    soPhuongAnQuaLoc: deXepHang.length,
    biLoai,
    cauKetLuan: TrungTang.cauKetLuanSoSanh(phuongAn),
    canhBao: cong.canhBao,
    thieuDuLieu: [...thieuDuLieu],
  };
}
