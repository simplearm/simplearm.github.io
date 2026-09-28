# Design and chart selection

The existing site is the design anchor: system sans-serif typography, white/near-black backgrounds, centered paper identity, restrained buttons and automatic dark mode. Warm orange is used sparingly for SimpleARM and memory-related emphasis, echoing the supplied teaser. Author names and affiliations are unchanged.

## Candidate audit

| Data / reader question | Candidates considered | Selected and reason |
| --- | --- | --- |
| Four methods, overall or four task suites | L2 Dot Cascade; L15 Ballot Tally; F5 Tick Rows | F5 preserves a zero-based common scale, explicit values and compact horizontal labels. L2's vertical labels suit shorter names; L15's hundred-unit tally occupies more space and makes the four precise values slower to compare. |
| Ten matched ablations | L4 Arc Matrix; F6 Paired Rungs; F12 Dumbbell Queue | F12 shows both actual control and ablated outcome with their difference along one positional scale. L4's matrix/area encoding makes close percentages less legible; F6 repeats two substantial bars per row and requires more space. Two semantically defined groups keep all ten rows readable. |
| Three Recent strategies and evaluation-seed variability | L2 Dot Cascade; F5 Tick Rows; F1 Rung Bars | F1 supports a zero baseline, exact caps and conventional SD whiskers. L2 does not accommodate these labels and whiskers as cleanly; F5 is valid but would repeat the main benchmark's horizontal form. |

## Adaptation

The charts adapt the data encodings and SVG construction patterns from the selected Lieflat Charts templates. They use the project's system font, theme colors, margins and simple surfaces rather than importing the gallery's display theme. All render in plain SVG without a CDN.

- F5: one clipped tick per percentage point, fixed 0–100% scale, two-decimal labels. A fractional value is clipped at its exact endpoint.
- F12: matched endpoint positions on a labelled 50–75% axis, one-pp bead spacing, exact endpoint values, signed deltas, concentric markers at zero difference. The axis is labelled as a position axis; no bar implies a zero baseline.
- F1: one rung per pp, fixed 0–40% scale, cap at the exact fractional value, sample-SD whiskers only in mean mode.

## Interaction and accessibility

- Benchmark suite controls update the chart, difference and explanatory sentence together. Negative comparisons remain negative.
- Ablations switch between maintained state and memory access; an exact table includes all ten rows.
- Recent results switch between the mean and three individual evaluation seeds.
- The real task sequence is scrubbed with a keyboard-operable range input and seven labelled moment buttons. Optional playback stops at the final moment, on manual selection, or when the page is hidden.
- Charts include descriptive SVG titles/labels and downloadable data. Native controls, visible focus indicators, a skip link and table headers provide keyboard/accessibility support.
- Animations are short reveals, respect reduced-motion settings and never alter values. No automatic video playback.
- On narrow screens the layout stacks; dense benchmark/ablation charts and tables scroll inside their own container instead of widening the page.
