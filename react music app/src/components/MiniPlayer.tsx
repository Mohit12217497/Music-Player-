import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePlayerStore } from '../store/playerStore';
import { colors, spacing, borderRadius } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export function MiniPlayer() {
  const navigation = useNavigation<Nav>();
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const positionMillis = usePlayerStore((s) => s.positionMillis);
  const durationMillis = usePlayerStore((s) => s.durationMillis);
  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);
  const requestSeek = usePlayerStore((s) => s.requestSeek);

  if (!currentTrack) return null;

  const progress = durationMillis > 0 ? positionMillis / durationMillis : 0;

  const openPlayer = () => {
    navigation.navigate('Player');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={openPlayer} activeOpacity={1}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.content}>
        <Image source={{ uri: currentTrack.imageUrl }} style={styles.artwork} />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {currentTrack.artists}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.playBtn}
          onPress={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
        >
          <Text style={styles.playBtnText}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: spacing.sm,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnText: {
    fontSize: 16,
    color: colors.text,
  },
});
