# FINAL RECOMMENDATION

## "Nếu tôi là architect xây Astrology Module cho Phongthuy.vn hôm nay, tôi sẽ chọn..."

**Không dùng nguyên si bất kỳ repo nào làm nền tảng code.** Mọi repo có chất lượng kỹ thuật cao nhất (stellium, PyJHora, vedic-calc, openastrology-library, mayaastrolib, opastro) đều dính AGPL-3.0 hoặc phụ thuộc bắt buộc vào một thành phần AGPL/GPL (Swiss Ephemeris qua `pyswisseph`) — xem `LICENSE_AUDIT.md`. Quyết định đúng là: **cleanroom-build calculation/rule/interpretation layers, dùng các repo này làm oracle tham chiếu để validate độ chính xác**, và xử lý câu hỏi license Swiss Ephemeris một lần duy nhất ở tầng thấp nhất.

### FOUNDATION
- **Swiss Ephemeris**, truy cập qua **`pysweph`** (không phải `pyswisseph` — đã de facto abandoned, xem `SWISS_EPHEMERIS_AUDIT.md`). Đây là engine thiên văn duy nhất trong toàn bộ audit có độ chính xác, phạm vi ngày, số lượng hệ nhà (25) và ayanamsa (46) đủ cho một sản phẩm chuyên nghiệp — được xác nhận bằng thực thi trực tiếp trong phiên audit này.
- Cô lập nó sau một module/service nội bộ duy nhất (`astronomical-core`) để chứa toàn bộ rủi ro license ở một chỗ.

### REFERENCE (đọc để học kiến trúc/thuật toán, KHÔNG copy code)
- **stellium** — kiến trúc protocol-based engine-swap, bộ test ground-truth thật (NASA Horizons cross-check), full traditional-astrology layer (sect, dignity, profections, releasing, firdaria, primary directions).
- **opastro** — pipeline Chart→Factors→Rules→Interpretation hoàn chỉnh, xác định bằng thực thi, có cơ chế `explain` truy vết evidence — đây là bằng chứng sống rằng kiến trúc mục tiêu của Phongthuy.vn là khả thi.
- **mayaastrolib** — mẫu mypy/ruff-clean, golden test vs Skyfield/JPL độc lập với Swiss Ephemeris.

### VEDIC
- **PyJHora** làm validation oracle chính (24 varga, 30+ dasha, 3.104 test pass trực tiếp trong phiên này).
- **vedic-calc** làm oracle phụ + tham khảo phương pháp benchmark (99% cross-check với 2 API thương mại, công khai cả case fail).
- Không dùng code của cả hai — chỉ dùng số liệu đầu ra của chúng để validate engine tự viết.

### WESTERN
- **stellium** là tham chiếu kỹ thuật số 1; nếu không đàm phán được license AGPL/thương mại, dùng kiến trúc của nó (protocol-based engine, dignity table cấu trúc theo nguồn cổ điển có trích dẫn) làm khuôn mẫu để viết lại độc lập.

### INTERPRETATION
- **opastro's `FactorDetail`/`SectionInsight`/`explain` pattern** — bản thiết kế factor→rule→evidence→text tốt nhất tìm được trong toàn bộ audit.

### AI
- Kiến trúc bắt buộc: `Chart → Factors → Rules → Evidence → Scoring → Interpretation → LLM → Report` (xem `ARCHITECTURE_PROPOSAL.md`). LLM CHỈ đánh bóng văn phong từ nội dung đã được tính toán/luật hóa sẵn — không bao giờ tự suy luận chiêm tinh. **astro-natal-chart và zodiac-engine là hai ví dụ phản diện cụ thể, đã kiểm chứng bằng code thật**, nên dùng để giải thích cho stakeholder tại sao "Chart→LLM" là kiến trúc yếu.

### LICENSE
- **Cần xử lý ngay từ đầu, không phải sau cùng**: liên hệ Astrodienst AG để hỏi giá **Swiss Ephemeris Professional License** cho một SaaS thương mại đóng nguồn. Đây là chi phí/quyết định pháp lý bắt buộc phải có trước khi launch, bất kể chọn kiến trúc nào — không có lựa chọn ephemeris thay thế nào trong audit này có độ chính xác tương đương mà không dính cùng vấn đề license.
- Riêng `jyotish-flutter-library-fork`: phát hiện văn bản diễn giải sao chép nguyên văn từ PyJHora (AGPL) dán nhãn MIT — **không dùng bất kỳ dòng text diễn giải nào từ repo này**.

### CUSTOM DEVELOPMENT (bắt buộc tự xây, không có repo nào cung cấp sẵn ở chất lượng dùng được)
1. **Timezone/DST resolution layer** — không repo nào xử lý tốt; Swiss Ephemeris hoàn toàn không biết gì về timezone.
2. **Data-driven rules engine** — mọi repo audit đều hardcode luật yoga/dignity bằng if/else; đây là cơ hội cải tiến rõ ràng nhất.
3. **Birth-data input validation layer** — không repo nào validate đầy đủ (lat/lon/date bounds); phải tự xây trước khi nhận input từ người dùng thật.
4. **Bát Trạch / Huyền Không / Tử Vi / Bát Tự content** — hoàn toàn không có trong bất kỳ repo Tây/Ấn nào; đây vốn đã là domain riêng của Phongthuy.vn, không liên quan tới các repo chiêm tinh phương Tây/Ấn Độ đã audit.
5. **Vietnamese-language interpretation content** — không repo nào có tiếng Việt (PyJHora có 6 ngôn ngữ, không có tiếng Việt).
6. **AI-narrative grounding contract** — cơ chế ép LLM chỉ diễn giải chứ không tự suy luận, chưa tồn tại đầy đủ ở bất kỳ đâu; opastro là điểm khởi đầu tốt nhất để mở rộng.

---

## Trả lời 12 câu hỏi Executive Summary (xem thêm `EXECUTIVE_SUMMARY.md` cho bản đầy đủ)

Xem `EXECUTIVE_SUMMARY.md`.
