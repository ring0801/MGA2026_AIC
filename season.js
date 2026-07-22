/* ============================================================
   WORTWERK — SEASONS
   One turning wheel for the whole app. A season lasts 200
   questions; after that the world turns Frühling → Sommer →
   Herbst → Winter → Frühling, forever. The count is the shared
   profile's `answers` field, so every Paket and the Feldweg feed
   the same wheel — 200 questions anywhere moves everyone's season.

   Same rules as the rest of the app: no network, no files, no ads.
   Drop this one line into any page and it themes itself:

       <script src="season.js"></script>

   The page may also, optionally:
     • put  <span data-season-slot></span>  where it wants the badge
     • call Season.apply(count, { toast, se })  after each answer,
       so crossing a boundary announces the turn with sound.
   Neither is required — the script self-boots from storage.
   ============================================================ */
(function () {
  'use strict';
  if (window.Season) return;                       // load once, even if included twice

  var LEN = 200;                                   // questions per season
  var STILL = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LAST_KEY = 'wortwerk:season';                // remembers the last turn we announced

  /* The four seasons. `de` shows, `en` is the tooltip — same convention
     the rest of the app uses for its German proper names. Each carries an
     accent (for the badge), a soft ambient wash, and a particle palette. */
  var SEASONS = [
    { key: 'spring', de: 'Frühling', en: 'Spring', ico: '❀',
      accent: '#3FA96A',
      wash: 'radial-gradient(120% 80% at 50% -12%, rgba(120,200,130,.17), transparent 60%),' +
            'linear-gradient(180deg, rgba(232,150,184,.07), transparent 42%)',
      colors: ['#F4B8D0', '#FADCE7', '#FFFFFF', '#F7C9DC'] },
    { key: 'summer', de: 'Sommer', en: 'Summer', ico: '☀',
      accent: '#E8A200',
      wash: 'radial-gradient(90% 70% at 82% -10%, rgba(255,201,84,.22), transparent 55%),' +
            'linear-gradient(180deg, rgba(90,180,230,.06), transparent 46%)',
      colors: ['#FFDD8A', '#FFE9B0', '#FFF3D0', '#FFD36A'] },
    { key: 'autumn', de: 'Herbst', en: 'Autumn', ico: '❧',
      accent: '#C4622B',
      wash: 'radial-gradient(120% 82% at 50% -12%, rgba(210,120,44,.17), transparent 60%),' +
            'linear-gradient(180deg, rgba(180,90,44,.07), transparent 46%)',
      colors: ['#D9822B', '#C4532B', '#B5701F', '#A83C2B'] },
    { key: 'winter', de: 'Winter', en: 'Winter', ico: '❄',
      accent: '#5E8CB8',
      wash: 'radial-gradient(120% 92% at 50% -12%, rgba(150,190,230,.22), transparent 60%),' +
            'linear-gradient(180deg, rgba(120,150,190,.07), transparent 46%)',
      colors: ['#FFFFFF', '#EAF2FB', '#D8E7F5', '#F2F8FF'] }
  ];

  /* per-season particle behaviour: how fast they fall, how big, how much
     they sway. The shapes themselves are pure CSS, keyed by data-season. */
  var MOTION = {
    spring: { n: 16, dur: [7, 13], size: [7, 12], sway: [10, 26] },
    summer: { n: 13, dur: [10, 19], size: [4, 7], sway: [6, 16] },
    autumn: { n: 16, dur: [6, 11], size: [9, 15], sway: [14, 34] },
    winter: { n: 18, dur: [8, 15], size: [4, 9], sway: [8, 20] }
  };

  var rand = function (a, b) { return a + Math.random() * (b - a); };

  /* ---------- the pure part: where are we on the wheel ---------- */
  function info(answers) {
    var n = Math.max(0, answers | 0);
    var idx = Math.floor(n / LEN) % 4;
    var s = SEASONS[idx];
    var into = n % LEN;
    return {
      idx: idx, key: s.key, de: s.de, en: s.en, ico: s.ico, accent: s.accent,
      into: into, total: LEN, remaining: LEN - into,
      pct: Math.round(100 * into / LEN),
      year: Math.floor(n / (LEN * 4)) + 1,
      next: SEASONS[(idx + 1) % 4]
    };
  }

  /* ---------- one-time styles ---------- */
  var styled = false;
  function injectCSS() {
    if (styled) return; styled = true;
    var css =
      '#season-wash{position:fixed;inset:0;z-index:-1;pointer-events:none;transition:background .9s ease}' +
      '#season-sky{position:fixed;inset:0;z-index:25;pointer-events:none;overflow:hidden;contain:layout paint}' +
      '#season-sky .p{position:absolute;top:-12vh;left:var(--x);will-change:transform;' +
        'animation:sea-fall var(--dur) linear var(--delay) infinite}' +
      '#season-sky .pp{display:block;animation:sea-sway calc(var(--dur) * .5) ease-in-out var(--delay) infinite alternate}' +
      '#season-sky .ppp{display:block;width:var(--size);height:var(--size);opacity:var(--op)}' +
      '@keyframes sea-fall{from{transform:translateY(-14vh)}to{transform:translateY(114vh)}}' +
      '@keyframes sea-sway{from{transform:translateX(calc(var(--sway) * -1))}to{transform:translateX(var(--sway))}}' +
      '@keyframes sea-spin{to{transform:rotate(360deg)}}' +
      /* spring — blossom petals */
      'html[data-season="spring"] #season-sky .ppp{height:calc(var(--size) * .72);' +
        'background:var(--c);border-radius:50% 0 50% 0;transform:rotate(35deg)}' +
      /* summer — soft light motes */
      'html[data-season="summer"] #season-sky .ppp{border-radius:50%;background:var(--c);' +
        'box-shadow:0 0 6px 1px var(--c)}' +
      /* autumn — tumbling leaves */
      'html[data-season="autumn"] #season-sky .ppp{background:var(--c);border-radius:0 62% 0 62%;' +
        'animation:sea-spin var(--spin) linear var(--delay) infinite}' +
      /* winter — snow */
      'html[data-season="winter"] #season-sky .ppp{border-radius:50%;background:var(--c);' +
        'box-shadow:0 0 4px 0 rgba(255,255,255,.7)}' +
      /* the turn: a brief bloom of the season colour when the wheel moves */
      '#season-flash{position:absolute;inset:0;opacity:0;background:radial-gradient(60% 40% at 50% 0%,var(--flash,#fff),transparent 70%)}' +
      '#season-flash.on{animation:sea-flash 1.3s ease-out}' +
      '@keyframes sea-flash{0%{opacity:0}18%{opacity:.5}100%{opacity:0}}' +
      /* the badge that any page can host with [data-season-slot] */
      '.season-pill{display:inline-flex;align-items:center;gap:8px;background:var(--card,#F5F6F2);' +
        'border:1px solid var(--line,#C6C9C1);border-left:4px solid var(--sea,#888);border-radius:3px;' +
        'padding:6px 11px;font-family:var(--mono,monospace);font-size:11px;letter-spacing:.04em;color:var(--ink,#16181D)}' +
      '.season-pill .si{font-size:15px;line-height:1;color:var(--sea,#888)}' +
      '.season-pill .sn{font-family:var(--disp,sans-serif);font-size:16px;font-weight:700;' +
        'letter-spacing:.03em;text-transform:uppercase;line-height:1}' +
      '.season-pill .sbar{flex:1;min-width:44px;height:5px;background:var(--paper-2,#DDD);border-radius:3px;overflow:hidden}' +
      '.season-pill .sbar i{display:block;height:100%;background:var(--sea,#888);border-radius:3px;transition:width .6s cubic-bezier(.2,.8,.2,1)}' +
      '.season-pill .snum{color:var(--ink-40,#8A8F96);white-space:nowrap}' +
      '@media (prefers-reduced-motion:reduce){#season-sky .p,#season-sky .pp,#season-sky .ppp{animation:none!important}#season-flash{display:none}}';
    var el = document.createElement('style');
    el.id = 'season-css'; el.textContent = css;
    (document.head || document.documentElement).appendChild(el);
  }

  /* ---------- the sky ---------- */
  var sky = null, wash = null, flash = null, builtFor = null;
  function ensureSky() {
    if (!wash) {
      wash = document.createElement('div'); wash.id = 'season-wash';
      document.body.appendChild(wash);
    }
    if (!sky) {
      sky = document.createElement('div'); sky.id = 'season-sky';
      flash = document.createElement('div'); flash.id = 'season-flash';
      sky.appendChild(flash);
      document.body.appendChild(sky);
    }
  }

  function buildParticles(seasonKey) {
    if (STILL) return;                             // stillness for those who ask for it
    if (builtFor === seasonKey) return;
    builtFor = seasonKey;
    var m = MOTION[seasonKey], s = SEASONS.filter(function (x) { return x.key === seasonKey; })[0];
    // clear old petals but keep the flash node
    var kids = sky.querySelectorAll('.p');
    for (var i = 0; i < kids.length; i++) kids[i].remove();
    var frag = document.createDocumentFragment();
    for (var j = 0; j < m.n; j++) {
      var dur = rand(m.dur[0], m.dur[1]);
      var size = rand(m.size[0], m.size[1]);
      var col = s.colors[j % s.colors.length];
      var p = document.createElement('span'); p.className = 'p';
      p.style.cssText =
        '--x:' + rand(0, 100).toFixed(2) + '%;' +
        '--dur:' + dur.toFixed(2) + 's;' +
        '--delay:' + (-rand(0, dur)).toFixed(2) + 's;' +
        '--size:' + size.toFixed(1) + 'px;' +
        '--sway:' + rand(m.sway[0], m.sway[1]).toFixed(0) + 'px;' +
        '--spin:' + rand(2.5, 6).toFixed(2) + 's;' +
        '--op:' + rand(.55, .95).toFixed(2) + ';' +
        '--c:' + col + ';';
      var pp = document.createElement('span'); pp.className = 'pp';
      var ppp = document.createElement('span'); ppp.className = 'ppp';
      pp.appendChild(ppp); p.appendChild(pp);
      frag.appendChild(p);
    }
    sky.appendChild(frag);
  }

  /* ---------- the badge ---------- */
  function paintPill(inf) {
    var slots = document.querySelectorAll('[data-season-slot]');
    if (!slots.length) return;
    var html =
      '<span class="season-pill" title="' + inf.en + ' · question ' + inf.into + ' of ' + inf.total +
        ' → ' + inf.next.de + '">' +
        '<span class="si">' + inf.ico + '</span>' +
        '<span class="sn">' + inf.de + '</span>' +
        '<span class="sbar"><i style="width:' + inf.pct + '%"></i></span>' +
        '<span class="snum">' + inf.into + ' / ' + inf.total + '</span>' +
      '</span>';
    for (var i = 0; i < slots.length; i++) slots[i].innerHTML = html;
  }

  /* ---------- put it all on screen ---------- */
  var applied = false;
  function apply(answers, opts) {
    opts = opts || {};
    var inf = info(answers || 0);
    injectCSS();
    if (!document.body) {                           // called too early — wait for the DOM
      document.addEventListener('DOMContentLoaded', function () { apply(answers, opts); });
      return inf;
    }
    ensureSky();

    // theme: one attribute drives every seasonal rule + the accent variables
    var root = document.documentElement;
    root.setAttribute('data-season', inf.key);
    root.style.setProperty('--sea', inf.accent);
    var s = SEASONS[inf.idx];
    wash.style.background = s.wash;
    flash.style.setProperty('--flash', inf.accent);

    buildParticles(inf.key);
    paintPill(inf);

    // has the wheel turned since we last looked?
    var prev = null;
    try { var v = localStorage.getItem(LAST_KEY); if (v != null) prev = parseInt(v, 10); } catch (e) { }
    var turned = prev != null && prev !== inf.idx;
    try { localStorage.setItem(LAST_KEY, String(inf.idx)); } catch (e) { }

    if (turned && opts.announce !== false && applied) {
      var from = SEASONS[((prev % 4) + 4) % 4];
      if (typeof opts.toast === 'function') opts.toast(from.de + ' → ' + inf.de);
      if (typeof opts.se === 'function') { try { opts.se('badge'); } catch (e) { } }
      if (flash && !STILL) { flash.classList.remove('on'); void flash.offsetWidth; flash.classList.add('on'); }
    }
    applied = true;
    API._applied = true;
    return inf;
  }

  /* ---------- self-boot ----------
     So a page needs nothing but the <script> tag. We read the same
     profile every page writes and theme from its `answers`. A page that
     calls apply() itself simply overrides this with its live count. */
  function readAnswers(cb) {
    var done = function (n) { cb(n | 0); };
    try {
      if (window.storage && window.storage.get) {
        window.storage.get('wortwerk:profile').then(function (r) {
          var n = 0; try { n = (JSON.parse(r.value) || {}).answers || 0; } catch (e) { }
          if (n) return done(n);
          fromLocal(done);
        }).catch(function () { fromLocal(done); });
        return;
      }
    } catch (e) { }
    fromLocal(done);
  }
  function fromLocal(done) {
    var n = 0;
    try { var v = localStorage.getItem('wortwerk:profile'); if (v) n = (JSON.parse(v) || {}).answers || 0; } catch (e) { }
    done(n);
  }

  function autoBoot() {
    if (API._applied) return;                       // a host page already took the wheel
    readAnswers(function (n) { if (!API._applied) apply(n, { announce: false }); });
  }

  var API = { LEN: LEN, SEASONS: SEASONS, info: info, apply: apply, _applied: false };
  window.Season = API;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoBoot);
  else autoBoot();
})();
