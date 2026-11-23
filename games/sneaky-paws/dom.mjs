import { NS } from './constants.mjs';

const $ = (id) => document.getElementById(id),
  scene = $('scene'),
  board = $('board'),
  staticLayer = $('static'),
  actors = $('actors'),
  roomDecor = $('roomDecor'),
  scannerFX = $('scannerFX'),
  cameraCone = $('cameraCone'),
  arm = $('arm'),
  armOutline = $('armOutline'),
  armShadow = $('armShadow'),
  highlight = $('armHighlight'),
  handGroup = $('handGroup'),
  targetGroup = $('targetGroup'),
  effects = $('effects'),
  stolen = $('stolen');
const svg = (tag, attrs = {}) => {
  let e = document.createElementNS(NS, tag);
  for (let [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};
const piece = (content, attrs) => {
  let el = svg('g', attrs);
  el.innerHTML = content;
  return el;
};

export {
  $,
  actors,
  arm,
  armOutline,
  armShadow,
  board,
  cameraCone,
  effects,
  handGroup,
  highlight,
  piece,
  roomDecor,
  scannerFX,
  scene,
  staticLayer,
  stolen,
  svg,
  targetGroup,
};
