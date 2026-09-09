import type { PronunciationScore } from "@koran-app/shared";

export interface PronunciationAttempt {
  arabicText: string;
  transliteration: string;
  /** Duration of the learner's recording, as measured by the recorder itself. */
  recordingDurationMs: number;
  /** Raw audio bytes, kept for scorers that need to send them to an ASR API. */
  audio: Buffer | null;
  mimeType: string | null;
}

export interface PronunciationScorer {
  score(attempt: PronunciationAttempt): Promise<PronunciationScore>;
}

/**
 * Placeholder scorer with NO real speech recognition. It only compares how
 * long the learner's recording is against a rough estimate of how long the
 * phrase should take to recite, so the app has a working end-to-end feedback
 * loop while a real ASR-based scorer is not configured.
 *
 * This intentionally cannot judge whether the learner said the right words,
 * or whether individual letters (e.g. ﻉ ayn vs. ء hamza) were pronounced
 * correctly. Do not present its output to users as verified pronunciation
 * accuracy - see AzurePronunciationScorer below for the real thing.
 */
export class MockDurationHeuristicScorer implements PronunciationScorer {
  private readonly msPerLetter = 90;
  private readonly minPlausibleMs = 150;

  async score(attempt: PronunciationAttempt): Promise<PronunciationScore> {
    if (attempt.recordingDurationMs < this.minPlausibleMs) {
      return {
        score: 0,
        feedback: "Keine Aufnahme erkannt. Bitte sprich den Vers laut und deutlich nach.",
        engine: "mock-heuristic",
      };
    }

    const expectedMs = this.estimateExpectedDurationMs(attempt.transliteration);
    const ratio =
      Math.min(attempt.recordingDurationMs, expectedMs) /
      Math.max(attempt.recordingDurationMs, expectedMs);
    const score = Math.round(ratio * 100);

    let feedback: string;
    if (score >= 85) {
      feedback = "Timing und Länge passen gut zur Referenz.";
    } else if (score >= 60) {
      feedback = "Solide, aber Tempo und Länge weichen noch spürbar von der Referenz ab.";
    } else if (attempt.recordingDurationMs < expectedMs) {
      feedback =
        "Du sprichst vermutlich zu schnell oder lässt Laute aus - artikuliere jeden Buchstaben deutlicher.";
    } else {
      feedback = "Du sprichst deutlich länger als die Referenz - achte auf ein gleichmäßiges Tempo.";
    }

    return { score, feedback, engine: "mock-heuristic" };
  }

  private estimateExpectedDurationMs(transliteration: string): number {
    const letters = transliteration.replace(/[^a-zA-Z']/g, "").length;
    return Math.max(600, letters * this.msPerLetter);
  }
}

/**
 * Real production path: Azure Cognitive Services Speech has a "Pronunciation
 * Assessment" feature that natively supports Arabic (ar-SA) and returns
 * phoneme-level accuracy/fluency/completeness scores against a reference
 * transcript - a much better fit here than generic speech-to-text plus a
 * string diff, because it is purpose-built for exactly this comparison.
 * https://learn.microsoft.com/azure/ai-services/speech-service/pronunciation-assessment-tool
 *
 * This class is a stub: it documents the wiring but throws until real
 * credentials are supplied, rather than silently pretending to work.
 */
export class AzurePronunciationScorer implements PronunciationScorer {
  constructor(
    private readonly speechKey: string | undefined = process.env.AZURE_SPEECH_KEY,
    private readonly speechRegion: string | undefined = process.env.AZURE_SPEECH_REGION
  ) {}

  async score(_attempt: PronunciationAttempt): Promise<PronunciationScore> {
    if (!this.speechKey || !this.speechRegion) {
      throw new Error(
        "AzurePronunciationScorer requires AZURE_SPEECH_KEY and AZURE_SPEECH_REGION. " +
          "Configure an Azure Speech resource and set these env vars to enable real pronunciation scoring."
      );
    }
    throw new Error(
      "Not implemented: send _attempt.audio to the Azure Speech SDK with " +
        "PronunciationAssessmentConfig(referenceText: _attempt.arabicText, language: 'ar-SA') " +
        "and map the returned AccuracyScore/FluencyScore into a PronunciationScore."
    );
  }
}

export function createDefaultScorer(): PronunciationScorer {
  if (process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION) {
    return new AzurePronunciationScorer();
  }
  return new MockDurationHeuristicScorer();
}
