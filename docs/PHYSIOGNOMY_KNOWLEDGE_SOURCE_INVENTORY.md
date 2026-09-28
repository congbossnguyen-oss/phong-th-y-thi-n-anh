# Kiểm kê nguồn tri thức Nhân Tướng

```text
PHÂN LOẠI: PASS

0 nguồn nhân tướng VERIFIED trong repo.
KNOWLEDGE_SOURCES = Object.freeze({})  ←  giữ nguyên, đây là trạng thái ĐÚNG.

Test 2 884 PASS / 0 FAIL physiognomy / 5 expected-fail (160 tệp) · Build PASS.
Cổng đã siết sau audit — xem §8b.
```

Toàn bộ kết luận dưới đây rút từ việc **đọc tệp thật trong repo**. Không một dòng nào
lấy từ trí nhớ mô hình.

---

## 1. Verified Sources

```text
NONE
```

Không có nguồn nhân tướng nào đủ provenance để đăng ký.

---

## 2. Partial Sources

```text
NONE (cho miền nhân tướng)
```

Repo **có** 16 bản chép OCR thật, nhưng **không bản nào là nguồn nhân tướng**. Chúng
thuộc các miền khác và được liệt kê ở §3 để minh bạch.

---

## 3. Unverified References

### 3.1 Tìm kiếm tài liệu gốc — không có gì

| Loại | Kết quả |
|---|---|
| PDF · EPUB · DOC/DOCX · DJVU · MOBI | **0 tệp** ngoài `node_modules` |
| Thư mục scan ảnh trang sách | **0** (221 ảnh trong `public/`+`src/` đều là asset giao diện) |
| Thư mục `books/` · `sources/` · `corpus/` | **0** |

### 3.2 Mười sáu bản chép OCR có thật trong repo

Nhận diện bằng dấu `<!-- pages N-M -->` và `<!-- image -->` (dấu vết chuyển PDF→Markdown):

| Nhóm | Số tệp | Miền | Là nguồn nhân tướng? |
|---|---:|---|---|
| `handoff/knowledge/luan-giai-tu-vi-*/references/nguon-goc/` và `danh-muc-12-cung-144-cach-cuc/` | 6 | Tử Vi | **KHÔNG** |
| `docs/luan-so-dien-thoai-data/*.ocr.md` | 4 | Số điện thoại | **KHÔNG** |
| `docs/huyen-khong-phi-tinh/references/` | 2 | Huyền Không Phi Tinh | **KHÔNG** |
| còn lại | 4 | Tử Vi / Bát Tự | **KHÔNG** |

Bản chép Tử Vi Tam Hợp Phái tự khai trong `_index.md`:

> "2 file trong thư mục này là bản OCR đầy đủ, **chưa qua biên tập**, của 2 tập sách nguồn."

Tài liệu gốc: giáo trình **"Học Viện Phong Thủy Minh Việt"**, đóng dấu **"LƯU HÀNH NỘI
BỘ"**. Không có nhà xuất bản, không ISBN, không năm in trong bản chép. Locator thô nhất
là khối **50 trang** (`<!-- pages 101-150 -->`).

### 3.3 Claim nhân tướng DUY NHẤT tìm được — và vì sao không dùng được

Tìm thấy tại
`handoff/knowledge/luan-giai-tu-vi-tam-hop-phai/references/nguon-goc/tap-2-cach-cuc-tuan-triet-80-sao-tu-hoa.md`,
dòng 3171, trong khối `<!-- pages 101-150 -->`.

Nguyên văn (chép đúng, **không sửa lỗi OCR**):

> "Địa kiếp tọa Ở cung Sắc mặt xanh Thiên đình không đầy đặn; Địa các khuyết thiếu.
> **Theo Nhân tướng học; Thiên đình chủ về vận khí thời niên thiếu** vàng không […]
> Địa các là chỉ vận khí cuối đời phải cô độc"

Phân loại: **UNVERIFIED**. Năm lý do, mỗi lý do đủ để loại:

1. **Trích dẫn thứ cấp không nguồn.** "Theo Nhân tướng học" — không tên sách, không
   tác giả, không chương. Đây là sách Tử Vi *nhắc tới* tướng học, không phải sách tướng.
2. **Sai miền.** Claim thật của đoạn này là về sao Địa Kiếp ở cung Mệnh; tướng mạo chỉ
   là mô tả kèm.
3. **OCR hỏng nặng.** Câu đứt đoạn, bảng vỡ cấu trúc, "thyc tế", "dầy", "vàng không" —
   không thể coi là nguyên văn.
4. **Locator quá thô.** Khối 50 trang, không có số trang cụ thể.
5. **Không có hiện vật để đối chiếu.** Bản PDF gốc không nằm trong repo.

### 3.4 Các hit còn lại đều ngẫu nhiên

| Nơi | Chuỗi khớp | Thực chất |
|---|---|---|
| `sim-noi-gi-ve-ban.ocr.md` (13 hit) | "ngũ quan" | nghĩa **y học**: "tai mắt mũi miệng lưỡi" |
| `luan-giai-tu-vi-nam-phai/tap-3` | "Cự Môn \| Miệng, nhân trung" | bảng sao ↔ bộ phận cơ thể của Tử Vi |
| `src/lib/quan-su/kien-thuc/an-le/chunk-01,05.md` | "hào 5 là ngũ quan" | lục hào, không phải tướng |
| `src/pages/gieo-que-kinh-dich.astro` | "Ngũ Quan Thoát Nạn" | **tên quẻ** |
| `tap-2-*.md`, `tap-2-phu-mau-*.md` | "Nhân Tướng học" | mục trong **danh sách khoá học** của học viện |

### 3.5 Hán tự nhân tướng trong `src/` — là code của chính dự án

`三庭 五官 十二宫 面相 相法 丰隆 天庭 中庭 下庭 印堂 山根` → **6 tệp**, tất cả đều là
mã/tài liệu do phase trước viết:

- `geometry/index.ts`, `types/index.ts`, `features/schema.ts` — chú thích giải thích
  **vì sao KHÔNG đo** độ đầy đặn (丰隆/低陷)
- `tests/nhan-tuong-*.test.ts` — danh sách chuỗi **BỊ CẤM** xuất hiện

Theo §1C: *"Không coi search hit là source."* Đây là bằng chứng ngược lại — chúng là
lời cam kết không luận giải, không phải tri thức.

---

## 4. Source Gaps

Mọi vùng tri thức đều thiếu nguồn. Không vùng nào có một nguồn nào.

| Vùng | Cần gì để mở khoá | Ghi chú |
|---|---|---|
| **Tam Đình** (三庭) | định nghĩa mốc + tỉ lệ chuẩn, từ bản in | Feature `three_courts.middle` là ứng viên đo mạnh nhất nhưng **không có nguồn nói nó nghĩa gì** |
| **Ngũ Quan** (五官) | tiêu chuẩn từng quan | — |
| **Thập Nhị Cung** (十二宮) | vị trí + ý nghĩa từng cung | Bản đồ vùng đã kiểm bằng canonical mesh, nhưng **đo được** ≠ **có nguồn** |
| Dáng mặt · Ấn đường · Sơn căn · Nhân trung | toàn bộ | — |

**Điểm mấu chốt:** hệ thống hiện đo được 29 feature nhưng **không một phép đo nào có
nguồn nói nó mang ý nghĩa gì**. Đó chính là lý do `interpretationEligible = false` ở
khắp nơi, và nó sẽ đúng như vậy cho tới khi có bản in thật.

---

## 5. Evidence Counts

```text
verified sources:            0
partial sources:             0   (cho miền nhân tướng)
unverified references:       1   (§3.3 — claim thứ cấp trong sách Tử Vi)
verified evidence passages:  0

tài liệu OCR thật trong repo:      16   (đều thuộc miền khác)
tệp PDF/EPUB/scan nhân tướng:       0
```

---

## 6. Security / Provenance

| Kiểm | Kết quả | Bằng chứng |
|---|---|---|
| Không có trích dẫn bịa | **PASS** | quét toàn `src/`: 0 literal `citation`/`chapter`/`paragraph`/`scanPage` |
| Không có nguồn từ trí nhớ mô hình | **PASS** | registry rỗng; `evidenceRef` bắt buộc mới `verified` |
| Không có nguồn dự phòng ẩn | **PASS** | không `DEFAULT_SOURCE`, không `?? { sourceId … }` |
| Registry fail-closed | **PASS** | `hasVerifiedSource()` chỉ tra registry; truyền id bất kỳ đều `false` |
| Không tiêm được từ phía người gọi | **PASS** | bơm `sourceLookup: () => true` → engine vẫn tự tra và chặn `source_not_verified` |
| Bundle sạch fixture test | **PASS** | `TEST_FIXTURE_ONLY` · `INJECT_TEST` · `KNOWLEDGE_SOURCES` = 0 tệp trong `dist/` |

### Schema đã siết chặt hơn trong phase này

Bổ sung bốn trường theo §5 — chỉ làm cổng **chặt hơn**, không bao giờ lỏng hơn:

| Trường mới | Vì sao |
|---|---|
| `publisher` · `year` | phân biệt các bản in khác nhau của cùng tác phẩm |
| `locatorPolicy` | buộc khai trước tài liệu định vị bằng gì (`page` / `chapter_section` / `volume_chapter` / `scan_page`) |
| `evidenceRef` | **quan trọng nhất** — trỏ tới HIỆN VẬT (bản scan, mã thư viện). Không có hiện vật thì không thể `verified`. Đây chính là chỗ chặn nguồn sinh ra từ trí nhớ mô hình. |

`isUsableSource()` nay đòi đủ **bốn** điều, thiếu một là hỏng: đã đối chiếu bản gốc ·
định vị lại được **và khớp `locatorPolicy`** · có danh tính tối thiểu · hiện vật **mở
được** qua một `EvidenceResolver`. Xem §8b.

Type system bắt được ngay: fixture nguồn cũ trong `nhan-tuong-pipeline.test.ts` thiếu
4 trường mới → lỗi biên dịch, phải khai đủ mới chạy.

---

## 7. Tests

| Test | Nội dung | Kết quả |
|---|---|---|
| **A** | nguồn chưa xác minh không vào registry; registry đóng băng, ghi thêm lúc chạy vô hiệu | PASS |
| **B** | thiếu locator → không VERIFIED; `note` mơ hồ không tính; mốc phải KHỚP `locatorPolicy` (§8b GAP 1) | PASS |
| **C** | thiếu tiêu đề/trích dẫn/xuất xứ/**hiện vật** → không VERIFIED | PASS |
| **D** | không tiêm được nguồn giả: `hasVerifiedSource` chỉ tra registry; engine tự tra kể cả khi cổng feature bị ép mở | PASS |
| **E** | engine fail-closed khi registry rỗng — mọi luật `skipped`, `matched === null` | PASS |
| **F** | pipeline không đổi: **3 measured · 26 low_confidence · 0 unsupported · 0 validated · 0 eligible** | PASS |
| **G** | bundle production không chứa fixture nguồn chỉ dùng cho test | PASS |
| **H** | `locatorPolicy` phải khớp `locator` thật — 5 ca đúng, 5 ca lệch | PASS |
| **I** | `evidenceRef` có giá trị ≠ hiện vật có thật; không resolver → không VERIFIED | PASS |

```text
nhan-tuong-knowledge-source   17 PASS   (mới)
nhan-tuong-pipeline           39 PASS
Toàn bộ                    2 871 PASS / 0 FAIL / 5 expected-fail (160 tệp)
Build                         PASS (20.98s)
```

---

## 8. Files changed

```text
~ src/knowledge/physiognomy/source.ts        +4 trường, siết isUsableSource, +scanPage
~ tests/nhan-tuong-pipeline.test.ts          fixture nguồn khai đủ trường mới
+ tests/nhan-tuong-knowledge-source.test.ts  17 test A–G
+ docs/PHYSIOGNOMY_KNOWLEDGE_SOURCE_INVENTORY.md
```

`KNOWLEDGE_SOURCES` **vẫn rỗng**. Không thêm nguồn · không viết luật · không thêm
ngưỡng · không luận giải · không nối LLM · không đổi Feature Layer · không đổi
Measurement Contract · không đổi transport/session · không deploy · không commit.

---

## 8b. Siết cổng — đóng 4 GAP của audit

Bốn khoảng trống mà audit sau kiểm kê phát hiện, nay đã đóng. **Không thêm nguồn nào.**

### GAP 1 — `locatorPolicy` từng là trường CHẾT

Khai ra rồi **không nơi nào đọc**, nên một nguồn có thể khai `scan_page` mà đưa số
trang sách và vẫn qua. Nay có bảng hợp đồng `LOCATOR_REQUIRED` (dùng đúng 4 policy đã
có, **không phát minh thêm**):

| `locatorPolicy` | Trường `locator` BẮT BUỘC |
|---|---|
| `page` | `page` |
| `chapter_section` | `chapter` **hoặc** `section` |
| `volume_chapter` | `chapter` (trường này vốn ghi chú "Thiên/quyển/chương") |
| `scan_page` | `scanPage` |

`paragraph` và `note` **luôn** chỉ là tinh chỉnh thêm, không bao giờ đủ một mình.
Lệch → loại với mã `locator_policy_mismatch`.

### GAP 2 — `evidenceRef` có giá trị ≠ hiện vật có thật

Trước đây chỉ kiểm chuỗi khác rỗng. Hai chuyện đó khác nhau, nay tách hẳn:

```ts
type EvidenceResolution = "resolved" | "missing" | "unresolvable";
interface EvidenceResolver { readonly name: string; resolve(ref: string): EvidenceResolution }
const NO_EVIDENCE_RESOLVER = { name: "no-evidence-resolver", resolve: () => "unresolvable" };
```

**Repo KHÔNG có kho hiện vật, nên KHÔNG dựng resolver thật** — dựng một cái mà không có
hiện vật chính là thứ phase này cấm. Thay vào đó resolver là phụ thuộc **tiêm vào**, mặc
định **từ chối mọi thứ**.

Hệ quả có chủ đích: **không nguồn nào đạt VERIFIED cho tới khi cắm resolver thật** — kể
cả nguồn hoàn hảo về mọi mặt khác. Fail-closed theo cấu trúc, không phải theo may rủi.

`hasVerifiedSource()` và Rule Engine đều dùng mặc định này → **RULE ENGINE vẫn BLOCKED.**

### GAP 3 — `publisher` / `year`: TUỲ CHỌN CÓ CHỦ ĐÍCH

Có căn cứ trong repo, không phải suy đoán: tài liệu thật duy nhất tìm được là bản đóng
dấu **"LƯU HÀNH NỘI BỘ"** — không nhà xuất bản, không ISBN, không năm in (§3.2). Bắt
buộc hai trường này sẽ loại đúng loại tài liệu dự án cần nhất. Nay ghi rõ trong kiểu dữ
liệu **và** có test gọi thẳng cổng khẳng định `null` không loại nguồn.

### GAP 4 — bỏ test shape-only

Test cũ *"schema BẮT khai publisher/year/locatorPolicy"* chỉ kiểm **chuỗi có trong tệp
nguồn** — đúng thứ §2 của audit nói không chấp nhận. Đã thay bằng test gọi thẳng cổng.

Thêm `rejectSource()` trả **lý do** thay vì chỉ `true/false`, nên test khẳng định được
*hỏng ở đâu*:

```text
null_source · not_verified · locator_empty · locator_policy_mismatch
missing_title · missing_citation · missing_provenance · missing_evidence_ref
evidence_missing · evidence_unresolvable
```

Thứ tự kiểm cố ý: phân giải hiện vật là **cửa cuối**, nên thiếu thứ khác vẫn báo đúng
thứ thiếu trước.

**Trạng thái sau khi siết:** `VERIFIED SOURCES = 0`, `KNOWLEDGE_SOURCES = {}`,
`RULE ENGINE = BLOCKED`. Cổng đã cứng, **vẫn cần thu thập bằng chứng gốc.**

---

## 9. Muốn mở khoá thì cần gì

Không phải việc của mô hình. Cần **hiện vật**:

1. Bản in hoặc bản scan của một tác phẩm tướng pháp — trong tay, đọc được.
2. Ghi metadata **theo đúng bản đang cầm**: tác giả, nhà xuất bản, năm, lần in. Không
   truy nguyên hộ, không đoán.
3. `evidenceRef` trỏ tới bản scan/mã thư viện để người khác đối chiếu lại được.
4. Chép **nguyên văn** đoạn liên quan vào `text`. Chữ nào OCR không chắc thì đánh dấu
   `OCR_UNCERTAIN`, **không tự đoán**.
5. `locator` đủ chi tiết để người khác mở đúng trang đó.
6. Đặt `verificationStatus: "verified"` — chỉ sau khi đã làm đủ 1–5.

Cho tới lúc đó, `Object.freeze({})` là câu trả lời trung thực.
