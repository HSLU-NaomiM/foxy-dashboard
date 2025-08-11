import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => i18n.changeLanguage('de')}
        className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
      >
        Deutsch
      </button>
      <button
        onClick={() => i18n.changeLanguage('en')}
        className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
      >
        English
      </button>
    </div>
  );
}
