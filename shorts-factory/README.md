# Shorts Factory

Erzeugt recherchierte Kurzvideos (9:16, ~45 s, Englisch) mit KI-Stimme, Stock-Footage und Wort-für-Wort-Untertiteln.

```
ideas → new (Recherche + Skript) → DU PRÜFST → approve → render → hochladen
```

Der Prüfschritt ist Absicht und lässt sich nicht überspringen. `render` verweigert Skripte, die nicht freigegeben
oder nach der Freigabe geändert wurden. Gründe: KI-Faktenvideos enthalten sonst früher oder später erfundene Fakten,
und massenhaft ungeprüfter Schablonen-Content ist genau das, wofür YouTube die Monetarisierung entzieht.

## Einmalig einrichten (Windows)

1. **Python 3.11+** installieren (python.org, Haken bei „Add to PATH“).
2. **FFmpeg**: `winget install Gyan.FFmpeg`, danach Terminal neu öffnen, `ffmpeg -version` muss gehen.
3. Im Ordner `shorts-factory`:
   ```
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```
4. Schlüssel setzen (PowerShell, gilt dauerhaft für neue Terminals):
   ```
   setx ANTHROPIC_API_KEY "sk-ant-..."     # Pflicht: console.anthropic.com
   setx PEXELS_API_KEY "..."               # empfohlen, kostenlos: pexels.com/api
   setx ELEVENLABS_API_KEY "..."           # optional, bessere Stimme (kostenpflichtig)
   setx ELEVENLABS_VOICE_ID "..."
   ```

## Täglicher Ablauf

```
python -m shorts_factory ideas "weird animal biology" -n 10 --out topics.txt
python -m shorts_factory new --file topics.txt        # recherchiert + schreibt alle Skripte
python -m shorts_factory status
```

Dann pro Video `projects/<name>/REVIEW.md` lesen:
- Abschnitt **⚠ Check these claims first** zuerst.
- Die Quellen-Links wirklich öffnen. Die Recherche nutzt Websuche, kann Quellen aber trotzdem falsch wiedergeben.
- Änderungen in `script.json` machen (Text, Footage-Suchbegriffe), dann:

```
python -m shorts_factory approve <name> [<name> ...]
python -m shorts_factory render --all-approved
```

Ergebnis: `projects/<name>/output/<name>.mp4` + `upload.txt` (Titel, Beschreibung mit Quellen, Hashtags).

### Optionen
- **Eigenes Bildmaterial**: `projects/<name>/media/3.mp4` (oder `.jpg/.png`) ersetzt den Hintergrund von Segment 3.
  Bilder bekommen automatisch einen langsamen Zoom.
- **Stimme**: `--tts edge` (Standard, kostenlos) mit `--voice en-US-AndrewMultilingualNeural`,
  `--tts elevenlabs`, oder `--tts silent` zum Testen ohne Stimme.
  Liste der Edge-Stimmen: `edge-tts --list-voices`.
- **Musik**: `--music track.mp3`. Nur Musik verwenden, die du nutzen darfst (YouTube Audio Library o. ä.),
  sonst Content-ID-Claims.
- **Länge**: `new ... --seconds 35`. **Recherche-Tiefe**: `--effort high` (teurer, gründlicher).

## Was du wissen musst

- **Kosten**: Pro Video zwei Claude-Aufrufe (Recherche mit Websuche + Skript). Ich habe die Kosten nicht gemessen.
  Schau nach den ersten 5 Videos in die Anthropic-Console und rechne hoch, bevor du 100 auf einmal erzeugst.
- **Edge-TTS** nutzt eine inoffizielle Schnittstelle von Microsoft. Kostenlos, kann aber jederzeit ausfallen
  oder gedrosselt werden. ElevenLabs ist die stabile, bezahlte Alternative.
- **Ohne PEXELS_API_KEY** gibt es nur animierte Farbverläufe als Hintergrund. Das funktioniert, sieht aber billig aus.
- **Pexels-Suche** nimmt den ersten passenden Hochkant-Clip. Passt er nicht, ändere `visual_query` in `script.json`
  oder lege eigenes Material in `media/`.
- **KI-Kennzeichnung**: TikTok und YouTube haben Kennzeichnungsregeln für KI-Inhalte. Prüfe die aktuelle Regel pro
  Plattform. Die Checkliste in `upload.txt` erinnert dich daran.
- **Eigene Arbeit zeigt sich**: Videos, in denen nur Stock-Footage und eine KI-Stimme stecken, sind leicht zu ersetzen.
  Eine eigene Nische, eigene Themenauswahl und eigenes Material in `media/` machen den Unterschied.

## Getestet / nicht getestet

Getestet (Linux, FFmpeg 6.1): Freigabe-Sperre, Rendering mit Testton, eigene Bilder/Clips, Farbverlauf-Fallback,
Untertitel-Timing, Lautheitsnormalisierung, Fehlerbehandlung bei API-Fehlern.
**Nicht live getestet** (in der Entwicklungsumgebung nicht erreichbar): Claude-Aufrufe, Edge-TTS, Pexels, ElevenLabs
und Windows. Der erste echte Lauf auf deinem PC ist der eigentliche Test. Fehlermeldungen bitte zurückmelden.
