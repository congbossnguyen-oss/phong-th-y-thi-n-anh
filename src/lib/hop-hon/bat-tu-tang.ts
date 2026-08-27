/**
 * HỢP HÔN — CÁC TẦNG BÁT TỰ (1: bổ khuyết Dụng Thần, 2: Cung Phu Thê & Nhật Chi, 3: Thập Thần,
 * 5: đồng bộ Đại Vận). Thuần công thức, không AI — test được offline không tốn credit.
 *
 * BAO TRÙM, KHÔNG SONG SONG: lá số lấy từ `tinhBatTu`, Dụng Thần từ `phanTichBatTu` — module này
 * KHÔNG tự lập lá số hay tự chọn Dụng Thần. Chỉ phần "đối chiếu 2 lá" là logic mới.
 *
 * Nguyên lý gốc (đặc tả 27/8/2026): hợp/xung chỉ có nghĩa khi soi tương đối với Dụng Thần —
 * không có nhánh nào kết luận từ quan hệ địa chi mà chưa tra Dụng Thần trước.
 */
import { tinhBatTu, type BatTuChart, type BatTuInput } from "../bat-tu";
import {
  phanTichBatTu, pheCua, hanhCan, hanhChi, chiChuan, TANG, TAM_HOP,
  type DungThanResult, type Hanh, type Phe, type TuTruInput,
} from "../bat-tu-engine/engine";
import {
  LUC_HOP_CHI, LUC_HAI_CHI, TUONG_HINH_CHI, TU_HINH_CHI,
  BANG_THAP_THAN, CA_DAC_BIET_THAP_THAN, type LuatThapThan, type MucCapThapThan,
} from "./bang-luat";

export type MucTruc = "rat_thuan" | "thuan" | "can_dieu_chinh" | "can_can_nhac" | "khong_du_du_lieu";

export interface TrucKetQua {
  ma: "bo_khuyet" | "phu_the" | "tinh_cach" | "tu_vi" | "dai_van";
  ten: string;
  muc: MucTruc;
  tomTat: string;
  canCu: string[]; // các dòng căn cứ hiển thị cho khách
  dieuChinh?: string; // việc cần chủ động làm (bắt buộc khi mức căng)
}

export interface HoSoBatTu {
  chart: BatTuChart;
  tt: TuTruInput;
  dungThan: DungThanResult;
  nhom: 1 | 2 | 3;
  gioSinhBiet: boolean;
}

/** Lập hồ sơ Bát Tự 1 người. Thiếu giờ → dùng 12h mặc định + cờ, đúng quy ước luan-van-khi. */
export function lapHoSoBatTu(input: Omit<BatTuInput, "hour"> & { hour?: number }): HoSoBatTu {
  const gioSinhBiet = typeof input.hour === "number";
  const chart = tinhBatTu({ ...input, hour: input.hour ?? 12 });
  const tt: TuTruInput = {
    nam: { can: chart.year.can, chi: chart.year.chi },
    thang: { can: chart.month.can, chi: chart.month.chi },
    ngay: { can: chart.day.can, chi: chart.day.chi },
    gio: { can: chart.hour.can, chi: chart.hour.chi },
    gioiTinh: input.gender,
  };
  const pt = phanTichBatTu(tt);
  return { chart, tt, dungThan: pt.dungThan, nhom: pt.vuongSuy.nhom, gioSinhBiet };
}

// ---------------------------------------------------------------------------------------------
// TẦNG 1 — BỔ KHUYẾT DỤNG THẦN (2 chiều, không đối xứng)

/** Đếm lực ngũ hành 1 lá số cung cấp ra ngoài: thấu can = 2, tàng can = 1, trụ tháng ×2
 *  (cùng sơ đồ trọng số demPhe của engine + quy ước nguyệt lệnh của dự án). */
export function demLucNguHanh(tt: TuTruInput): Record<Hanh, number> {
  const d: Record<Hanh, number> = { Kim: 0, "Mộc": 0, "Thủy": 0, "Hỏa": 0, "Thổ": 0 };
  const cong = (hanh: Hanh | undefined, luc: number) => { if (hanh) d[hanh] += luc; };
  const tru: { canChi: { can: string; chi: string }; heSo: number }[] = [
    { canChi: tt.nam, heSo: 1 }, { canChi: tt.thang, heSo: 2 },
    { canChi: tt.ngay, heSo: 1 }, { canChi: tt.gio, heSo: 1 },
  ];
  for (const { canChi, heSo } of tru) {
    cong(hanhCan(canChi.can), 2 * heSo);
    for (const tang of TANG[chiChuan(canChi.chi)] ?? []) cong(hanhCan(tang), 1 * heSo);
  }
  return d;
}

export type TheBoKhuyet = "ho_bo" | "bo_mot_chieu" | "cung_lam_nang" | "binh_hoa";

export interface BoKhuyetChiTiet {
  /** Tỉ lệ (−1..1): (dụng + 0.5·hỷ − kỵ − 0.5·cừu) / tổng lực. Dương = người kia bổ, âm = làm nặng. */
  aNhanTuB: number;
  bNhanTuA: number;
  theCuc: TheBoKhuyet;
}

const NGUONG_MANH = 0.18;
const NGUONG_AM = -0.08;

function tiLeBo(nhan: DungThanResult, cungCap: Record<Hanh, number>): number {
  const tong = Object.values(cungCap).reduce((s, v) => s + v, 0) || 1;
  const diem =
    cungCap[nhan.dungThan] + 0.5 * cungCap[nhan.hyThan] - cungCap[nhan.kyThan] - 0.5 * cungCap[nhan.cuuThan];
  return Math.round((diem / tong) * 100) / 100;
}

export function tinhBoKhuyet(a: HoSoBatTu, b: HoSoBatTu): { chiTiet: BoKhuyetChiTiet; truc: TrucKetQua } {
  const aNhanTuB = tiLeBo(a.dungThan, demLucNguHanh(b.tt));
  const bNhanTuA = tiLeBo(b.dungThan, demLucNguHanh(a.tt));

  let theCuc: TheBoKhuyet;
  if (aNhanTuB >= NGUONG_MANH && bNhanTuA >= NGUONG_MANH) theCuc = "ho_bo";
  else if (aNhanTuB <= NGUONG_AM && bNhanTuA <= NGUONG_AM) theCuc = "cung_lam_nang";
  else if ((aNhanTuB >= NGUONG_MANH) !== (bNhanTuA >= NGUONG_MANH) && Math.max(aNhanTuB, bNhanTuA) >= NGUONG_MANH)
    theCuc = "bo_mot_chieu";
  else theCuc = "binh_hoa";

  const canCu = [
    `Dụng Thần của bạn A là ${a.dungThan.dungThan} (Hỷ ${a.dungThan.hyThan}) — lá số bạn B cung cấp cho A ở mức ${moTaMucBo(aNhanTuB)}.`,
    `Dụng Thần của bạn B là ${b.dungThan.dungThan} (Hỷ ${b.dungThan.hyThan}) — lá số bạn A cung cấp cho B ở mức ${moTaMucBo(bNhanTuA)}.`,
  ];
  if (a.nhom === 3 || b.nhom === 3)
    canCu.push("Có lá số thuộc cách cục đặc biệt (Nhóm 3) — Dụng Thần theo lối tòng cách, kết quả tầng này cần chuyên gia đối chiếu thêm.");

  const bang: Record<TheBoKhuyet, { muc: MucTruc; tomTat: string; dieuChinh?: string }> = {
    ho_bo: { muc: "rat_thuan", tomTat: "Hai lá số bù đắp đúng chỗ thiếu của nhau — nâng nhau thật, không phải cảm giác." },
    bo_mot_chieu: {
      muc: "can_dieu_chinh",
      tomTat: "Một người bồi đắp cho người kia nhiều hơn hẳn chiều ngược lại — nhìn ngoài rất êm, nhưng là thế 'một người gánh'.",
      dieuChinh:
        "Người được bồi đắp cần chủ động san sẻ ở mặt khác (thời gian, việc nhà, tinh thần) để cân bằng cho–nhận không lệch dần theo năm tháng.",
    },
    cung_lam_nang: {
      muc: "can_can_nhac",
      tomTat: "Mỗi người mang thêm đúng ngũ hành mà người kia đang thừa — dễ khuếch đại điểm yếu sẵn có của nhau.",
      dieuChinh: "Bù bằng môi trường sống và nghề nghiệp theo hướng Dụng Thần từng người; nên luận kỹ với chuyên gia.",
    },
    binh_hoa: { muc: "thuan", tomTat: "Ngũ hành hai lá không nâng cũng không hại nhau rõ rệt — duyên phần này trung tính, xét tiếp các tầng sau." },
  };
  const kq = bang[theCuc];
  return {
    chiTiet: { aNhanTuB, bNhanTuA, theCuc },
    truc: { ma: "bo_khuyet", ten: "Bổ khuyết ngũ hành", muc: kq.muc, tomTat: kq.tomTat, canCu, ...(kq.dieuChinh ? { dieuChinh: kq.dieuChinh } : {}) },
  };
}

function moTaMucBo(x: number): string {
  if (x >= NGUONG_MANH) return "mạnh";
  if (x > 0.04) return "vừa";
  if (x >= NGUONG_AM) return "trung tính";
  return "bất lợi (cấp thêm hành đang thừa)";
}

// ---------------------------------------------------------------------------------------------
// TẦNG 2 — CUNG PHU THÊ (NHẬT CHI) & SAO PHỐI NGẪU

type ChatNhatChi = "dung_hy" | "trung_tinh" | "ky_cuu";

function chatNhatChi(hs: HoSoBatTu): ChatNhatChi {
  const h = hanhChi(hs.tt.ngay.chi);
  if (h === hs.dungThan.dungThan || h === hs.dungThan.hyThan) return "dung_hy";
  if (h === hs.dungThan.kyThan || h === hs.dungThan.cuuThan) return "ky_cuu";
  return "trung_tinh";
}

type QuanHeChi = "luc_hop" | "tam_hop" | "xung" | "hinh" | "hai" | "tu_hinh" | "khong";

function coCap(bang: readonly [string, string][], x: string, y: string): boolean {
  return bang.some(([a, b]) => (a === x && b === y) || (a === y && b === x));
}

export function quanHeNhatChi(chiA: string, chiB: string): QuanHeChi {
  const x = chiChuan(chiA);
  const y = chiChuan(chiB);
  if (x === y && TU_HINH_CHI.includes(x)) return "tu_hinh";
  if (coCap(LUC_HOP_CHI, x, y)) return "luc_hop";
  // TAM_HOP trong base-data khóa theo cụm "Thân-Tý-Thìn" → tách cụm rồi kiểm 2 chi cùng cụm.
  const cungCumTamHop =
    x !== y &&
    Object.keys(TAM_HOP).some((cum) => {
      const chis = cum.split("-");
      return chis.length === 3 && chis.includes(x) && chis.includes(y);
    });
  if (cungCumTamHop) return "tam_hop";
  // Ưu tiên xung trước hình/hại (lực mạnh hơn theo cổ quyết).
  const LUC_XUNG: [string, string][] = [["Tý", "Ngọ"], ["Sửu", "Mùi"], ["Dần", "Thân"], ["Mão", "Dậu"], ["Thìn", "Tuất"], ["Tị", "Hợi"]];
  if (coCap(LUC_XUNG, x, y)) return "xung";
  if (coCap(TUONG_HINH_CHI, x, y)) return "hinh";
  if (coCap(LUC_HAI_CHI, x, y)) return "hai";
  return "khong";
}

const TEN_QUAN_HE: Record<QuanHeChi, string> = {
  luc_hop: "lục hợp", tam_hop: "tam hợp", xung: "lục xung", hinh: "tương hình", hai: "lục hại",
  tu_hinh: "tự hình", khong: "không có quan hệ đặc biệt",
};

/** Sao phối ngẫu: nam xét Tài, nữ xét Quan. Trả về trạng thái trong chính lá số người đó. */
function saoPhoiNgau(hs: HoSoBatTu): { pheCan: Phe; hanhSao: Hanh; xuatHien: "thau" | "tang" | "khong"; laDung: boolean; laKy: boolean } {
  const pheCan: Phe = hs.tt.gioiTinh === "Nam" ? "tai" : "quan_sat";
  const nhatChu = hanhCan(hs.tt.ngay.can);
  // Hành của phe: tai = hành nhật chủ khắc; quan_sat = hành khắc nhật chủ.
  const tatCaHanh: Hanh[] = ["Kim", "Mộc", "Thủy", "Hỏa", "Thổ"];
  const hanhSao = tatCaHanh.find((h) => pheCua(h, nhatChu) === pheCan)!;
  const thau = [hs.tt.nam.can, hs.tt.thang.can, hs.tt.gio.can].some((c) => hanhCan(c) === hanhSao);
  const tang = [hs.tt.nam.chi, hs.tt.thang.chi, hs.tt.ngay.chi, hs.tt.gio.chi]
    .some((chi) => (TANG[chiChuan(chi)] ?? []).some((c) => hanhCan(c) === hanhSao));
  return {
    pheCan, hanhSao,
    xuatHien: thau ? "thau" : tang ? "tang" : "khong",
    laDung: hanhSao === hs.dungThan.dungThan || hanhSao === hs.dungThan.hyThan,
    laKy: hanhSao === hs.dungThan.kyThan || hanhSao === hs.dungThan.cuuThan,
  };
}

export function tinhPhuThe(a: HoSoBatTu, b: HoSoBatTu): TrucKetQua {
  const chatA = chatNhatChi(a);
  const chatB = chatNhatChi(b);
  const qh = quanHeNhatChi(a.tt.ngay.chi, b.tt.ngay.chi);

  // Diễn giải quan hệ QUA chất Nhật Chi từng bên — ma trận đặc tả, không có nhánh tra thẳng.
  // Điểm hóa nội bộ để xếp mức (KHÔNG hiển thị số cho khách): +2..-2 cho từng phía rồi lấy min.
  const diemPhia = (chat: ChatNhatChi): number => {
    if (qh === "khong") return 0;
    const hopVao = qh === "luc_hop" || qh === "tam_hop";
    if (chat === "dung_hy") return hopVao ? 1 : -2; // hợp giữ chỗ dựa (chưa xét hóa) / xung đánh vào chỗ dựa
    if (chat === "ky_cuu") return hopVao ? -1 : 2; // hợp trói thêm kỵ / xung khứ kỵ thần
    return hopVao ? 1 : -1; // trung tính: hợp hơi thuận, xung/hình/hại hơi bất lợi
  };
  const dA = diemPhia(chatA);
  const dB = diemPhia(chatB);
  const min = Math.min(dA, dB);

  const canCu: string[] = [
    `Hai Nhật Chi (${a.tt.ngay.chi} – ${b.tt.ngay.chi}) ở quan hệ ${TEN_QUAN_HE[qh]}.`,
    `Cung Phu Thê của bạn A thuộc ${tenChat(chatA)}; của bạn B thuộc ${tenChat(chatB)} — cùng một quan hệ, ` +
      "nghĩa với mỗi người khác nhau tùy Dụng Thần.",
  ];
  if (chatA === "ky_cuu" && (qh === "xung")) canCu.push("Với bạn A đây là thế 'xung khứ kỵ thần' — người kia gỡ đúng chỗ đang gây hại cho lá số, là điểm cộng thực chất.");
  if (chatB === "ky_cuu" && (qh === "xung")) canCu.push("Với bạn B đây là thế 'xung khứ kỵ thần' — người kia gỡ đúng chỗ đang gây hại cho lá số, là điểm cộng thực chất.");
  if (min <= -2) canCu.push("Có phía bị tác động thẳng vào chỗ dựa của lá số — đây là điểm cần luận kỹ nhất của cặp.");

  // Sao phối ngẫu từng người + người kia làm mạnh hay nhẹ.
  for (const [nhan, hs, kia] of [["A", a, b], ["B", b, a]] as const) {
    const sao = saoPhoiNgau(hs);
    const tenSao = hs.tt.gioiTinh === "Nam" ? "Tài tinh (sao vợ)" : "Quan tinh (sao chồng)";
    const cungCapKia = demLucNguHanh(kia.tt)[sao.hanhSao];
    const tongKia = Object.values(demLucNguHanh(kia.tt)).reduce((s, v) => s + v, 0) || 1;
    const kiaManh = cungCapKia / tongKia >= 0.25;
    let dong = `${tenSao} của bạn ${nhan} (${sao.hanhSao}) ${sao.xuatHien === "thau" ? "thấu can, hiện rõ" : sao.xuatHien === "tang" ? "chỉ tàng trong chi" : "không hiện trong lá"}`;
    if (sao.laKy && kiaManh) dong += " — nhưng hành này đang là Kỵ Thần mà người kia lại mang nhiều: cần tiết chế, không phải càng nhiều càng tốt";
    else if (sao.laDung && kiaManh) dong += " — và cũng là Dụng/Hỷ Thần, người kia mang nhiều hành này: sao phối ngẫu được nuôi đúng cách";
    else if (sao.xuatHien === "khong" && kiaManh) dong += " — người kia bù được phần lá số này còn thiếu";
    canCu.push(dong + ".");
  }

  const bang: { muc: MucTruc; tomTat: string; dieuChinh?: string } =
    min >= 2 ? { muc: "rat_thuan", tomTat: "Cung Phu Thê hai bên tương tác theo chiều gỡ khó cho nhau — kiểu 'xung mà nên' ít gặp." }
    : min >= 1 ? { muc: "thuan", tomTat: "Cung Phu Thê hai bên thuận, không có tác động ngược vào chỗ dựa của lá nào." }
    : min >= 0 ? { muc: "thuan", tomTat: "Cung Phu Thê hai bên trung tính — không phải điểm mạnh nhưng cũng không phải điểm phải lo." }
    : min >= -1 ? {
        muc: "can_dieu_chinh",
        tomTat: "Cung Phu Thê có điểm lệch nhẹ — biết trước thì hóa giải bằng nếp sống được.",
        dieuChinh: "Tránh đẩy nhau vào thế phải thắng-thua trong nhà; việc chung quyết khi cả hai bình tĩnh, không quyết lúc đang căng.",
      }
    : {
        muc: "can_can_nhac",
        tomTat: "Có phía bị tác động thẳng vào chỗ dựa của lá số — tầng quan trọng nhất của hợp hôn đang báo cần luận kỹ.",
        dieuChinh: "Đây là điểm nên mang đi trao đổi trực tiếp với chuyên gia, kèm bối cảnh thực tế của hai bạn — công cụ không đủ để kết luận một mình.",
      };

  return { ma: "phu_the", ten: "Cung Phu Thê & sao phối ngẫu", muc: bang.muc, tomTat: bang.tomTat, canCu, ...(bang.dieuChinh ? { dieuChinh: bang.dieuChinh } : {}) };
}

function tenChat(c: ChatNhatChi): string {
  return c === "dung_hy" ? "Dụng/Hỷ Thần (chỗ dựa của lá số)" : c === "ky_cuu" ? "Kỵ/Cừu Thần (chỗ đang gây hại)" : "trung tính";
}

// ---------------------------------------------------------------------------------------------
// TẦNG 3 — TÍNH CÁCH QUA THẬP THẦN

const TEN_PHE: Record<Phe, string> = {
  ty_kiep: "Tỷ Kiếp (tự chủ, cạnh tranh)", thuc_thuong: "Thực Thương (biểu đạt, phản biện)",
  tai: "Tài (thực tế, vật chất)", quan_sat: "Quan Sát (kỷ luật, danh phận)", an: "Ấn (nội tâm, cần dựa)",
};

/** Phe trội của 1 lá: đếm như demPhe (thấu 2, tàng 1) rồi lấy phe cao nhất. */
export function pheTroi(tt: TuTruInput): { phe: Phe; luc: number } {
  const nhatChu = hanhCan(tt.ngay.can);
  const d: Record<Phe, number> = { ty_kiep: 0, an: 0, thuc_thuong: 0, tai: 0, quan_sat: 0 };
  for (const c of [tt.nam.can, tt.thang.can, tt.gio.can]) d[pheCua(hanhCan(c), nhatChu)] += 2;
  for (const chi of [tt.nam.chi, tt.thang.chi, tt.ngay.chi, tt.gio.chi])
    for (const c of TANG[chiChuan(chi)] ?? []) d[pheCua(hanhCan(c), nhatChu)] += 1;
  const [phe, luc] = (Object.entries(d) as [Phe, number][]).sort((x, y) => y[1] - x[1])[0];
  return { phe, luc };
}

function timLuat(pheA: Phe, pheB: Phe): LuatThapThan {
  return BANG_THAP_THAN.find(
    (l) => (l.capNhom[0] === pheA && l.capNhom[1] === pheB) || (l.capNhom[0] === pheB && l.capNhom[1] === pheA),
  )!;
}

/** Có thấu can mang đúng Thập Thần chỉ định không (dùng chuỗi thapThan đã tính sẵn trong chart). */
function coThauThapThan(chart: BatTuChart, ten: string): boolean {
  return [chart.year, chart.month, chart.hour].some((p) => p.thapThan === ten);
}

export function tinhTinhCach(a: HoSoBatTu, b: HoSoBatTu): TrucKetQua {
  const pA = pheTroi(a.tt);
  const pB = pheTroi(b.tt);
  const luat = timLuat(pA.phe, pB.phe);

  const canCu = [
    `Nét trội của bạn A: ${TEN_PHE[pA.phe]}; của bạn B: ${TEN_PHE[pB.phe]}.`,
    luat.bieuHien,
  ];
  let muc: MucCapThapThan = luat.muc;
  let dieuChinh = luat.dieuChinh;

  // Ca đặc biệt: nữ Thương Quan thấu + trội × nam Chính Quan thấu + trội.
  const [nu, nam] = a.tt.gioiTinh === "Nữ" ? [a, b] : [b, a];
  if (
    nu.tt.gioiTinh === "Nữ" && nam.tt.gioiTinh === "Nam" &&
    pheTroi(nu.tt).phe === "thuc_thuong" && coThauThapThan(nu.chart, "Thương Quan") &&
    pheTroi(nam.tt).phe === "quan_sat" && coThauThapThan(nam.chart, "Chính Quan")
  ) {
    muc = "cang_nhat";
    canCu.push(CA_DAC_BIET_THAP_THAN.nuThuongQuanNamChinhQuan.bieuHien);
    dieuChinh = CA_DAC_BIET_THAP_THAN.nuThuongQuanNamChinhQuan.dieuChinh;
  }

  const doiMuc: Record<MucCapThapThan, { muc: MucTruc; tomTat: string }> = {
    rat_thuan: { muc: "rat_thuan", tomTat: "Hai nét tính cách trội sinh cho nhau — phân vai tự nhiên, ít phải gồng." },
    thuan: { muc: "thuan", tomTat: "Hai nét tính cách trội thuận chiều, có đà nâng đỡ nhau." },
    binh_hoa: { muc: "thuan", tomTat: "Hai người cùng một kiểu tính — hiểu nhau nhanh, nhưng cùng chung một điểm yếu cần bù từ bên ngoài." },
    cang: { muc: "can_dieu_chinh", tomTat: "Hai nét trội khắc nhau về hành vi — không phải không hợp, mà là phải có luật chung sớm." },
    cang_nhat: { muc: "can_can_nhac", tomTat: "Rơi đúng tổ hợp tính cách mà cổ thư xếp nặng nhất — cần đổi hẳn luật chơi ngay từ đầu, không để tự nhiên." },
  };
  const kq = doiMuc[muc];
  return { ma: "tinh_cach", ten: "Tính cách qua Thập Thần", muc: kq.muc, tomTat: kq.tomTat, canCu, dieuChinh };
}

// ---------------------------------------------------------------------------------------------
// TẦNG 5 — ĐỒNG BỘ ĐẠI VẬN (30 năm tới)

/** Chấm 1 Đại Vận của 1 người theo Dụng Thần NGUYÊN CỤC: can + chi, mỗi thành phần −1..1, tổng −2..2.
 *  Đơn giản hóa CÓ CHỦ ĐÍCH (không tính lại Dụng Thần tại vận): tầng này chỉ cần CHIỀU của pha
 *  (lên/xuống) để so đồng bộ, không cần độ chính xác tuyệt đối từng vận — xem đặc tả. */
function diemDaiVan(dt: DungThanResult, can: string, chi: string): number {
  const cham = (h: Hanh): number =>
    h === dt.dungThan ? 1 : h === dt.hyThan ? 0.5 : h === dt.kyThan ? -1 : h === dt.cuuThan ? -0.5 : 0;
  return cham(hanhCan(can)) + cham(hanhChi(chi));
}

export function tinhDongBoDaiVan(a: HoSoBatTu, b: HoSoBatTu, namHienTai: number): TrucKetQua {
  // Điểm vận theo từng năm dương lịch trong 30 năm tới, tra từ Đại Vận chứa năm đó.
  const diemNam = (hs: HoSoBatTu, nam: number): number | null => {
    const dv = hs.chart.daiVan.find((d) => nam >= d.startDate.y && nam < d.startDate.y + 10);
    return dv ? diemDaiVan(hs.dungThan, dv.can, dv.chi) : null;
  };

  let cungXuongTu: number | null = null;
  let cungXuongDen: number | null = null;
  let soNamCungLen = 0;
  let soNamLechPha = 0;
  let soNamXet = 0;
  for (let nam = namHienTai; nam < namHienTai + 30; nam++) {
    const dA = diemNam(a, nam);
    const dB = diemNam(b, nam);
    if (dA === null || dB === null) continue;
    soNamXet++;
    if (dA > 0 && dB > 0) soNamCungLen++;
    if ((dA > 0) !== (dB > 0) && (dA <= 0 || dB <= 0)) soNamLechPha++;
    if (dA < 0 && dB < 0) {
      if (cungXuongTu === null) cungXuongTu = nam;
      cungXuongDen = nam;
    }
  }

  const canCu: string[] = [];
  if (soNamXet === 0) {
    return {
      ma: "dai_van", ten: "Đồng bộ vận trình 30 năm", muc: "khong_du_du_lieu",
      tomTat: "Chưa đủ dữ liệu Đại Vận trong khoảng xét.", canCu: [],
    };
  }
  // Nói đúng khoảng thực sự tra được (bảng Đại Vận có hạn), và kể đủ 100% số năm — không để người
  // đọc phải tự trừ ra phần còn thiếu.
  const namCuoi = namHienTai + soNamXet - 1;
  const soNamCungTram = cungXuongTu !== null && cungXuongDen !== null ? cungXuongDen - cungXuongTu + 1 : 0;
  const soNamTrungTinh = Math.max(0, soNamXet - soNamCungLen - soNamLechPha - soNamCungTram);
  canCu.push(
    `Khoảng tra được cho cả hai: ${namHienTai}–${namCuoi} (${soNamXet} năm) — ${soNamCungLen} năm cùng thuận, ` +
      `${soNamLechPha} năm lệch pha (một người lên, một người xuống), ${soNamCungTram} năm cùng trầm, ` +
      `${soNamTrungTinh} năm bình thường.`,
  );
  if (cungXuongTu !== null)
    canCu.push(`Giai đoạn khoảng ${cungXuongTu}–${cungXuongDen} cả hai cùng vào vận trầm — đây là quãng cần chuẩn bị trước về tài chính và tinh thần, tránh dồn các quyết định lớn vào đúng quãng này.`);
  else canCu.push("Không có giai đoạn nào cả hai cùng vào vận trầm — luôn có ít nhất một người đang thuận để đỡ người kia.");

  const tyLeCungLen = soNamCungLen / soNamXet;
  const kq: { muc: MucTruc; tomTat: string; dieuChinh?: string } =
    cungXuongTu === null && tyLeCungLen >= 0.4
      ? { muc: "rat_thuan", tomTat: "Vận trình hai người gối nhau đẹp: nhiều năm cùng thuận, không có quãng cùng trầm." }
      : cungXuongTu === null
        ? { muc: "thuan", tomTat: "Vận trình chủ yếu lệch pha — luân phiên một người đỡ một người, không xấu nhưng cần hiểu trước để khỏi so bì." }
        : {
            muc: "can_dieu_chinh",
            tomTat: "Có quãng cả hai cùng vào vận trầm — biết trước mốc thời gian là lợi thế lớn nhất của tầng này.",
            dieuChinh: "Trước quãng cùng trầm 2–3 năm: tích lũy tài chính, hoãn các khoản vay lớn, và giữ nếp sinh hoạt ổn định qua quãng đó.",
          };
  return { ma: "dai_van", ten: "Đồng bộ vận trình 30 năm", muc: kq.muc, tomTat: kq.tomTat, canCu, ...(kq.dieuChinh ? { dieuChinh: kq.dieuChinh } : {}) };
}
