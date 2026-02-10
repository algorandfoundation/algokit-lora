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
 * Thousand grouping styles supported by react-number-format.
 * - 'thousand': Standard grouping (123,456,789)
 * - 'lakh': Indian numbering system (12,34,56,789)
 * - 'wan': Chinese numbering system (1,2345,6789)
 */
export type ThousandsGroupStyle = 'thousand' | 'lakh' | 'wan'

/**
 * Get the appropriate thousands grouping style for the given locale.
 * Uses Intl.NumberFormat to detect the grouping pattern.
 */
export const getThousandsGroupStyle = (locale?: string): ThousandsGroupStyle => {
  const resolvedLocale = locale || getLocale()

  // Format a large number and analyze the grouping pattern
  const parts = new Intl.NumberFormat(resolvedLocale).formatToParts(12345678)
  const integerParts = parts.filter((part) => part.type === 'integer')

  // Indian numbering: first group is 2 digits after initial 3 (e.g., 1,23,45,678)
  // Check if we have groups of 2 digits (characteristic of Indian numbering)
  if (integerParts.length >= 3) {
    const secondGroup = integerParts[1]?.value
    if (secondGroup && secondGroup.length === 2) {
      return 'lakh'
    }
  }

  // Chinese numbering: groups of 4 (e.g., 1234,5678)
  if (integerParts.length >= 2) {
    const lastGroup = integerParts[integerParts.length - 1]?.value
    if (lastGroup && lastGroup.length === 4) {
      return 'wan'
    }
  }

  // Default: standard thousand grouping
  return 'thousand'
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
