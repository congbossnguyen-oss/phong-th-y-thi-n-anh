// QUÂN SƯ THIÊN ANH — Lớp nối Thư Viện Câu Hỏi ↔ engine lập quẻ Kinh Dịch (Lục Hào).
//
// ⚠️ NGUYÊN TẮC BẤT DI BẤT DỊCH: KHÔNG tự phát minh cách lập quẻ. Toàn bộ việc lập quẻ (Nạp Giáp,
// Lục Thân, Thế/Ứng, Tuần Không, vượng suy, quan hệ Nhật/Nguyệt, quẻ biến/hỗ, Phản/Phục Ngâm) do
// engine `src/lib/luc-hao.ts` tính — file này CHỈ:
//   1. Gọi đúng hàm lập quẻ có sẵn (lucHaoCastFromTosses / lucHaoCastRandom).
//   2. Đóng gói kết quả engine + câu hỏi + (tùy chọn) sơ đồ vận trình thành 1 payload có cấu trúc
//      để Interpretation Engine (LLM) ĐỌC — LLM không tự tính quẻ.
//
// Nhóm "chọn ngày giờ" KHÔNG đi qua đây (không gieo quẻ) — nó dùng trachnhat-engine (xem
// ENGINE_INTEGRATION.md §5). File này chỉ lo divination_method = "luc-hao".

import {
  lucHaoCastFromTosses,
  lucHaoCastRandom,
  maiHoaCast,
  seriTienCast,
  type CastInput,
  type CoinLineValue,
  type FullCastResult,
  type LucThan,
} from "../luc-hao";
import type { LuckContext } from "./current-luck";
import type { CategoryId, QuestionDefinition } from "./types";
import { timHaoDungThan, tinhUngKy, type KetQuaUngKy } from "../luc-hao-ung-ky";
import { tinhTienThoaiThan, type KetQuaTienThoai } from "../luc-hao-tien-thoai-than";
import { tinhTamHopCuc, type KetQuaTamHopCuc } from "../luc-hao-tam-hop-cuc";

// ---------------------------------------------------------------------------------------------
// Dụng Thần gợi ý theo NHÓM câu hỏi — trích từ LUAN_QUE_LUC_HAO_SPEC.md mục 4.1 (Lớp 3, phần
// "rule-based"). Đây là GỢI Ý xác định (deterministic), KHÔNG phải LLM tự đoán. Trường hợp lưỡng
// hiện / phức tạp, LLM tinh chỉnh tiếp bằng dữ liệu quẻ + tài liệu spec (Lớp 3 fallback).

export type DungThanHint =
  | { kind: "luc-than"; value: LucThan; note?: string }
  | { kind: "the-hao"; note?: string } // lấy Hào Thế làm Dụng Thần (sức khỏe, vận hạn chung)
  | { kind: "ung-hao"; note?: string } // lấy Hào Ứng — hỏi việc cho NGƯỜI KHÁC chung (không phải lục thân cụ thể)
  | { kind: "framework"; ref: string; note: string }; // khung riêng (Thế-Ứng, 2 bước, 4 Dụng thần...)

/**
 * ĐỐI TƯỢNG được hỏi — khi hỏi việc cho NGƯỜI KHÁC (vd sức khỏe cha/mẹ), Dụng Thần đổi theo Lục
 * Thân đại diện người đó (quy trình luận §1.1: "Cha mẹ → Phụ Mẫu; Con cái → Tử Tôn; Anh chị em/bạn
 * → Huynh Đệ; Đối phương/người khác → Hào Ứng"; vợ/chồng theo hôn nhân: vợ → Thê Tài, chồng → Quan
 * Quỷ). `chinh-toi` = không đổi, giữ Dụng Thần mặc định của nhóm câu hỏi.
 */
export type DoiTuongHoi = "chinh-toi" | "cha-me" | "con" | "vo" | "chong" | "anh-chi-em" | "nguoi-khac";

/** Đối tượng → Dụng Thần thay thế. null = chính mình (giữ mặc định theo nhóm). */
export const DOI_TUONG_TO_HINT: Record<DoiTuongHoi, DungThanHint | null> = {
  "chinh-toi": null,
  "cha-me": { kind: "luc-than", value: "Phụ Mẫu", note: "Hỏi việc cho cha/mẹ → Phụ Mẫu làm Dụng Thần (§1.1)." },
  "con": { kind: "luc-than", value: "Tử Tôn", note: "Hỏi việc cho con cái → Tử Tôn làm Dụng Thần (§1.1)." },
  "vo": { kind: "luc-than", value: "Thê Tài", note: "Hỏi việc cho vợ → Thê Tài làm Dụng Thần (§1.1)." },
  "chong": { kind: "luc-than", value: "Quan Quỷ", note: "Hỏi việc cho chồng → Quan Quỷ làm Dụng Thần (§1.1)." },
  "anh-chi-em": { kind: "luc-than", value: "Huynh Đệ", note: "Hỏi việc cho anh chị em/bạn bè → Huynh Đệ làm Dụng Thần (§1.1)." },
  "nguoi-khac": { kind: "ung-hao", note: "Hỏi việc cho người khác (không thuộc lục thân cụ thể) → Hào Ứng đại diện người đó (§1.1)." },
};

const DUNG_THAN_BY_CATEGORY: Record<CategoryId, DungThanHint> = {
  "su-nghiep": { kind: "luc-than", value: "Quan Quỷ", note: "Công danh/chức vụ → Quan Quỷ (spec 4.1)." },
  "kinh-doanh": { kind: "luc-than", value: "Thê Tài", note: "Cầu tài/kinh doanh → Thê Tài (spec 4.1)." },
  "tai-chinh": {
    kind: "framework",
    ref: "LUAN_QUE_LUC_HAO_SPEC.md §4.4",
    note: "Vay/cho vay/đòi nợ: quy trình 2 bước (thái độ Thế-Ứng + khả năng = Thê Tài của Ứng). Mua bán tài sản → Thê Tài.",
  },
  "dau-tu": {
    kind: "luc-than",
    value: "Thê Tài",
    note: "Đầu tư → Thê Tài; LƯU Ý nguyên tắc NGƯỢC của đầu tư (spec §8): Tài bị khắc/tiết mới tốt.",
  },
  "bat-dong-san": { kind: "luc-than", value: "Phụ Mẫu", note: "Nhà đất/giấy tờ/hợp đồng → Phụ Mẫu (spec 4.1)." },
  "nha-cua": {
    kind: "framework",
    ref: "LUAN_QUE_LUC_HAO_SPEC.md §8 (domain Phong thủy nhà ở)",
    note: "Luận NHÀ: hào vị = hạng mục nhà (bếp/cửa/bàn thờ/giường...). Có lời/bán được → xét thêm Thê Tài; hợp mệnh → Thế.",
  },
  "hop-tac": {
    kind: "framework",
    ref: "LUAN_QUE_LUC_HAO_SPEC.md §4.3",
    note: "Hợp tác/hùn vốn: khung Thế (ta) - Ứng (đối tác), không dùng 1 Lục Thân cố định.",
  },
  "tinh-duyen-hon-nhan": {
    kind: "framework",
    ref: "LUAN_QUE_LUC_HAO_SPEC.md §4.5",
    note: "Nam hỏi → Thê Tài; Nữ hỏi → Quan Quỷ (xem duyên trước cưới khác 'vợ chồng đã cưới').",
  },
  "thi-cu": { kind: "luc-than", value: "Quan Quỷ", note: "Thi cử/công danh → Quan Quỷ; xét thêm Phụ Mẫu (bằng cấp) (spec 4.1)." },
  "thi-dau-canh-tranh": {
    kind: "framework",
    ref: "LUAN_QUE_LUC_HAO_SPEC.md §4.7",
    note: "Có trọng tài → Quan Quỷ/Phụ Mẫu; đối đầu 1-1 → khung Thế-Ứng; đối thủ chung → Huynh Đệ.",
  },
  "kien-tung-tranh-chap": { kind: "luc-than", value: "Quan Quỷ", note: "Kiện tụng → Quan Quỷ; Thế=ta, Ứng=đối phương (spec 4.1)." },
  "suc-khoe": { kind: "the-hao", note: "Sức khỏe → Hào Thế làm Dụng Thần; xét thêm Tử Tôn (thuốc/điều trị) (spec 4.1)." },
  "xuat-hanh": {
    kind: "framework",
    ref: "LUAN_QUE_LUC_HAO_SPEC.md §4.6",
    note: "4 Dụng thần đồng thời: Thế (bản thân), Ứng (nơi đến), Phụ Mẫu (xe/hành lý), Thê Tài (lộ phí).",
  },
  "chon-ngay-gio": {
    kind: "framework",
    ref: "ENGINE_INTEGRATION.md §5 (trachnhat-engine)",
    note: "KHÔNG gieo quẻ — dùng trach-nhat. Không nên gọi lớp Kinh Dịch cho nhóm này.",
  },
  "cau-hoi-khac": {
    kind: "framework",
    ref: "QUY_TRINH_LUC_HAO_LUAN.md §1.1 (dòng cuối — việc lạ, ít gặp)",
    note: "Việc không thuộc nhóm chuẩn nào — Dụng Thần phải tự suy theo bản chất câu hỏi cụ thể (tra theo nguyên tắc suy luận tương tự), không có sẵn 1 Lục Thân cố định. Chưa chắc chắn thì phải nói rõ, không đoán bừa.",
  },
  "quyet-dinh": {
    kind: "framework",
    ref: "LUAN_QUE_LUC_HAO_SPEC.md §4.9",
    note: "So sánh phương án: gieo riêng 1 quẻ/phương án (Cách 1) rồi so cát hung — Dụng Thần theo bản chất từng việc.",
  },
};

/**
 * `doiTuong` (nếu khác "chinh-toi") ghi đè Dụng Thần mặc định của nhóm — hỏi việc cho người thân thì
 * Dụng Thần đổi theo Lục Thân đại diện người đó, không còn theo nhóm câu hỏi nữa (quy trình §1.1).
 * Nhóm "framework" (Thế-Ứng, 4 Dụng Thần đồng thời...) giữ nguyên bất kể `doiTuong` — những nhóm đó
 * vốn không dùng 1 Dụng Thần đơn nhất nên đổi đối tượng không áp dụng được.
 */
export function dungThanHintFor(category: CategoryId, doiTuong: DoiTuongHoi = "chinh-toi"): DungThanHint {
  const macDinh = DUNG_THAN_BY_CATEGORY[category];
  if (doiTuong === "chinh-toi" || macDinh.kind === "framework") return macDinh;
  return DOI_TUONG_TO_HINT[doiTuong] ?? macDinh;
}

// ---------------------------------------------------------------------------------------------
// Lập quẻ — CHỈ gọi engine có sẵn, không tự tính.

/**
 * CastInput cho thời điểm hiện tại (quẻ luận theo thời điểm gieo) — LUÔN theo GIỜ VIỆT NAM, bất kể
 * máy chủ chạy múi giờ nào (đúng idiom `ngayVietNam()` đã dùng khắp dự án). Trước đây dùng
 * `now.getHours()`/`getDate()` (giờ hệ thống server) — nếu server chạy UTC thì lệch 7 tiếng so với
 * giờ VN, khiến Mai Hoa Dịch Số (dựa vào giờ hỏi việc) ra sai quẻ dù công thức đúng (Thầy báo
 * "vẫn sai" nhiều lần, 2026-08-23 — nguyên nhân là múi giờ đầu vào, không phải công thức).
 */
export function castInputNow(now: Date = new Date()): CastInput {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    day: get("day"),
    month: get("month"),
    year: get("year"),
    hour: get("hour") % 24, // một số runtime trả "24" cho nửa đêm khi hour12:false
    minute: get("minute"),
  };
}

/**
 * Lập quẻ Lục Hào từ 6 lần gieo của người dùng (mỗi lần 3 đồng xu → 6/7/8/9).
 * Đây là cách gieo truyền thống, hào động tự suy ra (Lão Âm 6 / Lão Dương 9). Tái dùng
 * `lucHaoCastFromTosses` — KHÔNG tự tính.
 */
export function castLucHaoFromTosses(tosses: CoinLineValue[], input: CastInput = castInputNow()): FullCastResult {
  if (tosses.length !== 6) throw new Error("Cần đúng 6 lần gieo (6 hào).");
  return lucHaoCastFromTosses(tosses, input);
}

/** Gieo giúp (app mô phỏng gieo) — dùng khi người dùng chọn "gieo giúp tôi". Tái dùng `lucHaoCastRandom`. */
export function castLucHaoRandom(input: CastInput = castInputNow(), rng: () => number = Math.random): FullCastResult {
  return lucHaoCastRandom(input, rng);
}

/**
 * Lập quẻ Mai Hoa Dịch Số theo Năm/Tháng/Ngày/Giờ Âm lịch tại thời điểm hỏi việc — không cần người
 * dùng thao tác gì. Tái dùng `maiHoaCast` (Thiệu Khang Tiết) — KHÔNG tự tính.
 */
export function castMaiHoa(input: CastInput = castInputNow()): FullCastResult {
  return maiHoaCast(input);
}

/**
 * Lập quẻ từ dãy số Seri trên tờ tiền ("số linh quẻ", ứng dụng Mai Hoa Dịch Số cho số bất kỳ).
 * Tái dùng `seriTienCast` — KHÔNG tự tính.
 */
export function castSeriTien(serial: string, input: CastInput = castInputNow()): FullCastResult {
  return seriTienCast(serial, input);
}

// ---------------------------------------------------------------------------------------------
// Vận trình (Bát Tự/Tử Vi) do engine current-luck.ts trích (Phase 4). Ở đây chỉ dùng làm slot trong
// payload — engine thật nằm ở current-luck.ts (tinhVanTrinhHienTai).

// ---------------------------------------------------------------------------------------------
// Payload có cấu trúc để Interpretation Engine (LLM) ĐỌC. Deterministic: chỉ gom dữ liệu đã tính,
// KHÔNG luận, KHÔNG gọi LLM. LLM đọc payload này → sinh KẾT QUẢ QUÂN SƯ + luận giải chi tiết.

export interface QuanSuInterpretationPayload {
  question: {
    question_id: string;
    category: CategoryId;
    title: string;
    output_type: QuestionDefinition["output_type"];
    safety_level: QuestionDefinition["safety_level"];
    dung_than_hint: DungThanHint; // gợi ý Dụng Thần theo nhóm (Lớp 3 rule-based), đã áp dụng doi_tuong_hoi nếu có
    doi_tuong_hoi: DoiTuongHoi; // hỏi việc cho ai — "chinh-toi" nếu không chọn
  };
  /** Nguyên văn kết quả engine lập quẻ — KHÔNG sửa đổi. Đây là nguồn sự thật, LLM không tự tính lại. */
  cast: FullCastResult;
  /** Vận trình hiện tại (Bát Tự/Tử Vi) — do current-luck.ts trích; null nếu câu hỏi không dùng / chưa có ngày sinh. */
  van_trinh: LuckContext | null;
  /**
   * ỨNG KỲ — mốc thời gian ứng nghiệm (spec §6, 8 quy luật). null khi không xác định được Dụng Thần
   * theo nhóm việc (vd nhóm dùng khung Thế-Ứng chứ không phải 1 Lục Thân cố định) — lúc đó LLM tự
   * luận thời điểm theo tài liệu, KHÔNG có mốc tính sẵn.
   */
  ung_ky: KetQuaUngKy | null;
  /** Danh sách hào tạo Tiến Thần / Thoái Thần (đà việc lên hay xuống). */
  tien_thoai_than: KetQuaTienThoai;
  /** Tam Hợp cục hoá cục (nếu có) — đổi hẳn tính chất các hào tham gia sang ngũ hành của cục. */
  tam_hop_cuc: KetQuaTamHopCuc;
  meta: {
    castAtISO: string;
    method: "luc-hao-tosses" | "luc-hao-random" | "mai-hoa" | "seri-tien";
  };
}

/**
 * Gom câu hỏi + kết quả quẻ (+ vận trình) thành payload cho LLM. Thuần deterministic — chỉ đóng gói.
 */
export function buildInterpretationPayload(
  question: QuestionDefinition,
  cast: FullCastResult,
  opts: {
    vanTrinh?: LuckContext | null;
    method: QuanSuInterpretationPayload["meta"]["method"];
    castAt?: Date;
    /** Hỏi việc cho ai — mặc định "chinh-toi". Đổi Dụng Thần theo Lục Thân đại diện người đó. */
    doiTuong?: DoiTuongHoi;
  } = {
    method: "luc-hao-tosses",
  },
): QuanSuInterpretationPayload {
  if (question.divination_method !== "luc-hao") {
    throw new Error(
      `Câu hỏi "${question.question_id}" không dùng Kinh Dịch (divination_method=${question.divination_method}). Nhóm chọn ngày giờ đi theo trach-nhat, không qua đây.`,
    );
  }
  const hint = dungThanHintFor(question.category, opts.doiTuong ?? "chinh-toi");
  return {
    question: {
      question_id: question.question_id,
      category: question.category,
      title: question.title,
      output_type: question.output_type,
      safety_level: question.safety_level,
      dung_than_hint: hint,
      doi_tuong_hoi: opts.doiTuong ?? "chinh-toi",
    },
    cast,
    van_trinh: opts.vanTrinh ?? null,
    ung_ky: tinhUngKyTheoHint(cast, hint),
    tien_thoai_than: tinhTienThoaiThan(cast),
    tam_hop_cuc: tinhTamHopCuc(cast),
    meta: {
      castAtISO: (opts.castAt ?? new Date()).toISOString(),
      method: opts.method,
    },
  };
}

/**
 * Tính Ứng Kỳ khi gợi ý Dụng Thần là 1 Lục Thân xác định hoặc hào Thế. Trả null cho nhóm dùng
 * "framework" (Thế-Ứng, 4 Dụng Thần đồng thời...) — những nhóm đó KHÔNG có 1 Dụng Thần duy nhất nên
 * engine không tự chọn hộ; để LLM luận theo tài liệu, thà thiếu còn hơn chọn bừa rồi ra mốc sai.
 *
 * Trường hợp LƯỠNG HIỆN (Lục Thân xuất hiện ở nhiều hào): lấy hào ĐỘNG trước, không có thì lấy hào
 * đầu tiên — và ghi chú rõ để lớp trên biết đây là lựa chọn máy móc, cần người kiểm lại.
 */
function tinhUngKyTheoHint(cast: FullCastResult, hint: DungThanHint): KetQuaUngKy | null {
  let ungVien: { viTriHao: number; laPhucThan: boolean }[];

  if (hint.kind === "luc-than") {
    ungVien = timHaoDungThan(cast, hint.value);
  } else if (hint.kind === "the-hao") {
    ungVien = [{ viTriHao: cast.chinh.theHao, laPhucThan: false }];
  } else if (hint.kind === "ung-hao") {
    ungVien = [{ viTriHao: cast.chinh.ungHao, laPhucThan: false }];
  } else {
    return null; // framework — không có Dụng Thần đơn nhất
  }
  if (ungVien.length === 0) return null;

  // Lưỡng hiện: ưu tiên hào đang động (hào động là hào "lên tiếng" trong quẻ).
  const chon = ungVien.find((u) => !u.laPhucThan && cast.chinh.hao[u.viTriHao - 1]?.isDong) ?? ungVien[0];

  const kq = tinhUngKy({ cast, viTriHao: chon.viTriHao, laPhucThan: chon.laPhucThan });
  if (ungVien.length > 1) {
    kq.ghiChu.push(
      `Dụng Thần LƯỠNG HIỆN (có ở hào ${ungVien.map((u) => u.viTriHao).join(", ")}) — hệ thống tạm lấy hào ${chon.viTriHao}. Cần tự kiểm lại xem hào nào mới đúng là Dụng Thần của việc này.`,
    );
  }
  return kq;
}
