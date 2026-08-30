// Kiểm tra lớp nối Thư Viện Câu Hỏi ↔ engine lập quẻ Kinh Dịch (Quân Sư Thiên Anh).
// Mục tiêu: đảm bảo (1) tái dùng đúng engine có sẵn, (2) payload có cấu trúc đầy đủ để AI đọc,
// (3) KHÔNG cho câu chọn-ngày-giờ đi nhầm vào luồng gieo quẻ.

import { describe, expect, it } from "vitest";
import type { CoinLineValue } from "../src/lib/luc-hao";
import {
  buildInterpretationPayload,
  castInputNow,
  castLucHaoFromTosses,
  castLucHaoRandom,
  dungThanHintFor,
} from "../src/lib/quan-su/divination";
import { tinhVanTrinhHienTai } from "../src/lib/quan-su/current-luck";
import { getQuestion, getQuestionsByCategory } from "../src/lib/quan-su";
import { categories } from "../src/lib/quan-su/categories";

const FIXED_INPUT = { day: 15, month: 6, year: 2024, hour: 10, minute: 30 };

describe("Divination — lập quẻ tái dùng engine có sẵn", () => {
  it("castLucHaoFromTosses trả kết quả engine đầy đủ (quẻ chủ/biến/hỗ, hào, can chi ngày tháng)", () => {
    // 6 lần gieo: 3 giá trị động (9=Lão Dương, 6=Lão Âm) để chắc chắn có quẻ biến.
    const tosses: CoinLineValue[] = [9, 7, 8, 6, 7, 8];
    const cast = castLucHaoFromTosses(tosses, FIXED_INPUT);

    expect(cast.chinh.hao).toHaveLength(6);
    expect(cast.chinh.name.length).toBeGreaterThan(0);
    expect(cast.bien).not.toBeNull(); // có hào động → có quẻ biến
    expect(cast.dongPositions).toEqual([1, 4]); // vị trí 9 và 6
    expect(cast.dayCan.length).toBeGreaterThan(0);
    expect(cast.nguyetLenh.length).toBeGreaterThan(0);
    // mỗi hào có đủ trường cấu trúc để AI đọc
    for (const h of cast.chinh.hao) {
      expect(h.lucThan).toBeTruthy();
      expect(h.lucThu).toBeTruthy();
      expect(["Vượng", "Tướng", "Hưu", "Tù", "Tử"]).toContain(h.vuongSuy);
      expect(typeof h.xunKong).toBe("boolean");
      expect(Array.isArray(h.relations)).toBe(true);
    }
    // đúng 1 hào Thế, 1 hào Ứng
    expect(cast.chinh.hao.filter((h) => h.theUng === "Thế")).toHaveLength(1);
    expect(cast.chinh.hao.filter((h) => h.theUng === "Ứng")).toHaveLength(1);
  });

  it("không có hào động (toàn 7/8) → không có quẻ biến, không tự coi là Phản/Phục Ngâm", () => {
    const tosses: CoinLineValue[] = [7, 8, 7, 8, 7, 8];
    const cast = castLucHaoFromTosses(tosses, FIXED_INPUT);
    expect(cast.bien).toBeNull();
    expect(cast.dongPositions).toEqual([]);
    expect(cast.fanYin.enabled).toBe(false);
    expect(cast.fuYin.enabled).toBe(false);
  });

  it("castLucHaoRandom (gieo giúp) — cùng seed cho cùng kết quả (đảm bảo tái lập được)", () => {
    let seed = 42;
    const rng = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    const a = castLucHaoRandom(FIXED_INPUT, rng);
    seed = 42;
    const b = castLucHaoRandom(FIXED_INPUT, rng);
    expect(a.chinh.name).toBe(b.chinh.name);
    expect(a.dongPositions).toEqual(b.dongPositions);
  });

  it("cần đúng 6 lần gieo, sai số lượng thì báo lỗi", () => {
    expect(() => castLucHaoFromTosses([7, 8, 7] as CoinLineValue[], FIXED_INPUT)).toThrow();
  });

  it("castInputNow quy đổi đúng sang GIỜ VIỆT NAM, không phụ thuộc múi giờ máy chạy code", () => {
    // 07:05 UTC = 14:05 giờ Việt Nam (UTC+7) — dựng bằng Date.UTC để test không phụ thuộc múi giờ
    // của máy chạy test (Thầy báo Mai Hoa Dịch Số ra sai quẻ vì castInputNow trước đây lấy giờ hệ
    // thống server thay vì giờ VN, 2026-08-23).
    const d = new Date(Date.UTC(2025, 0, 20, 7, 5));
    const inp = castInputNow(d);
    expect(inp).toMatchObject({ day: 20, month: 1, year: 2025, hour: 14, minute: 5 });
  });

  it("castInputNow đổi cả NGÀY khi giờ VN đã sang hôm sau so với giờ UTC", () => {
    // 20:00 UTC ngày 20/1 = 03:00 giờ VN ngày 21/1 — trường hợp hay bị bỏ sót nếu chỉ cộng offset
    // vào giờ mà quên ngày cũng đổi theo.
    const d = new Date(Date.UTC(2025, 0, 20, 20, 0));
    const inp = castInputNow(d);
    expect(inp).toMatchObject({ day: 21, month: 1, year: 2025, hour: 3, minute: 0 });
  });
});

describe("Divination — Dụng Thần gợi ý theo nhóm", () => {
  it("mọi nhóm đều có gợi ý Dụng Thần (rule-based, không để trống)", () => {
    for (const c of categories) {
      const hint = dungThanHintFor(c.id);
      expect(hint, c.id).toBeTruthy();
      expect(["luc-than", "the-hao", "framework"]).toContain(hint.kind);
    }
  });

  it("khớp một số nhóm chuẩn theo spec 4.1", () => {
    expect(dungThanHintFor("kinh-doanh")).toMatchObject({ kind: "luc-than", value: "Thê Tài" });
    expect(dungThanHintFor("kien-tung-tranh-chap")).toMatchObject({ kind: "luc-than", value: "Quan Quỷ" });
    expect(dungThanHintFor("suc-khoe")).toMatchObject({ kind: "the-hao" });
    expect(dungThanHintFor("hop-tac").kind).toBe("framework");
  });
});

describe("Divination — hỏi cho người khác (doiTuong đổi Dụng Thần theo Lục Thân, quy trình §1.1)", () => {
  it("mặc định (không truyền doiTuong, hoặc 'chinh-toi') giữ nguyên Dụng Thần của nhóm", () => {
    expect(dungThanHintFor("suc-khoe")).toMatchObject({ kind: "the-hao" });
    expect(dungThanHintFor("suc-khoe", "chinh-toi")).toMatchObject({ kind: "the-hao" });
  });

  it("hỏi cho cha/mẹ, con, vợ, chồng, anh chị em → đổi đúng Lục Thân đại diện", () => {
    expect(dungThanHintFor("suc-khoe", "cha-me")).toMatchObject({ kind: "luc-than", value: "Phụ Mẫu" });
    expect(dungThanHintFor("suc-khoe", "con")).toMatchObject({ kind: "luc-than", value: "Tử Tôn" });
    expect(dungThanHintFor("suc-khoe", "vo")).toMatchObject({ kind: "luc-than", value: "Thê Tài" });
    expect(dungThanHintFor("suc-khoe", "chong")).toMatchObject({ kind: "luc-than", value: "Quan Quỷ" });
    expect(dungThanHintFor("suc-khoe", "anh-chi-em")).toMatchObject({ kind: "luc-than", value: "Huynh Đệ" });
  });

  it("hỏi cho 'người khác' (không thuộc lục thân cụ thể) → Hào Ứng", () => {
    expect(dungThanHintFor("suc-khoe", "nguoi-khac")).toMatchObject({ kind: "ung-hao" });
  });

  it("nhóm 'framework' (không có 1 Dụng Thần đơn nhất) giữ nguyên bất kể doiTuong", () => {
    expect(dungThanHintFor("hop-tac", "cha-me").kind).toBe("framework");
  });

  it("payload ghi lại doi_tuong_hoi + Ứng Kỳ tính theo hào Ứng khi doiTuong='nguoi-khac'", () => {
    const q = getQuestion("xu-huong-suc-khoe")!;
    const cast = castLucHaoFromTosses([9, 7, 8, 7, 8, 7], FIXED_INPUT);
    const payload = buildInterpretationPayload(q, cast, { method: "luc-hao-tosses", doiTuong: "nguoi-khac" });
    expect(payload.question.doi_tuong_hoi).toBe("nguoi-khac");
    expect(payload.question.dung_than_hint.kind).toBe("ung-hao");
    // Hào Ứng luôn hiện trên quẻ (không có khái niệm phục tàng cho Thế/Ứng) → luôn tính được Ứng Kỳ.
    expect(payload.ung_ky).not.toBeNull();
  });

  it("payload mặc định doi_tuong_hoi='chinh-toi' khi không truyền doiTuong", () => {
    const q = getQuestion("xu-huong-suc-khoe")!;
    const cast = castLucHaoFromTosses([9, 7, 8, 7, 8, 7], FIXED_INPUT);
    const payload = buildInterpretationPayload(q, cast, { method: "luc-hao-tosses" });
    expect(payload.question.doi_tuong_hoi).toBe("chinh-toi");
  });
});

describe("Divination — payload cho Interpretation Engine", () => {
  it("gói đủ cấu trúc: câu hỏi + quẻ nguyên văn + slot vận trình + meta", () => {
    const q = getQuestion("dau-tu-du-an")!;
    const cast = castLucHaoFromTosses([9, 7, 8, 7, 8, 7], FIXED_INPUT);
    const payload = buildInterpretationPayload(q, cast, { method: "luc-hao-tosses" });

    expect(payload.question.question_id).toBe("dau-tu-du-an");
    expect(payload.question.dung_than_hint).toBeTruthy();
    expect(payload.cast).toBe(cast); // nguyên văn engine, không sao chép/sửa
    expect(payload.van_trinh).toBeNull(); // chưa có adapter → slot rỗng
    expect(payload.meta.method).toBe("luc-hao-tosses");
    expect(payload.meta.castAtISO).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("nhận vận trình hiện tại (LuckContext thật từ current-luck.ts) khi câu hỏi có dùng", () => {
    const q = getQuestion("chuyen-viec")!;
    const cast = castLucHaoRandom(FIXED_INPUT);
    const vanTrinh = tinhVanTrinhHienTai({ day: 20, month: 5, year: 1990, hour: 10, gender: "Nam", nowYear: 2024 });
    const payload = buildInterpretationPayload(q, cast, { method: "luc-hao-random", vanTrinh });
    expect(payload.van_trinh).toBe(vanTrinh);
    expect(payload.van_trinh?.dimensions).toHaveLength(4);
  });

  it("TỪ CHỐI câu chọn-ngày-giờ (không gieo quẻ, phải đi trach-nhat)", () => {
    const q = getQuestionsByCategory("chon-ngay-gio")[0]!;
    const cast = castLucHaoRandom(FIXED_INPUT);
    expect(() => buildInterpretationPayload(q, cast, { method: "luc-hao-random" })).toThrow();
  });
});
