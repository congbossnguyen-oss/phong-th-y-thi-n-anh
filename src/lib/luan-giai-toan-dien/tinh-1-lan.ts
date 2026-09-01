// Gói "tính đúng 1 lần" (single-flight) cho taoBaoCaoCoBan/taoBaoCaoNangCao — dùng ở MỌI nơi có thể
// TRÙNG THỜI ĐIỂM yêu cầu tính cùng 1 lá số: webhook orders.ts tính để gửi mail lúc thanh toán xong,
// khách bấm "Tải PDF ngay" trong lúc trang đang hiện màn hình chờ, admin mở trang xem lại. Nếu không
// gộp lại, 2 yêu cầu trùng lúc sẽ CÙNG gọi AI riêng cho đúng 1 lá số — tốn gấp đôi tiền AI vô ích
// (anh Công yêu cầu 1/9/2026: "tối ưu 1 lần tính và 1 lần trả về, tránh tiêu tốn chi phí AI").
//
// Chỉ dedup PHẦN TÍNH (các lệnh gọi AI bên trong taoBaoCaoCoBan/taoBaoCaoNangCao) — KHÔNG tự quyết
// định cache ở đây. Bên gọi vẫn tự kiểm tra đủ giai đoạn rồi mới cacheCoBan.set()/cacheNangCao.set()
// như cũ (nhiều bên cùng await 1 promise thì cùng thấy y hệt 1 kết quả, mỗi bên tự cache lại là vô
// hại — Map.set() ghi đè cùng 1 dữ liệu không tốn gì thêm).
import { taoBaoCaoCoBan, taoBaoCaoNangCao } from "./orchestrator";
import { hashLaSo } from "./cache";
import type { BatTuInput } from "../bat-tu";
import type { BaoCaoCoBan, BaoCaoNangCao } from "./types";

const dangTinhCoBan = new Map<string, Promise<BaoCaoCoBan>>();
const dangTinhNangCao = new Map<string, Promise<BaoCaoNangCao>>();

function chiTinh1Lan<T>(dangTinh: Map<string, Promise<T>>, key: string, tinh: () => Promise<T>): Promise<T> {
  const dangChay = dangTinh.get(key);
  if (dangChay) return dangChay;
  const p = tinh().finally(() => dangTinh.delete(key));
  dangTinh.set(key, p);
  return p;
}

// ⚠️ Hàm này KHÔNG tự đọc cache trước khi tính (khác Tử Vi — layCoBan/layNangCao ở taoLuanGiaiTuVi.ts
// có đọc lại cache bên trong closure) — vì Bát Tự chỉ cache bản ĐỦ giai đoạn, quyết định "đủ hay
// không" nằm ở bên gọi (orders.ts/tai-pdf.ts/.astro), không nằm ở đây. Bên gọi vẫn PHẢI tự
// `cacheCoBan.get(key)` trước khi gọi hàm dưới đây (xem 3 call site hiện có) — hàm dưới chỉ đảm bảo
// nhiều bên gọi TRÙNG LÚC không tính trùng nhau, không thay thế bước đọc cache ở bên gọi.

export function taoBaoCaoCoBanChiTinh1Lan(input: BatTuInput): Promise<BaoCaoCoBan> {
  return chiTinh1Lan(dangTinhCoBan, hashLaSo(input), () => taoBaoCaoCoBan(input));
}

export function taoBaoCaoNangCaoChiTinh1Lan(input: BatTuInput): Promise<BaoCaoNangCao> {
  return chiTinh1Lan(dangTinhNangCao, hashLaSo(input), () => taoBaoCaoNangCao(input));
}
