declare module 'next-pwa' {
  import type { NextConfig } from 'next';

  interface PWAConfig {
    dest: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    buildExcludes?: (string | RegExp)[];
    publicExcludes?: string[];
    scope?: string;
    sw?: string;
    reloadOnOnline?: boolean;
    cacheOnFrontEndNav?: boolean;
    fallbacks?: {
      document?: string;
      image?: string;
      audio?: string;
      video?: string;
      font?: string;
    };
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  export default withPWA;
}