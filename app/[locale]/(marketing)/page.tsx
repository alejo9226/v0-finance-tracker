import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  CloudOff,
  History,
  Landmark,
  LinkedinIcon,
  MessageCircle,
  ShieldCheck,
  Users,
  Wrench,
  Zap,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { getI18n } from '@/locales/server'

import IPhoneFrame from './components/iPhoneFrame'
import LandingTracking from './components/LandingTracking'
import WaitlistSection from './components/WaitlistSection'

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>
}>): Promise<import('next').Metadata> {
  const { locale } = await params

  const title =
    locale === 'es'
      ? 'Spendro | Automatiza tus finanzas y unete a la lista'
      : 'Spendro | Automate your finances and join the waitlist'
  const description =
    locale === 'es'
      ? 'Captura movimientos automaticamente, mira tu patrimonio neto en tiempo real y unete al acceso temprano de Spendro.'
      : 'Capture transactions automatically, see your real-time net worth, and join Spendro early access.'

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
    <main className="pb-2">
      <LandingTracking />
      <section aria-label="Hero" className="landing-section pt-8 sm:pt-12">
        <div className="landing-glass rounded-[40px] p-5 sm:p-8 lg:p-10">
          <div className="mb-8 flex items-center justify-between sm:mb-10">
            <div className="inline-flex items-center gap-3">
              <Image
                src="/app-icon.png"
                alt="Spendro"
                width={36}
                height={36}
                className="h-12 w-12 rounded-full object-cover"
              />
              <span className="text-sm font-semibold tracking-wide sm:text-base">Spendro</span>
            </div>
            <Link
              href="#preview"
              data-track-cta
              data-cta-id="hero_secondary"
              data-cta-label={t('marketing.landing.hero.secondary-cta')}
              className="inline-flex items-center gap-2 text-sm font-medium text-landing-text-muted transition-colors hover:text-landing-text"
            >
              {t('marketing.landing.hero.secondary-cta')}
            </Link>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-[1.2fr_auto] md:gap-8 md:items-normal lg:gap-10">
            <div className="order-2 space-y-4 sm:space-y-6 md:order-1 md:space-y-8 lg:space-y-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-text-muted">
                {t('marketing.landing.hero.pre-headline')}
              </p>

              <h1 className=" text-2xl font-semibold leading-tight text-landing-text sm:leading-tight md:text-4xl md:leading-[1.1] sm:text-3xl md:text-[3.5rem] lg:text-[4rem]">
                {t('marketing.landing.hero.title')}
              </h1>

              <p className="max-w-2xl text-sm leading-relaxed text-landing-text-muted sm:text-base md:text-lg lg:text-xl">
                {t('marketing.landing.hero.subtitle')}
              </p>

              <div className="!mt-[1.25rem] flex flex-col gap-3 pt-2 sm:!mt-[2rem] sm:flex-row md:!mt-[4rem] lg:!mt-[3.5rem]">
                <Button
                  asChild
                  size="lg"
                  className="h-10 w-full rounded-2xl bg-landing-accent px-4 text-landing-accent-foreground hover:bg-landing-accent/90 sm:h-11 sm:px-5 md:h-12 md:w-auto md:px-6 lg:h-14 lg:px-8 lg:text-base"
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
              className="order-1 mb-4 md:order-2 md:mb-0 md:mt-0"
              priority
            />
          </div>
        </div>
      </section>

      <section aria-label="Problem" className="landing-section pt-0">
        <div className="landing-glass rounded-[40px] p-5 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-2xl space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500/80">
              {t('marketing.landing.problem.kicker')}
            </p>
            <h2 className="text-2xl font-semibold leading-snug text-landing-text sm:text-3xl">
              {t('marketing.landing.problem.title')}
            </h2>
            <p className="text-sm leading-relaxed text-landing-text-muted sm:text-base">
              {t('marketing.landing.problem.subtitle')}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <PainCard
              icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
              title={t('marketing.landing.problem.pain-1-title')}
              description={t('marketing.landing.problem.pain-1-description')}
            />
            <PainCard
              icon={<Wrench className="h-5 w-5 text-red-500" />}
              title={t('marketing.landing.problem.pain-2-title')}
              description={t('marketing.landing.problem.pain-2-description')}
            />
            <PainCard
              icon={<CloudOff className="h-5 w-5 text-red-500" />}
              title={t('marketing.landing.problem.pain-3-title')}
              description={t('marketing.landing.problem.pain-3-description')}
            />
            <PainCard
              icon={<History className="h-5 w-5 text-red-500" />}
              title={t('marketing.landing.problem.pain-4-title')}
              description={t('marketing.landing.problem.pain-4-description')}
            />
          </div>

          <p className="mx-auto mt-8 max-w-xl text-center text-sm font-medium leading-relaxed text-landing-text sm:text-base">
            {t('marketing.landing.problem.closing')}
          </p>
        </div>
      </section>

      <section id="preview" aria-label="Product preview" className="landing-section pt-0 scroll-mt-20">
        <div className="landing-glass rounded-[40px] p-5 sm:p-8">
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-text-muted">
              {t('marketing.landing.preview.kicker')}
            </p>
            <h2 className="text-2xl font-semibold text-landing-text sm:text-3xl">
              {t('marketing.landing.preview.title')}
            </h2>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <ProductShotPlaceholder
              title={t('marketing.landing.preview.equity-title')}
              subtitle={t('marketing.landing.preview.equity-subtitle')}
              ratioClass="aspect-[9/19.5]"
              imageSrc="/equity-clip-full-demo.mp4"
              imageAlt="Equity dashboard with assets, liabilities and net worth"
              imageObjectFit="scale-down"
              imageWidth={450}
              imageHeight={550}
              overrideHeight={420}
              />
            <ProductShotPlaceholder
              title={t('marketing.landing.preview.ai-chat-title')}
              subtitle={t('marketing.landing.preview.ai-chat-subtitle')}
              ratioClass="aspect-[9/19.5]"
              imageSrc="/aichat-light-shortened.png"
              imageAlt="AI chat assistant for financial insights"
              imageObjectFit="scale-down"
              imageWidth={450}
              imageHeight={559}
              overrideHeight={420}
            />
            <ProductShotPlaceholder
              title={t('marketing.landing.preview.duplicate-title')}
              subtitle={t('marketing.landing.preview.duplicate-subtitle')}
              ratioClass="aspect-[9/19.5]"
              imageSrc="/duplicate-light-shortened.png"
              imageAlt="Swipe to duplicate transactions"
              imageObjectFit="scale-down"
              imageWidth={674}
              imageHeight={1134}
              overrideHeight={480}
            />
            <ProductShotPlaceholder
              title={t('marketing.landing.preview.search-title')}
              subtitle={t('marketing.landing.preview.search-subtitle')}
              ratioClass="aspect-[9/19.5]"
              imageSrc="/deep-search-clip-framed-cropped.mp4"
              imageAlt="Smart search and filter by category emoji"
              imageObjectFit="scale-down"
              imageWidth={450}
              imageHeight={700}
              overrideHeight={480}
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

      <section aria-label="Founder credibility" className="landing-section pt-0">
        <div className="landing-glass rounded-[40px] p-5 sm:p-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-landing-text sm:text-3xl">
              {t('marketing.landing.social-proof.title')}
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-landing-text-muted sm:text-base">
              {t('marketing.landing.social-proof.subtitle')}
            </p>
          </div>

          <LinkedInPreviewCard
            name={t('marketing.landing.social-proof.linkedin-name')}
            headline={t('marketing.landing.social-proof.linkedin-headline')}
            cta={t('marketing.landing.social-proof.linkedin-cta')}
            verifiedLabel={t('marketing.landing.social-proof.linkedin-verified')}
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <EvidenceCard
              title={t('marketing.landing.social-proof.evidence-1-title')}
              description={t('marketing.landing.social-proof.evidence-1-description')}
            />
            <EvidenceCard
              title={t('marketing.landing.social-proof.evidence-2-title')}
              description={t('marketing.landing.social-proof.evidence-2-description')}
            />
            <EvidenceCard
              title={t('marketing.landing.social-proof.evidence-3-title')}
              description={t('marketing.landing.social-proof.evidence-3-description')}
            />
          </div>
        </div>

        <div className="mx-auto mt-16 mb-2 max-w-2xl rounded-2xl border border-landing-border bg-landing-surface-muted px-4 py-3 sm:px-5 sm:mb-3">
          <p className="text-center text-sm text-landing-text-muted">{t('marketing.landing.footer.trust')}</p>
        </div>
      </section>

      <section id="pricing" aria-label="Founder pricing" className="landing-section pt-0 scroll-mt-20">
        <div className="landing-glass rounded-[40px] p-5 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-landing-border bg-landing-surface-muted px-3 py-1 text-xs font-medium text-landing-text-muted">
              <Clock className="h-3.5 w-3.5 text-landing-accent" />
              {t('marketing.landing.pricing.urgency-badge')}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-landing-border bg-landing-surface-muted px-3 py-1 text-xs font-medium text-landing-text-muted">
              <Users className="h-3.5 w-3.5 text-landing-accent" />
              {t('marketing.landing.pricing.scarcity-badge')}
            </span>
          </div>

          <div className="mt-5 space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-text-muted">
              {t('marketing.landing.pricing.kicker')}
            </p>
            <h2 className="text-2xl font-semibold text-landing-text sm:text-3xl">
              {t('marketing.landing.pricing.title')}
            </h2>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-landing-text-muted sm:text-base">
              {t('marketing.landing.pricing.subtitle')}
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-3xl">
            <div className="landing-card rounded-3xl p-6 sm:p-8">
              <div className="flex flex-wrap items-end justify-center gap-2 text-center">
                <span className="pb-1.5 text-base text-landing-text-muted/70 line-through sm:text-lg">
                  {t('marketing.landing.pricing.price-original')}
                </span>
                <span className="text-4xl font-semibold text-landing-text sm:text-5xl">
                  {t('marketing.landing.pricing.price-current')}
                </span>
                <span className="pb-1.5 text-sm text-landing-text-muted sm:text-base">
                  {t('marketing.landing.pricing.price-period')}
                </span>
              </div>
              <p className="mt-2 text-center text-xs text-landing-text-muted sm:text-sm">
                {t('marketing.landing.pricing.price-future-note')}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-landing-text">
                    {t('marketing.landing.pricing.includes-title')}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {[
                      t('marketing.landing.pricing.include-1'),
                      t('marketing.landing.pricing.include-2'),
                      t('marketing.landing.pricing.include-3'),
                      t('marketing.landing.pricing.include-4'),
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-landing-text-muted">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-landing-accent" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-landing-text-muted/80">
                    {t('marketing.landing.pricing.not-included')}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-landing-text">
                    {t('marketing.landing.pricing.bonuses-title')}
                  </p>
                  <div className="mt-3 space-y-3">
                    <BonusItem
                      title={t('marketing.landing.pricing.bonus-1-title')}
                      description={t('marketing.landing.pricing.bonus-1-description')}
                      value={t('marketing.landing.pricing.bonus-1-value')}
                    />
                    <BonusItem
                      title={t('marketing.landing.pricing.bonus-2-title')}
                      description={t('marketing.landing.pricing.bonus-2-description')}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-2 rounded-2xl border border-landing-border bg-landing-surface-muted px-4 py-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-landing-accent" />
                <div>
                  <p className="text-sm font-semibold text-landing-text">
                    {t('marketing.landing.pricing.guarantee-title')}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-landing-text-muted sm:text-sm">
                    {t('marketing.landing.pricing.guarantee-copy')}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-center text-xs font-medium text-landing-accent sm:text-sm">
                {t('marketing.landing.pricing.incentive-copy')}
              </p>

              <div className="mt-6 flex justify-center">
                <Button
                  asChild
                  size="lg"
                  className="h-11 w-full rounded-2xl bg-landing-accent px-6 text-landing-accent-foreground hover:bg-landing-accent/90 sm:w-auto sm:h-12"
                >
                  <Link
                    href="#waitlist"
                    data-track-cta
                    data-cta-id="pricing_primary"
                    data-cta-label={t('marketing.landing.pricing.cta')}
                    className="inline-flex items-center gap-2"
                  >
                    <span className="sm:hidden">{t('marketing.landing.pricing.cta-short')}</span>
                    <span className="hidden sm:inline">{t('marketing.landing.pricing.cta')}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" aria-label="Frequently asked questions" className="landing-section pt-0 scroll-mt-20">
        <div className="landing-glass rounded-[40px] p-5 sm:p-8">
          <h2 className="text-center text-2xl font-semibold text-landing-text sm:text-3xl">
            {t('marketing.landing.faq.title')}
          </h2>

          <div className="mx-auto mt-6 max-w-2xl">
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: t('marketing.landing.faq.q1'), a: t('marketing.landing.faq.a1') },
                { q: t('marketing.landing.faq.q2'), a: t('marketing.landing.faq.a2') },
                { q: t('marketing.landing.faq.q3'), a: t('marketing.landing.faq.a3') },
                { q: t('marketing.landing.faq.q4'), a: t('marketing.landing.faq.a4') },
                { q: t('marketing.landing.faq.q5'), a: t('marketing.landing.faq.a5') },
              ].map((item, index) => (
                <AccordionItem key={item.q} value={`faq-${index}`} className="border-landing-border">
                  <AccordionTrigger className="text-left text-sm font-medium text-landing-text sm:text-base">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-landing-text-muted">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <WaitlistSection locale={locale} />

      <footer className="mt-12 pb-2 text-center">
        {/* <Button asChild variant="outline" size="sm" className="mb-6 rounded-xl border-landing-border bg-transparent text-landing-text-muted hover:bg-landing-surface-muted hover:text-landing-text">
          <Link href="?type=tester#waitlist" data-track-cta data-cta-id="footer_become_tester" data-cta-label={t('marketing.landing.footer.become-tester')}>
            {t('marketing.landing.footer.become-tester')}
          </Link>
        </Button> */}
        <p className="text-xs text-landing-text-muted">{t('marketing.landing.footer.copyright')}</p>
        <p className="mt-1 text-xs text-landing-text-muted/80">
          {t('marketing.landing.footer.developed-by')}{' '}
          <span className="inline-block align-middle text-2xl">🇨🇴</span>
        </p>
      </footer>
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

function PainCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <article className="landing-card rounded-3xl p-5 sm:p-6">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
        {icon}
      </span>
      <h3 className="mt-4 text-sm font-semibold leading-snug text-landing-text sm:text-base">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-landing-text-muted">{description}</p>
    </article>
  )
}

function EvidenceCard({ title, description }: { title: string; description: string }) {
  return (
    <article className="landing-glass rounded-3xl p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-landing-text">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-landing-text-muted sm:text-sm">{description}</p>
    </article>
  )
}

function LinkedInPreviewCard({
  name,
  headline,
  cta,
  verifiedLabel,
}: {
  name: string
  headline: string
  cta: string
  verifiedLabel: string
}) {
  return (
    <Link
      href="https://www.linkedin.com/in/alejandroalfarom/"
      target="_blank"
      rel="noopener noreferrer"
      data-track-cta
      data-cta-id="founder_linkedin"
      data-cta-label={cta}
      className="group mt-6 inline-flex items-center gap-2.5"
    >
      <div className="relative shrink-0">
        <Image
          src="/alejandro-profile-pic.png"
          alt={name}
          width={40}
          height={40}
          className="h-10 w-10 rounded-full object-cover"
        />
        <ShieldCheck
          aria-label={verifiedLabel}
          className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-landing-surface text-landing-accent"
        />
      </div>
      <p className="text-sm">
        <span className="font-semibold text-landing-text group-hover:underline">{name}</span>
        <span className="text-landing-text-muted"> · {headline}</span>
      </p>
    </Link>
  )
}

function BonusItem({ title, description, value }: { title: string; description: string; value?: string }) {
  return (
    <div className="flex items-start gap-2">
      <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-landing-accent" />
      <div>
        <p className="text-sm text-landing-text">
          {title}
          {value ? <span className="ml-1 text-xs font-medium text-landing-text-muted">({value})</span> : null}
        </p>
        <p className="text-xs text-landing-text-muted">{description}</p>
      </div>
    </div>
  )
}

const VIDEO_EXTENSIONS = ['.mp4', '.webm']

function isVideoSrc(src: string) {
  return VIDEO_EXTENSIONS.some((ext) => src.toLowerCase().endsWith(ext))
}

function ProductShotPlaceholder({
  title,
  subtitle,
  ratioClass,
  imageSrc,
  imageAlt,
  imageObjectFit = 'cover',
  imageWidth,
  imageHeight,
  posterSrc,
  overrideHeight,
}: {
    title: string
    subtitle: string
    ratioClass: string
    imageSrc?: string
    imageAlt?: string
    imageObjectFit?: 'cover' | 'scale-down'
    imageWidth?: number
    imageHeight?: number
    posterSrc?: string
    overrideHeight?: number
}) {
  const objectFitClass = imageObjectFit === 'scale-down' ? 'object-scale-down' : 'object-cover object-top'
  const hasImage = Boolean(imageSrc)
  const isVideo = hasImage && isVideoSrc(imageSrc!)
  const sizeToImage = hasImage && imageWidth != null && imageHeight != null

  return (
    <article
      className={`landing-glass rounded-3xl p-4 sm:p-5 ${sizeToImage ? 'mx-auto w-fit h-fit max-w-full' : ''}`}
    >
      <div className="mb-6">
        <p className="text-sm font-semibold text-landing-text">{title}</p>
        <p className="text-xs text-landing-text-muted sm:text-sm">{subtitle}</p>
      </div>
      <div
        className={`overflow-hidden rounded-2xl p-2 bg-white/40 ${sizeToImage ? 'relative mx-auto w-fit max-w-full' : `relative ${ratioClass}`}`}
      >
        {isVideo ? (
          <video
            src={imageSrc}
            poster={posterSrc}
            autoPlay
            muted
            loop
            playsInline
            width={sizeToImage ? imageWidth : undefined}
            height={sizeToImage ? imageHeight : undefined}
            style={sizeToImage ? { height: overrideHeight ?? 550, width: 'auto' } : undefined}
            className={
              sizeToImage
                ? `max-w-full ${objectFitClass}`
                : `absolute inset-0 h-full w-full ${objectFitClass}`
            }
          />
        ) : imageSrc ? (
          sizeToImage ? (
            <Image
              src={imageSrc}
              alt={imageAlt ?? title}
              width={imageWidth}
              height={imageHeight}
              sizes="(max-width: 640px) 100vw, 50vw"
              style={{ height: overrideHeight ?? 430, width: 'auto' }}
              className={`max-w-full ${objectFitClass}`}
            />
          ) : (
            <Image
              src={imageSrc}
              alt={imageAlt ?? title}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className={objectFitClass}
            />
          )
        ) : (
          <div className="flex h-full flex-col gap-3 p-4">
            <div className="h-5 w-1/3 rounded-md bg-gray-200/70" />
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-gray-200/55" />
              <div className="rounded-2xl bg-gray-200/45" />
              <div className="rounded-2xl bg-gray-200/45 sm:col-span-2" />
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
