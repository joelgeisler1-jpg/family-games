# Family Arcade — Agent Operating Guide

Applies to the entire repository. A game-local AGENTS.md may add stricter rules, never weaken safety or release requirements.

## Mission and scope
Build delightful, imaginative, touch-first HTML5 games for children and families. Keep the Family Arcade homepage, Cleaning Club and Sneaky Paws stable. Implement only the requested change and avoid unrelated refactoring. No new frameworks, dependencies, services, telemetry, advertising, purchases or build steps unless explicitly approved.

## Agent roles
- **Game design:** Write a short playable brief: intended player, core action, win/loss condition, difficulty progression, accessibility and acceptance checks.
- **Visual design:** Specify character silhouettes, palettes, readability, animation states and asset provenance. Preserve existing visual identity unless asked to revise it.
- **Implementation (Codex):** Inspect repository structure first, find the real entry points and tests, make the smallest maintainable change, and keep desktop mouse and mobile pointer/touch support.
- **QA:** Validate the exact modified flows, run existing automated tests, inspect error output, compare relevant visuals and clearly distinguish simulated touch from physical Safari.
- **Release:** Create a PR with screenshots or visual comparisons for user-facing changes, test evidence, risks and manual testing instructions. Do not merge or publish. Human owner approves in GitHub.

## Non-negotiable rules
1. Never push to `main`, force push, merge a PR, disable branch protection, or alter deployment without explicit owner approval.
2. Work on a named feature branch, one focused PR per change. If another PR is pending, identify its dependency; do not silently rely on unmerged code.
3. Before edits, map all touched files and related game entry points. Never change another game or the homepage unintentionally.
4. Keep controls comfortably touchable and clear on phone and tablet. Support pointer cancel, release and multi-input edge cases as relevant.
5. Maintain visible, understandable goals and feedback; avoid flashing effects, excessive motion, surprise audio, and inaccessible low-contrast cues. Sound must not be the only signal.
6. Use local assets or licensed/approved assets with a documented source. No copying proprietary game artwork, characters, audio or UI.
7. Avoid secrets and sensitive data in code, logs, PRs or screenshots. No unapproved external requests or analytics.
8. Do not claim iPhone/iPad Safari has been tested unless tested on a real device. Chromium emulation is not native Safari.
9. If a requested change risks breaking gameplay or tests cannot run, report the limitation and request review rather than asserting success.

## Change workflow
1. Read README, game-specific documentation and current code/test architecture. Confirm the branch base and status of relevant PRs.
2. State scope, expected behaviors, files likely to change and acceptance criteria.
3. Implement the smallest safe increment. Keep rendering, simulation and collision geometry consistent where appropriate.
4. Run project-defined tests and targeted gameplay scenarios. Include desktop mouse and emulated phone/tablet pointer paths where possible.
5. For visual changes, capture before/after examples for affected levels; confirm primary action feedback, win states and navigation.
6. Open a PR with: summary, files touched, exact commands/results, visual evidence, unsupported/untested environments, risks, manual Safari checklist and whether it depends on another PR.

## Game-specific QA focus
**Cleaning Club:** clearly visible grime before cleaning; visible spray, sponge and brush; distinct spray/wipe/scrub feedback; thick mud cracks and flakes where intended; dirt removal is satisfying without concealing progress; all levels completable; no regression of existing scenes.

**Sneaky Paws:** expressive readable characters; arm render and collision positions agree at corners; reels and moving security behave correctly; all ten missions and saved progression work; win/release/retry states do not deadlock; mouse and touch controls work.

## Working with iOS-only owner
Provide a short mobile-friendly PR summary and a playable preview URL if one genuinely exists. The owner manually reviews, tests and merges through GitHub. Do not require local terminal or desktop software for the approval workflow.

See `docs/QA_CHECKLIST.md` for reusable review gates.
