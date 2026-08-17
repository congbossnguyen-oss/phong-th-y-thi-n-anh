/**
 * Bước 5 — Vận thế (đại vận) tính từ 12 số CCCD, và Bước 8 Cơ chế B (hoá giải liên nguồn).
 *
 * Nguồn: `dai-van-tuoi.md` + `hoa-giai.md` mục "Cơ chế (B)".
 *
 * ⚠️ Vận thế tính từ CCCD, KHÔNG tính từ số điện thoại. Cách ghép cặp ở đây là TRƯỢT TUẦN TỰ từng
 * một chữ số, không bỏ qua số nào — khác hẳn cách tách cặp gốc Bát tinh ở `tachCap.ts`.
 */
import { traCap } from "../data/batTinh.js";
import {
  MA_THIEU_DU_LIEU_VUOT_TUOI,
  MO_TA_THIEU_DU_LIEU_VUOT_TUOI,
  NHU_CAU_THEO_TUOI,
  SO_CAP_TOI_DA,
  SO_NAM_CAP_DAU,
  SO_NAM_CONG_THEM_NEU_CO_5,
  SO_NAM_MOI_CAP,
} from "../data/daiVan.js";
import { CAP_GOI_Y_THEO_TINH, CONG_THUC_HOA_GIAI } from "../data/hoaGiai.js";
import type { GiaiDoanVanThe, GoiYHoaGiai, KetQuaCap, TenTinh, ThieuDuLieu } from "../types.js";

export class LoiCccd extends Error {}

export function chuanHoaCccd(raw: string): string {
  const s = (raw ?? "").replace(/\D/g, "");
  if (s.length !== 12) {
    throw new LoiCccd(`Căn cước công dân phải đủ 12 chữ số, nhận được ${s.length} chữ số.`);
  }
  return s;
}

/**
 * Tra Bát tinh cho một cặp trong chuỗi vận thế.
 *
 * Cặp chứa số 0 thì bỏ số 0 đi, ghép chữ số còn lại với chữ số kế tiếp TRONG CHUỖI để tìm cặp gốc
 * thật. Cặp toàn số 0, hoặc không tìm được cặp gốc rõ ràng, thì mặc định xếp vào Phục Vị.
 */
function traTinhChoCapVanThe(
  cccd: string,
  viTri: number,
): { ten: TenTinh | null; capDo: 1 | 2 | 3 | 4 | null; catHung: "cát" | "hung" | null; ghiChu?: string } {
  const a = cccd[viTri]!;
  const b = cccd[viTri + 1]!;
  const thang = traCap(`${a}${b}`);
  if (thang) {
    return { ten: thang.ten, capDo: thang.capDo, catHung: thang.catHung };
  }

  // Có số 0 hoặc 5 trong cặp — bỏ nó đi rồi ghép chữ số hợp lệ còn lại với chữ số hợp lệ NGAY SÁT
  // phía bên kia của chữ số vừa bỏ.
  //
  // Ví dụ chuẩn trong tài liệu: chuỗi "...1 0 8...", cặp hiển thị "08" → bỏ số 0, ghép 1 với 8 →
  // cặp gốc 18 (Ngũ Quỷ). Tức là nhìn SANG TRÁI khi số 0 đứng đầu cặp.
  //
  // Cũng theo tài liệu: cặp toàn số 0, hoặc không tìm được cặp gốc rõ ràng (như "00", "01" đứng
  // riêng lẻ) thì mặc định xếp vào Phục Vị — KHÔNG quét tiếp xuống cuối chuỗi để cố ghép cho ra
  // một cặp nào đó, vì làm vậy sẽ gán nhầm năng lượng của đoạn khác vào giai đoạn này.
  const laHopLe = (d?: string) => d !== undefined && d !== "0" && d !== "5";
  let capThay: string | null = null;
  if (!laHopLe(a) && laHopLe(b)) {
    const trai = cccd[viTri - 1];
    if (laHopLe(trai)) capThay = `${trai}${b}`;
  } else if (laHopLe(a) && !laHopLe(b)) {
    const phai = cccd[viTri + 2];
    if (laHopLe(phai)) capThay = `${a}${phai}`;
  }

  if (capThay) {
    const goc = traCap(capThay);
    if (goc) {
      return {
        ten: goc.ten,
        capDo: goc.capDo,
        catHung: goc.catHung,
        ghiChu: `Cặp "${a}${b}" có số ngoài Bát Quái, lấy cặp gốc ${capThay}.`,
      };
    }
  }

  return {
    ten: "Phục Vị",
    capDo: null,
    catHung: "cát",
    ghiChu: `Cặp "${a}${b}" không tìm được cặp gốc rõ ràng nên mặc định xếp vào Phục Vị.`,
  };
}

/** Dựng dòng thời gian vận thế từ 12 số CCCD. */
export function tinhVanThe(cccdDaChuanHoa: string): GiaiDoanVanThe[] {
  const ds: GiaiDoanVanThe[] = [];
  let tuoiHienTai = 0;

  for (let k = 0; k < SO_CAP_TOI_DA; k++) {
    const cap = cccdDaChuanHoa.slice(k, k + 2);
    if (cap.length < 2) break;

    // Cặp đầu tiên phủ 10 năm đầu đời; các cặp sau mỗi cặp 5 năm; cặp chứa số 5 thì cộng thêm 10.
    let soNam = k === 0 ? SO_NAM_CAP_DAU : SO_NAM_MOI_CAP;
    if (cap.includes("5")) soNam += SO_NAM_CONG_THEM_NEU_CO_5;

    const tra = traTinhChoCapVanThe(cccdDaChuanHoa, k);
    ds.push({
      cap,
      tuoiTu: tuoiHienTai,
      tuoiDen: tuoiHienTai + soNam,
      ten: tra.ten,
      capDo: tra.capDo,
      catHung: tra.catHung,
      ...(tra.ghiChu ? { ghiChu: tra.ghiChu } : {}),
    });
    tuoiHienTai += soNam;
  }

  return ds;
}

/** Giai đoạn đang "cầm quyền" ở tuổi hiện tại. Trả null nếu tuổi vượt ngoài phạm vi tính được. */
export function giaiDoanHienTai(vanThe: GiaiDoanVanThe[], tuoi: number): GiaiDoanVanThe | null {
  return vanThe.find((g) => tuoi >= g.tuoiTu && tuoi < g.tuoiDen) ?? null;
}

/** Cảnh báo thiếu dữ liệu khi tuổi vượt phạm vi 11 cặp — chủ dự án chốt: KHÔNG đoán tiếp. */
export function thieuDuLieuVuotTuoi(vanThe: GiaiDoanVanThe[], tuoi: number): ThieuDuLieu | null {
  const cuoi = vanThe[vanThe.length - 1];
  if (!cuoi || tuoi < cuoi.tuoiDen) return null;
  return { ma: MA_THIEU_DU_LIEU_VUOT_TUOI, moTa: MO_TA_THIEU_DU_LIEU_VUOT_TUOI };
}

/** Nhu cầu từ trường ưu tiên theo giai đoạn tuổi. */
export function nhuCauTheoTuoi(tuoi: number) {
  return NHU_CAU_THEO_TUOI.find((n) => tuoi >= n.tuTuoi && tuoi < n.denTuoi) ?? null;
}

/**
 * Cơ chế B — hung tinh nằm trong CCCD, tìm cát tinh trong SỐ ĐIỆN THOẠI để hoá giải.
 *
 * Chiều ngược lại (hung ở số điện thoại) KHÔNG được xử lý ở đây: tài liệu ghi rõ nếu khách không
 * cung cấp CCCD thì không đưa gợi ý hoá giải cho hung tinh của chính số điện thoại, vì không có cơ
 * sở xác định hung tinh cần hoá nằm ở đâu.
 */
export function apDungCoCheB(vanThe: GiaiDoanVanThe[], capSoDienThoai: KetQuaCap[]): GoiYHoaGiai[] {
  const tinhCoTrongSdt = new Set(capSoDienThoai.map((c) => c.ten));
  const hungTrongCccd = new Set(
    vanThe.filter((g) => g.catHung === "hung" && g.ten).map((g) => g.ten as TenTinh),
  );

  const ds: GoiYHoaGiai[] = [];
  for (const hung of hungTrongCccd) {
    const congThuc = CONG_THUC_HOA_GIAI.find((c) => c.hungTinh === hung);
    if (!congThuc) continue;

    // Ưu tiên cách mà số điện thoại ĐÃ có sẵn đủ cát tinh; nếu chưa có thì lấy cách đầu tiên và nói
    // rõ là cần bổ sung.
    const cachDaCo = congThuc.cach.find((c) => c.canCatTinh.every((t) => tinhCoTrongSdt.has(t)));
    const cach = cachDaCo ?? congThuc.cach[0]!;
    const conThieu = cach.canCatTinh.filter((t) => !tinhCoTrongSdt.has(t));

    const toHopGoiY = conThieu.flatMap((t) => [...(CAP_GOI_Y_THEO_TINH[t] ?? [])].slice(0, 3));

    ds.push({
      hungTinh: hung,
      nguon: "CCCD",
      cachHoaGiai: cachDaCo
        ? `${cach.moTa}. Số điện thoại hiện tại ĐÃ có sẵn năng lượng cần thiết (${cach.canCatTinh.join(" + ")}), nên đang hỗ trợ tốt cho phần này.`
        : `${cach.moTa}. Số điện thoại hiện tại còn thiếu ${conThieu.join(", ")} — nên cân nhắc bổ sung ở nguồn số khác như số tài khoản hoặc biển số xe, thay vì bắt buộc đổi số điện thoại chính.`,
      toHopGoiY,
    });
  }
  return ds;
}
