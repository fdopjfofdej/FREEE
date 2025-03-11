import { useEffect, useState } from 'react';
import { Car } from '@/types';
import { supabase } from '@/lib/supabase';
import { CarCard } from '@/components/car-card';
import { Helmet } from 'react-helmet-async';
import { Loader2, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { LanguageSelector } from '@/components/language-selector'
import { useTranslation } from 'react-i18next'
import { useRedirectToLanguagePath } from '@/lib/utils';

export function MyListings() {
  const { t } = useTranslation()
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMyCars();
  }, []);

  const fetchMyCars = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/';
        return;
      }

      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCars(data || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast({
        title: t("Erreur"),
        description: t("Une erreur est survenue lors du chargement de vos annonces"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCars(cars.filter(car => car.id !== id));
      toast({
        title: t("Annonce supprimée"),
        description: t("Votre annonce a été supprimée avec succès"),
      });
    } catch (error) {
      console.error('Error deleting car:', error);
      toast({
        title: t("Erreur"),
        description: t("Une erreur est survenue lors de la suppression"),
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t("Mes annonces")} - FreeAuto</title>
        <meta name="description" content={t("Gérez vos annonces automobiles sur FreeAuto. Modifiez, supprimez ou créez de nouvelles annonces.")} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to={useRedirectToLanguagePath("/")} className="flex items-center gap-2">
                <span className="text-2xl font-serif">FreeAuto</span>
              </Link>
              <div className='flex items-center gap-4'>
                <LanguageSelector />
                <Button asChild variant="ghost">
                  <Link to={useRedirectToLanguagePath("/")}>{t("Retour aux annonces")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">{t("Mes annonces")}</h1>
            <Button asChild>
              <Link to={useRedirectToLanguagePath("/create-ad")}>{t("Créer une annonce")}</Link>
            </Button>
          </div>

          {cars.length >  0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cars.map((car) => (
                <div key={car.id} className="group relative">
                  <CarCard car={car} />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="icon"
                      asChild
                      className="h-8 w-8 bg-white hover:bg-white/90"
                    >
                      <Link to={`/modifier-annonce/${car.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            {t("Supprimer l'annonce")}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("Annuler")}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(car.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletingId === car.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              t("Supprimer")
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <span className="text-4xl font-serif mb-4 opacity-50">FreeAuto</span>
              <h3 className="text-2xl font-semibold text-muted-foreground">
                {t("Aucune annonce")}
              </h3>
              <p className="text-muted-foreground mt-2 mb-6">
                {t("Vous n'avez pas encore publié d'annonces")}
              </p>
              <Button asChild>
                <Link to={useRedirectToLanguagePath("/create-ad")}>{t("Publier une annonce")}</Link>
              </Button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}