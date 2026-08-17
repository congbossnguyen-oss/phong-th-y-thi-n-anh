/**
 * Bước 2 — luận từng bộ 3 số liên tiếp trên TOÀN DÃY, và Cơ chế A (Song Tinh Hội Ứng).
 *
 * Nguồn: `bang-tra-bat-tinh.md` mục 4e, `hoa-giai.md` mục "Cơ chế (A)", `10-nhom-tu-truong.md`
 * mục "Nguyên tắc đọc vị trí trái–phải".
 */
import { TRAI_PHAI } from "../data/nhomTuTruong.js";
import type { Bo3So, KetQuaCap } from "../types.js";

const SO_NGOAI_BAT_QUAI = new Set(["0", "5"]);

/**
 * Cơ chế A: cát tinh đứng bên PHẢI hung tinh, với cấp độ VƯỢT TRỘI hơn, thì hoá hung thành cát.
 *
 * Ba điều kiện đều bắt buộc, thiếu một là không hoá giải:
 *   1. Chiều đúng: hung trước — cát sau. Chiều ngược lại không có tác dụng.
 *   2. Cát mạnh hơn hung: cấp 1 mạnh nhất nên cần `capDo` của cát NHỎ HƠN của hung. Bằng nhau cũng
 *      không đủ, vì tài liệu ghi rõ "phải vượt trội hơn".
 *   3. Cát tinh đó không phải Phục Vị — xem chú thích bên dưới.
 *
 * Phục Vị tuy là cát nhưng bị loại khỏi cơ chế hoá giải: tài liệu nói Phục Vị "nối mạch và khuếch
 * đại năng lượng đứng ngay trước nó, trước là hung thì càng hung", và mục 4e cấm hẳn "hung tinh
 * đứng liền Phục Vị". Cho Phục Vị hoá giải sẽ mâu thuẫn trực tiếp với hai câu đó.
 */
export function hoaGiaiNoiBo(capTrai: KetQuaCap, capPhai: KetQuaCap): boolean {
  if (capTrai.catHung !== "hung") return false;
  if (capPhai.catHung !== "cát") return false;
  if (capPhai.ten === "Phục Vị") return false;
  return capPhai.capDo < capTrai.capDo;
}

/** Hung tinh đứng ngay trước Phục Vị — bị "mắc kẹt", hung nặng thêm thay vì được hoá. */
export function biPhucViKhuechDai(capTrai: KetQuaCap, capPhai: KetQuaCap): boolean {
  return capTrai.catHung === "hung" && capPhai.ten === "Phục Vị";
}

/** Ghép câu diễn giải trái–phải cho một bộ 3 số, theo bảng ý nghĩa vị trí. */
function dienGiaiTraiPhai(capTrai: KetQuaCap, capPhai: KetQuaCap): string {
  // Ưu tiên lấy cặp PHẢI làm trung tâm — đúng như ví dụ mẫu "986": trung tâm là Thiên Y (86), còn
  // Họa Hại (98) là tinh đứng bên trái nó.
  const tamPhai = TRAI_PHAI[capPhai.ten];
  const yTrai = tamPhai?.canh[capTrai.ten]?.trai;
  if (yTrai) {
    return `${capTrai.ten} đứng trước ${capPhai.ten}: ${yTrai}.`;
  }

  const tamTrai = TRAI_PHAI[capTrai.ten];
  const yPhai = tamTrai?.canh[capPhai.ten]?.phai;
  if (yPhai) {
    return `${capPhai.ten} đứng sau ${capTrai.ten}: ${yPhai}.`;
  }

  // Không có trong bảng trái–phải thì mô tả trung thực bằng chủ đề của hai tinh, không bịa ý nghĩa.
  return `${capTrai.ten} nối sang ${capPhai.ten} — hai năng lượng này đi liền nhau trong dãy.`;
}

/**
 * Luận toàn bộ bộ 3 số liên tiếp và áp Cơ chế A.
 *
 * Hàm CÓ tác dụng phụ: đánh dấu `daHoaGiai` lên chính các phần tử của `capGoc` được truyền vào, để
 * tầng chấm điểm và tầng viết bài dùng chung một nguồn sự thật.
 */
export function luanBo3So(soDaChuanHoa: string, capGoc: KetQuaCap[]): Bo3So[] {
  const ds: Bo3So[] = [];

  const timCap = (iTrai: number, iPhai: number): KetQuaCap | null =>
    capGoc.find((c) => c.capGoc.viTriTrai === iTrai && c.capGoc.viTriPhai === iPhai) ?? null;

  for (let i = 0; i + 2 < soDaChuanHoa.length; i++) {
    const bo = soDaChuanHoa.slice(i, i + 3);
    const coSoDacBiet = bo.split("").some((c) => SO_NGOAI_BAT_QUAI.has(c));

    if (coSoDacBiet) {
      // Bộ có 0 hoặc 5 thì không ghép được 2 cặp trái–phải độc lập. Tài liệu cấm tạo diễn giải
      // trái–phải giả tạo cho trường hợp này — dùng lại kết quả hiệu ứng 5/0 đã tính ở lớp 2.
      // Chỉ nhắc những cặp mà bộ 3 số này thực sự CHẠM VÀO. Nếu chỉ lọc theo vị trí của số 0/5 thì
      // một cặp ở xa đầu dãy vẫn bị lôi vào mọi bộ có chứa số 5 của nó, khiến bài luận lặp lại dài
      // dòng mà không thêm thông tin.
      const chamVaoBo = (c: (typeof capGoc)[number]) =>
        c.capGoc.viTriPhai >= i && c.capGoc.viTriTrai <= i + 2;
      const lienQuan = capGoc.filter(
        (c) => chamVaoBo(c) && c.hieuUng.some((h) => h.viTri >= i && h.viTri <= i + 2),
      );
      const cauHieuUng = lienQuan
        .flatMap((c) =>
          c.hieuUng
            .filter((h) => h.viTri >= i && h.viTri <= i + 2)
            .map((h) => `${c.ten} (${c.capGoc.cap}) — ${h.moTa}`),
        )
        .join("; ");
      ds.push({
        bo,
        capTrai: null,
        capPhai: null,
        dienGiai: cauHieuUng
          ? `Đoạn "${bo}" có số ${bo.includes("5") ? "5" : "0"} tham gia: ${cauHieuUng}.`
          : `Đoạn "${bo}" chứa số ngoài Bát Quái, xét theo hiệu ứng thay vì ghép cặp.`,
        hoaGiaiNoiBo: false,
      });
      continue;
    }

    const capTrai = timCap(i, i + 1);
    const capPhai = timCap(i + 1, i + 2);
    if (!capTrai || !capPhai) continue;

    const duocHoa = hoaGiaiNoiBo(capTrai, capPhai);
    if (duocHoa) capTrai.daHoaGiai = true;

    let dienGiai = dienGiaiTraiPhai(capTrai, capPhai);
    if (duocHoa) {
      dienGiai += ` Ở đây ${capPhai.ten} đứng ngay bên phải và mạnh hơn, nên hoá được cái hung của ${capTrai.ten}.`;
    } else if (biPhucViKhuechDai(capTrai, capPhai)) {
      dienGiai += ` Lưu ý: hung tinh đứng liền Phục Vị thì bị giữ lại trong trạng thái đó, khó thoát ra, nên nặng thêm chứ không nhẹ đi.`;
    } else if (capTrai.catHung === "hung" && capPhai.catHung === "hung") {
      dienGiai += ` Cả hai đều là hung tinh, không có cát tinh nào để hoá giải nên tính chất hung được cộng dồn.`;
    }

    ds.push({ bo, capTrai, capPhai, dienGiai, hoaGiaiNoiBo: duocHoa });
  }

  return ds;
}

/** Đếm chuỗi hung tinh liên tiếp CHƯA được hoá giải — dùng cho chấm điểm và cảnh báo. */
export function chuoiHungDaiNhat(capGoc: KetQuaCap[]): number {
  let daiNhat = 0;
  let hienTai = 0;
  for (const c of capGoc) {
    if (c.catHung === "hung" && !c.daHoaGiai) {
      hienTai += 1;
      if (hienTai > daiNhat) daiNhat = hienTai;
    } else {
      hienTai = 0;
    }
  }
  return daiNhat;
}
