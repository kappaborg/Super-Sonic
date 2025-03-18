import { QueryClient } from '@tanstack/react-query';

/**
 * Uygulama genelinde kullanılacak QueryClient nesnesi
 * React Query için standart yapılandırma seçenekleri ile oluşturulmuştur
 * 
 * - Sayfa odağı değiştiğinde yeniden veri çekme (varsayılan)
 * - Ağ bağlantısı yeniden kurulduğunda yeniden veri çekme (varsayılan)
 * - Bileşen yeniden render edildiğinde yeniden veri çekme (varsayılan)
 * - 60 saniyelik staleTime (veri bu süre boyunca tazeliğini korur)
 * - 5 dakikalık gcTime (veri kullanılmadığında bu süre sonunda önbellekten kaldırılır)
 * - Başarısız istekler için 1 kez yeniden deneme
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      staleTime: 1000 * 60, // 60 saniye
      gcTime: 1000 * 60 * 5, // 5 dakika
      retry: 1
    }
  }
}); 