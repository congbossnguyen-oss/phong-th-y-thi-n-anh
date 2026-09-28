/**
 * Cầu nối: `ResearchSample[]` → đầu vào của `buildReliability`.
 *
 * Đây là chỗ DUY NHẤT biến một tập dữ liệu thật thành thứ hợp đồng đo đọc được. Trước
 * lát này, `buildReliability` chỉ nhận feature của MỘT lượt quét và lấy số kiểm chứng
 * từ bảng hằng số viết tay — nên dữ liệu thật không có đường nào chạm vào.
 *
 * ⚠️ KHÔNG NÂNG GÌ. Cầu nối này chỉ chuyển ba con số ĐẾM ĐƯỢC (lượt / người / máy).
 * `validationStatus` và `evidenceLevel` KHÔNG đi qua đây — chúng vẫn do bảng tĩnh
 * quyết định, và việc phong là quyết định của người ở lát sau. Có test khoá điều đó.
 *
 * ⚠️ GỘP THEO HƯỚNG BẢO THỦ, NHƯNG CHỈ TRÊN LƯỢT CÓ SỐ. Một feature xuất hiện ở 15
 * lượt với 15 bản `status`. Chúng lẽ ra giống nhau (status là thuộc tính của CÔNG THỨC,
 * không của lượt quét), nhưng khi một lượt thiếu view thì feature đó thành `unsupported`
 * ở riêng lượt ấy. Gặp bất đồng thì lấy bản XẤU NHẤT và confidence THẤP NHẤT — không
 * bao giờ lấy bản đẹp nhất, vì như thế là để một lượt may mắn che cho mười bốn lượt còn
 * lại.
 *
 * NHƯNG lượt `v === null` KHÔNG được bỏ phiếu. Bản đầu của hàm này để chúng bỏ phiếu,
 * và hậu quả là một lượt thiếu view kéo cả feature xuống `unsupported` trong khi phần
 * đếm vẫn ghi 14 lượt — một bản ghi tự mâu thuẫn: "không đo được" mà lại "đo 14 lần".
 * Phần đếm vốn đã bỏ qua `v === null`; phần gộp status phải theo cùng một luật, nếu
 * không thì hai nửa của cùng một hàm đang nói hai chuyện khác nhau.
 *
 * Feature KHÔNG có lượt nào ra số thì `unsupported` với số đếm 0 — đó là kết luận đúng
 * và nó tự rơi ra, không cần trường hợp riêng.
 */

import type { FeatureStatus } from "../features/schema";
import { countFeaturesAcrossSamples } from "./dataset";
import type { FeatureCounts, ResearchSample } from "./dataset";

/** Càng nhỏ càng xấu. Dùng để chọn bản xấu nhất khi các lượt không đồng ý. */
const XEP_HANG: Record<FeatureStatus, number> = {
  unsupported: 0,
  low_confidence: 1,
  measured: 2,
};

export interface ReliabilityFeatureInput {
  key: string;
  status: FeatureStatus;
  confidence: number;
}

export interface ReliabilityInput {
  features: ReliabilityFeatureInput[];
  /** Theo TỪNG feature, chỉ đếm lượt mà feature đó thực sự có số. */
  counts: Record<string, FeatureCounts>;
}

/**
 * Gộp cả tập thành đầu vào cho `buildReliability`.
 *
 * Tập rỗng → trả về rỗng. KHÔNG dựng feature giả với số 0 để bảng trông đầy đủ: một
 * hàng có `sampleCount: 0` và một hàng không tồn tại nói hai điều khác nhau, và chỉ
 * điều thứ hai là đúng khi chưa thu gì.
 */
export function toReliabilityInput(samples: readonly ResearchSample[]): ReliabilityInput {
  // ĐẾM: dùng chung bộ đếm của `dataset.ts`. Hàm này chỉ còn lo phần GỘP STATUS.
  const counts: Record<string, FeatureCounts> = countFeaturesAcrossSamples(samples);

  /** null = chưa lượt nào ra số, nên chưa có ý kiến về status. */
  const gop = new Map<string, { status: FeatureStatus | null; confidence: number | null }>();
  for (const s of samples) {
    for (const f of s.featureProfile.features) {
      let cu = gop.get(f.k);
      if (!cu) {
        cu = { status: null, confidence: null };
        gop.set(f.k, cu);
      }
      // Lượt không ra số thì không bỏ phiếu — cùng luật với bộ đếm.
      if (f.v === null) continue;
      cu.status = cu.status === null || XEP_HANG[f.s] < XEP_HANG[cu.status] ? f.s : cu.status;
      cu.confidence = cu.confidence === null ? f.c : Math.min(cu.confidence, f.c);
    }
  }

  const features: ReliabilityFeatureInput[] = [];
  for (const [key, e] of gop) {
    features.push({
      key,
      // Không lượt nào ra số → đúng nghĩa là không đo được, confidence 0.
      status: e.status ?? "unsupported",
      confidence: e.confidence ?? 0,
    });
  }
  return { features, counts };
}
