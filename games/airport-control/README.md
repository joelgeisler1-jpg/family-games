# Airport Control · Coastal Airport

Choose an unlocked airport from the campaign menu. In Coastal Airport, land at least 8 aircraft and keep the airspace safe for 2:00. Then the tower closes arrivals. Land every remaining aircraft to complete the level. Collisions and aircraft leaving the airspace still end the shift during closing.

Coastal Airport unlocks **Regional Junction**. Its twin-engine turboprops use the square **18** approach, and its shift needs 11 landings and 2:30. Each aircraft shows its assigned runway number. Matching approaches snap within 65 map units, and a landing still requires the correct heading and threshold.

Choose **Endless Challenge** to fly Coastal Airport as traffic builds. Campaign completion and Endless personal best are saved separately in this browser.

- Drag from the orange airliner to the **09 diamond** for the main runway. Drag from the blue light plane to the **27 circle** for the short runway.
- Follow the arrow at the approach. If you are coming from the far side, draw a wide turn upstream first. Lift your finger to file a route. Drag again from the moving plane to revise it.
- Give warning rings room. If you see **Turn back**, draw the aircraft toward open airspace.
- A landing earns one point. Consecutive landings within 34 seconds show a streak.
- Sound starts muted. Enable the speaker button for a naturalistic jet-engine wash or light-plane propeller flutter and tyre-roll texture, accompanied by a quieter success cue. Pause holds aircraft and the arrival clock. Switching away from the page also pauses the shift.

## Design and tuning

The map and aircraft silhouettes were created with Canvas. Landing sounds use original noise-based, layered Web Audio textures (similar to Cleaning Club's approach), rather than simple musical oscillators. They are **procedurally created Foley, not field recordings**; no files or external audio hosts are required. The game uses local files and native modules.

Airliners travel faster with a wider turn radius. The flight model holds speed and limits heading changes. Route samples near a tight turn may be skipped so aircraft can exit the turn. The filed route takes effect on release, and aircraft keep flying their previous heading or route during the gesture. A cancelled drag leaves the previous clearance in effect.

A route ending at a matching gate files an approach. Landing also checks position and heading. The first two arrivals remain consistent for the tutorial, but subsequent aircraft enter through varied lanes on **all four edges** of the airspace. The second aircraft appears roughly 9 seconds after the first. Subsequent scheduled gaps start at 12 seconds and accelerate in stages to a 5-second floor (approximately 5–12 arrivals per minute when entry corridors are clear). The scheduler checks position and projected paths at each entry and retries blocked arrivals after one second. Congestion can still defer an arrival rather than cause an unsafe spawn. The fixed 60 Hz simulation checks swept separation, independent of the display refresh.

## Future airports

The completion screen offers **Fly again**, **Menu**, **Endless Challenge**, and **Next Airport** when the next destination is available. The [campaign roadmap](./LEVEL_ROADMAP.md) outlines later airports.

## Run and test

From the repository root, use Node.js 22 or newer and a static HTTP server.

```sh
node --test games/airport-control/tests/*.test.mjs
python3 -m http.server 8000
```

Open `http://localhost:8000/games/airport-control/`. The tests cover both runways, redraws, separation, blocked arrivals, scoring, pause, the campaign thresholds and closing traffic, and a six-minute Endless shift with scripted routes.

## Safari review

1. In the PR, open **Checks → Family Arcade preview links → Preview links / Safari** and tap **Play in Safari** beside Airport Control. Check the PR preview's `revision.txt` to confirm the deployed commit.
2. In portrait, start Level 1 with sound muted. Drag the first airliner to 09 and the next light plane to 27. Confirm the route follows your finger and the landing and time objectives update.
3. On iPhone portrait and landscape, repeatedly drag aircraft and route around the whole canvas. **The page must not scroll or bounce vertically during an active shift**. Pause to access normal page controls. Redraw a route while the aircraft moves, and interrupt a drag: the previous route should remain filed.
4. Enable sound and successfully land one orange jet and one blue light plane. Confirm their touchdown sounds are noticeably different, naturally textured, appropriately brief and paired with a quiet landing cue. Mute and land again to confirm silence. Then pause, switch apps, and return. Confirm the clock and aircraft hold until you resume. With Reduce Motion enabled, check the runway, warnings and landing feedback remain clear.
5. Meet both Level 1 objectives. Check that **Closing traffic** appears, no new aircraft arrive, and the remaining aircraft can still be routed. Wait for the final rollout. Select **Next Airport** to start Regional Junction. Guide the twin-engine turboprop to the square **18** approach from the north. Try touching a different runway first to confirm it does not land there.
6. Replay from the results, then return to **Menu** and reload. Verify the completed airport and unlocked next airport persist. Choose **Endless Challenge** and verify that play returns to Coastal Airport, traffic continues past the campaign thresholds, and a new Endless best survives reload.

Desktop Chromium and Chromium touch emulation are separate from physical iPhone and iPad Safari review.
