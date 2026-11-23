# Sneaky Paws

Serve the repository root over HTTP and open `games/sneaky-paws/`. The game
uses native JavaScript modules and has no build step. From the repository root,
run the dependency-free gameplay tests with Node.js 20 or later.

```sh
node --test games/sneaky-paws/tests/*.test.mjs
```

- `game.mjs` coordinates mission lifecycle, the frame loop, and saved progression.
- `input.mjs` converts mouse and touch pointer events into board coordinates.
- `arm-physics.mjs` samples the drag, guides the glove along the reel, and draws the arm.
- `collision.mjs` checks swept arm segments. `geometry.mjs` provides shared geometry.
- `levels.mjs` holds all ten missions. `objectives.mjs` and `mission-status.mjs`
  handle interactive mechanisms and treasure prerequisites.
- `guards.mjs` owns patrols and awareness. `hazards.mjs` owns the camera, radar,
  pulse beams, and gate updates.
- `scene.mjs` renders the SVG board. `characters.mjs`, `audio.mjs`, and
  `ui.mjs` handle companion reactions, sound, and player feedback.

The route tests drive the normal pointer handlers through all ten missions and
verify each required mechanism, treasure grab, and save unlock. They replay the
routes with frequent updates and with sparse pointer events and delayed paints.

The arm outline and collision tests share the same sampled path. Security
advances in 16 ms steps while drawing and checks the existing arm before
processing new pointer input. Rendering runs once per animation frame.

### Route findings

- Level 2 (Laser Zigzag) has a timing-sensitive direct route across the blaster.
  The detour below the centre locker avoids its firing line.
- Level 10 (Midnight Museum) can build guard alert on a direct approach to the
  switch. Touching the lower-left edge of the switch activation area gives the
  arm more clearance.
- Level 9 (Double Wrap) requires careful exit from the bolt because the fixed
  laser is immediately to its right. The route leaves left after latching.
