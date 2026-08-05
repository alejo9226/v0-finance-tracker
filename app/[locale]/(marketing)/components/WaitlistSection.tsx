'use client'

import { useSearchParams } from 'next/navigation'

import { useI18n } from '@/locales/client'

import WaitlistForm from './WaitlistForm'

export default function WaitlistSection({ locale }: { locale: string }) {
  const t = useI18n()
  const searchParams = useSearchParams()
  const isTester = searchParams.get('type') === 'tester'

  return (
    <section id="waitlist" aria-label="Waitlist signup" className="landing-section pt-0">
      <div className="landing-glass rounded-[40px] p-5 sm:p-8">
        <div className="mx-auto max-w-xl space-y-3 text-center">
          <h2 className="text-2xl font-semibold text-landing-text sm:text-3xl">
            {isTester ? t('marketing.landing.waitlist.title-tester') : t('marketing.landing.waitlist.title')}
          </h2>
          <p className="text-sm leading-relaxed text-landing-text-muted sm:text-base">
            {isTester ? t('marketing.landing.waitlist.subtitle-tester') : t('marketing.landing.waitlist.subtitle')}
          </p>
        </div>

        <div className="mx-auto mt-6 max-w-xl">
          <WaitlistForm locale={locale} />
          <p className="mt-3 text-center text-xs text-landing-text-muted">
            {isTester ? t('marketing.landing.waitlist.privacy-note-tester') : t('marketing.landing.waitlist.privacy-note')}
          </p>
        </div>
      </div>
    </section>
  )
}
