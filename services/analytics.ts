
/**
 * Simple analytics wrapper for tracking user events.
 * Plumbed into Google Analytics if present, with console fallback for development.
 */
export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  // @ts-ignore
  if (typeof window.gtag === 'function') {
    // @ts-ignore
    window.gtag('event', eventName, params);
  }
  
  // Log for development and transparency
  console.debug(`[Analytics] ${eventName}`, params);
};

export const trackPageView = (source: 'notification' | 'icon' | 'direct') => {
  trackEvent('page_view', { 
    page_title: 'Steady Main View',
    trigger_source: source 
  });
};
