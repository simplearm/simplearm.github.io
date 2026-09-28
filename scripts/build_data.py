"""Build the site's compact data from the archived experiment results and draft table.

Usage: python3 scripts/build_data.py --source-root ../agent_robomem
The generated assets/data files are committed, so GitHub Pages needs no build step.
"""
import argparse, csv, hashlib, json, re
from pathlib import Path

parser=argparse.ArgumentParser()
parser.add_argument('--source-root', type=Path, default=Path('../agent_robomem'))
a=parser.parse_args(); root=a.source_root.resolve()
out=Path(__file__).resolve().parents[1]/'assets/data';out.mkdir(parents=True,exist_ok=True)
results=root/'tool_explore_final/results'
read=lambda p:json.loads(p.read_text())
main=read(results/'main_results/summary.json')
ours=read(results/'main_results/per_task.json')
abl=read(results/'ablation/summary.json')['rows']
recent=results/'recent_frame_sampling/recent_strategy/multiseed'
paper=root/'overleaf/6aab6fa794f50fc34daef8e5/tables/tbl_main.tex'
suite_tasks={
 'Counting':['BinFill','PickXtimes','SwingXtimes','StopCube'],
 'Permanence':['VideoUnmask','ButtonUnmask','VideoUnmaskSwap','ButtonUnmaskSwap'],
 'Reference':['PickHighlight','VideoRepick','VideoPlaceButton','VideoPlaceOrder'],
 'Imitation':['MoveCube','InsertPeg','PatternLock','RouteStick']}
suite_descriptions={
 'Overall':'All 16 memory-dependent tasks.',
 'Counting':'Remember accumulated events and interaction progress. Counting remains the most uneven suite.',
 'Permanence':'Keep track of an object after it is hidden, including when its container moves.',
 'Reference':'Resolve a later instruction using the identity or order of an earlier demonstration.',
 'Imitation':'Retain a demonstrated route or procedure and use it to guide the next action.'}
records=[]
for line in paper.read_text().splitlines():
 cells=line.split('&')
 if len(cells)!=8:continue
 task=cells[1].strip()
 if task not in {r['task'] for r in ours}:continue
 vals=[float(re.search(r'\d+(?:\.\d+)?',c).group()) for c in cells[3:]]
 o=next(r for r in ours if r['task']==task)
 assert abs(vals[3]-o['mean_percent'])<.051
 records.append({'task':task,'suite':next(k for k,v in suite_tasks.items() if task in v),'no_memory':vals[0], 'memer':vals[1], 'framesamp':vals[2], 'simplearm':o['mean_percent'], 'simplearm_seeds':o['seeds']})
assert len(records)==16
published={'Overall':[32.70,42.37,44.51],'Counting':[38.00,48.83,65.22],'Permanence':[39.34,53.17,25.11],'Reference':[31.61,38.00,36.33],'Imitation':[21.89,29.50,51.39]}
suites=[]
for k,v in published.items():
 selected=[r for r in records if k=='Overall' or r['suite']==k]
 ours_mean=sum(r['simplearm'] for r in selected)/len(selected)
 suites.append({'name':k,'description':suite_descriptions[k],'tasks':len(selected),'no_memory':v[0],'memer':v[1],'framesamp':v[2],'simplearm':ours_mean})
labels={
 'retrieval_agent':('VLM-driven retrieval','access','Replace structured access with a VLM decision at each proposed subgoal.'),
 'no_live_tracking':('No live tracking','state','Remove online tracking of object-to-container bindings.'),
 'no_demo_follow':('No demonstration following','state','Remove updates that follow demonstrated identities during execution.'),
 'no_demo_notes':('No demonstration notes','state','Remove memory notes established from the demonstration.'),
 'no_demo_references':('No demonstration references','state','Remove historical references used to identify demonstrated targets.'),
 'no_route_memory':('No route memory','state','Remove stored routes and ordered procedural state.'),
 'no_flash_count':('No flash counting','state','Remove accumulated flash-event counts.'),
 'refine_every_verb':('Refine every subgoal','access','Enable refinement for every verb instead of selective access.'),
 'source_from_frames':('Source from received frames','access','Use the received-frame source instead of the agent-selected source.'),
 'write_plan_single_vote':('Single-vote write plan','access','Use one write-plan vote; the independent reader compiler retains three votes.')}
ablations=[{**{k:r[k] for k in ['arm','episodes','percent','control_percent','delta_pp','improved','worsened']},'label':labels[r['arm']][0],'group':labels[r['arm']][1],'description':labels[r['arm']][2]} for r in abl]
assert all(r['episodes']==800 for r in ablations)
frames=root/'figure_design/workflow/fig_method_episode_frames'
manifest=read(frames/'manifest.json')
step_copy=[
 ('Notice what matters','Observe','The green and red cubes are visible. The instruction selects these identities for memory.','Green cube · red cube','Detection · color verification'),
 ('Bind identity to a container','Bind','The cubes are covered. Memory preserves each cube-to-container relation after the color disappears.','Cube → covering container','Identity features'),
 ('Follow the relation','Maintain','As the covers move, the relation follows the container rather than staying at its old image position.','Same identity · updated position','Identity features · optical flow'),
 ('Recall at the decision','Recall','The proposed pick target differs from the remembered green-cube container. Memory resolves which cover to pick and grounds it in the current view.','Pick the green-cube container','Structured retrieval · current-view detection'),
 ('Check the outcome','Verify','Lifting the recalled container reveals the green cube. Current evidence confirms the remembered relation.','Green cube revealed','Identity verification'),
 ('Use the second binding','Recall','The next subgoal requires the red cube. A second memory read resolves the corresponding container.','Pick the red-cube container','Structured retrieval · current-view detection'),
 ('Complete the instruction','Act','The robot lifts the second cover. The recorded episode reaches success at environment step 596.','Both requested containers selected','Frozen VLA execution')]
trace=[]
for p,c in zip(manifest['panels'],step_copy):
 trace.append({'step':p['env_step'],'image':'assets/images/'+Path(p['panel_image']).name,'title':c[0],'stage':c[1],'description':c[2],'memory':c[3],'tools':c[4]})
trace[3]['annotations']=[{'kind':'proposal','x':116/256*100,'y':(125-15)/241*100},{'kind':'memory','x':169/256*100,'y':(100-15)/241*100}]
trace[5]['annotations']=[{'kind':'proposal','x':158/256*100,'y':(124-15)/241*100},{'kind':'memory','x':122/256*100,'y':(134-15)/241*100}]
data={
 'method':'SimpleARM','main':{'mean':main['statistics']['mean'],'sd':main['statistics']['sample_sd'],'sem':main['statistics']['sem'],'episodes':2400,'seeds':[{k:r[k] for k in ['seed','valid','successes','full_percent']} for r in main['runs']]},
 'suites':suites,'tasks':records,'ablations':ablations,'recent':{'summary':read(recent/'summary.json'),'seeds':read(recent/'per_seed.json')},
 'trace':trace,
 'sources':{'baselines':'RoboMME published results, reproduced in the SimpleARM draft Table 1.','baselines_url':'https://arxiv.org/abs/2603.04639','results_commit':'87dffab95778ac098ebd9f556bd4180749e33f98','results_url':'https://github.com/ZhangYuyou-10/agent_robomme_code/tree/tool-explore-final/results','trace':'ButtonUnmaskSwap, seed 7, episode 47; qualitative replication. Pixel + DINO + flow active; SAM unavailable on this rollout host.','table_sha256':hashlib.sha256(paper.read_bytes()).hexdigest(),'teaser_sha256':hashlib.sha256((root/'figure_design/SimpleARM_Five_Vector_SVG/web_teaser.svg').read_bytes()).hexdigest(),'teaser_png_sha256':hashlib.sha256((out.parent/'images/web_teaser.png').read_bytes()).hexdigest(),'workflow_pdf_sha256':hashlib.sha256((root/'overleaf/6aab6fa794f50fc34daef8e5/figures/workflow_1.pdf').read_bytes()).hexdigest(),'workflow_png_sha256':hashlib.sha256((out.parent/'images/workflow.png').read_bytes()).hexdigest()}}
(out/'results.json').write_text(json.dumps(data,indent=2)+'\n')
# Also usable when index.html is opened directly from disk.
(out/'results.js').write_text('window.SIMPLEARM_DATA = '+json.dumps(data,separators=(',',':'))+';\n')
for name,rows in [('benchmark',records),('ablations',ablations),('recent_summary',data['recent']['summary']),('recent_per_seed',data['recent']['seeds'])]:
 rows=[{k:v for k,v in r.items() if not isinstance(v,(list,dict))} for r in rows]
 with (out/(name+'.csv')).open('w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=rows[0],lineterminator='\n');w.writeheader();w.writerows(rows)
print('Built: 16 task rows, 10 matched ablations, 9 Recent rounds and 7 documented trace frames.')
