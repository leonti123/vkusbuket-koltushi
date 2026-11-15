/* Режим мастера ВкусБукет: тексты, фото, цены, галереи, новогодние карточки.
   Демо (MASTER_URL пуст): изменения хранятся только в этом браузере. */
(function () {
  const V = window.VB, D = V.D, $ = id => document.getElementById(id), esc = V.esc;
  const deep = x => JSON.parse(JSON.stringify(x));
  let dirty = false, on = false;

  const css = `
.ms-bar{position:fixed;left:0;right:0;top:0;z-index:300;background:#35262A;color:#fff;font:500 14px/1.3 Geologica,system-ui,sans-serif;padding:8px 12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;box-shadow:0 6px 20px rgba(0,0,0,.25)}
.ms-bar[hidden],.ms-toast[hidden],[hidden]{display:none!important}
.ms-bar b{font-weight:600;margin-right:auto}.ms-bar small{opacity:.7;display:block;font-weight:400}
.ms-bar button,.ms-ui button,.ms-dlg button{font:600 14px/1 Geologica,system-ui,sans-serif;border:0;border-radius:999px;padding:10px 14px;cursor:pointer;background:#fff;color:#35262A}
.ms-bar .ms-save{background:#F2CB66}.ms-bar .ms-save.dirty{box-shadow:0 0 0 3px rgba(242,203,102,.45)}
body.ms{padding-top:56px}body.ms .top{top:52px}
body.ms [data-k]{outline:1.5px dashed rgba(199,84,110,.55);outline-offset:3px;border-radius:3px;cursor:text}
body.ms [data-k]:focus{outline:2px solid #C7546E;background:rgba(255,255,255,.6)}
body.ms [data-ik]{outline:3px dashed rgba(242,203,102,.9);outline-offset:-3px;cursor:pointer}
.ms-ui{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}
.ms-ui button{background:#C7546E;color:#fff;box-shadow:0 4px 12px rgba(199,84,110,.3)}
.ms-dlg{margin:auto;border:0;border-radius:20px;padding:0;width:min(680px,calc(100vw - 20px));max-height:calc(100vh - 20px);color:#35262A;font:15px/1.4 Geologica,system-ui,sans-serif}
.ms-dlg::backdrop{background:rgba(30,15,20,.55)}
.ms-dlg .in{padding:18px 16px 0}.ms-dlg h3{font-size:20px;margin-bottom:6px}.ms-dlg .hint{font-size:13px;opacity:.7;margin-bottom:12px}
.ms-dlg .ft{position:sticky;bottom:0;background:#fff;display:flex;gap:8px;justify-content:flex-end;padding:12px 16px;border-top:1px solid #eee;margin-top:14px}
.ms-dlg .ft .ok{background:#C7546E;color:#fff}.ms-dlg .ft button{background:#f1e7e3}
.ms-dlg input,.ms-dlg textarea{font:inherit;width:100%;border:1px solid #d9c9c3;border-radius:10px;padding:8px 10px;background:#fff;color:inherit}
.ms-blk{border:1px solid #eadcd6;border-radius:14px;padding:12px;margin-bottom:12px}
.ms-blk>label{display:block;font-size:13px;opacity:.75;margin-bottom:4px}
.ms-row{display:grid;grid-template-columns:1fr 1fr 110px;gap:6px;align-items:center;margin-top:8px;padding-top:8px;border-top:1px dashed #eadcd6}
.ms-row.wd{grid-template-columns:1fr 1fr 100px 70px}
.ms-row .ms-ctl{grid-column:1/-1;display:flex;gap:6px;justify-content:flex-end}
.ms-row .ms-ctl button,.ms-th button{padding:7px 11px;background:#f1e7e3;font-size:13px}
.ms-d{display:grid;font-size:11px;opacity:.85;gap:2px}.ms-d input{opacity:1}
.ms-add{background:#f6efe6!important;margin-top:10px}
.ms-thumbs{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px}
.ms-th{position:relative;border-radius:12px;overflow:hidden;background:#f1e7e3}
.ms-th img{width:100%;aspect-ratio:4/5;object-fit:cover;display:block}
.ms-th div{display:flex;justify-content:space-between;padding:5px}
.ms-th span{position:absolute;left:6px;top:6px;background:rgba(0,0,0,.55);color:#fff;font-size:12px;border-radius:8px;padding:2px 7px}
.ms-card{display:grid;grid-template-columns:96px 1fr;gap:10px;border:1px solid #eadcd6;border-radius:14px;padding:10px;margin-bottom:10px}
.ms-card img{width:96px;height:120px;object-fit:cover;border-radius:10px;cursor:pointer}
.ms-card .f{display:grid;gap:6px}
.ms-toast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:310;background:#35262A;color:#fff;padding:12px 16px;border-radius:14px;font:14px/1.4 Geologica,system-ui,sans-serif;max-width:calc(100vw - 32px);box-shadow:0 10px 30px rgba(0,0,0,.3)}
@media(max-width:600px){.ms-row,.ms-row.wd{grid-template-columns:1fr 1fr}.ms-row input.p{grid-column:1}.ms-bar{flex-wrap:nowrap;gap:6px;padding:8px}.ms-bar small{display:none}.ms-bar b{font-size:13px}.ms-bar button{padding:9px 10px;font-size:13px}.ms-bar .lg{display:none}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const bar = document.createElement('div'); bar.className = 'ms-bar'; bar.hidden = true;
  bar.innerHTML = '<b>Мастер<span class="lg">: режим правки</span><small>Нажмите на текст, чтобы изменить. Нажмите на фото с жёлтой рамкой, чтобы заменить</small></b><button class="ms-save" type="button">Сохранить</button><button class="ms-reset" type="button">Сбросить<span class="lg"> всё</span></button><button class="ms-exit" type="button">Выйти</button>';
  document.body.appendChild(bar);
  const toast = document.createElement('div'); toast.className = 'ms-toast'; toast.hidden = true; document.body.appendChild(toast);
  let tt; const say = (t, ms) => { toast.textContent = t; toast.hidden = false; clearTimeout(tt); tt = setTimeout(() => toast.hidden = true, ms || 4000); };
  const mark = () => { dirty = true; bar.querySelector('.ms-save').classList.add('dirty'); };

  // ---- фото: уменьшаем перед сохранением ----
  function pickFiles(multi) {
    return new Promise(res => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.multiple = !!multi; i.onchange = () => res([...i.files]); i.click(); });
  }
  function shrink(file, W) {
    return new Promise((res, rej) => { const u = URL.createObjectURL(file), im = new Image();
      im.onload = () => { const k = Math.min(1, W / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); res(c.toDataURL('image/jpeg', .8)); };
      im.onerror = () => rej(new Error('Не удалось открыть фото')); im.src = u; });
  }

  // ---- окна ----
  function dlg(title, hint, body, onOk) {
    const d = document.createElement('dialog'); d.className = 'ms-dlg';
    d.innerHTML = `<div class="in"><h3>${esc(title)}</h3><p class="hint">${esc(hint)}</p><div class="bd"></div></div><div class="ft"><button type="button" class="no">Отмена</button><button type="button" class="ok">Готово</button></div>`;
    d.querySelector('.bd').appendChild(body); document.body.appendChild(d);
    d.querySelector('.no').onclick = () => { d.close(); d.remove(); };
    d.querySelector('.ok').onclick = () => { onOk(); d.close(); d.remove(); markDraft(); };
    d.addEventListener('cancel', () => d.remove()); d.showModal(); return d;
  }
  const btn = (t, f) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.onclick = f; return b; };
  const move = (a, i, d) => { const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; };

  // цены в каталоге
  function editPrices(c) {
    const L = deep(D.lists[c] || V.BASE.lists[c]), wd = V.PB[c];
    const box = document.createElement('div');
    function draw() {
      box.innerHTML = '';
      L.forEach((b, bi) => {
        const bl = document.createElement('div'); bl.className = 'ms-blk';
        bl.innerHTML = `<label>Заголовок списка${bi === wd ? ' (по нему работает примерка размера)' : ''}</label>`;
        const h = document.createElement('input'); h.value = b.h; h.oninput = () => b.h = h.value; bl.appendChild(h);
        b.rows.forEach((r, ri) => {
          const row = document.createElement('div'); row.className = 'ms-row' + (bi === wd ? ' wd' : '');
          const f = (k, ph, cls) => { const i = document.createElement('input'); i.value = r[k] == null ? '' : r[k]; i.placeholder = ph; if (cls) i.className = cls; i.oninput = () => r[k] = i.value; row.appendChild(i); return i; };
          f('l', 'Название или размер'); f('s', 'Пояснение');
          const p = f('p', 'Цена', 'p'); p.onblur = () => { if (/^\s*\d[\d\s]*$/.test(p.value)) { p.value = (+p.value.replace(/\s/g, '')).toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₽'; r.p = p.value; } };
          if (bi === wd) { const d = f('d', 'см'); d.type = 'number'; d.min = 10; d.max = 45; const lb = document.createElement('label'); lb.className = 'ms-d'; lb.title = 'Диаметр для примерки размера, см'; lb.textContent = '⌀ для примерки, см'; row.insertBefore(lb, d); lb.appendChild(d); }
          const ctl = document.createElement('div'); ctl.className = 'ms-ctl';
          ctl.append(btn('↑', () => { move(b.rows, ri, -1); draw(); }), btn('↓', () => { move(b.rows, ri, 1); draw(); }), btn('Удалить', () => { b.rows.splice(ri, 1); draw(); }));
          row.appendChild(ctl); bl.appendChild(row);
        });
        const add = btn('+ Добавить строку', () => { b.rows.push({l: '', s: '', p: ''}); draw(); bl.querySelector('.ms-row:last-of-type input')?.focus(); }); add.className = 'ms-add';
        bl.appendChild(add); box.appendChild(bl);
      });
    }
    draw();
    dlg('Цены: ' + V.NAMES[c], 'Цену можно писать как 1700, от 2000 или около 2 800 ₽. Пустой список скрывается с сайта', box, () => {
      L.forEach(b => b.rows = b.rows.filter(r => (r.l + r.s + r.p).trim()));
      D.lists[c] = L; V.renderLists(c); if (wd != null) V.refreshSize();
    });
  }

  // фото работ в каталоге
  function editGal(c) {
    const list = (D.gal[c] || V.BASE.gal[c]).slice();
    const box = document.createElement('div');
    function draw() {
      box.innerHTML = '<div class="ms-thumbs"></div>'; const g = box.firstChild;
      list.forEach((n, i) => { const t = document.createElement('div'); t.className = 'ms-th';
        t.innerHTML = `<img src="${esc(V.SRC(n))}" alt=""><span>${i + 1}</span><div></div>`;
        t.lastChild.append(btn('←', () => { move(list, i, -1); draw(); }), btn('×', () => { list.splice(i, 1); draw(); }), btn('→', () => { move(list, i, 1); draw(); }));
        g.appendChild(t); });
      const add = btn('+ Добавить фото', async () => { const fs = await pickFiles(true); for (const f of fs) { try { list.unshift(await shrink(f, 1200)); } catch (e) { say(e.message); } } draw(); }); add.className = 'ms-add'; box.appendChild(add);
    }
    draw();
    dlg('Фото работ: ' + V.NAMES[c], 'Новые фото встают первыми. Стрелками меняйте порядок, × убирает фото с сайта. На компьютере видны первые 9', box, () => { D.gal[c] = list; V.renderGal(c); });
  }

  // новогодние карточки
  function editNy() {
    const L = deep(D.ny || V.BASE.ny), box = document.createElement('div');
    function draw() {
      box.innerHTML = '';
      L.forEach((x, i) => { const cd = document.createElement('div'); cd.className = 'ms-card';
        const im = document.createElement('img'); im.src = V.SRC(x.img); im.title = 'Заменить фото';
        im.onclick = async () => { const [f] = await pickFiles(); if (f) { x.img = await shrink(f, 1000); im.src = x.img; } };
        const fl = document.createElement('div'); fl.className = 'f';
        [['h', 'Название'], ['p', 'Описание'], ['b', 'Цена']].forEach(([k, ph]) => { const n = document.createElement('input'); n.value = x[k]; n.placeholder = ph; n.oninput = () => x[k] = n.value; fl.appendChild(n); });
        const ctl = document.createElement('div'); ctl.className = 'ms-ctl'; ctl.style.cssText = 'display:flex;gap:6px';
        ctl.append(btn('↑', () => { move(L, i, -1); draw(); }), btn('↓', () => { move(L, i, 1); draw(); }), btn('Удалить', () => { L.splice(i, 1); draw(); }));
        ctl.querySelectorAll('button').forEach(b => b.style.cssText = 'padding:7px 11px;background:#f1e7e3;font-size:13px');
        fl.appendChild(ctl); cd.append(im, fl); box.appendChild(cd); });
      const add = btn('+ Добавить подарок', async () => { const [f] = await pickFiles(); L.push({img: f ? await shrink(f, 1000) : 'c-ny', h: 'Новый подарок', p: '', b: 'от 1 000 ₽'}); draw(); }); add.className = 'ms-add'; box.appendChild(add);
    }
    draw();
    dlg('Новогодние подарки', 'Нажмите на фото карточки, чтобы заменить его', box, () => { D.ny = L; V.renderNy(); });
  }

  // ---- кнопки в разделах ----
  function addUi() {
    V.CATS.forEach(c => { const p = document.querySelector(`[data-panel="${c}"] .p-info`); const u = document.createElement('div'); u.className = 'ms-ui';
      u.append(btn('Изменить цены', () => editPrices(c)), btn('Фото работ', () => editGal(c))); p.insertBefore(u, p.querySelector('.p-btns')); });
    const ny = document.querySelector('.ny-foot'); const u = document.createElement('div'); u.className = 'ms-ui'; u.append(btn('Изменить новогодние подарки', editNy)); ny.parentNode.insertBefore(u, ny);
  }

  // ---- тексты и фото на странице ----
  function onInput(e) { const el = e.target.closest('[data-k]'); if (!el || !on) return; D.t[el.dataset.k] = V.clean(el.innerHTML); markDraft(); }
  function onKey(e) { if (on && e.key === 'Enter' && e.target.closest('[data-k]')) { e.preventDefault(); e.target.blur(); } }
  function onPaste(e) { if (!on || !e.target.closest('[data-k]')) return; e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text').replace(/\s+/g, ' ')); }
  async function onClick(e) {
    if (!on) return;
    if (e.target.closest('.ms-bar,.ms-dlg,.ms-ui')) return;
    const k = e.target.closest('[data-k]'), im = e.target.closest('[data-ik]');
    if (k) { e.preventDefault(); e.stopPropagation(); return; }
    if (im) { e.preventDefault(); e.stopPropagation(); const [f] = await pickFiles(); if (!f) return;
      try { const u = await shrink(f, 1400); D.img[im.dataset.ik] = u; im.src = u; im.removeAttribute('width'); im.removeAttribute('height'); markDraft(); } catch (er) { say(er.message); } }
  }
  document.addEventListener('input', onInput, true); document.addEventListener('keydown', onKey, true);
  document.addEventListener('paste', onPaste, true); document.addEventListener('click', onClick, true);

  // ---- вход, черновик, сохранение ----
  const LIVE = !!V.MASTER_URL, TKEY = 'vb-tok-v1', DKEY = 'vb-draft-v1';
  const LS = {get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }, del: k => { try { localStorage.removeItem(k); } catch (e) {} }};
  const tok = () => { const t = LS.get(TKEY); return t && t.exp > Date.now() ? t : null; };
  let baseRev = D.rev || 0, warned = false;
  const mark0 = mark;
  const markDraft = () => { mark0(); if (!LIVE) return; if (!LS.set(DKEY, {base: baseRev, d: D}) && !warned) { warned = true; say('Черновик не помещается в память браузера. Нажмите «Сохранить», чтобы правки не пропали', 7000); } };
  async function api(body) {
    const r = await fetch(V.MASTER_URL, {method: 'POST', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify(body), signal: AbortSignal.timeout(120000)});
    return r.json();
  }
  function loginDlg() {
    const d = document.createElement('dialog'); d.className = 'ms-dlg';
    d.innerHTML = '<form class="in" method="dialog"><h3>Вход для мастера</h3><p class="hint">Здесь можно менять тексты, цены и фото на сайте</p><input type="password" autocomplete="current-password" placeholder="Пароль" required><p class="hint err" style="color:#b3261e;min-height:1.4em;margin-top:8px"></p><div class="ft" style="margin:0 -16px"><button type="button" class="no">Закрыть</button><button type="submit" class="ok">Войти</button></div></form>';
    document.body.appendChild(d); d.showModal();
    const f = d.querySelector('form'), pw = f.querySelector('input'), er = f.querySelector('.err'), b = f.querySelector('.ok');
    d.querySelector('.no').onclick = () => { d.close(); d.remove(); };
    d.addEventListener('cancel', () => d.remove());
    f.onsubmit = async e => {
      e.preventDefault(); b.disabled = true; b.textContent = 'Проверяю...'; er.textContent = '';
      try {
        const r = await api({a: 'login', pw: pw.value});
        if (r.ok) { LS.set(TKEY, {token: r.token, exp: r.exp}); d.close(); d.remove(); enter(); return; }
        er.textContent = r.err === 'locked' ? 'Слишком много попыток, подождите 15 минут' : 'Неверный пароль';
      } catch (x) { er.textContent = 'Нет связи, попробуйте ещё раз'; }
      b.disabled = false; b.textContent = 'Войти';
    };
  }
  function enter() {
    if (on) return;
    if (LIVE && !tok()) { loginDlg(); return; }
    on = true; bar.hidden = false; document.body.classList.add('ms');
    if (LIVE) { const dr = LS.get(DKEY); if (dr && dr.d && dr.base === baseRev) { Object.assign(D, dr.d); V.applyAll(); V.refreshSize(); mark0(); } else if (dr) LS.del(DKEY); }
    document.querySelectorAll('[data-k]').forEach(el => { el.contentEditable = 'plaintext-only'; if (el.contentEditable !== 'plaintext-only') el.contentEditable = 'true'; el.spellcheck = true; });
    document.querySelectorAll('main a').forEach(a => a.draggable = false);
    document.querySelectorAll('main details').forEach(d => d.open = true);
    document.querySelectorAll('.rv').forEach(el => el.classList.add('in'));
    addUi();
    try { sessionStorage.setItem('vb-ms', '1'); } catch (e) {}
    say(LIVE ? (dirty ? 'Есть несохранённые правки с прошлого раза. Нажмите «Сохранить», чтобы их увидели все' : 'Вы в режиме мастера. Меняйте, потом нажмите «Сохранить»') : 'Демо режима мастера: изменения сохранятся только в этом браузере. На готовом сайте будет вход по паролю, и правки увидят все', 6500);
  }
  const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  async function save(force) {
    if (!LIVE) {
      D.rev = (D.rev || 0) + 1;
      try { localStorage.setItem(V.DEMO_KEY, JSON.stringify(D)); }
      catch (e) { D.rev--; say('Не хватило места в браузере: в демо поместится немного новых фото. На готовом сайте фото сохраняются на сайт без ограничений', 7000); return; }
      dirty = false; bar.querySelector('.ms-save').classList.remove('dirty'); say('Сохранено. В демо изменения видны только в этом браузере'); return;
    }
    const t = tok(); if (!t) { say('Вход устарел, войдите ещё раз'); on = false; loginDlg(); return; }
    const sb = bar.querySelector('.ms-save'); sb.disabled = true; sb.textContent = 'Сохраняю...';
    // новые фото (data:) уходят файлами в img/u, в данных остаётся путь
    const files = [], map = {};
    const fix = v => { if (typeof v === 'string' && v.startsWith('data:image/')) { if (!map[v]) { map[v] = 'img/u/' + rid() + '.jpg'; files.push({path: map[v], b64: v.split(',')[1]}); } return map[v]; } if (Array.isArray(v)) return v.map(fix); if (v && typeof v === 'object') { const o = {}; for (const k in v) o[k] = fix(v[k]); return o; } return v; };
    const data = fix(deep(D)); data.v = 1;
    try {
      const r = await api({a: 'save', token: t.token, base: baseRev, force: !!force, data, files});
      if (r.ok) {
        const fixD = fix(D); Object.assign(D, fixD); D.rev = data.rev = baseRev = r.rev;
        try { sessionStorage.setItem('vb-pub', JSON.stringify(data)); } catch (e) {}
        LS.del(DKEY); dirty = false; sb.classList.remove('dirty');
        say('Сохранено! Все посетители увидят изменения через 1-2 минуты', 6000);
      } else if (r.err === 'conflict') {
        if (window.confirm('Сайт уже изменили с другого устройства. Записать вашу версию поверх?')) { sb.disabled = false; sb.textContent = 'Сохранить'; return save(true); }
      } else if (r.err === 'auth') { LS.del(TKEY); on = false; say('Вход устарел, войдите ещё раз'); loginDlg(); }
      else say('Не получилось сохранить (' + r.err + '). Правки остались в черновике, попробуйте ещё раз', 7000);
    } catch (x) { say('Нет связи, правки остались в черновике. Попробуйте ещё раз', 7000); }
    sb.disabled = false; sb.textContent = 'Сохранить';
  }
  bar.querySelector('.ms-save').onclick = () => save(false);
  bar.querySelector('.ms-reset').onclick = () => {
    if (LIVE) { if (!window.confirm('Отменить несохранённые правки? Сайт вернётся к последней сохранённой версии')) return; LS.del(DKEY); dirty = false; location.reload(); return; }
    if (!window.confirm('Убрать все ваши изменения и вернуть сайт как было?')) return; try { localStorage.removeItem(V.DEMO_KEY); sessionStorage.removeItem('vb-ms'); } catch (e) {} location.href = location.pathname; };
  bar.querySelector('.ms-exit').onclick = () => { if (dirty && !window.confirm('Есть несохранённые изменения. Выйти без сохранения?')) return; dirty = false; LS.del(TKEY); try { sessionStorage.removeItem('vb-ms'); } catch (e) {} location.href = location.pathname; };
  addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  window.VBM = enter; enter();
})();
