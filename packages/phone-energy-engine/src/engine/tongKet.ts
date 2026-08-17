/**
 * Bảng tổng kết cuối bài — chốt lại dãy số này là số gì, và có hợp với nghề khách đang làm không.
 *
 * Trọng tâm là BA SỐ CUỐI (SKILL Bước 3: đuôi số quyết định kết cục); các cặp còn lại chỉ đóng vai
 * phụ trợ. Cụ thể trong cách tính dưới đây, một cặp ở đuôi nặng gấp `TRONG_SO_DUOI` lần một cặp
 * nằm giữa dãy.
 */
import { CACH_CUC, type BoiCanhCachCuc, type LoaiCachCuc } from "../data/cachCuc.js";
import { traNhomNghe } from "../data/ngheNghiep.js";
import type { KetQuaCap, TenTinh } from "../types.js";

/** Một cặp ở ba số cuối nặng bằng bấy nhiêu cặp nằm giữa dãy. */
const TRONG_SO_DUOI = 3;

export interface CachCucTrungKhop {
  ma: string;
  ten: string;
  loai: LoaiCachCuc;
  dienGiai: string;
  canCu: string;
}

export type MucDoHopNghe = "rất phù hợp" | "phù hợp" | "tạm được" | "chưa phù hợp";

export interface DoiChieuNghe {
  nhom: string;
  mucDo: MucDoHopNghe;
  dienGiai: string;
  /** Tên tinh trong dãy đang đẩy nghề này lên, kèm ghi chú ở đuôi hay ở giữa. */
  dangHoTro: string[];
  dangCanTro: string[];
}

export interface TongKet {
  baSoDuoi: string;
  /** Tên các tinh ở ba số cuối, theo thứ tự trong dãy. */
  tinhODuoi: TenTinh[];
  cachCuc: CachCucTrungKhop[];
  doiChieuNghe: DoiChieuNghe | null;
  /** Hai đến ba câu chốt cuối cùng. */
  ketLuan: string;
}

function moTaViTri(oDuoi: boolean): string {
  return oDuoi ? "ở đuôi số" : "ở giữa dãy";
}

/**
 * Đếm điểm hợp / cản của dãy số với một nhóm nghề.
 *
 * Trả về điểm dương nghĩa là dãy đang đẩy nghề đó đi lên. Thang điểm này chỉ dùng để chọn một
 * trong bốn mức lời văn, không hiển thị con số ra ngoài — nó là quy ước của Phong Thủy Thiên Anh
 * chứ không có trong tài liệu gốc.
 */
function doiChieuNgheNghiep(
  maNghe: string,
  capGoc: KetQuaCap[],
  capTrongDuoi: KetQuaCap[],
): DoiChieuNghe | null {
  const nhom = traNhomNghe(maNghe);
  if (!nhom || (nhom.tinhHopNhat.length === 0 && nhom.tinhCanTro.length === 0)) return null;

  const oDuoi = new Set(capTrongDuoi.map((c) => c.ten));
  const dangHoTro: string[] = [];
  const dangCanTro: string[] = [];
  let diem = 0;

  const daKe = new Set<TenTinh>();
  for (const c of capGoc) {
    if (daKe.has(c.ten)) continue;
    const trongDuoi = oDuoi.has(c.ten);
    const trongSo = trongDuoi ? TRONG_SO_DUOI : 1;
    if (nhom.tinhHopNhat.includes(c.ten)) {
      diem += trongSo;
      dangHoTro.push(`${c.ten} ${moTaViTri(trongDuoi)}`);
      daKe.add(c.ten);
    } else if (nhom.tinhCanTro.includes(c.ten)) {
      diem -= trongSo;
      dangCanTro.push(`${c.ten} ${moTaViTri(trongDuoi)}`);
      daKe.add(c.ten);
    }
  }

  let mucDo: MucDoHopNghe;
  if (diem >= TRONG_SO_DUOI) mucDo = "rất phù hợp";
  else if (diem > 0) mucDo = "phù hợp";
  else if (diem === 0) mucDo = "tạm được";
  else mucDo = "chưa phù hợp";

  // Danh sách tinh hỗ trợ / cản trở đã nằm ở `dangHoTro` và `dangCanTro` nên KHÔNG nhắc lại trong
  // câu văn — tầng hiển thị đang in cả hai, lặp lại thành thừa.
  const cau: string[] = [];
  if (dangHoTro.length === 0 && dangCanTro.length === 0) {
    cau.push("Dãy số không có năng lượng nào đặc biệt hợp hay đặc biệt kỵ với nhóm nghề này.");
  }

  const chot: Record<MucDoHopNghe, string> = {
    "rất phù hợp":
      "Dãy số này rất hợp với công việc hiện tại của anh/chị — năng lượng đỡ đúng vào chỗ nghề cần, lại nằm ở ba số cuối là chỗ quyết định kết cục. Nên giữ số.",
    "phù hợp":
      "Dãy số này hợp với công việc hiện tại, có năng lượng đỡ nhưng chưa nằm ở vị trí mạnh nhất. Dùng được lâu dài.",
    "tạm được":
      "Dãy số này không xung với công việc hiện tại, nhưng cũng không có năng lượng nào đẩy nghề đi lên. Muốn bứt tốc thì nên tìm số có đúng năng lượng nghề cần.",
    "chưa phù hợp":
      "Dãy số này chưa hợp với công việc hiện tại — năng lượng trong số đang đi ngược lại thứ mà nghề đòi hỏi. Đây là chỗ nên cân nhắc đổi số, hoặc ít nhất chọn thêm một số phụ dùng cho việc.",
  };
  cau.push(chot[mucDo]);

  return { nhom: nhom.ten, mucDo, dienGiai: cau.join(" "), dangHoTro, dangCanTro };
}

export function dungTongKet(params: {
  baSoDuoi: string;
  capGoc: KetQuaCap[];
  capTrongDuoi: KetQuaCap[];
  maNghe?: string | undefined;
}): TongKet {
  const { baSoDuoi, capGoc, capTrongDuoi } = params;

  const boiCanh: BoiCanhCachCuc = {
    oDuoi: new Set(capTrongDuoi.map((c) => c.ten)),
    trongDay: new Set(capGoc.map((c) => c.ten)),
    oDuoiChuaHoaGiai: new Set(capTrongDuoi.filter((c) => !c.daHoaGiai).map((c) => c.ten)),
  };

  const cachCuc: CachCucTrungKhop[] = CACH_CUC.filter((c) => c.dieuKien(boiCanh)).map((c) => ({
    ma: c.ma,
    ten: c.ten,
    loai: c.loai,
    dienGiai: c.dienGiai,
    canCu: c.canCu,
  }));

  const doiChieuNghe = params.maNghe
    ? doiChieuNgheNghiep(params.maNghe, capGoc, capTrongDuoi)
    : null;

  const cau: string[] = [];
  const tinhODuoi = capTrongDuoi.map((c) => c.ten);

  if (tinhODuoi.length === 0) {
    cau.push(
      `Ba số cuối ${baSoDuoi} không tạo được cặp Bát tinh nào, nên phần kết cục của dãy số này chưa luận được theo bảng.`,
    );
  } else {
    const dsTinh = [...new Set(tinhODuoi)].join(", ");
    cau.push(
      `Ba số cuối ${baSoDuoi} mang năng lượng ${dsTinh} — đây là phần quyết định kết cục của dãy số, các cặp còn lại chỉ đóng vai phụ trợ.`,
    );
  }

  const tot = cachCuc.filter((c) => c.loai === "tốt");
  const luuY = cachCuc.filter((c) => c.loai === "cần lưu ý");
  if (tot.length > 0) {
    cau.push(`Điểm mạnh nổi bật: ${tot.map((c) => c.ten).join("; ")}.`);
  }
  if (luuY.length > 0) {
    cau.push(`Chỗ phải lưu ý: ${luuY.map((c) => c.ten).join("; ")}.`);
  }
  if (cachCuc.length === 0) {
    cau.push(
      "Dãy số không rơi vào cách cục đặc thù nào trong bảng — nghĩa là nó ở mức bình thường, không có điểm bật hẳn lên cũng không có khuyết điểm nặng.",
    );
  }
  if (doiChieuNghe) {
    cau.push(`Đối chiếu với nghề ${doiChieuNghe.nhom.toLowerCase()}: ${doiChieuNghe.mucDo}.`);
  }

  return { baSoDuoi, tinhODuoi, cachCuc, doiChieuNghe, ketLuan: cau.join(" ") };
}
