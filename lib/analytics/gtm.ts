type EventPayload = Record<string, string | number | boolean | null | undefined>

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>
  }
}

export function trackEvent(event: string, payload: EventPayload = {}) {
  if (typeof window === 'undefined') {
    return
  }

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event,
    ...payload,
  })
}
