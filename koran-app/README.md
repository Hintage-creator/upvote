# Koran & Hocharabisch Lern-App — Prototyp

Eine mobile Lern-App (Expo/React Native) für Koran-Rezitation und Hocharabisch,
mit Lektionen, Aussprache-Aufnahme, Multiple-Choice/Lückentext-Quiz,
Spaced-Repetition-Wiederholung (SM-2) und einem Gamification-System
(XP/Level/Streaks/Abzeichen).

**Status: funktionierender Prototyp, kein produktionsreifes System.** Was das
konkret heißt, steht unten unter [Bekannte Grenzen](#bekannte-grenzen-ehrlich-benannt).

## Architektur

```
koran-app/
├── apps/
│   ├── api/      Node.js + Express + TypeScript + SQLite (better-sqlite3)
│   └── mobile/   Expo (React Native + TypeScript), läuft auf iOS/Android/Web
└── packages/
    └── shared/   Gemeinsame Typen, SM-2-Algorithmus, Gamification-Logik,
                   Lektionsinhalte (Verse, Vokabeln, Quizfragen)
```

**Warum dieser Stack:**

- **Expo statt reinem React Native**: eine Codebasis für iOS, Android und Web.
  Web ist hier besonders wichtig, weil diese Entwicklungsumgebung kein
  Mobilgerät oder Simulator hat — Expo-Web ist der einzige Teil, der sich in
  dieser Umgebung tatsächlich selbst starten und prüfen ließ.
- **SQLite statt Postgres/Prisma für den Prototyp**: kein Codegen-Schritt, keine
  Native-Binary-Downloads, die in Sandboxes gerne am Netzwerk scheitern. Das
  Schema (`apps/api/src/db.ts`) ist bewusst einfach gehalten und lässt sich
  1:1 nach PostgreSQL migrieren, sobald mehrere Server-Instanzen nötig sind.
- **Lektionsinhalte als Code statt als DB-Tabellen**: Verse, Vokabeln,
  Lektionen und Quizfragen leben als statische, versionierte Daten in
  `packages/shared/src/content.ts`. Für den Prototyp-Umfang ist das einfacher
  und typsicherer als ein CMS. Für den Produktivbetrieb mit mehr Inhalt und
  Redaktionsworkflow sollte das in eine Datenbank/ein CMS wandern.
- **Kein react-navigation**: Die Navigation (`apps/mobile/src/navigation.tsx`)
  ist ein minimaler, selbstgebauter Stack über React-State, weil der Prototyp
  nur einen linearen Bildschirm-Fluss braucht. Für Deep-Links, Tabs etc. auf
  react-navigation oder expo-router umsteigen.

## Kernfunktionen

1. **Lektionen** (`packages/shared/src/content.ts`): Koran-Verse (Al-Fatiha,
   Al-Ikhlas) und Hocharabisch-Vokabeln, aufsteigend nach Schwierigkeit
   sortiert, jeweils mit arabischem Text, Transliteration, deutscher und
   englischer Übersetzung.
2. **Audio-Aufnahme & Aussprache-Feedback** (`apps/mobile/src/screens/RecordScreen.tsx`,
   `apps/api/src/pronunciation/scorer.ts`): Aufnahme per Mikrofon über
   `expo-audio`, serverseitige Bewertung über ein austauschbares
   `PronunciationScorer`-Interface.
3. **Quiz** (`apps/api/src/routes/quiz.ts`, `apps/mobile/src/screens/QuizScreen.tsx`):
   Multiple-Choice ("Was bedeutet dieser Vers?") und Lückentext
   ("Wie geht dieser Vers weiter?"). Die richtige Antwort wird nie an den
   Client geschickt — Bewertung passiert serverseitig.
4. **Spaced Repetition** (`packages/shared/src/srs.ts`): SM-2-Algorithmus
   (wie bei Anki). Jeder gelernte Vers/jede Vokabel bekommt eine
   `ReviewCard` mit Intervall, Ease-Factor und Fälligkeitsdatum.
5. **Gamification** (`packages/shared/src/gamification.ts`): XP, Level
   (wachsende Schwellen), tägliche Streaks, Abzeichen.
6. **Arabisches Alphabet als Lese-Referenz** (`packages/shared/src/alphabet.ts`,
   `apps/mobile/src/screens/AlphabetScreen.tsx`): alle 28 Buchstaben mit ihren
   vier Schreibformen (isoliert/Anfang/Mitte/Ende), plus Hamza-Varianten,
   Ta marbuta, Alif maqsura und die Kurzvokal-Zeichen (Harakat) — ohne die
   lässt sich vokalisierter Quran-Text wie in dieser App nicht lesen. Von der
   Startseite aus prominent verlinkt, bewusst außerhalb des Lektions-/SRS-Systems
   gehalten, weil es eine Lese-Referenz ist, kein Vokabel-Item.

## Aussprache-Bewertung: was echt ist und was nicht

`apps/api/src/pronunciation/scorer.ts` definiert ein `PronunciationScorer`-Interface
mit zwei Implementierungen:

- **`MockDurationHeuristicScorer`** (aktiv, wenn keine Azure-Credentials gesetzt sind):
  vergleicht nur die Aufnahmedauer mit einer groben Schätzung der erwarteten
  Sprechdauer. **Das ist keine echte Aussprache- oder Phonem-Analyse** — sie
  kann nicht erkennen, ob die richtigen Wörter oder Laute gesprochen wurden.
  Das UI zeigt das auch offen an (Hinweistext im Feedback-Screen).
- **`AzurePronunciationScorer`** (Stub, wirft einen Fehler bis konfiguriert):
  dokumentiert den empfohlenen Produktivweg. Azure Cognitive Services Speech
  hat ein *Pronunciation Assessment*-Feature mit nativer Arabisch-Unterstützung
  (`ar-SA`), das phonembasierte Accuracy-/Fluency-/Completeness-Scores gegen
  einen Referenztext liefert — treffender als generisches Speech-to-Text plus
  String-Vergleich. Setze `AZURE_SPEECH_KEY` und `AZURE_SPEECH_REGION`, dann
  wird dieser Scorer automatisch verwendet (`createDefaultScorer()`), und die
  eigentliche SDK-Anbindung muss in `AzurePronunciationScorer.score()`
  implementiert werden (Kommentare im Code zeigen genau wo und wie).

Ich konnte hier keinen echten API-Key für dich anlegen — das ist eine
Kontoentscheidung, die nur du treffen kannst.

## Referenz-Audio (Rezitationen von Muttersprachlern)

Für alle 11 Verse (Al-Fatiha, Al-Ikhlas) ist `referenceAudioUrl` in
`packages/shared/src/content.ts` jetzt mit echten URLs zu
[everyayah.com](https://everyayah.com) befüllt (Rezitator: Mishary Rashid
Alafasy, `Alafasy_128kbps`). everyayah.com wurde bewusst gewählt, weil es
genau für diesen Zweck aufgebaut ist — die Rezitatoren haben der
Wiederverwendung ihrer Aufnahmen in Apps wie dieser zugestimmt, anders als
ein beliebiger YouTube-/TikTok-Upload, bei dem Rechteinhaber und Lizenz sich
in der Regel nicht verlässlich klären lassen (deshalb keine Downloads von
dort — siehe Diskussion weiter oben in diesem Projekt).

**Nicht verifiziert, ehrlich gesagt:** Diese Entwicklungsumgebung blockiert
`everyayah.com` komplett über ihren Netzwerk-Proxy (sowohl `curl` als auch der
Web-Fetch-Mechanismus schlugen mit "egress blocked" fehl) — ich konnte also
keine einzige dieser URLs tatsächlich abrufen und prüfen. Das URL-Schema
(`/data/{Rezitator}_{Bitrate}kbps/{Sure:3-stellig}{Vers:3-stellig}.mp3`) ist
mir aus zahlreichen Open-Source-Quran-Projekten bekannt und ich bin
zuversichtlich, dass es stimmt, aber das ersetzt keine echte Prüfung. **Bitte
öffne mindestens eine URL (z. B.
https://everyayah.com/data/Alafasy_128kbps/001001.mp3) im Browser, bevor du
das ausrollst.** Ein echtes Gerät/eine echte Browser-Session ist von diesem
Sandbox-Netzwerk-Block nicht betroffen — der Play-Button in `ItemCard.tsx`
sollte dort direkt funktionieren.

Für die **Vokabel-Liste** gibt es keine entsprechende Quelle — everyayah.com
hat nur Vers-Audio, keine Einzelwort-Aussprache. `VocabItem.referenceAudioUrl`
bleibt `null`. Optionen dafür: eine TTS-Stimme (z. B. Azure/Google TTS mit
arabischer Stimme) oder eigene Aufnahmen mit einem Muttersprachler.

## Schnelle Web-Vorschau ohne Setup

`demo/index.html` ist eine einzelne, eigenständige HTML-Datei ohne Build-Schritt
und ohne Backend — Inhalte (Verse, Vokabeln, Alphabet), SM-2-Logik und
Gamification sind 1:1 aus `packages/shared` portiert. Einfach lokal im Browser
öffnen (Doppelklick auf die Datei, oder `npx serve demo`). Fortschritt wird nur
lokal im Browser (`localStorage`) gespeichert.

Zwei Dinge fehlen bewusst gegenüber der echten App, weil sie einen echten
Netzwerkzugriff bzw. eine unsandboxte Umgebung brauchen:
- **Referenz-Audio-Wiedergabe** (die everyayah.com-URLs werden nicht geladen)
- **Mikrofon-Aufnahme** kann je nach Browser/Kontext eingeschränkt sein

Lektionen, Quiz (mit echter serverloser Bewertung), Fortschritt/XP/Streaks/
Abzeichen und das komplette Alphabet-Referenzblatt sind voll interaktiv.

## Setup & Ausführen (volle App: Expo + Backend)

```bash
npm install                  # installiert alle Workspaces
npm run build:shared         # kompiliert packages/shared (nötig, bevor api/mobile starten)

npm run dev:api              # startet die API auf http://localhost:4000
npm run dev:mobile           # startet Expo (Metro), dann i/a/w im Terminal drücken
npm run dev:mobile:web       # Kurzform: Shared bauen + direkt im Browser öffnen

npm run test:shared          # 18 Tests: SM-2-Algorithmus, Gamification, Content-Integrität
npm run test:api             # 11 Tests: alle REST-Endpunkte (supertest)
```

Für ein reales Gerät (nicht Web/Simulator) `EXPO_PUBLIC_API_URL` auf die
LAN-IP des Rechners setzen, der die API hostet (`apps/mobile/src/api.ts`),
da `localhost` auf dem Gerät sonst auf sich selbst zeigt.

In dieser Cloud-Umgebung lief `expo start` nur mit `--offline` zuverlässig,
weil der Netzwerk-Proxy Zugriffe auf Expos Telemetrie-Endpunkt (`cdp.expo.dev`)
blockiert, an dem die CLI sonst beim Start hängen bleibt.

## Bekannte Grenzen (ehrlich benannt)

- **Kein echtes Auth-System.** Alle Clients teilen sich aktuell einen festen
  Demo-Account (`apps/api/src/routes/users.ts`). Für mehrere echte Nutzer
  wird eine richtige Anmeldung (E-Mail/OAuth + Session-Token) gebraucht.
- **Aussprache-Bewertung ist ein Platzhalter**, siehe oben — keine echte
  Phonem-Analyse ohne konfigurierten ASR-Anbieter.
- **Vers-Referenzaudio ist jetzt verlinkt (everyayah.com), aber ungeprüft**
  und **Vokabel-Referenzaudio fehlt komplett**, siehe oben.
- **Der Audio-Aufnahme-Flow (Mikrofon → Aufnahme → Upload) konnte ich in
  dieser Sandbox nicht vollständig testen**, da hier weder ein Mikrofon noch
  ein Mobil-Simulator verfügbar ist. Verifiziert wurde: die App startet echt
  (Expo-Web, gegen die laufende API), Navigation/Lektionen/Quiz/Profil
  funktionieren nachweislich end-to-end (per Playwright-Screenshots geprüft),
  und der Record-Screen behandelt eine verweigerte/fehlende Mikrofonberechtigung
  sauber ohne Absturz. Was NICHT getestet wurde: eine tatsächliche
  Ton-Aufnahme mit echtem Mikrofon auf einem echten Gerät — das muss vor
  einem echten Release auf einem physischen Gerät oder Simulator geprüft werden.
- **Übersetzungen sind Lernparaphrasen**, keine autorisierte theologische
  Übersetzung. Vor einer Veröffentlichung sollten die Verstexte/Übersetzungen
  gegen eine etablierte Referenz geprüft werden (z. B. Saheeh International
  für Englisch, Bubenheim & Elyas für Deutsch).
- **Kein Offline-Modus.** Die App braucht durchgehend eine Verbindung zur API.
- **Nur 6 Lektionen / 2 Suren** als Seed-Inhalt — genug, um den kompletten
  Lern-Loop (Lektion → Quiz → Wiederholung → Gamification) durchzuspielen,
  aber weit weg von einem vollständigen Kursumfang.

## Weitere Sprachen/Dialekte hinzufügen

Die Datenmodelle in `packages/shared/src/types.ts` (`Verse`, `VocabItem`)
haben schon getrennte `translationDe`/`translationEn`-Felder — ein drittes
Sprachfeld (oder ein `translations: Record<LanguageCode, string>`-Objekt)
lässt sich dort ergänzen, ohne API oder UI-Komponenten strukturell zu ändern.
Für einen neuen **Dialekt** (z. B. ägyptisches Umgangsarabisch) empfiehlt sich
ein eigenes `dialect`-Feld auf `VocabItem`/`Verse` plus eigene
Content-Dateien neben `content.ts`, damit Hocharabisch/Koran-Hocharabisch und
Dialekt-Inhalte sich nicht vermischen, aber dieselbe SRS- und
Gamification-Logik weiterverwenden.

## Bekannte, nicht behobene Sicherheits-/Abhängigkeitshinweise

`npm audit` meldet zwei verbleibende moderate Findings in transitiven
Dev-/Framework-Abhängigkeiten (esbuild-Dev-Server-Exposition über vitest/vite;
eine `qs`-DoS/Array-Limit-Schwachstelle über express 4.x). Beide sind für
diesen Prototyp-Kontext niedrig priorisiert (Dev-Tooling bzw. keine
nicht-triviale Query-String-Verarbeitung im Code), aber vor einem
Produktiv-Deploy sollten `express` (5.x) und die Vitest/Vite-Kette aktuell
gehalten werden.
