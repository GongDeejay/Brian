/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { zh, type MessageKey } from './zh';
import { en } from './en';

export type Lang = 'zh' | 'en';
export type { MessageKey };

/**
 * Language preference is stored under a shared key. Both apps and the landing
 * page are served from the same origin (brian.mplusm.site), so a participant who
 * switches to English in one app keeps that choice in the other.
 */
const STORAGE_KEY = 'brian.lang';

const CATALOGS: Record<Lang, Record<MessageKey, string>> = { zh, en };

export const LANGUAGES: { id: Lang; label: string; short: string }[] = [
  { id: 'zh', label: '中文', short: '中' },
  { id: 'en', label: 'English', short: 'EN' },
];

/** `{name}`-style interpolation, e.g. t('x.greeting', { name: 'Ann' }). */
function format(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match
  );
}

function detectLang(): Lang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'zh' || stored === 'en') return stored;
  } catch {
    // Storage can be unavailable (private mode / blocked cookies); fall through
    // to the browser preference instead of failing.
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'zh';
  return nav.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

/** Translate a single key outside of React (services, exporters, tests). */
export function translate(lang: Lang, key: MessageKey, vars?: Record<string, string | number>): string {
  return format(CATALOGS[lang][key] ?? key, vars);
}

/** Translate a list of keys — useful for the long academic limitation lists. */
export function translateList(lang: Lang, keys: readonly MessageKey[]): string[] {
  return keys.map((key) => translate(lang, key));
}

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  /** Translate a key in the current language. */
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  /** Translate a list of keys in the current language. */
  tList: (keys: readonly MessageKey[]) => string[];
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  useEffect(() => {
    // Keep the document language in sync so screen readers and the browser's
    // font/hyphenation rules follow the selected language.
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Non-fatal: the preference simply will not persist.
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const toggleLang = useCallback(() => setLangState((prev) => (prev === 'zh' ? 'en' : 'zh')), []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      toggleLang,
      t: (key, vars) => translate(lang, key, vars),
      tList: (keys) => translateList(lang, keys),
    }),
    [lang, setLang, toggleLang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n 必须在 <I18nProvider> 内部使用 / useI18n must be used inside <I18nProvider>');
  }
  return ctx;
}

/** Convenience hook when only the translate function is needed. */
export function useT() {
  return useI18n().t;
}
