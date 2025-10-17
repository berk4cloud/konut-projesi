import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import tr from './locales/tr.json';
import en from './locales/en.json';
import de from './locales/de.json';
import nl from './locales/nl.json';
import fr from './locales/fr.json';
import pl from './locales/pl.json';
import bg from './locales/bg.json';

// Initialize i18next
i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
      de: { translation: de },
      nl: { translation: nl },
      fr: { translation: fr },
      pl: { translation: pl },
      bg: { translation: bg },
    },
    fallbackLng: 'tr', // Default language is Turkish
    lng: localStorage.getItem('language') || 'tr', // Get saved language or default to Turkish
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator'],
      // Where to store language choice
      caches: ['localStorage'],
      // localStorage key
      lookupLocalStorage: 'language',
    },
  });

// Save language to localStorage whenever it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;
