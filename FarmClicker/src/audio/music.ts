import { Howl } from 'howler';

// Recommended asset route: save background music files under
// src/assets/audio/music/ e.g. src/assets/audio/music/ambient-day.mp3
// Resolve asset URL so Vite includes and rewrites it during build
export const MUSIC_ASSET_PATH = new URL('../assets/audio/music/ambient-day2.mp3', import.meta.url).href;

let current: Howl | null = null;
let currentSrc: string | null = null;
let currentVolume = 0.3;

export function playMusic(src: string = MUSIC_ASSET_PATH, volume = 0.3) {
  currentVolume = volume;

  if (currentSrc === src && current) {
    if (!current.playing()) current.play();
    return;
  }

  stopMusic();

  current = new Howl({ src: [src], loop: true, volume: currentVolume, preload: true });
  current.play();
  currentSrc = src;
}

export function stopMusic() {
  if (!current) return;
  try {
    current.stop();
    current.unload();
  } catch (e) {}
  current = null;
  currentSrc = null;
}

export function setMusicVolume(v: number) {
  currentVolume = Math.min(1, Math.max(0, v));
  if (!current) return;
  current.volume(currentVolume);
}

export function crossfadeTo(src: string, ms = 1000, targetVolume = 0.6) {
  currentVolume = targetVolume;

  if (currentSrc === src) {
    setMusicVolume(targetVolume);
    return;
  }

  const next = new Howl({ src: [src], loop: true, volume: 0, preload: true });
  next.play();
  next.fade(0, targetVolume, ms);

  if (current) {
    const fromVol = current.volume();
    current.fade(fromVol as number, 0, ms);
    setTimeout(() => {
      try { current && current.stop(); current && current.unload(); } catch (e) {}
    }, ms + 50);
  }

  current = next;
  currentSrc = src;
}

export function isMusicPlaying() {
  return !!current && current.playing();
}
