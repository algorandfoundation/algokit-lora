import Decimal from 'decimal.js'

export const compactAmount = (amount: Decimal | number) => {
  if (amount.toString().length < 9) {
    return amount.toString()
  }

  const numberAmount = typeof amount === 'number' ? amount : amount.toNumber()
  return numberAmount > 0 ? `≈${numberAmount.toLocaleString('en-US', { notation: 'compact' })}` : numberAmount.toString()
}
