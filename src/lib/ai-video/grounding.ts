/**
 * GROUNDING — STEP 6 §1: tách blocklist "kết luận chuyên môn bịa đặt" ra khỏi `scene-planner.ts`
 * thành 1 hàm DÙNG CHUNG, để invariant "KNOWLEDGE = SOURCE OF TRUTH, AI = VISUALIZATION ONLY" đúng ở
 * MỌI điểm vào, không chỉ đường đi qua Scene Planner.
 *
 * Trước STEP 6: blocklist chỉ nằm trong `scene-planner.ts` — một Scene tự tạo (vd gửi thẳng tới
 * `/api/internal/ai-video/generate`, bỏ qua `/scenes`) không hề bị quét, dù `scene-validator.ts` có
 * chạy trước Prompt Builder (nó chỉ kiểm tra field có rỗng hay không, không kiểm tra NỘI DUNG).
 *
 * Từ STEP 6: `checkSceneGrounding()` được gọi ở CẢ HAI nơi:
 *   - `scene-planner.ts` (khi nhận candidate scene từ LLM, TRƯỚC khi chấp nhận)
 *   - `scene-validator.ts` (khi validate BẤT KỲ Scene nào, bất kể tạo ra từ đâu)
 * → Prompt Builder (qua `assertValidScene`) và do đó cả route `/generate` ĐỀU được bảo vệ, vì cả 2
 * đường đi cuối cùng đều phải qua `validateScene()`.
 *
 * Hàm này THUẦN — không đọc/ghi gì, không gọi mạng, không sửa đổi `knowledgeStatement` gốc.
 */

/**
 * Cụm từ "kết luận chuyên môn" phong thủy hay bị LLM tự bịa thêm dù input không nói tới (hậu quả/
 * nguyên nhân/khẳng định chuyên môn) — DANH SÁCH THAM KHẢO, mở rộng dần khi gặp case mới, KHÔNG phải
 * kiểm duyệt ngữ nghĩa đầy đủ (so khớp chuỗi con).
 */
export const CUM_TU_KET_LUAN_NHAY_CAM = [
  "mất tài lộc",
  "thất thoát tài lộc",
  "hao tài",
  "phá tài",
  "gây bệnh",
  "sinh bệnh",
  "hại sức khỏe",
  "suy giảm sức khỏe",
  "ảnh hưởng hôn nhân",
  "ly hôn",
  "vận xui",
  "xui xẻo",
  "tai họa",
  "tai ương",
  "mất may mắn",
  "gặp hạn",
] as const;

/** true nếu `vanBan` chứa 1 cụm kết luận nhạy cảm mà `knowledgeStatement` gốc KHÔNG hề nhắc tới. */
export function coCumBiaDat(vanBan: string, knowledgeStatement: string): boolean {
  const v = vanBan.toLowerCase();
  const k = knowledgeStatement.toLowerCase();
  return CUM_TU_KET_LUAN_NHAY_CAM.some((cum) => v.includes(cum) && !k.includes(cum));
}

export interface GroundingCheckResult {
  grounded: boolean;
  /** Mô tả cụ thể field nào vi phạm, cụm nào — dùng để hiện lỗi rõ ràng, không giấu. */
  violations: string[];
}

/**
 * Đầu vào tối thiểu để kiểm tra grounding — chỉ cần các field LLM ĐƯỢC quyền viết + knowledgeStatement
 * để so khớp. Nhận 1 subset thay vì cả `Scene` để không tạo phụ thuộc vòng (`scene-planner.ts` vẫn
 * đang định nghĩa `Scene`) và để dùng được cả với candidate CHƯA hoàn chỉnh thành Scene.
 */
export interface GroundableFields {
  knowledgeStatement: string;
  visualDescription: string;
  constraints: readonly string[];
  negativeConstraints: readonly string[];
  narrationHint: string;
}

/**
 * Kiểm tra TOÀN BỘ field LLM-writable so với chính `knowledgeStatement` đi kèm — KHÔNG BAO GIỜ tự
 * suy đoán/thay thế knowledgeStatement nếu thiếu (bên gọi phải tự đảm bảo field này có mặt; hàm này
 * chỉ đọc, không tự vá).
 */
export function checkSceneGrounding(scene: GroundableFields): GroundingCheckResult {
  const violations: string[] = [];
  const truongCanKiemTra: Array<[string, string]> = [
    ["visualDescription", scene.visualDescription],
    ...scene.constraints.map((c, i) => [`constraints[${i}]`, c] as [string, string]),
    ...scene.negativeConstraints.map((c, i) => [`negativeConstraints[${i}]`, c] as [string, string]),
    ["narrationHint", scene.narrationHint],
  ];

  for (const [tenField, vanBan] of truongCanKiemTra) {
    if (typeof vanBan !== "string" || vanBan.length === 0) continue;
    const cumViPham = CUM_TU_KET_LUAN_NHAY_CAM.find(
      (cum) => vanBan.toLowerCase().includes(cum) && !scene.knowledgeStatement.toLowerCase().includes(cum),
    );
    if (cumViPham) {
      violations.push(`${tenField} chứa cụm "${cumViPham}" không có trong knowledgeStatement gốc.`);
    }
  }

  return { grounded: violations.length === 0, violations };
}
