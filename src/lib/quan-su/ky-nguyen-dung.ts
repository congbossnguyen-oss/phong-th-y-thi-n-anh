// QUÂN SƯ THIÊN ANH — KỴ → NGUYÊN → DỤNG SYNTHESIS (Phase 11).
//
// Tổng hợp deterministic chuỗi Kỵ Thần → Nguyên Thần → Dụng Thần, CONSUME `HaoStrengthState` (Phase 10).
// KHÔNG tạo hệ Vượng/Suy thứ hai, KHÔNG điểm số / trọng số / ngưỡng / phần trăm. Chỉ trạng thái định tính.
//
// Đánh giá theo CHAIN (không cộng lực 3 hào rời): lực từng hào (canLucHao) → quan hệ ngũ hành (nguHanhTac)
// → KHẢ NĂNG phát huy (từ currentState: EMPTY/HIDDEN/reduced/restrained/effective) → tổng hợp.
//
// Lưu ý cấu trúc Tứ Thần: Dụng = hành X; Nguyên = hành sinh X; Kỵ = hành khắc X. Ngũ hành: hành khắc X
// LUÔN sinh hành sinh X ⇒ Kỵ thường "sinh" Nguyên (tham sinh vong khắc / thông quan). Ta vẫn TÍNH quan hệ
// bằng nguHanhTac (không giả định), nên mọi biến thể (Kỵ khắc/đồng hành Nguyên...) đều xử lý tổng quát.

import type { FullCastResult } from "../luc-hao";
import type { NguHanh } from "../menh-nap-am";
import { nguHanhTac, type DungThanResolved, type FourGods } from "./advisory-engine";
import { canLucHao, type HaoStrengthState } from "./can-luc-hao";

export type ChainRole = "KI" | "NGUYEN" | "DUNG";
export type ChainRelation = "GENERATES" | "OVERCOMES" | "SAME_ELEMENT" | "NONE";
/** Khả năng thực thi quan hệ (từ currentState của source) — KHÔNG phải điểm số. */
export type ChainEffective = "STRONG" | "AVAILABLE" | "LIMITED" | "HIDDEN" | "EMPTY" | "NONE";

export interface ChainNode {
  lineIndex: number;
  role: ChainRole;
  nguHanh: NguHanh;
  strength: HaoStrengthState;
}

export interface ChainInteraction {
  sourceLineIndex: number;
  targetLineIndex: number;
  relation: ChainRelation;
  sourceState: HaoStrengthState["currentState"];
  targetState: HaoStrengthState["currentState"];
  effective: ChainEffective;
  reasons: string[];
}

export interface KyNguyenDungChain {
  dungLineIndex: number;
  ky: ChainNode[];
  nguyen: ChainNode[];
  dung: ChainNode;
  kyToNguyen: ChainInteraction[];
  nguyenToDung: ChainInteraction[];
  directPressure: ChainInteraction[]; // Kỵ khắc trực tiếp Dụng (không qua Nguyên)
}

export type KyPressure = "STRONG" | "PRESENT" | "LIMITED" | "HIDDEN" | "EMPTY" | "NONE";
export type NguyenSupport = KyPressure;
export type DungProtection =
  | "PROTECTED" | "PARTIALLY_PROTECTED" | "UNPROTECTED" | "UNDER_PRESSURE" | "DELAYED" | "UNCLEAR";
export type ChainState =
  | "KY_DOMINANT" | "NGUYEN_SUPPORTS_DUNG" | "KY_RESTRAINED" | "NGUYEN_RESTRAINED"
  | "BALANCED" | "DELAYED" | "NO_DIRECT_CHAIN";

export interface KyNguyenDungSynthesis {
  chains: KyNguyenDungChain[];
  kyPressure: KyPressure;
  nguyenSupport: NguyenSupport;
  dungProtection: DungProtection;
  currentState: ChainState;
  reasons: string[];
}

// -------------------------------------------------------------------------------------------------
/** Quan hệ source→target theo ngũ hành (chiều source tác động target). */
function relationOf(sourceNH: NguHanh, targetNH: NguHanh): ChainRelation {
  const r = nguHanhTac(sourceNH, targetNH); // a=source, b=target
  if (r === "a-sinh-b") return "GENERATES";
  if (r === "a-khac-b") return "OVERCOMES";
  if (r === "ti-hoa") return "SAME_ELEMENT";
  return "NONE"; // b-sinh-a / b-khac-a: source KHÔNG tác động target theo chiều này
}

/** Khả năng phát huy của một hào (source) — precedence: EMPTY → HIDDEN → reduced/restrained → force. */
function availabilityOf(cs: HaoStrengthState["currentState"]): "STRONG" | "AVAILABLE" | "LIMITED" | "HIDDEN" | "EMPTY" {
  if (cs.temporalExistence === "EMPTY") return "EMPTY"; // Không Vong: chưa hiện hữu (KHÔNG = 0 lực)
  if (cs.hidden) return "HIDDEN"; // Nhập Mộ: ẩn tàng
  if (cs.reduced || cs.restrained) return "LIMITED"; // Phá / Hồi Đầu Khắc / Hóa Xung-Mộ-Tuyệt / Hóa Hợp
  if (cs.effective === "Vượng" || cs.effective === "Rất Vượng") return "STRONG";
  if (cs.effective === "Trung Hòa") return "AVAILABLE";
  return "LIMITED"; // Suy
}

function effectiveOf(relation: ChainRelation, cs: HaoStrengthState["currentState"]): ChainEffective {
  if (relation === "NONE") return "NONE";
  return availabilityOf(cs);
}

function interactionOf(source: ChainNode, target: ChainNode): ChainInteraction {
  const relation = relationOf(source.nguHanh, target.nguHanh);
  const effective = effectiveOf(relation, source.strength.currentState);
  const reasons: string[] = [];
  const relLabel: Record<ChainRelation, string> = {
    GENERATES: "sinh", OVERCOMES: "khắc", SAME_ELEMENT: "đồng hành", NONE: "không tác động trực tiếp",
  };
  reasons.push(`Hào ${source.lineIndex} (${source.nguHanh}) ${relLabel[relation]} hào ${target.lineIndex} (${target.nguHanh}).`);
  if (relation !== "NONE") {
    const cs = source.strength.currentState;
    if (effective === "EMPTY") reasons.push("Source Không Vong → tác động CHƯA hiện hữu (chờ Xuất Không/Ứng Kỳ), KHÔNG phải mất lực.");
    else if (effective === "HIDDEN") reasons.push("Source Nhập Mộ → ẩn tàng, tác động chưa phát huy (chờ xung khai Mộ).");
    else if (effective === "LIMITED") reasons.push(`Source bị hạn chế (${cs.reduced ? "Phá/Hồi Đầu Khắc/Hóa bất lợi" : cs.restrained ? "Hóa Hợp níu chân" : "Suy"}) → tác động giảm, giữ nền lực.`);
    else if (effective === "STRONG") reasons.push("Source có lực mạnh, không bị hạn chế → tác động rõ.");
    else reasons.push("Source có lực trung bình → tác động ở mức khả dụng.");
  }
  return {
    sourceLineIndex: source.lineIndex,
    targetLineIndex: target.lineIndex,
    relation,
    sourceState: source.strength.currentState,
    targetState: target.strength.currentState,
    effective,
    reasons,
  };
}

const AVAIL_RANK: Record<ChainEffective, number> = { STRONG: 5, AVAILABLE: 4, LIMITED: 3, HIDDEN: 2, EMPTY: 1, NONE: 0 };
/** Lấy effective "mạnh nhất" trong danh sách (để tổng hợp áp lực/hỗ trợ). */
function maxEffective(list: ChainEffective[]): ChainEffective {
  return list.reduce<ChainEffective>((best, e) => (AVAIL_RANK[e] > AVAIL_RANK[best] ? e : best), "NONE");
}
function toPressure(e: ChainEffective): KyPressure {
  return e === "STRONG" ? "STRONG" : e === "AVAILABLE" ? "PRESENT" : e === "LIMITED" ? "LIMITED" : e === "HIDDEN" ? "HIDDEN" : e === "EMPTY" ? "EMPTY" : "NONE";
}

function mkNode(cast: FullCastResult, lineIndex: number, role: ChainRole): ChainNode {
  const h = cast.chinh.hao[lineIndex - 1];
  return { lineIndex, role, nguHanh: h.nguHanh, strength: canLucHao(cast, lineIndex) };
}

/**
 * Tổng hợp chuỗi Kỵ → Nguyên → Dụng từ CÁC NODE đã dựng. Pure/deterministic, không điểm số. Tách riêng
 * để test được với node dựng tay. `dung = null` (Dụng phục tàng/không hiện) → NO_DIRECT_CHAIN.
 */
export function synthesizeChain(dung: ChainNode | null, ky: ChainNode[], nguyen: ChainNode[]): KyNguyenDungSynthesis {
  const reasons: string[] = [];

  if (!dung) {
    reasons.push("Dụng Thần không hiện rõ → không dựng được chain Kỵ→Nguyên→Dụng trực tiếp.");
    return { chains: [], kyPressure: "NONE", nguyenSupport: "NONE", dungProtection: "UNCLEAR", currentState: "NO_DIRECT_CHAIN", reasons };
  }

  const dungLineIndex = dung.lineIndex;

  // Quan hệ từng cặp.
  const kyToNguyen: ChainInteraction[] = [];
  for (const k of ky) for (const n of nguyen) kyToNguyen.push(interactionOf(k, n));
  const nguyenToDung: ChainInteraction[] = nguyen.map((n) => interactionOf(n, dung));
  const directPressure: ChainInteraction[] = ky.map((k) => interactionOf(k, dung)); // Kỵ khắc trực tiếp Dụng

  const chain: KyNguyenDungChain = { dungLineIndex, ky, nguyen, dung, kyToNguyen, nguyenToDung, directPressure };

  // ---- Tổng hợp ----
  // Áp lực Kỵ = effective mạnh nhất của Kỵ KHẮC trực tiếp Dụng.
  const kyPressure = toPressure(maxEffective(directPressure.filter((i) => i.relation === "OVERCOMES").map((i) => i.effective)));
  // Hỗ trợ Nguyên = effective mạnh nhất của Nguyên SINH/đồng hành Dụng (khắc Dụng KHÔNG tính là hỗ trợ).
  const nguyenSupport = toPressure(
    maxEffective(nguyenToDung.filter((i) => i.relation === "GENERATES" || i.relation === "SAME_ELEMENT").map((i) => i.effective)),
  );
  // Nguyên nào KHẮC Dụng (bất thường so với vai trò) → áp lực phụ.
  const nguyenOvercomesDung = nguyenToDung.some((i) => i.relation === "OVERCOMES" && i.effective !== "EMPTY" && i.effective !== "NONE");

  const strong = (x: KyPressure) => x === "STRONG" || x === "PRESENT";
  const live = (x: KyPressure) => x === "STRONG" || x === "PRESENT" || x === "LIMITED" || x === "HIDDEN";
  // Tham sinh (thông quan): có Kỵ SINH một Nguyên còn lực → Kỵ chuyển sang sinh Nguyên thay vì khắc Dụng.
  const nguyenLiveSet = new Set(
    nguyen.filter((n) => { const a = availabilityOf(n.strength.currentState); return a === "STRONG" || a === "AVAILABLE"; }).map((n) => n.lineIndex),
  );
  const kyDiverted = kyToNguyen.some((i) => i.relation === "GENERATES" && (i.effective === "STRONG" || i.effective === "AVAILABLE") && nguyenLiveSet.has(i.targetLineIndex));

  // dungProtection.
  let dungProtection: DungProtection;
  if (nguyen.length === 0 && ky.length === 0) dungProtection = "UNCLEAR";
  else if (nguyenSupport === "EMPTY") dungProtection = "DELAYED"; // hỗ trợ chờ hiện hữu
  else if (kyPressure === "EMPTY" && !strong(nguyenSupport)) dungProtection = "DELAYED"; // đe dọa chờ hiện hữu, chưa có hỗ trợ rõ
  else if (strong(nguyenSupport) && !strong(kyPressure)) dungProtection = "PROTECTED";
  else if (strong(nguyenSupport) && strong(kyPressure)) dungProtection = kyDiverted ? "PROTECTED" : "PARTIALLY_PROTECTED";
  else if (strong(kyPressure) && !strong(nguyenSupport)) dungProtection = "UNDER_PRESSURE";
  else if (live(kyPressure) && nguyen.length === 0) dungProtection = "UNDER_PRESSURE"; // Kỵ (dù hạn chế) mà không có Nguyên
  else if (!live(kyPressure) && !live(nguyenSupport)) dungProtection = "UNPROTECTED";
  else dungProtection = "UNCLEAR";
  if (nguyenOvercomesDung && (dungProtection === "PROTECTED" || dungProtection === "PARTIALLY_PROTECTED")) {
    dungProtection = "UNDER_PRESSURE"; // "Nguyên" thực chất khắc Dụng → không còn là hỗ trợ
    reasons.push("Hào vai trò Nguyên lại KHẮC Dụng → không phải đường hỗ trợ, Dụng chịu áp lực.");
  }

  // currentState.
  let currentState: ChainState;
  const nguyenLive = strong(nguyenSupport);
  const kyLive = strong(kyPressure);
  if (nguyen.length === 0 && ky.length === 0) currentState = "NO_DIRECT_CHAIN";
  else if (nguyenSupport === "EMPTY" && !kyLive) currentState = "DELAYED";
  else if (kyPressure === "EMPTY" && !nguyenLive) currentState = "DELAYED";
  else if (nguyenLive && kyLive) currentState = kyDiverted ? "NGUYEN_SUPPORTS_DUNG" : "BALANCED";
  else if (nguyenLive && !kyLive) currentState = "NGUYEN_SUPPORTS_DUNG";
  else if (kyLive && !nguyenLive) currentState = "KY_DOMINANT";
  else if ((kyPressure === "LIMITED" || kyPressure === "HIDDEN") && nguyen.length > 0) currentState = "KY_RESTRAINED";
  else if (nguyenSupport === "LIMITED" || nguyenSupport === "HIDDEN") currentState = "NGUYEN_RESTRAINED";
  else if (live(kyPressure) && nguyen.length === 0) currentState = "KY_DOMINANT";
  else currentState = "NO_DIRECT_CHAIN";

  if (nguyen.length === 0) reasons.push("Không có Nguyên Thần trên quẻ → chuỗi Kỵ → [NONE] → Dụng (Kỵ tác động trực tiếp Dụng nếu có).");
  reasons.push(`Áp lực Kỵ=${kyPressure}; Hỗ trợ Nguyên=${nguyenSupport}; ${kyDiverted ? "Kỵ tham sinh Nguyên (thông quan)." : "Kỵ không bị Nguyên hút (không thông quan)."}`);

  return { chains: [chain], kyPressure, nguyenSupport, dungProtection, currentState, reasons };
}

/**
 * Entry point: tổng hợp chuỗi Kỵ → Nguyên → Dụng từ quẻ. CONSUME resolveDungThan + resolveFourGods
 * (Phase 2/3) + canLucHao (Phase 10). Hỗ trợ nhiều Kỵ/Nguyên (không cộng lực). Dụng phục tàng/không
 * hiện → NO_DIRECT_CHAIN. KHÔNG tự tính lại Vượng/Suy, KHÔNG điểm số.
 */
export function synthesizeKyNguyenDung(cast: FullCastResult, dt: DungThanResolved, fourGods: FourGods): KyNguyenDungSynthesis {
  const dung = dt.trangThai === "hien" && dt.hao ? mkNode(cast, dt.hao.hao, "DUNG") : null;
  const ky = fourGods.kyThan.map((m) => mkNode(cast, m.hao, "KI"));
  const nguyen = fourGods.nguyenThan.map((m) => mkNode(cast, m.hao, "NGUYEN"));
  return synthesizeChain(dung, ky, nguyen);
}
