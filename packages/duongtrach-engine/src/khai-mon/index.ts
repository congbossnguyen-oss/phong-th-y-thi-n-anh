/**
 * KHAI MÔN ĐIỂM THẦN SÁT — SPEC.md (gói khai-mon-module, Công cung cấp) mục 3, thuật toán 7 bước.
 * Hàm thuần: không I/O, không DB, không fetch, không Date.now(), không gọi AI
 * (README-CLAUDE-CODE.md mục "Engine phải là HÀM THUẦN").
 *
 * Đối chiếu: khớp cả 5 fixture (`data/04-fixtures.json`, 43 assertion thần sát) — xem
 * `__tests__/khai-mon.test.ts`.
 */
import { Data } from "@thien-anh/calendar-core";
import { CAN, CHI, chuanHoaDo, phanKim, sttTuCanChi, type Can, type Chi } from "../shared/do-so.js";
import { LTX, NGU_HANH_CUNG, HUONG_CUNG, cungVatLyTuDo, type TenCung } from "../shared/cuu-cung.js";
import { SINH, KHAC, ME, type Hanh } from "../shared/ngu-hanh.js";
import { NGU_HO_DON, THAN_SAT_THEO_CAN, THAN_SAT_THEO_CHI, loaiThanSat } from "./tables.js";
import type { KhaiMonInput, KhaiMonResult, ODiaBan, ThanSat, BanCuuCungO, CanhBao, LoaiThanSat } from "./types.js";

const { napAmForCycleIndex } = Data;

/** Thứ tự chạy Ngũ hổ độn: Dần → Mão → … → Tý → Sửu (data/01 mục 6). */
const THU_TU_NGU_HO_DON: readonly Chi[] = [...CHI.slice(2), ...CHI.slice(0, 2)];

function napAm(stt: number): { napAm: string; hanh: Hanh } {
  const { name, element } = napAmForCycleIndex(stt - 1);
  return { napAm: name, hanh: element as Hanh };
}

/**
 * Địa bàn (Ngũ hổ độn) + phi Lường Thiên Xích — Bước 2 và Bước 4. `% 60` TRƯỚC, rồi `% 9`
 * (README-CLAUDE-CODE.md "Ba cái bẫy" #1 — rút gọn thành `(a - b) % 9` là lệch đúng 6 cung).
 */
function xayDiaBan(canToa: Can, sttMon: number): Record<Chi, ODiaBan> {
  const canKhoi = NGU_HO_DON[canToa];
  const ciKhoi = CAN.indexOf(canKhoi);
  const out = {} as Record<Chi, ODiaBan>;
  THU_TU_NGU_HO_DON.forEach((chi, step) => {
    const can = CAN[(ciKhoi + step) % 10]!;
    const stt = sttTuCanChi(can, chi);
    const buoc = (((stt - sttMon) % 60) + 60) % 60;
    const cung = LTX[buoc % 9]!;
    const { napAm: ten, hanh } = napAm(stt);
    out[chi] = { chi, can, canChi: `${can} ${chi}`, stt, buoc, cung, huong: HUONG_CUNG[cung], napAm: ten, hanh };
  });
  return out;
}

/**
 * Quan hệ nạp âm thần sát ↔ ngũ hành cung nó đáo vào — Bước 5. Chỉ 2/5 quan hệ làm thần sát
 * mạnh lên; thứ tự kiểm PHẢI đúng: đồng khí trước, rồi cung-sinh, rồi ba trường hợp tiết
 * (SPEC.md mục 3.5 — đối chiếu đúng thứ tự này với `reference/khai_mon.py::quan_he()`).
 */
function quanHeVaLuc(hanhCung: Hanh, hanhThanSat: Hanh): { quanHe: string; luc: ThanSat["luc"] } {
  if (hanhCung === hanhThanSat) return { quanHe: "Đồng khí với cung", luc: "VƯỢNG" };
  if (SINH[hanhCung] === hanhThanSat) return { quanHe: `Cung ${hanhCung} sinh nạp âm ${hanhThanSat}`, luc: "MẠNH" };
  if (KHAC[hanhCung] === hanhThanSat) return { quanHe: `Cung ${hanhCung} khắc nạp âm ${hanhThanSat}`, luc: "bị tiết lực" };
  if (SINH[hanhThanSat] === hanhCung) return { quanHe: `Nạp âm ${hanhThanSat} sinh cung ${hanhCung}`, luc: "bị tiết lực" };
  return { quanHe: `Nạp âm ${hanhThanSat} khắc cung ${hanhCung}`, luc: "bị tiết lực" };
}

/** Đơn thuốc ngũ hành — Bước 5. Hung thần TIẾT bằng ngũ hành nó sinh ra, KHÔNG dùng khắc. */
function donThuoc(loai: LoaiThanSat, hanh: Hanh): string {
  if (loai === "hung") return `tiết bằng ${SINH[hanh]} — tuyệt đối không thêm ${ME[hanh]}`;
  return `kích bằng ${ME[hanh]} hoặc ${hanh}`;
}

/** An thần sát — Bước 3: theo Can môn khí (3 sao) và theo Chi môn khí (5 sao, Thiên Hình có thể ra 2 chi). */
function anThanSat(diaBan: Record<Chi, ODiaBan>, canMon: Can, chiMon: Chi, sttMon: number): ThanSat[] {
  const ketQua: ThanSat[] = [];
  const themTu = (ten: string, chi: Chi) => {
    const o = diaBan[chi];
    const hanhCung = NGU_HANH_CUNG[o.cung];
    const { quanHe, luc } = quanHeVaLuc(hanhCung, o.hanh);
    const loai = loaiThanSat(ten);
    ketQua.push({
      ten, loai, chiDiaBan: chi, canChi: o.canChi, stt: o.stt, napAm: o.napAm, hanh: o.hanh,
      cung: o.cung, huong: o.huong, hanhCung, quanHe, luc,
      manhLen: luc === "VƯỢNG" || luc === "MẠNH",
      donThuoc: donThuoc(loai, o.hanh),
      lamMon: o.stt === sttMon,
    });
  };
  for (const [ten, bang] of Object.entries(THAN_SAT_THEO_CAN)) themTu(ten, bang[canMon]);
  for (const [ten, bang] of Object.entries(THAN_SAT_THEO_CHI)) for (const chi of bang[chiMon]) themTu(ten, chi);
  return ketQua;
}

function ganBanCuuCung(diaBan: Record<Chi, ODiaBan>, thanSat: ThanSat[]): Record<TenCung, BanCuuCungO> {
  const ban = {} as Record<TenCung, BanCuuCungO>;
  for (const cung of LTX) {
    ban[cung] = {
      cung, huong: HUONG_CUNG[cung], hanh: NGU_HANH_CUNG[cung],
      chiChua: CHI.filter((chi) => diaBan[chi].cung === cung),
      thanSat: [], honHop: false,
    };
  }
  for (const t of thanSat) ban[t.cung]!.thanSat.push(t);
  for (const o of Object.values(ban)) {
    const coCat = o.thanSat.some((t) => t.loai !== "hung");
    const coHung = o.thanSat.some((t) => t.loai === "hung");
    o.honHop = coCat && coHung;
  }
  return ban;
}

/** Cảnh báo — Bước 7 (SPEC.md mục 3.7). */
const PHAN_KIM_TU_MO = new Set(["Kỷ Sửu", "Nhâm Thìn", "Ất Mùi", "Mậu Tuất"]);

function taoCanhBao(
  toa: ReturnType<typeof phanKim>, huong: ReturnType<typeof phanKim>, mon: ReturnType<typeof phanKim>,
  thanSat: ThanSat[],
): CanhBao[] {
  const list: CanhBao[] = [];
  for (const [nhan, pk] of [["Toạ", toa], ["Hướng", huong], ["Môn khí", mon]] as const) {
    if (pk.gap < 0.5) {
      list.push({ muc: "nặng", ma: "DUOI_0_5", noiDung: `${nhan} (${pk.canChi}) chỉ cách đường phân kim ${pk.gap}° — không tính được, cần đo lại bằng la kinh.` });
    } else if (pk.gap <= 1.5) {
      list.push({ muc: "nhắc", ma: "SAT_RANH", noiDung: `${nhan} (${pk.canChi}) cách đường phân kim ${pk.gap}° — sai số la kinh ±2° có thể đổi phân kim, đổi cả bàn. Nên đo lại để chắc chắn.` });
    }
  }
  if (PHAN_KIM_TU_MO.has(mon.canChi)) {
    list.push({ muc: "nhắc", ma: "PHAN_KIM_BIEN_GIOI", noiDung: `Môn khí rơi vào phân kim ${mon.canChi} — 1 trong 4 phân kim Tứ Mộ vắt qua ranh giới hướng. Cung vật lý của cửa đã xét đúng theo độ số (không suy từ tên phân kim).` });
  }
  if (thanSat.some((t) => t.lamMon)) {
    list.push({ muc: "nặng", ma: "LAM_MON", noiDung: "Có thần sát rơi đúng lên phân kim môn khí (lâm môn) — toạ và môn cùng một độn. Cách đọc cách cục đại môn CHƯA CHỐT, xem cachCucDaiMon (cả hai cách)." });
  }
  return list;
}

export function tinhKhaiMon(input: KhaiMonInput): KhaiMonResult {
  const toa = phanKim(input.toaDeg);
  const mon = phanKim(input.monDeg);
  const huong = phanKim(input.huongDeg ?? chuanHoaDo(input.toaDeg + 180));

  const monCung = cungVatLyTuDo(input.monDeg);
  const monHuong = HUONG_CUNG[monCung];

  const diaBan = xayDiaBan(toa.can, mon.stt);
  const thanSat = anThanSat(diaBan, mon.can, mon.chi, mon.stt);
  const banCuuCung = ganBanCuuCung(diaBan, thanSat);

  const theoCungVatLy = thanSat.filter((t) => t.cung === monCung);
  const theoLamMon = thanSat.filter((t) => t.lamMon);

  // Ba bất biến (SPEC.md mục 7): {Dần,Hợi} {Mão,Tý} {Thìn,Sửu} luôn dùng chung cung ở ca thường.
  const batBienOk =
    diaBan.Dần.cung === diaBan.Hợi.cung &&
    diaBan.Mão.cung === diaBan.Tý.cung &&
    diaBan.Thìn.cung === diaBan.Sửu.cung;

  return {
    toa, huong, mon, monCung, monHuong,
    nguHoDonKhoi: `${NGU_HO_DON[toa.can]} Dần`,
    diaBan, thanSat, banCuuCung,
    cachCucDaiMon: { theoCungVatLy, theoLamMon, caTreo: theoLamMon.length > 0 },
    canhBao: taoCanhBao(toa, huong, mon, thanSat),
    batBienOk,
  };
}

export * from "./types.js";
export { THAN_SAT_THEO_CAN, THAN_SAT_THEO_CHI, NGU_HO_DON, CAT_THAN, CAT_CO_DIEU_KIEN, HUNG_THAN } from "./tables.js";
