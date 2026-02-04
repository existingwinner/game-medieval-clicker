// src/utils/sounds.ts

const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

// Глобальная громкость
let globalVolume = 0.5;

export const setGlobalVolume = (value: number) => {
  globalVolume = Math.max(0, Math.min(1, value));
};

export const getGlobalVolume = () => globalVolume;

const createNoiseBuffer = () => {
  const bufferSize = ctx.sampleRate * 2; // 2 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
};

const noiseBuffer = createNoiseBuffer();

// Debounce helper
const lastPlayed: Record<string, number> = {};
const canPlay = (id: string, delay: number) => {
  const now = Date.now();
  if (lastPlayed[id] && now - lastPlayed[id] < delay) return false;
  lastPlayed[id] = now;
  return true;
};

export const playCoinSound = () => {
  if (!canPlay('coin', 50)) return;
  const t = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, t);
  osc.frequency.exponentialRampToValueAtTime(1100, t + 0.03);
  
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1500, t);

  gain.gain.setValueAtTime(0.12 * globalVolume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(t);
  osc.stop(t + 0.06);
};

export const playBuildSound = () => {
  if (!canPlay('build', 100)) return;
  const t = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.linearRampToValueAtTime(250, t + 0.08);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1250, t);
  
  gain.gain.setValueAtTime(0.08 * globalVolume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.12);
};

export const playRaidStartSound = () => {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(110, t);
  osc.frequency.exponentialRampToValueAtTime(80, t + 1.2);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1250, t);

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.12 * globalVolume, t + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(t);
  osc.stop(t + 1.5);
};

export const playDamageSound = () => {
  if (!canPlay('damage', 80)) return;
  const t = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(140, t);
  osc.frequency.exponentialRampToValueAtTime(30, t + 0.15);
  
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1000, t);

  gain.gain.setValueAtTime(0.25 * globalVolume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.2);

  // Хруст (Noise)
  const noise = ctx.createBufferSource();
  const noiseGain = ctx.createGain();
  const noiseFilter = ctx.createBiquadFilter();
  noise.buffer = noiseBuffer;
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.setValueAtTime(1250, t);
  noiseGain.gain.setValueAtTime(0.12 * globalVolume, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(t);
  noise.stop(t + 0.1);
};

export const playRaidEndSound = () => {
  const t = ctx.currentTime;
  [261.63, 329.63, 392.00].forEach((freq, i) => {
    setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.08 * globalVolume, t + i*0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i*0.08 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + i*0.08);
        osc.stop(t + i*0.08 + 0.4);
    }, i * 40);
  });
};

export const playStealSound = () => {
   if (!canPlay('steal', 80)) return;
   const t = ctx.currentTime;
   const osc = ctx.createOscillator();
   const gain = ctx.createGain();
   
   osc.type = 'triangle';
   osc.frequency.setValueAtTime(140, t);
   osc.frequency.linearRampToValueAtTime(60, t + 0.08);
   
   gain.gain.setValueAtTime(0.08 * globalVolume, t);
   gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
   
   osc.connect(gain);
   gain.connect(ctx.destination);
   osc.start(t);
   osc.stop(t + 0.08);
};

export const playClickSound = () => {
  if (!canPlay('ui', 30)) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.frequency.setValueAtTime(220, t);
  gain.gain.setValueAtTime(0.04 * globalVolume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.03);
};

export const playUpgradeSound = () => {
    playBuildSound();
};

export const playRepairSound = () => {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    gain.gain.setValueAtTime(0.08 * globalVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
};
