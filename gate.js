/* BHU-NETRA Map Service - captcha gate for every enquiry action (WhatsApp chat, email, quotation, enquiry form).
   The WhatsApp number is never written on the page: it is put together only after the captcha is solved.
   Use:  <a href="#" data-gate="wa" data-text="Hello ...">   <a href="#" data-gate="mail" data-subject=".." data-body="..">
         <a href="#" data-gate="dl" data-href="downloads/...zip">  (free sample download)
         BNGate.check(fn)  - run fn after a solved captcha (the enquiry form uses this). */
(() => {
  const K = '328596788916';                                   // the number, scrambled
  const num = () => [...K].reverse().map((c, i) => (+c - i * 3 - 7 + 100) % 10).join('');
  const MAIL = 'bhunetramapservice@gmail.com';
  const AL = 'ABCDEFGHJKLMNPQRSTUVWXYZ', NU = '23456789';     // no I / O / 0 / 1 - easy to read
  const css = `
#bng{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:rgba(4,8,18,.78);backdrop-filter:blur(4px);padding:16px}
#bng.on{display:flex}
#bng .bx{width:min(380px,100%);background:linear-gradient(180deg,#0E1A33,#0B1428);border:1px solid #1E3A66;border-radius:18px;padding:22px;color:#EFF2FC;font:15px Inter,system-ui,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 0 1px rgba(46,230,176,.15)}
#bng h3{margin:0 0 4px;font:700 20px Rajdhani,sans-serif;letter-spacing:.04em;color:#fff}
#bng p{margin:0 0 14px;color:#93A4C3;font-size:13.5px}
#bng .cv{display:flex;gap:10px;align-items:center;margin-bottom:12px}
#bng canvas{border-radius:10px;border:1px solid #1E3A66;background:#EEF3FA;width:220px;height:70px;max-width:100%}
#bng .rf{flex:none;width:42px;height:42px;border-radius:50%;border:1px solid #1E3A66;background:#11356F;color:#2EE6B0;font-size:20px;cursor:pointer}
#bng input{width:100%;box-sizing:border-box;padding:12px 14px;border-radius:10px;border:1px solid #1E3A66;background:#080E1D;color:#fff;font:600 20px Consolas,monospace;letter-spacing:.3em;text-transform:uppercase;outline:none}
#bng input:focus{border-color:#2EE6B0}
#bng .er{min-height:18px;margin:8px 0 0;color:#FF7A7A;font-size:13px}
#bng .bt{display:flex;gap:10px;margin-top:12px}
#bng .bt button{flex:1;padding:12px;border-radius:999px;border:0;font:700 15px Rajdhani,sans-serif;letter-spacing:.05em;cursor:pointer}
#bng .go{background:linear-gradient(90deg,#19A884,#2EE6B0);color:#04110D}
#bng .no{background:transparent;border:1px solid #1E3A66 !important;color:#C9D6EA}`;
  let box, cv, inp, er, code = '', todo = null, tries = 0;

  function make() {
    const ch = [];
    ch.push(AL[rnd(AL.length)], AL[rnd(AL.length)], NU[rnd(NU.length)], NU[rnd(NU.length)]);   // always a mix
    const all = AL + NU;
    while (ch.length < 6) ch.push(all[rnd(all.length)]);
    for (let i = ch.length - 1; i > 0; i--) { const j = rnd(i + 1); [ch[i], ch[j]] = [ch[j], ch[i]]; }
    code = ch.join('');
    const W = 440, H = 140, x = cv.getContext('2d');
    cv.width = W; cv.height = H;
    const g = x.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#E8F0FA'); g.addColorStop(1, '#F7F2E6');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) {                             // speckle
      x.fillStyle = `rgba(${rnd(120)},${rnd(140)},${100 + rnd(120)},.35)`;
      x.fillRect(rnd(W), rnd(H), 2, 2);
    }
    for (let i = 0; i < 6; i++) {                              // crossing lines
      x.strokeStyle = `rgba(${rnd(150)},${60 + rnd(120)},${80 + rnd(150)},.55)`; x.lineWidth = 1 + Math.random() * 2;
      x.beginPath(); x.moveTo(rnd(W), rnd(H));
      x.bezierCurveTo(rnd(W), rnd(H), rnd(W), rnd(H), rnd(W), rnd(H)); x.stroke();
    }
    const cols = ['#0B1428', '#11356F', '#0A5B4C', '#7A3B00', '#5A1F6B', '#1E3A66'];
    [...code].forEach((c, i) => {
      x.save();
      x.translate(38 + i * 66 + rnd(10), 82 + rnd(26) - 13);
      x.rotate((Math.random() - .5) * .7);
      x.font = `${['bold ', '900 ', 'bold italic '][rnd(3)]}${52 + rnd(16)}px ${['Georgia', 'Verdana', 'Courier New', 'Trebuchet MS'][rnd(4)]}`;
      x.fillStyle = cols[rnd(cols.length)];
      x.fillText(c, -18, 18);
      x.restore();
    });
    x.strokeStyle = 'rgba(11,20,40,.55)'; x.lineWidth = 2.2;   // one line through the text
    x.beginPath(); x.moveTo(0, 60 + rnd(30));
    for (let X = 0; X <= W; X += 20) x.lineTo(X, 70 + Math.sin(X / 37 + rnd(3)) * 18);
    x.stroke();
    inp.value = ''; er.textContent = '';
  }
  function rnd(n) { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; }

  function build() {
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    box = document.createElement('div'); box.id = 'bng';
    box.innerHTML = `<div class="bx" role="dialog" aria-modal="true" aria-labelledby="bng-t">
      <h3 id="bng-t">Quick check</h3><p>Type the capital letters and numbers you see - it keeps spam robots away.</p>
      <div class="cv"><canvas aria-label="Captcha picture"></canvas><button class="rf" type="button" title="New picture" aria-label="New picture">&#8635;</button></div>
      <input maxlength="6" autocomplete="off" autocapitalize="characters" spellcheck="false" inputmode="text" aria-label="Captcha text" placeholder="------">
      <div class="er" aria-live="polite"></div>
      <div class="bt"><button class="no" type="button">Cancel</button><button class="go" type="button">Continue &rarr;</button></div></div>`;
    document.body.appendChild(box);
    cv = box.querySelector('canvas'); inp = box.querySelector('input'); er = box.querySelector('.er');
    box.querySelector('.rf').onclick = () => { make(); inp.focus(); };
    box.querySelector('.no').onclick = close;
    box.querySelector('.go').onclick = ok;
    box.addEventListener('click', e => { if (e.target === box) close(); });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') ok(); if (e.key === 'Escape') close(); });
    inp.addEventListener('input', () => { inp.value = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
  }
  function open(fn) {
    if (!box) build();
    todo = fn; tries = 0; make(); box.classList.add('on'); setTimeout(() => inp.focus(), 50);
  }
  function close() { box.classList.remove('on'); todo = null; }
  function ok() {
    if (inp.value.toUpperCase() === code) {
      const fn = todo; close(); fn && fn();
      return;
    }
    tries++;
    er.textContent = tries >= 3 ? 'Not matching - here is a new picture.' : 'Not matching - please try again.';
    if (tries >= 3) { const t = er.textContent; make(); er.textContent = t; tries = 0; }
    inp.select();
  }

  function act(el) {
    const kind = el.dataset.gate;
    try {                                                     // visitor counter: which action (no personal data)
      window.goatcounter && window.goatcounter.count && window.goatcounter.count({
        path: 'action-' + kind + (kind === 'dl' ? '-' + (el.dataset.href || '').split('/').pop() : ''), title: 'Action: ' + kind, event: true});
    } catch (e) {}
    if (kind === 'wa') {
      const url = 'https://wa.me/' + num() + (el.dataset.text ? '?text=' + encodeURIComponent(el.dataset.text) : '');
      const w = window.open(url, '_blank', 'noopener');
      if (!w) location.href = url;
    } else if (kind === 'dl') {                                  // free sample download
      const a = document.createElement('a'); a.href = el.dataset.href; a.download = ''; document.body.appendChild(a); a.click(); a.remove();
      window.BNGate.onDownload && window.BNGate.onDownload(el.dataset.href);
    } else if (kind === 'mail') {
      let q = [];
      if (el.dataset.subject) q.push('subject=' + encodeURIComponent(el.dataset.subject));
      if (el.dataset.body) q.push('body=' + encodeURIComponent(el.dataset.body));
      location.href = 'mailto:' + MAIL + (q.length ? '?' + q.join('&') : '');
    }
  }
  document.addEventListener('click', e => {
    const el = e.target.closest && e.target.closest('[data-gate]');
    if (!el) return;
    e.preventDefault();
    open(() => act(el));
  }, true);
  window.BNGate = {check: fn => open(() => {
    try { window.goatcounter && window.goatcounter.count && window.goatcounter.count({path: 'action-form', title: 'Action: form', event: true}); } catch (e) {}
    fn();
  })};
})();
