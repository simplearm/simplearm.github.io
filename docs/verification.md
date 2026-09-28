# Verification

## Automated

`python3 scripts/validate.py`, `node --check assets/site.js` and `git diff --check` passed.

The data check recomputes the main three-seed mean, sample SD and SEM; checks all suite means; verifies ten ablation deltas against both endpoint rates and discordant-pair counts; recomputes all Recent mean/SD/SEM values from the nine evaluation rounds; checks CSV/JSON parity; checks local links, unique HTML IDs and all seven image paths; and verifies the teaser and workflow PNG SHA256 values.

The generated public assets were checked for private keys and machine filesystem roots. The page packages only the requested teaser, clean task-image crops and structured display data. No raw log bundle, checkpoint or authentication material is included.

## Browser checks

Verified in the Codex in-app browser:

- Desktop layout at 1280px; mobile layout at 390px.
- Page content width equals viewport width at both sizes. Wide charts scroll within their own containers on mobile.
- Overall benchmark shows 67.17% and +22.66 pp; Counting switches to 57.00% and −8.22 pp; Permanence switches to +53.56 pp.
- Memory-access tab contains the four access interventions and clearly displays the source intervention's coincident endpoints and 0.00 pp delta.
- Recent seed23 shows 26.00%, 30.50%, 31.00%; mean mode restores sample-SD whiskers and its scope caption.
- Task and ablation tables contain 16 and 10 rows respectively.
- The real-episode moment controls update the image, memory readout and explanatory target overlays. Keyboard End on the slider reaches the final moment. Play and pause work, including restarting from the end.
- Light/dark toggle updates the palette and survives reload. Teaser and trace images load successfully.
- No new browser console errors appeared during page reload and interaction checks. An older browser-side message from before the website build remained in the tab's cumulative log.

The reduced-motion CSS disables chart animation and smooth scrolling. No autoplay or external runtime dependency is present.

## Requested website revision

- Rendered the supplied teaser SVG as a 3200 × 1333 PNG and the paper's actual `workflow_1.pdf` as a 3200 × 1537 PNG. Both were visually inspected.
- Compared the workflow caption in the page with `sections/method.tex`; the text matches exactly.
- Confirmed the hero has no linked teaser or statistic strip, the benchmark sidebar has no individual-seed scores, and the complete page has zero download links.
- Verified the short Conclusion, preserved three-step method explanation and walkthrough, and unchanged ablation/Recent charts.
- Checked the added figure at desktop and 390px mobile widths: no document overflow. Main-result controls still update the signed comparison correctly.
