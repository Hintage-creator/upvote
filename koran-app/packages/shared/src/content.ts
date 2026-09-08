// Starter content set for the prototype: two short, widely-known surahs and a
// small Modern Standard Arabic vocabulary, ordered by difficulty.
//
// Translations are simplified paraphrases written for language learners, not
// a scholarly or liturgical translation - an app going further than this
// prototype should have verse translations reviewed against an established
// reference (e.g. Saheeh International in English, Bubenheim & Elyas in
// German) rather than relying on freehand phrasing.
//
// referenceAudioUrl is intentionally null: bundling Quran recitation audio
// requires sourcing it from a rights-cleared provider (e.g. the quran.com or
// everyayah.com recitation APIs) and is not something to fabricate here.
import type { Lesson, QuizQuestion, Verse, VocabItem } from "./types";

export const VERSES: Verse[] = [
  {
    id: "1:1",
    surahNumber: 1,
    surahNameArabic: "الفاتحة",
    surahNameLatin: "Al-Fatiha",
    ayahNumber: 1,
    arabicText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    transliteration: "Bismillahi r-rahmani r-rahim",
    translationDe: "Im Namen Allahs, des Allerbarmers, des Barmherzigen.",
    translationEn: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    difficulty: 1,
    referenceAudioUrl: null,
  },
  {
    id: "1:2",
    surahNumber: 1,
    surahNameArabic: "الفاتحة",
    surahNameLatin: "Al-Fatiha",
    ayahNumber: 2,
    arabicText: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    transliteration: "Alhamdu lillahi rabbi l-'alamin",
    translationDe: "Alles Lob gebührt Allah, dem Herrn der Welten.",
    translationEn: "All praise is due to Allah, Lord of the worlds.",
    difficulty: 1,
    referenceAudioUrl: null,
  },
  {
    id: "1:3",
    surahNumber: 1,
    surahNameArabic: "الفاتحة",
    surahNameLatin: "Al-Fatiha",
    ayahNumber: 3,
    arabicText: "الرَّحْمَٰنِ الرَّحِيمِ",
    transliteration: "Ar-rahmani r-rahim",
    translationDe: "Dem Allerbarmer, dem Barmherzigen.",
    translationEn: "The Entirely Merciful, the Especially Merciful.",
    difficulty: 1,
    referenceAudioUrl: null,
  },
  {
    id: "1:4",
    surahNumber: 1,
    surahNameArabic: "الفاتحة",
    surahNameLatin: "Al-Fatiha",
    ayahNumber: 4,
    arabicText: "مَالِكِ يَوْمِ الدِّينِ",
    transliteration: "Maliki yawmi d-din",
    translationDe: "Dem Herrscher am Tag des Gerichts.",
    translationEn: "Sovereign of the Day of Recompense.",
    difficulty: 2,
    referenceAudioUrl: null,
  },
  {
    id: "1:5",
    surahNumber: 1,
    surahNameArabic: "الفاتحة",
    surahNameLatin: "Al-Fatiha",
    ayahNumber: 5,
    arabicText: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    transliteration: "Iyyaka na'budu wa iyyaka nasta'in",
    translationDe: "Dir allein dienen wir, und Dich allein bitten wir um Hilfe.",
    translationEn: "It is You we worship and You we ask for help.",
    difficulty: 2,
    referenceAudioUrl: null,
  },
  {
    id: "1:6",
    surahNumber: 1,
    surahNameArabic: "الفاتحة",
    surahNameLatin: "Al-Fatiha",
    ayahNumber: 6,
    arabicText: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    transliteration: "Ihdina s-sirata l-mustaqim",
    translationDe: "Leite uns den geraden Weg.",
    translationEn: "Guide us to the straight path.",
    difficulty: 2,
    referenceAudioUrl: null,
  },
  {
    id: "1:7",
    surahNumber: 1,
    surahNameArabic: "الفاتحة",
    surahNameLatin: "Al-Fatiha",
    ayahNumber: 7,
    arabicText:
      "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
    transliteration:
      "Sirata lladhina an'amta 'alayhim ghayri l-maghdubi 'alayhim wa la d-dallin",
    translationDe:
      "Den Weg derer, denen Du Gnade erwiesen hast, nicht derer, die Deinen Zorn erregt haben, und nicht der Irregehenden.",
    translationEn:
      "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
    difficulty: 3,
    referenceAudioUrl: null,
  },
  {
    id: "112:1",
    surahNumber: 112,
    surahNameArabic: "الإخلاص",
    surahNameLatin: "Al-Ikhlas",
    ayahNumber: 1,
    arabicText: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    transliteration: "Qul huwa llahu ahad",
    translationDe: "Sag: Er ist Allah, ein Einziger.",
    translationEn: "Say, He is Allah, [who is] One.",
    difficulty: 1,
    referenceAudioUrl: null,
  },
  {
    id: "112:2",
    surahNumber: 112,
    surahNameArabic: "الإخلاص",
    surahNameLatin: "Al-Ikhlas",
    ayahNumber: 2,
    arabicText: "اللَّهُ الصَّمَدُ",
    transliteration: "Allahu s-samad",
    translationDe: "Allah, der Absolute, von dem alles abhängt.",
    translationEn: "Allah, the Eternal Refuge.",
    difficulty: 2,
    referenceAudioUrl: null,
  },
  {
    id: "112:3",
    surahNumber: 112,
    surahNameArabic: "الإخلاص",
    surahNameLatin: "Al-Ikhlas",
    ayahNumber: 3,
    arabicText: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
    transliteration: "Lam yalid wa lam yulad",
    translationDe: "Er hat nicht gezeugt und ist nicht gezeugt worden.",
    translationEn: "He neither begets nor is born.",
    difficulty: 2,
    referenceAudioUrl: null,
  },
  {
    id: "112:4",
    surahNumber: 112,
    surahNameArabic: "الإخلاص",
    surahNameLatin: "Al-Ikhlas",
    ayahNumber: 4,
    arabicText: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    transliteration: "Wa lam yakun lahu kufuwan ahad",
    translationDe: "Und niemand ist Ihm ebenbürtig.",
    translationEn: "Nor is there to Him any equivalent.",
    difficulty: 2,
    referenceAudioUrl: null,
  },
];

export const VOCAB: VocabItem[] = [
  { id: "v-kitab", arabicWord: "كِتَاب", transliteration: "kitab", translationDe: "Buch", translationEn: "book", partOfSpeech: "noun", difficulty: 1, referenceAudioUrl: null },
  { id: "v-bayt", arabicWord: "بَيْت", transliteration: "bayt", translationDe: "Haus", translationEn: "house", partOfSpeech: "noun", difficulty: 1, referenceAudioUrl: null },
  { id: "v-salam", arabicWord: "سَلَام", transliteration: "salam", translationDe: "Frieden", translationEn: "peace", partOfSpeech: "noun", difficulty: 1, referenceAudioUrl: null },
  { id: "v-shukran", arabicWord: "شُكْرًا", transliteration: "shukran", translationDe: "danke", translationEn: "thank you", partOfSpeech: "phrase", difficulty: 1, referenceAudioUrl: null },
  { id: "v-qalam", arabicWord: "قَلَم", transliteration: "qalam", translationDe: "Stift", translationEn: "pen", partOfSpeech: "noun", difficulty: 1, referenceAudioUrl: null },
  { id: "v-madrasa", arabicWord: "مَدْرَسَة", transliteration: "madrasa", translationDe: "Schule", translationEn: "school", partOfSpeech: "noun", difficulty: 2, referenceAudioUrl: null },
  { id: "v-yaktubu", arabicWord: "يَكْتُبُ", transliteration: "yaktubu", translationDe: "er schreibt", translationEn: "he writes", partOfSpeech: "verb", difficulty: 2, referenceAudioUrl: null },
  { id: "v-jamil", arabicWord: "جَمِيل", transliteration: "jamil", translationDe: "schön", translationEn: "beautiful", partOfSpeech: "adjective", difficulty: 2, referenceAudioUrl: null },
  { id: "v-min-fadlik", arabicWord: "مِنْ فَضْلِك", transliteration: "min fadlik", translationDe: "bitte", translationEn: "please", partOfSpeech: "phrase", difficulty: 2, referenceAudioUrl: null },
  { id: "v-yataallamu", arabicWord: "يَتَعَلَّمُ", transliteration: "yata'allamu", translationDe: "er lernt", translationEn: "he learns", partOfSpeech: "verb", difficulty: 3, referenceAudioUrl: null },
  { id: "v-inshallah", arabicWord: "إِنْ شَاءَ اللَّه", transliteration: "in sha'a Allah", translationDe: "so Gott will", translationEn: "God willing", partOfSpeech: "phrase", difficulty: 3, referenceAudioUrl: null },
];

export const LESSONS: Lesson[] = [
  {
    id: "l-vocab-1",
    title: "Grundlagen: Erste Wörter",
    description: "Fünf einfache Alltagswörter auf Hocharabisch.",
    order: 1,
    difficulty: 1,
    items: ["v-kitab", "v-bayt", "v-salam", "v-shukran", "v-qalam"].map((id) => ({
      type: "vocab" as const,
      id,
    })),
  },
  {
    id: "l-fatiha-1",
    title: "Al-Fatiha (1/2)",
    description: "Die ersten vier Verse der Eröffnungssure.",
    order: 2,
    difficulty: 1,
    items: ["1:1", "1:2", "1:3", "1:4"].map((id) => ({ type: "verse" as const, id })),
  },
  {
    id: "l-fatiha-2",
    title: "Al-Fatiha (2/2)",
    description: "Die letzten drei Verse der Eröffnungssure.",
    order: 3,
    difficulty: 2,
    items: ["1:5", "1:6", "1:7"].map((id) => ({ type: "verse" as const, id })),
  },
  {
    id: "l-vocab-2",
    title: "Mehr Wörter",
    description: "Schule, Verben und Höflichkeitsfloskeln.",
    order: 4,
    difficulty: 2,
    items: ["v-madrasa", "v-yaktubu", "v-jamil", "v-min-fadlik"].map((id) => ({
      type: "vocab" as const,
      id,
    })),
  },
  {
    id: "l-ikhlas",
    title: "Al-Ikhlas",
    description: "Die kurze Sure über die Einheit Gottes.",
    order: 5,
    difficulty: 2,
    items: ["112:1", "112:2", "112:3", "112:4"].map((id) => ({
      type: "verse" as const,
      id,
    })),
  },
  {
    id: "l-vocab-3",
    title: "Fortgeschrittene Wörter",
    description: "Komplexere Verben und Redewendungen.",
    order: 6,
    difficulty: 3,
    items: ["v-yataallamu", "v-inshallah"].map((id) => ({
      type: "vocab" as const,
      id,
    })),
  },
];

function meaningQuestion(verse: Verse, lessonId: string, distractors: Verse[]): QuizQuestion {
  const options = [verse.translationDe, ...distractors.map((d) => d.translationDe)];
  return {
    id: `q-meaning-${verse.id}`,
    lessonId,
    verseId: verse.id,
    type: "multiple_choice",
    prompt: `Was bedeutet dieser Vers?\n${verse.arabicText}`,
    options: shuffle(options),
    correctAnswer: verse.translationDe,
  };
}

function continuationQuestion(
  verse: Verse,
  nextVerse: Verse,
  lessonId: string,
  distractors: Verse[]
): QuizQuestion {
  const options = [nextVerse.arabicText, ...distractors.map((d) => d.arabicText)];
  return {
    id: `q-continue-${verse.id}`,
    lessonId,
    verseId: verse.id,
    type: "fill_blank",
    prompt: `Wie geht dieser Vers weiter?\n${verse.arabicText}`,
    options: shuffle(options),
    correctAnswer: nextVerse.arabicText,
  };
}

function shuffle<T>(arr: T[]): T[] {
  // Deterministic-enough shuffle for seed data; not used for anything
  // security-sensitive, just to avoid the correct answer always being first.
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(((i + 7) * 2654435761) % (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuizQuestions(): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const versesById = new Map(VERSES.map((v) => [v.id, v]));

  for (const lesson of LESSONS) {
    const verseIds = lesson.items.filter((i) => i.type === "verse").map((i) => i.id);
    for (let i = 0; i < verseIds.length; i++) {
      const verse = versesById.get(verseIds[i])!;
      const otherVerses = VERSES.filter((v) => v.id !== verse.id);
      const distractorsForMeaning = pickRandomDistinct(otherVerses, 3, verse.id);
      questions.push(meaningQuestion(verse, lesson.id, distractorsForMeaning));

      if (i < verseIds.length - 1) {
        const nextVerse = versesById.get(verseIds[i + 1])!;
        const distractorsForContinuation = pickRandomDistinct(
          otherVerses.filter((v) => v.id !== nextVerse.id),
          2,
          verse.id
        );
        questions.push(
          continuationQuestion(verse, nextVerse, lesson.id, distractorsForContinuation)
        );
      }
    }
  }
  return questions;
}

function pickRandomDistinct(pool: Verse[], count: number, seedId: string): Verse[] {
  // Simple seeded pick so the same seed data is generated deterministically on every run.
  const seed = Array.from(seedId).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const result: Verse[] = [];
  let idx = seed;
  const used = new Set<string>();
  while (result.length < count && result.length < pool.length) {
    idx = (idx + 13) % pool.length;
    const candidate = pool[idx];
    if (!used.has(candidate.id)) {
      used.add(candidate.id);
      result.push(candidate);
    }
  }
  return result;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = buildQuizQuestions();
