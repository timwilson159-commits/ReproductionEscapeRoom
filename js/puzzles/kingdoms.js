/* Puzzle 3: Kingdoms Display — match organisms to their reproduction methods. Code: R-3 */
ER.register({
  id: 'kingdoms',
  title: 'Kingdoms Display',
  icon: '🌱',
  kind: 'paper',
  tagline: 'Match each organism to how it reproduces',
  code: { letter: 'R', number: 3 },
  printable: true,
  hints: [
    'Plants with cones are gymnosperms — their seeds sit on open cone scales (no fruit). Plants with flowers are angiosperms — their seeds develop inside a fruit (the wall of the ovary). Bacteria always use binary fission.',
    'Yeast is a single-celled fungus that grows a small bulge that pinches off — this is budding. Bread mould produces spores in round sacs (sporangia) on its hyphae. Strawberry plants send out runners (stolons) that take root — this is vegetative propagation.',
  ],
  fact: 'Fruits are a plant\'s clever trick for seed dispersal — animals eat the sweet fruit and deposit the seeds far away in their droppings. But not all "fruits" are sweet: a tomato, capsicum, pea pod and even a grain of wheat are all fruits botanically — each is a mature ovary wall enclosing seeds. Gymnosperms like pines have no fruit; their seeds sit exposed on cone scales, typically dispersed by wind.',
  build(body, api) {
    const { el, sfx } = ER;

    body.append(el('div', { class: 'card intro-card printable' },
      el('h3', { class: 'print-only' }, '🌱 Kingdoms Display'),
      el('p', {}, '🔍 Match each organism on the left to its main reproduction method on the right using the drop-down menus. Use the clues below to help.'),
      el('p', { class: 'muted small' }, 'Key terms: ', el('span', { class: 'term' }, 'binary fission'), ', ', el('span', { class: 'term' }, 'budding'), ', ', el('span', { class: 'term' }, 'asexual spores'), ', ', el('span', { class: 'term' }, 'sexual spores'), ', ', el('span', { class: 'term' }, 'vegetative propagation'), ', ', el('span', { class: 'term' }, 'seeds in cones'), ', ', el('span', { class: 'term' }, 'seeds in fruit'))));

    const CLUES = [
      'Bacteria have no nucleus; they copy their single circular chromosome and split in two.',
      'Yeast is a single-celled fungus. A small protrusion grows from the parent cell and pinches off.',
      'Bread mould (Rhizopus) reproduces asexually by producing spores inside round sacs (sporangia) on stalks called sporangiophores.',
      'Mushrooms are the fruiting bodies of fungi. They produce haploid sexual spores on their gills, formed after meiosis.',
      'Pine trees are gymnosperms. After wind pollination, seeds develop on the open scales of female cones.',
      'Apple trees are angiosperms (flowering plants). After pollination, the ovary wall becomes the fruit (e.g. the apple), enclosing the seeds.',
      'Strawberry plants send out horizontal stems called stolons (runners). Where a node touches the ground, roots and shoots grow to form a new plant.',
    ];
    body.append(el('div', { class: 'card printable' },
      el('h4', {}, '📋 Clues'),
      el('ol', { class: 'clue-list' }, CLUES.map((c) => el('li', {}, c)))));

    const ORGANISMS = [
      { id: 'bact',   name: 'Bacteria',           icon: '🦠' },
      { id: 'yeast',  name: 'Yeast',               icon: '🫧' },
      { id: 'mould',  name: 'Bread mould',         icon: '🍞' },
      { id: 'mush',   name: 'Mushroom',             icon: '🍄' },
      { id: 'pine',   name: 'Pine tree',            icon: '🌲' },
      { id: 'apple',  name: 'Apple tree',           icon: '🍎' },
      { id: 'straw',  name: 'Strawberry plant',     icon: '🍓' },
    ];
    const METHODS = [
      'Binary fission — one cell splits into two identical daughter cells',
      'Budding — a small outgrowth forms on the parent and pinches off',
      'Asexual spores produced in sporangia on hyphae',
      'Sexual spores produced on gills of fruiting body after meiosis',
      'Seeds borne on the open scales of female cones (gymnosperm)',
      'Seeds enclosed within a fruit — the ripened wall of the ovary (angiosperm)',
      'Vegetative propagation — new plants form from runners (stolons)',
    ];
    const SOLUTION = {
      bact:  'Binary fission — one cell splits into two identical daughter cells',
      yeast: 'Budding — a small outgrowth forms on the parent and pinches off',
      mould: 'Asexual spores produced in sporangia on hyphae',
      mush:  'Sexual spores produced on gills of fruiting body after meiosis',
      pine:  'Seeds borne on the open scales of female cones (gymnosperm)',
      apple: 'Seeds enclosed within a fruit — the ripened wall of the ovary (angiosperm)',
      straw: 'Vegetative propagation — new plants form from runners (stolons)',
    };

    const selects = {};
    const tbl = el('table', { class: 'answer-table' });
    tbl.append(el('tr', {}, el('th', {}, 'Organism'), el('th', {}, 'Reproduction method')));
    ER.shuffle(ORGANISMS).forEach((o) => {
      const sel = el('select', { 'aria-label': o.name },
        el('option', { value: '' }, 'choose…'),
        ER.shuffle(METHODS).map((m) => el('option', { value: m }, m)));
      sel.addEventListener('change', () => sel.classList.remove('ok', 'no'));
      selects[o.id] = sel;
      tbl.append(el('tr', {},
        el('td', {}, el('span', {}, o.icon + ' '), el('b', {}, o.name)),
        el('td', {}, sel)));
    });

    const fb = el('p', { class: 'feedback', 'aria-live': 'polite' });
    const checkBtn = el('button', { class: 'btn btn-sun btn-big no-print' }, '✔ Check my answers');
    checkBtn.addEventListener('click', () => {
      const blank = Object.values(selects).filter((s) => !s.value).length;
      if (blank) { sfx.bad(); ER.say(fb, `Fill in all ${ORGANISMS.length} answers first (${blank} blank).`, 'bad'); return; }
      let right = 0;
      ORGANISMS.forEach((o) => {
        const ok = selects[o.id].value === SOLUTION[o.id];
        if (ok) right++;
      });
      if (right === ORGANISMS.length) {
        ORGANISMS.forEach((o) => { selects[o.id].classList.add('ok'); selects[o.id].disabled = true; });
        checkBtn.disabled = true;
        sfx.good();
        ER.say(fb, `🎉 All ${ORGANISMS.length} correct! Excellent knowledge of reproduction across kingdoms.`, 'good');
        api.solve();
      } else {
        sfx.bad();
        ER.say(fb, `${right} of ${ORGANISMS.length} correct. Re-read the clues and try again.`, 'bad');
      }
    });

    body.append(el('div', { class: 'card printable' },
      el('h4', {}, '🏁 Your answers'),
      el('div', { class: 'table-scroll' }, tbl),
      el('div', { class: 'row-center' }, checkBtn),
      fb));

    return null;
  },
});
