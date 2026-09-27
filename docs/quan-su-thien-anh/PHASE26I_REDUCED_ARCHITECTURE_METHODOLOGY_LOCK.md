# Phase 26I — Reduced Architecture + chamDiem Semantic Methodology Lock

**Branch:** `quan-su-thien-anh` · **Nature:** METHODOLOGY LOCK ONLY (doc). KHÔNG runtime/refactor/verdict/src/test/
ky-nguyen-dung change, KHÔNG push, KHÔNG đụng western-astrology WIP. Consolidate Phase 26D–26H.

**Checkpoint:** HEAD `1695ed1` (trên `ec8ac79`=26H; `1695ed1` là commit CMS của luồng khác, không liên quan). Regression
318/318.

---

## 1. Owner Decision — KEEP BOTH CHANNELS (locked)
chamDiem và deterministic chain là **HAI SEMANTIC DOMAIN ĐỘC LẬP**, **KHÔNG** phải double-count (đã chứng minh scope
partition — Phase 26H).

- **CHANNEL A — DỤNG / chamDiem:** Phá trên **Dụng** → `chamDiem` (chấm CHỈ `resolved.hao`) → `cham.diem`/`timingBlocker`
  → `suyKetLuan` → **`ketLuan` / `mucDoThuan`** → structured card (`render-ket-qua-client.ts`).
- **CHANNEL B — KỴ/NGUYÊN / deterministic chain:** Phá trên **Kỵ/Nguyên** → `reduced` → `availabilityOf` → LIMITED →
  kyPressure/nguyenSupport → dungProtection → concludeDung → **`ketLuanSuViec`** → AI prose (prompt priority #1).
- **KHÓA:** KHÔNG merge/cộng hai channel thành một score. KHÔNG gọi là double-count. Một instance Phá vào ĐÚNG 1 channel
  theo vai hào (Dụng-reduced inert trong chain).

## 2. chamDiem Heuristic Status (locked)
- `Nguyệt Phá = -14`, `Nhật Phá = -10` (+ `timingBlocker=true`) — **INTERNAL QUÂN SƯ HEURISTIC** (legacy scoring).
- **KHÓA provenance:** KHÔNG mô tả là trích dẫn cổ điển; KHÔNG gán provenance cổ; KHÔNG tự nâng thành source-backed rule.
- **Numeric behavior KHÔNG đổi** ở phase này.
- **Factual doc check:** spec `LUAN_QUE_LUC_HAO_SPEC.md` **KHÔNG** mô tả các magnitude này như classical (grep xác nhận —
  các lần nhắc chamDiem trong spec chỉ nói "chamDiem KHÔNG đọc 4 nhãn efficacy", đúng sự thật). ⇒ **KHÔNG cần sửa spec.**

## 3. Reduced Architecture (locked — giữ nguyên)
- **7 producer GIỮ NGUYÊN, KHÔNG remove:** nguyetPha · nhatPha · tuePha · hoiDauKhac · hoaXung · hoaMo · hoaTuyet.
- **KHÔNG đổi `availabilityOf`.** Giữ `reduced || restrained || Suy → LIMITED`.
- **KHÔNG tự thêm severity/precedence.** Lý do (26G): semantic loss là CÓ THẬT nhưng primary evidence cho severity rule
  **chưa đủ** → không phát minh.
- **Load-bearing (26G, đa-quẻ):** nguyetPha 484 · nhatPha 132 · tuePha 614 · hoiDauKhac 224 · hoaMo 64 · hoaTuyet 144 →
  **mọi producer đo được đều load-bearing → KHÔNG cái nào an toàn gỡ.**

## 4. Provenance Matrix (locked)
| Thành phần | Provenance | Loại |
|---|---|---|
| Nguyệt Phá (reduced effect) | Chương VI (bản dịch nội bộ) "Nguyệt kiến xung hào = nguyệt phá" + mapping LIMITED | **A/B** (direction) + **C** (mapping) |
| Nhật Phá (reduced effect) | 增删卜易 日辰章 (verified 25C) + Model A lock (26D) | **A/B** + **C** |
| Tuế Phá | **Phase-10A methodology lock**; spec §3.9 ghi rõ **KHÔNG cổ thư**; 0/153 án lệ | **C** + **D** (DATA GAP) |
| Hóa-biến (hoiDauKhac/hoaXung/hoaMo/hoaTuyet) | engine/methodology representation; verbatim cổ **chưa đủ** | **C/E** |
| chamDiem −14 / −10 | **internal Quân Sư heuristic** — KHÔNG cổ điển | **C + E** |
| Combination logic (2 channel) | **KHÔNG có phép hợp nhất** — 2 bề mặt song song = kiến trúc Quân Sư | **C** |
- **KHÓA:** C KHÔNG được chuyển thành classical FACT.

## 5. Transformation / Burial State (locked — không đụng)
- `transformationState`: hiện **inert / no meaningful consumer** (26F/26G).
- `burialState`: **representation duplication** (hoaMo ở transformationState + burialState + CHANGED_YAO relation).
- **KHÓA:** KHÔNG remove, KHÔNG refactor, KHÔNG đổi behavior ở đây. Đây là **architectural cleanup candidate** cho phase
  riêng — **KHÔNG** được coi là bug đã chứng minh.

## 6. hoaXung (locked — DATA GAP)
- 26G: hoaXung **chưa có measurable coverage** (0 mẫu trong single-flip 64-quẻ).
- **KHÓA:** đánh dấu **DATA GAP**; KHÔNG kết luận redundant; KHÔNG remove. Future research (multi-động / corpus thật) =
  **phase riêng**.

## 7. Explicit Non-Decisions (KHÔNG quyết ở phase này)
- KHÔNG chọn Model A/B/C/D cho reduced decomposition (26F/26G) — vẫn OPEN.
- KHÔNG quyết trim/keep card chamDiem (26H OD-H1) — vẫn OPEN (đã lock "keep both" về mặt **không-double-count**, nhưng
  việc có tinh giản card legacy hay không là product decision còn mở).
- KHÔNG thêm `reducedBy` metadata (26G DQ1) — OPTIONAL, chưa quyết.
- KHÔNG thêm severity/precedence (26G DQ2) — thiếu nguồn.
- KHÔNG dọn transformationState/burialState (26G DQ6) — cleanup phase riêng.
- KHÔNG đóng DATA GAP hoaXung — research phase riêng.

## 8. Known Architectural Debt (ghi nhận, KHÔNG sửa)
1. `reduced` = boolean overloaded (2 họ: quan hệ Phá × hóa-biến); availabilityOf gộp reduced+restrained+Suy → mất
   source/severity. (26A/26F/26G)
2. `transformationState` + `burialState` inert / trùng-biểu-diễn (hoaMo 3 bản). (26F/26G)
3. chamDiem magnitudes (−14/−10/…) = heuristic không nguồn. (26H)
4. hai hệ verdict song song (card chamDiem + prose chain) cùng tồn tại (đã lock: KHÔNG double-count, nhưng có redundancy
   PRESENTATIONAL). (26H)
5. hoaXung DATA GAP (coverage). (26G)
- Tất cả = **debt đã ghi nhận, KHÔNG cấp bách, KHÔNG phải bug** — chờ product/owner ưu tiên.

## 9. Future Research / Implementation Items (phase riêng, KHÔNG mở tại đây)
- **R1:** reduced decomposition (Model B `reducedBy` metadata — rủi ro thấp, không đổi verdict) nếu owner muốn truy vết.
- **R2:** severity/precedence — chỉ khi có primary source (KHÔNG tự chế).
- **R3:** hoaXung coverage (multi-động/corpus).
- **R4:** cleanup transformationState/burialState duplication (no-behavior-change).
- **R5:** product decision: giữ hay tinh giản card chamDiem legacy (26H OD-H1/H3).
- **R6:** thay chamDiem heuristic bằng rule có nguồn (nếu owner muốn) — cần research.

## 10. Locked Summary
| Hạng mục | Trạng thái |
|---|---|
| chamDiem ↔ chain | **KEEP BOTH, 2 semantic domains độc lập, KHÔNG double-count** |
| chamDiem −14/−10 | **internal heuristic (không cổ điển)**, behavior không đổi |
| 7 reduced producers | **giữ nguyên, không remove** |
| availabilityOf | **không đổi** (reduced+restrained+Suy→LIMITED) |
| severity/precedence | **KHÔNG thêm** (thiếu nguồn) |
| transformation/burial state | **giữ, cleanup phase sau** |
| hoaXung | **DATA GAP, giữ** |
| Nhật Phá 26D / Tuế Phá 10A / movementEfficacy 25I | **KHÔNG mở lại** |

## 11. Phase Boundary
- **runtime: NO · tests: NO · spec: NO (không cần sửa) · scoring/conclusion/ky-nguyen-dung/availabilityOf: NO.**
- **doc changed: YES** (chỉ file này).
- Regression: **318/318 PASS**.
- Commit chỉ doc này. **KHÔNG push.** **Methodology LOCKED.** STOP (không mở Phase 26J).

## 12. Next Implementation Phase (đề xuất, KHÔNG tự mở)
Không có implementation bắt buộc kế tiếp (mọi thứ locked/stable). Nếu owner muốn tiến: **R1 (reducedBy metadata,
no-behavior-change)** là ứng viên rủi ro thấp nhất; hoặc đóng **R3 (hoaXung coverage)** trước khi bất kỳ reduced
decomposition nào. Chờ owner chỉ định.
