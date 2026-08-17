/**
 * `@thien-anh/phone-energy-engine` — luận số điện thoại theo Bát Cực Linh Số.
 *
 * Toàn bộ là hàm thuần, xác định (deterministic), KHÔNG gọi AI lúc chạy — kể cả phần bài luận văn
 * xuôi cũng ghép từ template soạn sẵn.
 *
 * Phạm vi CỐ Ý loại trừ theo yêu cầu chủ dự án: không luận Kinh Dịch / 64 quẻ, không luận Âm Dương
 * của dãy số. Tổ hợp nào không có trong bảng thì trả về ở `thieuDuLieu`, không suy đoán.
 */
import { chuanHoaSo, tachCapGoc, traBatTinh } from "./engine/tachCap.js";
import { luanBo3So } from "./engine/bo3So.js";
import { luanKetCuc } from "./engine/ketCuc.js";
import { tongHopCanhBao } from "./engine/canhBao.js";
import { luan10Nhom } from "./engine/nhomTuTruong.js";
import { tinhDiemTongQuan } from "./engine/diem.js";
import { tinhThongKe } from "./engine/thongKe.js";
import {
  apDungCoCheB,
  chuanHoaCccd,
  thieuDuLieuVuotTuoi,
  tinhVanThe,
} from "./engine/vanThe.js";
import { dungBaiLuan } from "./templates/baiLuan.js";
import type { LuanSoDienThoaiInput, LuanSoDienThoaiResult, TenTinh, ThieuDuLieu } from "./types.js";

export * from "./types.js";
export { chuanHoaSo, tachCapGoc, traBatTinh, LoiSoDienThoai } from "./engine/tachCap.js";
export { chuanHoaCccd, tinhVanThe, apDungCoCheB, LoiCccd } from "./engine/vanThe.js";
export { hoaGiaiNoiBo, luanBo3So, chuoiHungDaiNhat } from "./engine/bo3So.js";
export { tinhDiemTongQuan, nhanTheoDiem, TRONG_SO_MAC_DINH } from "./engine/diem.js";
export { traCap, TAT_CA_TINH, CAT_TINH, HUNG_TINH } from "./data/batTinh.js";
export { MO_TA_8_TINH } from "./data/moTa8Tinh.js";

/** Tinh xuất hiện nhiều nhất trong dãy. Hoà thì lấy tinh gặp trước, không tự chọn ngẫu nhiên. */
function timTinhChuDao(tenTinh: TenTinh[]): { ten: TenTinh; soLan: number } | null {
  if (tenTinh.length === 0) return null;
  const dem = new Map<TenTinh, number>();
  for (const t of tenTinh) dem.set(t, (dem.get(t) ?? 0) + 1);
  let ten = tenTinh[0]!;
  let soLan = dem.get(ten) ?? 0;
  for (const t of tenTinh) {
    const n = dem.get(t) ?? 0;
    if (n > soLan) {
      ten = t;
      soLan = n;
    }
  }
  return { ten, soLan };
}

/** Hàm chính — chạy trọn 8 bước. */
export function luanSoDienThoai(input: LuanSoDienThoaiInput): LuanSoDienThoaiResult {
  const thieuDuLieu: ThieuDuLieu[] = [];

  const soDaChuanHoa = chuanHoaSo(input.soDienThoai);
  const capGocThoS = tachCapGoc(soDaChuanHoa);
  const capGoc = traBatTinh(soDaChuanHoa, capGocThoS);

  // luanBo3So đánh dấu `daHoaGiai` lên chính các phần tử của capGoc — phải chạy TRƯỚC khi chấm điểm.
  const bo3So = luanBo3So(soDaChuanHoa, capGoc);

  const ketCuc = luanKetCuc(soDaChuanHoa, capGoc);
  const canhBao = tongHopCanhBao(soDaChuanHoa, capGoc, input.gioiTinh);
  const nhomTuTruong = luan10Nhom(capGoc, input.mucDich ?? "tổng quát");
  const tinhChuDao = timTinhChuDao(capGoc.map((c) => c.ten));

  // Tuổi ta tính tròn theo năm dương — đủ chính xác để biết đang ở giai đoạn vận thế nào, vì mỗi
  // giai đoạn dài 5-15 năm nên lệch vài tháng không đổi kết luận.
  const tuoiHienTai =
    input.namSinh && Number.isInteger(input.namSinh)
      ? new Date().getFullYear() - input.namSinh
      : null;

  // Bước 5 + Cơ chế B — chỉ chạy được khi có căn cước.
  let vanThe = null as LuanSoDienThoaiResult["vanThe"];
  let hoaGiai: LuanSoDienThoaiResult["hoaGiai"] = [];
  if (input.cccd) {
    const cccd = chuanHoaCccd(input.cccd);
    vanThe = tinhVanThe(cccd);
    if (tuoiHienTai !== null) {
      for (const g of vanThe) {
        g.laHienTai = tuoiHienTai >= g.tuoiTu && tuoiHienTai < g.tuoiDen;
      }
      const vuot = thieuDuLieuVuotTuoi(vanThe, tuoiHienTai);
      if (vuot) thieuDuLieu.push(vuot);
    }
    hoaGiai = apDungCoCheB(vanThe, capGoc);
  }

  // Bước 4 — đối chiếu ngũ hành Tiên Thiên. Cần Nhật Chủ / mệnh cách từ ngày sinh, mà engine này
  // không nhận ngày sinh nên chưa chạy được. Nêu rõ thay vì im lặng bỏ qua.
  thieuDuLieu.push({
    ma: "doi_chieu_tien_thien",
    moTa: "Phần đối chiếu ngũ hành giữa mệnh Tiên Thiên và dãy số chưa chạy trong bản này, vì cần lá số Bát Tự của người dùng chứ không chỉ dãy số.",
  });

  const coHoTroCccd = hoaGiai.some((g) => g.cachHoaGiai.includes("ĐÃ có sẵn"));

  const thongKe = tinhThongKe(capGoc);

  const diem = tinhDiemTongQuan({
    soDaChuanHoa,
    capGoc,
    capTrongDuoi: ketCuc.capTrongDuoi,
    canhBao,
    coHoTroCccd,
  });

  const baiLuan = dungBaiLuan({
    soDaChuanHoa,
    capGoc,
    bo3So,
    ketCuc,
    tinhChuDao,
    nhomTuTruong,
    canhBao,
    vanThe,
    hoaGiai,
    thieuDuLieu,
    coCccd: Boolean(input.cccd),
    loiKhen: diem.loiKhen,
  });

  return {
    soDaChuanHoa,
    capGoc,
    bo3So,
    ketCuc,
    tinhChuDao,
    nhomTuTruong,
    canhBao,
    vanThe,
    hoaGiai,
    thongKe,
    tuoiHienTai,
    diem,
    baiLuan,
    thieuDuLieu,
  };
}
