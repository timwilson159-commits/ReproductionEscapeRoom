/* Puzzle 1: Term Bank — vocabulary matching for key biology terms. Code: Y-1 */
ER.register({
  id: 'vocab',
  title: 'Term Bank',
  icon: '🔬',
  kind: 'digital',
  tagline: 'Match each term to its correct definition',
  code: { letter: 'Y', number: 1 },
  hints: [
    'Start with the terms you are most confident about — lock those in first. Note that haploid and diploid both refer to chromosome sets: "ha" sounds like "half".',
    'Mitosis makes 2 identical daughter cells (for growth/repair). Meiosis makes 4 haploid cells with variation (for reproduction). "Meiosis" and "mix" both start with M — meiosis mixes up the genes.',
  ],
  fact: 'Meiosis is sometimes called "reduction division" because it halves the chromosome number. Humans have 46 chromosomes (diploid, 2n = 46) in body cells, but our gametes have only 23 (haploid, n = 23). When two gametes fuse in fertilisation, the zygote restores the full 46. Without meiosis, each generation would double the chromosome number — reproduction would be impossible!',
  build(body, api) {
    const { el } = ER;

    body.append(el('div', { class: 'card intro-card' },
      el('p', {}, '🔍 Drag each definition card to match the correct term. When you think you have them all right, press ', el('b', {}, 'Check my matches'), '.'),
      el('p', { class: 'muted small' }, '💡 Key vocab: <span class="term">fertilisation</span>, <span class="term">mitosis</span>, <span class="term">meiosis</span>, <span class="term">haploid</span>, <span class="term">diploid</span>, <span class="term">gamete</span>, <span class="term">spore</span>, <span class="term">seed</span>, <span class="term">offspring</span>, <span class="term">desiccation</span>')));

    const slots = [
      { label: 'fertilisation', accept: 'fert' },
      { label: 'zygote',        accept: 'zyg'  },
      { label: 'gamete',        accept: 'gam'  },
      { label: 'haploid',       accept: 'hap'  },
      { label: 'diploid',       accept: 'dip'  },
      { label: 'mitosis',       accept: 'mit'  },
      { label: 'meiosis',       accept: 'mei'  },
      { label: 'spore',         accept: 'spo'  },
      { label: 'offspring',     accept: 'off'  },
      { label: 'desiccation',   accept: 'des'  },
    ];
    const cards = [
      { id: 'fert', content: 'The fusion of two gametes to form a zygote' },
      { id: 'zyg',  content: 'A diploid cell formed by the fusion of two gametes during fertilisation' },
      { id: 'gam',  content: 'A haploid reproductive cell — e.g. sperm, egg, or pollen' },
      { id: 'hap',  content: 'A cell containing one set of chromosomes (n) — half the usual number' },
      { id: 'dip',  content: 'A cell containing two complete sets of chromosomes (2n) — the normal body-cell number' },
      { id: 'mit',  content: 'Cell division producing two genetically identical daughter cells; used for growth and repair' },
      { id: 'mei',  content: 'Cell division that halves the chromosome number, producing four haploid cells with genetic variation; used to make gametes' },
      { id: 'spo',  content: 'A haploid reproductive cell (in fungi, mosses or ferns) that can grow into a new organism without fertilisation' },
      { id: 'off',  content: 'The new individual(s) produced by reproduction from one or more parents' },
      { id: 'des',  content: 'The process of drying out — seed coats (testa) protect embryos against this during dormancy' },
    ];

    body.append(el('div', { class: 'card' },
      el('h4', {}, '✏️ Match terms to definitions'),
      ER.matchTask({ slots, cards, layout: 'list', checkText: '✔ Check my matches', onSolved: () => api.solve() })));

    return null;
  },
});
