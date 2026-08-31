/**
 * Đối chiếu `tinhKhaiMon()` với `data/04-fixtures.json` (gói khai-mon-module, Công cung cấp) —
 * 5 ca, 43 assertion thần sát. README-CLAUDE-CODE.md: "Không viết UI trước khi 5/5 ca xanh."
 *
 * LƯU Ý về fixture "ky-hoi-binh-ngo-lam-mon": tên/mô tả gốc gọi đây là "ca lâm môn; bất biến
 * gãy", nhưng đối chiếu tay số liệu trong CHÍNH fixture này (đã làm trước khi viết engine) thì
 * không có bản ghi thần sát nào lamMon=true, và cả 3 cặp bất biến {Dần,Hợi} {Mão,Tý} {Thìn,Sửu}
 * đều khớp cung — tức đây là ca THƯỜNG, không phải ca lâm môn thật. Test dưới đây theo đúng DỮ
 * LIỆU trong fixture (nguồn xác thực để tự động hoá), không theo tên/mô tả — nếu Công xác nhận
 * ngược lại thì phải sửa lại engine, không phải sửa test cho khớp mô tả.
 */
import { describe, expect, it } from "vitest";
import { tinhKhaiMon } from "../index.js";
import type { KhaiMonResult, ThanSat } from "../types.js";
import fixtures from "./fixtures.json" with { type: "json" };

interface Fixture {
  name: string;
  input: { toaDeg: number; monDeg: number };
  expect: {
    toa: { canChi: string; stt: number; gap: number };
    mon: { canChi: string; stt: number; gap: number };
    monCung: string;
    monHuong: string;
    nguHoDonKhoi: string;
    diaBan: Record<string, { canChi: string; stt: number; buoc: number; cung: string; napAm: string; hanh: string }>;
    thanSat: Array<{
      ten: string; chi: string; canChi: string; napAm: string; hanh: string;
      cung: string; huong: string; quanHe: string; luc: string; lamMon: boolean;
    }>;
  };
}

const khoaThanSat = (t: { ten: string; chiDiaBan: string } | { ten: string; chi: string }) =>
  `${t.ten}|${"chiDiaBan" in t ? t.chiDiaBan : t.chi}`;

describe.each(fixtures as Fixture[])("tinhKhaiMon — fixture $name", (fixture) => {
  const result: KhaiMonResult = tinhKhaiMon(fixture.input);

  it("toạ, môn khí, cung vật lý của cửa, khởi Ngũ hổ độn", () => {
    expect(result.toa.canChi).toBe(fixture.expect.toa.canChi);
    expect(result.toa.stt).toBe(fixture.expect.toa.stt);
    expect(result.toa.gap).toBe(fixture.expect.toa.gap);
    expect(result.mon.canChi).toBe(fixture.expect.mon.canChi);
    expect(result.mon.stt).toBe(fixture.expect.mon.stt);
    expect(result.mon.gap).toBe(fixture.expect.mon.gap);
    expect(result.monCung).toBe(fixture.expect.monCung);
    expect(result.monHuong).toBe(fixture.expect.monHuong);
    expect(result.nguHoDonKhoi).toBe(fixture.expect.nguHoDonKhoi);
  });

  it("địa bàn 12 chi (Ngũ hổ độn + phi Lường Thiên Xích + nạp âm)", () => {
    for (const [chi, exp] of Object.entries(fixture.expect.diaBan)) {
      const o = result.diaBan[chi as keyof typeof result.diaBan];
      expect(o, `chi ${chi}`).toBeDefined();
      expect(o.canChi, `chi ${chi} canChi`).toBe(exp.canChi);
      expect(o.stt, `chi ${chi} stt`).toBe(exp.stt);
      expect(o.buoc, `chi ${chi} buoc`).toBe(exp.buoc);
      expect(o.cung, `chi ${chi} cung`).toBe(exp.cung);
      expect(o.napAm, `chi ${chi} napAm`).toBe(exp.napAm);
      expect(o.hanh, `chi ${chi} hanh`).toBe(exp.hanh);
    }
  });

  it(`thần sát (${fixture.expect.thanSat.length} bản ghi)`, () => {
    expect(result.thanSat.length).toBe(fixture.expect.thanSat.length);
    const theoKhoa = new Map(result.thanSat.map((t) => [khoaThanSat(t), t]));
    for (const exp of fixture.expect.thanSat) {
      const actual = theoKhoa.get(khoaThanSat(exp));
      expect(actual, `thần sát ${exp.ten} tại ${exp.chi}`).toBeDefined();
      const t = actual as ThanSat;
      expect(t.canChi, `${exp.ten}@${exp.chi} canChi`).toBe(exp.canChi);
      expect(t.napAm, `${exp.ten}@${exp.chi} napAm`).toBe(exp.napAm);
      expect(t.hanh, `${exp.ten}@${exp.chi} hanh`).toBe(exp.hanh);
      expect(t.cung, `${exp.ten}@${exp.chi} cung`).toBe(exp.cung);
      expect(t.huong, `${exp.ten}@${exp.chi} huong`).toBe(exp.huong);
      expect(t.quanHe, `${exp.ten}@${exp.chi} quanHe`).toBe(exp.quanHe);
      expect(t.luc, `${exp.ten}@${exp.chi} luc`).toBe(exp.luc);
      expect(t.lamMon, `${exp.ten}@${exp.chi} lamMon`).toBe(exp.lamMon);
    }
  });
});

describe("tinhKhaiMon — ba bất biến tự kiểm (SPEC.md mục 7)", () => {
  it("ca thường: batBienOk = true cho 4/5 fixture; riêng pdf-vd1-lam-mon (ca lâm môn thật) = false", () => {
    for (const fixture of fixtures as Fixture[]) {
      const result = tinhKhaiMon(fixture.input);
      const expected = fixture.name !== "pdf-vd1-lam-mon";
      expect(result.batBienOk, fixture.name).toBe(expected);
    }
  });
});

describe("tinhKhaiMon — ca lâm môn (pdf-vd1-lam-mon, SPEC.md mục 6)", () => {
  const fixture = (fixtures as Fixture[]).find((f) => f.name === "pdf-vd1-lam-mon")!;
  const result = tinhKhaiMon(fixture.input);

  it("Độc Hoả lâm môn: gắn cờ lamMon và có mặt ở CẢ HAI cách đọc cachCucDaiMon", () => {
    const docHoa = result.thanSat.find((t) => t.ten === "Độc Hoả")!;
    expect(docHoa.lamMon).toBe(true);
    expect(result.cachCucDaiMon.caTreo).toBe(true);
    expect(result.cachCucDaiMon.theoLamMon.some((t) => t.ten === "Độc Hoả")).toBe(true);
  });

  it("cung vật lý của cửa (Đông Nam) trống thần sát — theoCungVatLy rỗng", () => {
    expect(result.monCung).toBe("Tốn");
    expect(result.cachCucDaiMon.theoCungVatLy).toHaveLength(0);
  });

  it("cảnh báo LAM_MON tự bật", () => {
    expect(result.canhBao.some((c) => c.ma === "LAM_MON" && c.muc === "nặng")).toBe(true);
  });
});
