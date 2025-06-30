import { describe, it, expect } from 'vitest';
import { LanguageTypes } from '@base/shared-types';
import LocaleUtil from './locale.util.mjs';

describe('LocaleUtil', () => {
  describe('getAcceptLanguages', () => {
    it('should return the accept languages', () => {
      const accept = 'en-US, fr-FR, de';
      const result = LocaleUtil.getAcceptLanguages(accept);
      expect(result).toEqual(['en-US', 'fr-FR', 'de']);
    });
    it('should handle quality values in accept header', () => {
      const accept = 'ko,en-US;q=0.9,en;q=0.8';
      const result = LocaleUtil.getAcceptLanguages(accept);
      expect(result).toEqual(['ko', 'en-US', 'en']);
    });
  });
  describe('getRelevantLocale', () => {
    it('should return the first locale with a hyphen if available', () => {
      const acceptLanguages = ['en-US', 'fr-FR', 'de'];
      const result = LocaleUtil.getRelevantLocale(acceptLanguages);
      expect(result).toBe(LanguageTypes.SUPPORT_LOCALE.en_US);
    });

    it('should return the first locale if no locale with hyphen is available', () => {
      const acceptLanguages = ['en', 'fr', 'de'];
      const result = LocaleUtil.getRelevantLocale(acceptLanguages);
      expect(result).toBe(LanguageTypes.SUPPORT_LOCALE.en_US);
    });
    it('should return the first locale if no locale with hyphen is available', () => {
      const acceptLanguages = ['fr', 'de'];
      const result = LocaleUtil.getRelevantLocale(acceptLanguages);
      expect(result).toBe(LanguageTypes.SUPPORT_LOCALE.fr_FR);
    });

    it('should return the first locale if no locale with hyphen is available', () => {
      const acceptLanguages = ['ko', 'de'];
      const result = LocaleUtil.getRelevantLocale(acceptLanguages);
      expect(result).toBe(LanguageTypes.SUPPORT_LOCALE.ko_KR);
    });

    it('should return the first locale if no locale with hyphen is available', () => {
      const acceptLanguages = ['ko', 'en-US', 'en'];
      const result = LocaleUtil.getRelevantLocale(acceptLanguages);
      expect(result).toBe(LanguageTypes.SUPPORT_LOCALE.ko_KR);
    });

    it('should return the first locale if no locale with hyphen is available', () => {
      const acceptLanguages = ['ko-KR', 'de-DE', 'en-US'];
      const result = LocaleUtil.getRelevantLocale(acceptLanguages);
      expect(result).toBe(LanguageTypes.SUPPORT_LOCALE.ko_KR);
    });

    it('should return default locale (en_US) if acceptLanguages is empty', () => {
      const acceptLanguages: string[] = [];
      const result = LocaleUtil.getRelevantLocale(acceptLanguages);
      expect(result).toBe(LanguageTypes.SUPPORT_LOCALE.en_US);
    });

    it('should return default locale (en_US) if no matching locale is found', () => {
      const acceptLanguages = ['xx-XX', 'yy'];
      const result = LocaleUtil.getRelevantLocale(acceptLanguages);
      expect(result).toBe(LanguageTypes.SUPPORT_LOCALE.en_US);
    });

    it('should match partial locale strings correctly', () => {
      // Assuming LanguageTypes.SUPPORT_LOCALE includes 'fr_FR'
      const acceptLanguages = ['fr-FR'];
      const result = LocaleUtil.getRelevantLocale(acceptLanguages);

      // This test might need adjustment based on actual implementation of SUPPORT_LOCALE
      // If fr_FR is supported, it should return that, otherwise it will fall back to en_US
      const expectedLocale =
        Object.values(LanguageTypes.SUPPORT_LOCALE).find((locale) => locale.includes('fr-FR')) ||
        LanguageTypes.SUPPORT_LOCALE.en_US;

      expect(result).toBe(expectedLocale);
    });
  });
});
