# Phase 25A — Nhật Xung Engine Design Audit

**Branch:** `quan-su-thien-anh` · **Nature:** DESIGN AUDIT ONLY.
**runtime: NO · methodology: NO · spec: NO · types: NO · tests: NO.**
Không sửa `src/`, không sửa `luc-hao.ts`, không thêm enum/field/relation, không implement 散/愈动, không mở 25B.

---

## 1. Checkpoint
- HEAD = `d5ac608` ✓ · branch `quan-su-thien-anh` ✓ · Phase 24 COMPLETE, Nhật Xung LOCKED (profile 《增删卜易》).
- Working tree: concurrent western-astrology / chart-profile / dai-cat-loi changes (nhiều file `src/lib/western-astrology/*`,
  `src/lib/chart-profile/*`, `src/pages/dai-cat-loi/*`, `db/schema.ts`, `package*.json`…) = **luồng khác, KHÔNG đụng/stage.**
  Phase 25A chỉ thêm 1 doc.

## 2. Current Architecture
Pipeline Quân Sư (score-free): `canLucHao` (strength) → `ky-nguyen-dung` → `ket-luan-su-viec` → `ung-ky`; FACT layers:
`hinh`, `cuu-than`, `hao-time-relations`; tất cả surface qua `buildAdvisoryReport` → `userPrompt`.
Quan hệ hào↔Nhật/Nguyệt do **engine gốc `luc-hao.ts`** tính sẵn vào `HaoInfo.relations` (single source), các tầng
Quân Sư **đọc lại** (không tính lại).

**Lưu ý quan trọng:** `buildAdvisoryReport` còn gọi **`chamDiem` (advisory-engine.ts:679)** — một bộ **CHẤM ĐIỂM
LEGACY** (`diem=50 ± delta`) map relation→điểm (dòng 291-301). Đây là tầng CŨ (không thuộc chuỗi deterministic
canLucHao→ket-luan). Nó dùng chuỗi `if/else if` **KHÔNG exhaustive, KHÔNG default** → relation lạ bị **bỏ qua
(điểm 0)**. (Ảnh hưởng tới quyết định FACT-only ở §8.)

## 3. Current HaoRelation Model (`luc-hao.ts`)
```ts
export type HaoRelationType =
  | "Sinh" | "Khắc" | "Hợp" | "Xung" | "Hại"
  | "Nhật Phá" | "Nguyệt Phá" | "Ám Động"
  | "Lâm Nhật" | "Lâm Nguyệt"
  | "Nhập Mộ";                          // (luc-hao.ts:395-399)
export interface HaoRelation { type: HaoRelationType; source: "DAY"|"MONTH"|"YAO"|"CHANGED_YAO"; target:"HAO"; relatedYao?: number }
```
- **Flat union**; các trạng thái Nhật-xung (Ám Động / Nhật Phá) đã là **sibling phẳng** cùng cấp, do `getDayRelations`
  phát ra. **KHÔNG có** "Nhật Tán", **KHÔNG có** "愈动".
- `VuongSuy = "Vượng" | "Tướng" | "Hưu" | "Tù" | "Tử"` (luc-hao.ts:259). Nhóm vượng-tướng = {Vượng,Tướng}; hưu-tù =
  {Hưu,Tù,Tử} (theo chú thích engine 411-416).
- **KHÔNG có** exhaustive switch / `Record<HaoRelationType,…>` / `: never` trên relation type ở bất kỳ đâu (grep xác
  nhận; `: never` duy nhất ở `ai-video/*` không liên quan). **KHÔNG có** zod/enum schema liệt kê tên relation.
  ⇒ Thêm union member là **backward-compatible** (consumer dùng so-khớp chuỗi `.some(r=>r.type===X)`, bỏ qua type lạ).

## 4. getDayRelations() Audit
```ts
function getDayRelations(lineChiIndex, lineNguHanh, dayChiIndex, monthVuongSuy): HaoRelation[] {  // luc-hao.ts:417
  ...
  if (chiPairMatch(LUC_XUNG_PAIRS, lineChiIndex, dayChiIndex)) {
    out.push({ type: "Xung", source: "DAY", target: "HAO" });
    const vuongTuong = monthVuongSuy === "Vượng" || monthVuongSuy === "Tướng";
    out.push({ type: vuongTuong ? "Ám Động" : "Nhật Phá", source: "DAY", target: "HAO" });  // :433
  }
}
```
- **Vấn đề đã biết:** hàm **không nhận `isDong`** → chỉ phân 2 nhãn theo vượng/suy, bỏ trục động/tĩnh. Hiện tại hào
  **động** bị Nhật xung bị gán nhầm "Ám Động"(nếu vượng)/"Nhật Phá"(nếu suy) — sai theo Phase 24.
- **Caller: DUY NHẤT 1** — `luc-hao.ts:636` (trong `.map` dựng `HaoInfo`). Tại đó **đã có sẵn**:
  - `dongPositions.includes(haoSo)` (chính là `isDong` của hào — cùng object literal),
  - `vuongSuy = monthNguHanh ? vuongSuyOf(monthNguHanh, nguHanh) : …` (truyền vào chính là `monthVuongSuy`).
- **Smallest safe input change = Design 4A:** thêm tham số `isDong: boolean` và truyền `dongPositions.includes(haoSo)`.
  Vì chỉ 1 caller → thay đổi chữ ký an toàn tuyệt đối, không lan.
  - 4B (truyền cả `HaoInfo`): dư thừa, HaoInfo chưa dựng xong tại điểm gọi (đang trong literal) → không tự nhiên.
  - 4C (context object): over-engineer cho 1 caller.
  - ⇒ **4A** thắng.

## 5. Vượng/Suy Input — nguồn lực authoritative
- **Nguồn DUY NHẤT:** `HaoInfo.vuongSuy = vuongSuyOf(monthNguHanh, nguHanh)` (theo Nguyệt lệnh) — đã tính 1 lần ở
  caller, đã truyền vào `getDayRelations` dưới tên `monthVuongSuy`. **KHÔNG tạo phép tính lực thứ hai.**
- `isDong`: từ `dongPositions` (đã có ở caller). ⇒ Cả 2 input cần cho N1–N4 **đã tồn tại tại call site**; không
  cần tính mới, không cần đọc chéo tầng khác.

## 6. N1–N4 Design Matrix
| CASE | INPUTS (đủ tại call site) | CURRENT OUTPUT | REQUIRED OUTPUT | REPRESENTATION (đề xuất) | DOWNSTREAM CONSUMERS |
|---|---|---|---|---|---|
| N1 | !isDong + vượng/tướng + Xung(DAY) | `Ám Động` | **Ám Động** | giữ nguyên | hao-time (AM_DONG), chamDiem(+5), tam-hop `laAmDong` (đã guard !isDong) |
| N2 | !isDong + hưu/tù + Xung(DAY) | `Nhật Phá` | **Nhật Phá** | giữ nguyên | hao-time (PHA), chamDiem(-10), tam-hop `laBenh` |
| N3 | isDong + hưu/tù + Xung(DAY) | `Nhật Phá` ⚠ sai ô | **Nhật Tán / 散** | **type mới** `"Nhật Tán"` | (mới) hao-time kind TAN; chamDiem bỏ qua ⇒ FACT-only |
| N4 | isDong + vượng/tướng + Xung(DAY) | `Ám Động` ⚠ sai ô | **愈动 / Xung càng động** | **type mới** `"愈动"` (tên chốt ở 25B) | (mới) hao-time kind DU_DONG; chamDiem bỏ qua ⇒ FACT-only |
| Excep | lâm Nguyệt (chi===monthChi) + Xung(DAY) | — | **không 散** (不散) | (xem §7) | — |

## 7. Nguyệt-Kiến Exception (爻逢月建，日冲而不散)
- Engine biểu diễn Nguyệt kiến = relation **"Lâm Nguyệt"** (`getMonthRelations`, luc-hao.ts:449, khi
  `lineChiIndex===monthChiIndex`). Hào lâm Nguyệt → đồng hành Nguyệt → `vuongSuyOf` = **"Vượng"**.
- **Điều kiện chính xác của ngoại lệ:** hào có `chiIndex === monthChiIndex` (lâm Nguyệt kiến).
- **Hệ quả logic:** hào lâm Nguyệt luôn **vượng** ⇒ nếu động + Nhật xung thì rơi **N4 = 愈动** (KHÔNG phải 散) một
  cách **tự nhiên** theo nhánh vượng. Tức ngoại lệ "不散" **đã được nhánh vượng bao phủ** — không cần code riêng,
  chỉ cần đảm bảo `vuongSuy` phản ánh đúng lâm Nguyệt (nó có). Không tồn tại ca "lâm Nguyệt nhưng hưu-tù".
- **Ngoại lệ này:** (a) **triệt tiêu 散** cho hào lâm Nguyệt ✓ (qua nhánh vượng→愈动); (b) KHÔNG tạo relation khác;
  (c) ảnh hưởng strength/conclusion = **OPEN** (nguồn chỉ khóa "不散", không nói thêm) → giữ mở cho phase sau.
- 25B chỉ cần **1 test bảo chứng (T5)** rằng hào lâm Nguyệt + động + Nhật xung KHÔNG ra 散 (ra 愈动).

## 8. Downstream Consumer Audit (mọi nơi đọc relations)
| File:vị trí | Đọc gì | Có map →strength/reduced/conclusion? | Ảnh hưởng khi thêm N3/N4 |
|---|---|---|---|
| `advisory-engine.ts:291-301` `chamDiem` | if/else theo type | **CÓ (điểm, LEGACY)**: Ám Động+5, Nhật Phá-10, Nguyệt Phá-14, Sinh+7… | type mới **rơi khỏi if/else → điểm 0** (FACT-only, KHÔNG tự thêm nghĩa) |
| `advisory-engine.ts:117,221-222` | `.some(Nguyệt/Nhật Phá)` (sạch/booleans) | không | không (type mới không match) |
| `hao-time-relations.ts:100-107` `specialRelations` | `has("Ám Động"/"Nhật Phá"/…)` | không (FACT surface) | **cần thêm** kind TAN/DU_DONG để **surface** N3/N4 (nếu không sẽ im lặng) |
| `luc-hao-tam-hop-cuc.ts:188` `laBenh` | Nguyệt Phá/Nhật Phá/Nhập Mộ | qualitative "bệnh" | không đổi; việc 散 có tính "bệnh" không = **OPEN**, KHÔNG tự thêm |
| `luc-hao-tam-hop-cuc.ts:202` `laAmDong` | `!isDong && "Ám Động"` | qualitative | không đổi (đã guard !isDong) |
| `luc-hao-ung-ky.ts:174,185…` | Nguyệt Phá, Lâm Nhật/Nguyệt, Sinh | timing | không (không đọc Ám Động/Nhật Phá ngày) |
| `luc-hao-tien-thoai-than.ts:104` | Nguyệt Phá (hào biến) | qualitative | không |
| `prompt.ts:249` | câu guardrail hiển thị "Ám Động≠Nhật Phá" | không | (tuỳ chọn) cập nhật thành 4 trạng thái |

**Serialize:** relations serialize dạng chuỗi thuần (không schema/enum) → thêm giá trị mới **không phá** serialization/API.
**Kết luận §8:** KHÔNG có mapping strength/conclusion **đã khóa** cho 散/愈动. `chamDiem` là điểm legacy và sẽ **tự bỏ
qua** type mới. ⇒ **Khuyến nghị FACT-only cho 25B**: N3/N4 xuất hiện như relation + surface ở hao-time, **KHÔNG** thêm
nhánh điểm, **KHÔNG** đụng canLucHao/ket-luan. Mapping lực/kết luận = phase sau khi có evidence.

## 9. Backward Compatibility
- Không exhaustive switch / `Record<HaoRelationType>` / schema enum ⇒ thêm union member **không gãy** compile, UI, API,
  serialization.
- **Test hiện tại:** các test `__can-luc-hao` / `__hao-time-relations` inject relation **thủ công** (`rel("Ám Động")`,
  `rel("Nhật Phá")`) — **không chạy `getDayRelations`** trên hào động ⇒ **KHÔNG gãy** khi đổi nhãn engine.
  - **Rủi ro thật (cần rà ở 25B):** test nào chạy **full engine** (`fullCast`/`buildAdvisoryReport`) trên fixture có
    hào **ĐỘNG đồng thời Nhật-xung** rồi assert "Ám Động"/"Nhật Phá" — nhãn sẽ đổi sang 愈动/散. Ứng viên: `__golden-e2e`
    (rà từng fixture G1–G16/A–J). Nếu có, cập nhật kỳ vọng cho đúng methodology mới (đây là sửa test đúng, không phải
    hồi quy).
- Không tìm thấy consumer nào **yêu cầu chính xác chỉ {Ám Động, Nhật Phá}** kiểu loại trừ.

## 10. Phase 25B Test Plan (thiết kế, CHƯA viết)
| Test | Dựng | Kỳ vọng |
|---|---|---|
| T1 | tĩnh + vượng/tướng + Nhật xung | relation `Ám Động` (giữ) |
| T2 | tĩnh + hưu/tù + Nhật xung | relation `Nhật Phá` (giữ) |
| T3 | **động** + hưu/tù + Nhật xung | relation `Nhật Tán/散` (KHÔNG `Nhật Phá`) |
| T4 | **động** + vượng/tướng + Nhật xung | relation `愈动` (KHÔNG `Ám Động`) |
| T5 | lâm Nguyệt + động + Nhật xung | KHÔNG `散` (ra `愈动`) — ngoại lệ 不散 |
| T6 | không Nhật xung (control) | không sinh 4 nhãn trên |
| T7 | tĩnh control cho T3/T4 | tĩnh → Ám Động/Nhật Phá, không 散/愈动 |
| T8 | downstream FACT-only | chamDiem **không** đổi điểm vì 散/愈动; hao-time **surface** TAN/DU_DONG |
- **Regression bắt buộc:** chạy lại toàn bộ relation cũ (Sinh/Khắc/Hợp/Xung/Hại/Nguyệt Phá/Ám Động/Nhật Phá/Lâm/Nhập Mộ)
  qua `getDayRelations`/`getMonthRelations` + suite Quân Sư hiện có (297) phải xanh (trừ các assert full-engine động+xung
  được cập nhật đúng ở T3/T4).

## 11. Recommended Design
**DESIGN A + 4A + FACT-only.** Cụ thể:
1. Thêm **2 sibling phẳng** vào `HaoRelationType`: `"Nhật Tán"` và nhãn N4 (đề xuất `"愈动"` hoặc gloss `"Xung Càng
   Động"` — **chỉ là quyết định đặt tên**, chốt ở 25B; giữ đúng nghĩa 愈动, không phát minh nghĩa mới).
2. Thêm tham số `isDong: boolean` vào `getDayRelations` (chỉ 1 caller), phân nhánh:
   - `!isDong` → `vuongTuong ? "Ám Động" : "Nhật Phá"` (như cũ, N1/N2).
   - `isDong` → `vuongTuong ? "愈动" : "Nhật Tán"` (mới, N4/N3).
3. `hao-time-relations.ts`: thêm 2 `HaoTimeKind` (`TAN`, `DU_DONG`) + surface trong `specialRelations` để 2 trạng thái
   mới **hiện** ở tầng FACT.
4. **KHÔNG** thêm nhánh điểm ở `chamDiem`, **KHÔNG** đụng `canLucHao`/`ket-luan` → giữ FACT-only.

**Vì sao:**
- **Khớp methodology:** 4 ô N1–N4 = 4 relation phẳng, đúng phân biệt tĩnh/động × vượng/suy đã khóa.
- **Ít xáo trộn nhất:** dùng lại đúng khuôn "sibling phẳng" mà Ám Động/Nhật Phá đang theo; chỉ 1 caller; không schema;
  không exhaustive consumer.
- **Giữ phân biệt ngữ nghĩa:** 散 (động-suy) ≠ Nhật Phá (tĩnh-suy); 愈动 (động-vượng) ≠ Ám Động (tĩnh-vượng).
- **Không đóng cứng strength/conclusion sớm:** chamDiem tự bỏ qua; canLucHao/ket-luan không đọc 2 type mới → mapping
  lực/kết luận để mở, đúng ranh giới Phase 24.

*(Không chọn Design B/C — thêm field `state`/parent-relation làm phình `HaoRelation`, phá khuôn phẳng hiện có, tăng
serialization/consumer surface, không có lợi ngữ nghĩa. Không có Design D "kiến trúc sẵn có biểu diễn được mà không đổi
type" — vì 2 trạng thái này chưa tồn tại dưới bất kỳ dạng nào.)*

## 12. Exact Implementation Scope (cho 25B — CHƯA làm)
**Files SẼ đổi:**
- `src/lib/luc-hao.ts` — (a) `HaoRelationType` +2; (b) `getDayRelations` +param `isDong` + nhánh; (c) caller :636 truyền
  `dongPositions.includes(haoSo)`. **(ENGINE SACRED — diff tối thiểu, chỉ nhánh Nhật-xung.)**
- `src/lib/quan-su/hao-time-relations.ts` — +2 `HaoTimeKind` + surface.
- Tests: `__hao-time-relations.test.ts` (T1–T8), có thể `__can-luc-hao.test.ts`; rà + cập nhật `__golden-e2e.test.ts`
  nếu fixture có động+日冲.
- (Tuỳ chọn) `prompt.ts:249` — mở rộng câu guardrail thành 4 trạng thái.

## 13. Explicit Non-Scope (25B MUST NOT change)
- `can-luc-hao.ts` (strength) — KHÔNG map 散/愈动 vào lực.
- `ket-luan-su-viec.ts` (conclusion) — KHÔNG map vào kết luận.
- `chamDiem` (advisory-engine.ts) — KHÔNG thêm nhánh điểm cho type mới (giữ score-neutral).
- `ky-nguyen-dung`, `ung-ky`, `hinh-relations`, `cuu-than`, `tam-hop-cuc`, `tien-thoai-than` — KHÔNG đụng.
- `LUAN_QUE_LUC_HAO_SPEC.md` — đã khóa Phase 24, KHÔNG sửa.
- Ngoại lệ Nguyệt kiến: KHÔNG thêm nhánh code riêng (đã bao bởi nhánh vượng) — chỉ test bảo chứng.

## 14. Phase Boundary
- **runtime changed: NO · methodology changed: NO · spec changed: NO · types changed: NO · tests changed: NO.**
- **doc changed: YES** — chỉ file này.
- **Regression (read-only, thực chạy):** `npx vitest run src/lib/quan-su src/lib/serial-tien-golden.test.ts` →
  **297/297 PASS** (baseline giữ nguyên; không sửa gì để cho pass).
- Commit chỉ doc này. **KHÔNG push. KHÔNG mở 25B.**
