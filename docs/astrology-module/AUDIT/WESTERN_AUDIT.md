# WESTERN ASTROLOGY AUDIT

Scope: openastrology-library, stellium, astrology-engine, mayaastrolib (Western half), opastro, astro-natal-chart, zodiac-engine. All findings cite `raw/<repo>.md` for evidence; nothing here is asserted without a source-code or execution citation in that file.

## Zodiac (Tropical / Sidereal)

| Repo | Tropical | Sidereal + ayanamsas |
|---|---|---|
| stellium | Yes | Yes — Lahiri, Fagan-Bradley, Raman, etc. (position calc only; Vedic *technique* layer explicitly NOT built — TODO.md) |
| openastrology-library | Yes (Western calculator) | Yes (Vedic calculator) — Lahiri, Raman, Krishnamurti, Yukteshwar, JN Bhasin, Babylonian, True Citra/Revati/Pushya |
| mayaastrolib | Yes (default) | Yes — Lahiri, Krishnamurti(KP), Raman, Fagan-Bradley (4 total) |
| astrology-engine | Yes | **NOT PRESENT** |
| opastro | Yes | Yes — Lahiri default, `swe.SIDM_LAHIRI` |
| zodiac-engine | Yes (core API) | Yes but **visualization-endpoint only**, not wired into the core natal-chart calculation endpoint |
| astro-natal-chart | Yes (default, only) | NOT PRESENT |

## Planets (Sun→Pluto) and points

All 7 repos compute the classical 10 (Sun–Pluto). Beyond that:

| Point | Repos supporting it |
|---|---|
| North/South Node (true or mean, switchable) | stellium, openastrology-library, mayaastrolib (mean only), opastro, zodiac-engine, astro-natal-chart, astrology-engine |
| Chiron | stellium (bundled ephemeris, works OOTB), mayaastrolib, opastro, zodiac-engine, openastrology-library (needs `.se1`); **astrology-engine claims it but it silently fails** (no bundled ephemeris file, bare `except: pass` swallows the error) |
| Lilith (Mean Apogee) | stellium, openastrology-library, mayaastrolib, opastro; **NOT PRESENT** in astrology-engine |
| Vertex | stellium, mayaastrolib; **NOT PRESENT** in openastrology-library, astrology-engine |
| Part of Fortune / other Arabic Parts/Lots | stellium (full catalog: Fortune, Spirit, Eros, Necessity, Courage...), opastro (Fortune + Spirit); **NOT PRESENT** in openastrology-library, astrology-engine, astro-natal-chart, zodiac-engine, mayaastrolib |
| Asteroids (Ceres/Pallas/Juno/Vesta) | stellium (34 bodies opt-in incl. named asteroids/centaurs/TNOs); opastro (auto-probed); **NOT PRESENT** in openastrology-library, mayaastrolib, astrology-engine |
| Fixed stars | stellium, opastro (both via `sefstars.txt`); not implemented in the others |

## Aspects

| Repo | Major | Minor | Orb model | Applying/separating |
|---|---|---|---|---|
| stellium | Yes | Yes + arbitrary harmonics (H5/H7/H9) + declination (parallel/contraparallel) | Historically-sourced (Lilly 1647, Ptolemy *Tetrabiblos*), moiety-based | Yes — analytical relative-velocity method |
| openastrology-library | Yes | semi-sextile, semi-square, quintile, sesquiquadrate, biquintile, quincunx | Fixed per-aspect-type table | Yes — heuristic |
| mayaastrolib | Yes | semisextile, semiquintile, semisquare, quintile, sesquiquintile, sesquisquare, biquintile, quincunx | **Per-planet orbs** (Ptolemaic-style: Sun 15°, Moon 12°, etc.) | Yes, incl. Stationary detection |
| astrology-engine | Yes | quincunx, semi-square, sesquiquadrate | Fixed per-aspect-type | **NOT PRESENT** |
| opastro | Yes | semi-sextile, semi-square, sesquiquadrate | Configurable | Not explicitly detailed |
| astro-natal-chart | 5 major + semisextile, semisquare, quincunx (8 total) | — | Fixed | Not present |
| zodiac-engine | Yes (via Kerykeion) | Yes, incl. quintile | Kerykeion defaults | Not audited in depth |

**Only stellium and mayaastrolib implement historically-grounded, per-planet or cited orb tables** (Lilly/Ptolemy, or classical Ptolemaic weights); every other repo uses a flat per-aspect-type orb, which is simpler but less traditionally rigorous.

## Dignity

| Repo | Domicile | Exaltation | Detriment | Fall | Notes |
|---|---|---|---|---|---|
| stellium | Yes | Yes (+ exact-degree bonus) | Yes | Yes | Plus triplicity, Egyptian/Lilly/Tetrabiblos terms, Chaldean/triplicity decans, accidental dignities |
| mayaastrolib | Yes | Yes | Yes | Yes | Table-driven (`ESSENTIAL_DIGNITIES`), plus 3 term-table variants, plus accidental dignities |
| openastrology-library | Yes | Yes | Yes | Yes | Includes modern outer-planet rulerships |
| astrology-engine | Rulers table only | **NOT PRESENT** | **NOT PRESENT** | **NOT PRESENT** | Self-documented placeholder comment: "Dignities... placeholder" |
| opastro / astro-natal-chart / zodiac-engine | Not implemented as a discrete rule layer | — | — | — | |

## Traditional / Hellenistic astrology

**Only stellium implements a real traditional-astrology layer.** Confirmed present: sect (day/night determination via geometric horizon test), essential dignity (domicile/exaltation/triplicity/terms/decans/detriment/fall), accidental dignity, mutual reception, profections, zodiacal releasing, firdaria, primary directions (Ptolemy/Naibod keys, full spherical-astronomy math), arabic parts/lots (sect-aware), length-of-life (Hyleg/Alcocoden), almuten. None of the other 6 Western repos implement any of: sect, terms/bounds, decans, profections, zodiacal releasing, or lots — this is not a close contest.

**No repo audited implements Hellenistic-specific timing techniques (annual profections combined with Zodiacal Releasing peak-period narration, etc.) beyond stellium's raw calculation primitives** — even stellium's own maintainer flags Zodiacal Releasing as mid-rewrite in TODO.md.

## Transit / Synastry / Progression / Returns

| Repo | Transits | Synastry | Progressions | Returns |
|---|---|---|---|---|
| stellium | Yes | Yes | Yes (secondary + solar arc) | Yes (solar + lunar) |
| openastrology-library | Yes (sign-ingress only) | **NOT PRESENT** | **NOT PRESENT** | **NOT PRESENT** |
| astrology-engine | Yes (incl. transit-to-natal) | Yes | **NOT PRESENT** (README roadmap item) | **NOT PRESENT** (README roadmap item) |
| mayaastrolib | Partial (only via Sade Sati/Ashtakavarga kakshya-transit, no general module) | **NOT PRESENT** | Primary directions only (no secondary) | Solar return only (Western); no lunar return |
| opastro | Yes (ingress/station/lunation/eclipse windows) | Yes (two-chart aspect scoring + house overlays) | **NOT PRESENT** | **NOT PRESENT** |
| zodiac-engine | **NOT PRESENT (501 stub)** | **NOT PRESENT for calculation (501 stub)**, report text + SVG only | **NOT PRESENT** | **NOT PRESENT** |
| astro-natal-chart | **NOT PRESENT** | **NOT PRESENT** | **NOT PRESENT** | **NOT PRESENT** |

**stellium is the only repo that implements the full requested Western technique set (transit, synastry, progression, both return types) with working code, verified by execution.**

## Summary verdict for Western astrology

**stellium is decisively the strongest Western/traditional engine audited** — broadest correct feature set, best test rigor (ground-truth astronomical tests, not just internal-consistency checks), cleanest calculation/rule/interpretation separation — gated entirely on resolving its AGPL-3.0 license. If that cannot be resolved, the next-best *technical* references are **mayaastrolib** (for dignity-table design and mypy-clean architecture) and **openastrology-library** (for the TypeScript wrapping pattern and its 526-test golden-value suite, despite the Vedic/Western error-handling inconsistency it was caught shipping). **astrology-engine** is the only Western repo with a fully clean MIT license, but its feature depth is shallow (no traditional astrology layer at all) — usable only as a minimal reference for Julian-day/house-cusp plumbing, not as a foundation.
