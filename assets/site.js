/* Chart encodings adapted from Lieflat Charts by 躺在废墟里.
 * See docs/third-party-notices.txt. No runtime dependencies. */
(() => {
  'use strict';
  const data = window.SIMPLEARM_DATA;
  if (!data) return;
  const $ = (id) => document.getElementById(id);
  const ns = 'http://www.w3.org/2000/svg';
  const colors = { fg: 'var(--fg)', muted: 'var(--muted)', line: 'var(--line)', accent: 'var(--accent)', other: 'var(--chart-other)', bg: 'var(--bg)' };
  const f = (value, digits = 2) => Number(value).toFixed(digits);
  const signed = (value) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${f(Math.abs(value))}`;
  function svgNode(parent, name, attributes = {}, content) {
    const node = document.createElementNS(ns, name);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    if (content !== undefined) node.textContent = content;
    parent.append(node);
    return node;
  }
  function label(parent, x, y, content, attrs = {}) {
    return svgNode(parent, 'text', { x, y, fill: colors.muted, 'font-size': 14, ...attrs }, content);
  }
  function line(parent, x1, y1, x2, y2, attrs = {}) {
    return svgNode(parent, 'line', { x1, y1, x2, y2, stroke: colors.line, 'stroke-width': 1, ...attrs });
  }
  function chartStart(id, title, description, height) {
    const svg = $(id);
    svg.replaceChildren();
    if (height) svg.setAttribute('viewBox', `0 0 1000 ${height}`);
    svg.setAttribute('aria-label', `${title}. ${description}`);
    svgNode(svg, 'title', {}, title);
    svgNode(svg, 'desc', {}, description);
    return svg;
  }
  function animated(parent, i) {
    return svgNode(parent, 'g', { class: 'chart-enter', style: `animation-delay:${i * 55}ms` });
  }

  // F5 Tick Rows: fixed 0–100 scale; each clipped tick represents exactly 1 pp.
  let currentSuite = 'Overall';
  function drawBenchmark() {
    const suite = data.suites.find((row) => row.name === currentSuite);
    const methods = [['no_memory', 'No memory'], ['memer', 'MemER'], ['framesamp', 'FrameSamp'], ['simplearm', 'SimpleARM']];
    const description = methods.map(([key, name]) => `${name} ${f(suite[key])}%`).join('; ');
    const svg = chartStart('benchmark-chart', `${suite.name} success rate`, `${description}. Axis: 0–100%.`);
    const left = 135, width = 515, top = 29, rowGap = 59;
    const defs = svgNode(svg, 'defs');
    [0, 25, 50, 75, 100].forEach((v) => {
      const x = left + width * v / 100;
      line(svg, x, 7, x, 244);
      label(svg, x, 271, `${v}`, { 'text-anchor': 'middle', 'font-size': 13 });
    });
    methods.forEach(([key, name], i) => {
      const y = top + i * rowGap, value = suite[key];
      const color = key === 'simplearm' ? colors.accent : colors.other;
      const g = animated(svg, i);
      label(g, 0, y + 5, name, { fill: key === 'simplearm' ? colors.accent : colors.fg, 'font-size': 17, 'font-weight': key === 'simplearm' ? 650 : 450 });
      const clip = svgNode(defs, 'clipPath', { id: `benchmark-clip-${i}` });
      svgNode(clip, 'rect', { x: left, y: y - 15, width: width * value / 100, height: 30 });
      const ticks = svgNode(g, 'g', { 'clip-path': `url(#benchmark-clip-${i})` });
      for (let j = 0; j < 100; j++) {
        svgNode(ticks, 'rect', { x: left + j * width / 100, y: y - 12, width: width / 100 - 1.8, height: 24, rx: 1, fill: color });
      }
      label(g, 728, y + 5, f(value), { 'text-anchor': 'end', 'font-size': 18, 'font-weight': 600, fill: color, style: 'font-variant-numeric:tabular-nums' });
    });
    $('benchmark-title').textContent = `${suite.name === 'Overall' ? 'Overall' : suite.name} success rate`;
    $('suite-label').textContent = suite.name === 'Overall' ? 'All 16 tasks' : `${suite.tasks} ${suite.name.toLowerCase()} tasks`;
    const delta = suite.simplearm - suite.framesamp;
    $('suite-delta').replaceChildren(document.createTextNode(signed(delta)));
    const unit = document.createElement('span'); unit.textContent = 'pp'; $('suite-delta').append(unit);
    $('suite-insight-title').textContent = delta >= 0 ? 'over published FrameSamp' : 'relative to published FrameSamp';
    $('suite-description').textContent = suite.description;
  }
  document.querySelectorAll('[data-suite]').forEach((button) => {
    button.addEventListener('click', () => {
      currentSuite = button.dataset.suite;
      document.querySelectorAll('[data-suite]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      drawBenchmark();
    });
  });
  document.querySelector('[data-chart="benchmark"]').addEventListener('click', drawBenchmark);

  // F12 Dumbbell Queue: positions on an explicitly labelled 50–75% axis.
  // Numbers are also tabulated to keep small and coincident effects unambiguous.
  let currentGroup = 'state';
  function drawAblations() {
    const rows = data.ablations.filter((row) => row.group === currentGroup);
    const bottom = 55 + rows.length * 51;
    const desc = rows.map((row) => `${row.label}: full ${f(row.control_percent, 3)}%, ablation ${f(row.percent, 3)}%, difference ${signed(row.delta_pp)} pp`).join('; ');
    const svg = chartStart('ablation-chart', 'Matched full method and ablations', `${desc}. Position axis: 50–75%.`, bottom + 49);
    const x = (value) => 300 + (value - 50) / 25 * 455;
    [50, 55, 60, 65, 70, 75].forEach((value) => {
      line(svg, x(value), 30, x(value), bottom - 15);
      label(svg, x(value), bottom + 11, `${value}`, { 'text-anchor': 'middle', 'font-size': 13 });
    });
    label(svg, 0, 14, 'INTERVENTION', { 'font-size': 11, 'letter-spacing': 1.1 });
    label(svg, 836, 14, 'FULL', { 'text-anchor': 'end', 'font-size': 11, fill: colors.accent });
    label(svg, 917, 14, 'ABLATION', { 'text-anchor': 'end', 'font-size': 11 });
    label(svg, 994, 14, 'Δ (pp)', { 'text-anchor': 'end', 'font-size': 11 });
    rows.forEach((row, i) => {
      const y = 55 + i * 51;
      const g = animated(svg, i);
      svgNode(g, 'title', {}, row.description);
      label(g, 0, y + 5, row.label, { fill: colors.fg, 'font-size': 15 });
      const a = x(row.percent), b = x(row.control_percent);
      line(g, Math.min(a, b), y, Math.max(a, b), y, { stroke: colors.accent, 'stroke-width': 1.5, opacity: .4 });
      for (let v = Math.min(row.percent, row.control_percent) + 1; v < Math.max(row.percent, row.control_percent) - .15; v++) {
        svgNode(g, 'circle', { cx: x(v), cy: y, r: 2, fill: colors.accent, opacity: .7 });
      }
      svgNode(g, 'circle', { cx: a, cy: y, r: 6.5, fill: colors.bg, stroke: colors.fg, 'stroke-width': 1.5 });
      svgNode(g, 'circle', { cx: b, cy: y, r: row.delta_pp === 0 ? 3.5 : 5.5, fill: colors.accent });
      label(g, 836, y + 5, f(row.control_percent, 3), { 'text-anchor': 'end', fill: colors.accent, 'font-size': 14 });
      label(g, 917, y + 5, f(row.percent, 3), { 'text-anchor': 'end', fill: colors.fg, 'font-size': 14 });
      label(g, 994, y + 5, signed(row.delta_pp), { 'text-anchor': 'end', fill: colors.fg, 'font-weight': 600, 'font-size': 14 });
    });
    label(svg, 526, bottom + 37, 'Success (%) · position axis 50–75', { 'text-anchor': 'middle', 'font-size': 12 });
  }
  document.querySelectorAll('[data-ablation]').forEach((button) => {
    button.addEventListener('click', () => {
      currentGroup = button.dataset.ablation;
      document.querySelectorAll('[data-ablation]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      drawAblations();
    });
  });

  // F1 Rung Bars: baseline 0%; clipping preserves fractional rungs.
  function drawRecent() {
    const selected = $('recent-seed').value;
    const rows = data.recent.summary.map((row) => ({
      frames: row.frames,
      value: selected === 'mean' ? row.mean_percent : data.recent.seeds.find((seed) => seed.frames === row.frames && seed.eval_seed === Number(selected)).success_rate_percent,
      sd: selected === 'mean' ? row.sample_sd_pp : 0,
    }));
    const desc = rows.map((row) => `Recent${row.frames}: ${f(row.value)}%${selected === 'mean' ? `, sample SD ${f(row.sd)} pp` : ''}`).join('; ');
    const svg = chartStart('recent-chart', `Recent sampling: ${selected === 'mean' ? 'three-seed mean' : `evaluation seed ${selected}`}`, `${desc}. Axis: 0–40%.`);
    const y = (v) => 287 - v / 40 * 246;
    const defs = svgNode(svg, 'defs');
    [0, 10, 20, 30, 40].forEach((value) => {
      line(svg, 39, y(value), 466, y(value));
      label(svg, 25, y(value) + 4, value, { 'text-anchor': 'end', 'font-size': 12 });
    });
    rows.forEach((row, i) => {
      const g = animated(svg, i), x = 118 + i * 131;
      const color = i === 2 ? colors.accent : colors.other;
      const clip = svgNode(defs, 'clipPath', { id: `recent-clip-${i}` });
      svgNode(clip, 'rect', { x: x - 35, y: y(row.value), width: 70, height: y(0) - y(row.value) });
      const rungs = svgNode(g, 'g', { 'clip-path': `url(#recent-clip-${i})` });
      for (let n = 0; n < 40; n++) {
        svgNode(rungs, 'rect', { x: x - 31, y: y(n + 1) + 1.5, width: 62, height: 4.65, rx: .7, fill: color });
      }
      // The cap marks the exact (possibly fractional) value, not a rounded unit count.
      line(g, x - 31, y(row.value), x + 31, y(row.value), { stroke: color, 'stroke-width': 1.7 });
      if (row.sd) {
        line(g, x, y(row.value - row.sd), x, y(row.value + row.sd), { stroke: colors.fg, 'stroke-width': 1.5 });
        [row.value - row.sd, row.value + row.sd].forEach((v) => line(g, x - 6, y(v), x + 6, y(v), { stroke: colors.fg, 'stroke-width': 1.5 }));
      }
      label(g, x, y(row.value + row.sd) - 12, f(row.value), { 'text-anchor': 'middle', fill: color, 'font-size': 20, 'font-weight': 650 });
      label(g, x, 313, `Recent${row.frames}`, { 'text-anchor': 'middle', fill: colors.fg, 'font-size': 14 });
    });
    $('recent-caption').textContent = selected === 'mean'
      ? 'Whiskers: ±1 sample SD across three evaluation seeds. One training seed (42) and one fixed final checkpoint per setting.'
      : `Evaluation seed ${selected}: 800 episodes per setting (16 tasks × 50). All settings use training seed 42 and their fixed final checkpoint.`;
  }
  $('recent-seed').addEventListener('change', drawRecent);

  // Exact tabular alternatives to the charts.
  function cell(row, content, className, header = false) {
    const node = document.createElement(header ? 'th' : 'td');
    node.textContent = content;
    if (className) node.className = className;
    if (header) node.scope = 'row';
    row.append(node);
  }
  data.tasks.forEach((task) => {
    const row = document.createElement('tr');
    cell(row, task.suite); cell(row, task.task, '', true);
    const keys = ['no_memory', 'memer', 'framesamp', 'simplearm'];
    const best = Math.max(...keys.map((key) => task[key]));
    keys.forEach((key) => cell(row, f(task[key]), `${key === 'simplearm' ? 'ours-cell ' : ''}${task[key] === best ? 'best-cell' : ''}`.trim()));
    $('task-table').append(row);
  });
  data.ablations.forEach((arm) => {
    const row = document.createElement('tr');
    cell(row, arm.label, '', true); cell(row, f(arm.control_percent, 3)); cell(row, f(arm.percent, 3)); cell(row, signed(arm.delta_pp));
    $('ablation-table').append(row);
  });

  // A recorded seven-moment walkthrough; playback never starts automatically.
  let moment = 0, timer = null;
  const playButton = $('trace-play');
  function stopTrace() {
    clearInterval(timer); timer = null;
    playButton.textContent = 'Play walkthrough ▶';
    playButton.setAttribute('aria-label', 'Play episode walkthrough');
  }
  function showTrace(index) {
    moment = Math.max(0, Math.min(data.trace.length - 1, Number(index)));
    const frame = data.trace[moment];
    $('trace-image').src = frame.image;
    $('trace-image').alt = `Step ${frame.step}: ${frame.description}`;
    $('trace-step').textContent = `t = ${frame.step}`;
    ['stage', 'title', 'description', 'memory', 'tools'].forEach((key) => { $(`trace-${key}`).textContent = frame[key]; });
    $('trace-range').value = moment;
    $('trace-range').setAttribute('aria-valuetext', `Step ${frame.step}: ${frame.title}`);
    $('trace-count').textContent = `${String(moment + 1).padStart(2, '0')} / 07`;
    $('trace-annotations').replaceChildren();
    (frame.annotations || []).forEach((annotation) => {
      const mark = document.createElement('span');
      mark.className = `annotation ${annotation.kind}`;
      mark.style.left = `${annotation.x}%`; mark.style.top = `${annotation.y}%`;
      if (annotation.kind === 'proposal') mark.textContent = '×';
      $('trace-annotations').append(mark);
    });
    document.querySelectorAll('[data-moment]').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.moment) === moment)));
  }
  data.trace.forEach((frame, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.moment = index;
    button.textContent = frame.stage;
    const step = document.createElement('span'); step.textContent = `t = ${frame.step}`; button.append(step);
    button.setAttribute('aria-label', `Step ${frame.step}: ${frame.title}`);
    button.addEventListener('click', () => { stopTrace(); showTrace(index); });
    $('trace-steps').append(button);
  });
  $('trace-range').addEventListener('input', (event) => { stopTrace(); showTrace(event.target.value); });
  playButton.addEventListener('click', () => {
    if (timer) { stopTrace(); return; }
    if (moment === data.trace.length - 1) showTrace(0);
    playButton.textContent = 'Pause walkthrough Ⅱ'; playButton.setAttribute('aria-label', 'Pause episode walkthrough');
    timer = setInterval(() => {
      showTrace(moment + 1);
      if (moment === data.trace.length - 1) stopTrace();
    }, 2600);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopTrace(); });
  window.addEventListener('pagehide', stopTrace);

  // Default to the visitor's system theme; an explicit choice is stored locally.
  const themeButton = $('theme-toggle'), media = window.matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : media.matches;
  function labelTheme() {
    const next = isDark() ? 'light' : 'dark';
    themeButton.setAttribute('aria-label', `Switch to ${next} theme`); themeButton.title = `Switch to ${next} theme`;
  }
  try {
    const saved = localStorage.getItem('simplearm-theme');
    if (saved === 'light' || saved === 'dark') document.documentElement.dataset.theme = saved;
  } catch (_) { /* The system theme still works when storage is unavailable. */ }
  themeButton.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark'; document.documentElement.dataset.theme = next;
    try { localStorage.setItem('simplearm-theme', next); } catch (_) { /* Optional preference storage. */ }
    labelTheme();
  });
  media.addEventListener('change', labelTheme);
  labelTheme();
  drawBenchmark(); drawAblations(); drawRecent(); showTrace(0);
  // Reveal each chart once when it enters view. Its values remain in the DOM.
  if ('IntersectionObserver' in window) {
    const renderers = { 'benchmark-chart': drawBenchmark, 'ablation-chart': drawAblations, 'recent-chart': drawRecent };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { renderers[entry.target.id](); observer.unobserve(entry.target); }
      });
    }, { threshold: .15 });
    Object.keys(renderers).forEach((id) => observer.observe($(id)));
  }
})();
