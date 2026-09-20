# PHASE 11-A3 — DECISION RECORD (旺相休囚死 / Wang Shuai)

**Loại tài liệu**: Chốt quyết định, dựa trên
`docs/daliuren/DA_LIU_REN_PHASE_11A3_INDEPENDENT_AUDIT.md`.
**Phạm vi**: Quyết định thuần — KHÔNG sửa source/test, KHÔNG refactor.

---

## Decision 1 — Confidence

**GIỮ `WANG_SHUAI_PROVENANCE` ở Confidence A.**

Lý do:
- Independent audit đã đối chiếu toàn bộ provenance conventions hiện có trong project (không chỉ
  2-3 entry lân cận), tìm thấy 1 pattern nhất quán: project cấp Confidence A cho **structural/
  definitional check** (tiền lệ `FUYIN_FANYIN_ACTIVATION_PROVENANCE`, phần "cung Dậu" của
  `MAOXING_PROVENANCE`) mà KHÔNG cần cross-check độc lập thêm, tách biệt hẳn với **value-selection
  formula có nhiều cách đọc khả dĩ** hoặc **computation pipeline có rủi ro lỗi implementation thật**
  (tiền lệ `GANZHI_PILLAR_CONSTRUCTION_PROVENANCE` giữ B dù tự nhận "phổ quát, không tranh cãi").
- WangShuai là **deterministic structural mapping** thuần: tra bảng Ngũ Hành cố định của Chi tháng
  (`Data.CHI_NGU_HANH`) → áp dụng quan hệ sinh/khắc cố định (`TrachNhat.getNguHanhQuanHe`, đã proven
  qua Phase 9/11-B) → ánh xạ 1-trong-5 quan hệ sang 1-trong-5 tên giai đoạn qua dictionary cố định.
  KHÔNG có bước "chọn nhánh giữa nhiều cách đọc" nào — khác hẳn các entry B như `SHEHAI_PROVENANCE`/
  `YAOKE_PROVENANCE`/`BIEZE_PROVENANCE`.
- Mapping đã được re-verify ĐỘC LẬP khớp 12/12 Chi với nguyên văn Algorithm Spec §11 (không suy từ
  chính code đang audit).
- **Không gán Confidence A chỉ vì implementation dùng utility đã proven** — kết luận A dựa trên
  PHÂN LOẠI ĐÚNG LOẠI CLAIM (structural check, theo đúng precedent đã xác lập trong project), cộng
  với việc semantics đã được re-verify độc lập, không phải niềm tin suông rằng "utility cũ chạy
  đúng nên cái mới cũng đúng".

---

## Decision 2 — sourceId

**GIỮ `sourceId: "wu-xing-wang-xiang-cycle-convention"`.**

Lý do:
- Đây là **source/convention identifier** (định danh ổn định cho VĂN BẢN/QUY ƯỚC NGUỒN), KHÔNG phải
  provenance identifier (`id: "PROV-WANG-SHUAI-STAGE"` giữ vai trò đó, 2 field tách biệt rõ, không
  bị đánh tráo).
- KHÔNG overclaim gán cho nguồn cổ điển cụ thể (六壬大全) như đa số entry khác — vì Algorithm Spec
  §11 tự mô tả đây là "lý thuyết Ngũ Hành **phổ quát**", không riêng của 1 cuốn sách/trường phái nào.
  Dùng `sourceId: "liu-ren-da-quan-siku"` mới là sai (gán nhầm 1 kiến thức phổ quát liên trường
  phái cho 1 nguồn cụ thể).
- Phù hợp đúng nội dung thực sự đã chứng minh (structural, phổ quát) — không phóng đại, không thu
  hẹp so với những gì audit đã xác nhận.

---

## Decision 3 — Error Handling

**GIỮ nguyên behavior hiện tại: `computeWangShuai()` không thêm explicit throw riêng.**

Lý do:
- Invalid input đã bị reject bởi guard sẵn có của `TrachNhat.getNguHanhQuanHe()` (đã test trực
  tiếp: input Chi không hợp lệ → ném lỗi, KHÔNG âm thầm trả kết quả sai).
- Behavior này nhất quán với các rule evaluator hiện hành cùng dùng `Data.CHI_NGU_HANH` trực tiếp
  (R-NHATTHAN-01, R-KIENTUNG-02) — cùng 1 quy ước "Chi là union đã đóng, không cần validate runtime
  riêng cho lookup nội bộ".
- Khác style với `computeYiMa` (có `YiMaError` riêng) — nhưng đây là **NON-BLOCKING STYLE
  CONSISTENCY GAP**, không phải correctness blocker, vì kết quả cuối cùng (ném lỗi, không silently
  sai) đã đúng. Có thể xử lý sau (thêm `WangShuaiError` riêng nếu cần) mà không ảnh hưởng đến bất kỳ
  hành vi đã freeze nào.

---

## Decision 4 — Provenance Notes

**KHÔNG sửa implementation/provenance file chỉ để bổ sung note.**

Ghi nhận:
- Thiếu trích dẫn tường minh tới precedent "structural check" (`FUYIN_FANYIN_ACTIVATION_PROVENANCE`/
  `MAOXING_PROVENANCE`) trong `notes` của `WANG_SHUAI_PROVENANCE` là 1 **documentation-hardening
  gap** — entry vẫn ĐÚNG và ĐẦY ĐỦ theo `ProvenanceEntry` schema, chỉ chưa tận dụng hết lý lẽ mạnh
  nhất sẵn có để tự bảo vệ khi bị audit lại trong tương lai.
- KHÔNG ảnh hưởng semantics hay confidence hiện tại (Decision 1 đã xác nhận A vẫn đúng dù notes
  chưa trích dẫn precedent này).
- Có thể cải thiện khi provenance file được chỉnh sửa vì lý do khác trong tương lai — không cần 1
  lượt sửa riêng chỉ cho việc này.

---

## Architecture Decision

A3 xác nhận tuân thủ ĐẦY ĐỦ architecture rule đã chốt ở A1 Freeze (`DA_LIU_REN_PHASE_11A1_FREEZE.md`
mục 4):

- Chỉ có pure `computeWangShuai(monthChi)` — không có gì khác.
- KHÔNG có `DaLiuRenChartWithWangShuai`.
- KHÔNG có `calculateDaLiuRenChartWithWangShuai`.
- KHÔNG sửa `DaLiuRenCalculationResult`.
- KHÔNG sửa thân hàm canonical `calculateDaLiuRenChart()`.
- KHÔNG wire `wangShuai` vào canonical chart facade ở Phase 11-A3.

A1's `calculateDaLiuRenChartWithKeType()` (grandfathered compatibility layer) vẫn giữ nguyên,
KHÔNG được dùng làm template cho A3 — A3 đã tuân thủ đúng: chỉ pure primitive, không facade mới.

---

## Kết luận

Cả 4 quyết định đều GIỮ NGUYÊN implementation hiện tại — không có quyết định nào yêu cầu sửa code.
2 finding non-blocking (Decision 3, Decision 4) được ghi nhận rõ ràng, không chặn freeze.

**A3 DECISIONS CLOSED.**
