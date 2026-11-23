# Family Arcade — QA and PR Checklist

Use this checklist for each feature PR. Tick only what was actually verified.

## Before editing
- [ ] Confirm feature scope and acceptance criteria
- [ ] Identify current base branch and any dependent/unmerged PR
- [ ] Identify impacted game files, homepage and other games
- [ ] Identify exact existing test commands, avoid inventing commands

## Automation
- [ ] Run all available repository tests; record exact command and pass/fail counts
- [ ] Exercise changed level/gameplay paths including completion, reset and navigation
- [ ] Check errors and console output
- [ ] Test mouse and emulated phone/tablet pointer or touch input if available
- [ ] Confirm relevant regressions stay fixed
- [ ] Compare visual snapshots where present; explain intentional differences

## Manual mobile verification — owner
- [ ] iPhone Safari: start, interact, complete, replay and reload
- [ ] iPad Safari: start, interact, complete, replay and reload
- [ ] Portrait/landscape and safe areas: controls visible and reachable
- [ ] Touch release/cancel, scroll prevention and gestures do not interrupt play
- [ ] Character, effects, dirt/mud and goals remain readable at real screen size
- [ ] Audio, reduced-motion comfort and non-audio cues work appropriately
- [ ] No unexpected changes to homepage or unrelated games

## Cleaning Club focus (when affected)
- [ ] Grime is clearly visible before cleaning
- [ ] Spray, sponge and brush remain visible while in use
- [ ] Each tool produces distinct, satisfying removal feedback
- [ ] Thick mud cracking/flaking works in applicable levels
- [ ] All affected levels reach completion

## Sneaky Paws focus (when affected)
- [ ] Arm rendering matches collision behavior, especially tight corners
- [ ] Reels, guards, lasers and moving security respond consistently
- [ ] All affected missions are completable
- [ ] Release, win, retry and progression persist correctly

## PR completion
- [ ] Explain changed paths and confirm untouched games
- [ ] Include screenshot or video evidence for visual edits where possible
- [ ] Document test commands, results and limitations
- [ ] State simulated devices vs real Safari honestly
- [ ] Provide simple iOS review steps
- [ ] Leave PR unmerged for owner approval

## GitHub Actions automated coverage

The `Family Arcade QA` workflow (`.github/workflows/family-arcade-qa.yml`) runs on pull requests and can also be started manually with `workflow_dispatch`.

- **Sneaky Paws / Node tests:** GitHub-hosted Ubuntu runner, Node.js 22, from the repository root:
  ```sh
  node --test games/sneaky-paws/tests/*.test.mjs
  ```
  This is the documented command in `games/sneaky-paws/README.md`; it requires no npm install or build step.
- **Cleaning Club / static smoke tests:** `node --test games/cleaning-club/tests/*.test.mjs`, plus `node --check` for every `*.js` file under `games/cleaning-club`. These checks verify script load order, presence of ten authored levels and local tool assets, expected mud/effects hooks and completion UI; they do **not** execute canvas cleaning gestures or assess ASMR quality.
- **PR checks:** Open the PR's **Checks** tab on GitHub Mobile or the mobile website and inspect the `Sneaky Paws / Node tests` job. A failed test makes the check fail. A green check does not mean physical-device testing has passed.
- **Limitations:** Cleaning Club currently has static structural checks, not automated gameplay; native Safari checks and browser screenshot comparisons are not configured in this workflow. The manual sections above still apply.
- **Future work:** Add browser jobs only after verifying the runner setup, executable browser test suite and artifact handling. Do not claim CI passing until the first actual run has succeeded.

This workflow has no deploy or auto-merge permissions. Repo branch protection/rulesets must be configured separately if test success is to be required before merging.
