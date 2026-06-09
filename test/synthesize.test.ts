import { describe, expect, it } from "vitest";
import { synthesize } from "../src/synthesize";

function readAscii(view: DataView, offset: number, length: number): string {
  let value = "";
  for (let i = 0; i < length; i++) {
    value += String.fromCharCode(view.getUint8(offset + i));
  }
  return value;
}

describe("synthesize", () => {
  it("returns a valid WAV for sample text", () => {
    const result = synthesize({ text: "Hello" });

    expect(result.mimeType).toBe("audio/wav");
    expect(result.sampleRate).toBe(8000);
    expect(result.durationMs).toBeGreaterThan(0);
    expect(result.audio.length).toBeGreaterThan(44);

    const view = new DataView(
      result.audio.buffer,
      result.audio.byteOffset,
      result.audio.byteLength,
    );
    expect(readAscii(view, 0, 4)).toBe("RIFF");
    expect(readAscii(view, 8, 4)).toBe("WAVE");
  });

  it("returns short silence for empty text", () => {
    const result = synthesize({ text: "   !!!" });
    expect(result.durationMs).toBe(100);
    expect(result.audio.length).toBeGreaterThan(0);
  });

  it("respects custom base frequency and sample rate", () => {
    const result = synthesize({
      text: "abc",
      baseFrequency: 300,
      sampleRate: 16000,
    });

    expect(result.sampleRate).toBe(16000);
    expect(result.durationMs).toBeGreaterThan(0);
  });

  it("speeds up output when speed is above 1", () => {
    const normal = synthesize({ text: "hello world" });
    const fast = synthesize({ text: "hello world", speed: 2 });

    expect(fast.durationMs).toBeLessThan(normal.durationMs);
  });

  it("supports pitch multiplier without changing timing", () => {
    const normal = synthesize({ text: "hello" });
    const higher = synthesize({ text: "hello", pitch: 1.5 });

    expect(higher.durationMs).toBe(normal.durationMs);
    expect(higher.audio.length).toBe(normal.audio.length);
  });
});