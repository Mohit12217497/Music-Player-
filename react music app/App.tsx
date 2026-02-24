import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useAudioPlayer } from './src/hooks/useAudioPlayer';
import { usePlayerStore } from './src/store/playerStore';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/constants/theme';

export default function App() {
  useAudioPlayer();
  const loadPersistedQueue = usePlayerStore((s) => s.loadPersistedQueue);

  useEffect(() => {
    loadPersistedQueue();
  }, [loadPersistedQueue]);

  return (
    <>
      <StatusBar style="light" backgroundColor={colors.background} />
      <RootNavigator />
    </>
  );
}
