# PHASE 21 — METHODOLOGY GAP CLOSURE AUDIT

**Branch:** `quan-su-thien-anh` · **Checkpoint:** `61ec09f` (Phase 20 PASS).
**Nature:** AUDIT + DECISION. **Runtime changed: NO. Methodology changed: NO.** Không sửa code, không thêm
relation/score, không suy diễn methodology từ code, không fabricate án lệ.

Nguồn đã đọc: `LUAN_QUE_LUC_HAO_SPEC.md`, `QUY_TRINH_LUC_HAO_LUAN.md`, PHASE10D/18/19/20 reports; runtime:
`can-luc-hao.ts`, `luc-hao-tam-hop-cuc.ts`, `hinh-relations.ts`, `cuu-than.ts`, `ket-luan-su-viec.ts`,
`ky-nguyen-dung.ts`, `luc-hao.ts` (đọc getDayRelations).

## Bảng quyết định

| GAP | Source | Status | Runtime impact | Decision |
|---|---|---|---|---|
| G1 Tuế Phá | Thầy Phase 10A (chat lock); **KHÔNG** trong repo spec doc; 0/153 án lệ | **E** (đã implement `canLucHao.yearState`) + **C** (DATA GAP validation) | Đã hoạt động; không cần code | Giữ nguyên. Đề xuất: bổ sung Tuế Phá vào LUAN_QUE_LUC_HAO_SPEC (doc-only) để nguồn đầy đủ |
| G2 Tam Hợp TH2/TH3/TH6 | Thầy Phase 10C spec (6 thể); điều kiện formation đã cho | **E** (đã implement `phanLoaiSauTamHop`) + **C** (DATA GAP: 0 ca TH2/3/6 trong 153 án lệ) | Không cần code | Giữ nguyên; validation chờ structured cases |
| G3 Hình Sửu-Tuất-Mùi / Tự Hình | LUAN_QUE_LUC_HAO_SPEC **§348** ghi rõ "cần đối chiếu thêm nguồn" | **D** (DEFERRED BY SPEC) | Không | KHÔNG mở rộng; chờ nguồn khóa |
| G4 Cừu Thần | spec §229/§260/§263 (định nghĩa + "phe Kỵ/Cừu = đại hung") | **E** (detector `cuu-than.ts` + relations) cho FACT; **OPEN** cho quantified effect | Không cần code | Giữ fact-only; qualitative direction đã surface, chưa có rule định lượng lực |
| G5 Multi-adverse precedence | KHÔNG có source cho "collapsed precedence" (Phase 10B OPEN) | **B / OPEN METHODOLOGY** | Không (design đa-trục né được) | STOP — không tự chế "strongest wins"; giữ đa-trục |
| G6 (MỚI) Nhật Tán | spec §99/§158 phân biệt 3 (Ám Động/Nhật Phá/**Nhật Tán**); engine chỉ có 2 | **B / OPEN** (conflict engine↔spec + spec tự mơ hồ vượng+động) | Không (không sửa engine) | STOP — báo Thầy; cần phase riêng + relation mới |

---

## Chi tiết từng GAP

### G1 — Tuế Phá — E + DATA GAP
- **Source:** Thầy khóa ở Phase 10A (Thái Tuế = Chi hào ≡ Chi Năm, KHÔNG = Vượng; Tuế Phá = Năm xung hào →
  suy mạnh). **KHÔNG** nằm trong repo spec doc; grep `LUAN_QUE_LUC_HAO_SPEC`/`QUY_TRINH` = 0.
- **Evidence:** 0/153 án lệ có "Tuế Phá" (Phase 10D). Chỉ có định nghĩa (Thầy), không có ca thực.
- **Current impl:** `canLucHao.yearState.{thaiTue,tuePha}` (Phase 10E); Tuế Phá → `reduced`, Thái Tuế KHÔNG nâng
  lực. Đã test (__can-luc-hao G21/G22).
- **Conflict:** không.
- **Decision:** methodology LOCKED (theo Thầy) + đã implement → **E**; validation bằng án lệ = **DATA GAP**.
  Không cần code. Đề xuất doc-only: thêm Tuế Phá vào spec để nguồn tự-đủ (không bắt buộc).

### G2 — Tam Hợp TH2/TH3/TH6 — E + DATA GAP
- **Source:** Thầy Phase 10C (6 thể + điều kiện formation + ungKyChi/benhLine). LUAN_QUE_LUC_HAO_SPEC §3.7/§129
  chỉ khóa 3 điều kiện cho `tinhTamHopCuc` (cục đã thành); 6-thể là lớp phân loại bổ sung (Thầy 10C).
- **Evidence:** án lệ dùng Tam Hợp chủ yếu thể ĐỦ (TH1/TH4/TH5-like); **không có** TH2/TH3/TH6 (khuyết) đủ cấu
  trúc để replay (Phase 10D/18).
- **Current impl:** `phanLoaiSauTamHop` đủ 6 thể + benhLine + ungKyChi; test __sau-tam-hop (9).
- **Conflict:** không.
- **Decision:** detector **E** (đã implement theo Thầy 10C); cross-validation án lệ = **DATA GAP**. Không code.

### G3 — Hình Sửu-Tuất-Mùi / Tự Hình — DEFERRED BY SPEC
- **Source:** `LUAN_QUE_LUC_HAO_SPEC.md §3.7` khóa Dần-Tỵ-Thân + Tý-Mão; **§348** ghi "Danh sách đầy đủ Tam
  Hình ngoài Dần-Tỵ-Thân và Tý-Mão — cần đối chiếu thêm nguồn khác."
- **Evidence:** án lệ có nhắc "Dậu/Hợi tự hình" nhưng án lệ < spec (Phase 15).
- **Current impl:** `hinh-relations.ts` CỐ Ý chỉ detect 2 bộ; test khẳng định KHÔNG detect Tự Hình/Sửu-Tuất-Mùi.
- **Conflict:** không (spec chủ động defer).
- **Decision:** **D — DEFERRED BY SPEC.** KHÔNG mở rộng. Chờ nguồn khóa mới mở phase riêng.

### G4 — Cừu Thần — E (detector) + OPEN (định lượng)
- **Source:** spec §229 "kẻ thù gián tiếp, chặn Nguyên"; §260 "sinh Kỵ, khắc Nguyên"; §263 "cục thuộc phe
  Kỵ/Cừu = đại hung". ⇒ định nghĩa + **chiều định tính** (adverse, phe Kỵ) LOCKED.
- **Current impl:** `cuu-than.ts` — Cừu = hành sinh Kỵ; relations SINH_KY/KHAC_NGUYEN; role CUU. FACT-only,
  KHÔNG vào chuỗi/strength/conclusion (Phase 16).
- **Conflict:** không (KHÔNG lấy logic Bát Tự/Tử Vi sang; định nghĩa Lục Hào tự đủ).
- **Decision:** detector **E**. Meaning định tính (adverse) đã surface qua role + relations + spec cho AI. Hiệu
  ứng ĐỊNH LƯỢNG lên strength/conclusion = **OPEN** (spec chỉ nói "đại hung" trong ngữ cảnh Tam Hợp cục, KHÔNG
  cho rule giảm lực cho 1 hào Cừu lẻ). Giữ fact-only. Không code.

### G5 — Multi-adverse-transformation precedence — OPEN METHODOLOGY
- **Source:** KHÔNG có. Phase 10B đã đánh dấu OPEN các tổ hợp (Vượng + Hồi Đầu Khắc / Hóa Tuyệt / Hóa Mộ /
  Phá). Spec §99/§158 chỉ cho thứ tự XÉT QUAN HỆ (Nguyệt→Nhật), KHÔNG cho thứ tự collapse nhiều adverse.
- **Current impl:** `canLucHao` dùng **đa-trục**: `baseForce` giữ; `reduced` = hợp (union) mọi adverse
  (Phá/Hồi Đầu Khắc/Hóa Xung/Mộ/Tuyệt); `effective` chỉ đổi bởi Tiến/Thoái/Hồi Đầu Sinh. ⇒ KHÔNG cần precedence
  vì không collapse.
- **Conflict:** không (design né được).
- **Decision:** **B / OPEN.** STOP — KHÔNG tự tạo "strongest signal wins". Nếu tương lai cần 1 verdict lực đơn,
  phải để Thầy khóa precedence. Runtime hiện tại đúng (đa-trục), không đổi.

### G6 (PHÁT HIỆN MỚI) — Nhật Tán — OPEN (conflict engine ↔ spec)
- **FACT:** spec §99 + QUY_TRINH §158 phân biệt **3** trạng thái hào bị Nhật xung: hào **vượng** → Ám Động
  (lợi); hào **hưu tù TĨNH** → Nhật Phá (hại); hào **đang ĐỘNG** → **Nhật Tán** (hại, mất tác dụng động).
- **CONFLICT:** `luc-hao.ts::getDayRelations` (dòng 430-433) chỉ branch theo `monthVuongSuy`:
  `vuongTuong ? "Ám Động" : "Nhật Phá"`. Hàm **không nhận `isDong`** ⇒ KHÔNG thể tạo "Nhật Tán"; động+hưu-tù+
  Nhật xung bị gán "Nhật Phá", động+vượng+Nhật xung bị gán "Ám Động".
- **LOCATION:** `src/lib/luc-hao.ts` getDayRelations (engine gốc).
- **IMPACT:** LOW hiện tại — "Nhật Tán" chưa có trong `HaoRelationType`; downstream (canLucHao/hao-time) chưa
  tiêu thụ nó. Nhưng nhãn có thể sai cho hào ĐỘNG bị Nhật xung.
- **Spec cũng mơ hồ:** §99 liệt "vượng → ám động" (không nói tĩnh) và "đang động → nhật tán" → chồng lấn cho
  **vượng + động** (ám động hay nhật tán?). ⇒ chưa đủ để implement deterministic.
- **DECISION NEEDED (Thầy):** (a) vượng+động bị Nhật xung = Ám Động hay Nhật Tán? (b) Nhật Tán ảnh hưởng lực
  thế nào? Sau khi khóa → phase riêng thêm `HaoRelationType "Nhật Tán"` + truyền `isDong` vào getDayRelations
  (sửa engine, ngoài phạm vi Phase 21). **STOP — KHÔNG sửa now** (engine sacred + cần relation mới + spec mơ hồ).

---

## Tổng kết
- **Runtime changed: NO.** **Methodology changed: NO.**
- **LOCKED & đã implement (E):** G1 (Tuế Phá), G2 (Tam Hợp 6 thể), G4 detector (Cừu).
- **DEFERRED BY SPEC (D):** G3 (Hình mở rộng).
- **DATA GAP (C):** G1/G2 validation bằng án lệ (prose, thiếu structured 6-hào).
- **OPEN METHODOLOGY (B) — cần Thầy, KHÔNG tự giải:** G5 (multi-adverse precedence), G6 MỚI (Nhật Tán), G4
  định lượng.

## Phase tiếp theo đề xuất (KHÔNG mở trong session này)
- **P22a (doc-only):** thêm Tuế Phá vào LUAN_QUE_LUC_HAO_SPEC (đưa G1 nguồn tự-đủ).
- **P22b (chờ Thầy khóa):** Nhật Tán (G6) — quyết vượng+động + hiệu ứng, rồi mới sửa engine + relation.
- **Chờ nguồn:** G3 (Hình mở rộng), G5 (precedence), G4 định lượng — chỉ mở khi có source khóa.
- **Chờ data:** bộ fixture quẻ 6-hào thật để đóng DATA GAP validation (G1/G2 + real-case Phase 20).
