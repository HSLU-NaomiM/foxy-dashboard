// src/i18n/i18n.ts
// File Summary:
// This file configures the internationalization (i18n) setup for the application using i18next.
// It integrates react-i18next for React support and automatically detects the user's preferred language.
// Key responsibilities:
// - Loads translation resources from local JSON files (de, en).
// - Uses the browser language detector to pick the user's language preference.
// - Falls back to English ("en") if no supported language is detected.
// - Configures interpolation to avoid escaping values (React already handles XSS safely).
//
// Dependencies:
// - i18next: core internationalization framework.
// - react-i18next: integration of i18n with React components and hooks.
// - i18next-browser-languagedetector: detects the user's browser language.
// - Local JSON translation files: provide the actual translation strings.

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import de from './locales/de.json';
import en from './locales/en.json';

// Configure i18next with language detection and React integration
i18n
  .use(LanguageDetector)    // Detects browser language
  .use(initReactI18next)    // Connects i18n to React
  .init({
    resources: {
      de: { translation: de },
      en: { translation: en },
    },
    fallbackLng: 'en',      // Default to English if language not available
    interpolation: {
      escapeValue: false,   // Not needed for React, prevents double escaping
    },
  });

export default i18n;
