import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  LayoutChangeEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePlayerStore, type RepeatMode } from '../store/playerStore';
import { colors, spacing, borderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');
const ART_SIZE = width * 0.75;

export function PlayerScreen() {
  const navigation = useNavigation();
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const positionMillis = usePlayerStore((s) => s.positionMillis);
  const durationMillis = usePlayerStore((s) => s.durationMillis);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const error = usePlayerStore((s) => s.error);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeat = usePlayerStore((s) => s.repeat);
  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);
  const goNext = usePlayerStore((s) => s.goNext);
  const goPrev = usePlayerStore((s) => s.goPrev);
  const requestSeek = usePlayerStore((s) => s.requestSeek);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);

  const [seekBarWidth, setSeekBarWidth] = useState(width);
  const progress = durationMillis > 0 ? positionMillis / durationMillis : 0;
  const posSec = Math.floor(positionMillis / 1000);
  const durSec = Math.floor(durationMillis / 1000);
  const posStr = `${Math.floor(posSec / 60)}:${(posSec % 60).toString().padStart(2, '0')}`;
  const durStr = `${Math.floor(durSec / 60)}:${(durSec % 60).toString().padStart(2, '0')}`;

  const onSeekBarLayout = useCallback((e: LayoutChangeEvent) => {
    setSeekBarWidth(e.nativeEvent.layout.width);
  }, []);

  const onSeek = useCallback(
    (e: { nativeEvent: { locationX: number } }) => {
      const x = e.nativeEvent.locationX;
      const w = seekBarWidth || width;
      const ratio = Math.max(0, Math.min(1, x / w));
      requestSeek(Math.floor(ratio * durationMillis));
    },
    [durationMillis, requestSeek, seekBarWidth, width]
  );

  const repeatLabel = (r: RepeatMode) => (r === 'none' ? '↩' : r === 'one' ? '🔂' : '🔁');

  if (!currentTrack) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.centered}>
          <Text style={styles.noTrack}>No track selected</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>

      <View style={styles.artWrap}>
        <Image source={{ uri: currentTrack.imageUrl }} style={styles.artwork} />
      </View>
      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>
          {currentTrack.name}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {currentTrack.artists}
        </Text>
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      <View style={styles.seekWrap}>
        <View style={styles.seekBar} onLayout={onSeekBarLayout} onTouchEnd={onSeek}>
          <View style={[styles.seekFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.time}>{posStr}</Text>
          <Text style={styles.time}>{durStr}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={toggleShuffle}
          style={[styles.modeBtn, shuffle && styles.modeBtnActive]}
        >
          <Text style={styles.modeBtnText}>🔀</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mainBtn} onPress={goPrev}>
          <Text style={styles.mainBtnText}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.playBtn}
          onPress={togglePlayPause}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <Text style={styles.playBtnText}>{isPlaying ? '⏸' : '▶'}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.mainBtn} onPress={goNext}>
          <Text style={styles.mainBtnText}>⏭</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={cycleRepeat}
          style={[styles.modeBtn, repeat !== 'none' && styles.modeBtnActive]}
        >
          <Text style={styles.modeBtnText}>{repeatLabel(repeat)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: spacing.md,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    color: colors.text,
  },
  artWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  artwork: {
    width: ART_SIZE,
    height: ART_SIZE,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
  },
  meta: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  artist: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  error: {
    color: colors.error,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  seekWrap: {
    paddingHorizontal: spacing.md * 2,
    marginBottom: spacing.xl,
  },
  seekBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  seekFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  time: {
    fontSize: 12,
    color: colors.textMuted,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  modeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  modeBtnActive: {
    opacity: 1,
  },
  modeBtnText: {
    fontSize: 20,
  },
  mainBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBtnText: {
    fontSize: 28,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnText: {
    fontSize: 32,
    color: colors.text,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTrack: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});
