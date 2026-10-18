/* Puzzle 4: Balance Station — sort advantages of sexual/asexual + biodiversity MCQ. Code: H-4 */
ER.register({
  id: 'advantages',
  title: 'Balance Station',
  icon: '⚖️',
  kind: 'digital',
  tagline: 'Sort statements then answer a question on biodiversity',
  code: { letter: 'H', number: 4 },
  hints: [
    'Sexual reproduction produces variation (think: mixing genes from two parents via meiosis). Asexual reproduction is faster and every offspring can reproduce (no males needed). Ask: does this statement describe speed/efficiency, or does it describe variation?',
    'Biodiversity means the variety of living things. Which type of reproduction increases genetic variety — and therefore the raw material for natural selection? That type drives long-term biodiversity.',
  ],
  fact: 'Sexual reproduction is the main engine of biodiversity. Crossing over during meiosis shuffles alleles between homologous chromosomes, and random fertilisation combines gametes from two genetically different parents. Each sexually-reproduced individual is genetically unique — this variation is the raw material for natural selection and evolution. Asexual reproduction is faster but produces clones: if the environment changes, the whole population may be vulnerable.',
  build(body, api) {
    const { el, sfx } = ER;

    body.append(el('div', { class: 'card intro-card' },
      el('p', {}, '⚖️ This station has two parts. Complete both to earn your code.'),
      el('ol', {},
        el('li', {}, el('b', {}, 'Sort'), ' statements into advantages of sexual or asexual reproduction.'),
        el('li', {}, el('b', {}, 'Answer'), ' one question about biodiversity.'))));

    const stageWrap = el('div', { class: 'stage-wrap' });
    body.append(stageWrap);

    function buildStage1() {
      const bins = [
        { id: 'sex',  title: 'Sexual reproduction',  desc: 'Requires two parents; produces genetic variation' },
        { id: 'asex', title: 'Asexual reproduction', desc: 'Requires only one parent; produces identical offspring' },
      ];
      const cards = [
        { id: 'c1',  cat: 'sex',  content: 'Produces genetic variation in offspring' },
        { id: 'c2',  cat: 'asex', content: 'Only one parent needed — faster to reproduce' },
        { id: 'c3',  cat: 'sex',  content: 'Increases the chance that some offspring survive environmental change' },
        { id: 'c4',  cat: 'asex', content: 'Every individual can produce offspring — no need for a mate' },
        { id: 'c5',  cat: 'sex',  content: 'Crossing over during meiosis shuffles alleles between chromosomes' },
        { id: 'c6',  cat: 'asex', content: 'Large numbers of offspring can be produced rapidly in ideal conditions' },
        { id: 'c7',  cat: 'sex',  content: 'Two sets of genes means harmful recessive alleles may be masked by a dominant allele' },
        { id: 'c8',  cat: 'asex', content: 'Energy is not spent finding a mate or producing excess gametes' },
        { id: 'c9',  cat: 'sex',  content: 'Haploid gametes fuse — offspring inherit genetic material from two parents' },
        { id: 'c10', cat: 'asex', content: 'Offspring are genetically identical clones of the parent (in ideal environments, this is efficient)' },
      ];

      const taskNode = ER.sortTask({
        bins, cards,
        trayTitle: 'Statements (drag to sort)',
        checkText: '✔ Check my sorting',
        onSolved: () => {
          sfx.good();
          stageWrap.innerHTML = '';
          buildStage2();
        },
      });
      stageWrap.append(el('div', { class: 'card' },
        el('h4', {}, 'Stage 1 of 2 — Advantages of each reproduction type'),
        taskNode));
    }

    function buildStage2() {
      const questions = [
        {
          q: 'Which statement BEST explains why sexual reproduction increases biodiversity compared with asexual reproduction?',
          opts: [
            'Sexual reproduction produces more offspring',
            'Sexual reproduction creates genetic variation through meiosis and fertilisation, providing raw material for natural selection',
            'Sexual reproduction requires two parents, which doubles the gene pool',
            'Sexual reproduction always produces healthier offspring than asexual reproduction',
          ],
          a: 'Sexual reproduction creates genetic variation through meiosis and fertilisation, providing raw material for natural selection',
          why: 'More offspring or two parents alone do not increase biodiversity. It is the GENETIC VARIATION produced by meiosis (crossing over) and random fertilisation that is the raw material for natural selection, driving long-term biodiversity.',
        },
      ];
      stageWrap.append(el('div', { class: 'card' },
        el('h4', {}, 'Stage 2 of 2 — Biodiversity'),
        el('p', {}, 'One question stands between you and your code. Think carefully!'),
        ER.quizSeq(questions, () => api.solve())));
    }

    buildStage1();
    return null;
  },
});
