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

## Proposed CI follow-up (not implemented by this checklist)
Inspect actual repository test scripts and platform structure first. Add a minimal GitHub Actions workflow to run available dependency-free Node tests on pull requests. Add browser screenshot/gameplay jobs only once browser installation/runtime is verified. Do not weaken existing checks or add dependencies unnecessarily.
