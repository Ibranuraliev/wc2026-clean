/**
 * Synthesized football sound effects via Web Audio API.
 * No external files, no copyright issues — small short tones.
 */

let _ctx: AudioContext | null = null;
let enabled = true;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_ctx) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      _ctx = new Ctor();
    } catch {
      return null;
    }
  }
  return _ctx;
}

export function setSoundsEnabled(v: boolean) { enabled = v; }
export function getSoundsEnabled(): boolean { return enabled; }

function tone(freq: number, durMs: number, opts?: { type?: OscillatorType; vol?: number; attack?: number; release?: number; sweepTo?: number }) {
  if (!enabled) return;
  const c = ctx(); if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = opts?.type ?? "sine";
  o.frequency.value = freq;
  if (opts?.sweepTo !== undefined) {
    o.frequency.exponentialRampToValueAtTime(opts.sweepTo, c.currentTime + durMs / 1000);
  }
  const vol = opts?.vol ?? 0.18;
  const attack = opts?.attack ?? 0.005;
  const release = opts?.release ?? 0.1;
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(vol, c.currentTime + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + durMs / 1000 + release);
  o.connect(g); g.connect(c.destination);
  o.start();
  o.stop(c.currentTime + durMs / 1000 + release);
}

function whitenoise(durMs: number, vol = 0.12) {
  if (!enabled) return;
  const c = ctx(); if (!c) return;
  const buf = c.createBuffer(1, c.sampleRate * (durMs / 1000), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * vol;
  const src = c.createBufferSource();
  src.buffer = buf;
  src.connect(c.destination);
  src.start();
}

/** Referee whistle on dice roll. */
export function sfxWhistle() {
  tone(2000, 80, { type: "square", vol: 0.12 });
  setTimeout(() => tone(2400, 120, { type: "square", vol: 0.12 }), 90);
}

/** GOOOAL — celebratory rising tone + crowd burst. */
export function sfxGoal() {
  tone(220, 350, { type: "sawtooth", vol: 0.14, sweepTo: 660 });
  setTimeout(() => whitenoise(300, 0.08), 50);
  setTimeout(() => tone(880, 200, { type: "triangle", vol: 0.12 }), 350);
}

/** Crowd boo when paying rent to someone. */
export function sfxBoo() {
  tone(160, 400, { type: "sawtooth", vol: 0.13, sweepTo: 110 });
}

/** Buy a country — cha-ching style ascending arpeggio. */
export function sfxBuy() {
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => tone(f, 90, { type: "triangle", vol: 0.1 }), i * 70);
  });
}

/** Trophy fanfare — major arpeggio. */
export function sfxFanfare() {
  const notes = [523, 659, 784, 1047, 1319];
  notes.forEach((f, i) => {
    setTimeout(() => tone(f, 220, { type: "triangle", vol: 0.13 }), i * 110);
  });
  setTimeout(() => tone(1568, 600, { type: "sine", vol: 0.14 }), notes.length * 110);
}

/** Red card — short low buzz. */
export function sfxRedCard() {
  tone(140, 500, { type: "square", vol: 0.14 });
  setTimeout(() => tone(110, 400, { type: "square", vol: 0.12 }), 200);
}

/** Yellow card — single short buzz. */
export function sfxYellowCard() {
  tone(280, 200, { type: "square", vol: 0.1 });
}

/** Card draw — page flip swoosh. */
export function sfxCardDraw() {
  whitenoise(120, 0.06);
}
