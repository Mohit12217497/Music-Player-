# Lokal Music – React Native (Expo) Music Player

A music streaming app built with **React Native (Expo)** and **TypeScript**, using the [JioSaavn API](https://saavn.sumit.co/).  
Design reference: [Figma – Lokal Music Player UI Kit](https://www.figma.com/design/jm3TbqEdkR15QNVDE4rSlX/Lokal---Music-Player-App-UI-Kit-Sample).

## Features

- **Home**: Search songs via JioSaavn API, infinite scroll (pagination), play or add to queue
- **Full player**: Artwork, seek bar, play/pause, previous/next, shuffle & repeat (none / all / one)
- **Mini player**: Persistent bar at bottom, progress and play/pause; tap to open full player
- **Queue**: View, reorder (up/down), remove items; queue persisted with AsyncStorage
- **Background playback**: Audio continues when app is in background or screen is off (Expo AV + iOS/Android config)
- **Sync**: Mini player and full player share the same Zustand store and seek via `requestSeek`, so they stay in sync

## Tech Stack

- **React Native** with **Expo** (~52) and **TypeScript**
- **React Navigation v6**: native stack + bottom tabs (no Expo Router)
- **State**: Zustand (player, queue, playback position, shuffle/repeat)
- **Storage**: AsyncStorage for queue persistence
- **Audio**: expo-av (background mode enabled)

## Setup

1. **Clone and install**
   ```bash
   cd "react music app"
   npm install
   ```

2. **Assets (required for Expo)**  
   Add these under `assets/`:
   - `icon.png` (1024×1024 recommended)
   - `splash.png` (splash image)
   - `adaptive-icon.png` (Android adaptive icon, e.g. 1024×1024)

   If you don’t have assets yet, create a new Expo app and copy the `assets` folder:
   ```bash
   npx create-expo-app@latest temp-app --template blank-typescript
   cp -r temp-app/assets ./
   ```

3. **Run**
   ```bash
   npx expo start
   ```
   Then press `a` for Android or `i` for iOS. For a dev build / APK, use EAS Build (see Expo docs).

## Project structure

```
├── App.tsx                 # Entry: audio hook, load persisted queue, navigator
├── app.config.js          # Expo config (background audio, etc.)
├── src/
│   ├── components/        # MiniPlayer, SongListItem
│   ├── constants/         # theme (colors, spacing)
│   ├── hooks/             # useAudioPlayer (expo-av + store sync)
│   ├── navigation/       # Root stack, tabs, types
│   ├── screens/           # HomeScreen, PlayerScreen, QueueScreen
│   ├── services/          # api (JioSaavn), storage (AsyncStorage)
│   ├── store/             # playerStore (Zustand)
│   └── types/             # API and Track types
├── assets/
└── package.json
```

## Architecture

- **Single source of truth**: Zustand store holds current track, queue, index, play state, position, duration, shuffle/repeat. UI only reads and dispatches actions.
- **Audio bridge**: `useAudioPlayer()` runs in `App.tsx`, reacts to `currentTrack` and `isPlaying`, updates position in store, and applies seek requests from the store so both mini and full player use the same state.
- **Queue persistence**: On every queue change (set, add, remove, reorder), the store calls `saveQueue(queue)` to AsyncStorage. On app load, `loadPersistedQueue()` restores the list (current track is set to first item; user can then play from queue).
- **Navigation**: Bottom tabs (Home, Queue) + full-screen modal for Player. Mini player is rendered above the tab bar and stays visible when a track is set.

## Trade-offs

- **Seek bar**: Seek is implemented with tap-on-bar (no thumb drag) to keep the UI simple and avoid extra dependencies.
- **Queue reorder**: Move up/down buttons instead of drag-and-drop to avoid adding a drag library and keep the assignment scope manageable.
- **Offline downloads**: Not implemented; would require file download + local playback and storage management (out of scope for this assignment).
- **API**: Uses public JioSaavn API (no API key). Response shapes may vary; types and `searchItemToTrack` / `pickStreamUrl` handle both `link` and `url` where the API uses either.

## Build APK (Expo)

1. Install EAS CLI: `npm i -g eas-cli`
2. Log in: `eas login`
3. Configure project: `eas build:configure`
4. Build: `eas build -p android --profile preview` (or `production`)

The APK will be available in your Expo dashboard or via the link EAS prints.

## API reference

- Base URL: `https://saavn.sumit.co/`
- Docs: https://saavn.sumit.co/docs  
- Used: `GET /api/search/songs?query=...&page=...&limit=...`, `GET /api/songs/{id}` (for future use)

No API key required.
