/* eslint-disable no-restricted-globals */

// SecureSonic için hizmet işçisi dosyası
// Önbelleğe alınacak varlıklar ve API yanıtları için strateji tanımlar

// Cache sürümünü ihtiyaç oldukça artırın
const CACHE_VERSION = 'v1';
const CACHE_NAME = `securesonic-${CACHE_VERSION}`;

// Önbelleğe alınacak URL'ler
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/js/critical.js',
  '/static/css/main.css',
  '/static/js/main.js',
  '/dashboard',
  '/auth/login',
  '/auth/register',
  '/api/users/stats',  // API yanıtlarını da önbelleğe alabiliriz
];

// Service worker kurulduğunda
self.addEventListener('install', (event) => {
  // Yüklenme işlemini, önbellek kurulana kadar geciktir
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache açıldı');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Beklemeden hemen aktifleştir
        return self.skipWaiting();
      })
  );
});

// Service worker aktifleştiğinde
self.addEventListener('activate', (event) => {
  // Etkinleştirme işlemini, eski önbellekler temizlenene kadar geciktir
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Eski sürüm önbelleklerini temizle
          if (cacheName !== CACHE_NAME && cacheName.startsWith('securesonic-')) {
            console.log('Eski önbellek siliniyor:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        }).filter(Boolean)
      );
    }).then(() => {
      console.log('Service worker etkin ve güncel');
      // Yeni service worker'ın hemen kontrolü almasını sağla
      return self.clients.claim();
    })
  );
});

// Fetch isteklerini yakalayarak önbelleğe alma stratejisi uygula
self.addEventListener('fetch', (event) => {
  // API veya diğer AJAX isteklerini ele alma
  if (event.request.url.includes('/api/')) {
    // Ağ öncelikli, önbellek yedekli yaklaşım
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Geçerli bir yanıt aldıysak, önbelleğe kopyalayarak kaydet
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                // API yanıtlarını önbelleğe alma - özellikle statik veriler için
                // Dinamik değişebilen veriler için önbellek sürelerini ayarlayın
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // Ağ bağlantısı yoksa, önbellekten yanıt vermeyi dene
          return caches.match(event.request);
        })
    );
  } else {
    // Önbellek öncelikli, ağ yedekli yaklaşım (statik varlıklar için)
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Önbellekte bulunursa, o yanıtı döndür
          if (response) {
            return response;
          }
          
          // Önbellekte yoksa, ağdan iste
          return fetch(event.request)
            .then((response) => {
              // Geçerli bir yanıt olmadığında ve bir HTML sayfası değilse,
              // sadece yanıtı döndür
              if (!response || response.status !== 200 || response.type !== 'basic' ||
                  event.request.url.includes('.html') || event.request.mode === 'navigate') {
                return response;
              }
              
              // Yanıtın klonunu önbelleğe al (çünkü akış sadece bir kez okunabilir)
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
                
              return response;
            })
            .catch((error) => {
              // Ağ hatası durumunda offline sayfası göster
              console.error('Fetch başarısız oldu:', error);
              
              // Gezinme istekleri için offline sayfasına yönlendir
              if (event.request.mode === 'navigate') {
                return caches.match('/offline.html');
              }
              
              return new Response('İnternet bağlantısı yok');
            });
        })
    );
  }
});

// Background sync - offline iken yapılan işlemleri daha sonra senkronize etme
self.addEventListener('sync', (event) => {
  if (event.tag === 'securesonic-sync') {
    event.waitUntil(
      // Burada offline veritabanından bekleyen işlemleri alıp,
      // sunucuya gönderme işlemi gerçekleştirilebilir
      // IndexedDB içinde saklanan formlardaki verileri gönderme gibi
      console.log('Bekleyen işlemler senkronize ediliyor...')
    );
  }
});

// Push bildirimleri
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body || 'Yeni bir bildiriminiz var',
    icon: '/logo192.png',
    badge: '/badge.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'SecureSonic Bildirimi',
      options
    )
  );
});

// Bildirime tıklanma
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
}); 