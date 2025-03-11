// filepath: c:\Users\ericw\Desktop\freeauto.ch\src\pages\home.tsx
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { CarCard } from "@/components/car-card";
import { Filters } from "@/components/filters";
import { AuthDialog } from "@/components/auth-dialog";
import { Car, CarFilter } from "@/types";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, LogOut, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LanguageSelector } from "@/components/language-selector";
import { useTranslation } from "react-i18next";
import { useRedirectToLanguagePath } from "@/lib/utils";

interface HomeProps {
  user: User | null;
}

export default function Home({ user }: HomeProps) {
  const { t } = useTranslation();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CarFilter>({});
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchCars();
    checkAdminStatus();
  }, [filters]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc("is_admin_secure");
      if (error) throw error;
      setIsAdmin(!!data);
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const fetchCars = async () => {
    try {
      let query = supabase
        .from("cars")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      // Apply text search if searchTerms is provided
      if (filters.searchTerms) {
        if (Array.isArray(filters.searchTerms)) {
          query = query.textSearch(
            "full_search",
            filters.searchTerms.join(" "),
            {
              type: "websearch",
              config: "french",
            }
          );
        } else {
          query = query.textSearch("full_search", filters.searchTerms, {
            type: "websearch",
            config: "french",
          });
        }
      }

      // Apply other filters
      if (filters.minPrice) query = query.gte("price", filters.minPrice);
      if (filters.maxPrice) query = query.lte("price", filters.maxPrice);
      if (filters.minYear) query = query.gte("year", filters.minYear);
      if (filters.maxMileage) query = query.lte("mileage", filters.maxMileage);
      if (filters.type_vehicule?.length)
        query = query.in("type_vehicule", filters.type_vehicule);
      if (filters.carburant?.length)
        query = query.in("carburant", filters.carburant);
      if (filters.transmission?.length)
        query = query.in("transmission", filters.transmission);
      if (filters.minPuissance)
        query = query.gte("puissance", filters.minPuissance);
      if (filters.maxPuissance)
        query = query.lte("puissance", filters.maxPuissance);
      if (filters.couleur?.length) query = query.in("couleur", filters.couleur);
      if (filters.premiere_main) query = query.eq("premiere_main", true);
      if (filters.expertisee) query = query.eq("expertisee", true);
      if (filters.is_professional) query = query.eq("is_professional", true);
      if (filters.city) query = query.eq("city", filters.city);

      const { data, error, count } = await query;

      if (error) throw error;

      setCars(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: t("Déconnexion réussie"),
        description: t("À bientôt sur FreeAuto !"),
      });

      navigate(useRedirectToLanguagePath("/"));
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: t("Erreur"),
        description: t("Une erreur est survenue lors de la déconnexion"),
        variant: "destructive",
      });
    }
  };

  // Generate meta description based on filters
  const generateMetaDescription = () => {
    const parts = [];

    if (filters.type_vehicule?.length) {
      parts.push(`${filters.type_vehicule.join(", ")}`);
    }

    if (filters.carburant?.length) {
      parts.push(`${filters.carburant.join(", ")}`);
    }

    if (filters.minPrice || filters.maxPrice) {
      const priceRange = [];
      if (filters.minPrice)
        priceRange.push(`${t("à partir de")} ${filters.minPrice} CHF`);
      if (filters.maxPrice)
        priceRange.push(`${t("jusqu'à")} ${filters.maxPrice} CHF`);
      parts.push(priceRange.join(" "));
    }

    if (filters.city) {
      parts.push(`${t("à")} ${filters.city}`);
    }

    if (parts.length > 0) {
      return `${t("Trouvez votre voiture idéale")} ${parts.join(", ")} ${t(
        "sur FreeAuto, le marché automobile suisse"
      )}.`;
    }

    return t(
      "Trouvez votre prochaine voiture sur FreeAuto, le marché automobile suisse. Annonces de particuliers et professionnels."
    );
  };

  return (
    <>
      <Helmet>
        <title>FreeAuto - {t("Le marché automobile suisse")}</title>
        <meta name="description" content={generateMetaDescription()} />
        <meta
          property="og:title"
          content={`FreeAuto - ${t("Le marché automobile suisse")}`}
        />
        <meta property="og:description" content={generateMetaDescription()} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:title"
          content={`FreeAuto - ${t("Le marché automobile suisse")}`}
        />
        <meta name="twitter:description" content={generateMetaDescription()} />
        <link rel="canonical" href={window.location.origin} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container px-4 mx-auto">
            <div className="h-16 flex items-center justify-between">
              <Link to={useRedirectToLanguagePath("/")} className="flex items-center gap-2">
                <h1 className="text-2xl font-serif">FreeAuto</h1>
              </Link>

              <div className="flex items-center gap-4">
                <LanguageSelector />
                {user ? (
                  <>
                    <Button asChild variant="ghost">
                      <Link to={useRedirectToLanguagePath("/mes-annonces")}>{t("Mes annonces")}</Link>
                    </Button>
                    {isAdmin && (
                      <Button asChild variant="ghost" className="gap-2">
                        <Link to={useRedirectToLanguagePath("/admin")}>
                          <Shield className="h-4 w-4" />
                          {t("Administration")}
                        </Link>
                      </Button>
                    )}
                    <Button asChild>
                      <Link to={useRedirectToLanguagePath("/creer-annonce")} className="gap-2">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {t("Créer une annonce")}
                        </span>
                        <span className="sm:hidden">{t("Créer")}</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogout}
                      title={t("Se déconnecter")}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <AuthDialog>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {t("Créer une annonce")}
                      </span>
                      <span className="sm:hidden">{t("Créer")}</span>
                    </Button>
                  </AuthDialog>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="sticky top-16 z-40 bg-white border-b shadow-sm">
          <div className="container px-4 mx-auto">
            <div className="h-16 flex justify-between items-center gap-4">
              <Filters onFilterChange={setFilters} />
              {!loading && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="font-normal">
                    {totalCount} {totalCount > 1 ? t("annonces") : t("annonce")}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 py-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : cars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="text-4xl font-serif mb-4 text-gray-300">
                FreeAuto
              </div>
              <h2 className="text-2xl font-semibold text-gray-600">
                {t("Aucune annonce")}
              </h2>
              <p className="text-gray-500 mt-2 mb-6">
                {t("Aucune annonce ne correspond à vos critères")}
              </p>
              {user ? (
                <Button asChild>
                  <Link to={useRedirectToLanguagePath("/creer-annonce")} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("Publier une annonce")}
                  </Link>
                </Button>
              ) : (
                <AuthDialog>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("Publier une annonce")}
                  </Button>
                </AuthDialog>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
