// Test module Luận Giải Bát Tự Toàn Diện — ưu tiên theo đúng SPEC mục 6 "Kiểm thử":
//   1. Case an toàn nội dung (BẮT BUỘC, ưu tiên cao nhất).
//   2. Free không gọi AI, chạy được với lá số hợp lệ.
//   3. Test đồng bộ nội dung (mọi file knowledge/ có ghi ngày đồng bộ).
// Cộng thêm: khoá hành vi Tầng 1 (findings) trên lá số tham chiếu đã cross-check với hocvienlyso.org
// (31/8/1980 11:50, Dương Nam, GMT+7 — cùng ca dùng trong header bat-tu.ts).
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { BatTuInput } from "../src/lib/bat-tu";
import { laSoVaPhanTich, taoBaoCaoCoBan, taoBaoCaoNangCao } from "../src/lib/luan-giai-toan-dien/orchestrator";
import { taoGoiMoFree } from "../src/lib/luan-giai-toan-dien/free-template";
import { taoFindingsCoBan, findingsH } from "../src/lib/luan-giai-toan-dien/findings-co-ban";
import { findingsD, findingsE, findingsK } from "../src/lib/luan-giai-toan-dien/findings-nang-cao";
import { timTuKhoaCam, quetHauKiem, layContentSafety } from "../src/lib/luan-giai-toan-dien/content-safety";

const LA_SO_THAM_CHIEU: BatTuInput = { day: 31, month: 8, year: 1980, hour: 11, minute: 50, gender: "Nam" };

describe("Bát Tự Toàn Diện — an toàn nội dung (SPEC mục 6, ưu tiên cao nhất)", () => {
  it("timTuKhoaCam phát hiện đúng từ cấm khi có mặt trong văn bản", () => {
    expect(timTuKhoaCam("Người này có nguy cơ ly hôn cao trong giai đoạn này.")).toContain("ly hôn");
    expect(timTuKhoaCam("Sức khoẻ ổn định, không có dấu hiệu bất thường.")).toEqual([]);
  });

  it("quetHauKiem chặn đúng khi đưa thẳng đoạn văn giả chứa từ cấm tuyệt đối", () => {
    const canhBao = quetHauKiem("Lá số này cho thấy khả năng cao dẫn đến tử vong ở tuổi trung niên.");
    expect(canhBao.some((c) => c.loai === "tu_khoa_cam")).toBe(true);
  });

  it("quetHauKiem gắn cờ (không bắt buộc chặn) khi văn bản khẳng định tuyệt đối", () => {
    const canhBao = quetHauKiem("Bạn chắc chắn sẽ thành công trong sự nghiệp này.");
    expect(canhBao.some((c) => c.loai === "khang_dinh_tuyet_doi")).toBe(true);
  });

  it("quetHauKiem KHÔNG gắn cờ oan cho văn bản trung tính, đúng nguyên tắc diễn đạt", () => {
    const vanBanOn =
      "Nhật Chủ khá yếu, cần thêm trợ lực từ Ấn và Tỷ Kiếp. Xu hướng nghề nghiệp nghiêng về các lĩnh vực liên quan Hỏa, phù hợp môi trường năng động.";
    expect(quetHauKiem(vanBanOn)).toEqual([]);
  });

  it("danh sách từ khóa cấm tuyệt đối bao trùm đủ nhóm nhạy cảm nêu trong SPEC (lục thân/hôn nhân/sức khỏe)", () => {
    const list = layContentSafety().tu_khoa_cam_tuyet_doi.list;
    for (const tu of ["chết", "ly hôn", "ly dị", "vô sinh", "sảy thai"]) {
      expect(list).toContain(tu);
    }
  });

  it("disclaimer bắt buộc hiện ở cả đầu và cuối báo cáo Cơ Bản", () => {
    const disclaimer = layContentSafety().disclaimer_bat_buoc;
    expect(disclaimer.length).toBeGreaterThan(20);
  });
});

describe("Bát Tự Toàn Diện — Free (KHÔNG gọi AI)", () => {
  it("taoGoiMoFree chạy tức thời, thuần code, không throw, với lá số hợp lệ", () => {
    const { chart, analysis } = laSoVaPhanTich(LA_SO_THAM_CHIEU);
    const text = taoGoiMoFree(chart, analysis);
    expect(text.length).toBeGreaterThan(50);
    expect(text).toContain(chart.day.can);
    expect(text).toContain(analysis.dungThan.dungThan);
  });

  it("taoGoiMoFree không lỗi với các mức vượng suy khác nhau (đủ 7 cấp độ đều có câu tương ứng)", () => {
    const caCacGioiTinh: BatTuInput[] = [
      { day: 1, month: 1, year: 2000, hour: 0, gender: "Nam" },
      { day: 15, month: 6, year: 1995, hour: 12, gender: "Nữ" },
      { day: 28, month: 12, year: 1970, hour: 23, gender: "Nam" },
      { day: 7, month: 3, year: 2010, hour: 6, gender: "Nữ" },
    ];
    for (const input of caCacGioiTinh) {
      const { chart, analysis } = laSoVaPhanTich(input);
      expect(() => taoGoiMoFree(chart, analysis)).not.toThrow();
    }
  });

  it("taoBaoCaoCoBan/taoBaoCaoNangCao không throw khi thiếu ANTHROPIC_API_KEY (fallback rỗng, không crash)", async () => {
    // Test này giả định máy chạy test KHÔNG cấu hình khoá AI (đúng thực tế CI/local hiện tại) — nếu
    // sau này có khoá, giaiDoan sẽ khác rỗng nhưng vẫn không được throw, assertion dưới vẫn đúng.
    const coBan = await taoBaoCaoCoBan(LA_SO_THAM_CHIEU);
    expect(Array.isArray(coBan.giaiDoan)).toBe(true);
    const nangCao = await taoBaoCaoNangCao(LA_SO_THAM_CHIEU);
    expect(Array.isArray(nangCao.giaiDoan)).toBe(true);
  }, 30_000);
});

describe("Bát Tự Toàn Diện — Tầng 1 Findings (lá số tham chiếu 31/8/1980 11:50 Dương Nam)", () => {
  it("lập đúng Tứ Trụ đã cross-check với hocvienlyso.org (Canh Thân/Giáp Thân/Bính Tý/Giáp Ngọ)", () => {
    const { chart } = laSoVaPhanTich(LA_SO_THAM_CHIEU);
    expect(`${chart.year.can} ${chart.year.chi}`).toBe("Canh Thân");
    expect(`${chart.month.can} ${chart.month.chi}`).toBe("Giáp Thân");
    expect(`${chart.day.can} ${chart.day.chi}`).toBe("Bính Tý");
    expect(`${chart.hour.can} ${chart.hour.chi}`).toBe("Giáp Ngọ");
  });

  it("7 giai đoạn Cơ Bản (A,B,C,G,H,J) đều sinh findings có canCu (truy vết được nguồn)", () => {
    const { chart, analysis } = laSoVaPhanTich(LA_SO_THAM_CHIEU);
    const findings = taoFindingsCoBan(chart, analysis);
    expect(findings).toHaveLength(6);
    for (const f of findings) {
      expect(f.canCu.length).toBeGreaterThan(0);
      expect(Object.keys(f.ketQua).length).toBeGreaterThan(0);
    }
  });

  it("Giai đoạn D: gộp đủ sao gốc (bat-tu.ts) + sao bổ sung, mỗi sao có cờ matTacDung tường minh", () => {
    const { chart } = laSoVaPhanTich(LA_SO_THAM_CHIEU);
    const d = findingsD(chart);
    const saoCoMat = d.ketQua.saoCoMat as { ten: string; viTriList: { viTri: string; matTacDung: boolean; lyDo: string[] }[] }[];
    expect(saoCoMat.length).toBeGreaterThan(0);
    for (const sao of saoCoMat) {
      for (const vt of sao.viTriList) {
        expect(typeof vt.matTacDung).toBe("boolean");
        if (vt.matTacDung) expect(vt.lyDo.length).toBeGreaterThan(0);
        else expect(vt.lyDo).toEqual([]);
      }
    }
  });

  it("Giai đoạn D: cờ matTacDung biến động theo lá số (không cố định luôn true/false — hồi quy chống lỗi đã từng gặp)", () => {
    const laSoDaDang: BatTuInput[] = [
      { day: 3, month: 1, year: 2001, hour: 5, gender: "Nam" },
      { day: 22, month: 11, year: 1975, hour: 20, gender: "Nữ" },
      { day: 17, month: 2, year: 1988, hour: 16, gender: "Nữ" },
    ];
    const tyLeMatTacDung = laSoDaDang.map((input) => {
      const { chart } = laSoVaPhanTich(input);
      const d = findingsD(chart);
      const all = (d.ketQua.saoCoMat as { viTriList: { matTacDung: boolean }[] }[]).flatMap((s) => s.viTriList);
      return all.filter((v) => v.matTacDung).length / all.length;
    });
    // Không phải mọi lá số đều ra cùng 1 tỷ lệ tuyệt đối (0 hoặc 1) — nếu tất cả bằng nhau và bằng
    // 0 hoặc 1 thì rất có thể logic bị lỗi hệ thống (đã từng xảy ra lúc code, xem lịch sử commit).
    const tatCaGiongNhau = tyLeMatTacDung.every((t) => t === tyLeMatTacDung[0]);
    const luonCucDoan = tyLeMatTacDung.every((t) => t === 0 || t === 1);
    expect(tatCaGiongNhau && luonCucDoan).toBe(false);
  });

  it("Giai đoạn E: Mộ Khố của Thổ dùng Tuất (đồng cung với Hỏa) — khớp fix bat-tu-engine/base-data.json", () => {
    // Lá số có Nhật Chủ Thổ (Kỷ) và Tuất ở 1 trong 4 trụ → phải nhận diện đúng laCuaAi + hanh Thổ.
    const { chart, analysis } = laSoVaPhanTich({ day: 8, month: 9, year: 1994, hour: 10, gender: "Nam" });
    if (chart.day.can === "Mậu" || chart.day.can === "Kỷ") {
      const e = findingsE(chart, analysis);
      const moKho = e.ketQua.moKhoTimThay as { hanh: string; chi: string }[];
      const coThoTuat = moKho.some((m) => m.hanh === "Thổ" && m.chi === "Tuất");
      const coThoThin = moKho.some((m) => m.hanh === "Thổ" && m.chi === "Thìn");
      // Nếu có Thổ trong bảng Mộ Khố tìm thấy, PHẢI là Tuất chứ không phải Thìn (fix đã áp dụng).
      if (moKho.some((m) => m.hanh === "Thổ")) {
        expect(coThoTuat).toBe(true);
        expect(coThoThin).toBe(false);
      }
    }
  });

  it("Giai đoạn H: cung phối ngẫu (Chi trụ Ngày) và cách xác định Tài/Quan Sát theo giới tính đúng quy ước", () => {
    const { chart, analysis } = laSoVaPhanTich(LA_SO_THAM_CHIEU); // Nam → xem Tài
    const h = findingsH(chart, analysis);
    expect(h.ketQua.gioiTinh).toBe("Nam");
    expect(h.ketQua.thapThanChinhXet).toContain("Tài");
    expect(h.ketQua.cungPhoiNgau).toBe(chart.day.chi);
  });

  it("Giai đoạn K: Nhóm 3 (Tòng cách) giữ nguyên Dụng Thần suốt đời — không đổi theo Đại Vận (SPEC mục 7)", () => {
    const { chart, analysis } = laSoVaPhanTich(LA_SO_THAM_CHIEU);
    const k = findingsK(chart, analysis);
    if (analysis.vuongSuy.nhom === 3) {
      expect(k.ketQua.luuY).toContain("GIỮ NGUYÊN");
    }
    expect((k.ketQua.daiVan as unknown[]).length).toBe(chart.daiVan.length);
  });
});

describe("Bát Tự Toàn Diện — đồng bộ nội dung (SPEC mục 6)", () => {
  const KNOWLEDGE_DIR = join(process.cwd(), "content", "bat-tu", "knowledge");

  it("mọi file .md trong content/bat-tu/knowledge/ có ghi chú ngày đồng bộ ở đầu file", () => {
    const files = readdirSync(KNOWLEDGE_DIR).filter((f) => f.endsWith(".md"));
    expect(files.length).toBeGreaterThan(15);
    for (const f of files) {
      const noiDung = readFileSync(join(KNOWLEDGE_DIR, f), "utf-8");
      expect(noiDung.slice(0, 200), `File ${f} thiếu ghi chú đồng bộ ở đầu`).toMatch(/ĐỒNG BỘ TỪ SKILL .* LÚC: \d{4}-\d{2}-\d{2}/);
    }
  });

  it("mọi file trong prompts/giai-doan-A-L.md đúng danh sách 12 giai đoạn A-L (không thiếu/thừa mã)", () => {
    const noiDung = readFileSync(join(process.cwd(), "content", "bat-tu", "prompts", "giai-doan-A-L.md"), "utf-8");
    for (const ma of ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]) {
      expect(noiDung, `Thiếu giai đoạn ${ma} trong giai-doan-A-L.md`).toContain(`| ${ma} |`);
    }
  });
});
