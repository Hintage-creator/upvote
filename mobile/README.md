# Kungbäkola — Prototyp

Mobile Lern-App (Expo / React Native / TypeScript) für Malinke (Maninka,
Guinea), gebaut für die afrikanische Diaspora in Europa. Verpackt als
Geschichte: Kungbäkola, eine streunende Katze, gerät in eine Pyramide, deren
Tür sich hinter ihr schließt — nur wer die Rätsel (= Lektionen/Quiz) in den
Kammern der Pyramide löst, kommt tiefer und irgendwann wieder heraus.
Architektur ist von Anfang an so ausgelegt, dass weitere Manding-Varietäten
(Bambara, Dyula) und später Audio-Aufnahmen ergänzt werden können, ohne
Typen, Screens oder Quiz-/Fortschritts-Logik anzufassen — die Dungeon-Story
ist eine reine UI-Schicht darüber, kein Teil des Sprachinhalt-Datenmodells.

**Aktueller Stand ist ein funktionierender Prototyp, kein fertiges Produkt.**
Siehe „Was noch fehlt“ unten — insbesondere: **alle Sprachinhalte sind
ungeprüfte Platzhalter**, siehe `src/data/languages/mnk/README.md`.

**Zielplattform aktuell: Web.** Expo baut dieselbe Codebasis für iOS/Android/
Web (react-native-web); für den ersten Test läuft die App als Web-App
(`npm run web`). Mobile Builds bleiben ohne Codeänderung möglich, sobald das
gebraucht wird.

## Architektur-Überblick

```
mobile/
  App.tsx                       Einstiegspunkt: Fonts laden, Provider, Navigation
  src/
    types/content.ts            Zentrales Datenmodell (Lesson, VocabItem, PhraseItem,
                                 GrammarNote, QuizQuestion, ...) — sprachunabhängig
    data/
      contentLookup.ts          Reine Lookup-Helfer über ein LanguagePack
      languages/
        index.ts                Registry: LanguageCode -> LanguagePack
        mnk/                    Malinke-Inhaltspaket (Platzhalter, siehe README dort)
    features/
      script/                   ScriptText (Latein/N'Ko-Anzeige), Umschalt-Control,
                                 ReviewBadge, geteilter Anzeige-Modus-Context
      course/                   Kursübersicht ("Pyramide") + Lektionsdetail ("Kammer")
      phrasebook/                Phrasenbuch-Screen
      quiz/                     Quiz-Generator (reine Funktionen) + Quiz-Screen ("Rätsel")
      progress/                 SM-2-Wiederholungsalgorithmus, Streaks/XP/Level,
                                 Storage-Repository, Fortschritts-Screen
      dungeon/                  Story-Framing: Ruß-Stufen-Logik, CatAvatar,
                                 Intro-/Backstory-Screen — reine UI-Schicht über
                                 Unit/Lesson, kein Teil des Sprachinhalt-Modells
    services/
      keyValueStore.ts          Store-Interface + In-Memory-Implementierung (Tests)
      asyncStorageAdapter.ts    AsyncStorage-Implementierung des Interfaces
    navigation/                 React-Navigation-Verdrahtung (Tabs + Stack)
  assets/mascot/                Aus dem User-Konzept abgeleitete Bild-Assets (siehe unten)
  __tests__/                    Jest-Tests für SM-2, Fortschritts-Repository, Quiz-Generator, Dungeon
```

### Warum diese Architektur

- **Ein Datenmodell, mehrere Sprachen**: Jedes Content-Item trägt einen
  `LanguageCode`. Eine neue Manding-Varietät (Bambara `bm`, Dyula `dyu`, ...)
  ist ein neuer Ordner unter `src/data/languages/<code>/` nach dem Muster von
  `mnk/`, registriert in `src/data/languages/index.ts`. Keine Änderung an
  Typen, Screens, Quiz- oder Fortschritts-Logik nötig.
- **Zweisprachige Darstellung ist strukturell erzwungen**: `ScriptText`
  besteht aus `{ latin, nko }` — es gibt keinen Weg, nur eine Schreibweise zu
  speichern. Der Anzeigemodus (Latein / N'Ko / Nebeneinander) ist app-weiter
  Context-State (`ScriptDisplayModeContext`), umschaltbar über
  `ScriptModeToggle`, das an mehreren Stellen (Kurs, Phrasenbuch) eingebunden
  ist.
- **N'Ko-Schrift-Rendering**: gebündelte Schriftart
  `@expo-google-fonts/noto-sans-nko` (Noto Sans N'Ko), da die meisten
  Geräte-Systemfonts den N'Ko-Unicode-Block (U+07C0–U+07FF) nicht abdecken.
  Text wird mit `writingDirection: 'rtl'` gerendert (N'Ko wird von rechts
  nach links geschrieben).
- **Audio ist vorbereitet, nicht gebaut**: `AudioRef` (`{ source, speaker?,
  durationMs? }`) ist ein optionales Feld auf `VocabItem`, `PhraseItem` und
  den Beispielsätzen in `GrammarNote`. Sobald Referenzaufnahmen vorliegen,
  braucht es nur (a) `audio: {...}` in den Content-Dateien und (b) einen
  Audio-Player (`expo-av`/`expo-audio`), der `item.audio` prüft — keine
  Änderung am Datenmodell.
- **Fortschritt & Wiederholung sind reine Funktionen + Repository-Pattern**:
  `src/features/progress/srs.ts` implementiert SM-2 sowie Streak-/XP-/
  Level-Berechnung ohne jede Abhängigkeit von React oder Storage — dadurch
  vollständig unit-testbar (siehe `__tests__/srs.test.ts`).
  `ProgressRepository` kapselt Persistenz hinter einem `KeyValueStore`-
  Interface; `AsyncStorage` ist nur eine austauschbare Implementierung davon
  (`asyncStorageAdapter.ts`). Ein späterer Wechsel auf Server-Sync (z. B. für
  geräteübergreifenden Fortschritt) bedeutet eine neue Implementierung dieses
  Interfaces, keine Änderung an den Screens.
- **Quiz-Fragen werden aus dem Vokabular generiert**, nicht von Hand
  gepflegt (`quizGenerator.ts`, reine, injizierbare-RNG-testbare Funktionen).
  Multiple-Choice-Distraktoren kommen aus dem restlichen Sprachpaket.
- **Die Dungeon-Story ist eine UI-Schicht, kein Content-Feature**: Kammern
  (`Unit`) und Räume (`Lesson`) existieren technisch unabhängig von der
  Geschichte. `src/features/dungeon/dungeon.ts` liefert zwei reine, getestete
  Funktionen darüber: `isLessonUnlocked` (linearer Pfad — ein Raum ist erst
  offen, wenn der vorherige gelöst ist) und `computeSootStage` (Ruß-Stufe
  0–4 aus gelösten Räumen / Gesamtzahl). Ein Rätsel gilt als „gelöst“, wenn
  im Quiz mindestens 60 % der Fragen richtig beantwortet wurden
  (`QuizScreen.PASS_RATIO`) — erst dann wird die nächste Kammer freigeschaltet.
  Weil das komplett unabhängig vom Sprachinhalt ist, funktioniert es später
  auch für Bambara/Dyula-Kurse ohne Änderung.
- **Animationen nutzen ausschließlich Reacts/React Natives eingebaute
  `Animated`-API** (`src/components/animations/`), bewusst statt
  `react-native-reanimated`: keine zusätzliche native Abhängigkeit, kein
  Babel-Plugin, funktioniert identisch auf Web/iOS/Android. Bausteine:
  `FadeSlideIn` (Eintritts-Animation, mit `delay` für gestaffelte Listen),
  `useShake`/`usePulse`/`useWiggle` (Hooks, die einen Animated-Style + ggf.
  Trigger liefern), `AnimatedBar` (weiche Balken-Füllung für Quiz-Fortschritt/
  XP-Level), `AnimatedCounter` (Zahlen zählen sanft hoch/runter statt zu
  springen), `AnimatedPressable` (jeder Button im Screen federt beim Antippen
  leicht ein — Drop-in-Ersatz für `Pressable`, überall eingesetzt),
  `FloatingText` (aufsteigendes „+5 XP“ bei richtiger Antwort), `LevelUpBanner`
  (Banner + Konfetti bei Levelaufstieg), `Celebration` (Partikel-Burst beim
  gelösten Rätsel). Eingesetzt u. a. für den Ruß-Avatar-Crossfade in
  `CatAvatar`, den gleitenden Indikator in `ScriptModeToggle`, gestaffelte
  Karten-Listen in Kurs/Lektion/Phrasenbuch, wackelnde Schloss-Icons auf
  gesperrten Kammern, Quiz-Feedback (Wackeln bei falscher Antwort, Bounce bei
  richtiger, XP-Popup, Levelaufstieg), Tab-Icons, die beim Fokussieren
  hüpfen, und einen animierten Kungbäkola-Ladebildschirm statt eines
  generischen Spinners.

## Setup & Ausführen

```bash
cd mobile
npm install
npm run typecheck   # tsc --noEmit
npm test            # jest — SM-2, Storage-Repository, Quiz-Generator
npm start           # Expo-Dev-Server (Metro) — Scannen mit Expo Go, oder
npm run android / npm run ios / npm run web
```

## Bild-Assets: Herkunft und Verarbeitung

Alle Bild-Assets unter `assets/` (App-Icon, Katzen-Avatar, Story-
Illustrationen) stammen aus den vom Nutzer bereitgestellten Konzeptbildern
("Original-Konzept", "App-Symbol", "Logo-Entwurf/-Enthüllung"). Konkret
verarbeitet mit Pillow (Python), Skript nicht Teil des Repos:

- `assets/icon.png` / `android-icon-foreground.png` / `favicon.png` /
  `splash-icon.png`: direkter Zuschnitt der "App-Symbol"-Kachel aus der
  Vorlage, hochskaliert. **Kein sauberes Alpha-Matte-Icon** — für ein
  pixelgenaues Android-Adaptive-Icon (transparenter Hintergrund, korrektes
  Padding für die System-Maskierung) sollte später ein echter Icon-Export
  aus dem Original-Design nachgereicht werden.
- `assets/mascot/soot-0.png` … `soot-4.png`: dieselbe Icon-Kachel,
  programmatisch zu 5 "Ruß"-Stufen verarbeitet — bei Stufe 4 ist das Fell
  fast vollständig schwarz (angelehnt an ein Referenzfoto einer schwarzen
  Katze), die Augen bleiben bewusst hell/ausgespart, und nur die
  Katzen-Silhouette wird abgedunkelt, nicht der goldene Pyramiden-
  Hintergrund (Masken + zunehmende Entsättigung/Abdunkelung/Korn, siehe
  `CatAvatar.tsx`). Das sind **keine zusätzlichen handgezeichneten
  Varianten**, sondern ein Bildfilter über demselben Ausgangsbild — falls
  später echte Illustrationen für jede Stufe entstehen, ersetzen sie
  einfach diese Dateien 1:1.
- `assets/mascot/story-standing.png` / `story-lying.png`: Zuschnitt der
  "Stehend – Vorderansicht" bzw. "Liegend – Vorderansicht"-Kacheln aus dem
  Original-Konzeptbild, unverändert.
- `android-icon-background.png`: einfarbige Fläche in der dominanten
  Goldfarbe des Icons (kein Bild-Zuschnitt).
- `android-icon-monochrome.png` ist **noch der ungeänderte Platzhalter aus
  dem Expo-Template** — für Android-13-Themed-Icons fehlt noch eine echte
  Silhouette/Alpha-Maske.

## Was funktioniert (verifiziert)

- `npm run typecheck` läuft ohne Fehler über den gesamten `src/`-Code.
- `npm test`: 31 Jest-Tests (SM-2-Terminplanung, Streaks/XP/Level,
  Storage-Repository, Quiz-Generierung, Dungeon-Logik) — alle grün.
- **Tatsächlich im Browser durchgeklickt** (Expo-Web-Dev-Server + headless
  Chromium, Playwright-Skript, nicht Teil des Repos): Story-Intro, Kurs-Tab
  mit Kammer-Sperren/Freischaltung über mehrere Lektionen hinweg, Lektion mit
  Latein/N'Ko/Beide-Umschalter, kompletter Quiz-Durchlauf inkl. Ergebnis-Screen
  (Erfolg und Misserfolg), Phrasenbuch, Fortschritts-Tab mit Ruß-Avatar. Keine
  Konsolenfehler in diesem Durchlauf. Dabei ist ein echter Bug aufgefallen und
  behoben worden: In `mnk/lessons.ts` steckte ein rohes N'Ko-Zeichen direkt in
  einem deutschen Beschreibungstext (außerhalb von `ScriptText`/ohne die
  N'Ko-Schriftart) und wurde als kaputtes Glyph gerendert.
- N'Ko-Mehrbuchstaben-Rendering (Wörter/Phrasen, nicht nur einzelne Buchstaben)
  wurde geprüft: Der Browser verbindet die Zeichen sichtbar zu zusammenhängenden
  Formen (korrektes komplexes Text-Shaping über die eingebettete Schriftart),
  Wortgrenzen bei mehrwortigen Phrasen stimmen mit der lateinischen Vorlage
  überein.

## Was nicht verifiziert wurde

Verifiziert wurde bisher nur die **Web-Variante** (react-native-web) in einem
Playwright-gesteuerten Headless-Chromium. **Nicht** getestet:

1. Echte native Mobile-Builds (iOS/Android, Expo Go oder Simulator) — diese
   Sandbox hat kein Gerät/keinen Simulator. Da die App dieselbe Codebasis über
   react-native-web nutzt, ist ein Großteil der Logik bereits laufend
   bestätigt, aber native-spezifisches Verhalten (z. B. Schrift-Rendering,
   Safe-Area, Gesten) ist offen.
2. Der "Rätsel gelöst"-Erfolgspfad mit Konfetti-Animation (`Celebration`)
   wurde im automatisierten Durchlauf nicht erzwungen (die Testantworten waren
   nicht gezielt korrekt) — der Code-Pfad ist einfach genug, um ihn auf
   dieselbe, bereits geprüfte Animations-Grundlage (Opacity/Scale via
   `Animated`) zu stützen, aber visuell nicht extra bestätigt.

## Was inhaltlich vor Produktivbetrieb fehlt

- **Sprachliche Prüfung der Inhalte** durch eine muttersprachliche oder
  linguistisch fachkundige Person für die Guinea-Maninka-Varietät — siehe
  `src/data/languages/mnk/README.md` für die genaue Liste offener Punkte
  (Ton-Diakritika in N'Ko fehlen bewusst, Wortschatz ist Bambara-nah statt
  Guinea-Maninka-spezifisch verifiziert, einige N'Ko-Zusatzbuchstaben fehlen).
- Deutlich mehr Lektionen/Wortschatz — der Prototyp deckt bewusst nur so viel
  ab, wie nötig ist, um Architektur und Kernfunktionen zu zeigen.
- Audio-Aufnahmen + Player-UI (Datenmodell ist vorbereitet, siehe oben).
- Nutzer-Accounts / Cloud-Sync des Fortschritts (aktuell rein lokal auf dem
  Gerät via AsyncStorage).
- Sauberes Alpha-Matte-App-Icon und Android-Monochrome-Icon (siehe Abschnitt
  „Bild-Assets" oben) — aktuell ein direkter Zuschnitt der Vorlage, kein
  eigens für App-Icon-Anforderungen exportiertes Asset.

## Weitere Manding-Varietät ergänzen (z. B. Bambara)

1. Ordner `src/data/languages/bm/` anlegen, Struktur von `mnk/` spiegeln
   (`alphabet.ts`, `numbers.ts`, `greetings.ts`, `grammar.ts`, `units.ts`,
   `lessons.ts`, `index.ts` mit Export eines `LanguagePack`).
2. In `src/data/languages/index.ts` unter `LANGUAGE_PACKS` registrieren.
3. Fertig — Screens, Quiz und Fortschritt funktionieren automatisch, weil sie
   alle über `getLanguagePack(code)` und den generischen `LanguagePack`-Typ
   arbeiten.
