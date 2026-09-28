# Ứng Kỳ — Primary-Source Provenance Audit (C1)

**Branch:** `quan-su-thien-anh` · **HEAD:** `d021984` · **Nature:** RESEARCH + AUDIT ONLY. KHÔNG sửa runtime/test/API/UI/
skill/prompt/methodology lock, KHÔNG reopen Phase 25/26, KHÔNG push. Baseline 318/318.

---

## 1. Scope
Nâng provenance cho 8 quy luật Ứng Kỳ (R1–R8) + R-TH (Tam Hợp `ungKyChi`) đang implement. Chỉ dùng **evidence trong
repo** (không web research); nếu repo thiếu primary → ghi **DATA GAP** + liệt kê nguồn cần bổ sung. Phân biệt nghiêm ngặt
**"SOURCE SAYS X"** vs **"QUÂN SƯ DERIVES Y FROM X"**.

## 2. Existing Locked State (không đụng)
Phase 25/26 STABLE/LOCKED; movementEfficacy FACT-only không tạo Ứng Kỳ; Nhật Phá Model A; Tuế Phá→reduced; reduced arch;
timingBlocker ≠ Ứng Kỳ; Ứng Kỳ = candidate/non-overriding (không override conclusion). Runtime = 2 engine
(`luc-hao-ung-ky.ts` + `ung-ky-synthesis.ts`), no legacy.

## 3. Source Inventory (trong repo)
| Nguồn in-repo | Loại | Ứng Kỳ content |
|---|---|---|
| `docs/quan-su-thien-anh/LUAN_QUE_LUC_HAO_SPEC.md` **§6** | **Compiled methodology table** (bản dịch từ ~13 sách dự án — Vương Hổ Ứng, Minh Việt…; **sách gốc KHÔNG có trong repo**) | Bảng 8-9 dòng "Trạng thái Dụng → Ứng Kỳ" + 4 "Bổ sung quan trọng (không có trong bảng gốc)" |
| `src/lib/quan-su/kien-thuc/quy-trinh.md` | Compiled procedure | CHỈ nhắc tiến/thoái ở ngữ cảnh LỰC (dòng 51), **KHÔNG** có rule Ứng Kỳ |
| `src/lib/quan-su/kien-thuc/an-le/` (9 chunk) | Án lệ (prose case) | 2/9 chunk nhắc thuật ngữ Ứng Kỳ; chunk-04 có ca Tiến/Thoái (nguồn R8) |
| `docs/quan-su-thien-anh/QUY_TRINH_LUC_HAO_LUAN.md` | Compiled procedure | (Ứng Kỳ rải rác, không phải bảng rule chuyên biệt) |
- **KHÔNG có văn bản cổ Hán (增删卜易/卜筮正宗/易冒 应期章) trong repo.** Ứng Kỳ terms ngoài spec chỉ xuất hiện ở module
  **daliuren** (hệ khác) + OCR luận-số (không liên quan). **KHÔNG có provenance ledger cho Lục Hào** (chỉ daliuren có
  `DA_LIU_REN_PROVENANCE.md`).
- ⇒ **Primary-source classical cho MỌI rule Ứng Kỳ = DATA GAP** (in-repo chỉ có compilation/án-lệ, không verbatim cổ thư).

## 4. Rule-by-Rule Matrix (R1–R8)
| Rule | Runtime trigger (luc-hao-ung-ky.ts) | Candidate output | In-repo source | Exact support | Class | Gap |
|---|---|---|---|---|---|---|
| **R1** động → Trị/Hợp | `dong`: `them(Trị,"dong")` + Hợp ("động chờ hợp") | chi Trị hào động (+ chi Hợp) | §6 bảng gốc: "Động → Trị của hào động; an tĩnh chờ → Hợp" | Bảng nêu **trực tiếp** | **B** | verbatim cổ = DATA GAP |
| **R2** tĩnh → Trị/Xung | `tinh`: `them(Trị,"tinh")` + Xung ("tĩnh chờ xung") | chi Trị + chi Xung | §6 bảng gốc: "Tĩnh → Trị hoặc Xung" | trực tiếp | **B** | như trên |
| **R3** Không Vong → Điền Thực/Xuất Không | gate `temporalExistence==="EMPTY"` → Điền Thực/Xung Không | chi trùng / chi xung | §6 bảng gốc: "Tuần Không → Xung Không / Điền Thực" | trực tiếp | **B** | như trên |
| **R4** Nguyệt Phá → Điền Thực/Qua Tháng | `nguyet-pha` → Điền Thực/Hợp/Qua Tháng | chi trùng / tháng kế | §6 bảng gốc: "Nguyệt Phá → Điền Thực, Hợp, qua tháng" | trực tiếp | **B** | như trên |
| **R5** Nhập Mộ → Xung Mộ | gate `hidden` → Xung Mộ (`canAudit:true`) | chi xung Mộ | §6 bảng gốc: "Nhập Mộ → Xung Mộ" | **rule** nêu trực tiếp; **CÁCH XÁC ĐỊNH Nhập Mộ** còn nợ audit engine | **B (rule) / D (detection)** | §6.6 + engine TODO |
| **R6** bị Hợp → Xung Hợp | `bi-hop` → Xung Hợp | chi xung cái đang hợp | §6 bảng gốc: "bị Hợp giữ chân → Xung Hợp" | trực tiếp | **B** | verbatim cổ = DATA GAP |
| **R7** hưu/tù gặp Trường Sinh | `huu-tu-gap-truong-sinh` → cung Trường Sinh (+ caveat suy kiệt) | chi Trường Sinh | §6 bảng gốc: "Hưu tù gặp Trường Sinh → cung TS; suy kiệt thì sinh = xấu" | trực tiếp (cả caveat) | **B** | như trên |
| **R8** tiến/thoái | `tien-than`/`thoai-than` → Trị/Xung + biến | chi biến/mốc | **KHÔNG có trong §6 bảng**; code comment (:314-316) trỏ **án lệ chunk-04** (ca "Bệnh viện chữa…") + "**suy đối xứng cho Tiến Thần**" | Án-lệ 1 chiều (Thoái) + **Quân Sư suy đối xứng** (Tiến) | **C** | không phải rule §6; là methodology từ 1 án lệ |

**Đọc matrix:** R1–R7 = **B** (bảng §6 in-repo nêu rule trực tiếp, NHƯNG §6 là **compilation dịch**, sách gốc + verbatim
cổ thư KHÔNG có trong repo → không đủ **A**). R5 detection = **D** (Nhập Mộ engine nợ audit). R8 = **C** (án-lệ + suy diễn
đối xứng, KHÔNG phải rule §6). **KHÔNG rule nào đạt A** (thiếu verbatim primary).

## 5. R-TH — Tam Hợp `ungKyChi`
- Runtime: `phanLoaiSauTamHop` (luc-hao-tam-hop-cuc.ts) trả `ungKyChi` = chi hào bệnh / hào an tĩnh / hào thiếu (tùy thể):
  "ngày/tháng trùng Chi hào an tĩnh", "gặp Chi Phục"…
- Source: **Thầy Phase 10C methodology** (6 thể Tam Hợp — chat/methodology lock), KHÔNG phải cổ thư verbatim.
- Semantics: **ĐÚNG là "Ứng Kỳ chi"** (chi kích hoạt/hoàn thành cục), KHÔNG chỉ biến trung gian. Implementation KHÔNG vượt
  evidence của 10C (mỗi thể có ungKyChi xác định trong methodology 10C).
- Class: **C** (Quân Sư/Thầy methodology 10C). verbatim cổ = DATA GAP.

## 6. R5 — Nhập Mộ / canAudit
- **Rule "Xung Mộ → Ứng Kỳ":** CÓ trong §6 bảng gốc (B).
- **Cách xác định "Nhập Mộ" hiện tại:** engine còn nợ audit (TODO ở luc-hao.ts — Nhập Mộ 4 dạng). `canAudit:true` biểu thị
  **độ tin cậy thấp hơn** cho candidate Xung-Mộ vì engine chưa chốt Nhập Mộ đầy đủ.
- ⇒ **`canAudit` = ENGINE Nhập-Mộ GAP, KHÔNG phải source gap của rule Xung Mộ.** Rule có source (B); detection có gap (D).
- **KHÔNG tự giải canAudit** (cần audit engine Nhập Mộ riêng).

## 7. Hóa Mộ → XUAT_MO
- Runtime (Phase 14): **CỐ Ý KHÔNG** auto-tạo `XUAT_MO` từ `Nhập Mộ (CHANGED_YAO)` — vì **thiếu rule nguồn** khẳng định
  "Hóa Mộ (biến vào Mộ) → Ứng Kỳ Xuất Mộ".
- In-repo source cho auto-create: **KHÔNG có** (§6 chỉ nói Nhập Mộ tĩnh → Xung Mộ; không nói Hóa Mộ động).
- Class: **D / BLOCKED** (methodology gap). **Giữ nguyên BLOCKED, KHÔNG thêm rule.**

## 8. Implementation-vs-Source Alignment
| Rule | Impl khớp source? | Mismatch/finding |
|---|---|---|
| R1–R4, R6, R7 | ✅ khớp §6 bảng gốc | không |
| R5 | ✅ rule khớp; ⚠ detection (canAudit) chưa chốt | ghi finding, KHÔNG patch |
| R8 | ⚠ **không có trong §6**; từ án lệ + suy đối xứng | ghi finding; impl KHÔNG vượt án lệ theo hướng Thoái, nhưng hướng Tiến là **Quân Sư inference** |
| R-TH | ✅ khớp 10C methodology | không |
| Bổ sung (DateType/Khắc/Độc Phát/precedence) | §6 tự ghi "không có trong bảng gốc" | **C** (Quân Sư addition, minh bạch) |
- **KHÔNG có code mismatch cần sửa.** Các điểm C/D là **provenance status**, KHÔNG phải bug. KHÔNG patch.

## 9. Classification Summary
| Class | Rules |
|---|---|
| **A** (verbatim primary đủ) | **(none)** — không có cổ thư trong repo |
| **B** (in-repo compiled source nêu rule trực tiếp; verbatim cổ = DATA GAP) | R1, R2, R3, R4, R6, R7, + R5(rule) |
| **C** (Quân Sư/Thầy methodology) | R8, R-TH, các "Bổ sung khi code" |
| **D** (liên quan nhưng chưa đủ) | R5 detection (Nhập Mộ engine gap), Hóa Mộ→XUAT_MO |
| **E** (conflict/blocked) | (none) |

## 10. Evidence Gaps (chính xác nguồn cần bổ sung)
1. **Verbatim classical primary cho R1–R8** — cần nạp **应期章/应期 sections** của: 《增删卜易》(应期章), 《卜筮正宗》
   (十八问答/应期), 《易冒》(应期). Hiện **KHÔNG có trong repo** → DATA GAP (nâng B→A cần các text này).
2. **R8 tiến/thoái**: chỉ có 1 án lệ (chunk-04) + suy đối xứng → cần nguồn rule tường minh cho tiến/thoái Ứng Kỳ.
3. **R5 detection**: engine Nhập Mộ 4-dạng còn nợ audit (canAudit) — engine gap, không phải source.
4. **Hóa Mộ→XUAT_MO**: cần nguồn khẳng định (hiện BLOCKED).
5. **Validation**: 0/153-163 án lệ đủ 6-hào để replay Ứng Kỳ deterministic — DATA GAP (Phase 14/20).
6. **Không có provenance ledger cho Lục Hào** (chỉ daliuren có).

## 11. Recommended Next Methodology Gate
- **G-U1 (research):** nạp verbatim 应期 của 增删卜易/卜筮正宗/易冒 → đối chiếu R1–R7 (mục tiêu B→A), R8 (C→B nếu có rule
  tiến/thoái). Đây là **web/primary-text research slice** (giống cách R3 Nhật Xung đã làm với 增删卜易/易冒) — CHỜ owner.
- **G-U2:** sau research, mở gate khóa R8 + Hóa Mộ→XUAT_MO + R5 canAudit (chỉ khi có nguồn).
- **KHÔNG tự làm G-U1/G-U2 ở đây.**

## 12. Provenance Ledger Proposal (KHÔNG tạo architecture)
Chưa có ledger cho Lục Hào. **Đề xuất format** (theo tiền lệ `DA_LIU_REN_PROVENANCE.md`), CHỈ đề xuất — KHÔNG tạo file:
`| RuleID | Claim | Source (book/chương/juan) | Verbatim? | Class A-E | Runtime symbol | Test |`
Khi có primary text (G-U1) mới điền. Hiện mọi entry Ứng Kỳ = B/C/D như §9.

## 13. Explicit Non-Decisions
- KHÔNG nâng bất kỳ rule nào lên A (thiếu verbatim primary).
- KHÔNG sửa runtime/test/UI/skill/prompt. KHÔNG giải canAudit. KHÔNG thêm Hóa Mộ→XUAT_MO. KHÔNG tạo ledger file.
- KHÔNG reopen Phase 25/26. KHÔNG chọn/bắt đầu G-U1/G-U2.

## 14. Recommendations for DQ-U2 / DQ-U3
- **DQ-U2** (candidate/non-overriding có đủ release, hay nâng provenance trước?): **Đủ để release AS-IS** — Ứng Kỳ là
  candidate không override conclusion, provenance **B/C minh bạch** (compiled/methodology, KHÔNG fabricate). Nhưng **KHÔNG
  được quảng bá "đúng cổ điển"** cho R1–R8 tới khi G-U1 (verbatim) hoàn tất. Nhãn hiện tại nên là "theo tài liệu biên
  soạn dự án", không phải "cổ thư".
- **DQ-U3** (R5 canAudit + Hóa Mộ→XUAT_MO): **GIỮ conservative** — R5 rule dùng được (B) nhưng giữ `canAudit` cho tới khi
  audit engine Nhập Mộ; Hóa Mộ→XUAT_MO giữ **BLOCKED** (D) tới khi có nguồn. KHÔNG khóa vội.

## 15. Phase Boundary + Validation
- **runtime: NO · tests: NO · spec: NO · UI/skill/prompt: NO · methodology: NO.** doc: YES (chỉ file này).
- Regression: chạy để xác nhận read-only (§báo cáo). Commit chỉ doc này. **KHÔNG push.** STOP.
