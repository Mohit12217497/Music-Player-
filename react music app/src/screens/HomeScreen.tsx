import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { searchSongs } from '../services/api';
import { searchItemToTrack, type Track } from '../types/api';
import { SongListItem } from '../components/SongListItem';
import { usePlayerStore } from '../store/playerStore';
import { colors, spacing } from '../constants/theme';

const PAGE_SIZE = 20;

export function HomeScreen() {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTriggered, setSearchTriggered] = useState(false);

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const addToQueue = usePlayerStore((s) => s.addToQueue);

  const runSearch = useCallback(
    async (q: string, pageNum: number = 1, append: boolean = false) => {
      const trimmed = q.trim();
      if (!trimmed) {
        setTracks([]);
        setTotal(0);
        setSearchTriggered(false);
        return;
      }
      setLoading(true);
      try {
        const res = await searchSongs(trimmed, pageNum, PAGE_SIZE);
        const data = res.data;
        const list = (data?.results ?? []).map(searchItemToTrack);
        const totalCount = data?.total ?? 0;
        if (append) {
          setTracks((prev) => [...prev, ...list]);
        } else {
          setTracks(list);
        }
        setTotal(totalCount);
        setPage(pageNum);
        setSearchTriggered(true);
      } catch (e) {
        setTracks([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSearch = useCallback(() => {
    Keyboard.dismiss();
    runSearch(query, 1, false);
  }, [query, runSearch]);

  const loadMore = useCallback(() => {
    if (loading || tracks.length >= total) return;
    const nextPage = page + 1;
    runSearch(query, nextPage, true);
  }, [loading, tracks.length, total, page, query, runSearch]);

  const onPlay = useCallback(
    (track: Track) => {
      playTrack(track, true);
    },
    [playTrack]
  );

  const onAddToQueue = useCallback(
    (track: Track) => {
      addToQueue(track);
    },
    [addToQueue]
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="Search songs, artists..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        {loading && tracks.length === 0 ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : tracks.length === 0 && searchTriggered ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No results. Try another search.</Text>
          </View>
        ) : tracks.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.hint}>Search for songs to start playing</Text>
          </View>
        ) : (
          <FlatList
            data={tracks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SongListItem
                track={item}
                onPress={() => onPlay(item)}
                onAddToQueue={() => onAddToQueue(item)}
                isPlaying={currentTrack?.id === item.id}
                isLoading={currentTrack?.id === item.id && isLoading}
              />
            )}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              loading && tracks.length > 0 ? (
                <View style={styles.footer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchRow: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 15,
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
});
