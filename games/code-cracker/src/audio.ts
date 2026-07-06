// Tiny WebAudio SFX engine — one shared AudioContext, oscillator-based blips.
// Ported from wizkidzboothgames/app/src/audio.js

type OscType = 'square' | 'triangle' | 'sawtooth' | 'sine';

export class Sfx {
  private _ctx: AudioContext | null = null;
  private readonly _getSoundOn: () => boolean;

  constructor(getSoundOn: () => boolean) {
    this._getSoundOn = getSoundOn;
  }

  private ctx(): AudioContext {
    if (!this._ctx) {
      const AC = (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ?? AudioContext;
      this._ctx = new AC();
    }
    if (this._ctx.state === 'suspended') void this._ctx.resume();
    return this._ctx;
  }

  tone(freq: number, dur = 0.12, type: OscType = 'square', vol = 0.18, delay = 0): void {
    if (!this._getSoundOn()) return;
    try {
      const ctx = this.ctx();
      const t0 = ctx.currentTime + delay;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.05);
    } catch {
      /* audio unavailable */
    }
  }

  blip()    { this.tone(520, 0.07, 'square',    0.12); }
  good()    { this.tone(660, 0.1,  'triangle',  0.22); this.tone(990, 0.16, 'triangle', 0.22, 0.09); }
  bad()     { this.tone(150, 0.3,  'sawtooth',  0.2); }
  go()      { this.tone(880, 0.2,  'triangle',  0.25); }
  collect() { this.tone(1046, 0.1, 'triangle',  0.2);  this.tone(1318, 0.12, 'triangle', 0.2, 0.08); }
  fanfare() { [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.22, i * 0.13)); }
  pad(i: number) { this.tone([392, 523, 659][i], 0.28, 'triangle', 0.25); }
}
