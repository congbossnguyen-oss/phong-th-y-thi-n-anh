# EXECUTIVE SUMMARY

Deep audit of 13 astrology/ephemeris repos for the Phongthuy.vn Astrology Module. Method: cloned every repo locally, read source code directly (not READMEs), and **actually executed** 9 of 10 non-core repos plus Swiss Ephemeris/pyswisseph/pysweph against a fixed technical benchmark (1985-03-12 08:30, Hanoi, 21.0285°N/105.8542°E, UTC+7) in fresh virtual environments. Full detail lives in the other files in this folder; every claim below cites back to `raw/<repo>.md` or `SWISS_EPHEMERIS_AUDIT.md`.

## 1. Repo nào tốt nhất cho astronomical calculation?
**Swiss Ephemeris**, accessed via **`pysweph`** (the actively-maintained fork; `pyswisseph` is de facto abandoned — last commit 2024, per its own successor's README). 25 house systems, 46 ayanamsas, JPL DE441-grade precision, all confirmed by direct source read and live execution. See `SWISS_EPHEMERIS_AUDIT.md`.

## 2. Repo nào tốt nhất cho Western?
**stellium** — broadest correct feature set (17 house systems, full traditional dignities, sect, profections, zodiacal releasing, firdaria, primary directions, arabic parts, returns/synastry/transits), best test rigor (NASA Horizons cross-checks), cleanest architecture. Gated entirely on resolving its AGPL-3.0-or-later license.

## 3. Repo nào tốt nhất cho Vedic?
**PyJHora** for raw feature depth and correctness rigor (24 vargas, 30+ dasha systems, 3,104 tests observed passing live in this audit) — but AGPL-blocked, so use only as a validation oracle. **vedic-calc** is the best *validated* alternative (disclosed 99% cross-check against 2 commercial APIs, most complete independently-verified KP engine of any repo audited) — also AGPL-blocked.

## 4. Repo nào tốt nhất cho Traditional/Hellenistic?
**stellium**, by a wide margin — it is the only repo in the entire audited set implementing sect, essential/accidental dignity, terms, decans, profections, zodiacal releasing, firdaria, primary directions, and Hyleg/Alcocoden length-of-life together. No dedicated Hellenistic-only repo was found or is recommended as a separate acquisition.

## 5. Repo nào tốt nhất cho interpretation?
**opastro** — the only repo in the audit with a real, execution-verified Chart→Factors→Rules→Interpretation pipeline (deterministic, SHA-256-seeded, golden-snapshot tested) and a working `explain` command that traces every output sentence back to its source factor. Its own code is MIT, but its mandatory `pyswisseph` dependency is AGPL — reuse its *architecture*, not its code.

## 6. Repo nào tốt nhất cho AI interpretation?
**None of the 10 do this well.** opastro deliberately has zero LLM (the strongest of the three because it never overclaims). astro-natal-chart and zodiac-engine both implement the "Chart→LLM" anti-pattern the target architecture explicitly wants to avoid — zodiac-engine's interpretation API is also confirmed broken by direct execution (Pydantic schema mismatch). See `AI_ARCHITECTURE_AUDIT.md` for the full trace of all three.

## 7. Repo nào có test tốt nhất?
**mayaastrolib** for cross-*implementation* rigor (golden tests vs. independent Skyfield/JPL ephemeris, not just self-consistency) and **vedic-calc** for cross-*service* rigor (disclosed 99% pass rate against two commercial astrology APIs, failures itemized not hidden). **PyJHora** for sheer volume of textbook golden-value tests (3,104 observed passing live). All three materially exceed the open-source-astrology norm of "doesn't crash" smoke testing.

## 8. Repo nào có architecture tốt nhất?
**stellium** — protocol-based, engine-swappable design that let every subsystem (ephemeris, houses, aspects, orbs, directions) be independently replaced; confirmed structurally by direct source reading, not just by the maintainer's own description.

## 9. Repo nào phù hợp commercial web?
**None as-is.** Every technically strong repo is AGPL-blocked or has an unresolved license (see `LICENSE_AUDIT.md`). The only fully clean license in the set is **astrology-engine** (MIT) — but it is too shallow (no traditional-astrology layer, no progressions/returns, broken default install instructions) to serve as a foundation. **The only actually-recommended path is a cleanroom build**, validated against the AGPL repos as oracles, with a Swiss Ephemeris Professional License purchased for production.

## 10. Repo nào tuyệt đối không nên dùng?
Không repo nào bị xếp Tier E (Avoid) hoàn toàn, nhưng **astro-natal-chart** và **zodiac-engine** không nên dùng làm nền tảng dưới bất kỳ hình thức nào: astro-natal-chart có bug đường dẫn cứng khiến crash trên mọi máy khác ngoài máy tác giả (đã tái hiện bằng thực thi), không có LICENSE thật, dùng binary Swiss Ephemeris đã biên dịch sẵn không rõ nguồn gốc. zodiac-engine có API interpretation lỗi xác nhận bằng thực thi, không có LICENSE, và lỗ hổng XSS/prompt-injection thực sự (render output LLM bằng Jinja2 `| safe`).

## 11. Có nên fork repo nào không?
**Không.** Mọi repo đủ tốt kỹ thuật để đáng fork đều dính AGPL (stellium, PyJHora, vedic-calc, openastrology-library) hoặc có vấn đề pháp lý riêng (jyotish-flutter-library-fork chứa văn bản PyJHora AGPL dán nhãn MIT). Fork bất kỳ repo AGPL nào vào một sản phẩm đóng nguồn thương mại sẽ kích hoạt nghĩa vụ AGPL §13 (network-use copyleft). Khuyến nghị: đọc để học thuật toán, viết lại độc lập.

## 12. Có nên dùng nhiều repo kết hợp không?
**Có, nhưng chỉ ở vai trò oracle/tham chiếu, không phải dependency runtime.** Cách dùng đúng: chạy PyJHora + vedic-calc + stellium + Swiss Ephemeris song song trong môi trường dev/CI để tạo bộ golden-value cross-validation cho engine tự viết (đúng phương pháp vedic-calc đã tự làm với 2 API thương mại) — không import code của chúng vào runtime sản phẩm.

---

## Top risks

1. **License (highest severity, affects almost every repo)**: Swiss Ephemeris's AGPL-or-Professional-License fork in the road reaches nearly every calculation-capable repo audited, directly or transitively. See `LICENSE_AUDIT.md`.
2. **jyotish-flutter-library-fork's AGPL-derived text under an MIT label** — a distinct, independent legal risk from the Swiss Ephemeris question.
3. **No audited repo validates birth-data input or handles timezone/DST resolution adequately** — both are 100% custom-build responsibilities regardless of calculation backend chosen.
4. **Every rule engine audited is hardcoded conditionals, not data-driven** — building hundreds of yogas/aspect-rules by hand does not scale; budget for a declarative rule engine from day one.
5. **The "Chart→LLM" anti-pattern is concretely demonstrated as broken** (zodiac-engine's interpretation API has a live-reproduced bug) — do not replicate this shape.

## Open questions requiring further action

- Swiss Ephemeris Professional License actual cost/terms from Astrodienst AG — **UNKNOWN / NOT VERIFIED** in this audit (must contact astro.com directly).
- Full-precision Swiss Ephemeris accuracy (with real `.se1` data files, not Moshier fallback) was not independently re-benchmarked in this pass — the multi-GB official data set was out of scope; see `BENCHMARK.md` "What was NOT benchmarked."
- jyotish-flutter-library-fork's numeric output could not be verified at all (no Dart/Flutter runtime available in this environment) — static source reading only.
- True commit cadence/contributor count for 8 of 10 repos could not be confirmed beyond a single shallow-clone commit; several maintenance classifications rely on in-repo CHANGELOG self-reporting rather than live GitHub history (flagged individually in each `raw/<repo>.md` §Maintenance).

## Final decision

See `RECOMMENDATION.md` for the complete "if I were the architect today" decision, and `ARCHITECTURE_PROPOSAL.md` for the proposed layered module design, data model, and traceability mechanism. This audit report — all 13 files in this folder — is designed to be handed directly to a subsequent implementation task ("BUILD ASTROLOGY MODULE FOR PHONGTHUY.VN") without needing to re-research the landscape.
