# packages/ — bản sao vendor để deploy

4 package này (`calendar-core`, `engine-contract`, `rule-engine`, `trachnhat-engine`) là **bản sao (vendor copy)** của các package cùng tên nằm ở thư mục gốc monorepo huyền học (`../../calendar-core`, `../../rule-engine`, `../../engine-contract`, `../../trachnhat-engine` — một cấp trên `phong-thuy-thien-anh/`).

**Lý do có bản sao:** repo `phong-thuy-thien-anh` (git riêng, deploy qua Render) không bao gồm thư mục gốc monorepo đó (thư mục gốc không phải git repo, không push lên đâu cả). Để Render `npm install && npm run build` chạy được, 4 package phải nằm **bên trong** chính repo này.

**⚠️ Khi nào cần đồng bộ lại:** mỗi khi sửa `calendar-core`/`rule-engine`/`engine-contract`/`trachnhat-engine` ở vị trí gốc (thư mục monorepo), phải copy lại `src/` (+ `package.json`/`tsconfig.json` nếu đổi) vào đúng thư mục tương ứng trong `packages/` này rồi commit, nếu không bản deploy sẽ dùng code cũ. Không tự sửa trực tiếp code trong `packages/` ở đây — luôn sửa ở bản gốc rồi đồng bộ lại, tránh 2 nguồn sự thật lệch nhau.

Về lâu dài nên cân nhắc gộp hẳn 1 trong 2 hướng: (a) đưa toàn bộ monorepo huyền học vào làm 1 git repo bao trùm cả `phong-thuy-thien-anh`, hoặc (b) publish 4 package lên 1 npm registry riêng (kể cả private registry) để không cần vendor thủ công. Chưa làm ở đây vì ngoài phạm vi yêu cầu hiện tại (chỉ cần trang "Xem ngày tốt xấu" lên được).
