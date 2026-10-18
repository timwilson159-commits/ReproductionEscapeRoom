/* Puzzle 2: Fertilisation Lab — internal vs external sort + mitosis/meiosis MCQ. Code: I-2 */
ER.register({
  id: 'fertilise',
  title: 'Fertilisation Lab',
  icon: '🐟',
  kind: 'digital',
  tagline: 'Sort organisms then answer questions on cell division',
  code: { letter: 'I', number: 2 },
  hints: [
    'Internal fertilisation happens INSIDE the female body — the environment is protected. External fertilisation happens OUTSIDE, usually in water. Ask yourself: does this organism need water to reproduce?',
    'Mitosis = 2 identical cells (body growth, repair, asexual reproduction). Meiosis = 4 haploid cells with variation (gamete production). Remember: mEIosis = Eggs and sperm (haploid gametes).',
  ],
  fact: 'Frogs use external fertilisation — females lay eggs in water and males release sperm over them. But bull sharks use internal fertilisation, giving birth to live pups. Seahorses fertilise internally, but unusually the male carries the offspring in a pouch! The evolution of internal fertilisation was a key adaptation for life on land, freeing animals from needing water to reproduce.',
  build(body, api) {
    const { el, sfx, sortTask, quizSeq } = ER;
    let stage = 1;

    body.append(el('div', { class: 'card intro-card' },
      el('p', {}, '🧪 This station has two parts. Complete both to earn your code.'),
      el('ol', {},
        el('li', {}, el('b', {}, 'Sort'), ' organisms into internal or external fertilisation.'),
        el('li', {}, el('b', {}, 'Answer'), ' 4 questions comparing mitosis and meiosis.'))));

    const stageWrap = el('div', { class: 'stage-wrap' });
    body.append(stageWrap);

    function buildStage1() {
      const bins = [
        { id: 'int', title: 'Internal fertilisation', desc: 'Fertilisation occurs inside the female body' },
        { id: 'ext', title: 'External fertilisation', desc: 'Fertilisation occurs outside the body, usually in water' },
      ];
      const cards = [
        { id: 'dog',    cat: 'int', content: '🐶 Dog' },
        { id: 'salmon', cat: 'ext', content: '🐟 Salmon' },
        { id: 'frog',   cat: 'ext', content: '🐸 Frog' },
        { id: 'shark',  cat: 'int', content: '🦈 Bull shark' },
        { id: 'turtle', cat: 'int', content: '🐢 Sea turtle' },
        { id: 'oyster', cat: 'ext', content: '🦪 Oyster' },
        { id: 'cod',    cat: 'ext', content: '🐠 Cod (fish)' },
        { id: 'eagle',  cat: 'int', content: '🦅 Eagle' },
      ];

      const taskNode = ER.sortTask({
        bins, cards,
        trayTitle: 'Organisms (drag to sort)',
        checkText: '✔ Check my sorting',
        onSolved: () => {
          sfx.good();
          stageWrap.innerHTML = '';
          buildStage2();
        },
      });
      stageWrap.append(el('div', { class: 'card' },
        el('h4', {}, `Stage 1 of 2 — Fertilisation types`),
        el('p', {}, 'Sort each organism into the correct fertilisation category.'),
        taskNode));
    }

    function buildStage2() {
      const questions = [
        {
          q: 'Which type of cell division produces TWO genetically identical daughter cells?',
          opts: ['Mitosis', 'Meiosis', 'Binary fission', 'Budding'],
          a: 'Mitosis',
          why: 'Mitosis produces 2 identical diploid cells. Meiosis produces 4 haploid cells with genetic variation.',
        },
        {
          q: 'Gametes (sperm and eggs) are produced by which process?',
          opts: ['Meiosis', 'Mitosis', 'Fertilisation', 'Germination'],
          a: 'Meiosis',
          why: 'Meiosis halves the chromosome number to produce haploid gametes. Mitosis is used for body growth.',
        },
        {
          q: 'A diploid human skin cell (2n = 46) undergoes mitosis. How many chromosomes does each daughter cell contain?',
          opts: ['46', '23', '92', '12'],
          a: '46',
          why: 'Mitosis maintains the chromosome number. Both daughter cells have 46 (diploid), the same as the parent cell.',
        },
        {
          q: 'After fertilisation, what is the first cell of the new organism called?',
          opts: ['Zygote', 'Gamete', 'Embryo', 'Spore'],
          a: 'Zygote',
          why: 'The zygote is the diploid cell formed when a sperm (n) fuses with an egg (n). It then divides by mitosis to form the embryo.',
        },
      ];
      stageWrap.append(el('div', { class: 'card' },
        el('h4', {}, 'Stage 2 of 2 — Mitosis vs Meiosis'),
        el('p', {}, 'Answer all 4 questions correctly to earn your code. Each question must be answered — wrong answers let you try again.'),
        ER.quizSeq(questions, () => api.solve())));
    }

    buildStage1();
    return null;
  },
});
