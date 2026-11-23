# Airport Control

Choose an unlocked airport from the campaign menu. In Coastal Airport, land at least 8 aircraft and keep the airspace safe for 2:00. Then the tower closes arrivals. Land every remaining aircraft to complete the level. Collisions and aircraft leaving the airspace still end the shift during closing.

Coastal Airport unlocks **Regional Junction**. Its twin-engine turboprops use the square **18** approach, and its shift needs 11 landings and 2:30.

Regional Junction unlocks **Island Rescue**, where the shift needs 13 safe landings and 3:00. Route the rescue helicopter to the eight-sided **H** from any direction. Give it enough room to slow and settle. It counts as airborne until touchdown.

Island Rescue unlocks **City International** (Level 4), a busy urban airport with three runways and a helicopter pad. Land 16 aircraft over at least 3:00 and safely clear all arrivals. City International unlocks **Grand Airport** (Level 5), featuring four runways, a helipad and mixed traffic. Complete 20 landings and 3:30 to finish the five-level campaign. The final clear celebrates the complete campaign.\n\nChoose **Endless Challenge** to fly Coastal Airport as traffic builds. Campaign completion and Endless personal best are saved separately in this browser.

- Drag from the orange airliner to the **09 diamond** for the main runway. Drag from the blue light plane to the **27 circle** for the short runway.
- Follow the arrow at the approach. If you are coming from the far side, draw a wide turn upstream first. Lift your finger to file a route. Drag again from the moving plane to revise it.
- Give warning rings room. If you see **Turn back**, draw the aircraft toward open airspace.
- A landing earns one point. Consecutive landings within 34 seconds show a streak.
- Sound starts muted. Enable the speaker button for a naturalistic jet-engine wash or light-plane propeller flutter and tyre-roll texture, accompanied by a quieter success cue. Pause holds aircraft and the arrival clock. Switching away from the page also pauses the shift.

## Design and tuning

The map and aircraft silhouettes were created with Canvas. Landing sounds use original noise-based, layered Web Audio textures (similar to Cleaning Club's approach), rather than simple musical oscillators. They are **procedurally created Foley, not field recordings**; no files or external audio hosts are required. The game uses local files and native modules.

Airliners travel faster with a wider turn radius. Fixed-wing flight holds speed and limits heading changes. Helicopters turn tighter and brake for the final part of a pad route. Route samples near a tight turn may be skipped so aircraft can exit the turn. The filed route takes effect on release, and aircraft keep flying their previous heading or route during the gesture. A cancelled drag leaves the previous clearance in effect.

A runway route snaps within 65 map units of the assigned gate, with 16 units of finger-release tolerance only if the drag entered that 65-unit zone. Landing still checks position and heading. The helipad uses a 38-unit snap window and a separate low-speed capture area. The helicopter stays in collision checks through its descent, and the rooftop marker lights as its assigned route snaps. The helicopter's rotor wash and skid contact use locally generated Foley.

The opening arrivals introduce the destinations one at a time. Later arrivals enter through varied lanes on **all four edges** of the airspace. Scheduled gaps tighten in stages as time advances. The scheduler checks position and projected paths at each entry and retries blocked arrivals after one second. The fixed 60 Hz simulation checks swept separation independently of the display refresh.

## Playtest Levels 4 and 5\n\nBoth airports are packaged in the **same review PR**. A GitHub Pages PR preview can open `?review=all` to temporarily unlock all five levels in its menu for the owner's family playtest; this never writes unlock progress and does not work on the live arcade site. You can test City International and Grand Airport directly without replaying earlier levels. On the live site, normal campaign unlocking still applies.\n\n## Further improvements

The completion screen offers **Fly again**, **Menu**, **Endless Challenge**, and **Next Airport** when the next destination is available. The [campaign roadmap](./LEVEL_ROADMAP.md) outlines later airports.

## Run and test

From the repository root, use Node.js 22 or newer and a static HTTP server.

```sh
node --test games/airport-control/tests/*.test.mjs
python3 -m http.server 8000
```

Open `http://localhost:8000/games/airport-control/`. The tests cover runway and pad approaches, redraws, separation, blocked arrivals, scoring, pause, campaign closure and progression, scripted shifts through Regional Junction and Island Rescue, and six minutes of Endless.

## Safari review

1. In the PR, open **Checks → Family Arcade preview links → Preview links / Safari** and tap **Play in Safari** beside Airport Control. Check the PR preview's `revision.txt` to confirm the deployed commit.
2. In portrait, start Level 1 with sound muted. Drag the first airliner to 09 and the next light plane to 27. Confirm the route follows your finger and the landing and time objectives update.
3. On iPhone portrait and landscape, repeatedly drag aircraft and route around the whole canvas. **The page must not scroll or bounce vertically during an active shift**. Pause to access normal page controls. Redraw a route while the aircraft moves, and interrupt a drag: the previous route should remain filed.
4. Enable sound and successfully land one orange jet and one blue light plane. Confirm their touchdown sounds are noticeably different, naturally textured, appropriately brief and paired with a quiet landing cue. Mute and land again to confirm silence. Then pause, switch apps, and return. Confirm the clock and aircraft hold until you resume. With Reduce Motion enabled, check the runway, warnings and landing feedback remain clear.
5. Meet both Level 1 objectives. Check that **Closing traffic** appears, no new aircraft arrive, and the remaining aircraft can still be routed. Wait for the final rollout. Select **Next Airport** to start Regional Junction. Guide the twin-engine turboprop to the square **18** approach from the north. Try touching a different runway first to confirm it does not land there.
6. Complete Regional Junction and tap **Next Airport** for Island Rescue. On the third arrival, try routing the helicopter to a runway, then redraw to **H** from either side. The helicopter should slow, settle smoothly, and add one point when the skids touch down. Enable sound for the rotor wash, then mute and try another landing.
7. In Island Rescue, reach 13 landings and 3:00, finish the remaining traffic, then return to **Menu** and reload. Verify completed airports stay replayable.\n8. In the PR review link with `?review=all`, select City International and Grand Airport directly. Land mixed fixed-wing aircraft and helicopters at the correct marked destinations, verify the 36 runway exists only at Grand Airport, and check the urban scenery is distinct from the island artwork. Confirm both levels stop arrivals at their targets and clear safely.\n9. In the normal live-site menu, verify locked airports remain locked until the preceding airport is completed. Confirm reaching the end of Grand Airport shows **Campaign Complete!** and no nonexistent Level 6. Open **Endless Challenge** and verify play returns to Coastal Airport with the existing best score.

Desktop Chromium and Chromium touch emulation are separate from physical iPhone and iPad Safari review.
