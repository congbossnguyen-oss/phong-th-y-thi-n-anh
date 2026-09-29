/**
 * KHO NGUỒN — cổ thư và tài liệu mà mọi luật nhân tướng phải trỏ ngược về.
 *
 * ⚠️ REGISTRY DƯỚI ĐÂY CỐ Ý ĐỂ RỖNG.
 *
 * Không có một nguồn nào được nhập, vì chưa ai đối chiếu bản in thật. Nhập bừa tên
 * sách, tên tác giả, số chương, số trang hay câu trích do mô hình sinh ra sẽ tạo ra
 * thứ nguy hiểm hơn cả việc không có gì: một chuỗi provenance TRÔNG NHƯ THẬT.
 *
 * Hệ quả trực tiếp và có chủ đích: **hiện KHÔNG luật nào có nguồn xác minh, nên KHÔNG
 * gì đi tới được tầng luận giải.** Đó là trạng thái đúng, không phải thiếu sót.
 *
 * Muốn thêm nguồn thì phải có bản in/bản scan trong tay, điền đủ `locator` tới mức
 * chương–trang–đoạn, rồi mới đặt `verificationStatus: "verified"`.
 */

export const KNOWLEDGE_SCHEMA_VERSION = "physiognomy-knowledge-v1" as const;

/**
 *  unverified — đã ghi lại nhưng CHƯA đối chiếu bản gốc. Không dùng để luận giải.
 *  verified   — đã đối chiếu tận bản in/scan, `locator` trỏ đúng chỗ.
 *  disputed   — các bản khác nhau nói khác nhau, hoặc giới nghiên cứu còn tranh cãi.
 */
export type SourceVerificationStatus = "unverified" | "verified" | "disputed";

/** Vị trí chính xác trong tài liệu. Mơ hồ thì coi như không có nguồn. */
export interface SourceLocator {
  /** Thiên/quyển/chương, ví dụ "Quyển 2 — Ngũ Quan". */
  chapter?: string;
  section?: string;
  page?: string;
  paragraph?: string;
  /** Số ảnh trong bản scan, khi bản in không đánh số trang. */
  scanPage?: string;
  /** Ghi chú cách định vị khi tài liệu không đánh số theo lối thông thường. */
  note?: string;
}

/**
 * Cách định vị của tài liệu này — mỗi loại sách đánh số một kiểu.
 *
 * Bắt khai báo trước để người sau biết `locator` phải điền gì mới đủ tái lập:
 * sách in đánh số trang, cổ thư chia quyển–thiên, bản scan đánh số ảnh.
 */
export type LocatorPolicy = "page" | "chapter_section" | "volume_chapter" | "scan_page";

export interface KnowledgeSource {
  sourceId: string;
  title: string;
  /** Tác giả theo đúng bản đang cầm. Không truy nguyên hộ, không đoán. */
  author: string | null;
  /** Niên đại của bản gốc, ví dụ "Tống" / "thế kỷ 19". null nếu không rõ. */
  era: string | null;
  /** Dòng phái, ví dụ "Ma Y tướng pháp". */
  tradition: string | null;
  /** Lần in/bản cụ thể, ví dụ "tái bản lần 3". null nếu bản đang cầm không ghi. */
  edition: string | null;
  /**
   * Nhà xuất bản. **TUỲ CHỌN CÓ CHỦ ĐÍCH** — `null` là giá trị hợp lệ, không phải
   * thiếu sót, và KHÔNG làm nguồn mất tư cách.
   *
   * Căn cứ: tài liệu thật duy nhất tìm được trong repo là giáo trình đóng dấu
   * "LƯU HÀNH NỘI BỘ" — không nhà xuất bản, không ISBN. Cổ thư chép tay cũng vậy.
   * Bắt buộc trường này sẽ loại đúng loại tài liệu mà dự án cần nhất.
   * Xem docs/PHYSIOGNOMY_KNOWLEDGE_SOURCE_INVENTORY.md §3.2.
   */
  publisher: string | null;
  /**
   * Năm in của CHÍNH bản đang cầm, không phải năm sáng tác.
   * **TUỲ CHỌN CÓ CHỦ ĐÍCH**, cùng lý do với `publisher`.
   */
  year: number | null;
  /** Tài liệu này định vị bằng cách nào — quyết định `locator` cần field nào. */
  locatorPolicy: LocatorPolicy;
  locator: SourceLocator;
  /** Nguyên văn đoạn được trích. Chỉ chép, không diễn giải, không dịch thoáng. */
  text: string;
  language: "zh" | "vi" | "en" | "other";
  /** Bản này từ đâu ra: thư viện nào, ai scan, mua ở đâu. */
  provenance: string;
  /** Chuỗi trích dẫn đầy đủ để người khác tìm lại được. */
  citation: string;
  verificationStatus: SourceVerificationStatus;
  /**
   * Trỏ tới HIỆN VẬT đã dùng để đối chiếu: đường dẫn bản scan, mã thư viện, ảnh chụp.
   * Không có hiện vật thì không thể `verified` — đây chính là chỗ chặn "nguồn từ trí
   * nhớ mô hình".
   */
  evidenceRef: string | null;
  schemaVersion: typeof KNOWLEDGE_SCHEMA_VERSION;
}

/**
 * 神相全編 · 卷三 · 相眉 — nguồn ĐÃ XÁC MINH đầu tiên, và tới giờ là DUY NHẤT.
 *
 * Đối chiếu tận bản scan: File:NLC416-13jh001662-59167_神相全編.pdf (Wikimedia Commons,
 * bản Thư viện Quốc gia Trung Quốc số hoá, 文明書局 1925), ảnh trang 141 — chính diện là
 * tờ 七 quyển ba, mục 「相眉」. Câu được chép ĐỌC RÕ trên bản render 500px của trang này.
 *
 * NGỮ NGHĨA (đã kiểm trên chính trang, không suy từ trí nhớ): 眉長過眼/過目 gắn với 兄弟
 * (anh em ruột) — KHÔNG phải tài lộc. Trang có cả vế đối 「眉短家無兄弟」. Câu chép ở `text`
 * là nguyên văn hai vế đó; mọi diễn giải nằm ở tầng luật, không nằm ở đây.
 */
export const KNOWLEDGE_SOURCES: Readonly<Record<string, KnowledgeSource>> = Object.freeze({
  SHEN_XIANG_QUAN_BIAN_XIANG_MEI_001: {
    sourceId: "SHEN_XIANG_QUAN_BIAN_XIANG_MEI_001",
    title: "神相全編",
    // Không ghi trên chính tờ đang cầm; không truy nguyên hộ (xem doctrine trên).
    author: null,
    era: null,
    tradition: null,
    edition: null,
    // Lấy từ metadata bản số hoá NLC trên Wikimedia, không phải đoán.
    publisher: "文明書局",
    year: 1925,
    locatorPolicy: "scan_page",
    locator: {
      chapter: "卷三",
      section: "相眉",
      scanPage: "141",
      // Tờ 七 (folio 7) là chính diện của ảnh 141; chân trang in 「神相全編 卷三」 và số tờ 「七」.
      note: "折葉 七 (folio 7), ghép ảnh scan số 141",
    },
    // Nguyên văn HAI vế đọc rõ trên trang. Chỉ chép, không dịch, không thêm.
    text: "眉長過眼，弟兄須五六。眉短家無兄弟。",
    language: "zh",
    provenance:
      "Wikimedia Commons, File:NLC416-13jh001662-59167_神相全編.pdf (bản số hoá Thư viện " +
      "Quốc gia Trung Quốc). PDF sha256 " +
      "94167d8d19d47525535b39e18a20c6b315a3a30751c2063bc2492760f1d927af, 576 trang, không có " +
      "lớp OCR. Chép tay từ ảnh trang 141 render qua MediaWiki thumbnail API ở 500px " +
      "(bề rộng tối đa file này cho phép); ký tự hai vế trên đọc rõ ở mức đó.",
    citation:
      "《神相全編》卷三「相眉」，折葉七：「眉長過眼，弟兄須五六」「眉短家無兄弟」。文明書局 " +
      "1925 年本，Thư viện Quốc gia Trung Quốc số hoá, Wikimedia Commons " +
      "File:NLC416-13jh001662-59167_神相全編.pdf, ảnh trang 141.",
    verificationStatus: "verified",
    // Trỏ tới ĐÚNG hiện vật đã đọc: bản render trang 141, khoá bằng sha256 của ảnh đó.
    // `PINNED_EVIDENCE_RESOLVER` bên dưới chỉ mở đúng tham chiếu này.
    evidenceRef:
      "nlc-scan:File:NLC416-13jh001662-59167_神相全編.pdf#page=141;" +
      "sha256=c03699bb94b67bd83d5fc31901a5855660f0221ada410adfe630aa8b932d3019",
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
  },
});

export function getSource(sourceId: string): KnowledgeSource | null {
  return KNOWLEDGE_SOURCES[sourceId] ?? null;
}

/**
 * Trường `locator` BẮT BUỘC ứng với từng cách định vị.
 *
 * Trước đây `locatorPolicy` là trường chết — khai ra rồi không ai đọc, nên một nguồn
 * có thể khai `scan_page` mà lại đưa số trang sách. Bảng này làm cho lời khai và dữ
 * liệu thật phải khớp nhau.
 *
 * `paragraph` và `note` LUÔN chỉ là tinh chỉnh thêm, không bao giờ đủ một mình.
 */
export const LOCATOR_REQUIRED: Readonly<Record<LocatorPolicy, readonly (keyof SourceLocator)[]>> =
  Object.freeze({
    page: ["page"],
    // `chapter` đã ghi chú là "Thiên/quyển/chương" nên dùng chung cho cả hai lối này.
    chapter_section: ["chapter", "section"],
    volume_chapter: ["chapter"],
    scan_page: ["scanPage"],
  });

/** Locator có khớp cách định vị đã khai không. Cần ÍT NHẤT MỘT trường bắt buộc. */
export function locatorMatchesPolicy(s: KnowledgeSource): boolean {
  return LOCATOR_REQUIRED[s.locatorPolicy].some((k) => {
    const v = s.locator[k];
    return typeof v === "string" && v.trim() !== "";
  });
}

// ───────────────────────────────── phân giải hiện vật

/**
 *  resolved     — đã mở được hiện vật và nó đúng là thứ `evidenceRef` nói.
 *  missing      — resolver hiểu dạng tham chiếu này nhưng KHÔNG tìm thấy hiện vật.
 *  unresolvable — resolver không biết cách mở dạng tham chiếu này.
 */
export type EvidenceResolution = "resolved" | "missing" | "unresolvable";

/**
 * Bộ phân giải hiện vật. **Repo hiện KHÔNG có bản cài đặt thật nào.**
 *
 * Tách ra thành phụ thuộc tiêm vào, cố ý: "evidenceRef có giá trị" và "evidenceRef
 * trỏ tới một hiện vật có thật" là HAI chuyện khác nhau. Kiểm chuỗi khác rỗng chỉ
 * trả lời được chuyện thứ nhất.
 */
export interface EvidenceResolver {
  readonly name: string;
  resolve(evidenceRef: string): EvidenceResolution;
}

/**
 * Bộ phân giải mặc định: TỪ CHỐI MỌI THỨ.
 *
 * Vì chưa có kho hiện vật nào, không thể xác nhận bất kỳ tham chiếu nào. Hệ quả có
 * chủ đích: **không nguồn nào đạt VERIFIED cho tới khi cắm một resolver thật.** Đây
 * là fail-closed, không phải thiếu sót — xem docs §GAP 2.
 */
export const NO_EVIDENCE_RESOLVER: EvidenceResolver = Object.freeze({
  name: "no-evidence-resolver",
  resolve: (): EvidenceResolution => "unresolvable",
});

/**
 * Allowlist các hiện vật ĐÃ được con người đối chiếu tận bản scan, khoá bằng sha256 của
 * chính ảnh đã đọc. Đây KHÔNG phải mở tệp lúc chạy — bản scan không được đóng gói vào
 * build — mà là danh sách đã-kiểm: mỗi hash dưới đây ứng với một ảnh trang mà người thật
 * đã mở ra và đọc được câu trích tương ứng trong `KNOWLEDGE_SOURCES`.
 *
 * Thêm một dòng vào đây = tuyên bố "tôi đã tự đọc đúng trang này". Không có bản scan trong
 * tay thì không được thêm.
 */
const VERIFIED_ARTIFACT_SHA256: ReadonlySet<string> = new Set([
  // 神相全編 卷三 相眉, ảnh trang 141 (folio 七) — nguồn SHEN_XIANG_QUAN_BIAN_XIANG_MEI_001.
  "c03699bb94b67bd83d5fc31901a5855660f0221ada410adfe630aa8b932d3019",
]);

/**
 * Resolver THẬT, hẹp nhất có thể: chỉ nhận tham chiếu dạng `nlc-scan:...;sha256=<64 hex>`
 * và chỉ khi hash nằm trong `VERIFIED_ARTIFACT_SHA256`.
 *
 *   · đúng scheme + hash đã kiểm  → "resolved"
 *   · đúng scheme + hash lạ       → "missing"       (hiểu dạng ref, nhưng chưa ai kiểm)
 *   · bất cứ thứ gì khác          → "unresolvable"  (không biết cách mở)
 *
 * Vẫn FAIL CLOSED: đổi một ký tự trong hash, hay trỏ tới trang chưa kiểm, là bị loại. Đây
 * là resolver mà chú thích `NO_EVIDENCE_RESOLVER`/§GAP 2 chờ — giờ đã có hiện vật để cắm.
 */
export const PINNED_EVIDENCE_RESOLVER: EvidenceResolver = Object.freeze({
  name: "pinned-scan-resolver",
  resolve: (ref: string): EvidenceResolution => {
    const m = /^nlc-scan:.*;sha256=([0-9a-f]{64})$/.exec(ref.trim());
    if (!m) return "unresolvable";
    return VERIFIED_ARTIFACT_SHA256.has(m[1]) ? "resolved" : "missing";
  },
});

/** Vì sao một nguồn bị loại. Trả ra để gọi được tên chứ không chỉ true/false. */
export type SourceRejection =
  | "null_source"
  | "not_verified"
  | "locator_empty"
  | "locator_policy_mismatch"
  | "missing_title"
  | "missing_citation"
  | "missing_provenance"
  | "missing_evidence_ref"
  | "evidence_missing"
  | "evidence_unresolvable";

/**
 * Nguồn dùng được khi đủ CẢ BA, thiếu một là hỏng:
 *   1. đã đối chiếu bản gốc  (`verified`)
 *   2. định vị lại được      (`locator` có ít nhất một mốc cụ thể)
 *   3. có danh tính tối thiểu và trỏ được tới hiện vật
 *
 * Điều 3 là chỗ chặn nguồn sinh ra từ trí nhớ mô hình: một chuỗi trích dẫn nghe rất
 * thật nhưng không có bản scan/mã thư viện nào để đối chiếu thì KHÔNG dùng được.
 */
export function isUsableSource(
  s: KnowledgeSource | null,
  resolver: EvidenceResolver = NO_EVIDENCE_RESOLVER,
): s is KnowledgeSource {
  return rejectSource(s, resolver) === null;
}

/**
 * Cùng phép kiểm, nhưng trả LÝ DO đầu tiên khiến nguồn bị loại — `null` nghĩa là dùng
 * được. Có bản này để test và bảng chẩn đoán nói được "hỏng ở đâu", thay vì chỉ `false`.
 */
export function rejectSource(
  s: KnowledgeSource | null,
  resolver: EvidenceResolver = NO_EVIDENCE_RESOLVER,
): SourceRejection | null {
  if (s === null) return "null_source";
  if (s.verificationStatus !== "verified") return "not_verified";

  const l = s.locator;
  const coMoc = [l.chapter, l.section, l.page, l.paragraph, l.scanPage].some(
    (v) => typeof v === "string" && v.trim() !== "",
  );
  if (!coMoc) return "locator_empty";
  // Lời khai `locatorPolicy` phải khớp dữ liệu thật, không chỉ "có trường nào đó".
  if (!locatorMatchesPolicy(s)) return "locator_policy_mismatch";

  if (s.title.trim() === "") return "missing_title";
  if (s.citation.trim() === "") return "missing_citation";
  if (s.provenance.trim() === "") return "missing_provenance";
  if (s.evidenceRef === null || s.evidenceRef.trim() === "") return "missing_evidence_ref";

  // Cửa cuối: hiện vật phải MỞ ĐƯỢC. Không có resolver thật thì tới đây là dừng.
  const r = resolver.resolve(s.evidenceRef);
  if (r === "missing") return "evidence_missing";
  if (r === "unresolvable") return "evidence_unresolvable";
  return null;
}

/**
 * Có nguồn nào trong danh sách dùng được không.
 *
 * Mặc định dùng `NO_EVIDENCE_RESOLVER`, nên hiện tại LUÔN trả `false` — kể cả khi ai
 * đó nhét được một nguồn đầy đủ vào registry. Đúng ý đồ.
 */
export function hasVerifiedSource(
  sourceIds: readonly string[],
  resolver: EvidenceResolver = NO_EVIDENCE_RESOLVER,
): boolean {
  return sourceIds.some((id) => isUsableSource(getSource(id), resolver));
}
