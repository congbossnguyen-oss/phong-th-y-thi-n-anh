// Engine lõi lập lá bàn Kỳ Môn Độn Giáp — chế độ GIỜ (Prompt 1).
// Dịch từ SPEC_cho_Claude_Code.md. Đọc README.md trong thư mục này để biết phần nào
// đã đối chiếu khớp 100% với lá mẫu, phần nào là suy luận có ghi chú rõ.

import { getCanChi } from "@thien-anh/calendar-core";
import {
  CAN_A_DUONG,
  CAN_AM,
  CAN_DUONG,
  CHI_CUNG,
  CHI_LIST,
  CHI_SO,
  HUONG_BY_CUNG,
  MA_BY_TAM_HOP,
  modWrap,
} from "./constants";
import {
  buildPalaceCycle,
  diaBanCanByCung as buildDiaBanCanByCung,
  giapTyByTen,
  homeCungOfSao,
  kmDataByDate,
  monNext,
  monOfCung,
  monPrev,
  saoNext,
  saoOfCung,
  saoPrev,
  THAN_AM,
  THAN_DUONG,
  TRA_Y63,
} from "./tables";
import type { AmDuong, CungInfo, LapLaBanInput, LapLaBanResult } from "./types";

const PALACE_CYCLE = buildPalaceCycle();

/**
 * Đi 1 vòng 8 cung xuất phát từ `startCung`, đọc theo `cycle` (thuận) hoặc đảo ngược
 * (nghịch — âm độn), rồi gán dãy `items` (8 phần tử, đã đúng thứ tự bắt đầu từ startCung)
 * vào từng cung theo đúng vị trí trong vòng đó.
 *
 * Đã đối chiếu khớp 8/8 môn và 8/8 bát thần với lá mẫu mục 6 SPEC (âm độn) — xem README.
 */
function placeAroundPalace(startCung: number, isDuong: boolean, items: string[]): Map<number, string> {
  const cycle = isDuong ? PALACE_CYCLE : [...PALACE_CYCLE].reverse();
  const startIdx = cycle.indexOf(startCung);
  if (startIdx === -1) throw new Error(`Cung ${startCung} không nằm trong vòng 8 cung (chắc là 5 - Trung cung?).`);
  const walk = [...cycle.slice(startIdx), ...cycle.slice(0, startIdx)];
  const result = new Map<number, string>();
  walk.forEach((cungSo, i) => result.set(cungSo, items[i]));
  return result;
}

/** Dựng dãy 8 tên (sao/môn) bắt đầu từ `start`, đi tới (`nextMap`) hoặc lùi (`prevMap`). */
function chain8(start: string, map: Map<string, string>): string[] {
  const out: string[] = [start];
  let cur = start;
  for (let i = 0; i < 7; i++) {
    const nxt = map.get(cur);
    if (!nxt) throw new Error(`Chuỗi bị đứt tại "${cur}".`);
    out.push(nxt);
    cur = nxt;
  }
  return out;
}

/**
 * Lập lá bàn Kỳ Môn Độn Giáp — chế độ GIỜ.
 * Input: ngày dương lịch + giờ:phút. Toàn bộ cục/âm-dương/phù-đầu tra từ km_data.json +
 * km_giaptytable.json (không tự tính lịch âm). Tứ trụ (hiển thị) dùng @thien-anh/calendar-core
 * (đã đối chiếu khớp 100% với 2 lá mẫu trong SPEC/TEST).
 */
export function lapLaBan(input: LapLaBanInput): LapLaBanResult {
  const { nam, thang, ngay, gio, phut } = input;
  const ghiChu: string[] = [];

  const dateKey = `${nam}-${String(thang).padStart(2, "0")}-${String(ngay).padStart(2, "0")}`;
  const ngayRow = kmDataByDate.get(dateKey);
  if (!ngayRow) {
    throw new Error(
      `Không có dữ liệu km_data cho ngày ${dateKey}. Phạm vi hỗ trợ: 1901-01-01 .. 2051-02-07.`,
    );
  }

  const canChi = getCanChi({
    year: nam,
    month: thang,
    day: ngay,
    hour: gio,
    minute: phut,
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const tuTru = {
    gio: { can: canChi.hour.can, chi: canChi.hour.chi },
    ngay: { can: canChi.day.can, chi: canChi.day.chi },
    thang: { can: canChi.month.can, chi: canChi.month.chi },
    nam: { can: canChi.year.can, chi: canChi.year.chi },
  };

  if (tuTru.ngay.can !== ngayRow.can || tuTru.ngay.chi !== ngayRow.chi) {
    throw new Error(
      `Lệch dữ liệu: can-chi ngày tính từ calendar-core (${tuTru.ngay.can} ${tuTru.ngay.chi}) ` +
        `khác km_data.json (${ngayRow.can} ${ngayRow.chi}) cho ngày ${dateKey}.`,
    );
  }

  const cuc = ngayRow.cuc;
  const amDuong: AmDuong = ngayRow.amduong;
  const isDuong = amDuong === "+";

  // ---- Bước 4: Phù đầu (từ trụ GIỜ) ----
  const gioTen = `${tuTru.gio.can} ${tuTru.gio.chi}`;
  const gioTuan = giapTyByTen.get(gioTen);
  if (!gioTuan) throw new Error(`Không tìm thấy tuần Giáp Tý chứa giờ ${gioTen}.`);
  const phuDau = gioTuan.phudau;
  const tk1 = gioTuan.tuankhong_chi;
  const tk2 = CHI_LIST[(CHI_LIST.indexOf(tk1 as (typeof CHI_LIST)[number]) + 1) % 12];
  const tuanKhongChi: [string, string] = [tk1, tk2];

  // ---- Bước 6: Địa Bàn (lục nghi tam kỳ) — SPEC mục 5B: hệ 9 phương trình tự tham chiếu
  // (dia_ban_cong_thuc), thay cho cách cũ (diaban_luc_nghi[cục-1] + thứ tự cố định).
  // Đã đối chiếu khớp 7/7 với lá mẫu SPEC mục 6, kể cả giải xong nghi vấn Càn "Đinh"/"Kỷ".
  const diaBanCanByCung = buildDiaBanCanByCung(cuc, isDuong);

  let cungPhuDau = -1;
  for (const [cungSo, can] of diaBanCanByCung) {
    if (can === phuDau) cungPhuDau = cungSo;
  }
  if (cungPhuDau === -1) throw new Error(`Không tìm thấy Phù đầu ${phuDau} trên Địa Bàn vừa dựng.`);

  // ---- Bước 7: Trực Phù / Trực Sử (công thức mục 5 SPEC, vùng V60:X66) ----
  // X65 (Trực Phù) dùng Bảng B (Mậu=1...Ất=9, đổi theo âm/dương độn) — không đổi.
  // W63 (đầu vào Y63) dùng Bảng A CỐ ĐỊNH (Giáp=1...Quý=10, không đổi theo âm/dương) — đã được
  // Công xác nhận đúng (Y63 ra 10 và 8, chẵn, tra được bảng thật).
  const soCanGio_B = isDuong ? CAN_DUONG[tuTru.gio.can] : CAN_AM[tuTru.gio.can]; // dùng cho X65 + X66 (theo mục 5 gốc)
  const soCanGio_W63 = CAN_A_DUONG[tuTru.gio.can]; // Bảng A cố định — chỉ dùng để tính Y63
  const soChiGio = CHI_SO[tuTru.gio.chi];
  const y63 = Math.abs(soChiGio - soCanGio_W63);
  const traChinhXac = TRA_Y63.get(y63);
  const tra = traChinhXac ?? y63 + 2;
  if (traChinhXac === undefined) {
    ghiChu.push(
      `CẢNH BÁO: Y63=${y63} (lẻ, tính theo Bảng A) không có trong bảng tra(Y63) chính xác (chỉ có các khóa chẵn 0,2,4,6,8,10) — đang dùng công thức xấp xỉ Y63+2 = ${tra} làm phương án dự phòng.`,
    );
  }

  // X64/X66 theo ĐÚNG văn bản mục 5 gốc, không đổi (đã verify qua LibreOffice — Công xác nhận):
  // X65/X64 rẽ nhánh theo âm/dương độn; X66 = MOD(số_can_giờ + X64 − 1, 9), dùng Bảng B.
  const x65Raw = isDuong ? modWrap(cuc + soCanGio_B - 1, 9) : modWrap(1 + cuc - soCanGio_B, 9);
  const x64 = isDuong ? modWrap(cuc + tra - 1, 9) : modWrap(1 + cuc - tra, 9);
  const x66Raw = modWrap(soCanGio_B + x64 - 1, 9);

  // Bước đặc lệ cuối (SPEC 5B, verify qua LibreOffice): nếu X65/X66 = 5 (Trung cung), đổi
  // thành 2 (Khôn) — Trung cung mượn thuộc tính Khôn, không tự có Trực Phù/Trực Sử riêng.
  const x65 = x65Raw === 5 ? 2 : x65Raw;
  const x66 = x66Raw === 5 ? 2 : x66Raw;

  const debugTrucSu = {
    W62: tuTru.gio.can,
    X62: tuTru.gio.chi,
    W63: soCanGio_W63,
    X63: soChiGio,
    Y63: y63,
    traNguon: (traChinhXac === undefined ? "xap_xi_du_phong" : "bang_chinh_xac") as
      | "bang_chinh_xac"
      | "xap_xi_du_phong",
    tra,
    X64: x64,
    cuc,
    amDuong,
    X65: x65,
    X66: x66,
  };

  const trucPhuCung = x65;
  const trucSuCung = x66;
  const saoTrucPhu = saoOfCung.get(cungPhuDau)!;
  const monTrucSu = monOfCung.get(cungPhuDau)!;
  ghiChu.push(
    `Trực Phù/Trực Sử: cung "nhà" của Phù đầu (${phuDau}) trên Địa Bàn là cung ${cungPhuDau} ` +
      `→ Trực Phù = sao ${saoTrucPhu}, Trực Sử = môn ${monTrucSu}.`,
  );

  // ---- Bước 8: Thiên Bàn 9 sao + 8 môn ----
  const saoChain = chain8(saoTrucPhu, saoPrev); // âm: đi lùi. dương: (giả định) nên đi tới — xem README.
  const monChain = chain8(monTrucSu, monPrev);
  const saoChainDuong = chain8(saoTrucPhu, saoNext);
  const monChainDuong = chain8(monTrucSu, monNext);

  const saoByCung = placeAroundPalace(trucPhuCung, isDuong, isDuong ? saoChainDuong : saoChain);
  const monByCung = placeAroundPalace(trucSuCung, isDuong, isDuong ? monChainDuong : monChain);

  // Trung cung (5) không có "nhà" sao/môn riêng — mượn cung Khôn (2), theo cung_mon_sao_thuan gốc.
  saoByCung.set(5, saoByCung.get(2) ?? saoOfCung.get(5)!);
  monByCung.set(5, monByCung.get(2) ?? monOfCung.get(5)!);

  // ---- Bước 9: Bát Thần — khởi từ cung có Trực Phù, thuận (dương) / nghịch (âm) ----
  const thanList = isDuong ? THAN_DUONG : THAN_AM;
  const thanByCung = placeAroundPalace(trucPhuCung, isDuong, thanList);
  thanByCung.set(5, thanByCung.get(2) ?? "");

  // ---- Bước 10: Không Vong + Mã ----
  const maChi = MA_BY_TAM_HOP[tuTru.gio.chi];
  ghiChu.push(
    "KV (Không Vong) ở đây CHỈ tính theo tuần của trụ GIỜ (đúng phạm vi Prompt 1) — lá mẫu SPEC còn nhắc tới KV theo THÁNG (nhãn 'KV giờ & tháng'), phần đó CHƯA làm. Mã (Dịch Mã) dùng quy tắc tam hợp cổ truyền phổ thông, cũng chưa có điểm đối chiếu trực tiếp từ lá mẫu — coi là best-effort.",
  );

  // Thiên Bàn Can: đi theo Sao (Can vốn ở "nhà" của sao nào thì di chuyển cùng sao đó tới
  // cung mới). Đã đối chiếu khớp tại cung Trực Phù (Cấn = Kỷ, đúng lá mẫu); các cung khác
  // suy theo cùng quy tắc, chưa có thêm điểm đối chiếu độc lập — xem README.
  ghiChu.push(
    "Thiên Bàn Can suy theo quy tắc 'đi theo Sao' (Can tại nhà của Sao nào thì theo Sao đó tới cung mới) — mới đối chiếu được 1 điểm (cung Trực Phù), nên coi là suy luận có cơ sở chứ chưa kiểm chứng đầy đủ.",
  );
  const cungList: CungInfo[] = [];
  for (let soCung = 1; soCung <= 9; soCung++) {
    const diaChi = CHI_CUNG[soCung] ?? [];
    const saoODay = saoByCung.get(soCung) ?? "";
    const homeCuaSao = homeCungOfSao.get(saoODay) ?? soCung;
    cungList.push({
      soCung,
      huong: HUONG_BY_CUNG[soCung],
      saoThienBan: saoODay,
      mon: monByCung.get(soCung) ?? "",
      than: thanByCung.get(soCung) ?? "",
      thienBanCan: diaBanCanByCung.get(homeCuaSao) ?? "",
      diaBanCan: diaBanCanByCung.get(soCung) ?? "",
      diaChi,
      KV: diaChi.some((c) => c === tuanKhongChi[0] || c === tuanKhongChi[1]),
      Ma: diaChi.includes(maChi),
    });
  }

  return {
    tuTru,
    cuc,
    amDuong,
    phuDau,
    tuanKhongChi,
    trucPhu: saoTrucPhu,
    trucPhuCung,
    trucSu: monTrucSu,
    debugTrucSu,
    trucSuCung,
    cungList,
    ghiChu,
  };
}
