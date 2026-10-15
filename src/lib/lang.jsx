import { createContext, useContext } from 'react';
import { text, num, pick } from '../i18n';

export const LangContext = createContext({ lang: 'km', setLang: () => {} });

/** t = strings for the current language, p(obj) picks a {km,en} value, n(v) localises digits */
export function useLang() {
  const { lang, setLang } = useContext(LangContext);
  return { lang, setLang, t: text[lang], p: (o) => pick(o, lang), n: (v) => num(v, lang) };
}
