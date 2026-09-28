"""Check publication data, local asset links and the supplied teaser's integrity."""
import csv
import hashlib
import json
import math
import statistics
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote

root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'assets/data/results.json').read_text())
js = (root / 'assets/data/results.js').read_text()
assert json.loads(js.removeprefix('window.SIMPLEARM_DATA = ').strip().removesuffix(';')) == data
assert len(data['tasks']) == 16 and len({r['task'] for r in data['tasks']}) == 16
seeds = data['main']['seeds']
assert sorted(r['seed'] for r in seeds) == [7, 11, 23]
assert all(r['valid'] == 800 for r in seeds)
assert sum(r['valid'] for r in seeds) == data['main']['episodes'] == 2400
rates = [100 * r['successes'] / r['valid'] for r in seeds]
for key, expected in [('mean', statistics.mean(rates)), ('sd', statistics.stdev(rates)), ('sem', statistics.stdev(rates) / math.sqrt(3))]:
    assert math.isclose(data['main'][key], expected, abs_tol=1e-9)
for suite in data['suites']:
    selected = [r for r in data['tasks'] if suite['name'] == 'Overall' or r['suite'] == suite['name']]
    assert len(selected) == suite['tasks']
    assert math.isclose(statistics.mean(r['simplearm'] for r in selected), suite['simplearm'], abs_tol=1e-9)
assert len(data['ablations']) == 10
for row in data['ablations']:
    assert row['episodes'] == 800
    assert math.isclose(row['percent'] - row['control_percent'], row['delta_pp'], abs_tol=1e-9)
    assert math.isclose((row['improved'] - row['worsened']) / 800 * 100, row['delta_pp'], abs_tol=1e-9)
assert len(data['recent']['seeds']) == 9
for summary in data['recent']['summary']:
    rows = [r for r in data['recent']['seeds'] if r['frames'] == summary['frames']]
    assert sorted(r['eval_seed'] for r in rows) == [7, 11, 23]
    assert all(r['episodes'] == 800 and r['train_seed'] == 42 for r in rows)
    values = [100 * r['successes'] / 800 for r in rows]
    assert math.isclose(summary['mean_percent'], statistics.mean(values), abs_tol=1e-9)
    assert math.isclose(summary['sample_sd_pp'], statistics.stdev(values), abs_tol=1e-9)
    assert math.isclose(summary['sem_pp'], statistics.stdev(values) / math.sqrt(3), abs_tol=1e-9)
for filename, rows in [('benchmark', data['tasks']), ('ablations', data['ablations']), ('recent_summary', data['recent']['summary']), ('recent_per_seed', data['recent']['seeds'])]:
    with (root / f'assets/data/{filename}.csv').open() as file:
        table = list(csv.DictReader(file))
    assert len(table) == len(rows)
    for original, exported in zip(rows, table):
        for key, value in exported.items():
            assert str(original[key]) == value
assert len(data['trace']) == 7
for frame in data['trace']:
    assert (root / frame['image']).is_file()
    for marker in frame.get('annotations', []):
        assert 0 <= marker['x'] <= 100 and 0 <= marker['y'] <= 100
assert hashlib.sha256((root / 'assets/images/web_teaser.svg').read_bytes()).hexdigest() == data['sources']['teaser_sha256']

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs = []; self.ids = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs: self.ids.append(attrs['id'])
        self.refs.extend(attrs[k] for k in ('href', 'src') if k in attrs)
page = Page(); page.feed((root / 'index.html').read_text())
assert len(page.ids) == len(set(page.ids)), 'Duplicate HTML id'
for ref in page.refs:
    parsed = urlsplit(ref)
    if parsed.scheme or parsed.netloc: continue
    if parsed.path: assert (root / unquote(parsed.path)).is_file(), ref
    elif parsed.fragment: assert parsed.fragment in page.ids, ref
print('PASS: 2,400 main episodes; 10 × 800 matched ablations; 7,200 Recent episodes; CSV/JSON parity; image integrity; local links.')
