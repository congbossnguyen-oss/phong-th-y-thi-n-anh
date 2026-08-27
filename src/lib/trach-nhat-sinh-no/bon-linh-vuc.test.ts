/**
 * KHÓA HÀNH VI của lớp chấm 4 lĩnh vực. Đây là các tính chất phải luôn đúng — nếu ai sửa trọng số
 * hay thêm quy tắc mà làm gãy một trong số này thì test đỏ ngay, không phải chờ khách phàn nàn.
 *
 * Ngưỡng đặt rộng rãi có chủ ý: mục đích là bắt SAI HỎNG HỆ THỐNG (đảo chiều logic, thang lệch tâm,
 * ưu tiên mất tác dụng), không phải khoá cứng từng con số — trọng số vẫn còn phải hiệu chỉnh tiếp.
 */
import { describe, it, expect } from "vitest";
import { phanTichTrachNhatSinhNo } from "./index";
import type { BirthSelectionInput, BirthCandidate, LinhVucKey } from "./types";

const LV: LinhVucKey[] = ["suc_khoe", "gia_dao", "tai_van", "nhan_duyen"];

const dungInput = (d: Partial<BirthSelectionInput> = {}): BirthSelectionInput => ({
  startDate: { year: 2027, month: 3, day: 1 },
  endDate: { year: 2027, month: 3, day: 28 },
  babyGender: "Nam",
  deliveryMode: "unknown",
  timeZone: "Asia/Ho_Chi_Minh",
  familyPriority: "balanced",
  ...d,
});

/** Quét vài tháng để có mẫu đủ lớn mà vẫn chạy nhanh trong CI. */
function mauDienRong(): BirthCandidate[] {
  const ra: BirthCandidate[] = [];
  for (const g of ["Nam", "Nữ"] as const) {
    for (const m of [3, 6, 9, 12]) {
      ra.push(
        ...phanTichTrachNhatSinhNo(dungInput({
          startDate: { year: 2027, month: m, day: 1 },
          endDate: { year: 2027, month: m, day: 28 },
          babyGender: g,
        })).tatCaUngVien.filter((c) => c.bonLinhVuc),
      );
    }
  }
  return ra;
}

const diemCua = (c: BirthCandidate, k: LinhVucKey) => c.bonLinhVuc!.find((x) => x.linhVuc === k)!;
const trungVi = (ds: number[]) => [...ds].sort((a, b) => a - b)[Math.floor(ds.length / 2)]!;

describe("bon-linh-vuc — khoá hành vi", () => {
  const mau = mauDienRong();

  it("luôn sinh ra phương án, và mọi phương án đều có đủ 4 lĩnh vực", () => {
    expect(mau.length).toBeGreaterThan(50);
    for (const c of mau) {
      expect(c.bonLinhVuc).toHaveLength(4);
      for (const k of LV) expect(diemCua(c, k).diem).toBeGreaterThanOrEqual(-10);
    }
  });

  it("mọi căn cứ đều có trích nguồn tài liệu — không được có kết luận suông", () => {
    for (const c of mau.slice(0, 60)) {
      for (const lv of c.bonLinhVuc!) {
        for (const cc of lv.canCu) {
          expect(cc.nguon.trim().length).toBeGreaterThan(3);
          expect(cc.noiDung.trim().length).toBeGreaterThan(10);
        }
      }
    }
  });

  it("TÀI VẬN: lá điểm cao phải thoả 'Thân đủ lực gánh Tài' (tai-van.md §Nguyên tắc nền)", () => {
    const sap = [...mau].sort((a, b) => diemCua(b, "tai_van").diemBatTu - diemCua(a, "tai_van").diemBatTu);
    const thanDuLuc = (c: BirthCandidate) => {
      const v = c.baziAnalysis!.vuongSuy;
      return v === "Trung hòa" || v.includes("Vượng") || v.includes("Cường");
    };
    const n = Math.min(30, Math.floor(sap.length / 3));
    const top = sap.slice(0, n).filter(thanDuLuc).length;
    const bot = sap.slice(-n).filter(thanDuLuc).length;
    // Nhóm tài vận cao phải "thân đủ lực" nhiều hơn hẳn nhóm thấp — nếu ngược lại là logic đảo chiều.
    expect(top).toBeGreaterThan(bot);
  });

  it("SỨC KHOẺ: lá điểm cao phải lưu thông tốt hơn lá điểm thấp (benh-tat.md §Nguyên tắc nền)", () => {
    const sap = [...mau].sort((a, b) => diemCua(b, "suc_khoe").diemBatTu - diemCua(a, "suc_khoe").diemBatTu);
    const soTacNghen = (c: BirthCandidate) =>
      c.baziAnalysis!.luuThong.matXichDut.length + c.baziAnalysis!.luuThong.matXichNghen.length;
    const n = Math.min(30, Math.floor(sap.length / 3));
    const tbTop = sap.slice(0, n).reduce((s, c) => s + soTacNghen(c), 0) / n;
    const tbBot = sap.slice(-n).reduce((s, c) => s + soTacNghen(c), 0) / n;
    expect(tbTop).toBeLessThan(tbBot);
  });

  it("4 lĩnh vực phải ĐỘC LẬP thật — không được là một điểm tổng nguỵ trang", () => {
    const vec = Object.fromEntries(LV.map((k) => [k, mau.map((c) => diemCua(c, k).diem)])) as Record<LinhVucKey, number[]>;
    const tuongQuan = (a: number[], b: number[]) => {
      const n = a.length, ma = a.reduce((s, x) => s + x, 0) / n, mb = b.reduce((s, x) => s + x, 0) / n;
      let sab = 0, sa = 0, sb = 0;
      for (let i = 0; i < n; i++) { const da = a[i]! - ma, db = b[i]! - mb; sab += da * db; sa += da * da; sb += db * db; }
      return sa && sb ? sab / Math.sqrt(sa * sb) : 0;
    };
    for (let i = 0; i < LV.length; i++) {
      for (let j = i + 1; j < LV.length; j++) {
        // Manh Phái: phú quý KHÔNG suy ra sức khoẻ/gia đạo. Nếu tương quan cao thì việc tách 4 mặt
        // chỉ là hình thức.
        expect(Math.abs(tuongQuan(vec[LV[i]!]!, vec[LV[j]!]!))).toBeLessThan(0.6);
      }
    }
  });

  it("thang điểm không được lệch tâm — trung vị mỗi lĩnh vực phải quanh 0", () => {
    for (const k of LV) {
      expect(Math.abs(trungVi(mau.map((c) => diemCua(c, k).diem)))).toBeLessThan(1.2);
    }
  });

  it("ƯU TIÊN gia đình phải thực sự đổi kết quả (không được là nút bấm giả)", () => {
    // Quét vài tháng: ít nhất một tháng phải cho ra phương án khác giữa 'health' và 'wealth'.
    let coKhacBiet = false;
    for (const m of [3, 6, 9, 12]) {
      const lay = (uu: BirthSelectionInput["familyPriority"]) =>
        phanTichTrachNhatSinhNo(dungInput({
          startDate: { year: 2027, month: m, day: 1 }, endDate: { year: 2027, month: m, day: 28 },
          familyPriority: uu,
        })).recommendation.primary?.candidateId;
      if (lay("health") !== lay("wealth")) { coKhacBiet = true; break; }
    }
    expect(coKhacBiet).toBe(true);
  });

  it("NHÂN DUYÊN phải phụ thuộc giới tính (hon-nhan.md: Nam lấy Tài, Nữ lấy Quan Sát)", () => {
    const inp = { startDate: { year: 2027, month: 6, day: 1 }, endDate: { year: 2027, month: 6, day: 28 } };
    const nam = phanTichTrachNhatSinhNo(dungInput({ ...inp, babyGender: "Nam" })).tatCaUngVien.filter((c) => c.bonLinhVuc);
    const nu = phanTichTrachNhatSinhNo(dungInput({ ...inp, babyGender: "Nữ" })).tatCaUngVien.filter((c) => c.bonLinhVuc);
    const chung = nam.filter((a) => nu.some((b) => b.id === a.id));
    expect(chung.length).toBeGreaterThan(0);
    // Với cùng lá số, điểm nhân duyên nam/nữ phải khác nhau ở ít nhất một trường hợp.
    const coKhac = chung.some((a) => {
      const b = nu.find((x) => x.id === a.id)!;
      return diemCua(a, "nhan_duyen").diemBatTu !== diemCua(b, "nhan_duyen").diemBatTu;
    });
    expect(coKhac).toBe(true);
  });

  it("Thần Sát chỉ là lớp PHỤ — không được lấn át (than-sat.md §Nguyên tắc 1)", () => {
    // Không lá nào được có điểm chỉ do thần sát đẩy lên/xuống quá mức: kiểm gián tiếp qua việc
    // tổng điểm vẫn nằm trong dải hợp lý và không bị dồn về hai cực.
    for (const k of LV) {
      const ds = mau.map((c) => diemCua(c, k).diem);
      const oCuc = ds.filter((d) => Math.abs(d) >= 9).length / ds.length;
      expect(oCuc).toBeLessThan(0.15);
    }
  });
});
