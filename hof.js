/* ============================================================
   WORTWERK — DER HOF
   The court: who the six princesses are, what they say, and the
   window they say it in. Plus the day's work (Tagwerk) and the
   letter box (Die Post) that keeps everything they ever said.

   Same rules as the rest of the app: no network, no files, no
   ads, no dependencies. One line in any page and it is there:

       <script src="hof.js"></script>

   Nothing in this file writes to storage or reads the scheduler.
   It is a book of people and a window to show them in; the host
   page decides when to open it and what it costs. That keeps the
   rule the realm has always had — progress draws the world, the
   world never hands out progress.
   ============================================================ */
(function () {
  'use strict';
  if (window.Hof) return;                         // load once, even if included twice

  var STILL = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     1. THE SIX — one voice each, and they are not interchangeable.

     Every princess speaks at the level of her own province: Adelheid
     lives in the A1 pack and says short, plain things; Elisabeth
     lives at C1 and cannot help herself. So the letters are always
     readable exactly where you are standing.
     ============================================================ */
  var PERSON = {
    p1: {
      her: 'Adelheid', land: 'Wurzel', code: 'A1', col: '#6A4CE0',
      art: 'ruhig, gerade, geduldig', artEn: 'calm, plain-spoken, patient',
      ruf: {
        gut: [['Weiter so.', 'Keep going.'], ['Das sitzt.', 'That one sticks.'], ['Gut.', 'Good.']],
        mies: [['Nicht schlimm.', 'No harm done.'], ['Atme kurz.', 'Take a breath.'], ['Weiter.', 'Onwards.']],
        ende: [['Fast fertig.', 'Almost done.'], ['Letztes Stück.', 'Last bit.']]
      }
    },
    p2: {
      her: 'Berenike', land: 'Markt', code: 'A2', col: '#0A5FCE',
      art: 'schnell, spöttisch, rechnet immer mit', artEn: 'quick, teasing, always counting',
      ruf: {
        gut: [['Zehn zu null!', 'Ten to nothing!'], ['Guter Preis.', 'Good price.'], ['Weiter, weiter.', 'On you go.']],
        mies: [['Passiert.', 'Happens.'], ['Nächstes Angebot.', 'Next offer.'], ['Nicht schlimm, weiter.', 'Never mind, on.']],
        ende: [['Gleich Feierabend.', 'Nearly closing time.'], ['Letzte Runde!', 'Last round!']]
      }
    },
    p3: {
      her: 'Cordula', land: 'Fluss', code: 'B1', col: '#1F9E63',
      art: 'verträumt, weich, ein bisschen wehmütig', artEn: 'dreamy, gentle, faintly wistful',
      ruf: {
        gut: [['Es fließt.', 'It flows.'], ['Schön.', 'Lovely.'], ['Ja, so.', 'Yes, like that.']],
        mies: [['Das trägt vorbei.', 'That drifts past.'], ['Lass es ziehen.', 'Let it pass.'], ['Nicht festhalten.', 'Don\u2019t hold on.']],
        ende: [['Gleich am Ufer.', 'Nearly at the bank.'], ['Das letzte Stück.', 'The last stretch.']]
      }
    },
    p4: {
      her: 'Dorothea', land: 'Hügel', code: 'B2', col: '#29A3E0',
      art: 'unruhig, sportlich, ungeduldig freundlich', artEn: 'restless, athletic, impatiently kind',
      ruf: {
        gut: [['Tempo!', 'Pace!'], ['Bergauf, gut!', 'Uphill, good!'], ['Nicht stehen bleiben!', 'Don\u2019t stop!']],
        mies: [['Aufstehen, weiter.', 'Up you get.'], ['Einmal ausrutschen ist kein Sturz.', 'One slip is not a fall.'], ['Nochmal.', 'Again.']],
        ende: [['Der Gipfel!', 'The summit!'], ['Letzte Stufe!', 'Last step!']]
      }
    },
    p5: {
      her: 'Elisabeth', land: 'Turm', code: 'C1', col: '#E8A200',
      art: 'gelehrt, genau, insgeheim einsam', artEn: 'bookish, precise, secretly lonely',
      ruf: {
        gut: [['Korrekt.', 'Correct.'], ['Bemerkenswert.', 'Remarkable.'], ['Genau so.', 'Precisely so.']],
        mies: [['Ein Irrtum ist eine Fußnote.', 'An error is a footnote.'], ['Revidiere und weiter.', 'Revise and continue.'], ['Notiert.', 'Noted.']],
        ende: [['Das letzte Kapitel.', 'The last chapter.'], ['Beinahe vollständig.', 'Nearly complete.']]
      }
    },
    p6: {
      her: 'Friederike', land: 'Krone', code: 'C2', col: '#CE3B2B',
      art: 'königlich, trocken, der Zeremonie müde', artEn: 'regal, dry, tired of ceremony',
      ruf: {
        gut: [['Wie es sich gehört.', 'As it should be.'], ['Angenommen.', 'Accepted.'], ['Weiter, mein Freund.', 'Onwards, my friend.']],
        mies: [['Auch Kronen verrutschen.', 'Crowns slip too.'], ['Ohne Zeremonie: weiter.', 'No ceremony: continue.'], ['Geschenkt.', 'Let it go.']],
        ende: [['Das Ende des Saals.', 'The end of the hall.'], ['Noch ein Schritt.', 'One more step.']]
      }
    },
    p7: {
      her: 'Gundula', land: 'Schenke', code: 'C2', col: '#B5651D',
      art: 'laut, schnell, nicht zu beeindrucken', artEn: 'loud, quick, hard to impress',
      ruf: {
        gut: [['Sitzt.', 'That sticks.'], ['Na also.', 'There you go.'], ['Geht doch!', 'See, you can!']],
        mies: [['Halb so wild.', 'Not the end of the world.'], ['Trink einen Schluck.', 'Have a sip.'], ['Nächste Runde.', 'Next round.']],
        ende: [['Letzte Runde.', 'Last round.'], ['Gleich Feierabend.', 'Nearly closing time.']]
      }
    },
    p8: {
      her: 'Henriette', land: 'Schmiede', code: 'C2', col: '#5D6D7E',
      art: 'geduldig, genau im Maß, laut bei der Arbeit', artEn: 'patient, exact in her measures, loud at work',
      ruf: {
        gut: [['Hält.', 'That holds.'], ['Sauber geschweißt.', 'Cleanly welded.'], ['Das trägt.', 'That will bear weight.']],
        mies: [['Nochmal ins Feuer.', 'Back in the fire.'], ['Zu kalt geschlagen.', 'Struck it too cold.'], ['Weiter.', 'Carry on.']],
        ende: [['Das Feuer geht aus.', 'The fire is going out.'], ['Ein Schlag noch.', 'One more strike.']]
      }
    }
  };

  /* ============================================================
     2. SZENEN — the windows.

     typ    szene     a moment in her life, seen from outside
            gespraech she speaks to you
            frage     she asks you something and remembers the answer
            gabe      she gives you something (the host pays the Sterne)

     wann   which moments this one is allowed to appear in:
            erst      the very first finished run, ever
            tag       the first run of a new day
            ende      after any finished run
            wach      she has just woken up
            wachstum  her province just grew a stage
            nacht     the real clock says it is late
            kalt/warm the wheel of the year is in winter / summer
            (absent)  any of the above

     ab     the Vertrauen she needs before she will say it. Vertrauen
            is one per day you finish a run with her — never per
            answer — so the story can only unfold at the speed of a
            habit, and cannot be bought or binged.

     laune  only after a good run (gut) or a rough one (mies).
     ============================================================ */
  var SZENEN = [
    /* ---------------- Adelheid · A1 · Wurzel ---------------- */
    {
      id: 'ade-hallo', pack: 'p1', typ: 'gespraech', wann: 'erst', ab: 0,
      de: 'Du bist also da. Gut. Ich heiße Adelheid.\n\nDas Land hier ist alt und der Boden ist gut. Wörter wachsen langsam. Aber sie wachsen.',
      en: 'So you are here. Good. My name is Adelheid.\n\nThis land is old and the soil is good. Words grow slowly. But they grow.'
    },
    {
      id: 'ade-morgen', pack: 'p1', typ: 'szene', wann: 'tag', ab: 0,
      de: 'Adelheid steht früh am Feld. Der Boden ist noch kalt. Sie legt die Hand darauf und wartet.\n\nDann nickt sie. «Heute geht es.»',
      en: 'Adelheid is out at the field early. The ground is still cold. She lays a hand on it and waits.\n\nThen she nods. "Today will do."'
    },
    {
      id: 'ade-brot', pack: 'p1', typ: 'szene', wann: 'ende', ab: 1,
      de: 'In der Küche liegt Brot auf dem Tisch. Es ist noch warm. Adelheid schneidet zwei Stücke und legt eins auf die andere Seite.\n\n«Für später», sagt sie. Sie sagt nicht, für wen.',
      en: 'There is bread on the kitchen table, still warm. Adelheid cuts two slices and sets one down on the other side of the table.\n\n"For later," she says. She does not say for whom.'
    },
    {
      id: 'ade-regen', pack: 'p1', typ: 'szene', wann: 'ende', ab: 1,
      de: 'Es regnet seit dem Morgen. Adelheid sitzt in der Tür und schaut zu.\n\n«Regen ist keine Pause», sagt sie. «Regen ist Arbeit, die ich nicht machen muss.»',
      en: 'It has been raining since morning. Adelheid sits in the doorway and watches.\n\n"Rain is not a break," she says. "Rain is work I do not have to do."'
    },
    {
      id: 'ade-katze', pack: 'p1', typ: 'szene', ab: 2,
      de: 'Eine graue Katze schläft im Korb neben dem Ofen. Adelheid geht leise an ihr vorbei.\n\n«Sie arbeitet nachts», sagt sie ernst. «Jeder hat seine Stunden.»',
      en: 'A grey cat is asleep in the basket by the stove. Adelheid walks past quietly.\n\n"She works nights," she says seriously. "Everyone has their hours."'
    },
    {
      id: 'ade-frage-warum', pack: 'p1', typ: 'frage', ab: 2,
      de: 'Sag mir etwas. Warum lernst du Deutsch?',
      en: 'Tell me something. Why are you learning German?',
      a: [
        {
          de: 'Weil ich muss.', en: 'Because I have to.',
          rDe: 'Auch gut. Müssen ist ein starker Motor. Pass nur auf, dass er nicht der einzige bleibt.',
          rEn: 'That works too. Necessity is a strong engine. Just take care it does not stay the only one.'
        },
        {
          de: 'Weil ich will.', en: 'Because I want to.',
          rDe: 'Dann bleibst du länger. Wer will, hört nicht am Ende auf, sondern wenn es genug ist.',
          rEn: 'Then you will stay longer. People who want to do not stop at the end — they stop when it is enough.'
        },
        {
          de: 'Für jemanden.', en: 'For someone.',
          rDe: 'Das ist der beste Grund. Der hält auch an schlechten Tagen.',
          rEn: 'That is the best reason. That one holds on bad days too.'
        }
      ]
    },
    {
      id: 'ade-nacht', pack: 'p1', typ: 'szene', wann: 'nacht', ab: 1,
      de: 'Es ist spät. Adelheid stellt die Laterne vor die Tür, damit man den Weg findet.\n\n«Ich gehe gleich schlafen», sagt sie. «Aber das Licht bleibt an.»',
      en: 'It is late. Adelheid puts the lantern outside the door so the path can be found.\n\n"I am going to bed soon," she says. "But the light stays on."'
    },
    {
      id: 'ade-wach', pack: 'p1', typ: 'gespraech', wann: 'wach', ab: 0,
      de: 'Du warst lange weg. Ich habe nicht gezählt, wie lange.\n\nDoch. Ich habe.\n\nSetz dich. Es ist nichts kaputt. Alles liegt noch da, wo du es gelassen hast.',
      en: 'You were away a long time. I did not count how long.\n\nYes I did.\n\nSit down. Nothing is broken. Everything is still where you left it.'
    },
    {
      id: 'ade-wachstum', pack: 'p1', typ: 'szene', wann: 'wachstum', ab: 0,
      de: 'Adelheid steht am Zaun und sieht über ihr Land. Es ist größer geworden.\n\nSie sagt nichts dazu. Aber sie bleibt lange stehen.',
      en: 'Adelheid stands at the fence and looks out over her land. It has grown.\n\nShe says nothing about it. But she stands there a long time.'
    },
    {
      id: 'ade-winter', pack: 'p1', typ: 'szene', wann: 'kalt', ab: 1,
      de: 'Schnee liegt auf dem Feld.\n\n«Im Winter arbeitet der Boden allein», sagt Adelheid. «Er ruht nicht. Er ist nur still.»',
      en: 'Snow lies over the field.\n\n"In winter the soil works on its own," says Adelheid. "It is not resting. It is only quiet."'
    },
    {
      id: 'ade-sommer', pack: 'p1', typ: 'szene', wann: 'warm', ab: 1,
      de: 'Es ist heiß. Adelheid trinkt Wasser aus dem Krug und gibt dir auch etwas.\n\n«Trink», sagt sie. «Wer nicht trinkt, lernt nichts. Das ist keine Meinung, das ist Physik.»',
      en: 'It is hot. Adelheid drinks water from the jug and hands you some as well.\n\n"Drink," she says. "Nobody learns anything without drinking. That is not an opinion, it is physics."'
    },
    {
      id: 'ade-mies', pack: 'p1', typ: 'gespraech', wann: 'ende', laune: 'mies', ab: 1,
      de: 'Heute war schwer. Ich sehe es.\n\nWeißt du, was ich mache, wenn ein Feld nichts gibt? Ich gehe nach Hause und komme morgen wieder.\n\nDas Feld läuft nicht weg.',
      en: 'Today was hard. I can see it.\n\nDo you know what I do when a field gives nothing? I go home and come back tomorrow.\n\nThe field does not run away.'
    },
    {
      id: 'ade-gut', pack: 'p1', typ: 'gespraech', wann: 'ende', laune: 'gut', ab: 1,
      de: 'So viel richtig.\n\nJa, ich habe mitgezählt. Ich zähle immer mit.\n\nHeute war ein guter Tag für das Land.',
      en: 'So much right.\n\nYes, I was counting along. I always count along.\n\nToday was a good day for the land.'
    },
    {
      id: 'ade-wurzel', pack: 'p1', typ: 'gespraech', ab: 4,
      de: 'Wurzeln sieht man nicht. Man sieht nur, was oben steht.\n\nWenn du morgen ein Wort vergisst, ist es nicht weg. Es ist nur unten.\n\nDu gräbst es wieder aus. Das ist alles.',
      en: 'You never see roots. You only see what stands above.\n\nIf you forget a word tomorrow, it is not gone. It is just underneath.\n\nYou dig it up again. That is all.'
    },
    {
      id: 'ade-schatz', pack: 'p1', typ: 'gespraech', ab: 5,
      de: 'In jedem Feld liegt etwas. Ein Knopf, eine Münze, ein alter Nagel.\n\nMan findet es nicht, wenn man sucht. Man findet es beim Arbeiten.',
      en: 'There is something lying in every field. A button, a coin, an old nail.\n\nYou never find it by searching. You find it while working.'
    },
    {
      id: 'ade-gabe', pack: 'p1', typ: 'gabe', ab: 3, gabe: 2,
      de: 'Adelheid legt dir etwas Kleines in die Hand. Ein Stein aus dem Fluss, ganz glatt.\n\n«Ich habe ihn gefunden, als ich so alt war wie du. Nimm ihn. Er bringt kein Glück. Er ist nur schön.»',
      en: 'Adelheid puts something small in your hand. A stone from the river, quite smooth.\n\n"I found it when I was your age. Take it. It brings no luck. It is only beautiful."'
    },
    {
      id: 'ade-frage-bleiben', pack: 'p1', typ: 'frage', ab: 7,
      de: 'Darf ich dich etwas fragen?\n\nBleibst du bis zum Ende der Straße — oder gehst du irgendwann weiter?',
      en: 'May I ask you something?\n\nWill you stay to the end of the road — or will you move on at some point?',
      a: [
        {
          de: 'Ich bleibe.', en: 'I am staying.',
          rDe: 'Sag das nicht zu schnell. Aber ich schreibe es mir auf.',
          rEn: 'Do not say that too quickly. But I will write it down.'
        },
        {
          de: 'Ich weiß es nicht.', en: 'I do not know.',
          rDe: 'Ehrlich. Gut. Ehrliche Leute kommen öfter wieder als sichere.',
          rEn: 'Honest. Good. Honest people come back more often than certain ones.'
        }
      ]
    },
    {
      id: 'ade-still', pack: 'p1', typ: 'szene', ab: 9,
      de: 'Am Abend sitzt Adelheid auf der Bank vor dem Haus und macht nichts. Das ist selten.\n\n«Man muss auch mal sehen, was man gemacht hat», sagt sie. «Sonst arbeitet man nur.»',
      en: 'In the evening Adelheid sits on the bench in front of the house and does nothing. That is rare.\n\n"You have to look at what you have made sometimes," she says. "Otherwise you are only working."'
    },
    {
      id: 'ade-gabe2', pack: 'p1', typ: 'gabe', ab: 12, gabe: 3,
      de: 'Sie gibt dir einen Schlüssel. Er ist schwer und passt in kein Schloss, das du kennst.\n\n«Das Haus steht offen», sagt Adelheid. «Der Schlüssel ist nicht zum Aufschließen. Er ist zum Wiederkommen.»',
      en: 'She gives you a key. It is heavy and fits no lock you know.\n\n"The house is open anyway," says Adelheid. "The key is not for unlocking. It is for coming back."'
    },
    {
      id: 'ade-lang', pack: 'p1', typ: 'gespraech', ab: 20,
      de: 'Du kommst jetzt schon lange. Länger als die meisten.\n\nIch sage dir etwas, das ich nicht oft sage: Ich sehe jeden Tag nach, ob du da warst.\n\nDas ist alles. Geh weiter.',
      en: 'You have been coming for a long time now. Longer than most.\n\nI will tell you something I do not often say: I check every day whether you were here.\n\nThat is all. Carry on.'
    },

    /* ---------------- Berenike · A2 · Markt ---------------- */
    {
      id: 'ber-hallo', pack: 'p2', typ: 'gespraech', wann: 'erst', ab: 0,
      de: 'Du bist neu, oder? Das sehe ich sofort. Keine Sorge, das sieht man nur zwei Wochen lang.\n\nIch bin Berenike. Ich handle mit allem außer mit Zeit. Die verkauft man nicht, die gibt man aus.',
      en: 'You are new, right? I can tell straight away. Don\u2019t worry, it only shows for two weeks.\n\nI am Berenike. I trade in everything except time. You don\u2019t sell that, you spend it.'
    },
    {
      id: 'ber-markt', pack: 'p2', typ: 'szene', wann: 'tag', ab: 0,
      de: 'Halb sieben. Berenike baut den Stand auf, noch bevor es hell ist, und schimpft dabei fröhlich über den Nachbarn, der immer zu breit steht.\n\nSie hat schon dreimal nachgerechnet. Es stimmt jedes Mal.',
      en: 'Half past six. Berenike sets up the stall before it is light, cheerfully complaining about the neighbour who always spreads out too far.\n\nShe has done the sums three times already. They come out right every time.'
    },
    {
      id: 'ber-zahl', pack: 'p2', typ: 'gespraech', ab: 3,
      de: 'Weißt du, was der Unterschied zwischen dir und den anderen ist? Die anderen sagen «viel». Du sagst «vierzig».\n\nWer zählt, betrügt sich nicht. Merk dir das, es ist gratis.',
      en: 'Do you know the difference between you and the others? The others say "a lot". You say "forty".\n\nPeople who count don\u2019t cheat themselves. Remember that, it\u2019s free.'
    },
    {
      id: 'ber-frage-preis', pack: 'p2', typ: 'frage', ab: 2,
      de: 'Kleines Spiel. Was ist teurer: ein Fehler oder eine Stunde?',
      en: 'A little game. Which costs more: a mistake or an hour?',
      a: [
        {
          de: 'Der Fehler.', en: 'The mistake.',
          rDe: 'Falsch, und du glaubst es mir nicht. Ein Fehler kostet einmal. Eine verlorene Stunde kostet jeden Tag ein bisschen mehr.',
          rEn: 'Wrong, and you won\u2019t believe me. A mistake costs once. A lost hour costs a little more every day.'
        },
        {
          de: 'Die Stunde.', en: 'The hour.',
          rDe: 'Ha! Du handelst schon wie ich. Ein Fehler ist billig, man bekommt sogar etwas dafür.',
          rEn: 'Ha! You trade like me already. A mistake is cheap — you even get something in return.'
        }
      ]
    },
    {
      id: 'ber-wach', pack: 'p2', typ: 'gespraech', wann: 'wach', ab: 0,
      de: 'Na endlich! Ich habe deinen Platz freigehalten. Zwei Wochen lang. Der Fischhändler wollte ihn haben.\n\nDu schuldest mir nichts. Aber ich erwähne es gern.',
      en: 'Finally! I kept your spot free. For two weeks. The fishmonger wanted it.\n\nYou owe me nothing. But I do like to mention it.'
    },
    {
      id: 'ber-gut', pack: 'p2', typ: 'gespraech', wann: 'ende', laune: 'gut', ab: 1,
      de: 'Also, ich habe mitgeschrieben — das mache ich immer — und das war heute ein sehr guter Schnitt.\n\nWenn du so weitermachst, kaufe ich dir den halben Markt ab.',
      en: 'Right, I kept a tally — I always do — and that was a very good margin today.\n\nCarry on like that and I\u2019ll buy half the market off you.'
    },
    {
      id: 'ber-mies', pack: 'p2', typ: 'gespraech', wann: 'ende', laune: 'mies', ab: 1,
      de: 'Schlechter Tag. Kommt vor. Weißt du, wie oft mir Obst kaputtgeht?\n\nMan wirft es weg und stellt am nächsten Morgen frisches hin. Man weint nicht über Äpfel.',
      en: 'Bad day. It happens. Do you know how much fruit goes off on me?\n\nYou throw it out and put fresh out the next morning. Nobody cries over apples.'
    },
    {
      id: 'ber-gabe', pack: 'p2', typ: 'gabe', ab: 4, gabe: 2,
      de: 'Hier. Nicht bezahlen, ich sehe das schon.\n\n«Das ist die kleine Waage von meiner Mutter. Sie wiegt nur bis hundert Gramm, aber die wiegt sie genau.»',
      en: 'Here. Don\u2019t pay, I can see you looking.\n\n"That\u2019s my mother\u2019s little scale. It only weighs up to a hundred grams — but those hundred it weighs exactly."'
    },

    /* ---------------- Cordula · B1 · Fluss ---------------- */
    {
      id: 'cor-hallo', pack: 'p3', typ: 'gespraech', wann: 'erst', ab: 0,
      de: 'Setz dich ans Ufer, wenn du magst. Ich bin Cordula.\n\nHier ist alles unterwegs: das Wasser, die Blätter, die Sätze. Nichts bleibt liegen. Das klingt traurig, ist es aber nicht.',
      en: 'Sit down on the bank if you like. I am Cordula.\n\nEverything here is on its way somewhere: the water, the leaves, the sentences. Nothing stays put. That sounds sad, but it isn\u2019t.'
    },
    {
      id: 'cor-fluss', pack: 'p3', typ: 'szene', wann: 'tag', ab: 0,
      de: 'Cordula sitzt mit den Füßen im Wasser und sieht den Strömungen zu, wie andere Leute Wolken zusehen.\n\n«Da unten liegen mehr Wörter als in jedem Buch», sagt sie. «Sie sind nur ein bisschen nass.»',
      en: 'Cordula sits with her feet in the water, watching the currents the way other people watch clouds.\n\n"There are more words down there than in any book," she says. "They are just a little wet."'
    },
    {
      id: 'cor-brief', pack: 'p3', typ: 'szene', ab: 3,
      de: 'Sie faltet ein Blatt Papier zu einem Boot und setzt es ins Wasser. Es dreht sich zweimal und treibt davon.\n\n«Ich schreibe immer denselben Satz drauf», sagt sie. «Irgendwann findet ihn schon jemand.»',
      en: 'She folds a sheet of paper into a boat and sets it on the water. It turns twice and drifts off.\n\n"I always write the same sentence on it," she says. "Sooner or later somebody will find it."'
    },
    {
      id: 'cor-frage-halten', pack: 'p3', typ: 'frage', ab: 2,
      de: 'Darf ich dich etwas fragen, das keine richtige Antwort hat?\n\nWürdest du lieber alles behalten, was du je gelernt hast — oder alles noch einmal neu entdecken dürfen?',
      en: 'May I ask you something with no correct answer?\n\nWould you rather keep everything you have ever learned — or be allowed to discover it all again for the first time?',
      a: [
        {
          de: 'Alles behalten.', en: 'Keep everything.',
          rDe: 'Du wärst sehr voll. Aber ich verstehe es. Vergessen tut weh, und das Wiederfinden dauert.',
          rEn: 'You would be very full. But I understand. Forgetting hurts, and finding again takes time.'
        },
        {
          de: 'Neu entdecken.', en: 'Discover it again.',
          rDe: 'Dann bist du wie der Fluss. Der kommt jeden Morgen an derselben Stelle an und ist trotzdem neu.',
          rEn: 'Then you are like the river. It arrives at the same spot every morning and is new all the same.'
        }
      ]
    },
    {
      id: 'cor-wach', pack: 'p3', typ: 'gespraech', wann: 'wach', ab: 0,
      de: 'Du warst weg. Ich habe dem Wasser zugesehen und die Tage nicht mitgezählt — das ist hier leicht.\n\nAber schön, dass du da bist. Wirklich.',
      en: 'You were gone. I watched the water and lost count of the days — that is easy here.\n\nBut it is good that you are here. Truly.'
    },
    {
      id: 'cor-gut', pack: 'p3', typ: 'gespraech', wann: 'ende', laune: 'gut', ab: 1,
      de: 'Hast du es gemerkt? Es ging heute ohne Anstrengung. So ist das, wenn man mit der Strömung schwimmt statt dagegen.\n\nMerk dir dieses Gefühl. Es kommt wieder, aber nicht auf Bestellung.',
      en: 'Did you notice? It went without effort today. That is how it is when you swim with the current instead of against it.\n\nRemember that feeling. It comes back — but not to order.'
    },
    {
      id: 'cor-mies', pack: 'p3', typ: 'gespraech', wann: 'ende', laune: 'mies', ab: 1,
      de: 'Heute war Gegenströmung. Das ist kein Fehler von dir, das ist nur die Richtung des Wassers.\n\nLeg dich auf den Rücken und lass dich tragen. Morgen dreht es wieder.',
      en: 'Today the current was against you. That is not a fault of yours, it is only the direction of the water.\n\nLie on your back and let it carry you. Tomorrow it turns again.'
    },
    {
      id: 'cor-nacht', pack: 'p3', typ: 'szene', wann: 'nacht', ab: 2,
      de: 'Nachts ist der Fluss schwarz und laut. Cordula sitzt trotzdem draußen, mit einer Decke um die Schultern.\n\n«Tagsüber sieht man ihn», sagt sie. «Nachts hört man ihn erst richtig.»',
      en: 'At night the river is black and loud. Cordula sits outside all the same, a blanket around her shoulders.\n\n"In the daytime you see it," she says. "At night is when you really hear it."'
    },

    /* ---------------- Dorothea · B2 · Hügel ---------------- */
    {
      id: 'dor-hallo', pack: 'p4', typ: 'gespraech', wann: 'erst', ab: 0,
      de: 'Oben! Komm hoch, hier ist die Aussicht besser. Ich bin Dorothea.\n\nWarnung vorweg: Ich rede gern beim Gehen. Wenn du stehen bleiben willst, sag es, sonst merke ich es nicht.',
      en: 'Up here! Come up, the view is better. I am Dorothea.\n\nFair warning: I like talking while walking. If you want to stop, say so — otherwise I won\u2019t notice.'
    },
    {
      id: 'dor-lauf', pack: 'p4', typ: 'szene', wann: 'tag', ab: 0,
      de: 'Sechs Uhr, und Dorothea ist schon zweimal den Hügel hoch. Nicht weil sie muss. Weil sie wissen wollte, ob sie es zweimal schafft.\n\nSie schafft es. Jetzt will sie wissen, ob dreimal geht.',
      en: 'Six in the morning, and Dorothea has already been up the hill twice. Not because she has to. Because she wanted to know whether she could do it twice.\n\nShe can. Now she wants to know about three times.'
    },
    {
      id: 'dor-frage-wett', pack: 'p4', typ: 'frage', ab: 2,
      de: 'Ehrliche Frage, keine Falle: Machst du das hier lieber allein oder gegen jemanden?',
      en: 'Honest question, no trap: do you rather do this alone, or against someone?',
      a: [
        {
          de: 'Allein.', en: 'Alone.',
          rDe: 'Vernünftig. Und langweilig. Aber vernünftig — du hörst wenigstens auf, wenn du müde bist.',
          rEn: 'Sensible. And boring. But sensible — at least you stop when you are tired.'
        },
        {
          de: 'Gegen jemanden.', en: 'Against someone.',
          rDe: 'Dann nehme ich den Posten. Ich bin schnell, aber ich lasse dich gewinnen, wenn du wirklich gut bist. Nicht vorher.',
          rEn: 'Then I\u2019ll take the post. I am fast, but I will let you win if you are actually good. Not before.'
        }
      ]
    },
    {
      id: 'dor-wach', pack: 'p4', typ: 'gespraech', wann: 'wach', ab: 0,
      de: 'Da bist du ja. Ich war jeden Tag oben und habe geguckt, ob unten jemand kommt.\n\nNicht gewartet. Geguckt. Das ist etwas anderes.',
      en: 'There you are. I went up every day and looked to see if anybody was coming.\n\nNot waiting. Looking. That is a different thing.'
    },
    {
      id: 'dor-gut', pack: 'p4', typ: 'gespraech', wann: 'ende', laune: 'gut', ab: 1,
      de: 'Das war schnell und sauber. Ich hasse es ein bisschen, wie gut das war.\n\nNein, Quatsch. Ich freue mich. Aber morgen bin ich wieder vorn.',
      en: 'That was fast and clean. I hate slightly how good that was.\n\nNo, rubbish. I am pleased. But tomorrow I am back in front.'
    },
    {
      id: 'dor-mies', pack: 'p4', typ: 'gespraech', wann: 'ende', laune: 'mies', ab: 1,
      de: 'Umgeknickt, hm? Passiert auf jedem Weg.\n\nAufstehen, Hose abklopfen, weitergehen. Wer sitzen bleibt, wird kalt — das ist am Berg das eigentliche Problem.',
      en: 'Turned an ankle, hm? Happens on every path.\n\nGet up, dust off, keep walking. People who sit down get cold — on a mountain that is the real problem.'
    },
    {
      id: 'dor-oben', pack: 'p4', typ: 'szene', ab: 5,
      de: 'Ganz oben steht ein Stein mit einer Zahl. Dorothea legt jedes Mal, wenn sie hochkommt, einen kleinen Kiesel dazu.\n\nEs sind sehr viele Kiesel. Sie zählt sie nie.',
      en: 'At the very top stands a stone with a number on it. Every time she gets up there Dorothea adds a small pebble.\n\nThere are a great many pebbles. She never counts them.'
    },
    {
      id: 'dor-gabe', pack: 'p4', typ: 'gabe', ab: 4, gabe: 2,
      de: 'Nimm den hier. Ein Kiesel vom Gipfel.\n\n«Der ist nichts wert und wiegt nichts. Aber du warst oben, und jetzt hast du einen Beweis.»',
      en: 'Take this one. A pebble from the summit.\n\n"It is worth nothing and weighs nothing. But you were up there, and now you have proof."'
    },

    /* ---------------- Elisabeth · C1 · Turm ---------------- */
    {
      id: 'eli-hallo', pack: 'p5', typ: 'gespraech', wann: 'erst', ab: 0,
      de: 'Bitte nicht die Tür zuschlagen, die Bögen liegen sortiert.\n\nElisabeth. Ich verwalte hier den gesamten schriftlichen Bestand, und ja, das ist genau so einsam, wie es klingt. Setzen Sie sich. Ich habe Tee.',
      en: 'Please do not slam the door, the sheets are in order.\n\nElisabeth. I administer the entire written holdings here, and yes, that is exactly as lonely as it sounds. Do sit. I have tea.'
    },
    {
      id: 'eli-ordnung', pack: 'p5', typ: 'szene', wann: 'tag', ab: 0,
      de: 'Elisabeth sortiert seit dem Morgengrauen um. Nicht weil Unordnung herrschte, sondern weil ihr eine bessere Ordnung eingefallen ist.\n\nDie alte war auch gut. Die neue ist besser. Das ist ein Unterschied, den sonst niemand bemerkt.',
      en: 'Elisabeth has been reordering since dawn. Not because there was disorder, but because a better order occurred to her.\n\nThe old one was fine. The new one is better. That is a distinction nobody else notices.'
    },
    {
      id: 'eli-frage-genau', pack: 'p5', typ: 'frage', ab: 2,
      de: 'Eine Frage, über die ich mit mir selbst nicht fertig werde:\n\nIst es schlimmer, etwas falsch zu sagen — oder gar nichts zu sagen?',
      en: 'A question I cannot settle with myself:\n\nIs it worse to say something wrongly — or to say nothing at all?',
      a: [
        {
          de: 'Falsch sagen.', en: 'To say it wrongly.',
          rDe: 'So habe ich vierzig Jahre gedacht. Es hat mich sehr korrekt und ziemlich still gemacht.',
          rEn: 'I thought so for forty years. It made me very correct and rather quiet.'
        },
        {
          de: 'Nichts sagen.', en: 'To say nothing.',
          rDe: 'Ja. Ja, vermutlich. Ein Fehler lässt sich verbessern, ein Schweigen bleibt einfach stehen.',
          rEn: 'Yes. Yes, presumably. An error can be corrected; a silence simply stands there.'
        }
      ]
    },
    {
      id: 'eli-wach', pack: 'p5', typ: 'gespraech', wann: 'wach', ab: 0,
      de: 'Sie waren fort. Ich habe die Zeit gemessen, das ist eine Berufskrankheit.\n\nIch habe in der Zwischenzeit alles zweimal gelesen, was ich schon kannte. Bitte kommen Sie öfter. Rein fachlich.',
      en: 'You were away. I measured the interval; an occupational disease.\n\nIn the meantime I reread everything I already knew, twice. Please come more often. Purely professionally.'
    },
    {
      id: 'eli-gut', pack: 'p5', typ: 'gespraech', wann: 'ende', laune: 'gut', ab: 1,
      de: 'Das war, und ich wäge das Wort ab, ausgezeichnet.\n\nIch verteile dieses Wort etwa dreimal im Jahr. Notieren Sie das Datum.',
      en: 'That was — and I weigh the word — excellent.\n\nI hand out that word roughly three times a year. Note down the date.'
    },
    {
      id: 'eli-mies', pack: 'p5', typ: 'gespraech', wann: 'ende', laune: 'mies', ab: 1,
      de: 'Nun. Eine schwache Runde ist ein Datenpunkt, kein Urteil.\n\nIch habe in diesem Turm mehr gestrichen als geschrieben. Das Buch ist trotzdem fertig geworden.',
      en: 'Well. A weak round is a data point, not a verdict.\n\nIn this tower I have crossed out more than I have written. The book was finished all the same.'
    },
    {
      id: 'eli-fenster', pack: 'p5', typ: 'szene', wann: 'nacht', ab: 3,
      de: 'Spät nachts steht Elisabeth am schmalen Fenster und sieht auf die Straße hinunter, auf der niemand geht.\n\nDann setzt sie sich wieder hin und arbeitet weiter. Die Kerze reicht noch.',
      en: 'Late at night Elisabeth stands at the narrow window and looks down at the road, where nobody is walking.\n\nThen she sits back down and works on. The candle will last.'
    },
    {
      id: 'eli-gabe', pack: 'p5', typ: 'gabe', ab: 5, gabe: 3,
      de: 'Nehmen Sie das. Es ist ein Lesezeichen aus Messing, mit einer eingeritzten Zeile.\n\n«Ich habe es zweimal. Das ist einmal zu viel für eine Person, die allein liest.»',
      en: 'Take this. A brass bookmark with a line scratched into it.\n\n"I have two. That is one too many for a person who reads alone."'
    },

    /* ---------------- Friederike · C2 · Krone ---------------- */
    {
      id: 'fri-hallo', pack: 'p6', typ: 'gespraech', wann: 'erst', ab: 0,
      de: 'Kein Knicks, bitte, dafür ist der Boden zu kalt. Friederike.\n\nMan hat mir beigebracht, jeden Satz zweimal zu denken, bevor ich ihn sage. Bei dir mache ich eine Ausnahme, sonst kommen wir nie voran.',
      en: 'No curtsey, please, the floor is too cold for it. Friederike.\n\nI was taught to think every sentence twice before saying it. With you I shall make an exception, or we will never get anywhere.'
    },
    {
      id: 'fri-krone', pack: 'p6', typ: 'szene', wann: 'tag', ab: 0,
      de: 'Die Krone liegt auf dem Frühstückstisch, zwischen der Butter und einem Stapel Papiere, die alle dringend sind.\n\nFriederike setzt sie erst auf, wenn jemand klopft. Vorher ist sie nur eine Frau, die zu wenig geschlafen hat.',
      en: 'The crown lies on the breakfast table, between the butter and a stack of papers that are all urgent.\n\nFriederike only puts it on when somebody knocks. Before that she is just a woman who has slept too little.'
    },
    {
      id: 'fri-frage-macht', pack: 'p6', typ: 'frage', ab: 2,
      de: 'Beantworte mir das, und lüge ruhig, ich merke es ohnehin:\n\nWürdest du lieber alles verstehen — oder alles sagen können?',
      en: 'Answer me this, and feel free to lie, I shall notice either way:\n\nWould you rather understand everything — or be able to say everything?',
      a: [
        {
          de: 'Alles verstehen.', en: 'Understand everything.',
          rDe: 'Die Antwort der Klugen. Sie führt zu einem sehr vollen Kopf und einem sehr stillen Raum.',
          rEn: 'The clever answer. It leads to a very full head and a very quiet room.'
        },
        {
          de: 'Alles sagen können.', en: 'Be able to say everything.',
          rDe: 'Die Antwort der Mutigen. Damit richtet man mehr an — im Guten wie im Schlechten. Ich mag sie lieber.',
          rEn: 'The brave answer. It causes more to happen — for good and ill. I prefer it.'
        }
      ]
    },
    {
      id: 'fri-wach', pack: 'p6', typ: 'gespraech', wann: 'wach', ab: 0,
      de: 'Zurück. Ich habe dich nicht vermisst, das wäre unter meiner Würde.\n\nIch habe lediglich bemerkt, dass der Saal größer wirkt, wenn niemand darin steht.',
      en: 'Back again. I did not miss you; that would be beneath my dignity.\n\nI merely observed that the hall looks larger when nobody is standing in it.'
    },
    {
      id: 'fri-gut', pack: 'p6', typ: 'gespraech', wann: 'ende', laune: 'gut', ab: 1,
      de: 'Sehr sauber. In diesem Haus wird für weniger geklatscht.\n\nIch klatsche nicht. Ich merke es mir, und das ist teurer.',
      en: 'Very clean. In this house people applaud for less.\n\nI do not applaud. I remember, and that is dearer.'
    },
    {
      id: 'fri-mies', pack: 'p6', typ: 'gespraech', wann: 'ende', laune: 'mies', ab: 1,
      de: 'Eine schlechte Runde. Wie interessant, dass du sie zu Ende gebracht hast.\n\nDas ist die Sorte Mut, die kein Publikum hat. Sie ist die einzige, die zählt.',
      en: 'A poor round. How interesting that you finished it.\n\nThat is the sort of courage that has no audience. It is the only sort that counts.'
    },
    {
      id: 'fri-last', pack: 'p6', typ: 'szene', ab: 6,
      de: 'Nachts geht Friederike den langen Saal ab und zählt die Bilder ihrer Vorgängerinnen. Es sind neunzehn.\n\nUnter dem letzten ist noch Platz für eines. Sie bleibt dort nie lange stehen.',
      en: 'At night Friederike walks the long hall and counts the portraits of the women who came before her. There are nineteen.\n\nBelow the last one there is room for one more. She never stands there long.'
    },
    {
      id: 'fri-gabe', pack: 'p6', typ: 'gabe', ab: 5, gabe: 3,
      de: 'Nimm den Ring. Nein, kein Schmuck — sieh hinein, da steht ein Wort.\n\n«Es ist kein besonderes Wort. Aber es steht innen, wo nur ich es sehe. Jetzt siehst du es auch.»',
      en: 'Take the ring. No, not jewellery — look inside, there is a word engraved.\n\n"It is not a special word. But it is on the inside, where only I can see it. Now you see it too."'
    },
    {
      id: 'gun-hallo', pack: 'p7', typ: 'gespraech', wann: 'erst', ab: 0,
      de: 'Setz dich, wo Platz ist, und red nicht so gestochen. Gundula.\n\nHier drin sagt keiner «nichtsdestotrotz». Wer das sagt, zahlt eine Runde.',
      en: 'Sit wherever there is room, and stop talking like a document. Gundula.\n\nNobody in here says "notwithstanding". Whoever does buys a round.'
    },
    {
      id: 'gun-abend', pack: 'p7', typ: 'szene', wann: 'tag', ab: 0,
      de: 'Sechs Uhr, und schon voll. Gundula zapft, hört vier Gespräche gleichzeitig und wirft in jedes genau ein Wort.\n\nJedes Mal lachen alle. Sie hat nichts davon vorbereitet.',
      en: 'Six o\u2019clock and already full. Gundula pulls pints, follows four conversations at once and drops exactly one word into each.\n\nEvery time, everyone laughs. She prepared none of it.'
    },
    {
      id: 'gun-nacht', pack: 'p7', typ: 'szene', wann: 'nacht', ab: 0,
      de: 'Nach Mitternacht wird es leise. Gundula wischt den Tresen, immer dieselbe Runde, und summt etwas Altes.\n\n«Tagsüber rede ich für zwölf. Nachts ist mir das Wischen lieber.»',
      en: 'After midnight it goes quiet. Gundula wipes the bar, the same circuit every time, humming something old.\n\n"In the daytime I talk for twelve. At night I would rather wipe."'
    },
    {
      id: 'gun-wach', pack: 'p7', typ: 'gespraech', wann: 'wach', ab: 0,
      de: 'Da bist du ja wieder. Ich hab schon gedacht, du bist zu fein geworden für uns.\n\nSetz dich. Und sag nicht «ich hätte da eine Frage». Frag einfach.',
      en: 'There you are. I was starting to think you had got too refined for us.\n\nSit down. And do not say "I would have a question". Just ask.'
    },
    {
      id: 'gun-frage', pack: 'p7', typ: 'frage', wann: 'tag', ab: 2,
      de: 'Sag mal ehrlich: Verstehst du, was hier geredet wird, oder nickst du nur?\n\nKeine Schande. Am Anfang nickt jeder.',
      en: 'Tell me honestly: do you follow what is said in here, or are you just nodding?\n\nNo shame in it. Everyone nods at the start.'
    },
    {
      id: 'gun-warm', pack: 'p7', typ: 'szene', wann: 'warm', ab: 2,
      de: 'Die Tür steht offen, die Tische stehen draußen. Gundula trägt sechs Gläser auf einmal und beschwert sich lautstark, dass niemand hilft.\n\nHilft ihr jemand, schickt sie ihn weg.',
      en: 'The door is propped open, the tables are outside. Gundula carries six glasses at once and complains loudly that nobody helps.\n\nWhen somebody does, she sends them away.'
    },
    {
      id: 'gun-kalt', pack: 'p7', typ: 'szene', wann: 'kalt', ab: 3,
      de: 'Draußen Matsch, drinnen beschlagene Scheiben. Am Ofen sitzen drei, die sich seit vierzig Jahren streiten.\n\n«Die kommen nicht wegen des Biers», sagt Gundula. «Die kommen wegen des Streits.»',
      en: 'Slush outside, misted windows inside. Three men sit by the stove who have been arguing for forty years.\n\n"They do not come for the beer," says Gundula. "They come for the argument."'
    },
    {
      id: 'gun-gabe', pack: 'p7', typ: 'gabe', ab: 5, gabe: 3,
      de: 'Der Deckel hier. Steht nichts drauf, aber er ist von meinem ersten Fass.\n\n«Behalt ihn. Wenn du je wieder anfängst, geschwollen zu reden, leg ihn dir hin.»',
      en: 'This beer mat. Nothing written on it, but it came off my first barrel.\n\n"Keep it. If you ever start talking pompously again, put it in front of you."'
    },
    {
      id: 'hen-hallo', pack: 'p8', typ: 'gespraech', wann: 'erst', ab: 0,
      de: 'Nicht zu nah, es spritzt. Henriette.\n\nDie Leute glauben, hier werde Neues gemacht. Wird es nicht. Hier wird Vorhandenes anders zusammengesetzt, und das ist schwerer.',
      en: 'Not too close, it spits. Henriette.\n\nPeople think new things get made here. They do not. Existing things get put together differently, and that is harder.'
    },
    {
      id: 'hen-werk', pack: 'p8', typ: 'szene', wann: 'tag', ab: 0,
      de: 'Sie legt dasselbe Stück viermal ins Feuer und schlägt jedes Mal woanders hin.\n\nVier Werkzeuge liegen am Ende auf der Bank. Das Eisen war immer dasselbe.',
      en: 'She puts the same piece into the fire four times and strikes it in a different place each time.\n\nFour tools end up on the bench. The iron was the same throughout.'
    },
    {
      id: 'hen-nacht', pack: 'p8', typ: 'szene', wann: 'nacht', ab: 0,
      de: 'Die Esse glüht noch, obwohl niemand mehr arbeitet. Henriette sitzt davor und sortiert Nägel nach Länge.\n\n«Das muss nicht sein. Aber morgen früh greife ich, ohne hinzusehen.»',
      en: 'The forge still glows though nobody is working. Henriette sits in front of it sorting nails by length.\n\n"It is not necessary. But tomorrow morning I will reach without looking."'
    },
    {
      id: 'hen-wach', pack: 'p8', typ: 'gespraech', wann: 'wach', ab: 0,
      de: 'Lange nicht gesehen. Das Eisen ist ausgekühlt, das macht nichts, es wird wieder heiß.\n\nNur nicht so tun, als wäre es nie kalt geworden. Damit fängt der Pfusch an.',
      en: 'Long time. The iron has gone cold; no matter, it will heat again.\n\nJust do not pretend it never cooled. That is where botched work begins.'
    },
    {
      id: 'hen-frage', pack: 'p8', typ: 'frage', wann: 'tag', ab: 2,
      de: 'Zwei Wörter, gleicher Stamm, eine Silbe Unterschied. Merkst du, dass sie nicht dasselbe meinen?\n\nWenn ja, bist du weiter als die meisten.',
      en: 'Two words, the same root, one syllable between them. Do you notice they do not mean the same thing?\n\nIf you do, you are further along than most.'
    },
    {
      id: 'hen-wachstum', pack: 'p8', typ: 'szene', wann: 'wachstum', ab: 2,
      de: 'Sie hält dein Wort gegen das Licht und dreht es langsam.\n\n«Vorne stimmt es. Hinten auch. In der Mitte hast du geraten.» Sie legt es zurück ins Feuer.',
      en: 'She holds your word up to the light and turns it slowly.\n\n"The front is right. The back too. In the middle you guessed." She puts it back in the fire.'
    },
    {
      id: 'hen-kalt', pack: 'p8', typ: 'szene', wann: 'kalt', ab: 3,
      de: 'Im Winter kommen alle zur Schmiede, angeblich wegen der Werkzeuge.\n\nHenriette sagt nichts dazu und legt zwei Scheite mehr nach als nötig.',
      en: 'In winter everyone comes to the forge, ostensibly about tools.\n\nHenriette says nothing about it and puts on two more logs than she needs.'
    },
    {
      id: 'hen-gabe', pack: 'p8', typ: 'gabe', ab: 5, gabe: 3,
      de: 'Nimm den Meißel. Der Griff ist abgegriffen, das ist Absicht — meiner war es auch.\n\n«Ein neues Werkzeug taugt nichts. Es muss erst wissen, wem es gehört.»',
      en: 'Take the chisel. The handle is worn, which is deliberate — mine was too.\n\n"A new tool is no use. It has to learn whose it is first."'
    }
  ];

  var VON = {};
  SZENEN.forEach(function (s) { VON[s.id] = s; });

  /* ============================================================
     3. CHOOSING ONE — the least random randomness we can manage.

     Specific beats general: if she has something to say about
     waking up, she says that and not the weather. Unseen beats
     seen, always: nothing repeats until everything within reach
     has been read once.
     ============================================================ */
  var RANG = { erst: 6, wach: 5, wachstum: 5, tag: 3, kalt: 3, warm: 3, nacht: 3, ende: 2, immer: 1 };

  function wannListe(s) {
    if (!s.wann) return ['immer'];
    return Array.isArray(s.wann) ? s.wann : [s.wann];
  }

  function passt(s, ctx) {
    if (s.pack !== ctx.pack) return false;
    if ((s.ab || 0) > (ctx.bond || 0)) return false;
    if (s.laune && s.laune !== ctx.laune) return false;
    if (s.braucht) {
      var w = (ctx.wahl || {})[s.braucht.szene];
      if (w === undefined || w !== s.braucht.wahl) return false;
    }
    var offen = ctx.wann || [];
    return wannListe(s).some(function (w) { return w === 'immer' || offen.indexOf(w) > -1; });
  }

  /* score a scene for this moment: how specific is its best matching tag */
  function schaerfe(s, ctx) {
    var offen = ctx.wann || [], best = 0;
    wannListe(s).forEach(function (w) {
      if (w !== 'immer' && offen.indexOf(w) < 0) return;
      best = Math.max(best, RANG[w] || 1);
    });
    return best;
  }

  function waehle(ctx) {
    ctx = ctx || {};
    var gesehen = ctx.gesehen || [];
    var frisch = SZENEN.filter(function (s) {
      return passt(s, ctx) && gesehen.indexOf(s.id) < 0;
    });
    if (!frisch.length) return null;
    var top = frisch.reduce(function (n, s) { return Math.max(n, schaerfe(s, ctx)); }, 0);
    var eng = frisch.filter(function (s) { return schaerfe(s, ctx) === top; });
    return eng[Math.floor(Math.random() * eng.length)];
  }

  /* Once everything within reach has been read, she is not struck dumb: she
     says something again. Repeats are shown as replays, so a gift never pays
     twice and a question is never re-asked as if it were new. */
  function wiederholen(ctx) {
    ctx = ctx || {};
    var gesehen = ctx.gesehen || [];
    var alt = SZENEN.filter(function (s) { return passt(s, ctx) && gesehen.indexOf(s.id) > -1; });
    if (!alt.length) return null;
    return alt[Math.floor(Math.random() * alt.length)];
  }

  /* how much of her story is still ahead of you, at this Vertrauen */
  function bestand(pack, gesehen) {
    var alle = SZENEN.filter(function (s) { return s.pack === pack; });
    var auf = gesehen || [];
    return {
      total: alle.length,
      gelesen: alle.filter(function (s) { return auf.indexOf(s.id) > -1; }).length
    };
  }

  /* ============================================================
     4. TAGWERK — three things to do today.

     Chosen by the day number, not by chance, so the same day shows
     the same three on every device and reloading never rerolls
     them. One is always simply "turn up"; the other two rotate.
     The reward is small on purpose: Sterne stay a milestone
     currency, and a day's work is worth about one ornament a week.
     ============================================================ */
  var AUFGABEN = [
    { id: 'lauf', de: 'Eine Runde beenden', en: 'Finish one round', ziel: 1, feld: 'sess', stern: 1, fix: true },
    { id: 'zwei', de: 'Zwei Runden beenden', en: 'Finish two rounds', ziel: 2, feld: 'sess', stern: 2 },
    { id: 'zwanzig', de: '20 Fragen beantworten', en: 'Answer 20 questions', ziel: 20, feld: 'ans', stern: 1 },
    { id: 'dreissig', de: '30 richtige Antworten', en: '30 correct answers', ziel: 30, feld: 'right', stern: 2 },
    { id: 'kombo', de: 'Eine Kombo von 10 erreichen', en: 'Get 10 right in a row', ziel: 10, feld: 'best', stern: 1 },
    { id: 'faellig', de: '15 fällige Wörter wiederholen', en: 'Review 15 words that are due', ziel: 15, feld: 'faellig', stern: 2 },
    { id: 'neu', de: '5 neue Wörter kennenlernen', en: 'See 5 new words for the first time', ziel: 5, feld: 'neu', stern: 1 },
    { id: 'sauber', de: 'Eine Runde mit 90 % schaffen', en: 'Score 90% or better in a round', ziel: 1, feld: 'sauber', stern: 2 },
    { id: 'feld', de: 'Ein Feld gezielt üben', en: 'Practise a single field', ziel: 1, feld: 'feld', stern: 1 }
  ];
  var VONA = {};
  AUFGABEN.forEach(function (a) { VONA[a.id] = a; });

  function tagesplan(day) {
    var rest = AUFGABEN.filter(function (a) { return !a.fix; });
    var d = Math.abs(day | 0);
    var i = d % rest.length;
    var j = (d * 7 + 3) % rest.length;
    if (j === i) j = (j + 1) % rest.length;
    return [AUFGABEN[0], rest[i], rest[j]];
  }

  function stand(auf, tag) {
    var have = Math.max(0, (tag && tag[auf.feld]) || 0);
    return { have: Math.min(have, auf.ziel), ziel: auf.ziel, fertig: have >= auf.ziel };
  }

  /* ============================================================
     5. THE WINDOW.

     One element, built once, reused. It borrows the host page's
     CSS variables, so it is the same paper and the same ink in
     every Paket without shipping a palette of its own.
     ============================================================ */
  var CSS = [
    '.hof-bg{position:fixed;inset:0;background:rgba(22,24,29,.6);z-index:120;opacity:0;pointer-events:none;transition:opacity .26s}',
    '.hof-bg.on{opacity:1;pointer-events:auto}',
    '.hof-win{position:fixed;left:50%;top:50%;z-index:121;width:min(540px,calc(100vw - 26px));',
    '  max-height:min(84vh,760px);display:flex;flex-direction:column;overflow:hidden;',
    '  background:var(--card,#F5F6F2);border:1px solid var(--ink,#16181D);border-radius:4px;',
    '  box-shadow:0 20px 60px rgba(22,24,29,.38);opacity:0;pointer-events:none;',
    '  transform:translate(-50%,-46%) scale(.975);transition:opacity .28s,transform .28s cubic-bezier(.2,.8,.2,1)}',
    '.hof-win.on{opacity:1;pointer-events:auto;transform:translate(-50%,-50%) scale(1)}',
    '.hof-bar{display:flex;align-items:center;gap:9px;background:var(--ink,#16181D);color:var(--paper,#E7E8E3);padding:8px 10px 8px 12px;flex:none}',
    '.hof-bar b{font-family:var(--disp,sans-serif);font-size:19px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;line-height:1}',
    '.hof-bar s{text-decoration:none;font-family:var(--mono,monospace);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;opacity:.6}',
    '.hof-bar .hof-x{margin-left:auto;font-family:var(--mono,monospace);font-size:17px;line-height:1;color:inherit;opacity:.7;',
    '  background:none;border:none;cursor:pointer;padding:2px 4px}',
    '.hof-bar .hof-x:hover{opacity:1}',
    '.hof-body{display:flex;gap:14px;padding:16px 16px 6px;align-items:flex-start;overflow:auto;flex:1;min-height:0;',
    '  background-image:linear-gradient(var(--paper-2,#DDDFD8) 1px,transparent 1px),linear-gradient(90deg,var(--paper-2,#DDDFD8) 1px,transparent 1px);',
    '  background-size:28px 28px;background-position:-1px -1px}',
    '.hof-por{flex:none;padding-top:2px}',
    '.hof-txt{flex:1;min-width:0}',
    '.hof-de{font-size:17px;line-height:1.5;white-space:pre-wrap;margin:0;min-height:1.5em}',
    '.hof-en{font-family:var(--mono,monospace);font-size:12px;line-height:1.55;color:var(--ink-60,#5A5F68);white-space:pre-wrap;margin:12px 0 0;',
    '  border-left:2px solid var(--line,#C6C9C1);padding-left:10px}',
    '.hof-foot{flex:none;padding:10px 16px;border-top:1px solid var(--line,#C6C9C1);background:var(--card,#F5F6F2);',
    '  display:flex;gap:8px;align-items:center;flex-wrap:wrap}',
    '.hof-note{font-family:var(--mono,monospace);font-size:10px;letter-spacing:.06em;color:var(--ink-40,#8A8F96);text-transform:uppercase;margin-right:auto}',
    '.hof-b{font-family:var(--disp,sans-serif);text-transform:uppercase;letter-spacing:.07em;font-weight:600;font-size:15px;',
    '  padding:7px 13px;border-radius:3px;border:1px solid var(--ink,#16181D);background:var(--ink,#16181D);color:var(--paper,#E7E8E3);cursor:pointer}',
    '.hof-b.ghost{background:transparent;color:var(--ink,#16181D)}',
    '.hof-wahl{display:flex;flex-direction:column;gap:7px;padding:0 16px 12px;flex:none}',
    '.hof-w{display:block;width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer;background:var(--paper,#E7E8E3);',
    '  border:1px solid var(--line,#C6C9C1);border-radius:3px;padding:9px 12px;transition:border-color .15s,transform .1s}',
    '.hof-w:hover{border-color:var(--ink,#16181D)}',
    '.hof-w:active{transform:translateY(1px)}',
    '.hof-w b{display:block;font-weight:500;font-size:15.5px}',
    '.hof-w s{display:block;text-decoration:none;font-family:var(--mono,monospace);font-size:11px;color:var(--ink-40,#8A8F96);margin-top:2px}',
    '.hof-gabe{margin:10px 0 0;font-family:var(--mono,monospace);font-size:12px;color:var(--gelb,#E8A200)}',
    '.hof-caret{display:inline-block;width:.5em;background:var(--ink,#16181D);opacity:.5;animation:hofCaret 1s steps(1) infinite}',
    '@keyframes hofCaret{0%,49%{opacity:.5}50%,100%{opacity:0}}',
    '.hof-ruf{position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:90;',
    '  max-width:min(290px,calc(100vw - 132px));background:var(--ink,#16181D);color:var(--paper,#E7E8E3);',
    '  border-radius:4px;border-left:4px solid var(--gelb,#E8A200);padding:8px 12px;',
    '  opacity:0;transform:translateY(12px);pointer-events:none;transition:opacity .22s,transform .22s}',
    '.hof-ruf.on{opacity:1;transform:translateY(0)}',
    '.hof-ruf b{display:block;font-family:var(--disp,sans-serif);font-size:17px;font-weight:600;letter-spacing:.02em;line-height:1.15}',
    '.hof-ruf s{display:block;text-decoration:none;font-family:var(--mono,monospace);font-size:10px;opacity:.62;margin-top:2px}',
    '@media(max-width:460px){.hof-body{gap:11px;padding:13px 13px 6px}.hof-de{font-size:16px}.hof-por{transform:scale(.85);transform-origin:top left}}',
    '@media(prefers-reduced-motion:reduce){.hof-win,.hof-bg,.hof-ruf{transition:none}.hof-caret{animation:none}}'
  ].join('\n');

  var styled = false;
  function injectCSS() {
    if (styled) return; styled = true;
    var el = document.createElement('style');
    el.setAttribute('data-hof', '1');
    el.textContent = CSS;
    (document.head || document.documentElement).appendChild(el);
  }

  /* ---- the typewriter: she is speaking, not printing ---- */
  function schreib(el, text, fertig) {
    el.textContent = '';
    if (STILL || !text) { el.textContent = text || ''; if (fertig) fertig(); return null; }
    var caret = document.createElement('i');
    caret.className = 'hof-caret';
    caret.textContent = '\u00a0';
    el.appendChild(caret);
    var i = 0, step = Math.max(1, Math.ceil(text.length / 140));
    var node = document.createTextNode('');
    el.insertBefore(node, caret);
    var timer = setInterval(function () {
      i = Math.min(text.length, i + step);
      node.nodeValue = text.slice(0, i);
      if (i >= text.length) { stop(); }
    }, 16);
    function stop() {
      if (!timer) return;
      clearInterval(timer); timer = null;
      node.nodeValue = text;
      if (caret.parentNode) caret.parentNode.removeChild(caret);
      if (fertig) fertig();
    }
    return stop;
  }

  var UI = null;         // the one window, built lazily
  var offen = null;      // { schliessen: fn }

  function bauen() {
    if (UI) return UI;
    injectCSS();
    var bg = document.createElement('div');
    bg.className = 'hof-bg';
    var win = document.createElement('div');
    win.className = 'hof-win';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-modal', 'true');
    win.innerHTML =
      '<div class="hof-bar"><b class="hof-name"></b><s class="hof-kick"></s>' +
      '<button class="hof-x" type="button" aria-label="Schließen">\u2715</button></div>' +
      '<div class="hof-body"><div class="hof-por"></div>' +
      '<div class="hof-txt"><p class="hof-de"></p><p class="hof-en" style="display:none"></p>' +
      '<p class="hof-gabe" style="display:none"></p></div></div>' +
      '<div class="hof-wahl" style="display:none"></div>' +
      '<div class="hof-foot"><span class="hof-note"></span>' +
      '<button class="hof-b hof-ok" type="button"></button></div>';
    document.body.appendChild(bg);
    document.body.appendChild(win);
    UI = {
      bg: bg, win: win,
      name: win.querySelector('.hof-name'), kick: win.querySelector('.hof-kick'),
      x: win.querySelector('.hof-x'), por: win.querySelector('.hof-por'),
      de: win.querySelector('.hof-de'), en: win.querySelector('.hof-en'),
      gabe: win.querySelector('.hof-gabe'), wahl: win.querySelector('.hof-wahl'),
      note: win.querySelector('.hof-note'), ok: win.querySelector('.hof-ok'),
      body: win.querySelector('.hof-body')
    };
    return UI;
  }

  var LABEL = {
    de: {
      szene: 'Ein Augenblick', gespraech: 'Sie spricht mit dir', frage: 'Sie fragt dich', gabe: 'Ein Geschenk',
      weiter: 'Weiter', schliessen: 'Schließen', post: 'Die Post bewahrt diesen Brief',
      alt: 'Aus der Post', gabeLine: '\u2726 +{n} Sterne \u2014 von ihr, nicht verdient',
      vertrauen: 'Vertrauen', briefe: 'Briefe', tagwerk: 'Tagwerk', heute: 'Was heute zählt',
      erledigt: 'erledigt', offen: 'offen', lohn: 'Lohn', keine: 'Noch keine Briefe.',
      postH: 'Die Post', postP: 'Alles, was dir jemand gesagt hat. Du kannst es jederzeit nachlesen.'
    },
    en: {
      szene: 'A moment', gespraech: 'She speaks to you', frage: 'She asks you', gabe: 'A gift',
      weiter: 'Go on', schliessen: 'Close', post: 'Die Post keeps this letter',
      alt: 'From the letter box', gabeLine: '\u2726 +{n} Sterne \u2014 given, not earned',
      vertrauen: 'Closeness', briefe: 'letters', tagwerk: 'Tagwerk', heute: 'What counts today',
      erledigt: 'done', offen: 'open', lohn: 'reward', keine: 'No letters yet.',
      postH: 'Die Post', postP: 'Everything anyone has said to you. Re-readable at any time.'
    }
  };
  function L(lang) { return LABEL[lang === 'de' ? 'de' : 'en']; }

  /* ---- open one ----
     opts: { lang, portrait, accent, kicker, replay, onWahl(i), onClose, onGabe(n) } */
  function fenster(sz, opts) {
    if (!sz || !document.body) return false;
    opts = opts || {};
    var u = bauen(), lab = L(opts.lang), p = PERSON[sz.pack] || {};
    var akz = opts.accent || p.col || '#E8A200';
    var stop = null, zu = false, vorherOF = '';

    u.name.textContent = p.her || '';
    u.kick.textContent = opts.replay ? lab.alt : (lab[sz.typ] || '');
    u.win.style.borderLeft = '5px solid ' + akz;
    u.por.innerHTML = opts.portrait || '';
    u.en.style.display = 'none';
    u.en.textContent = sz.en || '';
    u.gabe.style.display = 'none';
    u.wahl.style.display = 'none';
    u.wahl.innerHTML = '';
    u.note.textContent = opts.replay ? '' : lab.post;
    u.ok.style.display = 'none';
    u.ok.textContent = lab.schliessen;

    function zeigeRest() {
      u.en.style.display = '';
      if (sz.typ === 'frage' && sz.a && sz.a.length && !opts.replay) {
        u.wahl.style.display = '';
        u.wahl.innerHTML = sz.a.map(function (a, i) {
          return '<button class="hof-w" type="button" data-i="' + i + '">' +
            '<b></b><s></s></button>';
        }).join('');
        var btns = u.wahl.querySelectorAll('.hof-w');
        Array.prototype.forEach.call(btns, function (b, i) {
          b.querySelector('b').textContent = sz.a[i].de;
          b.querySelector('s').textContent = sz.a[i].en;
          b.onclick = function () { antwort(i); };
        });
      } else {
        u.ok.style.display = '';
        if (sz.typ === 'gabe' && sz.gabe && !opts.replay) {
          u.gabe.style.display = '';
          u.gabe.textContent = lab.gabeLine.split('{n}').join(sz.gabe);
          if (opts.onGabe) { try { opts.onGabe(sz.gabe); } catch (e) { } }
        }
        try { u.ok.focus({ preventScroll: true }); } catch (e) { u.ok.focus(); }
      }
    }

    function antwort(i) {
      var a = sz.a[i];
      u.wahl.style.display = 'none';
      u.wahl.innerHTML = '';
      u.en.style.display = 'none';
      if (opts.onWahl) { try { opts.onWahl(i); } catch (e) { } }
      stop = schreib(u.de, a.rDe || '', function () {
        u.en.textContent = a.rEn || '';
        u.en.style.display = '';
        u.ok.style.display = '';
        try { u.ok.focus({ preventScroll: true }); } catch (e) { u.ok.focus(); }
      });
      u.body.scrollTop = 0;
    }

    function fertig() {
      if (stop) { stop(); stop = null; return true; }
      return false;
    }

    function schliessen() {
      if (zu) return; zu = true;
      if (stop) { stop(); stop = null; }
      u.win.classList.remove('on'); u.bg.classList.remove('on');
      document.body.style.overflow = vorherOF;
      document.removeEventListener('keydown', taste, true);
      offen = null;
      if (opts.onClose) { try { opts.onClose(); } catch (e) { } }
    }

    function taste(e) {
      if (e.key === 'Escape') { e.stopPropagation(); schliessen(); }
      else if (e.key === 'Enter' && u.ok.style.display !== 'none') { e.preventDefault(); schliessen(); }
    }

    u.x.setAttribute('aria-label', lab.schliessen);
    u.x.onclick = schliessen;
    u.ok.onclick = schliessen;
    u.bg.onclick = function () { if (!fertig()) schliessen(); };
    u.body.onclick = function () { fertig(); };
    document.addEventListener('keydown', taste, true);

    if (offen) offen.schliessen();
    offen = { schliessen: schliessen };
    vorherOF = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    u.body.scrollTop = 0;
    u.bg.classList.add('on');
    u.win.classList.add('on');
    stop = schreib(u.de, sz.de || '', zeigeRest);
    return true;
  }

  function zu() { if (offen) offen.schliessen(); }

  /* ---- the whisper: one short line, mid-round, never in the way ---- */
  var rufEl = null, rufT = null;
  function ruf(pack, art, ms) {
    var p = PERSON[pack]; if (!p || !p.ruf || !document.body) return;
    var bag = p.ruf[art] || p.ruf.gut; if (!bag || !bag.length) return;
    var line = bag[Math.floor(Math.random() * bag.length)];
    injectCSS();
    if (!rufEl) {
      rufEl = document.createElement('div');
      rufEl.className = 'hof-ruf';
      rufEl.innerHTML = '<b></b><s></s>';
      document.body.appendChild(rufEl);
    }
    rufEl.style.borderLeftColor = p.col;
    rufEl.querySelector('b').textContent = line[0];
    rufEl.querySelector('s').textContent = line[1];
    rufEl.classList.add('on');
    if (rufT) clearTimeout(rufT);
    rufT = setTimeout(function () { rufEl.classList.remove('on'); }, ms || 2600);
  }

  window.Hof = {
    PERSON: PERSON, SZENEN: SZENEN, AUFGABEN: AUFGABEN,
    szene: function (id) { return VON[id] || null; },
    aufgabe: function (id) { return VONA[id] || null; },
    waehle: waehle, wiederholen: wiederholen, bestand: bestand,
    tagesplan: tagesplan, stand: stand,
    fenster: fenster, zu: zu, ruf: ruf, L: L,
    offen: function () { return !!offen; }
  };
})();
