import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="flex items-center justify-center space-x-2 p-2 bg-gray-100 rounded-full shadow-md w-fit mx-auto">
      {["fr", "en", "de"].map((lng) => (
        <button
          key={lng}
          onClick={() => changeLanguage(lng)}
          className={`px-5 py-2 text-sm font-semibold rounded-full transition duration-300 border 
                     ${currentLanguage === lng 
                       ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                       : "bg-white text-gray-700 border-gray-300 hover:bg-gray-200"}
                     focus:outline-none focus:ring-2 focus:ring-blue-400`}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
}