# Landing Analytics Setup

This landing uses Google Tag Manager (GTM) as the single container.

## Required environment variables

- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID`
- `NEXT_PUBLIC_META_PIXEL_ID`
- `NEXT_PUBLIC_CLARITY_PROJECT_ID`

## How data reaches GTM

The app pushes a `marketing_tools_config` event to `dataLayer` with:

- `ga4_measurement_id`
- `meta_pixel_id`
- `clarity_project_id`
- `ga4_enabled`
- `meta_pixel_enabled`
- `clarity_enabled`

The app also pushes funnel events:

- `pageview`
- `scroll_depth`
- `cta_click`
- `email_submitted`

## GTM recommendations

1. Create Data Layer Variables for all IDs and booleans above.
2. Create tags for GA4, Meta Pixel, and Clarity using those variables.
3. Set triggers:
   - `pageview` for page views
   - `scroll_depth` for scroll analysis
   - `cta_click` for CTA tracking
   - `email_submitted` for waitlist conversions
4. Validate with GTM Preview mode before publishing.
