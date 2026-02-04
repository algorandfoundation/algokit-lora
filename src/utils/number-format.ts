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

export interface FormatNumberOptions {
  locale?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

/**
 * Format a number according to the user's locale.
 * Handles both number and Decimal types.
 */
export const formatNumber = (value: number | Decimal, options?: FormatNumberOptions): string => {
  const locale = options?.locale || getLocale()
  const numberValue = value instanceof Decimal ? value.toNumber() : value

  return numberValue.toLocaleString(locale, {
    minimumFractionDigits: options?.minimumFractionDigits,
    maximumFractionDigits: options?.maximumFractionDigits,
  })
}

export interface FormatAmountOptions extends FormatNumberOptions {
  short?: boolean
}

/**
 * Format an amount with appropriate decimal handling.
 * Uses compact notation for large numbers when short=true.
 */
export const formatAmount = (value: number | Decimal, options?: FormatAmountOptions): string => {
  const locale = options?.locale || getLocale()
  const numberValue = value instanceof Decimal ? value.toNumber() : value

  if (options?.short && numberValue.toString().length >= 9 && numberValue > 0) {
    return `≈${numberValue.toLocaleString(locale, { notation: 'compact' })}`
  }

  return numberValue.toLocaleString(locale, {
    minimumFractionDigits: options?.minimumFractionDigits,
    maximumFractionDigits: options?.maximumFractionDigits,
  })
}

/**
 * Format a Decimal value preserving its precision for display.
 * This is used for amounts where we need to show the exact decimal representation
 * but with locale-appropriate separators.
 */
export const formatDecimalAmount = (value: Decimal, options?: FormatNumberOptions): string => {
  const locale = options?.locale || getLocale()
  const stringValue = value.toString()

  // Split into integer and decimal parts
  const [intPart, decPart] = stringValue.split('.')
  const decimalSeparator = getDecimalSeparator(locale)

  // Format the integer part with thousand separators
  // Handle negative numbers by extracting the sign
  const isNegative = intPart.startsWith('-')
  const absIntPart = isNegative ? intPart.slice(1) : intPart
  const formattedInt = BigInt(absIntPart).toLocaleString(locale)
  const signedFormattedInt = isNegative ? `-${formattedInt}` : formattedInt

  if (!decPart) {
    return signedFormattedInt
  }

  // Remove trailing zeros from decimal part if not specified to keep them
  const trimmedDecPart = options?.minimumFractionDigits !== undefined ? decPart : decPart.replace(/0+$/, '')

  if (!trimmedDecPart) {
    return signedFormattedInt
  }

  return `${signedFormattedInt}${decimalSeparator}${trimmedDecPart}`
}
