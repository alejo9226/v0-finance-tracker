'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

import { trackEvent } from '@/lib/analytics/gtm'

const thresholds = [25, 50, 75, 100]

export default function LandingTracking() {
  const pathname = usePathname()
  const seenThresholdsRef = useRef(new Set<number>())

  useEffect(() => {
    seenThresholdsRef.current = new Set<number>()
  }, [pathname])

  useEffect(() => {
    trackEvent('pageview', {
      page_path: pathname,
      page_type: 'landing',
    })
  }, [pathname])

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const maxScrollable = document.documentElement.scrollHeight - window.innerHeight
      const depth = maxScrollable > 0 ? Math.round((scrollTop / maxScrollable) * 100) : 100

      thresholds.forEach((threshold) => {
        if (depth >= threshold && !seenThresholdsRef.current.has(threshold)) {
          seenThresholdsRef.current.add(threshold)
          trackEvent('scroll_depth', {
            page_path: pathname,
            scroll_percentage: threshold,
          })
        }
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const ctaNode = target?.closest<HTMLElement>('[data-track-cta]')
      if (!ctaNode) {
        return
      }

      trackEvent('cta_click', {
        page_path: pathname,
        cta_id: ctaNode.dataset.ctaId || 'unknown',
        cta_label: ctaNode.dataset.ctaLabel || ctaNode.textContent?.trim() || 'unknown',
      })
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [pathname])

  return null
}
