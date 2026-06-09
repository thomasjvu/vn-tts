import {
  createObjectUrl,
  synthesize,
  synthesizeToBlob,
  type VnTtsOptions,
} from "@phantasy/vn-tts";
import "./style.css";

type SnippetTab = "install" | "node" | "browser" | "phantasy";

interface DemoState {
  text: string;
  pitch: number;
  speed: number;
  vowelVolume: number;
  consonantVolume: number;
  activeTab: SnippetTab;
  status: string;
}

const state: DemoState = {
  text: "Hello! This is visual novel style speech.",
  pitch: 1,
  speed: 1,
  vowelVolume: 0.4,
  consonantVolume: 0.3,
  activeTab: "install",
  status: "",
};

let currentAudioUrl: string | null = null;
let currentAudio: HTMLAudioElement | null = null;

function getOptions(): VnTtsOptions {
  return {
    text: state.text,
    pitch: state.pitch,
    speed: state.speed,
    vowelVolume: state.vowelVolume,
    consonantVolume: state.consonantVolume,
  };
}

function escapeForJson(value: string): string {
  return JSON.stringify(value);
}

function formatMultiplier(value: number): string {
  return `${value.toFixed(2)}x`;
}

function buildSnippet(tab: SnippetTab): string {
  const options = getOptions();

  switch (tab) {
    case "install":
      return [
        "npm install @phantasy/vn-tts",
        "bun add @phantasy/vn-tts",
        "pnpm add @phantasy/vn-tts",
      ].join("\n");
    case "node":
      return `import { writeFileSync } from "node:fs";
import { synthesize } from "@phantasy/vn-tts";

const { audio, durationMs } = synthesize({
  text: ${escapeForJson(options.text)},
  pitch: ${options.pitch},
  speed: ${options.speed},
  vowelVolume: ${options.vowelVolume},
  consonantVolume: ${options.consonantVolume},
});

writeFileSync("output.wav", audio);
console.log(\`Wrote output.wav (\${durationMs}ms)\`);`;
    case "browser":
      return `import { createObjectUrl } from "@phantasy/vn-tts";

const url = createObjectUrl({
  text: ${escapeForJson(options.text)},
  pitch: ${options.pitch},
  speed: ${options.speed},
  vowelVolume: ${options.vowelVolume},
  consonantVolume: ${options.consonantVolume},
});

const audio = new Audio(url);
await audio.play();`;
    case "phantasy":
      return JSON.stringify(
        {
          voice_provider: "vn-tts",
          voice_model: "vn-tts",
          voice_voice: "default",
          providers: {
            "vn-tts": { enabled: true },
          },
        },
        null,
        2,
      );
  }
}

function revokeAudioUrl(): void {
  if (currentAudioUrl) {
    URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = null;
  }
}

async function playAudio(): Promise<void> {
  revokeAudioUrl();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  const result = synthesize(getOptions());
  currentAudioUrl = createObjectUrl(getOptions());
  currentAudio = new Audio(currentAudioUrl);
  await currentAudio.play();
  state.status = `Playing ${result.durationMs}ms WAV (${result.audio.length} bytes)`;
  render();
}

function downloadAudio(): void {
  const blob = synthesizeToBlob(getOptions());
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "vn-tts.wav";
  anchor.click();
  URL.revokeObjectURL(url);
  state.status = "Downloaded vn-tts.wav";
  render();
}

function render(): void {
  const root = document.querySelector("#app");
  if (!root) return;

  root.innerHTML = `
    <h1>vn-tts playground</h1>
    <p class="lead">Visual novel style local TTS — tune pitch, speed, preview audio, copy install snippets.</p>

    <section>
      <h2>Text</h2>
      <label>
        <textarea id="text-input">${state.text}</textarea>
      </label>
    </section>

    <section>
      <h2>Configuration</h2>
      <label>
        Pitch
        <div class="rangeRow">
          <input id="pitch" type="range" min="0.5" max="2" step="0.05" value="${state.pitch}" />
          <span class="rangeValue">${formatMultiplier(state.pitch)}</span>
        </div>
      </label>
      <label>
        Speed
        <div class="rangeRow">
          <input id="speed" type="range" min="0.5" max="2" step="0.05" value="${state.speed}" />
          <span class="rangeValue">${formatMultiplier(state.speed)}</span>
        </div>
      </label>
      <label>
        Vowel volume
        <div class="rangeRow">
          <input id="vowel-volume" type="range" min="0.1" max="0.8" step="0.05" value="${state.vowelVolume}" />
          <span class="rangeValue">${state.vowelVolume.toFixed(2)}</span>
        </div>
      </label>
      <label>
        Consonant volume
        <div class="rangeRow">
          <input id="consonant-volume" type="range" min="0.1" max="0.8" step="0.05" value="${state.consonantVolume}" />
          <span class="rangeValue">${state.consonantVolume.toFixed(2)}</span>
        </div>
      </label>
      <div class="actions">
        <button type="button" id="play-btn">Play</button>
        <button type="button" id="download-btn">Download WAV</button>
      </div>
      ${state.status ? `<p class="status">${state.status}</p>` : ""}
    </section>

    <section>
      <h2>Snippets</h2>
      <div class="snippetTabs">
        ${(["install", "node", "browser", "phantasy"] as SnippetTab[])
          .map(
            (tab) =>
              `<button type="button" data-tab="${tab}" class="${state.activeTab === tab ? "active" : ""}">${tab}</button>`,
          )
          .join("")}
      </div>
      <pre><code>${buildSnippet(state.activeTab)}</code></pre>
    </section>
  `;

  document.querySelector<HTMLTextAreaElement>("#text-input")?.addEventListener("input", (event) => {
    state.text = (event.target as HTMLTextAreaElement).value;
    render();
  });

  document.querySelector<HTMLInputElement>("#pitch")?.addEventListener("input", (event) => {
    state.pitch = Number((event.target as HTMLInputElement).value);
    render();
  });

  document.querySelector<HTMLInputElement>("#speed")?.addEventListener("input", (event) => {
    state.speed = Number((event.target as HTMLInputElement).value);
    render();
  });

  document.querySelector<HTMLInputElement>("#vowel-volume")?.addEventListener("input", (event) => {
    state.vowelVolume = Number((event.target as HTMLInputElement).value);
    render();
  });

  document.querySelector<HTMLInputElement>("#consonant-volume")?.addEventListener("input", (event) => {
    state.consonantVolume = Number((event.target as HTMLInputElement).value);
    render();
  });

  document.querySelector("#play-btn")?.addEventListener("click", () => {
    void playAudio();
  });

  document.querySelector("#download-btn")?.addEventListener("click", downloadAudio);

  document.querySelectorAll<HTMLButtonElement>("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab as SnippetTab;
      render();
    });
  });
}

render();