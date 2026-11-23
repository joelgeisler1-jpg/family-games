# Sneaky Paws

The artwork for all ten rooms lives in `environments.mjs` and
`environments.css`. The backdrop is painted behind the game and ignores
pointer input. Solid obstacle artwork takes its dimensions from the existing
level data. CSS controls decorative motion and disables it when the device
requests reduced motion.

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
