import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import Car from "@/components/ui/car";

export function NotFound() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [homeLink, setHomeLink] = useState("/");

  // Extract language from URL path
  useEffect(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const possibleLang = pathSegments[0];

    // Check if the first path segment is a valid language code
    if (
      possibleLang === "fr" ||
      possibleLang === "en" ||
      possibleLang === "de"
    ) {
      console.log("Language detected from URL:", possibleLang);
      i18n.changeLanguage(possibleLang);
    }

    const newHomeLink = i18n.language === "en" ? "/" : `/${i18n.language}`;
    setCurrentLanguage(i18n.language);
    setHomeLink(newHomeLink);

    // Add language change listener
    const handleLanguageChanged = () => {
      const updatedHomeLink =
        i18n.language === "en" ? "/" : `/${i18n.language}`;
      console.log("Language changed to:", i18n.language);
      console.log("Updated home link:", updatedHomeLink);
      setCurrentLanguage(i18n.language);
      setHomeLink(updatedHomeLink);
    };

    i18n.on("languageChanged", handleLanguageChanged);

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [i18n, location]);

  return (
    <>
      <Helmet>
        <title>404 - {t("Page non trouvée")} - FreeAuto</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t("Page non trouvée")}
          </h2>

          <Car />

          <p className="mt-2 text-gray-600 mb-8">
            {t("Cette page n'existe pas ou a été déplacée.")}
          </p>
          <Button asChild className="mt-4">
            <Link to={homeLink}>{t("Retour à l'accueil")}</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
