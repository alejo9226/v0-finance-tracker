import { NextResponse } from 'next/server'

import { getSupabaseServerClient } from '@/lib/supabase/server'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const signupType =
      body.signup_type === 'tester' ? 'tester' : 'early_access'

    const supabase = getSupabaseServerClient()
    const { error } = await supabase.from('landing_waitlist').insert({
      email,
      signup_type: signupType,
      locale: typeof body.locale === 'string' ? body.locale : null,
      source: typeof body.source === 'string' ? body.source : null,
      referrer: typeof body.referrer === 'string' ? body.referrer : null,
      page_path: typeof body.page_path === 'string' ? body.page_path : null,
      utm_source: typeof body.utm_source === 'string' ? body.utm_source : null,
      utm_medium: typeof body.utm_medium === 'string' ? body.utm_medium : null,
      utm_campaign: typeof body.utm_campaign === 'string' ? body.utm_campaign : null,
      utm_term: typeof body.utm_term === 'string' ? body.utm_term : null,
      utm_content: typeof body.utm_content === 'string' ? body.utm_content : null,
    })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
      }

      console.error('Waitlist insert failed:', error)
      return NextResponse.json({ error: 'Failed to store waitlist email' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error: unknown) {
    console.error('Unexpected waitlist route error:', error)
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
