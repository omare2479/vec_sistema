/**
 * Web Audio API synthesizer for VEC musical demos
 * Plays reverent, warm worship chords & ambient pads in real-time
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private startTime: number = 0;
  private pauseOffset: number = 102; // Initial offset matching 01:42 shown in mock
  private totalDuration: number = 250; // 04:10 in seconds
  private intervalId: number | null = null;
  private playbackRate: number = 1.0;
  private onTimeUpdate?: (current: number, total: number) => void;
  private onStateChange?: (playing: boolean) => void;
  private activeNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
  private loopChordIndex: number = 0;

  // Standard Catholic Worship progression (I - V - vi - IV): G - D - Em - C
  private chordFrequencies: number[][] = [
    [196.00, 246.94, 293.66, 392.00], // Sol (G Major)
    [146.83, 220.00, 293.66, 369.99], // Re (D Major)
    [164.81, 196.00, 246.94, 329.63], // Mi menor (Em)
    [130.81, 164.81, 196.00, 261.63], // Do (C Major)
  ];

  public setCallbacks(
    onTimeUpdate?: (current: number, total: number) => void,
    onStateChange?: (playing: boolean) => void
  ) {
    this.onTimeUpdate = onTimeUpdate;
    this.onStateChange = onStateChange;
  }

  public getPlaybackRate(): number {
    return this.playbackRate;
  }

  public setPlaybackRate(rate: number) {
    this.playbackRate = rate;
  }

  public getCurrentTime(): number {
    return this.pauseOffset;
  }

  public getTotalDuration(): number {
    return this.totalDuration;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playHarmonicChord() {
    if (!this.ctx || !this.isPlaying) return;

    this.stopActiveNodes();
    const chord = this.chordFrequencies[this.loopChordIndex % this.chordFrequencies.length];
    this.loopChordIndex++;

    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.12, now + 0.4);
    masterGain.gain.exponentialRampToValueAtTime(0.06, now + 1.8);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
    masterGain.connect(this.ctx.destination);

    // Warm pad filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);
    filter.Q.setValueAtTime(2, now);
    filter.connect(masterGain);

    chord.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      // Subtle celestial chorus detune
      osc.detune.setValueAtTime((i - 1.5) * 4, now);

      noteGain.gain.setValueAtTime(0.25, now);
      osc.connect(noteGain);
      noteGain.connect(filter);

      osc.start(now);
      osc.stop(now + 2.6);

      this.activeNodes.push({ osc, gain: noteGain });
    });
  }

  private stopActiveNodes() {
    this.activeNodes.forEach(({ osc }) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore already stopped
      }
    });
    this.activeNodes = [];
  }

  public play() {
    this.initContext();
    this.isPlaying = true;
    this.startTime = Date.now() - (this.pauseOffset * 1000) / this.playbackRate;

    if (this.onStateChange) this.onStateChange(true);

    this.playHarmonicChord();

    // Timer tick
    if (this.intervalId) clearInterval(this.intervalId);
    let chordTimer = 0;
    this.intervalId = window.setInterval(() => {
      if (!this.isPlaying) return;
      this.pauseOffset += 0.5 * this.playbackRate;
      if (this.pauseOffset >= this.totalDuration) {
        this.pauseOffset = 0;
      }
      chordTimer += 0.5;
      if (chordTimer >= 2.4) {
        chordTimer = 0;
        this.playHarmonicChord();
      }

      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.pauseOffset, this.totalDuration);
      }
    }, 500);
  }

  public pause() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.stopActiveNodes();
    if (this.onStateChange) this.onStateChange(false);
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public seek(seconds: number) {
    this.pauseOffset = Math.max(0, Math.min(this.totalDuration, seconds));
    if (this.isPlaying) {
      this.playHarmonicChord();
    }
    if (this.onTimeUpdate) {
      this.onTimeUpdate(this.pauseOffset, this.totalDuration);
    }
  }

  public playNoteTone(toneKey: string) {
    this.initContext();
    if (!this.ctx) return;
    const notes: Record<string, number> = {
      'Do': 261.63, 'Do#': 277.18, 'Re': 293.66, 'Re#': 311.13,
      'Mi': 329.63, 'Fa': 349.23, 'Fa#': 369.99, 'Sol': 392.00,
      'Sol#': 415.30, 'La': 440.00, 'La#': 466.16, 'Si': 493.88
    };
    const freq = notes[toneKey] || 392.00;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.65);
  }
}

export const globalAudioPlayer = new AudioSynthesizer();

export function formatTimeSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
