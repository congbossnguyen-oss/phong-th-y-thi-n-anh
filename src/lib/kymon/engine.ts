// Engine lõi lập lá bàn Kỳ Môn Độn Giáp — 6 chế độ (Prompt 2: Giờ/Ngày/Tháng/Năm/Mệnh/1080).
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
import type { AmDuong, CheDo, CungInfo, LapLaBanInput, LapLaBanInputLich, LapLaBanResult, TuTru } from "./types";

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

/** Tham số đầu vào của engine lõi — đã được quy đổi xong về đúng 1 dạng chung: trụ nào làm
 * "thời thần" (can/chi), cục + âm/dương lấy ở đâu, tứ trụ hiển thị (có thể rỗng với 1080). */
type ThamSoLoi = {
  cheDo: CheDo;
  canThoiThan: string;
  chiThoiThan: string;
  cuc: number;
  amDuong: AmDuong;
  tuTru: TuTru;
};

/**
 * Engine lõi — DÙNG CHUNG cho cả 6 chế độ (SPEC mục 6B). Toàn bộ bước 4-10 của SPEC mục 3
 * chỉ phụ thuộc {canThoiThan, chiThoiThan, cục, âm/dương} — không quan tâm chế độ nào tạo ra
 * chúng. Đây là lý do 6 chế độ không cần viết lại 6 lần.
 */
function layLaBanTuThoiThan(ts: ThamSoLoi): LapLaBanResult {
  const { cheDo, canThoiThan, chiThoiThan, cuc, amDuong, tuTru } = ts;
  const ghiChu: string[] = [];
  const isDuong = amDuong === "+";

  // ---- Bước 4: Phù đầu (từ trụ thời thần) ----
  const tenThoiThan = `${canThoiThan} ${chiThoiThan}`;
  const tuanThoiThan = giapTyByTen.get(tenThoiThan);
  if (!tuanThoiThan) throw new Error(`Không tìm thấy tuần Giáp Tý chứa "${tenThoiThan}".`);
  const phuDau = tuanThoiThan.phudau;
  const tk1 = tuanThoiThan.tuankhong_chi;
  const tk2 = CHI_LIST[(CHI_LIST.indexOf(tk1 as (typeof CHI_LIST)[number]) + 1) % 12];
  const tuanKhongChi: [string, string] = [tk1, tk2];

  // ---- Bước 6: Địa Bàn (lục nghi tam kỳ) — SPEC mục 5B: hệ 9 phương trình tự tham chiếu. ----
  const diaBanCanByCung = buildDiaBanCanByCung(cuc, isDuong);

  let cungPhuDau = -1;
  for (const [cungSo, can] of diaBanCanByCung) {
    if (can === phuDau) cungPhuDau = cungSo;
  }
  if (cungPhuDau === -1) throw new Error(`Không tìm thấy Phù đầu ${phuDau} trên Địa Bàn vừa dựng.`);

  // ---- Bước 7: Trực Phù / Trực Sử (công thức mục 5 + 5B SPEC, đã verify qua LibreOffice) ----
  // X65 (Trực Phù) dùng Bảng B (Mậu=1...Ất=9, đổi theo âm/dương độn).
  // W63 (đầu vào Y63) dùng Bảng A CỐ ĐỊNH (Giáp=1...Quý=10, không đổi theo âm/dương).
  const soCanThoiThan_B = isDuong ? CAN_DUONG[canThoiThan] : CAN_AM[canThoiThan]; // dùng cho X65 + X66
  const soCanThoiThan_W63 = CAN_A_DUONG[canThoiThan]; // Bảng A cố định — chỉ dùng để tính Y63
  const soChiThoiThan = CHI_SO[chiThoiThan];
  const y63 = Math.abs(soChiThoiThan - soCanThoiThan_W63);
  const traChinhXac = TRA_Y63.get(y63);
  const tra = traChinhXac ?? y63 + 2;
  if (traChinhXac === undefined) {
    ghiChu.push(
      `CẢNH BÁO: Y63=${y63} (lẻ, tính theo Bảng A) không có trong bảng tra(Y63) chính xác (chỉ có các khóa chẵn 0,2,4,6,8,10) — đang dùng công thức xấp xỉ Y63+2 = ${tra} làm phương án dự phòng.`,
    );
  }

  const x65Raw = isDuong ? modWrap(cuc + soCanThoiThan_B - 1, 9) : modWrap(1 + cuc - soCanThoiThan_B, 9);
  const x64 = isDuong ? modWrap(cuc + tra - 1, 9) : modWrap(1 + cuc - tra, 9);
  const x66Raw = modWrap(soCanThoiThan_B + x64 - 1, 9);

  // Bước đặc lệ cuối (SPEC 5B, verify qua LibreOffice): nếu X65/X66 = 5 (Trung cung), đổi
  // thành 2 (Khôn) — Trung cung mượn thuộc tính Khôn, không tự có Trực Phù/Trực Sử riêng.
  const x65 = x65Raw === 5 ? 2 : x65Raw;
  const x66 = x66Raw === 5 ? 2 : x66Raw;

  const debugTrucSu = {
    W62: canThoiThan,
    X62: chiThoiThan,
    W63: soCanThoiThan_W63,
    X63: soChiThoiThan,
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
  const saoChain = chain8(saoTrucPhu, saoPrev);
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

  // ---- Bước 10: Không Vong + Mã (theo tuần của trụ THỜI THẦN — không riêng gì trụ giờ) ----
  const maChi = MA_BY_TAM_HOP[chiThoiThan];
  ghiChu.push(
    "KV (Không Vong) ở đây CHỈ tính theo tuần của trụ THỜI THẦN (chưa làm KV theo tháng/năm riêng cho các chế độ khác — thuộc phạm vi rộng hơn Prompt 2). Mã (Dịch Mã) dùng quy tắc tam hợp cổ truyền phổ thông, chưa có điểm đối chiếu trực tiếp từ lá mẫu — coi là best-effort.",
  );

  // Thiên Bàn Can: đi theo Sao (Can vốn ở "nhà" của sao nào thì di chuyển cùng sao đó tới
  // cung mới). Đã đối chiếu khớp tại cung Trực Phù; các cung khác suy theo cùng quy tắc.
  ghiChu.push(
    "Thiên Bàn Can suy theo quy tắc 'đi theo Sao' (Can tại nhà của Sao nào thì theo Sao đó tới cung mới) — mới đối chiếu được 1 điểm/lá (cung Trực Phù), nên coi là suy luận có cơ sở chứ chưa kiểm chứng đầy đủ.",
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
    cheDo,
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

/**
 * NỘI BỘ — CHƯA public/chưa gọi tới từ `lapLaBan()`. Xử lý đầy đủ cả 5 chế độ dựa-trên-lịch
 * (Giờ/Ngày/Tháng/Năm/Mệnh) theo đúng SPEC mục 6B: cục/âm-dương luôn tra theo NGÀY DƯƠNG đã
 * nhập (km_data.json chỉ có dữ liệu theo ngày); trụ tháng/năm quy đúng theo TIẾT KHÍ (không
 * theo mùng 1) nhờ @thien-anh/calendar-core.
 *
 * Ngày/Tháng/Năm TẠM NGƯNG (xem README mục "Prompt 2"): đây là 3 hệ lập cục riêng biệt trong
 * lý thuyết Kỳ Môn (Nhật gia/Nguyệt gia/Niên gia), khác hẳn Thời gia mà km_data.json hỗ trợ —
 * đối chiếu với TEST_6_che_do.md cho thấy cục thật sự cần khác cục-theo-ngày (Ngày cần cục 8,
 * Tháng cần cục 7 tại 19/08/2026), nhưng 2 điểm mẫu không đủ để suy ra quy luật an toàn — Công
 * đã quyết định KHÔNG đoán/nội suy, chờ thêm dữ liệu mẫu. Hàm này giữ nguyên logic (đúng phần
 * chọn trụ theo tiết khí) để dùng lại sau, không xóa — chỉ không export/gọi cho Ngày/Tháng/Năm.
 */
function _layLaBanTheoLichNoiBo(input: LapLaBanInputLich, cheDo: CheDo): LapLaBanResult {
  const { nam, thang, ngay, gio, phut } = input;

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

  const tuTru: TuTru = {
    gio: { can: canChi.hour.can, chi: canChi.hour.chi },
    ngay: { can: canChi.day.can, chi: canChi.day.chi },
    thang: { can: canChi.month.can, chi: canChi.month.chi },
    nam: { can: canChi.year.can, chi: canChi.year.chi },
  };

  if (tuTru.ngay!.can !== ngayRow.can || tuTru.ngay!.chi !== ngayRow.chi) {
    throw new Error(
      `Lệch dữ liệu: can-chi ngày tính từ calendar-core (${tuTru.ngay!.can} ${tuTru.ngay!.chi}) ` +
        `khác km_data.json (${ngayRow.can} ${ngayRow.chi}) cho ngày ${dateKey}.`,
    );
  }

  // Trụ làm thời thần — khác biệt DUY NHẤT giữa Giờ/Ngày/Tháng/Năm/Mệnh (SPEC mục 6B).
  const truByCheDo: Record<Exclude<CheDo, "1080">, { can: string; chi: string }> = {
    gio: tuTru.gio!,
    menh: tuTru.gio!, // Mệnh = giống hệt Giờ, chỉ khác input là giờ SINH thay vì giờ hiện tại.
    ngay: tuTru.ngay!,
    thang: tuTru.thang!,
    nam: tuTru.nam!,
  };
  const truThoiThan = truByCheDo[cheDo as Exclude<CheDo, "1080">];

  return layLaBanTuThoiThan({
    cheDo,
    canThoiThan: truThoiThan.can,
    chiThoiThan: truThoiThan.chi,
    cuc: ngayRow.cuc,
    amDuong: ngayRow.amduong,
    tuTru,
  });
}

/**
 * Lập lá bàn Kỳ Môn Độn Giáp — 3 chế độ đang hỗ trợ chính thức: **Giờ / Mệnh / 1080**
 * (SPEC mục 6B). Ngày/Tháng/Năm tạm ngưng, xem README mục "Prompt 2" trước khi bật lại.
 */
export function lapLaBan(input: LapLaBanInput): LapLaBanResult {
  if (input.cheDo === "1080") {
    const { soCuc, amDuong, hoaGiap } = input;
    const hoaGiapRow = giapTyByTen.get(hoaGiap);
    if (!hoaGiapRow) throw new Error(`"${hoaGiap}" không phải 1 trong 60 hoa giáp hợp lệ.`);
    const [canHoaGiap, chiHoaGiap] = hoaGiap.split(" ");
    return layLaBanTuThoiThan({
      cheDo: "1080",
      canThoiThan: canHoaGiap,
      chiThoiThan: chiHoaGiap,
      cuc: soCuc,
      amDuong,
      tuTru: {},
    });
  }

  const cheDo = input.cheDo ?? "gio";
  if (cheDo !== "gio" && cheDo !== "menh") {
    throw new Error(
      `Chế độ "${cheDo}" tạm ngưng, chưa đủ dữ liệu để xác định công thức lập cục (xem README.md mục "Prompt 2"). Chỉ hỗ trợ: gio, menh, 1080.`,
    );
  }
  return _layLaBanTheoLichNoiBo(input, cheDo);
}
