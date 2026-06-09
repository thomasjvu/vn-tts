# @phantasy/vn-tts

Visual novel style text-to-speech — local sine-wave beeps, zero dependencies.

Each character becomes a short pitched tone (vowels longer and softer, consonants shorter and sharper). The result is stylized VN gibberish, not intelligible speech.

## Install

```bash
npm install @phantasy/vn-tts
# or
bun add @phantasy/vn-tts
```

Until the package is published to npm, install from Git:

```bash
npm install git+https://github.com/phantasy-bot/vn-tts.git
bun add git+https://github.com/phantasy-bot/vn-tts.git
```

## Usage

### Node / Bun

```ts
import { writeFileSync } from "node:fs";
import { synthesize } from "@phantasy/vn-tts";

const { audio } = synthesize({ text: "Hello world" });
writeFileSync("output.wav", audio);
```

### Browser

```ts
import { createObjectUrl, synthesizeToBlob } from "@phantasy/vn-tts";

const url = createObjectUrl({ text: "Hello world" });
const audio = new Audio(url);
await audio.play();

// or download
const blob = synthesizeToBlob({ text: "Hello world" });
```

### Options

```ts
synthesize({
  text: "Hello",
  baseFrequency: 250,   // Hz, default 250
  sampleRate: 8000,     // default 8000
  vowelVolume: 0.4,     // default 0.4
  consonantVolume: 0.3, // default 0.3
});
```

## Phantasy

vn-tts is an optional TTS provider in [Phantasy](https://github.com/phantasy-bot/companion):

```bash
phantasy extensions install provider vn-tts
phantasy setup provider --provider vn-tts --enabled true
```

```json
{
  "voice_provider": "vn-tts",
  "voice_model": "vn-tts",
  "voice_voice": "default",
  "providers": {
    "vn-tts": { "enabled": true }
  }
}
```

## Demo

Run the playground locally:

```bash
npm install
npm run demo
```

Or visit the [live demo](https://phantasy-bot.github.io/vn-tts/) after GitHub Pages deploy.

## License

MIT