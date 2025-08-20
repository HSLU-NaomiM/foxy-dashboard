// src/components/LanguageSwitcher.tsx
// File Summary:
// Language switcher component bound to i18next.
// Allows toggling between German ("de") and English ("en").
// Highlights the active language for better feedback.
//
// Key responsibilities:
// - Provide buttons to switch app language.
// - Call i18n.changeLanguage() on click.
// - Indicate which language is currently active.
//
// Dependencies:
// - i18next: translation context for current language and switching.
// - Tailwind CSS: styling, hover states, active highlight.

import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const btnClass = (lang: string) =>
    `px-2 py-1 rounded text-sm font-medium transition ${
      currentLang === lang
        ? "bg-blue-600 text-white"
        : "bg-gray-200 hover:bg-gray-300 text-gray-800"
    }`;

  return (
    <div className="flex gap-2">
      <button onClick={() => i18n.changeLanguage("de")} className={btnClass("de")}>
        Deutsch
      </button>
      <button onClick={() => i18n.changeLanguage("en")} className={btnClass("en")}>
        English
      </button>
    </div>
  );
}
