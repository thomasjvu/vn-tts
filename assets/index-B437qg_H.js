(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const n of o)if(n.type==="childList")for(const l of n.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&r(l)}).observe(document,{childList:!0,subtree:!0});function s(o){const n={};return o.integrity&&(n.integrity=o.integrity),o.referrerPolicy&&(n.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?n.credentials="include":o.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function r(o){if(o.ep)return;o.ep=!0;const n=s(o);fetch(o.href,n)}})();function I(e){const t=new Uint8Array(e.length);for(let s=0;s<e.length;s++)t[s]=Math.floor((e[s]+1)*127.5);return t}function V(e,t){const s=new ArrayBuffer(44+e.length),r=new DataView(s),o=(l,d)=>{for(let i=0;i<d.length;i++)r.setUint8(l+i,d.charCodeAt(i))};o(0,"RIFF"),r.setUint32(4,36+e.length,!0),o(8,"WAVE"),o(12,"fmt "),r.setUint32(16,16,!0),r.setUint16(20,1,!0),r.setUint16(22,1,!0),r.setUint32(24,t,!0),r.setUint32(28,t,!0),r.setUint16(32,1,!0),r.setUint16(34,8,!0),o(36,"data"),r.setUint32(40,e.length,!0);const n=new Uint8Array(s);return n.set(e,44),n}var B=250,M=1,S=1,k=8e3,H=.4,W=.3;function T(e,t){return!Number.isFinite(e)||e<=0?t:Math.min(4,Math.max(.25,e))}function w(e,t){return Math.max(5,e/t)}function J(e,t,s,r=.5){const o=Math.floor(t/1e3*s),n=new Float32Array(o);for(let l=0;l<o;l++){const d=l/s;let i=1;const u=Math.floor(s*.01),f=Math.floor(s*.02);l<u?i=l/u:l>o-f&&(i=(o-l)/f),n[l]=Math.sin(2*Math.PI*e*d)*r*i}return n}function E(e){return/[aeiouAEIOU]/.test(e)}function G(e,t){const s=e.toLowerCase().charCodeAt(0);return E(e)?t+s%50:/[bcdfghjklmnpqrstvwxyz]/i.test(e)?t-30+s%40:t}function K(e){const{text:t,baseFrequency:s,pitch:r,speed:o,sampleRate:n,vowelVolume:l,consonantVolume:d}=e,i=s*r,u=[],f=t.replace(/[^a-zA-Z ]/g," ").trim();if(f.length===0){const c=Math.floor(n*.1);return{pcm:V(new Uint8Array(c).fill(127),n),sampleRate:n,durationMs:100}}for(const c of f){if(c===" "){const z=w(50,o);u.push(new Float32Array(Math.floor(z/1e3*n)));continue}const b=G(c,i),L=E(c),D=L?80+c.charCodeAt(0)%40:30+c.charCodeAt(0)%20,N=w(D,o),j=L?l:d;u.push(J(b,N,n,j));const _=w(20,o);u.push(new Float32Array(Math.floor(_/1e3*n)))}const A=u.reduce((c,b)=>c+b.length,0),x=new Float32Array(A);let U=0;for(const c of u)x.set(c,U),U+=c.length;const C=I(x),R=V(C,n),P=Math.round(A/n*1e3);return{pcm:R,sampleRate:n,durationMs:P}}function F(e){const t=e.sampleRate??k,{pcm:s,durationMs:r}=K({text:e.text,baseFrequency:e.baseFrequency??B,pitch:T(e.pitch??M,M),speed:T(e.speed??S,S),sampleRate:t,vowelVolume:e.vowelVolume??H,consonantVolume:e.consonantVolume??W});return{audio:s,mimeType:"audio/wav",sampleRate:t,durationMs:r}}function Q(e){const{audio:t}=F(e);return t.buffer.slice(t.byteOffset,t.byteOffset+t.byteLength)}function O(e){const t=Q(e);return new Blob([t],{type:"audio/wav"})}function Y(e){return URL.createObjectURL(O(e))}const a={text:"Hello! This is visual novel style speech.",pitch:1.05,speed:1,vowelVolume:.42,consonantVolume:.28,activeTab:"install",status:"Ready — hit Play for local sine-wave TTS.",displayed:""};let h=null,v=null,p=null;function y(){return{text:a.text,pitch:a.pitch,speed:a.speed,vowelVolume:a.vowelVolume,consonantVolume:a.consonantVolume}}function m(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}function $(e){return JSON.stringify(e)}function g(e){return`${e.toFixed(2)}x`}function Z(e){const t=y();switch(e){case"install":return["npm install @phantasy/vn-tts","bun add @phantasy/vn-tts","pnpm add @phantasy/vn-tts"].join(`
`);case"browser":return`import { createObjectUrl } from "@phantasy/vn-tts";

const url = createObjectUrl({
  text: ${$(t.text)},
  pitch: ${t.pitch},
  speed: ${t.speed},
});

await new Audio(url).play();`;case"node":return`import { writeFileSync } from "node:fs";
import { synthesize } from "@phantasy/vn-tts";

const { audio, durationMs } = synthesize({
  text: ${$(t.text)},
  pitch: ${t.pitch},
  speed: ${t.speed},
});

writeFileSync("output.wav", audio);
console.log(\`Wrote output.wav (\${durationMs}ms)\`);`}}function X(){h&&(URL.revokeObjectURL(h),h=null)}function ee(e){p&&window.clearInterval(p),a.displayed="";let t=0;const s=Math.max(18,Math.round(28/a.speed));p=window.setInterval(()=>{t+=1,a.displayed=e.slice(0,t);const r=document.querySelector("#dialogue-text");r&&(r.innerHTML=`${m(a.displayed)}<span class="cursor"></span>`),t>=e.length&&p&&(window.clearInterval(p),p=null)},s)}async function te(){X(),v&&(v.pause(),v=null);const e=F(y());h=Y(y()),v=new Audio(h),ee(a.text),await v.play(),a.status=`Playing ${e.durationMs}ms · ${e.audio.length} bytes · 100% local`;const t=document.querySelector("#status");t&&(t.textContent=a.status)}function ne(){const e=O(y()),t=URL.createObjectURL(e),s=document.createElement("a");s.href=t,s.download="vn-tts.wav",s.click(),URL.revokeObjectURL(t),a.status="Downloaded vn-tts.wav";const r=document.querySelector("#status");r&&(r.textContent=a.status)}function oe(){var t,s,r,o;(t=document.querySelector("#text-input"))==null||t.addEventListener("input",n=>{a.text=n.target.value});const e=[["#pitch","pitch"],["#speed","speed"],["#vowel-volume","vowelVolume"],["#consonant-volume","consonantVolume"]];for(const[n,l]of e)(s=document.querySelector(n))==null||s.addEventListener("input",d=>{const i=Number(d.target.value);a[l]=i;const u=document.querySelector(`${n}-value`);u&&(u.textContent=l==="pitch"||l==="speed"?g(i):i.toFixed(2))});(r=document.querySelector("#play-btn"))==null||r.addEventListener("click",()=>{te()}),(o=document.querySelector("#download-btn"))==null||o.addEventListener("click",ne),document.querySelectorAll("[data-tab]").forEach(n=>{n.addEventListener("click",()=>{a.activeTab=n.dataset.tab,q()})})}function q(){const e=document.querySelector("#app");e&&(e.innerHTML=`
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
        <p class="dialogue-text" id="dialogue-text">${m(a.displayed||a.text)}<span class="cursor"></span></p>
      </div>
    </section>

    <section class="controls">
      <h2>Playground</h2>
      <label>
        Line
        <textarea id="text-input">${m(a.text)}</textarea>
      </label>
      <div class="grid">
        <label>
          Pitch
          <div class="rangeRow">
            <input id="pitch" type="range" min="0.5" max="2" step="0.05" value="${a.pitch}" />
            <span class="rangeValue" id="pitch-value">${g(a.pitch)}</span>
          </div>
        </label>
        <label>
          Speed
          <div class="rangeRow">
            <input id="speed" type="range" min="0.5" max="2" step="0.05" value="${a.speed}" />
            <span class="rangeValue" id="speed-value">${g(a.speed)}</span>
          </div>
        </label>
        <label>
          Vowel volume
          <div class="rangeRow">
            <input id="vowel-volume" type="range" min="0.1" max="0.8" step="0.05" value="${a.vowelVolume}" />
            <span class="rangeValue" id="vowel-volume-value">${a.vowelVolume.toFixed(2)}</span>
          </div>
        </label>
        <label>
          Consonant volume
          <div class="rangeRow">
            <input id="consonant-volume" type="range" min="0.1" max="0.8" step="0.05" value="${a.consonantVolume}" />
            <span class="rangeValue" id="consonant-volume-value">${a.consonantVolume.toFixed(2)}</span>
          </div>
        </label>
      </div>
      <div class="actions">
        <button type="button" class="primary" id="play-btn">Play</button>
        <button type="button" id="download-btn">Download WAV</button>
      </div>
      <p class="status" id="status">${m(a.status)}</p>
    </section>

    <section class="snippets">
      <h2>Snippets</h2>
      <div class="snippetTabs">
        ${["install","browser","node"].map(t=>`<button type="button" data-tab="${t}" class="${a.activeTab===t?"active":""}">${t}</button>`).join("")}
      </div>
      <pre><code>${m(Z(a.activeTab))}</code></pre>
    </section>
  `,oe())}q();
