/**
 * Card điểm tổng quan.
 *
 * ⚠️ NGUỒN GỐC KHÁC VỚI PHẦN CÒN LẠI CỦA ENGINE: hệ điểm này KHÔNG có trong tài liệu Bát Cực Linh
 * Số. Đây là thiết kế riêng theo SPEC mục 4 do chủ dự án đưa, để hiển thị một con số tóm tắt cho
 * khách. Trọng số vì thế để ở `TRONG_SO_MAC_DINH` dạng config, chỉnh được mà không phải sửa logic.
 *
 * Ngưỡng nhãn 80/65/50/35 đã được chủ dự án chốt 2026-08-17.
 */
import { chuoiHungDaiNhat } from "./bo3So.js";
import type { CanhBao, CapDo, KetQuaCap, ScoreCard } from "../types.js";

export interface TrongSoDiem {
  diemNen: number;
  tamCatHoiTu: number;
  tyLeCatHung: number;
  nangLuongDuoi: number;
  chuoiHungKhongHoaGiai: number;
  hoTroCccd: number;
  moiCanhBao: number;
  toiDaTruCanhBao: number;
  /** Trừ cho MỖI số 0 nằm trong thân số (số 0 đầu nhà mạng đã bị bỏ trước đó). */
  moiSo0TrongDay: number;
  toiDaTruSo0: number;
  /** Dãy không có cặp Sinh Khí nào. */
  thieuSinhKhi: number;
  /** Dãy không có cặp Diên Niên nào. */
  thieuDienNien: number;
  /** Một loại năng lượng chiếm quá nửa dãy — mất cân bằng, đơn điệu. Mức trừ tối thiểu. */
  motTinhApDao: number;
  /** Mức trừ khi CẢ dãy chỉ có đúng một loại năng lượng. */
  motTinhApDaoToiDa: number;
  /** Ngưỡng tỷ lệ coi là áp đảo. */
  nguongApDao: number;
  /** Phục Vị áp đảo: mức trừ riêng, nhẹ hơn, vì nó là tinh TRUNG TÍNH chứ không phải hung tinh. */
  phucViApDao: number;
  /** Phục Vị áp đảo cũng có mặt được: sức chịu đựng, độ bền, khó bị quật ngã. */
  phucViBenBi: number;
  /** Trần cho cả NHÓM mất cân bằng (thiếu Sinh Khí + thiếu Diên Niên + áp đảo) — chống trừ trùng. */
  toiDaTruMatCanBang: number;
}

export const TRONG_SO_MAC_DINH: TrongSoDiem = {
  diemNen: 50,
  tamCatHoiTu: 25,
  tyLeCatHung: 25,
  nangLuongDuoi: 25,
  chuoiHungKhongHoaGiai: -15,
  hoTroCccd: 10,
  moiCanhBao: -10,
  toiDaTruCanhBao: -20,
  // Chủ dự án chốt 2026-08-17: CỨ có số 0 nằm giữa dãy là đã gãy trường khí, không đợi tới số 0
  // thứ hai hay tới ngưỡng "số gãy" (>2) của tài liệu. Nên trừ ngay từ số 0 đầu tiên trong thân số.
  moiSo0TrongDay: -9,
  toiDaTruSo0: -30,
  // Ba khoản trừ vì MẤT CÂN BẰNG, thêm 2026-08-17 sau khi chủ dự án chỉ ra một dãy toàn Phục Vị
  // vẫn được chấm cao. Đều có căn cứ trong tài liệu:
  //   • Mục 4e: "không nên toàn một loại cát tinh mà thiếu các cát tinh khác — dễ quá thả lỏng,
  //     cần có sự lưu thông, luân chuyển".
  //   • Mô tả Diên Niên: "đây là năng lượng quan trọng nhất trong số điện thoại nhưng thường bị
  //     coi nhẹ" — thiếu hẳn là một khuyết thật sự.
  //   • Mô tả Sinh Khí: là "cứu mạng chi tinh", thiếu thì không có quý nhân, việc gì cũng tự thân.
  thieuSinhKhi: -10,
  thieuDienNien: -10,
  motTinhApDao: -18,
  motTinhApDaoToiDa: -30,
  nguongApDao: 50,
  // Chủ dự án chốt 2026-08-17 (lần 2): Phục Vị áp đảo KHÔNG được đánh như hung tinh áp đảo. Nguyên
  // văn: "dù gì nó cũng có năng lượng phục vị, thì sức chịu đựng rất lớn, tuy nhiên lại ngại thay
  // đổi". Đây là đặc tính hai mặt, nên tách thành một khoản cộng và một khoản trừ nhẹ, thay cho mức
  // trừ tăng dần -18..-30 vốn dành cho tinh có hướng rõ ràng.
  phucViApDao: -10,
  phucViBenBi: 15,
  // Trần chống trừ trùng: thiếu Sinh Khí, thiếu Diên Niên và một tinh áp đảo thực chất cùng mô tả
  // một khuyết điểm (dãy thiếu động lực, không lưu thông). Cộng dồn cả ba là phạt ba lần cho một
  // lỗi, đủ để dìm mọi dãy nhiều Phục Vị xuống 0 điểm.
  toiDaTruMatCanBang: -25,
};

/** Trọng số của từng cấp độ khi quy năng lượng ra điểm — cấp 1 mạnh nhất. */
const HE_SO_CAP: Readonly<Record<CapDo, number>> = { 1: 1, 2: 0.75, 3: 0.5, 4: 0.35 };

export const NGUONG_NHAN: readonly { tuDiem: number; nhan: string }[] = [
  { tuDiem: 80, nhan: "Năng lượng rất tốt" },
  { tuDiem: 65, nhan: "Năng lượng tốt" },
  { tuDiem: 50, nhan: "Ở mức trung bình" },
  { tuDiem: 35, nhan: "Cần lưu ý" },
  { tuDiem: 0, nhan: "Nên cân nhắc đổi số" },
];

export function nhanTheoDiem(diem: number): string {
  return NGUONG_NHAN.find((n) => diem >= n.tuDiem)?.nhan ?? "Nên cân nhắc đổi số";
}

const lamTron = (n: number) => Math.round(n * 10) / 10;

export function tinhDiemTongQuan(params: {
  soDaChuanHoa: string;
  capGoc: KetQuaCap[];
  capTrongDuoi: KetQuaCap[];
  canhBao: CanhBao[];
  coHoTroCccd: boolean;
  trongSo?: TrongSoDiem;
}): ScoreCard {
  const w = params.trongSo ?? TRONG_SO_MAC_DINH;
  const { capGoc, capTrongDuoi, canhBao } = params;
  const thanhPhan: ScoreCard["thanhPhan"] = [];
  let diem = w.diemNen;
  thanhPhan.push({ ten: "Điểm nền", diem: w.diemNen, ghiChu: "Mốc trung tính trước khi cộng trừ." });

  // 1. Tam cát tinh hội tụ.
  const coMat = new Set(capGoc.map((c) => c.ten));
  const hoiTu = ["Sinh Khí", "Thiên Y", "Diên Niên"].every((t) => coMat.has(t as never));
  if (hoiTu) {
    diem += w.tamCatHoiTu;
    thanhPhan.push({
      ten: "Tam cát tinh hội tụ",
      diem: w.tamCatHoiTu,
      ghiChu: "Có đủ cả Sinh Khí, Thiên Y và Diên Niên — cách cục hiếm.",
    });
  }

  // Ranh giới ba số cuối. Một cặp có thể nằm TRỌN trong đuôi, hoặc chỉ vắt qua ranh giới (chữ số
  // trái nằm ngoài, chữ số phải nằm trong) — hai trường hợp này không được tính như nhau.
  const batDauDuoi = Math.max(0, params.soDaChuanHoa.length - 3);
  const viTriDuoi = (c: KetQuaCap): "trọn trong đuôi" | "vắt qua đuôi" | "giữa dãy" => {
    if (c.capGoc.viTriTrai >= batDauDuoi) return "trọn trong đuôi";
    if (c.capGoc.viTriPhai >= batDauDuoi) return "vắt qua đuôi";
    return "giữa dãy";
  };

  // 2. Tỷ lệ cát/hung sau khi áp Cơ chế A. Hung đã được hoá giải tính như cát.
  //
  // Phục Vị bị LOẠI khỏi cả tử số lẫn mẫu số: bảng tra gốc tuy xếp nó vào nhóm cát tinh nhưng ghi
  // rõ chủ đề là "trung tính, giữ nguyên trạng", và mô tả của nó là trì trệ, thiếu động lực tiến
  // thủ. Tính Phục Vị như một cát tinh thật sẽ thổi phồng tỷ lệ cát của những dãy toàn Phục Vị —
  // đúng lỗi chủ dự án chỉ ra ở số 0945406666 ngày 2026-08-17.
  //
  // Chủ dự án chỉ tiếp 2026-08-17 ở số 0961676131: tỷ lệ này trước đây ĐẾM ĐẦU NGƯỜI — mỗi cặp một
  // phiếu, bất kể mạnh yếu và bất kể nằm ở đâu. Sai hai chỗ so với chính nguyên tắc đã chốt:
  //   • Bảng tra ghi rõ "cát tinh Cấp 1 mang lại hiệu quả tốt rõ rệt hơn, hung tinh Cấp 1 cũng gây
  //     hại rõ rệt hơn Cấp 4" — nên phải nhân hệ số cấp độ.
  //   • Ba số cuối là chỗ quyết định kết cục (SKILL Bước 3), đã được áp trọng số gấp 3 ở phần năm
  //     mặt và cách cục, nhưng thang điểm tổng thì chưa — khiến một Thiên Y cấp 1 ở đuôi bị một
  //     Tuyệt Mệnh ở đầu dãy triệt tiêu ngang phân.
  const capCoHuong = capGoc.filter((c) => c.ten !== "Phục Vị");
  if (capCoHuong.length > 0) {
    let tongCat = 0;
    let tongTatCa = 0;
    for (const c of capCoHuong) {
      const vt = viTriDuoi(c);
      const trongSo =
        HE_SO_CAP[c.capDo] * (vt === "trọn trong đuôi" ? 3 : vt === "vắt qua đuôi" ? 2 : 1);
      tongTatCa += trongSo;
      if (c.catHung === "cát" || c.daHoaGiai) tongCat += trongSo;
    }
    const tyLe = tongCat / tongTatCa;
    const d = lamTron((tyLe - 0.5) * 2 * w.tyLeCatHung);
    diem += d;
    const soCat = capCoHuong.filter((c) => c.catHung === "cát" || c.daHoaGiai).length;
    thanhPhan.push({
      ten: "Tỷ lệ cát / hung toàn dãy",
      diem: d,
      ghiChu: `${soCat} trên ${capCoHuong.length} cặp có hướng rõ ràng là cát. Cặp càng mạnh (cấp 1) và càng gần ba số cuối thì càng nặng ký; Phục Vị trung tính không tính vào đây.`,
    });
  }

  // 3. Năng lượng ở 3 số đuôi — chỗ quyết định kết cục.
  if (capTrongDuoi.length > 0) {
    let tong = 0;
    let tongTrongSo = 0;
    for (const c of capTrongDuoi) {
      // Cặp chỉ vắt qua ranh giới (một chữ số nằm ngoài ba số cuối) chỉ được tính nửa phần — nó
      // không thật sự là kết cục. Trước đây tính nguyên phần, nên ở 0961676131 một Lục Sát nửa
      // trong nửa ngoài triệt tiêu mất một Thiên Y cấp 1 nằm trọn trong đuôi.
      const phan = viTriDuoi(c) === "trọn trong đuôi" ? 1 : 0.5;
      const heSo = HE_SO_CAP[c.capDo];
      // Phục Vị ở đuôi KHÔNG được cộng điểm: kết bằng năng lượng trung tính nghĩa là mọi việc dừng
      // ở chỗ giữ nguyên trạng, không có kết quả rõ ràng.
      const huong = c.ten === "Phục Vị" ? 0 : c.catHung === "cát" ? 1 : -1;
      tong += huong * heSo * phan;
      tongTrongSo += phan;
    }
    const trungBinh = tongTrongSo === 0 ? 0 : tong / tongTrongSo;
    const d = lamTron(trungBinh * w.nangLuongDuoi);
    diem += d;
    thanhPhan.push({
      ten: "Năng lượng ba số đuôi",
      diem: d,
      ghiChu: capTrongDuoi
        .map((c) => `${c.capGoc.cap} ${c.ten}${viTriDuoi(c) === "vắt qua đuôi" ? " (vắt qua ranh giới, tính nửa phần)" : ""}`)
        .join(", "),
    });
  }

  // 4. Chuỗi hung tinh liên tiếp chưa hoá giải được.
  const chuoi = chuoiHungDaiNhat(capGoc);
  if (chuoi >= 2) {
    diem += w.chuoiHungKhongHoaGiai;
    thanhPhan.push({
      ten: "Chuỗi hung tinh liên tiếp",
      diem: w.chuoiHungKhongHoaGiai,
      ghiChu: `Có ${chuoi} cặp hung tinh liền nhau mà không có cát tinh đủ mạnh hoá giải.`,
    });
  }

  // 5. Mức hỗ trợ từ CCCD (Cơ chế B) — chỉ tính khi khách có nhập căn cước.
  if (params.coHoTroCccd) {
    diem += w.hoTroCccd;
    thanhPhan.push({
      ten: "Số điện thoại hỗ trợ được căn cước",
      diem: w.hoTroCccd,
      ghiChu: "Số điện thoại có sẵn cát tinh hoá giải được hung tinh trong căn cước.",
    });
  }

  // 6. Cảnh báo đặc biệt.
  //
  // Bỏ `gay_truong_khi` ra khỏi nhóm này: nó nói đúng cái mà mục 7 bên dưới đã trừ theo số lượng số
  // 0. Để cả hai cùng chạy là trừ hai lần cho cùng một con số 0 — lỗi này làm 0945406666 mất 19
  // điểm chỉ vì một chữ số, và là một phần lý do nó rơi xuống 0.
  const canhBaoTinhDiem = canhBao.filter((c) => c.ma !== "gay_truong_khi");
  if (canhBaoTinhDiem.length > 0) {
    const d = Math.max(w.toiDaTruCanhBao, canhBaoTinhDiem.length * w.moiCanhBao);
    diem += d;
    thanhPhan.push({
      ten: "Cảnh báo đặc biệt",
      diem: d,
      ghiChu: canhBaoTinhDiem.map((c) => c.tieuDe).join("; "),
    });
  }

  // 7. Số 0 nằm trong thân số — gãy trường khí. Số 0 đầu nhà mạng đã bị bỏ khi chuẩn hoá nên mọi
  // số 0 còn lại ở đây đều là số 0 nằm giữa hoặc cuối dãy.
  const soLuong0 = params.soDaChuanHoa.split("").filter((c) => c === "0").length;
  if (soLuong0 >= 1) {
    const d = Math.max(w.toiDaTruSo0, soLuong0 * w.moiSo0TrongDay);
    diem += d;
    thanhPhan.push({
      ten: soLuong0 === 1 ? "Có số 0 nằm giữa dãy" : `Có ${soLuong0} số 0 trong dãy`,
      diem: d,
      ghiChu: "Số 0 làm gãy trường khí: việc dễ dang dở, gần đến nơi lại hỏng.",
    });
  }

  // 8. Mất cân bằng — dãy thiếu hẳn một cát tinh trụ cột, hoặc bị một loại năng lượng lấn át.
  //
  // Cả nhóm bị chặn bởi `toiDaTruMatCanBang`, vì ba khoản dưới đây thực chất mô tả cùng một khuyết
  // điểm. Cộng dồn không giới hạn thì mọi dãy nhiều Phục Vị đều bị dìm xuống 0 điểm.
  if (capGoc.length > 0) {
    const matCanBang: ScoreCard["thanhPhan"] = [];

    if (!coMat.has("Sinh Khí")) {
      matCanBang.push({
        ten: "Không có Sinh Khí",
        diem: w.thieuSinhKhi,
        ghiChu: "Thiếu năng lượng quý nhân — việc gì cũng phải tự thân, ít người đỡ.",
      });
    }
    if (!coMat.has("Diên Niên")) {
      matCanBang.push({
        ten: "Không có Diên Niên",
        diem: w.thieuDienNien,
        ghiChu: "Thiếu năng lượng sự nghiệp và sức bền — dãy số kém ổn định, thiếu nhất quán.",
      });
    }

    const demTheoTinh = new Map<string, number>();
    for (const c of capGoc) demTheoTinh.set(c.ten, (demTheoTinh.get(c.ten) ?? 0) + 1);
    let tenApDao = "";
    let soLanApDao = 0;
    for (const [ten, n] of demTheoTinh) {
      if (n > soLanApDao) {
        tenApDao = ten;
        soLanApDao = n;
      }
    }
    const tyLeApDao = (soLanApDao / capGoc.length) * 100;
    if (tyLeApDao > w.nguongApDao) {
      if (tenApDao === "Phục Vị") {
        // Phục Vị áp đảo là chuyện hai mặt, không phải thuần xấu: nền năng lượng rất lì, chịu đựng
        // tốt, nhưng đứng yên và ngại thay đổi. Ghi nhận cả hai mặt thay vì chỉ phạt.
        diem += w.phucViBenBi;
        thanhPhan.push({
          ten: `Phục Vị chiếm ${Math.round(tyLeApDao)}% dãy số — sức chịu đựng lớn`,
          diem: w.phucViBenBi,
          ghiChu: `${soLanApDao} trên ${capGoc.length} cặp là Phục Vị: nền năng lượng rất bền, chịu áp lực tốt, khó bị quật ngã, giữ được cái đang có.`,
        });
        matCanBang.push({
          ten: "Nhưng ngại thay đổi",
          diem: w.phucViApDao,
          ghiChu: "Mặt trái của cùng năng lượng đó: mọi việc dễ giữ nguyên trạng, thiếu động lực bứt phá, cơ hội mới đến thì chậm nắm bắt.",
        });
      } else {
        // Trừ tăng dần theo mức áp đảo: vừa quá nửa thì trừ mức tối thiểu, chiếm trọn dãy thì trừ
        // mức tối đa. Áp một mức cố định sẽ đánh đồng dãy 51% với dãy 100%, trong khi tài liệu nhấn
        // mạnh "quá cường sinh hại" — càng đơn điệu càng hại.
        const mucVuot = (tyLeApDao - w.nguongApDao) / (100 - w.nguongApDao);
        matCanBang.push({
          ten: `${tenApDao} chiếm ${Math.round(tyLeApDao)}% dãy số`,
          diem: Math.round(w.motTinhApDao + (w.motTinhApDaoToiDa - w.motTinhApDao) * mucVuot),
          ghiChu: `${soLanApDao} trên ${capGoc.length} cặp cùng một loại năng lượng — dãy đơn điệu, thiếu lưu thông. Dù là cát tinh, quá cường vẫn sinh hại.`,
        });
      }
    }

    for (const p of matCanBang) {
      diem += p.diem;
      thanhPhan.push(p);
    }
    const tongMatCanBang = matCanBang.reduce((s, p) => s + p.diem, 0);
    if (tongMatCanBang < w.toiDaTruMatCanBang) {
      const buLai = w.toiDaTruMatCanBang - tongMatCanBang;
      diem += buLai;
      thanhPhan.push({
        ten: "Giới hạn trừ mất cân bằng",
        diem: buLai,
        ghiChu: `Các khoản trên cùng nói về một khuyết điểm nên không cộng dồn quá ${-w.toiDaTruMatCanBang} điểm.`,
      });
    }
  }

  const cuoi = Math.max(0, Math.min(100, Math.round(diem)));
  return { diem: cuoi, nhan: nhanTheoDiem(cuoi), loiKhen: loiKhenTheoDiem(cuoi), thanhPhan };
}

/**
 * Lời khen theo mức điểm. Chỉ khen từ mức "tốt" trở lên — số trung bình hoặc kém thì để trống,
 * khen lấy lệ sẽ làm khách mất tin vào phần luận phía dưới.
 */
export function loiKhenTheoDiem(diem: number): string {
  if (diem >= 90) {
    return "Xin chúc mừng — đây là một số điện thoại đẹp xuất sắc, rất hiếm gặp. Anh/chị nên giữ số này lâu dài.";
  }
  if (diem >= 80) {
    return "Xin chúc mừng — đây là một số điện thoại đẹp, năng lượng rất tốt. Anh/chị nên giữ số này lâu dài.";
  }
  if (diem >= 65) {
    return "Chúc mừng anh/chị đã chọn được một số phù hợp — dãy số này có nền năng lượng tốt.";
  }
  return "";
}
