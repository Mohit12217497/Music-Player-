import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Track } from '../types/api';

const QUEUE_KEY = '@music_player_queue';

export async function loadQueue(): Promise<Track[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveQueue(queue: Track[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // ignore
  }
}
