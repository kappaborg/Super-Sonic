import React from 'react';

// React özel tipleri
declare module 'react' {
  interface HTMLAttributes<T> {
    fetchPriority?: 'high' | 'low' | 'auto';
    crossOrigin?: string;
  }
}

// JSX elementleri için global tanımlama
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }

  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

// Resim modülleri için tip tanımlamaları
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
} 