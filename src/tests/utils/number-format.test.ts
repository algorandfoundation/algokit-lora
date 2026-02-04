import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import {
  getLocale,
  getThousandSeparator,
  getDecimalSeparator,
  formatNumber,
  formatAmount,
  formatDecimalAmount,
} from '@/utils/number-format'

describe('number-format', () => {
  describe('getLocale', () => {
    it('returns the browser locale', () => {
      const locale = getLocale()
      expect(typeof locale).toBe('string')
      expect(locale.length).toBeGreaterThan(0)
    })

    it('falls back to en-US when navigator.language is not available', () => {
      const originalNavigator = global.navigator
      // @ts-expect-error - testing fallback behavior
      delete global.navigator

      const locale = getLocale()
      expect(locale).toBe('en-US')

      global.navigator = originalNavigator
    })
  })

  describe('getThousandSeparator', () => {
    it('returns comma for en-US locale', () => {
      const separator = getThousandSeparator('en-US')
      expect(separator).toBe(',')
    })

    it('returns period for de-DE locale', () => {
      const separator = getThousandSeparator('de-DE')
      expect(separator).toBe('.')
    })

    it('returns space for fr-FR locale', () => {
      const separator = getThousandSeparator('fr-FR')
      // French uses narrow no-break space (U+202F)
      expect(separator.trim()).toBe('')
    })

    it('returns comma for default locale when not specified', () => {
      const separator = getThousandSeparator()
      expect(typeof separator).toBe('string')
    })
  })

  describe('getDecimalSeparator', () => {
    it('returns period for en-US locale', () => {
      const separator = getDecimalSeparator('en-US')
      expect(separator).toBe('.')
    })

    it('returns comma for de-DE locale', () => {
      const separator = getDecimalSeparator('de-DE')
      expect(separator).toBe(',')
    })

    it('returns comma for fr-FR locale', () => {
      const separator = getDecimalSeparator('fr-FR')
      expect(separator).toBe(',')
    })

    it('returns separator for default locale when not specified', () => {
      const separator = getDecimalSeparator()
      expect(typeof separator).toBe('string')
    })
  })

  describe('formatNumber', () => {
    it('formats a number with en-US locale', () => {
      const result = formatNumber(1234567.89, { locale: 'en-US' })
      expect(result).toBe('1,234,567.89')
    })

    it('formats a number with de-DE locale', () => {
      const result = formatNumber(1234567.89, { locale: 'de-DE' })
      expect(result).toBe('1.234.567,89')
    })

    it('formats a Decimal value', () => {
      const result = formatNumber(new Decimal('1234567.89'), { locale: 'en-US' })
      expect(result).toBe('1,234,567.89')
    })

    it('respects minimumFractionDigits option', () => {
      const result = formatNumber(1234, { locale: 'en-US', minimumFractionDigits: 2 })
      expect(result).toBe('1,234.00')
    })

    it('respects maximumFractionDigits option', () => {
      const result = formatNumber(1234.5678, { locale: 'en-US', maximumFractionDigits: 2 })
      expect(result).toBe('1,234.57')
    })
  })

  describe('formatAmount', () => {
    it('formats a regular amount', () => {
      const result = formatAmount(1234.56, { locale: 'en-US' })
      expect(result).toBe('1,234.56')
    })

    it('formats a large amount with compact notation when short=true', () => {
      const result = formatAmount(1234567890, { locale: 'en-US', short: true })
      expect(result).toBe('≈1.2B')
    })

    it('formats a medium amount without compact notation when short=true but value is small', () => {
      const result = formatAmount(12345678, { locale: 'en-US', short: true })
      expect(result).toBe('12,345,678')
    })

    it('does not use compact notation for negative numbers', () => {
      const result = formatAmount(-1234567890, { locale: 'en-US', short: true })
      expect(result).toBe('-1,234,567,890')
    })

    it('formats a Decimal value', () => {
      const result = formatAmount(new Decimal('1234567890'), { locale: 'en-US', short: true })
      expect(result).toBe('≈1.2B')
    })

    it('formats with de-DE locale and compact notation', () => {
      const result = formatAmount(1234567890, { locale: 'de-DE', short: true })
      expect(result).toContain('≈')
      expect(result).toContain('Mrd')
    })
  })

  describe('formatDecimalAmount', () => {
    it('formats a simple decimal with en-US locale', () => {
      const result = formatDecimalAmount(new Decimal('1234.56'), { locale: 'en-US' })
      expect(result).toBe('1,234.56')
    })

    it('formats a simple decimal with de-DE locale', () => {
      const result = formatDecimalAmount(new Decimal('1234.56'), { locale: 'de-DE' })
      expect(result).toBe('1.234,56')
    })

    it('formats a large integer', () => {
      const result = formatDecimalAmount(new Decimal('100000000'), { locale: 'en-US' })
      expect(result).toBe('100,000,000')
    })

    it('handles decimal values without fractional part', () => {
      const result = formatDecimalAmount(new Decimal('1000'), { locale: 'en-US' })
      expect(result).toBe('1,000')
    })

    it('formats small decimals preserving precision', () => {
      const result = formatDecimalAmount(new Decimal('0.123456'), { locale: 'en-US' })
      expect(result).toBe('0.123456')
    })

    it('handles values with many decimal places', () => {
      const result = formatDecimalAmount(new Decimal('1234.123456789'), { locale: 'en-US' })
      expect(result).toBe('1,234.123456789')
    })

    it('handles values with large integer part', () => {
      // This value has a large integer part
      const highPrecisionValue = new Decimal('12345678901234567890.12345')
      const result = formatDecimalAmount(highPrecisionValue, { locale: 'en-US' })
      // Should contain the formatted integer part with thousand separators
      expect(result).toContain(',')
      expect(result).toContain('12345')
    })

    it('handles negative decimal values', () => {
      const result = formatDecimalAmount(new Decimal('-1234.56'), { locale: 'en-US' })
      expect(result).toBe('-1,234.56')
    })

    it('removes trailing zeros from decimal part', () => {
      const result = formatDecimalAmount(new Decimal('1234.5000'), { locale: 'en-US' })
      expect(result).toBe('1,234.5')
    })

    it('formats with fr-FR locale', () => {
      const result = formatDecimalAmount(new Decimal('1234.56'), { locale: 'fr-FR' })
      // French uses narrow no-break space as thousand separator and comma as decimal separator
      expect(result).toContain('1')
      expect(result).toContain('234')
      expect(result).toContain(',')
      expect(result).toContain('56')
    })
  })
})
