import Link from 'next/link'
import { ArrowRight, Bot, Landmark, Sparkles, Zap } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { getI18n } from '@/locales/server'

export default async function Home() {
  const t = await getI18n()

  return (
    <main className="pb-10 sm:pb-16">
      <section className="landing-section pt-8 sm:pt-12">
        <div className="landing-glass rounded-[28px] p-5 sm:p-8 lg:p-10">
          <div className="mb-8 flex items-center justify-between sm:mb-10">
            <div className="inline-flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-landing-accent text-sm font-semibold text-landing-accent-foreground">
                F
              </span>
              <span className="text-sm font-semibold tracking-wide sm:text-base">Finanzen</span>
            </div>
            <Link
              href="#waitlist"
              className="inline-flex items-center gap-2 text-sm font-medium text-landing-text-muted transition-colors hover:text-landing-text"
            >
              {t('marketing.landing.hero.secondary-cta')}
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-landing-border bg-landing-surface-muted px-3 py-1 text-xs font-medium text-landing-text-muted">
                <Sparkles className="h-3.5 w-3.5 text-landing-accent" />
                {t('marketing.landing.hero.badge')}
              </span>

              <h1 className="max-w-2xl text-3xl font-semibold leading-tight text-landing-text sm:text-4xl md:text-5xl">
                {t('marketing.landing.hero.title')}
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-landing-text-muted sm:text-lg">
                {t('marketing.landing.hero.subtitle')}
              </p>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-11 rounded-xl bg-landing-accent px-5 text-landing-accent-foreground hover:bg-landing-accent/90 sm:h-12 sm:px-6"
                >
                  <Link href="#waitlist" className="inline-flex items-center gap-2">
                    {t('marketing.landing.hero.primary-cta')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="landing-card rounded-3xl p-4 sm:p-5">
              <div className="rounded-2xl border border-landing-border bg-landing-surface-muted p-4 sm:p-5">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-landing-text-muted">
                  {t('marketing.landing.hero.mock.net-balance')}
                </p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-2xl font-semibold text-landing-text sm:text-3xl">$2,840,000</p>
                  <p className="text-sm font-medium text-emerald-500">+12.4%</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <StatLine label={t('marketing.landing.hero.mock.assets')} value="$4,100,000" width="78%" />
                <StatLine label={t('marketing.landing.hero.mock.liabilities')} value="$1,260,000" width="38%" />
                <StatLine
                  label={t('marketing.landing.hero.mock.automations')}
                  value={t('marketing.landing.hero.mock.automations-value')}
                  width="64%"
                />
              </div>

              <div className="mt-5 rounded-2xl border border-landing-border bg-landing-surface-muted p-4">
                <p className="text-sm text-landing-text-muted">{t('marketing.landing.hero.mock.ai-insight')}</p>
                <p className="mt-1 text-sm font-medium text-landing-text">
                  {t('marketing.landing.hero.mock.ai-copy')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section pt-0 sm:pt-2">
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

      <section className="landing-section pt-0">
        <div className="landing-card rounded-3xl p-5 sm:p-8">
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
    </main>
  )
}

function StatLine({ label, value, width }: { label: string; value: string; width: string }) {
  return (
    <div className="rounded-2xl border border-landing-border bg-landing-surface-muted p-3.5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-landing-text">{label}</p>
        <p className="text-sm text-landing-text-muted">{value}</p>
      </div>
      <div className="h-1.5 rounded-full bg-landing-border/60">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-landing-gradient-start to-landing-gradient-end"
          style={{ width }}
        />
      </div>
    </div>
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
    <article className="rounded-2xl border border-landing-border bg-landing-surface-muted p-4">
      <div className="mb-3 h-4 w-20 rounded-full bg-landing-border/70" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded-full bg-landing-border/60" />
        <div className="h-3 w-5/6 rounded-full bg-landing-border/50" />
      </div>
      <p className="mt-3 text-xs text-landing-text-muted">{placeholder}</p>
    </article>
  )
}
