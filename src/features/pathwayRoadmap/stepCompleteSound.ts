// C, E and G: a bright rising chime.
const NOTES = [523.25, 659.25, 783.99];
const GAP_SECONDS = 0.11;
const NOTE_SECONDS = 0.45;
const PEAK_VOLUME = 0.15;

type AudioContextConstructor = typeof AudioContext;

function audioContextClass(): AudioContextConstructor | undefined {
  const legacy = window as unknown as { webkitAudioContext?: AudioContextConstructor };
  return window.AudioContext ?? legacy.webkitAudioContext;
}

/**
 * A short chime for a step marked complete, made in the browser so there's no
 * file to load. Quiet and brief. Never throws: a browser that won't play audio
 * just doesn't. Returns whether it started playing.
 */
export function playStepCompleteSound(): boolean {
  try {
    const AudioContextClass = audioContextClass();
    if (!AudioContextClass) return false;

    const context = new AudioContextClass();
    if (context.state === "suspended") void context.resume();

    const start = context.currentTime;
    NOTES.forEach((frequency, index) => {
      const at = start + index * GAP_SECONDS;
      const oscillator = context.createOscillator();
      const volume = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      volume.gain.setValueAtTime(0.0001, at);
      volume.gain.linearRampToValueAtTime(PEAK_VOLUME, at + 0.02);
      volume.gain.exponentialRampToValueAtTime(0.0001, at + NOTE_SECONDS);

      oscillator.connect(volume);
      volume.connect(context.destination);
      oscillator.start(at);
      oscillator.stop(at + NOTE_SECONDS + 0.05);
    });

    const totalSeconds = (NOTES.length - 1) * GAP_SECONDS + NOTE_SECONDS + 0.05;
    setTimeout(() => void context.close().catch(() => {}), totalSeconds * 1000 + 250);
    return true;
  } catch {
    return false;
  }
}
