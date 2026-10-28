// The sound board: six short foley hits made with the Web Audio API only (no audio files, no libraries).
//   snap     a dry click                          crunch   a handful of filtered noise grains (celery)
//   clop     two hollow wood knocks (coconuts)    whistle  a sine sweep with a little vibrato and steam (kettle)
//   steps    two pitched thumps with gravel       wave     a cloth whoosh and a falling two-note "bye-bye"
// Rules: one AudioContext, created on a user gesture (`arm`) and closed on `dispose`; nothing plays while the tab is
// hidden; every hit is under 1.2 s; the master gain is 0.25 (peak) behind a limiter.

import type { SoundKind } from './data'

type Ctor = typeof AudioContext

function audioCtor(): Ctor | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as { AudioContext?: Ctor; webkitAudioContext?: Ctor }
  return w.AudioContext ?? w.webkitAudioContext
}

export const soundSupported = (): boolean => audioCtor() !== undefined

/** nothing the board plays leaves louder than this (the output gain behind a hard clip) */
export const PEAK = 0.25

const rand = (min: number, max: number): number => min + Math.random() * (max - min)

/** suspend / resume / close return promises in current browsers and nothing in a few old ones: never let either throw */
function quiet(run: () => unknown): void {
  try {
    void Promise.resolve(run()).catch(() => undefined)
  } catch {
    /* an old or locked-down browser: the hit simply stays silent */
  }
}
const FLOOR = 0.0001

export class FoleyBoard {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private noise: AudioBuffer | null = null
  private flip = false
  private onVisibility = (): void => {
    const ctx = this.ctx
    if (!ctx || ctx.state === 'closed') return
    if (document.visibilityState === 'hidden') quiet(() => ctx.suspend())
    else quiet(() => ctx.resume())
  }
  /** wakes the context, but never while the tab is hidden */
  private wake(ctx: AudioContext): void {
    if (typeof document === 'undefined' || document.visibilityState === 'visible') quiet(() => ctx.resume())
  }

  get ready(): boolean {
    return this.ctx !== null && this.ctx.state !== 'closed'
  }

  /** Creates the context. Call it inside a click / key / pointer handler (the browser only allows audio after a gesture). */
  arm(): boolean {
    if (this.ready) {
      if (this.ctx) this.wake(this.ctx)
      return true
    }
    const Ctx = audioCtor()
    if (!Ctx) return false
    try {
      const ctx = new Ctx()
      // every hit connects to the bus; bus -> limiter -> hard clip at +-1 -> output gain 0.25 -> speakers.
      // The clip makes the promise exact: nothing the board plays can leave louder than 0.25 (the peak gain).
      const bus = ctx.createGain()
      const limiter = ctx.createDynamicsCompressor()
      limiter.threshold.value = -8
      limiter.knee.value = 4
      limiter.ratio.value = 16
      limiter.attack.value = 0.002
      limiter.release.value = 0.1
      const clip = ctx.createWaveShaper()
      clip.curve = new Float32Array([-1, 0, 1]) // identity inside, flat outside
      const out = ctx.createGain()
      out.gain.value = PEAK
      bus.connect(limiter)
      limiter.connect(clip)
      clip.connect(out)
      out.connect(ctx.destination)
      this.ctx = ctx
      this.master = bus
      this.noise = this.makeNoise(ctx)
      document.addEventListener('visibilitychange', this.onVisibility)
      this.wake(ctx)
      return true
    } catch {
      this.ctx = null
      return false
    }
  }

  /** Stops everything and releases the context (the toggle went off, or the world closed). */
  dispose(): void {
    document.removeEventListener('visibilitychange', this.onVisibility)
    const ctx = this.ctx
    this.ctx = null
    this.master = null
    this.noise = null
    if (ctx && ctx.state !== 'closed') quiet(() => ctx.close())
  }

  /** Plays one hit. Returns false when nothing was played (no context yet, or the tab is hidden). */
  play(kind: SoundKind): boolean {
    const ctx = this.ctx
    if (!ctx || !this.master || ctx.state === 'closed') return false
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return false
    if (ctx.state === 'suspended') this.wake(ctx)
    const t = ctx.currentTime + 0.012
    switch (kind) {
      case 'snap':
        return this.snap(t)
      case 'crunch':
        return this.crunch(t)
      case 'clop':
        return this.clop(t)
      case 'whistle':
        return this.whistle(t)
      case 'steps':
        return this.steps(t)
      case 'wave':
        return this.wave(t)
    }
  }

  // ---- building blocks ------------------------------------------------------------------------------------------------
  private makeNoise(ctx: AudioContext): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * 1.6)
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
    return buffer
  }

  /** a short burst of filtered noise: the grain of a crunch, a click, a bit of gravel, steam */
  private grain(t: number, type: BiquadFilterType, freq: number, q: number, dur: number, peak: number): void {
    const ctx = this.ctx
    const master = this.master
    const noise = this.noise
    if (!ctx || !master || !noise) return
    const src = ctx.createBufferSource()
    src.buffer = noise
    const filter = ctx.createBiquadFilter()
    filter.type = type
    filter.frequency.value = freq
    filter.Q.value = q
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(FLOOR, t)
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.002)
    gain.gain.exponentialRampToValueAtTime(FLOOR, t + 0.002 + dur)
    src.connect(filter)
    filter.connect(gain)
    gain.connect(master)
    const offset = Math.random() * Math.max(0, noise.duration - dur - 0.05)
    src.start(t, offset, dur + 0.05)
    src.stop(t + dur + 0.06)
  }

  /** a pitched blip that falls (or rises) in pitch */
  private tone(t: number, type: OscillatorType, from: number, to: number, dur: number, peak: number, attack = 0.003): void {
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master) return
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.setValueAtTime(from, t)
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(FLOOR, t)
    gain.gain.exponentialRampToValueAtTime(peak, t + attack)
    gain.gain.exponentialRampToValueAtTime(FLOOR, t + attack + dur)
    osc.connect(gain)
    gain.connect(master)
    osc.start(t)
    osc.stop(t + attack + dur + 0.03)
  }

  // ---- the six hits ---------------------------------------------------------------------------------------------------
  private snap(t: number): boolean {
    this.grain(t, 'highpass', 2600, 0.7, 0.035, 0.9)
    this.grain(t + 0.014, 'bandpass', 4300, 3, 0.03, 0.5)
    this.tone(t, 'sine', 1900, 800, 0.04, 0.22)
    return true
  }

  private crunch(t: number): boolean {
    for (let i = 0; i < 9; i++) {
      this.grain(t + rand(0, 0.22), 'bandpass', rand(900, 4200), rand(1.2, 3.2), rand(0.014, 0.042), rand(0.45, 0.9))
    }
    for (let i = 0; i < 3; i++) this.grain(t + rand(0, 0.12), 'lowpass', rand(320, 520), 0.8, rand(0.05, 0.09), rand(0.4, 0.6))
    return true
  }

  private clop(t: number): boolean {
    // two hollow knocks: a high one, then a lower one
    this.tone(t, 'sine', 920, 430, 0.09, 0.8)
    this.grain(t, 'bandpass', 1500, 2, 0.014, 0.5)
    this.grain(t + 0.004, 'bandpass', 700, 9, 0.08, 0.45)
    const u = t + 0.17
    this.tone(u, 'sine', 640, 300, 0.11, 0.7)
    this.grain(u, 'bandpass', 1200, 2, 0.014, 0.4)
    this.grain(u + 0.004, 'bandpass', 520, 9, 0.09, 0.4)
    return true
  }

  private whistle(t: number): boolean {
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master) return false
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1250, t)
    osc.frequency.exponentialRampToValueAtTime(2150, t + 0.72)
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 26
    const depth = ctx.createGain()
    depth.gain.value = 20
    lfo.connect(depth)
    depth.connect(osc.frequency)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(FLOOR, t)
    gain.gain.exponentialRampToValueAtTime(0.55, t + 0.07)
    gain.gain.setValueAtTime(0.55, t + 0.72)
    gain.gain.exponentialRampToValueAtTime(FLOOR, t + 0.95)
    osc.connect(gain)
    gain.connect(master)
    osc.start(t)
    lfo.start(t)
    osc.stop(t + 1.0)
    lfo.stop(t + 1.0)
    // steam
    this.grain(t, 'bandpass', 3600, 5, 0.9, 0.13)
    return true
  }

  private steps(t: number): boolean {
    this.flip = !this.flip
    const low = this.flip ? 1 : 0.88
    const step = (at: number, strength: number) => {
      this.tone(at, 'sine', 150 * low, 48, 0.12, 0.85 * strength)
      this.grain(at, 'lowpass', 800, 0.8, 0.08, 0.5 * strength)
      for (let i = 0; i < 3; i++) this.grain(at + rand(0, 0.06), 'highpass', rand(2800, 4200), 0.7, 0.014, 0.22 * strength)
    }
    step(t, 1)
    step(t + 0.3, 0.8)
    return true
  }

  private wave(t: number): boolean {
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master) return false
    // a cloth whoosh: band-passed noise whose centre sweeps up
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = 1.4
    filter.frequency.setValueAtTime(500, t)
    filter.frequency.exponentialRampToValueAtTime(2400, t + 0.34)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(FLOOR, t)
    gain.gain.exponentialRampToValueAtTime(0.6, t + 0.14)
    gain.gain.exponentialRampToValueAtTime(FLOOR, t + 0.4)
    src.connect(filter)
    filter.connect(gain)
    gain.connect(master)
    src.start(t, rand(0, 0.5), 0.45)
    src.stop(t + 0.46)
    // bye-bye: a falling minor third
    this.tone(t + 0.3, 'triangle', 880, 872, 0.13, 0.4, 0.01)
    this.tone(t + 0.45, 'triangle', 740, 728, 0.22, 0.4, 0.01)
    return true
  }
}
