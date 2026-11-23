import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// GitHub Pages publishes the main arcade plus a distinct directory for each
// open, same-repository PR. No independent proxy or public file mirroring.
export function previewUrl(repo, number, slug) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error('Invalid repository');
  if (!Number.isSafeInteger(Number(number)) || Number(number) < 0 || !/^\d+$/.test(String(number))) throw new Error('Invalid PR number');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Invalid game directory');
  const [owner, name] = repo.split('/');
  const folder = Number(number) === 0 ? '' : `previews/pr-${number}/`;
  return `https://${owner}.github.io/${name}/${folder}games/${slug}/`;
}

export function previewSummary(repo, number, base = 'games') {
  const games = readdirSync(base, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && existsSync(join(base, entry.name, 'index.html')))
    .map(entry => entry.name).sort();
  const lines = [
    '## iPhone / iPad Safari previews — GitHub Pages',
    '',
    'These links use **GitHub Pages**, hosted by GitHub instead of a third-party file proxy. Open a link in Safari on iPhone or iPad.',
    '',
    '| Game | Preview |',
    '| --- | --- |',
  ];
  for (const slug of games) {
    const html = readFileSync(join(base, slug, 'index.html'), 'utf8');
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.replace(/\|/g, '–') || slug;
    lines.push(`| ${title} | [Play in Safari](${previewUrl(repo, number, slug)}) |`);
  }
  if (!games.length) lines.push('| No game entry points found | — |');
  lines.push('',
    '### Preview requirements and limitations',
    '- Repository owner must first enable **Settings → Pages → Build and deployment → GitHub Actions** and merge the Pages workflow PR.',
    '- The **Family Arcade Pages previews** deployment must finish successfully before these links work. The link-generator check alone does not publish anything.',
    '- Open same-repository PR previews update to the latest PR commit after a deployment. They are not immutable snapshots; the deployed \`revision.txt\` identifies the source commit.',
    '- On merge or closure, the preview disappears after the next successful deployment; the main arcade remains available.',
    '- GitHub Pages is public hosting. Never include secrets or private data; only review trusted PRs. Preview and live games share an origin, so local-storage keys may carry across.',
    '- The link does **not** approve, merge, or add a game to the main arcade homepage. Always playtest on a physical iPhone before merging.',
    '',
    `Preview: ${Number(number) > 0 ? `PR #${number}` : 'main arcade'}`,
    ''
  );
  return lines.join('\n');
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  const [repo, number] = process.argv.slice(2);
  if (!repo || number === undefined) {
    console.error('Usage: node scripts/preview-links.mjs owner/repo PR_NUMBER (0 for main)');
    process.exitCode = 1;
  } else {
    console.log(previewSummary(repo, number));
  }
}
