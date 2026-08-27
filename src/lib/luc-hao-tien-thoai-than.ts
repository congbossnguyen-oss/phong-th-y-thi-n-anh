// LỤC HÀO — TIẾN THẦN / THOÁI THẦN (進神 / 退神).
//
// Hào ĐỘNG biến ra hào CÙNG NGŨ HÀNH mà địa chi tiến lên một bậc trong hành đó = TIẾN THẦN (việc
// tiến tới, đà đi lên); lùi một bậc = THOÁI THẦN (việc thoái lui, đà đi xuống). Đây là 1 trong những
// cơ chế được dùng nhiều nhất khi quẻ có hào động, trước đây engine chưa có.
//
// Bảng cặp (chuẩn Lục Hào, khớp CHI_NGU_HANH của dự án — mỗi hành có vòng riêng):
//   Mộc  Dần → Mão      Hỏa  Tỵ → Ngọ      Kim  Thân → Dậu      Thủy  Hợi → Tý
//   Thổ  Sửu → Thìn → Mùi → Tuất → (Sửu)   ← Thổ có 4 chi nên là vòng khép kín, tiến 3 ngôi mỗi bậc
// Chiều ngược lại của mỗi mũi tên là Thoái Thần.
//
// ⚠️ File THUẦN TÍNH TOÁN, không luận văn vẻ, không gọi LLM — giống mọi engine khác trong dự án.
// Sắc thái cát/hung KHÔNG nằm ở đây: Tiến Thần chỉ có nghĩa "đà đi lên", còn đi lên là tốt hay xấu
// còn tùy hào đó là Dụng Thần hay Kỵ Thần — việc đó thuộc lớp luận, không thuộc lớp tính.

import { type FullCastResult, type HaoInfo, type LucThan, type VuongSuy } from "./luc-hao";
import { CHI, type NguHanh } from "./menh-nap-am";
import { CHI_NGU_HANH } from "./bat-tu";

/**
 * Vòng chi TIẾN theo từng ngũ hành (index CHI). Đi tới = Tiến Thần, đi lui = Thoái Thần.
 *
 * `khepKin` QUAN TRỌNG: chỉ THỔ mới khép kín (Tuất → Sửu quay đầu, đúng ca quyết "tuất sửu" là tiến
 * thần). Bốn hành kia chỉ có 2 chi nên là đoạn THẲNG — nếu coi là vòng tròn thì Tý → Hợi cũng thành
 * "tiến" do phép chia dư, tức đảo ngược hoàn toàn ý nghĩa (lỗi này đã bị test bắt lúc dựng module).
 */
const VONG_TIEN: Record<NguHanh, { chi: number[]; khepKin: boolean }> = {
  Mộc: { chi: [2, 3], khepKin: false }, // Dần → Mão
  Hỏa: { chi: [5, 6], khepKin: false }, // Tỵ → Ngọ
  Kim: { chi: [8, 9], khepKin: false }, // Thân → Dậu
  Thủy: { chi: [11, 0], khepKin: false }, // Hợi → Tý
  Thổ: { chi: [1, 4, 7, 10], khepKin: true }, // Sửu → Thìn → Mùi → Tuất → (quay lại Sửu)
};

export type LoaiTienThoai = "tien-than" | "thoai-than";

export interface KetQuaTienThoaiHao {
  viTriHao: number; // 1-6
  loai: LoaiTienThoai;
  nhan: string; // "Tiến Thần" | "Thoái Thần"
  lucThan: LucThan;
  nguHanh: NguHanh;
  chiGoc: string;
  chiBien: string;
  vuongSuy: VuongSuy;
  /** Hào biến rơi Tuần Không → "tiến/thoái không thành" (tạm thời chưa chuyển được). */
  bienTuanKhong: boolean;
  /** Hào biến bị Nguyệt Phá → cũng là dạng chưa chuyển được ngay. */
  bienNguyetPha: boolean;
  /** Mô tả deterministic để lớp LLM viết lại thành lời, KHÔNG phán cát hung. */
  moTa: string;
}

export interface KetQuaTienThoai {
  co: boolean;
  danhSach: KetQuaTienThoaiHao[];
  ghiChu: string[];
}

/**
 * So 2 chi cùng ngũ hành xem là tiến hay thoái. null nếu khác hành hoặc không đứng cạnh nhau trong
 * vòng (vd Sửu → Mùi cách 2 bậc: KHÔNG phải tiến/thoái thần, chỉ là xung nhau).
 */
export function xetTienThoai(chiGocIndex: number, chiBienIndex: number): LoaiTienThoai | null {
  const hanhGoc = CHI_NGU_HANH[chiGocIndex];
  if (hanhGoc !== CHI_NGU_HANH[chiBienIndex]) return null;
  if (chiGocIndex === chiBienIndex) return null; // trùng chi = Phục Ngâm, không phải tiến/thoái

  const { chi: vong, khepKin } = VONG_TIEN[hanhGoc];
  const i = vong.indexOf(chiGocIndex);
  const j = vong.indexOf(chiBienIndex);
  if (i < 0 || j < 0) return null;

  const n = vong.length;
  // Liền bậc theo chiều tiến: j ngay sau i. Chỉ vòng khép kín (Thổ) mới cho phép quay đầu cuối→đầu.
  const lienBac = (a: number, b: number) => (khepKin ? (a + 1) % n === b : a + 1 === b);
  if (lienBac(i, j)) return "tien-than";
  if (lienBac(j, i)) return "thoai-than";
  return null; // cách nhau >1 bậc (chỉ xảy ra với Thổ, vd Sửu↔Mùi) — không tính tiến/thoái
}

/**
 * Quét toàn quẻ, tìm mọi hào động tạo Tiến Thần / Thoái Thần.
 * Chỉ xét hào ĐỘNG (hào tĩnh không biến nên không có tiến/thoái).
 */
export function tinhTienThoaiThan(cast: FullCastResult): KetQuaTienThoai {
  if (!cast.bien) {
    return { co: false, danhSach: [], ghiChu: ["Quẻ không có hào động — không xét Tiến/Thoái Thần."] };
  }

  const danhSach: KetQuaTienThoaiHao[] = [];
  const ghiChu: string[] = [];

  for (const pos of cast.dongPositions) {
    const goc: HaoInfo | undefined = cast.chinh.hao[pos - 1];
    const bien: HaoInfo | undefined = cast.bien.hao[pos - 1];
    if (!goc || !bien) continue;

    const loai = xetTienThoai(goc.chiIndex, bien.chiIndex);
    if (!loai) continue;

    const nhan = loai === "tien-than" ? "Tiến Thần" : "Thoái Thần";
    const bienTuanKhong = bien.xunKong;
    const bienNguyetPha = bien.relations.some((r) => r.type === "Nguyệt Phá");

    let moTa = `Hào ${pos} ${goc.lucThan} ${CHI[goc.chiIndex]} động, biến ra ${CHI[bien.chiIndex]} cùng hành ${goc.nguHanh} — ${nhan}: ${loai === "tien-than" ? "đà việc tiến tới, tăng dần" : "đà việc thoái lui, giảm dần"}.`;
    if (bienTuanKhong || bienNguyetPha) {
      const cai = [bienTuanKhong ? "Tuần Không" : null, bienNguyetPha ? "Nguyệt Phá" : null].filter(Boolean).join(" + ");
      moTa += ` Nhưng hào biến đang ${cai} → ${loai === "tien-than" ? "tiến" : "thoái"} chưa thành, phải chờ qua mốc đó.`;
    }

    danhSach.push({
      viTriHao: pos,
      loai,
      nhan,
      lucThan: goc.lucThan,
      nguHanh: goc.nguHanh,
      chiGoc: CHI[goc.chiIndex],
      chiBien: CHI[bien.chiIndex],
      vuongSuy: goc.vuongSuy,
      bienTuanKhong,
      bienNguyetPha,
      moTa,
    });
  }

  if (danhSach.length === 0) {
    ghiChu.push("Có hào động nhưng không hào nào tạo thành Tiến/Thoái Thần (hào biến khác ngũ hành hoặc không liền bậc).");
  } else {
    ghiChu.push(
      "Tiến/Thoái Thần chỉ nói ĐÀ của việc (lên hay xuống), KHÔNG tự nó là tốt hay xấu — còn tùy hào đó là Dụng Thần hay Kỵ Thần: Kỵ Thần tiến thần là xấu, Kỵ Thần thoái thần lại là tốt.",
    );
  }

  return { co: danhSach.length > 0, danhSach, ghiChu };
}

/** Tra nhanh Tiến/Thoái Thần của ĐÚNG 1 hào (dùng khi đã biết hào Dụng Thần). */
export function tienThoaiCuaHao(cast: FullCastResult, viTriHao: number): KetQuaTienThoaiHao | null {
  return tinhTienThoaiThan(cast).danhSach.find((d) => d.viTriHao === viTriHao) ?? null;
}
