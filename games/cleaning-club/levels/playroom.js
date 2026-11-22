'use strict';

const shelfRails = 'M106 189H854V221H106Z M106 335H854V367H106Z M106 478H854V516H106Z';
const shelfBins = 'M144 403H327L315 474H155Z M388 401H567L557 474H399Z M632 399H815L801 474H647Z';
const shelfCorners = 'M107 104H141V479H107Z M819 104H853V479H819Z M347 226H377V336H347Z M580 372H609V477H580Z';
const toyFaces = ovalOutline(232,144,57,42)+ovalOutline(630,271,57,52)+'M433 120H531V187H433Z M714 122H802V185H714Z';
const toyShelves = cleaningZone(shelfRails,'wood');
const toyBins = cleaningZone(shelfBins,'plastic');
const toyCorners = cleaningZone(shelfCorners,'wood');
const toySurfaces = cleaningZone(toyFaces,'plastic');
const plasticToys = cleaningZone(toyFaces+ovalOutline(222,290,60,35),'plastic');

function toyBlock(x,y,w,h,color,mark) {
  return `<g transform="translate(${x} ${y})">
    <rect width="${w}" height="${h}" rx="9" fill="${color}" stroke="#8e7996" stroke-width="2.5"/>
    <path d="M8 ${h-10}V8h${w-19}" fill="none" stroke="#fff7e2" stroke-width="3" stroke-linecap="round" opacity=".72"/>
    <rect x="10" y="10" width="${w-20}" height="${h-20}" rx="5" fill="none" stroke="#fff6e7" opacity=".36"/>
    <path d="${mark}" fill="#fff0c5" stroke="#fff0c5" stroke-width="3" stroke-linejoin="round"/>
  </g>`;
}

function playroomArtwork() {
  return `
  <defs>
    <linearGradient id="toy-wall" x2="0" y2="1"><stop stop-color="#e9e6f6"/><stop offset="1" stop-color="#bcb9df"/></linearGradient>
    <linearGradient id="toy-board" x2="0" y2="1"><stop stop-color="#eec9a4"/><stop offset=".52" stop-color="#daaa92"/><stop offset="1" stop-color="#b88482"/></linearGradient>
    <linearGradient id="toy-back" x2=".16" y2="1"><stop stop-color="#a9c9c6"/><stop offset="1" stop-color="#8c9fb4"/></linearGradient>
    <linearGradient id="toy-teddy" x2=".4" y2="1"><stop stop-color="#f3cf9f"/><stop offset="1" stop-color="#ca927d"/></linearGradient>
    <linearGradient id="toy-robot" x2=".8" y2="1"><stop stop-color="#c9d9ed"/><stop offset="1" stop-color="#858faf"/></linearGradient>
    <pattern id="toy-wallpaper" width="59" height="54" patternUnits="userSpaceOnUse">
      <path d="M9 11l3 4l5 2l-5 2l-3 5l-2-5l-5-2l5-2Z" fill="#fff7ea" opacity=".48"/>
      <circle cx="39" cy="41" r="2.3" fill="#a79bc9" opacity=".55"/>
    </pattern>
    <pattern id="toy-wicker" width="10" height="8" patternUnits="userSpaceOnUse">
      <path d="M0 2h10M0 6h10M2 0v4m6 0v4" stroke="#fff3d8" stroke-width="1" opacity=".26"/>
    </pattern>
    <filter id="toy-shadow"><feGaussianBlur stdDeviation="12"/></filter>
  </defs>
  <path d="M0 0H960V620H0Z" fill="url(#toy-wall)"/>
  <path d="M0 0H960V511H0Z" fill="url(#toy-wallpaper)"/>
  <path d="M0 518H960V620H0Z" fill="#d8b3a4"/>
  <path d="M0 510H960M0 523H960" stroke="#efd5c9" stroke-width="6"/>
  <path d="M0 562H960M0 602H960M150 523l-58 97m233-97l-26 97m269-97l11 97m209-97l63 97" fill="none" stroke="#a07e89" opacity=".42" stroke-width="3"/>
  <ellipse cx="477" cy="552" rx="416" ry="40" fill="#786482" opacity=".36" filter="url(#toy-shadow)"/>
  <ellipse cx="483" cy="569" rx="305" ry="34" fill="#c29cc5" stroke="#f3ccd5" stroke-width="7"/>
  <ellipse cx="483" cy="569" rx="279" ry="26" fill="none" stroke="#eee1ec" stroke-width="2" stroke-dasharray="3 4"/>
  <path d="M83 510V121Q82 64 137 57H819Q877 59 878 120V510Z" fill="url(#toy-board)" stroke="#9f7481" stroke-width="5"/>
  <path d="M105 489V123Q106 83 141 77H821Q853 86 854 123V489Z" fill="url(#toy-back)" stroke="#9c7b88" stroke-width="4"/>
  <path d="M109 127H853M109 230H853M109 376H853" stroke="#e6e0df" opacity=".19" stroke-width="16"/>
  <path d="M117 101q360-10 725 0m-726 136q355 10 728 0m-726 148q351 9 726 0" fill="none" stroke="#f7edde" opacity=".43" stroke-width="2"/>
  <path d="M109 513v31m742-31v31" stroke="#a47983" stroke-width="22" stroke-linecap="round"/>
  <path d="${shelfCorners}" fill="url(#toy-board)" stroke="#b18484" stroke-width="3"/>
  <g transform="translate(231 144)">
    <circle cx="-39" cy="-30" r="20" fill="url(#toy-teddy)" stroke="#a77774" stroke-width="3"/>
    <circle cx="39" cy="-30" r="20" fill="url(#toy-teddy)" stroke="#a77774" stroke-width="3"/>
    <circle cx="-39" cy="-30" r="11" fill="#dca1a0"/><circle cx="39" cy="-30" r="11" fill="#dca1a0"/>
    <ellipse rx="57" ry="42" fill="url(#toy-teddy)" stroke="#a77774" stroke-width="3"/>
    <ellipse cy="13" rx="29" ry="18" fill="#f4d7b6"/>
    <ellipse cx="-20" cy="-7" rx="5" ry="7" fill="#685368"/><ellipse cx="20" cy="-7" rx="5" ry="7" fill="#685368"/>
    <path d="M-8 6q8-5 16 0q-8 12-16 0m8 9q-4 8-11 6m11-6q4 8 11 6" fill="#a56c7b" stroke="#a56c7b" stroke-width="2"/>
    <path d="M-11 39l-20-8v22l20-7m22-7l20-8v22l-20-7Z" fill="#b47eae" stroke="#916c98" stroke-width="2"/>
    <circle cy="42" r="8" fill="#cf9dbf"/>
  </g>
  ${toyBlock(324,132,66,55,'#e4a8a7','M32 15L42 38H22Z')}
  ${toyBlock(427,118,101,70,'#9aabc9','M50 17l5 11h12l-9 7l4 13l-12-8l-11 8l4-13l-9-7h12Z')}
  ${toyBlock(551,117,70,71,'#a5c9b5','M35 21a14 14 0 1 0 0 28a14 14 0 1 0 0-28')}
  <g transform="translate(755 174)">
    <path d="M-51 10V-4a51 51 0 0 1 102 0v14Z" fill="#dca3ac" stroke="#aa7f90" stroke-width="3"/>
    <path d="M-40 9V-4a40 40 0 0 1 80 0v13M-28 9V-4a28 28 0 0 1 56 0v13m-43 0V-4a15 15 0 0 1 30 0v13" fill="none" stroke="#f4d6a1" stroke-width="5"/>
  </g>
  <g transform="translate(222 322)">
    <path d="M-64-12q9-52 60-63q46 4 69 43v20Z" fill="#d99aaa" stroke="#997990" stroke-width="3"/>
    <path d="M-32-36q15-22 31-25q26 8 39 25Z" fill="#b8d7db" stroke="#987e9c" stroke-width="3"/>
    <path d="M-4-60v24m-58 14h120" stroke="#fbceb8" stroke-width="3"/>
    <circle cx="-37" cy="-10" r="13" fill="#82778d"/><circle cx="36" cy="-10" r="13" fill="#82778d"/>
    <circle cx="-37" cy="-10" r="6" fill="#f2d4ad"/><circle cx="36" cy="-10" r="6" fill="#f2d4ad"/>
  </g>
  ${toyBlock(401,280,70,55,'#e8bb85','M35 13l12 15-12 15-12-15Z')}
  <g transform="translate(628 269)">
    <path d="M0-44v-23" stroke="#7e7897" stroke-width="4"/><circle cy="-67" r="7" fill="#e5ba90"/>
    <rect x="-55" y="-40" width="110" height="70" rx="20" fill="url(#toy-robot)" stroke="#777996" stroke-width="4"/>
    <path d="M-46-23v-5q42-13 85 0" fill="none" stroke="#f4ebf3" stroke-width="3" opacity=".8"/>
    <rect x="-37" y="-22" width="74" height="36" rx="11" fill="#a4c4cd" stroke="#7d91a5" stroke-width="2"/>
    <circle cx="-17" cy="-6" r="6" fill="#f7e4bb"/><circle cx="17" cy="-6" r="6" fill="#f7e4bb"/>
    <path d="M-11 4q11 8 22 0" fill="none" stroke="#8395a5" stroke-width="2"/>
    <rect x="-37" y="31" width="74" height="34" rx="8" fill="#a7add0" stroke="#777996" stroke-width="3"/>
    <path d="M-26 42h52m-51 10h50" stroke="#e3d8e4" stroke-width="2"/>
    <circle cy="48" r="6" fill="#dfacaf"/>
  </g>
  ${toyBlock(734,270,62,65,'#ddb0c9','M16 31q15-16 30 0q-15 14-30 0Z')}
  <path d="${shelfBins}" fill="#c9a4ad" stroke="#a77f91" stroke-width="4"/>
  <path d="M144 403H327L315 474H155Z" fill="#dca9b3"/>
  <path d="M388 401H567L557 474H399Z" fill="#c4bdd9"/>
  <path d="M632 399H815L801 474H647Z" fill="#aecdbf"/>
  <path d="${shelfBins}" fill="url(#toy-wicker)"/>
  <path d="M152 412h167m76-2h164m79-2h168" stroke="#fff0d8" opacity=".63" stroke-width="5"/>
  <path d="M210 431h50m192-2h50m197-2h49" stroke="#8b7d92" stroke-width="8" stroke-linecap="round"/>
  <path d="${shelfRails}" fill="url(#toy-board)" stroke="#a17481" stroke-width="4"/>
  <path d="M113 195h734M113 341h734M113 484h734m-732 21q357 7 728 0" stroke="#ffe8c0" opacity=".75" stroke-width="3" fill="none"/>
  <path d="M106 206q361 11 748 0m-746 145q371 10 745 0m-746 145q364 10 745 0" stroke="#996e7b" opacity=".41" fill="none" stroke-width="1.4"/>
  ${polishGlints([[470,136,11],[669,250,12],[748,454,9],[306,349,8]])}`;
}

const toyFingerprints = [['print',220,151,23,19],['print',472,162,28,18],['print',765,164,25,14],['print',621,262,34,22]];

const toyCornerMarks = [['residue',123,163,12,34],['residue',124,313,13,31],['residue',361,303,10,28],['residue',591,439,11,30],['residue',837,172,12,30],['residue',837,437,12,34]];
const visibleCornerMarks = toyCornerMarks.map(mark => mark[1] === 591 ? ['residue',591,390,11,17] : mark);

const playroomLevel = {
  dirtVersion: 2, idleHints: true,
  artwork: playroomArtwork, seed: 64129, saveKey: 'familyArcadeRainbowToyRoomProgress1',
  description: 'Dust the rainbow shelves, clean the toys and lift sticky marks from the bins.',
  finishTitle: 'The rainbow is back!',
  finishMessage: 'The toys are bright again and the shelf corners are spotless.',
  notes: {spray:'Loosens sticky marks',sponge:'Wipes toys and bins',brush:'Dusts shelves and corners'},
  audioMaterial: zoneMaterial([plasticToys,toyBins,toyShelves,toyCorners],'dust'),
  layers: [
    dirtLayer({id:'dust',label:'Shelf dust',color:'#978b82',weight:.28,tool:'brush',action:'Dust the ledges under the toys with the brush.'},toyShelves,
      [['dust',175,204,47,13],['dust',402,207,49,12],['dust',711,205,48,12],['dust',282,349,48,12],['dust',556,351,45,12],['dust',756,497,48,15],['dust',354,497,46,15]],paintRoomDirt),
    {
      ...dirtLayer({id:'prints',label:'Toy fingerprints',color:'#748d9b',weight:.23,tool:'sponge',action:'Wipe the cloudy fingerprints from the car, block, rainbow and robot.'},plasticToys,
        [['print',220,292,23,19],...toyFingerprints.slice(1)],paintRoomDirt),
      legacyDraw: surfaceDirt(toySurfaces,toyFingerprints)
    },
    dirtLayer({id:'sticky',label:'Sticky marks',color:'#b97983',weight:.28,tool:'sponge',prepare:'spray',action:'Foam the sticky marks on the bins, then wipe them with the sponge.'},toyBins,
      [['sticky',190,446,37,21,-.25],['sticky',278,450,33,19,.26],['sticky',471,455,43,16,-.1],['sticky',693,448,35,18,-.31],['sticky',773,452,33,19,.37]],paintRoomDirt),
    {
      ...dirtLayer({id:'corners',label:'Corner crumbs',color:'#907855',weight:.21,tool:'brush',action:'Brush the dusty inside edges and shelf corners.'},toyCorners,
        visibleCornerMarks,paintRoomDirt),
      legacyDraw: surfaceDirt(toyCorners,toyCornerMarks)
    }
  ]
};
