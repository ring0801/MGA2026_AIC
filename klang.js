/* ============================================================
   WORTWERK — KLANG
   Sound effects and ambient music, synthesised in the browser.
   No audio files, no network requests, ~7 KB, same ethos as the
   rest of the app: nothing about your use of it leaves the device.

   Usage:  <script src="klang.js"></script>   (before the app script)
           KLANG.ok(combo) / KLANG.no() / KLANG.badge() ...
           KLANG.mountToggles('#soundSlot')

   Preferences live in localStorage, NOT in the synced profile:
   sound is a property of the room you are in, not of your account.
   ============================================================ */
(function (root) {
  'use strict';

  var K_SE = 'wortwerk:se', K_BGM = 'wortwerk:bgm', K_VOL = 'wortwerk:vol';

  var ls = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };

  var state = {
    se: ls.get(K_SE, true),      // effects: on by default, they only fire on your own taps
    bgm: ls.get(K_BGM, false),   // music: OFF by default. Nobody's phone should sing unasked.
    vol: ls.get(K_VOL, 0.7),
    ready: false
  };

  var ctx = null, master = null, seBus = null, bgmBus = null, bgmTimer = null;

  /* ---------- lazy audio graph, built on the first user gesture ----------
     Every mobile browser refuses to make sound before a gesture. We don't
     fight it: we build the graph the first time a finger touches the glass. */
  function build() {
    if (ctx) return ctx;
    var AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();

    master = ctx.createGain();
    master.gain.value = state.vol;

    var comp = ctx.createDynamicsCompressor();   // keeps a fast combo from stacking into a spike
    comp.threshold.value = -18; comp.ratio.value = 6; comp.attack.value = 0.003;

    seBus = ctx.createGain(); seBus.gain.value = 1;
    bgmBus = ctx.createGain(); bgmBus.gain.value = 0;

    seBus.connect(comp); bgmBus.connect(comp);
    comp.connect(master); master.connect(ctx.destination);
    state.ready = true;
    return ctx;
  }

  function wake() {
    build();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
    root.addEventListener(ev, wake, { passive: true });
  });

  /* Stop drawing battery the moment the app is out of sight. */
  document.addEventListener('visibilitychange', function () {
    if (!ctx) return;
    if (document.hidden) { stopBgmLoop(); ctx.suspend(); }
    else { ctx.resume(); if (state.bgm) startBgmLoop(); }
  });

  /* ---------- one voice: an envelope on an oscillator ---------- */
  var midi = function (n) { return 440 * Math.pow(2, (n - 69) / 12); };

  function tone(o) {
    if (!state.se && !o._music) return;
    build(); if (!ctx) return;
    var t = ctx.currentTime + (o.at || 0);
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    var f = ctx.createBiquadFilter();

    osc.type = o.type || 'triangle';
    osc.frequency.setValueAtTime(o.f, t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + (o.dur || 0.12));
    if (o.detune) osc.detune.value = o.detune;

    f.type = 'lowpass';
    f.frequency.value = o.cut || 4200;

    var peak = o.g == null ? 0.22 : o.g;
    var dur = o.dur || 0.12;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + (o.atk || 0.006));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(f); f.connect(g); g.connect(o._music ? bgmBus : seBus);
    osc.start(t); osc.stop(t + dur + 0.02);
  }

  function noise(o) {
    if (!state.se) return;
    build(); if (!ctx) return;
    var dur = o.dur || 0.12, t = ctx.currentTime;
    var buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    var src = ctx.createBufferSource(); src.buffer = buf;
    var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = o.f || 900; f.Q.value = 0.8;
    var g = ctx.createGain(); g.gain.value = o.g == null ? 0.12 : o.g;
    src.connect(f); f.connect(g); g.connect(seBus);
    src.start(t);
  }

  /* ---------- the palette ----------
     Wooden, quiet, under 200 ms. Nothing here is a cartoon boing:
     the app is grey paper and one yellow line, and it should sound like it. */
  var PENT = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28];  // major pentatonic, three octaves
  var BASE = 60;                                                // C4

  var KLANG = {
    /* Correct. Pitch climbs one pentatonic degree per combo step, so a good
       run literally plays a rising melody — the reward is musical, not louder. */
    ok: function (combo) {
      var i = Math.min(PENT.length - 1, Math.max(0, (combo || 1) - 1));
      var n = BASE + PENT[i];
      tone({ f: midi(n), dur: 0.11, g: 0.20, type: 'triangle', cut: 5000 });
      tone({ f: midi(n + 7), dur: 0.16, g: 0.10, at: 0.045, type: 'sine' });
    },

    /* Wrong. A soft low knock. It must never sting — this app recycles
       misses on purpose, so a miss is information, not a punishment. */
    no: function () {
      tone({ f: midi(48), f2: midi(43), dur: 0.17, g: 0.16, type: 'sine', cut: 700 });
      noise({ f: 320, g: 0.05, dur: 0.07 });
    },

    /* Combo milestone (5, 10, 15…): a quick three-note flourish. */
    combo: function (n) {
      var r = BASE + 12 + (n >= 20 ? 4 : n >= 10 ? 2 : 0);
      [0, 4, 7].forEach(function (s, i) {
        tone({ f: midi(r + s), dur: 0.16, g: 0.15, at: i * 0.055, type: 'triangle' });
      });
    },

    level: function () {                       // Stufe up — a fifth, then the octave
      [0, 7, 12, 19].forEach(function (s, i) {
        tone({ f: midi(BASE + s), dur: 0.34, g: 0.16, at: i * 0.085, type: 'triangle', cut: 3800 });
      });
    },

    badge: function () {                       // shimmer: three detuned high sines
      [0, 5, 9].forEach(function (s, i) {
        tone({ f: midi(BASE + 24 + s), dur: 0.5, g: 0.09, at: i * 0.07, type: 'sine', detune: i * 7 });
      });
    },

    /* Session end. The chord bends with the score, so 90 % and 40 % feel
       different without a single word of judgement. */
    end: function (pct) {
      var maj = pct >= 70, third = maj ? 4 : 3;
      [0, third, 7, 12].forEach(function (s, i) {
        tone({ f: midi(BASE - 5 + s), dur: 0.7, g: 0.13, at: i * 0.09, type: 'triangle', cut: 3200 });
      });
    },

    tick: function () { tone({ f: midi(BASE + 12), dur: 0.05, g: 0.07, type: 'sine' }); },
    hint: function () { tone({ f: midi(BASE + 2), f2: midi(BASE + 9), dur: 0.14, g: 0.10, type: 'sine' }); },

    /* ---------- ambient music ----------
       Generative, so it never loops and never bores: a slow pad plus sparse
       pentatonic drops. Zero bytes on the wire, and it can play forever. */
    bgmOn: function () { state.bgm = true; ls.set(K_BGM, true); wake(); fade(bgmBus, 0.55, 2.5); startBgmLoop(); paint(); },
    bgmOff: function () { state.bgm = false; ls.set(K_BGM, false); fade(bgmBus, 0, 1.6); setTimeout(stopBgmLoop, 1700); paint(); },
    seOn: function () { state.se = true; ls.set(K_SE, true); wake(); KLANG.tick(); paint(); },
    seOff: function () { state.se = false; ls.set(K_SE, false); paint(); },
    volume: function (v) { state.vol = v; ls.set(K_VOL, v); if (master) master.gain.value = v; },
    state: state,
    mountToggles: mountToggles
  };

  function fade(node, to, secs) {
    build(); if (!ctx || !node) return;
    var t = ctx.currentTime;
    node.gain.cancelScheduledValues(t);
    node.gain.setValueAtTime(Math.max(0.0001, node.gain.value), t);
    node.gain.linearRampToValueAtTime(to, t + secs);
  }

  var padVoices = [];
  function startBgmLoop() {
    build(); if (!ctx || bgmTimer) return;

    /* Two slow, detuned pads a fifth apart, swept by an LFO. */
    [BASE - 24, BASE - 17].forEach(function (n, i) {
      var osc = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      osc.type = 'sawtooth'; osc.frequency.value = midi(n); osc.detune.value = i ? 6 : -6;
      f.type = 'lowpass'; f.frequency.value = 320; f.Q.value = 3;
      g.gain.value = 0.06;
      var lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 0.03 + i * 0.017; lg.gain.value = 180;
      lfo.connect(lg); lg.connect(f.frequency);
      osc.connect(f); f.connect(g); g.connect(bgmBus);
      osc.start(); lfo.start();
      padVoices.push(osc, lfo);
    });

    /* A note every 2–6 s, from the same scale the correct-answer chime uses,
       so the effects always sound like they belong to the music. */
    (function drop() {
      var wait = 2000 + Math.random() * 4000;
      bgmTimer = setTimeout(function () {
        if (!state.bgm) return;
        var n = BASE + PENT[Math.floor(Math.random() * 8)] + (Math.random() < 0.3 ? 12 : 0);
        tone({ f: midi(n), dur: 1.6, g: 0.05, atk: 0.25, type: 'sine', cut: 2200, _music: true });
        drop();
      }, wait);
    })();
  }

  function stopBgmLoop() {
    clearTimeout(bgmTimer); bgmTimer = null;
    padVoices.forEach(function (v) { try { v.stop(); } catch (e) { } });
    padVoices = [];
  }

  /* ---------- the two chips in the header ---------- */
  function mountToggles(sel) {
    var slot = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!slot) return;
    slot.innerHTML =
      '<button class="chip" id="tgSe" aria-pressed="' + state.se + '" title="Effekte">♪</button>' +
      '<button class="chip" id="tgBgm" aria-pressed="' + state.bgm + '" title="Musik">≋</button>';
    slot.querySelector('#tgSe').onclick = function () { state.se ? KLANG.seOff() : KLANG.seOn(); };
    slot.querySelector('#tgBgm').onclick = function () { state.bgm ? KLANG.bgmOff() : KLANG.bgmOn(); };
    paint();
  }

  function paint() {
    var a = document.getElementById('tgSe'), b = document.getElementById('tgBgm');
    if (a) { a.setAttribute('aria-pressed', state.se); a.style.opacity = state.se ? 1 : .45; }
    if (b) { b.setAttribute('aria-pressed', state.bgm); b.style.opacity = state.bgm ? 1 : .45; }
  }

  root.KLANG = KLANG;
})(window);
