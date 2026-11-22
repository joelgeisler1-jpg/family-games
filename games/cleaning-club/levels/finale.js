'use strict';

const gardenPottery = cleaningZone('M168 215H320L303 303Q293 333 245 333H211Q193 330 188 310Z M363 205H530L509 305Q503 334 446 333Q401 333 393 309Z M552 250H660L649 311Q642 329 601 329Q575 327 570 313Z','porcelain');
const gardenBench = cleaningZone('M118 292H842L893 375H60Z M172 288H310L299 320Q282 338 211 333L190 325Z M380 288H519L505 323Q480 337 397 333Z M557 289H656L647 324Q614 335 574 327Z','wood');
const gardenTools = cleaningZone('M531 335L664 327L685 343L799 328L807 345L685 364L638 359L534 368Z','chrome');
const gardenShelf = cleaningZone('M151 505H804V528H151Z','wood');

const gardenLevel = {
  artwork:()=>polishGlints([[222,306,7],[460,308,9],[761,350,7]]),
  dirtVersion:4,idleHints:true,seed:84913,saveKey:'familyArcadeSecretGardenProgress1',
  description:'Foam and brush the terracotta, then wipe the bench and tend to the tools.',
  finishTitle:'The greenhouse is glowing!',
  finishMessage:'Warm terracotta and sunlit timber are ready for planting.',
  notes:{spray:'Softens dried mud',sponge:'Wipes soil and water rings',brush:'Lifts mud and shelf grime'},
  audioMaterial:zoneMaterial([gardenPottery,gardenTools,gardenShelf,gardenBench],'dust'),
  layers:[
    workroomDirt({id:'mud',effectKind:'mud',crusted:true,label:'Dried terracotta mud',color:'#906445',weight:.29,tool:'brush',prepare:'spray',action:'Soften the dark mud on the pots with foam, then brush it away.'},gardenPottery,
      [['mud',222,277,36,21,-.21],['mud',270,315,30,14,.32],['mud',441,280,44,23,.17],['mud',478,314,27,13,-.2],['mud',614,303,32,20,-.12]]),
    workroomDirt({id:'soil',effectKind:'mud',label:'Loose bench soil',color:'#8c6045',weight:.22,tool:'sponge',action:'Wipe up the loose soil along the front of the bench.'},gardenBench,
      [['mud',145,357,43,13,.16],['mud',334,360,54,12,-.16],['mud',476,357,47,12,.18],['mud',840,357,31,13,-.2]]),
    workroomDirt({id:'rings',label:'Water rings',color:'#9f805b',weight:.17,tool:'sponge',action:'Glide the sponge over the water rings just below the pots.'},gardenBench,
      [['water',234,342,37,13,.1],['water',413,343,37,13,-.12],['water',573,336,30,10,.14]]),
    workroomDirt({id:'tools',label:'Dirty garden tools',color:'#816b49',weight:.15,tool:'brush',action:'Brush the caked dirt off the tools beside the watering can.'},gardenTools,
      [['grout',604,350,32,8,-.19],['grout',703,350,34,9,-.2],['grout',773,339,21,7,-.1]]),
    workroomDirt({id:'shelf',label:'Lower shelf dust',color:'#9c8061',weight:.17,tool:'brush',action:'Brush the loose dust along the lower shelf.'},gardenShelf,
      [['soil',190,517,34,9],['soil',394,519,43,9],['soil',515,515,42,9],['soil',753,519,38,9]])
  ]
};

const cafeGlass = cleaningZone('M199 166Q205 124 251 101Q272 93 302 92H657Q721 97 749 141Q762 159 762 187V353H199Z','glass');
const cafeFrame = cleaningZone('M184 166Q187 116 238 87Q265 74 303 75H656Q714 75 752 121Q779 146 778 185V381H184Z M201 172Q211 124 251 103Q271 94 305 94H655Q713 100 747 145Q762 160 762 189V357H201Z','chrome');
const cafeMarble = cleaningZone('M66 345H899L948 428H11Z M183 344H779V381H183Z','stone');

const cafeLevel = {
  artwork:()=>polishGlints([[257,186,9],[714,292,10],[566,406,8]]),
  dirtVersion:3,idleHints:true,seed:93251,saveKey:'familyArcadeSweetTreatCafeProgress1',
  description:'Lift sticky icing and biscuit crumbs, then clear the dessert display.',
  finishTitle:'The café looks delicious!',
  finishMessage:'The glass is crystal clear and the little pastries are ready to serve.',
  notes:{spray:'Softens icing smears',sponge:'Wipes marble and glass',brush:'Lifts crumbs and frame grime'},
  audioMaterial:zoneMaterial([cafeFrame,cafeGlass,cafeMarble],'dust'),
  layers:[
    workroomDirt({id:'icing',effectKind:'icing',sampleResidue:true,label:'Sticky icing',color:'#b46989',weight:.24,tool:'sponge',prepare:'spray',action:'Foam the thick pink and violet icing on the marble, then wipe through it.'},cafeMarble,
      [['icing',231,407,59,15,-.16],['violet',445,409,58,15,.13],['icing',710,406,55,14,-.2]]),
    workroomDirt({id:'crumbs',effectKind:'crumb',label:'Biscuit crumbs',color:'#a97649',weight:.15,tool:'brush',action:'Brush up the golden crumbs around the display.'},cafeMarble,
      [['crumbs',124,398,35,12,.2],['crumbs',345,391,43,10,-.17],['crumbs',584,403,49,13,.12],['crumbs',820,410,40,12]]),
    workroomDirt({id:'glass',label:'Glass fingerprints',color:'#7c9ea3',weight:.30,tool:'sponge',action:'Wipe the hazy fingerprints from the glass to reveal the pastries.'},cafeGlass,
      [['fingerprint',280,216,46,34,-.3],['fingerprint',396,267,49,36,.33],['fingerprint',525,195,45,33,-.45],['fingerprint',651,254,53,33,.26],['fingerprint',597,328,44,31,-.25]]),
    workroomDirt({id:'sugar',label:'Sugar and drink rings',color:'#b89a66',weight:.15,tool:'sponge',action:'Sponge away the sugar rings on the marble.'},cafeMarble,
      [['sugar',100,419,30,9,.1],['water',507,390,33,9],['sugar',788,399,29,11,-.1]]),
    workroomDirt({id:'frame',label:'Display frame grime',color:'#8b714f',weight:.16,tool:'brush',action:'Follow the darker buildup along the cabinet frame.'},cafeFrame,
      [['grout',192,294,7,39],['grout',299,369,43,7],['grout',569,369,53,8],['grout',771,297,7,42],['grout',637,84,38,7]])
  ]
};

const palaceMirror = cleaningZone(ovalOutline(477,211,176,159),'glass');
const palaceGold = cleaningZone(ovalOutline(477,210,209,193)+ovalOutline(477,211,177,162),'chrome');
const crystalGroups = cleaningZone('M116 350L139 368L140 306L175 259L217 306L221 363L239 342L237 402Q179 419 124 402Z M239 365L243 331L270 294L293 331L295 372L309 352L306 403H239Z M650 348L664 366V333L691 294L718 332V372L731 345L735 397Q692 419 659 402Z M724 359L740 373V305L784 257L819 304L824 367L844 341L837 401Q778 418 736 401Z','glass');
const palaceMarble = cleaningZone('M102 376H859L914 472H46Z M116 376H309V409H116Z M649 376H844V409H649Z','stone');
const palaceCarving = cleaningZone('M65 495H900V546H65Z','chrome');

const palaceLevel = {
  artwork:()=>`
    <defs>
      <linearGradient id="finale-light" x2="0" y2="1"><stop stop-color="#fff1bd" stop-opacity=".26"/><stop offset="1" stop-color="#fff8dd" stop-opacity="0"/></linearGradient>
    </defs>
    <g class="polish-glints">
      <path class="finale-glow" d="${crystalGroups.outline}" fill="url(#finale-light)"/>
      <g class="finale-facet" style="--shimmer-delay:.2s">${polishGlints([[184,307,11],[267,345,5]]).replace('class="polish-glints"','')}</g>
      <g class="finale-facet" style="--shimmer-delay:.65s">${polishGlints([[508,144,9],[430,376,7]]).replace('class="polish-glints"','')}</g>
      <g class="finale-facet" style="--shimmer-delay:1.1s">${polishGlints([[693,338,7],[789,299,12]]).replace('class="polish-glints"','')}</g>
    </g>`,
  dirtVersion:3,idleHints:true,seed:105291,saveKey:'familyArcadeCrystalPalaceProgress1',
  description:'Clear the crystals, polish the marble and bring the golden chamber back to life.',
  finishTitle:'All ten rooms shine!',
  finishMessage:'You’ve finished Cleaning Club. Take a quiet moment to enjoy the crystal chamber.',
  notes:{spray:'Softens mineral deposits',sponge:'Polishes crystal and marble',brush:'Lifts tarnish and carving dust'},
  audioMaterial:zoneMaterial([crystalGroups,palaceGold,palaceMirror,palaceCarving,palaceMarble],'dust'),
  layers:[
    workroomDirt({id:'crystal',label:'Cloudy crystal deposits',color:'#a0a6be',weight:.29,tool:'sponge',prepare:'spray',action:'Soften pale mineral deposits with foam, then wipe each crystal cluster.'},crystalGroups,
      [['mineral',172,336,31,45,-.1],['mineral',269,353,23,34,.24],['mineral',694,353,24,35,-.1],['mineral',785,334,32,47,.18]]),
    workroomDirt({id:'tarnish',label:'Tarnished gold',color:'#a18158',weight:.18,tool:'brush',action:'Brush the darker patches along the mirror’s gold trim.'},palaceGold,
      [['tarnish',331,96,32,12,-.80],['tarnish',485,42,37,12],['tarnish',615,88,35,12,.72],['tarnish',670,218,34,12,1.57],['tarnish',326,322,34,11,.76]]),
    workroomDirt({id:'carving',label:'Dust in carvings',color:'#9b856d',weight:.16,tool:'brush',action:'Brush the fine dust from the carved vanity front.'},palaceCarving,
      [['soil',168,531,43,11],['soil',366,526,46,11],['soil',569,529,45,10],['soil',786,527,42,11]]),
    workroomDirt({id:'marble',label:'Marble water marks',color:'#a794a8',weight:.16,tool:'sponge',action:'Follow the water marks across the marble with the sponge.'},palaceMarble,
      [['water',245,442,48,15,-.14],['water',427,423,50,15,.17],['water',597,452,49,14,-.2],['water',773,428,47,15,.16]]),
    workroomDirt({id:'mirror',label:'Mirror fingerprints',color:'#849ba5',weight:.21,tool:'sponge',action:'Wipe the cool-toned fingerprints from the mirror.'},palaceMirror,
      [['fingerprint',388,166,37,31,-.18],['fingerprint',474,223,44,38,.2],['fingerprint',563,156,33,30,-.36],['fingerprint',545,275,42,26,-.46]])
  ]
};
