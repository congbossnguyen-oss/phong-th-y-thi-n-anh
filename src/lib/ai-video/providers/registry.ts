/**
 * REGISTRY — điểm DUY NHẤT trong core được phép biết tên các provider cụ thể (Wan, LTX). Mọi nơi
 * khác (job-manager, API routes, UI) chỉ gọi `getVideoProvider(id)`/`listVideoProviders()`, không
 * bao giờ `import { WanProvider } from "./wan"` trực tiếp — thêm provider mới (Hunyuan, CogVideo, ...)
 * chỉ cần thêm 1 dòng ở đây, không sửa core (đúng yêu cầu Phase 7 của kiến trúc CONG AI VIDEO).
 */
import type { CredentialProvider } from "../credentials";
import { credentialProvider as defaultCredentialProvider } from "../credentials";
import { LTXProvider } from "./ltx";
import { WanProvider } from "./wan";
import type { ProviderInfo, VideoProvider, VideoProviderId } from "./types";

const PROVIDER_IDS: readonly VideoProviderId[] = ["wan", "ltx"];

export function getVideoProvider(
  id: VideoProviderId,
  credentials: CredentialProvider = defaultCredentialProvider,
): VideoProvider {
  switch (id) {
    case "wan":
      return new WanProvider(credentials);
    case "ltx":
      return new LTXProvider(credentials);
    default: {
      const exhaustive: never = id;
      throw new Error(`Video provider không xác định: ${exhaustive}`);
    }
  }
}

/** Danh sách provider + capability — dùng để render UI chọn provider mà không cần khởi tạo credential. */
export function listVideoProviders(): ProviderInfo[] {
  return PROVIDER_IDS.map((id) => getVideoProvider(id).getProviderInfo());
}
