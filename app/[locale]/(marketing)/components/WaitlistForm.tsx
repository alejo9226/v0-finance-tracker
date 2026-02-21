'use client'

import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/locales/client'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type WaitlistPayload = {
  email: string
  locale: string
  page_path: string
  source: string
  referrer: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_term: string | null
  utm_content: string | null
}

export default function WaitlistForm({ locale }: { locale: string }) {
  const t = useI18n()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const trackingData = useMemo(
    () => ({
      utm_source: searchParams.get('utm_source'),
      utm_medium: searchParams.get('utm_medium'),
      utm_campaign: searchParams.get('utm_campaign'),
      utm_term: searchParams.get('utm_term'),
      utm_content: searchParams.get('utm_content'),
    }),
    [searchParams],
  )

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!emailRegex.test(email.trim())) {
      setErrorMessage(t('marketing.landing.waitlist.invalid-email'))
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    const referrer = typeof document !== 'undefined' ? document.referrer || null : null
    const source = trackingData.utm_source ?? (referrer ? 'referral' : 'direct')

    const payload: WaitlistPayload = {
      email: email.trim().toLowerCase(),
      locale,
      page_path: pathname ?? '/',
      source,
      referrer,
      ...trackingData,
    }

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok && response.status !== 409) {
        throw new Error('waitlist_submit_failed')
      }

      setIsSuccess(true)
      setEmail('')
    } catch {
      setErrorMessage(t('marketing.landing.waitlist.generic-error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label htmlFor="waitlist-email" className="sr-only">
        {t('marketing.landing.waitlist.input-placeholder')}
      </label>
      <input
        id="waitlist-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={t('marketing.landing.waitlist.input-placeholder')}
        className="h-12 w-full rounded-xl border border-landing-border bg-landing-surface px-4 text-sm text-landing-text outline-none transition focus:border-landing-accent focus:ring-2 focus:ring-landing-ring/35"
        autoComplete="email"
        required
      />

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="h-12 w-full rounded-xl bg-landing-accent text-landing-accent-foreground hover:bg-landing-accent/90"
      >
        {isSubmitting ? t('marketing.landing.waitlist.submitting') : t('marketing.landing.waitlist.submit')}
      </Button>

      {isSuccess ? (
        <p className="text-sm text-emerald-500">{t('marketing.landing.waitlist.success')}</p>
      ) : null}

      {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}
    </form>
  )
}
