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

/** Diễn giải hiệu ứng của số 5 theo vị trí — nguyên văn ý của mục 4b. */
const HIEU_UNG_5 = {
  trước: {
    hieuUng: "giữ nguyên" as const,
    moTa: "số 5 đứng trước nên năng lượng giữ nguyên tính chất, không đổi",
  },
  giữa: {
    hieuUng: "đột hiển" as const,
    moTa: "số 5 chen vào giữa khiến năng lượng này bộc lộ rõ ra ngoài, nhìn là thấy ngay",
  },
  sau: {
    hieuUng: "khuếch đại" as const,
    moTa: "số 5 đứng ngay sau làm năng lượng mạnh gấp đôi và kéo dài hơn bình thường",
  },
};

/** Diễn giải hiệu ứng của số 0 theo vị trí. Số 0 đứng trước không được tài liệu nêu riêng. */
const HIEU_UNG_0 = {
  trước: {
    hieuUng: "giữ nguyên" as const,
    moTa: "số 0 đứng trước, tài liệu không nêu hiệu ứng riêng cho vị trí này",
  },
  giữa: {
    hieuUng: "ẩn ngầm" as const,
    moTa: "số 0 chen vào giữa khiến năng lượng vẫn tồn tại nhưng hoạt động ngầm, khó phát giác sớm",
  },
  sau: {
    hieuUng: "mất hẳn" as const,
    moTa: "số 0 đứng ngay sau rút mất năng lượng, từ có thành không",
  },
};

/**
 * Lớp 2 — với mỗi số 5 / số 0, xác định nó đứng trước, giữa hay ngay sau từng cặp gốc.
 *
 * Một chữ số có thể vừa là "giữa" của cặp này vừa là "trước" của cặp kế — tài liệu mô tả hiệu ứng
 * theo TỪNG CẶP, nên trả về đủ các quan hệ thay vì ép chọn một.
 */
export function tinhHieuUngSo50(soDaChuanHoa: string, capGoc: CapGoc): HieuUngSo50[] {
  const ds: HieuUngSo50[] = [];
  const traCuu = traCap(capGoc.cap);
  const laHung = traCuu?.catHung === "hung";

  for (let i = 0; i < soDaChuanHoa.length; i++) {
    const d = Number(soDaChuanHoa[i]);
    if (!SO_NGOAI_BAT_QUAI.has(d)) continue;

    let viTriTuongDoi: "trước" | "giữa" | "sau" | null = null;
    if (i > capGoc.viTriTrai && i < capGoc.viTriPhai) viTriTuongDoi = "giữa";
    else if (i === capGoc.viTriTrai - 1) viTriTuongDoi = "trước";
    else if (i > capGoc.viTriPhai) {
      // "Ngay sau" tính cả một chuỗi 0/5 liền nhau ngay sau cặp — tài liệu nói chuỗi dài thì hiệu
      // ứng kéo dài tương ứng, nên vẫn thuộc nhóm "sau".
      const chenGiua = soDaChuanHoa
        .slice(capGoc.viTriPhai + 1, i)
        .split("")
        .every((c) => SO_NGOAI_BAT_QUAI.has(Number(c)));
      if (chenGiua) viTriTuongDoi = "sau";
    }
    if (!viTriTuongDoi) continue;

    const bang = d === 5 ? HIEU_UNG_5 : HIEU_UNG_0;
    const { hieuUng, moTa } = bang[viTriTuongDoi];

    // Hung tinh gặp 0 hoặc 5 đều nguy hiểm hơn (nguyên tắc chốt mục 4b) — trừ số 5 đứng trước, vốn
    // được nêu rõ là giữ nguyên, không đổi.
    const lamManhHungTinh = laHung && !(d === 5 && viTriTuongDoi === "trước");

    ds.push({
      so: d as 5 | 0,
      viTri: i,
      viTriTuongDoi,
      hieuUng,
      moTa,
      lamManhHungTinh,
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
