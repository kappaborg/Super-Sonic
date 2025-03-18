import { ReportHandler, getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

/**
 * Reports Web Vitals to Google Analytics or a custom API
 * 
 * @param metric Web Vitals metrics
 */
function sendToAnalytics(metric: any) {
  const body = JSON.stringify(metric);
  
  // Using Beacon API to report performance data
  // This is a method that ensures data is sent even when the page is closing
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/vitals', body);
  } else {
    // If Beacon API is not supported, use traditional fetch API
    fetch('/api/analytics/vitals', {
      body,
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  // Also print to console (during development)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Web Vital: ${metric.name}`, metric);
  }
}

/**
 * Initializes Web Vitals metrics
 * @param onPerfEntry Optional reporting function
 */
export function initWebVitals(onPerfEntry?: ReportHandler) {
  if (typeof window === 'undefined') return;
  
  // Show in console in development environment
  const reportHandler = onPerfEntry || (process.env.NODE_ENV === 'development' 
    ? (metric) => {
        console.log(`Web Vital: ${metric.name} = ${Math.round(metric.value * 100) / 100}`);
      }
    : sendToAnalytics);
  
  // Start Core Web Vitals measurements
  getCLS(reportHandler); // Cumulative Layout Shift
  getFID(reportHandler); // First Input Delay
  getLCP(reportHandler); // Largest Contentful Paint
  
  // Additional metrics
  getFCP(reportHandler); // First Contentful Paint
  getTTFB(reportHandler); // Time to First Byte
  
  // Determine navigation type
  (window as any).__navigationtype = (window as any).performance?.getEntriesByType?.('navigation')?.[0]?.type || 'navigate';
}

/**
 * Analytics reporting function for Web Vitals
 * @param metric Measurement metric
 */
const reportWebVitals = (onPerfEntry: (metric: any) => void) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    // Largest Contentful Paint - visual performance metric
    getLCP(onPerfEntry);

    // First Input Delay - interaction delay metric
    getFID(onPerfEntry);

    // Cumulative Layout Shift - visual stability metric
    getCLS(onPerfEntry);

    // First Contentful Paint - first visual render metric
    getFCP(onPerfEntry);

    // Time to First Byte - server response time metric
    getTTFB(onPerfEntry);
  }
};

/**
 * Advanced initialization for Web Vitals with custom reporting options
 */
export const initAdvancedWebVitals = () => {
  if (typeof window !== 'undefined') {
    // Show in console in development environment
    if (process.env.NODE_ENV === 'development') {
      reportWebVitals((metric) => {
        console.log(`Web Vitals: ${metric.name} = ${Math.round(metric.value * 100) / 100}`);
      });
    }
    // In production environment, send to analytics service
    else {
      reportWebVitals((metric) => {
        // Here you can send measurements to an analytics service
        // Example: Google Analytics
        const body = {
          name: metric.name,
          value: metric.value,
          id: metric.id,
          delta: metric.delta,
          rating: metric.rating,
          navigationType: (window as any).__navigationtype || 'navigate'
        };

        // Send to Analytics API
        if (window.navigator.sendBeacon) {
          window.navigator.sendBeacon('/api/analytics/web-vitals', JSON.stringify(body));
        } else {
          fetch('/api/analytics/web-vitals', {
            body: JSON.stringify(body),
            method: 'POST',
            keepalive: true,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }
      });
    }

    // Determine navigation type
    (window as any).__navigationtype = (window as any).performance?.getEntriesByType?.('navigation')?.[0]?.type || 'navigate';
  }
};

/**
 * Tracks Web Vitals metrics on page navigation
 */
export const trackPageTransition = (url: string) => {
  // Track page navigation on URL change
  if (typeof window !== 'undefined') {
    (window as any).__navigationtype = 'navigate';

    // Create a clean slate for FCP and LCP
    const clearPaintTimings = () => {
      // Use PerformanceObserver API to clear paint records
      if (window.performance && window.performance.getEntriesByType) {
        const paintTimings = window.performance.getEntriesByType('paint');
        paintTimings.forEach((entry) => {
          window.performance.clearMarks(entry.name);
        });
      }
    };

    // Call the cleanup function with a 50ms delay (sufficient time for page transition)
    setTimeout(clearPaintTimings, 50);
  }
};

export default reportWebVitals; 