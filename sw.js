// sw.js - Service Worker for Salah Log + Hifz Tracking

const CACHE_NAME = "islamic-apps-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/Salah_Track_App.html",
  "/Memory_Quran.html",
  "/manifest.json",
];

// Install - Cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()),
  );
});

// Fetch - Serve from cache then network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request)),
  );
});

// Activate - Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              return caches.delete(cache);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Background Sync for Offline Actions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-prayer-logs") {
    event.waitUntil(syncPrayerLogs());
  }
});

async function syncPrayerLogs() {
  // Get pending actions from IndexedDB
  const pendingActions = await getPendingActions();

  for (const action of pendingActions) {
    try {
      // Send to your backend (if any)
      await fetch("/api/sync-prayer", {
        method: "POST",
        body: JSON.stringify(action),
        headers: { "Content-Type": "application/json" },
      });
      await removePendingAction(action.id);
    } catch (error) {
      console.log("Sync failed, will retry later");
    }
  }
}

// IndexedDB helpers (simplified)
function getPendingActions() {
  /* return from IndexedDB */
}
function removePendingAction(id) {
  /* remove from IndexedDB */
}
