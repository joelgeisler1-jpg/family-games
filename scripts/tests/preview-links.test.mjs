import test from 'node:test';
import assert from 'node:assert/strict';
import { previewUrl, previewSummary } from '../preview-links.mjs';

test('preview URLs are first-party GitHub Pages paths scoped to a PR', () => {
  assert.equal(previewUrl('example/family-games', 38, 'airport-control'),
    'https://example.github.io/family-games/previews/pr-38/games/airport-control/');
  assert.equal(previewUrl('example/family-games', 0, 'airport-control'),
    'https://example.github.io/family-games/games/airport-control/');
});
test('reject invalid PR numbers, repositories and directory names', () => {
  assert.throws(() => previewUrl('example/family-games', 'main', 'star-post'));
  assert.throws(() => previewUrl('example/family-games', -4, 'star-post'));
  assert.throws(() => previewUrl('example/family-games', 38, '../secrets'));
  assert.throws(() => previewUrl('https://example.com', 38, 'star-post'));
});
test('summary enumerates games without presenting links as already deployed', () => {
  const summary = previewSummary('example/family-games', 38);
  for (const slug of ['star-post', 'sneaky-paws', 'cleaning-club']) {
    assert.match(summary, new RegExp('/previews/pr-38/games/' + slug + '/'));
  }
  assert.match(summary, /GitHub Pages/);
  assert.match(summary, /deployment must finish successfully/);
  assert.ok(summary.includes('does **not** approve, merge'));
  assert.doesNotMatch(summary, /raw\.githack\.com/);
});
