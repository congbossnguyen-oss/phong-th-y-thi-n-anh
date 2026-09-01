// ĐIỂM VÀO DUY NHẤT cho luận giải Tử Vi trả phí — dùng cho cả trang kết quả, PDF, và email. Tính
// lại từ input mỗi lần gọi (không lưu sẵn kết quả cuối) — phần deterministic (an sao, chấm điểm) là
// thuần nên rẻ; phần AI có cache riêng theo hash lá số (cache.ts) nên gọi lại không tốn thêm tiền.
//
// Quyết định SPEC.md mục 9.5 (chưa chốt lúc build — 26/8/2026): CHO PHÉP mua thẳng Nâng Cao, không
// bắt buộc mua Cơ Bản trước. Cách làm: khi khách mua Nâng Cao, LUÔN đảm bảo Cơ Bản đã tính xong
// (cache hit hoặc gọi mới) rồi mới ghép Nâng Cao — vừa thoả "kế thừa nguyên vẹn Cơ Bản" (SPEC mục
// 0.1) vừa không cần 2 luồng checkout riêng. Nếu Công quyết định khác (bắt buộc mua Cơ Bản trước),
// chỉ cần thêm điều kiện chặn ở lớp checkout, orchestrator này không đổi.

import { tinhTuVi, type TuViChart } from "../engine";
import { chamVaXayDungDuLieu, type DuLieuLaSoTuVi } from "./adapter";
import type { KetQuaChamDiem } from "./chamDiem";
import { luanCoBan, type KetQuaCoBan } from "./aiCoBan";
import { luanNangCao, type KetQuaNangCao } from "./aiNangCao";
import { hauKiemCoBan, hauKiemNangCao, type CanhBaoHauKiem } from "./hauKiem";
import { cacheCoBan, cacheNangCao, hashCoBan, hashNangCao } from "./cache";

// Single-flight: nếu 2 nơi cùng lúc cần tính đúng 1 lá số (webhook orders.ts tính để gửi mail, khách
// bấm "Tải PDF ngay" trong lúc trang đang chờ, admin xem trang) — chỉ gọi AI ĐÚNG 1 LẦN, lệnh gọi sau
// chờ chung kết quả của lệnh gọi trước thay vì tính lại tốn thêm tiền (anh Công yêu cầu 1/9/2026).
// Đặt Ở ĐÂY (không phải cache.ts) vì cần key riêng cho Cơ Bản/Nâng Cao giống hệt layCoBan/layNangCao.
const dangTinhCoBan = new Map<string, Promise<KetQuaCoBan | null>>();
const dangTinhNangCao = new Map<string, Promise<KetQuaNangCao | null>>();
function chiTinh1Lan<T>(dangTinh: Map<string, Promise<T>>, key: string, tinh: () => Promise<T>): Promise<T> {
  const dangChay = dangTinh.get(key);
  if (dangChay) return dangChay;
  const p = tinh().finally(() => dangTinh.delete(key));
  dangTinh.set(key, p);
  return p;
}
import { tongQuanFree, type KetQuaTongQuanFree } from "./tongQuanFree";

export type GoiLuanGiai = "co_ban" | "nang_cao";

export type LuanGiaiTuViInput = {
  day: number;
  month: number;
  year: number;
  hour: number;
  gender: "Nam" | "Nữ";
  hoTen: string;
  goi: GoiLuanGiai;
  /** Năm dùng để tính Đại Hạn/Tiểu Hạn — mặc định năm hiện tại lúc gọi. */
  viewingYear?: number;
};

export type KetQuaLuanGiaiTuVi = {
  hopLe: boolean;
  loi?: string;
  chart?: TuViChart;
  cham?: KetQuaChamDiem;
  duLieu?: DuLieuLaSoTuVi;
  free?: KetQuaTongQuanFree;
  coBan?: KetQuaCoBan;
  nangCao?: KetQuaNangCao;
  /** true nếu phần AI của gói đang xin (co_ban hoặc nang_cao) chưa gọi được — trang tự hiện thông báo phù hợp, KHÔNG lộ ra khách là do thiếu key. */
  aiOk: boolean;
  canhBao: CanhBaoHauKiem[];
};

async function layCoBan(chart: TuViChart, duLieu: DuLieuLaSoTuVi, input: LuanGiaiTuViInput, canhBao: CanhBaoHauKiem[]): Promise<KetQuaCoBan | null> {
  const key = hashCoBan(input);
  const cached = cacheCoBan.get(key);
  if (cached) return cached;

  return chiTinh1Lan(dangTinhCoBan, key, async () => {
    // Kiểm tra lại cache SAU khi giành được lượt tính (có thể lệnh chạy trước vừa xong lúc mình chờ
    // vào đây) — tránh 1 trường hợp hiếm: gọi vào đúng lúc promise cũ vừa `finally` xoá khỏi Map
    // nhưng cache đã set xong, để không phải tính thêm 1 lần dư.
    const cachedLai = cacheCoBan.get(key);
    if (cachedLai) return cachedLai;

    const { ketQua } = await luanCoBan(duLieu);
    if (!ketQua) return null;

    const { ketQua: daLoc, canhBao: cb } = hauKiemCoBan(ketQua, duLieu);
    canhBao.push(...cb);
    cacheCoBan.set(key, daLoc);
    return daLoc;
  });
}

async function layNangCao(
  chart: TuViChart,
  duLieu: DuLieuLaSoTuVi,
  input: LuanGiaiTuViInput,
  coBan: KetQuaCoBan,
  canhBao: CanhBaoHauKiem[],
): Promise<KetQuaNangCao | null> {
  const namXem = input.viewingYear ?? new Date().getFullYear();
  const key = hashNangCao({ ...input, viewingYear: namXem });
  const cached = cacheNangCao.get(key);
  if (cached) return cached;

  return chiTinh1Lan(dangTinhNangCao, key, async () => {
    const cachedLai = cacheNangCao.get(key);
    if (cachedLai) return cachedLai;

    const { ketQua } = await luanNangCao(duLieu, coBan);
    if (!ketQua) return null;

    const { ketQua: daLoc, canhBao: cb } = hauKiemNangCao(ketQua);
    canhBao.push(...cb);
    cacheNangCao.set(key, daLoc);
    return daLoc;
  });
}

export async function taoLuanGiaiTuVi(input: LuanGiaiTuViInput): Promise<KetQuaLuanGiaiTuVi> {
  const namXem = input.viewingYear ?? new Date().getFullYear();
  let chart: TuViChart;
  try {
    chart = tinhTuVi({ day: input.day, month: input.month, year: input.year, hour: input.hour, gender: input.gender, viewingYear: namXem });
  } catch (err) {
    return { hopLe: false, loi: err instanceof Error ? err.message : "Không lập được lá số với dữ liệu này.", aiOk: false, canhBao: [] };
  }

  const { cham, duLieu } = chamVaXayDungDuLieu(chart, input.hoTen);
  const free = tongQuanFree(chart);
  const canhBao: CanhBaoHauKiem[] = [];

  const coBan = await layCoBan(chart, duLieu, input, canhBao);
  if (!coBan) {
    return { hopLe: true, chart, cham, duLieu, free, aiOk: false, canhBao };
  }

  if (input.goi === "co_ban") {
    return { hopLe: true, chart, cham, duLieu, free, coBan, aiOk: true, canhBao };
  }

  const nangCao = await layNangCao(chart, duLieu, input, coBan, canhBao);
  if (!nangCao) {
    // Có Cơ Bản nhưng thiếu Nâng Cao — vẫn coi aiOk=false vì khách trả tiền cho Nâng Cao mà chưa đủ.
    return { hopLe: true, chart, cham, duLieu, free, coBan, aiOk: false, canhBao };
  }

  return { hopLe: true, chart, cham, duLieu, free, coBan, nangCao, aiOk: true, canhBao };
}
