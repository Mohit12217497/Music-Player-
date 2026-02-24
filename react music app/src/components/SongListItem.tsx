import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import type { Track } from '../types/api';
import { colors, spacing, borderRadius } from '../constants/theme';

interface SongListItemProps {
  track: Track;
  onPress: () => void;
  onAddToQueue?: () => void;
  isPlaying?: boolean;
  isLoading?: boolean;
}

export function SongListItem({ track, onPress, onAddToQueue, isPlaying, isLoading }: SongListItemProps) {
  const durationMin = Math.floor(track.duration / 60);
  const durationSec = track.duration % 60;
  const durationStr = `${durationMin}:${durationSec.toString().padStart(2, '0')}`;

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: track.imageUrl || undefined }}
        style={styles.artwork}
      />
      <View style={styles.info}>
        <Text style={[styles.title, isPlaying && styles.titleActive]} numberOfLines={1}>
          {track.name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {track.artists} · {track.albumName}
        </Text>
      </View>
      <View style={styles.right}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text style={styles.duration}>{durationStr}</Text>
        )}
        {onAddToQueue && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={(e) => {
              e.stopPropagation();
              onAddToQueue();
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceElevated,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  titleActive: {
    color: colors.primary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  duration: {
    fontSize: 13,
    color: colors.textMuted,
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
});
