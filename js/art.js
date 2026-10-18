/* Biology art: SVG icons for escape screen and intro. */
(function () {
  const svg = (inner) =>
    `<svg class="animal-svg" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;

  ER.art = {
    /* Rod-shaped bacterium with flagella */
    bacterium: svg(`
      <ellipse cx="50" cy="25" rx="22" ry="10" fill="#ef9a9a"/>
      <ellipse cx="50" cy="25" rx="22" ry="10" fill="none" stroke="#c62828" stroke-width="1.5"/>
      <ellipse cx="50" cy="25" rx="12" ry="6" fill="rgba(255,255,255,0.3)"/>
      <path d="M28,25 Q18,10 8,14" stroke="#c62828" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M28,26 Q16,30 6,28" stroke="#c62828" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M72,25 Q82,15 92,18" stroke="#c62828" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <circle cx="40" cy="22" r="2.5" fill="#c62828"/>
      <circle cx="55" cy="26" r="2.5" fill="#c62828"/>
      <circle cx="47" cy="30" r="1.8" fill="#c62828"/>`),

    /* Simple stylised flower */
    flower: svg(`
      <circle cx="50" cy="25" r="8" fill="#fdd835"/>
      <ellipse cx="50" cy="10" rx="6" ry="9" fill="#f06292"/>
      <ellipse cx="50" cy="40" rx="6" ry="9" fill="#f06292"/>
      <ellipse cx="35" cy="25" rx="9" ry="6" fill="#f48fb1"/>
      <ellipse cx="65" cy="25" rx="9" ry="6" fill="#f48fb1"/>
      <ellipse cx="39" cy="14" rx="6" ry="9" fill="#f06292" transform="rotate(-45 39 14)"/>
      <ellipse cx="61" cy="14" rx="6" ry="9" fill="#f48fb1" transform="rotate(45 61 14)"/>
      <ellipse cx="39" cy="36" rx="6" ry="9" fill="#f48fb1" transform="rotate(45 39 36)"/>
      <ellipse cx="61" cy="36" rx="6" ry="9" fill="#f06292" transform="rotate(-45 61 36)"/>
      <circle cx="50" cy="25" r="8" fill="#fdd835" stroke="#f9a825" stroke-width="1.5"/>
      <circle cx="47" cy="23" r="1.5" fill="#f9a825"/>
      <circle cx="53" cy="23" r="1.5" fill="#f9a825"/>
      <circle cx="50" cy="28" r="1.5" fill="#f9a825"/>`),

    /* Mushroom with spore cloud */
    mushroom: svg(`
      <path d="M35,38 Q30,24 38,18 Q50,8 62,18 Q70,24 65,38 Z" fill="#8d6e63"/>
      <path d="M35,38 Q32,28 42,24 Q50,20 58,24 Q68,28 65,38 Z" fill="#bcaaa4"/>
      <rect x="44" y="36" width="12" height="14" rx="4" fill="#f5f5f5" stroke="#bdbdbd" stroke-width="1.2"/>
      <circle cx="85" cy="12" r="4" fill="rgba(141,110,99,0.4)" stroke="#8d6e63" stroke-width="1"/>
      <circle cx="92" cy="22" r="3" fill="rgba(141,110,99,0.35)" stroke="#8d6e63" stroke-width="1"/>
      <circle cx="80" cy="20" r="2.5" fill="rgba(141,110,99,0.3)" stroke="#8d6e63" stroke-width="1"/>
      <path d="M44,34 Q45,28 50,27 Q55,28 56,34" stroke="#a1887f" stroke-width="1" fill="none"/>`),

    /* DNA double helix */
    dna: svg(`
      <path d="M20,5 Q35,15 20,25 Q35,35 20,45" stroke="#1565c0" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M80,5 Q65,15 80,25 Q65,35 80,45" stroke="#2e7d32" stroke-width="3" fill="none" stroke-linecap="round"/>
      <line x1="27" y1="10" x2="73" y2="10" stroke="#7986cb" stroke-width="2"/>
      <line x1="24" y1="17" x2="76" y2="17" stroke="#80cbc4" stroke-width="2"/>
      <line x1="20" y1="25" x2="80" y2="25" stroke="#7986cb" stroke-width="2"/>
      <line x1="24" y1="33" x2="76" y2="33" stroke="#80cbc4" stroke-width="2"/>
      <line x1="27" y1="40" x2="73" y2="40" stroke="#7986cb" stroke-width="2"/>
      <circle cx="27" cy="10" r="3" fill="#1565c0"/> <circle cx="73" cy="10" r="3" fill="#2e7d32"/>
      <circle cx="24" cy="17" r="3" fill="#1565c0"/> <circle cx="76" cy="17" r="3" fill="#2e7d32"/>
      <circle cx="20" cy="25" r="3" fill="#1565c0"/> <circle cx="80" cy="25" r="3" fill="#2e7d32"/>
      <circle cx="24" cy="33" r="3" fill="#1565c0"/> <circle cx="76" cy="33" r="3" fill="#2e7d32"/>
      <circle cx="27" cy="40" r="3" fill="#1565c0"/> <circle cx="73" cy="40" r="3" fill="#2e7d32"/>`),

    /* Pollen grain */
    pollen: svg(`
      <circle cx="50" cy="25" r="16" fill="#fdd835" stroke="#f9a825" stroke-width="2"/>
      <circle cx="50" cy="25" r="10" fill="#fff9c4"/>
      <circle cx="34" cy="25" r="4" fill="#fdd835" stroke="#f9a825" stroke-width="1.5"/>
      <circle cx="66" cy="25" r="4" fill="#fdd835" stroke="#f9a825" stroke-width="1.5"/>
      <circle cx="50" cy="9" r="4" fill="#fdd835" stroke="#f9a825" stroke-width="1.5"/>
      <circle cx="50" cy="41" r="4" fill="#fdd835" stroke="#f9a825" stroke-width="1.5"/>
      <circle cx="38" cy="13" r="3" fill="#fdd835" stroke="#f9a825" stroke-width="1.5"/>
      <circle cx="62" cy="13" r="3" fill="#fdd835" stroke="#f9a825" stroke-width="1.5"/>
      <circle cx="38" cy="37" r="3" fill="#fdd835" stroke="#f9a825" stroke-width="1.5"/>
      <circle cx="62" cy="37" r="3" fill="#fdd835" stroke="#f9a825" stroke-width="1.5"/>`),

    /* Spore / simple cell */
    spore: svg(`
      <circle cx="50" cy="25" r="18" fill="#ce93d8" stroke="#7b1fa2" stroke-width="2"/>
      <circle cx="50" cy="25" r="10" fill="rgba(255,255,255,0.4)"/>
      <circle cx="50" cy="25" r="5" fill="#7b1fa2" opacity="0.6"/>
      <circle cx="42" cy="18" r="2" fill="rgba(255,255,255,0.6)"/>`)
  };
})();
