# Data and interpretation

The numbers are built from the archived SimpleARM results, not transcribed from chart pixels. The local build script contains the source filenames; the generated JSON records the public archive URL, source commit and draft-table SHA256.

## Main benchmark

- SimpleARM: seeds 7, 11 and 23; 16 tasks × 50 episodes × 3 seeds = 2,400 episodes.
- Successes per seed: 542, 544 and 526 out of 800.
- Overall mean: 67.1666667%; sample SD: 1.2332207 percentage points; SEM: 0.7120003 percentage points.
- Published no-memory, MemER and FrameSamp values come from RoboMME as reproduced in the draft's main result table. Published suite and overall aggregates are retained instead of being recomputed from rounded task rows.
- The +22.66 pp headline is SimpleARM's mean minus the published FrameSamp overall rate (44.51%). This is a system comparison, not a controlled isolation of memory alone.
- All 16 tasks are available, including StopCube's 0% SimpleARM result. Underlined task-table entries are the highest values among the four displayed methods.

## Component ablations

- Ten interventions, each evaluated on the complete 16 × 50 benchmark at seed 11.
- Each intervention is compared with its same-host/seed/task/episode full-method control. Controls therefore differ across rows; the chart never subtracts a universal 68% baseline.
- Delta is **ablation minus matched full method**, in percentage points.
- The main chart uses two endpoints on an explicitly labelled 50–75% position axis. This is not a truncated bar chart. Endpoint values and deltas are always printed alongside the positions.
- The received-frame source intervention has zero aggregate effect; improvements and regressions can still occur on different episodes. The evidence does not establish an independent positive contribution for every component.
- These single-seed interventions overlap; effects should not be added together.

## Matched Recent sampling

- FrameSamp + ModuL, trained with Recent4/16/32 and evaluated with the matching strategy.
- One trained checkpoint (final 79999, training seed 42) per setting; evaluation seeds 7, 11 and 23, each with 800 episodes.
- The chart reports evaluation-seed mean and sample SD, not three independent training runs. SEM and individual rounds are included in downloads.
- Evaluation hosts differ between some rounds. The archived CSV keeps actual host labels; the page does not claim hardware effects were isolated.
- Recent8 is separate: one seed7 evaluation, 211/800 = 26.375%, from a 70k EMA warm start with an optimizer reset. It is disclosed in the evaluation details, not mixed into the three-seed chart.
- Earlier inference-only Recent sampling on Uniform-trained weights is a different experiment and is not mixed with these values.

## Recorded example and teaser

- The supplied `web_teaser.svg` is a conceptual website illustration, retained byte-for-byte.
- The walkthrough uses existing camera crops for ButtonUnmaskSwap, seed 7, episode 47, from the documented qualitative replication. Success occurred at step 596; the final displayed crop is step 580.
- Target markers are explanatory overlays using recorded proposal and memory-read coordinates, adjusted for the crop's 15-pixel vertical offset. A composer proposal is not a separate baseline rollout.
- Pixel verification, DINO identity features and optical flow were available in this trace; SAM was unavailable. The generic method section shows the broader toolbox, while the example names only operations documented for this trace.
