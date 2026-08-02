import { createClient } from "@sanity/client";

// Điểm truy cập Sanity duy nhất của toàn site — pages/components không tự gọi @sanity/client,
// mà luôn đi qua các hàm trong queries.ts để dễ kiểm soát và đổi query một chỗ.
export const sanityClient = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: import.meta.env.SANITY_API_TOKEN || undefined,
  useCdn: false,
});
