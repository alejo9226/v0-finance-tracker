import { createI18nServer } from 'next-international/server'
 
export const { getI18n, getScopedI18n, getStaticParams } = createI18nServer({
  en: () => import('./translations/en'),
  es: () => import('./translations/es'),
  pt: () => import('./translations/pt')
})