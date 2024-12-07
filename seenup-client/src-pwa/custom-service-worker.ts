import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope &
  typeof globalThis & { skipWaiting: () => void };

// Precache assets
precacheAndRoute(self.__WB_MANIFEST);
