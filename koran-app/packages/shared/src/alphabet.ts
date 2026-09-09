// Reference data for reading the Arabic script: the 28-letter alphabet with
// its positional forms, plus the extra signs a learner needs to actually
// read a Quran text - which, unlike everyday Arabic writing, is fully
// vocalized (every short vowel is marked). Without the harakat below, a
// learner can recognize letters but still can't sound out `مِنْ` or `قُلْ`.
//
// This is standard, uncontested reference material (the same 28-letter
// order and forms taught in every beginner Arabic course), not something
// that needed external verification the way the Quran translations did.
import type { ArabicLetter, ArabicSign } from "./types";

export const ARABIC_ALPHABET: ArabicLetter[] = [
  { id: "alif", name: "أَلِف", isolated: "ا", initial: "ا", medial: "ـا", final: "ـا", transliteration: "ā / a", soundDe: "langes „a“ wie in „Vater“; trägt oft nur den Hamza-Anlaut", connectsForward: false },
  { id: "ba", name: "بَاء", isolated: "ب", initial: "بـ", medial: "ـبـ", final: "ـب", transliteration: "b", soundDe: "wie deutsches „b“", connectsForward: true },
  { id: "ta", name: "تَاء", isolated: "ت", initial: "تـ", medial: "ـتـ", final: "ـت", transliteration: "t", soundDe: "wie deutsches „t“", connectsForward: true },
  { id: "tha", name: "ثَاء", isolated: "ث", initial: "ثـ", medial: "ـثـ", final: "ـث", transliteration: "th", soundDe: "stimmloses „th“ wie engl. „think“", connectsForward: true },
  { id: "jim", name: "جِيم", isolated: "ج", initial: "جـ", medial: "ـجـ", final: "ـج", transliteration: "j", soundDe: "wie „dsch“ in „Dschungel“", connectsForward: true },
  { id: "ha-emphatic", name: "حَاء", isolated: "ح", initial: "حـ", medial: "ـحـ", final: "ـح", transliteration: "ḥ", soundDe: "gehauchtes „h“, tief im Rachen gebildet", connectsForward: true },
  { id: "kha", name: "خَاء", isolated: "خ", initial: "خـ", medial: "ـخـ", final: "ـخ", transliteration: "kh", soundDe: "wie „ch“ in „Bach“", connectsForward: true },
  { id: "dal", name: "دَال", isolated: "د", initial: "د", medial: "ـد", final: "ـد", transliteration: "d", soundDe: "wie deutsches „d“", connectsForward: false },
  { id: "dhal", name: "ذَال", isolated: "ذ", initial: "ذ", medial: "ـذ", final: "ـذ", transliteration: "dh", soundDe: "stimmhaftes „th“ wie engl. „this“", connectsForward: false },
  { id: "ra", name: "رَاء", isolated: "ر", initial: "ر", medial: "ـر", final: "ـر", transliteration: "r", soundDe: "gerolltes „r“", connectsForward: false },
  { id: "zay", name: "زَاي", isolated: "ز", initial: "ز", medial: "ـز", final: "ـز", transliteration: "z", soundDe: "stimmhaftes „s“ wie in „Sonne“", connectsForward: false },
  { id: "sin", name: "سِين", isolated: "س", initial: "سـ", medial: "ـسـ", final: "ـس", transliteration: "s", soundDe: "scharfes „s“ wie in „Wasser“", connectsForward: true },
  { id: "shin", name: "شِين", isolated: "ش", initial: "شـ", medial: "ـشـ", final: "ـش", transliteration: "sh", soundDe: "wie deutsches „sch“", connectsForward: true },
  { id: "sad", name: "صَاد", isolated: "ص", initial: "صـ", medial: "ـصـ", final: "ـص", transliteration: "ṣ", soundDe: "emphatisches, dumpfes „s“", connectsForward: true },
  { id: "dad", name: "ضَاد", isolated: "ض", initial: "ضـ", medial: "ـضـ", final: "ـض", transliteration: "ḍ", soundDe: "emphatisches, dumpfes „d“", connectsForward: true },
  { id: "ta-emphatic", name: "طَاء", isolated: "ط", initial: "طـ", medial: "ـطـ", final: "ـط", transliteration: "ṭ", soundDe: "emphatisches, dumpfes „t“", connectsForward: true },
  { id: "za-emphatic", name: "ظَاء", isolated: "ظ", initial: "ظـ", medial: "ـظـ", final: "ـظ", transliteration: "ẓ", soundDe: "emphatisches „dh“/„z“", connectsForward: true },
  { id: "ain", name: "عَيْن", isolated: "ع", initial: "عـ", medial: "ـعـ", final: "ـع", transliteration: "ʿ", soundDe: "enger Rachenlaut ohne deutsches Äquivalent", connectsForward: true },
  { id: "ghain", name: "غَيْن", isolated: "غ", initial: "غـ", medial: "ـغـ", final: "ـغ", transliteration: "gh", soundDe: "Reibelaut im Rachen, ähnlich franz. „r“", connectsForward: true },
  { id: "fa", name: "فَاء", isolated: "ف", initial: "فـ", medial: "ـفـ", final: "ـف", transliteration: "f", soundDe: "wie deutsches „f“", connectsForward: true },
  { id: "qaf", name: "قَاف", isolated: "ق", initial: "قـ", medial: "ـقـ", final: "ـق", transliteration: "q", soundDe: "„k“, aber weit hinten im Rachen gebildet", connectsForward: true },
  { id: "kaf", name: "كَاف", isolated: "ك", initial: "كـ", medial: "ـكـ", final: "ـك", transliteration: "k", soundDe: "wie deutsches „k“", connectsForward: true },
  { id: "lam", name: "لَام", isolated: "ل", initial: "لـ", medial: "ـلـ", final: "ـل", transliteration: "l", soundDe: "wie deutsches „l“", connectsForward: true },
  { id: "mim", name: "مِيم", isolated: "م", initial: "مـ", medial: "ـمـ", final: "ـم", transliteration: "m", soundDe: "wie deutsches „m“", connectsForward: true },
  { id: "nun", name: "نُون", isolated: "ن", initial: "نـ", medial: "ـنـ", final: "ـن", transliteration: "n", soundDe: "wie deutsches „n“", connectsForward: true },
  { id: "ha-light", name: "هَاء", isolated: "ه", initial: "هـ", medial: "ـهـ", final: "ـه", transliteration: "h", soundDe: "wie deutsches „h“", connectsForward: true },
  { id: "waw", name: "وَاو", isolated: "و", initial: "و", medial: "ـو", final: "ـو", transliteration: "w / ū", soundDe: "wie engl. „w“; auch langer Vokal „u“", connectsForward: false },
  { id: "ya", name: "يَاء", isolated: "ي", initial: "يـ", medial: "ـيـ", final: "ـي", transliteration: "y / ī", soundDe: "wie deutsches „j“; auch langer Vokal „i“", connectsForward: true },
];

/** Extra letter-shapes every reader needs beyond the 28-letter table above. */
export const ADDITIONAL_SIGNS: ArabicSign[] = [
  { id: "hamza", symbol: "ء", name: "Hamza", transliteration: "ʾ", soundDe: "kurzer Stimmabsatz (Knacklaut), wie vor jedem deutschen Vokal am Wortanfang", example: "قُرْآن" },
  { id: "alif-hamza-above", symbol: "أ", name: "Alif mit Hamza oben", transliteration: "a/u + ʾ", soundDe: "Alif, das den Hamza-Anlaut trägt", example: "أَحَد" },
  { id: "alif-hamza-below", symbol: "إ", name: "Alif mit Hamza unten", transliteration: "i + ʾ", soundDe: "Alif mit Hamza, gefolgt von kurzem „i“", example: "إِيَّاكَ" },
  { id: "alif-madda", symbol: "آ", name: "Alif mit Madda", transliteration: "ā", soundDe: "gedehntes, betontes langes „a“", example: "آدَم" },
  { id: "ta-marbuta", symbol: "ة", name: "Ta marbuta", transliteration: "a/ah / t", soundDe: "markiert oft weibliche Wortformen; am Satzende meist stumm bzw. „-a“, in Verbindung „-at“", example: "مَدْرَسَة" },
  { id: "alif-maqsura", symbol: "ى", name: "Alif maqsura", transliteration: "ā", soundDe: "klingt wie Alif (langes „a“), sieht aber aus wie ein Ya ohne Punkte", example: "عَلَى" },
];

/** Harakat: the short-vowel and other diacritics that fully vocalize Quran text. */
export const VOWEL_MARKS: ArabicSign[] = [
  { id: "fatha", symbol: "َ", name: "Fatha", transliteration: "a", soundDe: "kurzes „a“", example: "بَ" },
  { id: "kasra", symbol: "ِ", name: "Kasra", transliteration: "i", soundDe: "kurzes „i“", example: "بِ" },
  { id: "damma", symbol: "ُ", name: "Damma", transliteration: "u", soundDe: "kurzes „u“", example: "بُ" },
  { id: "sukun", symbol: "ْ", name: "Sukun", transliteration: "–", soundDe: "kein Vokal danach (Konsonant ohne folgenden Laut)", example: "بْ" },
  { id: "shadda", symbol: "ّ", name: "Shadda", transliteration: "Verdopplung", soundDe: "verdoppelt den Konsonanten", example: "بّ" },
  { id: "tanwin-fath", symbol: "ً", name: "Tanwin Fath", transliteration: "an", soundDe: "„-an“ am Wortende (unbestimmte Endung)", example: "بًا" },
  { id: "tanwin-kasr", symbol: "ٍ", name: "Tanwin Kasr", transliteration: "in", soundDe: "„-in“ am Wortende (unbestimmte Endung)", example: "بٍ" },
  { id: "tanwin-damm", symbol: "ٌ", name: "Tanwin Damm", transliteration: "un", soundDe: "„-un“ am Wortende (unbestimmte Endung)", example: "بٌ" },
];
