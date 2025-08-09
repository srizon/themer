export const GA_MEASUREMENT_ID: string =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export function isGoogleAnalyticsConfigured(): boolean {
  return typeof window !== "undefined" && GA_MEASUREMENT_ID.length > 0;
}

export function pageview(url: string): void {
  if (!isGoogleAnalyticsConfigured() || typeof window.gtag !== "function") {
    return;
  }
  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

export function trackEvent(
  action: string,
  params?: Record<string, unknown>
): void {
  if (!isGoogleAnalyticsConfigured() || typeof window.gtag !== "function") {
    return;
  }
  window.gtag("event", action, params ?? {});
}


