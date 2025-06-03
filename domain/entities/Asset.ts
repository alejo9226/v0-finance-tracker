export type CurrencyCode = {
  code: string
  symbol: string
  name: string
}

export const CURRENCIES: CurrencyCode[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso' },
]

export interface Asset {
  id: string
  type: string
  name: string
  value: number
  currency: CurrencyCode
  user_id: string
}
