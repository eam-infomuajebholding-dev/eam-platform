import { WORLD_LANGUAGES } from '@/i18n/languages';
import { HOME_MESSAGES_AR, HOME_MESSAGES_EN, type HomeMessageKey } from '@/i18n/homeMessages';
import { PAGE_MESSAGES_AR, PAGE_MESSAGES_EN, type PageMessageKey } from '@/i18n/pageMessages';
import { BLOG_MESSAGES_AR, BLOG_MESSAGES_EN, type BlogMessageKey } from '@/i18n/blogMessages';
import {
  COMMAND_CENTER_MESSAGES_AR,
  COMMAND_CENTER_MESSAGES_EN,
  type CommandCenterMessageKey,
} from '@/i18n/commandCenterMessages';
import {
  PAYMENT_MESSAGES_AR,
  PAYMENT_MESSAGES_EN,
  type PaymentMessageKey,
} from '@/i18n/paymentMessages';
import { SITE_MESSAGES_AR, SITE_MESSAGES_EN, type SiteMessageKey } from '@/i18n/siteMessages';
import {
  JOURNEY_SECTOR_MESSAGES_AR,
  JOURNEY_SECTOR_MESSAGES_EN,
  type JourneySectorMessageKey,
} from '@/i18n/journeySectorMessages';

type ShellMessageKey =
  | 'nav.home'
  | 'nav.about'
  | 'nav.services'
  | 'nav.projects'
  | 'nav.invest'
  | 'nav.market'
  | 'nav.careers'
  | 'nav.blog'
  | 'nav.contact'
  | 'auth.login'
  | 'auth.signup'
  | 'auth.logout'
  | 'auth.myRequests'
  | 'auth.commandCenter'
  | 'language.label'
  | 'language.choose'
  | 'aria.toggleTheme'
  | 'aria.openMenu'
  | 'aria.closeMenu';

export type MessageKey =
  | ShellMessageKey
  | HomeMessageKey
  | PageMessageKey
  | BlogMessageKey
  | CommandCenterMessageKey
  | PaymentMessageKey
  | SiteMessageKey
  | JourneySectorMessageKey;

export type MessageCatalog = Record<MessageKey, string>;

const shellAr: Record<ShellMessageKey, string> = {
  'nav.home': 'الرئيسية',
  'nav.about': 'عن EAM',
  'nav.services': 'الخدمات',
  'nav.projects': 'المشاريع',
  'nav.invest': 'مستثمر معنا',
  'nav.market': 'سوقنا',
  'nav.careers': 'التوظيف',
  'nav.blog': 'المدونة',
  'nav.contact': 'تواصل معنا',
  'auth.login': 'تسجيل الدخول',
  'auth.signup': 'إنشاء حساب',
  'auth.logout': 'تسجيل الخروج',
  'auth.myRequests': 'طلباتي',
  'auth.commandCenter': 'لوحة القيادة',
  'language.label': 'اللغة',
  'language.choose': 'اختر اللغة',
  'aria.toggleTheme': 'تبديل الوضع',
  'aria.openMenu': 'فتح القائمة',
  'aria.closeMenu': 'إغلاق القائمة',
};

const shellEn: Record<ShellMessageKey, string> = {
  'nav.home': 'Home',
  'nav.about': 'About EAM',
  'nav.services': 'Services',
  'nav.projects': 'Projects',
  'nav.invest': 'Invest with us',
  'nav.market': 'Our market',
  'nav.careers': 'Careers',
  'nav.blog': 'Blog',
  'nav.contact': 'Contact us',
  'auth.login': 'Sign in',
  'auth.signup': 'Create account',
  'auth.logout': 'Sign out',
  'auth.myRequests': 'My requests',
  'auth.commandCenter': 'Command center',
  'language.label': 'Language',
  'language.choose': 'Choose language',
  'aria.toggleTheme': 'Toggle theme',
  'aria.openMenu': 'Open menu',
  'aria.closeMenu': 'Close menu',
};

const ar: MessageCatalog = {
  ...shellAr,
  ...HOME_MESSAGES_AR,
  ...PAGE_MESSAGES_AR,
  ...BLOG_MESSAGES_AR,
  ...COMMAND_CENTER_MESSAGES_AR,
  ...PAYMENT_MESSAGES_AR,
  ...SITE_MESSAGES_AR,
  ...JOURNEY_SECTOR_MESSAGES_AR,
};
const en: MessageCatalog = {
  ...shellEn,
  ...HOME_MESSAGES_EN,
  ...PAGE_MESSAGES_EN,
  ...BLOG_MESSAGES_EN,
  ...COMMAND_CENTER_MESSAGES_EN,
  ...PAYMENT_MESSAGES_EN,
  ...SITE_MESSAGES_EN,
  ...JOURNEY_SECTOR_MESSAGES_EN,
};

const fr: MessageCatalog = {
  ...en,
  'nav.home': 'Accueil',
  'nav.about': 'À propos de EAM',
  'nav.services': 'Services',
  'nav.projects': 'Projets',
  'nav.invest': 'Investir avec nous',
  'nav.market': 'Notre marché',
  'nav.careers': 'Carrières',
  'nav.blog': 'Blog',
  'nav.contact': 'Contactez-nous',
  'auth.login': 'Connexion',
  'auth.signup': 'Créer un compte',
  'auth.logout': 'Déconnexion',
  'auth.myRequests': 'Mes demandes',
  'auth.commandCenter': 'Centre de commande',
  'language.label': 'Langue',
  'language.choose': 'Choisir la langue',
  'aria.toggleTheme': 'Changer le thème',
  'aria.openMenu': 'Ouvrir le menu',
  'aria.closeMenu': 'Fermer le menu',
};

const de: MessageCatalog = {
  ...en,
  'nav.home': 'Startseite',
  'nav.about': 'Über EAM',
  'nav.services': 'Dienstleistungen',
  'nav.projects': 'Projekte',
  'nav.invest': 'Mit uns investieren',
  'nav.market': 'Unser Markt',
  'nav.careers': 'Karriere',
  'nav.blog': 'Blog',
  'nav.contact': 'Kontakt',
  'auth.login': 'Anmelden',
  'auth.signup': 'Konto erstellen',
  'auth.logout': 'Abmelden',
  'auth.myRequests': 'Meine Anfragen',
  'auth.commandCenter': 'Kommandozentrale',
  'language.label': 'Sprache',
  'language.choose': 'Sprache wählen',
  'aria.toggleTheme': 'Design umschalten',
  'aria.openMenu': 'Menü öffnen',
  'aria.closeMenu': 'Menü schließen',
};

const es: MessageCatalog = {
  ...en,
  'nav.home': 'Inicio',
  'nav.about': 'Sobre EAM',
  'nav.services': 'Servicios',
  'nav.projects': 'Proyectos',
  'nav.invest': 'Invierte con nosotros',
  'nav.market': 'Nuestro mercado',
  'nav.careers': 'Empleo',
  'nav.blog': 'Blog',
  'nav.contact': 'Contáctanos',
  'auth.login': 'Iniciar sesión',
  'auth.signup': 'Crear cuenta',
  'auth.logout': 'Cerrar sesión',
  'auth.myRequests': 'Mis solicitudes',
  'auth.commandCenter': 'Centro de mando',
  'language.label': 'Idioma',
  'language.choose': 'Elegir idioma',
  'aria.toggleTheme': 'Cambiar tema',
  'aria.openMenu': 'Abrir menú',
  'aria.closeMenu': 'Cerrar menú',
};

const tr: MessageCatalog = {
  ...en,
  'nav.home': 'Ana sayfa',
  'nav.about': 'EAM hakkında',
  'nav.services': 'Hizmetler',
  'nav.projects': 'Projeler',
  'nav.invest': 'Bizimle yatırım yapın',
  'nav.market': 'Pazarımız',
  'nav.careers': 'Kariyer',
  'nav.blog': 'Blog',
  'nav.contact': 'Bize ulaşın',
  'auth.login': 'Giriş yap',
  'auth.signup': 'Hesap oluştur',
  'auth.logout': 'Çıkış yap',
  'auth.myRequests': 'Taleplerim',
  'auth.commandCenter': 'Komuta merkezi',
  'language.label': 'Dil',
  'language.choose': 'Dil seçin',
  'aria.toggleTheme': 'Temayı değiştir',
  'aria.openMenu': 'Menüyü aç',
  'aria.closeMenu': 'Menüyü kapat',
};

const ur: MessageCatalog = {
  ...ar,
  'nav.home': 'ہوم',
  'nav.about': 'EAM کے بارے میں',
  'nav.services': 'خدمات',
  'nav.projects': 'منصوبے',
  'nav.invest': 'ہمارے ساتھ سرمایہ کاری',
  'nav.market': 'ہمارا بازار',
  'nav.careers': 'ملازمتیں',
  'nav.blog': 'بلاگ',
  'nav.contact': 'رابطہ',
  'auth.login': 'سائن ان',
  'auth.signup': 'اکاؤنٹ بنائیں',
  'auth.logout': 'سائن آؤٹ',
  'auth.myRequests': 'میری درخواستیں',
  'auth.commandCenter': 'کمانڈ سینٹر',
  'language.label': 'زبان',
  'language.choose': 'زبان منتخب کریں',
  'aria.toggleTheme': 'تھیم تبدیل کریں',
  'aria.openMenu': 'مینو کھولیں',
  'aria.closeMenu': 'مینو بند کریں',
};

const fa: MessageCatalog = {
  ...ar,
  'nav.home': 'خانه',
  'nav.about': 'درباره EAM',
  'nav.services': 'خدمات',
  'nav.projects': 'پروژه‌ها',
  'nav.invest': 'سرمایه‌گذاری با ما',
  'nav.market': 'بازار ما',
  'nav.careers': 'فرصت‌های شغلی',
  'nav.blog': 'وبلاگ',
  'nav.contact': 'تماس با ما',
  'auth.login': 'ورود',
  'auth.signup': 'ایجاد حساب',
  'auth.logout': 'خروج',
  'auth.myRequests': 'درخواست‌های من',
  'auth.commandCenter': 'مرکز فرمان',
  'language.label': 'زبان',
  'language.choose': 'انتخاب زبان',
  'aria.toggleTheme': 'تغییر پوسته',
  'aria.openMenu': 'باز کردن منو',
  'aria.closeMenu': 'بستن منو',
};

const zhCN: MessageCatalog = {
  ...en,
  'nav.home': '首页',
  'nav.about': '关于 EAM',
  'nav.services': '服务',
  'nav.projects': '项目',
  'nav.invest': '与我们投资',
  'nav.market': '我们的市场',
  'nav.careers': '招聘',
  'nav.blog': '博客',
  'nav.contact': '联系我们',
  'auth.login': '登录',
  'auth.signup': '创建账户',
  'auth.logout': '退出',
  'auth.myRequests': '我的请求',
  'auth.commandCenter': '指挥中心',
  'language.label': '语言',
  'language.choose': '选择语言',
  'aria.toggleTheme': '切换主题',
  'aria.openMenu': '打开菜单',
  'aria.closeMenu': '关闭菜单',
};

const BASE_CATALOGS: Record<string, MessageCatalog> = {
  ar,
  en,
  fr,
  de,
  es,
  tr,
  ur,
  fa,
  'zh-CN': zhCN,
};

/** Every selector language gets at least the English catalog when no dedicated bundle exists. */
export const MESSAGE_CATALOGS: Record<string, MessageCatalog> = { ...BASE_CATALOGS };

for (const language of WORLD_LANGUAGES) {
  if (!MESSAGE_CATALOGS[language.code]) {
    MESSAGE_CATALOGS[language.code] = en;
  }
}

export function translateMessage(language: string, key: MessageKey): string {
  const catalog = MESSAGE_CATALOGS[language] ?? MESSAGE_CATALOGS.en ?? ar;
  return catalog[key] ?? MESSAGE_CATALOGS.en[key] ?? ar[key] ?? key;
}
