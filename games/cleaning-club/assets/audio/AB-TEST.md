# Bathtub Bliss audio A/B test

**A** is the existing GitHub Pages version with the current synthesized audio.
**B** is the branch preview after verified recordings are supplied and enabled.
The current B build intentionally plays no sound for empty Bathtub Bliss slots.
Levels 2–10 retain their existing audio.

- [A · Live Cleaning Club](https://joelgeisler1-jpg.github.io/family-games/games/cleaning-club/)
- [B · Review branch against main](https://github.com/joelgeisler1-jpg/family-games/compare/main...bathtub-bliss-recorded-foley?expand=1)
- [Source files to supply](CREDITS.md)

Serve B from the repository root with `python3 -m http.server 8000` and open
`http://127.0.0.1:8000/games/cleaning-club/` on the same machine. On an iPad,
use an HTTPS preview if available, or the existing GitHub Pages deployment
after review and merge. The branch link is for code review.

1. On the iPad, use the same system volume and in-game slider in both builds.
   Tap Sound off to enable audio. Start with the in-game slider at 24%.
2. Wipe porcelain for 5–10 seconds, alternating slow and fast motion. Pause
   without lifting, resume, then lift. Repeat on chrome and compare the tone.
3. Brush grout for 5–10 seconds. Listen for clicks, silent breaks, or a repeated
   boundary. With eyes closed, distinguish the brush from the wet sponge.
4. Make several separate spray presses, then drag once with the spray held.
   Listen for one natural burst per press and occasional soft foam detail.
5. Switch tools mid-gesture, change the slider, mute and unmute, switch apps,
   and lock and wake the device. Verify sound fades and the next gesture plays.
   Reload and check old progress and preferences, replay and Level 2 audio.

Physical iPad sound quality and sleep/wake still require testing. Freesound
returned HTTP 403 for the shortlisted pages in Codex Cloud. The attachment
contained candidate information only. No synthetic audio is substituted for
the missing Bathtub Bliss recordings.
