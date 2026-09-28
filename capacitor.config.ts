import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.qllose.app',
  appName: 'Qllose',
  webDir: 'public',
  server: {
    url: 'https://qllose-website.vercel.app',
    cleartext: false,
  },
}

export default config