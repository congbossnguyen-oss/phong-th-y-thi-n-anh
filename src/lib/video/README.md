# Chuẩn bị video khóa học (HLS + mã hóa AES-128)

Video khóa học được mã hóa trước khi upload lên Cloudflare R2, để dù ai đó lấy được link cũng không xem/tải được nếu không có khóa giải mã (khóa chỉ cấp cho học viên đã đăng nhập + đã ghi danh, xem `src/pages/api/courses/video-key.ts`).

## Yêu cầu

Cài **FFmpeg** trên máy (một lần):
- Windows: tải tại [ffmpeg.org/download.html](https://ffmpeg.org/download.html), hoặc `winget install ffmpeg`
- Kiểm tra đã cài xong: mở terminal, gõ `ffmpeg -version`

## Các bước xử lý 1 video bài học

Giả sử đang chuẩn bị bài **"gioi-thieu-khoa-hoc"** thuộc khóa **"nhap-mon-phong-thuy"**, file gốc là `input.mp4`.

```bash
# 1. Sinh khóa AES-128 ngẫu nhiên (16 byte)
openssl rand 16 > lesson.key

# 2. Lấy khóa dạng chữ-số (hex) để dán vào code sau này
KEY_HEX=$(xxd -p lesson.key | tr -d '\n')
echo "KEY_HEX: $KEY_HEX"

# 3. Sinh IV ngẫu nhiên
IV_HEX=$(openssl rand -hex 16)

# 4. Tạo file keyinfo.txt — dòng 1 là địa chỉ API cấp khóa thật trên website
#    (đổi "phongthuythienanh.vn" thành domain thật khi đã có)
cat > keyinfo.txt <<EOF
https://phongthuythienanh.vn/api/courses/video-key?course=nhap-mon-phong-thuy&lesson=gioi-thieu-khoa-hoc
lesson.key
$IV_HEX
EOF

# 5. Mã hóa + cắt video thành HLS (đoạn 10 giây/file)
ffmpeg -i input.mp4 \
  -codec: copy \
  -start_number 0 \
  -hls_time 10 \
  -hls_list_size 0 \
  -hls_key_info_file keyinfo.txt \
  -f hls \
  playlist.m3u8
```

Kết quả sinh ra: `playlist.m3u8` + nhiều file `segment0.ts`, `segment1.ts`, ...

## Upload lên R2

Trong Cloudflare Dashboard → R2 → bucket `thien-anh-khoa-hoc`, tạo thư mục đúng theo đường dẫn:

```
nhap-mon-phong-thuy/gioi-thieu-khoa-hoc/playlist.m3u8
nhap-mon-phong-thuy/gioi-thieu-khoa-hoc/segment0.ts
nhap-mon-phong-thuy/gioi-thieu-khoa-hoc/segment1.ts
...
```

Bucket chứa HLS cần **bật Public Access** (Settings → Public Access → Allow Access, hoặc gắn custom domain) — các file `.ts` mã hóa nên public cũng an toàn vì không có khóa thì không giải mã được, chỉ mỗi khóa (`KEY_HEX`) là cần giữ kín.

## Gán khóa vào code

Gửi giá trị `KEY_HEX` (chuỗi 32 ký tự) cho Claude, hoặc tự thêm vào `src/lib/placeholder-courses.ts`:

```ts
{ slug: "gioi-thieu-khoa-hoc", title: "Giới thiệu khóa học", durationLabel: "5:20", hlsKeyHex: "abcd1234...(32 ký tự)" }
```

(Khi kết nối Sanity CMS thật, trường này chuyển thành field `r2VideoKey`/khóa tương ứng trong Sanity Studio thay vì sửa code tay.)

## Biến môi trường cần có

```
PUBLIC_R2_HLS_BASE_URL=https://pub-xxxxxxxx.r2.dev
```

(Hoặc URL custom domain nếu đã gắn cho bucket — lấy trong Cloudflare Dashboard → R2 → bucket → Settings → Public Access.)
