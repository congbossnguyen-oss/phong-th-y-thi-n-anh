/**
 * Điểm vào Worker TỰ VIẾT — thay cho "@astrojs/cloudflare/entrypoints/server" mặc định (chỉ có
 * fetch()) để thêm scheduled() cho Cloudflare Cron Trigger, thay Render Cron Job cũ đã gọi
 * `/api/thong-bao/gui-nhac-ngay-le` qua HTTP kèm CRON_SECRET.
 *
 * fetch() giữ NGUYÊN — gọi thẳng handler gốc do @astrojs/cloudflare dựng, không đổi hành vi phục vụ
 * web hiện có (đúng yêu cầu: chỉ thêm scheduled(), không đụng đường phục vụ web).
 *
 * 2026-08-25: xem thêm wrangler.jsonc (mục "main" trỏ vào đây + "triggers.crons"),
 * src/lib/thong-bao/chay-nhac-ngay-le.ts (nghiệp vụ gửi thông báo thật, dùng chung với endpoint
 * HTTP), src/pages/api/thong-bao/gui-nhac-ngay-le.ts (endpoint HTTP VẪN GIỮ — dùng để chạy thử thủ
 * công qua `?buoc=1`, không còn là đường chạy định giờ chính nữa).
 */
import astroHandler from "@astrojs/cloudflare/entrypoints/server";
import { chayNhacNgayLe } from "./lib/thong-bao/chay-nhac-ngay-le";

// Kiểu tối thiểu tự khai cho đúng 2 tham số Cloudflare truyền vào scheduled() — dự án CHƯA cài
// @cloudflare/workers-types, không kéo thêm phụ thuộc chỉ để có kiểu đầy đủ (ngoài phạm vi cần cho
// việc thêm Cron). Không dùng các trường khác ngoài 2 trường này nên không cần khai đủ.
interface ScheduledEventToiThieu {
  cron: string;
  scheduledTime: number;
}
interface ExecutionContextToiThieu {
  waitUntil(promise: Promise<unknown>): void;
}

export default {
  fetch: astroHandler.fetch,

  /**
   * Cloudflare Cron Trigger gọi vào đây theo đúng lịch khai ở wrangler.jsonc (triggers.crons) —
   * KHÔNG qua HTTP, nên KHÔNG kiểm CRON_SECRET ở đây (đường vào chỉ chính Cloudflare gọi được từ
   * bên trong, không lộ ra Internet như endpoint HTTP — đúng yêu cầu "không giả lập request HTTP chỉ
   * để vượt CRON_SECRET"). `ctx.waitUntil` giữ Worker sống tới khi gửi push xong (có thể vài giây
   * với nhiều thiết bị), tránh bị tắt giữa chừng sau khi scheduled() return.
   */
  async scheduled(event: ScheduledEventToiThieu, _env: unknown, ctx: ExecutionContextToiThieu) {
    ctx.waitUntil(
      chayNhacNgayLe()
        .then((ket) => {
          console.log(`[cron ${event.cron}] gui-nhac-ngay-le:`, JSON.stringify(ket));
        })
        .catch((err) => {
          console.error(`[cron ${event.cron}] gui-nhac-ngay-le LỖI:`, err);
        }),
    );
  },
};
