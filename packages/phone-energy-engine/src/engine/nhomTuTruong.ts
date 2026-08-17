/**
 * Bước 6 — luận điểm xâm nhập theo 10 nhóm từ trường.
 *
 * Nguồn: `10-nhom-tu-truong.md`. Chỉ báo nhóm nào THỰC SỰ khớp với cặp tinh có trong dãy số —
 * không liệt kê suông cả 10 nhóm cho dài.
 */
import { MUOI_NHOM } from "../data/nhomTuTruong.js";
import { TINH_THEO_MUC_DICH } from "../data/hoaGiai.js";
import type { KetQuaCap, MucDich, NhomTuTruongResult } from "../types.js";

/** Các cặp tinh liền kề (trái, phải) xuất hiện trong dãy. */
function capTinhLienKe(capGoc: KetQuaCap[]): { trai: string; phai: string; so: string }[] {
  const ds: { trai: string; phai: string; so: string }[] = [];
  for (let i = 0; i + 1 < capGoc.length; i++) {
    const a = capGoc[i]!;
    const b = capGoc[i + 1]!;
    // Hai cặp gốc liền kề luôn chồng lấn 1 chữ số → ghép thành chuỗi 3 chữ số để hiển thị.
    ds.push({ trai: a.ten, phai: b.ten, so: `${a.capGoc.soTrai}${a.capGoc.soPhai}${b.capGoc.soPhai}` });
  }
  return ds;
}

export function luan10Nhom(capGoc: KetQuaCap[], mucDich: MucDich = "tổng quát"): NhomTuTruongResult[] {
  const lienKe = capTinhLienKe(capGoc);
  const capCoMat = new Set(capGoc.map((c) => c.capGoc.cap));
  const ketQua: NhomTuTruongResult[] = [];

  for (const nhom of MUOI_NHOM) {
    const trungKhop: string[] = [];
    const cauDienGiai: string[] = [];

    for (const mau of nhom.mau) {
      const [tTrai, tPhai] = mau.cap;
      const khop = lienKe.filter((lk) => lk.trai === tTrai && lk.phai === tPhai);
      for (const k of khop) {
        trungKhop.push(k.so);
        cauDienGiai.push(`${k.so} (${tTrai} → ${tPhai}): ${mau.yNghia}.`);
      }
    }

    // Nhóm chỉ có ghi chú dạng lời (Sức khỏe, Bệnh tật, Họa Hại mở rộng) — kiểm theo cặp có mặt.
    if (nhom.mau.length === 0 && nhom.ghiChu) {
      const capLienQuan = [...capCoMat].filter((c) =>
        nhom.ghiChu!.some((g) => g.includes(c)),
      );
      if (capLienQuan.length > 0) {
        trungKhop.push(...capLienQuan);
        cauDienGiai.push(...nhom.ghiChu);
      }
    }

    if (trungKhop.length === 0) continue;

    // Nhóm đúng trọng tâm khách hỏi thì kèm thêm ghi chú của nhóm để đào sâu hơn.
    const laTrongTam = laNhomTrongTam(nhom.ten, mucDich);
    if (laTrongTam && nhom.ghiChu && nhom.mau.length > 0) cauDienGiai.push(...nhom.ghiChu);

    ketQua.push({
      nhom: nhom.ten,
      trungKhop: [...new Set(trungKhop)],
      // Một tổ hợp lặp lại nhiều lần trong dãy chỉ cần nói một lần — lặp câu y hệt chỉ làm bài
      // luận dài ra chứ không thêm thông tin gì.
      dienGiai: [...new Set(cauDienGiai)].join(" "),
    });
  }

  // Đưa nhóm đúng trọng tâm khách hỏi lên đầu.
  ketQua.sort((a, b) => {
    const ta = laNhomTrongTam(a.nhom, mucDich) ? 0 : 1;
    const tb = laNhomTrongTam(b.nhom, mucDich) ? 0 : 1;
    return ta - tb;
  });

  return ketQua;
}

/** Nhóm nào ứng với mục đích khách nêu. Tên nhóm lấy đúng như trong tài liệu. */
function laNhomTrongTam(tenNhom: string, mucDich: MucDich): boolean {
  const banDo: Record<MucDich, string[]> = {
    "tổng quát": [],
    "tài lộc": ["Đầu tư", "Tiêu tiền tài"],
    "hôn nhân": ["Hôn nhân", "Đào hoa"],
    "sự nghiệp": ["Quan vận", "Nhân mạch"],
    "sức khỏe": ["Sức khỏe", "Bệnh tật"],
    "học hành": ["Học hành"],
  };
  return banDo[mucDich].includes(tenNhom);
}

/** Tinh cần chú trọng theo mục đích khách nêu — dùng ở phần khuyến nghị. */
export function tinhUuTienTheoMucDich(mucDich: MucDich = "tổng quát") {
  return TINH_THEO_MUC_DICH[mucDich];
}
