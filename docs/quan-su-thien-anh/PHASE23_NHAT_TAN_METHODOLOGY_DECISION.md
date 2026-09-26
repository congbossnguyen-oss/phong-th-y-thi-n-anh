# PHASE 23 — NHẬT TÁN METHODOLOGY DECISION / SPEC LOCK

**Branch:** `quan-su-thien-anh` · **Checkpoint:** `ad3bcbf` (Phase 22A CLOSED).
**Nature:** AUDIT + DECISION ONLY. **Runtime changed: NO. Types changed: NO. Methodology changed: NO.**
Không sửa `src/`, không sửa `getDayRelations()`, không thêm `HaoRelationType`, không implement Nhật Tán,
không suy diễn methodology từ code, không fabricate án lệ, không mở Phase 24.

---

## 1. Checkpoint

- `git rev-parse --short HEAD` = `ad3bcbf`; branch `quan-su-thien-anh`.
- Working tree: chỉ thêm DOC của phase này. Concurrent western-astrology / chart-profile / bát-tự changes là
  luồng khác — KHÔNG đụng, KHÔNG stage.
- Regression baseline: Quan Su + Lục Hào **311/311 PASS** (Phase 20/21/22A). Phase 23 không chạy code nên
  không đổi con số này.

## 2. Scope / Guardrails

| Cho phép | Cấm |
|---|---|
| Đọc spec + runtime | Sửa `src/` bất kỳ file nào |
| Dựng ma trận quyết định | Sửa `getDayRelations()` |
| Liệt kê câu hỏi cho Thầy | Thêm `HaoRelationType "Nhật Tán"` |
| Phân loại G6 | Truyền `isDong` vào engine |
| Viết doc này + commit | Implement Nhật Tán / đổi strength / đổi conclusion / mở Phase 24 |

## 3. Source Inventory (verbatim)

**S1 — `LUAN_QUE_LUC_HAO_SPEC.md §99`:**
> …(3) đặc biệt: hào vượng bị Nhật xung = **ám động** (lợi, không phải suy); hào hưu tù tĩnh bị Nhật xung =
> **Nhật phá** (hại); hào đang động bị Nhật xung = **Nhật tán** (hại).

**S2 — `QUY_TRINH_LUC_HAO_LUAN.md §158`:**
> Đặc biệt: hào **vượng** bị Nhật xung = **ám động** (lợi, không phải suy); hào **hưu tù tĩnh** bị Nhật xung =
> **Nhật phá** (hại); hào **đang động** bị Nhật xung = **Nhật tán** (hại, mất tác dụng động).

**S3 — `luc-hao.ts:411-414` (chú thích engine, trích Chương VI):**
> "Tĩnh hào vượng tướng, bị nhật thần xung làm ám động; tĩnh hào bị hưu tù, bị nhật xung là nhật phá" —
> nhóm "vượng tướng" = Vượng/Tướng; nhóm "hưu tù" = Hưu/Tù/Tử.

**Quan sát nguồn:** S1/S2 liệt **3** trạng thái theo 2 trục KHÁC nhau: {vượng vs hưu-tù} (trục lực) và
{tĩnh vs động} (trục động-tĩnh). S3 (Chương VI, nguồn gốc engine) chỉ nói về hào **tĩnh** — chia theo lực
(vượng-tướng→ám động, hưu-tù→nhật phá) và **không nhắc hào động**. ⇒ "Nhật tán" xuất hiện ở S1/S2 nhưng
**không có** trong đoạn Chương VI mà engine trích. Đây là gốc của khoảng trống.

## 4. Current Runtime Semantics

- `HaoRelationType` (`luc-hao.ts:395-399`): `Sinh | Khắc | Hợp | Xung | Hại | Nhật Phá | Nguyệt Phá |
  Ám Động | Lâm Nhật | Lâm Nguyệt | Nhập Mộ`. **KHÔNG có "Nhật Tán".**
- `getDayRelations(lineChiIndex, lineNguHanh, dayChiIndex, monthVuongSuy)` (`luc-hao.ts:417-436`) —
  **KHÔNG nhận `isDong`**. Nhánh Nhật xung (dòng 430-433):
  ```ts
  if (chiPairMatch(LUC_XUNG_PAIRS, lineChiIndex, dayChiIndex)) {
    out.push({ type: "Xung", source: "DAY", target: "HAO" });
    const vuongTuong = monthVuongSuy === "Vượng" || monthVuongSuy === "Tướng";
    out.push({ type: vuongTuong ? "Ám Động" : "Nhật Phá", source: "DAY", target: "HAO" });
  }
  ```
- Caller: **duy nhất** `luc-hao.ts:636`. Không caller nào truyền động-tĩnh xuống.

⇒ Engine phân loại Nhật xung theo **1 trục** (vượng/suy so với Nguyệt lệnh), bỏ hoàn toàn trục động-tĩnh
mà spec S1/S2 dùng. Không có đường dữ liệu để engine biết hào có đang động hay không tại điểm này.

## 5. Nhật Xung Decision Matrix

Cột: `CASE | CONDITION | SPEC EVIDENCE | STATUS | FACT | ROLE | STRENGTH | CONCLUSION | FUTURE ENGINE NEED`.

| CASE | CONDITION (hào bị Nhật xung) | SPEC EVIDENCE | STATUS | FACT (nhãn engine hiện tại) | ROLE | STRENGTH | CONCLUSION | FUTURE ENGINE NEED |
|---|---|---|---|---|---|---|---|---|
| N1 | Tĩnh + vượng-tướng | S1/S2/S3 đồng thuận | **LOCKED** | `Ám Động` ✅ đúng | contextual | (lợi, không suy) | — | none |
| N2 | Tĩnh + hưu-tù | S1/S2/S3 đồng thuận | **LOCKED** | `Nhật Phá` ✅ đúng | contextual | reduced (Phá) | — | none |
| N3 | Động + hưu-tù | S1/S2 nói "Nhật tán"; S3 im lặng | **METHODOLOGY GAP** | `Nhật Phá` ⚠️ nhãn khác spec | contextual | (spec: "mất tác dụng động") | — | cần `isDong` + relation mới |
| N4 | Động + vượng-tướng | S1/S2 **chồng lấn** (vượng→ám động VÀ động→nhật tán) | **SOURCE AMBIGUITY** | `Ám Động` ⚠️ có thể sai | contextual | ? | — | cần Thầy khóa trước |

**Đọc ma trận:** N1/N2 đã đúng và khóa. N3 là nơi engine gán sai nhãn (`Nhật Phá` thay vì `Nhật Tán`) vì
không thấy `isDong`. N4 là nơi **chính spec mâu thuẫn với chính nó** — không thể implement deterministic.

## 6. Vượng + Động + Nhật Xung (N4 — trọng tâm mâu thuẫn)

S1/S2 đưa 3 mệnh đề song song, mỗi mệnh đề gắn 1 điều kiện đơn:
- "hào **vượng** bị Nhật xung = ám động"
- "hào **đang động** bị Nhật xung = nhật tán"

Một hào **vừa vượng vừa động** thỏa CẢ HAI tiền đề → hai kết luận khác nhau (ám động = lợi; nhật tán =
hại, mất tác dụng động). Spec **không cho** thứ tự ưu tiên giữa hai trục này. Ba khả năng, không cái nào
được nguồn xác nhận:
- (a) Trục động-tĩnh thắng → Nhật Tán (động luôn override).
- (b) Trục lực thắng → Ám Động (vượng luôn override).
- (c) Hai FACT độc lập cùng tồn tại (hào vừa Ám Động vừa Nhật Tán) — cần Thầy xác nhận có hợp lệ về lý.

⇒ **SOURCE AMBIGUITY thật.** Không được tự chọn (a/b/c) = không được tự chế methodology.

## 7. "Nhật Tán" — Definition (theo nguồn, không suy diễn)

Từ S1/S2: Nhật Tán = **hào ĐANG ĐỘNG bị Nhật thần xung → hại, "mất tác dụng động"** (động nhưng không phát
huy được chuyển hóa/tác động của trạng thái động). Khác Nhật Phá (dành cho hào **tĩnh** hưu-tù). Nguồn KHÔNG
định lượng mức giảm lực, KHÔNG nói quan hệ với biến hào, KHÔNG nói tương tác với Không Vong. ⇒ chỉ có định
nghĩa định tính; phần định lượng = OPEN.

## 8. Fact / Role / Strength / Conclusion Separation

Kiến trúc hiện tại (FACT → SYNTHESIS → CONCLUSION → TEMPORAL → AI) cho phép cô lập Nhật Tán ở **tầng FACT**:
- **FACT:** Nhật Tán sẽ là 1 nhãn quan hệ hào↔Nhật (như Ám Động/Nhật Phá) — thuộc `HaoRelation`, surface qua
  `synthesizeHaoTimeFacts` (`hao-time-relations.ts`).
- **ROLE:** không đổi (Dụng/Nguyên/Kỵ/Cừu xác định độc lập với Nhật xung).
- **STRENGTH:** `canLucHao` hiện đọc Phá vào `reduced` (giữ base). Nhật Tán CÓ vào `reduced` hay không = **chờ
  Thầy** (Q4). KHÔNG tự thêm.
- **CONCLUSION:** `ketLuanSuViec` đọc `currentState.effective`. Nếu Nhật Tán không đụng trục lực nào thì
  conclusion không đổi (fact-only, giống Cừu Thần Phase 16). Chờ Thầy (Q5).

⇒ Đường an toàn khi được khóa: thêm Nhật Tán như **FACT-only** trước (giống Cừu Thần), chỉ nối vào STRENGTH/
CONCLUSION nếu Thầy khóa hiệu ứng định lượng.

## 9. Precedence Audit

- Spec §99/§158 chỉ khóa thứ tự **xét quan hệ** (Nguyệt trước → Nhật sau), KHÔNG khóa thứ tự **giữa hai trục**
  vượng-suy vs động-tĩnh trong cùng biến cố Nhật xung. Đây trùng bản chất với **G5 (multi-adverse
  precedence — OPEN)**: không có nguồn cho "collapse" nhiều tín hiệu.
- Kiến trúc đa-trục của `canLucHao` (base/effective/reduced/…) né được nhu cầu precedence cho STRENGTH. Nhưng
  **nhãn FACT** của N4 buộc phải chọn 1 (hoặc cho phép 2) — đây là quyết định của Thầy, không phải của kiến
  trúc.

## 10. Future Engine Representation (KHI được khóa — KHÔNG làm ở Phase 23)

1. Thêm `"Nhật Tán"` vào `HaoRelationType` (`luc-hao.ts:395`).
2. Thêm tham số `isDong: boolean` vào `getDayRelations` (417) + truyền tại caller (636).
3. Nhánh Nhật xung: chọn nhãn theo ma trận Thầy khóa cho N3/N4.
4. Surface qua `hao-time-relations.ts`; (tuỳ Thầy) nối STRENGTH/CONCLUSION.
5. Test: thêm case N3/N4 vào `__hao-time-relations` (+ `__can-luc-hao` nếu đụng strength).

Đây là **sửa engine sacred** + relation mới → BẮT BUỘC phase riêng sau khi khóa, ngoài Phase 23.

## 11. G6 — Final Classification

**PRIMARY STATUS: SOURCE AMBIGUITY / UNLOCKED METHODOLOGY.**
Lý do chính (N4): spec S1/S2 tự mâu thuẫn cho hào **vượng + động** — không có nguồn xác định trục nào thắng.

**Secondary: METHODOLOGY GAP (engine ↔ spec) tại N3.** Hào **động + hưu-tù** hiện bị engine gán `Nhật Phá`
trong khi spec gọi là `Nhật Tán`; sai vì `getDayRelations` không thấy `isDong`. Đây là gap có thể sửa
deterministic NGAY khi N4 được khóa (N3 tự nó không mơ hồ — chỉ thiếu đường dữ liệu + relation).

**Impact hiện tại: LOW.** "Nhật Tán" chưa có trong `HaoRelationType`, downstream chưa tiêu thụ; nhãn sai chỉ
ở lớp FACT hào-động-bị-Nhật-xung, chưa lan vào strength/conclusion. Nhưng nhãn N3/N4 **có thể sai** → phải
khóa trước khi bất kỳ ai dựa vào nhãn Nhật xung cho hào động.

**Decision: STOP — không sửa runtime.** Chờ Thầy trả lời Q1–Q5 (§12), rồi mở phase engine riêng.

## 12. Decision Required From Thầy

- **Q1.** Hào **vượng + đang động** bị Nhật xung = **Ám Động** hay **Nhật Tán** hay **cả hai** (2 FACT song
  song)? (giải N4 — hiện SOURCE AMBIGUITY)
- **Q2.** Nếu không phải "cả hai": trục nào ưu tiên — **động-tĩnh** (động→Nhật Tán luôn) hay **vượng-suy**
  (vượng→Ám Động luôn)? (khóa precedence cho N4)
- **Q3.** "Nhật Tán" có là **`HaoRelationType` độc lập** không, hay chỉ là ghi chú của Nhật Phá cho hào động?
- **Q4.** Nhật Tán ảnh hưởng **STRENGTH** thế nào — vào `reduced` (giữ base, như Phá), hay là FACT-only không
  đụng trục lực?
- **Q5.** Nhật Tán ảnh hưởng **CONCLUSION** (`ketLuanSuViec`) hay chỉ dừng ở FACT/ROLE (như Cừu Thần
  Phase 16)?

Không có 5 câu trả lời này thì **không thể** implement deterministic (score-free) — mọi lựa chọn thay Thầy
đều là tự chế methodology.

## 13. Phase 23 Boundary

- **runtime changed: NO** · **types changed: NO** · **`getDayRelations` changed: NO** · **`HaoRelationType`
  changed: NO** · **strength/conclusion/score changed: NO** · **test logic changed: NO**.
- **doc changed: YES** — chỉ file này (`docs/quan-su-thien-anh/PHASE23_NHAT_TAN_METHODOLOGY_DECISION.md`).
- **Nhật Tán: KHÔNG implement.** **Phase 24: KHÔNG mở.**
- Commit: `docs(quan-su): audit Nhat Tan methodology`. **KHÔNG push.**
- Cập nhật liên quan: G6 trong PHASE21/22A chuyển từ "BLOCKED (chưa audit)" → "AUDITED, chờ Thầy khóa Q1–Q5"
  (không sửa ngược file cũ; ghi nhận ở đây).
