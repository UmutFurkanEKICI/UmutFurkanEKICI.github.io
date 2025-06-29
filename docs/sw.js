const CACHE_NAME = 'odeme-takip-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Service Worker kurulumu
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache açıldı');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch olaylarını yakala
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache'den döndür veya network'ten al
        return response || fetch(event.request);
      })
  );
});

// Push bildirimlerini yakala
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Yeni ödeme hatırlatması!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Görüntüle',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Kapat',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Ödeme Takip Uygulaması', options)
  );
});

// Bildirim tıklama olayını yakala
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync için
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Arka plan senkronizasyonu işlemleri
  return fetch('/api/sync')
    .then(response => response.json())
    .catch(error => {
      console.log('Background sync failed:', error);
    });
} 