import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, COLORS, canMove, findMatch, isComplete } from '../logic.mjs';
test('five original levels have uniquely coloured stars and valid homes',()=>{
  assert.equal(LEVELS.length,5);
  const known=new Set(COLORS.map(c=>c.id));
  for(const level of LEVELS){
    assert.ok(level.stars.length>=2);
    assert.equal(new Set(level.stars.map(s=>s.id)).size,level.stars.length);
    for(const star of level.stars){
      assert.ok(known.has(star.id));
      assert.ok(canMove(...star.from,level.clouds));
      assert.ok(canMove(...star.to,level.clouds));
    }
  }
});
test('stars can only be delivered to matching home within range',()=>{
  const level=LEVELS[0];
  const first=level.stars[0];
  assert.ok(findMatch(first.id,{x:first.to[0],y:first.to[1]},level,[]));
  assert.equal(findMatch(first.id,{x:0,y:0},level,[]),false);
  assert.equal(findMatch(first.id,{x:first.to[0],y:first.to[1]},level,[first.id]),false);
  assert.equal(findMatch('unknown',{x:first.to[0],y:first.to[1]},level,[]),false);
});
test('clouds block dragging and level completes only when all stars delivered',()=>{
  const level=LEVELS[2],cloud=level.clouds[0];
  assert.equal(canMove(cloud.x+10,cloud.y+10,level.clouds),false);
  assert.ok(canMove(40,40,level.clouds));
  assert.equal(isComplete(level,[]),false);
  assert.equal(isComplete(level,level.stars.map(s=>s.id)),true);
});
