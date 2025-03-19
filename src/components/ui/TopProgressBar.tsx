'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import { useEffect } from 'react';

// Add CSS for NProgress
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 500,
  showSpinner: false,
});

export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // When the route changes, start the progress bar
    NProgress.start();

    // When the route change is complete, finish the progress bar
    const timer = setTimeout(() => {
      NProgress.done();
    }, 300);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [pathname, searchParams]);

  return null;
} 