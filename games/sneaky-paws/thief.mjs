import { $ } from './dom.mjs';

function mountThief() {
  $('thief').innerHTML = `
    <ellipse cx="84" cy="478" rx="47" ry="8" fill="#312744" opacity=".17"/>
    <g class="thief-figure">
      <path class="thief-scarf" d="M81 414Q64 412 57 423L41 428L52 434Q68 432 83 420Z" fill="#6de0bc" stroke="#305d64" stroke-width="2.5"/>
      <path d="M85 439L76 458 58 475M87 442L95 459 107 465" fill="none" stroke="#272438" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M58 475l-10 3m59-13 12-3" fill="none" stroke="#272438" stroke-width="10" stroke-linecap="round"/>
      <path d="M49 475l6-2m55-10 6-2" fill="none" stroke="#8e7faa" stroke-width="2" stroke-linecap="round"/>
      <path d="M80 415q-7 10-19 13l-9 9" fill="none" stroke="#322b48" stroke-width="8" stroke-linecap="round"/>
      <path d="M78 411q14-4 20 6l1 19q-8 11-23 3l-3-13Z" fill="#473762" stroke="#29243c" stroke-width="3"/>
      <path d="M77 434q10 5 22 0" fill="none" stroke="#a38ac3" stroke-width="3"/>
      <path d="M82 432h9v6h-9z" fill="#dfb96e" stroke="#2b253d" stroke-width="1.5"/>
      <path d="M93 420q9 1 16 5" fill="none" stroke="#2d2641" stroke-width="11" stroke-linecap="round"/>
      <path d="M95 419q7 1 13 5" fill="none" stroke="#8f70cf" stroke-width="6" stroke-linecap="round"/>
      <g class="thief-head">
        <path d="M55 398Q46 381 63 369Q82 356 100 369Q113 378 108 395L104 408Q88 423 70 413Q59 409 55 398Z" fill="#302741" stroke="#221e33" stroke-width="3"/>
        <path d="M56 386q7-17 23-17 12 0 19 6" fill="none" stroke="#756492" stroke-width="3" stroke-linecap="round"/>
        <path d="M65 388Q72 384 84 386Q96 382 104 389l-2 13q-8 12-24 9-15-2-17-12Z" fill="#ffe4ce" stroke="#241e35" stroke-width="2"/>
        <ellipse cx="71" cy="401" rx="4" ry="2" fill="#ed9ca2" opacity=".85"/><ellipse cx="100" cy="400" rx="3" ry="2" fill="#ed9ca2" opacity=".85"/>
        <g class="thief-eyes" fill="#2f233b"><ellipse cx="75" cy="394" rx="3.4" ry="4.7"/><ellipse cx="93" cy="393" rx="3.4" ry="4.7"/><path d="M75 392h.2m18-1h.2" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/></g>
        <g class="thief-face" fill="none" stroke="#663b51" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path data-expression="ready" d="M80 402q5 4 9-1"/>
          <path data-expression="thinking" d="M71 385l8-2m5 19h5"/>
          <path data-expression="alert" d="M71 384l7-2m12 0 7 2m-16 20a3 4 0 1 0 6 0 3 4 0 1 0-6 0"/>
          <path data-expression="oops" d="M71 386l7-3m12 0 7 3m-17 20q4-6 9-1"/>
          <path data-expression="clever" d="M89 384l7-1m-16 18q7 4 10-2"/>
          <path data-expression="happy" d="M79 400h12q-5 12-12 0Z" fill="#933e60"/>
        </g>
      </g>
      <path d="M72 414q11 5 23-1l2 5q-11 8-24 2Z" fill="#78deba" stroke="#305d64" stroke-width="2"/>
    </g>`;
  $('handGroup').innerHTML = `
    <circle id="glow" r="38" fill="#8ce9c1" opacity=".35"/>
    <path d="M-13-11q6-7 12-2l6 2q4-10 10-8 6 2 2 11l13-1q6 1 5 7-1 5-7 6-4 13-17 13l-20-4Z" fill="#bc9bf8" stroke="#29243c" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M-6-10Q0-12 7-8m6 0q5 3 3 8m5-4h6M1 9q7 3 13 1" fill="none" stroke="#7351ad" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M4-13l4-3m13 9 5-.5" stroke="#f5e4ff" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="-18" y="-13" width="10" height="26" rx="4" fill="#6851a7" stroke="#29243c" stroke-width="2.5"/>
    <path d="M-13-8v16" stroke="#a995db" stroke-width="2" stroke-linecap="round"/>`;
}

function setThiefPose(pose) {
  $('thief').dataset.pose = pose;
}

function setThiefExpression(expression) {
  $('thief').dataset.expression = expression;
}

export { mountThief, setThiefExpression, setThiefPose };
