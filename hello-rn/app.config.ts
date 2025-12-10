// app.config.ts
import { ExpoConfig, ConfigContext } from 'expo/config';
import * as dotenv from 'dotenv';

dotenv.config();

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "S.O.R.O", // Nome correto (sem ponto no final)
  slug: "hello-rn", // Slug original para não quebrar o EAS
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  }, // <--- O splash termina aqui

  // Configurações do iOS
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.viczambom.soro", // Importante para iOS
    config: {
      googleMapsApiKey: "AIzaSyDCkVT_ZUdPQotUgFe9AzQNG3et9DQZUEE" // Coloque sua chave aqui também
    }
  },

  // Configurações do Android
  android: {
    package: "com.viczambom.soro",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    // Configuração do Mapa no Android
    config: {
      googleMaps: {
        apiKey: "AIzaSyDCkVT_ZUdPQotUgFe9AzQNG3et9DQZUEE" // <--- Cole sua chave aqui
      }
    },
    // Permissões necessárias
    permissions: [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION",
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "INTERNET"
    ]
  },

  web: {
    favicon: "./assets/favicon.png"
  },

  extra: {
    eas: {
      projectId: "5ed2bd32-1503-4498-9afd-55824bc7f0dd"
    },
    apiUrl: process.env.API_URL || 'https://api-bombeiros-s-o-r-o.onrender.com',
    ...config.extra,
  },
  
  updates: {
    url: "https://u.expo.dev/5ed2bd32-1503-4498-9afd-55824bc7f0dd"
  },
  runtimeVersion: {
    policy: "appVersion"
  }
});