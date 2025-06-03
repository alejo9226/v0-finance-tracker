import currency from 'currency.js'

import { CurrencyCode } from '@/domain/entities/Asset'
import { EXCHANGE_RATES } from '@/lib/constants/exchangeRates'

export const convertCurrency = (
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode | '',
): number => {
  if (toCurrency === '') return amount
  if (fromCurrency === toCurrency) return amount

  // Convert through USD as the base currency
  const amountInUsd = currency(amount).divide(EXCHANGE_RATES[fromCurrency])
  return amountInUsd.multiply(EXCHANGE_RATES[toCurrency]).value
}
