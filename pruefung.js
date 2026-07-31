/* ============================================================================
   pruefung.js · Wortwerk · the deadline planner
   ============================================================================

   One planner for the whole route, not one per Paket. A Paket inherits it
   with a single script tag and one init call:

       <script src="pruefung.js"></script>
       ...
       Pruefung.init({ LEX, skillsFor, SRS, S, save, PACKS, PACK, today, DAY });

   WHY THIS IS NOT IN THE PAKET FILE
   ---------------------------------
   The arithmetic that matters is cross-pack. Carrying one item from cold to
   box 5 costs about fourteen answers, so a skill's price is (items x 14 x the
   seconds that drill actually takes). Sum that over 21,000 words and it is
   hundreds of hours — far more than any exam runway. Something has to be left
   out, and the only honest question is what.

   A per-file planner cannot answer it. Each Paket would price its own scope
   against the whole daily budget and every one of them would claim all of it:
   four packs at "30 minutes a day" is two hours a day. So the budget is a
   single pot, and packs draw from it in curated order — Kernwortschatz is
   solid before rare vocabulary is even introduced. A pack that finds the pot
   empty takes nothing and goes quiet, which the realm already knows how to
   draw: it sleeps.

   The rules are the same rules in every pack. Adjective endings do not need
   relearning because a new word list arrived. So the rule tier is claimed
   once, by whichever pack gets there first, and every later pack skips it.
   ========================================================================= */
(function () {
  'use strict';

  /* Measured against the real scheduler: the ladder gives +1 for a hit and
     -2 for a miss, so at ~85% accuracy each answer is worth about half a box
     and cold-to-solid runs to fourteen. */
  var REPS = 14;

  /* Ranked by what pays at C2. Recognition first — reading and listening are
     most of the paper, and recognition transfers to production far better
     than the reverse. Gender second because it is three seconds a question.
     Production third despite mattering enormously, because it costs more than
     everything else on this list put together; that is a fact about the
     budget, not a claim that it matters less. Reorder this array to argue. */
  var STUFEN = [
    { id: 'm',  sk: ['m'],  name: 'Erkennen',    desc: 'German → English, every word', sek: 5 },
    { id: 'g',  sk: ['g'],  name: 'Geschlecht',  desc: 'der/die/das on every noun',    sek: 3 },
    { id: 'p',  sk: ['p'],  name: 'Produzieren', desc: 'English → German, typed',      sek: 14 },
    { id: 'pl', sk: ['pl'], name: 'Plural',      desc: 'plural forms, typed',          sek: 12 },
    { id: 'pt', sk: ['pt'], name: 'Partizip',    desc: 'past participles',             sek: 12 },
    { id: 'r',  sk: ['pr', 'pa', 'wo', 'k', 'ad', 'cp', 'kj', 'c'],
      name: 'Regeln', desc: 'cases, endings, word order — sampled once', sek: 9, probe: 400, einmal: true }
  ];
  var REGEL = ['k', 'c', 'kj', 'cp', 'ad', 'pa', 'wo', 'pr', 'pa'];
  var LADDER = [0, 1, 2, 4, 8, 16, 30, 50, 75, 75];
  var VOLL = ['m', 'p', 'g', 'pl', 'pt', 'pr'];        // fallback when no plan runs

  var H = null;                                        // the host Paket
  /* caches keyed by pack — a module-level cache shared across Pakete would
     hand Paket 2 whatever Paket 1 computed, which is exactly the class of bug
     this file exists to prevent */
  var _probe = null, _probeVon = null, _rev = -1;
  /* Recomputing the scope asks what an item has been costing, and asking that
     means walking the items in scope — which is the thing being recomputed.
     Left unguarded that is a straight loop: minuten() bumps the revision, so
     skopus() always disagrees with the cache and calls umfangNeu() again.
     While a recomputation is in flight, scope answers with the last known
     good value, which is also the honest one: you measure what you have
     actually been drilling, not what you are about to switch to. */
  var _imUmfang = false;

  function cfg() {
    var S = H.S;
    var c = (S.pruef = S.pruef || {});
    if (!c.min) c.min = 30;
    if (!c.heute) c.heute = [0, 0];
    if (!c.skopus || typeof c.skopus !== 'object' || c.skopus instanceof Array) c.skopus = {};
    if (!c.rev) c.rev = 1;
    return c;
  }
  function tage() { return Math.max(0, cfg().tag - H.today()); }
  function laeuft() { var c = cfg(); return !!(c.on && c.tag > H.today()); }

  /* ---------- counting this pack ---------- */
  function zaehlung() {
    var z = {};
    H.LEX.forEach(function (w) {
      H.skillsFor(w).forEach(function (s) { z[s] = (z[s] || 0) + 1; });
    });
    return z;
  }

  /* ---------- the budget, shared ---------------------------------------------
     Seconds between now and the exam, minus what packs ahead of this one in
     the curated order have already claimed. Their claim persists in PACKS, so
     it survives being on another page — that is the whole point. */
  /* A pack marked post-exam draws nothing. Later Pakete can then exist and be
     browsed without quietly bidding for hours that Kernwortschatz needs. */
  function nachher() { return !!(H.PACK && H.PACK.nachher); }

  function topf() {
    if (nachher()) return 0;
    var c = cfg(), gesamt = c.min * 60 * Math.max(1, tage());
    var mein = H.PACK.order || 0;
    Object.keys(H.PACKS || {}).forEach(function (id) {
      var p = H.PACKS[id];
      if (id === H.PACK.id) return;
      if ((p.order || 0) >= mein) return;              // only packs ahead of us
      gesamt -= (p.kosten || 0);
    });
    return Math.max(0, gesamt);
  }

  /* ---------- what fits ---------- */
  /* The 14 is a starting assumption, not a fact about you. Once the plan has
     carried real items to solid it knows what they actually cost — placement
     means a learner who already reads German well may be paying five, not
     fourteen — and prices the remaining tiers on the measured figure. Falls
     back to the assumption until there is enough evidence to beat it. */
  function repsEff() {
    var c = cfg(), a = (c.antw || {})[H.PACK.id] || 0;
    if (a < 300) return REPS;
    var fest = 0, t = H.today();
    H.LEX.forEach(function (w) {
      H.skillsFor(w).forEach(function (s) {
        if (!imSkopus(w, s)) return;
        var r = H.S.sched[H.SRS.key(w.i, s)];
        if (r && r[0] >= 5) fest++;
      });
    });
    if (fest < 40) return REPS;
    return Math.max(3, Math.min(REPS, a / fest));
  }

  function stufenPlan(budget) {
    var c = cfg(), z = zaehlung(), reps = repsEff();
    var rest = budget, drin = [], raus = [];
    STUFEN.forEach(function (st) {
      /* a tier marked einmal belongs to whichever pack claimed it first */
      if (st.einmal && c.regeln && c.regeln !== H.PACK.id) return;
      var n = st.sk.reduce(function (a, s) { return a + (z[s] || 0); }, 0);
      if (!n) return;
      if (st.probe) n = Math.min(n, st.probe);
      var kosten = n * reps * st.sek;
      var e = { id: st.id, sk: st.sk, name: st.name, desc: st.desc, sek: st.sek,
                einmal: st.einmal, n: n, kosten: kosten, std: kosten / 3600 };
      if (kosten <= rest) { rest -= kosten; drin.push(e); } else raus.push(e);
    });
    /* second pass: a cheap tier must not be shut out merely because a costly
       one ranks above it. Produzieren is 63 hours; without this, buying it
       would silently cost the ten hours of Partizip still affordable. */
    for (var i = raus.length - 1; i >= 0; i--) {
      if (raus[i].kosten <= rest) { rest -= raus[i].kosten; drin.push(raus.splice(i, 1)[0]); }
    }
    var ord = STUFEN.map(function (s) { return s.id; });
    drin.sort(function (a, b) { return ord.indexOf(a.id) - ord.indexOf(b.id); });
    return { drin: drin, raus: raus, rest: rest, budget: budget };
  }

  /* Fixed the moment you choose, not recomputed nightly — a plan that quietly
     drops a skill in week nine is worse than no plan. Recomputes only when the
     budget changes, which bumps `rev`. */
  function umfangNeu() {
    if (_imUmfang) return null;
    _imUmfang = true;
    try { return umfangRechnen(); } finally { _imUmfang = false; }
  }
  function umfangRechnen() {
    var c = cfg(), pl = stufenPlan(topf()), sk = [];
    pl.drin.forEach(function (st) {
      if (st.einmal) c.regeln = H.PACK.id;
      st.sk.forEach(function (x) { if (sk.indexOf(x) < 0) sk.push(x); });
    });
    c.skopus[H.PACK.id] = sk;
    _probe = null; _probeVon = null;
    H.PACKS[H.PACK.id] = H.PACKS[H.PACK.id] || {};
    H.PACKS[H.PACK.id].kosten = pl.budget - pl.rest;   // what this pack claims
    H.PACKS[H.PACK.id].order = H.PACK.order;
    _rev = c.rev;
    return pl;
  }
  function skopus() {
    var c = cfg();
    if (!laeuft()) return VOLL;
    if (_imUmfang) return c.skopus[H.PACK.id] || VOLL;
    if (_rev !== c.rev || !c.skopus[H.PACK.id]) umfangNeu();
    return c.skopus[H.PACK.id] || ['m'];
  }

  /* ---------- the rule sample ----------------------------------------------
     Adjective endings are one rule, not 191 facts. So rule skills are drilled
     on a fixed, evenly spread sample — the same sample every session, so the
     SRS records keep meaning something — and only in the pack that owns them. */
  function regelProbe() {
    var c = cfg();
    if (_probe && _rev === c.rev && _probeVon === H.PACK.id) return _probe;
    _probe = new Set(); _probeVon = H.PACK.id;
    /* under a plan the rules belong to exactly one pack — the one that could
       afford them. If nobody bought the tier, nobody drills it. */
    if (laeuft() && c.regeln !== H.PACK.id) return _probe;
    var alle = [];
    H.LEX.forEach(function (w) {
      H.skillsFor(w).forEach(function (s) {
        if (REGEL.indexOf(s) >= 0) alle.push(w.i + ':' + s);
      });
    });
    var schritt = Math.max(1, Math.round(alle.length / 400));
    alle.forEach(function (k, n) { if (n % schritt === 0) _probe.add(k); });
    return _probe;
  }
  function imSkopus(w, s) {
    if (!laeuft()) return true;
    if (skopus().indexOf(s) < 0) return false;
    if (REGEL.indexOf(s) >= 0 && !regelProbe().has(w.i + ':' + s)) return false;
    return true;
  }

  /* ---------- pace ---------- */
  function tempo() { var c = cfg(); return c.cnt >= 20 ? Math.min(30, Math.max(3, c.sec / c.cnt)) : 9; }
  function kapazitaet() { return Math.max(10, Math.round(cfg().min * 60 / tempo())); }
  /* the sweep — first sight of everything — gets the front 40% of the runway;
     the rest is consolidation, which is where the boxes actually climb */
  function sweepRest() {
    var c = cfg(), t = H.today(), s = c.start || t;
    return Math.max(1, s + Math.round((c.tag - s) * 0.4) - t);
  }
  function kappe() { var c = cfg(); return c.tag ? c.tag - 3 : 0; }

  function plan() {
    var t = H.today(), c = cfg(), S = H.S;
    var offen = 0, faellig = 0, gesehen = 0, gesamt = 0, fest = 0;
    H.LEX.forEach(function (w) {
      H.skillsFor(w).forEach(function (s) {
        if (!imSkopus(w, s)) return;
        gesamt++;
        var r = S.sched[H.SRS.key(w.i, s)];
        if (!r) { offen++; return; }
        gesehen++;
        if (r[0] >= 5) fest++;
        if (r[1] <= t) faellig++;
      });
    });
    /* Reviews are not optional — they are the only reason any of it sticks —
       so they are served first out of the budget. New words take what is left,
       with a small floor so the sweep never stalls outright. */
    var kap = kapazitaet();
    var wunsch = Math.ceil(offen / sweepRest());
    var raum = Math.max(0, kap - faellig);
    var neu = Math.min(offen, wunsch, Math.max(raum, Math.round(kap * 0.12)));
    var getan = (c.heute[0] === t) ? c.heute[1] : 0;
    var ziel = neu + faellig;
    var span = Math.max(1, c.tag - (c.start || t));
    var durch = Math.min(1, (t - (c.start || t)) / Math.max(1, Math.round(span * 0.4)));
    /* Publish to the shared registry so the hub can total the day up without
       carrying a lexicon of its own. Stamped with the day, so a figure from
       yesterday can be shown as yesterday's rather than passed off as live. */
    if (H.PACKS) {
      H.PACKS[H.PACK.id] = H.PACKS[H.PACK.id] || {};
      H.PACKS[H.PACK.id].heute = { tag: t, ziel: ziel, getan: getan, rest: Math.max(0, ziel - getan) };
    }
    return {
      gesamt: gesamt, gesehen: gesehen, offen: offen, faellig: faellig, fest: fest,
      neu: neu, ziel: ziel, getan: getan, rest: Math.max(0, ziel - getan),
      kap: kap, knapp: neu < wunsch, wunsch: wunsch,
      fertig: neu > 0 ? Math.ceil(offen / neu) : Infinity,
      minuten: Math.max(1, Math.round(ziel * tempo() / 60)),
      lag: Math.round(gesamt * durch) - gesehen
    };
  }
  /* one round is about ten minutes, or whatever is left of the day */
  function laenge() {
    if (!laeuft()) return H.S.len;
    var runde = Math.max(10, Math.min(60, Math.round(600 / tempo())));
    var p = plan();
    return Math.max(10, Math.min(runde, p.rest || runde));
  }

  /* ---------- placement on first sight --------------------------------------
     Returns the box a brand-new item should land in, or 0 for "treat as new".
     Only ever consulted for items with no scheduling record, so it can never
     promote something you have already got wrong. */
  function einstufung(skill, sek, getippt) {
    if (!laeuft()) return 0;
    var soll = 6;
    STUFEN.forEach(function (st) { if (st.sk.indexOf(skill) >= 0) soll = st.sek; });
    if (sek > soll * 1.3) return 0;          // hesitated: knowing and retrieving are different
    return getippt ? 4 : 3;                  // typed cannot be guessed; choice can
  }

  /* ---------- recording ---------- */
  function zaehl(sek) {
    var c = cfg(), t = H.today();
    if (sek > 0.4 && sek < 90) {
      c.sec += sek; c.cnt++;
      if (c.cnt > 400) { c.sec *= 0.5; c.cnt *= 0.5; }
    }
    if (c.heute[0] !== t) c.heute = [t, 0];
    c.heute[1]++;
    c.antw = c.antw || {};
    c.antw[H.PACK.id] = (c.antw[H.PACK.id] || 0) + 1;
  }

  /* ---------- control ---------- */
  function setzen(iso) {
    var c = cfg(), t = H.today();
    var tag = Math.floor((new Date(iso + 'T12:00:00').getTime() - new Date().getTimezoneOffset() * 60000) / H.DAY);
    if (!tag || tag <= t) return false;
    c.tag = tag; c.on = 1; if (!c.start) c.start = t;
    c.rev++; c.regeln = c.regeln || '';
    umfangNeu();
    window.WW_SEASON_LEN = 1500;
    H.save(true); return true;
  }
  function aus() { var c = cfg(); c.on = 0; window.WW_SEASON_LEN = 200; H.save(true); }
  function minuten(m) { var c = cfg(); c.min = m; c.rev++; umfangNeu(); H.save(true); }

  /* ---------- the panel ---------- */
  function paint(body, dateEl, tog) {
    var c = cfg();
    if (c.tag && dateEl) {
      dateEl.value = new Date((c.tag * H.DAY) + new Date().getTimezoneOffset() * 60000)
        .toISOString().slice(0, 10);
    }
    if (!laeuft()) {
      tog.textContent = 'Plan starten'; tog.className = 'btn gruen';
      body.innerHTML = '<div style="font-size:16px"><b>Kein Tag eingetragen.</b> ' +
        'Der Weg läuft weiter, und die Stunden zählen nur sich selbst.' +
        '<s style="display:block;text-decoration:none;font-size:13px;color:var(--ink-40);margin-top:3px">' +
        'No day set. The road runs on, and the hours count only themselves.</s></div>';
      return;
    }
    var p = plan(), t = tage(), sk = skopus();
    var pct = Math.round(100 * p.gesehen / Math.max(1, p.gesamt));
    var kurs = p.lag <= 0 ? ['auf Kurs', 'var(--gruen,#2E7D32)']
                          : [p.lag + ' behind', 'var(--rot,#B3261E)'];
    var drin = STUFEN.filter(function (x) { return sk.indexOf(x.sk[0]) >= 0; });
    var raus = STUFEN.filter(function (x) { return sk.indexOf(x.sk[0]) < 0; });
    var andere = Object.keys(H.PACKS || {}).filter(function (id) {
      return id !== H.PACK.id && (H.PACKS[id].kosten || 0) > 0;
    }).length;

    tog.textContent = 'Plan beenden'; tog.className = 'btn ghost';
    body.innerHTML =
      '<div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:8px">' +
        '<b style="font-family:var(--disp);font-size:34px;line-height:1">' + t + '</b>' +
        '<span class="muted">' + (t === 1 ? 'Tag' : 'Tage') + ' bis zum Termin</span>' +
        '<span style="margin-left:auto;font-weight:700;color:' + kurs[1] + '">' + kurs[0] + '</span></div>' +
      '<div style="height:9px;background:var(--paper-2,#eee);margin:6px 0 4px">' +
        '<i style="display:block;height:100%;width:' + pct + '%;background:var(--gelb)"></i></div>' +
      '<div class="tiny" style="margin-bottom:12px">' + p.gesehen + ' / ' + p.gesamt +
        ' im Gepäck · ' + p.fest + ' fest · ' + p.offen + ' unbekannt' +
        (andere ? ' · teilt die Stunden mit ' + andere + ' Provinz' + (andere > 1 ? 's' : '') : '') +
      '</div>' +
      '<div class="grid4">' +
        '<div class="stat"><b>' + p.rest + '</b><s>heute offen</s></div>' +
        '<div class="stat"><b>' + Math.max(1, Math.round(p.rest * tempo() / 60)) + '</b><s>Minuten</s></div>' +
        '<div class="stat"><b>' + p.neu + '</b><s>neu</s></div>' +
        '<div class="stat"><b>' + p.faellig + '</b><s>fällig</s></div></div>' +
      '<p class="eyebrow" style="margin:14px 0 6px">Stunden am Tag · für den ganzen Weg</p>' +
      '<div class="row" id="pruefMin">' + [20, 30, 45, 60, 75].map(function (m) {
        return '<button class="btn ' + (c.min === m ? '' : 'ghost') + '" data-min="' + m +
               '" style="flex:1">' + m + '</button>';
      }).join('') + '</div>' +
      '<p class="tiny" style="margin:9px 0 0">' +
        Math.round(tempo()) + 's je Antwort, gemessen an deinen letzten ' + Math.min(400, c.cnt) + '. ' +
        '<b>Dabei:</b> ' + (drin.map(function (x) { return x.name; }).join(' · ') ||
          (nachher()
            ? 'nichts — diese Provinz liegt hinter dem Termin und wartet dort. ' +
              'Die Übungen laufen weiter; sie bietet nur nicht mit um Stunden, ' +
              'die die früheren Provinzen brauchen'
            : 'nichts — die Provinzen vor dieser halten die Stunden. So ist der Weg gelegt. ' +
          'Mehr Stunden holen sie herein, oder sie wartet bis nach dem Termin')) +
        (raus.length
          ? '. <b>Bleibt liegen:</b> ' + raus.map(function (x) {
              return x.name + (x.einmal && c.regeln && c.regeln !== H.PACK.id
                ? ' (owned by ' + c.regeln + ')' : ' (' + Math.round(x.std) + 'h)');
            }).join(' · ') + ' — mehr Stunden, mehr Gepäck.'
          : '. Alles passt.') +
        (p.rest === 0 ? ' <b>Für heute genug.</b>' : '') +
        (Math.abs(repsEff() - REPS) > 1
          ? '<br>Gemessen: <b>' + repsEff().toFixed(1) + '</b> Antworten je Wort statt angenommener ' +
            REPS + '. ' + (repsEff() < REPS
              ? 'Du trägst leichter als gedacht — tipp die Stunden neu an, dann kommt mehr ins Gepäck.'
              : 'Das kostet mehr als angenommen. Das Gepäck ist vielleicht zu voll.')
          : '') +
        (p.knapp ? '<br><b>Tight:</b> reviews are eating the budget, so new words are down to ' +
          p.neu + '/day. The sweep needs ' + p.fertig + ' more days and has ' + sweepRest() + '.' : '') +
      '</p>';
  }

  /* One rule for the season wheel, usable from a page with no lexicon. The
     hub and the grammar side-quest both render seasons from the same profile
     as the Pakete, so if they disagree about the pacing they show the same
     learner two different times of year. */
  function saison(S) {
    var c = (S || {}).pruef;
    var t = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
    window.WW_SEASON_LEN = (c && c.on && c.tag > t) ? 1500 : 200;
    return window.WW_SEASON_LEN;
  }

  /* Readable from any page, including ones with no word list — the hub and
     the grammar side-quest both need the deadline without owning a lexicon.
     Pure function of the stored state; needs no init(). */
  function uebersicht(S, PACKS, heute) {
    var c = (S || {}).pruef;
    if (!c || !c.on || !c.tag || c.tag <= heute) return null;
    var zeilen = [], offenGesamt = 0, frisch = 0, veraltet = 0;
    Object.keys(PACKS || {}).forEach(function (id) {
      var p = PACKS[id] || {}, h = p.heute;
      /* a pack the budget cannot reach has no daily figure and never will —
         still worth listing, so its silence is explained rather than blank */
      if (!h) {
        if (p.kosten === 0) zeilen.push({ id: id, aktuell: false, rest: null, ziel: 0, kosten: 0 });
        return;
      }
      var aktuell = h.tag === heute;
      if (aktuell) { offenGesamt += h.rest; if (h.rest > 0) frisch++; } else veraltet++;
      zeilen.push({ id: id, aktuell: aktuell, rest: aktuell ? h.rest : null,
                    ziel: h.ziel, kosten: p.kosten || 0 });
    });
    zeilen.sort(function (a, b) { return (b.rest || 0) - (a.rest || 0); });
    return { tage: c.tag - heute, min: c.min || 30, zeilen: zeilen,
             rest: offenGesamt, offen: frisch, veraltet: veraltet };
  }

  window.Pruefung = {
    init: function (host) { H = host; if (laeuft()) window.WW_SEASON_LEN = 1500; return this; },
    on: laeuft, tage: tage, tempo: tempo, laenge: laenge, kapazitaet: kapazitaet,
    ladder: function () { return laeuft() ? LADDER : null; },
    kappe: function () { return laeuft() ? kappe() : 0; },
    skopus: skopus, imSkopus: imSkopus, regelProbe: regelProbe, sweepRest: sweepRest,
    plan: plan, zaehl: zaehl, setzen: setzen, aus: aus, minuten: minuten,
    einstufung: einstufung, nachher: nachher, repsEff: repsEff,
    umfangNeu: umfangNeu, stufenPlan: stufenPlan, topf: topf, paint: paint,
    uebersicht: uebersicht, saison: saison,
    STUFEN: STUFEN, REGEL: REGEL, REPS: REPS
  };
})();
