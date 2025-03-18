// Bu dosya, uygulamanın çevrimdışı kullanımını ve önbelleğe almayı sağlayan service worker'ın kaydını yapar

// Service worker kayıt işlevini varsayılan olarak aktif et, ancak geliştirme ortamında isteğe bağlı olarak devre dışı bırakma seçeneği de sun
const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

interface Config {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
}

export function register(config?: Config): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Service worker'ın sadece production ortamında yüklenmesini sağla
  // veya localhost'ta çalışıyorsa
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction || isLocalhost) {
    // Service worker dosyasının konumunu belirle
    const publicUrl = new URL(
      process.env.PUBLIC_URL || '', 
      window.location.href
    );
    
    if (publicUrl.origin !== window.location.origin) {
      // PUBLIC_URL farklı bir origin'deyse, 
      // service worker çalışmaz; bu CDN kullanıldığında gerçekleşir
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL || ''}/service-worker.js`;
      
      if (isLocalhost) {
        // Localhost'ta service worker henüz çalışmıyor; durumu kontrol et
        checkValidServiceWorker(swUrl, config);
        
        // Bazı ek günlük mesajları ekle
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'SecureSonic, service worker ile önbelleğe alınıyor ve ' +
            'çevrimdışı kullanım için hazır.'
          );
        });
      } else {
        // Localhost değilse, service worker'ı doğrudan kaydet
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl: string, config?: Config): void {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        
        if (!installingWorker) {
          return;
        }
        
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // Bu noktada, eski içerik temizlenmiş ve yeni içerik
              // cache'e eklenmiştir
              console.log(
                'Yeni içerik kullanılabilir; Lütfen sayfayı yenileyin.'
              );
              
              // İstemciye güncelleme olduğunu bildir
              if (config?.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Her şey cache'lenmiş
              console.log('İçerik çevrimdışı kullanım için önbelleğe alındı.');
              
              if (config?.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Service worker kaydı sırasında hata:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config): void {
  // Service worker'ın bulunup bulunmadığını kontrol et
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Service worker'ın var olduğunu ancak geçerli bir JS dosyası olmadığını doğrula
      const contentType = response.headers.get('content-type');
      
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // Service worker bulunamadı; muhtemelen farklı bir uygulama
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker geçerli, kaydı devam ettir
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('İnternet bağlantısı yok. Uygulama çevrimdışı modda çalışıyor.');
    });
}

export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
} 