export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso' },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]['code']

export interface Asset {
  id: string
  type: string
  name: string
  value: number
  currency: CurrencyCode
  user_id: string
}