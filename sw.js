// Service Worker - Push bildirimleri için
const CACHE_NAME = 'push-notification-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/icon-192x192.png'
];

// Service Worker kurulumu
self.addEventListener('install', event => {
  console.log('Service Worker kuruluyor...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache açıldı');
        return cache.addAll(urlsToCache);
      })
  );
});

// Service Worker aktifleştirme
self.addEventListener('activate', event => {
  console.log('Service Worker aktifleştirildi');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eski cache siliniyor:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push bildirimleri alma
self.addEventListener('push', event => {
  console.log('Push bildirimi alındı:', event);
  
  let notificationData = {
    title: 'Yeni Bildirim',
    body: 'Bir bildiriminiz var!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: {
      url: '/'
    }
  };

  // Eğer bildirim verisi varsa kullan
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Bildirim verisi parse edilemedi:', error);
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    data: notificationData.data,
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Aç',
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
    self.registration.showNotification(notificationData.title, options)
  );
});

// Bildirim tıklama olayları
self.addEventListener('notificationclick', event => {
  console.log('Bildirim tıklandı:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Ana sayfayı aç
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

// Bildirim kapatma olayları
self.addEventListener('notificationclose', event => {
  console.log('Bildirim kapatıldı:', event);
});

// Fetch olayları (cache için)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache'de varsa cache'den döndür
        if (response) {
          return response;
        }
        
        // Cache'de yoksa network'ten al ve cache'e ekle
        return fetch(event.request).then(response => {
          // Sadece GET isteklerini cache'le
          if (!response || response.status !== 200 || response.type !== 'basic' || event.request.method !== 'GET') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
}); 
