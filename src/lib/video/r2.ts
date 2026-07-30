import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const VIDEO_URL_EXPIRY_SECONDS = 60 * 60 * 2; // 2 giờ — đủ xem hết 1 bài, không để link tồn tại mãi mãi

let cachedClient: S3Client | null = null;

function getClient(): S3Client {
  if (cachedClient) return cachedClient;

  const endpoint = import.meta.env.R2_ENDPOINT;
  const accessKeyId = import.meta.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = import.meta.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Thiếu cấu hình R2 (R2_ENDPOINT/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY) trong .env.");
  }

  cachedClient = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
  return cachedClient;
}

/**
 * Tạo URL xem video có hạn giờ (mặc định 2 tiếng) từ object lưu trong R2.
 * CHỈ gọi hàm này sau khi đã xác nhận user thực sự có quyền xem (đã đăng nhập + đã ghi danh khóa học)
 * — bản thân hàm này không tự kiểm tra quyền, nơi gọi (trang bài học) chịu trách nhiệm gate trước.
 */
export async function getSignedVideoUrl(objectKey: string): Promise<string> {
  const bucket = import.meta.env.R2_BUCKET_NAME;
  if (!bucket) {
    throw new Error("Thiếu cấu hình R2_BUCKET_NAME trong .env.");
  }

  const command = new GetObjectCommand({ Bucket: bucket, Key: objectKey });
  return getSignedUrl(getClient(), command, { expiresIn: VIDEO_URL_EXPIRY_SECONDS });
}
