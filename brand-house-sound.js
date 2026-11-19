const SNAP_TIMBRES = new Map([
  ['left', { seed: 2971, bodyHz: 570, edgeHz: 1680, duration: 0.062, peak: 0.19 }],
  ['top', { seed: 4187, bodyHz: 460, edgeHz: 1410, duration: 0.069, peak: 0.16 }],
]);

let audioContext;
const snapBuffers = new Map();
const playingSnaps = new Set();

function createSnapBuffer({ seed, bodyHz, edgeHz, duration, peak }) {
  const { sampleRate } = audioContext;
  const buffer = audioContext.createBuffer(1, Math.ceil(sampleRate * duration), sampleRate);
  const samples = buffer.getChannelData(0);
  let randomState = seed;
  let smoothNoise = 0;
  let samplePeak = 0;

  for (let frame = 0; frame < samples.length; frame += 1) {
    const time = frame / sampleRate;
    const attack = Math.min(time / 0.00025, 1);
    const tail = Math.min((duration - time) / 0.006, 1);
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    const noise = randomState / 2147483648 - 1;
    smoothNoise += (noise - smoothNoise) * 0.3;

    const edge = (noise - smoothNoise) * Math.exp(-time / 0.0026);
    const body = Math.sin(2 * Math.PI * bodyHz * time) * Math.exp(-time / 0.009);
    const resonance = Math.sin(2 * Math.PI * edgeHz * time) * Math.exp(-time / 0.0046);
    samples[frame] = (0.83 * edge + 0.38 * body + 0.22 * resonance) * attack * tail;
    samplePeak = Math.max(samplePeak, Math.abs(samples[frame]));
  }

  const gain = peak / samplePeak;
  for (let frame = 0; frame < samples.length; frame += 1) {
    samples[frame] *= gain;
  }

  return buffer;
}

export function unlockHouseSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext || document.hidden) return;

  try {
    if (!audioContext) {
      audioContext = new AudioContext();
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopHouseSound();
      });
    }

    if (audioContext.state !== 'running') {
      void audioContext.resume().catch(() => {});
    }
  } catch {
    // The animation remains available when the browser cannot enable audio.
  }
}

export function playHouseSnap(side) {
  const timbre = SNAP_TIMBRES.get(side);
  if (!timbre || document.hidden || audioContext?.state !== 'running') return false;

  let buffer = snapBuffers.get(side);
  if (!buffer) {
    buffer = createSnapBuffer(timbre);
    snapBuffers.set(side, buffer);
  }

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.addEventListener('ended', () => {
    playingSnaps.delete(source);
    source.disconnect();
  }, { once: true });
  source.start();
  playingSnaps.add(source);
  return true;
}

export function stopHouseSound() {
  for (const source of playingSnaps) {
    source.stop();
  }
  playingSnaps.clear();
}
