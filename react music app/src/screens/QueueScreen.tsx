import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import { SongListItem } from '../components/SongListItem';
import { colors, spacing } from '../constants/theme';

export function QueueScreen() {
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const playFromQueue = usePlayerStore((s) => s.playFromQueue);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const reorderQueue = usePlayerStore((s) => s.reorderQueue);
  const clearQueue = usePlayerStore((s) => s.clearQueue);

  const onRemove = useCallback(
    (index: number) => {
      Alert.alert('Remove', 'Remove this song from queue?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromQueue(index) },
      ]);
    },
    [removeFromQueue]
  );

  const onClear = useCallback(() => {
    Alert.alert('Clear queue', 'Remove all songs from queue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearQueue },
    ]);
  }, [clearQueue]);

  if (queue.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Queue is empty</Text>
        <Text style={styles.emptyHint}>Add songs from Search to build your queue</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.count}>{queue.length} track{queue.length !== 1 ? 's' : ''}</Text>
        <TouchableOpacity onPress={onClear}>
          <Text style={styles.clearBtn}>Clear all</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={queue}
        keyExtractor={(item) => `${item.id}-${queue.indexOf(item)}`}
        renderItem={({ item, index }) => (
          <View style={styles.rowWrap}>
            <View style={styles.reorderBtns}>
              <TouchableOpacity
                style={[styles.reorderBtn, index === 0 && styles.reorderBtnDisabled]}
                onPress={() => reorderQueue(index, index - 1)}
                disabled={index === 0}
              >
                <Text style={styles.reorderBtnText}>↑</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reorderBtn, index === queue.length - 1 && styles.reorderBtnDisabled]}
                onPress={() => reorderQueue(index, index + 1)}
                disabled={index === queue.length - 1}
              >
                <Text style={styles.reorderBtnText}>↓</Text>
              </TouchableOpacity>
            </View>
            <SongListItem
              track={item}
              onPress={() => playFromQueue(index)}
              isPlaying={currentIndex === index}
            />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => onRemove(index)}
            >
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  count: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  clearBtn: {
    fontSize: 14,
    color: colors.primary,
  },
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reorderBtns: {
    flexDirection: 'column',
    paddingLeft: spacing.xs,
  },
  reorderBtn: {
    padding: 4,
  },
  reorderBtnDisabled: {
    opacity: 0.3,
  },
  reorderBtnText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  removeBtn: {
    padding: spacing.md,
    marginRight: spacing.sm,
  },
  removeBtnText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
  emptyHint: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
