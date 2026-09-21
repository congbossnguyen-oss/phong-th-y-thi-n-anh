/**
 * Deterministic local mock NarrativeProvider — no network, no API key, no cost.
 * Grounded BY CONSTRUCTION: it reads only the structured NarrativeInput fields (domain, conclusionKey,
 * ruleIds, evidenceIds) and cannot invent facts/predictions/confidence/strength/recommendations.
 * Used for the MVP vertical-slice tests; a real provider implementing NarrativeProvider can replace it.
 */

import type { CanonicalDomain } from "../domain/types.js";
import type { NarrativeInput, NarrativeProvider } from "./types.js";

/** Vietnamese display label per domain (label only — carries no judgment/prediction). */
const DOMAIN_LABEL_VI: Record<CanonicalDomain, string> = {
  character_temperament: "Tính cách & tâm trí",
  health: "Sức khỏe",
  wealth: "Tài sản",
  vocation: "Nghề nghiệp",
  status_reputation: "Địa vị & danh tiếng",
  partnership: "Hôn nhân & bạn đời",
  friends_social: "Bạn bè & hỗ trợ",
  family_home: "Gia đình & gia trạch",
  siblings_kin: "Anh chị em & họ hàng",
  children: "Con cái",
  travel: "Di chuyển & đường xa",
  religion_philosophy: "Tín ngưỡng & triết học",
  shared_resources: "Tài sản chung & thừa kế",
  adversaries: "Đối thủ",
  mortality: "Thọ mệnh",
};

export const deterministicMockNarrativeProvider: NarrativeProvider = {
  modelProvider: "mock",
  modelVersion: "deterministic.v1",
  generateNarrative(input: NarrativeInput): Promise<string> {
    const label = DOMAIN_LABEL_VI[input.domain];
    let text: string;
    if (input.conclusionKey === "domain_activated") {
      text =
        `Lĩnh vực ${label} được kích hoạt bởi ${input.ruleIds.length} quy tắc ` +
        `(${input.ruleIds.join(", ")}), dựa trên bằng chứng: ${input.evidenceIds.join(", ")}.`;
    } else {
      text =
        `Trong các quy tắc đã được đánh giá cho lĩnh vực ${label}, ` +
        `không có quy tắc nào được kích hoạt.`;
    }
    return Promise.resolve(text);
  },
};
