import test from 'node:test';
import assert from 'node:assert/strict';
import { previewUrl, previewSummary } from '../preview-links.mjs';

const sha='0123456789abcdef0123456789abcdef01234567';
test('preview URLs are commit-specific and use an isolated game entry point',()=>{
  assert.equal(previewUrl('example/family-games',sha,'star-post'),
    'https://raw.githack.com/example/family-games/'+sha+'/games/star-post/index.html');
});
test('reject invalid refs, repositories and directory names',()=>{
  assert.throws(()=>previewUrl('example/family-games','main','star-post'));
  assert.throws(()=>previewUrl('example/family-games',sha,'../secrets'));
  assert.throws(()=>previewUrl('https://example.com',sha,'star-post'));
});
test('preview summary discovers known games without editing the homepage',()=>{
  const summary=previewSummary('example/family-games',sha);
  for(const slug of ['star-post','sneaky-paws','cleaning-club']) assert.match(summary,new RegExp('/games/'+slug+'/index.html'));
  assert.match(summary,/third-party proxy/);
  assert.match(summary,/not a deployment/);
});
