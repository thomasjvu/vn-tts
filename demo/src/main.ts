import {
  createObjectUrl,
  synthesize,
  synthesizeToBlob,
  type VnTtsOptions,
} from "@phantasy/vn-tts";
import "./style.css";

type SnippetTab = "install" | "browser" | "node";

interface DemoState {
  text: string;
  pitch: number;
  speed: number;
  vowelVolume: number;
  consonantVolume: number;
  activeTab: SnippetTab;
  status: string;
  displayed: string;
}

const state: DemoState = {
  text: "Hello! This is visual novel style speech.",
  pitch: 1.05,
  speed: 1,
  vowelVolume: 0.42,
  consonantVolume: 0.28,
  activeTab: "install",
  status: "Ready — hit Play for local sine-wave TTS.",
  displayed: "",
};

let currentAudioUrl: string | null = null;
let currentAudio: HTMLAudioElement | null = null;
let typeTimer: number | null = null;

function getOptions(): VnTtsOptions {
  return {
    text: state.text,
    pitch: state.pitch,
    speed: state.speed,
    vowelVolume: state.vowelVolume,
    consonantVolume: state.consonantVolume,
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
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
    case "browser":
      return `import { createObjectUrl } from "@phantasy/vn-tts";

const url = createObjectUrl({
  text: ${escapeForJson(options.text)},
  pitch: ${options.pitch},
  speed: ${options.speed},
});

await new Audio(url).play();`;
    case "node":
      return `import { writeFileSync } from "node:fs";
import { synthesize } from "@phantasy/vn-tts";

const { audio, durationMs } = synthesize({
  text: ${escapeForJson(options.text)},
  pitch: ${options.pitch},
  speed: ${options.speed},
});

writeFileSync("output.wav", audio);
console.log(\`Wrote output.wav (\${durationMs}ms)\`);`;
  }
}

function revokeAudioUrl(): void {
  if (currentAudioUrl) {
    URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = null;
  }
}

function typeText(full: string): void {
  if (typeTimer) window.clearInterval(typeTimer);
  state.displayed = "";
  let i = 0;
  const step = Math.max(18, Math.round(28 / state.speed));
  typeTimer = window.setInterval(() => {
    i += 1;
    state.displayed = full.slice(0, i);
    const el = document.querySelector("#dialogue-text");
    if (el) {
      el.innerHTML = `${escapeHtml(state.displayed)}<span class="cursor"></span>`;
    }
    if (i >= full.length && typeTimer) {
      window.clearInterval(typeTimer);
      typeTimer = null;
    }
  }, step);
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
  typeText(state.text);
  await currentAudio.play();
  state.status = `Playing ${result.durationMs}ms · ${result.audio.length} bytes · 100% local`;
  const status = document.querySelector("#status");
  if (status) status.textContent = state.status;
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
  const status = document.querySelector("#status");
  if (status) status.textContent = state.status;
}

function bindControls(): void {
  document.querySelector<HTMLTextAreaElement>("#text-input")?.addEventListener("input", (event) => {
    state.text = (event.target as HTMLTextAreaElement).value;
  });

  const map: Array<[string, keyof DemoState]> = [
    ["#pitch", "pitch"],
    ["#speed", "speed"],
    ["#vowel-volume", "vowelVolume"],
    ["#consonant-volume", "consonantVolume"],
  ];

  for (const [sel, key] of map) {
    document.querySelector<HTMLInputElement>(sel)?.addEventListener("input", (event) => {
      const value = Number((event.target as HTMLInputElement).value);
      (state as unknown as Record<string, number>)[key] = value;
      const label = document.querySelector(`${sel}-value`);
      if (!label) return;
      label.textContent =
        key === "pitch" || key === "speed" ? formatMultiplier(value) : value.toFixed(2);
    });
  }

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

function render(): void {
  const root = document.querySelector("#app");
  if (!root) return;

  root.innerHTML = `
    <header class="topbar">
      <div class="brand">
        <h1>vn-tts</h1>
        <p>Visual novel TTS · local sine-wave beeps · zero dependencies</p>
      </div>
      <span class="pill">@phantasy/vn-tts</span>
    </header>

    <section class="stage" aria-label="Visual novel preview">
      <div class="stage-art"><div class="speaker" aria-hidden="true"></div></div>
      <div class="dialogue">
        <div class="dialogue-name">Narrator</div>
        <p class="dialogue-text" id="dialogue-text">${escapeHtml(state.displayed || state.text)}<span class="cursor"></span></p>
      </div>
    </section>

    <section class="controls">
      <h2>Playground</h2>
      <label>
        Line
        <textarea id="text-input">${escapeHtml(state.text)}</textarea>
      </label>
      <div class="grid">
        <label>
          Pitch
          <div class="rangeRow">
            <input id="pitch" type="range" min="0.5" max="2" step="0.05" value="${state.pitch}" />
            <span class="rangeValue" id="pitch-value">${formatMultiplier(state.pitch)}</span>
          </div>
        </label>
        <label>
          Speed
          <div class="rangeRow">
            <input id="speed" type="range" min="0.5" max="2" step="0.05" value="${state.speed}" />
            <span class="rangeValue" id="speed-value">${formatMultiplier(state.speed)}</span>
          </div>
        </label>
        <label>
          Vowel volume
          <div class="rangeRow">
            <input id="vowel-volume" type="range" min="0.1" max="0.8" step="0.05" value="${state.vowelVolume}" />
            <span class="rangeValue" id="vowel-volume-value">${state.vowelVolume.toFixed(2)}</span>
          </div>
        </label>
        <label>
          Consonant volume
          <div class="rangeRow">
            <input id="consonant-volume" type="range" min="0.1" max="0.8" step="0.05" value="${state.consonantVolume}" />
            <span class="rangeValue" id="consonant-volume-value">${state.consonantVolume.toFixed(2)}</span>
          </div>
        </label>
      </div>
      <div class="actions">
        <button type="button" class="primary" id="play-btn">Play</button>
        <button type="button" id="download-btn">Download WAV</button>
      </div>
      <p class="status" id="status">${escapeHtml(state.status)}</p>
    </section>

    <section class="snippets">
      <h2>Snippets</h2>
      <div class="snippetTabs">
        ${(["install", "browser", "node"] as SnippetTab[])
          .map(
            (tab) =>
              `<button type="button" data-tab="${tab}" class="${state.activeTab === tab ? "active" : ""}">${tab}</button>`,
          )
          .join("")}
      </div>
      <pre><code>${escapeHtml(buildSnippet(state.activeTab))}</code></pre>
    </section>
  `;

  bindControls();
}

render();
