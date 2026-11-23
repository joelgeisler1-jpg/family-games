import { START } from './constants.mjs';

const state = {
  unlocked: 1,
  level: 0,
  mode: 'ready',
  attempt: 0,
  points: [],
  lastInput: { ...START },
  wheelContact: null,
  scannerAlert: 0,
  scannerWarned: false,
  keyTaken: false,
  switchOn: false,
  spoolStates: [],
  slideState: { progress: 0, gripped: false, done: false, tick: 0 },
  decoyTriggered: false,
  distractedUntil: 0,
  guardStates: [],
  activePointer: null,
  cameraAngle: 0,
  lastTime: 0,
  edgeSide: '',
  winAnimation: 0,
  clock: 0,
};

export { state };
