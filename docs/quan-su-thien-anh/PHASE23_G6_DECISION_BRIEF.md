# G6 DECISION BRIEF — NHẬT TÁN

**Branch:** `quan-su-thien-anh` · **Checkpoint:** Phase 23 audit complete (`b57a4a9`).
**Nature:** EVIDENCE ONLY. No code, no methodology, no Phase 24. No answers, no recommendation, no interpretation.
Nội dung dưới đây trích từ chứng cứ đã lập ở Phase 23.

---

## 1. Methodology Wording (verbatim)

**LUAN_QUE_LUC_HAO_SPEC.md §99:**
> …(3) đặc biệt: hào vượng bị Nhật xung = **ám động** (lợi, không phải suy); hào hưu tù tĩnh bị Nhật xung =
> **Nhật phá** (hại); hào đang động bị Nhật xung = **Nhật tán** (hại).

**QUY_TRINH_LUC_HAO_LUAN.md §158:**
> Đặc biệt: hào **vượng** bị Nhật xung = **ám động** (lợi, không phải suy); hào **hưu tù tĩnh** bị Nhật xung =
> **Nhật phá** (hại); hào **đang động** bị Nhật xung = **Nhật tán** (hại, mất tác dụng động).

**Chương VI (trích trong `luc-hao.ts:411-414`):**
> "Tĩnh hào vượng tướng, bị nhật thần xung làm ám động; tĩnh hào bị hưu tù, bị nhật xung là nhật phá" —
> nhóm "vượng tướng" = Vượng/Tướng; nhóm "hưu tù" = Hưu/Tù/Tử.

## 2. Evidence Needed to Decide G6

- §99 và §158 liệt **3** trạng thái hào bị Nhật xung, theo 2 trục: {vượng | hưu-tù} và {tĩnh | động}.
- Chương VI chỉ mô tả hào **tĩnh** (vượng-tướng → ám động; hưu-tù → nhật phá); **không nhắc** hào động,
  **không có** từ "nhật tán".
- Engine `getDayRelations` (`luc-hao.ts:417-436`) **không nhận `isDong`**; nhánh Nhật xung (dòng 430-433)
  gán nhãn theo **một trục** duy nhất:
  ```ts
  const vuongTuong = monthVuongSuy === "Vượng" || monthVuongSuy === "Tướng";
  out.push({ type: vuongTuong ? "Ám Động" : "Nhật Phá", source: "DAY", target: "HAO" });
  ```
- `HaoRelationType` (`luc-hao.ts:395-399`) **không có** `"Nhật Tán"`.

## 3. Matrix

| Case | Định nghĩa | Source premise (verbatim) | Current engine result | Spec result | Conflict |
|---|---|---|---|---|---|
| **N1** | Tĩnh + Vượng + Nhật xung | §99/§158: "hào vượng bị Nhật xung = ám động"; Chương VI: "Tĩnh hào vượng tướng… làm ám động" | `Ám Động` (vuongTuong = true) | `Ám Động` | Không |
| **N2** | Tĩnh + Hưu-tù + Nhật xung | §99/§158: "hào hưu tù tĩnh bị Nhật xung = Nhật phá"; Chương VI: "tĩnh hào bị hưu tù… là nhật phá" | `Nhật Phá` (vuongTuong = false) | `Nhật Phá` | Không |
| **N3** | Động + Hưu-tù + Nhật xung | §99/§158: "hào đang động bị Nhật xung = **Nhật tán** (hại, mất tác dụng động)"; Chương VI: im lặng về hào động | `Nhật Phá` (vuongTuong = false) | `Nhật Tán` | **CÓ** — nhãn engine (`Nhật Phá`) ≠ nhãn spec (`Nhật Tán`); engine không thấy `isDong` |
| **N4** | Động + Vượng + Nhật xung | §99/§158: "hào vượng… = ám động" **VÀ** "hào đang động… = Nhật tán" (hai tiền đề cùng áp) | `Ám Động` (vuongTuong = true) | *Không xác định* — hai tiền đề cho hai kết quả khác nhau, spec không cho thứ tự ưu tiên | **CÓ** — spec tự chồng lấn; engine không thấy `isDong` |

## 4. Unresolved N4

**Vượng + Động + Nhật xung.** Một hào thỏa cả hai tiền đề của §99/§158:
- "hào **vượng** bị Nhật xung = ám động" (lợi)
- "hào **đang động** bị Nhật xung = Nhật tán" (hại, mất tác dụng động)

Spec không cho biết trục nào ưu tiên, hay hai FACT có cùng tồn tại. Chương VI không đề cập hào động nên
không phân xử được. ⇒ chưa đủ dữ kiện để implement deterministic.

## 5. Decision Questions (chưa trả lời)

- **Q1.** N4 (Vượng + Động + Nhật xung) = **Ám Động** / **Nhật Tán** / **cả hai**?
- **Q2.** Nếu một kết quả thắng, **axis nào** thắng (vượng-suy hay động-tĩnh)?
- **Q3.** "Nhật Tán" = **standalone `HaoRelationType`** hay không?
- **Q4.** Nhật Tán **ảnh hưởng strength** hay không?
- **Q5.** Nhật Tán **ảnh hưởng conclusion** hay chỉ **FACT/ROLE**?

---

*Brief này chỉ trình bày chứng cứ. Không trả lời, không đề xuất, không diễn giải. Chờ Thầy quyết Q1–Q5.*
