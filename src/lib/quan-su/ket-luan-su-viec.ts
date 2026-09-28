// QUÂN SƯ THIÊN ANH — DỤNG THẦN → KẾT LUẬN SỰ VIỆC (Phase 12).
//
// Tầng SYNTHESIS cuối, nằm TRÊN Cân Lực Hào (Phase 10) + Kỵ→Nguyên→Dụng (Phase 11). CONSUME các trạng
// thái deterministic đã có; KHÔNG tính lại Ngũ hành / Vượng-Suy / chuỗi / Tam Hợp. KHÔNG điểm số.
// Khi tín hiệu mâu thuẫn → MIXED; khi thiếu dữ liệu → UNRESOLVED. KHÔNG ép GOOD/BAD.

import type { FullCastResult } from "../luc-hao";
import { nguHanhTac, type DungThanResolved, type FourGods } from "./advisory-engine";
import { canLucHao, type HaoStrengthState } from "./can-luc-hao";
import { synthesizeKyNguyenDung, type KyNguyenDungSynthesis } from "./ky-nguyen-dung";
import { phanLoaiSauTamHop } from "../luc-hao-tam-hop-cuc";

type CurrentState = HaoStrengthState["currentState"];

export type DungStrength = "VERY_STRONG" | "STRONG" | "BALANCED" | "WEAK" | "VERY_WEAK";
export type DungSupport = "STRONGLY_SUPPORTED" | "SUPPORTED" | "LIMITED" | "UNSUPPORTED" | "UNDER_PRESSURE";
export type DungProtection = "PROTECTED" | "PARTIALLY_PROTECTED" | "UNPROTECTED" | "UNDER_ATTACK" | "DELAYED";
export type DungTemporal = "AVAILABLE" | "DELAYED" | "EMPTY" | "HIDDEN";
export type EventConclusion = "FAVORABLE" | "FAVORABLE_WITH_DELAY" | "MIXED" | "DIFFICULT" | "UNFAVORABLE" | "UNRESOLVED";

export interface DungThanSynthesis {
  lineIndex: number;
  strength: DungStrength;
  support: DungSupport;
  protection: DungProtection;
  temporal: DungTemporal;
  conclusion: EventConclusion;
  reasons: string[];
}

export type TheUngRelation =
  | "THE_SUPPORTED" | "THE_UNDER_PRESSURE" | "UNG_SUPPORTED" | "UNG_UNDER_PRESSURE" | "BALANCED";

export interface TheUngSynthesis {
  theLineIndex: number | null;
  ungLineIndex: number | null;
  theStrength: DungStrength | null;
  ungStrength: DungStrength | null;
  relation: TheUngRelation;
  reasons: string[];
}

export interface QuanSuConclusion {
  dungThan: DungThanSynthesis | null; // null nếu Dụng không hiện rõ
  theUng: TheUngSynthesis;
  kyNguyenDung: KyNguyenDungSynthesis;
  contextualSignals: {
    tamHop?: string[]; // các thể Tam Hợp (TH1..TH6) nếu có
    phanNgam?: "REPEATED_CHANGE"; // Phản Ngâm (fanYin)
    phucNgam?: "REPEATED_STATE"; // Phục Ngâm (fuYin)
  };
  conclusion: EventConclusion;
  reasons: string[];
}

// -------------------------------------------------------------------------------------------------
// Adapters DETERMINISTIC — chuẩn hóa state Phase 10/11 sang tầng kết luận. KHÔNG methodology mới.
const STRONG_SET: DungStrength[] = ["VERY_STRONG", "STRONG"];
const isStrong = (s: DungStrength) => s === "VERY_STRONG" || s === "STRONG";
const isWeak = (s: DungStrength) => s === "WEAK" || s === "VERY_WEAK";

/** Force: lấy TRỰC TIẾP từ canLucHao currentState.effective (đã gồm hóa biến). Không Vong/Phá KHÔNG zero. */
export function strengthFrom(cs: CurrentState): DungStrength {
  if (cs.effective === "Rất Vượng") return "VERY_STRONG";
  if (cs.effective === "Vượng") return "STRONG";
  if (cs.effective === "Trung Hòa") return "BALANCED";
  // Suy: yếu hơn nữa nếu đồng thời chưa hiện hữu / ẩn tàng.
  if (cs.temporalExistence === "EMPTY" || cs.hidden) return "VERY_WEAK";
  return "WEAK";
}

function temporalFrom(cs: CurrentState): DungTemporal {
  if (cs.temporalExistence === "EMPTY") return "EMPTY"; // Không Vong — chờ Xuất Không/Ứng Kỳ
  if (cs.hidden) return "HIDDEN"; // Nhập Mộ — chờ xung khai Mộ
  return "AVAILABLE";
}

function supportFrom(knd: KyNguyenDungSynthesis): DungSupport {
  switch (knd.nguyenSupport) {
    case "STRONG": return "STRONGLY_SUPPORTED";
    case "PRESENT": return "SUPPORTED";
    case "LIMITED": return "LIMITED";
    case "HIDDEN": return "LIMITED"; // Nguyên ẩn — hỗ trợ chờ hiện
    case "EMPTY": return "LIMITED"; // Nguyên Không Vong — hỗ trợ chưa hiện hữu
    default: return "UNSUPPORTED"; // NONE
  }
}

function protectionFrom(knd: KyNguyenDungSynthesis): DungProtection {
  const p = knd.dungProtection;
  if (p === "UNDER_PRESSURE") return "UNDER_ATTACK";
  if (p === "DELAYED") return "DELAYED";
  if (p === "PARTIALLY_PROTECTED") return "PARTIALLY_PROTECTED";
  if (p === "PROTECTED") return "PROTECTED";
  if (p === "UNPROTECTED") return "UNPROTECTED";
  // UNCLEAR: không có Kỵ đe dọa → coi như không bị công (PROTECTED theo nghĩa "không có lực cản"); có Kỵ → UNPROTECTED.
  return knd.kyPressure === "NONE" ? "PROTECTED" : "UNPROTECTED";
}

/** State machine kết luận cho MỘT Dụng Thần. Deterministic, mâu thuẫn → MIXED, thiếu → UNRESOLVED. */
export function concludeDung(strength: DungStrength, protection: DungProtection, temporal: DungTemporal): EventConclusion {
  // Cổng thời gian: chưa hiện hữu (Không Vong) / ẩn tàng (Nhập Mộ) / trì hoãn → kết luận theo hướng "chờ".
  if (temporal === "EMPTY" || temporal === "HIDDEN" || temporal === "DELAYED") {
    if (isStrong(strength) && protection !== "UNDER_ATTACK" && protection !== "UNPROTECTED") return "FAVORABLE_WITH_DELAY";
    if (isWeak(strength) && (protection === "UNDER_ATTACK" || protection === "UNPROTECTED")) return "DIFFICULT";
    return "UNRESOLVED";
  }
  // AVAILABLE:
  switch (protection) {
    case "PROTECTED":
      return isWeak(strength) ? "MIXED" : "FAVORABLE"; // được bảo vệ nhưng yếu → còn dùng dằng
    case "PARTIALLY_PROTECTED":
      return "MIXED"; // có lực cản NHƯNG có nguồn cứu — §VII: không collapse thành GOOD/BAD
    case "DELAYED":
      return "FAVORABLE_WITH_DELAY";
    case "UNPROTECTED":
    case "UNDER_ATTACK":
      return isStrong(strength) ? "DIFFICULT" : "UNFAVORABLE"; // mạnh mà bị công không cứu → khó; yếu → bất lợi
    default:
      return "UNRESOLVED";
  }
}

/** Dựng DungThanSynthesis từ currentState của Dụng + chuỗi Kỵ/Nguyên/Dụng. Pure. */
export function dungThanSynthesisFrom(lineIndex: number, cs: CurrentState, knd: KyNguyenDungSynthesis): DungThanSynthesis {
  const strength = strengthFrom(cs);
  const support = supportFrom(knd);
  const protection = protectionFrom(knd);
  const temporal = temporalFrom(cs);
  const conclusion = concludeDung(strength, protection, temporal);
  const reasons: string[] = [];
  reasons.push(`Dụng Thần lực nền=${cs.base}, hiệu dụng=${cs.effective} → ${strength}.`);
  if (cs.temporalExistence === "EMPTY") reasons.push("Dụng Thần Không Vong → chưa hiện hữu, chờ Xuất Không/Ứng Kỳ (KHÔNG phải mất lực).");
  if (cs.hidden) reasons.push("Dụng Thần Nhập Mộ → ẩn tàng, chờ xung khai Mộ.");
  if (cs.reduced) reasons.push("Dụng Thần bị Phá/Hồi Đầu Khắc/Hóa bất lợi → giảm lực nhưng GIỮ nền.");
  if (cs.restrained) reasons.push("Dụng Thần Hóa Hợp → còn lực nhưng bị níu chân.");
  reasons.push(`Nguyên hỗ trợ=${knd.nguyenSupport} → ${support}; áp lực Kỵ=${knd.kyPressure}; bảo vệ Dụng=${protection}.`);
  return { lineIndex, strength, support, protection, temporal, conclusion, reasons };
}

/** Tương quan Thế ↔ Ứng — FACT, KHÔNG phán tốt/xấu. */
export function theUngSynthesisFrom(cast: FullCastResult): TheUngSynthesis {
  const the = cast.chinh.hao.find((h) => h.theUng === "Thế") ?? null;
  const ung = cast.chinh.hao.find((h) => h.theUng === "Ứng") ?? null;
  const reasons: string[] = [];
  let relation: TheUngRelation = "BALANCED";
  if (the && ung) {
    const r = nguHanhTac(the.nguHanh, ung.nguHanh); // a=Thế, b=Ứng
    if (r === "b-sinh-a") { relation = "THE_SUPPORTED"; reasons.push("Ứng sinh Thế → phía ta được trợ."); }
    else if (r === "b-khac-a") { relation = "THE_UNDER_PRESSURE"; reasons.push("Ứng khắc Thế → phía ta chịu áp lực."); }
    else if (r === "a-khac-b") { relation = "UNG_UNDER_PRESSURE"; reasons.push("Thế khắc Ứng → phía ta ở thế chủ động."); }
    else if (r === "a-sinh-b") { relation = "UNG_SUPPORTED"; reasons.push("Thế sinh Ứng → ta hao lực cho việc/đối phương."); }
    else reasons.push("Thế và Ứng đồng hành — tương quan cân bằng.");
  } else {
    reasons.push("Quẻ không đủ Thế/Ứng để lập tương quan.");
  }
  return {
    theLineIndex: the?.hao ?? null,
    ungLineIndex: ung?.hao ?? null,
    theStrength: the ? strengthFrom(canLucHao(cast, the.hao).currentState) : null,
    ungStrength: ung ? strengthFrom(canLucHao(cast, ung.hao).currentState) : null,
    relation,
    reasons,
  };
}

/**
 * Kết luận sự việc từ quẻ. Entry point Phase 12 — CONSUME resolveDungThan + resolveFourGods +
 * canLucHao + synthesizeKyNguyenDung + phanLoaiSauTamHop + fanYin/fuYin. Không tính lại, không điểm số.
 */
export function ketLuanSuViec(cast: FullCastResult, dt: DungThanResolved, fourGods: FourGods): QuanSuConclusion {
  const knd = synthesizeKyNguyenDung(cast, dt, fourGods);
  const theUng = theUngSynthesisFrom(cast);

  const contextualSignals: QuanSuConclusion["contextualSignals"] = {};
  const sauTH = phanLoaiSauTamHop(cast);
  if (sauTH.co) contextualSignals.tamHop = sauTH.danhSach.map((t) => t.case);
  if (cast.fanYin?.enabled) contextualSignals.phanNgam = "REPEATED_CHANGE";
  if (cast.fuYin?.enabled) contextualSignals.phucNgam = "REPEATED_STATE";

  const reasons: string[] = [];

  // Dụng không hiện rõ → không kết luận cứng.
  if (dt.trangThai !== "hien" || !dt.hao) {
    reasons.push(`Dụng Thần ${dt.trangThai === "phuc_tang" ? "phục tàng (ẩn)" : "không hiện"} → chưa đủ cơ sở kết luận sự việc.`);
    return { dungThan: null, theUng, kyNguyenDung: knd, contextualSignals, conclusion: "UNRESOLVED", reasons };
  }

  const dungCs = canLucHao(cast, dt.hao.hao).currentState;
  const dungThan = dungThanSynthesisFrom(dt.hao.hao, dungCs, knd);
  reasons.push(...dungThan.reasons);
  if (contextualSignals.tamHop) reasons.push(`Có Tam Hợp: ${contextualSignals.tamHop.join(", ")} (ngữ cảnh — tốt/xấu tùy hành cục với Dụng).`);
  if (contextualSignals.phanNgam) reasons.push("Có Phản Ngâm → việc lặp lại/đảo ngược, trắc trở (ngữ cảnh).");
  if (contextualSignals.phucNgam) reasons.push("Có Phục Ngâm → việc trì trệ, đau đáu kéo dài (ngữ cảnh).");

  return { dungThan, theUng, kyNguyenDung: knd, contextualSignals, conclusion: dungThan.conclusion, reasons };
}
