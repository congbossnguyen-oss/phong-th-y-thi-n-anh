// La Kinh — ghép 4 vòng ĐÃ CÓ engine riêng quanh 1 độ số la kinh duy nhất. KHÔNG tính lại gì,
// chỉ gọi lại 4 engine đã build/test sẵn (đúng nguyên tắc "không viết lại lần 2" đã áp dụng khi
// gộp bảng 64 quẻ — xem huyen-khong-dai-quai/engine.ts):
//   - Bát Trạch (8 cung/45°): @thien-anh/rule-engine BatTrachNha.doToCung + CungMenhBatTrach.
//     Cát/Hung CHỈ tính khi có năm sinh + giới tính gia chủ (không suy đoán mệnh cung).
//   - Tam Hợp Phái (8 phương/45°, cùng vị trí vật lý với Bát Trạch): tam-hop-phai/engine.
//     Không cần mệnh gia chủ — chỉ cần độ Hướng.
//   - Huyền Không Phi Tinh (24 sơn/15°): huyen-khong-phi-tinh/engine timSon.
//   - Huyền Không Đại Quái (64 quẻ/5.625°): huyen-khong-dai-quai/engine. Chính/Linh Thần dùng
//     Vận theo năm luận (mặc định năm hiện tại) — không suy đoán nếu năm ngoài bảng Vận.
import { BatTrachNha, CungMenhBatTrach } from "@thien-anh/rule-engine";
import {
  kiemTraAmDuongSaiThac,
  kiemTraKhongVong,
  timQueTheoDoSo,
  vanHienHanhTheoNam,
  vungKhiCuaQuaiKhi,
  type AmDuongSaiThacResult,
  type KhongVongResult,
  type QueEntry,
  type VungKhi,
} from "../huyen-khong-dai-quai/engine";
import { timSon } from "../huyen-khong-phi-tinh/engine";
import { phanTich, QUAI_DISPLAY, QUAI_ORDER, type PhuongCatHung, type QuaiKey } from "../tam-hop-phai/engine";

const TEN_SANG_QUAI_KEY: Record<string, QuaiKey> = Object.fromEntries(QUAI_ORDER.map((k) => [QUAI_DISPLAY[k], k]));

interface Wedge {
  startDeg: number;
  centerDeg: number;
  endDeg: number;
}

export interface WedgeBatTrach extends Wedge {
  cung: CungMenhBatTrach.CungBatTrach;
  /** null nếu chưa có mệnh cung gia chủ (không suy đoán) */
  khi: CungMenhBatTrach.KhiBatTrach | null;
}

export interface WedgeTamHop extends Wedge {
  quai: CungMenhBatTrach.CungBatTrach;
  thuy: PhuongCatHung;
  sa: PhuongCatHung;
}

export interface WedgePhiTinh extends Wedge {
  son: string;
}

export interface WedgeDaiQuai extends Wedge {
  que: QueEntry;
  /** null nếu namLuan ngoài bảng Vận (1864-2043) — không suy đoán */
  vungKhi: VungKhi | null;
}

/** Kết quả tại ĐÚNG độ Hướng nhập vào (không lượng tử hóa theo tâm wedge — dùng cho phần chữ). */
export interface DiemHuong {
  batTrach: { cung: CungMenhBatTrach.CungBatTrach; khi: CungMenhBatTrach.KhiBatTrach | null };
  tamHop: { quai: CungMenhBatTrach.CungBatTrach; thuy: PhuongCatHung; sa: PhuongCatHung };
  phiTinh: { son: string };
  daiQuai: { que: QueEntry; vungKhi: VungKhi | null; khongVong: KhongVongResult; amDuongSaiThac: AmDuongSaiThacResult };
}

export interface KetQuaLaKinh {
  huongDoSo: number;
  namLuan: number;
  vanHienHanh: number | null;
  diemHuong: DiemHuong;
  vongBatTrach: WedgeBatTrach[];
  vongTamHop: WedgeTamHop[];
  vongPhiTinh: WedgePhiTinh[];
  vongDaiQuai: WedgeDaiQuai[];
}

export interface ThamSoLaKinh {
  namSinhGiaChu?: number | null;
  gioiTinh?: CungMenhBatTrach.GioiTinh | null;
  namLuan?: number | null;
}

/**
 * N wedge đều nhau, TÂM tại 0°/w/2w... (quy ước Bát Trạch/Phi Tinh/Tam Hợp — khớp `doToCung`:
 * Khảm tâm 0° trải [-w/2, w/2)). Đại Quái KHÔNG dùng hàm này vì quy ước khác — xem vongDaiQuai.
 */
function wedgeTamO0(soWedge: number): Wedge[] {
  const w = 360 / soWedge;
  return Array.from({ length: soWedge }, (_, i) => {
    const centerDeg = i * w;
    return { startDeg: centerDeg - w / 2, centerDeg, endDeg: centerDeg + w / 2 };
  });
}

export function tinhLaKinh(huongDoSo: number, thamSo: ThamSoLaKinh = {}): KetQuaLaKinh {
  const cungMenh =
    thamSo.namSinhGiaChu != null && thamSo.gioiTinh
      ? CungMenhBatTrach.calculateCungPhi(thamSo.namSinhGiaChu, thamSo.gioiTinh)
      : null;

  const vongBatTrach: WedgeBatTrach[] = wedgeTamO0(8).map((w) => {
    const cung = BatTrachNha.doToCung(w.centerDeg);
    return { ...w, cung, khi: cungMenh ? CungMenhBatTrach.DU_NIEN_BAT_QUAI[cungMenh][cung] : null };
  });

  const tamHopKq = phanTich(huongDoSo);
  const vongTamHop: WedgeTamHop[] = wedgeTamO0(8).map((w) => {
    const quai = BatTrachNha.doToCung(w.centerDeg);
    const quaiKey = TEN_SANG_QUAI_KEY[quai]!;
    return { ...w, quai, thuy: tamHopKq.thuy_phap_8_phuong[quaiKey], sa: tamHopKq.sa_phap_8_phuong[quaiKey] };
  });

  const vongPhiTinh: WedgePhiTinh[] = wedgeTamO0(24).map((w) => ({ ...w, son: timSon(w.centerDeg).son }));

  const namLuan = thamSo.namLuan ?? new Date().getFullYear();
  let vanHienHanh: number | null = null;
  try {
    vanHienHanh = vanHienHanhTheoNam(namLuan).van;
  } catch {
    vanHienHanh = null; // ngoài bảng Vận (1864-2043) — không suy đoán, chỉ bỏ Chính/Linh Thần
  }

  // Quy ước KHÁC 3 vòng trên: quẻ i trải [i*5.625, (i+1)*5.625) — bắt đầu TẠI mốc, không phải
  // tâm tại mốc (VD Phục = [0, 5.625), không phải [-2.8125, 2.8125)). Dùng doBatDau/doKetThuc
  // thật của từng quẻ (từ timQueTheoDoSo) thay vì tự suy — tránh lệch nửa wedge như Bát Trạch/
  // Phi Tinh/Tam Hợp ở trên.
  const vongDaiQuai: WedgeDaiQuai[] = Array.from({ length: 64 }, (_, i) => {
    const que = timQueTheoDoSo(i * 5.625 + 5.625 / 2); // giữa quẻ i — tránh sát biên float
    return {
      startDeg: que.doBatDau,
      centerDeg: (que.doBatDau + que.doKetThuc) / 2,
      endDeg: que.doKetThuc,
      que,
      vungKhi: vanHienHanh != null ? vungKhiCuaQuaiKhi(que.quaiKhi, vanHienHanh) : null,
    };
  });

  const cungHuong = BatTrachNha.doToCung(huongDoSo);
  const queHuong = timQueTheoDoSo(huongDoSo);
  const diemHuong: DiemHuong = {
    batTrach: { cung: cungHuong, khi: cungMenh ? CungMenhBatTrach.DU_NIEN_BAT_QUAI[cungMenh][cungHuong] : null },
    tamHop: {
      quai: cungHuong,
      thuy: tamHopKq.thuy_phap_8_phuong[TEN_SANG_QUAI_KEY[cungHuong]!],
      sa: tamHopKq.sa_phap_8_phuong[TEN_SANG_QUAI_KEY[cungHuong]!],
    },
    phiTinh: { son: timSon(huongDoSo).son },
    daiQuai: {
      que: queHuong,
      vungKhi: vanHienHanh != null ? vungKhiCuaQuaiKhi(queHuong.quaiKhi, vanHienHanh) : null,
      khongVong: kiemTraKhongVong(huongDoSo),
      amDuongSaiThac: kiemTraAmDuongSaiThac(huongDoSo),
    },
  };

  return { huongDoSo, namLuan, vanHienHanh, diemHuong, vongBatTrach, vongTamHop, vongPhiTinh, vongDaiQuai };
}
