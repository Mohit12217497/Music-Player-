import { useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { usePlayerStore } from '../store/playerStore';

export function useAudioPlayer() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const positionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const {
    currentTrack,
    isPlaying,
    setPosition,
    setDuration,
    setPlaying,
    setLoading,
    setError,
    goNext,
    repeat,
    seekRequestMillis,
    clearSeekRequest,
  } = usePlayerStore();

  const stopPositionUpdates = useCallback(() => {
    if (positionIntervalRef.current) {
      clearInterval(positionIntervalRef.current);
      positionIntervalRef.current = null;
    }
  }, []);

  const startPositionUpdates = useCallback(() => {
    stopPositionUpdates();
    positionIntervalRef.current = setInterval(async () => {
      const s = soundRef.current;
      if (!s) return;
      try {
        const status = await s.getStatusAsync();
        if (status.isLoaded && status.positionMillis !== undefined) {
          usePlayerStore.setState({ positionMillis: status.positionMillis });
          if (status.didJustFinishAndNotReset && !status.isLooping) {
            if (usePlayerStore.getState().repeat === 'one') {
              await s.setPositionAsync(0);
              usePlayerStore.setState({ positionMillis: 0 });
              await s.playAsync();
            } else {
              goNext();
            }
          }
        }
      } catch {
        // ignore
      }
    }, 500);
  }, [goNext, stopPositionUpdates]);

  const loadAndPlay = useCallback(
    async (streamUrl: string, durationSeconds: number) => {
      try {
        setLoading(true);
        setError(null);
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        const { sound } = await Audio.Sound.createAsync(
          { uri: streamUrl },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded) {
              if (status.didJustFinishAndNotReset && !status.isLooping) {
                if (usePlayerStore.getState().repeat === 'one') {
                  const s = soundRef.current;
                  if (s) {
                    s.setPositionAsync(0).then(() => s.playAsync());
                    usePlayerStore.setState({ positionMillis: 0 });
                  }
                } else {
                  goNext();
                }
              }
            }
          }
        );
        soundRef.current = sound;
        setDuration(durationSeconds * 1000);
        setPosition(0);
        setPlaying(true);
        startPositionUpdates();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Playback failed';
        setError(msg);
        setPlaying(false);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setDuration, setPosition, setPlaying, goNext, startPositionUpdates]
  );

  useEffect(() => {
    if (!currentTrack?.streamUrl) {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      stopPositionUpdates();
      return;
    }
    loadAndPlay(currentTrack.streamUrl, currentTrack.duration);
    return () => {
      stopPositionUpdates();
    };
  }, [currentTrack?.id, currentTrack?.streamUrl]);

  useEffect(() => {
    const s = soundRef.current;
    if (!s) return;
    if (isPlaying) {
      s.playAsync().catch(() => usePlayerStore.setState({ isPlaying: false }));
      startPositionUpdates();
    } else {
      s.pauseAsync().catch(() => {});
      stopPositionUpdates();
    }
  }, [isPlaying, currentTrack?.id]);

  useEffect(() => {
    return () => {
      stopPositionUpdates();
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, [stopPositionUpdates]);

  const handleSeek = useCallback(
    async (millis: number) => {
      const s = soundRef.current;
      if (!s) {
        setPosition(millis);
        return;
      }
      try {
        await s.setPositionAsync(millis);
        setPosition(millis);
      } catch {
        setPosition(millis);
      }
    },
    [setPosition]
  );

  // Consume seek requests from store (so Mini Player and Full Player stay in sync)
  useEffect(() => {
    if (seekRequestMillis == null) return;
    handleSeek(seekRequestMillis);
    clearSeekRequest();
  }, [seekRequestMillis, handleSeek, clearSeekRequest]);

  return { handleSeek };
}
