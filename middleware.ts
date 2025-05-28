import { createI18nMiddleware } from 'next-international/middleware'
import { NextRequest } from 'next/server'

const SUPPORTED_LOCALES = ['en', 'es', 'pt']

// Refer to the docs for more information: https://next-international.vercel.app/docs/app-setup
const I18nMiddleware = createI18nMiddleware({
  locales: SUPPORTED_LOCALES,
  defaultLocale: 'en',
  
  // Rewrite the URL to hide the locale.
  urlMappingStrategy: 'rewrite',

  // Resolve the locale from the request.
  resolveLocaleFromRequest: (request: NextRequest) => {
    const acceptLang = request.headers.get('accept-language')
    
    const lang = acceptLang?.split(',')[0].split('-')[0]
    return SUPPORTED_LOCALES.includes(lang || '') ? lang! : 'en'
  }
})
 
export function middleware(request: NextRequest) {
  return I18nMiddleware(request)
}
 
export const config = {
  matcher: [
    '/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'
  ]
}