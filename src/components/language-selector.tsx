import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const navigate = useNavigate();
  const location = useLocation();

  if (window.location.pathname.includes("/de")) {
    localStorage.setItem("selectedLanguage", "de");
  } else if (window.location.pathname.includes("/fr")) {
    localStorage.setItem("selectedLanguage", "fr");
  } else if (window.location.pathname.includes("/en")) {
    localStorage.setItem("selectedLanguage", "en");
  } else if (window.location.pathname === "/") {
    localStorage.setItem("selectedLanguage", "fr");
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("selectedLanguage", lng);

    const newPath = location.pathname.replace(/^\/(fr|en|de)/, `/${lng}`);
    navigate(newPath);
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage");
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  return (
    <div className="flex items-center justify-center p-2">
      <select
        value={currentLanguage}
        onChange={(e) => changeLanguage(e.target.value)}
        className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="fr">FR</option>
        <option value="en">EN</option>
        <option value="de">DE</option>
      </select>
    </div>
  );
}
