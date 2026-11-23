import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export function previewUrl(repo, revision, slug) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error('Invalid repository');
  if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('A full 40-character commit SHA is required');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Invalid game directory');
  return `https://raw.githack.com/${repo}/${revision}/games/${slug}/index.html`;
}

export function previewSummary(repo, revision, base='games') {
  const games=readdirSync(base, {withFileTypes:true})
    .filter(entry=>entry.isDirectory() && existsSync(join(base,entry.name,'index.html')))
    .map(entry=>entry.name).sort();
  const lines=[
    '## iPhone / iPad Safari previews',
    '',
    'These preview links open the **exact commit** being checked, not the live arcade. Open a link in Safari on your iPhone or iPad. No app installation is required.',
    '',
    '| Game | Preview |',
    '| --- | --- |',
  ];
  for(const slug of games) {
    const html=readFileSync(join(base,slug,'index.html'),'utf8');
    const title=html.match(/<title>([^<]+)<\/title>/i)?.[1]?.replace(/\|/g,'–') || slug;
    lines.push(`| ${title} | [Play in Safari](${previewUrl(repo,revision,slug)}) |`);
  }
  if (!games.length) lines.push('| No game entry points found | — |');
  lines.push('','### Important preview limitations',
    '- Links are served by **raw.githack.com**, an independent third-party proxy for **public** GitHub source files, not by GitHub Pages. Do not use for private code or production hosting.',
    '- You may see a one-time HTML safety confirmation before the game opens. Confirm only URLs you trust.',
    '- CDN caching and availability may delay or prevent previews; the workflow verifies links have the expected format, not that Safari has played them.',
    '- A preview is **not** a deployment and does not change the Family Arcade homepage. Keep manual review and release approval in place.',
    '- Progress uses the preview origin and may differ from the live site. Avoid expecting saved games to carry across.',
    '- If you are reviewing a pull request, select the **Preview links** job for the latest run in the PR Checks tab.',
    '',
    `Source commit: \`${revision}\``,
    ''
  );
  return lines.join('\n');
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  const [repo,revision] = process.argv.slice(2);
  if (!repo || !revision) {
    console.error('Usage: node scripts/preview-links.mjs owner/repo FULL_COMMIT_SHA');
    process.exitCode=1;
  } else {
    console.log(previewSummary(repo,revision));
  }
}
