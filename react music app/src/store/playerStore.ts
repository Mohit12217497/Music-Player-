import { create } from 'zustand';
import type { Track } from '../types/api';
import { loadQueue, saveQueue } from '../services/storage';

export type RepeatMode = 'none' | 'one' | 'all';

interface PlayerState {
  // playback
  currentTrack: Track | null;
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  isLoading: boolean;
  error: string | null;
  // modes
  shuffle: boolean;
  repeat: RepeatMode;
  // persisted
  queueLoaded: boolean;
  // seek request (consumed by audio hook)
  seekRequestMillis: number | null;
  // actions
  requestSeek: (millis: number) => void;
  clearSeekRequest: () => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  addToQueue: (track: Track | Track[]) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  playTrack: (track: Track, replaceQueue?: boolean) => void;
  playFromQueue: (index: number) => void;
  togglePlayPause: () => void;
  setPlaying: (playing: boolean) => void;
  setPosition: (millis: number) => void;
  setDuration: (millis: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  goNext: () => void;
  goPrev: () => void;
  seekTo: (millis: number) => void;
  loadPersistedQueue: () => Promise<void>;
  persistQueue: () => Promise<void>;
  clearQueue: () => void;
}

function getNextIndex(index: number, length: number, repeat: RepeatMode, shuffle: boolean): number {
  if (length <= 0) return 0;
  if (repeat === 'one') return index;
  if (shuffle) return Math.floor(Math.random() * length);
  if (index >= length - 1) return repeat === 'all' ? 0 : index;
  return index + 1;
}

function getPrevIndex(index: number, length: number, repeat: RepeatMode): number {
  if (length <= 0) return 0;
  if (repeat === 'one') return index;
  if (index <= 0) return repeat === 'all' ? length - 1 : 0;
  return index - 1;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  positionMillis: 0,
  durationMillis: 0,
  isLoading: false,
  error: null,
  shuffle: false,
  repeat: 'none',
  queueLoaded: false,
  seekRequestMillis: null,
  requestSeek: (millis) => set({ seekRequestMillis: millis }),
  clearSeekRequest: () => set({ seekRequestMillis: null }),

  setQueue: (tracks, startIndex = 0) => {
    set({
      queue: tracks,
      currentIndex: Math.min(startIndex, Math.max(0, tracks.length - 1)),
      currentTrack: tracks[Math.min(startIndex, Math.max(0, tracks.length - 1))] ?? null,
    });
    get().persistQueue();
  },

  addToQueue: (trackOrTracks) => {
    const tracks = Array.isArray(trackOrTracks) ? trackOrTracks : [trackOrTracks];
    set((s) => ({ queue: [...s.queue, ...tracks] }));
    get().persistQueue();
  },

  removeFromQueue: (index) => {
    const { queue, currentIndex } = get();
    if (index < 0 || index >= queue.length) return;
    const newQueue = queue.filter((_, i) => i !== index);
    let newIndex = currentIndex;
    if (index < currentIndex) newIndex = currentIndex - 1;
    else if (index === currentIndex) {
      newIndex = Math.min(currentIndex, newQueue.length - 1);
      const nextTrack = newQueue[newIndex] ?? null;
      set({ currentTrack: nextTrack });
    }
    set({ queue: newQueue, currentIndex: newIndex });
    get().persistQueue();
  },

  reorderQueue: (fromIndex, toIndex) => {
    const { queue, currentIndex } = get();
    if (fromIndex < 0 || fromIndex >= queue.length || toIndex < 0 || toIndex >= queue.length) return;
    const arr = [...queue];
    const [removed] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, removed);
    let newIndex = currentIndex;
    if (fromIndex === currentIndex) newIndex = toIndex;
    else if (fromIndex < currentIndex && toIndex >= currentIndex) newIndex = currentIndex - 1;
    else if (fromIndex > currentIndex && toIndex <= currentIndex) newIndex = currentIndex + 1;
    set({ queue: arr, currentIndex: newIndex, currentTrack: arr[newIndex] ?? null });
    get().persistQueue();
  },

  playTrack: (track, replaceQueue = true) => {
    if (replaceQueue) {
      set({
        queue: [track],
        currentIndex: 0,
        currentTrack: track,
        isPlaying: true,
        positionMillis: 0,
        durationMillis: track.duration * 1000,
        error: null,
      });
    } else {
      const { queue } = get();
      const idx = queue.findIndex((t) => t.id === track.id);
      if (idx >= 0) {
        set({
          currentIndex: idx,
          currentTrack: track,
          isPlaying: true,
          positionMillis: 0,
          durationMillis: track.duration * 1000,
          error: null,
        });
      } else {
        const newQueue = [...queue, track];
        set({
          queue: newQueue,
          currentIndex: newQueue.length - 1,
          currentTrack: track,
          isPlaying: true,
          positionMillis: 0,
          durationMillis: track.duration * 1000,
          error: null,
        });
        get().persistQueue();
      }
    }
    get().persistQueue();
  },

  playFromQueue: (index) => {
    const { queue } = get();
    const track = queue[index];
    if (!track) return;
    set({
      currentIndex: index,
      currentTrack: track,
      isPlaying: true,
      positionMillis: 0,
      durationMillis: track.duration * 1000,
      error: null,
    });
  },

  togglePlayPause: () => {
    set((s) => ({ isPlaying: !s.isPlaying }));
  },

  setPlaying: (playing) => set({ isPlaying: playing }),
  setPosition: (positionMillis) => set({ positionMillis }),
  setDuration: (durationMillis) => set({ durationMillis }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
  cycleRepeat: () =>
    set((s) => ({
      repeat: s.repeat === 'none' ? 'all' : s.repeat === 'all' ? 'one' : 'none',
    })),

  goNext: () => {
    const { queue, currentIndex, repeat, shuffle } = get();
    const next = getNextIndex(currentIndex, queue.length, repeat, shuffle);
    if (next !== currentIndex && queue[next]) {
      get().playFromQueue(next);
    } else {
      set({ positionMillis: 0 });
    }
  },

  goPrev: () => {
    const { queue, currentIndex, positionMillis, durationMillis, repeat } = get();
    if (positionMillis > 3000) {
      set({ positionMillis: 0 });
      return;
    }
    const prev = getPrevIndex(currentIndex, queue.length, repeat);
    if (prev !== currentIndex && queue[prev]) {
      get().playFromQueue(prev);
    } else {
      set({ positionMillis: 0 });
    }
  },

  seekTo: (millis) => set({ positionMillis: Math.max(0, millis) }),

  loadPersistedQueue: async () => {
    const queue = await loadQueue();
    if (queue.length > 0) {
      set({
        queue,
        currentIndex: 0,
        currentTrack: queue[0] ?? null,
        queueLoaded: true,
      });
    } else {
      set({ queueLoaded: true });
    }
  },

  persistQueue: async () => {
    const { queue } = get();
    await saveQueue(queue);
  },

  clearQueue: () => {
    set({ queue: [], currentIndex: 0, currentTrack: null, isPlaying: false });
    get().persistQueue();
  },
}));
