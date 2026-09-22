/**
 * Vietnamese domain labels — verbatim copy of the mapping used by astrology-core's
 * `narrative/mockProvider.ts` (`DOMAIN_LABEL_VI`), which is NOT exported from the package.
 * Duplicated here (not a second domain vocabulary — same 15 `CanonicalDomain` keys, same VI
 * strings) only because it is private to the package and this app layer must not modify
 * `packages/astrology-core` to export it.
 */
import type { CanonicalDomain } from "@thien-anh/astrology-core";

export const DOMAIN_LABEL_VI: Record<CanonicalDomain, string> = {
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
