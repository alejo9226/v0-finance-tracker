import { Asset } from "@/domain/entities/Asset"
import { CurrencyCode } from "@/domain/entities/Asset"
import { convertCurrency } from "@/lib/utils/currency"


export const calculateTotalValue = (
  assets: Asset[],
  displayCurrency: CurrencyCode | ""
): number => {

  return assets.reduce((sum, asset) => {
    const value = convertCurrency(Number(asset.value), asset.currency, displayCurrency)
    return sum + value
  }, 0)
}