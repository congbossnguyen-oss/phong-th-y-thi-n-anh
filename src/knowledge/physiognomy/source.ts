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
 * RỖNG — xem chú thích đầu tệp. Đừng thêm gì vào đây nếu không có bản in trong tay.
 */
export const KNOWLEDGE_SOURCES: Readonly<Record<string, KnowledgeSource>> = Object.freeze({});

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
