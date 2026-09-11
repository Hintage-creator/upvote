# mnk (Malinke / Maninka, Guinea) — Platzhalter-Inhalte

**Diese Inhalte sind ein Platzhalter-Datensatz, kein geprüftes Lehrmaterial.**
Sie wurden erstellt, um die App-Architektur (zweisprachige Schrift-Darstellung,
Lektionsstruktur, Quiz, Fortschritt) mit realistisch aussehenden, aber
ausdrücklich ungeprüften Beispielen zu demonstrieren.

## Was geprüft werden muss, bevor diese Inhalte live gehen

1. **Wortschatz & Phrasen** (`greetings.ts`, `numbers.ts`): Die Latein- und
   N'Ko-Formen folgen allgemein in der Manding-Linguistik dokumentierten
   Mustern (meist Bambara-naher Quellenlage), sind aber **nicht** speziell
   für die Guinea-Maninka-Varietät verifiziert. Dialektale Abweichungen bei
   Aussprache, Wortwahl und Rechtschreibung sind zu erwarten.
2. **N'Ko-Schreibweisen**: Es handelt sich um mechanische,
   buchstabengetreue Transliterationen ohne Ton-Diakritika (N'Ko markiert
   Töne mit Kombinationszeichen, U+07EB–U+07F3). Ohne linguistische Prüfung
   wurden diese absichtlich weggelassen, statt geraten.
3. **`na woloso`, `nya woloso`, `rra` und die drei `jona`-Buchstaben** wurden
   aus dem Alphabet-Modul ausgeschlossen, weil ihre genaue lautliche
   Verwendung in dieser Prüfung nicht sicher genug war, um sie
   Lernenden zu präsentieren.
4. Jedes einzelne Content-Item trägt ein `status.needsReview: true` und ist
   in der UI mit einem Hinweis-Badge markiert (siehe
   `src/features/course` / `src/features/phrasebook`).

## Vor Produktivbetrieb erforderlich

Eine Prüfung durch mindestens eine muttersprachliche Person und/oder eine
mit der Guinea-Maninka-Varietät vertraute linguistische Fachperson, bevor
diese Inhalte als verlässliches Lernmaterial ausgegeben werden.
