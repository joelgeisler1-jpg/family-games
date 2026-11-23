function guardBody({ asleep, walking }) {
  const jacket = asleep ? '#7c72ad' : walking ? '#39899d' : '#536eac';
  const skin = walking ? '#d7a07e' : '#f4c7a4';
  const boot = (side, x) => `<g class="guard-boot ${side}" transform="translate(${x} 19)">
    <path d="M-6 0H6l1 9 7 5v5H-8v-6Z" fill="#303654" stroke="#252a43" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M-5 15H9" stroke="#7d87a8" stroke-width="2.4" stroke-linecap="round"/>
  </g>`;
  return `<ellipse cy="36" rx="35" ry="8" fill="#3e345d" opacity=".18"/>
  <g class="guard-body">
    ${boot('left', -14)}${boot('right', 10)}
    <path d="M-20-6Q0-15 21-6Q29 6 25 25Q0 33-25 25Q-28 8-20-6Z" fill="${jacket}" stroke="#29354f" stroke-width="3.6"/>
    <path d="M-20 2q-6 6-9 15m49-15 9 12" fill="none" stroke="#313c5c" stroke-width="8" stroke-linecap="round"/>
    <circle cx="-30" cy="19" r="4.2" fill="${skin}"/><circle cx="30" cy="17" r="4.2" fill="${skin}"/>
    <path d="m-11 3 11 9 11-9" fill="#b5ced7" stroke="#364566" stroke-width="2" stroke-linejoin="round"/>
    <path d="M-23 23q23 5 46 0" stroke="#303852" stroke-width="5" fill="none"/>
    <rect x="-5" y="22" width="10" height="6" rx="2" fill="#f4c769"/>
    <path d="M14 8h8v6l-4 3-4-3Z" fill="#ffd982"/>
    <g class="guard-head">
      <rect x="-22" y="-21" width="44" height="30" rx="13" fill="${skin}" stroke="#383750" stroke-width="2.5"/>
      <path d="M-25-21q-1-16 25-18 25 1 26 18l5 4q-28 6-61 0Z" fill="#354361" stroke="#29304b" stroke-width="3"/>
      <path d="M-19-26q19-8 38-1" stroke="#8292b9" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M-6-35H6v7l-6 4-6-4Z" fill="#ffd37b" stroke="#7b5f49" stroke-width="1.5"/>
      <path d="M-18 1h3m29 0h3" stroke="#dc918f" stroke-width="3" stroke-linecap="round"/>
      ${
        asleep
          ? '<path d="M-13-4q5 4 10 0m6 0q5 4 10 0m-16 9q3 2 6 0" stroke="#4b364d" fill="none" stroke-width="2.5" stroke-linecap="round"/>'
          : `<g class="guard-eyes"><ellipse cx="-8" cy="-5" rx="2.8" ry="3.5"/><ellipse cx="8" cy="-5" rx="2.8" ry="3.5"/></g>
          <path class="guard-calm" d="M-4 3q4 4 8 0" fill="none" stroke="#69465a" stroke-width="2.1" stroke-linecap="round"/>
          <path class="guard-question" d="M-13-11l7-2m10 1 7 2m-14 14q3-3 7 0" fill="none" stroke="#69465a" stroke-width="2.1" stroke-linecap="round"/>
          <ellipse class="guard-surprise" cy="3" rx="3.3" ry="3.8" fill="#783b55"/>`
      }
    </g>
  </g>`;
}

export { guardBody };
