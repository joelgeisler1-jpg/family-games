# Family Arcade — Reusable AI Agent Tasks

Use a single task per feature branch and PR. Read `AGENTS.md` and `docs/QA_CHECKLIST.md` first. The owner directs creative choices and merges manually from iOS. Never treat a prompt as permission to auto-merge.

## Task 1 — New game prototype
**Copy to a GitHub issue or Codex task:**

> Design and implement a new original, touch-first HTML5 game for Family Arcade. First propose its one-sentence hook, player age range, core interaction, clear goal, five short prototype levels, and acceptance tests. Keep all new code isolated in `games/<slug>/`; do not edit the arcade homepage or other games in the prototype PR. No framework or external assets without approval. Make controls accessible and comfortable on iPhone/iPad, include restart and progress feedback, and provide a local README with how to play, test and preview. Run automated tests if feasible, document untested mobile Safari behavior, and submit an unmerged PR. Human owner must approve public launcher integration separately.

## Task 2 — Level expansion
> Inspect an existing game's level definitions, progression and tests. Propose new levels that develop mechanics without unexplained difficulty spikes. Keep save compatibility. Add feasible tests for completion, reset and progression. Show visual evidence, disclose automation limits and open an unmerged PR.

## Task 3 — Visual and character polish
> Improve only the named game's characters, environments or effects. Preserve current gameplay and progression. Define the before/after visual goal, keep touch hit targets and contrast clear, respect reduced-motion preferences, avoid unlicensed assets, capture comparative screenshots if tooling permits, run existing tests and open an unmerged PR.

## Task 4 — Gameplay and ASMR polish
> Investigate the named interaction's responsiveness, feedback and legibility. For Cleaning Club prioritise visible deposits, tool silhouettes, tool-specific animation, satisfying crack-and-flake mud effects and reliable completion. Avoid effects masking progress. Verify real gameplay paths where browser automation exists; document physical Safari checks as owner tasks. Do not modify other games.

## Task 5 — Regression and release review
> Review the proposed PR diff and identify any unrelated files. Run the CI commands documented in the repository and compare screenshots where configured. Report exact commands, passes/failures, missing coverage, dependency on other PRs, and iOS manual checks. Do not merge, deploy or change repository security settings.

## PR report format
- **Goal / scope:**
- **Changed files:**
- **What the player experiences:**
- **Exact tests and results:**
- **Visual evidence:**
- **Untested (including native Safari):**
- **Risks / dependencies:**
- **iPhone review steps:**

## Agent autonomy boundaries
Agents may read repository files, edit an isolated branch, run authorised CI and draft PRs. Research and suggestions are not permission to spend money, add third-party accounts, deploy to production, enable analytics, merge or bypass review. No requirement for the owner to use a desktop.
