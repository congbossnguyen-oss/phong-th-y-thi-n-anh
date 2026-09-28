/**
 * TẬP DỮ LIỆU → BẢNG ĐỘ TIN CẬY (Slice 2, Phase 1D-4).
 *
 * Đây là ĐIỂM VÀO DUY NHẤT cho việc dựng bảng độ tin cậy từ dữ liệu thật. Ba bước
 * (nạp → gộp → dựng) đã có sẵn từ Slice 1; module này chỉ nối chúng lại đúng một lần,
 * ở một chỗ.
 *
 * Vì sao cần: repo này từng có chuyện bảng chẩn đoán trên máy tính tự đấu lại
 * contract + cổng + engine bằng tay, và nó lặng lẽ tự quyết một chuyện về nguồn mà lẽ
 * ra không phải việc của nó. Một bản sao đường ống là một bản sao có thể trôi khác bản
 * chính. Ai cần bảng độ tin cậy từ dataset thì gọi hàm ở đây, không tự xâu ba bước.
 *
 * ⚠️ MODULE NÀY KHÔNG PHONG GÌ. Nó chuyển đúng ba con số ĐẾM ĐƯỢC vào hợp đồng đo.
 * `validationStatus`, `evidenceLevel`, `distanceTested`, `poseTested`, `lightingTested`
 * và `eligible` đều KHÔNG đi qua đây. Năm cái trước vẫn do bảng tĩnh trong
 * `measurement-contract/reliability.ts` quyết; cái cuối là việc của cổng tư cách. Dữ
 * liệu chứng minh được "đã đo bao nhiêu lần, trên bao nhiêu người, bằng bao nhiêu máy"
 * — nó KHÔNG tự chứng minh phép đo là đúng.
 */

import {
  buildReliability,
  type FeatureReliability,
} from "../measurement-contract/reliability";
import {
  loadResearchDataset,
  summarizeDataset,
  type DatasetInput,
  type DatasetError,
  type DatasetSummary,
  type FeatureCounts,
  type ResearchSample,
  type SampleRejection,
} from "./dataset";
import { toReliabilityInput } from "./to-reliability";

export const DATASET_RELIABILITY_VERSION = "physiognomy-dataset-reliability-v1" as const;

export interface DatasetReliability {
  version: typeof DATASET_RELIABILITY_VERSION;
  summary: DatasetSummary;
  /** Bảng độ tin cậy, số đếm đã lấy từ tập dữ liệu. */
  reliability: Record<string, FeatureReliability>;
  /**
   * Chính bộ đếm đã bơm vào hợp đồng. Bày ra để người đọc truy được con số trong bảng
   * đến từ đâu, thay vì phải tin.
   */
  counts: Record<string, FeatureCounts>;
}

/**
 * Dựng bảng từ các lượt quét ĐÃ được nạp và kiểm.
 *
 * Nhận `ResearchSample[]` chứ không nhận tệp: ai đã có tập sạch thì không phải nạp lại,
 * và hàm này giữ được tính thuần để test.
 */
export function buildDatasetReliability(
  samples: readonly ResearchSample[],
): DatasetReliability {
  const input = toReliabilityInput(samples);
  return {
    version: DATASET_RELIABILITY_VERSION,
    summary: summarizeDataset(samples),
    reliability: buildReliability(input.features, input.counts),
    counts: input.counts,
  };
}

export type LoadReliabilityResult =
  | { ok: true; result: DatasetReliability; rejected: SampleRejection[] }
  | { ok: false; errors: DatasetError[]; rejected: SampleRejection[] };

/**
 * Nạp tệp rồi dựng bảng, một lệnh.
 *
 * Dùng ĐÚNG `loadResearchDataset` của Slice 1 — không có bộ nạp thứ hai ở đây. Tập có
 * nhãn trùng thì KHÔNG dựng bảng: đếm trên một tập còn trùng là đếm sai, và lặng lẽ
 * đếm sai còn tệ hơn không đếm.
 */
export function loadDatasetReliability(
  files: readonly DatasetInput[],
): LoadReliabilityResult {
  const loaded = loadResearchDataset(files);
  if (!loaded.ok) {
    return { ok: false, errors: loaded.errors, rejected: loaded.rejected };
  }
  return {
    ok: true,
    result: buildDatasetReliability(loaded.samples),
    rejected: loaded.rejected,
  };
}
