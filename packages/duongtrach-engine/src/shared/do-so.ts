/**
 * Vòng 60 thấu địa long theo độ số la bàn (phân kim) — dùng chung cho mọi module Dương Trạch
 * (Khai Môn Điểm Thần Sát là module đầu tiên). Nguồn: data/01-bang-tra-do-so.md trong gói
 * khai-mon-module (Công cung cấp) mục 1: "Giáp Tý khởi 337.5°, mỗi phân kim 6°, xếp theo cung
 * Địa Chi (mỗi cung 5 Thiên Can cùng âm/dương), đi thuận chiều kim đồng hồ."
 *
 * stt (số thứ tự Hoa Giáp CHUẨN, Giáp Tý = 1) lấy từ `buildPillar()` của calendar-core
 * (README-CLAUDE-CODE.md: "Nếu calendar-core đã có hàm này thì dùng lại") — KHÔNG tự viết lại
 * phép dò Can Chi → cycleIndex.
 *
 * LƯU Ý CHÍNH TẢ: calendar-core dùng "Tỵ" (dấu y), nguồn của module này dùng "Tị" (dấu i) —
 * hai cách viết cùng 1 âm, khác chuỗi. Để khớp CHÍNH XÁC dữ liệu/fixture của module (đối chiếu
 * tay với Công), CHI ở đây định nghĩa RIÊNG với spelling "Tị". Vẫn tái dùng `buildPillar` của
 * calendar-core cho phần tính (chỉ truyền index số, không truyền chuỗi) nên không trùng lặp
 * thuật toán, chỉ khác nhãn hiển thị.
 */
import { Calendar } from "@thien-anh/calendar-core";
const { buildPillar } = Calendar;

export const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"] as const;
export type Can = (typeof CAN)[number];

export const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"] as const;
export type Chi = (typeof CHI)[number];

/** Chuẩn hóa độ số về [0, 360). */
export function chuanHoaDo(d: number): number {
  const x = d % 360;
  return x < 0 ? x + 360 : x;
}

/** stt Hoa Giáp chuẩn (Giáp Tý = 1) từ index Can (0-9) + index Chi (0-11). */
export function sttTuIndex(canIndex: number, chiIndex: number): number {
  return buildPillar(canIndex, chiIndex).cycleIndex + 1;
}

/** stt Hoa Giáp chuẩn từ tên Can + Chi (dùng khi đã biết chuỗi, ví dụ nhập phân kim tay). */
export function sttTuCanChi(can: Can, chi: Chi): number {
  return sttTuIndex(CAN.indexOf(can), CHI.indexOf(chi));
}

export interface PhanKim {
  can: Can;
  chi: Chi;
  canChi: string;
  /** số thứ tự Hoa Giáp CHUẨN (Giáp Tý = 1), dùng cho phi Lường Thiên Xích — KHÔNG phải vị trí trên vòng độ. */
  stt: number;
  deg: number;
  start: number;
  end: number;
  /** khoảng cách tới đường phân kim gần nhất, làm tròn 2 số. */
  gap: number;
}

interface RingCell {
  can: Can;
  chi: Chi;
  start: number;
  end: number;
  stt: number;
}

/**
 * Sinh bằng công thức, không hardcode 60 dòng (README-CLAUDE-CODE.md mục "Thứ tự dựng" bước 1).
 * `i` là thứ tự trên vòng độ số (0-59, KHÁC stt Hoa Giáp chuẩn).
 */
function buildRing(): RingCell[] {
  const ring: RingCell[] = [];
  for (let k = 0; k < 12; k++) {
    for (let j = 0; j < 5; j++) {
      const i = 5 * k + j;
      const canIndex = (k + 2 * j) % 10;
      const chiIndex = k;
      ring.push({
        can: CAN[canIndex]!,
        chi: CHI[chiIndex]!,
        start: chuanHoaDo(337.5 + 6 * i),
        end: chuanHoaDo(337.5 + 6 * (i + 1)),
        stt: sttTuIndex(canIndex, chiIndex),
      });
    }
  }
  return ring;
}

const RING = buildRing();

/** Độ số → ô phân kim (60 thấu địa long), kèm khoảng cách tới đường ranh gần nhất. */
export function phanKim(deg: number): PhanKim {
  const d = chuanHoaDo(deg);
  for (const cell of RING) {
    const { start: s, end: e } = cell;
    // Ô bọc qua mốc 0° (vd Canh Tý 355.5→1.5) có start > end.
    const inside = s < e ? d >= s && d < e : d >= s || d < e;
    if (inside) {
      const gapToStart = chuanHoaDo(d - s);
      const gapToEnd = chuanHoaDo(e - d);
      const gap = Math.round(Math.min(gapToStart, gapToEnd) * 100) / 100;
      return { can: cell.can, chi: cell.chi, canChi: `${cell.can} ${cell.chi}`, stt: cell.stt, deg: d, start: s, end: e, gap };
    }
  }
  /* c8 ignore next -- vòng 60 ô phủ kín 360° không hở, luôn khớp đúng 1 ô. */
  throw new Error(`Không tra được phân kim cho ${deg}°`);
}
