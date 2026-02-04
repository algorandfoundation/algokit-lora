import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import { getLocale, getThousandSeparator, getDecimalSeparator, formatDecimalAmount } from '@/utils/number-format'

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

  describe('formatDecimalAmount', () => {
    it('formats a simple decimal with en-US locale', () => {
      const result = formatDecimalAmount(new Decimal('1234.56'), 'en-US')
      expect(result).toBe('1,234.56')
    })

    it('formats a simple decimal with de-DE locale', () => {
      const result = formatDecimalAmount(new Decimal('1234.56'), 'de-DE')
      expect(result).toBe('1.234,56')
    })

    it('formats a large integer', () => {
      const result = formatDecimalAmount(new Decimal('100000000'), 'en-US')
      expect(result).toBe('100,000,000')
    })

    it('handles decimal values without fractional part', () => {
      const result = formatDecimalAmount(new Decimal('1000'), 'en-US')
      expect(result).toBe('1,000')
    })

    it('formats small decimals preserving precision', () => {
      const result = formatDecimalAmount(new Decimal('0.123456'), 'en-US')
      expect(result).toBe('0.123456')
    })

    it('handles values with many decimal places', () => {
      const result = formatDecimalAmount(new Decimal('1234.123456789'), 'en-US')
      expect(result).toBe('1,234.123456789')
    })

    it('handles values with large integer part', () => {
      const highPrecisionValue = new Decimal('12345678901234567890.12345')
      const result = formatDecimalAmount(highPrecisionValue, 'en-US')
      expect(result).toBe('12,345,678,901,234,567,890.12345')
    })

    it('handles negative decimal values', () => {
      const result = formatDecimalAmount(new Decimal('-1234.56'), 'en-US')
      expect(result).toBe('-1,234.56')
    })

    it('formats with fr-FR locale', () => {
      const result = formatDecimalAmount(new Decimal('1234.56'), 'fr-FR')
      // French uses narrow no-break space (U+202F) as thousand separator
      expect(result).toBe('1\u202f234,56')
    })
  })
})
