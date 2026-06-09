export interface VnTtsOptions {
  text: string;
  /** Base pitch in Hz. Default 250 (feminine range). */
  baseFrequency?: number;
  /** Output sample rate. Default 8000. */
  sampleRate?: number;
  /** Vowel loudness 0–1. Default 0.4. */
  vowelVolume?: number;
  /** Consonant loudness 0–1. Default 0.3. */
  consonantVolume?: number;
}

export interface VnTtsResult {
  audio: Uint8Array;
  mimeType: "audio/wav";
  sampleRate: number;
  durationMs: number;
}