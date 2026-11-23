import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Dependency-free, static smoke checks. These are NOT simulated gameplay or Safari tests.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../');
const gameDir = resolve(root, 'games/cleaning-club');
const read = path => readFileSync(resolve(gameDir, path), 'utf8');
const html = read('index.html');
const game = read('game.js');
const cleaning = read('cleaning.js');
const effects = read('cleaning-effects.js');

test('all game scripts are local, present and loaded in their required order', () => {
  const scripts = [...html.matchAll(/<script\s+defer\s+src="([^"]+)"\s*><\/script>/g)].map(m => m[1]);
  assert.deepEqual(scripts, [
    'audio.js', 'foley.js', 'cleaning-effects.js', 'cleaning.js', 'bathtub.js',
    'levels/surfaces.js', 'levels/vanity.js', 'levels/bedroom.js',
    'levels/playroom.js', 'levels/workrooms.js', 'levels/finale.js', 'game.js',
  ]);
  for (const file of scripts) assert.ok(existsSync(resolve(gameDir, file)), file);
});

test('ten authored levels are registered in their intended order', () => {
  const titles = [...game.matchAll(/\{title:'([^']+)'/g)].map(m => m[1]);
  assert.equal(titles.length, 10);
  assert.equal(new Set(titles).size, 10);
  assert.match(game, /const advancedLevels\s*=\s*\[\s*\{\.\.\.bathtubLevel,\s*artwork:bathtubArtwork\},\s*vanityLevel,bedroomLevel,playroomLevel,/);
  for (const id of ['kitchenLevel','puppyLevel','artStudioLevel','gardenLevel','cafeLevel','palaceLevel']) {
    assert.match(game, new RegExp('\\b' + id + '\\b'));
  }
});

test('all three cleaning tools have visible controls and meaningful settings', () => {
  for (const tool of ['spray','sponge','brush']) {
    assert.match(html, new RegExp('data-tool="' + tool + '"'));
    assert.match(cleaning, new RegExp('\\b' + tool + ':\\s*\\{[^}]*radius:'));
    assert.ok(existsSync(resolve(gameDir, 'assets/tools/' + tool + '.svg')), tool + ' icon');
  }
  assert.match(html, /id="activeTool"/);
  assert.match(html, /id="dirtCanvas"/);
});

test('mud cracking and tactile cleaning effects remain wired', () => {
  assert.match(cleaning, /function scratchMud\s*\(/);
  assert.match(cleaning, /crusted/);
  assert.match(read('levels/workrooms.js'), /crusted:true/);
  assert.match(read('levels/finale.js'), /crusted:true/);
  assert.match(effects, /class CleaningEffects/);
  assert.match(effects, /residue\.kind === 'mud'/);
});

test('progress, completion, replay and comparison UI remain available', () => {
  for (const id of ['meter','progressLabel','finish','next','again','openComparison','closeComparison','compareRange']) {
    assert.match(html, new RegExp('id="' + id + '"'), id);
  }
  assert.match(game, /function checkProgress\s*\(/);
  assert.match(game, /function complete\s*\(/);
  assert.match(game, /function setComparison\s*\(/);
});
