/**
 * Bộ chấm điểm QUAN HỆ CAN/CHI/NGŨ HÀNH dùng chung — trích từ cùng 1 thuật toán đã kiểm chứng
 * ở `tuoiHopLamAn.ts` (Can: Ngũ hợp/tương sinh/bình hòa/khắc dị-đồng tính; Chi: Tam hợp/Lục
 * hợp/Xung/Hình/Hại/Phá/Bình hòa, ưu tiên Xung lấn át Hình/Hại/Phá nếu trùng; Ngũ Hành: tương
 * sinh/tương hòa/tương khắc).
 *
 * Đây là "dữ liệu nền" DÙNG CHUNG giữa nhiều module chấm điểm mới (Giờ Tốt Trong Ngày, Vận May
 * Trong Ngày, Ngày Khai Trương, Ngày Ký Hợp Đồng, Ngày Đại Cát Cá Nhân) — mỗi module tự cấu
 * hình trọng số điểm riêng (`*RelationRules`) và tự đặt tên hàm bọc ngoài theo đúng kiến trúc
 * đã yêu cầu, KHÔNG chia sẻ 1 hàm tính điểm tổng hợp duy nhất (tránh trộn logic giữa các mục
 * đích khác nhau — đúng nguyên tắc "dùng chung dữ liệu nền nhưng scoring riêng").
 */
import { Data } from "@thien-anh/calendar-core";
import { isCanHop } from "../trach-nhat/canHop.js";
import { isTamHop } from "../trach-nhat/tamHop.js";
import { isLucHop } from "../trach-nhat/lucHop.js";
import { getLucXungChi } from "../trach-nhat/lucXung.js";
import { getHinhThaiTueChi, getHaiThaiTueChi, getPhaThaiTueChi, TU_HINH } from "../trach-nhat/thaiTue.js";
import { getNguHanhQuanHe } from "../trach-nhat/nguHanhQuanHe.js";

type Can = Data.Can;
type Chi = Data.Chi;
type NguHanh = Data.NguHanh;

function nguHanhCuaCan(can: Can): NguHanh {
  return Data.CAN_NGU_HANH[Data.CAN.indexOf(can)]!;
}

function amDuongCuaCan(can: Can): "Dương" | "Âm" {
  return Data.CAN_AM_DUONG[Data.CAN.indexOf(can)]!;
}

export function nguHanhCuaChi(chi: Chi): NguHanh {
  return Data.CHI_NGU_HANH[Data.CHI.indexOf(chi)]!;
}

function clamp10(diem: number): number {
  return Math.max(0, Math.min(10, diem));
}

export interface CanRelationRules {
  diemNenTang: number;
  hopDiem: number;
  sinhDiem: number;
  binhHoaDiem: number;
  khacDiem: number;
  khacManhDiem: number;
}

export interface CanRelationResult {
  diem: number;
  moTa: string;
  hop: boolean;
}

/** Quan hệ Thiên Can (Ngũ hợp/tương sinh/bình hòa/khắc dị-đồng tính) giữa `canA` và `canB`. */
export function tinhQuanHeCan(canA: Can, canB: Can, rules: CanRelationRules): CanRelationResult {
  let diem = rules.diemNenTang;

  if (isCanHop(canA, canB)) {
    diem += rules.hopDiem;
    return { diem: clamp10(diem), moTa: `Ngũ hợp (${canA}-${canB})`, hop: true };
  }

  const quanHe = getNguHanhQuanHe(nguHanhCuaCan(canA), nguHanhCuaCan(canB));
  switch (quanHe) {
    case "tuong-hoa":
      diem += rules.binhHoaDiem;
      return { diem: clamp10(diem), moTa: "Bình hòa (cùng Ngũ Hành Can)", hop: false };
    case "a-sinh-b":
    case "b-sinh-a":
      diem += rules.sinhDiem;
      return { diem: clamp10(diem), moTa: "Tương sinh", hop: false };
    case "a-khac-b":
    case "b-khac-a": {
      const dongTinh = amDuongCuaCan(canA) === amDuongCuaCan(canB);
      diem += dongTinh ? rules.khacManhDiem : rules.khacDiem;
      return { diem: clamp10(diem), moTa: dongTinh ? "Khắc mạnh (đồng tính)" : "Khắc", hop: false };
    }
  }
}

export interface ChiRelationRules {
  diemNenTang: number;
  tamHopDiem: number;
  lucHopDiem: number;
  binhHoaDiem: number;
  hinhHaiPhaDiem: number;
  xungDiem: number;
}

export interface ChiRelationResult {
  diem: number;
  moTa: string;
  tamHop: boolean;
  lucHop: boolean;
  xung: boolean;
  hinh: boolean;
  hai: boolean;
  pha: boolean;
}

function isHinh(chiA: Chi, chiB: Chi): boolean {
  if (chiA === chiB) return (TU_HINH as readonly Chi[]).includes(chiA);
  return getHinhThaiTueChi(chiA).includes(chiB);
}

function isHai(chiA: Chi, chiB: Chi): boolean {
  if (chiA === chiB) return false;
  return getHaiThaiTueChi(chiA) === chiB;
}

function isPha(chiA: Chi, chiB: Chi): boolean {
  if (chiA === chiB) return false;
  return getPhaThaiTueChi(chiA) === chiB;
}

function isXung(chiA: Chi, chiB: Chi): boolean {
  if (chiA === chiB) return false;
  return getLucXungChi(chiA) === chiB;
}

/**
 * Quan hệ Địa Chi (Tam hợp/Lục hợp/Xung/Hình/Hại/Phá/Bình hòa) giữa `chiA` và `chiB` — Xung
 * luôn lấn át Hình/Hại/Phá nếu 1 cặp Chi phạm đồng thời cả 2 (vd. Dần-Thân, Sửu-Mùi).
 */
export function tinhQuanHeChi(chiA: Chi, chiB: Chi, rules: ChiRelationRules): ChiRelationResult {
  let diem = rules.diemNenTang;

  if (isTamHop(chiA, chiB)) {
    diem += rules.tamHopDiem;
    return { diem: clamp10(diem), moTa: "Tam hợp", tamHop: true, lucHop: false, xung: false, hinh: false, hai: false, pha: false };
  }
  if (isLucHop(chiA, chiB)) {
    diem += rules.lucHopDiem;
    return { diem: clamp10(diem), moTa: "Lục hợp", tamHop: false, lucHop: true, xung: false, hinh: false, hai: false, pha: false };
  }
  if (isXung(chiA, chiB)) {
    diem += rules.xungDiem;
    return { diem: clamp10(diem), moTa: "Xung", tamHop: false, lucHop: false, xung: true, hinh: false, hai: false, pha: false };
  }

  const hinh = isHinh(chiA, chiB);
  const hai = isHai(chiA, chiB);
  const pha = isPha(chiA, chiB);
  if (hinh || hai || pha) {
    diem += rules.hinhHaiPhaDiem;
    const nhan = [hinh && "Hình", hai && "Hại", pha && "Phá"].filter((x): x is string => Boolean(x)).join(" + ");
    return { diem: clamp10(diem), moTa: nhan, tamHop: false, lucHop: false, xung: false, hinh, hai, pha };
  }

  diem += rules.binhHoaDiem;
  return { diem: clamp10(diem), moTa: "Bình hòa", tamHop: false, lucHop: false, xung: false, hinh: false, hai: false, pha: false };
}

export interface NguHanhRelationRules {
  diemNenTang: number;
  sinhDiem: number;
  tuongHoaDiem: number;
  khacDiem: number;
}

export interface NguHanhRelationResult {
  diem: number;
  moTa: string;
}

/** Quan hệ Ngũ Hành (tương sinh/tương hòa/tương khắc) giữa `nguHanhA` và `nguHanhB`. */
export function tinhQuanHeNguHanh(nguHanhA: NguHanh, nguHanhB: NguHanh, rules: NguHanhRelationRules): NguHanhRelationResult {
  let diem = rules.diemNenTang;
  const quanHe = getNguHanhQuanHe(nguHanhA, nguHanhB);

  switch (quanHe) {
    case "tuong-hoa":
      diem += rules.tuongHoaDiem;
      return { diem: clamp10(diem), moTa: `Tương hòa (cùng ${nguHanhA})` };
    case "a-sinh-b":
      diem += rules.sinhDiem;
      return { diem: clamp10(diem), moTa: `${nguHanhA} sinh ${nguHanhB}` };
    case "b-sinh-a":
      diem += rules.sinhDiem;
      return { diem: clamp10(diem), moTa: `${nguHanhB} sinh ${nguHanhA}` };
    case "a-khac-b":
      diem += rules.khacDiem;
      return { diem: clamp10(diem), moTa: `${nguHanhA} khắc ${nguHanhB}` };
    case "b-khac-a":
      diem += rules.khacDiem;
      return { diem: clamp10(diem), moTa: `${nguHanhB} khắc ${nguHanhA}` };
  }
}
