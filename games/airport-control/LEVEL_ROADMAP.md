# Airport Control — campaign roadmap

> **Status:** Coastal Airport, Regional Junction and Endless Challenge are playable. Levels 3–5 are proposed.

## Design objectives
- Accessible for the family's 6- and 9-year-old players; intuitive first level and growing tactical depth.
- Each level adds **one substantial mechanic** before combining challenges. No punitive timer-only failure.
- A successful level is a satisfying short session (target **2–4 minutes**; longer in later stages), not an abrupt end mid-route.
- Aircraft spawn cadence, aircraft speed, collision tolerance, runway layouts and landing requirements need player testing before release.

## Level 1 completion rules
1. Show a visible progress indicator: **Landings 0/8** and **Time 0:00/2:00** in Level 1.
2. Level 1 qualifies when the player has made **8 correct landings** AND has controlled traffic for **at least 2 minutes**. These values are provisional for playtesting.
3. Once qualified, stop scheduling new arrivals; allow any existing airborne traffic to be landed safely. Then display a celebratory level-clear screen with **Next airport**, **Replay**, and **Endless mode** options.
4. If remaining aircraft crash or leave the airspace, use normal game-over/retry rather than silently clearing.
5. The player can continue in a separate **Endless Challenge** mode with the existing increasing-traffic schedule and high-score logic.
6. Save unlocked levels and personal bests locally, defensively as current game does; never require accounts.
7. Do not advance or unlock a new level solely because time elapsed or the landing quota was reached. A safe shift closure matters.

## Proposed difficulty roadmap

| Level | Working name | Approx. duration | Landing target | Destinations | New skill |
| --- | --- | --- | --- | --- | --- |
| 1 | Coastal Airport | >= 2 min | 8 | 2 runways (jet + light plane) | Routes, alignment, collision awareness |
| 2 | Regional Junction | >= 2.5 min | 11 | 3 runways | Select among more landing destinations; introduce a distinct fixed-wing aircraft |
| 3 | Island Rescue | >= 3 min | 13 | 3 runways + 1 helipad | Helicopters (slow, tight turns, helipad capture/hover) |
| 4 | City International | >= 3 min | 16 | 3 runways + 1 helipad | Mixed-speed traffic, crossing traffic streams |
| 5 | Grand Airport | >= 3.5 min | 20 | 4 runways + 1 helipad | Complex routing and prioritisation |

**Numbers are targets for playtesting, not committed progression values.** Adjust to ensure the difficulty rises without spikes.

## Helicopters and helipads (from Level 3)
- Visually distinctive helicopter body and spinning rotor; own clearly marked **H** pad.
- Lower cruise speed, smaller turn radius than airliners; no need to approach from a runway-heading corridor.
- Helipad has a **smaller snap radius** than runways and requires safe proximity and sufficiently low speed / hover to land. Introduce a short, visually clear descent effect.
- Design path planning and collision behaviour so helicopters and fixed-wing aircraft share airspace fairly; do not teleport to pad.
- Keep destination identification accessible via **H** letter and outline/shape, not colour alone.

## Engineering plan — separate future PRs
1. Define campaign metadata, level rules, objective displays, completion-state transitions and progression persistence in testable modules.
2. Playtest Level 1 completion and Endless Challenge on physical iPhone and iPad.
3. Build Level 2 airport scenery, third runway and third fixed-wing traffic profile.
4. Add helicopter movement, helipad approach/capture, collision checks, animation and audio for Level 3.
5. Add Levels 4–5 only once earlier levels are tested on physical iPhone/iPad.
6. Test boundary cases: quota reached before time, time reached before quota, remaining aircraft while cleared, collision during clearance, pause/visibility, reload, storage unavailable, and wrong destination.

**Release gate:** Do not link new levels on the Family Arcade homepage or auto-merge without owner approval.
