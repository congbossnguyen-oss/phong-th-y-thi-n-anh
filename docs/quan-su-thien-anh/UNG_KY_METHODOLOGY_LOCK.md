# Ứng Kỳ — Methodology Gate & Release Lock

**Branch:** `quan-su-thien-anh` · **HEAD:** `70295e5` · **Nature:** DECISION GATE → METHODOLOGY LOCK (doc-only).
KHÔNG runtime/test/API/UI/prompt/skill/rule/algorithm change, KHÔNG web research, KHÔNG reopen Phase 25/26, KHÔNG đụng
movementEfficacy/reduced/timingBlocker, KHÔNG push. Baseline 318/318.

**Source of truth:** `UNG_KY_PROVENANCE_RUNTIME_AUDIT.md` (d021984) + `UNG_KY_PRIMARY_SOURCE_PROVENANCE_AUDIT.md`
(70295e5) + `luc-hao-ung-ky.ts` + `ung-ky-synthesis.ts` + spec §6. Không bổ sung kiến thức ngoài.

---

## 1. Decision Gate Result
Câu hỏi DUY NHẤT: *"Ứng Kỳ đủ điều kiện RELEASE ở dạng CANDIDATE / NON-OVERRIDING chưa?"* (KHÔNG đánh giá "đúng cổ điển
tuyệt đối"). Phân biệt **RELEASE AS CANDIDATE** ≠ **CLASSICALLY VERIFIED**.

| Tiêu chí | Kết quả | Bằng chứng |
|---|---|---|
| **A. Candidate runtime** | **PASS** | 2 engine (`tinhUngKy` + `synthesizeUngKy`), no legacy; output = `UngKySynthesis {candidates, primary, status}` |
| **B. Non-overriding behavior** | **PASS** | prompt.ts:206 "candidate, KHÔNG override conclusion"; report.ungKy chỉ vào AI prose; KHÔNG chạm ketLuan/mucDoThuan/chamDiem/reduced/movementEfficacy |
| **C. Provenance transparency** | **PASS** | R1–R7=B, R8/R-TH=C, R5-detection=D, minh bạch trong 2 audit; KHÔNG fabricate |
| **D. Test / regression** | **PASS** | __ung-ky-synthesis 21 + __sau-tam-hop 9 + golden-e2e 7; **318/318 PASS** |
| **E. Classical provenance** | **NOT VERIFIED** | không verbatim cổ thư trong repo → không rule nào đạt A (DATA GAP) |

**GATE = PASS** cho mục tiêu **RELEASE AS CANDIDATE / NON-OVERRIDING** (A/B/C/D PASS; E NOT VERIFIED — đúng kỳ vọng,
KHÔNG phải blocker vì release ở dạng candidate, không tuyên bố cổ điển).

## 2. Candidate / Non-Overriding Status
- Ứng Kỳ = **CANDIDATE** (không chắc chắn xảy ra) + **NON-OVERRIDING** (không đổi verdict). LOCKED nguyên tắc này.

## 3. Provenance Status
- Nguồn in-repo = **spec §6** (compiled Vietnamese translation của nguồn dự án; sách gốc + verbatim cổ thư KHÔNG có trong
  repo). **Classical provenance = NOT VERIFIED (DATA GAP).**

## 4. R1–R8 / R-TH Classification (locked, từ audit 70295e5)
| Rule | Class | Ghi chú lock |
|---|---|---|
| R1 động → Trị/Hợp | **B** | §6 nêu trực tiếp; KHÔNG mô tả "classical verbatim verified" |
| R2 tĩnh → Trị/Xung | **B** | như trên |
| R3 Không Vong → Điền Thực/Xuất Không | **B** | như trên |
| R4 Nguyệt Phá → Điền Thực/Qua Tháng | **B** | như trên |
| R5 Nhập Mộ → Xung Mộ | **B (rule) / D (detection)** | rule dùng được; detection = canAudit debt, KHÔNG tuyên bố verified |
| R6 bị Hợp → Xung Hợp | **B** | như trên |
| R7 hưu/tù gặp Trường Sinh | **B** | như trên (kèm caveat suy kiệt) |
| R8 tiến/thoái | **C** | methodology-derived (án-lệ chunk-04 + suy đối xứng); KHÔNG nâng classical fact |
| R-TH Tam Hợp → ungKyChi | **C** | Phase-10C methodology; KHÔNG tự mở rộng semantics |
- **KHÔNG rule nào = A.** KHÔNG được dùng C/D để tạo tuyên bố "cổ điển xác quyết".

## 5. Locked Methodology Principles
1. Ứng Kỳ = **CANDIDATE / NON-OVERRIDING**.
2. Candidate Ứng Kỳ **KHÔNG** tự động: override verdict · đổi `ketLuan` · đổi `mucDoThuan` · đổi `chamDiem` · đổi
   `reduced` · đổi `movementEfficacy` · tạo `timingBlocker`.
3. **R1–R7:** được dùng trong candidate engine; provenance = **B**; nguồn = compiled project source; **KHÔNG** mô tả là
   "classical verbatim verified".
4. **R8:** provenance = **C** (methodology-derived); KHÔNG nâng classical fact khi chưa có evidence.
5. **R-TH Tam Hợp:** provenance = **C**; giữ theo Phase-10C; KHÔNG tự mở rộng semantics.
6. **R5:** RULE = B, DETECTION = D/canAudit debt; KHÔNG tuyên bố Nhập-Mộ detection đã verified.
7. **Hóa Mộ → XUAT_MO:** **BLOCKED**; KHÔNG implementation cho đến khi có source đủ.
8. **timingBlocker** ≠ Ứng Kỳ (là boolean chamDiem → NÊN CHỜ, không dự đoán mốc).
9. **movementEfficacy** KHÔNG tự sinh Ứng Kỳ (đã xác nhận code trace).
10. KHÔNG dùng provenance **C/D** để tạo tuyên bố "cổ điển xác quyết".

## 6. R5 canAudit Status
- Rule "Xung Mộ → Ứng Kỳ" = **B** (§6). Cách xác định Nhập Mộ = **D** — engine còn nợ audit (`canAudit:true` = low
  confidence). **CHƯA đóng.** Không tự giải trong phase này.

## 7. Hóa Mộ → XUAT_MO Status
- **BLOCKED / methodology gap** — không source in-repo cho auto-create. Giữ nguyên (Phase 14). KHÔNG thêm rule.

## 8. Explicit Non-Decisions (CHƯA quyết, KHÔNG giải ở đây)
- Chưa research verbatim primary source (增删卜易/卜筮正宗/易冒 应期章).
- Chưa replay 153–163 án lệ thành 6-hào (validation DATA GAP).
- Chưa đóng R5 canAudit (Nhập-Mộ engine audit).
- Chưa mở Hóa Mộ → XUAT_MO.
- Chưa quyết UI presentation timingBlocker vs Ứng Kỳ.
- Chưa quyết có hiển thị candidate trên structured card hay không (hiện card KHÔNG render ungKy).
- Chưa tạo Lục Hào provenance ledger (chỉ có format đề xuất).
- Chưa nâng R8.

## 9. Release Statement
**Ứng Kỳ ĐƯỢC RELEASE ở dạng CANDIDATE / NON-OVERRIDING.** Nhãn provenance bắt buộc: "theo tài liệu biên soạn dự án
(spec §6)", **KHÔNG** "cổ thư xác quyết". Classical verification = slice tương lai (G-U1), chưa mở.

## 10. Validation / Phase Boundary
- **runtime: NO · tests: NO · spec: NO · UI/skill/prompt: NO · methodology algorithm: NO.** doc: YES (chỉ file này).
- Regression: **318/318 PASS**. Working tree: chỉ `src/pages/quan-su/*.astro` của luồng VIP khác (KHÔNG stage/chạm).
- Commit chỉ doc này. **KHÔNG push.** KHÔNG tự mở G-U1. STOP.
