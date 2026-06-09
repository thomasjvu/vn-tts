import type { VnTtsOptions, VnTtsResult } from "./types";
import { addWavHeader, floatToUint8 } from "./wav";

const DEFAULT_BASE_FREQUENCY = 250;
const DEFAULT_PITCH = 1;
const DEFAULT_SPEED = 1;
const DEFAULT_SAMPLE_RATE = 8000;
const DEFAULT_VOWEL_VOLUME = 0.4;
const DEFAULT_CONSONANT_VOLUME = 0.3;

function clampMultiplier(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return Math.min(4, Math.max(0.25, value));
}

function scaleDurationMs(durationMs: number, speed: number): number {
  return Math.max(5, durationMs / speed);
}

function generateBeep(
  frequency: number,
  durationMs: number,
  sampleRate: number,
  volume: number = 0.5,
): Float32Array {
  const numSamples = Math.floor((durationMs / 1000) * sampleRate);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let envelope = 1;
    const attackSamples = Math.floor(sampleRate * 0.01);
    const releaseSamples = Math.floor(sampleRate * 0.02);

    if (i < attackSamples) {
      envelope = i / attackSamples;
    } else if (i > numSamples - releaseSamples) {
      envelope = (numSamples - i) / releaseSamples;
    }

    samples[i] = Math.sin(2 * Math.PI * frequency * t) * volume * envelope;
  }

  return samples;
}

function isVowel(char: string): boolean {
  return /[aeiouAEIOU]/.test(char);
}

function getFrequencyForChar(char: string, baseFreq: number): number {
  const charCode = char.toLowerCase().charCodeAt(0);

  if (isVowel(char)) {
    return baseFreq + (charCode % 50);
  }
  if (/[bcdfghjklmnpqrstvwxyz]/i.test(char)) {
    return baseFreq - 30 + (charCode % 40);
  }

  return baseFreq;
}

function synthesizePcm(options: Required<
  Pick<
    VnTtsOptions,
    | "text"
    | "baseFrequency"
    | "pitch"
    | "speed"
    | "sampleRate"
    | "vowelVolume"
    | "consonantVolume"
  >
>): { pcm: Uint8Array; sampleRate: number; durationMs: number } {
  const { text, baseFrequency, pitch, speed, sampleRate, vowelVolume, consonantVolume } =
    options;
  const effectiveBaseFrequency = baseFrequency * pitch;
  const allSamples: Float32Array[] = [];
  const cleanedText = text.replace(/[^a-zA-Z ]/g, " ").trim();

  if (cleanedText.length === 0) {
    const silenceLength = Math.floor(sampleRate * 0.1);
    return {
      pcm: addWavHeader(new Uint8Array(silenceLength).fill(127), sampleRate),
      sampleRate,
      durationMs: 100,
    };
  }

  for (const char of cleanedText) {
    if (char === " ") {
      const gapMs = scaleDurationMs(50, speed);
      allSamples.push(new Float32Array(Math.floor((gapMs / 1000) * sampleRate)));
      continue;
    }

    const freq = getFrequencyForChar(char, effectiveBaseFrequency);
    const isV = isVowel(char);
    const baseDuration = isV
      ? 80 + (char.charCodeAt(0) % 40)
      : 30 + (char.charCodeAt(0) % 20);
    const duration = scaleDurationMs(baseDuration, speed);
    const volume = isV ? vowelVolume : consonantVolume;

    allSamples.push(generateBeep(freq, duration, sampleRate, volume));
    const charGapMs = scaleDurationMs(20, speed);
    allSamples.push(new Float32Array(Math.floor((charGapMs / 1000) * sampleRate)));
  }

  const totalLength = allSamples.reduce((sum, arr) => sum + arr.length, 0);
  const combined = new Float32Array(totalLength);
  let offset = 0;
  for (const samples of allSamples) {
    combined.set(samples, offset);
    offset += samples.length;
  }

  const uint8Samples = floatToUint8(combined);
  const audio = addWavHeader(uint8Samples, sampleRate);
  const durationMs = Math.round((totalLength / sampleRate) * 1000);

  return { pcm: audio, sampleRate, durationMs };
}

export function synthesize(options: VnTtsOptions): VnTtsResult {
  const sampleRate = options.sampleRate ?? DEFAULT_SAMPLE_RATE;
  const { pcm, durationMs } = synthesizePcm({
    text: options.text,
    baseFrequency: options.baseFrequency ?? DEFAULT_BASE_FREQUENCY,
    pitch: clampMultiplier(options.pitch ?? DEFAULT_PITCH, DEFAULT_PITCH),
    speed: clampMultiplier(options.speed ?? DEFAULT_SPEED, DEFAULT_SPEED),
    sampleRate,
    vowelVolume: options.vowelVolume ?? DEFAULT_VOWEL_VOLUME,
    consonantVolume: options.consonantVolume ?? DEFAULT_CONSONANT_VOLUME,
  });

  return {
    audio: pcm,
    mimeType: "audio/wav",
    sampleRate,
    durationMs,
  };
}

export function synthesizeToArrayBuffer(options: VnTtsOptions): ArrayBuffer {
  const { audio } = synthesize(options);
  return audio.buffer.slice(audio.byteOffset, audio.byteOffset + audio.byteLength) as ArrayBuffer;
}

export function synthesizeToBlob(options: VnTtsOptions): Blob {
  const buffer = synthesizeToArrayBuffer(options);
  return new Blob([buffer], { type: "audio/wav" });
}

export function createObjectUrl(options: VnTtsOptions): string {
  return URL.createObjectURL(synthesizeToBlob(options));
}