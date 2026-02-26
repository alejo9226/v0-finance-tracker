'use client'

import { useEffect } from 'react'

import { trackEvent } from '@/lib/analytics/gtm'

const ga4MeasurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID

export default function MarketingToolsConfig() {
  useEffect(() => {
    if (!ga4MeasurementId && !metaPixelId && !clarityProjectId) {
      return
    }

    trackEvent('marketing_tools_config', {
      ga4_measurement_id: ga4MeasurementId ?? null,
      meta_pixel_id: metaPixelId ?? null,
      clarity_project_id: clarityProjectId ?? null,
      ga4_enabled: Boolean(ga4MeasurementId),
      meta_pixel_enabled: Boolean(metaPixelId),
      clarity_enabled: Boolean(clarityProjectId),
    })
  }, [])

  return null
}
