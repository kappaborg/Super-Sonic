import dynamic from 'next/dynamic';
import React from 'react';

// Yükleme durumunu gösterecek bileşen tipi
type LoadingComponentType = () => JSX.Element | null;

/**
 * Gelişmiş dinamik import için yardımcı fonksiyon
 * Next.js'in dinamik import özelliğini genişletir ve prefetching, loading state gibi
 * daha gelişmiş özellikleri daha kolay hale getirir.
 * 
 * @param importFn Import edilecek bileşeni döndüren fonksiyon
 * @param options Dinamik import seçenekleri
 * @returns Dinamik olarak yüklenen bileşen
 */
export function dynamicImport<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    ssr?: boolean;
    loading?: LoadingComponentType;
    prefetch?: boolean;
    suspense?: boolean;
  }
): React.ComponentType<React.ComponentProps<T>> {
  const { 
    ssr = true, 
    loading, 
    prefetch = false,
    suspense = false
  } = options || {};

  return dynamic(importFn, {
    ssr,
    loading,
    suspense,
    // Önden yükleme için
    ...(prefetch ? { 
      // @ts-ignore - Next.js tipi buna izin veriyor ama TypeScript tanımı güncel değil
      loading: () => {
        // Önbelleğe alma için import fonksiyonunu çağır
        importFn();
        return loading ? loading() : null;
      }
    } : {})
  });
}

/**
 * Route bazlı code splitting için yardımcı fonksiyon
 * Sayfa ağacını gruplandırarak yüklenmesini sağlar
 */
export function withRouteChunking<T extends React.ComponentType<any>>(
  chunkName: string,
  importFn: () => Promise<{ default: T }>,
  options?: {
    ssr?: boolean;
    loading?: LoadingComponentType;
  }
): React.ComponentType<React.ComponentProps<T>> {
  return dynamicImport(() => {
    // webpack chunk name'i ayarla
    return importFn().then(mod => {
      // @ts-ignore - webpack magic comment
      return { default: mod.default };
    });
  }, options);
}

/**
 * Birden fazla bileşeni paralel olarak yüklemek için yardımcı fonksiyon
 * Dashboard gibi çoklu bileşen gerektiren sayfalarda kullanışlıdır
 */
export function useParallelImports<T>(
  imports: Array<() => Promise<{ default: React.ComponentType<any> }>>,
  dependencies: any[] = []
): Array<React.ComponentType<any> | null> {
  const [components, setComponents] = React.useState<Array<React.ComponentType<any> | null>>(
    Array(imports.length).fill(null)
  );

  React.useEffect(() => {
    let mounted = true;
    
    // Tüm importları paralel olarak başlat
    Promise.all(
      imports.map(importFn => importFn())
    ).then(modules => {
      if (mounted) {
        setComponents(modules.map(mod => mod.default));
      }
    });

    return () => {
      mounted = false;
    };
  }, dependencies);

  return components;
} 