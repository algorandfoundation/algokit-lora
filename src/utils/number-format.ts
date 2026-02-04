import Decimal from 'decimal.js'

/**
 * Get the user's locale from the browser.
 * Falls back to 'en-US' if locale detection fails.
 */
export const getLocale = (): string => {
  try {
    return navigator.language || 'en-US'
  } catch {
    return 'en-US'
  }
}

/**
 * Get the thousand separator for the given locale.
 */
export const getThousandSeparator = (locale?: string): string => {
  const resolvedLocale = locale || getLocale()
  const parts = new Intl.NumberFormat(resolvedLocale).formatToParts(1000)
  const groupPart = parts.find((part) => part.type === 'group')
  return groupPart?.value || ','
}

/**
 * Get the decimal separator for the given locale.
 */
export const getDecimalSeparator = (locale?: string): string => {
  const resolvedLocale = locale || getLocale()
  const parts = new Intl.NumberFormat(resolvedLocale).formatToParts(1.1)
  const decimalPart = parts.find((part) => part.type === 'decimal')
  return decimalPart?.value || '.'
}

/**
 * Format a Decimal value preserving its precision for display.
 * This is used for amounts where we need to show the exact decimal representation
 * but with locale-appropriate separators.
 */
export const formatDecimalAmount = (value: Decimal, locale?: string): string => {
  const resolvedLocale = locale || getLocale()
  const stringValue = value.toString()

  // Split into integer and decimal parts
  const [intPart, decPart] = stringValue.split('.')
  const decimalSeparator = getDecimalSeparator(resolvedLocale)

  // Format the integer part with thousand separators
  // Handle negative numbers by extracting the sign
  const isNegative = intPart.startsWith('-')
  const absIntPart = isNegative ? intPart.slice(1) : intPart
  const formattedInt = BigInt(absIntPart).toLocaleString(resolvedLocale)
  const signedFormattedInt = isNegative ? `-${formattedInt}` : formattedInt

  if (!decPart) {
    return signedFormattedInt
  }

  return `${signedFormattedInt}${decimalSeparator}${decPart}`
}
