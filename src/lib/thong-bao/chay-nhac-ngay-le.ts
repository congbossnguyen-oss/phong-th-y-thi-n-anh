/**
 * NGHIỆP VỤ gửi lời nhắc mùng Một / ngày Rằm — tách khỏi endpoint HTTP `gui-nhac-ngay-le.ts` để
 * cả 2 nơi gọi (endpoint HTTP có CRON_SECRET, và `scheduled()` của Worker) dùng chung ĐÚNG MỘT bản
 * logic, không lặp code. Hàm này không biết gì về HTTP (không đọc header, không trả Response) —
 * chỉ nhận tuỳ chọn `chayThu` (bỏ qua kiểm tra "hôm nay có phải dịp cần nhắc") để phục vụ nút chạy
 * thử thủ công trên endpoint; `scheduled()` luôn gọi KHÔNG có `chayThu` (không có đường nào từ cron
 * ép gửi ngoài lịch thật).
 *
 * 2026-08-25: tách ra khi thêm Cloudflare Cron Trigger thay Render Cron Job — xem
 * src/worker-entry.ts (chỗ gọi hàm này từ scheduled()) và wrangler.jsonc (mục triggers.crons).
 */
import { inArray } from "drizzle-orm";
import { db } from "../db/client";
import { pushSubscriptions } from "../../../db/schema";
import { cannhacHomNay, ngayVietNam, noiDungThongBao, type KieuNhac } from "./ngay-le-am-lich";
import { chuThePush, docKhoaVapid, guiTinHieuDay } from "./web-push";
import { docBien } from "./env";

export interface KetQuaChayNhac {
  ok: boolean;
  error?: string;
  boQua?: boolean;
  lyDo?: string;
  kieu?: KieuNhac;
  dip?: string;
  tong?: number;
  daGui?: number;
  hetHan?: number;
  loi?: number;
}

export async function chayNhacNgayLe(opts: { chayThu?: boolean } = {}): Promise<KetQuaChayNhac> {
  const keys = docKhoaVapid();
  if (!keys) return { ok: false, error: "Chưa cấu hình khóa VAPID." };

  const kieu = (docBien("KIEU_NHAC_NGAY_LE") as KieuNhac) || "bao-truoc";
  const le = cannhacHomNay(ngayVietNam(), kieu);

  if (!le && !opts.chayThu) {
    return { ok: true, boQua: true, lyDo: "Hôm nay không phải dịp cần nhắc." };
  }

  const danhSach = await db
    .select({ id: pushSubscriptions.id, endpoint: pushSubscriptions.endpoint })
    .from(pushSubscriptions);

  let daGui = 0;
  let hetHan = 0;
  let loi = 0;
  const canXoa: string[] = [];

  // Gửi theo từng lô để không mở quá nhiều kết nối cùng lúc.
  const KICH_THUOC_LO = 50;
  for (let i = 0; i < danhSach.length; i += KICH_THUOC_LO) {
    const lo = danhSach.slice(i, i + KICH_THUOC_LO);
    const ketQua = await Promise.all(lo.map((s) => guiTinHieuDay(s.endpoint, keys, chuThePush())));
    ketQua.forEach((kq, j) => {
      if (kq === "da-gui") daGui++;
      else if (kq === "het-han") {
        hetHan++;
        canXoa.push(lo[j].id);
      } else loi++;
    });
  }

  // Máy đã gỡ đăng ký thì xóa hẳn, khỏi gửi mãi vào chỗ chết.
  if (canXoa.length > 0) {
    await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.id, canXoa));
  }

  return {
    ok: true,
    kieu,
    dip: le ? noiDungThongBao(le) : "(chạy thử, không phải ngày lễ)",
    tong: danhSach.length,
    daGui,
    hetHan,
    loi,
  };
}
