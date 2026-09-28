# Phase 1D-3A — Chế độ thu dữ liệu nghiên cứu

**CÔNG CỤ NGHIÊN CỨU, CHỈ CHẠY Ở MÁY PHÁT TRIỂN.** Không deploy, không có trong bản
production. Mục đích duy nhất: gom đủ mẫu để chạy
[`PHYSIOGNOMY_FEATURE_REAL_DEVICE_VALIDATION.md`](PHYSIOGNOMY_FEATURE_REAL_DEVICE_VALIDATION.md).

> ⚠️ **Chưa công khai.** Bản thân chế độ này không mở gì ra Internet. Nhưng nó được
> thiết kế để dùng kèm một đường HTTPS mà điện thoại vào được — xem §8 trước khi bật
> bất cứ thứ gì.

---

## 1. Luồng không đổi

```text
Máy tính ──QR──> Điện thoại ──> 6 góc mặt + giọng nói
                                      ↓
                              Feature Layer (trên máy)
                                      ↓
                              Transport V1 (~5.6 KB)
                                      ↓
                              API phiên → KV
                                      ↓
                              Máy tính nhận ở lần poll cuối
```

Phase 1D-3A **chỉ thêm một nhãn** vào phiên và **một đường xuất dữ liệu**. Không đụng
QR, không đụng 6 bước, không đụng bước giọng nói, không đụng Feature Layer, không đụng
Transport, không đụng máy điều khiển ở luồng bình thường.

Người quét **không cần** terminal, curl, mã phiên, JSON hay API — chỉ quét QR như cũ.

---

## 2. Nhãn mẫu

```ts
{ participantId: "A", runNumber: 1, deviceLabel: "Pixel-8" }
      ↓ server tự dựng
{ sampleId: "A-01", ... }
```

`sampleId` **không nhận từ máy khách** — server dựng từ participant + run, nên nhãn
không bao giờ lệch.

### Không nhận thông tin cá nhân — chặn ở server

| Quy tắc | Giá trị |
|---|---|
| `participantId` | `^[A-Z0-9]{1,4}$` — mã nghiên cứu, **không đủ chỗ cho một cái tên** |
| `runNumber` | số nguyên 1..20 |
| `deviceLabel` | `^[A-Za-z0-9 ._-]{1,24}$`, mặc định `"unknown"` |
| Chặn thêm | có `@` (email) hoặc ≥7 chữ số liên tiếp (số điện thoại) → **từ chối** |
| Trường lạ | **từ chối**, không lặng lẽ bỏ qua |

`"Samsung-A55"` và `"iPhone-15"` qua được; `"Nguyen Van A"`, `"a@b.com"`,
`"0912345678"` bị từ chối. Có test cho từng trường hợp.

**Không đoán model máy.** Nếu người vận hành không biết thì để `unknown` —
user-agent không được coi là sự thật.

---

## 3. Bảng điều khiển (chỉ DEV)

Hiện dưới khu vực QR trên máy tính, viền đứt để không nhầm với giao diện khách.
Người vận hành **không cần** terminal, curl, mã phiên hay JSON.

```text
THU DỮ LIỆU NGHIÊN CỨU — CHỈ CHẠY Ở MÁY PHÁT TRIỂN            6/15 mẫu

Người  [A] [B] [C] [D] [E]      Lần  [1] [2] [3]      Máy [Pixel-8    ]

Lần 2 — cầm GẦN HƠN hoặc XA HƠN hẳn so với lần 1. Đổi rõ, đừng đổi nhẹ.

[Tạo phiên A-02]  [Tải dữ liệu người này]  [Xoá người này]

Người   Lần 1     Lần 2        Lần 3
A       ✓ xong    ● đang quét  ○ chưa
B       ○ chưa    ○ chưa       ○ chưa
C       ○ chưa    ○ chưa       ○ chưa
D       ○ chưa    ○ chưa       ○ chưa
E       ○ chưa    ○ chưa       ○ chưa
```

### Ba trạng thái

| | Nghĩa |
|---|---|
| `○ chưa` | chưa tạo phiên cho lần này |
| `● đang quét` | đã tạo phiên, QR đang hiện, chờ điện thoại xong |
| `✓ xong` | máy tính đã nhận `complete` kèm payload |

### Tự chuyển, không cần tải lại trang

Khi máy tính poll thấy phiên `complete`, `renderDone()` gọi `markSampleComplete()`:
ô tương ứng thành `✓ xong`, bộ đếm `n/15` tăng, và **lần chưa quét tiếp theo được chọn
sẵn** — nút đổi thành `Tạo phiên A-02`. Người vận hành chỉ việc bấm tiếp.

Xong cả 3 lần thì dòng hướng dẫn đổi thành lời nhắc tải dữ liệu rồi chuyển người.

### Chống trùng phiên

Một `sampleId` chỉ ứng với **một** bản ghi: tạo lại `A-01` thì bản cũ bị thay, không
sinh bản thứ hai. Nút tự đổi chữ để nói rõ chuyện gì sắp xảy ra —
`Tạo phiên A-02` · `Tạo lại A-02` (đang quét dở) · `Quét lại A-02` (đã xong).

Mỗi lần bấm luôn tạo **phiên mới hoàn toàn độc lập** ở server — không bao giờ dùng lại
phiên cũ.

### Bản đồ người → phiên

Nằm trong `localStorage` **của chính máy vận hành** (khoá `nt-collect-v1`).

**Vì sao không lưu ở máy chủ:** `SessionStore` chỉ tra được theo `sessionId`, không
liệt kê được. Thêm khoá index vào KV nghĩa là đụng vào đường ghi của production và
thêm một lượt ghi mỗi phiên. Đổi máy hoặc xoá cache thì mất nhãn — phiên vẫn còn trong
KV, chỉ mất liên kết. Chấp nhận được với một công cụ nghiên cứu.

## 4. Xuất dữ liệu

```text
GET /api/nhan-tuong/test-export?ids=<id1>,<id2>,<id3>
```

Xuất **theo danh sách sessionId**, không theo participant — lý do ở §3. Máy tính tự
ghép danh sách id từ bản đồ của nó. Tối đa 30 phiên mỗi lần.

```jsonc
{
  "exportVersion": "physiognomy-test-export-v1",
  "count": 3,
  "runs": [{
    "exportVersion": "physiognomy-test-export-v1",
    "sample": { "participantId": "A", "runNumber": 1, "sampleId": "A-01", "deviceLabel": "Pixel-8" },
    "sessionId": "7RTV4YAVJB",
    "createdAt": 1790…, "completedAt": 1790…,
    "featureStatus": "ok",
    "featureError": null,
    "featureProfile": { /* Transport V1 nguyên vẹn — 29 feature, đủ 8 trường provenance */ },
    "suggestedFileName": "A__run1.json"
  }]
}
```

Nút **Tải dữ liệu người này** tải về **một tệp cho mỗi lượt quét**, đặt tên theo
`suggestedFileName`. Tên đó khớp đúng cách
[`scripts/nhan-tuong-do-lai.mjs`](../scripts/nhan-tuong-do-lai.mjs) gom nhóm
(`<người>__<điều-kiện>.json`), nên **không phải sửa bộ đo** — mỗi lần quét là một cự ly
khác nhau, tức lần quét chính là điều kiện.

### Không xuất

ảnh · video · âm thanh · đối tượng MediaPipe · landmark thô · 6 snapshot thô ·
`writeToken` · thông tin cá nhân. Có test quét chuỗi cho từng thứ.

`sourceLandmarks` trong payload chỉ là **chỉ số** (`[193,417,48,278]`) — hằng số của
model, giống nhau ở mọi người.

---

## 5. Cổng production

**Cắt lúc build, không phải kiểm lúc chạy.** Vite thay `import.meta.env.DEV` bằng hằng
số, nên ở bản production thân xử lý bị tree-shake mất — endpoint **không tồn tại**,
chứ không phải "tồn tại rồi từ chối".

Handler thật trong bản build production:

```js
var GET = async ({ url }) => {
	return new Response("Not found", { status: 404 });
};
```

Không truy cập kho, không đọc tham số, không có gì.

### Đã kiểm bằng grep `dist/` sau khi build

| Chuỗi | Trong bản build |
|---|---|
| `physiognomy-test-export-v1` | **0** |
| `suggestedFileName` | **0** |
| `participantId phải là MÃ NGHIÊN CỨU` | **0** |
| `ntd-collect` · `nt-collect-v1` · `ntd-c-export` · `test-export?ids` | **0** |

### Hai lỗi bắt được trong chính phase này

1. **`export const EXPORT_VERSION` làm rò chuỗi ra bản production.** Một binding được
   export là API công khai của module, Vite phải giữ kể cả khi thân handler đã bị cắt.
   Sửa: bỏ `export`, để hằng số nằm hẳn trong nhánh DEV.
2. **Bọc DEV cho markup là chưa đủ.** Bản đầu chỉ bọc phần HTML của bảng điều khiển;
   `<script>` vẫn ship ra production (chạy vô hại vì không tìm thấy phần tử, nhưng là
   mã chết trong bundle, kèm cả khoá localStorage và URL endpoint). Sửa: bọc **toàn bộ
   khối script** trong `if (import.meta.env.DEV)`, dùng một biến móc để `start()` gọi
   ngược vào mà không giữ khối lại.

Cả hai chỉ lộ ra khi **grep bản build thật**. Đọc code không thấy được.

---

## 6. Ranh giới riêng tư

| | |
|---|---|
| Tên, email, số điện thoại, địa chỉ | **không thu** — server từ chối ở tầng kiểm |
| Ảnh mặt, video, âm thanh | **không thu, không lưu, không xuất** |
| Landmark thô (468 toạ độ) | **không rời máy khách** |
| `writeToken` | không lộ qua poll, không có trong bản xuất |
| Mã người tham gia | mã nghiên cứu A/B/C, không liên kết với danh tính nào |
| TTL | 15 phút, KV tự xoá |

Các tỉ lệ khuôn mặt là **template sinh trắc yếu**. Theo Nghị định 13/2023, dữ liệu sinh
trắc dùng để nhận dạng là dữ liệu cá nhân nhạy cảm. Vì vậy vẫn giữ TTL 15 phút và
không gắn với bất kỳ định danh khách hàng nào. Bản xuất là tệp nằm trên máy người vận
hành — **hãy coi nó như dữ liệu nghiên cứu, không gửi đi đâu**.

---

## 7. Quy trình thu mẫu

Mục tiêu: **5 người × 3 lượt = 15 mẫu**, trên **≥2 loại máy** (tiêu chí ở tài liệu
validation §7).

1. Máy tính mở `/nhan-tuong`. Chọn người **A**, nhập nhãn máy.
2. Bấm **Tạo phiên A-01** → QR hiện ra.
3. Người tham gia quét QR, làm 6 góc + giọng nói.
4. Máy tính tự chuyển ô thành `✓ xong` và chọn sẵn lần 2 — **không cần tải lại trang**.
5. Bấm **Tạo phiên A-02**, lặp cho lần 3. **Đổi rõ khoảng cách cầm máy mỗi lần** — cự
   ly là biến gây ra 7.56% lệch của `interocular_distance`, đừng giữ nguyên.
6. Bấm **Tải dữ liệu người này** → `A__run1.json`, `A__run2.json`, `A__run3.json`.
7. Bấm sang người **B**, lặp lại. Bộ đếm góc phải cho biết còn bao nhiêu (`n/15`).
8. Gom hết vào một thư mục rồi chạy:

```bash
node scripts/nhan-tuong-do-lai.mjs mau/
```

Bộ đo tự từ chối kết luận nếu chưa đủ 5 người — **thiếu mẫu thì nói thiếu mẫu**.

## 8. Đường truy cập cho điện thoại — CHƯA BẬT

Điện thoại cần **secure context** mới dùng được camera: `http://<LAN_IP>` **không**
đủ, chỉ `localhost` và HTTPS mới được.

| Cách | Ai vào được | Trạng thái |
|---|---|---|
| `http://localhost:4321` | chỉ máy tính này | đang dùng, E2E chạy trên đây |
| `http://<LAN_IP>:4321` | thiết bị cùng Wi-Fi | vào được trang, **camera bị chặn** |
| Android Chrome + cờ `unsafely-treat-insecure-origin-as-secure` | cùng Wi-Fi | không cần mở gì ra Internet |
| Cloudflare Quick Tunnel | **bất kỳ ai có URL** | **CHƯA BẬT** |

Quick Tunnel tạo một URL ngẫu nhiên trên Internet công cộng. URL không được liệt kê ở
đâu và tắt tunnel là chết, nhưng trong lúc chạy thì **bất kỳ ai biết URL đều mở được**.
Với iPhone thì đây là cách duy nhất (Safari không có cờ tương đương).

Tunnel lấy host từ biến môi trường `TUNNEL_HOST`, **không hard-code trong source**.
Tunnel khởi động lại thì URL đổi — chỉ cần đặt lại biến và khởi động lại dev server,
không phải sửa code. Xem
[`PHYSIOGNOMY_WEB_POC_HTTPS_TUNNEL.md`](PHYSIOGNOMY_WEB_POC_HTTPS_TUNNEL.md).

---

## 9. Những gì tuyệt đối không có ở đây

Rule Engine · Knowledge Base · LLM · luận giải nhân tướng · dự đoán sức khoẻ, tài lộc,
tính cách, vận mệnh · độ đầy đặn từ trục z · cung mới · đổi status feature.

**Chế độ này chỉ THU bằng chứng.** Số feature `measured` vẫn là 3 (ba trục tư thế) và
26 `low_confidence` — không đổi cho tới khi có dữ liệu thật để đổi.
