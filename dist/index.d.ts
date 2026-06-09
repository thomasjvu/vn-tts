interface VnTtsOptions {
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
interface VnTtsResult {
    audio: Uint8Array;
    mimeType: "audio/wav";
    sampleRate: number;
    durationMs: number;
}

declare function synthesize(options: VnTtsOptions): VnTtsResult;
declare function synthesizeToArrayBuffer(options: VnTtsOptions): ArrayBuffer;
declare function synthesizeToBlob(options: VnTtsOptions): Blob;
declare function createObjectUrl(options: VnTtsOptions): string;

export { type VnTtsOptions, type VnTtsResult, createObjectUrl, synthesize, synthesizeToArrayBuffer, synthesizeToBlob };
