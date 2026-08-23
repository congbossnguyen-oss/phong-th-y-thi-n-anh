/**
 * Kiểm tra đầu vào dùng chung cho 3 route của module Sim Phong Thủy Khai Vận Khí
 * (test-calculate / checkout / result) — để 3 nơi không lệch luật nhau.
 *
 * ⚠️ KHÁC các module "công cụ" còn lại: đây là DỊCH VỤ THỦ CÔNG — chuyên gia tự tay chọn số thật
 * từ kho sim theo Bát Tự khách cung cấp (không có hàm tính ra "sim phù hợp" tự động, vì hệ thống
 * không có quyền truy cập kho số thật của nhà mạng). API này CHỈ thu thập + xác thực yêu cầu,
 * KHÔNG trả "kết quả" tính toán — sau thanh toán, chuyên gia liên hệ trực tiếp qua Zalo/SĐT.
 *
 * Đặc tả mẫu: form Google "SIM PHONG THỦY KHAI VẬN KHÍ" (anh Công cung cấp 2026-08-19).
 *
 * Đặt tên bắt đầu bằng dấu gạch dưới để Astro KHÔNG coi đây là một route.
 */
import {
  MONG_MUON_HOP_LE,
  MANG_HOP_LE,
  DAU_SO_HOP_LE,
  KHOANG_GIA_HOP_LE,
  type SimPhongThuyInput,
} from "../../../../lib/sim-phong-thuy-khai-van/labels";

export const TOOL_SLUG = "sim-phong-thuy-khai-van";
export const TIMEZONE = "Asia/Ho_Chi_Minh";

export function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

// Nhãn hiển thị (NHAN_MONG_MUON/NHAN_MANG/NHAN_KHOANG_GIA) và type SimPhongThuyInput chuyển sang
// lib/sim-phong-thuy-khai-van/labels.ts — nơi đó lib/db/orders.ts import TĨNH được để dựng email
// báo cáo, giữ nguồn nhãn duy nhất. File này re-export lại để không phá code đang gọi từ đây.
export {
  MONG_MUON_HOP_LE,
  MANG_HOP_LE,
  DAU_SO_HOP_LE,
  KHOANG_GIA_HOP_LE,
  type SimPhongThuyInput,
  NHAN_MONG_MUON,
  NHAN_MANG,
  NHAN_KHOANG_GIA,
} from "../../../../lib/sim-phong-thuy-khai-van/labels";

export interface KetQuaDoc {
  ok: true;
  input: SimPhongThuyInput;
}
export interface LoiDoc {
  ok: false;
  error: string;
}

function docNgay(v: unknown): { year: number; month: number; day: number } | null {
  const o = v as Record<string, unknown> | undefined;
  const d = { year: Number(o?.year), month: Number(o?.month), day: Number(o?.day) };
  if (!Number.isInteger(d.year) || !Number.isInteger(d.month) || !Number.isInteger(d.day)) return null;
  if (d.month < 1 || d.month > 12 || d.day < 1 || d.day > 31) return null;
  return d;
}

/** Đọc và kiểm tra body request thành input đã xác thực. Không tin bất kỳ trường nào từ client. */
export function docInput(body: unknown): KetQuaDoc | LoiDoc {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Dữ liệu gửi lên không hợp lệ." };
  }
  const b = body as Record<string, unknown>;

  const hoTen = typeof b.hoTen === "string" ? b.hoTen.trim() : "";
  const soDienThoaiZalo = typeof b.soDienThoaiZalo === "string" ? b.soDienThoaiZalo.trim() : "";
  const soCCCD = typeof b.soCCCD === "string" ? b.soCCCD.trim() : "";
  const diaChiNhanSim = typeof b.diaChiNhanSim === "string" ? b.diaChiNhanSim.trim() : "";
  const congViecHienTai = typeof b.congViecHienTai === "string" ? b.congViecHienTai.trim() : "";

  if (!hoTen || hoTen.length > 100) return { ok: false, error: "Vui lòng nhập họ tên hợp lệ (tối đa 100 ký tự)." };
  if (!soDienThoaiZalo || soDienThoaiZalo.length > 20) return { ok: false, error: "Vui lòng nhập số điện thoại/Zalo hợp lệ." };
  if (!/^\d{9,12}$/.test(soCCCD)) return { ok: false, error: "Số CCCD phải gồm 9-12 chữ số." };
  if (!diaChiNhanSim || diaChiNhanSim.length > 300) return { ok: false, error: "Vui lòng nhập địa chỉ nhận sim hợp lệ." };
  if (!congViecHienTai || congViecHienTai.length > 200) return { ok: false, error: "Vui lòng nhập công việc hiện tại." };

  const gioiTinh = b.gioiTinh === "nam" || b.gioiTinh === "nu" ? b.gioiTinh : null;
  if (!gioiTinh) return { ok: false, error: "Vui lòng chọn giới tính." };

  const ngaySinh = docNgay(b.ngaySinh);
  if (!ngaySinh) return { ok: false, error: "Vui lòng chọn đầy đủ ngày sinh (dương lịch)." };
  if (ngaySinh.year < 1930 || ngaySinh.year > 2026) return { ok: false, error: "Năm sinh không hợp lệ (1930-2026)." };

  let gioSinh: number | undefined;
  if (b.gioSinh !== undefined && b.gioSinh !== null && b.gioSinh !== "") {
    const g = Number(b.gioSinh);
    if (!Number.isInteger(g) || g < 0 || g > 23) return { ok: false, error: "Giờ sinh phải từ 0 đến 23, hoặc để trống nếu không nhớ." };
    gioSinh = g;
  }

  const mongMuonTimSim = typeof b.mongMuonTimSim === "string" && (MONG_MUON_HOP_LE as readonly string[]).includes(b.mongMuonTimSim)
    ? (b.mongMuonTimSim as SimPhongThuyInput["mongMuonTimSim"])
    : null;
  if (!mongMuonTimSim) return { ok: false, error: "Vui lòng chọn mong muốn tìm sim." };
  const mongMuonKhac = typeof b.mongMuonKhac === "string" ? b.mongMuonKhac.trim().slice(0, 200) : undefined;
  if (mongMuonTimSim === "khac" && !mongMuonKhac) {
    return { ok: false, error: "Vui lòng mô tả cụ thể mong muốn tìm sim (mục khác)." };
  }

  const mangMongMuon = typeof b.mangMongMuon === "string" && (MANG_HOP_LE as readonly string[]).includes(b.mangMongMuon)
    ? (b.mangMongMuon as SimPhongThuyInput["mangMongMuon"])
    : null;
  if (!mangMongMuon) return { ok: false, error: "Vui lòng chọn nhà mạng mong muốn." };

  const dauSoRaw = Array.isArray(b.dauSoUuTien) ? b.dauSoUuTien : [];
  const dauSoUuTien = dauSoRaw.filter((d): d is (typeof DAU_SO_HOP_LE)[number] => typeof d === "string" && (DAU_SO_HOP_LE as readonly string[]).includes(d));
  if (dauSoUuTien.length === 0) return { ok: false, error: "Vui lòng chọn ít nhất một đầu số ưu tiên." };

  const khoangGia = typeof b.khoangGia === "string" && (KHOANG_GIA_HOP_LE as readonly string[]).includes(b.khoangGia)
    ? (b.khoangGia as SimPhongThuyInput["khoangGia"])
    : null;
  if (!khoangGia) return { ok: false, error: "Vui lòng chọn khoảng giá mong muốn." };

  const yeuCauRieng = typeof b.yeuCauRieng === "string" ? b.yeuCauRieng.trim().slice(0, 1000) : undefined;

  return {
    ok: true,
    input: {
      hoTen,
      soDienThoaiZalo,
      gioiTinh,
      ngaySinh,
      ...(gioSinh !== undefined ? { gioSinh } : {}),
      soCCCD,
      diaChiNhanSim,
      congViecHienTai,
      mongMuonTimSim,
      ...(mongMuonKhac ? { mongMuonKhac } : {}),
      mangMongMuon,
      dauSoUuTien,
      khoangGia,
      ...(yeuCauRieng ? { yeuCauRieng } : {}),
    },
  };
}

