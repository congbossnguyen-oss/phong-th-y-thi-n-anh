import { createHash } from "node:crypto";

const EMBED_URL_EXPIRY_SECONDS = 60 * 60 * 2; // 2 giờ, đủ xem hết 1 bài

/**
 * Tạo URL nhúng (iframe) Bunny Stream có token bảo mật + hạn giờ.
 * CHỈ gọi hàm này sau khi đã xác nhận user thực sự có quyền xem (đăng nhập + đã ghi danh)
 * — bản thân hàm này không tự kiểm tra quyền, nơi gọi (trang bài học) chịu trách nhiệm gate trước.
 *
 * Cần bật "Token Authentication" trong Library > Security trên Bunny Stream dashboard
 * để lấy "Authentication Key" (khác với API Key dùng để upload video).
 */
export function getSignedEmbedUrl(videoId: string): string {
  const libraryId = import.meta.env.BUNNY_STREAM_LIBRARY_ID;
  const authKey = import.meta.env.BUNNY_STREAM_TOKEN_AUTH_KEY;

  if (!libraryId || !authKey) {
    throw new Error("Thiếu cấu hình BUNNY_STREAM_LIBRARY_ID/BUNNY_STREAM_TOKEN_AUTH_KEY trong .env.");
  }

  const expires = Math.floor(Date.now() / 1000) + EMBED_URL_EXPIRY_SECONDS;
  const token = createHash("sha256").update(`${authKey}${videoId}${expires}`).digest("hex");

  return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${token}&expires=${expires}`;
}
