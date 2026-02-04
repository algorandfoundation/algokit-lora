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
 * Maximum decimal places supported by Algorand assets.
 */
const ALGORAND_MAX_DECIMALS = 19

/**
 * Format a Decimal value preserving its precision for display.
 * This is used for amounts where we need to show the exact decimal representation
 * with locale-appropriate separators and numerals.
 */
export const formatDecimalAmount = (value: Decimal, locale?: string): string => {
  const resolvedLocale = locale || getLocale()
  const formatter = new Intl.NumberFormat(resolvedLocale, {
    maximumFractionDigits: ALGORAND_MAX_DECIMALS,
    numberingSystem: 'latn', // Always use Western digits (0-9) for consistency
  })
  // Intl.NumberFormat.format() accepts strings to preserve arbitrary precision,
  // but TypeScript's type definitions don't reflect this yet
  return formatter.format(value.toString() as unknown as number)
}
