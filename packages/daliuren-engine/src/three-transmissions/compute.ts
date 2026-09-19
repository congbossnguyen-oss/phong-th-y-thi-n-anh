/**
 * Three Transmissions (三傳 Tam Truyền) — Phase 9B + 9C. `initial` = kết quả 九宗門
 * (`computeNineMethodSelection`, nine-methods/compute.ts) — KHÔNG chọn lại ở đây.
 *
 * 2 LOẠI Trung/Mạt truyền (Phase 9C Remediation — xem `NineMethodSelection.middle`/`.final`):
 *   - TYPE A (mặc định, đa số pháp: 賊克/比用/涉害/遙克/昴星/返吟-có-khắc): pháp CHỈ trả
 *     `initial`, `middle`/`final` chuỗi tra `heavenPlateAt` 2 lần (Algorithm Spec §7.3,
 *     confidence A) — ĐÚNG hành vi gốc Phase 9B, KHÔNG đổi.
 *   - TYPE B (別責/八專/返吟-vô-賊克): pháp tự cung cấp `middle`/`final` TƯỜNG MINH (không theo
 *     chuỗi tra chuẩn — xem provenance riêng từng pháp ở nine-methods/provenance.ts) — dùng
 *     ĐÚNG giá trị đó, KHÔNG tự tra lại `heavenPlateAt`.
 * KHÔNG tạo lookup primitive mới cho TYPE A, tái dùng NGUYÊN VẸN `heavenPlateAt` từ Phase 9A.
 *
 * KHÔNG implement: 十二天將, 課體, interpretation. KHÔNG dùng khung "初傳=beginning/中傳=process/
 * 末傳=result" dưới bất kỳ hình thức nào (đã bị reject từ Phase 5B-4/8, xem
 * docs/daliuren/DA_LIU_REN_UNIQUE_VALUE_RESEARCH.md §4) — `initial`/`middle`/`final` CHỈ là 3
 * vị trí được chọn theo cơ chế toán học/Ngũ Hành, KHÔNG mang ý nghĩa "khởi đầu/diễn biến/kết
 * quả" nào được gán cứng trong code này.
 */
import type { Can } from "../types/ganzhi.js";
import type { FourLessons } from "../types/four-lessons.js";
import type { HeavenEarthPlate } from "../types/plates.js";
import type { ThreeTransmissions } from "../types/three-transmissions.js";
import { heavenPlateAt } from "../heaven-earth-plate/compute.js";
import { computeNineMethodSelection } from "../nine-methods/compute.js";
import { THREE_TRANSMISSIONS_CHAIN_PROVENANCE } from "./provenance.js";

export interface ThreeTransmissionsComputation {
  threeTransmissions: ThreeTransmissions;
  /** → ProvenanceEntry.id (nine-methods/provenance.ts) — provenance của CHÍNH Sơ truyền đã chọn (khác pháp khác nhau, confidence khác nhau). Với TYPE B, entry này MÔ TẢ ĐẦY ĐỦ cả 3 vị trí, không chỉ Sơ truyền. */
  initialProvenanceId: string;
  /** → ProvenanceEntry.id (three-transmissions/provenance.ts) — CHỈ có mặt khi Trung/Mạt truyền THỰC SỰ qua chuỗi tra chuẩn (TYPE A). VẮNG MẶT với TYPE B (別責/八專/返吟-vô-賊克) — không tự nhận vơ 1 cơ chế không được dùng. */
  chainProvenanceId?: string;
}

/**
 * Dựng Tam Truyền từ Tứ Khóa + Thiên Địa Bàn đã dựng. NO HIDDEN FALLBACK: mọi nhánh 九宗門
 * chưa đủ evidence (xem nine-methods/errors.ts) ném lỗi tường minh, KHÔNG bị nuốt/bọc lại ở
 * đây — tầng gọi nhận đúng `NineMethodsError` gốc để biết chính xác nhánh nào thiếu evidence.
 */
export function computeThreeTransmissions(fourLessons: FourLessons, heavenEarthPlate: HeavenEarthPlate, dayCan: Can): ThreeTransmissionsComputation {
  const selection = computeNineMethodSelection(fourLessons, heavenEarthPlate, dayCan);

  const usesExplicitTransmissions = selection.middle !== undefined && selection.final !== undefined;
  const middle = selection.middle ?? heavenPlateAt(heavenEarthPlate, selection.initial);
  const final = selection.final ?? heavenPlateAt(heavenEarthPlate, middle);

  return {
    threeTransmissions: {
      method: selection.method,
      ...(selection.methodSubcase !== undefined ? { methodSubcase: selection.methodSubcase } : {}),
      initial: selection.initial,
      middle,
      final,
    },
    initialProvenanceId: selection.provenanceId,
    ...(usesExplicitTransmissions ? {} : { chainProvenanceId: THREE_TRANSMISSIONS_CHAIN_PROVENANCE.id }),
  };
}
