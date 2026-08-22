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
  type CastInput,
  type CoinLineValue,
  type FullCastResult,
  type LucThan,
} from "../luc-hao";
import type { CategoryId, QuestionDefinition } from "./types";

// ---------------------------------------------------------------------------------------------
// Dụng Thần gợi ý theo NHÓM câu hỏi — trích từ LUAN_QUE_LUC_HAO_SPEC.md mục 4.1 (Lớp 3, phần
// "rule-based"). Đây là GỢI Ý xác định (deterministic), KHÔNG phải LLM tự đoán. Trường hợp lưỡng
// hiện / phức tạp, LLM tinh chỉnh tiếp bằng dữ liệu quẻ + tài liệu spec (Lớp 3 fallback).

export type DungThanHint =
  | { kind: "luc-than"; value: LucThan; note?: string }
  | { kind: "the-hao"; note?: string } // lấy Hào Thế làm Dụng Thần (sức khỏe, vận hạn chung)
  | { kind: "framework"; ref: string; note: string }; // khung riêng (Thế-Ứng, 2 bước, 4 Dụng thần...)

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
  "quyet-dinh": {
    kind: "framework",
    ref: "LUAN_QUE_LUC_HAO_SPEC.md §4.9",
    note: "So sánh phương án: gieo riêng 1 quẻ/phương án (Cách 1) rồi so cát hung — Dụng Thần theo bản chất từng việc.",
  },
};

export function dungThanHintFor(category: CategoryId): DungThanHint {
  return DUNG_THAN_BY_CATEGORY[category];
}

// ---------------------------------------------------------------------------------------------
// Lập quẻ — CHỈ gọi engine có sẵn, không tự tính.

/** CastInput cho thời điểm hiện tại (quẻ luận theo thời điểm gieo). */
export function castInputNow(now: Date = new Date()): CastInput {
  return {
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    hour: now.getHours(),
    minute: now.getMinutes(),
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

// ---------------------------------------------------------------------------------------------
// Sơ đồ vận trình (Bát Tự/Tử Vi) — do adapter điền ở phase sau; ở đây chỉ định nghĩa hình dạng slot.
// Khớp VanTrinhTimeline trong ENGINE_INTEGRATION.md §3.

export interface VanTrinhTimeline {
  giaiDoan: { tuoiBatDau: number; tuoiKetThuc: number; nhan: string; danhGia: "tot" | "binh_thuong" | "xau" }[];
  luuNienHienTai: { nam: number; nhan: string; danhGia: "tot" | "binh_thuong" | "xau" };
}

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
    dung_than_hint: DungThanHint; // gợi ý Dụng Thần theo nhóm (Lớp 3 rule-based)
  };
  /** Nguyên văn kết quả engine lập quẻ — KHÔNG sửa đổi. Đây là nguồn sự thật, LLM không tự tính lại. */
  cast: FullCastResult;
  /** Sơ đồ vận trình Bát Tự/Tử Vi (nếu câu hỏi có dùng) — do adapter điền; null nếu chưa có / không dùng. */
  van_trinh: VanTrinhTimeline | null;
  meta: {
    castAtISO: string;
    method: "luc-hao-tosses" | "luc-hao-random";
  };
}

/**
 * Gom câu hỏi + kết quả quẻ (+ vận trình) thành payload cho LLM. Thuần deterministic — chỉ đóng gói.
 */
export function buildInterpretationPayload(
  question: QuestionDefinition,
  cast: FullCastResult,
  opts: { vanTrinh?: VanTrinhTimeline | null; method: QuanSuInterpretationPayload["meta"]["method"]; castAt?: Date } = {
    method: "luc-hao-tosses",
  },
): QuanSuInterpretationPayload {
  if (question.divination_method !== "luc-hao") {
    throw new Error(
      `Câu hỏi "${question.question_id}" không dùng Kinh Dịch (divination_method=${question.divination_method}). Nhóm chọn ngày giờ đi theo trach-nhat, không qua đây.`,
    );
  }
  return {
    question: {
      question_id: question.question_id,
      category: question.category,
      title: question.title,
      output_type: question.output_type,
      safety_level: question.safety_level,
      dung_than_hint: dungThanHintFor(question.category),
    },
    cast,
    van_trinh: opts.vanTrinh ?? null,
    meta: {
      castAtISO: (opts.castAt ?? new Date()).toISOString(),
      method: opts.method,
    },
  };
}
