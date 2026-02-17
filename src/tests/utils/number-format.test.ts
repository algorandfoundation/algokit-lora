import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import { getLocale, getThousandSeparator, getDecimalSeparator, formatDecimalAmount } from '@/utils/number-format'

describe('number-format', () => {
  describe('getLocale', () => {
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
    it('returns the correct thousand separator for each locale', () => {
      expect(getThousandSeparator('en-US')).toBe(',')
      expect(getThousandSeparator('de-DE')).toBe('.')
      expect(getThousandSeparator('fr-FR')).toBe('\u202f')
      expect(getThousandSeparator('es-ES')).toBe('.')
      expect(getThousandSeparator('ar-SA')).toBe('٬')
      expect(getThousandSeparator('hi-IN')).toBe(',')
      expect(getThousandSeparator('zh-CN')).toBe(',')
      expect(getThousandSeparator('ja-JP')).toBe(',')
    })

    it('returns a string for default locale when not specified', () => {
      expect(typeof getThousandSeparator()).toBe('string')
    })

    it('returns different thousand and decimal separators for comma-decimal locales', () => {
      // Spanish uses period for thousand and comma for decimal
      expect(getThousandSeparator('es-ES')).not.toBe(getDecimalSeparator('es-ES'))
      expect(getThousandSeparator('es-ES')).toBe('.')
      expect(getDecimalSeparator('es-ES')).toBe(',')

      // German also uses period for thousand and comma for decimal
      expect(getThousandSeparator('de-DE')).not.toBe(getDecimalSeparator('de-DE'))

      // French uses space for thousand and comma for decimal
      expect(getThousandSeparator('fr-FR')).not.toBe(getDecimalSeparator('fr-FR'))
    })
  })

  describe('getDecimalSeparator', () => {
    it('returns the correct decimal separator for each locale', () => {
      expect(getDecimalSeparator('en-US')).toBe('.')
      expect(getDecimalSeparator('de-DE')).toBe(',')
      expect(getDecimalSeparator('fr-FR')).toBe(',')
      expect(getDecimalSeparator('es-ES')).toBe(',')
      expect(getDecimalSeparator('ar-SA')).toBe('٫')
      expect(getDecimalSeparator('hi-IN')).toBe('.')
      expect(getDecimalSeparator('zh-CN')).toBe('.')
      expect(getDecimalSeparator('ja-JP')).toBe('.')
    })

    it('returns a string for default locale when not specified', () => {
      expect(typeof getDecimalSeparator()).toBe('string')
    })
  })

  describe('formatDecimalAmount', () => {
    it('formats a simple decimal', () => {
      const value = new Decimal('1234.56')
      expect(formatDecimalAmount(value, 'en-US')).toBe('1,234.56')
      expect(formatDecimalAmount(value, 'de-DE')).toBe('1.234,56')
      expect(formatDecimalAmount(value, 'fr-FR')).toBe('1\u202f234,56')
      expect(formatDecimalAmount(value, 'es-ES')).toBe('1234,56')
      expect(formatDecimalAmount(value, 'ar-SA')).toBe('1,234.56')
      expect(formatDecimalAmount(value, 'hi-IN')).toBe('1,234.56')
      expect(formatDecimalAmount(value, 'zh-CN')).toBe('1,234.56')
      expect(formatDecimalAmount(value, 'ja-JP')).toBe('1,234.56')
    })

    it('formats a large integer', () => {
      const value = new Decimal('100000000')
      expect(formatDecimalAmount(value, 'en-US')).toBe('100,000,000')
      expect(formatDecimalAmount(value, 'de-DE')).toBe('100.000.000')
      expect(formatDecimalAmount(value, 'fr-FR')).toBe('100\u202f000\u202f000')
      expect(formatDecimalAmount(value, 'es-ES')).toBe('100.000.000')
      expect(formatDecimalAmount(value, 'ar-SA')).toBe('100,000,000')
      expect(formatDecimalAmount(value, 'hi-IN')).toBe('10,00,00,000')
      expect(formatDecimalAmount(value, 'zh-CN')).toBe('100,000,000')
      expect(formatDecimalAmount(value, 'ja-JP')).toBe('100,000,000')
    })

    it('handles decimal values without fractional part', () => {
      const value = new Decimal('1000')
      expect(formatDecimalAmount(value, 'en-US')).toBe('1,000')
      expect(formatDecimalAmount(value, 'de-DE')).toBe('1.000')
      expect(formatDecimalAmount(value, 'fr-FR')).toBe('1\u202f000')
      expect(formatDecimalAmount(value, 'es-ES')).toBe('1000')
      expect(formatDecimalAmount(value, 'ar-SA')).toBe('1,000')
      expect(formatDecimalAmount(value, 'hi-IN')).toBe('1,000')
      expect(formatDecimalAmount(value, 'zh-CN')).toBe('1,000')
      expect(formatDecimalAmount(value, 'ja-JP')).toBe('1,000')
    })

    it('formats small decimals preserving precision', () => {
      const value = new Decimal('0.123456')
      expect(formatDecimalAmount(value, 'en-US')).toBe('0.123456')
      expect(formatDecimalAmount(value, 'de-DE')).toBe('0,123456')
      expect(formatDecimalAmount(value, 'fr-FR')).toBe('0,123456')
      expect(formatDecimalAmount(value, 'es-ES')).toBe('0,123456')
      expect(formatDecimalAmount(value, 'ar-SA')).toBe('0.123456')
      expect(formatDecimalAmount(value, 'hi-IN')).toBe('0.123456')
      expect(formatDecimalAmount(value, 'zh-CN')).toBe('0.123456')
      expect(formatDecimalAmount(value, 'ja-JP')).toBe('0.123456')
    })

    it('handles values with many decimal places', () => {
      const value = new Decimal('1234.123456789')
      expect(formatDecimalAmount(value, 'en-US')).toBe('1,234.123456789')
      expect(formatDecimalAmount(value, 'de-DE')).toBe('1.234,123456789')
      expect(formatDecimalAmount(value, 'fr-FR')).toBe('1\u202f234,123456789')
      expect(formatDecimalAmount(value, 'es-ES')).toBe('1234,123456789')
      expect(formatDecimalAmount(value, 'ar-SA')).toBe('1,234.123456789')
      expect(formatDecimalAmount(value, 'hi-IN')).toBe('1,234.123456789')
      expect(formatDecimalAmount(value, 'zh-CN')).toBe('1,234.123456789')
      expect(formatDecimalAmount(value, 'ja-JP')).toBe('1,234.123456789')
    })

    it('handles values with large integer part', () => {
      const value = new Decimal('12345678901234567890.12345')
      expect(formatDecimalAmount(value, 'en-US')).toBe('12,345,678,901,234,567,890.12345')
      expect(formatDecimalAmount(value, 'de-DE')).toBe('12.345.678.901.234.567.890,12345')
      expect(formatDecimalAmount(value, 'fr-FR')).toBe('12\u202f345\u202f678\u202f901\u202f234\u202f567\u202f890,12345')
      expect(formatDecimalAmount(value, 'es-ES')).toBe('12.345.678.901.234.567.890,12345')
      expect(formatDecimalAmount(value, 'ar-SA')).toBe('12,345,678,901,234,567,890.12345')
      expect(formatDecimalAmount(value, 'hi-IN')).toBe('1,23,45,67,89,01,23,45,67,890.12345')
      expect(formatDecimalAmount(value, 'zh-CN')).toBe('12,345,678,901,234,567,890.12345')
      expect(formatDecimalAmount(value, 'ja-JP')).toBe('12,345,678,901,234,567,890.12345')
    })

    it('handles negative decimal values', () => {
      const value = new Decimal('-1234.56')
      expect(formatDecimalAmount(value, 'en-US')).toBe('-1,234.56')
      expect(formatDecimalAmount(value, 'de-DE')).toBe('-1.234,56')
      expect(formatDecimalAmount(value, 'fr-FR')).toBe('-1\u202f234,56')
      expect(formatDecimalAmount(value, 'es-ES')).toBe('-1234,56')
      expect(formatDecimalAmount(value, 'ar-SA')).toBe('\u200e-1,234.56')
      expect(formatDecimalAmount(value, 'hi-IN')).toBe('-1,234.56')
      expect(formatDecimalAmount(value, 'zh-CN')).toBe('-1,234.56')
      expect(formatDecimalAmount(value, 'ja-JP')).toBe('-1,234.56')
    })
  })
})
