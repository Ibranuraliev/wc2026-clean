"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Music, Pause, Play, SkipForward, Volume2, VolumeX } from "lucide-react";

interface Track {
  src: string;
  title: string;
  artist: string;
}

const PLAYLIST: Track[] = [
  // Добавь свои треки в public/audio/ и раскомментируй:
];

const STORAGE_KEY = "wc2026-music";

interface Stored { volume: number; muted: boolean; trackIndex: number }

function readStored(): Stored {
  if (typeof window === "undefined") return { volume: 0.4, muted: false, trackIndex: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { volume: 0.4, muted: false, trackIndex: 0 };
    const p = JSON.parse(raw);
    return {
      volume: typeof p.volume === "number" ? p.volume : 0.4,
      muted: !!p.muted,
      trackIndex: typeof p.trackIndex === "number" ? p.trackIndex : 0,
    };
  } catch { return { volume: 0.4, muted: false, trackIndex: 0 }; }
}

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [muted, setMuted] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage once.
  useEffect(() => {
    const s = readStored();
    setTrackIndex(Math.min(Math.max(s.trackIndex, 0), PLAYLIST.length - 1));
    setVolume(s.volume);
    setMuted(s.muted);
    setMounted(true);
  }, []);

  // Persist preferences.
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ volume, muted, trackIndex }));
    } catch { /* quota */ }
  }, [mounted, volume, muted, trackIndex]);

  // Keep audio element volume/mute in sync.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
    a.muted = muted;
  }, [volume, muted]);

  // Outside-click closes the popover.
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!popoverRef.current) return;
      if (!popoverRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  /**
   * Try to play a given track index immediately. This MUST be invoked from a
   * direct user gesture (click/keypress) â calling it from a useEffect after
   * state updates breaks Chrome’s autoplay policy.
   */
  const playTrack = useCallback((index: number) => {
    const a = audioRef.current;
    if (!a) return;
    const next = PLAYLIST[index];
    if (!next) return;
    // Force a reload when the source changes.
    if (!a.src.endsWith(next.src)) {
      a.src = next.src;
      a.load();
    }
    a.play()
      .then(() => setPlaying(true))
      .catch((err) => {
        // Most common: NotAllowedError when called outside a user gesture.
        // eslint-disable-next-line no-console
        console.warn("[MusicPlayer] play() rejected:", err);
        setPlaying(false);
      });
  }, []);

  const pauseTrack = useCallback(() => {
    const a = audioRef.current;
    if (a) a.pause();
    setPlaying(false);
  }, []);

  function togglePlay() {
    if (playing) pauseTrack();
    else playTrack(trackIndex);
  }

  function nextTrack() {
    const ni = (trackIndex + 1) % PLAYLIST.length;
    setTrackIndex(ni);
    playTrack(ni);
  }

  function selectTrack(i: number) {
    setTrackIndex(i);
    playTrack(i);
  }

  function onEnded() {
    // Auto-advance â this is fired by the browser after the user has already
    // granted gesture permission, so play() is allowed here.
    const ni = (trackIndex + 1) % PLAYLIST.length;
    setTrackIndex(ni);
    const a = audioRef.current;
    if (!a) return;
    a.src = PLAYLIST[ni].src;
    a.load();
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  const current = PLAYLIST[trackIndex] ?? PLAYLIST[0];
  const VolumeIcon = muted || volume === 0 ? VolumeX : Volume2;

  if (PLAYLIST.length === 0) return null;
  return (
    <div ref={popoverRef} className="relative">
      <audio
        ref={audioRef}
        src={current.src}
        preload="metadata"
        onEnded={onEnded}
        onError={() => {
          // eslint-disable-next-line no-console
          console.warn("[MusicPlayer] audio error on", current.src);
          setPlaying(false);
        }}
      />

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Music"
        title={`${current.artist} — ${current.title}`}
        className={`flex items-center justify-center w-8 h-8 rounded-lg border border-line/15 transition-colors
          ${playing
            ? "bg-pitch/15 text-pitch border-pitch/40"
            : "text-muted hover:text-pitch hover:border-pitch/40 hover:bg-pitch/5"}`}
      >
        <Music className={`w-4 h-4 ${playing ? "animate-pulse" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-72 bg-surface border border-line/15 rounded-2xl shadow-xl shadow-black/40 p-4 z-[60]">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play"}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-pitch text-bg shrink-0 hover:bg-accent transition-colors"
            >
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-0.5" />}
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-widest text-muted">
                {playing ? "Now playing" : "Paused"}
              </p>
              <p className="text-sm font-semibold text-fg truncate">{current.title}</p>
              <p className="text-xs text-muted truncate">{current.artist}</p>
            </div>
            <button
              onClick={nextTrack}
              aria-label="Next"
              title="Next track"
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-line/15 text-muted hover:text-pitch hover:border-pitch/40 transition-colors shrink-0"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute" : "Mute"}
              className="text-muted hover:text-pitch transition-colors shrink-0"
            >
              <VolumeIcon className="w-4 h-4" />
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round((muted ? 0 : volume) * 100)}
              onChange={(e) => {
                const v = Number(e.target.value) / 100;
                setVolume(v);
                if (v > 0) setMuted(false);
              }}
              className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer
                bg-line/20 accent-[#00B140]
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pitch
                [&::-webkit-slider-thumb]:shadow-[0_0_8px_-1px_rgba(0,177,64,0.7)]"
            />
            <span className="text-[10px] tabular-nums text-muted w-7 text-right shrink-0">
              {Math.round((muted ? 0 : volume) * 100)}
            </span>
          </div>

          <div className="border-t border-line/10 pt-3 flex flex-col gap-1">
            <p className="text-[10px] uppercase tracking-widest text-muted mb-1">
              Playlist · {PLAYLIST.length}
            </p>
            {PLAYLIST.map((tr, i) => (
              <button
                key={tr.src}
                onClick={() => selectTrack(i)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors text-xs
                  ${i === trackIndex
                    ? "bg-pitch/10 text-pitch"
                    : "text-muted hover:bg-line/5 hover:text-fg"}`}
              >
                <span className="tabular-nums w-4 text-right">{i + 1}.</span>
                <span className="flex-1 truncate">
                  <span className="font-medium">{tr.title}</span>
                  <span className="text-muted/70"> — {tr.artist}</span>
                </span>
                {i === trackIndex && playing && (
                  <span className="w-1.5 h-1.5 rounded-full bg-pitch animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
