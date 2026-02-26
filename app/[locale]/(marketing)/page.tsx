import { ArrowRight, Bot, Landmark, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { getI18n } from '@/locales/server'

import IPhoneFrame from './components/iPhoneFrame'
import LandingTracking from './components/LandingTracking'
import WaitlistForm from './components/WaitlistForm'

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>
}>): Promise<import('next').Metadata> {
  const { locale } = await params

  const title =
    locale === 'es'
      ? 'Finanzen | Automatiza tus finanzas y unete a la lista'
      : 'Finanzen | Automate your finances and join the waitlist'
  const description =
    locale === 'es'
      ? 'Captura movimientos automaticamente, mira tu patrimonio neto en tiempo real y unete al acceso temprano de Finanzen.'
      : 'Capture transactions automatically, see your real-time net worth, and join Finanzen early access.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function Home({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  const t = await getI18n()

  return (
    <main className="pb-10 sm:pb-16">
      <LandingTracking />
      <section aria-label="Hero" className="landing-section pt-8 sm:pt-12">
        <div className="landing-glass rounded-[40px] p-5 sm:p-8 lg:p-10">
          <div className="mb-8 flex items-center justify-between sm:mb-10">
            <div className="inline-flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-landing-accent text-sm font-semibold text-landing-accent-foreground">
                F
              </span>
              <span className="text-sm font-semibold tracking-wide sm:text-base">Finanzen</span>
            </div>
            <Link
              href="#waitlist"
              data-track-cta
              data-cta-id="hero_secondary"
              data-cta-label={t('marketing.landing.hero.secondary-cta')}
              className="inline-flex items-center gap-2 text-sm font-medium text-landing-text-muted transition-colors hover:text-landing-text"
            >
              {t('marketing.landing.hero.secondary-cta')}
            </Link>
          </div>

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.2fr_auto] lg:items-normal">
            <div className="order-2 space-y-8 lg:order-1">
              <span className="inline-flex items-center gap-2 rounded-full border border-landing-border bg-landing-surface-muted px-3 py-1 text-xs font-medium text-landing-text-muted">
                <Sparkles className="h-3.5 w-3.5 text-landing-accent" />
                {t('marketing.landing.hero.badge')}
              </span>

              <h1 className="max-w-2xl text-3xl font-semibold leading-tight md:leading-[1.1] text-landing-text sm:text-4xl md:text-[4.3rem]">
                {t('marketing.landing.hero.title')}
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-landing-text-muted sm:text-lg">
                {t('marketing.landing.hero.subtitle')}
              </p>

              <div className="!mt-[2rem] flex flex-col gap-3 pt-2 sm:flex-row sm:!mt-[4rem]">
                <Button
                  asChild
                  size="lg"
                  className="h-11 w-full rounded-2xl bg-landing-accent px-5 text-landing-accent-foreground hover:bg-landing-accent/90 sm:h-12 sm:w-auto sm:px-6"
                >
                  <Link
                    href="#waitlist"
                    data-track-cta
                    data-cta-id="hero_primary"
                    data-cta-label={t('marketing.landing.hero.primary-cta')}
                    className="inline-flex items-center gap-2"
                  >
                    {t('marketing.landing.hero.primary-cta')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <IPhoneFrame
              src="/iphone-frame-spending.png"
              alt="Spending dashboard with donut chart and transactions"
              className="order-1 mb-4 lg:order-2 lg:mb-0 lg:mt-0"
              priority
            />
          </div>
        </div>
      </section>

      <section aria-label="Product preview" className="landing-section pt-0">
        <div className="landing-glass rounded-[40px] p-5 sm:p-8">
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-text-muted">
              {t('marketing.landing.preview.kicker')}
            </p>
            <h2 className="text-2xl font-semibold text-landing-text sm:text-3xl">
              {t('marketing.landing.preview.title')}
            </h2>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-[0.65fr_1fr]">
            <ProductShotPlaceholder
              title={t('marketing.landing.preview.mobile-title')}
              subtitle={t('marketing.landing.preview.mobile-subtitle')}
              ratioClass="aspect-[9/16]"
            />
            <ProductShotPlaceholder
              title={t('marketing.landing.preview.desktop-title')}
              subtitle={t('marketing.landing.preview.desktop-subtitle')}
              ratioClass="aspect-[16/10]"
            />
          </div>
        </div>
      </section>

      <section aria-label="Value pillars" className="landing-section pt-0 sm:pt-2">
        <div className="space-y-3 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-landing-text sm:text-3xl">
            {t('marketing.landing.pillars.title')}
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-landing-text-muted sm:text-base">
            {t('marketing.landing.pillars.subtitle')}
          </p>
        </div>

        <div className="mt-7 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
          <PillarCard
            icon={<Zap className="h-5 w-5 text-landing-accent" />}
            title={t('marketing.landing.pillars.automation.title')}
            shortCopy={t('marketing.landing.pillars.automation.short')}
            description={t('marketing.landing.pillars.automation.description')}
          />
          <PillarCard
            icon={<Landmark className="h-5 w-5 text-landing-accent" />}
            title={t('marketing.landing.pillars.net-worth.title')}
            shortCopy={t('marketing.landing.pillars.net-worth.short')}
            description={t('marketing.landing.pillars.net-worth.description')}
          />
          <PillarCard
            icon={<Bot className="h-5 w-5 text-landing-accent" />}
            title={t('marketing.landing.pillars.ai.title')}
            shortCopy={t('marketing.landing.pillars.ai.short')}
            description={t('marketing.landing.pillars.ai.description')}
          />
        </div>
      </section>

      <section aria-label="Social proof and trust" className="landing-section pt-0">
        <div className="landing-glass rounded-[40px] p-5 sm:p-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-landing-text sm:text-3xl">
              {t('marketing.landing.social-proof.title')}
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-landing-text-muted sm:text-base">
              {t('marketing.landing.social-proof.subtitle')}
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <QuotePlaceholder placeholder={t('marketing.landing.social-proof.placeholder')} />
            <QuotePlaceholder placeholder={t('marketing.landing.social-proof.placeholder')} />
            <QuotePlaceholder placeholder={t('marketing.landing.social-proof.placeholder')} />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-landing-border bg-landing-surface-muted px-4 py-3 sm:px-5">
          <p className="text-center text-sm text-landing-text-muted">{t('marketing.landing.footer.trust')}</p>
        </div>
      </section>

      <section id="waitlist" aria-label="Waitlist signup" className="landing-section pt-0">
        <div className="landing-glass rounded-[40px] p-5 sm:p-8">
          <div className="mx-auto max-w-xl space-y-3 text-center">
            <h2 className="text-2xl font-semibold text-landing-text sm:text-3xl">
              {t('marketing.landing.waitlist.title')}
            </h2>
            <p className="text-sm leading-relaxed text-landing-text-muted sm:text-base">
              {t('marketing.landing.waitlist.subtitle')}
            </p>
          </div>

          <div className="mx-auto mt-6 max-w-xl">
            <WaitlistForm locale={locale} />
            <p className="mt-3 text-center text-xs text-landing-text-muted">
              {t('marketing.landing.waitlist.privacy-note')}
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

function PillarCard({
  icon,
  title,
  shortCopy,
  description,
}: {
  icon: ReactNode
  title: string
  shortCopy: string
  description: string
}) {
  return (
    <article className="landing-card rounded-3xl p-5 sm:p-6">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-landing-surface-muted">
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-landing-text">{title}</h3>
      <p className="mt-2 text-sm font-medium text-landing-text">{shortCopy}</p>
      <p className="mt-2 text-sm leading-relaxed text-landing-text-muted">{description}</p>
    </article>
  )
}

function QuotePlaceholder({ placeholder }: { placeholder: string }) {
  return (
    <article className="landing-glass rounded-3xl p-4">
      <div className="mb-3 h-4 w-20 rounded-full bg-landing-border/70" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded-full bg-landing-border/60" />
        <div className="h-3 w-5/6 rounded-full bg-landing-border/50" />
      </div>
      <p className="mt-3 text-xs text-landing-text-muted">{placeholder}</p>
    </article>
  )
}

function ProductShotPlaceholder({
  title,
  subtitle,
  ratioClass,
}: {
  title: string
  subtitle: string
  ratioClass: string
}) {
  return (
    <article className="landing-glass rounded-3xl p-4 sm:p-5">
      <div className="mb-3">
        <p className="text-sm font-semibold text-landing-text">{title}</p>
        <p className="text-xs text-landing-text-muted sm:text-sm">{subtitle}</p>
      </div>
      <div className={`${ratioClass} overflow-hidden rounded-2xl border border-landing-border/80 bg-white/40`}>
        <div className="flex h-full flex-col gap-3 p-4">
          <div className="h-5 w-1/3 rounded-md bg-gray-200/70" />
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-gray-200/55" />
            <div className="rounded-2xl bg-gray-200/45" />
            <div className="rounded-2xl bg-gray-200/45 sm:col-span-2" />
          </div>
        </div>
      </div>
    </article>
  )
}
