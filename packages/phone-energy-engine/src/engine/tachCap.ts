/**
 * Bước 1 — chuẩn hoá dãy số và tách cặp Bát tinh gốc theo phương pháp 2 lớp.
 * Bước 2 (lớp 2) — xét hiệu ứng của số 5 / số 0 lên cặp gốc đã xác định.
 *
 * Nguồn: `bang-tra-bat-tinh.md` mục 4 và 4b.
 *
 * ⚠️ GHI CHÚ VỀ MỘT CHỖ MƠ HỒ TRONG TÀI LIỆU (đã báo chủ dự án):
 * Mục 4 mở đầu bằng ví dụ "9876543 → 98,87,76,65,54,43" để minh hoạ cơ chế cặp liền kề CHỒNG LẤN,
 * rồi mới nêu quy tắc bỏ qua 0/5. Hai ví dụ đi kèm quy tắc ("903" → cặp gốc 93; "140" → cặp gốc 14)
 * nói rõ là số 0/5 bị NHẢY QUA để ghép hai chữ số hợp lệ hai bên. Engine cài theo quy tắc đó, nên
 * với 9876543 sẽ ra 98, 87, 76, 64, 43 (không có 65 và 54, vì số 5 bị nhảy qua). Đây là cách đọc
 * duy nhất nhất quán với cả hai ví dụ.
 */
import { traCap } from "../data/batTinh.js";
import type { CapGoc, HieuUngSo50, KetQuaCap } from "../types.js";
import { dongHayTinh } from "../data/batTinh.js";
import { LINH_VUC_THEO_TINH, Y_NGHIA_SO_0_THEO_LINH_VUC } from "../data/luuYDacBiet.js";

/** Chữ số không tham gia Bát Quái Hậu Thiên nên bị nhảy qua khi ghép cặp gốc. */
const SO_NGOAI_BAT_QUAI = new Set([0, 5]);

export class LoiSoDienThoai extends Error {}

/**
 * Chuẩn hoá số điện thoại: bỏ ký tự không phải chữ số, bỏ mã quốc gia 84, bỏ số 0 đầu nhà mạng.
 *
 * Trả về chuỗi chữ số đã sẵn sàng để tách cặp. Ném lỗi nếu độ dài không hợp lệ.
 */
export function chuanHoaSo(raw: string): string {
  let s = (raw ?? "").replace(/\D/g, "");
  if (s.startsWith("84") && s.length >= 11) s = s.slice(2);
  // Bỏ số 0 đầu mã vùng/nhà mạng khi tách (mục 4). Chỉ bỏ MỘT số 0 đầu tiên — các số 0 khác trong
  // dãy vẫn là dữ liệu thật và phải được tính hiệu ứng.
  if (s.startsWith("0")) s = s.slice(1);
  if (s.length < 8 || s.length > 11) {
    throw new LoiSoDienThoai(
      `Số điện thoại không hợp lệ: cần 9-10 chữ số (có thể kèm số 0 đầu), nhận được "${raw}".`,
    );
  }
  return s;
}

/** Vị trí các chữ số THAM GIA ghép cặp (không phải 0 và 5), theo thứ tự trái→phải. */
function viTriSoHopLe(so: string): number[] {
  const ds: number[] = [];
  for (let i = 0; i < so.length; i++) {
    const d = Number(so[i]);
    if (!SO_NGOAI_BAT_QUAI.has(d)) ds.push(i);
  }
  return ds;
}

/**
 * Lớp 1 — tách cặp gốc. Bỏ qua 0/5, ghép chữ số hợp lệ với chữ số hợp lệ kế tiếp.
 * Các cặp CHỒNG LẤN: chữ số phải của cặp này là chữ số trái của cặp sau.
 */
export function tachCapGoc(soDaChuanHoa: string): CapGoc[] {
  const viTri = viTriSoHopLe(soDaChuanHoa);
  const ds: CapGoc[] = [];
  for (let k = 0; k + 1 < viTri.length; k++) {
    const iT = viTri[k]!;
    const iP = viTri[k + 1]!;
    const soTrai = Number(soDaChuanHoa[iT]);
    const soPhai = Number(soDaChuanHoa[iP]);
    ds.push({
      cap: `${soTrai}${soPhai}`,
      soTrai,
      soPhai,
      viTriTrai: iT,
      viTriPhai: iP,
    });
  }
  return ds;
}

/**
 * Số 0 ẩn/làm mất năng lượng của một tinh thì cụ thể là mất ở mặt nào của cuộc sống.
 *
 * Ghép hai bảng đều lấy từ tài liệu: lĩnh vực của tinh (cột chủ đề bảng tra Bát tinh) và ý nghĩa số
 * 0 trong từng lĩnh vực. Trả chuỗi rỗng nếu tinh đó không được bảng gốc gán lĩnh vực nào — Phục Vị
 * rơi vào trường hợp này, và KHÔNG được gán bừa.
 */
function dienGiaiLinhVuc(ten: string): string {
  const linhVuc = LINH_VUC_THEO_TINH[ten] ?? [];
  const phan = linhVuc
    .map((lv) => {
      const y = Y_NGHIA_SO_0_THEO_LINH_VUC[lv];
      return y ? `${lv} ${y}` : null;
    })
    .filter((x): x is string => x !== null);
  return phan.length > 0 ? phan.join(", ") : "";
}

/**
 * Vị trí của chữ số mà một số 0 / số 5 lặp lại — tức chữ số hợp lệ đứng ngay TRƯỚC nó.
 *
 * Cả một chuỗi 0/5 liền nhau cùng trỏ về một gốc, vì bản thân từng chữ số trong chuỗi đã là bản
 * sao của cùng chữ số đó rồi: "1455" thì cả hai số 5 đều lặp số 4; "1405" cũng vậy.
 *
 * Trả `null` khi số 0/5 đứng ở đầu dãy — không có gì phía trước để lặp, nên nó không liên quan tới
 * cặp nào cả. Đây là trường hợp `598` chủ dự án nêu.
 */
function goPhucVi(so: string, viTri: number): number | null {
  for (let i = viTri - 1; i >= 0; i--) {
    if (!SO_NGOAI_BAT_QUAI.has(Number(so[i]))) return i;
  }
  return null;
}

/**
 * Diễn giải hiệu ứng của số 5 và số 0.
 *
 * Chủ dự án chốt 2026-08-17: **cả số 5 lẫn số 0 đều là Phục Vị của chữ số đứng ngay trước nó**
 * ("chủ yếu phải xem số trước số 5 là gì mới biết được"; "số 0 cũng phục vị vậy, tuy nhiên năng
 * lượng số 0 là giảm đi"). Cùng một cơ chế, khác nhau ở CHIỀU tác động:
 *
 * - Số 5 làm năng lượng **mạnh lên**: đứng ngay sau cặp thì kích phát, nằm giữa cặp thì kéo dài.
 * - Số 0 làm năng lượng **yếu đi**: đứng ngay sau cặp thì mất hẳn, nằm giữa cặp thì ẩn ngầm.
 *
 * Ba ví dụ chuẩn của số 5, số 0 suy ra tương tự theo chiều ngược lại:
 *
 * - `985` → 5 lặp số 8 thành Phục Vị 88, đứng NGAY SAU cặp 98 nên **kích phát** cặp 98 lên.
 * - `859` → 5 lặp số 8 thành Phục Vị 88, nằm GIỮA cặp 89 nên **kéo dài** cặp 89 ra.
 * - `598` → số 5 đứng đầu dãy, không có gì trước để lặp nên **không liên quan** tới cặp 98.
 *
 * Vì cả hai đều dính vào chữ số bên TRÁI, chúng không bao giờ tác động lên cặp nằm bên phải mình.
 * Nhóm "trước" của bản cũ (cả bảng 5 lẫn bảng 0) vì thế bị bỏ hẳn, chứ không phải đổi tên hiệu ứng.
 *
 * Cơ chế này khớp với chính mô tả Phục Vị trong `moTa8Tinh.ts`: "Phục Vị nối mạch và khuếch đại
 * năng lượng đứng ngay trước nó — trước là cát thì càng cát, trước là hung thì càng hung".
 */
const HIEU_UNG_5 = {
  giữa: {
    hieuUng: "kéo dài" as const,
    moTa: "số 5 lặp lại chữ số đứng trước thành Phục Vị, nối mạch cho cặp này kéo dài thêm ra",
  },
  sau: {
    hieuUng: "kích phát" as const,
    moTa: "số 5 lặp lại chữ số đứng trước thành Phục Vị, kích phát cặp này bộc lộ mạnh ra ngoài",
  },
};

const HIEU_UNG_0 = {
  giữa: {
    hieuUng: "ẩn ngầm" as const,
    moTa: "số 0 lặp lại chữ số đứng trước thành Phục Vị nhưng làm năng lượng giảm đi: cặp này vẫn tồn tại mà hoạt động ngầm, khó phát giác sớm",
  },
  sau: {
    hieuUng: "mất hẳn" as const,
    moTa: "số 0 lặp lại chữ số đứng trước thành Phục Vị nhưng làm năng lượng giảm đi: đứng ngay sau nên rút mất luôn, từ có thành không",
  },
};

/**
 * Lớp 2 — với mỗi số 5 / số 0, xác định quan hệ của nó với một cặp gốc.
 *
 * Cả hai chữ số dùng CHUNG một cơ chế: chúng bám vào chữ số hợp lệ bên TRÁI mình và lặp lại chữ số
 * đó thành một cặp Phục Vị. Vì thế chúng chỉ tác động lên đúng cặp chứa chữ số gốc ấy — cặp nằm
 * bên phải chúng không bao giờ bị ảnh hưởng. Chỉ khác nhau ở chiều: 5 làm mạnh lên, 0 làm yếu đi.
 */
export function tinhHieuUngSo50(soDaChuanHoa: string, capGoc: CapGoc): HieuUngSo50[] {
  const ds: HieuUngSo50[] = [];
  const traCuu = traCap(capGoc.cap);
  const laHung = traCuu?.catHung === "hung";

  for (let i = 0; i < soDaChuanHoa.length; i++) {
    const d = Number(soDaChuanHoa[i]);
    if (!SO_NGOAI_BAT_QUAI.has(d)) continue;

    const iGoc = goPhucVi(soDaChuanHoa, i);
    if (iGoc === null) continue; // đứng đầu dãy, không có gì để lặp — không liên quan cặp nào.

    // Chỉ nói chuyện với cặp chứa chính chữ số nó lặp lại.
    let viTriTuongDoi: "giữa" | "sau";
    if (iGoc === capGoc.viTriTrai) viTriTuongDoi = "giữa";
    else if (iGoc === capGoc.viTriPhai) viTriTuongDoi = "sau";
    else continue;

    const soLapLai = Number(soDaChuanHoa[iGoc]);
    const { hieuUng, moTa } = (d === 5 ? HIEU_UNG_5 : HIEU_UNG_0)[viTriTuongDoi];

    // Cả bốn hiệu ứng đều đẩy hung tinh theo hướng xấu: số 5 làm nó mạnh thêm, số 0 làm nó ngấm
    // ngầm/mất kiểm soát. Nguyên tắc chốt mục 4b: hung tinh gặp 0 hay 5 đều nguy hiểm hơn.
    const lamManhHungTinh = laHung;

    // Số 0 ẩn hoặc làm mất năng lượng thì nói rõ mất ở MẶT NÀO của cuộc sống — dựa vào lĩnh vực
    // của chính tinh đó. Chỉ áp cho số 0, và chỉ khi hiệu ứng thực sự là ẩn/mất.
    const yNghiaLinhVuc =
      d === 0 && traCuu && (hieuUng === "ẩn ngầm" || hieuUng === "mất hẳn")
        ? dienGiaiLinhVuc(traCuu.ten)
        : undefined;

    ds.push({
      so: d as 5 | 0,
      viTri: i,
      viTriTuongDoi,
      hieuUng,
      moTa,
      lamManhHungTinh,
      soLapLai,
      ...(yNghiaLinhVuc ? { yNghiaLinhVuc } : {}),
    });
  }
  return ds;
}

/** Bước 2 — tra toàn bộ cặp gốc vào bảng Bát tinh, kèm hiệu ứng 5/0 của từng cặp. */
export function traBatTinh(soDaChuanHoa: string, capGoc: CapGoc[]): KetQuaCap[] {
  const ds: KetQuaCap[] = [];
  for (const c of capGoc) {
    const t = traCap(c.cap);
    // Cặp gốc luôn gồm 2 chữ số ngoài {0,5} nên bảng phải có. Nếu không có là lỗi dữ liệu thật sự.
    if (!t) throw new Error(`Cặp gốc ${c.cap} không có trong bảng Bát tinh — dữ liệu bảng thiếu.`);
    ds.push({
      capGoc: c,
      ten: t.ten,
      catHung: t.catHung,
      capDo: t.capDo,
      dongTinh: dongHayTinh(t.capDo),
      nguHanhTinh: t.nguHanh,
      hieuUng: tinhHieuUngSo50(soDaChuanHoa, c),
      daHoaGiai: false,
    });
  }
  return ds;
}
