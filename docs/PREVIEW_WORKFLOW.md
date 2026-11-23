# Safari game previews — iPhone-only workflow

## How to review any game PR

1. Open the proposed pull request in the GitHub mobile app or Safari, then open **Checks**.
2. Open **Family Arcade preview links** → **Preview links / Safari** → the run summary (on mobile, GitHub may require **View workflow run** in Safari).
3. Tap **Play in Safari** beside the game you want to review.
4. The link points to the exact commit the workflow checked. A one-time safety confirmation may appear on the proxy site. Check the address before continuing.
5. Play the requested scenarios on your real iPhone and iPad, review the automated QA results and leave feedback in the PR.
6. Merge only after your manual approval. The preview itself does not merge, deploy or add games to the arcade homepage.

## How it works

`.github/workflows/preview-links.yml` uses a tiny dependency-free Node script to list game folders with `index.html` and place public preview links in the GitHub Actions run summary. Each link uses a **40-character commit SHA**, so different PRs do not overwrite each other's previews. The script does not upload website files, modify the main site, deploy anything, request write privileges or use credentials.

The links are served by `raw.githack.com`, an independent third-party service that proxies public GitHub files with browser-friendly content types. It is not affiliated with GitHub or OpenAI and is only suitable for low-volume **development previews**. Content may be cached and there is no uptime guarantee. A third-party proxy can view requests, and publicly visible source is essential. Never place secrets or personal data in a game repository or test link. The service may show an HTML safety confirmation, particularly on the first visit.

Previews include the assets relative to the chosen game and current commit. Note that browser storage is scoped to this preview origin and might not match the live Family Arcade site; two games on the same preview origin could also share origin storage. This is not a sandbox or a guarantee of security for untrusted scripts. Only open previews from trusted code.

## Manual QA

Check start, drag/touch interactions, pointer release/cancel, level success, reset and progress persistence as relevant; test portrait and landscape, visual effects, controls and audio. The generated link is **not** proof that the game works on iPhone Safari. Keep using `docs/QA_CHECKLIST.md`.

## Limitations and possible next upgrade

- No permanent preview deployment, authentication or rollback is managed by this workflow.
- Since the URL uses an immutable commit, a new push requires a new run summary/link.
- Previews rely on an external service; if it is unavailable, use a configured first-party static hosting provider.
- For fully managed branch previews with predictable hosting and privacy controls, a dedicated Cloudflare Pages/Netlify/Vercel preview project is the next upgrade. It requires account setup and possibly access tokens; that is intentionally not added here.
