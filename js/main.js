/* Biology Escape — main.js: room engine, player, HUD, scenes */
(function () {
  const { el, sfx } = ER;
  const W = 320, H = 224, S = 3;

  const canvas = document.getElementById('room');
  const ctx = canvas.getContext('2d');
  const roomView = document.getElementById('room-view');
  const puzzleView = document.getElementById('puzzle-view');
  const promptEl = document.getElementById('prompt');
  const notesList = document.getElementById('notes-list');
  const hudCodes = document.getElementById('hud-codes');
  const hudTime = document.getElementById('hud-time');

  const state = {
    solved: [],
    timerOn: false,
    startTime: 0,
    elapsed: 0,
    escaped: false,
    current: null,
    cleanup: null,
  };

  // ── Modals ─────────────────────────────────────────────────────────────
  ER.modal = function ({ title, content, buttons = [], className = '', dismissable = true }) {
    const root = document.getElementById('modal-root');
    const box = el('div', { class: 'modal ' + className, role: 'dialog', 'aria-modal': 'true' });
    const overlay = el('div', { class: 'overlay' }, box);
    const onKey = (e) => { if (e.key === 'Escape' && dismissable) close(); };
    const close = () => {
      document.removeEventListener('keydown', onKey);
      overlay.classList.add('closing');
      setTimeout(() => overlay.remove(), 180);
    };
    if (title) box.append(el('h2', { class: 'modal-title' }, title));
    if (content) box.append(content.nodeType ? content : el('div', { html: content }));
    const row = el('div', { class: 'modal-buttons' });
    buttons.forEach((b) =>
      row.append(el('button', {
        class: 'btn ' + (b.class || ''),
        onclick: () => { if (b.close !== false) close(); if (b.onClick) b.onClick(); },
      }, b.label)));
    if (buttons.length) box.append(row);
    if (dismissable) overlay.addEventListener('pointerdown', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', onKey);
    root.append(overlay);
    setTimeout(() => { const b = row.querySelector('button'); if (b) b.focus(); }, 60);
    return { close, box };
  };
  const modalOpen = () => !!document.querySelector('#modal-root .overlay:not(.closing)');

  // ── Room geometry ──────────────────────────────────────────────────────
  // Stations: x/y = top-left of the bench block, front = walk-to position
  const STATIONS = {
    vocab:      { x: 40,  y: 32,  front: [64, 78] },
    fertilise:  { x: 240, y: 32,  front: [256, 78] },
    kingdoms:   { x: 40,  y: 154, front: [64, 150] },
    advantages: { x: 240, y: 154, front: [256, 150] },
  };
  const DOOR = { x: 136, y: 2, w: 48, h: 30, front: [160, 46] };
  const POOL = { x: 160, y: 112, r: 28 };
  const SOLIDS = [
    ...Object.values(STATIONS).map((s) => ({ x: s.x, y: s.y, w: 32, h: 32 })),
    { x: 110, y: 154, w: 100, h: 24 }, // bottom centre counter
  ];

  const player = { x: 160, y: 148, dir: 'down', moving: false, anim: 0, target: null, pendingOpen: null, stepT: 0 };

  function blocked(x, y) {
    const l = x - 5, r = x + 5, t = y - 6, b = y;
    if (l < 16 || r > 304 || t < 34 || b > 206) return true;
    for (const s of SOLIDS) {
      if (r > s.x && l < s.x + s.w && b > s.y && t < s.y + s.h) return true;
    }
    if (Math.hypot(x - POOL.x, y - 3 - POOL.y) < POOL.r + 5) return true;
    return false;
  }

  function rectDist(px, py, s, w = 32, h = 32) {
    const cx = Math.max(s.x, Math.min(px, s.x + w));
    const cy = Math.max(s.y, Math.min(py, s.y + h));
    return Math.hypot(px - cx, py - cy);
  }

  function nearest() {
    let best = null, bd = 1e9;
    for (const id in STATIONS) {
      const d = rectDist(player.x, player.y - 3, STATIONS[id]);
      if (d < 14 && d < bd) { bd = d; best = id; }
    }
    const dd = Math.hypot(player.x - DOOR.front[0], player.y - DOOR.front[1]);
    if (dd < 18 && dd < bd) best = 'door';
    return best;
  }

  // ── Sprites ────────────────────────────────────────────────────────────
  // Green lab coat, dark pants, warm skin
  const PAL = { k: '#1b1b2e', h: '#5c3317', o: '#d7a36b', m: '#a5d6a7', w: '#ffffff', s: '#f6c7a1', y: '#ffd23f', Y: '#e6a100', b: '#2e7d32', g: '#9aa7bd' };
  const TOP_DOWN  = ['...kkkkkk...', '..khhhhhhk..', '.khhhhhhhhk.', '.kmmmmmmmmk.', '.kmwmmmmwmk.', '.kssssssssk.', '..kssoossk..', '..kbbbbbk...', '.kbbYbbYbbk.', 'kbbbbbbbbbk.', 'ksbbbYYbbbsk', '.kkbbbbbkkk.'];
  const TOP_UP    = ['...kkkkkk...', '..khhhhhhk..', '.khhhhhhhhk.', '.kohhhhhhhk.', '.khhhhhhhhk.', '.khhhhhhhhk.', '..kkhhhhkk..', '..kbggggbk..', '.kbbgggbbyk.', 'kbbbggggbbk.', 'ksbbbggbbsk.', '.kkbbbbbkk..'];
  const TOP_SIDE  = ['...kkkkkk...', '..khhhhhhk..', '.khhhhhhhhk.', '.khhoommmk..', '.khhksmwmk..', '.khhsssssk..', '..khsssssk..', '..kkbbbbbk..', '..gkbbbbbk..', '..gkbbbsbk..', '..gkbbbsbk..', '...kbbbbbk..'];
  const LEGS_A = ['..kbbkkbbk..', '..kbbkkbbk..', '.kbbbkkbbbk.', '.kkkkkkkkkk.'];
  const LEGS_B = ['..kbbkkbbk..', '..kbbkkbbk..', '.kbbbk.kbbk.', '.kkkkk.kkk..'];
  const SIDE_A = ['...kbbbbk...', '...kbbbbk...', '...kbbbbk...', '...kkkkkkk..'];
  const SIDE_B = ['...kbbbbk...', '..kbbkkbbk..', '.kbbk..kbbk.', '.kkk....kkk.'];
  const mirror = (rows) => rows.map((r) => r.split('').reverse().join(''));

  function makeSprite(rows) {
    const c = document.createElement('canvas');
    c.width = 12; c.height = 16;
    const x = c.getContext('2d');
    rows.forEach((r, j) => { for (let i = 0; i < 12; i++) { const ch = r[i]; if (ch && ch !== '.') { x.fillStyle = PAL[ch]; x.fillRect(i, j, 1, 1); } } });
    return c;
  }
  const SPR = {
    down:  [makeSprite([...TOP_DOWN, ...LEGS_A]), makeSprite([...TOP_DOWN, ...LEGS_B]), makeSprite([...TOP_DOWN, ...LEGS_A]), makeSprite([...TOP_DOWN, ...mirror(LEGS_B)])],
    up:    [makeSprite([...TOP_UP,   ...LEGS_A]), makeSprite([...TOP_UP,   ...LEGS_B]), makeSprite([...TOP_UP,   ...LEGS_A]), makeSprite([...TOP_UP,   ...mirror(LEGS_B)])],
    right: [makeSprite([...TOP_SIDE, ...SIDE_A]), makeSprite([...TOP_SIDE, ...SIDE_B])],
    left:  [makeSprite(mirror([...TOP_SIDE, ...SIDE_A])), makeSprite(mirror([...TOP_SIDE, ...SIDE_B]))],
  };

  // ── Drawing helpers ─────────────────────────────────────────────────────
  const px = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
  const circle = (x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };

  function drawFloor() {
    for (let ty = 2; ty < 13; ty++) {
      for (let tx = 1; tx < 19; tx++) {
        px(tx * 16, ty * 16, 16, 16, (tx + ty) % 2 ? '#ddd0a8' : '#cec09a');
        px(tx * 16, ty * 16, 16, 1, '#b5a87a');
        px(tx * 16, ty * 16, 1, 16, '#b5a87a');
      }
    }
    // Centre runner strip
    for (let i = 0; i < 6; i++) px(148, 34 + i * 4, 24, 2, i % 2 ? '#ffd23f' : '#cec09a');
  }

  function drawWalls(t) {
    // Top wall — deep forest green
    px(0, 0, W, 32, '#1b5e20');
    px(0, 26, W, 6, '#145218');
    for (let x = 0; x < W; x += 32) { px(x, 0, 1, 26, '#2e7d32'); }
    // Side walls
    px(0, 32, 16, 176, '#1e6823');
    px(304, 32, 16, 176, '#1e6823');
    // Bottom wall
    px(0, 208, W, 16, '#145218');
    // Side accent stripes
    px(6, 32, 4, 176, '#ffd23f');
    px(310, 32, 4, 176, '#ffd23f');
    for (let y = 48; y < 208; y += 40) { px(4, y, 8, 3, '#e6a100'); px(308, y, 8, 3, '#e6a100'); }
    for (let x = 0; x < W; x += 16) px(x, 212, 8, 3, '#ffd23f');

    // Lab windows (left + right) with swaying plants
    [[22, 60], [22, 130], [W - 36, 60], [W - 36, 130]].forEach(([wx, wy]) => {
      px(wx, wy, 14, 22, '#a5d6a7');
      px(wx, wy, 14, 3, '#c8e6c9');
      const sway = Math.sin(t * 1.5 + wx) * 1;
      ctx.fillStyle = '#2e7d32';
      ctx.beginPath(); ctx.moveTo(wx + 7, wy + 20); ctx.quadraticCurveTo(wx + 3 + sway, wy + 12, wx + 2 + sway, wy + 7); ctx.lineTo(wx + 7, wy + 12); ctx.quadraticCurveTo(wx + 11 + sway, wy + 8, wx + 12 + sway, wy + 6); ctx.lineTo(wx + 7, wy + 20); ctx.fill();
      px(wx, wy, 1, 22, '#1b5e20'); px(wx + 13, wy, 1, 22, '#1b5e20'); px(wx, wy + 21, 14, 1, '#1b5e20');
    });

    // Door frame and hatch
    px(DOOR.x, DOOR.y, DOOR.w, DOOR.h, '#ffd23f');
    for (let i = 0; i < 12; i += 2) { px(DOOR.x + i * 4, DOOR.y, 4, 3, '#145218'); px(DOOR.x + i * 4 + 4, DOOR.y + DOOR.h - 3, 4, 3, '#145218'); }
    px(DOOR.x + 4, DOOR.y + 4, DOOR.w - 8, DOOR.h - 7, '#4c5877');
    const all = state.solved.length === ER.puzzles.length;
    const pulse = all ? 0.5 + 0.5 * Math.sin(t * 5) : 0;
    circle(160, 18, 11, all ? `rgb(${100 + pulse * 100},${210 + pulse * 40},${100 + pulse * 30})` : '#aab6cc');
    circle(160, 18, 8, '#6a7d8a');
    ctx.save();
    ctx.translate(160, 18);
    ctx.rotate(all ? t * 1.5 : 0);
    ctx.strokeStyle = '#dfe6f2'; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(7, 0); ctx.stroke(); }
    ctx.restore();
    circle(160, 18, 2.5, all ? '#69f0ae' : '#ff5d73');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 5px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT', 160, 31.5);

    // 4 LED lights above door
    const lx = [140, 152, 164, 176];
    lx.forEach((x, i) => {
      const on = i < state.solved.length;
      if (on) circle(x, 12, 4, 'rgba(105,240,174,0.3)');
      circle(x, 12, 2.6, on ? '#69f0ae' : '#ff4d6d');
      circle(x - 0.8, 11.2, 0.8, 'rgba(255,255,255,0.7)');
    });
  }

  function drawPool(t) {
    const { x, y, r } = POOL;
    ctx.fillStyle = 'rgba(0,60,20,0.15)';
    ctx.beginPath(); ctx.ellipse(x, y + 4, r + 2, r - 2, 0, 0, Math.PI * 2); ctx.fill();
    circle(x, y, r, '#e8f5e9');
    circle(x, y, r - 2, '#a5d6a7');
    // Petri dish rings
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = 'rgba(46,125,50,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, r - 2 - i * 6, 0, Math.PI * 2); ctx.stroke();
    }
    circle(x, y, r - 4, '#c8e6c9');
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r - 4, 0, Math.PI * 2); ctx.clip();
    // animated bacteria blobs in dish
    const blobs = [
      [8, 4, 3, '#ef9a9a'], [-9, -5, 2.5, '#80cbc4'], [2, 11, 3, '#ce93d8'],
      [-6, 8, 2, '#ffcc80'], [12, -2, 1.8, '#ef9a9a'], [-3, -10, 2, '#80deea'],
    ];
    blobs.forEach(([dx, dy, br, col], i) => {
      const a = t * 0.7 + i * 1.1;
      const bx = x + dx * Math.cos(a * 0.3) - dy * Math.sin(a * 0.2) * 0.3;
      const by = y + dy * Math.cos(a * 0.25) + dx * Math.sin(a * 0.15) * 0.3;
      circle(bx, by, br, col);
    });
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(x, y, r - 4, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(100,200,100,0.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.font = 'bold 5px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Petri Dish', x, y + r + 8);
    ctx.textAlign = 'left';
  }

  // ── Station art ────────────────────────────────────────────────────────
  const STATION_ART = {
    vocab(x, y) {
      // Microscope
      px(x + 11, y + 26, 10, 4, '#9e9e9e');  // base
      px(x + 14, y + 16, 4, 10, '#757575');  // arm
      px(x + 12, y + 14, 8, 4, '#616161');   // crosspiece
      px(x + 15, y + 4, 2, 12, '#424242');   // tube
      px(x + 11, y + 2, 10, 4, '#9e9e9e');   // eyepiece
      circle(x + 16, y + 22, 3, '#80deea');  // lens
    },
    fertilise(x, y, t) {
      // Fish tank
      px(x + 4, y + 8, 24, 18, '#b3e5fc');
      px(x + 4, y + 8, 24, 3, '#e1f5fe');
      px(x + 4, y + 22, 24, 4, '#e8d5a3');  // sand
      // small fish
      const fx = x + 8 + ((t * 6) % 14);
      ctx.fillStyle = '#f48fb1';
      ctx.beginPath(); ctx.ellipse(fx, y + 16, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(fx - 4, y + 16); ctx.lineTo(fx - 7, y + 14); ctx.lineTo(fx - 7, y + 18); ctx.fill();
      // eggs on sand
      for (let i = 0; i < 4; i++) circle(x + 7 + i * 5, y + 24, 1.5, '#fff9c4');
      px(x + 2, y + 6, 28, 2, '#0288d1');  // tank top bar
      px(x + 2, y + 6, 2, 20, '#0288d1');  // tank sides
      px(x + 28, y + 6, 2, 20, '#0288d1');
    },
    kingdoms(x, y) {
      // Specimen display board
      px(x + 2, y + 2, 28, 22, '#f5f5f5');
      px(x + 2, y + 2, 28, 3, '#e0e0e0');
      // 6 specimen dots
      const cols = ['#ef9a9a', '#a5d6a7', '#80cbc4', '#ffcc80', '#ce93d8', '#80deea'];
      cols.forEach((c, i) => {
        const dx = x + 6 + (i % 3) * 8;
        const dy = y + 8 + Math.floor(i / 3) * 8;
        circle(dx, dy, 2.5, c);
      });
      px(x + 12, y + 24, 8, 4, '#9e9e9e'); // stand
      px(x + 10, y + 27, 12, 2, '#9e9e9e');
    },
    advantages(x, y, t) {
      // Balance scale
      const tilt = Math.sin(t * 1.2) * 2;
      px(x + 15, y + 4, 2, 18, '#795548');   // pole
      px(x + 6, y + 4, 20, 2, '#795548');    // beam top
      // left pan (lower when tilt < 0)
      ctx.strokeStyle = '#795548'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(x + 8, y + 5); ctx.lineTo(x + 6, y + 14 + tilt); ctx.stroke();
      px(x + 2, y + 13 + Math.round(tilt), 10, 2, '#bcaaa4');
      circle(x + 7, y + 11 + tilt, 2, '#a5d6a7');  // green = sexual
      circle(x + 9, y + 11 + tilt, 1.5, '#a5d6a7');
      // right pan
      ctx.beginPath(); ctx.moveTo(x + 24, y + 5); ctx.lineTo(x + 26, y + 14 - tilt); ctx.stroke();
      px(x + 20, y + 13 + Math.round(-tilt), 10, 2, '#bcaaa4');
      circle(x + 25, y + 11 - tilt, 2, '#ef9a9a');  // red = asexual
    },
  };

  function drawStation(id, s, t, hilit) {
    const solved = state.solved.includes(id);
    // Bench shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(Math.round(s.x + 2), Math.round(s.y + 33), 32, 4);
    // Bench top
    px(s.x, s.y, 32, 32, '#4e342e');
    px(s.x, s.y, 32, 3, '#6d4c41');
    px(s.x, s.y + 29, 32, 3, '#3e2723');
    // Station art
    const fn = STATION_ART[id];
    if (fn) fn(s.x, s.y, t);
    // Glow frame
    if (hilit || solved) {
      ctx.strokeStyle = solved ? '#69f0ae' : '#ffd23f';
      ctx.lineWidth = solved ? 1.5 : 1.2 + 0.5 * Math.sin(t * 6);
      ctx.strokeRect(s.x - 1, s.y - 1, 34, 34);
    }
    // Label
    const def = ER.get(id);
    if (!def) return;
    ctx.fillStyle = solved ? '#69f0ae' : '#ffd23f';
    ctx.font = `bold 5px Fredoka, sans-serif`;
    ctx.textAlign = 'center';
    const lx = s.x + 16;
    const words = def.title.split(' ');
    if (words.length <= 2) {
      ctx.fillText(def.title, lx, s.y + 40);
    } else {
      ctx.fillText(words.slice(0, 2).join(' '), lx, s.y + 40);
      ctx.fillText(words.slice(2).join(' '), lx, s.y + 47);
    }
    ctx.textAlign = 'left';
  }

  function drawIcons(t, near) {
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    for (const id in STATIONS) {
      const s = STATIONS[id];
      const def = ER.get(id);
      if (!def) continue;
      const bounce = near === id ? Math.sin(t * 7) * 1.5 : 0;
      ctx.fillText(def.icon, s.x + 16, s.y - 4 + bounce);
    }
    ctx.textAlign = 'left';
  }

  function drawPlayer() {
    const frames = SPR[player.dir] || SPR.down;
    const f = player.moving ? Math.floor(player.anim * 8) % frames.length : 0;
    ctx.drawImage(frames[f], Math.round(player.x - 6), Math.round(player.y - 16));
  }

  function draw(t) {
    ctx.setTransform(S, 0, 0, S, 0, 0);
    ctx.imageSmoothingEnabled = false;
    const near = nearest();
    drawFloor();
    drawWalls(t);
    drawPool(t);
    const ents = [];
    Object.entries(STATIONS).forEach(([id, s]) => ents.push({ y: s.y + 32, fn: () => drawStation(id, s, t, near === id) }));
    ents.push({ y: player.y, fn: drawPlayer });
    ents.sort((a, b) => a.y - b.y).forEach((e) => e.fn());
    drawIcons(t, near);
    if (near === 'door') {
      ctx.strokeStyle = `rgba(255,255,255,${0.6 + 0.4 * Math.sin(t * 8)})`;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(DOOR.x - 1, DOOR.y - 1, DOOR.w + 2, DOOR.h + 2);
    }
    updatePrompt(near);
  }

  // ── Prompt ─────────────────────────────────────────────────────────────
  let lastPrompt = undefined;
  function updatePrompt(near) {
    if (near === lastPrompt) return;
    lastPrompt = near;
    promptEl.innerHTML = '';
    if (!near) { promptEl.hidden = true; return; }
    const def = near === 'door' ? ER.door : ER.get(near);
    const solved = state.solved.includes(near);
    promptEl.append(
      el('button', { class: 'btn btn-sun prompt-btn', onclick: () => openScene(near) },
        el('span', { class: 'prompt-icon' }, def.icon),
        el('span', {}, `${solved ? 'Replay' : 'Open'} ${def.title}`),
        el('kbd', {}, 'E')));
    promptEl.hidden = false;
  }

  // ── Input ────────────────────────────────────────────────────────────
  const held = new Set();
  const roomActive = () => !roomView.hidden && !modalOpen();
  const isTyping = (e) => e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement;

  window.addEventListener('keydown', (e) => {
    if (!roomActive() || isTyping(e)) return;
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) {
      held.add(k); player.target = null; player.pendingOpen = null; e.preventDefault();
    } else if (k === 'e' || ((k === ' ' || k === 'enter') && (e.target === document.body || e.target === canvas))) {
      const n = nearest();
      if (n) { e.preventDefault(); openScene(n); }
    }
  });
  window.addEventListener('keyup', (e) => held.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => held.clear());

  canvas.addEventListener('pointerdown', (e) => {
    if (!roomActive()) return;
    sfx.unlock();
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;
    for (const id in STATIONS) {
      const s = STATIONS[id];
      if (x >= s.x - 2 && x <= s.x + 34 && y >= s.y - 14 && y <= s.y + 34) {
        if (nearest() === id) { openScene(id); return; }
        player.target = s.front.slice();
        player.pendingOpen = id;
        return;
      }
    }
    if (x >= DOOR.x && x <= DOOR.x + DOOR.w && y <= DOOR.y + DOOR.h + 6) {
      if (nearest() === 'door') { openScene('door'); return; }
      player.target = DOOR.front.slice();
      player.pendingOpen = 'door';
      return;
    }
    player.target = [x, y];
    player.pendingOpen = null;
  });

  // ── Update loop ────────────────────────────────────────────────────────
  function update(dt) {
    let vx = 0, vy = 0;
    if (held.has('arrowleft') || held.has('a')) vx -= 1;
    if (held.has('arrowright') || held.has('d')) vx += 1;
    if (held.has('arrowup') || held.has('w')) vy -= 1;
    if (held.has('arrowdown') || held.has('s')) vy += 1;
    const speed = 68;
    let arrived = false;
    if (!vx && !vy && player.target) {
      const dx = player.target[0] - player.x, dy = player.target[1] - player.y;
      const d = Math.hypot(dx, dy);
      if (d < 1.5) { arrived = true; }
      else { vx = dx / d; vy = dy / d; }
      if (d < speed * dt) { vx *= d / (speed * dt); vy *= d / (speed * dt); }
    } else if (vx && vy) { vx *= 0.7071; vy *= 0.7071; }

    let moved = false;
    if (vx || vy) {
      const mx = vx * speed * dt, my = vy * speed * dt;
      if (mx && !blocked(player.x + mx, player.y)) { player.x += mx; moved = true; }
      if (my && !blocked(player.x, player.y + my)) { player.y += my; moved = true; }
      if (Math.abs(vx) > Math.abs(vy)) player.dir = vx > 0 ? 'right' : 'left';
      else player.dir = vy > 0 ? 'down' : 'up';
      if (!moved && player.target) arrived = true;
    }
    player.moving = moved;
    if (moved) {
      player.anim += dt;
      player.stepT += dt;
      if (player.stepT > 0.28) { player.stepT = 0; sfx.step(); }
    }
    if (arrived) {
      const pend = player.pendingOpen;
      player.target = null;
      player.pendingOpen = null;
      if (pend && nearest() === pend) openScene(pend);
    }
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!roomView.hidden) {
      if (!modalOpen()) update(dt);
      draw(now / 1000);
    }
    if (state.timerOn) {
      state.elapsed = (Date.now() - state.startTime) / 1000;
      const txt = fmtTime(state.elapsed);
      if (hudTime.textContent !== txt) hudTime.textContent = txt;
    }
    requestAnimationFrame(frame);
  }
  const fmtTime = (s) => { s = Math.floor(s); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };

  // ── Notes ─────────────────────────────────────────────────────────────
  function codeTiles(code) {
    return el('span', { class: 'code-tiles' },
      el('span', { class: 'tile letter' }, el('small', {}, 'letter'), code.letter),
      el('span', { class: 'tile number' }, el('small', {}, 'number'), String(code.number)));
  }
  ER.codeTiles = codeTiles;

  function renderNotes(newId) {
    notesList.innerHTML = '';
    ER.puzzles.forEach((def) => {
      const solved = state.solved.includes(def.id);
      notesList.append(el('li', { class: 'note' + (solved ? ' solved' : '') + (def.id === newId ? ' new' : '') },
        el('span', { class: 'note-icon' }, def.icon),
        el('div', { class: 'note-text' },
          el('b', {}, def.title),
          solved ? null : el('span', { class: 'note-missing' }, 'Code not found yet')),
        solved ? codeTiles(def.code) : el('span', { class: 'code-tiles empty' },
          el('span', { class: 'tile' }, '?'), el('span', { class: 'tile' }, '?'))));
    });
    hudCodes.textContent = `${state.solved.length} / ${ER.puzzles.length}`;
  }

  // ── Scenes ─────────────────────────────────────────────────────────────
  function openScene(id) {
    const def = id === 'door' ? ER.door : ER.get(id);
    if (!def || modalOpen()) return;
    sfx.unlock(); sfx.open();
    held.clear(); player.target = null; player.pendingOpen = null;
    state.current = id;
    roomView.hidden = true; puzzleView.hidden = false; puzzleView.innerHTML = '';

    const hintBox = el('div', { class: 'hint-box', hidden: true });
    let shown = 0;
    const hints = def.hints || [];
    const hintBtn = el('button', { class: 'btn btn-sun' }, `💡 Hint (${hints.length} left)`);
    hintBtn.addEventListener('click', () => {
      if (shown >= hints.length) return;
      sfx.hint();
      hintBox.hidden = false;
      hintBox.append(el('div', { class: 'hint' }, el('b', {}, `Hint ${shown + 1}: `), hints[shown]));
      shown++;
      const left = hints.length - shown;
      hintBtn.textContent = left ? `💡 Another hint (${left} left)` : '💡 No more hints';
      hintBtn.disabled = !left;
    });
    const printBtn = def.printable
      ? el('button', { class: 'btn btn-light', onclick: () => { document.body.classList.add('printing'); setTimeout(() => { window.print(); document.body.classList.remove('printing'); }, 50); } }, '🖨️ Print sheet')
      : null;

    const head = el('header', { class: 'scene-head' },
      el('button', { class: 'btn btn-back', onclick: closeScene }, '⬅ Back to lab'),
      el('div', { class: 'scene-title' },
        el('span', { class: 'scene-icon' }, def.icon),
        el('div', {}, el('h2', {}, def.title), el('p', {}, def.tagline))),
      el('div', { class: 'tools' }, hintBtn, printBtn));

    const banner = state.solved.includes(id) && id !== 'door'
      ? el('div', { class: 'solved-banner' }, el('span', {}, '✅ Already solved! Your code is in your Lab Notes:'), codeTiles(def.code))
      : null;
    const body = el('div', { class: 'scene-body' });
    const scene = el('div', { class: 'scene kind-' + def.kind }, head, hintBox, banner, body);
    puzzleView.append(scene);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const api = {
      sfx,
      alreadySolved: state.solved.includes(id),
      solve: () => solvePuzzle(def),
      codes: () => state.solved.map((sid) => ER.get(sid)),
      missing: () => ER.puzzles.filter((p) => !state.solved.includes(p.id)),
      allDone: state.solved.length === ER.puzzles.length,
      escape: showEscape,
    };
    try {
      state.cleanup = def.build(body, api) || null;
    } catch (err) {
      console.error(err);
      body.append(el('p', { class: 'feedback bad' }, 'This station had a problem loading. Go back and try again.'));
    }
  }

  function closeScene() {
    if (state.cleanup) { try { state.cleanup(); } catch (e) { console.error(e); } }
    state.cleanup = null; state.current = null;
    puzzleView.hidden = true; puzzleView.innerHTML = '';
    roomView.hidden = false; lastPrompt = undefined;
    sfx.back(); canvas.focus();
  }
  ER.closeScene = closeScene;

  function solvePuzzle(def) {
    if (state.solved.includes(def.id)) return;
    state.solved.push(def.id);
    renderNotes(def.id);
    sfx.solve();
    setTimeout(() => {
      const count = state.solved.length;
      const total = ER.puzzles.length;
      const content = el('div', { class: 'reward' },
        el('div', { class: 'reward-burst' }, '🎉'),
        el('p', { class: 'reward-lead' }, 'You found a code! It has been saved in your Lab Notes.'),
        el('div', { class: 'reward-tiles' }, codeTiles(def.code)),
        def.fact ? el('div', { class: 'fact-card' }, el('b', {}, '🧬 Did you know? '), def.fact) : null,
        el('p', { class: 'muted small' }, count === total
          ? '🚪 That\'s all 4 codes! Head to the EXIT at the top of the lab!'
          : `${count} of ${total} codes found. Keep going!`));
      ER.modal({
        title: `${def.icon} ${def.title} solved!`,
        content,
        className: 'reward-modal',
        buttons: [
          { label: '⬅ Back to the lab', class: 'btn-aqua btn-big', onClick: closeScene },
          { label: 'Stay here', class: 'btn-light' },
        ],
      });
    }, 650);
  }

  function showEscape() {
    if (state.timerOn) state.elapsed = (Date.now() - state.startTime) / 1000;
    state.escaped = true; state.timerOn = false;
    sfx.escape();
    const confetti = el('div', { class: 'confetti', 'aria-hidden': 'true' });
    const colors = ['#ffd23f', '#a5d6a7', '#80cbc4', '#69f0ae', '#a970ff', '#ff9f43'];
    for (let i = 0; i < 70; i++) {
      confetti.append(el('i', { style: {
        left: Math.random() * 100 + '%',
        background: colors[i % colors.length],
        animationDelay: Math.random() * 2.5 + 's',
        animationDuration: 2.5 + Math.random() * 2 + 's',
        transform: `rotate(${Math.random() * 360}deg)`,
      } }));
    }
    const content = el('div', { class: 'escape-content' },
      confetti,
      el('div', { class: 'escape-swimmers', 'aria-hidden': 'true' },
        el('span', { class: 'swim s1', html: ER.art.bacterium }),
        el('span', { class: 'swim s2', html: ER.art.flower }),
        el('span', { class: 'swim s3', html: ER.art.mushroom })),
      el('h2', { class: 'escape-title' }, 'YOU ESCAPED!'),
      el('p', { class: 'escape-time' }, `⏱️ Your time: ${fmtTime(state.elapsed)}`),
      el('div', { class: 'answer-word' }, ...'SEED'.split('').map((c) => el('span', {}, c))),
      el('div', { class: 'fact-card' },
        el('b', {}, '🌱 SEED: '),
        'A seed contains a plant embryo and a food store, protected by a testa (seed coat). Seeds are the result of sexual reproduction — after meiosis produces haploid pollen and ovules (gametes), fertilisation creates a diploid zygote that develops into the embryo. The testa is an adaptation to desiccation, allowing seeds to survive dormancy and disperse far from the parent plant, maximising offspring survival and biodiversity.'),
      el('p', { class: 'muted' }, 'You decoded a Vigenère cipher and proved you understand reproduction across living kingdoms. Show your teacher this screen!'));
    ER.modal({
      content,
      className: 'escape-modal',
      dismissable: false,
      buttons: [
        { label: '⬅ Back to the lab', class: 'btn-light', onClick: closeScene },
        { label: '🔁 Play again', class: 'btn-sun btn-big', onClick: () => location.reload() },
      ],
    });
  }

  // ── Intro ─────────────────────────────────────────────────────────────
  function showIntro(first) {
    const content = el('div', { class: 'intro' },
      el('div', { class: 'intro-art', 'aria-hidden': 'true' },
        el('span', { html: ER.art.dna }),
        el('span', { html: ER.art.flower }),
        el('span', { html: ER.art.bacterium })),
      el('p', { class: 'intro-story' },
        'You are a Year 12 Biology student at ', el('b', {}, 'Research Station Genesis'),
        '. Dr A. Zygote has locked the exit and will only open it when you prove your understanding of reproduction across living kingdoms.'),
      el('ul', { class: 'intro-steps' },
        el('li', {}, el('span', {}, '🚶'), el('div', {}, el('b', {}, 'Explore the lab. '), 'Walk with ', el('kbd', {}, 'WASD'), ' / ', el('kbd', {}, 'Arrow keys'), ', or click the floor.')),
        el('li', {}, el('span', {}, '🧩'), el('div', {}, el('b', {}, 'Solve 4 stations. '), 'Walk up to a bench and press ', el('kbd', {}, 'E'), ' or click it. Do them in any order.')),
        el('li', {}, el('span', {}, '📓'), el('div', {}, el('b', {}, 'Collect codes. '), 'Each station gives a letter and a number, saved in your Lab Notes on the right.')),
        el('li', {}, el('span', {}, '🚪'), el('div', {}, el('b', {}, 'Escape! '), 'Take all 4 codes to the EXIT hatch and decode the password. Check your Lab Notes for everything you need.'))),
      el('p', { class: 'muted small' }, '⚠️ Progress is only saved while this tab is open — don\'t refresh!'));
    ER.modal({
      title: first ? '🧬 Welcome to Station Genesis!' : '❓ How to play',
      content,
      className: 'intro-modal',
      dismissable: !first,
      buttons: [{ label: first ? '🔬 Start!' : 'Got it!', class: 'btn-sun btn-big', onClick: () => {
        sfx.unlock();
        if (!state.timerOn && !state.escaped) { state.timerOn = true; state.startTime = Date.now() - state.elapsed * 1000; }
        canvas.focus();
      } }],
    });
  }

  // ── Top-bar ────────────────────────────────────────────────────────────
  const soundBtn = document.getElementById('btn-sound');
  soundBtn.addEventListener('click', () => {
    sfx.setMuted(!sfx.muted);
    soundBtn.textContent = sfx.muted ? '🔇' : '🔊';
    if (!sfx.muted) sfx.tap();
  });
  document.getElementById('btn-help').addEventListener('click', () => showIntro(false));

  window.addEventListener('beforeunload', (e) => {
    if (state.solved.length && !state.escaped) { e.preventDefault(); e.returnValue = ''; }
  });

  // Bubbles
  const bubblesEl = document.getElementById('bubbles');
  for (let i = 0; i < 22; i++) {
    const size = 6 + Math.random() * 22;
    bubblesEl.append(el('span', { style: {
      left: Math.random() * 100 + '%',
      width: size + 'px', height: size + 'px',
      animationDuration: 9 + Math.random() * 14 + 's',
      animationDelay: -Math.random() * 20 + 's',
    } }));
  }

  canvas.tabIndex = 0;
  renderNotes();
  requestAnimationFrame(frame);
  showIntro(true);

  ER._debug = {
    state,
    solveAll() { ER.puzzles.forEach((p) => { if (!state.solved.includes(p.id)) state.solved.push(p.id); }); renderNotes(); },
    open: openScene,
    player,
  };
})();
