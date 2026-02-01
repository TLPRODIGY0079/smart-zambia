// Service Worker for Smart Zambia - Offline Support
const CACHE_NAME = 'smart-zambia-v1';
const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  '/js/enhanced-features.js',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(OFFLINE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request).catch(() => {
          // If both cache and network fail, return offline page
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Background sync for offline reports
self.addEventListener('sync', event => {
  if (event.tag === 'civic-report-sync') {
    event.waitUntil(syncCivicReports());
  }
});

async function syncCivicReports() {
  // Sync offline civic reports when connection is restored
  const offlineReports = await getOfflineReports();
  for (const report of offlineReports) {
    try {
      await submitReportToServer(report);
      await removeOfflineReport(report.id);
    } catch (error) {
      console.error('Failed to sync report:', error);
    }
  }
}

async function getOfflineReports() {
  // Get reports stored offline
  return JSON.parse(localStorage.getItem('offlineReports') || '[]');
}

async function removeOfflineReport(reportId) {
  const reports = await getOfflineReports();
  const filtered = reports.filter(r => r.id !== reportId);
  localStorage.setItem('offlineReports', JSON.stringify(filtered));
}

async function submitReportToServer(report) {
  return fetch('/api/civic/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report)
  });
}