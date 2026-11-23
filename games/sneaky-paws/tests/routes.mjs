// Board-coordinate waypoints. Each vertex is reached over several pointer
// events, including when a route follows a reel around its solid hub.
function orbit(x, y, from, turn) {
  return Array.from({ length: 22 }, (_, i) => {
    const angle = from + (turn * i) / 21;
    return [x + 44 * Math.cos(angle), y + 44 * Math.sin(angle)];
  });
}

const routes = [
  {
    start: 400,
    path: [
      [244, 465],
      [510, 477],
      [640, 477],
      [682, 401],
    ],
  },
  {
    start: 400,
    path: [
      [220, 121],
      [318, 121],
      [318, 342],
      [488, 342],
      [490, 209],
      [668, 209],
      [697, 106],
    ],
  },
  {
    start: 400,
    path: [
      [195, 382],
      [194, 79],
      [445, 91],
      [524, 91],
      [695, 132],
    ],
  },
  {
    start: 3500,
    path: [
      [218, 223],
      [425, 221],
      [421, 330],
      [510, 350],
      [704, 391],
    ],
  },
  {
    start: 400,
    path: [
      [214, 350],
      [214, 183],
      [412, 143],
      [469, 226],
      [477, 348],
      [697, 408],
    ],
  },
  {
    start: 400,
    path: [[201, 258], ...orbit(351, 258, Math.PI, 3.55), [421, 191], [423, 112], [692, 125]],
  },
  {
    start: 400,
    path: [
      [222, 390],
      [223, 79],
      [430, 96],
      [652, 91],
      [686, 111],
    ],
  },
  {
    start: 400,
    path: [
      [217, 409],
      [218, 106],
      [456, 105],
      [525, 141],
      [524, 316],
      [482, 325],
      [477, 399],
      [699, 405],
    ],
  },
  {
    start: 400,
    path: [
      [316, 391],
      ...orbit(318, 250, Math.PI / 2, 3.6),
      [407, 201],
      ...orbit(526, 256, -2.7, 3.6),
      [567, 89],
      [628, 89],
      [583, 182],
      [579, 464],
      [693, 467],
      [706, 423],
    ],
  },
  {
    start: 400,
    path: [
      [354, 389],
      ...orbit(355, 248, Math.PI / 2, 3.6),
      [488, 102],
      [453, 363],
      [506, 323],
      [698, 318],
    ],
  },
];

export { routes };
