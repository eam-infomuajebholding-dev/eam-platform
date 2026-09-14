export type LanguageDefinition = {
  code: string;
  label: string;
  dir: 'rtl' | 'ltr';
};

export const DEFAULT_LANGUAGE = 'ar';
export const LANGUAGE_STORAGE_KEY = 'eam-language';

/** Languages supported by the in-app selector (Google Translate codes). */
export const WORLD_LANGUAGES: LanguageDefinition[] = [
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'de', label: 'Deutsch', dir: 'ltr' },
  { code: 'es', label: 'Español', dir: 'ltr' },
  { code: 'it', label: 'Italiano', dir: 'ltr' },
  { code: 'pt', label: 'Português', dir: 'ltr' },
  { code: 'ru', label: 'Русский', dir: 'ltr' },
  { code: 'zh-CN', label: '简体中文', dir: 'ltr' },
  { code: 'zh-TW', label: '繁體中文', dir: 'ltr' },
  { code: 'ja', label: '日本語', dir: 'ltr' },
  { code: 'ko', label: '한국어', dir: 'ltr' },
  { code: 'hi', label: 'हिन्दी', dir: 'ltr' },
  { code: 'ur', label: 'اردو', dir: 'rtl' },
  { code: 'fa', label: 'فارسی', dir: 'rtl' },
  { code: 'tr', label: 'Türkçe', dir: 'ltr' },
  { code: 'nl', label: 'Nederlands', dir: 'ltr' },
  { code: 'pl', label: 'Polski', dir: 'ltr' },
  { code: 'sv', label: 'Svenska', dir: 'ltr' },
  { code: 'no', label: 'Norsk', dir: 'ltr' },
  { code: 'da', label: 'Dansk', dir: 'ltr' },
  { code: 'fi', label: 'Suomi', dir: 'ltr' },
  { code: 'el', label: 'Ελληνικά', dir: 'ltr' },
  { code: 'he', label: 'עברית', dir: 'rtl' },
  { code: 'th', label: 'ไทย', dir: 'ltr' },
  { code: 'vi', label: 'Tiếng Việt', dir: 'ltr' },
  { code: 'id', label: 'Bahasa Indonesia', dir: 'ltr' },
  { code: 'ms', label: 'Bahasa Melayu', dir: 'ltr' },
  { code: 'bn', label: 'বাংলা', dir: 'ltr' },
  { code: 'ta', label: 'தமிழ்', dir: 'ltr' },
  { code: 'uk', label: 'Українська', dir: 'ltr' },
  { code: 'ro', label: 'Română', dir: 'ltr' },
  { code: 'cs', label: 'Čeština', dir: 'ltr' },
  { code: 'hu', label: 'Magyar', dir: 'ltr' },
  { code: 'bg', label: 'Български', dir: 'ltr' },
  { code: 'hr', label: 'Hrvatski', dir: 'ltr' },
  { code: 'sk', label: 'Slovenčina', dir: 'ltr' },
  { code: 'sw', label: 'Kiswahili', dir: 'ltr' },
  { code: 'fil', label: 'Filipino', dir: 'ltr' },
  { code: 'ca', label: 'Català', dir: 'ltr' },
];

export function getLanguageDefinition(code: string): LanguageDefinition {
  return WORLD_LANGUAGES.find((language) => language.code === code) ?? WORLD_LANGUAGES[0];
}
