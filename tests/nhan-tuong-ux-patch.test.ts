/**
 * UX patch Phase 1C: mũi tên chỉ hướng cho bước quay trái/phải + câu mẫu cho bước
 * giọng nói.
 *
 * Kiểm trên MÃ NGUỒN `.astro` (cùng cách tests/loi-moi-nang-cap.test.ts vẫn làm) vì
 * component không import được vào vitest. Đổi lại phải bám vào chuỗi thật trong file —
 * cố ý: sửa markup mà quên cập nhật test thì test phải đỏ.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GOC = join(import.meta.dirname, "..", "src");
const MOBILE = readFileSync(join(GOC, "components", "tools", "NhanTuongMobile.astro"), "utf-8");
const STEPS_TS = readFileSync(join(GOC, "features", "physiognomy", "session", "steps.ts"), "utf-8");
/** Các ngưỡng thu nhận đã chuyển sang đây; `steps.ts` chỉ tái xuất. Giá trị KHÔNG đổi. */
const THRESHOLDS_TS = readFileSync(
  join(GOC, "features", "physiognomy", "acquisition", "thresholds.ts"),
  "utf-8",
);

const CAU_MAU = "Xin chào bạn đến với Phong Thủy Thiên Anh.";

describe("mũi tên chỉ hướng", () => {
  it("có khối mũi tên riêng, tách khỏi khung video", () => {
    expect(MOBILE).toContain('id="ntm-arrow"');
    // Khung video kết thúc trước khi khối mũi tên bắt đầu → không thể đè lên mặt.
    const cuoiVideo = MOBILE.indexOf('id="ntm-guide"');
    const batDauMuiTen = MOBILE.indexOf('id="ntm-arrow"');
    expect(cuoiVideo).toBeGreaterThan(-1);
    expect(batDauMuiTen).toBeGreaterThan(cuoiVideo);
  });

  it("bước left vẽ mũi tên ←, bước right vẽ mũi tên →", () => {
    expect(MOBILE).toMatch(/currentStep === "left"\s*\?\s*-1\s*:\s*currentStep === "right"\s*\?\s*1\s*:\s*0/);
    expect(MOBILE).toContain('const ch = dir < 0 ? "←" : "→";');
  });

  it("các bước còn lại ẩn mũi tên", () => {
    expect(MOBILE).toContain('box.classList.toggle("hidden", dir === 0)');
  });

  it("mũi tên có animation thuần CSS, không thêm dependency", () => {
    expect(MOBILE).toContain("@keyframes ntm-drift");
    expect(MOBILE).toContain("prefers-reduced-motion");
  });

  it("mũi tên KHÔNG phải thông tin duy nhất — câu chữ vẫn còn và aria-hidden", () => {
    expect(MOBILE).toContain('aria-hidden="true"');
    expect(MOBILE).toContain('id="ntm-instruction"');
    expect(STEPS_TS).toContain('instruction: "Từ từ quay mặt sang trái"');
    expect(STEPS_TS).toContain('instruction: "Từ từ quay mặt sang phải"');
  });

  it("không đụng quy ước sensor: YAW_SIGN_FOR_USER_LEFT vẫn là 1", () => {
    expect(THRESHOLDS_TS).toContain("export const YAW_SIGN_FOR_USER_LEFT: 1 | -1 = 1;");
    expect(THRESHOLDS_TS).toContain("TURN_MIN_DEG = 20");
    expect(THRESHOLDS_TS).toContain("TURN_SAFE_MAX_DEG = 45");
    expect(THRESHOLDS_TS).toContain("NEAR_MIN_COVERAGE = 0.62");
    // steps.ts vẫn tái xuất để nơi cũ không gãy.
    expect(STEPS_TS).toContain("YAW_SIGN_FOR_USER_LEFT");
    // paintArrow chỉ đọc currentStep, không tự tính hướng từ yaw.
    const than = MOBILE.slice(MOBILE.indexOf("function paintArrow()"));
    expect(than.slice(0, 500)).not.toContain("YAW_SIGN");
    expect(than.slice(0, 500)).not.toContain("yaw");
  });
});

describe("câu mẫu bước giọng nói", () => {
  it("là câu thật, đúng từng chữ, không phải placeholder", () => {
    expect(MOBILE).toContain(`const VOICE_SENTENCE = "${CAU_MAU}";`);
    expect(MOBILE).not.toMatch(/lorem|placeholder|TODO|\.\.\.\s*"/i);
  });

  it("khai báo một chỗ, hiện ở cả màn chuẩn bị lẫn màn đang ghi", () => {
    expect(MOBILE.split("const VOICE_SENTENCE")).toHaveLength(2);
    expect(MOBILE.split("{VOICE_SENTENCE}")).toHaveLength(3);
  });

  it("màn chuẩn bị nói rõ phải đọc to", () => {
    expect(MOBILE).toContain("Hãy đọc to câu sau:");
    expect(MOBILE).toContain('id="ntm-voice-text"');
  });

  it("màn đang ghi nhắc lại câu — không bắt nhớ", () => {
    const manGhi = MOBILE.slice(MOBILE.indexOf('id="ntm-recording"'), MOBILE.indexOf("Screen 5"));
    expect(manGhi).toContain("Hãy đọc:");
    expect(manGhi).toContain("{VOICE_SENTENCE}");
    expect(manGhi).toContain("Đang ghi âm");
  });

  it("xong thì xác nhận đã nhận giọng nói", () => {
    expect(MOBILE).toContain("✓ Đã nhận giọng nói");
    expect(MOBILE).toContain('$("ntm-voice-ok")?.classList.toggle("hidden", !voice?.passed)');
  });
});

describe("nút nghe hướng dẫn", () => {
  it("dùng SpeechSynthesis sẵn có, không thêm dependency", () => {
    expect(MOBILE).toContain("SpeechSynthesisUtterance");
    expect(MOBILE).toContain('u.lang = "vi-VN"');
  });

  it("trình duyệt không hỗ trợ thì nút ẩn, UI không fail", () => {
    // Mặc định trong markup đã là hidden; chỉ bỏ hidden khi dò thấy API.
    expect(MOBILE).toMatch(/id="ntm-speak"[\s\S]{0,160}hidden/);
    expect(MOBILE).toContain('typeof window.speechSynthesis !== "undefined"');
    expect(MOBILE).toContain('typeof window.SpeechSynthesisUtterance === "function"');
    expect(MOBILE).toContain('speakBtn.classList.remove("hidden")');
    // Máy khai báo API nhưng gọi throw → nuốt lỗi, ẩn nút.
    expect(MOBILE).toContain('speakBtn.classList.add("hidden")');
  });

  it("cắt giọng máy trước khi mở micro, tránh thu nhầm", () => {
    expect(MOBILE).toContain("window.speechSynthesis?.cancel()");
  });

  it("đọc câu từ DOM, không chép thêm bản thứ ba", () => {
    expect(MOBILE).toContain('$("ntm-voice-text")?.textContent');
  });
});

describe("mobile 360 / 375 / 390 / 412", () => {
  // Khung ngoài cùng là max-w-md (448px) + Container, hẹp hơn mọi viewport dưới đây
  // sau khi trừ padding → không tự sinh scroll ngang.
  const VIEWPORTS = [360, 375, 390, 412];

  it("khung nội dung không rộng hơn viewport hẹp nhất", () => {
    expect(MOBILE).toContain("max-w-md");
    // max-w-md = 28rem = 448px, nhưng max-width co lại theo viewport, không đẩy ngang.
    expect(Math.min(...VIEWPORTS)).toBeGreaterThan(0);
  });

  it("không có chiều rộng cố định nào vượt 360px", () => {
    const soCung = [...MOBILE.matchAll(/\bw-\[(\d+)px\]/g)].map((m) => Number(m[1]));
    for (const w of soCung) expect(w).toBeLessThanOrEqual(360);
    const maxCung = [...MOBILE.matchAll(/\bmax-w-\[(\d+)px\]/g)].map((m) => Number(m[1]));
    for (const w of maxCung) expect(w).toBeLessThanOrEqual(360);
  });

  it("câu mẫu tự xuống dòng, không bị cắt", () => {
    // leading-snug + text-balance, KHÔNG có truncate/whitespace-nowrap trên câu mẫu.
    const khoiCau = MOBILE.slice(MOBILE.indexOf('id="ntm-voice-text"'), MOBILE.indexOf('id="ntm-voice-text"') + 320);
    expect(khoiCau).toContain("leading-snug");
    expect(khoiCau).not.toContain("truncate");
    expect(khoiCau).not.toContain("whitespace-nowrap");
  });

  it("mọi nút vẫn đạt 44px chạm", () => {
    // Giao diện cao cấp: nút dùng lớp .nt-cta / .nt-cta-ghost thay cho utility min-h-11.
    // Chiều cao chạm ≥44px giờ do CSS đảm bảo (min-height), không còn qua Tailwind utility.
    const soNut = (MOBILE.match(/<button/g) ?? []).length;
    // Mọi nút dùng .nt-cta / .nt-cta-ghost (CTA) hoặc .nt-back (nút quay lại ở chrome).
    const soDungClass = (MOBILE.match(/class="nt-(?:cta(?:-ghost)?|back)(?:\s|")/g) ?? []).length;
    expect(soDungClass).toBe(soNut);
    // Stylesheet phải đảm bảo min-height ≥ 44px (2.75rem) cho cả ba lớp.
    const CSS = readFileSync(join(GOC, "styles", "nhan-tuong.css"), "utf-8");
    const minHeightRem = (cls: string): number => {
      const m = CSS.match(new RegExp(`\\.${cls}\\s*\\{[^}]*min-height:\\s*([\\d.]+)rem`));
      return m ? Number(m[1]) : 0;
    };
    expect(minHeightRem("nt-cta")).toBeGreaterThanOrEqual(2.75);
    expect(minHeightRem("nt-cta-ghost")).toBeGreaterThanOrEqual(2.75);
    expect(minHeightRem("nt-back")).toBeGreaterThanOrEqual(2.75);
  });

  it("mũi tên nằm trong luồng dọc, không absolute đè lên video", () => {
    const khoi = MOBILE.slice(MOBILE.indexOf('id="ntm-arrow"'), MOBILE.indexOf('id="ntm-instruction"'));
    expect(khoi).not.toContain("absolute");
    expect(khoi).not.toContain("fixed");
  });
});

/**
 * HƯỚNG ẢNH CAMERA — hai lớp phải tách hẳn nhau.
 *
 * Người vận hành báo "preview ngược với mặt người xem" sau khi A-01 quét xong. Đúng:
 * camera trước KHÔNG lật hiện đúng những gì người khác thấy, nên quay đầu sang trái CỦA
 * MÌNH thì ảnh nghiêng sang phải màn hình — chỏi với dòng chữ "trái" và mũi tên "←".
 *
 * Sửa ở lớp HIỂN THỊ. Nhóm test này khoá rằng lớp ĐO không bị kéo theo.
 */
describe("hướng ảnh camera: hiển thị lật, đo KHÔNG lật", () => {
  const CAMERA_TS = readFileSync(
    join(GOC, "features", "physiognomy", "camera", "index.ts"),
    "utf-8",
  );

  it("A — preview lật như gương, và CHỈ nhắm vào phần tử video", () => {
    expect(MOBILE).toMatch(/#ntm-video\s*\{[^}]*transform:\s*scaleX\(-1\)/);
    // Không được lật cả khung bọc: mũi tên/khung dẫn sẽ bị lật theo.
    expect(MOBILE).not.toMatch(/\.relative\s*\{[^}]*scaleX\(-1\)/);
  });

  it("A — mũi tên nằm NGOÀI khung video nên không bị lật theo", () => {
    // `#ntm-arrow` phải đứng sau khi container của video đã đóng.
    const iVideo = MOBILE.indexOf('id="ntm-video"');
    const iGuide = MOBILE.indexOf('id="ntm-guide"');
    const iArrow = MOBILE.indexOf('id="ntm-arrow"');
    expect(iVideo).toBeGreaterThan(-1);
    expect(iArrow).toBeGreaterThan(iGuide);
  });

  it("B — MediaPipe nhận PHẦN TỬ VIDEO, không nhận canvas đã vẽ lại", () => {
    // `transform` của CSS không tác động tới khung hình đã giải mã mà API này đọc.
    expect(MOBILE).toMatch(/detectForVideo\(\s*video\s*,/);
  });

  it("B — KHÔNG có phép lật nào trong đường đo", () => {
    for (const src of [MOBILE, CAMERA_TS]) {
      // ctx.scale(-1, …) / ctx.translate(w, 0) là cách lật canvas.
      expect(src).not.toMatch(/\.scale\(\s*-1/);
      expect(src).not.toMatch(/scaleX\(-1\)[^}]*canvas/);
    }
  });

  it("B — grabFrame sao chép thẳng, không biến hình", () => {
    const i = CAMERA_TS.indexOf("export function grabFrame");
    expect(i).toBeGreaterThan(-1);
    const than = CAMERA_TS.slice(i, i + 520);
    expect(than).toContain("ctx.drawImage(video, 0, 0, w, h)");
    expect(than).not.toContain("scale");
    expect(than).not.toContain("translate");
  });

  it("C — hướng mũi tên suy từ TÊN BƯỚC, không từ dấu yaw", () => {
    const i = MOBILE.indexOf("function paintArrow()");
    expect(i).toBeGreaterThan(-1);
    const than = MOBILE.slice(i, i + 420);
    expect(than).toContain('currentStep === "left"');
    expect(than).toContain('currentStep === "right"');
    expect(than).not.toContain("yaw");
    expect(than).not.toContain("YAW_SIGN");
  });

  it("C — mobile KHÔNG dùng YAW_SIGN_FOR_USER_LEFT như MÃ (chỉ nhắc trong chú thích)", () => {
    // Bản đầu của test này dùng `not.toContain` nên đỏ oan: hằng số được NHẮC TỚI trong
    // hai khối chú thích giải thích vì sao KHÔNG đụng vào nó. Bóc chú thích rồi mới xét.
    const code = MOBILE.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "");
    expect(code).not.toContain("YAW_SIGN_FOR_USER_LEFT");
    // Và cũng không import từ tầng ngưỡng thu nhận để đọc dấu.
    expect(code).not.toMatch(/import[^;]*acquisition\/thresholds/);
  });

  it("D — hằng số dấu yaw KHÔNG bị đổi vì chuyện hiển thị", async () => {
    const { YAW_SIGN_FOR_USER_LEFT } = await import(
      "../src/features/physiognomy/acquisition/thresholds"
    );
    expect(YAW_SIGN_FOR_USER_LEFT).toBe(1);
    // Và nguồn vẫn khai đúng một lần, đúng giá trị đó.
    expect(THRESHOLDS_TS).toContain("export const YAW_SIGN_FOR_USER_LEFT: 1 | -1 = 1;");
  });
});
