# SimpleARM project website

A static academic project page for **Simple Agentic Memory for Generalist Robot Policies**, designed for GitHub Pages at <https://simplearm.github.io>.

The page preserves the original site's typography, centered author block, restrained palette and automatic dark mode. It adds the supplied website teaser, a seven-moment recorded task walkthrough, interactive benchmark and ablation charts, Recent sampling results, and downloadable data.

## Preview

No package installation or build service is needed:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open <http://127.0.0.1:8765>. The site also works by opening `index.html` directly; the chart data is provided as a local JavaScript asset as well as downloadable JSON.

## Content and data

- `index.html`: English project narrative, method, experiment scope and download links.
- `assets/site.css`: responsive layout, system/explicit light and dark themes, reduced-motion support.
- `assets/site.js`: dependency-free SVG charts and the recorded episode walkthrough.
- `assets/images/web_teaser.svg`: supplied website-only teaser, copied without changes.
- `assets/images/panel_*.png`: seven front-camera crops from the documented qualitative ButtonUnmaskSwap trace.
- `assets/data/results.json`: all chart values, settings, trace captions and source references.
- `assets/data/*.csv`: task-level benchmark, matched ablations and Recent evaluation summaries.
- `docs/data-notes.md`: provenance and interpretation of the three experiment families.
- `docs/design-notes.md`: chart selection and interaction design.

The website does not package raw logs, checkpoints, credentials or server paths. The public result archive is linked for episode-level data. The paper link remains “coming soon” until a public manuscript URL is provided.

## Rebuild and validate

When the source research workspace is available next to this repository:

```sh
python3 scripts/build_data.py --source-root ../agent_robomem
```

Generated data is checked into the repository, so publication does not depend on that workspace.

```sh
python3 scripts/validate.py
node --check assets/site.js
```

Manual browser checks cover the suite tabs (including Counting's negative difference), both ablation groups, Recent seed switching, the trace slider and playback, data downloads, theme toggling and narrow-screen layout.

## Credits

Chart patterns are adapted from Lieflat Charts / `web-presentation-charts` by **躺在废墟里** for this academic research website. See [third-party notices](docs/third-party-notices.txt). No external chart library, web font, analytics service or tracking script is loaded.
