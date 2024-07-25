import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ar.com.modapago.www',
  appName: 'Modapago',
  bundledWebRuntime: false,
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android : {
    allowMixedContent : true,
  },
  cordova : {
    preferences: {
      disableDeploy : "true"
    }
  },
  plugins: {
    PushNotifications : {
      presentationOptions : ['badge', 'sound', 'alert']
    }
  }
};

export default config;
