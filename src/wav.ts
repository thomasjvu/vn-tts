export function floatToUint8(samples: Float32Array): Uint8Array {
  const result = new Uint8Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    result[i] = Math.floor((samples[i] + 1) * 127.5);
  }
  return result;
}

export function addWavHeader(samples: Uint8Array, sampleRate: number): Uint8Array {
  const buffer = new ArrayBuffer(44 + samples.length);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  writeString(36, "data");
  view.setUint32(40, samples.length, true);

  const result = new Uint8Array(buffer);
  result.set(samples, 44);
  return result;
}