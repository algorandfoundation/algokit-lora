import Decimal from 'decimal.js'
import { formatDecimalAmount, getLocale } from './number-format'

export const compactAmount = (amount: Decimal | number) => {
  const locale = getLocale()
  const decimalAmount = amount instanceof Decimal ? amount : new Decimal(amount)

  if (amount.toString().length < 9) {
    return formatDecimalAmount(decimalAmount)
  }

  const numberAmount = decimalAmount.toNumber()
  return numberAmount > 0 ? `≈${numberAmount.toLocaleString(locale, { notation: 'compact' })}` : formatDecimalAmount(decimalAmount)
}
