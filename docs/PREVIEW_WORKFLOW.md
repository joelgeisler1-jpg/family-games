# iPhone Safari previews — GitHub Pages

The previous `raw.githack.com` proxy URLs were unreliable and could return HTTP 403. Family Arcade now uses **GitHub Pages**, with the main arcade and each open same-repository pull request published under different paths.

## One-time owner setup (required after merging this PR)

1. Open [repository Settings → Pages](https://github.com/joelgeisler1-jpg/family-games/settings/pages) in Safari (desktop website mode may be easier on iPhone).
2. Under **Build and deployment**, set **Source → GitHub Actions**.
3. Open **Actions → Family Arcade Pages previews** and select **Run workflow** on `main`. If GitHub starts the first deployment automatically after merging, you can simply review its result.
4. Confirm the build and publish jobs succeed. If GitHub shows an approval prompt for the `github-pages` environment, approve it as the repository owner.
5. Open the [main Family Arcade GitHub Pages site](https://joelgeisler1-jpg.github.io/family-games/) after the successful deploy.

**The GitHub Pages links are not live merely because this PR is created or merged.** Until Source is set to GitHub Actions and a deployment succeeds, a preview can return 404.

## How to review a PR in Safari

1. Open the PR's **Checks → Family Arcade preview links → Preview links / Safari** job summary to find its game URLs.
2. Look at **Actions → Family Arcade Pages previews**. Wait for the **Publish first-party Safari previews** job for the relevant PR's latest commit to finish successfully.
3. Open e.g. [Airport Control — PR #38](https://joelgeisler1-jpg.github.io/family-games/previews/pr-38/games/airport-control/) on iPhone or iPad Safari.
4. Test dragging, route release, landing, menu, completion state, audio, pause, screen orientation and saved progress.
5. Check CI, review the PR, and **merge manually only when approved**.

The preview URL `https://joelgeisler1-jpg.github.io/family-games/previews/pr-NUMBER/games/GAME/` tracks the **latest deployed head of that open PR**, not an immutable commit snapshot. Check `/previews/pr-NUMBER/revision.txt` to identify the currently deployed 40-character commit SHA if you suspect caching. The deployment runs on PR open, update, reopen or close, as well as main pushes and a manual dispatch. When the PR closes, its preview is removed on the next successful deployment.

The standard arcade remains accessible at `https://joelgeisler1-jpg.github.io/family-games/`, and the version on `main` at `.../games/airport-control/`. PR previews don't add or remove homepage tiles.

## Implementation and security

- `.github/workflows/pages-previews.yml` runs only the **trusted default-branch workflow** and uses GitHub's supported upload/deploy Pages actions.
- The build uses the `main` arcade and includes only selected static game files from **open PRs originating in the same repository**, placed in `dist/previews/pr-NUMBER/`. It does not run untrusted PR scripts, install PR dependencies or automatically merge.
- GitHub Pages is public hosting. A PR preview can still include executable game JavaScript **when a human opens its URL**, so only preview code you trust. All games share the GitHub Pages origin; localStorage keys can also be shared across main and PR preview paths.
- Fork-based PRs are not deployed automatically. Games are always public; never commit API keys, passwords or private family data.
- The build uses GitHub's `GITHUB_TOKEN` permissions scoped to read contents, while the publish job has `pages:write` and `id-token:write`. No personal-access token or paid hosting account is required.
- GitHub Pages supports one currently published site per repo. Every successful deployment rebuilds the main site and **all currently open, same-repo PR previews together**, preventing one preview from unintentionally overwriting another.

## Troubleshooting

- **404 on Pages:** Check that Settings → Pages uses **GitHub Actions**, and the latest Pages deploy job succeeded. A link generator passing tests does not constitute a deployment.
- **Old version appears:** Open `revision.txt` for that PR to check deployed head, and ensure the latest Pages job completed.
- **A PR is closed or merged:** Its preview is intentionally removed; open the main site's version or review a new PR.
- **Pages deployment denied:** Check Pages settings and any required environment approval. The Pages job must have `pages:write` and `id-token:write`.
- **Not opening from iPhone:** Try Safari directly, not a GitHub embedded web view.

Automated tests do not replace a real-device Safari review. Follow `docs/QA_CHECKLIST.md`.
