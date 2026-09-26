# Phase 25I — Movement Efficacy FINAL EFFECT Lock (FACT-ONLY)

**Branch:** `quan-su-thien-anh` · **Nature:** METHODOLOGY DECISION/DOC GATE. NOT implementation.
**runtime: NO · tests: NO · scoring: NO · conclusion: NO · Ứng-Kỳ: NO · push: NO.**
Files: `LUAN_QUE_LUC_HAO_SPEC.md` (1 note authoritative ở §3.10.1) + doc này. Không đụng western-astrology WIP.

---

## 1. Decision
**LOCK `movementEfficacy` = FACT-ONLY** cho methodology hiện tại. Trục hiệu-lực-động là **mô tả ngữ nghĩa**, KHÔNG tác
động bất kỳ tầng lực/kết luận/timing/điểm nào. Căn cứ: audit bằng chứng **Phase 25H** — không có nguồn primary cho
delta số / công thức verdict / quy luật Ứng Kỳ; mọi hướng hiệu ứng đã trùng vượng/suy×động×Xung (double-count); và diễn
dịch verdict cho 散 lại trùng Suy hoặc trôi về profile **黄金策 đã loại**.

## 2. Locked Semantic Mapping (KHÓA)
| Relation (Phase 25B) | movementEfficacy | Ngữ nghĩa (mô tả, KHÔNG phải bậc lực) |
|---|---|---|
| Ám Động (暗动) | **LATENT_ACTIVATED** | tĩnh-vượng bị Nhật xung — hoạt động ngầm/tiềm động |
| Nhật Phá (日破) | **BROKEN_STATIC** | tĩnh-suy bị Nhật xung — vỡ trạng thái tĩnh (KHÁC 散) |
| Nhật Tán / 散 | **DISPERSED** | động-suy bị Nhật xung — hiệu lực động bị tán |
| 愈动 | **INTENSIFIED** | động-vượng bị Nhật xung — hiệu lực động tăng |
> KHÔNG diễn giải 4 giá trị này thành **numeric strength modifier**. null = không có Nhật xung.

## 3. What FACT-ONLY Means
- Là dữ kiện **mô tả** kèm hào, để con người/AI ĐỌC như ngữ cảnh; KHÔNG phải tín hiệu điều khiển lực/kết luận.
- Được phép **surface** trong prompt/report (đã làm Phase 25G, kèm legend "chỉ mô tả, không lực/điểm/verdict").
- KHÔNG là đầu vào của bất kỳ hàm quyết định nào (xem §4).

## 4. Explicit Non-Effects (KHÓA — mọi mục = KHÔNG)
1. KHÔNG mutate base strength. 2. KHÔNG mutate effective strength. 3. KHÔNG mutate `reduced`.
4. KHÔNG ảnh hưởng `canLucHao` giá trị lực số. 5. KHÔNG ảnh hưởng `strengthFrom`. 6. KHÔNG ảnh hưởng `concludeDung`.
7. KHÔNG ảnh hưởng `temporalFrom` / Ứng Kỳ. 8. KHÔNG ảnh hưởng `chamDiem`. 9. KHÔNG trực tiếp quyết 吉/凶.
10. CHỈ được surface prompt/report như FACT. 11. KHÔNG số-hoá. 12. Tương lai có thể reopen qua **gate riêng** (§9).

## 5. Classical Evidence Boundary
- Nguồn verified (Phase 25C) CÓ ngôn ngữ hiệu-lực định tính: Ám Động "愈得其力", Nhật Phá "愈加无用", 散 "mất tác dụng
  động", 愈动 "爻旺而动，冲之愈动" / 易冒 "旺相为动，休囚为散". **Đủ để khóa NHÃN + hướng mô tả.**
- **KHÔNG đủ** để khóa: delta lực bằng số · công thức verdict · quy luật Ứng Kỳ. ⇒ chỉ FACT-only là kết luận
  evidence-đúng. KHÔNG suy diễn thêm.

## 6. Double-Counting Rationale (vì sao KHÔNG tích hợp lực/điểm)
Mỗi state = hàm của (vượng/suy × động/tĩnh × Xung) — tất cả đã có trong engine (baseForce theo Nguyệt/Nhật, `isDong`,
relation "Xung", `chamDiem` cộng `VUONG_SUY_DIEM` + `Xung`). Bơm efficacy vào strength/score = **đếm lại** chính các
trục này (Phase 25H §4 double-counting matrix). Phần "gia tăng" duy nhất (散 = "động không phát huy") lại trùng Suy hoặc
trôi về 黄金策 → không tách sạch được nếu không có rule owner tường minh.

## 7. Rejected Methodology Boundary
- **KHÔNG** import 《黄金策》/《卜筮正宗》 "动逢冲 → 散 (吉不成吉，凶不成凶)" — profile đã loại Phase 24.
- **KHÔNG** diễn giải `散 = "việc chắc chắn không thành"` trừ khi một **gate methodology tương lai** khóa rule đó bằng
  primary evidence phù hợp.
- **KHÔNG** biến `愈动 = "hào mạnh hơn"` thành rule số/base-strength.
- Primary profile giữ nguyên: **增删卜易 + 易冒**.

## 8. Reduced-State Architecture — Separate OPEN Issue
- **OPEN: "Reduced-state verdict architecture".** Hiện `currentState.reduced` (gồm Nhật Phá, Nguyệt Phá, Tuế Phá, Hồi
  Đầu Khắc, Hóa Xung/Mộ/Tuyệt) **inert** với verdict (`concludeDung`/`strengthFrom` chỉ đọc `effective`).
- Việc có kích hoạt `reduced` vào verdict hay không là **câu hỏi kiến trúc verdict TỔNG** (phải đồng bộ MỌI nguồn
  reduced, không chỉ Nhật Phá) — **KHÔNG thuộc trục Movement Efficacy** và **KHÔNG** giải ở Phase 25I.
- Phase 25I **KHÔNG** kích hoạt `reduced`.

## 9. Conditions Required to Reopen the Lock
Reopen chỉ qua **decision gate riêng** khi có ĐỦ:
1. Nguồn **primary** mới (verbatim, ghi URL) khóa một rule cụ thể cho một state (không phải suy diễn).
2. Rule đó **tách sạch** khỏi tín hiệu đã đếm (không double-count vượng/suy×động×Xung).
3. Rule KHÔNG tái nhập profile 黄金策/卜筮正宗 đã loại.
4. Methodology-owner ký; giữ 12 invariants §3.10.1.

## 10. Future Evidence Requirements (nếu muốn tích hợp verdict/timing sau)
- Cho **散→verdict**: nguồn phân biệt rõ "散 (động vô hiệu)" với "Suy" và với 黄金策 "吉不成吉" — định tính, có thể áp
  deterministic.
- Cho **Ứng Kỳ**: nguồn verbatim khóa mốc (vd điều kiện 填实/值日/xung khai) — hiện KHÔNG có trong repo.
- Cho **reduced-verdict**: quyết kiến trúc tổng (mục §8), độc lập efficacy.

## 11. Implementation Status
- `HaoStrengthState.movementEfficacy` = ĐÃ implement (Phase 25G, commit c9207a9), FACT-only, surface prompt.
- Phase 25I: **KHÔNG đổi runtime** — chỉ khóa quyết định + làm §3.10.1 authoritative (note FINAL LOCK).
- Consumer: KHÔNG có (đúng FACT-only). Spec §3.10.1 nay ghi rõ FACT-ONLY LOCK + điều kiện reopen.

## 12. Regression Baseline
**318/318 PASS** (không đổi bởi phase doc-only này). KHÔNG claim con số khác.

## 13. Phase Boundary
- **runtime: NO · tests: NO · scoring: NO · conclusion: NO · Ứng-Kỳ: NO.**
- **spec doc: YES** (1 note authoritative §3.10.1). **decision doc: YES** (file này).
- Commit chỉ 2 file doc. **KHÔNG push.** STOP.
