import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Helmet } from "react-helmet-async";

export function NotFound() {
  const { t } = useTranslation();

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
          <p className="mt-2 text-gray-600 mb-8">
            {t("Cette page n'existe pas ou a été déplacée.")}
          </p>
          <Button asChild className="mt-4">
            <Link to="/">{t("Retour à l'accueil")}</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
