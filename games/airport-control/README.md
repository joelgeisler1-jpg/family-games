# Airport Control · Coastal Airport

Level 1 is an endless shift for ages six and up. Draw routes to land as many planes as possible before a collision or an aircraft leaves the airspace.

- Drag from the orange airliner to the **09 diamond** for the main runway. Drag from the blue light plane to the **27 circle** for the short runway.
- Follow the arrow at the approach. If you are coming from the far side, draw a wide turn upstream first. Lift your finger to file a route. Drag again from the moving plane to revise it.
- Give warning rings room. If you see **Turn back**, draw the aircraft toward open airspace.
- A landing earns one point. Consecutive landings within 34 seconds show a streak. Your best is saved in this browser.
- Sound starts muted. Pause holds aircraft and the arrival clock. Switching away from the page also pauses the shift.

## Design and tuning

The map, aircraft silhouettes, and sound effects were created for this game with Canvas and Web Audio. The game uses local files and native modules.

Airliners travel faster with a wider turn radius. The flight model holds speed and limits heading changes. Route samples near a tight turn may be skipped so aircraft can exit the turn. The filed route takes effect on release, and aircraft keep flying their previous heading or route during the gesture. A cancelled drag leaves the previous clearance in effect.

A route ending at a matching gate files an approach. Landing also checks position and heading. The first two arrivals remain consistent for the tutorial, but subsequent aircraft enter through varied lanes on **all four edges** of the airspace. The second aircraft appears roughly 9 seconds after the first. Subsequent scheduled gaps start at 12 seconds and accelerate in stages to a 5-second floor (approximately 5–12 arrivals per minute when entry corridors are clear). The scheduler checks position and projected paths at each entry and retries blocked arrivals after one second. Congestion can still defer an arrival rather than cause an unsafe spawn. The fixed 60 Hz simulation checks swept separation, independent of the display refresh.

## Run and test

From the repository root, use Node.js 22 or newer and a static HTTP server.

```sh
node --test games/airport-control/tests/*.test.mjs
python3 -m http.server 8000
```

Open `http://localhost:8000/games/airport-control/`. The engine tests exercise both runways, redraws, separation, blocked arrivals, scoring, pause and a six-minute shift with scripted routes. The scripted shift checks the engine and traffic schedule. Difficulty and clarity for children need real playtesting.

## Safari review

1. In the PR, open **Checks → Family Arcade preview links → Preview links / Safari** and tap **Play in Safari** beside Airport Control. Use that same commit preview on iPhone and iPad.
2. In portrait, start with sound muted. Drag the first airliner to 09. Confirm the route follows your finger, the aircraft turns smoothly, and **Landings** and **Best** increase. Land the next light plane at 27.
3. On iPhone portrait and landscape, repeatedly drag aircraft and route around the whole canvas. **The page must not scroll or bounce vertically during an active shift**. Pause to access normal page controls. Redraw a route while the aircraft moves, and interrupt a drag: the previous route should remain filed.
4. Enable sound, pause, switch apps, and return. Confirm the clock and aircraft hold until you resume. With Reduce Motion enabled, check the runway, warnings and landing feedback remain clear.
5. Guide two planes toward each other to check escalating warnings and collision feedback. Replay, let an unfiled aircraft fly out, and confirm the escape warning and restart. Reload to check that Best persists.
6. Play long enough to observe aircraft from west, east, north and south, with different entry positions on each edge. Confirm the second plane appears after roughly 9 seconds and that arrivals speed up with play time without unsafe overlapping spawns. Try a five-minute family playtest and record when the tempo gets hard and which approaches are difficult to read.

Desktop Chromium and Chromium touch emulation are separate from physical iPhone and iPad Safari review.
