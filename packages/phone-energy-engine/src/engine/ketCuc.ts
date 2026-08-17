/**
 * Bước 3 — trọng tâm 3 số đuôi. Đây là chỗ đại diện cho KẾT CỤC cuối cùng của mọi việc, cần nhấn
 * mạnh hơn các cặp ở giữa dãy.
 *
 * Nguồn: SKILL Bước 3 + `bang-tra-bat-tinh.md` mục 4c (quy tắc riêng cho đuôi số) và mục 5 (tổ hợp
 * 3 chữ số cảnh báo, đặc biệt khi nằm ở 4 vị trí cuối).
 */
import { TO_HOP_CANH_BAO, Y_NGHIA_DUOI_SO } from "../data/batTinh.js";
import type { KetQuaCap } from "../types.js";

export interface KetQuaKetCuc {
  baSoDuoi: string;
  /** Các cặp gốc có ít nhất một chữ số nằm trong 3 số cuối. */
  capTrongDuoi: KetQuaCap[];
  dienGiai: string;
  /** Tổ hợp cảnh báo tìm thấy trong 4 vị trí cuối. */
  toHopXau: string[];
}

/** Dò tổ hợp cảnh báo trong 4 chữ số cuối — vị trí tài liệu nhấn mạnh là nguy hiểm nhất. */
export function doToHopXauODuoi(soDaChuanHoa: string): string[] {
  const duoi4 = soDaChuanHoa.slice(-4);
  const thay: string[] = [];
  for (const nhom of TO_HOP_CANH_BAO) {
    for (const th of nhom.toHop) {
      if (duoi4.includes(th)) thay.push(`${th} (${nhom.nhom} — ${nhom.moTa})`);
    }
  }
  return thay;
}

export function luanKetCuc(soDaChuanHoa: string, capGoc: KetQuaCap[]): KetQuaKetCuc {
  const batDauDuoi = Math.max(0, soDaChuanHoa.length - 3);
  const baSoDuoi = soDaChuanHoa.slice(batDauDuoi);

  const capTrongDuoi = capGoc.filter((c) => c.capGoc.viTriPhai >= batDauDuoi);
  const toHopXau = doToHopXauODuoi(soDaChuanHoa);

  const cau: string[] = [];
  const soCuoi = soDaChuanHoa[soDaChuanHoa.length - 1];

  if (capTrongDuoi.length === 0) {
    cau.push(
      "Ba số cuối không tạo được cặp Bát tinh nào vì toàn số ngoài Bát Quái, nên phần kết cục chưa luận được theo bảng.",
    );
  } else {
    for (const c of capTrongDuoi) {
      const yNghia = Y_NGHIA_DUOI_SO[c.ten];
      if (yNghia) {
        cau.push(`Đuôi số mang năng lượng ${c.ten} — ${yNghia}.`);
      } else if (c.catHung === "hung") {
        cau.push(
          `Đuôi số mang năng lượng ${c.ten}, là hung tinh. Tài liệu khuyên tốt nhất không nên để hung tinh ở đuôi số vì đây là chỗ quyết định kết cục, dễ biến xấu về sau.`,
        );
      } else {
        cau.push(`Đuôi số mang năng lượng ${c.ten}.`);
      }
    }
  }

  if (soCuoi === "0") {
    cau.push(
      "Chữ số cuối cùng là số 0 — đây là cảnh báo nặng, tài liệu gọi là tứ đại giai không, mọi thứ dễ về lại con số không.",
    );
  }

  if (toHopXau.length > 0) {
    cau.push(`Ở bốn vị trí cuối còn xuất hiện tổ hợp cần lưu ý: ${toHopXau.join(", ")}.`);
  }

  return { baSoDuoi, capTrongDuoi, dienGiai: cau.join(" "), toHopXau };
}
