// Unit test cho module Quái Phản Ngâm (calculateFanYin) — CHỈ CẤP QUÁI.
//
// ⚠️ VIẾT LẠI 27/8/2026. Bản cũ chỉ khẳng định "code khớp bảng trong code" (Càn↔Tốn, Khảm↔Ly,
// Cấn↔Khôn, Chấn↔Đoài) nên KHÔNG phát hiện được bảng đó sai lý số — một golden test tự khẳng định
// chỉ tạo cảm giác an toàn giả. Bản này kiểm chứng bằng ĐỊNH NGHĨA GỐC, tính độc lập từ nạp giáp:
//     Phản Ngâm = địa chi hào biến XUNG địa chi hào gốc, đủ 3 hào của quái đó.
// Nếu ai đổi lại bảng cặp trong luc-hao.ts, test này sẽ đỏ vì địa chi không còn xung nhau.

import { describe, expect, it } from "vitest";
import { calculateFanYin, lucHaoCastManual, TRIGRAMS, type LineVal } from "../src/lib/luc-hao";

const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const laXung = (a: number, b: number) => (a + 6) % 12 === b;
const NGAY = { day: 10, month: 8, year: 2026, hour: 8, minute: 0 };

/** Nạp giáp Chi của 1 quái ở vị trí hạ/thượng — đọc thẳng từ TRIGRAMS, không chép tay. */
function napGiapChi(tenQuai: string, vi: "lower" | "upper"): number[] {
  const t = TRIGRAMS.find((x) => x.name === tenQuai);
  if (!t) throw new Error(`Không có quái ${tenQuai}`);
  return [...t.napGiap[vi].chi];
}

/** Hai quái có phải Phản Ngâm thật không — xung đủ 3 hào ở CÙNG vị trí. */
function xungDu3Hao(a: string, b: string, vi: "lower" | "upper"): boolean {
  const ca = napGiapChi(a, vi);
  const cb = napGiapChi(b, vi);
  return ca.every((c, i) => laXung(c, cb[i]));
}

const TEN_QUAI = TRIGRAMS.map((t) => t.name);

describe("Phản Ngâm — đối chiếu với định nghĩa gốc (xung địa chi)", () => {
  it("chỉ duy nhất Tốn↔Khôn xung đủ 3 hào, ở CẢ hạ quái lẫn thượng quái", () => {
    const tim: string[] = [];
    for (const a of TEN_QUAI) {
      for (const b of TEN_QUAI) {
        if (xungDu3Hao(a, b, "lower")) tim.push(`${a}→${b}`);
      }
    }
    expect(tim.sort()).toEqual(["Khôn→Tốn", "Tốn→Khôn"]);

    // Thượng quái phải cho đúng kết quả ấy, không lệch.
    const timTren: string[] = [];
    for (const a of TEN_QUAI) for (const b of TEN_QUAI) if (xungDu3Hao(a, b, "upper")) timTren.push(`${a}→${b}`);
    expect(timTren.sort()).toEqual(["Khôn→Tốn", "Tốn→Khôn"]);
  });

  it("calculateFanYin báo enabled ĐÚNG BẰNG việc địa chi có xung đủ 3 hào hay không (quét cả 64×64)", () => {
    for (const tren of TEN_QUAI) {
      for (const duoi of TEN_QUAI) {
        for (const trenB of TEN_QUAI) {
          for (const duoiB of TEN_QUAI) {
            const r = calculateFanYin(
              { upperTrigram: tren, lowerTrigram: duoi },
              { upperTrigram: trenB, lowerTrigram: duoiB },
            );
            expect(r.outerFanYin, `ngoại ${tren}→${trenB}`).toBe(xungDu3Hao(tren, trenB, "upper"));
            expect(r.innerFanYin, `nội ${duoi}→${duoiB}`).toBe(xungDu3Hao(duoi, duoiB, "lower"));
          }
        }
      }
    }
  });

  it("KHÔNG được coi quan hệ LỤC HỢP là Phản Ngâm (lỗi cũ: Càn→Tốn hợp cả 3 hào mà báo phản ngâm)", () => {
    const r = calculateFanYin({ upperTrigram: "Càn", lowerTrigram: "Khảm" }, { upperTrigram: "Tốn", lowerTrigram: "Khảm" });
    // Ngọ-Mùi, Thân-Tỵ, Tuất-Mão đều là lục hợp → tuyệt đối không phải phản ngâm.
    const ca = napGiapChi("Càn", "upper");
    const cb = napGiapChi("Tốn", "upper");
    expect(ca.every((c, i) => (c + cb[i]) % 12 === 1)).toBe(true); // xác nhận đúng là lục hợp cả 3
    expect(r.outerFanYin).toBe(false);
    expect(r.enabled).toBe(false);
  });
});

describe("Phản Ngâm — phân loại nội/ngoại/toàn quái", () => {
  it("Ngoại Quái Phản Ngâm (Tốn→Khôn ở trên, dưới giữ nguyên)", () => {
    const r = calculateFanYin({ upperTrigram: "Tốn", lowerTrigram: "Càn" }, { upperTrigram: "Khôn", lowerTrigram: "Càn" });
    expect(r.type).toBe("outer");
    expect(r.label).toBe("Ngoại Quái Phản Ngâm");
    expect(r.enabled).toBe(true);
    expect(r.innerFanYin).toBe(false);
  });

  it("Nội Quái Phản Ngâm (Khôn→Tốn ở dưới)", () => {
    const r = calculateFanYin({ upperTrigram: "Càn", lowerTrigram: "Khôn" }, { upperTrigram: "Càn", lowerTrigram: "Tốn" });
    expect(r.type).toBe("inner");
    expect(r.label).toBe("Nội Quái Phản Ngâm");
  });

  it("Toàn Quái Phản Ngâm (cả trên lẫn dưới)", () => {
    const r = calculateFanYin({ upperTrigram: "Tốn", lowerTrigram: "Tốn" }, { upperTrigram: "Khôn", lowerTrigram: "Khôn" });
    expect(r.type).toBe("inner_outer");
    expect(r.label).toBe("Toàn Quái Phản Ngâm");
  });

  it("Không phản ngâm => none, và giữ nguyên upper/lower đầu vào", () => {
    const r = calculateFanYin({ upperTrigram: "Càn", lowerTrigram: "Khảm" }, { upperTrigram: "Cấn", lowerTrigram: "Chấn" });
    expect(r.type).toBe("none");
    expect(r.enabled).toBe(false);
    expect(r.originalUpper).toBe("Càn");
    expect(r.changedLower).toBe("Chấn");
  });
});

describe("Phản Ngâm — tích hợp qua engine lập quẻ thật", () => {
  it("không có hào động => không tự coi là Phản Ngâm", () => {
    const cast = lucHaoCastManual([1, 1, 1, 1, 1, 1], [], NGAY);
    expect(cast.bien).toBeNull();
    expect(cast.fanYin.enabled).toBe(false);
    expect(cast.fanYin.type).toBe("none");
  });

  it("quẻ thật báo Phản Ngâm thì địa chi từng hào phải xung thật", () => {
    // Phong Thiên Tiểu Súc (Tốn/Càn) động 2 hào trên → Địa Thiên Thái (Khôn/Càn).
    const cast = lucHaoCastManual([1, 1, 1, 0, 1, 1], [5, 6], NGAY);
    expect(cast.fanYin.enabled).toBe(true);
    expect(cast.fanYin.type).toBe("outer");

    for (let i = 3; i < 6; i++) {
      const g = cast.chinh.hao[i];
      const b = cast.bien!.hao[i];
      expect(laXung(g.chiIndex, b.chiIndex), `hào ${i + 1}: ${CHI[g.chiIndex]}→${CHI[b.chiIndex]}`).toBe(true);
    }
  });

  it("quét nhiều quẻ: hễ engine báo phản ngâm thì địa chi PHẢI xung, không có ngoại lệ", () => {
    let soCaDuong = 0;
    for (let mask = 0; mask < 64; mask++) {
      const lines = [0, 1, 2, 3, 4, 5].map((k) => ((mask >> k) & 1) as LineVal) as [LineVal, LineVal, LineVal, LineVal, LineVal, LineVal];
      // Tốn ☴ [0,1,1] → Khôn ☷ [0,0,0] cần động đúng 2 hào TRÊN của quái đó: [2,3] cho hạ quái,
      // [5,6] cho thượng quái (và [2,3,5,6] cho toàn quái).
      for (const dong of [[2, 3], [5, 6], [2, 3, 5, 6], [1, 2, 3], [4, 5, 6]]) {
        const cast = lucHaoCastManual(lines, dong, NGAY);
        if (!cast.bien || !cast.fanYin.enabled) continue;
        soCaDuong++;
        const viTri = cast.fanYin.innerFanYin ? [0, 1, 2] : [];
        if (cast.fanYin.outerFanYin) viTri.push(3, 4, 5);
        for (const i of viTri) {
          expect(laXung(cast.chinh.hao[i].chiIndex, cast.bien.hao[i].chiIndex)).toBe(true);
        }
      }
    }
    expect(soCaDuong).toBeGreaterThan(0); // phải thực sự gặp ca dương, không phải test rỗng
  });
});
