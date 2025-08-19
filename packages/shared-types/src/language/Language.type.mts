export enum SUPPORT_LOCALE {
  en_US = 'en-US',
  ko_KR = 'ko-KR',
  // EUROPE
  de_DE = 'de-DE', // Germany (already present, but included for completeness)
  // en_GB = 'en-GB', // United Kingdom
  // sv_SE = 'sv-SE', // Sweden
  fr_FR = 'fr-FR', // France
  es_ES = 'es-ES', // Spain
  // pt_PT = 'pt-PT', // Portugal
  ru_RU = 'ru-RU', // Russia
  // ASIA
  // en_IN = 'en-IN', // India
  hi_IN = 'hi-IN', // India hindi
  ja_JP = 'ja-JP', // Japan
  vi_VN = 'vi-VN', // Vietnam
  th_TH = 'th-TH', // Thailand
  zh_CN = 'zh-CN', // China
  zh_TW = 'zh-TW', // Taiwan
  id_ID = 'id-ID', // Indonesia
  ms_MY = 'ms-MY', // Malaysia
}

export const LEARNING_MATERIAL_LOCALE = [
  SUPPORT_LOCALE.en_US,
  SUPPORT_LOCALE.ko_KR,
  SUPPORT_LOCALE.de_DE,
] as SUPPORT_LOCALE[];

export const DEFAULT_LOCALE = SUPPORT_LOCALE.en_US;