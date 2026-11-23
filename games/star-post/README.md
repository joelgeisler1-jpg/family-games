# Star Post — Original Five-Level Prototype

A small, original, touch-first puzzle game for children: deliver each coloured star to its matching home. Drag with a finger or mouse; alternatively, tap/select a star and then tap its glowing home. Clouds block movement on later levels. Five levels unlock as completed and progress is stored locally.

## Preview
Serve the **repository root** over HTTP, then visit `games/star-post/`. Native ES modules are used; opening the HTML as `file://` may not work. The prototype is intentionally **not** linked from the Family Arcade homepage; publishing it requires separate owner approval.

## Tests
From the repository root:

```sh
node --test games/star-post/tests/*.test.mjs
```

Tests validate authored level data, bounds, cloud movement restrictions, colour matching and completion rules. They do not test live browser input, Safari or accessibility assistive technologies. Manual iPhone/iPad Safari playtesting is required before homepage integration.

## Review focus
- On iPhone Safari: drag a star and release directly on the same-colour home; confirm it is delivered.
- Tap a star, then tap the matching home without dragging.
- Avoid the clouds in levels 3–5 and check the drag is blocked.
- Complete a level, select Next and reload; verify unlocked levels remain available.
- Test orientation and text legibility on phone and tablet.

No external services, images, analytics, ads, audio downloads, npm dependencies or deployment changes.
