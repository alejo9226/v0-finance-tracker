import { Asset, CURRENCIES, CurrencyCode } from '@/domain/entities/Asset'
import { Liability } from '@/lib/supabase/data-services/liabilities'

export type CurrencyTotals = {
  [key in CurrencyCode]: {
    assets: number
    liabilities: number
  }
}

/**
 * Calculates the currency totals for the assets and liabilities
 * @param assets - The assets to calculate the totals for
 * @param liabilities - The liabilities to calculate the totals for
 * @returns The currency totals
 */
export function calculateCurrencyTotals(
  assets: Asset[] = [],
  liabilities: Liability[] = [],
): Partial<CurrencyTotals> {
  const newCurrencyTotals: CurrencyTotals = {} as CurrencyTotals

  // Initialize totals for each currency
  CURRENCIES.forEach((currency) => {
    // currency.code can be USD, BRL, COP, etc.
    newCurrencyTotals[currency.code] = {
      assets: 0,
      liabilities: 0,
    }
  })

  // Calculate totals for assets
  assets.forEach((asset) => {
    newCurrencyTotals[asset.currency as CurrencyCode].assets += Number(asset.value)
  })

  // Calculate totals for liabilities
  liabilities.forEach((liability) => {
    newCurrencyTotals[liability.currency as CurrencyCode].liabilities += Number(liability.value)
  })

  // Filter out currencies with no assets or liabilities
  Object.keys(newCurrencyTotals).forEach((currency) => {
    if (
      newCurrencyTotals[currency as CurrencyCode].assets === 0 &&
      newCurrencyTotals[currency as CurrencyCode].liabilities === 0
    ) {
      delete newCurrencyTotals[currency as CurrencyCode]
    }
  })

  return newCurrencyTotals as Partial<CurrencyTotals>
}
