/**
 * Lớp "sự thật thuần code" của engine chung — gọi lại `tinhBatTu()` đã có sẵn trong
 * `src/lib/bat-tu.ts` (dùng cho công cụ Lập Lá Số Bát Tự miễn phí hiện tại), KHÔNG viết lại bất
 * kỳ phép tính Can Chi/Tàng Can/Đại Vận nào — đúng yêu cầu "tái sử dụng, không viết lại an sao"
 * của handoff/README-GIAO-CLAUDE-CODE.md.
 *
 * File này CHỈ định dạng lại output của `tinhBatTu()` thành `BatTuFacts` (đổi nhãn Ngũ Hành tiếng
 * Việt "Mộc"/"Hỏa"... sang khoá ascii "moc"/"hoa"... khớp `handoff/config/*.json`) — không tính
 * thêm bất kỳ giá trị mới nào ngoài việc đổi định dạng.
 */
import { tinhBatTu, type BatTuChart, type BatTuInput, type PillarInfo, type Gender } from "../bat-tu";
import type { BatTuFacts, TruPillarFact, DaiVanFact, NguHanh } from "./types";

const NGU_HANH_VI_TO_KEY: Record<string, NguHanh> = {
  "Kim": "kim",
  "Mộc": "moc",
  "Thủy": "thuy",
  "Hỏa": "hoa",
  "Thổ": "tho",
};

function nguHanhKey(vi: string): NguHanh {
  const k = NGU_HANH_VI_TO_KEY[vi];
  if (!k) throw new Error(`Ngũ Hành không nhận diện được: "${vi}" — kiểm tra lại bat-tu.ts có đổi nhãn không.`);
  return k;
}

function toPillarFact(p: PillarInfo): TruPillarFact {
  return {
    can: p.can,
    chi: p.chi,
    napAm: p.napAm,
    napAmNguHanh: nguHanhKey(p.napAmElement),
    tangCan: p.tangCan.map((tc) => ({ can: tc.can, thapThan: tc.thapThan })),
    thapThan: p.thapThan,
    ...(p.truongSinh ? { truongSinh: p.truongSinh } : {}),
  };
}

export interface CastBatTuInput {
  day: number;
  month: number;
  year: number;
  hour: number;
  minute?: number;
  gender: Gender;
}

/** Cảnh báo kỹ thuật thuần code (KHÔNG phải luận giải) — giờ sinh gần biên nhạy cảm. */
function canhBaoKyThuat(input: BatTuInput, chart: BatTuChart): string[] {
  const canhBao: string[] = [];
  if (input.hour === 23 || input.hour === 0) {
    canhBao.push(
      "Giờ sinh gần ranh giới giờ Tý (23h–1h) — Can Chi trụ Ngày có thể lệch nếu giờ sinh không chính xác " +
        "tới vài phút. Nên đối chiếu lại với giấy chứng sinh nếu có.",
    );
  }
  void chart;
  return canhBao;
}

/**
 * Lập Tứ Trụ + Đại Vận từ ngày giờ sinh, dùng NGUYÊN engine `tinhBatTu()` sẵn có. Trả về đúng
 * `BatTuFacts` — không có trường luận giải nào (những trường đó do LLM điền ở tầng trên).
 */
export function castBatTuFacts(input: CastBatTuInput): { chart: BatTuChart; facts: BatTuFacts } {
  const batTuInput: BatTuInput = {
    day: input.day,
    month: input.month,
    year: input.year,
    hour: input.hour,
    ...(input.minute !== undefined ? { minute: input.minute } : {}),
    gender: input.gender,
  };
  const chart = tinhBatTu(batTuInput);

  const daiVan: DaiVanFact[] = chart.daiVan.map((dv) => ({
    can: dv.can,
    chi: dv.chi,
    canNguHanh: nguHanhKey(
      // Đại Vận không tự có trường Ngũ Hành của Can — suy từ đúng bảng CAN_NGU_HANH (đã export)
      // theo canIndex, KHÔNG phải công thức mới.
      ["Mộc", "Mộc", "Hỏa", "Hỏa", "Thổ", "Thổ", "Kim", "Kim", "Thủy", "Thủy"][dv.canIndex]!,
    ),
    tuTuoi: dv.startAge,
    denTuoi: dv.endAge,
  }));

  const gioiTinh: "Nam" | "Nữ" = input.gender;
  const pad = (n: number) => String(n).padStart(2, "0");
  const duongLich = `${input.year}-${pad(input.month)}-${pad(input.day)}T${pad(input.hour)}:${pad(input.minute ?? 0)}`;

  const facts: BatTuFacts = {
    gioiTinh,
    duongLich,
    tuTru: {
      nam: toPillarFact(chart.year),
      thang: toPillarFact(chart.month),
      ngay: toPillarFact(chart.day),
      gio: toPillarFact(chart.hour),
    },
    nhatChu: {
      can: chart.nhatChu.can,
      nguHanh: nguHanhKey(chart.nhatChu.nguHanh),
      amDuong: chart.nhatChu.amDuong,
    },
    daiVanThuanNghich: chart.daiVanForward ? "thuận" : "nghịch",
    daiVan,
    menhCung: { can: chart.menhCung.can, chi: chart.menhCung.chi },
    thaiNguyen: { can: chart.thaiNguyen.can, chi: chart.thaiNguyen.chi },
    nienKhong: chart.nienKhong,
    nhatKhong: chart.nhatKhong,
    thanSat: {
      nam: chart.thanSat.year,
      thang: chart.thanSat.month,
      ngay: chart.thanSat.day,
      gio: chart.thanSat.hour,
    },
    canhBaoKyThuat: canhBaoKyThuat(batTuInput, chart),
  };

  return { chart, facts };
}
