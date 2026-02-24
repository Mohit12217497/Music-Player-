export default {
  expo: {
    name: 'Lokal Music',
    slug: 'music-player-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#0D0D0D',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      infoPlist: {
        UIBackgroundModes: ['audio'],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0D0D0D',
      },
      permissions: [
        'android.permission.FOREGROUND_SERVICE',
        'android.permission.WAKE_LOCK',
      ],
    },
    plugins: [
      [
        'expo-av',
        {
          microphonePermission: false,
        },
      ],
    ],
  },
};
