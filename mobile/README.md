# Malinke lernen — Prototyp

Mobile Lern-App (Expo / React Native / TypeScript) für Malinke (Maninka,
Guinea), gebaut für die afrikanische Diaspora in Europa. Architektur ist von
Anfang an so ausgelegt, dass weitere Manding-Varietäten (Bambara, Dyula) und
später Audio-Aufnahmen ergänzt werden können, ohne Typen, Screens oder
Quiz-/Fortschritts-Logik anzufassen.

**Aktueller Stand ist ein funktionierender Prototyp, kein fertiges Produkt.**
Siehe „Was noch fehlt“ unten — insbesondere: **alle Sprachinhalte sind
ungeprüfte Platzhalter**, siehe `src/data/languages/mnk/README.md`.

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
      course/                   Kursübersicht + Lektionsdetail
      phrasebook/                Phrasenbuch-Screen
      quiz/                     Quiz-Generator (reine Funktionen) + Quiz-Screen
      progress/                 SM-2-Wiederholungsalgorithmus, Streaks/XP/Level,
                                 Storage-Repository, Fortschritts-Screen
    services/
      keyValueStore.ts          Store-Interface + In-Memory-Implementierung (Tests)
      asyncStorageAdapter.ts    AsyncStorage-Implementierung des Interfaces
    navigation/                 React-Navigation-Verdrahtung (Tabs + Stack)
  __tests__/                    Jest-Tests für SM-2, Fortschritts-Repository, Quiz-Generator
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

## Setup & Ausführen

```bash
cd mobile
npm install
npm run typecheck   # tsc --noEmit
npm test            # jest — SM-2, Storage-Repository, Quiz-Generator
npm start           # Expo-Dev-Server (Metro) — Scannen mit Expo Go, oder
npm run android / npm run ios / npm run web
```

## Was funktioniert (verifiziert)

- `npm run typecheck` läuft ohne Fehler über den gesamten `src/`-Code.
- `npm test`: 22 Jest-Tests für SM-2-Terminplanung, Streaks/XP/Level,
  Storage-Repository und Quiz-Generierung — alle grün.
- Grundkurs-Struktur mit aufsteigendem Schwierigkeitsgrad (Alphabet → Zahlen
  → Pronomen/Grammatik → Begrüßungen), zweisprachige Latein/N'Ko-Darstellung
  mit Umschalter, Phrasenbuch, Multiple-Choice- und Übersetzungs-Quiz,
  Fortschritts-Screen mit Streak/Level/fälligen Wiederholungen.

## Was nicht verifiziert wurde

Diese Sandbox-Umgebung hat **kein Gerät und keinen Simulator/Emulator**. Der
UI-Code wurde nicht visuell in Expo Go / einem Simulator getestet — nur
Typecheck und Logik-Tests. Vor dem ersten echten Einsatz bitte:

1. `npm start` lokal ausführen und mit Expo Go (iOS/Android) oder einem
   Simulator durchklicken.
2. Insbesondere prüfen: N'Ko-Schriftdarstellung (Font-Ladezeit, RTL-Layout),
   Navigation zwischen den drei Tabs, Quiz-Flow Anfang bis Ende.

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
- App-Icons/Splash-Screen (Platzhalter-Assets aus dem Expo-Template).

## Weitere Manding-Varietät ergänzen (z. B. Bambara)

1. Ordner `src/data/languages/bm/` anlegen, Struktur von `mnk/` spiegeln
   (`alphabet.ts`, `numbers.ts`, `greetings.ts`, `grammar.ts`, `units.ts`,
   `lessons.ts`, `index.ts` mit Export eines `LanguagePack`).
2. In `src/data/languages/index.ts` unter `LANGUAGE_PACKS` registrieren.
3. Fertig — Screens, Quiz und Fortschritt funktionieren automatisch, weil sie
   alle über `getLanguagePack(code)` und den generischen `LanguagePack`-Typ
   arbeiten.
