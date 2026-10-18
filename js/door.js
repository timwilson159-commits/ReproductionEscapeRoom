/* Final vault: Vigenère cipher — KEY='GENE', CODE='YIRH', ANSWER='SEED'. */
(function () {
  const { el, sfx } = ER;
  const KEY    = 'GENE';
  const CODE   = 'YIRH';
  const ANSWER = 'SEED';
  const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  ER.door = {
    id: 'door',
    title: 'Vault Door',
    icon: '🔐',
    kind: 'door',
    tagline: 'Decode the Vigenère cipher to unlock the exit',
    printable: true,
    hints: [
      'Step 1 — arrange your codes in NUMBER order (1, 2, 3, 4). The letter with number 1 goes in box 1, number 2 in box 2, and so on.',
      'Step 2, box 2 — the key letter is E and your code letter is I. Find row E on the left. Slide along row E until you reach I. Look straight up to the yellow top row. You land on E, so box 2 of the password is E. Repeat for boxes 3 and 4.',
    ],
    build(body, api) {
      if (!api.allDone) return buildLocked(body, api);
      return buildCypher(body, api);
    },
  };

  function buildLocked(body, api) {
    const have = api.codes().length;
    const missing = api.missing();
    body.append(
      el('div', { class: 'card door-locked' },
        el('div', { class: 'big-lock' }, '🔒'),
        el('h3', {}, `The vault needs all 4 codes. You have ${have}.`),
        el('div', { class: 'lock-lights' },
          ...Array.from({ length: 4 }, (_, i) => el('span', { class: i < have ? 'on' : '' }))),
        el('p', {}, 'Stations still to solve:'),
        el('ul', { class: 'missing-list' }, missing.map((d) => el('li', {}, el('span', {}, d.icon), ' ', d.title))),
        el('p', { class: 'muted' }, 'Solve each station and collect all 4 codes. Then come back here.')));
    return null;
  }

  function buildCypher(body, api) {
    const codes = api.codes();

    // Intro card
    body.append(el('div', { class: 'card door-intro' },
      el('div', { class: 'door-intro-icon' }, '🔐'),
      el('div', {},
        el('h3', {}, 'The vault is locked with a Vigenère cipher'),
        el('p', {}, 'A Vigenère cipher uses a ', el('b', {}, 'key word'),
          ' to scramble a password. Find the key word in your ', el('b', {}, 'Lab Notes'),
          ' on the right, then unscramble your 4 code letters to reveal the password.'))));

    // Codes collected
    body.append(el('div', { class: 'card' },
      el('h4', {}, '📓 Your codes'),
      el('div', { class: 'code-chips' },
        codes.map((d) => el('div', { class: 'code-chip' }, el('span', {}, d.icon), ER.codeTiles(d.code))))));

    // Worked example
    body.append(el('div', { class: 'card' },
      el('h4', {}, '📖 How to decode (worked example for box 1)'),
      el('ol', { class: 'worked-steps' },
        el('li', {}, 'Find the key letter for box 1: ', el('b', {}, 'G'), '. Go down the left column of the table to row G.'),
        el('li', {}, 'The code letter for box 1 is ', el('b', {}, 'Y'), '. Slide along row G until you find Y.'),
        el('li', {}, 'Look straight up to the yellow top row. You land on ', el('b', {}, 'S'), '. So box 1 of the password is ', el('b', {}, 'S'), '! 🎉'))));

    // Vigenère table
    const table = buildTable();
    body.append(el('div', { class: 'card printable' },
      el('h4', {}, '🔢 Vigenère table'),
      el('div', { class: 'vig-scroll' }, table)));

    // Cipher board
    const codeFb  = el('p', { class: 'feedback' });
    const ansFb   = el('p', { class: 'feedback' });
    const board   = el('div', { class: 'door-board printable' });

    const header = el('div', { class: 'board-row head' },
      el('div', { class: 'board-label' }, 'Box'),
      ...Array.from({ length: 4 }, (_, i) => el('div', { class: 'board-cell num' }, String(i + 1))));

    const codeBoxes = ER.letterBoxes(4, { label: 'Code letter', onChange: checkCode });
    const ansBoxes  = ER.letterBoxes(4, { label: 'Password letter', prefill: ANSWER[0], onChange: checkAnswer });

    const codeRow = el('div', { class: 'board-row' },
      el('div', { class: 'board-label' }, el('span', { class: 'step' }, '1'), 'Code letter (in number order)'),
      ...codeBoxes.inputs.map((inp) => el('div', { class: 'board-cell' }, inp)));

    const keyRow = el('div', { class: 'board-row key' },
      el('div', { class: 'board-label' }, el('span', { class: 'step' }, '2'), 'Key letter'),
      ...KEY.split('').map((c) => el('div', { class: 'board-cell' }, el('span', { class: 'key-letter' }, c))));

    const ansRow = el('div', { class: 'board-row answer waiting' },
      el('div', { class: 'board-label' }, el('span', { class: 'step' }, '3'), 'Password letter'),
      ...ansBoxes.inputs.map((inp) => el('div', { class: 'board-cell' }, inp)));

    ansBoxes.inputs.forEach((inp) => { if (!inp.readOnly) inp.disabled = true; });

    board.append(el('div', { class: 'board-scroll' }, header, codeRow, keyRow, ansRow));
    body.append(el('div', { class: 'card' }, el('h4', {}, '🧮 Cipher board'), board, codeFb, ansFb));

    function checkCode() {
      if (!codeBoxes.full()) {
        codeFb.textContent = '';
        codeBoxes.inputs.forEach((i) => i.classList.remove('ok', 'no'));
        return;
      }
      const v = codeBoxes.value().replace(/\s/g, '');
      let right = 0;
      codeBoxes.inputs.forEach((inp, i) => {
        const ok = inp.value === CODE[i];
        inp.classList.toggle('ok', ok);
        inp.classList.toggle('no', !ok);
        if (ok) right++;
      });
      if (right === 4) {
        sfx.good();
        ER.say(codeFb, '✅ All 4 code letters are in the right boxes!', 'good');
        ansBoxes.inputs.forEach((inp) => { if (!inp.readOnly) inp.disabled = false; });
        ansRow.classList.remove('waiting');
        board.classList.add('unlocked');
        ansBoxes.focus();
      } else {
        sfx.bad();
        ER.say(codeFb, `${right} of 4 correct. Check your Lab Notes — put the letter with number 1 in box 1, number 2 in box 2, and so on.`, 'bad');
      }
    }

    function checkAnswer() {
      if (!ansBoxes.full()) { ansFb.textContent = ''; return; }
      const v = ER.norm(ansBoxes.value());
      if (v === ANSWER) {
        ansBoxes.mark('good');
        ansBoxes.lock();
        sfx.good();
        ER.say(ansFb, '🎉 Correct! The password is SEED. Excellent work!', 'good');
        setTimeout(() => api.escape(), 900);
      } else {
        sfx.bad();
        ansBoxes.mark('bad');
        ER.say(ansFb, 'Not quite. Use the Vigenère table: for each box, find the KEY row, slide to the CODE letter, and look up to get the password letter.', 'bad');
      }
    }

    return null;
  }

  function buildTable() {
    const wrap = el('div', { class: 'vig-table-wrap' });
    const rows = [];
    // Header row
    const hdr = el('tr', {},
      el('th', { class: 'vig-corner' }, 'Key →'),
      ...AZ.split('').map((c) => el('th', { class: 'vig-col-head' }, c)));
    rows.push(hdr);
    // Body: each row = shift of AZ by row index
    AZ.split('').forEach((keyChar, r) => {
      const tds = AZ.split('').map((_, c) => {
        const letter = AZ[(r + c) % 26];
        return el('td', { class: 'vig-cell' + (letter === 'S' || letter === 'E' || letter === 'D' ? ' vig-hi' : '') }, letter);
      });
      rows.push(el('tr', {},
        el('th', { class: 'vig-row-head' }, keyChar),
        ...tds));
    });
    const tbl = el('table', { class: 'vig-table' }, ...rows);
    wrap.append(tbl);
    return wrap;
  }
})();
