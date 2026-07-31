#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_app.py — the road, from source
====================================
One step, one source of truth. The lexicon .txt files and the manifest below
are the inputs; paket.html and the hub's ROUTE are the outputs.

    python3 build_app.py --src out --lex lex

The .txt files are NOT deployed. Every word list ends up inline in paket.html,
which is what lets the app run with no network and no service worker. The .txt
files are what you edit; the HTML is what you upload.

What it enforces, because each of these has broken the app at least once:

  · dedup on (lemma, pos) across ALL provinces, in road order — two provinces
    sharing an entry would share one SRS record and neither would ever reach
    the total it displays
  · the lexicon is validated before anything is written, so a malformed line
    fails the build instead of becoming a silently dead drill
  · ROUTE is regenerated with real totals, so a province cannot ship
    unreachable or advertising a word count it does not have
  · PROVINZ is checked in every file that carries a copy — it lives in two,
    and a province missing from one appears in the realm but not on the map
  · FRAMES and EXS are stored once rather than once per province
"""
import argparse, os, re, shutil, sys, datetime
from collections import Counter

ap = argparse.ArgumentParser()
ap.add_argument('--src', default='out')
ap.add_argument('--lex', default='lex')
ap.add_argument('--no-backup', action='store_true',
                help='skip the .bak file (implied when --src is inside a git repo)')
A = ap.parse_args()

# ---------- the road ----------
#  id  order  land        her           post-exam  arrival line (de | en)
ROAD = [
 # The number is road position, not identity. The ids stay p1..p8 for ever, so
 # reordering never touches a scheduling record — it only changes who gets the
 # hours first, and the budget is handed out in this order.
 #
 # Ordered by what a C2 paper actually rewards. Markt leads because
 # argumentative vocabulary is what Schreiben and Sprechen are graded on.
 # Wurzel sits second, not first: it is the largest province and the least
 # C2-relevant, but gaps there hurt more than anywhere else, and placement
 # makes the parts you already know cheap. Schmiede alone is flagged for
 # afterwards — prefix families are precision, and precision is polish.
 ('p2', 1, 'Markt',    'Berenike',  False,
  'Alles hat einen Preis. Wörter auch — du zahlst mit Wiederholung.|Everything has a price. Words too — you pay in repetition.'),
 ('p1', 2, 'Wurzel',   'Adelheid',  False,
  'Hier fängt alles an. Nichts davon ist klein.|Everything starts here. None of it is small.'),
 ('p5', 3, 'Turm',     'Elisabeth', False,
  'Was aufgeschrieben ist, bleibt. Was nur gesagt wurde, muss man glauben.|What is written down stays. What was only spoken, you have to take on faith.'),
 ('p3', 4, 'Fluss',    'Cordula',   False,
  'Der Fluss trägt, was man ihm anvertraut. Nicht sofort, aber weit.|The river carries what you trust to it. Not at once, but far.'),
 ('p6', 5, 'Krone',    'Friederike', False,
  'Jedes Wort hier ist zweimal gedacht worden. Das hört man ihm an.|Every word here has been thought twice. You can hear it on them.'),
 ('p7', 6, 'Schenke',  'Gundula',   False,
  'Red wie die Leute reden. Sonst versteht dich hier keiner.|Talk the way people talk. Otherwise nobody in here follows you.'),
 ('p4', 7, 'Hügel',    'Dorothea',  False,
  'Von hier siehst du, wo du warst. Bleib nicht stehen, sonst wird es kalt.|From up here you see where you have been. Do not stand still, it gets cold.'),
 ('p8', 8, 'Schmiede', 'Henriette', True,
  'Dieselbe Wurzel, ein anderer Schlag, ein anderes Wort.|The same root, a different strike, a different word.'),
]

def read(p):
    return open(p, encoding='utf-8').read()

# ---------- validate + dedup, in road order ----------
taken, provinces, problems = {}, [], []
for pid, order, land, her, nachher, spruch in ROAD:
    f = os.path.join(A.lex, 'lexicon-%s.txt' % pid)
    if not os.path.exists(f):
        print('  missing %s — nothing written' % f); sys.exit(1)
    kept, dropped, dupes = [], [], []
    seen = set()
    for n, l in enumerate(read(f).strip().split('\n'), 1):
        if not l.strip(): continue
        p = l.split('|')
        if len(p) != 5:
            problems.append((pid, n, '%d fields, need 5' % len(p), l[:44])); continue
        de, en, pos, x, topic = p
        fl = x.split(';')
        if pos == 'n' and (len(fl) != 2 or fl[0] not in ('m', 'f', 'n') or not fl[1]):
            problems.append((pid, n, 'noun needs gender;plural', l[:44])); continue
        if pos == 'v' and (len(fl) != 6 or fl[0] not in ('h', 's')):
            problems.append((pid, n, 'verb needs aux;pii;pra;p3;k2;sep', l[:44])); continue
        if pos == 'adj' and len(fl) != 2:
            problems.append((pid, n, 'adj needs comp;sup', l[:44])); continue
        if pos == 'prep' and x not in ('Dat', 'Akk', 'Gen', 'Dat/Akk'):
            problems.append((pid, n, 'prep case', l[:44])); continue
        if pos == 'conj' and x not in ('coord', 'sub'):
            problems.append((pid, n, 'conj type', l[:44])); continue
        bad = [t for t in ('`', '${', '\\') if t in l]
        if bad:
            problems.append((pid, n, 'would break a template literal: %r' % bad[0], l[:44])); continue
        k = (de, pos)
        if k in taken: dropped.append('%s~%s(%s)' % (de, pos, taken[k])); continue
        if k in seen: dupes.append('%s~%s' % (de, pos)); continue
        seen.add(k); taken[k] = pid; kept.append(l)
    de_s, en_s = spruch.split('|', 1)
    provinces.append(dict(id=pid, order=order, land=land, her=her, nachher=nachher,
                          de=de_s, en=en_s, lines=kept, dropped=dropped, dupes=dupes))

if problems:
    print('  %d malformed line(s) — nothing written:\n' % len(problems))
    for pid, n, why, txt in problems[:20]:
        print('   %s line %d: %s\n       %s' % (pid, n, why, txt))
    sys.exit(1)

# ---------- assemble ----------
q = lambda s: s.replace('\\', '\\\\').replace("'", "\\'")
entries = []
for d in provinces:
    entries.append(
        "  { id: '%s', order: %d, land: '%s', her: '%s', nachher: %s,\n"
        "    spruch: ['%s',\n             '%s'],\n    raw: `%s\n` }"
        % (d['id'], d['order'], q(d['land']), q(d['her']),
           'true' if d['nachher'] else 'false', q(d['de']), q(d['en']),
           '\n'.join(d['lines'])))

HEAD = """/* ============================================================
   0. THE ROAD
   ------------------------------------------------------------
   Every province in one file. Which one you are standing in
   comes from the query string — paket.html?p=p3 — and defaults
   to the first. Switching is an ordinary navigation, so the
   scheduler, the registry and every cache start clean for the
   new place exactly as they would have in a separate file.

   The word lists are inline rather than fetched on purpose:
   there is no service worker, so a request that fails with no
   signal would take the whole province down with it. A string
   in the document cannot fail.

   Generated by build_app.py from lex/lexicon-*.txt. Edit those,
   not this.
   ============================================================ */
const PAKETE = [
%s
];

const ORTWAHL = (function () {
  var q = '';
  try { q = new URLSearchParams(location.search).get('p') || ''; } catch (e) { q = ''; }
  q = String(q).replace(/^p?/, 'p');
  return PAKETE.find(function (p) { return p.id === q; }) || PAKETE[0];
})();

const PACK = { id: ORTWAHL.id, name: 'Paket ' + ORTWAHL.order + ' · ' + ORTWAHL.land,
               order: ORTWAHL.order };
if (ORTWAHL.nachher) PACK.nachher = true;
const ORT = { land: ORTWAHL.land, her: ORTWAHL.her, spruch: ORTWAHL.spruch };

const RAW = ORTWAHL.raw;""" % (',\n'.join(entries))

base = read(os.path.join(A.src, 'paket.html'))
i = base.index('/* ============================================================\n   0. THE ROAD')
j = base.index('const RAW = ORTWAHL.raw;') + len('const RAW = ORTWAHL.raw;')
H = base[:i] + HEAD + base[j:]

# FRAMES and EXS are shared by every province — store them once
for name, fn in (('FRAMES', 'frames.txt'), ('EXS', 'exs.txt')):
    body = read(os.path.join(A.lex, fn)).strip()
    H = re.sub(r'const %s = (?:ORTWAHL\.\w+;|`[\s\S]*?`;)' % name,
               'const %s = `%s\n`;' % (name, body), H, count=1)

out = os.path.join(A.src, 'paket.html')
# Git already keeps every previous version, and a .bak file in a Pages repo
# gets committed and then served. Only leave one behind when there is no repo.
in_git = any(os.path.isdir(os.path.join(A.src, *(['..'] * n + ['.git'])))
             for n in range(3))
if not (A.no_backup or in_git):
    shutil.copy2(out, out + '.bak-' + datetime.date.today().isoformat())
open(out, 'w', encoding='utf-8').write(H)

# ---------- the hub ----------
ip = os.path.join(A.src, 'index.html')
I = read(ip)
route = ',\n'.join(
    "  { id: '%s', file: 'paket.html?p=%s', name: 'Paket %d · %s', total: %d, order: %d, built: true }"
    % (d['id'], d['id'], d['order'], q(d['land']), len(d['lines']), d['order']) for d in provinces)
I = re.sub(r'const ROUTE = \[[\s\S]*?\n\];', 'const ROUTE = [\n%s\n];' % route, I, count=1)
open(ip, 'w', encoding='utf-8').write(I)

# ---------- PROVINZ, regenerated in road order ----------
# It lives in two files and used to be maintained by hand in both. The colours
# come from hof.js, which already had to know them for the court — one place,
# not three. `code` is the stage on the road, so it agrees with the Paket
# number instead of carrying a CEFR level that stopped being true the moment
# the road was reordered.
hof = read(os.path.join(A.src, 'hof.js'))
farbe = dict(re.findall(r"(p\d): \{\s*her: '[^']*', land: '[^']*', code: '[^']*', col: '(#[0-9A-Fa-f]{6})'", hof))
fehlt = [d['id'] for d in provinces if d['id'] not in farbe]

prov = ',\n'.join(
    "  { pack: '%s', code: '%d', land: '%s', col: '%s', her: '%s' }"
    % (d['id'], d['order'], q(d['land']), farbe.get(d['id'], '#888888'), q(d['her']))
    for d in provinces)
warn = ['hof.js has no colour for %s' % ','.join(fehlt)] if fehlt else []
for f in ('index.html', 'paket.html'):
    p = os.path.join(A.src, f)
    txt = read(p)
    if 'const PROVINZ = [' not in txt:
        warn.append('%s has no PROVINZ' % f); continue
    txt = re.sub(r'const PROVINZ = \[[\s\S]*?\n\];',
                 'const PROVINZ = [\n%s\n];' % prov, txt, count=1)
    open(p, 'w', encoding='utf-8').write(txt)

# ---------- report ----------
sk = {'n': 5, 'v': 5, 'adj': 4, 'prep': 4, 'conj': 3}
print('\n  paket.html  —  %d provinces, %d entries, %d SRS items\n'
      % (len(provinces), sum(len(d['lines']) for d in provinces),
         sum(sk.get(l.split('|')[2], 2) for d in provinces for l in d['lines'])))
for d in provinces:
    pos = Counter(l.split('|')[2] for l in d['lines'])
    print('   %s  Paket %d · %-9s %-11s %5d  %-26s %s'
          % (d['id'], d['order'], d['land'], d['her'], len(d['lines']),
             ' '.join('%s%d' % (k, v) for k, v in pos.most_common(4)),
             'wartet' if d['nachher'] else ''))
    if d['dropped']:
        print('        %d already on the road: %s' % (len(d['dropped']), ', '.join(d['dropped'][:6])))
    if d['dupes']:
        print('        %d internal duplicates: %s' % (len(d['dupes']), ', '.join(d['dupes'][:6])))
print('\n   %d unique lemma~pos across the whole road' % len(taken))
print('   ROUTE regenerated with real totals')
print('   PROVINZ regenerated in road order in both files, colours from hof.js')
for w in warn: print('   WARNING: %s' % w)
