// app.config.ts
import { ExpoConfig, ConfigContext } from 'expo/config';
import * as dotenv from 'dotenv';

dotenv.config();

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config, // Herda configurações base do Expo
  name: "hello-rn",
  slug: "hello-rn",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.viczambom.soro"
  },
  web: {
    favicon: "./assets/favicon.png"
  },

  extra: {
    eas: {
      projectId: "5ed2bd32-1503-4498-9afd-55824bc7f0dd"
    },

    apiUrl: process.env.API_URL || 'https://api-bombeiros-s-o-r-o.onrender.com',
    ...config.extra, // Preserva outros extras se existirem
  },
  updates: {
    url: "https://u.expo.dev/5ed2bd32-1503-4498-9afd-55824bc7f0dd"
  },
  runtimeVersion: {
    policy: "appVersion"
  }
});