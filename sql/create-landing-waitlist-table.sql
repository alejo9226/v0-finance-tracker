create table if not exists public.landing_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  locale text,
  source text,
  page_path text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  created_at timestamptz not null default now()
);

create index if not exists landing_waitlist_created_at_idx on public.landing_waitlist (created_at desc);
