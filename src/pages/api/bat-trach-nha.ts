import type { APIRoute } from "astro";
import { BatTrachNha } from "@thien-anh/rule-engine";
import { nienTinhNhapTrung } from "../../lib/huyen-khong-phi-tinh/engine";

export const prerender = false;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const CUNG_LIST = ["Càn", "Khảm", "Cấn", "Chấn", "Tốn", "Ly", "Khôn", "Đoài"] as const;
type CungParam = (typeof CUNG_LIST)[number];

function docCung(v: string | null): CungParam | null {
  if (v === null) return null;
  return (CUNG_LIST as readonly string[]).includes(v) ? (v as CungParam) : null;
}

// ĐÃ MỞ CÔNG KHAI (30/8/2026, anh Công: "để ra ngoài như mục huyền không phi tinh") — thuần tra
// bảng + công thức, không AI, không thu phí, giống hệt cách "Xem phong thủy nhà (Huyền Không Phi
// Tinh)" đã mở. Trang "/kiem-chung" (đối chiếu số liệu nội bộ, không phải sản phẩm cho khách) vẫn
// admin-only nhưng tự kiểm tra ở tầng trang .astro của nó — không đi qua API này để chặn.
export const GET: APIRoute = async ({ url }) => {
  const p = url.searchParams;

  const namSinhRaw = p.get("namSinh");
  const gioiTinhRaw = p.get("gioiTinh");
  if (namSinhRaw === null || (gioiTinhRaw !== "nam" && gioiTinhRaw !== "nu")) {
    return jsonResponse({ error: "Thiếu tham số bắt buộc: namSinh, gioiTinh (nam|nu)." }, 400);
  }
  const namSinh = Number(namSinhRaw);
  if (!Number.isInteger(namSinh)) {
    return jsonResponse({ error: "namSinh phải là số nguyên." }, 400);
  }

  const huongKieu = p.get("huongKieu");
  let huong: BatTrachNha.DauVaoHuong;
  if (huongKieu === "8huong") {
    const h = p.get("huongGiaTri");
    if (!h || !(BatTrachNha.HUONG_8_LIST as readonly string[]).includes(h)) {
      return jsonResponse({ error: "huongGiaTri không hợp lệ cho huongKieu=8huong." }, 400);
    }
    huong = { kieu: "8huong", huong: h as BatTrachNha.Huong8 };
  } else if (huongKieu === "do" || huongKieu === "laBanDienThoai") {
    const doRaw = p.get("huongGiaTri");
    const doSo = Number(doRaw);
    if (doRaw === null || Number.isNaN(doSo)) {
      return jsonResponse({ error: "huongGiaTri phải là số độ hợp lệ." }, 400);
    }
    huong = huongKieu === "do" ? { kieu: "do", do: doSo } : { kieu: "laBanDienThoai", do: doSo };
  } else {
    return jsonResponse({ error: "huongKieu phải là 8huong | do | laBanDienThoai." }, 400);
  }

  // 3 cờ cấu hình (data/00 MĐ-1/2/3) — cho phép ghi đè qua query, dùng cho trang /kiem-chung đảo
  // cờ trực tiếp trên giao diện; nếu không truyền thì dùng mặc định hệ thống.
  const luanHopMenhTheoRaw = p.get("luanHopMenhTheo");
  const sinhKhacCungSaoRaw = p.get("sinhKhacCungSao");
  const xuyenCungTang1Raw = p.get("xuyenCungTang1");
  const config: BatTrachNha.BatTrachConfig = {
    luanHopMenhTheo: luanHopMenhTheoRaw === "toa" ? "toa" : BatTrachNha.DEFAULT_BAT_TRACH_CONFIG.luanHopMenhTheo,
    sinhKhacCungSao:
      sinhKhacCungSaoRaw === "A" || sinhKhacCungSaoRaw === "B" || sinhKhacCungSaoRaw === "theoNguCanh"
        ? sinhKhacCungSaoRaw
        : BatTrachNha.DEFAULT_BAT_TRACH_CONFIG.sinhKhacCungSao,
    xuyenCungTang1: xuyenCungTang1Raw === "theoViDuSach" ? "theoViDuSach" : BatTrachNha.DEFAULT_BAT_TRACH_CONFIG.xuyenCungTang1,
  };

  try {
    const toiThieu = BatTrachNha.luanBatTrachToiThieu({ namSinh, gioiTinh: gioiTinhRaw, huong }, config);

    const cuaCung = docCung(p.get("cuaCung"));
    const chuCung = docCung(p.get("chuCung"));
    const bepCung = docCung(p.get("bepCung"));
    const tamYeu = cuaCung && chuCung && bepCung ? BatTrachNha.luanTamYeuVaSinhKhac({ cuaCung, chuCung, bepCung }) : null;

    const soTangRaw = p.get("soTang");
    const soTang = soTangRaw !== null ? Number(soTangRaw) : null;
    const xuyenCung =
      cuaCung && soTang !== null && Number.isInteger(soTang) && soTang >= 1 && soTang <= BatTrachNha.SO_TANG_TOI_DA
        ? BatTrachNha.luanXuyenCung(toiThieu.toa.cung, cuaCung, soTang)
        : null;

    const namCanXemRaw = p.get("namCanXem");
    const namCanXem = namCanXemRaw !== null ? Number(namCanXemRaw) : null;
    // Niên Tinh nhập trung KHÔNG tự tính trong package (nguyên tắc bao-trùm) — lấy từ engine
    // huyen-khong-phi-tinh đã có sẵn trên site, truyền số sao vào luanLuuNien.
    const luuNien =
      namCanXem !== null && Number.isInteger(namCanXem)
        ? BatTrachNha.luanLuuNien(namSinh, namCanXem, toiThieu.cungMenh, nienTinhNhapTrung(namCanXem))
        : null;

    return jsonResponse({ toiThieu, tamYeu, xuyenCung, luuNien, config }, 200);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Không tính được." }, 400);
  }
};
