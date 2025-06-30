import { LanguageTypes } from '@base/shared-types';

class LocaleUtil {
  public static getAcceptLanguages(accept: string) {
    return accept
      .split(',')
      .map((lang) => lang.split(';')[0].trim())
      .filter((lang) => lang !== '');
  }
  public static getRelevantLocale(acceptLanguages: string[]) {
    const locales = Object.values(LanguageTypes.SUPPORT_LOCALE);
    const relevantLocale = acceptLanguages[0] || LanguageTypes.SUPPORT_LOCALE.en_US;
    const locale =
      locales.find((locale) => {
        return locale.includes(relevantLocale);
      }) || LanguageTypes.SUPPORT_LOCALE.en_US;
    return locale;
  }
}

export default LocaleUtil;
