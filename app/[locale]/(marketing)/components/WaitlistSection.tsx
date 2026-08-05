'use client'

import { MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { useI18n } from '@/locales/client'

import WaitlistForm from './WaitlistForm'

const FOUNDER_WHATSAPP_NUMBER = '573502106375'

export default function WaitlistSection({ locale }: { locale: string }) {
  const t = useI18n()
  const searchParams = useSearchParams()
  const isTester = searchParams.get('type') === 'tester'
  const whatsappHref = `https://wa.me/${FOUNDER_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    t('marketing.landing.waitlist.whatsapp-message'),
  )}`

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
          {isTester ? null : (
            <p className="mt-3 text-center">
              <Link
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                data-track-cta
                data-cta-id="waitlist_whatsapp"
                data-cta-label={t('marketing.landing.waitlist.whatsapp-cta')}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-landing-accent hover:underline"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {t('marketing.landing.waitlist.whatsapp-cta')}
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
