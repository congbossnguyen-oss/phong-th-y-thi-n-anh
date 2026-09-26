# Phase 25H — Movement Efficacy Integration Audit

**Branch:** `quan-su-thien-anh` · **Nature:** AUDIT ONLY (no runtime/test/spec/scoring/conclusion/Ứng-Kỳ change, no push).
Chỉ thêm 1 doc. Không đụng western-astrology WIP. Provenance chỉ dùng đã verify (Phase 25C) — không claim mới.

---

## 1. Current Architecture After 25G
- `HaoStrengthState.movementEfficacy: "LATENT_ACTIVATED"|"BROKEN_STATIC"|"DISPERSED"|"INTENSIFIED"|null`
  (can-luc-hao.ts) — suy từ 4 nhãn Nhật-xung (relations, 25B) qua `hasRel`. **TRỰC GIAO** base/effective/reduced.
- **Consumer hiện tại: KHÔNG có** (grep xác nhận: chỉ định nghĩa/derive + 1 câu legend prompt). Thuần **mô tả**.
- Đường lực nền không đổi: `strengthFrom`/`concludeDung`/`temporalFrom` chỉ nhận `currentState`; `chamDiem` đọc
  `HaoInfo`. Cả hai **không thấy** movementEfficacy. Regression 318/318.

## 2. Layer-by-Layer Audit
| # | Layer | Vai trò ngữ nghĩa hợp lệ? | Evidence | Double-count? | Cần rule mới? | Arch hỗ trợ không đổi base? |
|---|---|---|---|---|---|---|
| 1 | `canLucHao` (base/interaction) | KHÔNG (đây LÀ nơi tính lực nền; efficacy là trục khác) | — | CÓ (vượng/suy) | — | n/a |
| 2 | `strengthFrom` | KHÔNG | không số | CÓ (đọc effective=vượng/suy-derived) | có | không nên |
| 3 | `currentState.effective` | KHÔNG | không số | CÓ | có | KHÔNG (đổi base) |
| 4 | `concludeDung` (verdict) | **CÓ THỂ** (chỉ 散, xem §5) — nhưng confounded | định tính (增删卜易) | một phần (Suy) + rủi ro drift 黄金策 | CÓ | có (đọc thêm field) |
| 5 | `temporalFrom` / DELAYED | KHÔNG (timing) | KHÔNG có rule | — | CÓ | — |
| 6 | Ứng Kỳ | KHÔNG (timing) | KHÔNG có rule | — | CÓ | — |
| 7 | `chamDiem` (score) | KHÔNG | không số | **CAO** (vượng/suy + Xung đã cộng) | có | — |
| 8 | final verdict / 吉凶 | KHÔNG tự động | định tính, không công thức | một phần | CÓ | — |
| 9 | prompt/report | **CÓ** (mô tả FACT) | n/a | KHÔNG | KHÔNG | **ĐÃ làm (25G)** |

**Kết luận tầng:** chỉ **tầng 9 (prompt, đã làm)** là tích hợp an toàn-evidence. Tầng 4 (verdict, chỉ 散) là ứng viên
DUY NHẤT còn tranh luận nhưng bị confounded (§5). Tầng 1/2/3/7 = double-count. Tầng 5/6 = không nguồn.

## 3. Primary Evidence Matrix (chỉ đã verify Phase 25C — verbatim)
| State | Nhãn nguồn | Effect-language nguồn (verbatim) | Là NÊN LỰC hay HIỆU-LỰC? | Có công thức verdict/số/timing? |
|---|---|---|---|---|
| Ám Động (LATENT_ACTIVATED) | 暗动 | 增删卜易: "冲旺相之静爻，即为暗动，**愈得其力**" | hiệu-lực (được kích hoạt, lợi) — nhưng hào ĐÃ vượng | KHÔNG |
| Nhật Phá (BROKEN_STATIC) | 日破 | 增删卜易: "冲衰弱之静爻，则为日破，**愈加无用**" | hiệu-lực (vô dụng, hại) — nhưng hào ĐÃ suy | KHÔNG |
| 散 (DISPERSED) | 散 | 增删卜易: "爻衰而动，冲之则**散**" (mất tác dụng động, hại); 易冒: "休囚为散" | hiệu-lực ĐỘNG bị mất — hào ĐÃ suy | KHÔNG (số/timing) |
| 愈动 (INTENSIFIED) | 愈动 | 增删卜易: "爻旺而动，冲之**愈动**"; 易冒: "旺相为动" | hiệu-lực ĐỘNG tăng — hào ĐÃ vượng | KHÔNG |
- **Nhận định:** nguồn CÓ ngôn ngữ hiệu-lực định tính cho cả 4, NHƯNG hướng hiệu-lực **trùng dấu** với vượng/suy của
  chính hào (vượng→lợi, suy→hại). **KHÔNG nguồn nào cho số, công thức verdict, hay quy luật Ứng Kỳ.**
- **Cấm nhập:** 黄金策/卜筮正宗 "动逢冲→散 (吉不成吉,凶不成凶)" — profile ĐÃ loại (Phase 24). Đây là rule verdict-neutralize
  vô điều kiện; nếu tích hợp 散→verdict phải TRÁNH tái nhập nó.

## 4. Double-Counting Matrix (state × tín hiệu sẵn có)
| | vượng/suy | Nguyệt kiến | Nhật thần | động/tĩnh | hóa biến | reduced | amDong | Xung | scoring (chamDiem) |
|---|---|---|---|---|---|---|---|---|---|
| Ám Động | **trùng** (静+vượng) | (Lâm Nguyệt→vượng) | (Nhật xung) | trùng (tĩnh) | — | — | **trùng** (amDong flag) | trùng (Xung) | trùng (VUONG_SUY+Xung) |
| Nhật Phá | **trùng** (静+suy) | — | (Nhật xung) | trùng (tĩnh) | **trùng** (đã ở reduced) | — | trùng | trùng | trùng |
| 散 | **trùng** (động+suy) | — | (Nhật xung) | trùng (động) | một phần (hóa xấu) | một phần | — | trùng | trùng |
| 愈动 | **trùng** (động+vượng) | (Lâm Nguyệt) | (Nhật xung) | trùng (động) | một phần (Tiến/Hồi Sinh) | — | — | trùng | trùng |
- Mọi state = **hàm của (vượng/suy × động/tĩnh × Xung)** — tất cả đã được engine biểu diễn. ⇒ Bơm efficacy vào
  strength/score = **đếm lại** chính các trục này. Phần "gia tăng" DUY NHẤT chưa có nơi khác: **散 = 'động không phát
  huy tác dụng'** (hành vi của hào ĐỘNG không diễn ra), KHÔNG đồng nhất với "hào yếu" (Suy) — xem §5.

## 5. 散 / DISPERSED Audit
- **Nguồn (verified):** 增删卜易 "爻衰而动，冲之则散" — 散 = hào **suy + động** bị Nhật xung → "mất tác dụng động"; 易冒
  "休囚为散".
- Có nguồn verified nào **rõ ràng** thiết lập: giảm effective lực? **KHÔNG** (chỉ định tính). Bất-khả-thành-sự?
  **KHÔNG công thức.** Verdict âm? **KHÔNG** (đó là 黄金策 "吉不成吉" — profile loại). Timing? **KHÔNG.** Vô hiệu 1
  động hào đang thuận? — nguồn nói "mất tác dụng ĐỘNG" (hành động của hào không phát huy) — đây là **ý niệm hợp lệ**
  nhưng KHÔNG kèm quy luật áp dụng.
- **Điểm mấu chốt:** phần "động không phát huy" KHÁC "hào yếu" (Suy đã có). Đây là ứng viên tích hợp verdict **không
  hoàn toàn** double-count. NHƯNG: (a) hào 散 vốn đã Suy → phần lớn hiệu ứng đã có qua Suy; (b) diễn dịch "động vô
  hiệu → việc không thành" rất gần **黄金策 đã loại**. ⇒ Tích hợp 散→verdict **cần rule owner tường minh** phân biệt
  với cả Suy lẫn 黄金策. **KHÔNG tự suy.** KHÔNG quy số.

## 6. 愈动 / INTENSIFIED Audit
- **Nguồn:** 增删卜易 "爻旺而动，冲之愈动"; 易冒 "旺相为动". Định tính "càng động/giữ động".
- Nguồn verified thiết lập tăng effective lực? **KHÔNG.** Tăng hiệu quả sự việc? chỉ định tính. Ảnh hưởng verdict mạnh
  hơn? KHÔNG công thức. Timing? KHÔNG.
- Hào 愈动 vốn đã **Vượng + động active** → "càng động" hầu như **đã** biểu diễn (Vượng + động hành). ⇒ Giá trị gia
  tăng **thấp**; tích hợp strength/verdict = **double-count vượng**. KHÔNG suy "more movement = more strength".

## 7. Ám Động / LATENT_ACTIVATED Audit
- **Nguồn:** 增删卜易 "暗动…愈得其力" (được lực). Hào tĩnh-vượng bị Nhật xung → hoạt động ngầm, lợi.
- Hiện engine: `amDong` flag (lưu) + hào đã Vượng. "愈得其力" ≈ đã phản ánh bởi Vượng. Vai trò downstream mới =
  double-count vượng + amDong flag. ⇒ Giữ **factual** (kể cả efficacy). Không nâng verdict tự động.
- (Ghi chú: "Ám Động" cổ điển đôi khi dùng để coi hào tĩnh như "đang động" khi xét tác động — nhưng đó là hành vi
  ĐỘNG-hoá đã thuộc thiết kế chuỗi, KHÔNG phải chức năng của trục efficacy; nếu cần, là quyết định riêng.)

## 8. Nhật Phá / BROKEN_STATIC Audit
- **Nguồn:** 增删卜易 "日破…愈加无用" (càng vô dụng). Hào tĩnh-suy bị Nhật xung.
- Hiện engine: đã set `reduced=true` (nhưng `reduced` **inert** với verdict — Phase 25D). Hào cũng đã Suy.
- Provenance đủ để `reduced` **thành active trong verdict** chưa? Nguồn nói "vô dụng" (định tính) — hỗ trợ hướng
  "hại", NHƯNG: (a) trùng Suy; (b) nếu kích hoạt `reduced` vào verdict thì phải làm **đồng bộ cho mọi nguồn reduced**
  (Nguyệt Phá/Tuế Phá/Hồi Đầu Khắc/Hóa xấu), KHÔNG chỉ Nhật Phá — nếu không lại tạo hybrid. ⇒ Đây là **quyết định
  kiến trúc lớn hơn** (kích hoạt `reduced`), vượt phạm vi efficacy, cần owner.

## 9. Ứng Kỳ Audit
- Không nguồn verified nào (增删卜易/易冒) khóa **quy luật thời điểm** cho 散/愈动 (khi nào 散 hết, khi nào 愈动 ứng).
  Ý niệm dân gian "散 chờ 填实/值日" **chưa có verbatim trong repo**.
- KHÔNG suy timing từ động/tĩnh của efficacy. ⇒ **OPEN.** Không tích hợp Ứng Kỳ.

## 10. Candidate Integration Points (kỹ thuật, không xếp hạng)
- **CP-A (an toàn, ĐÃ làm):** prompt/report — surface efficacy như FACT mô tả (25G). Không cần thêm.
- **CP-B (ứng viên, confounded):** `concludeDung` đọc **散** như "động không phát huy" — CHỈ khi owner ra rule phân
  biệt với Suy và với 黄金策; hiện thiếu công thức. Không double-count HOÀN TOÀN nhưng rủi ro drift.
- **CP-C (kiến trúc lớn, ngoài efficacy):** kích hoạt `reduced` (gồm Nhật Phá) vào verdict — phải đồng bộ mọi nguồn
  reduced; là quyết định riêng, không nên gói trong efficacy.

## 11. Explicitly Unsupported Integrations (KHÔNG đủ evidence / double-count)
- efficacy → effective/base strength (§ layer 1-3): **UNSUPPORTED** (không số + double-count vượng/suy).
- efficacy → chamDiem score (layer 7): **UNSUPPORTED** (double-count vượng/suy + Xung).
- efficacy → Ứng Kỳ/timing (layer 5-6): **UNSUPPORTED** (không nguồn rule).
- 愈动 → tăng lực/verdict: **UNSUPPORTED** (double-count vượng).
- Ám Động → nâng verdict tự động: **UNSUPPORTED** (double-count vượng).
- 散 → verdict âm vô điều kiện: **UNSUPPORTED + CẤM** (đó là 黄金策 đã loại).

## 12. Decision Questions (methodology owner)
- **DQ1.** Giữ movementEfficacy **descriptive-only** (đóng chủ đề) hay mở tích hợp verdict?
- **DQ2.** Nếu mở: chỉ CP-B (散→concludeDung) — owner cho **rule tường minh** phân biệt "散 động-vô-hiệu" với "Suy" và
  với 黄金策 "吉不成吉" như thế nào (định tính, không số)?
- **DQ3.** Có mở CP-C (kích hoạt `reduced` vào verdict, đồng bộ MỌI nguồn reduced) — tách riêng khỏi efficacy không?
- **DQ4.** Ứng Kỳ cho 散 — có nạp nguồn verbatim (增删卜易/易冒/khác) khóa mốc không? Nếu không → giữ OPEN vĩnh viễn.
- **DQ5.** Xác nhận KHÔNG bao giờ số-hoá / chamDiem 4 nhãn (giữ invariant §3.10.1).

## 13. Recommended Next Decision Gate
- **Gate kỹ thuật:** "散 verdict-role decision" — chỉ CP-B, và CHỈ nếu owner cấp một rule định tính phân biệt 3 thứ
  (散-động-vô-hiệu / Suy / 黄金策). Nếu không có rule đó → **đóng ở descriptive-only** (CP-A) là kết cục evidence-đúng.
- CP-C (reduced-activation) nên là gate RIÊNG (kiến trúc verdict tổng), không trộn với efficacy.
- Ứng Kỳ: chỉ mở khi có nguồn verbatim mới (hiện OPEN).

## 14. DO NOT IMPLEMENT UNTIL DECIDED
Cho tới khi DQ1–DQ5 được owner khóa: **giữ movementEfficacy descriptive-only.** KHÔNG nối vào canLucHao base/effective/
reduced, strengthFrom, concludeDung, temporalFrom, Ứng Kỳ, chamDiem, verdict. KHÔNG số-hoá. KHÔNG timing. KHÔNG nhập
黄金策/卜筮正宗. Giữ 12 invariants §3.10.1.

## 15. Phase Boundary
- **runtime: NO · tests: NO · spec: NO · scoring/conclusion/Ứng-Kỳ: NO.** doc changed: YES (chỉ file này).
- Regression: **318/318 PASS** (xác nhận không đổi). Commit chỉ doc này. **KHÔNG push.** STOP.
